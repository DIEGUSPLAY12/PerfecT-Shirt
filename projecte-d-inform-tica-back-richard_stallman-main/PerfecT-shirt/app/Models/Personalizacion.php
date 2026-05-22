<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personalizacion extends Model
{
    protected $table = 'Personalizacion';
    protected $primaryKey = 'Id_Personalizacion';
    public $timestamps = false;

    protected $fillable = [
        'Id_Producto',
        'Tipo',
        'Valor',
    ];

    /**
     * Relación muchos a uno con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'Id_Producto', 'Id_Producto');
    }
}
