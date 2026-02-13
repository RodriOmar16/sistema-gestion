<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Caja;
use App\Models\Proveedor;

class Gasto extends Model
{
    /** @use HasFactory<\Database\Factories\GastoFactory> */
    use HasFactory;

    protected $table      = 'gastos';
    protected $primaryKey = 'gasto_id';
    protected $fillable   = ['caja_id', 'proveedor_id', 'forma_pago_id', 'fecha', 'monto', 'descripcion', 'inhabilitado'];

    public function caja(){
        return $this->belongsTo(Caja::class, 'caja_id');
    }

    public function proveedor(){
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class, 'forma_pago_id', 'forma_pago_id');
    }

}
