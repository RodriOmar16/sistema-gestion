<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\BancoBilletera;
use App\Http\Requests\StoreBancoBilleteraRequest;
use App\Http\Requests\UpdateBancoBilleteraRequest;

class BancoBilleteraController extends Controller
{
    public function habilitados(Request $request){
        try {
        $buscar = $request->get('buscar', '');

        $bancosBilleteras = BancoBilletera::query()
            ->where('inhabilitado',0)
            ->when($buscar, fn($q) => $q->where('nombre', 'LIKE', "%{$buscar}%"))
            ->select('banco_billetera_id as id', 'nombre')
            ->paginate(20);

        return response()->json([
            'elementos' => $bancosBilleteras
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
    public function store(StoreBancoBilleteraRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(BancoBilletera $bancoBilletera)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BancoBilletera $bancoBilletera)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBancoBilleteraRequest $request, BancoBilletera $bancoBilletera)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BancoBilletera $bancoBilletera)
    {
        //
    }
}
