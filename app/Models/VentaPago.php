<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Venta;
use App\Models\FormaPago;

class VentaPago extends Model
{
    protected $primaryKey = 'venta_pago_id';
    protected $fillable = ['venta_id', 'forma_pago_id', 'fecha_pago', 'monto'];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class, 'forma_pago_id');
    }
}
