<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Venta;
use App\Models\DetVenta;
use App\Models\VentaAnulada;
use App\Models\Cliente;
use App\Models\MovimientoStock;
use App\Models\Stock;
use App\Models\VentaPago;

class VentaController extends Controller
{
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('ventas/index',['ventas' => []]);
    }

    $query = Venta::query();

    if($request->filled('venta_id')){
      $query->where('venta_id', $request->venta_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha_grabacion', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha_grabacion', '<=', $request->fecha_hasta);
    }
    if($request->filled('cliente_id')){
      $query->where('cliente_id', $request->cliente_id);
    }
    if($request->filled('fecha_anulacion')){
      $query->where('fecha_anulacion', $request->fecha_anulacion);
    }
    if($request->has('anulada')){
      $estado = filter_var($request->anulada, FILTER_VALIDATE_BOOLEAN);
      $query->where('anulada', $estado);
    }

    $ventas = $query->with(['cliente'])->latest()->get()->map(function($v){
      return [
        'venta_id' => $v->venta_id,
        'fecha_grabacion' => $v->fecha_grabacion,
        'cliente_id'      => $v->cliente_id,
        'cliente_nombre'  => optional($v->cliente)->nombre,
        'fecha_anulacion' => $v->fecha_anulacion ?? '',
        'anulada'         => $v->anulada,
        'total'           => $v->total,
      ];
    });

    return inertia('ventas/index',[
      'ventas' => $ventas
    ]);
  }

  public function create(){
    return inertia('ventas/createView',[
      'mode' => 'create',
      'venta' => null
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        //datos de la venta
        'fecha_grabacion' => 'required|date',
        'venta_cliente_id'=> 'nullable|integer',
        'total'           => 'required|numeric',
        'anulada'         => 'boolean',
        //datos del cliente
        'cliente_id'       => 'nullable|integer',
        'dni'              => 'required|string',
        'nombre'           => 'required|string|max:255',
        'domicilio'        => 'string|max:255',
        'email'            => 'required|email',
        'fecha_nacimiento' => 'required|date',
        //array
        'detalles'    => 'required|array|min:1',
        'detalles.*.id'       => 'required|integer',
        'detalles.*.precio'   => 'required|numeric',
        'detalles.*.cantidad' => 'required|integer|min:1',
        'formasPagos.*.id'    => 'required|integer',
        'formasPagos.*.fecha' => 'required|date',
        'formasPagos.*.monto' => 'required|numeric|min:1',
        'formasPagos' => 'required|array|min:1',
      ]);

      //controlo si existe o no el cliente, si no lo registro
      $dni = strtolower(trim($validated['dni']));
      $fecha_nacimiento = $validated['fecha_nacimiento'];
      $cliente = Cliente::whereRaw('LOWER(TRIM(dni)) = ?', [$dni])
                  ->where('fecha_nacimiento', $fecha_nacimiento)
                  ->first();
      if(!$cliente){
        $cliente = Cliente::create([
          'nombre'           => $validated['nombre'],
          'fecha_nacimiento' => $validated['fecha_nacimiento'],
          'domicilio'        => $validated['domicilio'],
          'email'            => $validated['email'],
          'dni'              => $validated['dni'],
          'inhabilitado'     => 0,
        ]);
      }
      $cliente_id = $cliente->cliente_id;

      //creo la venta
      $venta = Venta::create([
        'fecha_grabacion' => now(),
        'cliente_id'      => $cliente_id,
        'total'           => $validated['total'],
        'anulada'         => $validated['anulada'] ? 1 : 0,
      ]);

      //registrar detalles, el movimiento de stock para cada detalle, update en el stock también
      $detalles = $validated['detalles'];
      foreach($detalles as $det){
        //controlo el stock
        $stock = Stock::where('producto_id', $det['id'])->first();
        if (!$stock || $stock->cantidad < $det['cantidad']) {
          DB::rollback();
          return inertia('ventas/createView', [
            'resultado' => 0,
            'mensaje'   => 'Stock insuficiente para el producto ID: '.$det['id'],
            'mode'      => 'create'
          ]);
        }
        //actualizo el stock
        $stock->update(['cantidad' => $stock->cantidad - $det['cantidad']]);
        
        //creo el detalle
        $producto = Producto::where('producto_id', $det['id'])->first();
        if(!$producto){
          DB::rollback();
          return inertia('ventas/createView', [
            'resultado' => 0,
            'mensaje'   => 'No se pudo encontrar información del producto a ventas: '.$det['id'],
            'mode'      => 'create'
          ]);
        }
        DetVenta::create([
          'venta_id'        => $venta->venta_id,
          'producto_id'     => $det['id'],
          'precio_unitario' => $producto->precio,
          'cantidad'        => $det['cantidad'],
          'descuento'       => 0,
          'subtotal'        => ($det['cantidad'] * $det['precio']) - 0, 
        ]);

        //registro el movimiento de stock
        MovimientoStock::create([
          'producto_id' => $det['id'],
          'proveedor_id' => null,
          'tipo_id'      => 2, //egreso
          'origen_id'    => 1, //venta
          'fecha'        => now(),
          'cantidad'     => $det['cantidad']
        ]);
      }

      //registrar los métodos de pago
      $formasPagos = $validated['formasPagos'];
      foreach ($formasPagos as $fp) {
        VentaPago::create([
          'venta_id'      => $venta->venta_id,
          'forma_pago_id' => $fp['id'],
          'fecha_pago'    => now() /*$fp['fecha']*/,
          'monto'         => $fp['monto']
        ]);
      }

      //exito
      DB::commit();
      return inertia('ventas/createView',[
        'resultado' => 1,
        'mensaje'   => 'Venta grabado correctamente',
        'venta_id'  => $venta->venta_id
      ]);

    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('ventas/createView',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al grabar la venta: '.$e->getMessage(),
        'mode'      => 'create'
      ]);
    }
  }

  public function update(Request $request, Venta $venta)
  {
    /*$validated = $request->validate([
      'cliente_id' => 'required|exists:clientes,cliente_id',
      'fecha_grabacion' => 'required|date',
      'total' => 'required|numeric|min:0',
    ]);

    $venta->update($validated);
    return $venta;*/
  }

  public function view(Venta $venta){
    //obtengo los detalles
    $detalles = DetVenta::query()
        ->with('producto')
        ->where('venta_id', $venta->venta_id)
        ->get()
        ->map(function($dv){
          return [
            'id'       => $dv->producto_id,
            'nombre'   => optional($dv->producto)->nombre,
            'precio'   => $dv->precio_unitario,
            'cantidad' => $dv->cantidad
          ];
        });

    //obtengo los datos del cliente
    $cliente = Cliente::find($venta->cliente_id);

    //obtengo las formas de pago de la venta
    $formasPagos = VentaPago::query()
    ->with('formaPago')
    ->where('venta_id', $venta->venta_id)
    ->get()
    ->map(function($fp){
      return [
        'id'     => $fp->forma_pago_id,
        'nombre' => optional($fp->formaPago)->nombre,
        'monto'  => $fp->monto,
        'fecha'  => $fp->fecha
      ];
    });
    //preparo ventas sobre todo por las fechas que recibe el front
    $ventaAux = [
      'venta_id'        => $venta->venta_id,
      'fecha_grabacion' => $venta->fecha_grabacion->format('Y-m-d'),
      'fecha_anulacion' => $venta->fecha_anulacion?->format('Y-m-d'),
      'cliente_id'      => $venta->cliente_id,
      'total'           => $venta->total,
      'anulada'         => $venta->anulada,
    ];

    //devuelvo
    return inertia('ventas/createView',[
      'mode' => 'view',
      'venta' => $ventaAux,
      'detalles' => $detalles, 
      'cliente'  => $cliente, 
      'formasPago' => $formasPagos
    ]);
  }

  public function destroy(Venta $venta, Request $request)
  {
    DB::beginTransaction();
    try {
      // Marcar la venta como anulada
      $venta->update([
        'anulada'         => true,
        'fecha_anulacion' => now()
      ]);

      // Registrar motivo de anulación
      VentaAnulada::create([
        'venta_id'        => $venta->venta_id,
        'fecha_anulacion' => now(),
        'motivo'          => $request->motivo
      ]);

      // Revertir el stock de cada producto vendido
      $detalles = DetVenta::where('venta_id', $venta->venta_id)->get();
      foreach ($detalles as $det) {
        $stock = Stock::where('producto_id', $det->producto_id)->first();
        if ($stock) {
          $stock->update([
            'cantidad' => $stock->cantidad + $det->cantidad
          ]);
        }

        // Registrar movimiento de stock por anulación
        MovimientoStock::create([
          'producto_id'  => $det->producto_id,
          'proveedor_id' => null,
          'tipo_id'      => 4, // anulación
          'origen_id'    => 4, // origen: anulación
          'fecha'        => now(),
          'cantidad'     => $det->cantidad
        ]);
      }

      DB::commit();
      return inertia('ventas/createView', [
        'resultado' => 1,
        'mensaje'   => 'La venta se anuló correctamente y el stock fue revertido.'
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('ventas/createView', [
        'resultado' => 0,
        'mensaje'   => 'Error al anular la venta: '.$e->getMessage()
      ]);
    }
  }

}
