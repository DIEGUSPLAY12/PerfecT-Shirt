<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Administrador', function (Blueprint $table) {
            $table->id('Id_Administrador');
            $table->unsignedBigInteger('Id_Persona');
            $table->string('Rol');

            $table->foreign('Id_Persona')
                  ->references('Id_Persona')->on('Persona');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Administrador');
    }
};
