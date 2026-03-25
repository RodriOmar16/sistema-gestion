<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Permiso;
use App\Models\RolPermiso;
use App\Models\UserPermiso;

class PermisoController extends Controller
{
  public function rolesYusers($permiso_id){
    $permiso = Permiso::with(['roles', 'usuarios'])->findOrFail($permiso_id);
    $roles = $permiso->roles
      ->where('inhabilitado', false)
      ->map(function($r){
      return [
        'id'     => $r->rol_id,
        'nombre' => $r->nombre
      ];
    });
    $users = $permiso->usuarios
      ->where('inhabilitado', false)
      ->map(function($u){
      return [
        'id'     => $u->id,
        'nombre' => $u->email
      ];
    });
    return response()->json([
      'roles_asignados' => $roles->values()->all(),
      'usuarios_asignados' => $users->values()->all(),
    ]);
  }

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
      //dd($request->all());
      $validated = $request->validate([
        'clave'       => 'required|string|max:255|unique:permisos,clave',
        'descripcion' => 'string|max:255',
        'roles'       => 'array',
        'users'       => 'array',
      ]);
      
      //creo el permiso
      $permiso = Permiso::create([
        'clave'       => $validated['clave'],
        'descripcion' => $validated['descripcion'],
        'inhabilitado'=> 0,
        'created_at'  => now(),
      ]);

      $permiso_id = $permiso->permiso_id;

      // Extraer IDs de users y roles
      $userIds = collect($request->input('users'))->pluck('id')->unique()->toArray();
      $roleIds = collect($request->input('roles'))->pluck('id')->unique()->toArray();

      foreach($roleIds as $r){
        RolPermiso::firstOrCreate([
          'permiso_id' => $permiso_id, 
          'rol_id'     => $r, 
        ]);
      }
      foreach($userIds as $u){
        UserPermiso::firstOrCreate([
          'permiso_id' => $permiso_id, 
          'user_id'    => $u
        ]);
      }

      //éxito
      DB::commit();
      return response()->json([
        'resultado'  => 1,
        'mensaje'    => 'El permiso se creó correctamente',
        'permiso_id' => $permiso_id,
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
        'descripcion' => 'string|max:255',
        'roles'       => 'array',
        'users'       => 'array',
      ]);
      
      //los controles de unicidad se hacen en el $validated

      //creo el permiso
      $permiso->update([
        'clave'       => $validated['clave'],
        'descripcion' => $validated['descripcion'],
        'updated_at'  => now(),
      ]);

      //procedo a actualizar los datos de tablas intermedias
      $rolIds  = collect($request->roles)->pluck('id')->unique()->toArray();
      $userIds = collect($request->users)->pluck('id')->unique()->toArray();
      $permiso->roles()->sync($rolIds);
      $permiso->usuarios()->sync($userIds);

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
        'inhabilitado' => !$permiso->inhabilitado,
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
