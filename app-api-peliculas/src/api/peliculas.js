// Capa de consumo de la API de Películas (TMDB)

// Declarando y normalizando las variables de entorno
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const RAW_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3/';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

/**
 * Función auxiliar para realizar peticiones a la API de TMDB con async/await,
 * validando response.ok y gestionando errores HTTP y de red.
 *
 * @param {string} endpoint - Ruta relativa del endpoint con sus query params
 * @returns {Promise<any>} Datos parseados en JSON
 */
async function realizarPeticion(endpoint) {
    const url = `${BASE_URL}${endpoint}`;

    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        // Gestionar error de red sin ocultar su causa original
        throw new Error(`Error de red al conectar con TMDB: ${error.message}`, { cause: error });
    }

    // Validar response.ok antes de procesar el JSON exitoso
    if (!response.ok) {
        const statusCode = response.status;
        let mensajeErrorTMDB = response.statusText || 'Error en la petición';

        try {
            const errorData = await response.json();
            if (errorData) {
                if (errorData.status_message) {
                    mensajeErrorTMDB = errorData.status_message;
                } else if (errorData.errors) {
                    mensajeErrorTMDB = Array.isArray(errorData.errors)
                        ? errorData.errors.join(', ')
                        : errorData.errors;
                }
            }
        } catch {
            // Si la respuesta no es un JSON válido, se conserva mensajeErrorTMDB por defecto
        }

        // Lanzar un error descriptivo con el código de estado y el mensaje de TMDB
        throw new Error(`Error HTTP ${statusCode}: ${mensajeErrorTMDB}`);
    }

    return await response.json();
}

/**
 * Obtiene el listado de películas populares desde TMDB.
 * @returns {Promise<{page: number, results: Array, total_pages: number, total_results: number}>}
 */
export async function obtenerPeliculasPopulares() {
    return await realizarPeticion(`movie/popular?api_key=${API_KEY}&language=es-MX`);
}

/**
 * Busca películas por título en TMDB codificando el parámetro de búsqueda.
 * @param {string} titulo - Título o término a buscar
 * @returns {Promise<{page: number, results: Array, total_pages: number, total_results: number}>}
 */
export async function buscarPeliculasPorTitulo(titulo) {
    return await realizarPeticion(`search/movie?api_key=${API_KEY}&query=${encodeURIComponent(titulo)}&language=es-MX`);
}
