<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\ListaPrecio;
use App\Models\Gasto;
use App\Models\Caja;
use App\Models\MovimientoStock;
use App\Models\Producto;

class Proveedor extends Model
{
    /** @use HasFactory<\Database\Factories\ProveedorFactory> */
    use HasFactory;

    protected $primaryKey = 'proveedor_id';
    protected $table      = 'proveedores';

    protected $fillable = ['nombre', 'descripcion', 'razon_social', 'cuit', 'nro_telefono','inhabilitado'];

    //lista de precios
    public function listaPrecios(){
        return $this->hasMany(ListaPrecio::class, 'proveedor_id');
    }

    //caja
    public function gastos(){
        return $this->hasMany(Gasto::class, 'proveedor_id');
    }
    public function cajas(){
        return $this->belongsToMany(Caja::class, 'gastos', 'proveedor_id', 'caja_id');
    }

    //productos
    public function movimientosStock(){
        return $this->hasMany(MovimientoStock::class, 'proveedor_id');
    }
    public function productos(){
        return $this->belongsToMany(Producto::class, 'movimientos_stock', 'proveedor_id', 'producto_id');
    }
}
