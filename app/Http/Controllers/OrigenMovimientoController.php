<?php

namespace App\Http\Controllers;

use App\Models\OrigenMovimiento;
use App\Http\Requests\StoreOrigenMovimientoRequest;
use App\Http\Requests\UpdateOrigenMovimientoRequest;

class OrigenMovimientoController extends Controller
{
  public function origenesHabilitados(){
     $array = OrigenMovimiento::where('inhabilitado',false)->get()->map(function($o){
      return [
        'id' => $o->origen_id,
        'nombre' => $o->nombre
      ];
    });
    return response()->json($array);
  }
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
      //
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
      //
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(StoreOrigenMovimientoRequest $request)
  {
      //
  }

  /**
   * Display the specified resource.
   */
  public function show(OrigenMovimiento $origenMovimiento)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(OrigenMovimiento $origenMovimiento)
  {
      //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(UpdateOrigenMovimientoRequest $request, OrigenMovimiento $origenMovimiento)
  {
      //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(OrigenMovimiento $origenMovimiento)
  {
      //
  }
}
