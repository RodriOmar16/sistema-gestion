<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rol;

class RolController extends Controller
{
    public function index()
    {
        return Rol::where('inhabilitado', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        return Rol::create($validated);
    }

    public function update(Request $request, Rol $rol)
    {
        $validated = $request->validate(['nombre' => 'required|string|max:255']);
        $rol->update($validated);
        return $rol;
    }

    public function destroy(Rol $rol)
    {
        $rol->update(['inhabilitado' => true]);
    }
}
