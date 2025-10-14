<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RutaRol extends Model
{
    protected $table = 'ruta_roles';
    public $timestamps = false;

    protected $fillable = ['ruta_id', 'rol_id'];
}

