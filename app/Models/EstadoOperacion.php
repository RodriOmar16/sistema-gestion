<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\VentasPagos;

class EstadoOperacion extends Model
{
    /** @use HasFactory<\Database\Factories\EstadoOperacionFactory> */
    use HasFactory;

    protected $primaryKey = 'estado_id';
    protected $table      = 'estados_operaciones';
    protected $fillable = ['descripcion','inhabilitado'];

    public function ventasPagos()
    {
        return $this->hasMany(VentasPagos::class, 'estado_id');
    }
}
