<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfertasPujas extends Model
{
    protected $table = 'Ofertas_Pujas';
    protected $primaryKey = 'Id_Oferta';
    public $timestamps = false;

    // AÑADIDO: Id_Usuario
    protected $fillable = [
        'Id_Puja',
        'Id_Usuario', 
        'Cantidad_Ofrecida',
        'Fecha',
    ];

    protected $casts = [
        'Cantidad_Ofrecida' => 'decimal:2',
        'Fecha' => 'datetime',
    ];

    public function puja()
    {
        return $this->belongsTo(Pujas::class, 'Id_Puja', 'Id_Puja');
    }

    // NUEVO: Relación con el usuario que hace la oferta
    public function usuario()
    {
        return $this->belongsTo(User::class, 'Id_Usuario', 'id');
    }
}