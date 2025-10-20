<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Rol;
use App\Models\RutaRol;

class Ruta extends Model
{
    protected $primaryKey = 'ruta_id';
    protected $fillable = ['url', 'inhabilitada'];

    /*public function menus()
    {
        return $this->belongsToMany(MenuWeb::class, 'menu_rutas', 'ruta_id', 'menu_id');
    }*/

    public function roles(){
        return $this->hasMany(RutaRol::class, 'ruta_id');
    }
    public function rutasRoles()
    {
        return $this->belongsToMany(Rol::class, 'ruta_roles', 'ruta_id', 'rol_id');
    }
}
