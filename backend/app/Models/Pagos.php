<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pagos extends Model
{
    protected $table = 'Pagos';
    protected $primaryKey = 'Id_Pago';
    public $timestamps = false;

    protected $fillable = [
        'Id_Pedido',
        'Id_Moneda',
        'Cantidad',
        'Metodo_Pago',
        'Fecha',
    ];

    protected $casts = [
        'Cantidad' => 'decimal:2',
        'Fecha' => 'datetime',
    ];

    /**
     * Relación muchos a uno con Pedidos
     */
    public function pedido()
    {
        return $this->belongsTo(Pedidos::class, 'Id_Pedido', 'Id_Pedido');
    }

    /**
     * Relación muchos a uno con Moneda
     */
    public function moneda()
    {
        return $this->belongsTo(Moneda::class, 'Id_Moneda', 'Id_Moneda');
    }
}
