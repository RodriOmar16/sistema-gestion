<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioRol extends Model
{
    protected $table = 'usuarios_roles';
    public $timestamps = false;

    protected $fillable = ['user_id', 'rol_id'];
}
