<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    /*public function store(LoginRequest $request): RedirectResponse
    {
        $user = $request->validateCredentials();

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('inicio', absolute: false));
    }*/

    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $request->validateCredentials();

         // Bloquear si el usuario está inhabilitado
        if ($user->inhabilitado) {
            return back()->withErrors([
                'email' => 'Tu cuenta está inhabilitada. Contacta al administrador.',
            ]);
        }

        if (Features::enabled(Features::twoFactorAuthentication()) && $user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        // Traer roles y permisos
        $roles = $user->roles()->where('inhabilitado',0)->pluck('nombre');
        $permisosPorRol = $user->roles()
            ->where('inhabilitado',0)
            ->with([ 'permisos' => function($query) {
                    $query->where('inhabilitado',0);
                }
            ])->get()
            ->pluck('permisos.*.clave')
            ->flatten();
        $permisosDirectos = $user->permisos()->where('inhabilitado',0)->pluck('clave');
        $permisos = $permisosPorRol->merge($permisosDirectos)->unique();

        // Guardar en sesión para que HandleInertiaRequests los comparta
        $request->session()->put('roles', $roles);
        $request->session()->put('permisos', $permisos);

        // Si usás Inertia, podés pasar estos datos como props
        return redirect()->intended(route('inicio', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
