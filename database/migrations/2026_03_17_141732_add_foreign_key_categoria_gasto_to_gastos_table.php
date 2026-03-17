<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            // agregar la foreign key (la columna ya existe)
            $table->foreign('categoria_gasto_id')
                  ->references('categoria_gasto_id')
                  ->on('categorias_gastos');
        });
    }

    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            // quitar la foreign key
            $table->dropForeign(['categoria_gasto_id']);
        });
    }
};