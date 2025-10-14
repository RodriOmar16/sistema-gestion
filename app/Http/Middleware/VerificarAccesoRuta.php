<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarAccesoRuta
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next)
    {
        $rutaActual = $request->path(); // o Route::currentRouteName()
        $usuario = auth()->user();

        $tieneAcceso = Ruta::where('url', '/' . $rutaActual)
            ->whereHas('roles', function ($q) use ($usuario) {
                $q->whereIn('rol_id', $usuario->roles->pluck('rol_id'));
            })->exists();

        if (!$tieneAcceso) {
            abort(403, 'Acceso no autorizado');
        }

        return $next($request);
    }

}
