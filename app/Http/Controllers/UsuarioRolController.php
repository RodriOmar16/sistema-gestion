<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UsuarioRol;

class UsuarioRolController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'rol_id' => 'required|exists:roles,rol_id',
        ]);

        return UsuarioRol::create($validated);
    }
}
