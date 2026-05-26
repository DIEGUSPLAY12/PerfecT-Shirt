<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Productos_Pedido', function (Blueprint $table) {
            $table->id('Id_PP');
            $table->unsignedBigInteger('Id_Pedido');
            $table->unsignedBigInteger('Id_Producto');
            $table->integer('Cantidad');
            $table->decimal('Precio_Unitario', 10, 2);

            $table->foreign('Id_Pedido')
                  ->references('Id_Pedido')->on('Pedidos');

            $table->foreign('Id_Producto')
                  ->references('Id_Producto')->on('Producto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Productos_Pedido');
    }
};
