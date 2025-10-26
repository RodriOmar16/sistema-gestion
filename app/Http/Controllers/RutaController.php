<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Ruta;

class RutaController extends Controller
{
  public function rutasHabilitadas(){
    $rutas = Ruta::where('inhabilitada', false)->get()->map(function($ruta){
      return [
        'id'     => $ruta->ruta_id,
        'nombre' => $ruta->url
      ];
    });
    return response()->json($rutas);
  }

  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('rutas/index',[
        'rutas'   => [],
        'filters' => []
      ]);
    }
    $query = Ruta::query();

    if($request->filled('ruta_id')){
      $query->where('ruta_id',$request->ruta_id);
    }
    if($request->filled('url')){
      $query->where('url','like', '%'.$request->url.'%');
    }
    if ($request->filled('inhabilitada')) {
      $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitada', $estado);
    }

    //si no se agregaron filtros, trae todos
    if(!$request->filled('ruta_id') && !$request->filled('url') && !$request->filled('inhabilitada')){
      $query = Ruta::query();
    }

    $rutas = $query->latest()->get();

    return inertia('rutas/index', [
      'rutas'   => $rutas,
      'filters' => $request->only(['ruta_id', 'url', 'inhabilitada']),
      'resultado' => session('resultado'),
      'mensaje' => session('mensaje'),
      'error' => session('error'),
    ]);
  }


  public function store(Request $request)
    {
      DB::beginTransaction();
			try {
				// operaciones
				$validated = $request->validate([
          'url' => 'required|string|max:255|unique:rutas,url',
          'inhabilitada' => 'nullable|boolean',
        ]);


				$url = strtolower(trim($validated['url']));

				// Buscar ruta con esa url
				$rutaConUrl = Ruta::whereRaw('LOWER(TRIM(url)) = ?', [$url])->get();

				if ($rutaConUrl->count()) {
          // Si solo coincide el nombre → error simple
          return inertia('rutas/index', [
            'resultado' => 0,
            'mensaje' => 'Ya existe una ruta con esa url',
          ]);
				}

				$ruta = Ruta::create($validated);

				DB::commit();
				return inertia('rutas/index', [
					'resultado'  => 1,
					'mensaje' 	 => 'Ruta creada correctamente',
					'ruta_id' => $ruta->ruta_id
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('rutas/index', [
					'resultado' => 0,
					'mensaje' => 'Error inesperado: ' . $e->getMessage(),
				]);
			}
    }

    public function update(Request $request, Ruta $ruta)
    {
      DB::beginTransaction();
			try {
				// operaciones
				$validated = $request->validate([
          'url' => 'required|string|max:255|unique:rutas,url,' . $ruta->ruta_id . ',ruta_id',
          'inhabilitada' => 'nullable|boolean',
				]);

				$url = strtolower(trim($validated['url']));

				// Buscar rutas con misma url
				$existeDuplicado = Ruta::whereRaw('LOWER(TRIM(url)) = ?', [$url])
          ->where('ruta_id', '!=', $ruta->ruta_id)
          ->exists();
				if ($existeDuplicado) {
          return inertia('rutas/index', [
            'resultado' => 0,
            'mensaje'   => 'Ya existe otra ruta con esa url.',
          ]);
        }

				$ruta->update($validated);

				DB::commit();
				return inertia('rutas/index',[
					'ruta_id' => $ruta->ruta_id,
					'resultado'  => 1,
					'mensaje'		 => 'Ruta actualizada correctamente'
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('rutas/index', [
					'resultado' => 0,
					'mensaje' 	=> 'Error inesperado: ' . $e->getMessage(),
				]);
			}
      //---
      /*$validated = $request->validate([
        'url' => 'required|string|max:255|unique:rutas,url,' . $ruta->ruta_id . ',ruta_id',
      ]);

      $ruta->update($validated);
      return $ruta;*/
    }

    public function toggleEstado(Ruta $ruta)
		{
			$ruta->update([
				'inhabilitada' => !$ruta->inhabilitada,
			]);
			return inertia('rutas/index',[
					'ruta_id' => $ruta->ruta_id,
					'resultado'  => 1,
					'mensaje'		 => 'Estado actualizado correctamente.'
				]);
		}

    public function destroy(Ruta $ruta)
    {
        
    }
}
