<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Rol;
use App\Models\MenuRol;
use App\Models\RutaRol;

class RolController extends Controller
{
  public function menusYRutas($rol_id){
    $rol = Rol::with(['menus', 'rutas'])->findOrFail($rol_id);
    $menus = $rol->menus
      ->where('inhabilitado', false)
      ->map(function($menu){
      return [
        'id'     => $menu->menu_id,
        'nombre' => $menu->nombre
      ];
    });
    $rutas = $rol->rutas
      ->where('inhabilitada', false)
      ->map(function($ruta){
      return [
        'id'     => $ruta->ruta_id,
        'nombre' => $ruta->url
      ];
    });
    return response()->json([
      'menus_asignados' => $menus->values()->all(),
      'rutas_asignadas' => $rutas->values()->all(),
    ]);

  }
  public function rolesHabilitados(){
    $roles = Rol::where('inhabilitado', false)->get()->map(function($rol){
      return [
        'id'     => $rol->rol_id,
        'nombre' => $rol->nombre
      ];
    });
    return response()->json($roles);
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
    DB::beginTransaction();
    try {
      // Validación básica
      $validated = $request->validate([
        'nombre' => 'required|string|max:255',
        'inhabilitado' => 'boolean',
        'menus' => 'required|array|min:1',
        'rutas' => 'required|array|min:1',
      ]);
      //verifico que el rol no exista ya 
      $name = strtolower(trim($validated['nombre']));
      $existe = Rol::whereRaw('LOWER(TRIM(nombre)) = ?', [$name])->exists();
      if($existe){
        return inertia('roles/index', [
          'resultado' => 0,
          'mensaje' => 'Ya existe un rol con ese nombre.',
        ]);
      }
      // Crear el rol
      $rol = Rol::create([
        'nombre' => $validated['nombre'],
        'inhabilitado' => $validated['inhabilitado'] ? 1 : 0,
      ]);

      $rol_id = $rol->rol_id;
      // Extraer IDs de menús y rutas
      $menuIds = collect($request->input('menus'))->pluck('id')->unique()->toArray();
      $rutaIds = collect($request->input('rutas'))->pluck('id')->unique()->toArray();

      foreach($menuIds as $menu_id){
        MenuRol::firstOrCreate([
          'rol_id'  => $rol_id, 
          'menu_id' => $menu_id
        ]);
      }
      foreach($rutaIds as $ruta_id){
        RutaRol::firstOrCreate([
          'rol_id'  => $rol_id, 
          'ruta_id' => $ruta_id
        ]);
      }

      DB::commit();
      return inertia('roles/index', [
					'resultado' => 1,
					'mensaje'   => 'Rol creada correctamente',
					'rol_id'    => $rol->rol_id
				]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return inertia('roles/index', [
        'resultado' => 0,
        'mensaje' => 'Error inesperado: ' . $e->getMessage(),
      ]);
    }
  }

    public function update(Request $request, Rol $rol)
    {
      //inicio la transaccion con posibles commit o rollback
      DB::beginTransaction();
      try {
        //valido que no haya repetidos
        $validated = $request->validate([
          'nombre' => 'required|string|max:255',
          'inhabilitado' => 'boolean',
          'menus' => 'required|array|min:1',
          'rutas' => 'required|array|min:1'
        ]);

        $nombreRol = strtolower(trim($validated['nombre']));
        $existe = Rol::whereRaw('LOWER(TRIM(nombre)) = ?',[$nombreRol])
                    ->where('rol_id', '!=', $rol->rol_id)
                    ->exists();
        if($existe){
          return inertia('roles/index',[
            'resultado' => 0,
            'mensaje'   => 'Ya existe un rol con ese nombre.',
          ]);
        }
        //actualizo los valores del rol
        $rol->update([
          'nombre'       => $validated['nombre'],
          'inhabilitado' => $validated['inhabilitado'] ? 1 : 0
        ]);
        //procedo a actualizar los datos de tablas intermedias
        $menuIds = collect($request->menus)->pluck('id')->unique()->toArray();
        $rutaIds = collect($request->rutas)->pluck('id')->unique()->toArray();
        $rol->menus()->sync($menuIds);
        $rol->rutas()->sync($rutaIds);

        //exito
        DB::commit();
        return inertia('roles/index',[
          'resultado' => 1,
          'mensaje'   => 'El rol fue editado existosamente ',
          'rol_id'    => $rol->rol_id
        ]);
      } catch (\Throwable $e) {
        DB::rollback();
        return inertia('roles/index',[
          'resultado' => 0,
          'mensaje'   => 'Error inerperado: '.e->getMessage()
        ]);
      }
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
