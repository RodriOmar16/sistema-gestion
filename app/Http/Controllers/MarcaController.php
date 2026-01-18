<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Marca;

class MarcaController extends Controller
{
	public function marcasHabilitadas(){
    $marcas = Marca::where('inhabilitada',false)->get()->map(function($m){
      return [
        'id' => $m->marca_id,
        'nombre' => $m->nombre,
      ];
    });
    return response()->json($marcas);
  }

	public function index(Request $request){
		if(!$request->has('buscar')){
			return inertia('marcas/index',[
				'marcas' => [],
			]);
		}

		$query = Marca::query();
    if($request->filled('marca_id')){
      $query->where('marca_id', $request->marca_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre','like', '%'.$request->nombre.'%');
    }
    if ($request->filled('inhabilitada')) {
      $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitada', $estado);
    }

    $marcas = $query->latest()->get();
    return inertia('marcas/index',[
      'marcas' => $marcas,
    ]);
	}

	public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'        => 'required|string|max:255',
        'inhabilitada'  => 'boolean'
      ]);

      //verifico que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = Marca::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])->exists();
      if($existe){
        DB::rollback();
        return inertia('marcas/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe una marca registrada con ese nombre.',
          'timestamp' => now()->timestamp,
        ]);
      }

      //creo el turno
      $marca = Marca::create([
        'nombre'       => $validated['nombre'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
        'created_at'   => now(),
      ]);

      //commit
      DB::commit();
      return inertia('marcas/index',[
        'resultado' => 1,
        'mensaje'   => 'Marca creada correctamente',
        'marca_id'  => $marca->marca_id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('marcas/index',[
        'resultado' => 0,
        'mensaje'   => "Ocurrió un error al crear la marca: ".$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

	public function update(Request $request, Marca $marca)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'        => 'required|string|max:255',
        'inhabilitada'  => 'boolean'
      ]);
     
      //verifico que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = Marca::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                ->where('marca_id','!=',$marca->marca_id)
                ->exists();
      if($existe){
        DB::rollback();
        return inertia('marcas/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe una marca registrada con ese nombre.',
          'timestamp' => now()->timestamp,
        ]);
      }

      // modifico la marca
      $marca->update([
        'nombre'       => $validated['nombre'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
        'updated_at'   => now(),
      ]);

      //commit
      DB::commit();
      return inertia('marcas/index',[
        'resultado' => 1,
        'mensaje'   => 'Marca modificado correctamente',
        'marca_id'  => $marca->marca_id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('marcas/index',[
        'resultado' => 0,
        'mensaje'   => "Ocurrió un error al modificar la marca: ".$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function toggleEstado(Request $request, Marca $marca)
  {
    $marca->update(['inhabilitada' => !$marca->inhabilitada]);
    return inertia('marcas/index',[
      'resultado' => 1,
      'mensaje'   => 'Estado modificado existosamente',
      'marca_id'  => $marca->marca_id,
      'timestamp' => now()->timestamp,
    ]);
  }
}
