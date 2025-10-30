<?php
use Inertia\Inertia;

use App\Models\Carousel;

use App\Http\Controllers\MenuWebController;
use App\Http\Controllers\RutaController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UserController;

use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ListaPrecioController;
use App\Http\Controllers\ProductoController;
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
    Route::get('/roles_habilitados', [RolController::class, 'rolesHabilitados'])->name('roles.habilitados');
    Route::get('/roles', [RolController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RolController::class, 'store'])->name('roles.store');
    Route::put('/roles/{rol}', [RolController::class, 'update'])->name('roles.update');
    Route::put('/roles/{rol}/estado', [RolController::class, 'toggleEstado'])->name('roles.toggleEstado');

    //Usuarios
    Route::get('/user/{user}/roles_user', [UserController::class, 'rolesUser'])->name('users.rolesUser');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::put('/users/{user}/estado', [UserController::class, 'toggleEstado'])->name('users.toggleEstado');
    
    //Categorías
    Route::get('/categorias_habilitadas', [CategoriaController::class, 'categoriasHabilitadas'])->name('categorias.habilitadas');
    Route::get('/categorias', [CategoriaController::class, 'index'])->name('categorias.index');
    Route::post('/categorias', [CategoriaController::class, 'store'])->name('categorias.store');
    Route::put('/categorias/{categoria}', [CategoriaController::class, 'update'])->name('categorias.update');
    Route::put('/categorias/{categoria}/estado', [CategoriaController::class, 'toggleEstado'])->name('categorias.toggleEstado');

    //Proveedores
    Route::get('/proveedores_habilitados', [ProveedorController::class, 'proveedoresHabilitados'])->name('proveedores.proveedoresHabilitados');
    Route::get('/proveedores', [ProveedorController::class, 'index'])->name('proveedores.index');
    Route::post('/proveedores', [ProveedorController::class, 'store'])->name('proveedores.store');
    Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
    Route::put('/proveedores/{proveedor}/estado', [ProveedorController::class, 'toggleEstado'])->name('proveedores.toggleEstado');

    //Listas de Precios
    Route::get('/listas_precios_habilitadas', [ListaPrecioController::class, 'listasPreciosHabilitadas'])->name('listasPrecios.listasPreciosHabilitadas');
    Route::get('/listas-precios', [ListaPrecioController::class, 'index'])->name('listasPrecios.index');
    Route::post('/listas-precios', [ListaPrecioController::class, 'store'])->name('listasPrecios.store');
    Route::put('/listas-precios/{lista}', [ListaPrecioController::class, 'update'])->name('listasPrecios.update');
    Route::put('/listas-precios/{lista}/estado', [ListaPrecioController::class, 'toggleEstado'])->name('listasPrecios.toggleEstado');

    //Productos
    Route::get('/productos_habilitados', [ProductoController::class, 'productosHabilitados'])->name('productos.productosHabilitados');
    Route::get('/productos', [ProductoController::class, 'index'])->name('productos.index');
    Route::get('productos/create', [ProductoController::class, 'create'])->name('productos.create');
    Route::post('/productos/producto-nuevo', [ProductoController::class, 'store'])->name('productos.store');
    Route::get('productos/{producto}/edit', [ProductoController::class, 'edit'])->name('productos.edit');
    Route::put('/productos/{producto}/update', [ProductoController::class, 'update'])->name('productos.update');
    Route::put('/productos/{producto}/estado', [ProductoController::class, 'toggleEstado'])->name('productos.toggleEstado');

    //banners
    Route::resource('carousel', CarouselController::class);
    Route::get('/banners', [CarouselController::class, 'index'])->name('carousel.index');
    Route::put('/carousel/{carousel}', [CarouselController::class, 'update'])->name('carousel.update');
    Route::put('/carousel/{carousel}/estado', [CarouselController::class, 'toggleEstado'])->name('carousel.toggleEstado');
    
    //Proyectos
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::put('/projects/{project}/estado', [ProjectController::class, 'toggleEstado'])->name('projects.toggleEstado');


    //Route::get('/productos', [ProductoController::class, 'index'])->middleware('verificarRuta');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
