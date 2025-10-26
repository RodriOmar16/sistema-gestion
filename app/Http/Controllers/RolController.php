<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;

class RolController extends Controller
{
  public function menusYRutas($rol_id){
    $rol = Rol::with(['menus', 'rutas'])->findOrFail($rol_id);
    $menus = $rol->menus->map(function($menu){
      return [
        'id'     => $menu->menu_id,
        'nombre' => $menu->nombre
      ];
    });
    $rutas = $rol->rutas->map(function($ruta){
      return [
        'id'     => $ruta->ruta_id,
        'nombre' => $ruta->url
      ];
    });
    return response()->json([
      'menus_asignados' => $menus,
      'rutas_asignadas' => $rutas,
    ]);
  }
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('roles/index',[
        'roles'    => [],
        'filters'  => []
      ]);
    }

    $query = Rol::query();

    if($request->filled('rol_id')){
      $query->where('rol_id',$request->rol_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre','like', '%'.$request->nombre.'%');
    }
    if ($request->filled('inhabilitado')) {
      $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitado', $estado);
    }

    //si no se agregaron filtros, trae todos
    if(!$request->filled('rol_id') && !$request->filled('nombre') && !$request->filled('inhabilitado')){
      $query = Rol::query();
    }

      $roles = $query->latest()->get();

    return inertia('roles/index', [
      'roles' => $roles,
      'filters'  => $request->only(['id','nombre', 'inhabilitado']),
      'resultado' => session('resultado'),
      'mensaje' => session('mensaje'),
      'error' => session('error'),
    ]);
    //return Rol::where('inhabilitado', false)->get();
  }

    public function store(Request $request)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        return Rol::create($validated);
    }

    public function update(Request $request, Rol $rol)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        $rol->update($validated);
        return $rol;
    }

    public function toggleEstado(Rol $rol)
		{
			//--
			$rol->update([
				'inhabilitado' => !$rol->inhabilitado,
			]);
			return inertia('roles/index',[
					'rol_id' => $rol->rol_id,
					'resultado'  => 1,
					'mensaje'		 => 'Estado actualizado correctamente.'
				]);
		}

    public function destroy(Rol $rol)
    {
      //$rol->update(['inhabilitado' => true]);
    }
}
