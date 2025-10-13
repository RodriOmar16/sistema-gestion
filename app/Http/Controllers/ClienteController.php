<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;

class ClienteController extends Controller
{
    public function index()
    {
        return Cliente::where('inhabilitado', false)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'domicilio' => 'required|string',
            'email' => 'required|email|unique:clientes,email',
            'dni' => 'required|string|unique:clientes,dni',
        ]);

        return Cliente::create($validated);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'domicilio' => 'required|string',
            'email' => 'required|email|unique:clientes,email,' . $cliente->cliente_id . ',cliente_id',
            'dni' => 'required|string|unique:clientes,dni,' . $cliente->cliente_id . ',cliente_id',
        ]);

        $cliente->update($validated);
        return $cliente;
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->update(['inhabilitado' => true]);
    }
}
