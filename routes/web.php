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
use App\Http\Controllers\MovimientoStockController;
use App\Http\Controllers\TipoMovimientoController;
use App\Http\Controllers\OrigenMovimientoController;
use App\Http\Controllers\FormaPagoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\GastoController;
use App\Http\Controllers\GraficosController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\CarouselController;
use App\Http\Controllers\MarcaController;

use App\Http\Controllers\ProjectController;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;


Route::get('/login', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('inicio')
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
    Route::get('inicio', function () {
        $images = Carousel::where('inhabilitado', false)->orderBy('priority')->pluck('url')->toArray();
        return Inertia::render('inicio/index', [
            'carouselImages' => $images,
        ]);
    })->name('inicio');

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
    Route::get('/listas_precios_habilitadas', [ListaPrecioController::class, 'listasPreciosHabilitadas'])->name('listasPrecios.habilitadas');
    Route::get('/listas-precios', [ListaPrecioController::class, 'index'])->name('listasPrecios.index');
    Route::post('/listas-precios', [ListaPrecioController::class, 'store'])->name('listasPrecios.store');
    Route::put('/listas-precios/{lista}', [ListaPrecioController::class, 'update'])->name('listasPrecios.update');
    Route::put('/listas-precios/{lista}/estado', [ListaPrecioController::class, 'toggleEstado'])->name('listasPrecios.toggleEstado');

    //Productos
    Route::get('/productos_habilitados', [ProductoController::class, 'productosHabilitados'])->name('productos.productosHabilitados');
    Route::get('/productos/excel', [ProductoController::class, 'exportarExcelManual'])->name('productos.excel');
    Route::get('/productos/pdf', [ProductoController::class, 'generarPDF'])->name('productos.pdf');
    Route::get('/productos', [ProductoController::class, 'index'])->name('productos.index');
    Route::get('producto/create', [ProductoController::class, 'create'])->name('productos.create');
    Route::post('/productos/producto-nuevo', [ProductoController::class, 'store'])->name('productos.store');
    Route::get('producto/ver/{producto}', [ProductoController::class, 'edit'])->name('productos.edit');
    Route::put('/productos/update/{producto}', [ProductoController::class, 'update'])->name('productos.update');
    Route::put('/producto/cambio-estado/{producto}', [ProductoController::class, 'toggleEstado'])->name('productos.toggleEstado');

    //Stock
    Route::get('/stock-disponible', [StockController::class, 'stockDisponible'])->name('stock.disponible');;
    Route::get('/stock/excel', [StockController::class, 'exportarExcelManual'])->name('stock.excel');
    Route::get('/stock/pdf', [StockController::class, 'generarPDF'])->name('stock.pdf');
    Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('/stock/stock-nuevo', [StockController::class, 'store'])->name('stock.store');
    Route::put('/stock/update/{stock}', [StockController::class, 'update'])->name('stock.update');

    //TipoMovimiento
    Route::get('/tipos_mov_habilitados', [TipoMovimientoController::class, 'tiposHabilitados'])->name('tiposMov.habilitados');
    
    //OrigenMovimiento
    Route::get('/origenes_mov_habilitados', [OrigenMovimientoController::class, 'origenesHabilitados'])->name('origenesMov.habilitados');

    //Movimientos Stock
    Route::get('/movimientos-stock/excel', [MovimientoStockController::class, 'exportarExcelManual'])->name('movStock.excel');
    Route::get('/movimientos-stock/pdf', [MovimientoStockController::class, 'generarPDF'])->name('movStock.pdf');
    Route::get('/movimientos-stock', [MovimientoStockController::class, 'index'])->name('movStock.index');
    //Route::post('/movimientos-stock/mov-nuevo', [MovimientoStockController::class, 'store'])->name('stock.store');
    //Route::put('/movimientos-stock/update/{mov}', [MovimientoStockController::class, 'update'])->name('stock.update');

    //Formas de Pago
    Route::get('/formas_pago_habilitadas', [FormaPagoController::class, 'formasPagoHabilitadas'])->name('formasPago.habilitadas');
    Route::get('/formas-pago', [FormaPagoController::class, 'index'])->name('formasPago.index');
    Route::post('/forma-pago/nueva', [FormaPagoController::class, 'store'])->name('formasPago.store');
    Route::put('/forma-pago/update/{fp}', [FormaPagoController::class, 'update'])->name('formasPago.update');
    Route::put('/forma-pago/cambio-estado/{fp}', [FormaPagoController::class, 'toggleEstado'])->name('formasPago.toggleEstado');

    //Clientes
    Route::get('/clientes_habilitados', [ClienteController::class, 'clientesHabilitados'])->name('clientes.habilitados');
    Route::get('/clientes_habilitados-ventas', [ClienteController::class, 'clientesPorDni'])->name('clientes.porDni');
    Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');
    Route::post('/cliente/nuevo', [ClienteController::class, 'store'])->name('clientes.store');
    Route::put('/cliente/update/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
    Route::put('/cliente/cambio-estado/{cliente}', [ClienteController::class, 'toggleEstado'])->name('clientes.toggleEstado');

    //Ventas
    Route::get('/ventas/excel', [VentaController::class, 'exportarExcelManual'])->name('ventas.excel');
    Route::get('/ventas/pdf', [VentaController::class, 'generarPDF'])->name('ventas.pdf');
    Route::get('/ventas', [VentaController::class, 'index'])->name('ventas.index');
    Route::get('/nueva-venta', [VentaController::class, 'create'])->name('ventas.create');
    Route::post('/venta/grabar', [VentaController::class, 'store'])->name('ventas.store');
    Route::get('venta/ver/{venta}', [VentaController::class, 'view'])->name('ventas.view');
    Route::put('/ventas/update/{venta}', [VentaController::class, 'update'])->name('ventas.update');
    Route::put('/ventas/anular/{venta}', [VentaController::class, 'destroy'])->name('ventas.destroy');

    //Turnos
    Route::get('/turnos_habilitados', [TurnoController::class, 'turnosHabilitados'])->name('turnos.habilitados');
    Route::get('/turnos', [TurnoController::class, 'index'])->name('turnos.index');
    Route::post('/turno/nuevo', [TurnoController::class, 'store'])->name('turnos.store');
    Route::put('/turno/update/{turno}', [TurnoController::class, 'update'])->name('turnos.update');
    Route::put('/turno/cambio-estado/{turno}', [TurnoController::class, 'toggleEstado'])->name('turnos.toggleEstado');

    //Gastos
    //Route::get('/turnos_habilitados', [GastoController::class, 'turnosHabilitados'])->name('turnos.habilitados');
    Route::get('/gastos', [GastoController::class, 'index'])->name('gastos.index');
    Route::post('/gasto/nuevo', [GastoController::class, 'store'])->name('gasto.store');
    Route::put('/gasto/update/{gasto}', [GastoController::class, 'update'])->name('gasto.update');

    //banners
    Route::get('/banners', [CarouselController::class, 'index'])->name('banners.index');
    Route::post('/banner/nuevo', [CarouselController::class, 'store'])->name('banners.store');
    Route::put('/banner/update/{carousel}', [CarouselController::class, 'update'])->name('banners.update');
    Route::put('/banner/cambiar-estado/{carousel}', [CarouselController::class, 'toggleEstado'])->name('banners.toggleEstado');

    //Gráficos
    Route::get('/dashboard', [GraficosController::class, 'index'])->name('graficos.index');

    //Marcas
    Route::get('/marcas_habilitadas', [MarcaController::class, 'marcasHabilitadas'])->name('marcas.marcasHabilitadas');
    Route::get('/marcas', [MarcaController::class, 'index'])->name('marcas.index');
    Route::get('marca/create', [MarcaController::class, 'create'])->name('marcas.create');
    Route::post('/marcas/marca-nueva', [MarcaController::class, 'store'])->name('marcas.store');
    Route::get('marcas/ver/{marca}', [MarcaController::class, 'edit'])->name('marcas.edit');
    Route::put('/marcas/update/{marca}', [MarcaController::class, 'update'])->name('marcas.update');
    Route::put('/marcas/cambio-estado/{marca}', [MarcaController::class, 'toggleEstado'])->name('marcas.toggleEstado');
    
    //Proyectos
    Route::get('/projects/pdf', [ProjectController::class, 'generarPDF'])->name('projects.pdf');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::put('/projects/{project}/estado', [ProjectController::class, 'toggleEstado'])->name('projects.toggleEstado');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
