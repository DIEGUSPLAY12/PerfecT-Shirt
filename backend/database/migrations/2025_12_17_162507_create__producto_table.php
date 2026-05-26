<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Producto', function (Blueprint $table) {
            $table->id('Id_Producto');
            $table->unsignedBigInteger('Id_Equipo');

            $table->string('Nombre');
            $table->string('Temporada')->nullable();
            $table->string('Tipo'); // local / visitante / tercera
            $table->decimal('Precio', 8, 2);
            $table->integer('Stock')->default(0);

            // Imagen camiseta
            $table->string('Imagen_Url')->nullable();

            $table->timestamps();

            $table->foreign('Id_Equipo')
                ->references('Id_Equipo')
                ->on('Equipo')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Producto');
    }
};
