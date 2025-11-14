<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Http\Requests\StoreTurnoRequest;
use App\Http\Requests\UpdateTurnoRequest;

use App\Models\Turno;

class TurnoController extends Controller
{
  public function turnosHabilitados(){
    $turnos = Turno::where('inhabilitado',false)->get()->map(function($t){
      return [
        'id' => $t->turno_id,
        'nombre' => $t->nombre,
      ];
    });
    return response()->json($turnos);
  }
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('turnos/index',[
        'turnos' => [],
      ]);
    }

    $query = Turno::query();
    if($request->filled('turno_id')){
      $query->where('turno_id', $request->turno_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre','like', '%'.$request->nombre.'%');
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    $turnos = $query->latest()->get();
    return inertia('turnos/index',[
      'turnos' => $turnos,
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'        => 'required|string|max:255',
        'apertura'      => 'required|date_format:H:i:s',
        'cierre'        => 'required|date_format:H:i:s',
        'inhabilitado'  => 'boolean'
      ]);
      if (strtotime($validated['apertura']) >= strtotime($validated['cierre'])) {
        DB::rollback();
        return inertia('turnos/index', [
          'resultado' => 0,
          'mensaje'   => 'La hora de apertura debe ser anterior a la hora de cierre.',
          'timestamp' => now()->timestamp,
        ]);
      }

      //verifico que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = Turno::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])->exists();
      if($existe){
        DB::rollback();
        return inertia('turnos/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un turno registrado con ese nombre.',
          'timestamp' => now()->timestamp,
        ]);
      }

      //creo el turno
      $turno = Turno::create([
        'nombre'       => $validated['nombre'],
        'apertura'     => $validated['apertura'],
        'cierre'       => $validated['cierre'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
        'created_at'   => now(),
      ]);
      //commit
      DB::commit();
      return inertia('turnos/index',[
        'resultado' => 1,
        'mensaje'   => 'Turno creado correctamente',
        'turno_id'  => $turno->turno_id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('turnos/index',[
        'resultado' => 0,
        'mensaje'   => "Ocurrió un error al crear el turno: ".$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function update(Request $request, Turno $turno)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'        => 'required|string|max:255',
        'apertura'      => 'required|date_format:H:i:s',
        'cierre'        => 'required|date_format:H:i:s',
        'inhabilitado'  => 'boolean'
      ]);
      if (strtotime($validated['apertura']) >= strtotime($validated['cierre'])) {
        DB::rollback();
        return inertia('turnos/index', [
          'resultado' => 0,
          'mensaje'   => 'La hora de apertura debe ser anterior a la hora de cierre.',
          'timestamp' => now()->timestamp,
        ]);
      }
      //verifico que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = Turno::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                ->where('turno_id','!=',$turno->turno_id)
                ->exists();
      if($existe){
        DB::rollback();
        return inertia('turnos/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un turno registrado con ese nombre.',
          'timestamp' => now()->timestamp,
        ]);
      }
      //creo el turno
      $turno->update([
        'nombre'       => $validated['nombre'],
        'apertura'     => $validated['apertura'],
        'cierre'       => $validated['cierre'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
        'updated_at'   => now(),
      ]);
      //commit
      DB::commit();
      return inertia('turnos/index',[
        'resultado' => 1,
        'mensaje'   => 'Turno modificado correctamente',
        'turno_id'  => $turno->turno_id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('turnos/index',[
        'resultado' => 0,
        'mensaje'   => "Ocurrió un error al modificar el turno: ".$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function toggleEstado(Request $request, Turno $turno)
  {
    $turno->update(['inhabilitado' => !$turno->inhabilitado]);
    return inertia('turnos/index',[
      'resultado' => 1,
      'mensaje'   => 'Estado modificado existosamente',
      'turno_id'  => $turno->turno_id,
      'timestamp' => now()->timestamp,
    ]);
  }
}
