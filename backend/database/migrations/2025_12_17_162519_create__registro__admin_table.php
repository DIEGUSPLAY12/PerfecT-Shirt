<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Registro_Admin', function (Blueprint $table) {
            $table->id('Id_Registro');
            $table->unsignedBigInteger('Id_Administrador');
            $table->string('Accion');
            $table->timestamp('Fecha_Accion');

            $table->foreign('Id_Administrador')
                  ->references('Id_Administrador')->on('Administrador');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Registro_Admin');
    }
};
