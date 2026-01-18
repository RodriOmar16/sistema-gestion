<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lista_precios_productos', function (Blueprint $table) { 
            $table->id(); 
            $table->unsignedBigInteger('proveedor_id');
            $table->foreign('proveedor_id')->references('proveedor_id')->on('proveedores');
            $table->unsignedBigInteger('producto_id');
            $table->foreign('producto_id')->references('producto_id')->on('productos');
            $table->float('precio'); 
            $table->float('porcentaje')->default(0); 
            $table->float('precio_sugerido'); 
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lista_precios_productos');
    }
};
