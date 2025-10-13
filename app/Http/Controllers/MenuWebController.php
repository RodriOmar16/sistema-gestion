<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuWeb;

class MenuWebController extends Controller
{
    public function index()
    {
        return MenuWeb::with(['roles', 'rutas'])->where('inhabilitado', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'padre' => 'nullable|integer|exists:menu_web,menu_id',
            'orden' => 'required|integer',
            'icono' => 'nullable|string',
        ]);

        return MenuWeb::create($validated);
    }

    public function update(Request $request, MenuWeb $menuWeb)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'padre' => 'nullable|integer|exists:menu_web,menu_id',
            'orden' => 'required|integer',
            'icono' => 'nullable|string',
        ]);

        $menuWeb->update($validated);
        return $menuWeb;
    }

    public function destroy(MenuWeb $menuWeb)
    {
        $menuWeb->update(['inhabilitado' => true]);
    }
}
