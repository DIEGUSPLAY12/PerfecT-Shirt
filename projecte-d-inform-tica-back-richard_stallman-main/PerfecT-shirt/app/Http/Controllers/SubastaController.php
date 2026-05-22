<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pujas;
use App\Models\Producto;
use App\Models\Equipo;
use App\Models\User;
use App\Models\OfertasPujas;
use App\Services\TheSportsDbService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Notificacion;

class SubastaController extends Controller
{
    protected $sportsService;

    public function __construct(TheSportsDbService $sportsService)
    {
        $this->sportsService = $sportsService;
    }

    public function obtenerSubastasDiarias()
    {
        $hoy = Carbon::today();

        $subastasHoy = Pujas::with(['producto.equipo'])
            ->whereDate('Fecha', '=', $hoy)
            ->get();

        if ($subastasHoy->count() >= 4) {
            return response()->json([
                'status' => 'success',
                'origen' => 'base_de_datos',
                'data' => $this->formatearSubastas($subastasHoy->take(4))
            ]);
        }

        $usuarioSistema = User::first(); 
        if (!$usuarioSistema) {
            return response()->json(['error' => 'Falta ejecutar el seeder para tener un usuario inicial'], 500);
        }

        $todasLasCamisetas = $this->sportsService->obtenerTop5Ligas();
        $camisetasElegidas = collect($todasLasCamisetas)->shuffle()->take(4);
        $nuevasSubastasIds = []; 

        DB::beginTransaction();
        try {
            foreach ($camisetasElegidas as $cam) {
                $equipo = Equipo::firstOrCreate(
                    ['Api_Id' => $cam['id']],
                    [
                        'Nombre' => $cam['nombre_equipo'],
                        'Liga' => $cam['liga'],
                        'Escudo_Url' => $cam['escudo'],
                        'Camiseta_Url' => $cam['url_camiseta']
                    ]
                );

                $producto = Producto::create([
                    'Id_Equipo' => $equipo->Id_Equipo,
                    'Nombre' => $cam['nombre_camiseta'],
                    'Tipo' => 'local',
                    'Precio' => $cam['precio'],
                    'Stock' => 1,
                    'Imagen_Url' => $cam['url_camiseta']
                ]);

                $puja = Pujas::create([
                    'Id_Usuario' => $usuarioSistema->id, 
                    'Id_Producto' => $producto->Id_Producto,
                    'Cantidad' => $cam['precio'] * 0.5, 
                    'Fecha' => Carbon::now()
                ]);

                $nuevasSubastasIds[] = $puja->Id_Puja;
            }
            DB::commit();

            // LÓGICA DE NOTIFICACIÓN: Comprobar si hay que avisar a alguien
            $pujaAnteriorAlta = OfertasPujas::where('Id_Puja', $puja->Id_Puja)
                ->orderBy('Cantidad_Ofrecida', 'desc')
                ->skip(1) // Saltamos la nueva que acabamos de crear
                ->first();

            if ($pujaAnteriorAlta && $pujaAnteriorAlta->Id_Usuario != $usuario->id) {
                Notificacion::create([
                    'user_id' => $pujaAnteriorAlta->Id_Usuario,
                    'titulo' => '¡Te han superado en una puja!',
                    'mensaje' => "El usuario {$usuario->name} ha ofrecido {$request->cantidad}€ por la camiseta {$puja->producto->Nombre}.",
                    'tipo' => 'warning'
                ]);
            }

            // Volvemos a consultar la base de datos para obtener una Colección Eloquent oficial
            $subastasActivas = Pujas::with(['producto.equipo'])
                ->whereIn('Id_Puja', $nuevasSubastasIds)
                ->get();

            return response()->json([
                'status' => 'success',
                'origen' => 'api_y_guardado_en_bd',
                'data' => $this->formatearSubastas($subastasActivas)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error creando subastas: ' . $e->getMessage()], 500);
        }
    }

    public function realizarOferta(Request $request, $idPuja)
    {
        $request->validate([
            'cantidad' => 'required|numeric'
        ]);

        $puja = Pujas::findOrFail($idPuja);
        $usuario = $request->user(); 

        if ($request->cantidad <= $puja->Cantidad) {
            return response()->json(['message' => 'Tu oferta debe ser mayor al precio actual de ' . $puja->Cantidad . '€'], 400);
        }

        DB::beginTransaction();
        try {
            OfertasPujas::create([
                'Id_Puja' => $puja->Id_Puja,
                'Id_Usuario' => $usuario->id,
                'Cantidad_Ofrecida' => $request->cantidad,
                'Fecha' => Carbon::now()
            ]);

            $puja->Cantidad = $request->cantidad;
            $puja->save();

            DB::commit();

            return response()->json([
                'message' => '¡Puja realizada con éxito!',
                'nuevo_precio' => $puja->Cantidad
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error procesando la puja', 'error' => $e->getMessage()], 500);
        }
    }

    private function formatearSubastas($subastas)
    {
        // LA SOLUCIÓN ESTÁ AQUÍ: Ordenamos directamente la relación 'ofertas' y adjuntamos al usuario
        $subastas->load(['ofertas' => function($query) {
            $query->with('usuario')->orderBy('Cantidad_Ofrecida', 'desc');
        }]);

        return $subastas->map(function ($puja) {
            return [
                'id_puja' => $puja->Id_Puja,
                'precio_actual' => $puja->Cantidad,
                'fecha_inicio' => $puja->Fecha,
                'producto' => [
                    'id_producto' => $puja->producto->Id_Producto,
                    'nombre' => $puja->producto->Nombre,
                    'precio_tienda' => $puja->producto->Precio,
                    'imagen' => $puja->producto->Imagen_Url,
                    'equipo' => $puja->producto->equipo->Nombre ?? 'Desconocido',
                    'escudo' => $puja->producto->equipo->Escudo_Url ?? null,
                ],
                // Generamos un historial con las 2 pujas más altas
                'historial' => $puja->ofertas->take(2)->map(function($oferta) {
                    return [
                        'usuario' => $oferta->usuario->name ?? 'Anónimo',
                        'cantidad' => $oferta->Cantidad_Ofrecida
                    ];
                })
            ];
        });
    }
}