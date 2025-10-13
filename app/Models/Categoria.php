<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $primaryKey = 'categoria_id';

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }

    public function productosSecundarios()
    {
        return $this->belongsToMany(Producto::class, 'producto_categorias', 'categoria_id', 'producto_id');
    }
}
