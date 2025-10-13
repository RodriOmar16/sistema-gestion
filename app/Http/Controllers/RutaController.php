<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ruta;

class RutaController extends Controller
{
    public function index()
    {
        return Ruta::where('inhabilitada', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:255|unique:rutas,url',
        ]);

        return Ruta::create($validated);
    }

    public function update(Request $request, Ruta $ruta)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:255|unique:rutas,url,' . $ruta->ruta_id . ',ruta_id',
        ]);

        $ruta->update($validated);
        return $ruta;
    }

    public function destroy(Ruta $ruta)
    {
        $ruta->update(['inhabilitada' => true]);
    }
}
