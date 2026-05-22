<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Ticket_Soporte', function (Blueprint $table) {
            $table->id('Id_Ticket');
            $table->unsignedBigInteger('Id_Usuario');
            $table->string('Asunto');
            $table->text('Mensaje');
            $table->string('Estado')->default('Abierto');
            $table->timestamp('Fecha_Creacion');

            $table->foreign('Id_Usuario')
                  ->references('Id_Usuario')->on('Usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Ticket_Soporte');
    }
};
