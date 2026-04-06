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
      return response()->json(['error' => $e->getMessage()], 500);
    }
  }
    
  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('bancosBilleteras/index',[
        'bancosBilleteras' => []
      ]);
    }
    
    $query = BancoBilletera::query();

    if ($request->filled('banco_billetera_id')) {
        $query->where('banco_billetera_id', $request->banco_billetera_id);
    }
    if ($request->filled('nombre')) {
        $query->where('nombre', 'like', '%'.$request->nombre.'%');
    }
    if ($request->filled('inhabilitado')) {
        $estado = filter_var($request->inhabilitado, FILTER_VALIDATE_BOOLEAN);
        $query->where('inhabilitado', $estado);
    }

    $bancosBilleteras = $query->latest()->get();

    return inertia('bancosBilleteras/index', [
        'bancosBilleteras' => $bancosBilleteras
    ]);

  }

  
  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'inhabilitado' => 'boolean'
      ]);
      
      //controlo que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = BancoBilletera::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])->exists();
      if($existe){
        throw new \Exception("Ya existe un banco o billetera con el mismo nombre. No es posible continuar!");
      }

      //creo el gasto
      $bancoBilletera = BancoBilletera::create([
        'nombre'       => $validated['nombre'],
        'inhabilitado' => $validated['inhabilitado'] == 0 ? 0 : 1, 
        'created_at'   => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'          => 1,
        'mensaje'            => 'El banco/ billetera se creó correctamente',
        'banco_billetera_id' => $bancoBilletera->banco_billetera_id,
        'timestamp'          => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear el banco o billetera: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function update(Request $request, BancoBilletera $bancoBilletera)
  {
    DB::beginTransaction();
    try {
      //controlo los datos
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'inhabilitado' => 'boolean'
      ]);
      
      //controlo que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = BancoBilletera::whereRaw('LOWER(TRIM(nombre)) = ?', [$nombre])
                ->where('banco_billetera_id','<>', $bancoBilletera->banco_billetera_id)
                ->exists();
      if($existe){
        throw new \Exception("Ya existe un banco o billetera con el mismo nombre. No es posible continuar!");
      }

      //modifico el gasto
      $bancoBilletera->update([
        'nombre'       => $validated['nombre'],
        'inhabilitado' => $validated['inhabilitado'],
        'updated_at'   => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'          => 1,
        'mensaje'            => 'El banco/ billetera se modificó correctamente',
        'banco_billetera_id' => $bancoBilletera->banco_billetera_id,
        'timestamp'          => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar el banco/ billetera: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }

  public function toggleEstado(Request $request,BancoBilletera $bancoBilletera){
    DB::beginTransaction();
    try {      
      //modifico el gasto
      $bancoBilletera->update([
        'inhabilitado' => !$bancoBilletera->inhabilitado,
        'updated_at'  => now(),
      ]);

      //éxito
      DB::commit();
      return response()->json([
        'resultado'          => 1,
        'mensaje'            => 'Se modificó el estado correctamente',
        'banco_billetera_id' => $bancoBilletera->banco_billetera_id,
        'timestamp'          => now()->timestamp
      ]);
    } catch (\Throwable $e) {
      DB::rollBack();
      return response()->json([
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar estado del banco o billetera: '.$e->getMessage(),
        'timestamp' => now()->timestamp
      ]);
    }
  }
}
