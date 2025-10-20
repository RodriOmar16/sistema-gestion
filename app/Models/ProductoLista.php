<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Producto;
use App\Models\ListaPrecio;

class ProductoLista extends Model
{
    /** @use HasFactory<\Database\Factories\ProductoListaFactory> */
    use HasFactory;

    protected $table = 'productos_listas';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = true;

    protected $fillable = ['producto_id', 'lista_precio_id', 'precio_lista'];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function listaPrecio()
    {
        return $this->belongsTo(ListaPrecio::class, 'lista_precio_id');
    }
}
