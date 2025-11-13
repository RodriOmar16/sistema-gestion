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
    if(!$request->has('buscar')){
      return inertia('banners/index',[
          'banners' => [],
      ]);
    }

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
    if ($request->filled('inhabilitado')) {
        $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
        $query->where('inhabilitado', $estado);
    }

    $banners = $query->latest()->get();

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
                ->where(function($q) use ($url,$orden){
                  $q->whereRaw('LOWER(TRIM(url)) = ?', [$url])
                    ->orWhere('priority', $orden);
                })
                ->exists();
      if($existe){
        DB::rollback();
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
      DB::rollback();
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
      $existe = Carousel::whereRaw('LOWER(TRIM(url)) = ?',[$url])
                ->whereRaw('LOWER(TRIM(title)) = ?',[$title])
                ->where('priority', $orden)
                ->where('id', '!=', $carousel->id)
                ->exists();
      if($existe){
        DB::rollback();
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
      DB::rollback();
      return inertia('banners/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un proble al actualizar el banner: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function toggleEstado(Carousel $carousel)
  {
      $carousel->update([
          'inhabilitado' => !$carousel->inhabilitado,
      ]);

      return inertia('banners/index',[
        'resultado' => 1,
        'mensaje'   => 'Estado modificado correctamente',
        'id'        => $carousel->id,
        'timestamp' => now()->timestamp,
      ]);
  }
}
