<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use App\Mail\UsuarioCreadoMail;
use App\Models\User;
use App\Models\UsuarioRol;

class UserController extends Controller
{
  public function rolesUser($user_id){
    $user = User::with(['roles'])->findOrFail($user_id);
    $roles = $user->roles
      ->where('inhabilitado', false)
      ->map(function($rol){
      return [
        'id'     => $rol->rol_id,
        'nombre' => $rol->nombre
      ];
    });
    return response()->json([
      'roles_asignados' => $roles,
    ]);
  }
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    //al abrir el formulario
    if(!$request->has('buscar')){
      return inertia('users/index',[
        'users' => []
      ]);
    }
    //si hay filtros
    $query = User::query();
    if($request->filled('id')){
      $query->where('id', $request->id);
    }
    if($request->filled('name')){
      $query->where('name', 'like','%'.$request->name.'%');
    }
    if($request->filled('email')){
      $query->where('email', 'like','%'.$request->email.'%');
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }
    //si no hay ningùn filtro, que traiga todos
    if(!$request->filled('id') && !$request->filled('name') && 
       !$request->filled('email') && !$request->filled('inhabilitado')){
      $query = User::query();
    }

    $users = $query->latest()->get();
    return inertia('users/index',[
      'users' => $users
    ]);
  }

  /**
   * Show the form for creating a new resource.
   */
  public function create()
  {
    
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //validacion de los datos
      $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'inhabilitado' => 'boolean',
        'roles' => 'required|array|min:1'
      ]);
      $user = User::create([
        'name'         => $validated['name'],
        'email'        => $validated['email'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
        'password'     => Hash::make('123' . $request->name)
      ]);

      $id = $user->id;
      $rolesIds = collect($request->input('roles'))->pluck('id')->unique()->toArray();

      foreach($rolesIds as $rol_id){
        UsuarioRol::firstOrCreate([
          'user_id' => $id,
          'rol_id'  => $rol_id
        ]);
      }
      //envio mail
      Mail::to($user->email)->send(new UsuarioCreadoMail(
        $user->name,
        $user->email,
        '123' . $user->name
      ));

      DB::commit();
      return inertia('users/index',[
        'resultado' => 1,
        'mensaje'   => 'Usuario creado exitosamente',
        'user_id'   => $id
      ]);

      //envio de mail al email recibido para avisar que se creo el user

    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('users/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error: '.e->getMessage()
      ]);
    }
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, User $user)
  {
    //inicio la transaccion con posibles commit o rollback
    DB::beginTransaction();
    try {
      //valido que no haya repetidos
      $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'inhabilitado' => 'boolean',
        'roles' => 'required|array|min:1'
      ]);

      $nombreUser = strtolower(trim($validated['name']));
      $existe = User::whereRaw('LOWER(TRIM(name)) = ?',[$nombreUser])
                  ->where('id', '!=', $user->id)
                  ->exists();
      if($existe){
        return inertia('users/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un usuario con ese nombre.',
        ]);
      }
      //actualizo los valores del rol
      $user->update([
        'name'         => $validated['name'],
        'email'        => $validated['email'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0
      ]);
      //procedo a actualizar los datos de tablas intermedias
      $rolIds = collect($request->roles)->pluck('id')->unique()->toArray();
      $user->roles()->sync($rolIds);

      //exito
      DB::commit();
      return inertia('users/index',[
        'resultado' => 1,
        'mensaje'   => 'El usuario fue editado existosamente ',
        'id'        => $user->id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('users/index',[
        'resultado' => 0,
        'mensaje'   => 'Error inerperado: '.e->getMessage()
      ]);
    }
  }

  public function toggleEstado(User $user){
    $user->update([
      'inhabilitado' => !$user->inhabilitado,
    ]);
    return inertia('users/index',[
        'id' => $user->id,
        'resultado'  => 1,
        'mensaje'		 => 'Estado actualizado correctamente.'
      ]);
  }

  /**
   * Display the specified resource.
   */
  public function show(string $id)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(string $id)
  {
    //
  }
  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    //
  }
}
