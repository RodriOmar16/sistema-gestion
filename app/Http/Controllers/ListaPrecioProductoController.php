<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\ListaPrecioProducto;
use App\Models\Producto;

class ListaPrecioProductoController extends Controller
{
  public function index(Request $request)
  {

    if (!$request->has('buscar')) {
        return inertia('listasPreciosProductos/index', [
            'listas' => []
        ]);
    }

    $query = ListaPrecioProducto::query()->with(['proveedor','producto']);

    if ($request->has('proveedor_id') && !in_array((string) $request->proveedor_id, ['0', ''])) {
      $query->where('proveedor_id', $request->proveedor_id);
    }

    if ($request->has('producto_id') && !in_array((string) $request->producto_id, ['0', ''])) {
      $query->where('producto_id', $request->producto_id);
    }


    $listasPrecio = $query
        ->latest()
        ->get()
        ->map(function ($lista) {
            return [
                'lista_precio_id'  => $lista->id,
                'proveedor_id'     => $lista->proveedor_id,
                'proveedor_nombre' => $lista->proveedor->nombre ?? '',
                'producto_id'      => $lista->producto_id,
                'producto_nombre'  => $lista->producto->nombre ?? '',
                'precio'           => $lista->precio,
                'porcentaje'       => $lista->porcentaje,
                'precio_sugerido'  => $lista->precio_sugerido,
                'precio_final'     => $lista->producto->precio ?? '',
            ];
        });

    return inertia('listasPreciosProductos/index', [
        'listas' => $listasPrecio
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
      //
  }

  /**
   * Display the specified resource.
   */
  public function show(string $id)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(string $id)
  {
      //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, $id)
  {
    DB::beginTransaction();
    try {
      //valido datos
      $validated = $request->validate([
        //'id'              => 'required|integer',
        'proveedor_id'    => 'required|integer',
        'producto_id'     => 'required|integer',
        'precio'          => 'required|numeric',
        'porcentaje'      => 'required|numeric',
        'precio_sugerido' => 'required|numeric',
        'precio_final'    => 'required|numeric',
      ]);
      // si $id < 0 significa que era un registro nuevo
      if ($id < 0) {
        $existe = ListaPrecioProducto::where('proveedor_id', $request->proveedor_id)
                  ->where('producto_id', $request->producto_id)
                  ->exists();
        if($existe){
          //redirect()->back()->with('error', 'Ya existe un registro con este producto para este proveedor. Revisar.');
          return inertia('listasPreciosProductos/index',[
            'resultado'       => 0,
            'mensaje'         => 'Ya existe un registro con este producto para este proveedor. Revisar',
            'timestamp'       => now()->timestamp,
          ]);
        }
        $lista = ListaPrecioProducto::create([
          'proveedor_id'    => $validated['proveedor_id'],
          'producto_id'     => $validated['producto_id'],
          'precio'          => $validated['precio'],
          'porcentaje'      => $validated['porcentaje'],
          'precio_sugerido' => $validated['precio_sugerido'],
          'created_at'      => now()
        ]);
      } else {
        $lista = ListaPrecioProducto::findOrFail($id);
        $lista->update([
          'proveedor_id'    => $validated['proveedor_id'],
          'producto_id'     => $validated['producto_id'],
          'precio'          => $validated['precio'],
          'porcentaje'      => $validated['porcentaje'],
          'precio_sugerido' => $validated['precio_sugerido'],
          'updated_at'      => now()
        ]);
      }

      //actualizo el precio al producto
      if($request->cambiar === 1){
        $producto = Producto::findOrFail($validated['producto_id']);
        $producto->update([ 'precio' => $validated['precio_final'] ]);
      }

      DB::commit();

      /*return response()->json([
        'resultado' => 1,
        'mensaje'   => 'Proceso registrado correctamente.',
        'success'   => true,
        'elemento'  => $lista // 👈 devolvés el registro con su id real
      ]);*/
      return redirect()->back()->with('success', 'Proceso registrado correctamente.');
    } catch (\Throwable $e) {
      DB::rollback();
      //return response()->json(['error' => $e->getMessage()], 500);
      return redirect()->back()->with('error', 'Error: '.$e->getMessage());
    }
  }


  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
      //
  }
}
