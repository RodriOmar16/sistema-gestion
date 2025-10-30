<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Proveedor;
use App\Http\Requests\StoreProveedorRequest;
use App\Http\Requests\UpdateProveedorRequest;

class ProveedorController extends Controller
{
  public function proveedoresHabilitados(){
    $proveedores = Proveedor::where('inhabilitado', false)->get()->map(function($prov){
      return [
        'id'     => $prov->proveedor_id,
        'nombre' => $prov->nombre
      ];
    });
    return response()->json($proveedores);
  }
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('proveedores/index',[
        'proveedores' => []
      ]);
    }

    $query = Proveedor::query();
    if($request->filled('proveedor_id')){
      $query->where('proveedor_id', $request->proveedor_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre', 'like','%'.$request->nombre.'%');
    }
    if($request->filled('descripcion')){
      $query->where('descripcion', 'like','%'.$request->descripcion.'%');
    }
    if($request->filled('razon_social')){
      $query->where('razon_social', 'like','%'.$request->razon_social.'%');
    }
    if($request->filled('cuit')){
      $query->where('cuit', $request->cuit);
    }
    if($request->filled('nro_telefono')){
      $query->where('nro_telefono', 'like','%'.$request->nro_telefono.'%');
    }
    if($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    if(!$request->filled('proveedor_id') && !$request->filled('nombre') && !$request->filled('descripcion') &&
        !$request->filled('razon_social') && !$request->filled('cuit') && !$request->filled('nro_telefono') &&
        !$request->filled('inhabilitado')){
      $query = Proveedor::query();
    }

    $proveedores = $query->latest()->get();
    return inertia('proveedores/index',[
      'proveedores' => $proveedores
    ]);
  }

  /**
   * Store a newly created resource in storage.
  */
  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'descripcion'  => 'required|string|max:255',
        'razon_social' => 'required|string|max:255',
        'cuit'         => 'integer',
        'nro_telefono' => 'string|max:255',
        'inhabilitado' => 'boolean',
      ]);
      //controlo que no se repita
      $nombre      = strtolower(trim($validated['nombre']));
      $razonSocial = strtolower(trim($validated['razon_social']));
      $cuit        = strtolower(trim($validated['cuit']));
      $existe = Proveedor::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                ->whereRaw('LOWER(TRIM(razon_social)) = ?', [$razonSocial])
                ->whereRaw('cuit = ?', [str_replace('-', '', $cuit)])
                ->exists();
      if($existe){
        return inertia('proveedores/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un proveedor con los mismos datos.'
        ]);
      }
      //creo el proveedor
      $proveedor = Proveedor::create([
        'nombre'       => $validated['nombre'],
        'descripcion'  => $validated['descripcion'],
        'razon_social' => $validated['razon_social'],
        'cuit'         => $validated['cuit'],
        'nro_telefono' => $validated['nro_telefono'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
      ]);
      //exito
      DB::commit();
      return inertia('proveedores/index',[
        'resultado'    => 1,
        'mensaje'      => 'El proveedor fue creado correctamente.',
        'proveedor_id' => $proveedor->proveedor_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('proveedores/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al crear el proveedor: '.$e->getMessage()
      ]);
    }
  }
  
  /**
   * Update the specified resource in storage.
  */
  public function update(Request $request, Proveedor $proveedor)
  {
    DB::beginTransaction();
    try {
      //valido
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'descripcion'  => 'required|string|max:255',
        'razon_social' => 'required|string|max:255',
        'cuit'         => 'integer',
        'nro_telefono' => 'string|max:255',
        'inhabilitado' => 'boolean',
      ]);
      //controlo que no se repita
      $nombre      = strtolower(trim($validated['nombre']));
      $razonSocial = strtolower(trim($validated['razon_social']));
      $cuit        = strtolower(trim($validated['cuit']));
      $existe = Proveedor::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                ->whereRaw('LOWER(TRIM(razon_social)) = ?', [$razonSocial])
                ->whereRaw('cuit = ?', [str_replace('-', '', $cuit)])
                ->where('proveedor_id','!=',$proveedor->proveedor_id)
                ->exists();
      if($existe){
        return inertia('proveedores/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un proveedor con los mismos datos.'
        ]);
      }
      //actualizo el proveedor
      $proveedor->update([
        'nombre'       => $validated['nombre'],
        'descripcion'  => $validated['descripcion'],
        'razon_social' => $validated['razon_social'],
        'cuit'         => $validated['cuit'],
        'nro_telefono' => $validated['nro_telefono'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
      ]);
      //exito
      DB::commit();
      return inertia('proveedores/index',[
        'resultado'    => 1,
        'mensaje'      => 'El proveedor fue modificado correctamente.',
        'proveedor_id' => $proveedor->proveedor_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('proveedores/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al editar el proveedor: '.$e->getMessage()
      ]);
    }
  }

  public function toggleEstado(Proveedor $proveedor){
    $proveedor->update(['inhabilitado' => !$proveedor->inhabilitado]);
    return inertia('proveedores/index',[
      'resultado'    => 1,
      'mensaje'      => 'Estado actualizado correctamente',
      'proveedor_id' => $proveedor->proveedor_id
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
      //
  }
  
  /**
   * Display the specified resource.
   */
  public function show(Proveedor $proveedor)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(Proveedor $proveedor)
  {
      //
  }


  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Proveedor $proveedor)
  {
      //
  }
}
