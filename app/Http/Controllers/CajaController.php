<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Caja;
use App\Models\Venta;
use App\Models\VentaPago;
use App\Models\Turno;
use App\Models\FormaPago;
use App\Models\Gasto;

use App\Http\Requests\StoreCajaRequest;
use App\Http\Requests\UpdateCajaRequest;

class CajaController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    if (!$request->has('buscar')) {
      return inertia('cajas/index', ['cajas' => []]);
    }
    //dd($request->all());

    $query = Caja::query()->with(['turno']);

    if($request->filled('caja_id')){
      $query->where('caja_id', $request->caja_id);
    }
    if($request->filled('turno_id')){
      $query->where('turno_id', $request->turno_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha', '<=', $request->fecha_hasta);
    }

    $cajas = $query->latest()->get()->map(function ($c) { 
      return [
        'caja_id'          => $c->caja_id,
        'fecha'            => $c->fecha,
        'created_at'       => $c->created_at,
        'turno_id'         => $c->turno_id,
        'turno_nombre'     => optional($c->turno)->nombre,
        'total_sistema'    => $c->total_sistema,
        'total_user'       => $c->total_user,
        'diferencia'       => $c->diferencia,
        'inhabilitado'     => $c->inhabilitado,
        'monto_inicial'    => $c->monto_inicial,
        'descripcion'      => $c->descripcion,
        'efectivo'         => $c->efectivo,
        'debito'           => $c->debito,
        'transferencia'    => $c->transferencia,
        'user_grabacion'   => $c->user_grabacion
      ];
    });

    return inertia('cajas/index',[
      'cajas' => $cajas
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    return inertia('cajas/createView',[
      'mode' => 'create',
      'caja' => null
    ]);
  }

  public function openCaja(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo que no haya otra caja abierta
      $existe = Caja::where('abierta',1)->exists();
      if($existe){
        throw new \Exception("Ya existe una caja abierta. No es posible continuar!");
      }

      //controlo los datos
      $validated = $request->validate([
        'turno_id'      => 'integer',
        'fecha'         => 'date',  //debe venir en yyyy-mm-dd
        'monto_inicial' => 'numeric'
      ]);

      //obtengo el turno
      $turno = Turno::where('turno_id', $validated['turno_id'])->first();

      //obtengo las ventas del turno y fecha
      $ventas = Venta::whereDate('fecha_grabacion', $validated['fecha'])
                    ->where('anulada', 0)
                    ->whereRaw('HOUR(fecha_grabacion) >= ?',[$turno->apertura])
                    ->whereRaw('HOUR(fecha_grabacion) <= ?',[$turno->cierre])
                    ->get();

      //obtengo id de formas de pago
      /*$fp_efec_id     = FormaPago::where('nombre', 'Efectivo')->first()->forma_pago_id;
      $fp_debit_id    = FormaPago::where('nombre', 'Débito')->first()->forma_pago_id;
      $fp_transfer_id = FormaPago::where('nombre', 'Transferencia')->first()->forma_pago_id;*/
      $fp_efec   = FormaPago::where('nombre', 'Efectivo')->first();
      $fp_debit  = FormaPago::where('nombre', 'Débito')->first();
      $fp_transf = FormaPago::where('nombre', 'Transferencias')->first();

      if (!$fp_efec || !$fp_debit || !$fp_transf) {
          throw new \Exception("No se encontraron todas las formas de pago requeridas");
      }

      $fp_efec_id     = $fp_efec->forma_pago_id;
      $fp_debit_id    = $fp_debit->forma_pago_id;
      $fp_transfer_id = $fp_transf->forma_pago_id;

      //acumuladores
      $efectivo = $debito = $transferencia = 0;

      //obtengo la informacion de las ventas
      foreach($ventas as $v){
        $pagos = VentaPago::where('venta_id', $v->venta_id)->get();
        foreach($pagos as $p){
          switch($p->forma_pago_id){
            case $fp_efec_id:     $efectivo += $p->monto;      break;
            case $fp_debit_id:    $debito += $p->monto;        break;
            case $fp_transfer_id: $transferencia += $p->monto; break;
          }
        }
      }
      
      //creo la caja
      $caja = Caja::create([
        'turno_id'           => $validated['turno_id'],
        'fecha'              => $validated['fecha'],
        'monto_inicial'      => $validated['monto_inicial'],
        'descripcion'        => '',
        'user_grabacion'     => auth()->user()->email ?? 'sistema',//cómo dejo grabado el user actual, su email???
        'diferencia'         => 0,
        'inhabilitado'       => 0,
        //calculadas
        'efectivo'           => $efectivo,
        'debito'             => $debito,
        'transferencia'      => $transferencia,
        'total_sistema'      => ($efectivo + $debito + $transferencia) + $validated['monto_inicial'],
        //por calcular
        'efectivo_user'      => 0,
        'debito_user'        => 0,
        'transferencia_user' => 0,
        'total_user'         => 0,
        'abierta'            => 1,
      ]);

      // - egresos
      $gastoHoy = Gasto::where('caja_id',-1)->get();
      $gastoEfect = $gastoDebito = $gastoTransfer = 0; 

      foreach($gastoHoy as $g){        
        switch($g->forma_pago_id){
          case $fp_efec_id :    $gastoEfect += $g->monto;    break;
          case $fp_debit_id:    $gastoDebito += $g->monto;   break;
          case $fp_transfer_id: $gastoTransfer += $g->monto; break;
        }
        //actualizo este gasto para asignarle la caja a la cual pertenecerá ahora
        $g->update(['caja_id' => $caja->caja_id]);
      }
      $gastosTotales = $gastoEfect + $gastoDebito + $gastoTransfer;
      $caja->update(['total_sistema' => $caja->total_sistema - $gastosTotales]);
      
      //commit
      DB::commit();

      //retorno sin recargar
      return Inertia::render('cajas/createView', [
        'resultado' => 1,
        'mensaje'   => 'Caja iniciada correctamente.',
        'caja_id'   => $caja->caja_id,
        'caja'      => $caja,
        'mode'      => 'edit',
        'ingresos'  => [
          ['concepto' => 'Efectivo'     , 'valor' => $caja->efectivo ],
          ['concepto' => 'Débito'       , 'valor' => $caja->debito ],
          ['concepto' => 'Transferencia', 'valor' => $caja->transferencia ],
        ],
        'egresos'   => [
          ['concepto' => 'Efectivo'     , 'valor' => $gastoEfect] ,
          ['concepto' => 'Débito'       , 'valor' => $gastoDebito] ,
          ['concepto' => 'Transferencia', 'valor' => $gastoTransfer] ,
        ],
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return Inertia::render('cajas/createView', [
        'resultado' => 0, 
        'mensaje'   => 'Error al abrir caja: '.$e->getMessage(), 
        'timestamp' => now()->timestamp, 
      ], 500);
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
      //
  }

  /**
   * Display the specified resource.
   */
  public function show(Caja $caja)
  {
    $caja->load([
      'turno' => function ($q) { $q->select('turno_id', 'nombre'); }
    ]);

    $fp_efec   = FormaPago::where('nombre', 'Efectivo')->first();
    $fp_debit  = FormaPago::where('nombre', 'Débito')->first();
    $fp_transf = FormaPago::where('nombre', 'Transferencias')->first();

    if (!$fp_efec || !$fp_debit || !$fp_transf) {
        throw new \Exception("No se encontraron todas las formas de pago requeridas");
    }

    $fp_efec_id     = $fp_efec->forma_pago_id;
    $fp_debit_id    = $fp_debit->forma_pago_id;
    $fp_transfer_id = $fp_transf->forma_pago_id;

    // - egresos
    $gastos = Gasto::where('caja_id',$caja->caja_id)->get();
    $gastoEfect = $gastoDebito = $gastoTransfer = 0; 

    foreach($gastos as $g){        
      switch($g->forma_pago_id){
        case $fp_efec_id :    $gastoEfect += $g->monto;    break;
        case $fp_debit_id:    $gastoDebito += $g->monto;   break;
        case $fp_transfer_id: $gastoTransfer += $g->monto; break;
      }
    }
    return inertia('cajas/createView',[
      'mode' => 'edit',
      'caja' => [
        'caja_id'           => $caja->caja_id,
        'turno_id'          => $caja->turno->turno_id,
        'turno_nombre'      => $caja->turno->nombre,
        'fecha'             => $caja->fecha/*->format('Y-m-d')*/,
        'monto_inicial'     => $caja->monto_inicial,
        'descripcion'       => $caja->descripcion,
        'efectivo'          => $caja->efectivo,
        'efectivo_user'     => $caja->efectivo_user,
        'debito'            => $caja->debito,
        'debito_user'       => $caja->debito_user,
        'transferencia'     => $caja->transferencia,
        'transferencia_user'=> $caja->transferencia_user,
        'total_user'        => $caja->total_user,
        'total_sistema'     => $caja->total_sistema,
        'diferencia'        => $caja->diferencia,
        'abierta'           => $caja->abierta,
        'inhabilitado'      => $caja->inhabilitado,
        'created_at'        => $caja->created_at,
      ],
      'ingresos'  => [
        ['concepto' => 'Efectivo'     , 'valor' => (float)$caja->efectivo ],
        ['concepto' => 'Débito'       , 'valor' => (float)$caja->debito ],
        ['concepto' => 'Transferencia', 'valor' => (float)$caja->transferencia ],
      ],
      'egresos'   => [
        ['concepto' => 'Efectivo'     , 'valor' => $gastoEfect] ,
        ['concepto' => 'Débito'       , 'valor' => $gastoDebito] ,
        ['concepto' => 'Transferencia', 'valor' => $gastoTransfer] ,
      ],
    ]);
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(Caja $caja)
  {
      //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Caja $caja)
  {
    DB::beginTransaction();
    try {
        $caja->update([
            'abierta'            => 0,
            'diferencia'         => $request->diferencia,
            'efectivo_user'      => $request->efectivo_user,
            'debito_user'        => $request->debito_user,
            'transferencia_user' => $request->transferencia_user,
            'total_user'         => $request->total_user,
            'descripcion'        => $request->descripcion ?? '',
        ]);

        DB::commit();
        return inertia('cajas/createView', [
            'mode'      => 'edit',
            'resultado' => 1,
            'mensaje'   => 'Caja cerrada correctamente',
            'caja_id'   => $caja->caja_id, // ojo, antes tenías $caja_id sin definir
            'timestamp' => now()->timestamp,
        ]);
    } catch (\Throwable $e) {
      DB::rollback();
        return inertia('cajas/createView', [
            'mode'      => 'edit',
            'resultado' => 0,
            'mensaje'   => 'Error al cerrar la caja: ' . $e->getMessage(),
        ]);
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Request $request, Caja $caja)
  {
    DB::beginTransaction();
     try {
        $caja->update(['inhabilitado' => 1]);

        // obtengo todos los gastos que estaban relacionados a la caja y los libero
        $gastos = Gasto::where('caja_id', $caja->caja_id)->get();
        foreach($gastos as $g){
          $g->update(['caja_id' => null]);
        }
        DB::commit();
        return inertia('cajas/createView', [
            'mode'      => 'edit',
            'resultado' => 1,
            'mensaje'   => 'Caja inhabilitada correctamente',
            'caja_id'   => $caja->caja_id, // ojo, antes tenías $caja_id sin definir
            'timestamp' => now()->timestamp,
        ]);
    } catch (\Throwable $e) {
      DB::rollback();
        return inertia('cajas/createView', [
            'mode'      => 'edit',
            'resultado' => 0,
            'mensaje'   => 'Error al bloquear la caja: ' . $e->getMessage(),
        ]);
    }
  }
}
