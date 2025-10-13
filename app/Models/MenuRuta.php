<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuRuta extends Model
{
    protected $table = 'menu_rutas';
    public $timestamps = false;

    protected $fillable = ['menu_id', 'ruta_id'];
}
