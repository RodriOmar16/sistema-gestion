<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ruta;

class RutaController extends Controller
{
   public function index(Request $request)
    {
        \Log::info('Filtros recibidos:', $request->all());

        $query = Ruta::query();

        if ($request->ruta_id !== null && $request->ruta_id !== '') {
            $query->where('ruta_id', $request->ruta_id);
        }

        if ($request->url !== null && $request->url !== '') {
            $query->where('url', 'like', '%' . $request->url . '%');
        }

        if ($request->inhabilitada !== null && $request->inhabilitada !== '') {
            $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($estado === false) {
                $query->where('inhabilitada', false);
            } elseif ($estado === true) {
                $query->where('inhabilitada', true);
            }
        }

        $rutas = $query->orderByDesc('created_at')->get();

        return inertia('rutas/index', [
            'rutas' => $rutas,
            'filters' => $request->only(['ruta_id', 'url', 'inhabilitada']),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:255|unique:rutas,url',
        ]);

        return Ruta::create($validated);
    }

    public function update(Request $request, Ruta $ruta)
    {
        $validated = $request->validate([
            'url' => 'required|string|max:255|unique:rutas,url,' . $ruta->ruta_id . ',ruta_id',
        ]);

        $ruta->update($validated);
        return $ruta;
    }

    public function destroy(Ruta $ruta)
    {
        $ruta->update(['inhabilitada' => true]);
    }
}
