<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuRol extends Model
{
    protected $table = 'menu_roles';
    public $timestamps = false;

    protected $fillable = ['menu_id', 'rol_id'];
}
