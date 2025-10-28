<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
      if(!$request->has('buscar')){
        return inertia('categorias/index',[
          'categorias' => []
        ]);
      }

      $query = Categoria::query();

      if($request->filled('categoria_id')){
        $query->where('categoria_id', $request->categoria_id);
      }
      if($request->filled('nombre')){
        $query->where('nombre','like','%'.$request->nombre.'%');
      }
      if($request->filled('inhabilitada')){
        $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN);
        $query->where('inhabilitada', $estado);
      }

      if(!$request->filled('categoria_id') && !$request->filled('nombre') && 
         !$request->filled('inhabilitada')){
        $query = Categoria::query();
      }

      $categorias = $query->latest()->get();

      return inertia('categorias/index',[
        'categorias' => $categorias,
        'resultado' => session('resultado'),
				'mensaje' => session('mensaje'),
				'error' => session('error'),
      ]);

      //return Categoria::where('inhabilitada', false)->get();
    }

    public function store(Request $request)
    {
      DB::beginTransaction();
      try {
        $validated = $request->validate([
          'nombre' => 'required|string|max:255',
          'inhabilitada' => 'boolean'
        ]);

        $nombre = strtolower(trim($validated['nombre']));
        $existe = Categoria::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                             ->exists();
        if($existe){
          return inertia('categorias/index',[
            'resultado' => 0,
            'mensaje'   => 'Ya existe una categoría con el mismo nombre.'
          ]);
        }

        $categoria = Categoria::create([
          'nombre' => $validated['nombre'],
          'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
        ]);

        DB::commit();
        return inertia('categorias/index',[
          'resultado'    => 1,
          'mensaje'      => 'Categoría creada correctamente',
          'categoria_id' => $categoria->categoria_id
        ]);

      } catch (\Throwable $e) {
        DB::rollback();
        return inertia('categorias/index',[
          'resultado' => 0, 
          'mensaje' => 'Ocurrió un error al crear la categoria: '.$e->getMessage(),
        ]);
      }
      /*$validated = $request->validate(['nombre' => 'required|string|max:255']);
      return Categoria::create($validated);*/
    }

    public function update(Request $request, Categoria $categoria)
    {
      DB::beginTransaction();
      try {
        //valido los datos
        $validated = $request->validate([
          'nombre' => 'required|string|max:255',
          'inhabilitada' => 'boolean'
        ]);
        //controlo los repetidos
        $nombre = strtolower(trim($validated['nombre']));
        $existe = Categoria::whereRam('LOWER(TRIM(nombre)) = ?', [$nombre])
                             ->where('categoria_id','!=',$request->categoria_id)
                             ->exists();
        if($existe){
          return inertia('categorias/index',[
            'resultado' => 0,
            'mensaje'   => 'Ya existe una categoría con el mismo nombre.'
          ]);
        }
        //actualizo
        $categoria->update([
          'nombre' => $validated['nombre'],
          'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
        ]);
        //commit
        DB::commit();
        return inertia('categorias/index',[
          'resultado'    => 1, 
          'mensaje'      => 'Categoría actualizada exitosamente',
          'categoria_id' => $categoria->categoria_id
        ]);
        
      } catch (\Throwable $e) {
        return inertia('categorias/index',[
          'resultado' => 0, 
          'mensaje' => 'Ocurrió un error al actualizar: '.$e->getMessage(),
        ]);
      }
      /*$validated = $request->validate(['nombre' => 'required|string|max:255']);
      $categoria->update($validated);
      return $categoria;*/
    }

    public function toggleEstado(Categoria $categoria){
      $categoria->update(['inhabilitada' => !$categoria->inhabilitada]);
      return inertia('categorias/index',[
        'resultado' => 1,
        'mensaje'   => 'Estado cambiado exitosamente.',
        'categoria_id' => $categoria->categoria_id
      ]);
    }

    public function destroy(Categoria $categoria)
    {

    }
}
