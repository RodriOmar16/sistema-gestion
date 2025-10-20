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
        Schema::create('gastos', function (Blueprint $table) {
            $table->id('gasto_id');
            $table->unsignedBigInteger('caja_id');
            $table->foreign('caja_id')->references('caja_id')->on('cajas')->onDelete('restrict');
            $table->unsignedBigInteger('proveedor_id');
            $table->foreign('proveedor_id')->references('proveedor_id')->on('proveedores')->onDelete('restrict');
            $table->date('fecha');
            $table->decimal('monto', 10, 2);
            $table->string('descripcion');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gastos');
    }
};
