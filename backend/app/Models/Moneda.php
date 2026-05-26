<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Moneda extends Model
{
    protected $table = 'Moneda';
    protected $primaryKey = 'Id_Moneda';
    public $timestamps = false;

    protected $fillable = [
        'Nombre',
        'Simbolo',
    ];

    /**
     * Relación uno a muchos con Pagos
     */
    public function pagos()
    {
        return $this->hasMany(Pagos::class, 'Id_Moneda', 'Id_Moneda');
    }
}
