<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    protected $primaryKey = 'permiso_id';
    protected $fillable = ['clave', 'descripcion', 'inhabilitado'];

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'user_permisos', 'permiso_id', 'user_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_permisos', 'permiso_id', 'rol_id');
    }
}
