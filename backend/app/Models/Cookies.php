<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cookies extends Model
{
    protected $table = 'Cookies';
    protected $primaryKey = 'Id_Cookie';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Token',
        'Fecha_Creacion',
        'Fecha_Expiracion',
    ];

    protected $casts = [
        'Fecha_Creacion' => 'datetime',
        'Fecha_Expiracion' => 'datetime',
    ];

    /**
     * Relación muchos a uno con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'Id_Usuario', 'Id_Usuario');
    }
}
