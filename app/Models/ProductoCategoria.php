<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoCategoria extends Model
{
    protected $table = 'producto_categorias';
    public $timestamps = false;

    protected $fillable = ['producto_id', 'categoria_id'];
}
