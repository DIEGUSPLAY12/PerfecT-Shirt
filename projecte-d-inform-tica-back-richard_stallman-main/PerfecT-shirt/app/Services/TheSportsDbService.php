<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TheSportsDbService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('THESPORTSDB_BASE_URL');

        // Validación de seguridad
        if (empty($this->baseUrl)) {
            throw new \Exception('ERROR: La variable THESPORTSDB_BASE_URL no está definida en el archivo .env');
        }
    }

    public function obtenerTop5Ligas()
    {
        // Las 5 grandes ligas
        $ligas = [
            'Spanish La Liga',
            'English Premier League',
            'German Bundesliga',
            'Italian Serie A',
            'French Ligue 1'
        ];

        $todosLosEquipos = collect();

        foreach ($ligas as $nombreLiga) {
            $url = $this->baseUrl . "/search_all_teams.php";

            // Petición ignorando SSL (útil en local)
            $response = Http::withoutVerifying()->get($url, [
                'l' => $nombreLiga
            ]);

            if ($response->failed() || is_null($response->json('teams'))) {
                continue;
            }

            $equipos = $response->json('teams');

            $equiposProcesados = collect($equipos)->map(function ($equipo) use ($nombreLiga) {
                
                // 1. Calcular precio ficticio
                $capacidad = (int)($equipo['intStadiumCapacity'] ?? 0);
                $precio = $capacidad > 60000 ? 89.99 : 64.99;

                // 2. LÓGICA DE LA IMAGEN
                $imagenFinal = $equipo['strEquipment'] 
                                ?? $equipo['strTeamJersey'] 
                                ?? $equipo['strTeamBadge'] 
                                ?? null;

                return [
                    'id'              => $equipo['idTeam'],
                    'nombre_equipo'   => $equipo['strTeam'] ?? 'Desconocido',
                    'nombre_camiseta' => 'Camiseta Oficial ' . ($equipo['strTeam'] ?? '') . ' 2025',
                    'precio'          => $precio,
                    'liga'            => $nombreLiga,
                    'url_camiseta'    => $imagenFinal,
                    'escudo'          => $equipo['strTeamBadge'] ?? null,
                ];
            });

            $todosLosEquipos = $todosLosEquipos->merge($equiposProcesados);
        }

        // IMPORTANTE: El return va FUERA del foreach
        return $todosLosEquipos->values();
    }
}
