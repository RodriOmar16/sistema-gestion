<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Caja;

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
        'turno_nombre'     => optional($g->turno)->nombre,
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
      //
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
  public function update(UpdateCajaRequest $request, Caja $caja)
  {
      //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Caja $caja)
  {
      //
  }
}
