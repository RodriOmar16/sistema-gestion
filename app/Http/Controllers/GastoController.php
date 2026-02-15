<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\StoreGastoRequest;
use App\Http\Requests\UpdateGastoRequest;

use App\Models\Gasto;

class GastoController extends Controller
{
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('gastos/index',[
        'gastos' => []
      ]);
    }

    $query = Gasto::query()->with(['proveedor', 'formaPago']);
    if($request->filled('gasto_id')){
      $query->where('gasto_id', $request->gasto_id);
    }
    if($request->filled('caja_id')){
      $query->where('caja_id', $request->caja_id);
    }
    if($request->filled('proveedor_id')){
      $query->where('proveedor_id', $request->proveedor_id);
    }
    if($request->filled('forma_pago_id')){
      $query->where('forma_pago_id', $request->forma_pago_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha', '<=', $request->fecha_hasta);
    }
    if($request->filled('monto')){
      $query->where('monto', $request->monto);
    }

    $gastos = $query->latest()->get()->map(function ($g) { 
      return [
        'gasto_id'         => $g->gasto_id,
        'fecha'            => $g->fecha,
        'caja_id'          => $g->caja_id,
        'proveedor_id'     => $g->proveedor_id,
        'proveedor_nombre' => optional($g->proveedor)->nombre,
        'forma_pago_id'    => $g->forma_pago_id,
        'forma_pago_nombre'=> optional($g->formaPago)->nombre,
        'monto'            => $g->monto,
        'descripcion'      => $g->descripcion,
        'inhabilitado'     => $g->inhabilitado,
        'created_at'       => $g->created_at,
      ];
    });

    return inertia('gastos/index',[
      'gastos' => $gastos
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'fecha'            => 'required|date',
        'caja_id'          => 'integer',
        'proveedor_id'     => 'integer',
        'monto'            => 'required|numeric',
        'descripcion'      => 'string|max:255',
      ]);
      
      //creo el gasto
      $gasto = Gasto::create([
        'fecha'            => $validated['fecha'],
        'caja_id'          => $request->caja_id ?? null,
        'proveedor_id'     => $validated['proveedor_id'],
        'monto'            => $validated['monto'],
        'descripcion'      => $validated['descripcion'],
        'created_at'       => now(),
      ]);

      //éxito
      DB::commit();
      return inertia('gastos/index',[
        'resultado' => 1,
        'mensaje'   => 'El gasto se creó correctamente',
        'gasto_id'  => $gasto->gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('gastos/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function update(Request $request, Gasto $gasto)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'descripcion' => 'string|max:255',
      ]);
      
      //creo el gasto
      $gasto->update([
        'descripcion' => $validated['descripcion'],
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return inertia('gastos/index',[
        'resultado' => 1,
        'mensaje'   => 'El gasto se modificó correctamente',
        'gasto_id'  => $gasto->gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('gastos/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar el gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }
}
