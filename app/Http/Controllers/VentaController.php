<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Venta;
use App\Models\VentaAnulada;

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
    //cargar el encabezado
    //si el cliente no existe crearlo
    //cargar los detalles de la venta
    //registrar el movimiento de stock para cada detalle, update en el stock también
    //registrar los métodos de pago


    /*$validated = $request->validate([
      'cliente_id' => 'required|exists:clientes,cliente_id',
      'fecha_grabacion' => 'required|date',
      'total' => 'required|numeric|min:0',
    ]);

    return Venta::create($validated);*/
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

  public function view(){
    
  }

  public function destroy(Venta $venta, Request $request)
  {
    $venta->update(['anulada' => true, 'fecha_anulacion' => now()]);
    $anulada = VentaAnulada::create([
      'venta_id'        => $venta->venta_id,
      'fecha_anulacion' => now(),
      'motivo'          => $request->motivo
    ]);

    return inertia('ventas/createView',[
      'resultado' => 1,
      'mensaje'   => 'La venta se anuló correctamente.'
    ]);
  }
}
