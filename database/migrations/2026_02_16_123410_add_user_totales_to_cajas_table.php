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
        Schema::table('cajas', function (Blueprint $table) {
            $table->decimal('efectivo_user', 10, 2)->after('efectivo');
            $table->decimal('debito_user', 10, 2)->after('debito');
            $table->decimal('transferencia_user', 10, 2)->after('transferencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cajas', function (Blueprint $table) {
            $table->dropColumn(['efectivo_user', 'debito_user', 'transferencia_user']);
        });
    }
};
