// VIBES - Lógica de Búsqueda
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

    // 2. Elementos DOM
    const username = localStorage.getItem("vibes_user");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    const searchInput = document.getElementById("search-input");
    const resultsTitle = document.getElementById("results-title");
    const resultsGrid = document.getElementById("search-results-grid");
    const tagButtons = document.querySelectorAll(".tag-row button");

    let timeoutId = null;

    function removeAccents(str) {
        if (!str) return "";
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // 3. Función de búsqueda (Híbrido)
    async function performSearch(query) {
        if (!query) {
            resultsTitle.style.display = "none";
            resultsGrid.style.display = "none";
            resultsGrid.innerHTML = "";
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            performLocalSearch(query);
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            
            renderResults(data.results, data.is_semantic, query);
        } catch (error) {
            console.error("Search API error, falling back locally:", error);
            performLocalSearch(query);
        }
    }

    function getSemanticRecommendations(queryClean, songs) {
        const synonyms = {
            "melancolia": ["triste", "llorar", "soledad", "deprimido", "tristeza", "sad", "nostalgia", "recuerdo", "lluvia", "melancol", "llorando"],
            "ejercicio": ["ejercicio", "correr", "gym", "fuerza", "pesas", "entrenar", "deporte", "fitness", "entrenamiento"],
            "fiesta": ["fiesta", "bailar", "discoteca", "party", "reventon", "divertido", "farra", "rumba", "pista"],
            "estudio": ["estudio", "tarea", "concentracion", "leer", "escribir", "enfoque", "oficina", "focus"],
            "relajacion": ["dormir", "relajar", "calma", "paz", "zen", "descanso", "meditar", "relax", "tranquilo"],
            "pop": ["amor", "romance", "pareja", "corazon", "enamorado", "novio", "novia", "baladas"],
            "rock": ["guitarra", "bateria", "clasico", "rock", "metal", "pesado", "heavy", "metallica", "acdc", "queen"],
            "hip hop": ["rap", "calle", "rima", "urbano", "hiphop", "trap"],
            "reggaeton": ["baile", "perreo", "urbano", "caribe", "reggaeton", "latino", "bad bunny", "feid", "karol g", "lindos", "ojitos"],
            "electronica": ["futurista", "computadora", "robot", "sintetizador", "electronica", "techno", "rave"]
        };

        let matchedCategory = null;
        for (const [category, keywords] of Object.entries(synonyms)) {
            if (keywords.some(kw => queryClean.includes(kw))) {
                matchedCategory = category;
                break;
            }
        }

        let results = [];
        if (matchedCategory) {
            results = songs.filter(song => 
                song.mood.toLowerCase() === matchedCategory || 
                song.genre.toLowerCase() === matchedCategory
            );
        }

        // Si sigue vacío, es una palabra al azar. Devolvemos 5 canciones variadas e icónicas recomendadas.
        if (results.length === 0) {
            const targetTitles = ["Ojitos Lindos", "Sweet Child O' Mine", "Blinding Lights", "Hello", "Do I Wanna Know?"];
            results = songs.filter(song => targetTitles.includes(song.title));
            // Si por alguna razón está vacío, devolvemos las primeras 5
            if (results.length === 0) {
                results = songs.slice(0, 5);
            }
        }

        return results;
    }

    function performLocalSearch(query) {
        const catalog = window.VIBES_CATALOG || { songs: [] };
        const queryClean = removeAccents(query.toLowerCase().trim());

        let matchingSongs = catalog.songs.filter(song => {
            const cleanTitle = removeAccents(song.title.toLowerCase());
            const cleanArtist = removeAccents(song.artist.toLowerCase());
            const cleanGenre = removeAccents(song.genre.toLowerCase());
            const cleanMood = removeAccents(song.mood.toLowerCase());

            return cleanTitle.includes(queryClean) ||
                   cleanArtist.includes(queryClean) ||
                   cleanGenre.includes(queryClean) ||
                   cleanMood.includes(queryClean);
        });

        const isSemanticRecommendation = (matchingSongs.length === 0);

        if (isSemanticRecommendation) {
            matchingSongs = getSemanticRecommendations(queryClean, catalog.songs);
        }

        renderResults(matchingSongs, isSemanticRecommendation, query);
    }

    function renderResults(songs, isSemantic = false, originalQuery = "") {
        resultsTitle.style.display = "block";
        if (isSemantic) {
            resultsTitle.innerHTML = `<span style="color: #39FF14;"><i class="fa-solid fa-microchip"></i> RECOMENDACIONES NEURONALES VIBES</span> <span style="font-size: 11px; color: #888; font-weight: normal;">(Búsqueda aproximada para "${originalQuery}")</span>`;
        } else {
            resultsTitle.innerHTML = `<span style="color: white;">Resultados de Búsqueda</span>`;
        }
        resultsGrid.style.display = "grid";
        resultsGrid.innerHTML = "";

        if (songs.length === 0) {
            resultsGrid.innerHTML = `<p style="color: #666; grid-column: 1/-1; text-align: center;">No se encontraron resultados de resonancia acústica.</p>`;
            return;
        }

        // Obtener playlists (Híbrido)
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            const localPlaylists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
            populateCards(songs, localPlaylists);
        } else {
            fetch(`/api/library/playlists?username=${encodeURIComponent(username)}`)
                .then(res => res.json())
                .then(playlistData => {
                    const playlists = playlistData.playlists || [];
                    populateCards(songs, playlists);
                })
                .catch(err => {
                    console.error("Error loading server playlists, falling back locally:", err);
                    const localPlaylists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
                    populateCards(songs, localPlaylists);
                });
        }
    }

    function populateCards(songs, playlists) {
        resultsGrid.innerHTML = "";
        songs.forEach(song => {
            const card = document.createElement("div");
            card.className = "music-card";
            card.style.position = "relative";
            card.style.cursor = "pointer";

            let addPlaylistDropdown = "";
            if (playlists.length > 0) {
                addPlaylistDropdown = `
                    <div class="add-playlist-btn" title="Agregar a Playlist" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.8); border: 1px solid #39FF14; color: #39FF14; width: 28px; height: 28px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 12px; transition: 0.3s;">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <div class="playlist-dropdown" style="display: none; position: absolute; top: 42px; right: 10px; z-index: 20; background: #0d0d0d; border: 1px solid #1f1f1f; border-radius: 8px; width: 150px; padding: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <p style="color: #666; font-size: 11px; padding: 4px; text-transform: uppercase; border-bottom: 1px solid #1f1f1f; margin-bottom: 4px; pointer-events: none;">Agregar a Lista:</p>
                        ${playlists.map(p => `<div class="dropdown-item" data-playlist-id="${p.id}" style="color: white; font-size: 13px; padding: 6px; border-radius: 4px; transition: 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>`).join("")}
                    </div>
                `;
            }

            card.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                ${addPlaylistDropdown}
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            `;

            // Lógica para reproducir al hacer click
            card.addEventListener("click", (e) => {
                if (e.target.closest(".add-playlist-btn") || e.target.closest(".playlist-dropdown")) {
                    return;
                }
                
                if (window.vibesPlayer) {
                    window.vibesPlayer.playTrack(song, songs);
                }
            });

            // Lógica del desplegable de playlists
            const plusBtn = card.querySelector(".add-playlist-btn");
            const dropdown = card.querySelector(".playlist-dropdown");

            if (plusBtn && dropdown) {
                plusBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const isVisible = dropdown.style.display === "block";
                    document.querySelectorAll(".playlist-dropdown").forEach(d => d.style.display = "none");
                    dropdown.style.display = isVisible ? "none" : "block";
                });

                dropdown.querySelectorAll(".dropdown-item").forEach(item => {
                    item.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        const playlistId = item.getAttribute("data-playlist-id");
                        const playlistName = item.textContent;

                        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
                        if (dbMode === "local" || window.location.protocol === "file:") {
                            // Modo Local Fallback
                            let localPlaylists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
                            let pl = localPlaylists.find(p => p.id === playlistId);
                            if (pl) {
                                if (!pl.songs) pl.songs = [];
                                if (!pl.songs.includes(song.title)) {
                                    pl.songs.push(song.title);
                                    localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(localPlaylists));
                                    alert(`Agregada "${song.title}" a tu lista "${playlistName}" con éxito.`);
                                } else {
                                    alert(`La canción "${song.title}" ya está en tu lista.`);
                                }
                            }
                            dropdown.style.display = "none";
                            return;
                        }

                        try {
                            const response = await fetch("/api/library/playlists/add", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ playlist_id: playlistId, song_title: song.title })
                            });
                            const data = await response.json();
                            if (response.ok && data.success) {
                                alert(`Agregada "${song.title}" a tu lista "${playlistName}" con éxito.`);
                            } else {
                                alert("No se pudo agregar la canción a la lista.");
                            }
                        } catch (err) {
                            console.error("Error adding song to playlist, trying locally:", err);
                            // Fallback local en caso de error del servidor
                            let localPlaylists = JSON.parse(localStorage.getItem(`vibes_playlists_${username}`) || "[]");
                            let pl = localPlaylists.find(p => p.id === playlistId);
                            if (pl) {
                                if (!pl.songs) pl.songs = [];
                                if (!pl.songs.includes(song.title)) {
                                    pl.songs.push(song.title);
                                    localStorage.setItem(`vibes_playlists_${username}`, JSON.stringify(localPlaylists));
                                    alert(`Agregada "${song.title}" a tu lista "${playlistName}" con éxito.`);
                                } else {
                                    alert(`La canción "${song.title}" ya está en tu lista.`);
                                }
                            }
                        }
                        dropdown.style.display = "none";
                    });

                    // Estilo interactivo hover
                    item.addEventListener("mouseenter", () => {
                        item.style.background = "#39FF14";
                        item.style.color = "black";
                    });
                    item.addEventListener("mouseleave", () => {
                        item.style.background = "";
                        item.style.color = "white";
                    });
                });
            }

            resultsGrid.appendChild(card);
        });
    }

    // Ocultar desplegables de playlists al hacer clic fuera
    document.addEventListener("click", () => {
        document.querySelectorAll(".playlist-dropdown").forEach(d => d.style.display = "none");
    });

    function updateRelatedSearches(query) {
        const container = document.getElementById("related-searches-container");
        const box = document.getElementById("related-searches");
        if (!container || !box) return;

        if (!query) {
            container.style.display = "none";
            box.innerHTML = "";
            return;
        }

        const q = query.toLowerCase().trim();
        const cleanQ = removeAccents(q).replace(/[^a-z0-9]/g, "");
        let suggestions = [];

        if (cleanQ.includes("gym") || cleanQ.includes("ejercicio") || cleanQ.includes("entrenar") || cleanQ.includes("deporte") || cleanQ.includes("fuerza") || cleanQ.includes("pesas")) {
            suggestions = ["Ejercicio", "Monster", "Eminem", "Metal"];
        } else if (cleanQ.includes("estudi") || cleanQ.includes("tarea") || cleanQ.includes("enfoque") || cleanQ.includes("concentr") || cleanQ.includes("leer") || cleanQ.includes("focus") || cleanQ.includes("lectura")) {
            suggestions = ["Estudio", "Enfoque", "In The End", "Daft Punk"];
        } else if (cleanQ.includes("fiest") || cleanQ.includes("party") || cleanQ.includes("bailar") || cleanQ.includes("disco") || cleanQ.includes("dance") || cleanQ.includes("rumba") || cleanQ.includes("farra")) {
            suggestions = ["Fiesta", "Karol G", "Reggaetón", "Uptown Funk", "Dua Lipa"];
        } else if (cleanQ.includes("trist") || cleanQ.includes("llorar") || cleanQ.includes("melancol") || cleanQ.includes("lluvia") || cleanQ.includes("sad") || cleanQ.includes("depre") || cleanQ.includes("soledad")) {
            suggestions = ["Melancolía", "Billie Eilish", "Adele", "Baladas"];
        } else if (cleanQ.includes("dormir") || cleanQ.includes("relaj") || cleanQ.includes("relax") || cleanQ.includes("calma") || cleanQ.includes("paz") || cleanQ.includes("chill") || cleanQ.includes("zen")) {
            suggestions = ["Relajación", "Bad Bunny", "Harry Styles", "Pop"];
        } else if (cleanQ.includes("rock") || cleanQ.includes("metal") || cleanQ.includes("heavy") || cleanQ.includes("guitar") || cleanQ.includes("acdc") || cleanQ.includes("guns") || cleanQ.includes("queen") || cleanQ.includes("metallica")) {
            suggestions = ["Rock", "Metal", "Guns N' Roses", "Metallica", "Queen"];
        } else if (cleanQ.includes("rap") || cleanQ.includes("hiphop") || cleanQ.includes("trap") || cleanQ.includes("flow") || cleanQ.includes("drake") || cleanQ.includes("eminem") || cleanQ.includes("travis") || cleanQ.includes("scott")) {
            suggestions = ["Hip Hop", "Eminem", "Drake", "Travis Scott"];
        } else if (cleanQ.includes("electro") || cleanQ.includes("daft") || cleanQ.includes("synth") || cleanQ.includes("edm") || cleanQ.includes("techno")) {
            suggestions = ["Electrónica", "Daft Punk", "Get Lucky", "One More Time"];
        } else if (cleanQ.includes("pop") || cleanQ.includes("taylor") || cleanQ.includes("billie") || cleanQ.includes("styles") || cleanQ.includes("adele") || cleanQ.includes("mars")) {
            suggestions = ["Pop", "Taylor Swift", "Billie Eilish", "Harry Styles", "Adele"];
        } else if (cleanQ.includes("reggaeton") || cleanQ.includes("badbunny") || cleanQ.includes("karolg") || cleanQ.includes("feid") || cleanQ.includes("perreo")) {
            suggestions = ["Reggaetón", "Bad Bunny", "Karol G", "Feid"];
        }

        if (suggestions.length > 0) {
            container.style.display = "flex";
            box.innerHTML = "";
            suggestions.forEach(tag => {
                const btn = document.createElement("button");
                btn.textContent = tag;
                btn.style = "background: #111; border: 1px solid #333; border-radius: 20px; color: #888; font-size: 11px; padding: 6px 12px; cursor: pointer; transition: 0.3s; font-family: inherit; font-weight: bold;";
                btn.addEventListener("mouseenter", () => {
                    btn.style.borderColor = "#39FF14";
                    btn.style.color = "#39FF14";
                    btn.style.boxShadow = "0 0 8px rgba(57,255,20,0.2)";
                });
                btn.addEventListener("mouseleave", () => {
                    btn.style.borderColor = "#333";
                    btn.style.color = "#888";
                    btn.style.boxShadow = "none";
                });
                btn.addEventListener("click", () => {
                    searchInput.value = tag;
                    performSearch(tag);
                    updateRelatedSearches(tag);
                });
                box.appendChild(btn);
            });
        } else {
            container.style.display = "none";
            box.innerHTML = "";
        }
    }

    // 4. Captura de eventos de teclado (Debounce)
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        
        updateRelatedSearches(query);

        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // 5. Vincular botones de tags estáticos arriba
    tagButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tagText = btn.textContent;
            searchInput.value = tagText;
            performSearch(tagText);
            updateRelatedSearches(tagText);
        });
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



    // === INICIALIZACIÓN DEL MAPA DE TOPOLOGÍA INTERACTIVA (GRAFO) ===
    function initTopologyGraph() {
        const fakeGraph = document.querySelector(".fake-graph");
        if (!fakeGraph) return;

        // Limpiar fakeGraph de cualquier nodo anterior (excepto el centro original)
        fakeGraph.innerHTML = '<div class="center-node" style="z-index: 5; display: flex; align-items: center; justify-content: center; color: black; font-weight: bold; font-size: 11px; text-shadow: none; box-shadow: 0 0 25px #39FF14; background: radial-gradient(circle, #39FF14 0%, #050505 100%); border: 2px solid #39FF14;">NÚCLEO</div>';

        // Crear contenedor SVG para las líneas
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("style", "position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 1;");
        fakeGraph.appendChild(svg);

        // Estilos para fake-graph para asegurar posicionamiento absoluto correcto
        fakeGraph.style.position = "relative";
        fakeGraph.style.overflow = "hidden";

        // Datos de los 5 nodos de órbita
        const orbitNodes = [
            { id: "Rock", label: "Rock", code: "NOD_ROCK", comp: "98.4%", bpm: "85%", timbre: "90%", neural: "95%", top: "20%", left: "15%" },
            { id: "Pop", label: "Pop", code: "NOD_POP", comp: "92.1%", bpm: "60%", timbre: "75%", neural: "80%", top: "15%", right: "20%" },
            { id: "Reggaetón", label: "Reggae", code: "NOD_REGGAETON", comp: "89.7%", bpm: "50%", timbre: "45%", neural: "70%", bottom: "25%", left: "15%" },
            { id: "Metal", label: "Metal", code: "NOD_METAL", comp: "95.3%", bpm: "90%", timbre: "95%", neural: "88%", bottom: "15%", right: "15%" },
            { id: "Estudio", label: "Estudio", code: "NOD_ESTUDIO", comp: "88.2%", bpm: "30%", timbre: "65%", neural: "60%", top: "50%", right: "10%" }
        ];

        // Nodo activo por defecto
        let activeNodeId = "Rock";

        // Función para seleccionar un nodo
        const selectNode = (node) => {
            activeNodeId = node.id;

            // Actualizar clases de los divs de los nodos
            document.querySelectorAll(".graph-orbit-node").forEach(n => {
                if (n.dataset.id === node.id) {
                    n.style.background = "#39FF14";
                    n.style.color = "black";
                    n.style.borderColor = "#39FF14";
                    n.style.boxShadow = "0 0 20px #39FF14";
                    n.style.transform = "scale(1.1)";
                } else {
                    n.style.background = "#0d0d0d";
                    n.style.color = "white";
                    n.style.borderColor = "rgba(57, 255, 20, 0.4)";
                    n.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
                    n.style.transform = "scale(1)";
                }
            });

            // Actualizar líneas del SVG
            orbitNodes.forEach(n => {
                const line = document.getElementById(`line-${n.id}`);
                if (line) {
                    if (n.id === node.id) {
                        line.setAttribute("stroke", "#39FF14");
                        line.setAttribute("stroke-width", "3");
                        line.setAttribute("stroke-opacity", "1");
                    } else {
                        line.setAttribute("stroke", "rgba(57,255,20,0.2)");
                        line.setAttribute("stroke-width", "1.5");
                        line.setAttribute("stroke-opacity", "0.5");
                    }
                }
            });

            // Actualizar panel lateral de la derecha
            const nodePanel = document.querySelector(".node-panel");
            if (nodePanel) {
                const title = nodePanel.querySelector("h1");
                const comp = nodePanel.querySelector("p");
                const stats = nodePanel.querySelectorAll(".stat");

                if (title) title.textContent = node.code;
                if (comp) comp.textContent = `Índice de Compatibilidad: ${node.comp}`;

                if (stats.length >= 3) {
                    // Actualizar las barras y anchos con transición
                    stats[0].querySelector(".line").style.width = node.bpm;
                    stats[1].querySelector(".line").style.width = node.timbre;
                    stats[2].querySelector(".line").style.width = node.neural;
                }
            }
        };

        // Renderizar los nodos
        orbitNodes.forEach(node => {
            // 1. Crear la línea SVG asociada
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.id = `line-${node.id}`;
            line.setAttribute("x1", "50%");
            line.setAttribute("y1", "50%");
            
            // Determinar coordenadas de fin según top/left/right/bottom
            let x2 = "50%";
            let y2 = "50%";
            
            if (node.left) x2 = node.left;
            if (node.right) x2 = `calc(100% - ${node.right})`;
            if (node.top) y2 = node.top;
            if (node.bottom) y2 = `calc(100% - ${node.bottom})`;

            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", "rgba(57,255,20,0.2)");
            line.setAttribute("stroke-width", "1.5");
            svg.appendChild(line);

            // 2. Crear el elemento div del nodo de órbita
            const nDiv = document.createElement("div");
            nDiv.className = "graph-orbit-node";
            nDiv.dataset.id = node.id;
            nDiv.textContent = node.label;
            
            // Aplicar estilos base
            nDiv.style = "position: absolute; width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; z-index: 6; text-shadow: 0 1px 2px black; border: 1px solid rgba(57,255,20,0.4); background: #0d0d0d;";
            
            // Posicionar
            if (node.top) nDiv.style.top = node.top;
            if (node.bottom) nDiv.style.bottom = node.bottom;
            if (node.left) nDiv.style.left = node.left;
            if (node.right) nDiv.style.right = node.right;

            // Hover effects
            nDiv.addEventListener("mouseenter", () => {
                if (activeNodeId !== node.id) {
                    nDiv.style.borderColor = "#39FF14";
                    nDiv.style.boxShadow = "0 0 15px rgba(57, 255, 20, 0.6)";
                    nDiv.style.transform = "scale(1.1)";
                }
            });
            nDiv.addEventListener("mouseleave", () => {
                if (activeNodeId !== node.id) {
                    nDiv.style.borderColor = "rgba(57, 255, 20, 0.4)";
                    nDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
                    nDiv.style.transform = "scale(1)";
                }
            });

            // Click event
            nDiv.addEventListener("click", () => {
                selectNode(node);
            });

            fakeGraph.appendChild(nDiv);
        });

        // 3. Vincular botón de "Reproducir Nodo" (Play Cluster)
        const playClusterBtn = document.querySelector(".play-cluster");
        if (playClusterBtn) {
            const newBtn = playClusterBtn.cloneNode(true);
            playClusterBtn.parentNode.replaceChild(newBtn, playClusterBtn);
            
            newBtn.addEventListener("click", () => {
                const catalog = window.VIBES_CATALOG || { songs: [] };
                
                // Filtrar canciones del catálogo que pertenezcan a la categoría activa
                const genreFilter = activeNodeId === "Estudio" ? "Pop" : activeNodeId;
                const filteredSongs = catalog.songs.filter(song => 
                    song.genre.toLowerCase() === genreFilter.toLowerCase() ||
                    song.mood.toLowerCase() === activeNodeId.toLowerCase()
                );
                
                if (filteredSongs.length > 0 && window.vibesPlayer) {
                    window.vibesPlayer.playTrack(filteredSongs[0], filteredSongs);
                    if (typeof showVibesNotification !== "undefined") {
                        showVibesNotification(`Reproduciendo el cluster neuronal de "${activeNodeId.toUpperCase()}" (${filteredSongs.length} canciones).`, "CLUSTER ACTIVO");
                    } else {
                        alert(`Reproduciendo el cluster neuronal de "${activeNodeId.toUpperCase()}"`);
                    }
                } else {
                    // Fallback
                    const defaultSong = catalog.songs[0];
                    if (defaultSong && window.vibesPlayer) {
                        window.vibesPlayer.playTrack(defaultSong, catalog.songs);
                    }
                }
            });
        }

        // Seleccionar el nodo "Rock" por defecto para inicializar la vista con un gran aspecto visual
        const defaultNode = orbitNodes.find(n => n.id === "Rock");
        if (defaultNode) {
            selectNode(defaultNode);
        }
    }

    // Inicializar el grafo al cargar la página
    initTopologyGraph();
});