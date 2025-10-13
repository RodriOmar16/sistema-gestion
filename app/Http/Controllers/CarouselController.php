<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Carousel;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class CarouselController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if(!$request->hasAny(['id','url','title', 'description', 'priority', 'inhabilitado'])){
            return inertia('banners/index',[
                'banners' => ['data' => []],
                'filters'  => []
            ]);
        }

        $query = Carousel::query();

        if($request->filled('id')){
            $query->where('id', $request->id);
        }
        if($request->filled('url')){
            $query->where('url','like','%'.$request->url.'%');
        }
        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->title . '%');
        }
        if ($request->filled('description')) {
            $query->where('description', 'like', '%' . $request->description . '%');
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('inhabilitado')) {
            $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
            $query->where('inhabilitado', $estado);
        }

        $banners = $query->latest()->paginate(10)->withQueryString();

        return inertia('banners/index',[
            'banners' => $banners,
            'filters' => $request->only(['id', 'url','title','description','priority', 'inhabilitado'])
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'url'         => 'required|url',
            'title'       => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'nullable|integer'
        ]);

        Carousel::create($validated);

        return redicect()->route('carousel.index')->with('success', 'Banner creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
        'url' => 'required|url',
        'title' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'priority' => 'nullable|integer',
    ]);

    $carousel->update($validated);

    return redirect()->route('carousel.index')->with('success', 'Banner actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function toggleEstado(Carousel $carousel)
    {
        $carousel->update([
            'inhabilitado' => !$carousel->inhabilitado,
        ]);

        return redirect()->route('carousel.index')->with('success', 'Estado actualizado correctamente.');
    }
}
