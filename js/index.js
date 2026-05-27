/* =============================================================================
   index.js - Script principal de la página de bienvenida (index.html)
   =============================================================================
   PROPÓSITO: Configura la animación de partículas del fondo y limpia la sesión
   del usuario cuando vuelve a la pantalla de bienvenida.
   FUNCIONA: Utiliza la librería particles.js para generar puntos flotantes
   interconectados con estética cyberpunk (verde neón sobre fondo oscuro).
   ============================================================================= */

// Llama a la función particlesJS() de la librería particles.js para inicializar la animación
// Primer argumento: "particles-js" es el ID del contenedor <div> donde se renderizarán las partículas
// Segundo argumento: objeto de configuración con todas las propiedades visuales y de comportamiento
particlesJS("particles-js", {
  // Bloque "particles": define las propiedades visuales de cada partícula individual
  particles: {
    // "number": controla cuántas partículas se generan en el canvas
    number: {
      value: 80 // Se crean 80 partículas flotantes en pantalla
    },
    // "color": define el color de cada partícula
    color: {
      value: "#39FF14" // Verde neón (#39FF14) - color principal de la estética cyberpunk de VIBES
    },
    // "shape": define la forma geométrica de cada partícula
    shape: {
      type: "circle" // Forma circular - cada partícula es un pequeño punto redondo
    },
    // "opacity": controla la transparencia de las partículas
    opacity: {
      value: 0.5 // 50% de opacidad - semitransparentes para dar un efecto sutil de profundidad
    },
    // "size": controla el tamaño de cada partícula en píxeles
    size: {
      value: 3 // 3 píxeles de radio - partículas pequeñas y delicadas
    },
    // "line_linked": controla las líneas que conectan partículas cercanas entre sí
    line_linked: {
      enable: true,     // Activa las líneas de conexión entre partículas
      distance: 150,    // Distancia máxima en píxeles para que dos partículas se conecten con una línea
      color: "#39FF14", // Color de las líneas de conexión: mismo verde neón que las partículas
      opacity: 0.3,     // 30% de opacidad para las líneas - más sutiles que las partículas mismas
      width: 1          // Grosor de las líneas de conexión: 1 píxel (delgadas y elegantes)
    },
    // "move": controla el movimiento de las partículas
    move: {
      enable: true, // Activa el movimiento - las partículas flotan por la pantalla
      speed: 2      // Velocidad de movimiento: 2 (lento y suave, da un efecto ambiental calmado)
    }
  }
}); // Fin de la configuración de particles.js

// ---- LIMPIEZA DE SESIÓN ----
// Cuando el usuario vuelve a la página de bienvenida (index.html), se elimina su sesión activa
// "vibes_user" es la clave en localStorage que almacena el nombre del usuario conectado
// Al eliminarlo, se cierra la sesión y el usuario debe iniciar sesión de nuevo
// Esto previene que alguien acceda al contenido sin autenticarse
localStorage.removeItem("vibes_user");