<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use App\Models\Venta;
use App\Models\DetVenta;
use App\Models\VentaAnulada;
use App\Models\Cliente;
use App\Models\MovimientoStock;
use App\Models\Stock;
use App\Models\VentaPago;
use App\Models\Producto;
use App\Models\Turno;
use App\Models\FormaPago;

use App\Mail\VentaRegistradaMail;
use App\Mail\VentaRegistradaDuenioMail;
use App\Mail\StockMinimoAlcanzadoMail;
use App\Mail\VentaAnuladaMail;


use Barryvdh\DomPDF\Facade\Pdf;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class VentaController extends Controller
{
  public function generarPDF(Request $request){
    $query = Venta::query()->with(['cliente', 'detalles', 'pagos', 'anulacion']);

    if($request->filled('venta_id')){
      $query->where('venta_id', $request->venta_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha_grabacion', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha_grabacion', '<=', $request->fecha_hasta);
    }
    if($request->filled('cliente_id')){
      $query->where('cliente_id', $request->cliente_id);
    }
    if($request->filled('fecha_anulacion')){
      $query->where('fecha_anulacion', $request->fecha_anulacion);
    }
    if($request->has('anulada')){
      $estado = filter_var($request->anulada, FILTER_VALIDATE_BOOLEAN);
      $query->where('anulada', $estado);
    }
    //controlo ventas del turno
    if($request->filled('turno_id')){
      //obtengo el turno
      $turno = Turno::where('turno_id', $request->turno_id)->first();
      $query->whereRaw('HOUR(fecha_grabacion) >= ?',[$turno->apertura])
            ->whereRaw('HOUR(fecha_grabacion) <= ?',[$turno->cierre]);
    }

    //obtengo ventas con el metodo de pago seleccionado
    if ($request->filled('forma_pago_id')) {
      $formaPagoId = $request->forma_pago_id;
      $query->whereHas('formasPago', function ($q) use ($formaPagoId) {
          $q->where('formas_pago.forma_pago_id', '=', $formaPagoId);
      });
    }

    $ventas = $query->get();

    $pdf = Pdf::loadView('pdf.ventas', compact('ventas'));
    return $pdf->download('ventas.pdf');
  }

  public function exportarExcelManual(Request $request){
    $query = Venta::query()->with(['cliente', 'detalles.producto', 'pagos.formaPago', 'anulacion']);

    // filtros
    if($request->filled('venta_id')){
      $query->where('venta_id', $request->venta_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha_grabacion', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha_grabacion', '<=', $request->fecha_hasta);
    }
    if($request->filled('cliente_id')){
      $query->where('cliente_id', $request->cliente_id);
    }
    if($request->filled('fecha_anulacion')){
      $query->where('fecha_anulacion', $request->fecha_anulacion);
    }
    if($request->has('anulada')){
      $estado = filter_var($request->anulada, FILTER_VALIDATE_BOOLEAN);
      $query->where('anulada', $estado);
    }

    //controlo ventas del turno
    if($request->filled('turno_id')){
      //obtengo el turno
      $turno = Turno::where('turno_id', $request->turno_id)->first();
      $query->whereRaw('HOUR(fecha_grabacion) >= ?',[$turno->apertura])
            ->whereRaw('HOUR(fecha_grabacion) <= ?',[$turno->cierre]);
    }

    //obtengo ventas con el metodo de pago seleccionado
    if ($request->filled('forma_pago_id')) {
      $formaPagoId = $request->forma_pago_id;
      $query->whereHas('formasPago', function ($q) use ($formaPagoId) {
          $q->where('formas_pago.forma_pago_id', '=', $formaPagoId);
      });
    }

    $ventas = $query->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    $row = 1;

    foreach ($ventas as $venta) {
      // --- Datos generales de la venta ---
      $sheet->setCellValue("A{$row}", 'ID');
      $sheet->setCellValue("B{$row}", 'Fecha');
      $sheet->setCellValue("C{$row}", 'Cliente');
      $sheet->setCellValue("D{$row}", 'Total');
      $sheet->setCellValue("E{$row}", 'Estado');
      $sheet->setCellValue("F{$row}", 'Fecha Anulación');
      $sheet->getStyle("A{$row}:F{$row}")->getFont()->setBold(true);
      $row++;

      $sheet->setCellValue("A{$row}", $venta->venta_id);
      $sheet->setCellValue("B{$row}", $venta->fecha_grabacion->format('d/m/Y H:i'));
      $sheet->setCellValue("C{$row}", $venta->cliente->nombre ?? 'Sin cliente');
      $sheet->setCellValue("D{$row}", $venta->total);
      $sheet->setCellValue("E{$row}", $venta->anulada ? 'Anulada' : 'Aprobada');
      $sheet->setCellValue("F{$row}", $venta->fecha_anulacion ? $venta->fecha_anulacion->format('d/m/Y') : '-');
      $row += 2; // dejar una fila en blanco

      // --- Detalles de productos ---
      $sheet->setCellValue("A{$row}", 'Producto');
      $sheet->setCellValue("B{$row}", 'Precio');
      $sheet->setCellValue("C{$row}", 'Cantidad');
      $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
      $row++;

      foreach ($venta->detalles as $det) {
          $sheet->setCellValue("A{$row}", $det->producto->nombre ?? 'Sin producto');
          $sheet->setCellValue("B{$row}", $det->precio_unitario);
          $sheet->setCellValue("C{$row}", $det->cantidad);
          $row++;
      }
      $row++; // fila en blanco

      // --- Pagos ---
      $sheet->setCellValue("A{$row}", 'Forma de Pago');
      $sheet->setCellValue("B{$row}", 'Monto');
      $sheet->setCellValue("C{$row}", 'Fecha');
      $sheet->getStyle("A{$row}:C{$row}")->getFont()->setBold(true);
      $row++;

      foreach ($venta->pagos as $pago) {
          $sheet->setCellValue("A{$row}", $pago->formaPago->nombre ?? 'Sin tipo');
          $sheet->setCellValue("B{$row}", $pago->monto);
          $sheet->setCellValue("C{$row}", $pago->fecha_pago ? \Carbon\Carbon::parse($pago->fecha_pago)->format('d/m/Y') : '-');
          $row++;
      }

      $row += 2; // dejar espacio antes de la siguiente venta

      // aplicar una línea negra como división
      $sheet->getStyle("A{$row}:F{$row}")
            ->getBorders()
            ->getTop()
            ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK)
            ->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('000000'));

      $row += 2; // dejar espacio antes de la siguiente venta
    }

    // aplicar formato de moneda a totales y precios
    $sheet->getStyle("D1:D{$row}")
          ->getNumberFormat()
          ->setFormatCode('"$"#,##0.00_-');
    $sheet->getStyle("B1:B{$row}")
          ->getNumberFormat()
          ->setFormatCode('"$"#,##0.00_-');

    // autoajustar columnas
    foreach (range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    $writer = new Xlsx($spreadsheet);
    $filename = 'ventas.xlsx';
    $tempFile = tempnam(sys_get_temp_dir(), $filename);
    $writer->save($tempFile);

    return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
  }


  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('ventas/index',['ventas' => []]);
    }

    $query = Venta::query();

    if($request->filled('venta_id')){
      $query->where('venta_id', $request->venta_id);
    }
    if ($request->filled('fecha_desde')) {
      $query->where('fecha_grabacion', '>=', $request->fecha_desde);
    }
    if ($request->filled('fecha_hasta')) {
      $query->where('fecha_grabacion', '<=', $request->fecha_hasta);
    }
    if($request->filled('cliente_id')){
      $query->where('cliente_id', $request->cliente_id);
    }
    if($request->filled('fecha_anulacion')){
      $query->whereDate('fecha_anulacion', $request->fecha_anulacion);
    }
    if($request->has('anulada')){
      $estado = filter_var($request->anulada, FILTER_VALIDATE_BOOLEAN);
      $query->where('anulada', $estado);
    }

    //controlo ventas del turno
    if($request->filled('turno_id')){
      //obtengo el turno
      $turno = Turno::where('turno_id', $request->turno_id)->first();
      $query->whereRaw('HOUR(fecha_grabacion) >= ?',[$turno->apertura])
            ->whereRaw('HOUR(fecha_grabacion) <= ?',[$turno->cierre]);
    }

    //obtengo ventas con el metodo de pago seleccionado
    if ($request->filled('forma_pago_id')) {
        $formaPagoId = $request->forma_pago_id;
        $query->whereHas('formasPago', function ($q) use ($formaPagoId) {
            $q->where('formas_pago.forma_pago_id', '=', $formaPagoId);
        });
    }

    $ventas = $query->with(['cliente'])->latest()->get()->map(function($v){
      return [
        'venta_id' => $v->venta_id,
        'fecha_grabacion' => $v->fecha_grabacion,
        'cliente_id'      => $v->cliente_id,
        'cliente_nombre'  => optional($v->cliente)->nombre,
        'fecha_anulacion' => $v->fecha_anulacion ?? '',
        'anulada'         => $v->anulada,
        'total'           => $v->total,
      ];
    });

    return inertia('ventas/index',[
      'ventas' => $ventas
    ]);
  }

  public function create(){
    return inertia('ventas/createView',[
      'mode' => 'create',
      'venta' => null
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        //datos de la venta
        'fecha_grabacion' => 'required|date',
        'venta_cliente_id'=> 'nullable|integer',
        'total'           => 'required|numeric',
        'anulada'         => 'boolean',
        //datos del cliente
        'cliente_id'       => 'nullable|integer',
        'dni'              => 'required|string',
        'nombre'           => 'required|string|max:255',
        'domicilio'        => 'string|max:255',
        'email'            => 'required|email',
        'fecha_nacimiento' => 'required|date',
        //array
        'detalles'    => 'required|array|min:1',
        'detalles.*.id'       => 'required|integer',
        'detalles.*.precio'   => 'required|numeric',
        'detalles.*.cantidad' => 'required|integer|min:1',
        'formasPagos' => 'required|array|min:1',
        'formasPagos.*.forma_pago_id' => 'required|integer',
        'formasPagos.*.fecha' => 'required|date',
        'formasPagos.*.monto' => 'required|numeric|min:1',
        
        'formasPagos.*.titular'            => 'nullable|string',
        'formasPagos.*.banco_billetera_id' => 'numeric|nullable',
        'formasPagos.*.estado_id'          => 'numeric|nullable',
        'formasPagos.*.cbu_nro_comprobante'=> 'string|nullable',

      ]);

      //controlo si existe o no el cliente, si no lo registro
      $dni = strtolower(trim($validated['dni']));
      $fecha_nacimiento = $validated['fecha_nacimiento'];
      $email_cliente    = $validated['email'];
      $cliente = Cliente::whereRaw('LOWER(TRIM(dni)) = ?', [$dni])
                  ->where('email',  $email_cliente)
                  ->where('fecha_nacimiento', $fecha_nacimiento)
                  ->first();
      if(!$cliente){
        $cliente = Cliente::create([
          'nombre'           => $validated['nombre'],
          'fecha_nacimiento' => $validated['fecha_nacimiento'],
          'domicilio'        => $validated['domicilio'],
          'email'            => $validated['email'],
          'dni'              => $validated['dni'],
          'inhabilitado'     => 0,
          'created_at'       => now(),
        ]);
      }
      $cliente_id = $cliente->cliente_id;

      //creo la venta
      $venta = Venta::create([
        'fecha_grabacion' => now(),
        'cliente_id'      => $cliente_id,
        'total'           => $validated['total'],
        'anulada'         => $validated['anulada'] ? 1 : 0,
        'created_at'      => now(),
        'user_grabacion'  => auth()->user()->email,
      ]);

      //registrar detalles, el movimiento de stock para cada detalle, update en el stock también
      $detalles = $validated['detalles'];
      foreach($detalles as $det){
        //obtengo el producto
        $producto = Producto::where('producto_id', $det['id'])->first();
        if(!$producto){
          DB::rollBack();
          return response()->json([
            'resultado' => 0,
            'mensaje'   => 'No se pudo encontrar información del producto a ventas: '.$det['id'],
            'mode'      => 'create',
            'timestamp' => now()->timestamp,
          ]);
        }

        //controlo el stock
        $stock = Stock::where('producto_id', $det['id'])->first();
        if (!$stock || $stock->cantidad < $det['cantidad']) {
          DB::rollBack();
          return response()->json([
            'resultado' => 0,
            'mensaje'   => 'Stock insuficiente para el producto ID: '.$det['id'],
            'timestamp' => now()->timestamp,
          ]);
        }
        //actualizo el stock
        $stock->update(['cantidad' => $stock->cantidad - $det['cantidad']]);

        //aviso si hay poco stock
        if($stock->cantidad <= $producto->stock_minimo){
          //Mail::to('rodrigoomarmiranda1@gmail.com')->send(new StockMinimoAlcanzadoMail($producto, $stock));
          Mail::to('rodrigoomarmiranda1@gmail.com')->queue(new StockMinimoAlcanzadoMail($producto, $stock));
        }
        
        //creo el detalle
        DetVenta::create([
          'venta_id'        => $venta->venta_id,
          'producto_id'     => $det['id'],
          'precio_unitario' => $producto->precio,
          'cantidad'        => $det['cantidad'],
          'descuento'       => 0,
          'subtotal'        => ($det['cantidad'] * $det['precio']) - 0, 
          'created_at'      => now(),
        ]);

        //registro el movimiento de stock
        MovimientoStock::create([
          'producto_id' => $det['id'],
          'proveedor_id' => null,
          'tipo_id'      => 2, //egreso
          'origen_id'    => 1, //venta
          'fecha'        => now(),
          'cantidad'     => $det['cantidad'],
          'created_at'      => now(),
        ]);
      }

      //registrar los métodos de pago
      $formasPagos = $validated['formasPagos'];
      foreach ($formasPagos as $fp) {
        VentaPago::create([
          'venta_id'            => $venta->venta_id,
          'forma_pago_id'       => $fp['forma_pago_id'],
          'fecha_pago'          => now() /*$fp['fecha']*/,
          'monto'               => $fp['monto'],
          'titular'             => $fp['titular']??'',
          'cbu_nro_comprobante' => $fp['cbu_nro_comprobante']??'',
          'estado_id'          => $fp['estado_id'] > 0 ? $fp['estado_id'] : null,
          'banco_billetera_id' => $fp['banco_billetera_id'] > 0 ? $fp['banco_billetera_id'] : null,
          'created_at'          => now(),
        ]);
      }

      //exito
      DB::commit();

      // al final del store, antes de enviar el mail
      $venta->load(['cliente', 'detalles.producto', 'pagos']);

      //mando mail al cliente
      //Mail::to($cliente->email)->send(new VentaRegistradaMail($venta));
      Mail::to($cliente->email)->queue(new VentaRegistradaMail($venta));

      //mando mail al dueño
      //Mail::to('rodrigoomarmiranda1@gmail.com')->send(new VentaRegistradaDuenioMail($venta));
      Mail::to('rodrigoomarmiranda1@gmail.com')->queue(new VentaRegistradaDuenioMail($venta));

      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'Venta grabado correctamente',
        'venta_id'  => $venta->venta_id,
        'timestamp' => now()->timestamp,
      ]);

    } catch (\Throwable $e) {
      DB::rollBack();
      /*return inertia('ventas/createView',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al grabar la venta: '.$e->getMessage(),
        'mode'      => 'create',
        'timestamp' => now()->timestamp,
      ]);*/
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al grabar la venta: '.$e->getMessage(),
        'mode'      => 'create',
        'timestamp' => now()->timestamp,
      ]);
    }
  }

  public function update(Request $request, Venta $venta)
  {
    /*$validated = $request->validate([
      'cliente_id' => 'required|exists:clientes,cliente_id',
      'fecha_grabacion' => 'required|date',
      'total' => 'required|numeric|min:0',
    ]);

    $venta->update($validated);
    return $venta;*/
  }

  public function view(Venta $venta){
    //obtengo los detalles
    $detalles = DetVenta::query()
        ->with('producto')
        ->where('venta_id', $venta->venta_id)
        ->get()
        ->map(function($dv){
          return [
            'id'       => (int)$dv->producto_id,
            'nombre'   => optional($dv->producto)->nombre,
            'precio'   => (float)$dv->precio_unitario,
            'cantidad' => (int)$dv->cantidad
          ];
        });

    //obtengo los datos del cliente
    $cliente = Cliente::find($venta->cliente_id);

    //obtengo las formas de pago de la venta
    $formasPagos = VentaPago::query()
    ->with('formaPago', 'bancoBilletera', 'estadoOperacion')
    ->where('venta_id', $venta->venta_id)
    ->get()
    ->map(function($fp){
      return [
        'id'                     => $fp->venta_pago_id,
        'forma_pago_id'          => (int)$fp->forma_pago_id,
        'forma_pago_nombre'      => optional($fp->formaPago)->nombre,
        'monto'                  => (float)$fp->monto,
        'fecha'                  => $fp->fecha_pago,
        'titular'                => $fp->titular??'',
        'banco_billetera_id'     => $fp->banco_billetera_id,
        'banco_billetera_nombre' => optional($fp->bancoBilletera)->nombre,
        'estado_id'              => $fp->estado_id,
        'estado_nombre'          => optional($fp->estadoOperacion)->descripcion,
        'cbu_nro_comprobante'    => $fp->cbu_nro_comprobante,
      ];
    });

    //preparo ventaAux sobre todo por las fechas que recibe el front
    $ventaAux = [
      'venta_id'        => $venta->venta_id,
      'fecha_grabacion' => $venta->fecha_grabacion->format('Y-m-d'),
      'fecha_anulacion' => $venta->fecha_anulacion?->format('Y-m-d'),
      'cliente_id'      => $venta->cliente_id,
      'total'           => $venta->total,
      'anulada'         => $venta->anulada,
    ];

    //devuelvo
    return inertia('ventas/createView',[
      'mode' => 'view',
      'venta' => $ventaAux,
      'detalles' => $detalles, 
      'cliente'  => $cliente, 
      'formasPago' => $formasPagos
    ]);
  }

  public function destroy(Venta $venta, Request $request)
  {
    DB::beginTransaction();
    try {
      $venta->load(['cliente']);

      // Marcar la venta como anulada
      $venta->update([
        'anulada'         => true,
        'fecha_anulacion' => now(),
        'user_anulacion' => auth()->user()->email,
      ]);

      // Registrar motivo de anulación
      VentaAnulada::create([
        'venta_id'        => $venta->venta_id,
        'fecha_anulacion' => now(),
        'motivo'          => $request->motivo
      ]);

      // Revertir el stock de cada producto vendido
      $detalles = DetVenta::where('venta_id', $venta->venta_id)->get();
      foreach ($detalles as $det) {
        $stock = Stock::where('producto_id', $det->producto_id)->first();
        if ($stock) {
          $stock->update([
            'cantidad' => $stock->cantidad + $det->cantidad
          ]);
        }

        // Registrar movimiento de stock por anulación
        MovimientoStock::create([
          'producto_id'  => $det->producto_id,
          'proveedor_id' => null,
          'tipo_id'      => 4, // anulación
          'origen_id'    => 4, // origen: anulación
          'fecha'        => now(),
          'cantidad'     => $det->cantidad
        ]);
      }

      DB::commit();
      /*return inertia('ventas/createView', [
        'resultado' => 1,
        'mensaje'   => 'La venta se anuló correctamente y el stock fue revertido.',
        'timestamp' => now()->timestamp
      ]);*/

      //mando mail al cliente
      //Mail::to($venta->cliente->email)->send(new VentaAnuladaMail($venta));
      Mail::to($venta->cliente->email)->queue(new VentaAnuladaMail($venta));

      //mando mail al dueño
      //Mail::to('rodrigoomarmiranda1@gmail.com')->send(new VentaAnuladaMail($venta));
      Mail::to('rodrigoomarmiranda1@gmail.com')->queue(new VentaAnuladaMail($venta));

      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'La venta '.$venta->venta_id.',se anuló correctamente y el stock fue revertido.',
        'venta_id'  => $venta->venta_id,
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Error al anular la venta: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
      /*return inertia('ventas/createView', [
        'resultado' => 0,
        'mensaje'   => 'Error al anular la venta: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);*/
    }
  }
  
  public function editarFp(Venta $venta, Request $request)
  {
    DB::beginTransaction();
    try {
      $validated = $request->validate([
          'id'                 => 'required|integer|exists:ventas_pagos,venta_pago_id',
          'banco_billetera_id' => 'nullable|integer',
          'estado_id'          => 'nullable|integer',
          'titular'            => 'nullable|string|max:255',
          'cbu_nro_comprobante'=> 'nullable|string|max:255',
      ]);

      $ventaPago = VentaPago::where('venta_pago_id', $request->id)->first();

      $ventaPago->update([
        'banco_billetera_id'  => $validated['banco_billetera_id'] > 0 ? $validated['banco_billetera_id'] : null,
        'estado_id'           => $validated['estado_id'] > 0 ? $validated['estado_id'] : null,
        'titular'             => $validated['titular'] ?? '',
        'cbu_nro_comprobante' => $validated['cbu_nro_comprobante'] ?? '',
      ]);

      DB::commit();
      

      return response()->json([
        'resultado' => 1,
        'mensaje'   => 'Forma de pago modificada correctamente',
        'timestamp' => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Error al cambiar los datos de la forma de pago de la venta: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function getAnios(){
    $anios = DB::table('ventas')
      ->selectRaw('YEAR(fecha_grabacion) as anio')
      ->distinct()
      ->orderBy('anio')
      ->get()
      ->map(function ($row, $index) {
          return [
              'id' => $index + 1,
              'anio' => $row->anio,
          ];
      });
    return response()->json($anios);
  }
  public function getDatos(Request $request)
  {
      $tipo = $request->input('tipo');
      $anio = $request->input('anio');
      $mes  = $request->input('mes');
      $dia  = $request->input('dia');

      $arr = [];
      $totalFinal    = 0;
      $cantidadFinal = 0;

      if ($tipo == 1) {
          // Por día → ventas por hora
          $ventas = DB::table('ventas')
              ->selectRaw('HOUR(fecha_grabacion) as hora, COUNT(*) as cantidad, SUM(total) as ganancia')
              ->where('anulada', 0)
              ->whereDate('fecha_grabacion', $dia)
              ->groupBy(DB::raw('HOUR(fecha_grabacion)'))
              ->orderBy('hora')
              ->get();

          foreach ($ventas as $v) {
            $arr[] = [
                'name'     => str_pad($v->hora, 2, '0', STR_PAD_LEFT).":00",
                'cantidad' => $v->cantidad,
                'total'    => $v->ganancia
            ];
            $totalFinal += $v->ganancia;
            $cantidadFinal += $v->cantidad;
          }
      }

      if ($tipo == 2) {
          // Por mes → ventas por día del mes
          $ventas = DB::table('ventas')
              ->selectRaw('DAY(fecha_grabacion) as dia, COUNT(*) as cantidad, SUM(total) as ganancia')
              ->where('anulada', 0)
              ->whereYear('fecha_grabacion', $anio)
              ->whereMonth('fecha_grabacion', $mes)
              ->groupBy(DB::raw('DAY(fecha_grabacion)'))
              ->orderBy('dia')
              ->get();

          foreach ($ventas as $v) {
            $arr[] = [
                'name'     => $v->dia, // número del día
                'cantidad' => $v->cantidad,
                'total'    => $v->ganancia,
            ];
            $totalFinal += $v->ganancia;
            $cantidadFinal += $v->cantidad;
          }
      }

      if ($tipo == 3) {
        // Por año → ventas por mes
        $ventas = DB::table('ventas')
            ->selectRaw('MONTH(fecha_grabacion) as mes, COUNT(*) as cantidad, SUM(total) as ganancia')
            ->where('anulada', 0)
            ->whereYear('fecha_grabacion', $anio)
            ->groupBy(DB::raw('MONTH(fecha_grabacion)'))
            ->orderBy('mes')
            ->get();

        $nombresMeses = [
            1=>'Enero',2=>'Febrero',3=>'Marzo',4=>'Abril',5=>'Mayo',6=>'Junio',
            7=>'Julio',8=>'Agosto',9=>'Septiembre',10=>'Octubre',11=>'Noviembre',12=>'Diciembre'
        ];

        foreach ($ventas as $v) {
          $arr[] = [
            'name'     => $nombresMeses[$v->mes],
            'cantidad' => $v->cantidad,
            'total'    => $v->ganancia,
          ];
          $totalFinal += $v->ganancia;
          $cantidadFinal += $v->cantidad;
        }
      }

      $obj = [
        'arr'            => $arr,
        'total_final'    => $totalFinal,
        'cantidad_final' => $cantidadFinal,
      ];
      return response()->json($obj);
  }
  
  public function getDatosProd(Request $request)
  {
    $tipo = $request->input('tipo');
    $anio = $request->input('anio');
    $mes  = $request->input('mes');
    $dia  = $request->input('dia');

    $arr = [];
    $totalFinal    = 0;
    $cantidadFinal = 0;

    $query = DB::table('det_ventas as dv')
        ->join('ventas as v', 'dv.venta_id', '=', 'v.venta_id')
        ->join('productos as p', 'dv.producto_id', '=', 'p.producto_id')
        ->selectRaw('p.nombre as producto, SUM(dv.cantidad) as cantidad, SUM(dv.subtotal) as total')
        ->where('v.anulada', 0);

    // filtros según tipo
    if ($tipo == 1) {
        $query->whereDate('v.fecha_grabacion', $dia);
    }
    if ($tipo == 2) {
        $query->whereYear('v.fecha_grabacion', $anio)
              ->whereMonth('v.fecha_grabacion', $mes);
    }
    if ($tipo == 3) {
        $query->whereYear('v.fecha_grabacion', $anio);
    }

    $ventas = $query
        ->groupBy('p.nombre')
        ->orderByDesc('cantidad') // ranking por cantidad vendida
        ->get();

    foreach ($ventas as $v) {
        $arr[] = [
            'name'     => $v->producto,
            'cantidad' => $v->cantidad,
            'total'    => $v->total,
        ];
        $totalFinal += $v->total;
        $cantidadFinal += $v->cantidad;
    }

    $obj = [
        'arr'            => $arr,
        'total_final'    => $totalFinal,
        'cantidad_final' => $cantidadFinal,
    ];
    return response()->json($obj);
  }

}
