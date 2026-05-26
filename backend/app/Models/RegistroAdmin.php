<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistroAdmin extends Model
{
    protected $table = 'Registro_Admin';
    protected $primaryKey = 'Id_Registro';
    public $timestamps = false;

    protected $fillable = [
        'Id_Administrador',
        'Accion',
        'Fecha_Accion',
    ];

    protected $casts = [
        'Fecha_Accion' => 'datetime',
    ];

    /**
     * Relación muchos a uno con Administrador
     */
    public function administrador()
    {
        return $this->belongsTo(Administrador::class, 'Id_Administrador', 'Id_Administrador');
    }
}
