<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Categoria;
use App\Models\DetVenta;
use App\Models\ProductoLista;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    protected $fillable = ['nombre', 'descripcion', 'categoria_id', 'precio', 'inhabilitado'];

    // Relación directa con la categoría principal
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Relación con categorías secundarias a través de la tabla pivot
    public function categoriasSecundarias()
    {
        return $this->belongsToMany(Categoria::class, 'producto_categorias', 'producto_id', 'categoria_id');
    }

    // Relación con los detalles de venta
    public function detallesVenta()
    {
        return $this->hasMany(DetVenta::class, 'producto_id');
    }

    public function productosLista()
    {
        return $this->hasMany(ProductoLista::class, 'producto_id');
    }

}
