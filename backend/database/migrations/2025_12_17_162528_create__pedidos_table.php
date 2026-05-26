<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Pedidos', function (Blueprint $table) {
            $table->id('Id_Pedido');
            $table->unsignedBigInteger('Id_Usuario');
            $table->timestamp('Fecha');
            $table->decimal('Total', 10, 2);

            $table->foreign('Id_Usuario')
                  ->references('Id_Usuario')->on('Usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Pedidos');
    }
};
