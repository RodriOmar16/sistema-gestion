<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuWeb extends Model
{
    protected $primaryKey = 'menu_id';
    protected $fillable = ['nombre', 'padre', 'orden', 'inhabilitado', 'icono'];

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'menu_roles', 'menu_id', 'rol_id');
    }

    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'menu_rutas', 'menu_id', 'ruta_id');
    }
}
