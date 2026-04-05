<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\VentasPagos;

class BancoBilletera extends Model
{
    /** @use HasFactory<\Database\Factories\BancoBilleteraFactory> */
    use HasFactory;

    protected $primaryKey = 'banco_billetera_id';
    protected $table      = 'bancos_billeteras';
    protected $fillable   = ['nombre','inhabilitado'];

    public function ventasPagos()
    {
        return $this->hasMany(VentasPagos::class, 'banco_billetera_id');
    }
}
