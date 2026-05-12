<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Carousel;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class CarouselController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    /*if(!$request->has('buscar')){
      return inertia('banners/index',[
          'banners' => [],
      ]);
    }*/

    $query = Carousel::query();

    if($request->filled('id')){
        $query->where('id', $request->id);
    }
    if($request->filled('url')){
      $query->where('url','like','%'.$request->url.'%');
    }
    if ($request->filled('title')) {
      $query->where('title', 'like', '%' . $request->title . '%');
    }
    if ($request->filled('description')) {
      $query->where('description', 'like', '%' . $request->description . '%');
    }
    if ($request->filled('priority')) {
      $query->where('priority', $request->priority);
    }
    if ($request->has('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }else{
      $query->where('inhabilitado', 0);
    }

    //$banners = $query->latest()->get();

    //Paginación
    $perPage = min($request->get('per_page',10),200);
    $banners = $query->latest()->paginate($perPage);

    return inertia('banners/index',[
      'banners' => $banners
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
          'url'          => 'required|string|max:255',
          'title'        => 'required|string|max:255',
          'description'  => 'nullable|string',
          'priority'     => 'required|integer',
          'inhabilitado' => 'boolean'
      ]);

      //controlo que no esté repetido
      $url    = strtolower(trim($validated['url']));
      $title  = strtolower(trim($validated['title']));
      $orden  = $validated['priority'];
      $existe = Carousel::query()
                ->where('inhabilitado', 0)
                ->where(function($q) use ($url, $title, $orden) {
                  $q->whereRaw('LOWER(TRIM(url)) = ?', [$url])
                    ->orWhereRaw('LOWER(TRIM(title)) = ?', [$title])
                    ->orWhere('priority', $orden);
                })
                ->exists();

      if($existe){
        DB::rollBack();
        return inertia('banners/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un banner con esos datos',
          'timestamp' => now()->timestamp,
        ]);
      }
      //creo el banner
      $carousel = Carousel::create([
        'url'          => $url,
        'title'        => $title,
        'description'  => $validated['description'],
        'priority'     => $orden,
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
      ]);

      //commit
      DB::commit();
      return inertia('banners/index',[
        'resultado' => 1,
        'mensaje'   => 'El banner fue creado correctamente',
        'id'        => $carousel->id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return inertia('banners/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un proble al crear el banner: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function update(Request $request, Carousel $carousel)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'url'          => 'required|string|max:255',
        'title'        => 'required|string|max:255',
        'description'  => 'nullable|string',
        'priority'     => 'required|integer',
        'inhabilitado' => 'boolean'
      ]);

      //controlo que no esté repetido
      $url    = strtolower(trim($validated['url']));
      $title  = strtolower(trim($validated['title']));
      $orden  = $validated['priority'];
      $existe = Carousel::query()
                  ->where('inhabilitado', 0)
                  ->where('id', '!=', $carousel->id)
                  ->where(function($q) use ($url, $title, $orden) {
                      $q->whereRaw('LOWER(TRIM(url)) = ?', [$url])
                        ->orWhereRaw('LOWER(TRIM(title)) = ?', [$title])
                        ->orWhere('priority', $orden);
                  })
                  ->exists();

      if($existe){
        DB::rollBack();
        return inertia('banners/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un banner con esos datos',
          'timestamp' => now()->timestamp,
        ]);
      }
      //creo el banner
      $carousel->update($validated);

      //commit
      DB::commit();
      return inertia('banners/index',[
        'resultado' => 1,
        'mensaje'   => 'El banner fue modificado correctamente',
        'id'        => $carousel->id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return inertia('banners/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al actualizar el banner: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function toggleEstado(Carousel $carousel)
  {
    DB::beginTransaction();
    try {
      $nuevoEstado = !$carousel->inhabilitado;

      if ($nuevoEstado === false) {
        // si lo vas a habilitar, controlar duplicados
        $url    = strtolower(trim($carousel->url));
        $title  = strtolower(trim($carousel->title));
        $orden  = $carousel->priority;
        $existe = Carousel::query()
                    ->where('inhabilitado', 0)
                    ->where('id', '!=', $carousel->id)
                    ->where(function($q) use ($url, $title, $orden) {
                        $q->whereRaw('LOWER(TRIM(url)) = ?', [$url])
                          ->orWhereRaw('LOWER(TRIM(title)) = ?', [$title])
                          ->orWhere('priority', $orden);
                    })
                    ->exists();

        if ($existe) {
          $carousel->update([
            'url'          => $carousel->url.' - copia',
            'title'        => $carousel->title.' - copia',
            'inhabilitado' => $nuevoEstado,
            'updated_at'   => now(),
          ]);
        } else {
          $carousel->update([
            'inhabilitado' => $nuevoEstado,
            'updated_at'   => now(),
          ]);
        }
      } else {
        // si lo vas a deshabilitar, no hace falta controlar duplicados
        $carousel->update([
          'inhabilitado' => $nuevoEstado,
          'updated_at'   => now(),
        ]);
      }
      //éxito
      DB::commit();
      return inertia('banners/index',[
        'resultado' => 1,
        'mensaje'   => 'Se modificó el estado correctamente',
        'id'        => $carousel->id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return inertia('banners/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar estado del banner: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }
}
