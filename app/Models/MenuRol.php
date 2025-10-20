<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Rol;
use App\Models\MenuWeb;

class MenuRol extends Model
{
    protected $table = 'menu_roles';
    public $timestamps = false;

    protected $fillable = ['menu_id', 'rol_id'];

    public function roles(){
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function menus(){
       return $this->belongsTo(MenuWeb::class, 'menu_id'); 
    }
}
