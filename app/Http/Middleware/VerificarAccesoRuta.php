<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Ruta;

class VerificarAccesoRuta
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $rutaActual = '/'.$request->path(); // o Route::currentRouteName()
        $usuario = auth()->user();

        $ruta = Ruta::where('url', $rutaActual)->first();
        if (!$ruta) {
            // Si no está registrada, no se valida (acción interna)
            return $next($request);
        }

        if ($ruta->inhabilitada) {
            abort(403, 'Ruta inhabilitada');
        }

        $tieneAcceso = $ruta->roles()->whereIn('rol_id', $usuario->roles->pluck('rol_id'))->exists();

        if (!$tieneAcceso) {
            abort(403, 'Acceso no autorizado');
        }

        return $next($request);
    }

}
