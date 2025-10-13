<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VentaPago;

class VentaPagoController extends Controller
{
     public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,venta_id',
            'forma_pago_id' => 'required|exists:formas_pago,forma_pago_id',
            'fecha_pago' => 'required|date',
            'monto' => 'required|numeric|min:0',
        ]);

        return VentaPago::create($validated);
    }
}
