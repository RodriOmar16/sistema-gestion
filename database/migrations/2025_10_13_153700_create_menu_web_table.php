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
        Schema::create('menu_web', function (Blueprint $table) {
            $table->id('menu_id');
            $table->string('nombre');
            $table->foreignId('padre')->nullable()->constrained('menu_web', 'menu_id');
            $table->integer('orden')->default(0);
            $table->string('icono')->nullable();
            $table->boolean('inhabilitado')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_web');
    }
};
