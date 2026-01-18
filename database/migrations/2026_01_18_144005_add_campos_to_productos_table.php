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
        Schema::table('productos', function (Blueprint $table) {
            $table->string('codigo_barra')->nullable()->after('precio');
            $table->integer('stock_minimo')->default(0)->after('codigo_barra');
            $table->date('vencimiento')->nullable()->after('stock_minimo');
            $table->string('imagen')->nullable()->after('vencimiento');
            //$table->unsignedBigInteger('marca_id')->nullable()->after('imagen');
            //$table->foreign('marca_id')->references('marca_id')->on('marcas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('productos', function (Blueprint $table) {
            //$table->dropForeign(['marca_id']);
            $table->dropColumn(['codigo_barra', 'stock_minimo', 'vencimiento', 'imagen', 'marca_id']);
        });
    }

};
