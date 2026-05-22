<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductosPedido extends Model
{
    protected $table = 'Productos_Pedido';
    protected $primaryKey = 'Id_PP';
    public $timestamps = false;

    protected $fillable = [
        'Id_Pedido',
        'Id_Producto',
        'Cantidad',
        'Precio_Unitario',
    ];

    protected $casts = [
        'Precio_Unitario' => 'decimal:2',
    ];

    /**
     * Relación muchos a uno con Pedidos
     */
    public function pedido()
    {
        return $this->belongsTo(Pedidos::class, 'Id_Pedido', 'Id_Pedido');
    }

    /**
     * Relación muchos a uno con Producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'Id_Producto', 'Id_Producto');
    }
}
