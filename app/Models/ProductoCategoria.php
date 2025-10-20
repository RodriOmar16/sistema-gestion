<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Producto;
use App\Models\Categoria;

class ProductoCategoria extends Model
{
    protected $table = 'producto_categorias';
    public $timestamps = false;

    protected $fillable = ['producto_id', 'categoria_id'];

    public function productos(){
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function categorias(){
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}
