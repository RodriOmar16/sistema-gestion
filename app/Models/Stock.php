<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Producto;

class Stock extends Model
{
    /** @use HasFactory<\Database\Factories\StockFactory> */
    use HasFactory;
    protected $primaryKey = 'stock_id';
    protected $table      = 'stocks';

    protected $fillable = ['producto_id', 'cantidad'];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
