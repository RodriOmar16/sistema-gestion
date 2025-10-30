<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\ListaPrecio;
use App\Http\Requests\StoreListaPrecioRequest;
use App\Http\Requests\UpdateListaPrecioRequest;

class ListaPrecioController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('listasPrecios/index',[
        'listas' => []
      ]);
    }

    $query = ListaPrecio::query();
    if($request->filled('lista_precio_id')){
      $query->where('lista_precio_id', $request->lista_precio_id);
    }
    if($request->filled('lista_precio_nombre')){
      $query->where('nombre', $request->lista_precio_nombre);
    }
    if($request->filled('proveedor_id')){
      $query->where('proveedor_id', $request->proveedor_id);
    }
    if($request->filled('fecha_inicio') && $request->filled('fecha_fin')){
      $query->whereBetween('fecha_inicio', [$request->fecha_inicio, $request->fecha_fin]);
    }
    if($request->filled('fecha_inicio') && !$request->filled('fecha_fin')){
      $query->whereBetween('fecha_inicio', [$request->fecha_inicio, now()->toDateString()]);
    }
    if(!$request->filled('fecha_inicio') && $request->filled('fecha_fin')){
      $query->whereBetween('fecha_fin', [now()->toDateString(),$request->fecha_fin]);
    }
    if($request->filled('inhabilitada')){
      $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitada', $estado);
    }

    if(!$request->filled('lista_precio_id') && !$request->filled('lista_precio_nombre') && 
       !$request->filled('proveedor_id') && !$request->filled('fecha_inicio') && 
       !$request->filled('fecha_fin') && !$request->filled('inhabilitada')){
      $query = ListaPrecio::query();
    }

    $listasPrecio = $query->with('proveedor')->latest()->get()->map(function ($lista) {
      return [
        'lista_precio_id'     => $lista->lista_precio_id,
        'lista_precio_nombre' => $lista->nombre,
        'proveedor_id'        => $lista->proveedor_id,
        'proveedor_nombre'    => $lista->proveedor->nombre ?? '',
        'fecha_inicio'        => $lista->fecha_inicio,
        'fecha_fin'           => $lista->fecha_fin,
        'inhabilitada'        => $lista->inhabilitada,
        'created_at'          => $lista->created_at, 
        'updated_at'          => $lista->updated_at, 
      ];
    });

    return inertia('listasPrecios/index',[
      'listas' => $listasPrecio
    ]);
  }
  
  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido datos
      $validated = $request->validate([
        'proveedor_id'        => 'required|integer',
        'lista_precio_nombre' => 'required|string|max:255',
        'fecha_inicio'        => 'required|nullable|date|before_or_equal:fecha_fin',
        'fecha_fin'           => 'nullable|date|after_or_equal:fecha_inicio',
        'inhabilitada'        => 'boolean',
      ]);
      //controlo que no este repetido
      $fechaIni = $validated['fecha_inicio'];
      $fechaFin = $validated['fecha_fin'];
      $existe = ListaPrecio::where('proveedor_id', $request->proveedor_id)
                            ->where('inhabilitada', false)
                            ->where(function ($query) use ($request) {
                              $query->whereDate('fecha_inicio', '<=', $request->fecha_fin)
                                    ->where(function ($q) use ($request) {
                                      $q->whereDate('fecha_fin', '>=', $request->fecha_inicio)
                                        ->orWhereNull('fecha_fin'); // considera vigentes sin fecha de fin
                                    });
                            })->exists();
      if ($existe) {
        DB::rollback();
        return inertia('listasPrecios/index', [
          'resultado' => 0,
          'mensaje'   => 'Ya existe una lista habilitada con fechas que se solapan.'
        ]);
      }
      //creo la lista en la base
      $lista = ListaPrecio::create([
        'nombre'       => $validated['lista_precio_nombre'],
        'proveedor_id' => $validated['proveedor_id'],
        'fecha_inicio' => $validated['fecha_inicio'],
        'fecha_fin'    => $validated['fecha_fin'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
      ]);
      //éxito
      DB::commit();
      return inertia('listasPrecios/index',[
        'resultado'       => 1,
        'mensaje'         => 'Se creó correctamente la lista de precios',
        'lista_precio_id' => $lista->lista_precio_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('listasPrecios/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear la lista de precios: '.$e->getMessage()
      ]);
    }
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, ListaPrecio $lista)
  {
    DB::beginTransaction();
    try {
      //valido datos
      $validated = $request->validate([
        'proveedor_id'        => 'integer',
        'lista_precio_nombre' => 'required|string|max:255',
        'fecha_inicio'        => 'nullable|date|before_or_equal:fecha_fin',
        'fecha_fin'           => 'nullable|date|after_or_equal:fecha_inicio',
        'inhabilitada'        => 'boolean',
      ]);
      //controlo que no este repetido
      $fechaIni = $validated['fecha_inicio'];
      $fechaFin = $validated['fecha_fin'];
      $existe   = ListaPrecio::where('proveedor_id', $validated['proveedor_id'])
                            ->where('lista_precio_id','!=',(int)$lista->lista_precio_id)
                            ->where('inhabilitada', false)
                            ->where(function ($query) use ($request) {
                              $query->whereDate('fecha_inicio', '<=', $request->fecha_fin)
                                    ->where(function ($q) use ($request) {
                                      $q->whereDate('fecha_fin', '>=', $request->fecha_inicio)
                                        ->orWhereNull('fecha_fin'); // considera vigentes sin fecha de fin
                                    });
                            })->exists();
      if ($existe) {
        DB::rollback();
        return inertia('listasPrecios/index', [
          'resultado' => 0,
          'mensaje'   => 'Ya existe una lista habilitada con fechas que se solapan.'
        ]);
      }
      //creo la lista en la base
      $lista->update([
        'nombre'       => $validated['lista_precio_nombre'],
        'proveedor_id' => $validated['proveedor_id'],
        'fecha_inicio' => $validated['fecha_inicio'],
        'fecha_fin'    => $validated['fecha_fin'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0,
      ]);
      //éxito
      DB::commit();
      return inertia('listasPrecios/index',[
        'resultado'       => 1,
        'mensaje'         => 'Se actualizó correctamente la lista de precios',
        'lista_precio_id' => $lista->lista_precio_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('listasPrecios/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar la lista de precios: '.$e->getMessage()
      ]);
    }
  }
  
  public function toggleEstado(ListaPrecio $lista)
  {
    Log::info('ID recibido:', ['id' => $lista->lista_precio_id]);
    $lista->update(['inhabilitada' => !$lista->inhabilitada]);
    return inertia('listasPrecios/index',[
      'resultado'       => 1,
      'mensaje'         => 'Estado modificado correctamente',
      'lista_precio_id' => $lista->lista_precio_id,
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
   * Display the specified resource.
   */
  public function show(ListaPrecio $listaPrecio)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(ListaPrecio $listaPrecio)
  {
      //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(ListaPrecio $listaPrecio)
  {
      //
  }
}
