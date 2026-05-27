// VIBES - Lógica de Visualización de una Playlist
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

    // 2. Control de Sesión y lectura de parámetros de URL
    const username = localStorage.getItem("vibes_user");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get("id");
    const playlistName = urlParams.get("name") || "Lista de Reproducción";

    if (!playlistId) {
        alert("Playlist no especificada.");
        window.location.href = "library.html";
        return;
    }

    // Actualizar cabecera con el nombre de la playlist
    const titleEl = document.getElementById("playlist-title");
    const coverEl = document.getElementById("playlist-cover");
    const songCountEl = document.getElementById("playlist-song-count");
    const playBtn = document.getElementById("playlist-play-btn");
    const songsContainer = document.getElementById("songs-container");

    if (titleEl) titleEl.textContent = playlistName;

    let playlistSongs = [];
    let playlistObj = null;

    // 3. Cargar canciones de la playlist (Híbrido)
    async function loadPlaylistSongs() {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalPlaylistSongs();
            return;
        }

        try {
            const response = await fetch(`/api/library/playlists/${playlistId}/songs`);
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            
            playlistSongs = data.songs || [];
            // Asignar carátula
            if (coverEl) {
                coverEl.src = data.cover || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop`;
            }
            renderPlaylistSongs(playlistSongs);
        } catch (error) {
            console.error("Error loading playlist songs, trying locally:", error);
            loadLocalPlaylistSongs();
        }
    }

    function loadLocalPlaylistSongs() {
        const playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
        playlistObj = playlists.find(p => p.id === playlistId);
        
        if (!playlistObj) {
            alert("La lista seleccionada no existe localmente.");
            window.location.href = "library.html";
            return;
        }

        if (titleEl) titleEl.textContent = playlistObj.name;
        if (coverEl) {
            coverEl.src = playlistObj.cover || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format&fit=crop`;
        }

        // Mapear los títulos guardados en local con el catálogo de canciones
        const catalog = window.VIBES_CATALOG || { songs: [] };
        const savedTitles = playlistObj.songs || [];
        
        playlistSongs = catalog.songs.filter(s => savedTitles.includes(s.title));
        renderPlaylistSongs(playlistSongs);
    }

    function renderPlaylistSongs(songs) {
        if (!songsContainer) return;
        songsContainer.innerHTML = "";

        if (songCountEl) {
            songCountEl.textContent = `${songs.length} canción${songs.length === 1 ? "" : "es"}`;
        }

        if (songs.length === 0) {
            songsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #555;">
                    <p style="font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Esta lista está vacía</p>
                    <p style="font-size: 13px; margin-top: 8px;">Navega a la pestaña de "Buscar" para descubrir y agregar canciones a tu lista.</p>
                </div>
            `;
            return;
        }

        songs.forEach((song, index) => {
            const row = document.createElement("div");
            row.className = "song-row";
            row.style.cursor = "pointer";
            row.style.position = "relative";

            const idxStr = (index + 1) < 10 ? `0${index + 1}` : index + 1;

            row.innerHTML = `
                <span>${idxStr}</span>
                <div class="song-title" style="flex: 2;">
                    <img src="${song.cover}" alt="${song.title}">
                    <div>
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                </div>
                <p style="text-transform: capitalize; flex: 1;">${song.genre}</p>
                <span style="color: #39FF14; font-weight: 600; text-transform: capitalize; flex: 1;">${song.mood}</span>
                <button class="remove-song-btn" title="Quitar de Lista" style="background:transparent; border:none; color:#ff3333; cursor:pointer; font-size: 14px; padding: 10px; z-index: 10; margin-left: auto; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-trash"></i></button>
            `;

            // Al hacer clic en la fila, reproducir
            row.addEventListener("click", (e) => {
                if (e.target.closest(".remove-song-btn")) return; // No reproducir si es botón eliminar
                if (window.vibesPlayer) {
                    window.vibesPlayer.playTrack(song, songs);
                }
            });

            // Lógica para quitar canción
            row.querySelector(".remove-song-btn").addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm(`¿Deseas quitar la canción "${song.title}" de esta lista?`)) {
                    removeSongFromPlaylist(song.title);
                }
            });

            songsContainer.appendChild(row);
        });
    }

    async function removeSongFromPlaylist(songTitle) {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            playlists = playlists.map(p => {
                if (p.id === playlistId) {
                    return { ...p, songs: p.songs.filter(title => title !== songTitle) };
                }
                return p;
            });
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            loadPlaylistSongs();
            return;
        }

        try {
            const response = await fetch("/api/library/playlists/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playlist_id: playlistId, song_title: songTitle })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                loadPlaylistSongs();
            } else {
                alert(data.message || "Error al quitar la canción.");
            }
        } catch (error) {
            console.error("Remove song error, doing local fallback:", error);
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            playlists = playlists.map(p => {
                if (p.id === playlistId) {
                    return { ...p, songs: p.songs.filter(title => title !== songTitle) };
                }
                return p;
            });
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            loadPlaylistSongs();
        }
    }

    // 4. Botón de reproducción de la playlist
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (playlistSongs.length === 0) {
                alert("Esta lista no tiene canciones. Agrega algunas usando la búsqueda (Buscar) primero.");
                return;
            }

            if (window.vibesPlayer) {
                window.vibesPlayer.playTrack(playlistSongs[0], playlistSongs);
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
            prefGenres = ["Rock", "Pop"]; // Fallback
        }

        const catalog = window.VIBES_CATALOG || { songs: [] };
        const matchingSongs = catalog.songs.filter(song => 
            prefGenres.some(g => g.toLowerCase() === song.genre.toLowerCase())
        );

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



    loadPlaylistSongs();
});