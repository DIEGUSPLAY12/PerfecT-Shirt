<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketSoporte extends Model
{
    protected $table = 'Ticket_Soporte';
    protected $primaryKey = 'Id_Ticket';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Asunto',
        'Mensaje',
        'Estado',
        'Fecha_Creacion',
    ];

    protected $casts = [
        'Fecha_Creacion' => 'datetime',
    ];

    /**
     * Relación muchos a uno con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'Id_Usuario', 'Id_Usuario');
    }
}
