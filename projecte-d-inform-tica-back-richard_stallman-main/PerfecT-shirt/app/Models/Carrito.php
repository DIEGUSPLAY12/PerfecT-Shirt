<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrito extends Model
{
    protected $table = 'Carrito';
    protected $primaryKey = 'Id_Carrito';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Id_Producto',
        'Cantidad',
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
