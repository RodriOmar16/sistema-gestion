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
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('proveedor_id');
            $table->string('nombre');
            $table->string('descripcion');
            $table->string('razon_social');
            $table->unsignedBigInteger('cuit');
            $table->string('nro_telefono'); 
            $table->boolean('inhabilitado')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedors');
    }
};
