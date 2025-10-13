<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VentaAnulada extends Model
{
    protected $primaryKey = 'venta_anulada_id';
    protected $fillable = ['venta_id', 'fecha_anulacion', 'motivo'];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }
}
