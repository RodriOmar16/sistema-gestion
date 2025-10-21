<?php
use Inertia\Inertia;

use App\Models\Carousel;

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\MenuWebController;

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
