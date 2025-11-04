<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Models\Producto;
use App\Models\ProductoCategoria;
use App\Models\ProductoLista;

use Barryvdh\DomPDF\Facade\Pdf;

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

  public function generarPDF(Request $request){

    $query = Producto::query()->with(['categorias', 'productosLista.listaPrecio']);

    // Campos propios
    if ($request->filled('producto_id')) {
      $query->where('producto_id', $request->producto_id);
    }
    if ($request->filled('producto_nombre')) {
      $query->where('nombre', 'like', '%' . $request->producto_nombre . '%');
    }
    if ($request->filled('descripcion')) {
      $query->where('descripcion', 'like', '%' . $request->descripcion . '%');
    }
    if ($request->filled('precio') && $request->precio >= 0) {
      $query->where('precio', $request->precio);
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    // Relaciones intermedias
    if ($request->filled('categoria_id') && $request->categoria_id !== '') {
      $query->whereHas('categorias', fn($q) =>
        $q->where('categorias.categoria_id', $request->categoria_id)
      );
    }

    if ($request->filled('lista_precio_id') && $request->lista_precio_id !== '') {
      $query->whereHas('productosLista', fn($q) =>
        $q->where('lista_precio_id', $request->lista_precio_id)
          ->where('precio_lista', '>', 0)
      );
    }

    $productos = $query->get();

    $pdf = Pdf::loadView('pdf.productos', compact('productos'));
    return $pdf->download('productos.pdf');
  }

  public function index(Request $request)
  {
    if (!$request->has('buscar')) {
      return inertia('productos/index', ['productos' => []]);
    }

    $query = Producto::query()->with(['categorias', 'productosLista']);

    // Campos propios
    if ($request->filled('producto_id')) {
      $query->where('producto_id', $request->producto_id);
    }
    if ($request->filled('producto_nombre')) {
      $query->where('nombre', 'like', '%' . $request->producto_nombre . '%');
    }
    if ($request->filled('descripcion')) {
      $query->where('descripcion', 'like', '%' . $request->descripcion . '%');
    }
    if ($request->filled('precio') && $request->precio >= 0) {
      $query->where('precio', $request->precio);
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    // Relaciones intermedias
    if ($request->filled('categoria_id') && $request->categoria_id !== '') {
      $query->whereHas('categorias', fn($q) =>
        $q->where('categorias.categoria_id', $request->categoria_id)
      );
    }

    if ($request->filled('lista_precio_id') && $request->lista_precio_id !== '') {
      $query->whereHas('productosLista', fn($q) =>
        $q->where('lista_precio_id', $request->lista_precio_id)
          ->where('precio_lista', '>', 0)
      );
    }

    $productos = $query->latest()->get();

    return inertia('productos/index', ['productos' => $productos]);
  }

  public function create(){
    return inertia('productos/createEdit',[
      'mode' => 'create',
      'producto' => null
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //validar los datos
      $validated = $request->validate([
        'producto_nombre' => 'required|string|max:255',
        'descripcion'     => 'required|string|max:255',
        'inhabilitado'    => 'boolean',
        'precio'          => 'required|numeric',
        'categorias'      => 'required|array|min:1',
        'listas'          => 'required|array|min:1',
      ]);
      //controlar que no se repita
      $nombre = strtolower(trim($validated['producto_nombre']));
      $existe = Producto::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                        ->where('precio', $validated['precio'])
                        ->exists();
      if($existe){
        return inertia('productos/createEdit',[
          'resultado' => 0,
          'mensaje'   => 'El producto que intentas registrar ya existe',
        ]);
      }
      //crear el producto y sus tablas intermedias
      $producto = Producto::create([
        'nombre'          => $validated['producto_nombre'],
        'descripcion'     => $validated['descripcion'],
        'inhabilitado'    => $validated['inhabilitado'] ? 1 : 0,
        'precio'          => $validated['precio']
      ]);
      $producto_id = $producto->producto_id;
      
      $listasProd = collect($request->input('listas'))
      ->filter(fn($l) => $l['precio'] != 0)
      ->map(fn($l) => (object)[
        'id'     => $l['id'],
        'nombre' => $l['nombre'],
        'precio' => $l['precio']
      ])
      ->values();

      foreach($listasProd as $lp){
        ProductoLista::firstOrCreate([
          'producto_id'     => $producto_id, 
          'lista_precio_id' => $lp->id,
          'precio_lista'    => $lp->precio
        ]);
      }

      $categorias = collect($request->input('categorias'))->pluck('id')->unique()->toArray();
      foreach($categorias as $cate_id){
        ProductoCategoria::firstOrCreate([
          'producto_id'  => $producto_id, 
          'categoria_id' => $cate_id
        ]);
      }
      //commit
      DB::commit();
      return inertia('productos/createEdit',[
        'resultado'   => 1,
        'mensaje'     => 'Producto create correctamente',
        'producto_id' => $producto_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('productos/createEdit',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el producto: '.$e->getMessage()
      ]);
    }
  }

  public function update(Request $request, Producto $producto)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'producto_nombre' => 'required|string|max:255',
        'descripcion'     => 'required|string|max:255',
        'inhabilitado'    => 'boolean',
        'precio'          => 'required|numeric',
        'categorias'      => 'required|array|min:1',
        'listas'          => 'required|array|min:1',
      ]);
      //controlo que no se repita, distinto al mismo
      $nombre = strtolower(trim($validated['producto_nombre']));
      $existe = Producto::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                        ->where('producto_id','!=',$producto->producto_id)
                        ->where('precio', $validated['precio'])
                        ->exists();
      if($existe){
        return inertia('productos/createEdit',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un producto con esas especificaciones',
        ]);
      }
      //actualizo el producto y sus tablas intermedias
      $producto->update([
        'producto_nombre' => $validated['producto_nombre'],
        'descripcion'     => $validated['descripcion'],
        'inhabilitado'    => $validated['inhabilitado'] ? 1 : 0,
        'precio'          => $validated['precio'],
      ]);
      $producto_id = $producto->producto_id;
      
      $listasProd = collect($request->input('listas'))
      ->filter(fn($l) => $l['precio'] != 0)
      ->map(fn($l) => (object)[
        'id'     => $l['id'],
        'nombre' => $l['nombre'],
        'precio' => $l['precio']
      ])
      ->values();
      $actuales = ProductoLista::where('producto_id', $producto_id)->get()->keyBy('lista_precio_id');
      $nuevas   = $listasProd->keyBy('id');
      $idsNuevas   = $nuevas->keys()->all();
      $idsEliminar = $actuales->keys()->diff($idsNuevas);
      ProductoLista::where('producto_id', $producto_id)
                    ->whereIn('lista_precio_id', $idsEliminar)
                    ->delete();
      foreach($nuevas as $id => $lp){
        ProductoLista::updateOrCreate(
          [
            'producto_id'     => $producto_id,
            'lista_precio_id' => $id
          ],
          [
            'precio_lista'    => $lp->precio
          ]
        );
      }

      $categoriasId = collect($request->input('categorias'))->pluck('id')->unique()->toArray();
      $producto->categorias()->sync($categoriasId);

      //commit
      DB::commit();
      return inertia('productos/createEdit',[
        'resultado'   => 1,
        'mensaje'     => 'Se actualizó correctamente el producto',
        'producto_id' => $producto->producto_id
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('productos/createEdit',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al momento de actualizar el producto: '.$e->getMessage()
      ]);
    }
  }

  public function edit(Producto $producto){
    $producto->load([
      'listasPrecios' => function ($q) {
        $q->select('listas_precios.lista_precio_id', 'listas_precios.nombre');
      },
      'categorias' => function ($q) {
        $q->select('categorias.categoria_id', 'categorias.nombre');
      }
    ]);

    $categorias = $producto->categorias->map(fn($c)=>[
      'id'     => $c->categoria_id?? $c->id,
      'nombre' => $c->nombre
    ]);
    $listasPrecio = $producto->listasPrecios->map(fn($l) => [
      'lista_precio_id' => $l->lista_precio_id ?? $l->id,
      'nombre'          => $l->nombre,
      'precio'          => $l->pivot->precio_lista,
    ]);

    return inertia('productos/createEdit',[
      'mode'          => 'edit',
      'producto' => [
        'producto_id'         => $producto->producto_id,
        'producto_nombre'     => $producto->nombre,
        'descripcion'         => $producto->descripcion,
        'precio'              => $producto->precio,
        'inhabilitado'        => $producto->inhabilitado,
        'categoria_id'        => '',
        'categoria_nombre'    => '',
        'lista_precio_id'     => '',
        'lista_precio_nombre' => '',
        'created_at'          => $producto->created_at,
        'updated_at'          => $producto->updated_at,
      ],
      'categorias'    => $categorias,
      'listasPrecios' => $listasPrecio
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
