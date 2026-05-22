<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TheSportsDbService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ExternalApiController extends Controller
{
    protected $sportsService;

    public function __construct(TheSportsDbService $sportsService)
    {
        $this->sportsService = $sportsService;
    }

    public function index()
    {
        // ... (Tu código actual de las camisetas se mantiene igual)
        $datosOriginales = $this->sportsService->obtenerTop5Ligas();
        $datos = json_decode(json_encode($datosOriginales), true);

        $nombresEnOferta = Cache::remember('ofertas_semanales_nombres', 604800, function () use ($datos) {
            $coleccion = collect($datos);
            $cantidadOfertas = min(10, $coleccion->count());
            return $coleccion->random($cantidadOfertas)->pluck('nombre_equipo')->toArray();
        });

        foreach ($datos as &$camiseta) {
            $precioOriginal = isset($camiseta['precio']) ? floatval($camiseta['precio']) : 0;
            $camiseta['precio_original'] = $precioOriginal;

            if (isset($camiseta['nombre_equipo']) && in_array($camiseta['nombre_equipo'], $nombresEnOferta)) {
                $camiseta['en_oferta'] = true;
                $camiseta['precio'] = round($precioOriginal * 0.8, 2); 
            } else {
                $camiseta['en_oferta'] = false;
            }
        }

        return response()->json([
            'status' => 'success',
            'cantidad_total' => count($datos),
            'nota' => 'Mostrando catálogo con 10 ofertas semanales fijas usando Caché',
            'data' => $datos
        ]);
    }

    // =======================================================
    // NUEVA FUNCIÓN: Obtener y cachear noticias de GNews
    // =======================================================
    public function getNoticias()
    {
        // Guardamos en caché por 24 horas (86400 segundos)
        $noticias = Cache::remember('noticias_futbol', 86400, function () {
            $apiKey = env('GNEWS_API_KEY');
            
            // Buscamos 3 noticias en español sobre fútbol
            $url = "https://gnews.io/api/v4/search?q=futbol OR soccer OR champions&lang=es&max=3&apikey={$apiKey}";

            $response = Http::get($url);

            if ($response->successful()) {
                return $response->json()['articles'] ?? [];
            }
            
            return [];
        });

        return response()->json([
            'status' => 'success',
            'data' => $noticias
        ]);
    }
}