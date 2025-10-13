<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
			if(!$request->hasAny(['id','name', 'descripcion', 'inhabilitado'])){
				return inertia('projects/index',[
					'projects' => ['data' => []],
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

			$projects = $query->latest()->paginate(10)->withQueryString();

			return inertia('projects/index',[
				'projects' => $projects,
				'filters'  => $request->only(['id','name', 'descripcion', 'inhabilitado'])
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
			$validated = $request->validate([
				'name' => 'required|string|max:255',
				'descripcion' => 'nullable|string',
			]);

			$project = Project::create($validated);

			return redirect()->route('projects.index')->with('success', 'Proyecto creado correctamente.');
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
			$validated = $request->validate([
				'name' => 'required|string|max:255',
				'descripcion' => 'nullable|string',
			]);

			$project->update($validated);

			return redirect()->route('projects.index')->with('success', 'Proyecto actualizado correctamente.');
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
			$project->update([
				'inhabilitado' => !$project->inhabilitado,
			]);

			return redirect()->route('projects.index')->with('success', 'Estado actualizado correctamente.');
		}

}
