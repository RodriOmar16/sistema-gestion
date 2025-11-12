<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Cliente;
use App\Models\DetVenta;
use App\Models\Producto;
use App\Models\VentaPago;
use App\Models\FormaPago;
use App\Models\VentaAnulada;

class Venta extends Model
{
    protected $primaryKey = 'venta_id';
    protected $table      = 'ventas';
    protected $fillable   = ['fecha_grabacion', 'cliente_id', 'fecha_anulacion', 'anulada', 'total'];
    protected $casts = [
        'fecha_grabacion' => 'datetime',
        'fecha_anulacion' => 'datetime',
    ];

    //Cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    //detalles/productos
    public function detalles()
    {
        return $this->hasMany(DetVenta::class, 'venta_id');
    }
    public function productos(){
        return $this->belongsToMany(Producto::class, 'det_ventas', 'venta_id','producto_id');
    }

    //venta_pagos
    public function pagos()
    {
        return $this->hasMany(VentaPago::class, 'venta_id');
    }
    public function formasPago(){
        return $this->belongsToMany(FormaPago::class, 'ventas_pagos', 'venta_id', 'forma_pago_id');
    }

    //anulacion
    public function anulacion()
    {
        return $this->hasOne(VentaAnulada::class, 'venta_id');
    }
}
