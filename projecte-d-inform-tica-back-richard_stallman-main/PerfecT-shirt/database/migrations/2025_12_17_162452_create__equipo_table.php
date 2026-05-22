<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Equipo', function (Blueprint $table) {
            $table->id('Id_Equipo');
            $table->string('Nombre');
            $table->string('Pais')->nullable();
            $table->string('Liga')->nullable();

            // Datos de TheSportsDB
            $table->string('Api_Id')->unique(); // idTeam
            $table->string('Escudo_Url')->nullable();
            $table->string('Camiseta_Url')->nullable();

            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('Equipo');
    }
};
