<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorias extends Model
{
    protected $table = 'Categorias';
    protected $primaryKey = 'Id_Categorias';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
        'Descripcion',
    ];

    /**
     * Relación uno a muchos con Producto
     */
    public function productos()
    {
        return $this->hasMany(Producto::class, 'Id_Categorias', 'Id_Categorias');
    }
}
