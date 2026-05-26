<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Categorias', function (Blueprint $table) {
            $table->id('Id_Categorias');
            $table->string('Nombre');
            $table->string('Descripcion')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Categorias');
    }
};
