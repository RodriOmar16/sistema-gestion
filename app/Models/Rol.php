<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'rol_id';
    protected $fillable = ['nombre', 'inhabilitado'];

    public function menus()
    {
        return $this->belongsToMany(MenuWeb::class, 'menu_roles', 'rol_id', 'menu_id');
    }

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuarios_roles', 'rol_id', 'user_id');
    }
    
    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'ruta_roles', 'rol_id', 'ruta_id');
    }

}
