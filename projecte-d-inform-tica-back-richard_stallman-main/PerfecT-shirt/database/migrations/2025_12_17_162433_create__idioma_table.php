<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Idioma', function (Blueprint $table) {
            $table->id('Id_Idioma');
            $table->string('Nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Idioma');
    }
};
