<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Proveedor;
use App\Models\ProductoLista;
use App\Models\Producto;

class ListaPrecio extends Model
{
    /** @use HasFactory<\Database\Factories\ListaPrecioFactory> */
    use HasFactory;

    protected $primaryKey = 'lista_precio_id';
    protected $table      = 'listas_precios';

    protected $fillable = ['proveedor_id', 'fecha_inicio', 'fecha_fin', 'inhabilitada'];

    public function proveedor(){
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    //productos
    public function productosLista(){
        return $this->hasMany(ProductoLista::class, 'lista_precio_id');
    }
    public function productos(){
        return $this->belongsToMany(Producto::class, 'productos_listas','lista_precio_id', 'producto_id');
    }
}
