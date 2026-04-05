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
        Schema::table('ventas_pagos', function (Blueprint $table) {
            $table->unsignedBigInteger('banco_billetera_id')->nullable()->after('monto');
            $table->string('titular')->nullable()->after('monto');
            $table->string('cbu_nro_comprobante')->nullable()->after('titular');
            $table->unsignedBigInteger('estado_id')->nullable()->after('cbu_nro_comprobante');

            // Relaciones
            $table->foreign('banco_billetera_id')->references('banco_billetera_id')->on('bancos_billeteras');
            $table->foreign('estado_id')->references('estado_id')->on('estados_operaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas_pagos', function (Blueprint $table) {
            $table->dropForeign(['banco_billetera_id']);
            $table->dropForeign(['estado_id']);
            $table->dropColumn(['banco_billetera_id','titular','cbu_nro_comprobante','estado_id']);
        });
    }
};
