<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\Producto;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class GraficosController extends Controller
{
    public function index(){
      /*$ventasPorMes = Venta::selectRaw('MONTH(fecha) as mes, SUM(total) as total')
        ->groupBy('mes')
        ->orderBy('mes')
        ->get();

      $productosMasVendidos = Producto::withCount('ventas')
        ->orderByDesc('ventas_count')
        ->take(5)
        ->get();

      return view('graficos.index', compact('ventasPorMes', 'productosMasVendidos'));*/
      return inertia('dashboard');
    }
}
