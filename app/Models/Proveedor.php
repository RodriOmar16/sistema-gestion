<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ListaPrecio;
use App\Models\Gasto;
use App\Models\MovimientoStock;

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

    public function gastos(){
        return $this->hasMany(Gasto::class, 'proveedor_id');
    }

    public function movimientosStock(){
        return $this->hasMany(MovimientoStock::class, 'proveedor_id');
    }
}
