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
        Schema::create('categorias_gastos', function (Blueprint $table) {
            $table->id('categoria_gasto_id');
            $table->string('nombre');
            $table->boolean('inhabilitado')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('categorias_gastos');
    }
};
