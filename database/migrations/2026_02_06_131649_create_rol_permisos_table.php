<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('rol_permisos', function (Blueprint $table) {
            $table->id('rol_permiso_id');
            $table->unsignedBigInteger('permiso_id');
            $table->unsignedBigInteger('rol_id');

            $table->foreign('permiso_id')->references('permiso_id')->on('permisos');
            $table->foreign('rol_id')->references('rol_id')->on('roles');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rol_permisos');
    }
};
