<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // cambiar la columna a nullable
        DB::statement('ALTER TABLE gastos MODIFY categoria_gasto_id BIGINT(20) UNSIGNED NULL');
    }

    public function down(): void
    {
        // revertir a NOT NULL
        DB::statement('ALTER TABLE gastos MODIFY categoria_gasto_id BIGINT(20) UNSIGNED NOT NULL');
    }
};