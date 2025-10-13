<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FormaPago;

class FormaPagoController extends Controller
{
   public function index()
    {
        return FormaPago::where('inhabilitada', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        return FormaPago::create($validated);
    }

    public function update(Request $request, FormaPago $formaPago)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $formaPago->update($validated);
        return $formaPago;
    }

    public function destroy(FormaPago $formaPago)
    {
        $formaPago->update(['inhabilitada' => true]);
    }
}
