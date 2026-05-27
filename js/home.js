/* =============================================================================
   home.js - Lógica de la Página Principal (Home)
   =============================================================================
   PROPÓSITO: Maneja toda la lógica de la página de inicio de VIBES.
   FUNCIONA:
     1. Inicializa las partículas del fondo
     2. Verifica la sesión del usuario y personaliza el saludo
     3. Carga recomendaciones de canciones y artistas basadas en las preferencias
     4. Renderiza tarjetas de canciones/artistas con botón de reproducción
     5. Maneja el modal de configuración (Settings)
     6. Maneja el modal de "Tus Géneros Top"
   ALGORITMO DE RECOMENDACIÓN:
     - Puntúa cada canción según coincidencia con géneros (1 punto), artistas (1.5 puntos)
       y moods (1 punto) del usuario
     - Ordena por puntaje descendente para mostrar las más relevantes primero
   ============================================================================= */

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

    // ==================== 1. INICIALIZAR PARTÍCULAS ====================
    // Configura la animación de partículas flotantes del fondo
    particlesJS("particles-js", {
        particles: {
            number: { value: 70 },                    // 70 partículas
            color: { value: "#39FF14" },               // Verde neón
            shape: { type: "circle" },                 // Circulares
            opacity: { value: 0.3 },                   // 30% opacidad
            size: { value: 2 },                        // 2px de tamaño
            line_linked: {                             // Líneas de conexión
                enable: true,                          // Activadas
                distance: 150,                         // Distancia máxima 150px
                color: "#39FF14",                      // Verde neón
                opacity: 0.2,                          // 20% opacidad
                width: 1                               // 1px de grosor
            },
            move: { enable: true, speed: 1 }           // Movimiento lento
        }
    });

    // ==================== 2. CONTROL DE SESIÓN ====================
    // Lee el nombre del usuario logueado desde localStorage
    const username = localStorage.getItem("vibes_user");
    // Si no hay usuario logueado, redirige a la página de bienvenida
    if (!username) {
        window.location.href = "index.html";
        return; // Detiene la ejecución
    }

    // ---- SALUDO DINÁMICO ----
    // Personaliza el mensaje de bienvenida con el nombre del usuario
    const welcomeMsg = document.getElementById("welcome-message");
    if (welcomeMsg) {
        // Template literal: inserta el nombre del usuario en el saludo
        welcomeMsg.textContent = `Bienvenido de nuevo, ${username}`;
    }

    // ---- REFERENCIAS A CUADRÍCULAS DE RECOMENDACIONES ----
    // Cuadrícula donde se inyectan las tarjetas de canciones recomendadas
    const songsGrid = document.getElementById("recommended-songs-grid");
    // Cuadrícula donde se inyectan las tarjetas de artistas recomendados
    const artistsGrid = document.getElementById("recommended-artists-grid");

    // ==================== 3. CARGA DE RECOMENDACIONES ====================
    // Función principal que decide de dónde cargar: servidor o local

    async function loadRecommendations() {
        // Determina el modo de operación
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        // Si es modo local o se abrió desde archivo, usa datos locales
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalRecommendations();
            return;
        }

        // MODO SERVIDOR: Intenta obtener recomendaciones de la API Flask
        try {
            // Petición GET al endpoint de recomendaciones, enviando el nombre del usuario
            const response = await fetch(`/api/recommendations?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error("Server response error"); // Lanza error si la respuesta no es OK
            const data = await response.json(); // Parsea la respuesta JSON

            // Renderiza las recomendaciones recibidas del servidor
            renderRecommendedSongs(data.songs);
            renderRecommendedArtists(data.artists);
        } catch (error) {
            // FALLBACK: Si el servidor falla, carga recomendaciones locales
            console.error("Error loading recommendations, loading locally:", error);
            loadLocalRecommendations();
        }
    }

    // ---- ALGORITMO DE RECOMENDACIONES LOCALES ----
    // Genera recomendaciones basadas en las preferencias del usuario almacenadas localmente
    function loadLocalRecommendations() {
        // Obtiene el catálogo global definido en catalog.js
        const catalog = window.VIBES_CATALOG || { songs: [], artists: [] };
        
        // Lee las preferencias del usuario desde localStorage
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        let prefGenres = userPrefs.genres || [];     // Géneros favoritos
        let prefArtists = userPrefs.artists || [];   // Artistas favoritos
        let prefMoods = userPrefs.moods || [];       // Moods favoritos

        // Si el usuario no tiene preferencias guardadas, usa valores por defecto
        if (prefGenres.length === 0) prefGenres = ["Rock", "Pop", "Reggaetón"];
        if (prefArtists.length === 0) prefArtists = ["Guns N' Roses", "Linkin Park", "Bad Bunny"];
        if (prefMoods.length === 0) prefMoods = ["Estudio", "Fiesta", "Ejercicio"];

        // ---- ALGORITMO DE PUNTUACIÓN POR AFINIDAD ----
        // Recorre todas las canciones del catálogo y les asigna un puntaje
        // basado en cuánto coinciden con las preferencias del usuario
        let scoredSongs = catalog.songs.map(song => {
            let score = 0; // Puntaje inicial: 0

            // +1 punto si el género de la canción está en los géneros favoritos del usuario
            if (prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase())) score += 1;
            // +1.5 puntos si el artista de la canción está en los artistas favoritos
            // (más peso porque indica gusto específico por ese artista)
            if (prefArtists.some(a => a.toLowerCase() === song.artist.toLowerCase())) score += 1.5;
            // +1 punto si el mood de la canción coincide con los moods favoritos
            if (prefMoods.some(m => m.toLowerCase() === song.mood.toLowerCase())) score += 1;

            return { song, score }; // Devuelve la canción con su puntaje
        });

        // Ordena las canciones por puntaje descendente (las más afines primero)
        scoredSongs.sort((a, b) => b.score - a.score);
        // Extrae solo las canciones (sin el puntaje) para renderizar
        let recommendedSongs = scoredSongs.map(item => item.song);

        // ---- RECOMENDACIÓN DE ARTISTAS ----
        // Construye una lista de artistas recomendados con prioridad por afinidad
        let recommendedArtists = [];
        let addedNames = new Set(); // Set para evitar duplicados

        // PRIORIDAD 1: Artistas que están en las preferencias del usuario
        catalog.artists.forEach(artist => {
            if (prefArtists.some(pa => pa.toLowerCase() === artist.name.toLowerCase())) {
                recommendedArtists.push(artist);
                addedNames.add(artist.name.toLowerCase()); // Marca como agregado
            }
        });

        // PRIORIDAD 2: Artistas cuyas canciones coinciden con los géneros o moods del usuario
        catalog.songs.forEach(song => {
            if (prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase()) || 
                prefMoods.some(m => m.toLowerCase() === song.mood.toLowerCase())) {
                // Busca el objeto del artista en el catálogo
                let artistObj = catalog.artists.find(a => a.name.toLowerCase() === song.artist.toLowerCase());
                // Lo agrega si existe y no ha sido agregado ya
                if (artistObj && !addedNames.has(artistObj.name.toLowerCase())) {
                    recommendedArtists.push(artistObj);
                    addedNames.add(artistObj.name.toLowerCase());
                }
            }
        });

        // PRIORIDAD 3: Todos los artistas restantes (para llenar la cuadrícula)
        catalog.artists.forEach(artist => {
            if (!addedNames.has(artist.name.toLowerCase())) {
                recommendedArtists.push(artist);
                addedNames.add(artist.name.toLowerCase());
            }
        });

        // Renderiza las recomendaciones en la interfaz
        renderRecommendedSongs(recommendedSongs);
        renderRecommendedArtists(recommendedArtists);
    }

    // ==================== RENDERIZAR CANCIONES RECOMENDADAS ====================
    // Crea tarjetas HTML para cada canción recomendada
    function renderRecommendedSongs(songs) {
        if (!songsGrid) return; // Si el elemento no existe, no hace nada
        songsGrid.innerHTML = ""; // Limpia el contenido previo

        // Si no hay canciones, muestra un mensaje informativo
        if (songs.length === 0) {
            songsGrid.innerHTML = `<p style="color: #555; grid-column: 1/-1; text-align: center;">No hay recomendaciones disponibles para tu perfil.</p>`;
            return;
        }

        // Crea una tarjeta por cada canción
        songs.forEach(song => {
            const card = document.createElement("div");  // Crea un div
            card.className = "music-card";                // Aplica estilos de tarjeta
            card.style.cursor = "pointer";                // Cursor de mano

            // HTML interno: portada, título y artista
            card.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;

            // Al hacer clic en la tarjeta, reproduce la canción
            card.addEventListener("click", (e) => {
                e.preventDefault(); // Previene navegación si hubiera un enlace padre
                // Usa el reproductor global (vibesPlayer) para reproducir la canción
                // Pasa la canción actual y la lista completa para next/previous
                if (window.vibesPlayer) {
                    window.vibesPlayer.playTrack(song, songs);
                }
            });

            songsGrid.appendChild(card); // Agrega la tarjeta al grid
        });
    }

    // ==================== RENDERIZAR ARTISTAS RECOMENDADOS ====================
    // Crea tarjetas HTML para cada artista recomendado
    function renderRecommendedArtists(artists) {
        if (!artistsGrid) return;
        artistsGrid.innerHTML = "";

        // Mensaje si no hay artistas
        if (artists.length === 0) {
            artistsGrid.innerHTML = `<p style="color: #555; grid-column: 1/-1; text-align: center;">No hay artistas recomendados en este momento.</p>`;
            return;
        }

        // Crea una tarjeta por cada artista
        artists.forEach(artist => {
            const card = document.createElement("div");
            card.className = "music-card";
            card.style.cursor = "pointer";

            // HTML: imagen circular del artista + nombre + etiqueta
            card.innerHTML = `
                <img src="${artist.cover}" alt="${artist.name}" style="border-radius: 50%;">
                <h4>${artist.name}</h4>
                <p>Nodo Auditivo</p>
            `;

            // Al hacer clic, muestra un mensaje temático
            card.addEventListener("click", () => {
                alert(`Conectando con el nodo neuronal de ${artist.name}. Resonancia armónica optimizada al 98.4%.`);
            });

            artistsGrid.appendChild(card);
        });
    }

    // ==================== 4. MODAL DE CONFIGURACIÓN (SETTINGS) ====================
    // Maneja la ventana de configuración donde se puede cambiar el modo de BD y resetear la app

    // ---- REFERENCIAS A ELEMENTOS DEL MODAL ----
    const settingsBtn = document.getElementById("settings-btn");         // Botón "Ajustes" en el sidebar
    const settingsModal = document.getElementById("settings-modal");     // El modal completo
    const closeSettingsBtn = document.getElementById("close-settings-btn"); // Botón "Cerrar"
    const saveSettingsBtn = document.getElementById("save-settings-btn");   // Botón "Aplicar"
    const resetAppBtn = document.getElementById("reset-app-btn");           // Botón "Reiniciar Datos"
    const dbModeSelect = document.getElementById("db-mode-select");         // Selector de modo (local/neo4j)
    const neo4jCreds = document.getElementById("neo4j-creds-container");    // Contenedor de credenciales Neo4j

    // Campos de credenciales Neo4j
    const neo4jUri = document.getElementById("neo4j-uri");    // Campo de URI
    const neo4jUser = document.getElementById("neo4j-user");  // Campo de usuario
    const neo4jPass = document.getElementById("neo4j-pass");  // Campo de contraseña

    // Solo configura los listeners si los elementos existen
    if (settingsBtn && settingsModal) {

        // ---- ABRIR MODAL DE CONFIGURACIÓN ----
        settingsBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Previene la navegación del enlace #

            // Carga el modo guardado y lo selecciona en el dropdown
            const savedMode = localStorage.getItem("vibes_db_mode") || "local";
            dbModeSelect.value = savedMode;

            // Muestra/oculta las credenciales Neo4j según el modo
            if (savedMode === "neo4j") {
                neo4jCreds.style.display = "block"; // Muestra las credenciales
            } else {
                neo4jCreds.style.display = "none";  // Oculta las credenciales
            }

            // Carga los valores guardados de las credenciales Neo4j
            neo4jUri.value = localStorage.getItem("vibes_neo4j_uri") || "neo4j+s://d544acc5.databases.neo4j.io";
            neo4jUser.value = localStorage.getItem("vibes_neo4j_user") || "d544acc5";
            neo4jPass.value = localStorage.getItem("vibes_neo4j_pass") || "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k";

            // Muestra el modal (cambia de display:none a display:flex)
            settingsModal.style.display = "flex";
        });

        // ---- CERRAR MODAL ----
        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "none"; // Oculta el modal
        });

        // ---- CAMBIO DE MODO EN EL SELECTOR ----
        // Muestra/oculta credenciales Neo4j cuando el usuario cambia el dropdown
        dbModeSelect.addEventListener("change", () => {
            if (dbModeSelect.value === "neo4j") {
                neo4jCreds.style.display = "block";
            } else {
                neo4jCreds.style.display = "none";
            }
        });

        // ---- GUARDAR CONFIGURACIÓN ----
        saveSettingsBtn.addEventListener("click", () => {
            // Guarda el modo seleccionado en localStorage
            localStorage.setItem("vibes_db_mode", dbModeSelect.value);

            // Si eligió Neo4j, guarda también las credenciales
            if (dbModeSelect.value === "neo4j") {
                localStorage.setItem("vibes_neo4j_uri", neo4jUri.value.trim());
                localStorage.setItem("vibes_neo4j_user", neo4jUser.value.trim());
                localStorage.setItem("vibes_neo4j_pass", neo4jPass.value.trim());
            }

            settingsModal.style.display = "none"; // Cierra el modal
            window.location.reload();             // Recarga la página para aplicar cambios
        });

        // ---- REINICIAR TODOS LOS DATOS ----
        // Borra todo el localStorage y redirige a la página de bienvenida
        resetAppBtn.addEventListener("click", () => {
            // Pide confirmación al usuario antes de borrar
            if (confirm("¿Estás seguro de que deseas reiniciar todos los datos locales y cerrar sesión?")) {
                localStorage.clear();                    // Borra TODOS los datos del localStorage
                alert("Datos locales eliminados con éxito.");
                window.location.href = "index.html";    // Redirige a la pantalla de bienvenida
            }
        });
    }

    // ==================== 5. MODAL "TUS GÉNEROS TOP" ====================
    // Botón en el sidebar que muestra las canciones de los géneros favoritos del usuario

    const genresBtn = document.querySelector(".genres-btn"); // Referencia al botón
    if (genresBtn) {
        genresBtn.addEventListener("click", (e) => {
            e.preventDefault();         // Previene comportamiento por defecto
            showTopGenresModal();       // Abre el modal
        });
    }

    // ---- FUNCIÓN DEL MODAL DE GÉNEROS TOP ----
    // Crea y muestra un modal con las canciones que coinciden con los géneros del usuario
    function showTopGenresModal() {
        // Lee las preferencias del usuario
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        let prefGenres = userPrefs.genres || [];

        // Si no tiene géneros, usa valores por defecto
        if (prefGenres.length === 0) {
            prefGenres = ["Rock", "Pop"];
        }

        // Obtiene el catálogo de canciones
        const catalog = window.VIBES_CATALOG || { songs: [] };

        // Filtra las canciones que pertenecen a los géneros favoritos del usuario
        const matchingSongs = catalog.songs.filter(song => 
            prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase())
        );

        // Crea o reutiliza el modal en el DOM
        let modal = document.getElementById("genres-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "genres-modal";
            // Estilos inline: overlay de pantalla completa con fondo oscuro semitransparente
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1001; display:flex; justify-content:center; align-items:center; font-family:inherit;";
            document.body.appendChild(modal);
        }

        // Genera el HTML de la lista de canciones
        let songsListHtml = "";
        if (matchingSongs.length === 0) {
            // Mensaje cuando no hay canciones que coincidan
            songsListHtml = `<p style="color: #666; text-align: center; padding: 20px;">No hay canciones que coincidan con tus géneros top en este momento.</p>`;
        } else {
            // Crea una fila por cada canción con portada, título, artista, género y botón play
            matchingSongs.forEach((song, idx) => {
                songsListHtml += `
                    <div style="display: flex; align-items: center; gap: 12px; background: #141414; padding: 10px; border-radius: 10px; border: 1px solid #222;">
                        <img src="${song.cover}" style="width: 48px; height: 48px; border-radius: 6px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0; color: white; font-size: 14px;">${song.title}</h4>
                            <p style="margin: 0; color: #888; font-size: 12px;">${song.artist} • <span style="color: #39FF14;">${song.genre}</span></p>
                        </div>
                        <button class="modal-play-song-btn" data-index="${idx}" style="background:transparent; border:none; color: #39FF14; cursor: pointer; font-size: 18px; padding: 5px;"><i class="fa-solid fa-play"></i></button>
                    </div>
                `;
            });
        }

        // Establece el HTML completo del modal
        modal.innerHTML = `
            <div style="background: #0d0d0d; border: 1px solid #39FF14; border-radius: 20px; padding: 30px; width: 450px; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 30px rgba(57,255,20,0.25);">
                <h3 style="color: #39FF14; font-size: 20px; margin-bottom: 5px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Tus Géneros Top</h3>
                <p style="color: #666; font-size: 12px; margin-bottom: 20px; text-transform: uppercase;">Recomendaciones para ti: ${prefGenres.join(", ")}</p>
                
                <div id="genres-modal-songs" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    ${songsListHtml}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button id="genres-modal-play-all" style="background: #39FF14; border: none; color: black; font-weight: bold; padding: 10px 20px; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(57,255,20,0.3);">Reproducir Todo</button>
                    <button id="genres-modal-close" style="background: transparent; border: 1px solid #555; color: white; padding: 10px 18px; border-radius: 8px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
        `;

        modal.style.display = "flex"; // Muestra el modal

        // ---- LISTENERS DEL MODAL ----

        // Cerrar modal
        modal.querySelector("#genres-modal-close").addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Reproducir todas las canciones
        modal.querySelector("#genres-modal-play-all").addEventListener("click", () => {
            if (matchingSongs.length > 0 && window.vibesPlayer) {
                // Reproduce la primera canción y pasa toda la lista para next/previous
                window.vibesPlayer.playTrack(matchingSongs[0], matchingSongs);
                modal.style.display = "none"; // Cierra el modal
            }
        });

        // Botones de play individuales para cada canción
        modal.querySelectorAll(".modal-play-song-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-index")); // Obtiene el índice de la canción
                if (window.vibesPlayer && matchingSongs[idx]) {
                    window.vibesPlayer.playTrack(matchingSongs[idx], matchingSongs);
                    modal.style.display = "none";
                }
            });
        });
    }

    // Expone la función del modal como variable global para que pueda ser llamada desde otros scripts
    window.showTopGenresModal = showTopGenresModal;

    // ==================== INICIALIZACIÓN ====================
    // Carga las recomendaciones al abrir la página
    loadRecommendations();

}); // Fin del listener DOMContentLoaded