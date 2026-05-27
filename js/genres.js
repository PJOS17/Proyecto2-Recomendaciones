/* =============================================================================
   genres.js - Selección de Preferencias y Curación del Algoritmo Musical
   =============================================================================
   PROPÓSITO: Maneja toda la lógica de la página de selección de gustos (genres.html).
   FUNCIONA:
     1. Carga el catálogo de géneros, artistas y moods desde catalog.js (local) o API (servidor)
     2. Renderiza botones/tarjetas seleccionables para cada categoría
     3. Permite buscar y agregar elementos personalizados
     4. Actualiza la barra de progreso y los contadores en tiempo real
     5. Guarda las preferencias y redirige al home al compilar
   MODOS: Soporta modo local (localStorage) y modo servidor (Flask API)
   ============================================================================= */

// Espera a que el DOM esté completamente cargado antes de ejecutar toda la lógica
document.addEventListener("DOMContentLoaded", () => {

    // ==================== 1. INICIALIZAR PARTÍCULAS DE FONDO ====================
    // Configura la animación de partículas flotantes verdes del fondo
    // Usa la librería particles.js cargada desde el CDN en genres.html
    particlesJS("particles-js", {
        particles: {
            number: { value: 70 },                    // 70 partículas (menos que index.html para no distraer)
            color: { value: "#39FF14" },               // Color verde neón de VIBES
            shape: { type: "circle" },                 // Partículas circulares
            opacity: { value: 0.3 },                   // 30% de opacidad (sutiles)
            size: { value: 2 },                        // 2px de tamaño (muy pequeñas)
            line_linked: {                             // Líneas que conectan partículas cercanas
                enable: true,                          // Activa las líneas
                distance: 150,                         // Distancia máxima para conectar (150px)
                color: "#39FF14",                      // Color verde neón
                opacity: 0.2,                          // 20% de opacidad (muy sutiles)
                width: 1                               // 1px de grosor
            },
            move: { enable: true, speed: 1 }           // Movimiento activado, velocidad lenta (1)
        }
    });

    // ==================== 2. VERIFICACIÓN DE SESIÓN Y ELEMENTOS DOM ====================

    // Lee el nombre del usuario activo desde localStorage
    // Si no hay usuario logueado, redirige a la página de bienvenida
    const username = localStorage.getItem("vibes_user");
    if (!username) {
        // Si no hay sesión activa (no se registró ni inició sesión), volver a index.html
        window.location.href = "index.html";
        return; // Detiene la ejecución del resto del script
    }

    // ---- REFERENCIAS A ELEMENTOS DEL DOM ----
    // Obtiene las cuadrículas donde se renderizan los botones/tarjetas de cada categoría
    const tagGrid = document.querySelector(".tag-grid");         // Cuadrícula de botones de géneros
    const artistGrid = document.querySelector(".artist-grid");   // Cuadrícula de tarjetas de artistas
    const moodGrid = document.querySelector(".mood-grid");       // Cuadrícula de tarjetas de moods

    // Obtiene el botón de compilar y su enlace padre
    const compileBtn = document.querySelector(".compile-btn");   // Botón "COMPILAR ALGORITMO"
    const compileLink = compileBtn.closest("a");                 // Elemento <a> que envuelve al botón

    // Elementos de la barra de progreso
    const progressPercent = document.querySelector(".progress-percent");       // Texto "0%"
    const progressBarFill = document.querySelector(".progress-bar .progress"); // Barra verde de relleno

    // Texto de estado en la barra inferior ("Esperando Entrada de Datos")
    const statusText = document.querySelector(".status-section p");

    // ---- CAMPOS DE BÚSQUEDA Y BOTONES DE AGREGAR ----
    // Input y botón para buscar/agregar géneros personalizados
    const genreInput = document.getElementById("genre-search");   // Campo de texto de búsqueda de géneros
    const genreAddBtn = document.getElementById("genre-add-btn"); // Botón "+" para agregar género
    
    // Input y botón para buscar/agregar artistas
    const artistInput = document.getElementById("artist-search");   // Campo de búsqueda de artistas
    const artistAddBtn = document.getElementById("artist-add-btn"); // Botón "+" para agregar artista
    
    // Input y botón para buscar/agregar moods
    const moodInput = document.getElementById("mood-search");   // Campo de búsqueda de moods
    const moodAddBtn = document.getElementById("mood-add-btn"); // Botón "+" para agregar mood

    // ---- INDICADORES DE CONTEO EN LAS CABECERAS DE SECCIÓN ----
    // Obtiene todos los encabezados de sección y sus contadores (ej: "0 / 3 MÍN")
    const sectionHeaders = document.querySelectorAll(".section-header"); // Las 3 cabeceras de sección
    const genresCountIndicator = sectionHeaders[0].querySelector("span");  // Contador de géneros (primera sección)
    const artistsCountIndicator = sectionHeaders[1].querySelector("span"); // Contador de artistas (segunda sección)
    const moodsCountIndicator = sectionHeaders[2].querySelector("span");   // Contador de moods (tercera sección)

    // ==================== ESTADO DEL USUARIO ====================
    // Sets (conjuntos) para almacenar las selecciones actuales del usuario
    // Set garantiza que no haya duplicados
    let selectedGenres = new Set();   // Géneros seleccionados por el usuario
    let selectedArtists = new Set();  // Artistas seleccionados por el usuario
    let selectedMoods = new Set();    // Moods seleccionados por el usuario

    // Arrays que contienen TODOS los elementos disponibles para seleccionar
    let allGenres = [];   // Lista completa de géneros (del catálogo + personalizados)
    let allArtists = [];  // Lista completa de artistas (objetos con name y cover)
    let allMoods = [];    // Lista completa de moods (objetos con name y cover)

    // ---- PREVENIR REDIRECCIÓN AUTOMÁTICA DEL ENLACE ----
    // El botón de compilar está dentro de un <a href="home.html">
    // Prevenimos la navegación automática para controlar cuándo se redirige
    if (compileLink) {
        compileLink.addEventListener("click", (e) => {
            e.preventDefault(); // Cancela la navegación por defecto del enlace
        });
    }

    // ==================== 3. CARGA DEL CATÁLOGO ====================
    // Función asíncrona que decide de dónde cargar los datos: servidor o local

    async function loadCatalog() {
        // Determina el modo de operación: "local" (localStorage) o "server" (API Flask)
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // Si estamos en modo local o la página se abrió desde un archivo, usar datos locales
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalCatalog(); // Carga desde catalog.js y localStorage
            return;
        }

        // MODO SERVIDOR: Intenta obtener el catálogo desde la API Flask
        try {
            const response = await fetch("/api/preferences");   // Petición GET al endpoint del servidor
            const data = await response.json();                 // Parsea la respuesta como JSON

            // Asigna los datos recibidos del servidor a las variables locales
            allGenres = data.genres;   // Array de strings con nombres de géneros
            allArtists = data.artists; // Array de objetos {name, cover}
            allMoods = data.moods;     // Array de objetos {name, cover}

            // Renderiza las cuadrículas con los datos del servidor
            renderGenres();   // Crea los botones de géneros
            renderArtists();  // Crea las tarjetas de artistas
            renderMoods();    // Crea las tarjetas de moods
            updateUI();       // Actualiza contadores, progreso y estado
        } catch (error) {
            // Si el servidor no responde, usa los datos locales como respaldo
            console.error("Error loading preferences catalog, falling back to local:", error);
            loadLocalCatalog();
        }
    }

    // ---- CARGA LOCAL DEL CATÁLOGO ----
    // Usa datos de catalog.js (variable global VIBES_CATALOG) y personalización del usuario
    function loadLocalCatalog() {
        // Obtiene el catálogo global definido en catalog.js, o un objeto vacío si no existe
        const catalog = window.VIBES_CATALOG || { genres: [], artists: [], moods: [] };
        
        // Lee elementos personalizados que el usuario haya agregado anteriormente
        // Se almacenan en localStorage como arrays JSON
        let customGenres = JSON.parse(localStorage.getItem("vibes_custom_genres") || "[]");
        let customArtists = JSON.parse(localStorage.getItem("vibes_custom_artists") || "[]");
        let customMoods = JSON.parse(localStorage.getItem("vibes_custom_moods") || "[]");

        // Combina géneros del catálogo con los personalizados, eliminando duplicados con Set
        // El spread operator (...) convierte el Set de nuevo a un array
        allGenres = [...new Set([...catalog.genres, ...customGenres])];
        
        // Copia los artistas del catálogo y agrega los personalizados si no existen
        allArtists = [...catalog.artists];
        customArtists.forEach(name => {
            // Verifica si el artista personalizado ya existe en el catálogo (comparación sin distinción de mayúsculas)
            if (!allArtists.some(a => a.name.toLowerCase() === name.toLowerCase())) {
                // Si no existe, lo agrega con una imagen genérica de Unsplash como portada
                allArtists.push({ name: name, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop" });
            }
        });

        // Mismo proceso para moods
        allMoods = [...catalog.moods];
        customMoods.forEach(name => {
            if (!allMoods.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                allMoods.push({ name: name, cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop" });
            }
        });

        // ---- RESTAURAR PREFERENCIAS PREVIAMENTE GUARDADAS ----
        // Si el usuario ya había seleccionado preferencias antes, las restaura
        // Las preferencias se guardan bajo la clave "vibes_prefs_NOMBREUSUARIO"
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        if (userPrefs.genres) userPrefs.genres.forEach(g => selectedGenres.add(g));     // Restaura géneros
        if (userPrefs.artists) userPrefs.artists.forEach(a => selectedArtists.add(a));  // Restaura artistas
        if (userPrefs.moods) userPrefs.moods.forEach(m => selectedMoods.add(m));        // Restaura moods

        // Renderiza todos los elementos en pantalla
        renderGenres();
        renderArtists();
        renderMoods();
        updateUI(); // Actualiza contadores y barra de progreso
    }

    // ==================== 4. RENDERIZADORES DE DOM ====================
    // Funciones que crean dinámicamente los elementos HTML para cada categoría

    // ---- RENDERIZAR GÉNEROS ----
    // Crea un botón por cada género disponible dentro de la cuadrícula .tag-grid
    function renderGenres() {
        tagGrid.innerHTML = ""; // Limpia el contenido previo de la cuadrícula

        // Itera sobre todos los géneros disponibles
        allGenres.forEach(genre => {
            const btn = document.createElement("button");  // Crea un elemento <button>
            btn.textContent = genre;                       // Establece el texto del botón con el nombre del género

            // Si este género ya está seleccionado, aplica la clase CSS de selección (fondo verde)
            if (selectedGenres.has(genre)) {
                btn.className = "selected-tag";
            }

            // Agrega un listener de clic para alternar la selección (toggle)
            btn.addEventListener("click", () => {
                if (selectedGenres.has(genre)) {
                    // Si ya estaba seleccionado, lo deselecciona
                    selectedGenres.delete(genre);  // Elimina del conjunto de seleccionados
                    btn.className = "";            // Quita la clase de selección (vuelve a gris)
                } else {
                    // Si no estaba seleccionado, lo selecciona
                    selectedGenres.add(genre);       // Agrega al conjunto de seleccionados
                    btn.className = "selected-tag";  // Aplica la clase verde de selección
                }
                updateUI(); // Actualiza contadores y progreso
            });

            tagGrid.appendChild(btn); // Agrega el botón a la cuadrícula en el DOM
        });
    }

    // ---- RENDERIZAR ARTISTAS ----
    // Crea una tarjeta con imagen por cada artista disponible
    function renderArtists() {
        artistGrid.innerHTML = ""; // Limpia el contenido previo

        // Itera sobre todos los artistas disponibles
        allArtists.forEach(artist => {
            const card = document.createElement("div"); // Crea un div para la tarjeta
            // Asigna las clases: "artist-card" base + "selected-card" si está seleccionado
            card.className = "artist-card" + (selectedArtists.has(artist.name) ? " selected-card" : "");
            
            // Genera el HTML del icono de check (✓) solo si el artista está seleccionado
            let checkHtml = "";
            if (selectedArtists.has(artist.name)) {
                // Icono circular verde con check de Font Awesome en la esquina superior derecha
                checkHtml = `<div class="check-icon"><i class="fa-solid fa-check"></i></div>`;
            }

            // Establece el HTML interno de la tarjeta: imagen + check (si aplica) + nombre
            card.innerHTML = `
                <img src="${artist.cover}">
                ${checkHtml}
                <p>${artist.name}</p>
            `;

            // Listener de clic para alternar la selección del artista
            card.addEventListener("click", () => {
                if (selectedArtists.has(artist.name)) {
                    selectedArtists.delete(artist.name); // Deselecciona
                } else {
                    selectedArtists.add(artist.name);    // Selecciona
                }
                renderArtists(); // Re-renderiza todas las tarjetas (para actualizar el check)
                updateUI();      // Actualiza contadores
            });

            artistGrid.appendChild(card); // Agrega la tarjeta al DOM
        });

        // ---- TARJETA ESPECIAL "AGREGAR ARTISTA" ----
        // Tarjeta con icono "+" que dirige el foco al campo de búsqueda
        const addCard = document.createElement("div");
        addCard.className = "artist-card add-card"; // Clases: tarjeta base + estilo especial de "agregar"
        addCard.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <p>Search/Add Node</p>
        `;
        // Al hacer clic en la tarjeta "+", pone el foco en el campo de búsqueda de artistas
        addCard.addEventListener("click", () => {
            artistInput.focus(); // Enfoca el input para que el usuario pueda escribir inmediatamente
        });
        artistGrid.appendChild(addCard); // Agrega la tarjeta "+" al final de la cuadrícula
    }

    // ---- RENDERIZAR MOODS ----
    // Crea tarjetas con imagen para cada mood/estado de ánimo
    function renderMoods() {
        moodGrid.innerHTML = ""; // Limpia contenido previo

        allMoods.forEach(mood => {
            const card = document.createElement("div"); // Crea div para la tarjeta
            // Asigna clases: "mood-card" base + "selected-card" si está seleccionado
            card.className = "mood-card" + (selectedMoods.has(mood.name) ? " selected-card" : "");
            
            // HTML del check solo si está seleccionado
            let checkHtml = "";
            if (selectedMoods.has(mood.name)) {
                checkHtml = `<div class="check-icon"><i class="fa-solid fa-check"></i></div>`;
            }

            // HTML interno: imagen + check + nombre del mood
            card.innerHTML = `
                <img src="${mood.cover}">
                ${checkHtml}
                <p>${mood.name}</p>
            `;

            // Listener de clic para alternar selección
            card.addEventListener("click", () => {
                if (selectedMoods.has(mood.name)) {
                    selectedMoods.delete(mood.name); // Deselecciona
                } else {
                    selectedMoods.add(mood.name);    // Selecciona
                }
                renderMoods(); // Re-renderiza para actualizar checks
                updateUI();    // Actualiza contadores
            });

            moodGrid.appendChild(card); // Agrega al DOM
        });
    }

    // ==================== 5. ACTUALIZACIÓN DE LA INTERFAZ ====================
    // Función que actualiza contadores, barra de progreso, estado y botón de compilar
    function updateUI() {
        // Cuenta cuántos elementos tiene seleccionados el usuario en cada categoría
        const gCount = selectedGenres.size;   // Número de géneros seleccionados
        const aCount = selectedArtists.size;  // Número de artistas seleccionados
        const mCount = selectedMoods.size;    // Número de moods seleccionados

        // ---- ACTUALIZAR CONTADORES EN LAS CABECERAS ----
        // Muestra el conteo actual vs el mínimo requerido (3)
        genresCountIndicator.textContent = `${gCount} / 3 MIN`;
        artistsCountIndicator.textContent = `${aCount} / 3 MIN`;
        moodsCountIndicator.textContent = `${mCount} / 3 MIN`;

        // Cambia el color del contador a verde si se cumple el mínimo, gris si no
        genresCountIndicator.style.color = gCount >= 3 ? "#39FF14" : "#9a9a9a";
        artistsCountIndicator.style.color = aCount >= 3 ? "#39FF14" : "#9a9a9a";
        moodsCountIndicator.style.color = mCount >= 3 ? "#39FF14" : "#9a9a9a";

        // ---- CALCULAR PORCENTAJE DE PROGRESO GENERAL ----
        // Cada categoría contribuye un tercio del progreso total
        // Math.min(100, ...) asegura que no exceda 100% por categoría
        const gProg = Math.min(100, (gCount / 3) * 100); // Progreso de géneros (ej: 2/3 = 66.6%)
        const aProg = Math.min(100, (aCount / 3) * 100); // Progreso de artistas
        const mProg = Math.min(100, (mCount / 3) * 100); // Progreso de moods
        // Promedio de los tres progresos, redondeado al entero más cercano
        const overallProg = Math.round((gProg + aProg + mProg) / 3);

        // Actualiza el texto del porcentaje y el ancho de la barra de relleno verde
        progressPercent.textContent = `${overallProg}%`;
        progressBarFill.style.width = `${overallProg}%`;

        // ---- VALIDAR ELEGIBILIDAD PARA COMPILAR ----
        // El usuario necesita al menos 3 selecciones en CADA categoría
        const isEligible = gCount >= 3 && aCount >= 3 && mCount >= 3;

        if (isEligible) {
            // LISTO PARA COMPILAR: Botón se ilumina en verde
            compileBtn.style.background = "#39FF14";                              // Fondo verde neón
            compileBtn.style.color = "black";                                      // Texto negro
            compileBtn.style.boxShadow = "0px 0px 25px rgba(57,255,20,0.4)";      // Resplandor verde
            compileBtn.style.cursor = "pointer";                                   // Cursor de mano
            statusText.textContent = "Algorithm optimized! Ready to compile.";     // Mensaje de éxito
            statusText.style.color = "#39FF14";                                    // Texto verde
        } else {
            // NO LISTO: Botón se muestra gris/deshabilitado
            compileBtn.style.background = "#1f1f1f";                               // Fondo gris oscuro
            compileBtn.style.color = "#777";                                        // Texto gris
            compileBtn.style.boxShadow = "none";                                    // Sin resplandor
            compileBtn.style.cursor = "not-allowed";                                // Cursor de "no permitido"
            statusText.textContent = "Awaiting Data Input (Select min. 3 per module)"; // Mensaje de espera
            statusText.style.color = "#9a9a9a";                                     // Texto gris
        }
    }

    // ==================== 6. BÚSQUEDA Y ADICIÓN DINÁMICA ====================
    // Lógica para filtrar los elementos visibles y agregar nuevos
    
    // ============ GÉNEROS: FILTRAR O AGREGAR ============

    // Listener en el input de búsqueda de géneros: filtra botones en tiempo real
    genreInput.addEventListener("input", () => {
        const query = genreInput.value.toLowerCase().trim(); // Texto de búsqueda normalizado
        const buttons = tagGrid.querySelectorAll("button");  // Todos los botones de género
        buttons.forEach(btn => {
            const name = btn.textContent.toLowerCase();      // Nombre del género en minúsculas
            if (name.includes(query)) {
                btn.style.display = "";     // Muestra el botón si coincide con la búsqueda
            } else {
                btn.style.display = "none"; // Oculta el botón si no coincide
            }
        });
    });

    // Función para agregar un género nuevo (personalizado)
    const addGenre = async () => {
        const name = genreInput.value.trim(); // Lee el nombre del input
        if (!name) return;                    // Si está vacío, no hace nada

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL: Guarda en localStorage
        if (dbMode === "local" || window.location.protocol === "file:") {
            // Lee los géneros personalizados existentes
            let customGenres = JSON.parse(localStorage.getItem("vibes_custom_genres") || "[]");
            // Agrega solo si no existe ya
            if (!customGenres.includes(name)) {
                customGenres.push(name);
                localStorage.setItem("vibes_custom_genres", JSON.stringify(customGenres));
            }
            // Agrega al array de géneros disponibles si no está
            if (!allGenres.includes(name)) {
                allGenres.push(name);
            }
            selectedGenres.add(name); // Lo selecciona automáticamente
            renderGenres();           // Re-renderiza la cuadrícula
            updateUI();               // Actualiza contadores
            genreInput.value = "";    // Limpia el campo de búsqueda
            return;
        }

        // MODO SERVIDOR: Intenta agregar vía API
        try {
            const response = await fetch("/api/preferences/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "genre", name }) // Envía tipo y nombre al servidor
            });
            const data = await response.json();
            if (data.success) {
                const normalized = data.name; // El servidor puede normalizar el nombre
                if (!allGenres.includes(normalized)) {
                    allGenres.push(normalized);
                }
                selectedGenres.add(normalized);
                renderGenres();
                updateUI();
                genreInput.value = "";
            }
        } catch (error) {
            // FALLBACK LOCAL: Si el servidor falla, guarda localmente
            console.error("Error adding genre, falling back locally:", error);
            let customGenres = JSON.parse(localStorage.getItem("vibes_custom_genres") || "[]");
            if (!customGenres.includes(name)) {
                customGenres.push(name);
                localStorage.setItem("vibes_custom_genres", JSON.stringify(customGenres));
            }
            if (!allGenres.includes(name)) {
                allGenres.push(name);
            }
            selectedGenres.add(name);
            renderGenres();
            updateUI();
            genreInput.value = "";
        }
    };

    // Asocia la función addGenre al botón "+" y a la tecla Enter del input
    genreAddBtn.addEventListener("click", addGenre);          // Clic en el botón "+"
    genreInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addGenre();                     // Presionar Enter en el input
    });

    // ============ ARTISTAS: FILTRAR O AGREGAR ============

    // Filtra tarjetas de artistas en tiempo real según la búsqueda
    artistInput.addEventListener("input", () => {
        const query = artistInput.value.toLowerCase().trim();
        // Selecciona todas las tarjetas de artistas excepto la de "agregar" (.add-card)
        const cards = artistGrid.querySelectorAll(".artist-card:not(.add-card)");
        cards.forEach(card => {
            const name = card.querySelector("p").textContent.toLowerCase(); // Nombre del artista
            if (name.includes(query)) {
                card.style.display = "";     // Muestra si coincide
            } else {
                card.style.display = "none"; // Oculta si no coincide
            }
        });
    });

    // Función para agregar un artista nuevo (personalizado)
    const addArtist = async () => {
        const name = artistInput.value.trim();
        if (!name) return;

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL
        if (dbMode === "local" || window.location.protocol === "file:") {
            let customArtists = JSON.parse(localStorage.getItem("vibes_custom_artists") || "[]");
            if (!customArtists.includes(name)) {
                customArtists.push(name);
                localStorage.setItem("vibes_custom_artists", JSON.stringify(customArtists));
            }
            // Verifica si ya existe (sin distinción de mayúsculas)
            const exists = allArtists.some(a => a.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                // Agrega con una imagen genérica de concierto de Unsplash
                allArtists.push({ name: name, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop" });
            }
            selectedArtists.add(name);
            renderArtists();
            updateUI();
            artistInput.value = "";
            return;
        }

        // MODO SERVIDOR
        try {
            const response = await fetch("/api/preferences/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "artist", name })
            });
            const data = await response.json();
            if (data.success) {
                const normalized = data.name;
                const exists = allArtists.some(a => a.name.toLowerCase() === normalized.toLowerCase());
                if (!exists) {
                    allArtists.push({ name: normalized, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop" });
                }
                selectedArtists.add(normalized);
                renderArtists();
                updateUI();
                artistInput.value = "";
            }
        } catch (error) {
            // FALLBACK LOCAL
            console.error("Error adding artist, falling back locally:", error);
            let customArtists = JSON.parse(localStorage.getItem("vibes_custom_artists") || "[]");
            if (!customArtists.includes(name)) {
                customArtists.push(name);
                localStorage.setItem("vibes_custom_artists", JSON.stringify(customArtists));
            }
            const exists = allArtists.some(a => a.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                allArtists.push({ name: name, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop" });
            }
            selectedArtists.add(name);
            renderArtists();
            updateUI();
            artistInput.value = "";
        }
    };

    // Asocia la función addArtist al botón "+" y a Enter
    artistAddBtn.addEventListener("click", addArtist);
    artistInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addArtist();
    });

    // ============ MOODS: FILTRAR O AGREGAR ============

    // Filtra tarjetas de moods en tiempo real
    moodInput.addEventListener("input", () => {
        const query = moodInput.value.toLowerCase().trim();
        const cards = moodGrid.querySelectorAll(".mood-card");
        cards.forEach(card => {
            const name = card.querySelector("p").textContent.toLowerCase();
            if (name.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });

    // Función para agregar un mood nuevo
    const addMood = async () => {
        const name = moodInput.value.trim();
        if (!name) return;

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL
        if (dbMode === "local" || window.location.protocol === "file:") {
            let customMoods = JSON.parse(localStorage.getItem("vibes_custom_moods") || "[]");
            if (!customMoods.includes(name)) {
                customMoods.push(name);
                localStorage.setItem("vibes_custom_moods", JSON.stringify(customMoods));
            }
            const exists = allMoods.some(m => m.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                allMoods.push({ name: name, cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop" });
            }
            selectedMoods.add(name);
            renderMoods();
            updateUI();
            moodInput.value = "";
            return;
        }

        // MODO SERVIDOR
        try {
            const response = await fetch("/api/preferences/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "mood", name })
            });
            const data = await response.json();
            if (data.success) {
                const normalized = data.name;
                const exists = allMoods.some(m => m.name.toLowerCase() === normalized.toLowerCase());
                if (!exists) {
                    allMoods.push({ name: normalized, cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop" });
                }
                selectedMoods.add(normalized);
                renderMoods();
                updateUI();
                moodInput.value = "";
            }
        } catch (error) {
            // FALLBACK LOCAL
            console.error("Error adding mood, falling back locally:", error);
            let customMoods = JSON.parse(localStorage.getItem("vibes_custom_moods") || "[]");
            if (!customMoods.includes(name)) {
                customMoods.push(name);
                localStorage.setItem("vibes_custom_moods", JSON.stringify(customMoods));
            }
            const exists = allMoods.some(m => m.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                allMoods.push({ name: name, cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop" });
            }
            selectedMoods.add(name);
            renderMoods();
            updateUI();
            moodInput.value = "";
        }
    };

    // Asocia addMood al botón "+" y a Enter
    moodAddBtn.addEventListener("click", addMood);
    moodInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addMood();
    });

    // ==================== 7. COMPILAR ALGORITMO (GUARDAR Y REDIRIGIR) ====================
    // Cuando el usuario pulsa "COMPILAR ALGORITMO", guarda sus preferencias y va al Home

    compileBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Previene la navegación automática del enlace padre

        // Verifica que se cumplan los mínimos
        const gCount = selectedGenres.size;
        const aCount = selectedArtists.size;
        const mCount = selectedMoods.size;

        // Si alguna categoría tiene menos de 3, muestra alerta y no continúa
        if (gCount < 3 || aCount < 3 || mCount < 3) {
            alert("Debes seleccionar al menos 3 de cada módulo para compilar tu perfil auditivo.");
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL: Guarda las preferencias en localStorage
        if (dbMode === "local" || window.location.protocol === "file:") {
            // Crea un objeto con todas las preferencias del usuario
            const userPrefs = {
                username,                              // Nombre del usuario
                genres: Array.from(selectedGenres),    // Convierte el Set a Array para poder serializar a JSON
                artists: Array.from(selectedArtists),
                moods: Array.from(selectedMoods)
            };
            // Guarda las preferencias bajo la clave específica del usuario
            localStorage.setItem(`vibes_prefs_${username}`, JSON.stringify(userPrefs));
            
            // También guarda en un registro global de todos los usuarios (para consultas generales)
            let localUsersPrefs = JSON.parse(localStorage.getItem("vibes_local_users_prefs") || "{}");
            localUsersPrefs[username] = userPrefs;
            localStorage.setItem("vibes_local_users_prefs", JSON.stringify(localUsersPrefs));

            // Redirige a la página principal
            window.location.href = "home.html";
            return;
        }

        // MODO SERVIDOR: Envía las preferencias al backend Flask
        try {
            const response = await fetch("/api/preferences/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    genres: Array.from(selectedGenres),
                    artists: Array.from(selectedArtists),
                    moods: Array.from(selectedMoods)
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                // Éxito: redirige al Home
                window.location.href = "home.html";
            } else {
                // Error del servidor: muestra alerta
                alert(data.message || "Error al compilar algoritmo auditivo.");
            }
        } catch (error) {
            // FALLBACK LOCAL: Si el servidor falla, guarda localmente
            console.error("Save preferences error:", error);
            const userPrefs = {
                username,
                genres: Array.from(selectedGenres),
                artists: Array.from(selectedArtists),
                moods: Array.from(selectedMoods)
            };
            localStorage.setItem(`vibes_prefs_${username}`, JSON.stringify(userPrefs));
            
            let localUsersPrefs = JSON.parse(localStorage.getItem("vibes_local_users_prefs") || "{}");
            localUsersPrefs[username] = userPrefs;
            localStorage.setItem("vibes_local_users_prefs", JSON.stringify(localUsersPrefs));

            window.location.href = "home.html";
        }
    });

    // ==================== INICIALIZACIÓN ====================
    // Llama a loadCatalog() para cargar los datos y renderizar la interfaz al cargar la página
    loadCatalog();

}); // Fin del listener DOMContentLoaded