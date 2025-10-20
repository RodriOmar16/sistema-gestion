<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\VentaPago;
use App\Models\Venta;

class FormaPago extends Model
{
    protected $primaryKey = 'forma_pago_id';
    protected $fillable = ['nombre', 'descripcion', 'inhabilitada'];

    public function pagos()
    {
        return $this->hasMany(VentaPago::class, 'forma_pago_id');
    }
    public function ventas(){
        return $this->belongsToMany(Venta::class, 'ventas_pagos', 'forma_pago_id', 'venta_id');
    }
}
