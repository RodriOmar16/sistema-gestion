<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaGasto extends Model
{
    protected $table = 'categorias_gastos';
    protected $primaryKey = 'categoria_gasto_id';
    protected $fillable = ['nombre', 'inhabilitado'];

    // Relación 1:N con gastos
    public function gastos()
    {
        return $this->hasMany(Gasto::class, 'categoria_gasto_id', 'categoria_gasto_id');
    }
}