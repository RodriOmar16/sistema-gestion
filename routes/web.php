<?php
use Inertia\Inertia;

use App\Models\Carousel;

use App\Http\Controllers\MenuWebController;
use App\Http\Controllers\RutaController;
use App\Http\Controllers\RolController;

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CarouselController;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;


Route::get('/login', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

//Menú
Route::middleware(['auth'])->get('/menu-usuario', [MenuWebController::class, 'menuPorUsuario']);

/*Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});*/

Route::middleware(['auth', 'verificarRuta'])->group(function () {
    //dashboard
    Route::get('dashboard', function () {
        $images = Carousel::orderBy('priority')->pluck('url')->toArray();
        return Inertia::render('dashboard', [
            'carouselImages' => $images,
        ]);
    })->name('dashboard');

    //Menu
    Route::get('/init_menu', [MenuWebController::class, 'padresHabilitados'])->name('menu.padres');
    Route::get('/menu_habilitados', [MenuWebController::class, 'menusHabilitados'])->name('menu.habilitados');
    Route::get('/menu',[MenuWebController::class, 'index'])->name('menu.index');
    Route::post('/menu', [MenuWebController::class, 'store'])->name('menu.store');
    Route::put('/menu/{menu}', [MenuWebController::class, 'update'])->name('menu.update');
    Route::put('/menu/{menu}/estado', [MenuWebController::class, 'toggleEstado'])->name('menu.toggleEstado');

    //Rutas
    Route::get('/rutas_habilitadas', [RutaController::class, 'rutasHabilitadas'])->name('rutas.habilitadas');
    Route::get('/rutas', [RutaController::class, 'index'])->name('rutas.index');
    Route::post('/rutas', [RutaController::class, 'store'])->name('rutas.store');
    Route::put('/rutas/{ruta}', [RutaController::class, 'update'])->name('rutas.update');
    Route::put('/rutas/{ruta}/estado', [RutaController::class, 'toggleEstado'])->name('rutas.toggleEstado');

    //Roles
    Route::get('/rol/{rol}/menus_rutas', [RolController::class, 'menusYRutas'])->name('roles.menusYRutas');
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{rol}', [RolController::class, 'update'])->name('roles.update');
    Route::put('/roles/{rol}/estado', [RolController::class, 'toggleEstado'])->name('roles.toggleEstado');

    //proyectos
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::put('/projects/{project}/estado', [ProjectController::class, 'toggleEstado'])->name('projects.toggleEstado');

    //banners
    Route::resource('carousel', CarouselController::class);
    Route::get('/banners', [CarouselController::class, 'index'])->name('carousel.index');
    Route::put('/carousel/{carousel}', [CarouselController::class, 'update'])->name('carousel.update');
    Route::put('/carousel/{carousel}/estado', [CarouselController::class, 'toggleEstado'])->name('carousel.toggleEstado');

    //Route::get('/productos', [ProductoController::class, 'index'])->middleware('verificarRuta');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
