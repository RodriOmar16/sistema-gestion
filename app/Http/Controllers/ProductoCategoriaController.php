<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductoCategoria;

class ProductoCategoriaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,producto_id',
            'categoria_id' => 'required|exists:categorias,categoria_id',
        ]);

        return ProductoCategoria::create($validated);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,producto_id',
            'categoria_id' => 'required|exists:categorias,categoria_id',
        ]);

        ProductoCategoria::where($validated)->delete();
        return response()->json(['message' => 'Relación eliminada']);
    }
}
