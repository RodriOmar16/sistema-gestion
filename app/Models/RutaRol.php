<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Rol;
use App\Models\Ruta;

class RutaRol extends Model
{
    protected $table = 'ruta_roles';
    public $timestamps = false;

    protected $fillable = ['ruta_id', 'rol_id'];

    public function roles(){
        return $this->belongsTo(Rol::class, 'rol_id');
    }
    public function rutas(){
        return $this->belongsTo(Ruta::class, 'ruta_id');
    }
}

