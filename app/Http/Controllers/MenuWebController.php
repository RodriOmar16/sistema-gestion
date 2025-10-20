<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MenuWeb;
use App\Models\Ruta;

class MenuWebController extends Controller
{
    public function menuPorUsuario(Request $request)
    {
        $usuario = $request->user();

        $menu = MenuWeb::with(['roles', 'ruta']) // si definís la relación
            ->where('inhabilitado', false)
            ->whereHas('roles', function ($q) use ($usuario) {
                $q->whereIn('roles.rol_id', $usuario->roles->pluck('rol_id'));
            })
            ->orderBy('orden')
            ->get();


       return response()->json($menu->map(function ($item) {
            $item->ruta_url = $item->ruta?->url ?? null;
            return $item;
        }));

    }

    public function index()
    {
        return MenuWeb::with(['roles', 'ruta'])->where('inhabilitado', false)->get();
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
