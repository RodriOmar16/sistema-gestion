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
        Schema::dropIfExists('productos_listas'); 
        Schema::dropIfExists('listas_precios');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
