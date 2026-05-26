<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'Persona';
    protected $primaryKey = 'Id_Persona';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
        'Apellidos',
        'Email',
        'Password',
        'Fecha_nacimiento',
        'Id_Idioma',
    ];

    protected $hidden = [
        'Password',
    ];

    protected $casts = [
        'Fecha_nacimiento' => 'date',
    ];

    /**
     * Relación muchos a uno con Idioma
     */
    public function idioma()
    {
        return $this->belongsTo(Idioma::class, 'Id_Idioma', 'Id_Idioma');
    }

    /**
     * Relación uno a uno con Usuario
     */
    public function usuario()
    {
        return $this->hasOne(Usuario::class, 'Id_Persona', 'Id_Persona');
    }

    /**
     * Relación uno a uno con Administrador
     */
    public function administrador()
    {
        return $this->hasOne(Administrador::class, 'Id_Persona', 'Id_Persona');
    }
}
