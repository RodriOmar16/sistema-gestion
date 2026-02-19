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
        Schema::table('gastos', function (Blueprint $table) {
            // Primero quitamos la foreign key si existe
            $table->dropForeign(['caja_id']);

            // Luego modificamos la columna
            $table->bigInteger('caja_id')
                  ->nullable()   // permite valores nulos
                  ->change();    // permite enteros negativos, cero y positivos
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('gastos', function (Blueprint $table) {
            // revertimos a unsigned y no nulo
            $table->unsignedBigInteger('caja_id')->nullable(false)->change();

            // si querés volver a poner la FK
            $table->foreign('caja_id')->references('caja_id')->on('cajas');
        });
    }
};
