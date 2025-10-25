<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Rol;
use App\Models\MenuRol;
use App\Models\Ruta;

class MenuWeb extends Model
{
    protected $table = 'menu_web';
    protected $primaryKey = 'menu_id';
    protected $fillable = ['nombre', 'padre', 'orden', 'inhabilitado', 'icono', 'ruta_id'];

    public function roles(){
        return $this->belongsToMany(Rol::class, 'menu_roles', 'menu_id', 'rol_id');
    }

    public function menuRoles(){
        return $this->hasMany(MenuRol::class, 'menu_id');
    }

    //No borrar esta es para el menu
    public function ruta(){
        return $this->belongsTo(Ruta::class, 'ruta_id', 'ruta_id');
    }

    //conecto a si misma por el padre
    public function padreMenu()
    {
        return $this->belongsTo(MenuWeb::class, 'padre', 'menu_id');
    }

}
