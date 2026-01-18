<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Producto;

class Marca extends Model
{
    protected $primaryKey = 'marca_id';
    protected $fillable = [
        'nombre', 'inhabilitada'
    ];

    public function productos(){
        return $this->hasMany(Producto::class, 'marca_id','marca_id');
    }
}


