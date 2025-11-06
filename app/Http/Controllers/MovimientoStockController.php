<?php

namespace App\Http\Controllers;

use App\Models\MovimientoStock;
use App\Models\TipoMovimiento;
use App\Models\OrigenMovimiento;
use App\Models\Producto;

use Illuminate\Http\Request;

use App\Http\Requests\StoreMovimientoStockRequest;
use App\Http\Requests\UpdateMovimientoStockRequest;

use Barryvdh\DomPDF\Facade\Pdf;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MovimientoStockController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('movimientosStock/index',[
        'movimientos' => []
      ]);
    }
    $query = MovimientoStock::query();
    if($request->filled('movimiento_id')){
      $query->where('movimiento_id',$request->movimiento_id);
    }
    if($request->filled('producto_id')){
      $query->where('producto_id',$request->producto_id);
    }
    if($request->filled('tipo_id')){
      $query->where('tipo_id',$request->tipo_id);
    }
    if($request->filled('origen_id')){
      $query->where('origen_id',$request->origen_id);
    }
    if ($request->filled('fecha_inicio') || $request->filled('fecha_fin')) {
      $inicio = $request->fecha_inicio ?? now()->toDateString();
      $fin    = $request->fecha_fin    ?? now()->toDateString();
      $query->whereBetween('fecha', [$inicio, $fin]);
    }

    $movimientos = $query->with(['producto', 'tipoMovimiento', 'origenMovimiento'])->latest()
                   ->get()->map(function($m){
                    return [
                      'movimiento_id'   => $m->movimiento_id,
                      'producto_id'     => $m->producto_id,
                      'producto_nombre' => optional($m->producto)->nombre,
                      'tipo_id'         => $m->tipo_id,
                      'tipo_nombre'     => optional($m->tipoMovimiento)->nombre,
                      'origen_id'       => $m->origen_id,
                      'origen_nombre'   => optional($m->origenMovimiento)->nombre,
                      'fecha'           => $m->fecha,
                      'cantidad'        => $m->cantidad,
                    ];
                  });
    return inertia('movimientosStock/index',[
      'movimientos' => $movimientos
    ]);
  }

  public function generarPDF(Request $request){
    $query = MovimientoStock::query()->with(['producto', 'tipoMovimiento', 'origenMovimiento']);
    if($request->filled('movimiento_id')){
      $query->where('movimiento_id',$request->movimiento_id);
    }
    if($request->filled('producto_id')){
      $query->where('producto_id',$request->producto_id);
    }
    if($request->filled('tipo_id')){
      $query->where('tipo_id',$request->tipo_id);
    }
    if($request->filled('origen_id')){
      $query->where('origen_id',$request->origen_id);
    }
    if ($request->filled('fecha_inicio') || $request->filled('fecha_fin')) {
      $inicio = $request->fecha_inicio ?? now()->toDateString();
      $fin    = $request->fecha_fin    ?? now()->toDateString();
      $query->whereBetween('fecha', [$inicio, $fin]);
    }

    $movs = $query->get()->map(function ($m) {
      return (object)[
        'movimiento_id'   => $m->movimiento_id,
        'producto_nombre' => optional($m->producto)->nombre,
        'tipo_nombre'     => optional($m->tipoMovimiento)->nombre,
        'origen_nombre'   => optional($m->origenMovimiento)->nombre,
        'cantidad'        => $m->cantidad,
        'fecha'           => $m->fecha,
      ];
    });

    $pdf = Pdf::loadView('pdf.movStock', compact('movs'));
    return $pdf->download('movimientos_stock.pdf');
  }

  public function exportarExcelManual(Request $request){
    
    $movs = MovimientoStock::query()->with(['producto', 'tipoMovimiento', 'origenMovimiento'])->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Encabezados
    $sheet->setCellValue('A1', 'Mov. ID');
    $sheet->setCellValue('B1', 'Fecha');
    $sheet->setCellValue('C1', 'Producto');
    $sheet->setCellValue('D1', 'Tipo');
    $sheet->setCellValue('E1', 'Origen');
    $sheet->setCellValue('F1', 'Cantidad');

    // Filas
    foreach ($movs as $i => $m) {
      $row = $i + 2;
      /*$categorias = $p->categorias->pluck('nombre')->implode(', ');
      $listas = $p->productosLista->map(fn($l) =>
        ($l->listaPrecio->nombre ?? 'Sin nombre') . ' ($' . $l->precio_lista . ')'
      )->implode(', ');*/

      $sheet->setCellValue("A{$row}", $m->movimiento_id);
      $sheet->setCellValue("B{$row}", \Carbon\Carbon::parse($m->fecha)->format('d/m/Y'));
      $sheet->setCellValue("C{$row}", optional($m->producto)->nombre);
      $sheet->setCellValue("D{$row}", optional($m->tipoMovimiento)->nombre);
      $sheet->setCellValue("E{$row}", optional($m->origenMovimiento)->nombre);
      $sheet->setCellValue("F{$row}", $m->cantidad);
    }

    //controla la redimension del ancho
    foreach (range('A', 'F') as $col) {
      $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    //marca el encabezado
    $sheet->getStyle('A1:F1')->getFont()->setBold(true);

    // Guardar en archivo temporal
    $writer = new Xlsx($spreadsheet);
    $filename = 'movimiento_stock.xlsx';
    $tempFile = tempnam(sys_get_temp_dir(), $filename);
    $writer->save($tempFile);

    return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
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
  public function store(StoreMovimientoStockRequest $request)
  {
      //
  }

  /**
   * Display the specified resource.
   */
  public function show(MovimientoStock $movimientoStock)
  {
      //
  }

  /**
   * Show the form for editing the specified resource.
   */
  public function edit(MovimientoStock $movimientoStock)
  {
      //
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(UpdateMovimientoStockRequest $request, MovimientoStock $movimientoStock)
  {
      //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(MovimientoStock $movimientoStock)
  {
      //
  }
}
