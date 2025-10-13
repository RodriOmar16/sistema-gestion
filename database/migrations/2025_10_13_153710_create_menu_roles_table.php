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
        Schema::create('menu_roles', function (Blueprint $table) {
            $table->foreignId('menu_id')->constrained('menu_web', 'menu_id');
            $table->foreignId('rol_id')->constrained('roles', 'rol_id');
            $table->primary(['menu_id', 'rol_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_roles');
    }
};
