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
        Schema::create('ruta_roles', function (Blueprint $table) {
            $table->foreignId('ruta_id')->constrained('rutas', 'ruta_id');
            $table->foreignId('rol_id')->constrained('roles', 'rol_id');
            $table->primary(['ruta_id', 'rol_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruta_roles');
    }
};
