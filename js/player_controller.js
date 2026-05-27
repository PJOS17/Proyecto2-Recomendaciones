// VIBES - Controlador de Reproducción Persistente de Audio
// Administra el audio utilizando HTML5 Audio y localStorage para sincronización entre páginas.

class PlayerController {
    constructor() {
        this.audio = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.queue = [];
        this.queueIndex = 0;
        this.isShuffle = false;
        this.isRepeat = false;
        this.volume = 0.8;
        
        this.loadState();
        this.initAudio();
        this.setupIntervals();
    }

    loadState() {
        try {
            const track = localStorage.getItem("vibes_current_track");
            this.currentTrack = track ? JSON.parse(track) : null;
            this.isPlaying = localStorage.getItem("vibes_is_playing") === "true";
            this.isShuffle = localStorage.getItem("vibes_shuffle") === "true";
            this.isRepeat = localStorage.getItem("vibes_repeat") === "true";
            
            const vol = localStorage.getItem("vibes_volume");
            this.volume = vol !== null ? parseFloat(vol) : 0.8;
            
            const savedQueue = localStorage.getItem("vibes_queue");
            this.queue = savedQueue ? JSON.parse(savedQueue) : [];
            
            const idx = localStorage.getItem("vibes_queue_index");
            this.queueIndex = idx !== null ? parseInt(idx) : 0;
        } catch (e) {
            console.error("Error loading player state:", e);
        }
    }

    saveState() {
        try {
            if (this.currentTrack) {
                localStorage.setItem("vibes_current_track", JSON.stringify(this.currentTrack));
            } else {
                localStorage.removeItem("vibes_current_track");
            }
            localStorage.setItem("vibes_is_playing", this.isPlaying);
            localStorage.setItem("vibes_shuffle", this.isShuffle);
            localStorage.setItem("vibes_repeat", this.isRepeat);
            localStorage.setItem("vibes_volume", this.volume);
            localStorage.setItem("vibes_queue", JSON.stringify(this.queue));
            localStorage.setItem("vibes_queue_index", this.queueIndex);
            
            if (this.audio) {
                localStorage.setItem("vibes_current_time", this.audio.currentTime);
            }
        } catch (e) {
            console.error("Error saving player state:", e);
        }
    }

    initAudio() {
        if (!this.currentTrack) return;

        // Crear instancia del elemento Audio
        this.audio = new Audio(this.currentTrack.file);
        this.audio.volume = this.volume;

        // Restaurar tiempo guardado
        const savedTime = localStorage.getItem("vibes_current_time");
        if (savedTime) {
            this.audio.currentTime = parseFloat(savedTime);
        }

        // Configurar eventos
        this.audio.addEventListener("ended", () => {
            if (this.isRepeat) {
                this.audio.currentTime = 0;
                this.play();
            } else {
                this.nextTrack();
            }
        });

        this.audio.addEventListener("timeupdate", () => {
            // Guardar tiempo periódicamente
            localStorage.setItem("vibes_current_time", this.audio.currentTime);
            this.updateUIProgress();
        });

        // Intentar reproducción automática si estaba reproduciendo
        if (this.isPlaying) {
            this.play();
        }
    }

