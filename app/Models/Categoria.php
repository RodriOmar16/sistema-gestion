<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Producto;
use App\Models\ProductoCategoria;

class Categoria extends Model
{
    protected $primaryKey = 'categoria_id';
    protected $fillable   = ['categoria_id', 'nombre', 'inhabilitada'];

    public function productosCategoria()
    {
        return $this->hasMany(ProductoCategoria::class, 'categoria_id');
    }

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'producto_categorias', 'categoria_id', 'producto_id');
    }
}
