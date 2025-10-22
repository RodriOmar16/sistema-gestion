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
        if(!$request->hasAny(['id','nombre', 'padre', 'orden', 'inhabilitado', 'icono'])){
            return inertia('menu/index',[
                'menus'   => ['data' => []],
                'filters' => []
            ]);
        }
        $query = MenuWeb::query();

        if($request->filled('id')){
            $query->where('id',$request->id);
        }
        if($request->filled('nombre')){
            $query->where('nombre','like','%'.$request->nombre.'%');
        }
        if($request->filled('padre')){
            $query->where('padre',$request->padre);
        }
        if($request->filled('orden')){
            $query->where('orden',$request->orden);
        }
        if($request->filled('icono')){
            $query->where('icono','like','%'.$request->icono.'%');
        }
        if($request->filled('inhabilitado')){
            $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
            $query->where('inhabilitado',$estado);
        }

        if(!$request->filled('id') && !$request->filled('nombre') && !$request->filled('padre') &&
           !$request->filled('orden') && !$request->filled('icono') && !$request->filled('inhabilitado')){
            $query = MenuWeb::query();
        }

        $menus = $query->latest()->paginate(10)->winthQueryString();

        return inertia('menu/index',[
            'menus' => $menus, 
            'filters' => $request->only(['id','nombre', 'padre', 'orden', 'inhabilitado', 'icono'])
        ]);
        //return MenuWeb::with(['roles', 'ruta'])->where('inhabilitado', false)->get();

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
