<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;

class ProductoController extends Controller
{
    public function index()
    {
        return Producto::with('categoria')->where('inhabilitado', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias,categoria_id',
            'precio' => 'required|numeric|min:0',
        ]);

        return Producto::create($validated);
    }

    public function update(Request $request, Producto $producto)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'categoria_id' => 'required|exists:categorias,categoria_id',
            'precio' => 'required|numeric|min:0',
        ]);

        $producto->update($validated);
        return $producto;
    }

    public function destroy(Producto $producto)
    {
        $producto->update(['inhabilitado' => true]);
    }
}
