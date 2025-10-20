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
        Schema::create('cajas', function (Blueprint $table) {
            $table->id('caja_id');
            $table->unsignedBigInteger('turno_id');
            $table->foreign('turno_id')->references('turno_id')->on('turnos')->onDelete('restrict');
            $table->date('fecha');
            $table->decimal('monto_inicial', 10, 2);
            $table->string('descripcion');
            $table->decimal('efectivo', 10, 2);
            $table->decimal('debito', 10, 2);
            $table->decimal('transferencia', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};
