<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Persona', function (Blueprint $table) {
            $table->id('Id_Persona');
            $table->string('Nombre');
            $table->string('Apellidos');
            $table->string('Email')->unique();
            $table->string('Password');
            $table->date('Fecha_nacimiento');
            $table->unsignedBigInteger('Id_Idioma');

            $table->foreign('Id_Idioma')
                ->references('Id_Idioma')->on('Idioma');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Persona');
    }
};
