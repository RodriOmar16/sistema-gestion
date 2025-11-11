<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Stock;
use App\Models\MovimientoStock;
use App\Models\TipoMovimiento;
use App\Models\OrigenMovimiento;

use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;

class StockController extends Controller
{
  public function stockDisponible() {
    $stock = Stock::query()
      ->where('cantidad', '>', 0)
      ->whereHas('producto', function ($q) {
        $q->where('inhabilitado', false);
      })
      ->with('producto')
      ->get()
      ->map(function ($s) {
        return [
          'id'     => $s->producto_id,
          'nombre'=> optional($s->producto)->nombre,
          'precio'=> optional($s->producto)->precio,
        ];
      });

    return response()->json($stock);
  }

  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('stock/index',[
        'stock' => []
      ]);
    }

    $query = Stock::query();
    if($request->filled('stock_id')){
      $query->where('stock_id', $request->stock_id);
    }
    if($request->filled('producto_id')){
      $query->where('producto_id', $request->producto_id);
    }
    if($request->filled('cantidad')){
      $query->where('cantidad', $request->cantidad);
    }
    //solo productos habilitados
    $query->whereHas('producto', function ($q) {
      $q->where('inhabilitado', false);
    });

    $stock = $query->with('producto')->latest()->get()->map(function($s){
      return [
        'stock_id'        => $s->stock_id,
        'producto_id'     => $s->producto_id,
        'producto_nombre' => optional($s->producto)->nombre,
        'cantidad'        => $s->cantidad,
      ];
    }
    );

    return inertia('stock/index',[
      'stock' => $stock,
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido el request (el array de productos no puede venir vacio)
      $validated = $request->validate([
        'productos' => 'required|array|min:1'
      ]);
      //controlo que cada producto del array tenga cantidad mayor a cero
      $productos = $request->productos;
      if (collect($productos)->contains(fn($p) => $p['cantidad'] <= 0)) {
        return inertia('stock/index', [
          'resultado' => 0,
          'mensaje'   => 'Todas las cantidades deben ser mayores a 0.'
        ]);
      }

      //variables de movimiento
      $tipo   = TipoMovimiento::where('nombre','=','Ingreso')->first();
      $origen = OrigenMovimiento::where('nombre','=','Stock')->first();
      $tipoUp   = TipoMovimiento::where('nombre','=','Modificacion')->first();
      $origenUp = OrigenMovimiento::where('nombre','=','Actualizacion')->first();

      //recorro todos los productos que vinieron
      foreach($productos as $elem){
        $registro = Stock::where('producto_id', $elem['producto_id'])->first();
        if(!$registro){
          //si no existe en la tabla creo o inserto
          $nuevo = Stock::create([
            'producto_id' => $elem['producto_id'],
            'cantidad'    => $elem['cantidad']
          ]);
          MovimientoStock::create([
            'producto_id' => $elem['producto_id'],
            'tipo_id'     => $tipo->tipo_id,
            'origen_id'   => $origen->origen_id,
            'fecha'       => now()->toDateString(),
            'cantidad'    => $elem['cantidad']
          ]);
        }else{
          //si ya existe, entonces acumulo a la cantidad que diga (desde ventas esa cantidad disminuirá y todo se registra en Mov. Stock)
          $registro->update([
            'cantidad' => $registro->cantidad + $elem['cantidad']
          ]);
          MovimientoStock::create([
            'producto_id' => $elem['producto_id'],
            'tipo_id'     => $tipoUp->tipo_id,
            'origen_id'   => $origenUp->origen_id,
            'fecha'       => now()->toDateString(),
            'cantidad'    => $elem['cantidad']
          ]);
        }
      }
      //commit
      DB::commit();
      return inertia('stock/index',[
        'resultado' => 1,
        'mensaje'   => 'El stock se generó correctamente',
        'nuevo'     => 1
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('stock/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar registrar el stock: '.$e->getMessage()
      ]);
    }
  }

  public function update(Request $request, Stock $stock)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'cantidad'    => 'required|integer|min:1',
        'producto_id' => 'required|integer',
      ]);

      $stock->update([
        'cantidad' => $request->cantidad
      ]);

      //insertar en mov stock este cambio
      $tipoUp   = TipoMovimiento::where('nombre','=','Modificacion')->first();
      $origenUp = OrigenMovimiento::where('nombre','=','Actualizacion')->first();
      MovimientoStock::create([
        'producto_id' => $request->producto_id,
        'tipo_id'     => $tipoUp->tipo_id,
        'origen_id'   => $origenUp->origen_id,
        'fecha'       => now()->toDateString(),
        'cantidad'    => $request->cantidad
      ]);

      DB::commit();
      return inertia('stock/index',[
        'resultado' => 1,
        'mensaje'   => 'El stock fue modificado satisfactoriamente',
        'stock_id'  => $stock->stock_id,
        'nuevo'     => false,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('stock/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al intentar actualizar el stock: '.$e->getMessage(),
      ]);
    }
  }

    public function show(Stock $stock)
    {
      //
    }

    public function edit(Stock $stock)
    {
      //
    }

    public function create()
    {
      //
    }

    public function destroy(Stock $stock)
    {
        //
    }
}
