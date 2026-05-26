<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'Producto';
    protected $primaryKey = 'Id_Producto';

    protected $fillable = [
        'Id_Equipo',
        'Nombre',
        'Temporada',
        'Tipo',
        'Precio',
        'Stock',
        'Imagen_Url'
    ];

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'Id_Equipo');
    }
}
