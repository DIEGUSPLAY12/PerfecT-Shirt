<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Pagos', function (Blueprint $table) {
            $table->id('Id_Pago');
            $table->unsignedBigInteger('Id_Pedido');
            $table->unsignedBigInteger('Id_Moneda');
            $table->decimal('Cantidad', 10, 2);
            $table->string('Metodo_Pago');
            $table->timestamp('Fecha');

            $table->foreign('Id_Pedido')
                  ->references('Id_Pedido')->on('Pedidos');

            $table->foreign('Id_Moneda')
                  ->references('Id_Moneda')->on('Moneda');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Pagos');
    }
};
