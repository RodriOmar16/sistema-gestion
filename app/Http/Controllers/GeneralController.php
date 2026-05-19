<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

use App\Models\Venta;
use App\Models\Gasto;

class GeneralController extends Controller
{
  public function getDatos(){
    //información de la tabla de ultimas ventas
    $ventas = Venta::query()
                      ->with(['cliente'])
                      ->limit(10)
                      ->latest()
                      ->get()
                      ->map(function($v){
      return [
        'fecha_grabacion' => $v->fecha_grabacion,
        'cliente_nombre'  => optional($v->cliente)->nombre,
        'total'           => $v->total,
        'anulada'         => $v->anulada,
      ];
    });
    //información de la tabla de ultimos gastos
    $gastos = Gasto::query()
                      ->latest()
                      ->limit(10)
                      ->get()
                      ->map(function ($g) {
      return [
        'fecha'                  => $g->fecha,
        'categoria_gasto_nombre' => optional($g->categoria)->nombre??'',
        'forma_pago_nombre'      => optional($g->formaPago)->nombre,
        'monto'                  => $g->monto,
        'inhabilitado'           => $g->inhabilitado,
      ];
    });

    //info de indicadores
    $fechaFin    = Carbon::now();              // hoy
    $fechaInicio = Carbon::now()->subMonth();  // hace un mes

    // Ventas
    $indicadorVenta = Venta::query()
        ->whereBetween('fecha_grabacion', [$fechaInicio, $fechaFin])
        ->selectRaw('SUM(total) as total, COUNT(*) as cantidad')
        ->first();

    // Gastos
    $indicadorGastos = Gasto::query()
        ->whereBetween('fecha', [$fechaInicio, $fechaFin])
        ->selectRaw('SUM(monto) as total, COUNT(*) as cantidad')
        ->first();

    return response()->json([
      'ventas' => $ventas,
      'gastos' => $gastos,
      'indicador_ventas' => [
        'total'    => (float)($indicadorVenta->total ?? 0),
        'cantidad' => (int)($indicadorVenta->cantidad ?? 0),
      ],
      'indicador_gastos' => [
        'total'    => (float)($indicadorGastos->total ?? 0),
        'cantidad' => (int)($indicadorGastos->cantidad ?? 0),
      ],
      'balance' => (float)($indicadorVenta->total ?? 0) - (float)($indicadorGastos->total ?? 0),
    ]);
  }
}
