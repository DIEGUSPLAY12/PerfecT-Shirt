<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Pujas', function (Blueprint $table) {
            $table->id('Id_Puja');
            $table->unsignedBigInteger('Id_Usuario');
            $table->unsignedBigInteger('Id_Producto');
            $table->decimal('Cantidad', 8, 2);
            $table->dateTime('Fecha');

            // CAMBIO APLICADO: Ahora apunta al 'id' de la tabla 'users'
            $table->foreign('Id_Usuario')->references('id')->on('users')->onDelete('cascade');
            
            $table->foreign('Id_Producto')->references('Id_Producto')->on('Producto')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Pujas');
    }
};