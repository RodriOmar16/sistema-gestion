<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ListaPrecio;

class Proveedor extends Model
{
    /** @use HasFactory<\Database\Factories\ProveedorFactory> */
    use HasFactory;

    protected $primaryKey = 'proveedor_id';
    protected $table      = 'proveedores';

    protected $fillable = ['nombre', 'descripcion', 'razon_social', 'cuit', 'nro_telefono','inhabilitado'];

    public function listaPrecios(){
        return $this->hasMany(ListaPrecio::class, 'proveedor_id');
    }
}
