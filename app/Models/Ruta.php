<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    protected $primaryKey = 'ruta_id';
    protected $fillable = ['url', 'inhabilitada'];

    public function menus()
    {
        return $this->belongsToMany(MenuWeb::class, 'menu_rutas', 'ruta_id', 'menu_id');
    }
}
