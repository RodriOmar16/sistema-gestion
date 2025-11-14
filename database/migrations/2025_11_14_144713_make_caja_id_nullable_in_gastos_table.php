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
            //elimino la FK si existe
            $table->dropForeign(['caja_id']);
            //modifico el campo para que acepte null
            $table->unsignedBigInteger('caja_id')->nullable()->change();
            //se crea la relacion con cajas
            $table->foreign('caja_id')->references('caja_id')->on('cajas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropForeign(['caja_id']);
            $table->unsignedBigInteger('caja_id')->nullable(false)->change();
            $table->foreign('caja_id')->references('caja_id')->on('cajas')->restrictOnDelete();
        });
    }
};
