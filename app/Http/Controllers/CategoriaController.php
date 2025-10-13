<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index()
    {
        return Categoria::where('inhabilitada', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        return Categoria::create($validated);
    }

    public function update(Request $request, Categoria $categoria)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        $categoria->update($validated);
        return $categoria;
    }

    public function destroy(Categoria $categoria)
    {
        $categoria->update(['inhabilitada' => true]);
    }
}
