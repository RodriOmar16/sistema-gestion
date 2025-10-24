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

        $menu = MenuWeb::with(['roles', 'ruta'])
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

    public function index(Request $request)
    {   
        \Log::info('Filtros recibidos:', $request->all());

        $query = MenuWeb::query();

        if($request->has('menu_id') && !$request->filled('menu_id')){
            $query->where('menu_id', $request->menu_id);
        }

        if($request->has('nombre') && $request->filled('nombre')){
            $query->where('nombre', $request->nombre);
        }

        /*if(){

        }*/
        /*if ($request->has('menu_id') && $request->filled('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }*/
        /*if ($request->has('nombre') && $request->nombre !== '') {
            $query->where('nombre', 'like', '%' . $request->nombre . '%');
        }
        if ($request->has('padre')) {
            if ((int)$request->padre === 0) {
                $query->whereNull('padre');
            } else {
                $query->where('padre', $request->padre);
            }
        }
        if ($request->has('icono') && $request->icono !== '') {
            $query->where('icono', 'like', '%' . $request->icono . '%');
        }
        if ($request->has('inhabilitado')) {
            $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($estado !== null) {
                $query->where('inhabilitado', $estado);
            }
        }*/

        //$menus = $query->latest()->paginate(10)->withQueryString();
        $menus = $query->latest()->get();

        return inertia('menu/index', [
            'menus' => $menus,
            //'filters' => $request->only(['menu_id','nombre','padre','orden','inhabilitado','icono']),
        ]);
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
