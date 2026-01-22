<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Categoria;
use App\Models\ProductoCategoria;
use App\Models\DetVenta;
use App\Models\Venta;
use App\Models\ProductoLista;
use App\Models\ListaPrecio;
use App\Models\Stock;
use App\Models\MovimientoStock;
use App\Models\Proveedor;
use App\Models\Marca;
use App\Models\ListaPrecioProducto;

class Producto extends Model
{
    protected $table      = 'productos';
    protected $primaryKey = 'producto_id';
    protected $fillable = [
        'nombre','descripcion','inhabilitado','precio',
        'marca_id','stock_minimo','codigo_barra','imagen','vencimiento'
    ];


    // Categoria
    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'producto_categorias', 'producto_id', 'categoria_id');
    }

    public function productosCategorias(){
        return $this->hasMany(ProductoCategoria::class, 'producto_id');
    }

    // venta
    public function detallesVenta()
    {
        return $this->hasMany(DetVenta::class, 'producto_id');
    }
    public function ventas(){
        return $this->belongsToMany(Venta::class, 'det_ventas', 'producto_id', 'venta_id');
    }

    //lista_precios
    public function listaPreciosProductos()
    {
        return $this->hasMany(ListaPrecioProducto::class, 'producto_id', 'producto_id');
    }


    //Stock
    public function stock()
    {
        return $this->hasOne(Stock::class, 'producto_id');
    }

    //proveedores
    public function movimientoStock(){
        return $this->hasMany(MovimientoStock::class, 'producto_id');
    }
    public function proveedores(){
        return $this->belongsToMany(Proveedor::class, 'movimientos_stock','producto_id', 'proveedor_id');
    }

    //marcas
    public function marca(){
        return $this->belongsTo(Marca::class, 'marca_id', 'marca_id');
    }
}
