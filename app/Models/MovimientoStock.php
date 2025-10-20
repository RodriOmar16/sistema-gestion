<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\TipoMovimiento;
use App\Models\OrigenMovimiento;
use App\Models\Producto;
use App\Models\Proveedor;

class MovimientoStock extends Model
{
    /** @use HasFactory<\Database\Factories\MovimientoStockFactory> */
    use HasFactory;

    protected $table      = 'movimientos_stock';
    protected $primaryKey = 'movimiento_id';
    protected $fillable   = ['proveedor_id', 'producto_id', 'fecha', 'tipo_id', 'origen_id', 'cantidad'];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
    
    public function tipoMovimiento()
    {
        return $this->belongsTo(TipoMovimiento::class, 'tipo_id');
    }

    public function origenMovimiento()
    {
        return $this->belongsTo(OrigenMovimiento::class, 'origen_id');
    }
}
