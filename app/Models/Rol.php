<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\UsuarioRol;
use App\Models\MenuWeb;
use App\Models\MenuRol;
use App\Models\Ruta;
use App\Models\RutaRol;

class Rol extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'rol_id';
    protected $fillable = ['nombre', 'inhabilitado'];

    //menu
    public function menuRoles(){
        return $this->hasMany(MenuRol::class, 'rol_id');
    }
    public function menus()
    {
        return $this->belongsToMany(MenuWeb::class, 'menu_roles', 'rol_id', 'menu_id');
    }    

    //users
    public function usersRoles(){
        return $this->hasMany(UsuarioRol::class, 'rol_id');
    }
    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuarios_roles', 'rol_id', 'user_id');
    }
        
    //rutas
    public function rutasRoles(){
        return $this->hasMany(RutaRol::class, 'rol_id');
    }
    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'ruta_roles', 'rol_id', 'ruta_id');
    }
    
}
