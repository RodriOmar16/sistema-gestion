<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\EstadoOperacion;
use App\Http\Requests\StoreEstadoOperacionRequest;
use App\Http\Requests\UpdateEstadoOperacionRequest;


class EstadoOperacionController extends Controller
{
    public function habilitados(Request $request){
        try {
        $buscar = $request->get('buscar', '');

        $estados = EstadoOperacion::query()
            ->where('inhabilitado',0)
            ->when($buscar, fn($q) => $q->where('descripcion', 'LIKE', "%{$buscar}%"))
            ->select('estado_id as id', 'descripcion as nombre')
            ->paginate(20);

        return response()->json([
            'elementos' => $estados
        ]);
        } catch (\Throwable $e) {
        //Log::error('Error en buscar categorias: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StoreEstadoOperacionRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EstadoOperacion $estadoOperacion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EstadoOperacion $estadoOperacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEstadoOperacionRequest $request, EstadoOperacion $estadoOperacion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EstadoOperacion $estadoOperacion)
    {
        //
    }
}
