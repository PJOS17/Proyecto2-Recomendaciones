// VIBES - Lógica de Biblioteca y Playlists
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

    // Actualizar nombre
    const userH1 = document.getElementById("library-username");
    if (userH1) userH1.textContent = username;

    const playlistsGrid = document.getElementById("playlists-grid");
    const statsContainer = document.getElementById("library-stats");
    
    // Modal
    const modal = document.getElementById("playlist-modal");
    const createBtn = document.getElementById("create-playlist-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const savePlaylistBtn = document.getElementById("save-playlist-btn");
    const playlistNameInput = document.getElementById("playlist-name-input");
    const playlistCoverInput = document.getElementById("playlist-cover-input");
    const modalTitle = document.getElementById("modal-title");
    const shufflePlayBtn = document.getElementById("shuffle-play-btn");

    let loadedPlaylists = [];
    let editingPlaylistId = null; // null significa crear, si tiene id significa editar

    // 3. Obtener playlists (Híbrido)
    async function loadPlaylists() {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalPlaylists();
            return;
        }

        try {
            const response = await fetch(`/api/library/playlists?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            
            loadedPlaylists = data.playlists || [];
            renderPlaylists(loadedPlaylists);
        } catch (error) {
            console.error("Error loading playlists, trying locally:", error);
            loadLocalPlaylists();
        }
    }

    function loadLocalPlaylists() {
        const playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
        loadedPlaylists = playlists;
        renderPlaylists(playlists);
    }

    function renderPlaylists(playlists) {
        if (!playlistsGrid) return;
        playlistsGrid.innerHTML = "";

        // Actualizar estadísticas
        if (statsContainer) {
            statsContainer.innerHTML = `<span>${playlists.length} Lista${playlists.length === 1 ? "" : "s"}</span>`;
        }

        if (playlists.length === 0) {
            playlistsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; border: 1px dashed #222; border-radius: 20px; background: rgba(0,0,0,0.5);">
                    <p style="color: #666; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">No has creado ninguna lista de reproducción</p>
                    <p style="color: #444; font-size: 13px; margin-top: 8px;">Haz clic en el botón "+" de arriba para crear una nueva vía sonora.</p>
                </div>
            `;
            return;
        }

        playlists.forEach((playlist, index) => {
            const card = document.createElement("div");
            card.className = "library-card";
            card.style.position = "relative";
            
            const coverUrl = playlist.cover || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop`;

            card.innerHTML = `
                <a href="playlist.html?id=${playlist.id}&name=${encodeURIComponent(playlist.name)}" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${coverUrl}" alt="${playlist.name}">
                    <h4>${playlist.name}</h4>
                    <p>Lista • ${username}</p>
                </a>
                <div style="position: absolute; bottom: 50px; right: 10px; display: flex; gap: 8px; z-index: 10;">
                    <button class="edit-pl-btn" data-id="${playlist.id}" title="Editar Lista" style="background: rgba(0,0,0,0.85); border: 1px solid #39FF14; color: #39FF14; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-pl-btn" data-id="${playlist.id}" title="Eliminar Lista" style="background: rgba(0,0,0,0.85); border: 1px solid #ff3333; color: #ff3333; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            // Vincular botón de editar
            card.querySelector(".edit-pl-btn").addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                editingPlaylistId = playlist.id;
                modalTitle.textContent = "Editar Lista";
                savePlaylistBtn.textContent = "Guardar";
                playlistNameInput.value = playlist.name;
                playlistCoverInput.value = playlist.cover || "";
                modal.style.display = "flex";
                playlistNameInput.focus();
            });

            // Vincular botón de eliminar
            card.querySelector(".delete-pl-btn").addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`¿Estás seguro de que deseas eliminar la lista de reproducción "${playlist.name}"?`)) {
                    deletePlaylist(playlist.id);
                }
            });

            playlistsGrid.appendChild(card);
        });
    }

    async function deletePlaylist(playlistId) {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            playlists = playlists.filter(p => p.id !== playlistId);
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            loadPlaylists();
            return;
        }

        try {
            const response = await fetch(`/api/library/playlists/delete?playlist_id=${playlistId}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (response.ok && data.success) {
                loadPlaylists();
            } else {
                alert(data.message || "Error al eliminar lista.");
            }
        } catch (error) {
            console.error("Delete playlist error:", error);
            // Fallback local
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            playlists = playlists.filter(p => p.id !== playlistId);
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            loadPlaylists();
        }
    }

    // 4. Lógica de Modal (Crear/Editar)
    createBtn.addEventListener("click", () => {
        editingPlaylistId = null;
        modalTitle.textContent = "Compilar Nueva Lista";
        savePlaylistBtn.textContent = "Compilar";
        playlistNameInput.value = "";
        playlistCoverInput.value = "";
        modal.style.display = "flex";
        playlistNameInput.focus();
    });

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    savePlaylistBtn.addEventListener("click", async () => {
        const name = playlistNameInput.value.trim();
        const cover = playlistCoverInput.value.trim();

        if (!name) {
            alert("Por favor ingresa un título para la lista.");
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            // Guardar localmente
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            
            if (editingPlaylistId) {
                // Editar existente
                playlists = playlists.map(p => {
                    if (p.id === editingPlaylistId) {
                        return { ...p, name: name, cover: cover };
                    }
                    return p;
                });
            } else {
                // Crear nueva
                const newPl = {
                    id: "pl-" + Date.now() + "-" + Math.floor(Math.random()*1000),
                    name: name,
                    cover: cover,
                    username: username,
                    songs: []
                };
                playlists.push(newPl);
            }
            
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            modal.style.display = "none";
            loadPlaylists();
            return;
        }

        try {
            let response, data;
            if (editingPlaylistId) {
                // Endpoint para actualizar nombre y foto
                response = await fetch("/api/library/playlists/edit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ playlist_id: editingPlaylistId, name, cover })
                });
            } else {
                response = await fetch("/api/library/playlists/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, name, cover })
                });
            }

            data = await response.json();
            if (response.ok && data.success) {
                modal.style.display = "none";
                loadPlaylists();
            } else {
                alert(data.message || "Error al procesar la lista.");
            }
        } catch (error) {
            console.error("Save playlist error, performing fallback:", error);
            // Fallback local
            let playlists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            if (editingPlaylistId) {
                playlists = playlists.map(p => {
                    if (p.id === editingPlaylistId) {
                        return { ...p, name: name, cover: cover };
                    }
                    return p;
                });
            } else {
                const newPl = {
                    id: "pl-" + Date.now() + "-" + Math.floor(Math.random()*1000),
                    name: name,
                    cover: cover,
                    username: username,
                    songs: []
                };
                playlists.push(newPl);
            }
            localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(playlists));
            modal.style.display = "none";
            loadPlaylists();
        }
    });

    // 5. Shuffle Play (Reproducción aleatoria global de todas sus playlists)
    shufflePlayBtn.addEventListener("click", async () => {
        if (loadedPlaylists.length === 0) {
            // Si no hay playlists, reproducir catálogo general aleatoriamente como fallback
            const catalog = window.VIBES_CATALOG || { songs: [] };
            const songs = catalog.songs || [];
            if (songs.length > 0 && window.vibesPlayer) {
                window.vibesPlayer.isShuffle = true;
                const randomIdx = Math.floor(Math.random() * songs.length);
                window.vibesPlayer.playTrack(songs[randomIdx], songs);
                alert("Iniciando reproducción aleatoria del catálogo musical VIBES.");
            }
            return;
        }

        // Obtener canciones locales o de API
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            let allSongs = [];
            const catalog = window.VIBES_CATALOG || { songs: [] };
            
            loadedPlaylists.forEach(p => {
                const playlistSongs = catalog.songs.filter(s => p.songs.includes(s.title));
                allSongs = allSongs.concat(playlistSongs);
            });

            if (allSongs.length === 0) {
                alert("Tus listas están vacías. Agrega canciones usando la pestaña de búsqueda (Buscar) primero.");
                return;
            }

            if (window.vibesPlayer) {
                window.vibesPlayer.isShuffle = true;
                const randomIdx = Math.floor(Math.random() * allSongs.length);
                window.vibesPlayer.playTrack(allSongs[randomIdx], allSongs);
                alert(`Iniciando reproducción aleatoria local de tus listas (${allSongs.length} canciones encontradas).`);
            }
            return;
        }

        try {
            let allSongs = [];
            for (let p of loadedPlaylists) {
                const response = await fetch(`/api/library/playlists/${p.id}/songs`);
                const data = await response.json();
                if (data.songs && data.songs.length > 0) {
                    allSongs = allSongs.concat(data.songs);
                }
            }

            if (allSongs.length === 0) {
                alert("Tus playlists están vacías. Agrega canciones usando la pestaña de búsqueda (Buscar) primero.");
                return;
            }

            if (window.vibesPlayer) {
                window.vibesPlayer.isShuffle = true;
                const randomIdx = Math.floor(Math.random() * allSongs.length);
                window.vibesPlayer.playTrack(allSongs[randomIdx], allSongs);
                alert(`Iniciando reproducción aleatoria de tus playlists (${allSongs.length} canciones).`);
            }
        } catch (error) {
            console.error("Shuffle play error, falling back locally:", error);
            // Fallback local
            let allSongs = [];
            const catalog = window.VIBES_CATALOG || { songs: [] };
            
            loadedPlaylists.forEach(p => {
                const playlistSongs = catalog.songs.filter(s => p.songs.includes(s.title));
                allSongs = allSongs.concat(playlistSongs);
            });

            if (allSongs.length > 0 && window.vibesPlayer) {
                window.vibesPlayer.isShuffle = true;
                const randomIdx = Math.floor(Math.random() * allSongs.length);
                window.vibesPlayer.playTrack(allSongs[randomIdx], allSongs);
                alert(`Iniciando reproducción aleatoria local (${allSongs.length} canciones).`);
            }
        }
    });

    // 6. Vincular botón "Tus Géneros Top" en barra lateral
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



    loadPlaylists();
});