<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Venta;

class VentaController extends Controller
{
    public function index()
    {
        return Venta::with(['cliente', 'detalles', 'pagos', 'anulacion'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,cliente_id',
            'fecha_grabacion' => 'required|date',
            'total' => 'required|numeric|min:0',
        ]);

        return Venta::create($validated);
    }

    public function update(Request $request, Venta $venta)
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,cliente_id',
            'fecha_grabacion' => 'required|date',
            'total' => 'required|numeric|min:0',
        ]);

        $venta->update($validated);
        return $venta;
    }

    public function destroy(Venta $venta)
    {
        $venta->update(['anulada' => true, 'fecha_anulacion' => now()]);
    }
}
