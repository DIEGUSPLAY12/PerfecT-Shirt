<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Ofertas_Pujas', function (Blueprint $table) {
            $table->id('Id_Oferta');
            $table->unsignedBigInteger('Id_Puja');
            $table->unsignedBigInteger('Id_Usuario');
            $table->decimal('Cantidad_Ofrecida', 8, 2);
            $table->dateTime('Fecha');

            $table->foreign('Id_Puja')->references('Id_Puja')->on('Pujas')->onDelete('cascade');
            
            // CAMBIO APLICADO: Ahora apunta al 'id' de la tabla 'users'
            $table->foreign('Id_Usuario')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Ofertas_Pujas');
    }
};