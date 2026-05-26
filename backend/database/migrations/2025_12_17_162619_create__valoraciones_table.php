<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Valoraciones', function (Blueprint $table) {
            $table->id('Id_Valoracion');
            $table->unsignedBigInteger('Id_Usuario');
            $table->unsignedBigInteger('Id_Producto');
            $table->tinyInteger('Puntuacion');
            $table->text('Comentario')->nullable();
            $table->timestamp('Fecha');

            $table->foreign('Id_Usuario')
                  ->references('Id_Usuario')->on('Usuario');

            $table->foreign('Id_Producto')
                  ->references('Id_Producto')->on('Producto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Valoraciones');
    }
};
