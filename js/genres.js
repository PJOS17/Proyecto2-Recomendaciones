// VIBES - Selección de Preferencias y Curación del Algoritmo
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar partículas de fondo
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
        // Si no hay sesión, volver a index.html
        window.location.href = "index.html";
        return;
    }

    const tagGrid = document.querySelector(".tag-grid");
    const artistGrid = document.querySelector(".artist-grid");
    const moodGrid = document.querySelector(".mood-grid");
    const compileBtn = document.querySelector(".compile-btn");
    const compileLink = compileBtn.closest("a");
    const progressPercent = document.querySelector(".progress-percent");
    const progressBarFill = document.querySelector(".progress-bar .progress");
    const statusText = document.querySelector(".status-section p");

    // Inputs de busqueda/adición
    const genreInput = document.getElementById("genre-search");
    const genreAddBtn = document.getElementById("genre-add-btn");
    
    const artistInput = document.getElementById("artist-search");
    const artistAddBtn = document.getElementById("artist-add-btn");
    
    const moodInput = document.getElementById("mood-search");
    const moodAddBtn = document.getElementById("mood-add-btn");

    // Indicadores visuales de mínimos por sección
    const sectionHeaders = document.querySelectorAll(".section-header");
    const genresCountIndicator = sectionHeaders[0].querySelector("span");
    const artistsCountIndicator = sectionHeaders[1].querySelector("span");
    const moodsCountIndicator = sectionHeaders[2].querySelector("span");

    // Estado del usuario
    let selectedGenres = new Set();
    let selectedArtists = new Set();
    let selectedMoods = new Set();

    let allGenres = [];
    let allArtists = [];
    let allMoods = [];

    // Prevenir redirección automática en el enlace del botón de compilar
    if (compileLink) {
        compileLink.addEventListener("click", (e) => {
            e.preventDefault();
        });
    }

    // 3. Obtener catálogo del backend
    async function loadCatalog() {
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            loadLocalCatalog();
            return;
        }

        try {
            const response = await fetch("/api/preferences");
            const data = await response.json();

            allGenres = data.genres;
            allArtists = data.artists;
            allMoods = data.moods;

            renderGenres();
            renderArtists();
            renderMoods();
            updateUI();
        } catch (error) {
            console.error("Error loading preferences catalog, falling back to local:", error);
            loadLocalCatalog();
        }
    }

    function loadLocalCatalog() {
        const catalog = window.VIBES_CATALOG || { genres: [], artists: [], moods: [] };
        
        let customGenres = JSON.parse(localStorage.getItem("vibes_custom_genres") || "[]");
        let customArtists = JSON.parse(localStorage.getItem("vibes_custom_artists") || "[]");
        let customMoods = JSON.parse(localStorage.getItem("vibes_custom_moods") || "[]");

        allGenres = [...new Set([...catalog.genres, ...customGenres])];
        
        allArtists = [...catalog.artists];
        customArtists.forEach(name => {
            if (!allArtists.some(a => a.name.toLowerCase() === name.toLowerCase())) {
                allArtists.push({ name: name, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop" });
            }
        });

        allMoods = [...catalog.moods];
        customMoods.forEach(name => {
            if (!allMoods.some(m => m.name.toLowerCase() === name.toLowerCase())) {
                allMoods.push({ name: name, cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop" });
            }
        });

        // Cargar preferencias seleccionadas previamente si existen
        let userPrefs = JSON.parse(localStorage.getItem(`vibes_prefs_${username}`) || "{}");
        if (userPrefs.genres) userPrefs.genres.forEach(g => selectedGenres.add(g));
        if (userPrefs.artists) userPrefs.artists.forEach(a => selectedArtists.add(a));
        if (userPrefs.moods) userPrefs.moods.forEach(m => selectedMoods.add(m));

        renderGenres();
        renderArtists();
        renderMoods();
        updateUI();
    }

    // 4. Renderizadores de DOM
    function renderGenres() {
        tagGrid.innerHTML = "";
        allGenres.forEach(genre => {
            const btn = document.createElement("button");
            btn.textContent = genre;
            if (selectedGenres.has(genre)) {
                btn.className = "selected-tag";
            }
            btn.addEventListener("click", () => {
                if (selectedGenres.has(genre)) {
                    selectedGenres.delete(genre);
                    btn.className = "";
                } else {
                    selectedGenres.add(genre);
                    btn.className = "selected-tag";
                }
                updateUI();
            });
            tagGrid.appendChild(btn);
        });
    }

    function renderArtists() {
        artistGrid.innerHTML = "";
        allArtists.forEach(artist => {
            const card = document.createElement("div");
            card.className = "artist-card" + (selectedArtists.has(artist.name) ? " selected-card" : "");
            
            let checkHtml = "";
            if (selectedArtists.has(artist.name)) {
                checkHtml = `<div class="check-icon"><i class="fa-solid fa-check"></i></div>`;
            }

            card.innerHTML = `
                <img src="${artist.cover}">
                ${checkHtml}
                <p>${artist.name}</p>
            `;

            card.addEventListener("click", () => {
                if (selectedArtists.has(artist.name)) {
                    selectedArtists.delete(artist.name);
                } else {
                    selectedArtists.add(artist.name);
                }
                renderArtists();
                updateUI();
            });

            artistGrid.appendChild(card);
        });

        // Agregar la tarjeta de "Search Node" especial estática
        const addCard = document.createElement("div");
        addCard.className = "artist-card add-card";
        addCard.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <p>Search/Add Node</p>
        `;
        addCard.addEventListener("click", () => {
            artistInput.focus();
        });
        artistGrid.appendChild(addCard);
    }

    function renderMoods() {
        moodGrid.innerHTML = "";
        allMoods.forEach(mood => {
            const card = document.createElement("div");
            card.className = "mood-card" + (selectedMoods.has(mood.name) ? " selected-card" : "");
            
            let checkHtml = "";
            if (selectedMoods.has(mood.name)) {
                checkHtml = `<div class="check-icon"><i class="fa-solid fa-check"></i></div>`;
            }

            card.innerHTML = `
                <img src="${mood.cover}">
                ${checkHtml}
                <p>${mood.name}</p>
            `;

            card.addEventListener("click", () => {
                if (selectedMoods.has(mood.name)) {
                    selectedMoods.delete(mood.name);
                } else {
                    selectedMoods.add(mood.name);
                }
                renderMoods();
                updateUI();
            });

            moodGrid.appendChild(card);
        });
    }

    // 5. Actualización de Estados e Interfaz
    function updateUI() {
        const gCount = selectedGenres.size;
        const aCount = selectedArtists.size;
        const mCount = selectedMoods.size;

        // Actualizar contadores en las cabeceras
        genresCountIndicator.textContent = `${gCount} / 3 MIN`;
        artistsCountIndicator.textContent = `${aCount} / 3 MIN`;
        moodsCountIndicator.textContent = `${mCount} / 3 MIN`;

        // Color verde si se cumple el mínimo en cada cabecera
        genresCountIndicator.style.color = gCount >= 3 ? "#39FF14" : "#9a9a9a";
        artistsCountIndicator.style.color = aCount >= 3 ? "#39FF14" : "#9a9a9a";
        moodsCountIndicator.style.color = mCount >= 3 ? "#39FF14" : "#9a9a9a";

        // Calcular porcentaje general de Neural Mapping (Progreso)
        // Mapear que el 100% es cuando al menos se seleccionaron 3 de cada tipo
        const gProg = Math.min(100, (gCount / 3) * 100);
        const aProg = Math.min(100, (aCount / 3) * 100);
        const mProg = Math.min(100, (mCount / 3) * 100);
        const overallProg = Math.round((gProg + aProg + mProg) / 3);

        progressPercent.textContent = `${overallProg}%`;
        progressBarFill.style.width = `${overallProg}%`;

        // Validar si el algoritmo se puede compilar
        const isEligible = gCount >= 3 && aCount >= 3 && mCount >= 3;

        if (isEligible) {
            compileBtn.style.background = "#39FF14";
            compileBtn.style.color = "black";
            compileBtn.style.boxShadow = "0px 0px 25px rgba(57,255,20,0.4)";
            compileBtn.style.cursor = "pointer";
            statusText.textContent = "Algorithm optimized! Ready to compile.";
            statusText.style.color = "#39FF14";
        } else {
            compileBtn.style.background = "#1f1f1f";
            compileBtn.style.color = "#777";
            compileBtn.style.boxShadow = "none";
            compileBtn.style.cursor = "not-allowed";
            statusText.textContent = "Awaiting Data Input (Select min. 3 per module)";
            statusText.style.color = "#9a9a9a";
        }
    }

    // 6. Lógica de Búsqueda y Adición Dinámica
    
    // GÉNEROS: Filtrar o Agregar
    genreInput.addEventListener("input", () => {
        const query = genreInput.value.toLowerCase().trim();
        const buttons = tagGrid.querySelectorAll("button");
        buttons.forEach(btn => {
            const name = btn.textContent.toLowerCase();
            if (name.includes(query)) {
                btn.style.display = "";
            } else {
                btn.style.display = "none";
            }
        });
    });

    const addGenre = async () => {
        const name = genreInput.value.trim();
        if (!name) return;

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
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
            return;
        }

        try {
            const response = await fetch("/api/preferences/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "genre", name })
            });
            const data = await response.json();
            if (data.success) {
                const normalized = data.name;
                if (!allGenres.includes(normalized)) {
                    allGenres.push(normalized);
                }
                selectedGenres.add(normalized);
                renderGenres();
                updateUI();
                genreInput.value = "";
            }
        } catch (error) {
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
    genreAddBtn.addEventListener("click", addGenre);
    genreInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addGenre();
    });

    // ARTISTAS: Filtrar o Agregar
    artistInput.addEventListener("input", () => {
        const query = artistInput.value.toLowerCase().trim();
        const cards = artistGrid.querySelectorAll(".artist-card:not(.add-card)");
        cards.forEach(card => {
            const name = card.querySelector("p").textContent.toLowerCase();
            if (name.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });

    const addArtist = async () => {
        const name = artistInput.value.trim();
        if (!name) return;

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
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
            return;
        }

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
    artistAddBtn.addEventListener("click", addArtist);
    artistInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addArtist();
    });

    // MOODS: Filtrar o Agregar
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

    const addMood = async () => {
        const name = moodInput.value.trim();
        if (!name) return;

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
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
    moodAddBtn.addEventListener("click", addMood);
    moodInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addMood();
    });

    // 7. Compilar Algoritmo (Guardar y Redirigir)
    compileBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const gCount = selectedGenres.size;
        const aCount = selectedArtists.size;
        const mCount = selectedMoods.size;

        if (gCount < 3 || aCount < 3 || mCount < 3) {
            alert("Debes seleccionar al menos 3 de cada módulo para compilar tu perfil auditivo.");
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
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
            return;
        }

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
                // Redirigir a Home
                window.location.href = "home.html";
            } else {
                alert(data.message || "Error al compilar algoritmo auditivo.");
            }
        } catch (error) {
            console.error("Save preferences error:", error);
            // Fallback local en caso de error de red
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

    // Cargar catálogo inicial
    loadCatalog();
});