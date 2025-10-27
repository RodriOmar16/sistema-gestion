<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\Rol;

class UsuarioRol extends Model
{
    protected $table = 'usuarios_roles';
    public $timestamps = false;

    protected $fillable = ['user_id', 'rol_id'];

    public function roles(){
        return $this->belongsTo(Rol::class, 'rol_id');
    }
    public function users(){
        return $this->belongsTo(User::class, 'user_id');
    }
}
