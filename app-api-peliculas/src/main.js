import { obtenerPeliculasPopulares, buscarPeliculasPorTitulo } from './api/peliculas';
import './style.css';

// Elementos del DOM
const resultados = document.querySelector("#resultados");
const mensaje = document.querySelector("#mensaje");
const inputBuscar = document.querySelector("#inputBuscar");
const btnBuscar = document.querySelector("#btnBuscar");
const btnPopulares = document.querySelector("#btnPopulares");

// Control de concurrencia y estado de carga
let estaCargando = false;

/**
 * Gestiona el estado de carga y la interactividad de los controles
 * para prevenir solicitudes simultáneas y notificar visualmente el proceso.
 *
 * @param {boolean} cargando - Indica si hay una petición en curso
 * @param {string} [mensajeTexto="Cargando..."] - Mensaje visible durante la carga
 */
function setEstadoCarga(cargando, mensajeTexto = "Cargando...") {
    estaCargando = cargando;
    inputBuscar.disabled = cargando;
    btnBuscar.disabled = cargando;
    btnPopulares.disabled = cargando;

    if (cargando) {
        mensaje.textContent = mensajeTexto;
    }
}

/**
 * Muestra el listado de películas en el contenedor de resultados,
 * actualizando el DOM en una única operación para optimizar el rendimiento.
 *
 * @param {Array<Object>} peliculas - Lista de películas devueltas por la API
 */
function mostrarPeliculas(peliculas) {
    if (!peliculas || peliculas.length === 0) {
        resultados.innerHTML = "";
        return;
    }

    const htmlPeliculas = peliculas.map((pelicula) => {
        const anio = pelicula.release_date ? pelicula.release_date.slice(0, 4) : "Sin fecha";
        const sinopsis = pelicula.overview || "Sin sinopsis disponible.";
        const poster = pelicula.poster_path
            ? `https://image.tmdb.org/t/p/w300${pelicula.poster_path}`
            : "https://placehold.co/300x450?text=Sin+imagen";

        return `
      <div class="tarjeta">
        <img src="${poster}" alt="${pelicula.title}" />
        <h3>${pelicula.title}</h3>
        <p class="anio">${anio}</p>
        <p class="sinopsis">${sinopsis}</p>
      </div>
    `;
    }).join("");

    resultados.innerHTML = htmlPeliculas;
}

/**
 * Centraliza la gestión y presentación de errores en la interfaz.
 *
 * @param {Error} error - Objeto de error capturado
 */
function manejarError(error) {
    resultados.innerHTML = "";
    mensaje.textContent = error.message || "Error al procesar la solicitud. Intenta de nuevo más tarde.";
    console.error("Error en la aplicación:", error);
}

/**
 * Carga y presenta el catálogo de películas populares de TMDB.
 */
async function cargarPopulares() {
    if (estaCargando) return;

    setEstadoCarga(true, "Cargando...");
    resultados.innerHTML = "";

    try {
        const data = await obtenerPeliculasPopulares();
        mensaje.textContent = "";
        mostrarPeliculas(data.results);
    } catch (error) {
        manejarError(error);
    } finally {
        setEstadoCarga(false);
    }
}

/**
 * Ejecuta la búsqueda de películas por el término ingresado por el usuario.
 */
async function buscar() {
    const texto = inputBuscar.value.trim();

    if (texto === "") {
        mensaje.textContent = "Escribe el nombre de una película.";
        return;
    }

    if (estaCargando) return;

    setEstadoCarga(true, "Cargando...");
    resultados.innerHTML = "";

    try {
        const data = await buscarPeliculasPorTitulo(texto);

        if (!data.results || data.results.length === 0) {
            resultados.innerHTML = "";
            mensaje.textContent = "Película no encontrada";
            return;
        }

        mensaje.textContent = "";
        mostrarPeliculas(data.results);
    } catch (error) {
        manejarError(error);
    } finally {
        setEstadoCarga(false);
        inputBuscar.focus();
    }
}

// Carga inicial al iniciar la aplicación
cargarPopulares();

// Listeners de interacción del usuario (Clic y Tecla Enter)
btnBuscar.addEventListener("click", buscar);
btnPopulares.addEventListener("click", cargarPopulares);

inputBuscar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        buscar();
    }
});
