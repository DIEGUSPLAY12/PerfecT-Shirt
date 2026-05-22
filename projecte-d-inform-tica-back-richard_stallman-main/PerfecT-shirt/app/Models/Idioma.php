<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Idioma extends Model
{
    protected $table = 'Idioma';
    protected $primaryKey = 'Id_Idioma';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
    ];

    /**
     * Relación uno a muchos con Persona
     */
    public function personas()
    {
        return $this->hasMany(Persona::class, 'Id_Idioma', 'Id_Idioma');
    }
}
