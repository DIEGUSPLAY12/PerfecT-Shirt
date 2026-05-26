<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Usuario', function (Blueprint $table) {
            $table->id('Id_Usuario');
            $table->unsignedBigInteger('Id_Persona');
            $table->string('Username');
            $table->date('Fecha_Registro');
            $table->boolean('Verificado')->default(false);

            $table->foreign('Id_Persona')
                ->references('Id_Persona')->on('Persona');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Usuario');
    }
};
