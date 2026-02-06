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
        Schema::create('user_permisos', function (Blueprint $table) {
            $table->id('user_permiso_id');
            $table->unsignedBigInteger('permiso_id');
            $table->unsignedBigInteger('user_id'); // corresponde al id de Users

            $table->foreign('permiso_id')->references('permiso_id')->on('permisos');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_permisos');
    }
};
