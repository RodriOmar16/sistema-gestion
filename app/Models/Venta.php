<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $primaryKey = 'venta_id';
    protected $fillable = ['fecha_grabacion', 'cliente_id', 'fecha_anulacion', 'anulada', 'total'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetVenta::class, 'venta_id');
    }

    public function pagos()
    {
        return $this->hasMany(VentaPago::class, 'venta_id');
    }

    public function anulacion()
    {
        return $this->hasOne(VentaAnulada::class, 'venta_id');
    }
}
