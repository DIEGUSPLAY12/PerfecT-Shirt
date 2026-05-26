<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Administrador extends Model
{
    protected $table = 'Administrador';
    protected $primaryKey = 'Id_Administrador';
    public $timestamps = false;

    protected $fillable = [
        'Id_Persona',
        'Rol',
    ];

    /**
     * Relación muchos a uno con Persona
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'Id_Persona', 'Id_Persona');
    }

    /**
     * Relación uno a muchos con RegistroAdmin
     */
    public function registros()
    {
        return $this->hasMany(RegistroAdmin::class, 'Id_Administrador', 'Id_Administrador');
    }
}
