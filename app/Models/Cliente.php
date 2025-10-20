<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Venta;

class Cliente extends Model
{
    protected $primaryKey = 'cliente_id';
    protected $fillable = ['nombre', 'fecha_nacimiento', 'domicilio', 'email', 'dni', 'inhabilitado'];

    public function ventas()
    {
        return $this->hasMany(Venta::class, 'cliente_id');
    }
}
