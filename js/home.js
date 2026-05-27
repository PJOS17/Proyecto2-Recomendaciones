// VIBES - Lógica de la Página Principal (Home)
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar partículas
    particlesJS("particles-js", {
        particles: {
            number: { value: 70 },
            color: { value: "#39FF14" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: 2 },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#39FF14",
                opacity: 0.2,
                width: 1
            },
            move: { enable: true, speed: 1 }
        }
    });

    // 2. Control de Sesión
    const username = localStorage.getItem("vibes_user");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    // Saludo dinámico traducido
    const welcomeMsg = document.getElementById("welcome-message");
    if (welcomeMsg) {
        welcomeMsg.textContent = `Bienvenido de nuevo, ${username}`;
    }

    // Elementos DOM para recomendaciones
    const songsGrid = document.getElementById("recommended-songs-grid");
    const artistsGrid = document.getElementById("recommended-artists-grid");

    // 3. Cargar recomendaciones (Híbrido)
    async function loadRecommendations() {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalRecommendations();
            return;
        }

        try {
            const response = await fetch(`/api/recommendations?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error("Server response error");
            const data = await response.json();

            renderRecommendedSongs(data.songs);
            renderRecommendedArtists(data.artists);
        } catch (error) {
            console.error("Error loading recommendations, loading locally:", error);
            loadLocalRecommendations();
        }
    }

    function loadLocalRecommendations() {
        const catalog = window.VIBES_CATALOG || { songs: [], artists: [] };
        
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        let prefGenres = userPrefs.genres || [];
        let prefArtists = userPrefs.artists || [];
        let prefMoods = userPrefs.moods || [];

        // Si no tiene preferencias locales, usar valores por defecto del catálogo famoso
        if (prefGenres.length === 0) prefGenres = ["Rock", "Pop", "Reggaetón"];
        if (prefArtists.length === 0) prefArtists = ["Guns N' Roses", "Linkin Park", "Bad Bunny"];
        if (prefMoods.length === 0) prefMoods = ["Estudio", "Fiesta", "Ejercicio"];

        // 1. Recomendar Canciones por Afinidad de Nodos
        let scoredSongs = catalog.songs.map(song => {
            let score = 0;
            if (prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase())) score += 1;
            if (prefArtists.some(a => a.toLowerCase() === song.artist.toLowerCase())) score += 1.5;
            if (prefMoods.some(m => m.toLowerCase() === song.mood.toLowerCase())) score += 1;
            return { song, score };
        });

        // Ordenar por afinidad
        scoredSongs.sort((a, b) => b.score - a.score);
        let recommendedSongs = scoredSongs.map(item => item.song);

        // 2. Recomendar Artistas
        let recommendedArtists = [];
        let addedNames = new Set();

        catalog.artists.forEach(artist => {
            if (prefArtists.some(pa => pa.toLowerCase() === artist.name.toLowerCase())) {
                recommendedArtists.push(artist);
                addedNames.add(artist.name.toLowerCase());
            }
        });

        catalog.songs.forEach(song => {
            if (prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase()) || 
                prefMoods.some(m => m.toLowerCase() === song.mood.toLowerCase())) {
                let artistObj = catalog.artists.find(a => a.name.toLowerCase() === song.artist.toLowerCase());
                if (artistObj && !addedNames.has(artistObj.name.toLowerCase())) {
                    recommendedArtists.push(artistObj);
                    addedNames.add(artistObj.name.toLowerCase());
                }
            }
        });

        catalog.artists.forEach(artist => {
            if (!addedNames.has(artist.name.toLowerCase())) {
                recommendedArtists.push(artist);
                addedNames.add(artist.name.toLowerCase());
            }
        });

        renderRecommendedSongs(recommendedSongs);
        renderRecommendedArtists(recommendedArtists);
    }

    function renderRecommendedSongs(songs) {
        if (!songsGrid) return;
        songsGrid.innerHTML = "";

        if (songs.length === 0) {
            songsGrid.innerHTML = `<p style="color: #555; grid-column: 1/-1; text-align: center;">No hay recomendaciones disponibles para tu perfil.</p>`;
            return;
        }

        songs.forEach(song => {
            const card = document.createElement("div");
            card.className = "music-card";
            card.style.cursor = "pointer";
            card.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;

            card.addEventListener("click", (e) => {
                e.preventDefault();
                if (window.vibesPlayer) {
                    window.vibesPlayer.playTrack(song, songs);
                }
            });

            songsGrid.appendChild(card);
        });
    }

    function renderRecommendedArtists(artists) {
        if (!artistsGrid) return;
        artistsGrid.innerHTML = "";

        if (artists.length === 0) {
            artistsGrid.innerHTML = `<p style="color: #555; grid-column: 1/-1; text-align: center;">No hay artistas recomendados en este momento.</p>`;
            return;
        }

        artists.forEach(artist => {
            const card = document.createElement("div");
            card.className = "music-card";
            card.style.cursor = "pointer";
            card.innerHTML = `
                <img src="${artist.cover}" alt="${artist.name}" style="border-radius: 50%;">
                <h4>${artist.name}</h4>
                <p>Nodo Auditivo</p>
            `;

            card.addEventListener("click", () => {
                alert(`Conectando con el nodo neuronal de ${artist.name}. Resonancia armónica optimizada al 98.4%.`);
            });

            artistsGrid.appendChild(card);
        });
    }

    // 4. Modal de Configuración (Settings)
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const resetAppBtn = document.getElementById("reset-app-btn");
    const dbModeSelect = document.getElementById("db-mode-select");
    const neo4jCreds = document.getElementById("neo4j-creds-container");

    const neo4jUri = document.getElementById("neo4j-uri");
    const neo4jUser = document.getElementById("neo4j-user");
    const neo4jPass = document.getElementById("neo4j-pass");

    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Cargar valores guardados
            const savedMode = localStorage.getItem("vibes_db_mode") || "local";
            dbModeSelect.value = savedMode;
            if (savedMode === "neo4j") {
                neo4jCreds.style.display = "block";
            } else {
                neo4jCreds.style.display = "none";
            }

            neo4jUri.value = localStorage.getItem("vibes_neo4j_uri") || "neo4j+s://d544acc5.databases.neo4j.io";
            neo4jUser.value = localStorage.getItem("vibes_neo4j_user") || "d544acc5";
            neo4jPass.value = localStorage.getItem("vibes_neo4j_pass") || "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k";

            settingsModal.style.display = "flex";
        });

        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "none";
        });

        dbModeSelect.addEventListener("change", () => {
            if (dbModeSelect.value === "neo4j") {
                neo4jCreds.style.display = "block";
            } else {
                neo4jCreds.style.display = "none";
            }
        });

        saveSettingsBtn.addEventListener("click", () => {
            localStorage.setItem("vibes_db_mode", dbModeSelect.value);
            if (dbModeSelect.value === "neo4j") {
                localStorage.setItem("vibes_neo4j_uri", neo4jUri.value.trim());
                localStorage.setItem("vibes_neo4j_user", neo4jUser.value.trim());
                localStorage.setItem("vibes_neo4j_pass", neo4jPass.value.trim());
            }
            settingsModal.style.display = "none";
            window.location.reload();
        });

        resetAppBtn.addEventListener("click", () => {
            if (confirm("¿Estás seguro de que deseas reiniciar todos los datos locales y cerrar sesión?")) {
                localStorage.clear();
                alert("Datos locales eliminados con éxito.");
                window.location.href = "index.html";
            }
        });
    }

    // 5. Vincular botón "Tus Géneros Top" en barra lateral
    const genresBtn = document.querySelector(".genres-btn");
    if (genresBtn) {
        genresBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showTopGenresModal();
        });
    }

    function showTopGenresModal() {
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        let prefGenres = userPrefs.genres || [];

        if (prefGenres.length === 0) {
            prefGenres = ["Rock", "Pop"]; // Fallback por defecto si no han elegido
        }

        const catalog = window.VIBES_CATALOG || { songs: [] };
        // Filtrar canciones que pertenezcan a los géneros favoritos
        const matchingSongs = catalog.songs.filter(song => 
            prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase())
        );

        // Crear/Obtener el modal en el DOM
        let modal = document.getElementById("genres-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "genres-modal";
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1001; display:flex; justify-content:center; align-items:center; font-family:inherit;";
            document.body.appendChild(modal);
        }

        let songsListHtml = "";
        if (matchingSongs.length === 0) {
            songsListHtml = `<p style="color: #666; text-align: center; padding: 20px;">No hay canciones que coincidan con tus géneros top en este momento.</p>`;
        } else {
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

        modal.style.display = "flex";

        // Escuchadores del modal
        modal.querySelector("#genres-modal-close").addEventListener("click", () => {
            modal.style.display = "none";
        });

        modal.querySelector("#genres-modal-play-all").addEventListener("click", () => {
            if (matchingSongs.length > 0 && window.vibesPlayer) {
                window.vibesPlayer.playTrack(matchingSongs[0], matchingSongs);
                modal.style.display = "none";
            }
        });

        modal.querySelectorAll(".modal-play-song-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-index"));
                if (window.vibesPlayer && matchingSongs[idx]) {
                    window.vibesPlayer.playTrack(matchingSongs[idx], matchingSongs);
                    modal.style.display = "none";
                }
            });
        });
    }

    // Exponer la función del modal para que pueda ser invocada desde otros archivos si es necesario
    window.showTopGenresModal = showTopGenresModal;

    // Cargar las recomendaciones iniciales
    loadRecommendations();
});