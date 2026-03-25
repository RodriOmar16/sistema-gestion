<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Permiso;

class PermisoController extends Controller
{
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('permisos/index',[
        'permisos' => []
      ]);
    }
    
    $query = Permiso::query();

    if ($request->filled('permiso_id')) {
      $query->where('permiso_id', $request->permiso_id);
    }
    if ($request->filled('clave')) {
      $query->where('clave', $request->clave);
    }
    if ($request->filled('descripcion')) {
      $query->where('descripcion', $request->descripcion);
    }
    if($request->has('inhabilitado')){
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    $permisos = $query->latest()->get()->map(function ($p) {
      return [
        'permiso_id'   => $p->permiso_id,
        'clave'        => $p->clave,
        'descripcion'  => $p->descripcion,
        'inhabilitado' => $p->inhabilitado,
        'created_at'   => $p->created_at,
      ];
    });

    return inertia('permisos/index', [
      'permisos' => $permisos,
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      $validated = $request->validate([
        'clave'       => 'required|string|max:255|unique:permisos,clave',
        'descripcion' => 'string|max:255',
      ]);
      
      //creo el permiso
      $permiso = Permiso::create([
        'clave'       => $validated['clave'],
        'descripcion' => $validated['descripcion'],
        'inhabilitado'=> 0,
        'created_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'  => 1,
        'mensaje'    => 'El permiso se creó correctamente',
        'permiso_id' => $permiso->permiso_id,
        'timestamp'  => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el permiso: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }      
  }

  public function update(Request $request, Permiso $permiso)
  {
    DB::beginTransaction();
    try {
      $validated = $request->validate([
        'clave'       => 'required|string|max:255|unique:permisos,clave,' . $permiso->permiso_id . ',permiso_id',
        'descripcion'  => 'string|max:255',
      ]);
      
      //creo el permiso
      $permiso->update([
        'clave'       => $validated['clave'],
        'descripcion' => $validated['descripcion'],
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'  => 1,
        'mensaje'    => 'El permiso se modificó correctamente',
        'permiso_id' => $permiso->permiso_id,
        'timestamp'  => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar cambiar el permiso: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }      
  }

  public function destroy(Permiso $permiso)
  {
    DB::beginTransaction();
    try {      
      //modifico el permiso
      $permiso->update([
        'inhabilitado' => 1,
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'   => 1,
        'mensaje'     => 'Se cambio el estado correctamente',
        'permiso_id'  => $permiso->permiso_id,
        'timestamp'   => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar estado del permiso: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }
}
