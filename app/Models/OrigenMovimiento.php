<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\MovimientoStock;

class OrigenMovimiento extends Model
{
    /** @use HasFactory<\Database\Factories\OrigenMovimientoFactory> */
    use HasFactory;
    protected $table = 'origen_movimientos';
    protected $primaryKey = 'origen_id';
    protected $fillable = ['nombre', 'inhabilitado'];

    public function movimientos()
    {
        return $this->hasMany(MovimientoStock::class, 'origen_id');
    }
}
