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
        Schema::create('movimientos_stock', function (Blueprint $table) {
            $table->id('movimiento_id');
            $table->unsignedBigInteger('producto_id');
            $table->foreign('producto_id')->references('producto_id')->on('productos')->onDelete('restrict');
            $table->unsignedBigInteger('proveedor_id');
            $table->foreign('proveedor_id')->references('proveedor_id')->on('proveedores')->onDelete('restrict');
            $table->unsignedBigInteger('tipo_id');
            $table->foreign('tipo_id')->references('tipo_id')->on('tipos_movimiento')->onDelete('restrict');
            $table->unsignedBigInteger('origen_id');
            $table->foreign('origen_id')->references('origen_id')->on('origen_movimientos')->onDelete('restrict');
            $table->date('fecha');
            $table->integer('cantidad');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movimientos_stock');
    }
};
