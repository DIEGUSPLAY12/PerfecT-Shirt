<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Valoraciones extends Model
{
    protected $table = 'Valoraciones';
    protected $primaryKey = 'Id_Valoracion';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Id_Producto',
        'Puntuacion',
        'Comentario',
        'Fecha',
    ];

    protected $casts = [
        'Fecha' => 'datetime',
    ];

    /**
     * Relación muchos a uno con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'Id_Usuario', 'Id_Usuario');
    }

    /**
     * Relación muchos a uno con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'Id_Producto', 'Id_Producto');
    }
}
