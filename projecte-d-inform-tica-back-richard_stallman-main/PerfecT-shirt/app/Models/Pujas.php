<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pujas extends Model
{
    protected $table = 'Pujas';
    protected $primaryKey = 'Id_Puja';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Id_Producto',
        'Cantidad',
        'Fecha',
    ];

    protected $casts = [
        'Cantidad' => 'decimal:2',
        'Fecha' => 'datetime',
    ];

    /**
     * CAMBIO APLICADO: Apunta al modelo User de Laravel y a su 'id'
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'Id_Usuario', 'id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'Id_Producto', 'Id_Producto');
    }

    public function ofertas()
    {
        return $this->hasMany(OfertasPujas::class, 'Id_Puja', 'Id_Puja');
    }
}