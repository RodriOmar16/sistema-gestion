<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('det_ventas', function (Blueprint $table) {
            // agregamos la columna después de producto_id
            $table->decimal('precio_unitario', 10, 2)->after('producto_id');
        });
    }

    public function down(): void
    {
        Schema::table('det_ventas', function (Blueprint $table) {
            $table->dropColumn('precio_unitario');
        });
    }
};
