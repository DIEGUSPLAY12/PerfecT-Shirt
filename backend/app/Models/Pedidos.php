<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedidos extends Model
{
    protected $table = 'Pedidos';
    protected $primaryKey = 'Id_Pedido';
    public $timestamps = false;

    protected $fillable = [
        'Id_Usuario',
        'Fecha',
        'Total',
    ];

    protected $casts = [
        'Fecha' => 'datetime',
        'Total' => 'decimal:2',
    ];

    /**
     * Relación muchos a uno con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'Id_Usuario', 'Id_Usuario');
    }

    /**
     * Relación muchos a muchos con Producto a través de ProductosPedido
     */
    public function productos()
    {
        return $this->belongsToMany(
            Producto::class,
            'Productos_Pedido',
            'Id_Pedido',
            'Id_Producto',
            'Id_Pedido',
            'Id_Producto'
        )->withPivot('Cantidad', 'Precio_Unitario');
    }

    /**
     * Relación uno a muchos con ProductosPedido
     */
    public function productosPedido()
    {
        return $this->hasMany(ProductosPedido::class, 'Id_Pedido', 'Id_Pedido');
    }

    /**
     * Relación uno a muchos con Pagos
     */
    public function pagos()
    {
        return $this->hasMany(Pagos::class, 'Id_Pedido', 'Id_Pedido');
    }
}