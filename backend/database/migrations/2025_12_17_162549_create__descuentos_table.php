<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Descuentos', function (Blueprint $table) {
            $table->id('Id_Descuento');
            $table->string('Codigo')->unique();
            $table->decimal('Porcentaje', 5, 2);
            $table->timestamp('Fecha_Inicio');
            $table->timestamp('Fecha_Fin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Descuentos');
    }
};
