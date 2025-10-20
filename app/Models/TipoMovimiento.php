<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MovimientoStock;

class TipoMovimiento extends Model
{
    /** @use HasFactory<\Database\Factories\TipoMovimientoFactory> */
    use HasFactory;
    protected $table = 'tipos_movimiento';
    protected $primaryKey = 'tipo_id';
    protected $fillable = ['nombre', 'inhabilitado'];

    public function movimientos()
    {
        return $this->hasMany(MovimientoStock::class, 'tipo_id');
    }
}
