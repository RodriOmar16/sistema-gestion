<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuRol;

class MenuRolController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menu_web,menu_id',
            'rol_id' => 'required|exists:roles,rol_id',
        ]);

        return MenuRol::create($validated);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menu_web,menu_id',
            'rol_id' => 'required|exists:roles,rol_id',
        ]);

        MenuRol::where($validated)->delete();
        return response()->json(['message' => 'Relación eliminada']);
    }
}
