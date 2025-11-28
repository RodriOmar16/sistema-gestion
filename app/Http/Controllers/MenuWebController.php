<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        ->get()
        ->unique('menu_id');

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

    public function menusHabilitados(){
      $menus = MenuWeb::where('inhabilitado', false)->get()->map(function($menu){
        return [
          'id'     => $menu->menu_id,
          'nombre' => $menu->nombre
        ];
      });
      return response()->json($menus);
    }

    public function index(Request $request)
    {   
      if(!$request->has('buscar')){
				return inertia('menu/index',[
					'menus'   => [],
					'filters' => []
				]);
			}

			$query = MenuWeb::query();

			if($request->filled('menu_id')){
				$query->where('menu_id',$request->menu_id);
			}
			if($request->filled('nombre')){
				$query->where('nombre','like', '%'.$request->nombre.'%');
			}
      if ($request->has('padre_id')) {
        $padre = $request->padre_id == 0 ? null : $request->padre_id;
        $query->where('padre', $padre);
      }
			if($request->filled('icono')){
				$query->where('icono','like', '%'.$request->icono.'%');
			}
			if ($request->has('inhabilitado')) {
        $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
        $query->where('inhabilitado', $estado);
      }

			//si no se agregaron filtros, trae todos
			$sinFiltros = !$request->has('menu_id') &&
              !$request->has('nombre') &&
              !$request->has('padre_id') &&
              !$request->has('icono') &&
              !$request->has('inhabilitado');

      if ($sinFiltros) {
        $query = MenuWeb::query();
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
          'filters' => $request->only(['menu_id','nombre','padre','orden','inhabilitado','icono']),
      ]);
    }

    public function store(Request $request)
    {
      DB::beginTransaction();
			try {
				//valido
				$validated = $request->validate([
						'nombre' => 'required|string|max:255',
						'padre' => 'nullable|integer',
            'icono' => 'required|string|max:255',
            'inhabilitado' => 'nullable|boolean',
				]);
        //convierto valores
        $nombre = strtolower(trim($validated['nombre']));
        //$validated['nombre'] = $nombre;
        $validated['padre'] = ($validated['padre'] ?? null) == 0 ? null : $validated['padre'];
        $padre = $validated['padre'];

        // Buscar menús con ese nombre y padre
				$existe = MenuWeb::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
          ->where('padre', $padre)
          ->exists();

        if ($existe) {
          return inertia('menu/index', [
            'resultado' => 0,
            'mensaje' => 'Ya existe un menú con ese nombre para el mismo padre.',
          ]);
        }

        //obtengo los hijos del padre
        $hijos = MenuWeb::where('padre', $padre)->get();
        // Agrego el nuevo menú como objeto temporal
        $hijos->push((object)[
          'nombre' => $nombre,
          'padre' => $padre,
        ]);
        $ordenados = $hijos->sortBy(function ($item) {
          return strtolower(trim($item->nombre));
        })->values(); 
        foreach ($ordenados as $index => $item) {
          if (isset($item->menu_id)) {
            // Menú existente → actualizar orden
            MenuWeb::where('menu_id', $item->menu_id)->update(['orden' => $index + 1]);
          } else {
            // Menú nuevo → asignar orden en $validated
            $validated['orden'] = $index + 1;
          }
        }		

				$menu = MenuWeb::create($validated);

				DB::commit();
				return inertia('menu/index', [
					'resultado'  => 1,
					'mensaje' 	 => 'Menú creado correctamente',
					'menu_id' => $menu->menu_id
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('menu/index', [
					'resultado' => 0,
					'mensaje' => 'Error inesperado: ' . $e->getMessage(),
				]);
			}
    }

    public function update(Request $request, MenuWeb $menu)
    {
      DB::beginTransaction();
			try {
				//valido
				$validated = $request->validate([
						'nombre' => 'required|string|max:255',
						'padre' => 'nullable|integer',
            'icono' => 'required|string|max:255',
            'inhabilitado' => 'nullable|boolean',
				]);
        //convierto valores
        $nombre = strtolower(trim($validated['nombre']));
        $validated['padre'] = ($validated['padre'] ?? null) == 0 ? null : $validated['padre'];
        $padre = $validated['padre'];

        $nombreCambio = $nombre !== strtolower(trim($menu->nombre));
        $padreCambio  = $padre !== $menu->padre;

        // Buscar menús con ese nombre y padre
				if ($nombreCambio || $padreCambio) {
          $existe = MenuWeb::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
            ->where('padre', $padre)
            ->where('menu_id', '!=', $menu->menu_id)
            ->exists();

          if ($existe) {
            return inertia('menu/index', [
              'resultado' => 0,
              'mensaje' => 'Ya existe un menú con ese nombre para el mismo padre.',
            ]);
          }
        }

        $menu->update($validated);
        $hijos = MenuWeb::where('padre', $padre)->get();

        // separo los fijos
        $dashboard = $hijos->firstWhere(fn($item) => strtolower(trim($item->nombre)) === 'dashboard');
        $inicio   = $hijos->firstWhere(fn($item) => strtolower(trim($item->nombre)) === 'inicio');

        // excluyo los fijos del ordenamiento
        $resto = $hijos->filter(function ($item) {
          $nombre = strtolower(trim($item->nombre));
          return $nombre !== 'dashboard' && $nombre !== 'inicio';
        })->sortBy(function ($item) {
          return strtolower(trim($item->nombre));
        })->values();

        // asigno orden desde 3 en adelante
        foreach ($resto as $index => $item) {
          MenuWeb::where('menu_id', $item->menu_id)->update(['orden' => $index + 3]);
        }

        // asigno orden fijo a gráficos y inicio
        if ($inicio) {
          MenuWeb::where('menu_id', $inicio->menu_id)->update(['orden' => 1]);
        }
        if ($dashboard) {
          MenuWeb::where('menu_id', $dashboard->menu_id)->update(['orden' => 2]);
        }


				DB::commit();
				return inertia('menu/index', [
					'resultado' => 1,
					'mensaje'   => 'Menú actulizado correctamente',
					'menu_id'   => $menu->menu_id
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('menu/index', [
					'resultado' => 0,
					'mensaje' => 'Error inesperado: ' . $e->getMessage(),
				]);
			}
      //--
      /*$validated = $request->validate([
        'nombre' => 'required|string|max:255',
        'padre' => 'nullable|integer|exists:menu_web,menu_id',
        'orden' => 'required|integer',
        'icono' => 'nullable|string',
      ]);

      $menuWeb->update($validated);
      return $menuWeb;*/
    }

    public function toggleEstado(MenuWeb $menu)
		{
			//--
			$menu->update([
				'inhabilitado' => !$menu->inhabilitado,
			]);
			return inertia('menu/index',[
					'menu_id' => $menu->menu_id,
					'resultado'  => 1,
					'mensaje'		 => 'Estado actualizado correctamente.'
				]);
		}

    public function destroy(MenuWeb $menuWeb)
    {
        
    }
}
