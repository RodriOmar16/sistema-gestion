<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Stock;
use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateStockRequest;

class StockController extends Controller
{
    public function index(Request $request)
    {
      if(!$request->has('buscar')){
        return inertia('stock/index',[
          'stock' => []
        ]);
      }

      $query = Stock::query();
      if($request->filled('stock_id')){
        $query->where('stock_id', $request->stock_id);
      }
      if($request->filled('producto_id')){
        $query->where('producto_id', $request->producto_id);
      }
      if($request->filled('cantidad')){
        $query->where('cantidad', $request->cantidad);
      }

      if(!$request->filled('stock_id') && !$request->filled('producto_id') && !$request->filled('cantidad')){
        $query = Stock::query();
      }

      $stock = $query->latest()->get();

      return inertia('stock/index',[
        'stock' => $stock,
      ]);
    }

    public function store(StoreStockRequest $request)
    {
      DB::beginTransaction();
      try {
        //valido el request (el array de productos no puede venir vacio)
        //controlo que cada producto del array tenga cantidad mayor a cero
        //si no existe en la tabla creo o inserto
        //si ya existe, entonces acumulo a la cantidad que diga (desde ventas esa cantidad disminuirá y todo se registra en Mov. Stock)
        //commit
        
      } catch (\Throwable $e) {
        DB::rollback();
        return inertia('stock/index',[
          'resultado' => 0,
          'mensaje'   => 'Ocurrió un error al intentar registrar el stock: '.$e->getMessage()
        ]);
      }
    }

    public function update(UpdateStockRequest $request, Stock $stock)
    {
        //
    }

    public function show(Stock $stock)
    {
      //
    }

    public function edit(Stock $stock)
    {
      //
    }

    public function create()
    {
      //
    }

    public function destroy(Stock $stock)
    {
        //
    }
}
