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
        Schema::table('cajas', function (Blueprint $table) {
            $table->decimal('total_sistema', 10, 2)->after('transferencia');
            $table->decimal('total_user', 10, 2)->after('total_sistema');
            $table->decimal('diferencia', 10, 2)->after('total_user');
            $table->string('user_grabacion', 255)->after('diferencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cajas', function (Blueprint $table) {
            $table->dropColumn(['total_sistema', 'total_user', 'diferencia', 'user_grabacion']);
        });
    }
};
