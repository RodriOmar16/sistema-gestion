<?php

namespace App\Http\Controllers;

use App\Models\CategoriaGasto;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoriaGastoController extends Controller
{
  public function habilitados(Request $request)
  {
    try {
      $buscar = $request->get('buscar', '');

      $categorias = CategoriaGasto::query()
        ->where('inhabilitado',0)
        ->when($buscar, fn($q) => $q->where('nombre', 'LIKE', "%{$buscar}%"))
        ->select('categoria_gasto_id as id', 'nombre')
        ->paginate(20);

      return response()->json([
          'elementos' => $categorias
      ]);
    } catch (\Throwable $e) {
      //Log::error('Error en buscar productos: ' . $e->getMessage());
      return response()->json(['error' => $e->getMessage()], 500);
    }
  }

  public function index()
  {
    $query = CategoriaGasto::query();
    $categorias = $query->get()->map(function($c){
      return [
        'categoria_gasto_id' => $c->categoria_gasto_id,
        'nombre'             => $c->nombre,
        'inhabilitado'       => $c->inhabilitado,
        'load'               => 0,
        'editar'             => 0
      ];
    });

    return response()->json([
      'categorias' => $categorias
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      $validated = $request->validate([
        'nombre' => 'required|string|max:255',
      ]);
      
      $nombre = strtolower(trim($validated['nombre']));
      $existe = CategoriaGasto::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])->exists();
      if($existe){
        DB::rollBack();
        return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ya existe una categoria con ese nombre.',
        'timestamp' => now()->timestamp
      ]);
      }

      //creo el gasto
      $categoria = CategoriaGasto::create([
        'nombre'       => $validated['nombre'],
        'inhabilitado' => 0,
        'created_at'   => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'          => 1,
        'mensaje'            => 'El gasto se creó correctamente',
        'categoria_gasto_id' => $categoria->categoria_gasto_id,
        'timestamp'          => now()->timestamp
      ]);

    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function update(Request $request, CategoriaGasto $categoria)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'  => 'required|string|max:255',
      ]);
      
      //modifico el gasto
      $categoria->update([
        'nombre'     => $request['nombre'],
        'updated_at' => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'La categoría de gastos se modificó correctamente',
        'categoria_gasto_id'  => $categoria->categoria_gasto_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar la categoria de gasto: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function toggleEstado(Request $request, CategoriaGasto $categoria){
    DB::beginTransaction();
    try {      
      //modifico el gasto
      $categoria->update([
        'inhabilitado' => !$categoria->inhabilitado,
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'           => 1,
        'mensaje'             => 'Se modificó el estado correctamente',
        'categoria_gasto_id'  => $categoria->categoria_gasto_id,
        'timestamp'           => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar estado de la categoria: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }
}
