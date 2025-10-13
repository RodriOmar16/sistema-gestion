<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetVenta extends Model
{
    protected $primaryKey = 'det_venta_id';
    protected $fillable = ['venta_id', 'producto_id', 'cantidad', 'descuento', 'subtotal'];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
