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
        Schema::create('menu_rutas', function (Blueprint $table) {
            $table->foreignId('menu_id')->constrained('menu_web', 'menu_id');
            $table->foreignId('ruta_id')->constrained('rutas', 'ruta_id');
            $table->primary(['menu_id', 'ruta_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_rutas');
    }
};
