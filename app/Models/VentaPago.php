<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Venta;
use App\Models\FormaPago;
use App\Models\BancoBilletera;
use App\Models\EstadoOperacion;

class VentaPago extends Model
{
    protected $primaryKey = 'venta_pago_id';
    protected $table      = 'ventas_pagos';
    protected $fillable = [
        'venta_id','forma_pago_id','fecha_pago','monto',
        'titular','banco_billetera_id','cbu_nro_comprobante','estado_id'
    ];

    public function venta()
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class, 'forma_pago_id');
    }

    public function bancoBilletera()
    {
        return $this->belongsTo(BancoBilletera::class, 'banco_billetera_id');
    }

    public function estadoOperacion()
    {
        return $this->belongsTo(EstadoOperacion::class, 'estado_id');
    }
}
