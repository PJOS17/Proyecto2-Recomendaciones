// VIBES - Lógica de la Pantalla de Reproducción en Pantalla Completa (Player)
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

    const queueContainer = document.getElementById("queue-container");
    const canvas = document.getElementById("audio-visualizer");

    // 3. Renderizar la cola de reproducción
    function renderQueue() {
        if (!queueContainer || !window.vibesPlayer) return;
        queueContainer.innerHTML = "";

        const queue = window.vibesPlayer.queue || [];
        const currentIndex = window.vibesPlayer.queueIndex || 0;

        if (queue.length === 0) {
            queueContainer.innerHTML = `<p style="color: #444; font-size: 13px; padding: 10px;">La cola de reproducción está vacía.</p>`;
            return;
        }

        queue.forEach((song, index) => {
            const isCurrent = (index === currentIndex);
            
            const songDiv = document.createElement("div");
            songDiv.className = `queue-song${isCurrent ? ' active-song' : ''}`;
            songDiv.style.cursor = "pointer";

            const songImg = song.cover || `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100&auto=format&fit=crop`;

            songDiv.innerHTML = `
                <img src="${songImg}" alt="${song.title}">
                <div>
                    <h4 style="${isCurrent ? 'color: #39FF14;' : ''}">${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            `;

            // Hacer clic en un elemento de la cola lo reproduce
            songDiv.addEventListener("click", () => {
                window.vibesPlayer.queueIndex = index;
                window.vibesPlayer.loadTrack(song);
                window.vibesPlayer.play();
                renderQueue();
            });

            queueContainer.appendChild(songDiv);
        });
    }

    // 4. Visualizador Gráfico de Ondas (Canvas)
    let animationFrameId = null;
    let barHeights = Array(32).fill(5);

    function initVisualizer() {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Ajustar resolución del canvas a su tamaño real de visualización
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        function draw() {
            animationFrameId = requestAnimationFrame(draw);
            
            const w = canvas.getBoundingClientRect().width;
            const h = canvas.getBoundingClientRect().height;
            
            ctx.clearRect(0, 0, w, h);

            const isPlaying = window.vibesPlayer && window.vibesPlayer.isPlaying;
            const numBars = 32;
            const gap = 4;
            const barWidth = (w - (numBars - 1) * gap) / numBars;

            // Actualizar alturas de barras con ruido simulado reactivo
            for (let i = 0; i < numBars; i++) {
                if (isPlaying) {
                    // Simular frecuencias con ondas sinusoidales combinadas y aleatoriedad
                    const time = Date.now() * 0.003;
                    const sinVal = Math.sin(i * 0.15 + time) * Math.cos(i * 0.05 - time * 0.5);
                    const targetHeight = Math.max(10, (sinVal + 1) * 0.5 * (h - 20) + Math.random() * 15);
                    // Suavizado de transición
                    barHeights[i] += (targetHeight - barHeights[i]) * 0.2;
                } else {
                    // Decaer lentamente a una línea plana pequeña
                    barHeights[i] += (5 - barHeights[i]) * 0.1;
                }
            }

            // Crear gradiente premium cyberpunk
            const gradient = ctx.createLinearGradient(0, h, 0, 0);
            gradient.addColorStop(0, "#39FF14"); // Verde Neón
            gradient.addColorStop(0.5, "#00F0FF"); // Azul Neón
            gradient.addColorStop(1, "#FF007F"); // Rosa Cyberpunk

            // Dibujar las barras de espectro
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(57,255,20,0.5)";

            for (let i = 0; i < numBars; i++) {
                const x = i * (barWidth + gap);
                const y = h - barHeights[i];
                
                ctx.fillStyle = gradient;
                
                // Dibujar esquinas redondeadas en la punta de cada barra
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeights[i], [4, 4, 0, 0]);
                ctx.fill();
            }

            // Dibujar una cuadrícula de datos decorativa en el fondo
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(57,255,20,0.05)";
            ctx.lineWidth = 1;
            
            const gridSpacing = 20;
            for (let x = 0; x < w; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSpacing) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            
            // Actualizar letras sincronizadas en tiempo real
            updateLyrics();
        }

        draw();
    }

    let showTranslated = false;

    const translateBtn = document.getElementById("translate-lyrics-btn");
    if (translateBtn) {
        translateBtn.addEventListener("click", () => {
            showTranslated = !showTranslated;
            if (showTranslated) {
                translateBtn.innerHTML = `<i class="fa-solid fa-language"></i> Ver Original`;
                translateBtn.style.borderColor = "#ff007f";
                translateBtn.style.color = "#ff007f";
                translateBtn.style.boxShadow = "0 0 10px rgba(255,0,127,0.25)";
            } else {
                translateBtn.innerHTML = `<i class="fa-solid fa-language"></i> Traducir al Español`;
                translateBtn.style.borderColor = "#39FF14";
                translateBtn.style.color = "#39FF14";
                translateBtn.style.boxShadow = "0 0 10px rgba(57,255,20,0.15)";
            }
            const lyricsBox = document.getElementById("player-lyrics-box");
            if (lyricsBox) {
                delete lyricsBox.dataset.lastHash;
            }
        });
    }

    function updateLyrics() {
        const lyricsBox = document.getElementById("player-lyrics-box");
        if (!lyricsBox) return;
        
        if (!window.vibesPlayer || !window.vibesPlayer.currentTrack) {
            lyricsBox.innerHTML = `<p style="color: #666; font-style: italic;">[Selecciona una canción para iniciar la decodificación neuronal]</p>`;
            return;
        }
        
        const track = window.vibesPlayer.currentTrack;
        const hasLyrics = track.lyrics && track.lyrics.length > 0;
        
        if (!hasLyrics) {
            lyricsBox.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p style="color: #39FF14; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; text-shadow: 0 0 8px rgba(57,255,20,0.4);"><i class="fa-solid fa-microchip"></i> PISTA INSTRUMENTAL</p>
                    <p style="color: #666; font-style: italic; font-size: 13px;">[Sinfonía digital libre de modulación vocal]</p>
                </div>
            `;
            return;
        }
        
        const lyrics = (showTranslated && track.lyricsTranslated && track.lyricsTranslated.length > 0) 
            ? track.lyricsTranslated 
            : track.lyrics;
        
        const duration = window.vibesPlayer.audio ? window.vibesPlayer.audio.duration : 0;
        const currentTime = window.vibesPlayer.audio ? window.vibesPlayer.audio.currentTime : 0;
        const totalDuration = (duration && !isNaN(duration) && duration > 0) ? duration : 30;
        const timePerLine = totalDuration / lyrics.length;
        const lineIndex = Math.min(lyrics.length - 1, Math.floor(currentTime / timePerLine));
        
        let html = "";
        lyrics.forEach((line, idx) => {
            const isActive = (idx === lineIndex);
            const color = isActive ? "#39FF14" : "#444";
            const fontSize = isActive ? "22px" : "15px";
            const fontWeight = isActive ? "bold" : "normal";
            const textShadow = isActive ? "0 0 12px rgba(57, 255, 20, 0.7)" : "none";
            const transition = "all 0.3s ease";
            const scale = isActive ? "transform: scale(1.05);" : "";
            
            html += `<p style="color: ${color}; font-size: ${fontSize}; font-weight: ${fontWeight}; text-shadow: ${textShadow}; transition: ${transition}; ${scale} margin: 6px 0;">${line}</p>`;
        });
        
        const newHtmlHash = lyrics.length + "_" + lineIndex + "_" + showTranslated;
        if (lyricsBox.dataset.lastHash !== newHtmlHash) {
            lyricsBox.innerHTML = html;
            lyricsBox.dataset.lastHash = newHtmlHash;
            
            const activeLineEl = lyricsBox.children[lineIndex];
            if (activeLineEl) {
                activeLineEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }

    // 5. Configurar eventos de actualización del controlador
    window.addEventListener("vibes_song_changed", (e) => {
        renderQueue();
    });

    // Vincular controles de la pantalla de reproducción completa
    function updateSongTitleInfo() {
        if (window.vibesPlayer && window.vibesPlayer.currentTrack) {
            const titleEl = document.getElementById("player-song-title");
            const artistEl = document.getElementById("player-song-artist");
            if (titleEl) titleEl.textContent = window.vibesPlayer.currentTrack.title;
            if (artistEl) artistEl.textContent = window.vibesPlayer.currentTrack.artist;
        }
    }

    window.addEventListener("vibes_song_changed", () => {
        updateSongTitleInfo();
    });

    // 6. Vincular botón "Tus Géneros Top" en barra lateral
    const genresBtn = document.querySelector(".genres-btn");
    if (genresBtn) {
        // Quitar listeners estáticos viejos de genres.html
        const newGenresBtn = genresBtn.cloneNode(true);
        genresBtn.parentNode.replaceChild(newGenresBtn, genresBtn);
        newGenresBtn.addEventListener("click", (e) => {
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

    // Inicializar visualizador e info de canción
    initVisualizer();
    updateSongTitleInfo();
    renderQueue();
});