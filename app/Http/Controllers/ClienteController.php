<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Cliente;

class ClienteController extends Controller
{
  public function clientesHabilitados(){
    $clientes = Cliente::where('inhabilitado', false)->get()->map(function($c){
      return [
        'id'     => $c->cliente_id,
        'nombre' => $c->nombre
      ];
    });
    return response()->json($clientes);
  }

  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('clientes/index',[
        'clientes' => []
      ]);
    }

    $query = Cliente::query();
    if($request->filled('cliente_id')){
      $query->where('cliente_id', $request->cliente_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre', 'like', '%'.$request->nombre.'%');
    }
    if($request->filled('fecha_nacimiento')){
      $query->where('fecha_nacimiento', $request->fecha_nacimiento);
    }
    if($request->filled('domicilio')){
      $query->where('domicilio', 'like', '%'.$request->domicilio.'%');
    }
    if($request->filled('email')){
      $query->where('email', 'like', '%'.$request->email.'%');
    }
    if($request->filled('dni')){
      $query->where('dni', 'like', '%'.$request->dni.'%');
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    $clientes = $query->latest()->get();
    return inertia('clientes/index',[
      'clientes' => $clientes
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'           => 'required|string|max:255',
        'fecha_nacimiento' => 'required|date',
        'domicilio'        => 'required|string',
        'email'            => 'required|email|unique:clientes,email',
        'dni'              => 'required|string|max:8',
        'inhabilitado'     => 'boolean'
      ]);
      //verifico que no se duplique
      $dni              = strtolower(trim($validated['dni']));
      $fecha_nacimiento = $validated['fecha_nacimiento'];
      $existe = Cliente::whereRaw('LOWER(TRIM(dni)) = ?',[$dni])
                       ->where('fecha_nacimiento',$fecha_nacimiento)
                       ->exists();
      if($existe){
        return inertia('clientes/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un cliente con esos datos.'
        ]);
      }
      //creo el usuario en la base
      $cliente = Cliente::create([
        'nombre'           => $validated['nombre'],
        'fecha_nacimiento' => $validated['fecha_nacimiento'],
        'domicilio'        => $validated['domicilio'],
        'email'            => $validated['email'],
        'dni'              => $validated['dni'],
        'inhabilitado'     => $validated['inhabilitado'] ? 1 : 0,
      ]);
      //exito
      DB::commit();
      return inertia('clientes/index',[
        'resultado'  => 1,
        'mensaje'    => 'Cliente creado correctamente',
        'cliente_id' => $cliente->cliente_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('clientes/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al crear el cliente: '.$e->getMessage()
      ]);
    }
  }

  public function update(Request $request, Cliente $cliente)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'           => 'required|string|max:255',
        'fecha_nacimiento' => 'required|date',
        'domicilio'        => 'required|string',
        'email'            => 'required|email',
        'dni'              => 'required|string',
        'inhabilitado'     => 'boolean'
      ]);
      //controlo que no se repita
      $dni              = strtolower(trim($validated['dni']));
      $fecha_nacimiento = $validated['fecha_nacimiento'];
      $existe = Cliente::whereRaw('LOWER(TRIM(dni)) = ?',[$dni])
                       ->where('fecha_nacimiento',$fecha_nacimiento)
                       ->where('cliente_id','!=',$cliente->cliente_id)
                       ->exists();
      if($existe){
        return inertia('clientes/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un cliente con esos datos.'
        ]);
      }
      //actualizo
      $cliente->update([
        ...$validated,
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
      ]);
      //exito
      DB::commit();
      return inertia('clientes/index',[
        'resultado'  => 1,
        'mensaje'    => 'Se actualizó correctamente los datos del cliente',
        'cliente_id' => $cliente->cliente_id,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('clientes/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar el cliente: '.$e->getMessage()
      ]);
    }
  }

  public function destroy(Cliente $cliente)
  {
    $cliente->update(['inhabilitado' => !$cliente->inhabilitado]);
    return inertia('clientes/index',[
      'resultado' => 1,
      'mensaje'   => 'El estado se actualizó correctamente'
    ]);
  }
}
