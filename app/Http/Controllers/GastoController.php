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
    
    $query = Gasto::query()->with(['proveedor', 'formaPago', 'categoria']);

    if ($request->filled('gasto_id')) {
      $query->where('gasto_id', $request->gasto_id);
    }
    if ($request->filled('caja_id')) {
      switch ((int)$request->caja_id){
        case -1:
          $query->whereNull('caja_id');
          break;
        case 0:
          $query->where('caja_id', 0);
          break;
          default: $query->where('caja_id', $request->caja_id);
      }
    }

    if ($request->filled('proveedor_id')) {
      $query->where('proveedor_id', $request->proveedor_id);
    }
    if ($request->filled('categoria_gasto_id')) {
      $query->where('categoria_gasto_id', $request->categoria_gasto_id);
    }
    if ($request->filled('forma_pago_id')) {
      $query->where('forma_pago_id', $request->forma_pago_id);
    }
    if ($request->filled('monto') && $request->monto != "0") {
      $query->where('monto', $request->monto);
    }

    if ($request->filled('fecha_desde')) {
      $query->where('fecha', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha', '<=', $request->fecha_hasta);
    }

    $gastos = $query->latest()->get()->map(function ($g) {
      return [
        'gasto_id'               => $g->gasto_id,
        'fecha'                  => $g->fecha,
        'caja_id'                => $g->caja_id,
        'proveedor_id'           => $g->proveedor_id,
        'proveedor_nombre'       => optional($g->proveedor)->nombre,
        'categoria_gasto_id'     => $g->categoria_gasto_id,
        'categoria_gasto_nombre' => optional($g->categoria)->nombre??'',
        'forma_pago_id'          => $g->forma_pago_id,
        'forma_pago_nombre'      => optional($g->formaPago)->nombre,
        'monto'                  => $g->monto,
        'descripcion'            => $g->descripcion,
        'inhabilitado'           => $g->inhabilitado,
        'created_at'             => $g->created_at,
      ];
    });

    return inertia('gastos/index', [
      'gastos' => $gastos,
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      if($request->caja_id === '' || $request->caja_id === -1){
        $request->caja_id = null;
      }

      $validated = $request->validate([
        'fecha'              => 'required|date',
        'caja_id'            => 'nullable|integer',
        'proveedor_id'       => 'required|integer',
        'categoria_gasto_id' => 'required|integer',
        'forma_pago_id'      => 'required|integer',
        'monto'              => 'required|numeric',
        'descripcion'        => 'string|max:255',
      ]);
      
      //creo el gasto
      $gasto = Gasto::create([
        'fecha'              => $validated['fecha'],
        'caja_id'            => $request->caja_id ?? null,
        'proveedor_id'       => $validated['proveedor_id'],
        'categoria_gasto_id' => $validated['categoria_gasto_id'],
        'forma_pago_id'      => $validated['forma_pago_id'],
        'monto'              => $validated['monto'],
        'descripcion'        => $validated['descripcion'],
        'created_at'         => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'El gasto se creó correctamente',
        'gasto_id'  => $gasto->gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
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
        'fecha'       => 'required|date',
        'monto'       => 'required|numeric',
        'descripcion' => 'string|max:255',
      ]);
      
      //modifico el gasto
      $gasto->update([
        'descripcion' => $validated['descripcion'],
        'fecha'       => $validated['fecha'],
        'monto'       => $validated['monto'],
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'El gasto se modificó correctamente',
        'gasto_id'  => $gasto->gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar el gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function toggleEstado(Request $request, Gasto $gasto){
    DB::beginTransaction();
    try {      
      //modifico el gasto
      $gasto->update([
        'inhabilitado' => 1,
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'Se borró el gasto correctamente',
        'gasto_id'  => $gasto->gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar estado del gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function getDatosGatos(Request $request){
    $tipo = $request->input('tipo');
    $anio = $request->input('anio');
    $mes  = $request->input('mes');
    $dia  = $request->input('dia');

    $arr = [];
    $totalFinal    = 0;
    $cantidadFinal = 0;

    // base query con join a categorias
    $query = DB::table('gastos as g')
        ->join('categorias_gastos as c', 'g.categoria_gasto_id', '=', 'c.categoria_gasto_id')
        ->selectRaw('c.nombre as categoria, COUNT(*) as cantidad, SUM(g.monto) as total')
        ->where('g.inhabilitado', 0);

    // filtros según tipo
    if ($tipo == 1) {
        $query->whereDate('g.fecha', $dia);
    }
    if ($tipo == 2) {
        $query->whereYear('g.fecha', $anio)
              ->whereMonth('g.fecha', $mes);
    }
    if ($tipo == 3) {
        $query->whereYear('g.fecha', $anio);
    }

    $gastos = $query
        ->groupBy('c.nombre')
        ->orderByDesc('total') // ranking por monto gastado
        ->get();

    foreach ($gastos as $g) {
        $arr[] = [
            'name'     => $g->categoria,
            'cantidad' => $g->cantidad,
            'total'    => $g->total,
        ];
        $totalFinal += $g->total;
        $cantidadFinal += $g->cantidad;
    }

    $obj = [
        'arr'            => $arr,
        'total_final'    => $totalFinal,
        'cantidad_final' => $cantidadFinal,
    ];
    return response()->json($obj);
  }
}
