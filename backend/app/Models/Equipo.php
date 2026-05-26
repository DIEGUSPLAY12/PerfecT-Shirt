<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    protected $table = 'Equipo';
    protected $primaryKey = 'Id_Equipo';

    protected $fillable = [
        'Nombre',
        'Pais',
        'Liga',
        'Api_Id',
        'Escudo_Url',
        'Camiseta_Url'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'Id_Equipo');
    }
}
