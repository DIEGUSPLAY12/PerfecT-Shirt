<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Cookies', function (Blueprint $table) {
            $table->id('Id_Cookie');
            $table->unsignedBigInteger('Id_Usuario');
            $table->string('Token');
            $table->timestamp('Fecha_Creacion');
            $table->timestamp('Fecha_Expiracion');

            $table->foreign('Id_Usuario')
                  ->references('Id_Usuario')->on('Usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Cookies');
    }
};
