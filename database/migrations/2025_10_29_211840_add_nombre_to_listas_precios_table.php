<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
    Schema::table('listas_precios', function (Blueprint $table) {
        $table->string('nombre', 255)->after('proveedor_id');
    });
    }

    public function down()
    {
    Schema::table('listas_precios', function (Blueprint $table) {
        $table->dropColumn('nombre');
    });
    }

};