    play() {
        if (!this.audio) return;
        
        this.isPlaying = true;
        localStorage.setItem("vibes_is_playing", "true");
        
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.updateUIControls();
            }).catch(error => {
                console.log("Autoplay bloqueado temporalmente por política del navegador. Esperando interacción.");
                this.isPlaying = false;
                localStorage.setItem("vibes_is_playing", "false");
                this.updateUIControls();
            });
        }
    }

    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
        localStorage.setItem("vibes_is_playing", "false");
        this.updateUIControls();
    }

    togglePlay() {
        if (!this.currentTrack && this.queue.length > 0) {
            this.loadTrack(this.queue[this.queueIndex]);
            this.play();
            return;
        }
        if (!this.audio) return;

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    loadTrack(track) {
        if (this.audio) {
            this.audio.pause();
        }
        
        this.currentTrack = track;
        localStorage.setItem("vibes_current_time", "0");
        
        this.audio = new Audio(track.file);
        this.audio.volume = this.volume;
        
        // Agregar eventos
        this.audio.addEventListener("ended", () => {
            if (this.isRepeat) {
                this.audio.currentTime = 0;
                this.play();
            } else {
                this.nextTrack();
            }
        });

        this.audio.addEventListener("timeupdate", () => {
            localStorage.setItem("vibes_current_time", this.audio.currentTime);
            this.updateUIProgress();
        });

        this.saveState();
        this.updateUISongInfo();
    }

    playTrack(track, newQueue = []) {
        if (newQueue.length > 0) {
            this.queue = newQueue;
            this.queueIndex = this.queue.findIndex(t => t.title.toLowerCase() === track.title.toLowerCase());
            if (this.queueIndex === -1) {
                this.queueIndex = 0;
                this.queue.unshift(track);
            }
        } else {
            // Si no se provee cola, crear una con solo esta canción
            this.queue = [track];
            this.queueIndex = 0;
        }

        this.loadTrack(track);
        this.play();
    }

    nextTrack() {
        if (this.queue.length === 0) return;

        if (this.isShuffle) {
            this.queueIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.queueIndex = (this.queueIndex + 1) % this.queue.length;
        }

        this.loadTrack(this.queue[this.queueIndex]);
        this.play();
    }

    prevTrack() {
        if (this.queue.length === 0) return;

        this.queueIndex = (this.queueIndex - 1 + this.queue.length) % this.queue.length;
        this.loadTrack(this.queue[this.queueIndex]);
        this.play();
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        localStorage.setItem("vibes_volume", this.volume);
        this.updateUIVolume();
    }

    seek(seconds) {
        if (!this.audio) return;
        this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, seconds));
        this.updateUIProgress();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        localStorage.setItem("vibes_shuffle", this.isShuffle);
        this.updateUIControls();
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        localStorage.setItem("vibes_repeat", this.isRepeat);
        this.updateUIControls();
    }

    // === MÉTODOS DE ACTUALIZACIÓN DE INTERFAZ GRÁFICA (UI) ===
    
    updateUISongInfo() {
        if (!this.currentTrack) return;
        
        // 1. Barra inferior (Home, Search, Library, Playlist)
        const bottomSongInfo = document.querySelector(".song-info");
        if (bottomSongInfo) {
            const img = bottomSongInfo.querySelector("img");
            const title = bottomSongInfo.querySelector("h4");
            const artist = bottomSongInfo.querySelector("p");
            if (img) img.src = this.currentTrack.cover;
            if (title) title.textContent = this.currentTrack.title;
            if (artist) artist.textContent = this.currentTrack.artist;
        }

        // 2. Pantalla completa (Player)
        const albumPanel = document.querySelector(".album-panel");
        if (albumPanel) {
            const cover = albumPanel.querySelector(".album-cover");
            const title = albumPanel.querySelector(".album-info h1");
            const artist = albumPanel.querySelector(".album-info h3");
            if (cover) cover.src = this.currentTrack.cover;
            if (title) title.textContent = this.currentTrack.title;
            if (artist) artist.textContent = this.currentTrack.artist;
        }

        // Desencadenar eventos para controladores específicos de páginas
        window.dispatchEvent(new CustomEvent("vibes_song_changed", { detail: this.currentTrack }));
    }

    updateUIControls() {
        // Actualizar estados visuales de play/pause, shuffle y repeat
        const playBtns = document.querySelectorAll(".play-btn i");
        playBtns.forEach(btn => {
            if (this.isPlaying) {
                btn.className = "fa-solid fa-pause";
            } else {
                btn.className = "fa-solid fa-play";
            }
        });

        const shuffleBtns = document.querySelectorAll(".fa-shuffle");
        shuffleBtns.forEach(btn => {
            if (this.isShuffle) {
                btn.classList.add("active-control");
                btn.style.color = "#39FF14";
            } else {
                btn.classList.remove("active-control");
                btn.style.color = "";
            }
        });

        const repeatBtns = document.querySelectorAll(".fa-repeat");
        repeatBtns.forEach(btn => {
            if (this.isRepeat) {
                btn.classList.add("active-control");
                btn.style.color = "#39FF14";
            } else {
                btn.classList.remove("active-control");
                btn.style.color = "";
            }
        });
    }

    updateUIProgress() {
        if (!this.audio) return;
        
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        
        // Formatear tiempos
        const formatTime = (secs) => {
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        // 1. Barra inferior
        const songTimeSec = document.querySelector(".song-time");
        if (songTimeSec) {
            const spans = songTimeSec.querySelectorAll("span");
            if (spans.length >= 2) {
                spans[0].textContent = formatTime(currentTime);
                spans[1].textContent = duration > 0 ? formatTime(duration) : "0:00";
            }
            const prog = songTimeSec.querySelector(".progress");
            if (prog && duration > 0) {
                prog.style.width = `${(currentTime / duration) * 100}%`;
            }
        }

        // 2. Pantalla de Player
        const playerProgressSec = document.querySelector(".player-progress");
        if (playerProgressSec) {
            const spans = playerProgressSec.querySelectorAll("span");
            if (spans.length >= 2) {
                spans[0].textContent = formatTime(currentTime);
                spans[1].textContent = duration > 0 ? formatTime(duration) : "0:00";
            }
            const prog = playerProgressSec.querySelector(".progress");
            if (prog && duration > 0) {
                prog.style.width = `${(currentTime / duration) * 100}%`;
            }
        }
    }

    updateUIVolume() {
        const volumeBars = document.querySelectorAll(".volume-progress");
        volumeBars.forEach(bar => {
            bar.style.width = `${this.volume * 100}%`;
        });
        
        const volumeIcons = document.querySelectorAll(".volume-section i, .song-time i.fa-volume-high, .song-time i.fa-volume-xmark");
        volumeIcons.forEach(icon => {
            if (this.volume === 0) {
                icon.className = "fa-solid fa-volume-xmark";
            } else if (this.volume < 0.5) {
                icon.className = "fa-solid fa-volume-low";
            } else {
                icon.className = "fa-solid fa-volume-high";
            }
        });
    }

    setupIntervals() {
        // Enlazar los botones en la interfaz después de cargar el DOM
        const bindElements = () => {
            this.updateUISongInfo();
            this.updateUIControls();
            this.updateUIVolume();

            // Vincular botones de play/pause
            document.querySelectorAll(".play-btn").forEach(btn => {
                // Limpiar event listeners previos clonando el nodo para evitar duplicados
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.togglePlay();
                });
            });

            // Vincular botones de siguiente
            document.querySelectorAll(".fa-forward").forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.nextTrack();
                });
            });

            // Vincular botones de anterior
            document.querySelectorAll(".fa-backward").forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.prevTrack();
                });
            });

            // Vincular botones de shuffle
            document.querySelectorAll(".fa-shuffle").forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.toggleShuffle();
                });
            });

            // Vincular botones de repeat
            document.querySelectorAll(".fa-repeat").forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.toggleRepeat();
                });
            });

            // Vincular barras de volumen para hacerlas interactivas
            document.querySelectorAll(".volume-bar").forEach(bar => {
                const newBar = bar.cloneNode(true);
                bar.parentNode.replaceChild(newBar, bar);
                newBar.addEventListener("click", (e) => {
                    const rect = newBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const vol = clickX / width;
                    this.setVolume(vol);
                });
            });

            // Vincular barras de progreso para hacerlas interactivas (Seek)
            document.querySelectorAll(".progress-bar").forEach(bar => {
                const newBar = bar.cloneNode(true);
                bar.parentNode.replaceChild(newBar, bar);
                newBar.addEventListener("click", (e) => {
                    if (!this.audio || !this.audio.duration) return;
                    const rect = newBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const pct = clickX / width;
                    this.seek(pct * this.audio.duration);
                });
            });

            // Vincular enlaces superiores (Descubrir, Novedades, En Vivo)
            document.querySelectorAll(".top-links a").forEach(link => {
                const text = link.textContent.trim().toLowerCase();
                if (text === "descubrir") {
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    newLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        showDiscoverModal();
                    });
                } else if (text === "novedades") {
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    newLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        showVibesNotification("¡VIBES Novedades! Se han agregado nuevas canciones de Guns N' Roses, Queen y Shakira a tu algoritmo.", "NOVEDADES");
                    });
                } else if (text === "en vivo" || text === "vivo") {
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    newLink.addEventListener("click", (e) => {
                        e.preventDefault();
                        showVibesNotification("¡Señal En Vivo! Conectando con los nodos acústicos en tiempo real... No hay transmisiones activas en tu zona neuronal.", "EN VIVO");
                    });
                }
            });

            // Vincular botón Premium
            document.querySelectorAll(".upgrade-btn, .top-right button").forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const isPremium = localStorage.getItem("vibes_is_premium") === "true";
                    if (isPremium) {
                        showVibesNotification("¡Ya eres miembro VIBES VIP! Tienes acceso ilimitado a todo el catálogo de alta fidelidad.", "ESTADO VIP");
                    } else {
                        showPremiumModal();
                    }
                });
            });

            // Vincular botones de Ajustes (Settings) globales en barra lateral
            document.querySelectorAll("#settings-btn, .fa-gear").forEach(btn => {
                const target = btn.tagName.toLowerCase() === "i" ? btn.closest("a") : btn;
                if (!target) return;
                const newTarget = target.cloneNode(true);
                target.parentNode.replaceChild(newTarget, target);
                newTarget.addEventListener("click", (e) => {
                    e.preventDefault();
                    showSettingsModal();
                });
            });

            // Vincular ícono de usuario para Cerrar Sesión
            document.querySelectorAll(".fa-circle-user").forEach(icon => {
                const newIcon = icon.cloneNode(true);
                icon.parentNode.replaceChild(newIcon, icon);
                newIcon.style.cursor = "pointer";
                newIcon.addEventListener("click", (e) => {
                    e.preventDefault();
                    const activeUser = localStorage.getItem("vibes_user") || "";
                    if (confirm(`¿Deseas cerrar la sesión activa de "${activeUser}"?`)) {
                        localStorage.removeItem("vibes_user");
                        showVibesNotification("Sesión cerrada con éxito.", "SESIÓN CERRADA");
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 800);
                    }
                });
            });

            // Actualizar visuales premium al iniciar
            updatePremiumVisuals();
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", bindElements);
        } else {
            bindElements();
        }
    }
}

