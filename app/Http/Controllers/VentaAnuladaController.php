<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VentaAnulada;

class VentaAnuladaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'venta_id' => 'required|exists:ventas,venta_id',
            'fecha_anulacion' => 'required|date',
            'motivo' => 'required|string',
        ]);

        return VentaAnulada::create($validated);
    }
}
