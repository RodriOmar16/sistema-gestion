<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RutaRol;

class RutaRolController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruta_id' => 'required|exists:rutas,ruta_id',
            'rol_id' => 'required|exists:roles,rol_id',
        ]);

        return RutaRol::create($validated);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'ruta_id' => 'required|exists:rutas,ruta_id',
            'rol_id' => 'required|exists:roles,rol_id',
        ]);

        RutaRol::where($validated)->delete();
        return response()->json(['message' => 'Relación eliminada']);
    }
}