// === FUNCIONES AUXILIARES GLOBALES DE NOTIFICACIONES Y MODAL PREMIUM ===

function showVibesNotification(message, title = "NOTIFICACIÓN") {
    let container = document.getElementById("vibes-notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "vibes-notification-container";
        container.style = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; font-family: 'Inter', sans-serif;";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.style = "background: rgba(13, 13, 13, 0.95); border: 1px solid #39FF14; border-radius: 12px; padding: 16px 20px; width: 320px; box-shadow: 0 0 20px rgba(57, 255, 20, 0.25); pointer-events: auto; transform: translateX(350px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0;";
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <i class="fa-solid fa-bolt" style="color: #39FF14; font-size: 16px;"></i>
            <h4 style="margin: 0; color: #39FF14; text-transform: uppercase; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">${title}</h4>
        </div>
        <p style="margin: 0; color: #e0e0e0; font-size: 12px; line-height: 1.4;">${message}</p>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
    }, 50);
    
    setTimeout(() => {
        toast.style.transform = "translateX(350px)";
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4500);
}

function showPremiumModal() {
    let modal = document.getElementById("premium-vip-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "premium-vip-modal";
        modal.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 10000; display: flex; justify-content: center; align-items: center; font-family: 'Inter', sans-serif;";
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0d0d0d 0%, #151515 100%); border: 2px solid #39FF14; border-radius: 24px; padding: 40px; width: 460px; text-align: center; box-shadow: 0 0 40px rgba(57, 255, 20, 0.35); position: relative; animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            <div style="width: 70px; height: 70px; background: rgba(57, 255, 20, 0.1); border: 2px solid #39FF14; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px auto; box-shadow: 0 0 20px rgba(57,255,20,0.2);">
                <i class="fa-solid fa-crown" style="color: #39FF14; font-size: 32px; animation: crownPulse 2s infinite alternate;"></i>
            </div>
            
            <h2 style="color: white; font-size: 24px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px;">VIBES <span style="color: #39FF14;">VIP PREMIUM</span></h2>
            <p style="color: #888; font-size: 11px; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 0.5px;">Desbloquea el máximo potencial auditivo</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid #222; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-check" style="color: #39FF14; font-size: 15px;"></i>
                    <span style="color: #e0e0e0; font-size: 13px;">Sonido de Alta Fidelidad sin pérdidas (Lossless)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-check" style="color: #39FF14; font-size: 15px;"></i>
                    <span style="color: #e0e0e0; font-size: 13px;">Mapeo de Neuronas y Topologías ilimitado</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-check" style="color: #39FF14; font-size: 15px;"></i>
                    <span style="color: #e0e0e0; font-size: 13px;">Sin anuncios ni interrupciones comerciales</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-circle-check" style="color: #39FF14; font-size: 15px;"></i>
                    <span style="color: #e0e0e0; font-size: 13px;">Acceso exclusivo a Nodos y Algoritmos VIP</span>
                </div>
            </div>
            
            <button id="activate-vip-btn" style="width: 100%; background: #39FF14; border: none; color: black; font-size: 14px; font-weight: bold; padding: 16px 20px; border-radius: 12px; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 20px rgba(57,255,20,0.3); transition: 0.3s; font-family: inherit;">
                Activar Suscripción Completa
            </button>
            
            <button id="close-vip-btn" style="margin-top: 15px; background: transparent; border: none; color: #888; font-size: 13px; text-decoration: underline; cursor: pointer; font-family: inherit;">
                Tal vez más tarde
            </button>
        </div>
        
        <style>
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes crownPulse {
                from { transform: scale(1); filter: drop-shadow(0 0 2px #39FF14); }
                to { transform: scale(1.1); filter: drop-shadow(0 0 10px #39FF14); }
            }
        </style>
    `;
    
    modal.style.display = "flex";
    
    const activateBtn = modal.querySelector("#activate-vip-btn");
    const closeBtn = modal.querySelector("#close-vip-btn");
    
    activateBtn.addEventListener("click", () => {
        localStorage.setItem("vibes_is_premium", "true");
        showVibesNotification("¡Felicidades! Tu cuenta ha sido elevada al rango PREMIUM VIP. Disfruta de la máxima fidelidad acústica.", "VIP ACTIVADO");
        modal.style.display = "none";
        updatePremiumVisuals();
    });
    
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

function updatePremiumVisuals() {
    const isPremium = localStorage.getItem("vibes_is_premium") === "true";
    document.querySelectorAll(".upgrade-btn, .top-right button").forEach(btn => {
        const text = btn.textContent.trim().toLowerCase();
        if (text === "premium" || btn.querySelector(".fa-crown") || btn.classList.contains("upgrade-btn")) {
            if (isPremium) {
                btn.innerHTML = `<i class="fa-solid fa-crown" style="margin-right: 6px;"></i> VIP PREMIUM`;
                btn.style.background = "linear-gradient(90deg, #FFD700, #39FF14)";
                btn.style.color = "black";
                btn.style.border = "1px solid #FFD700";
                btn.style.boxShadow = "0 0 15px rgba(255, 215, 0, 0.4)";
                btn.title = "¡Ya eres Premium VIP!";
            } else {
                btn.innerHTML = `Premium`;
                btn.style.background = "#39FF14";
                btn.style.color = "black";
                btn.style.border = "none";
                btn.style.boxShadow = "none";
                btn.title = "";
            }
        }
    });
}

function showSettingsModal() {
    let modal = document.getElementById("settings-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "settings-modal";
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; justify-content:center; align-items:center; font-family:inherit;";
        document.body.appendChild(modal);
    }
    
    const savedMode = localStorage.getItem("vibes_db_mode") || "local";
    const uri = localStorage.getItem("vibes_neo4j_uri") || "neo4j+s://d544acc5.databases.neo4j.io";
    const user = localStorage.getItem("vibes_neo4j_user") || "d544acc5";
    const pass = localStorage.getItem("vibes_neo4j_pass") || "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k";
    const activeUsername = localStorage.getItem("vibes_user") || "";

    modal.innerHTML = `
        <div style="background: #0d0d0d; border: 1px solid #39FF14; border-radius: 20px; padding: 30px; width: 450px; box-shadow: 0 0 30px rgba(57,255,20,0.25); font-family: 'Inter', sans-serif;">
            <h3 style="color: #39FF14; font-size: 20px; margin-bottom: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Configuración de Sistema</h3>
            
            <p style="color: #9a9a9a; font-size: 13px; margin-bottom: 8px;">Modo de Conexión</p>
            <select id="db-mode-select" style="width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: white; padding: 12px; margin-bottom: 20px; outline: none; font-size: 14px; font-family: inherit;">
                <option value="local" ${savedMode === "local" ? "selected" : ""}>Almacenamiento Local (100% Offline / Para subir a Git)</option>
                <option value="neo4j" ${savedMode === "neo4j" ? "selected" : ""}>Neo4j (Conexión Híbrida / Requiere Servidor)</option>
            </select>

            <div id="neo4j-creds-container" style="display: ${savedMode === "neo4j" ? "block" : "none"}; margin-bottom: 20px;">
                <p style="color: #9a9a9a; font-size: 13px; margin-bottom: 8px;">URI del Servidor Neo4j</p>
                <input type="text" id="neo4j-uri" value="${uri}" style="width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: white; padding: 12px; margin-bottom: 12px; outline: none; font-size: 13px; font-family: inherit;">
                
                <p style="color: #9a9a9a; font-size: 13px; margin-bottom: 8px;">Usuario</p>
                <input type="text" id="neo4j-user" value="${user}" style="width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: white; padding: 12px; margin-bottom: 12px; outline: none; font-size: 13px; font-family: inherit;">
                
                <p style="color: #9a9a9a; font-size: 13px; margin-bottom: 8px;">Contraseña de Seguridad</p>
                <input type="password" id="neo4j-pass" value="${pass}" style="width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: white; padding: 12px; outline: none; font-size: 13px; font-family: inherit;">
            </div>

            <!-- CUENTA ACTIVA Y ACCIONES DE CUENTA -->
            <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; border: 1px solid #222; margin-bottom: 25px;">
                <p style="color: #666; font-size: 11px; text-transform: uppercase; margin: 0 0 6px 0; font-weight: bold;">Cuenta Activa</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: white; font-weight: bold; font-size: 15px;"><i class="fa-solid fa-circle-user" style="color: #39FF14; margin-right: 6px;"></i> ${activeUsername || "Ninguno"}</span>
                    <button id="settings-delete-account-btn" style="background: transparent; border: 1px solid #ff3333; color: #ff3333; font-size: 11px; font-weight: bold; padding: 6px 12px; border-radius: 6px; cursor: pointer; text-transform: uppercase; transition: 0.3s; font-family: inherit;">Eliminar Cuenta</button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <button id="reset-app-btn" style="background: transparent; border: 1px solid #888; color: #aaa; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; text-transform: uppercase; font-family: inherit;">Reiniciar Datos</button>
                <div style="display: flex; gap: 12px;">
                    <button id="close-settings-btn" style="background: transparent; border: 1px solid #555; color: white; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-family: inherit;">Cerrar</button>
                    <button id="save-settings-btn" style="background: #39FF14; border: none; color: black; font-weight: bold; padding: 10px 22px; border-radius: 8px; cursor: pointer; box-shadow: 0 0 15px rgba(57,255,20,0.3); font-family: inherit;">Aplicar</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = "flex";

    const dbModeSelect = modal.querySelector("#db-mode-select");
    const neo4jCreds = modal.querySelector("#neo4j-creds-container");
    const closeBtn = modal.querySelector("#close-settings-btn");
    const saveBtn = modal.querySelector("#save-settings-btn");
    const resetBtn = modal.querySelector("#reset-app-btn");
    const deleteAccBtn = modal.querySelector("#settings-delete-account-btn");

    dbModeSelect.addEventListener("change", () => {
        neo4jCreds.style.display = dbModeSelect.value === "neo4j" ? "block" : "none";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    saveBtn.addEventListener("click", () => {
        localStorage.setItem("vibes_db_mode", dbModeSelect.value);
        if (dbModeSelect.value === "neo4j") {
            localStorage.setItem("vibes_neo4j_uri", modal.querySelector("#neo4j-uri").value.trim());
            localStorage.setItem("vibes_neo4j_user", modal.querySelector("#neo4j-user").value.trim());
            localStorage.setItem("vibes_neo4j_pass", modal.querySelector("#neo4j-pass").value.trim());
        }
        modal.style.display = "none";
        window.location.reload();
    });

    resetBtn.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas reiniciar todos los datos locales y cerrar sesión?")) {
            localStorage.clear();
            showVibesNotification("Datos locales eliminados con éxito.", "REINICIO DE SISTEMA");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);
        }
    });

    deleteAccBtn.addEventListener("click", async () => {
        if (!activeUsername) {
            alert("No hay ninguna sesión de cuenta activa para eliminar.");
            return;
        }
        if (confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente la cuenta "${activeUsername}"? Esta acción borrará todas tus playlists y configuraciones de forma irreversible.`)) {
            const dbMode = localStorage.getItem("vibes_db_mode") || "local";
            
            if (dbMode === "local" || window.location.protocol === "file:") {
                // Eliminar localmente
                let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
                delete localUsers[activeUsername];
                localStorage.setItem("vibes_users", JSON.stringify(localUsers));
                
                // Limpiar llaves del usuario
                localStorage.removeItem("vibes_user");
                localStorage.removeItem(`vibes_prefs_${activeUsername}`);
                localStorage.removeItem(`vibes_playlists_${activeUsername}`);
                
                showVibesNotification(`La cuenta "${activeUsername}" ha sido eliminada.`, "CUENTA ELIMINADA");
                modal.style.display = "none";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
                return;
            }

            // Eliminar en el servidor
            try {
                const response = await fetch("/api/auth/delete_account", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: activeUsername })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    localStorage.removeItem("vibes_user");
                    localStorage.removeItem(`vibes_prefs_${activeUsername}`);
                    localStorage.removeItem(`vibes_playlists_${activeUsername}`);
                    
                    showVibesNotification(`La cuenta "${activeUsername}" ha sido eliminada del servidor.`, "CUENTA ELIMINADA");
                    modal.style.display = "none";
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 800);
                } else {
                    alert(data.message || "Error al eliminar la cuenta.");
                }
            } catch (err) {
                console.error("Error deleting account from server, trying locally:", err);
                // Fallback local
                let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
                delete localUsers[activeUsername];
                localStorage.setItem("vibes_users", JSON.stringify(localUsers));
                localStorage.removeItem("vibes_user");
                localStorage.removeItem(`vibes_prefs_${activeUsername}`);
                localStorage.removeItem(`vibes_playlists_${activeUsername}`);
                
                showVibesNotification(`La cuenta "${activeUsername}" ha sido eliminada localmente.`, "CUENTA ELIMINADA");
                modal.style.display = "none";
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            }
        }
    });
}

function showDiscoverModal() {
    let modal = document.getElementById("discover-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "discover-modal";
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:10000; display:flex; justify-content:center; align-items:center; font-family: 'Outfit', 'Inter', sans-serif; backdrop-filter: blur(15px); transition: all 0.3s ease;";
        document.body.appendChild(modal);
    }

    const catalog = window.VIBES_CATALOG || { genres: [], artists: [], moods: [], songs: [] };
    
    const genres = ["Todos", ...catalog.genres];
    const artists = ["Todos", ...catalog.artists.map(a => a.name)];
    const moods = ["Todos", ...catalog.moods.map(m => m.name)];

    modal.innerHTML = `
        <div style="background: #060606; border: 1px solid #39FF14; border-radius: 24px; padding: 35px; width: 850px; max-width: 90vw; height: 85vh; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(57,255,20,0.25); animation: discoverFadeIn 0.4s ease; font-family: 'Inter', sans-serif; color: white;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(57,255,20,0.15); padding-bottom: 15px;">
                <div>
                    <h2 style="margin: 0; color: #39FF14; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; text-shadow: 0 0 10px rgba(57,255,20,0.3);">
                        <i class="fa-solid fa-compass" style="margin-right: 8px;"></i> Descubrir Música
                    </h2>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Explora la resonancia completa de nuestro catálogo acústico neuronal
                    </p>
                </div>
                <button id="close-discover-btn" style="background: transparent; border: 1px solid #ff007f; color: #ff007f; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: 0.3s; font-size: 16px; box-shadow: 0 0 10px rgba(255,0,127,0.15);">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Filters Area -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid #111;">
                <div>
                    <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Filtrar por Género</label>
                    <select id="discover-filter-genre" style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: white; padding: 10px; border-radius: 8px; font-family: inherit; font-size: 13px; cursor: pointer; outline: none; transition: 0.3s;">
                        ${genres.map(g => `<option value="${g}">${g}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Filtrar por Artista</label>
                    <select id="discover-filter-artist" style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: white; padding: 10px; border-radius: 8px; font-family: inherit; font-size: 13px; cursor: pointer; outline: none; transition: 0.3s;">
                        ${artists.map(a => `<option value="${a}">${a}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Filtrar por Mood</label>
                    <select id="discover-filter-mood" style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: white; padding: 10px; border-radius: 8px; font-family: inherit; font-size: 13px; cursor: pointer; outline: none; transition: 0.3s;">
                        ${moods.map(m => `<option value="${m}">${m}</option>`).join("")}
                    </select>
                </div>
                <div>
                    <label style="color: #888; font-size: 11px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Búsqueda Rápida</label>
                    <div style="position: relative;">
                        <input id="discover-filter-search" type="text" placeholder="Buscar título o letra..." style="width: 100%; background: #0a0a0a; border: 1px solid #333; color: white; padding: 10px 10px 10px 30px; border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; transition: 0.3s;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 13px; color: #555; font-size: 12px;"></i>
                    </div>
                </div>
            </div>

            <!-- Songs Grid Area -->
            <div id="discover-songs-scroll" style="flex: 1; overflow-y: auto; padding-right: 5px; margin-bottom: 10px;">
                <div id="discover-songs-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
                    <!-- Renders dynamically -->
                </div>
            </div>
            
            <div style="text-align: right; font-size: 11px; color: #444; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 10px;">
                VIBES Neuronal Explorer • ${catalog.songs.length} pistas cargadas
            </div>
        </div>
    `;

    // Inject CSS animation dynamically if not present
    if (!document.getElementById("discover-animations")) {
        const style = document.createElement("style");
        style.id = "discover-animations";
        style.innerHTML = `
            @keyframes discoverFadeIn {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
            }
            .discover-card {
                background: #0f0f0f;
                border: 1px solid #1a1a1a;
                border-radius: 16px;
                padding: 15px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
            }
            .discover-card:hover {
                border-color: #39FF14;
                box-shadow: 0 8px 25px rgba(57,255,20,0.12);
                transform: translateY(-4px);
            }
            .discover-card-img-container {
                position: relative;
                width: 100%;
                padding-top: 100%; /* Aspect Ratio 1:1 */
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 12px;
            }
            .discover-card-img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            .discover-card:hover .discover-card-img {
                transform: scale(1.08);
            }
            .discover-card-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: 0.3s;
                backdrop-filter: blur(2px);
            }
            .discover-card:hover .discover-card-overlay {
                opacity: 1;
            }
            .discover-play-btn {
                background: #39FF14;
                border: none;
                color: black;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                font-size: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                box-shadow: 0 0 15px #39FF14;
                transform: scale(0.8);
                transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .discover-card:hover .discover-play-btn {
                transform: scale(1);
            }
            .discover-play-btn:hover {
                background: #ff007f;
                color: white;
                box-shadow: 0 0 20px #ff007f;
            }
            #discover-songs-scroll::-webkit-scrollbar {
                width: 6px;
            }
            #discover-songs-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.01);
            }
            #discover-songs-scroll::-webkit-scrollbar-thumb {
                background: #222;
                border-radius: 3px;
            }
            #discover-songs-scroll::-webkit-scrollbar-thumb:hover {
                background: #39FF14;
            }
        `;
        document.head.appendChild(style);
    }

    const genreSelect = modal.querySelector("#discover-filter-genre");
    const artistSelect = modal.querySelector("#discover-filter-artist");
    const moodSelect = modal.querySelector("#discover-filter-mood");
    const searchInput = modal.querySelector("#discover-filter-search");
    const songsGrid = modal.querySelector("#discover-songs-grid");
    const closeBtn = modal.querySelector("#close-discover-btn");

    function renderFilteredSongs() {
        const selGenre = genreSelect.value;
        const selArtist = artistSelect.value;
        const selMood = moodSelect.value;
        const searchVal = searchInput.value.toLowerCase().trim();

        // Filter catalog
        const filtered = catalog.songs.filter(song => {
            if (selGenre !== "Todos" && song.genre.toLowerCase() !== selGenre.toLowerCase()) return false;
            if (selArtist !== "Todos" && song.artist.toLowerCase() !== selArtist.toLowerCase()) return false;
            if (selMood !== "Todos" && song.mood.toLowerCase() !== selMood.toLowerCase()) return false;
            
            if (searchVal) {
                const titleMatch = song.title.toLowerCase().includes(searchVal);
                const artistMatch = song.artist.toLowerCase().includes(searchVal);
                const lyricMatch = song.lyrics && song.lyrics.some(line => line.toLowerCase().includes(searchVal));
                if (!titleMatch && !artistMatch && !lyricMatch) return false;
            }
            return true;
        });

        songsGrid.innerHTML = "";
        if (filtered.length === 0) {
            songsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #444;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; color: #ff007f; margin-bottom: 15px;"></i>
                    <p style="font-size: 15px; font-weight: bold; color: white;">Sin frecuencias compatibles</p>
                    <p style="font-size: 12px; margin-top: 5px;">Ninguna canción coincide con los filtros aplicados actualmente.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(song => {
            const card = document.createElement("div");
            card.className = "discover-card";

            card.innerHTML = `
                <div class="discover-card-img-container">
                    <img src="${song.cover}" alt="${song.title}" class="discover-card-img">
                    <div class="discover-card-overlay">
                        <button class="discover-play-btn" title="Reproducir pista neuronal">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    </div>
                </div>
                <h4 style="margin: 0 0 4px 0; color: white; font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</h4>
                <p style="margin: 0 0 8px 0; color: #888; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist}</p>
                <div style="margin-top: auto; display: flex; gap: 6px; flex-wrap: wrap;">
                    <span style="font-size: 10px; background: rgba(57,255,20,0.08); border: 1px solid rgba(57,255,20,0.2); color: #39FF14; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${song.genre}</span>
                    <span style="font-size: 10px; background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.2); color: #00F0FF; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${song.mood}</span>
                </div>
            `;

            // Bind playback on play overlay click
            card.querySelector(".discover-play-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                if (window.vibesPlayer) {
                    window.vibesPlayer.playTrack(song, filtered);
                    modal.style.display = "none";
                }
            });

            songsGrid.appendChild(card);
        });
    }

    // Add Change Listeners to Filters
    genreSelect.addEventListener("change", renderFilteredSongs);
    artistSelect.addEventListener("change", renderFilteredSongs);
    moodSelect.addEventListener("change", renderFilteredSongs);
    searchInput.addEventListener("input", renderFilteredSongs);

    // Close button
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close on clicking backdrop
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Render initially
    modal.style.display = "flex";
    renderFilteredSongs();
}

window.showDiscoverModal = showDiscoverModal;

// Inicializar el controlador global
const vibesPlayer = new PlayerController();
window.vibesPlayer = vibesPlayer;
