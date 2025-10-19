<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Proveedor;
use App\Models\ProductoLista;

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
    public function productosLista(){
        return $this->hasMany(ProductoLista::class, 'lista_precio_id');
    }
}
