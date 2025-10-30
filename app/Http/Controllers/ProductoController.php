<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

use Illuminate\Http\Request;
use App\Models\Producto;

class ProductoController extends Controller
{
  public function productosHabilitados(){
    $productos = Producto::where('inhabilitado',false)->get()->map(function($prod){
      return [
        'id' => $prod->producto_id,
        'nombre' => $prod->nombre
      ];
    });
    return response()->json($productos);
  }
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('productos/index',[
        'productos' => []
      ]);
    }
    
    $productos = DB::table('productos')
      ->join('producto_categorias', 'productos.producto_id', '=', 'producto_categorias.producto_id')
      ->join('categorias', 'producto_categorias.categoria_id', '=', 'categorias.categoria_id')
      ->join('productos_listas', 'productos.producto_id', '=', 'productos_listas.producto_id')
      ->join('listas_precios', 'productos_listas.lista_precio_id', '=', 'listas_precios.lista_precio_id')
      ->select(
        'productos.producto_id',
        'productos.nombre as producto_nombre',
        'productos.descripcion',
        'productos.precio',
        'productos.inhabilitado',
        'categorias.categoria_id',
        'categorias.nombre as categoria_nombre',
        'listas_precios.lista_precio_id',
        'listas_precios.nombre as lista_precio_nombre'
      )
      ->when($request->filled('categoria_id'), fn($q) =>
        $q->where('categorias.categoria_id', $request->categoria_id)
      )
      ->when($request->filled('lista_precio_id'), fn($q) =>
        $q->where('listas_precios.lista_precio_id', $request->lista_precio_id)
      )
      ->when($request->filled('producto_id'), fn($q) =>
        $q->where('productos.producto_id', $request->producto_id)
      )
      ->when($request->filled('nombre'), fn($q) =>
        $q->where('productos.nombre', 'like', '%'.$request->nombre.'%')
      )
      ->when($request->filled('inhabilitado'), fn($q) =>
        $q->where('productos.inhabilitado', filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN))
      )
      ->when($request->filled('precio'), fn($q) =>
        $q->where('productos.precio', $request->precio)
      )
      ->get();

    return inertia('productos/index',[
      'productos' => $productos
    ]);
  }

  public function create(){
    return inertia('productos/createEdit',[
      'mode' => 'create',
      'producto' => null
    ]);
  }

  public function store(Request $request)
  {
      $validated = $request->validate([
          'nombre' => 'required|string|max:255',
          'descripcion' => 'nullable|string',
          'precio' => 'required|numeric|min:0',
      ]);

      return Producto::create($validated);
  }

  public function update(Request $request, Producto $producto)
  {
      $validated = $request->validate([
          'nombre' => 'required|string|max:255',
          'descripcion' => 'nullable|string',
          'categoria_id' => 'required|exists:categorias,categoria_id',
          'precio' => 'required|numeric|min:0',
      ]);

      $producto->update($validated);
      return $producto;
  }

  public function edit(Producto $producto){
    return inertia('productos/createEdit',[
      'mode' => 'edit',
      'producto' => $producto
    ]);
  }

  public function toggleEstado(Producto $producto)
  {
    $producto->update(['inhabilitado' => !$producto->inhabilitado]);
    return inertia('productos/index',[
      'resultado'   => 1,
      'mensaje'     => 'Estado modificado exitosamente',
      'producto_id' => $producto->producto_id
    ]);
  }
}
