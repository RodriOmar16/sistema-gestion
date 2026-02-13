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
        Schema::table('gastos', function (Blueprint $table) {
            $table->unsignedBigInteger('forma_pago_id')->after('proveedor_id');

            $table->foreign('forma_pago_id')
                ->references('forma_pago_id')
                ->on('formas_pago');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropForeign(['forma_pago_id']);
            $table->dropColumn('forma_pago_id');
        });
    }
};
