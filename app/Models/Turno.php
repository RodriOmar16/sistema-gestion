<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Caja;

class Turno extends Model
{
    /** @use HasFactory<\Database\Factories\TurnoFactory> */
    use HasFactory;

    protected $table      = 'turnos';
    protected $primaryKey = 'turno_id';
    protected $fillable   = ['nombre', 'inhabilitado'];

    public function cajas() {
        return $this->hasOne(Caja::class, 'turno_id');
    }
}
