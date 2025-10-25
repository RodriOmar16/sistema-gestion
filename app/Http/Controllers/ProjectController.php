<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
			if(!$request->has('buscar')){
				return inertia('projects/index',[
					'projects' => [],
					'filters'  => []
				]);
			}

			$query = Project::query();

			if($request->filled('id')){
				$query->where('id',$request->id);
			}
			if($request->filled('name')){
				$query->where('name','like', '%'.$request->name.'%');
			}
			if($request->filled('descripcion')){
				$query->where('descripcion','like', '%'.$request->descripcion.'%');
			}
			if ($request->filled('inhabilitado')) {
				$estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
				$query->where('inhabilitado', $estado);
			}

			//si no se agregaron filtros, trae todos
			if(!$request->filled('id') && !$request->filled('name') && !$request->filled('descripcion') &&
				 !$request->filled('inhabilitado')){
				$query = Project::query();
			}

			 $projects = $query->latest()->get();

			return inertia('projects/index', [
				'projects' => $projects,
				'filters'  => $request->only(['id','name', 'descripcion', 'inhabilitado']),
				'resultado' => session('resultado'),
				'mensaje' => session('mensaje'),
				'error' => session('error'),
			]);
    }
    
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
		{
			DB::beginTransaction();
			try {
				// operaciones
				$validated = $request->validate([
						'name' => 'required|string|max:255',
						'descripcion' => 'nullable|string',
				]);

				$name = strtolower(trim($validated['name']));
				$descripcion = strtolower(trim($validated['descripcion'] ?? ''));

				// Buscar proyectos con ese nombre
				$proyectosConNombre = Project::whereRaw('LOWER(TRIM(name)) = ?', [$name])->get();

				if ($proyectosConNombre->count()) {
						// Si alguno también tiene la misma descripción → error doble
						$coincideDescripcion = $proyectosConNombre->contains(function ($p) use ($descripcion) {
								return strtolower(trim($p->descripcion)) === $descripcion;
						});

						if ($coincideDescripcion) {
								return inertia('projects/index', [
										'resultado' => 0,
										'mensaje' => 'Ya existe un proyecto con ese nombre y descripción.',
								]);
						}
						// Si solo coincide el nombre → error simple
						return inertia('projects/index', [
								'resultado' => 0,
								'mensaje' => 'Ya existe un proyecto con ese nombre.',
						]);
				}

				$project = Project::create($validated);

				DB::commit();
				return inertia('projects/index', [
					'resultado'  => 1,
					'mensaje' 	 => 'Proyecto creado correctamente',
					'project_id' => $project->id
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('projects/index', [
					'resultado' => 0,
					'mensaje' => 'Error inesperado: ' . $e->getMessage(),
				]);
			}
		}

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
			DB::beginTransaction();
			try {
				// operaciones
				$validated = $request->validate([
						'name' => 'required|string|max:255',
						'descripcion' => 'nullable|string',
				]);

				$name = strtolower(trim($validated['name']));
				$descripcion = strtolower(trim($validated['descripcion'] ?? ''));

				// Buscar proyectos con ese nombre
				$existeDuplicado = Project::whereRaw('LOWER(TRIM(name)) = ?', [$name])
            //->whereRaw('LOWER(TRIM(descripcion)) = ?', [$descripcion])
            ->where('id', '!=', $project->id)
            ->exists();
				if ($existeDuplicado) {
            return inertia('projects/index', [
                'resultado' => 0,
                'mensaje'   => 'Ya existe otro proyecto con ese nombre.',
            ]);
        }

				$project->update($validated);

				DB::commit();
				return inertia('projects/index',[
					'project_id' => $project->id,
					'resultado'  => 1,
					'mensaje'		 => 'Proyecto actualizado correctamente'
				]);

			} catch (\Throwable $e) {
				DB::rollBack();

				return inertia('projects/index', [
					'resultado' => 0,
					'mensaje' 	=> 'Error inesperado: ' . $e->getMessage(),
				]);
			}
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        //
    }

		public function toggleEstado(Project $project)
		{
			//--
			$project->update([
				'inhabilitado' => !$project->inhabilitado,
			]);
			return inertia('projects/index',[
					'project_id' => $project->id,
					'resultado'  => 1,
					'mensaje'		 => 'Estado actualizado correctamente.'
				]);
		}

}
