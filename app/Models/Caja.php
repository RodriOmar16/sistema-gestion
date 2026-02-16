<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Turno;
use App\Models\Gasto;
use App\Models\Proveedor;

class Caja extends Model
{
    /** @use HasFactory<\Database\Factories\CajaFactory> */
    use HasFactory;
    protected $table = 'cajas';
    protected $primaryKey = 'caja_id';
    protected $fillable = [
        'turno_id',
        'fecha',
        'monto_inicial',
        'descripcion',
        'efectivo',
        'debito',
        'transferencia',
        'efectivo_user',
        'debito_user',
        'transferencia_user',
        'total_sistema',
        'total_user',
        'diferencia',
        'user_grabacion',
        'inhabilitado'
    ];

    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }

    //gasto / proveedor
    public function gastos() {
        return $this->hasMany(Gasto::class, 'caja_id');
    }
    public function proveedores(){
        return $this->belongsToMany(Proveedor::class,'gastos', 'caja_id', 'proveedor_id');
    }
}
