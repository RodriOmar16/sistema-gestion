<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuRuta;

class MenuRutaController extends Controller
{
   public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menu_web,menu_id',
            'ruta_id' => 'required|exists:rutas,ruta_id',
        ]);

        return MenuRuta::create($validated);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menu_web,menu_id',
            'ruta_id' => 'required|exists:rutas,ruta_id',
        ]);

        MenuRuta::where($validated)->delete();
        return response()->json(['message' => 'Relación eliminada']);
    }
}
