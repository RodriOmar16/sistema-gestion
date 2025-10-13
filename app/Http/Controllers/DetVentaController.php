<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DetVenta;

class DetVentaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,venta_id',
            'producto_id' => 'required|exists:productos,producto_id',
            'cantidad' => 'required|integer|min:1',
            'descuento' => 'nullable|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
        ]);

        return DetVenta::create($validated);
    }
}
