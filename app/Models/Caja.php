<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Turno;
use App\Models\Gasto;

class Caja extends Model
{
    /** @use HasFactory<\Database\Factories\CajaFactory> */
    use HasFactory;
    protected $table = 'cajas';
    protected $primaryKey = 'caja_id';
    protected $fillable = ['turno_id', 'fecha', 'monto_inicial', 'descripcion', 'efectivo', 'debito', 'transferencia'];

    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }

    public function gastos() {
        return $this->hasMany(Gasto::class, 'caja_id');
    }
}
