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

    public function padresHabilitados()
    {
        $padres = MenuWeb::whereNull('padre')
            ->where(function ($q) {
                $q->where('inhabilitado', false)->orWhereNull('inhabilitado');
            })
            ->orderBy('orden')
            ->get();

        $padres->push((object)[
            'menu_id' => 0,
            'nombre' => 'Sin padres',
            'padre'  => null,
            'orden' => 10000,
        ]);
        return response()->json($padres);
    }

    public function index(Request $request)
    {   
        //\Log::info('Filtros recibidos:', $request->all());

        $query = MenuWeb::query();

        if($request->menu_id !== null && $request->menu_id !== ''){
            $query->where('menu_id', $request->menu_id);
        }
        if($request->nombre !== '' && $request->nombre !== ''){
            $query->where('nombre', 'like', '%' . $request->nombre . '%');
        }
        if ($request->padre !== '' && $request->padre !== null && (int)$request->padre !== 0) {
            $query->where('padre', $request->padre);
        }
        if ($request->has('icono') && $request->icono !== '') {
            $query->where('icono', 'like', '%' . $request->icono . '%');
        }
        if ($request->inhabilitado !== null && $request->inhabilitado !== '') {
            $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($estado === false) {
                $query->where('inhabilitado', false);
            } elseif ($estado === true) {
                $query->where('inhabilitado', true);
            }
        }
        
        $menus = $query->with('padreMenu')->latest()->get()->map(function ($menu) {
            return [
                'menu_id' => $menu->menu_id,
                'nombre' => $menu->nombre,
                'padre_id' => $menu->padre,
                'padre' => $menu->padreMenu ? $menu->padreMenu->nombre : null,
                'orden' => $menu->orden,
                'icono' => $menu->icono,
                'inhabilitado' => $menu->inhabilitado,
                'created_at' => $menu->created_at,
                'updated_at' => $menu->updated_at,
                'ruta_id' => $menu->ruta_id,
            ];
        });

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
