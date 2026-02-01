<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\FormaPago;

class FormaPagoController extends Controller
{
  public function formasPagoHabilitadas(){
    $formasPago = FormaPago::where('inhabilitada', false)->get()->map(function($fp){
      return [
        'id'     => $fp->forma_pago_id,
        'nombre' => $fp->nombre
      ];
    });
    return response()->json($formasPago);
  }
  
  public function habilitadas(Request $request)
  {
    try {
      $buscar = $request->get('buscar', '');

      $fp = FormaPago::query()
        ->where('inhabilitada',0)
        ->when($buscar, fn($q) => $q->where('nombre', 'LIKE', "%{$buscar}%"))
        ->select('forma_pago_id as id', 'nombre')
        ->paginate(20);

      return response()->json([
          'elementos' => $fp
      ]);
    } catch (\Throwable $e) {
      //Log::error('Error en buscar formas de pago: ' . $e->getMessage());
      return response()->json(['error' => $e->getMessage()], 500);
    }
  }

  public function index(Request $request)
  {
    if(!$request->has('buscar')){
      return inertia('formasPago/index',[ 'formasPago' => [] ]);
    }
    
    $query = FormaPago::query();
    if($request->filled('forma_pago_id')){
      $query->where('forma_pago_id', $request->forma_pago_id);
    }
    if($request->filled('nombre')){
      $query->where('nombre','like','%'.$request->nombre.'%');
    }
    if($request->filled('descripcion')){
      $query->where('descripcion','like','%'.$request->descripcion.'%');
    }
    if ($request->filled('inhabilitada')) {
      $estado = filter_var($request->inhabilitada, FILTER_VALIDATE_BOOLEAN);
      $query->where('inhabilitada', $estado);
    }

    $formasPago = $query->latest()->get();
    return inertia('formasPago/index',[
      'formasPago' => $formasPago
    ]);
  }

  public function store(Request $request)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'descripcion'  => 'nullable|string',
        'inhabilitada' => 'boolean',
      ]);
      //controlo que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = FormaPago::whereRaw('LOWER(TRIM(nombre)) = ?',[$nombre])->exists();
      if($existe){
        return inertia('formasPago/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe una forma de pago con el mismo nombre.'
        ]);
      }
      //creo la forma de pago
      $formaPago = FormaPago::create([
        'nombre'       => $validated['nombre'],
        'descripcion'  => $validated['descripcion'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0
      ]);
      //exito
      DB::commit();
      return inertia('formasPago/index',[
        'resultado'     => 1,
        'mensaje'       => 'La forma de pago se creó correctamente',
        'forma_pago_id' => $formaPago->forma_pago_id
      ]);

    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('formasPago/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar crear la forma de pago: '.$e->getMessage()
      ]);
    }
  }

  public function update(Request $request, FormaPago $fp)
  {
    DB::beginTransaction();
    try {
      //valido los datos
      $validated = $request->validate([
        'nombre'       => 'required|string|max:255',
        'descripcion'  => 'nullable|string',
        'inhabilitada' => 'boolean',
      ]);
      //controlo que no se repita
      $nombre = strtolower(trim($validated['nombre']));
      $existe = FormaPago::whereRaw('LOWER(TRIM(nombre)) = ?',[$nombre])
                ->where('forma_pago_id', '!=', $fp->forma_pago_id)
                ->exists();
      if($existe){
        return inertia('formasPago/index',[
          'resultado' => 0,
          'mensaje'   => 'Ya existe una forma de pago con el mismo nombre.'
        ]);
      }
      //creo la forma de pago
      $fp->update([
        'nombre'       => $validated['nombre'],
        'descripcion'  => $validated['descripcion'],
        'inhabilitada' => $validated['inhabilitada'] ? 1 : 0
      ]);
      //exito
      DB::commit();
      return inertia('formasPago/index',[
        'resultado'     => 1,
        'mensaje'       => 'La forma de pago se modificó correctamente',
        'forma_pago_id' => $fp->forma_pago_id
      ]);

    } catch (\Throwable $e) {
      DB::rollback();
      return inertia('formasPago/index',[
        'resultado' => 0,
        'mensaje'   => 'Ocurrió un error al intentar actualizar la forma de pago: '.$e->getMessage()
      ]);
    }
  }

  public function toggleEstado(FormaPago $fp)
  {
    $fp->update(['inhabilitada' => !$fp->inhabilitada]);
    return inertia('formasPago/index',[
      'mensaje'       => 'Estado modificado exitosamente',
      'resultado'     => 1,
      'forma_pago_id' => $fp->forma_pago_id
    ]);
  }
}
