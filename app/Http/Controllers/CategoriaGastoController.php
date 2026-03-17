<?php

namespace App\Http\Controllers;

use App\Models\CategoriaGasto;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoriaGastoController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    $query = CategoriaGasto::query();
    $categorias = $query->get();

    return response()->json([
      'categorias' => $categorias
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
   * Store a newly created resource in storage.
   */
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

  /**
   * Display the specified resource.
   */
  public function show(CategoriaGasto $categoriaGasto)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(CategoriaGasto $categoriaGasto)
  {
      //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, CategoriaGasto $categoriaGasto)
  {
      //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(CategoriaGasto $categoriaGasto)
  {
      //
  }
}
