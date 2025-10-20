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
        Schema::create('productos_listas', function (Blueprint $table) {
            $table->unsignedBigInteger('producto_id');
            $table->unsignedBigInteger('lista_precio_id');
            $table->primary(['producto_id', 'lista_precio_id']);
            $table->float('precio_lista');
            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('restrict');
            $table->foreign('lista_precio_id')->references('lista_precio_id')->on('listas_precios')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_listas');
    }
};
