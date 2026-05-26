    // js/api.js

    // Configuración
    const BASE_URL = 'http://127.0.0.1:8000/api'; 

    const LEAGUE_MAP = {
        'Premier League': 'English Premier League',
        'La Liga': 'Spanish La Liga',
        'Serie A': 'Italian Serie A',
        'Bundesliga': 'German Bundesliga',
        'Ligue 1': 'French Ligue 1'
    };

    const api = {
        getLeagues: () => LEAGUE_MAP,

        getTeamsByLeague: async (leagueShortName) => {
            let teams = []; // Aquí guardaremos los datos (vengan de donde vengan)

            // ---------------------------------------------------------
            // 1. INTENTAR CARGAR DESDE LA API (PRIORIDAD ALTA)
            // ---------------------------------------------------------
            try {
                console.log("🌐 Conectando con Laravel...");
                
                // Ponemos un timeout de 2 segundos para no hacer esperar mucho si el server está caído
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                const res = await fetch(`${BASE_URL}/importar-camisetas`, { signal: controller.signal });
                clearTimeout(timeoutId); // Limpiamos el timeout si responde rápido

                if (!res.ok) throw new Error('Error en la respuesta del servidor');

                const responseData = await res.json();
                teams = responseData.data || []; 
                console.log("✅ ÉXITO: Datos cargados desde la API en vivo.");

            } catch (error) {
                // ---------------------------------------------------------
                // 2. FALLBACK: SI FALLA LA API, USAR DATOS LOCALES
                // ---------------------------------------------------------
                console.warn("⚠️ La API falló o el servidor está apagado. Cargando modo OFFLINE.", error);

                if (typeof DATOS_LOCALES !== 'undefined' && DATOS_LOCALES.length > 0) {
                    teams = DATOS_LOCALES; // Usamos el array del archivo js/datos_locales.js
                    console.log("📂 Usando datos locales de respaldo.");
                } else {
                    console.error("❌ ERROR CRÍTICO: No hay API y no hay datos locales.");
                    return []; // Si no hay nada, devolvemos vacío
                }
            }

            // ---------------------------------------------------------
            // 3. PROCESAMIENTO COMÚN (FILTRAR Y FORMATEAR)
            // ---------------------------------------------------------
            // A partir de aquí, 'teams' tiene datos, no importa de dónde vinieron.

            // A. Filtrar por liga
            if (leagueShortName && leagueShortName !== 'all') {
                const fullLeagueName = LEAGUE_MAP[leagueShortName];
                if (fullLeagueName) {
                    teams = teams.filter(t => t.liga === fullLeagueName);
                }
            }

            // B. Transformar al formato que usa tu HTML
            // (Aseguramos que t.precio sea un número por si la API lo manda como string)
            const formattedTeams = teams.map(t => ({
                id: t.id,
                name: t.nombre_camiseta || t.nombre_equipo, // Preferimos nombre camiseta, si no, equipo
                team: t.nombre_equipo,
                league: t.liga,
                price: parseFloat(t.precio), 
                img: t.url_camiseta || t.escudo || 'https://placehold.co/400x400?text=Sin+Imagen',
                badge: t.escudo
            }));

            // C. Mezclar aleatoriamente para que no salgan siempre los mismos
            formattedTeams.sort(() => Math.random() - 0.5);

            // D. Devolver los primeros 12 resultados
            return formattedTeams.slice(0, 12);
        }
    };