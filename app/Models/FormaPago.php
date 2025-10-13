<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormaPago extends Model
{
    protected $primaryKey = 'forma_pago_id';
    protected $fillable = ['nombre', 'descripcion', 'inhabilitada'];

    public function pagos()
    {
        return $this->hasMany(VentaPago::class, 'forma_pago_id');
    }
}
