<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListaPrecioProducto extends Model
{
    use HasFactory;

    protected $table = 'lista_precios_productos';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'proveedor_id',
        'producto_id',
        'precio',
        'porcentaje',
        'precio_sugerido',
    ];

    /**
     * Relación: un registro pertenece a un proveedor
     */
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id', 'proveedor_id');
    }

    /**
     * Relación: un registro pertenece a un producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
