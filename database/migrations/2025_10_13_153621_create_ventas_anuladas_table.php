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
        Schema::create('ventas_anuladas', function (Blueprint $table) {
            $table->id('venta_anulada_id');
            $table->foreignId('venta_id')->constrained('ventas', 'venta_id');
            $table->dateTime('fecha_anulacion');
            $table->text('motivo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas_anuladas');
    }
};
