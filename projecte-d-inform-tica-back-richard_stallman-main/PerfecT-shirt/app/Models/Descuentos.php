<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Descuentos extends Model
{
    protected $table = 'Descuentos';
    protected $primaryKey = 'Id_Descuento';
    public $timestamps = false;

    protected $fillable = [
        'Codigo',
        'Porcentaje',
        'Fecha_Inicio',
        'Fecha_Fin',
    ];

    protected $casts = [
        'Porcentaje' => 'decimal:2',
        'Fecha_Inicio' => 'datetime',
        'Fecha_Fin' => 'datetime',
    ];
}
