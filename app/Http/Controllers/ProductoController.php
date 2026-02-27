<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;


use App\Models\Producto;
use App\Models\Stock;
use App\Models\ProductoCategoria;
use App\Models\ProductoLista;

use Barryvdh\DomPDF\Facade\Pdf;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ProductoController extends Controller
{
  public function getProducto($id)
  {
    try {
      $producto = Producto::where('producto_id', $id)->first();

      if (!$producto) {
        return response()->json([
          'resultado' => 0,
          'mensaje'   => "Ocurrió un error. No se encontró el producto con ID: $id"
        ], 404);
      }

      return response()->json([
        'resultado' => 1,
        'producto'  => $producto
      ]);
    } catch (\Throwable $th) {
      return response()->json([
        'resultado' => 0,
        'mensaje'   => $th->getMessage()
      ], 500);
    }
  }

  public function productosHabilitados(){
    $productos = Producto::where('inhabilitado',false)->get()->map(function($prod){
      return [
        'id' => $prod->producto_id,
        'nombre' => $prod->nombre,
        'precio' => $prod->precio,
      ];
    });
    return response()->json($productos);
  }

  public function habilitados(Request $request)
  {
    try {
      $buscar = $request->get('buscar', '');

      $productos = Producto::query()
        ->where('inhabilitado',0)
        ->when($buscar, fn($q) => $q->where('nombre', 'LIKE', "%{$buscar}%"))
        ->select('producto_id as id', 'nombre')
        ->paginate(20);

      return response()->json([
          'elementos' => $productos
      ]);
    } catch (\Throwable $e) {
      //Log::error('Error en buscar productos: ' . $e->getMessage());
      return response()->json(['error' => $e->getMessage()], 500);
    }
  }

  public function productosStockHabilitados(Request $request){
    try {
      $buscar = $request->get('buscar', '');

      $productos = Producto::query()
        ->with('stock')
        ->where('inhabilitado',0)
        ->when($buscar, fn($q) => $q->where('nombre', 'LIKE', "%{$buscar}%"))
        ->select('producto_id as id', 'nombre')
        ->whereHas('stock', function($q){ 
          $q->where('cantidad', '>', 0); 
        })
        ->paginate(20);

      return response()->json([
          'elementos' => $productos
      ]);
    } catch (\Throwable $e) {
      //Log::error('Error en buscar productos: ' . $e->getMessage());
      return response()->json(['error' => $e->getMessage()], 500);
    }
  }

  public function generarPDF(Request $request){

    $query = Producto::with(['categorias', 'marca']);

    if ($request->filled('producto_id')) {
      $query->where('producto_id', $request->producto_id);
    }
    if ($request->filled('marca_id')) {
      $query->where('marca_id', $request->marca_id);
    }
    if ($request->filled('producto_nombre')) {
      $query->where('nombre', 'like', '%' . $request->producto_nombre . '%');
    }
    if ($request->filled('codigo_barra')) {
      $query->where('codigo_barra', 'like', '%' . $request->codigo_barra . '%');
    }
    if ($request->filled('precio') && $request->precio >= 0) {
      $query->where('precio', $request->precio);
    }
    if($request->filled('vencimiento')){
      $query->where('vencimiento', $request->vencimiento);
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

    $productos = $query->get();

    $pdf = Pdf::loadView('pdf.productos', compact('productos'));
    return $pdf->download('productos.pdf');
  }

  public function exportarExcelManual(Request $request){
    //$productos = Producto::with(['categorias', 'productosLista.listaPrecio'])->get();
    $query = Producto::with(['categorias', 'marca']);

    if ($request->filled('producto_id')) {
      $query->where('producto_id', $request->producto_id);
    }
    if ($request->filled('marca_id')) {
      $query->where('marca_id', $request->marca_id);
    }
    if ($request->filled('producto_nombre')) {
      $query->where('nombre', 'like', '%' . $request->producto_nombre . '%');
    }
    if ($request->filled('codigo_barra')) {
      $query->where('codigo_barra', 'like', '%' . $request->codigo_barra . '%');
    }
    if ($request->filled('precio') && $request->precio >= 0) {
      $query->where('precio', $request->precio);
    }
    if($request->filled('vencimiento')){
      $query->where('vencimiento', $request->vencimiento);
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

    $productos = $query->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Encabezados
    $sheet->setCellValue('A1', 'ID');
    $sheet->setCellValue('B1', 'Nombre');
    $sheet->setCellValue('C1', 'Descripción');
    $sheet->setCellValue('D1', 'Precio');
    $sheet->setCellValue('E1', 'Cód. Barras');
    $sheet->setCellValue('F1', 'Stock Mín.');
    $sheet->setCellValue('G1', 'Inhabilitado');
    $sheet->setCellValue('H1', 'Marca');
    $sheet->setCellValue('I1', 'Categorías');

    // Filas
    foreach ($productos as $i => $p) {
      $row = $i + 2;
      
      //obtengo las categorias
      $categorias = $p->categorias->pluck('nombre')->implode(', ');

      //obtengo la marca
      $marca = $p->marca && !$p->marca->inhabilitada ? $p->marca->nombre : 'Sin marca';

      $sheet->setCellValue("A{$row}", $p->producto_id);
      $sheet->setCellValue("B{$row}", $p->nombre);
      $sheet->setCellValue("C{$row}", $p->descripcion ?? '');
      $sheet->setCellValue("D{$row}", $p->precio ?? 0);
      $sheet->setCellValue("E{$row}", $p->codigo_barra ?? '');
      $sheet->setCellValue("F{$row}", $p->stock_minimo ?? 0);
      $sheet->setCellValue("G{$row}", $p->inhabilitado ? 'Sí' : 'No');
      $sheet->setCellValue("H{$row}", $marca);
      $sheet->setCellValue("I{$row}", $categorias);
    }

    // aplicar formato de moneda a toda la columna D (precio) 
    $lastRow = count($productos) + 1; // +1 porque la fila 1 es encabezado 
    $sheet->getStyle("D2:D{$lastRow}") 
          ->getNumberFormat() 
          ->setFormatCode('"$"#,##0.00_-');

    //controla la redimension del ancho
    foreach (range('A', 'I') as $col) {
      $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    //marca el encabezado
    $sheet->getStyle('A1:I1')->getFont()->setBold(true);

    // Guardar en archivo temporal
    $writer = new Xlsx($spreadsheet);
    $filename = 'productos.xlsx';
    $tempFile = tempnam(sys_get_temp_dir(), $filename);
    $writer->save($tempFile);

    return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
  }

  public function getImages()
  {
      //\Log::info('Listando imágenes...');

      try {
          $path = public_path('images/productos');

          if (!File::exists($path)) {
              throw new \Exception("La carpeta no existe: $path");
          }

          $files = File::files($path);

          $urls = collect($files)->map(function ($file) {
              return 'images/productos/' . $file->getFilename();
          });

          return response()->json($urls);
      } catch (\Throwable $e) {
          \Log::error('Error al listar imágenes: ' . $e->getMessage());
          return response()->json(['error' => $e->getMessage()], 500);
      }
  }

  public function index(Request $request)
  {
    if (!$request->has('buscar')) {
      return inertia('productos/index', ['productos' => []]);
    }

    $query = Producto::query()->with(['categorias', 'marca', 'stock']);

    // Campos propios
    if ($request->filled('producto_id')) {
      $query->where('producto_id', $request->producto_id);
    }
    if ($request->filled('marca_id')) {
      $query->where('marca_id', $request->marca_id);
    }
    if ($request->filled('producto_nombre')) {
      $query->where('nombre', 'like', '%' . $request->producto_nombre . '%');
    }
    if ($request->filled('codigo_barra')) {
      $query->where('codigo_barra', 'like', '%' . $request->codigo_barra . '%');
    }
    if ($request->filled('precio') && $request->precio > 0) {
      $query->where('precio', $request->precio);
    }
    if($request->filled('vencimiento')){
      $query->where('vencimiento', $request->vencimiento);
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

    $productos = $query->latest()->get()->map( //->paginate(10)->through(
      function ($producto) {
        $categoria = $producto->categorias->first(); 
        return [ 
          'producto_id' => $producto->producto_id, 
          'producto_nombre' => $producto->nombre, 
          'descripcion' => $producto->descripcion, 
          'precio' => $producto->precio, 
          'categoria_id' => $categoria?->categoria_id ?? '',
          'categoria_nombre' => $categoria?->nombre ?? '',
          'marca_id' => $producto->marca->marca_id ?? '', 
          'marca_nombre' => $producto->marca->nombre ?? '', 
          'codigo_barra' => $producto->codigo_barra, 
          'stock_minimo' => $producto->stock_minimo,
          'stock_actual' => $producto->stock?->cantidad ?? 0,
          'vencimiento' => $producto->vencimiento, 
          'inhabilitado' => $producto->inhabilitado, 
          'imagen' => $producto->imagen, 
          'created_at' => $producto->created_at, 
          'updated_at' => $producto->updated_at, 
        ]; 
      }
    ); 
    
    return inertia('productos/index', [
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
    DB::beginTransaction();
    try {
      //validar los datos
      $validated = $request->validate([
        'producto_nombre' => 'required|string|max:255',
        'descripcion'     => 'required|string|max:255',
        'inhabilitado'    => 'boolean',
        'precio'          => 'required|numeric',
        'marca_id'        => 'required|numeric',
        'stock_minimo'    => 'required|numeric',
        'categorias'      => 'required|array|min:1',
        'codigo_barra'    => 'required|string|max:255',
        'imagen'          => 'required|string|max:255',
        'vencimiento'     => 'nullable|string|max:255'
      ]);
      //controlar que no se repita
      $codigoBarras = strtolower(trim($validated['codigo_barra']));
      $existe = Producto::whereRaw('LOWER(TRIM(codigo_barra)) = ?', [$codigoBarras])
                        //->where('precio', $validated['precio'])
                        ->exists();
      if($existe){
        /*return inertia('productos/createEdit',[
          'resultado' => 0,
          'mensaje'   => 'El producto que intentas registrar ya existe',
          'timestamp' => now()->timestamp,
        ]);*/
        return response()->json([
          'resultado' => 0,
          'mensaje'   => 'El producto que intentas registrar ya existe',
          'timestamp' => now()->timestamp,
        ]);
      }
      //crear el producto y sus tablas intermedias
      $producto = Producto::create([
        'nombre'          => $validated['producto_nombre'],
        'descripcion'     => $validated['descripcion'],
        'inhabilitado'    => $validated['inhabilitado'] ? 1 : 0,
        'precio'          => $validated['precio'],
        'marca_id'        => $validated['marca_id'],
        'stock_minimo'    => $validated['stock_minimo'],
        'codigo_barra'    => $validated['codigo_barra'],
        'imagen'          => $validated['imagen'],
        'vencimiento'     => $validated['vencimiento'],
      ]);
      $producto_id = $producto->producto_id;

      $categorias = collect($request->input('categorias'))->pluck('id')->unique()->toArray();
      foreach($categorias as $cate_id){
        ProductoCategoria::firstOrCreate([
          'producto_id'  => $producto_id, 
          'categoria_id' => $cate_id
        ]);
      }
      //commit
      DB::commit();
      /*return inertia('productos/createEdit',[
        'resultado'   => 1,
        'mensaje'     => 'Producto create correctamente',
        'producto_id' => $producto_id,
        'timestamp'   => now()->timestamp,
      ]);*/
      return response()->json([
        'resultado'   => 1,
        'mensaje'     => 'Producto create correctamente',
        'producto_id' => $producto_id,
        'timestamp'   => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      /*return inertia('productos/createEdit',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el producto: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);*/
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el producto: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function update(Request $request, Producto $producto)
  {
    \Log::info('Request keys:', array_keys($request->all()));

    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'producto_nombre' => 'required|string|max:255',
        'descripcion'     => 'required|string|max:255',
        'inhabilitado'    => 'boolean',
        'precio'          => 'required|numeric',
        'marca_id'        => 'required|integer',
        'stock_minimo'    => 'required|integer',
        'codigo_barra'    => 'required|string|max:255',
        'imagen'          => 'string|nullable|max:255',
        'vencimiento'     => 'string|nullable|max:255',

        'categorias'      => 'array|min:1',
        //'categorias.*.id' => 'integer', 
        //'categorias.*.nombre' => 'string',

        //'file'            => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048'
      ]);

      //controlo que no se repita, distinto al mismo
      $codBarras = strtolower(trim($validated['codigo_barra']));
      $nombre = strtolower(trim($validated['producto_nombre']));
      $existe = Producto::whereRaw('LOWER(TRIM(codigo_barra)) = ?', [$codBarras])
                        ->whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                        ->where('producto_id','!=',$producto->producto_id)
                        //->where('precio', $validated['precio'])
                        ->exists();
      if($existe){
        /*return inertia('productos/createEdit',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe un producto con esas especificaciones',
          'timestamp' => now()->timestamp,
        ]);*/
        return response()->json([
          'resultado' => 0,
          'mensaje'   => 'Ya existe un producto con esas especificaciones',
          'timestamp' => now()->timestamp,
        ]);
      }

      /*if ($request->hasFile('file')) { 
        // guarda en public/imagenes 
        $filename = time().'_'.$request->file('file')->getClientOriginalName(); 
        $request->file('file')->move(public_path('imagenes/productos'), $filename);
        
        $validated['imagen'] = 'imagenes/productos/'.$filename; // ruta relativa 
      }*/

      //actualizo el producto y sus tablas intermedias
      $producto->update([
        'nombre'          => $validated['producto_nombre'],
        'descripcion'     => $validated['descripcion'],
        'inhabilitado'    => $validated['inhabilitado'] ? 1 : 0,
        'precio'          => $validated['precio'],
        'marca_id'        => $validated['marca_id'],
        'stock_minimo'    => $validated['stock_minimo'],
        'codigo_barra'    => $validated['codigo_barra'],
        'imagen'          => $validated['imagen'],
        'vencimiento'     => $validated['vencimiento'],
        'updated_at'      => now()
      ]);
      $producto_id = $producto->producto_id;

      $categoriasId = collect($request->input('categorias'))->pluck('id')->unique()->toArray();
      $producto->categorias()->sync($categoriasId);

      //commit
      DB::commit();
      /*return inertia('productos/createEdit',[
        'resultado'   => 1,
        'mensaje'     => 'Se actualizó correctamente el producto',
        'producto_id' => $producto->producto_id,
        'timestamp' => now()->timestamp,
      ]);*/
      return response()->json([
        'resultado'   => 1,
        'mensaje'     => 'Se actualizó correctamente el producto',
        'producto_id' => $producto->producto_id,
        'timestamp' => now()->timestamp,
      ]);
    } catch (\Throwable $e) {
      DB::rollback();
      /*return inertia('productos/createEdit',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al momento de actualizar el producto: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);*/
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un problema al momento de actualizar el producto: '.$e->getMessage(),
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function edit(Producto $producto){
    $producto->load([      
      'categorias' => function ($q) {
        $q->select('categorias.categoria_id', 'categorias.nombre');
      },
      'marca' => function ($q) { $q->select('marca_id', 'nombre'); }
    ]);

    $categorias = $producto->categorias->map(fn($c)=>[
      'id'     => $c->categoria_id?? $c->id,
      'nombre' => $c->nombre
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
        'marca_id'            => $producto->marca->marca_id ?? '', 
        'marca_nombre'        => $producto->marca->nombre ?? '',
        'codigo_barra'        => $producto->codigo_barra??'',
        'stock_minimo'        => $producto->stock_minimo??0,
        'vencimiento'         => $producto->vencimiento??'',
        'imagen'              => $producto->imagen??'',
        'created_at'          => $producto->created_at,
        'updated_at'          => $producto->updated_at,
      ],
      'categorias'    => $categorias,
    ]);
  }

  public function toggleEstado(Producto $producto)
  {
    $producto->update(['inhabilitado' => !$producto->inhabilitado]);
    /*return inertia('productos/index',[
      'resultado'   => 1,
      'mensaje'     => 'Estado modificado exitosamente',
      'producto_id' => $producto->producto_id,
      'timestamp' => now()->timestamp,
    ]);*/
  return response()->json([
    'resultado'   => 1,
    'mensaje'     => 'Estado modificado exitosamente',
    'producto_id' => $producto->producto_id,
    'timestamp' => now()->timestamp,
  ]);
  }

  public function generarCodigo()
  {
    // genero el codigo
    $codigo = (string) str_pad(mt_rand(100000000000, 999999999999), 13, '0', STR_PAD_LEFT);
    
    // valido que no repetirá
    do {
      $codigo = (string) str_pad(mt_rand(100000000000, 999999999999), 13, '0', STR_PAD_LEFT);
    } while (Producto::where('codigo_barra', (string)$codigo)->exists());
    
    // devuelvo
    return response()->json(['codigo_barra' => (string) $codigo]);
  }


}
