/* =============================================================================
   newacc.js - Lógica de Creación de Cuentas Nuevas
   =============================================================================
   PROPÓSITO: Maneja el proceso de registro de nuevos usuarios en VIBES.
   FUNCIONA: Cuando el usuario llena los campos y pulsa "Registrar >>":
     1. Valida que ambos campos estén llenos
     2. Verifica si ya existe un usuario con ese nombre
     3. Guarda las credenciales en localStorage (modo local) o en el servidor Flask (modo servidor)
     4. Redirige al usuario a la página de selección de géneros (genres.html)
   MODOS: Soporta dos modos de almacenamiento:
     - "local": Usa localStorage del navegador (funciona sin servidor)
     - "server": Usa la API Flask (/api/auth/register)
   ============================================================================= */

// Espera a que todo el DOM (estructura HTML) se haya cargado completamente antes de ejecutar el código
// "DOMContentLoaded" se dispara cuando el HTML ha sido completamente parseado, sin esperar imágenes o estilos
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene una referencia al campo de texto del nombre de usuario (id="username" en el HTML)
    const usernameInput = document.getElementById("username");
    // Obtiene una referencia al campo de contraseña (id="password" en el HTML)
    const passwordInput = document.getElementById("password");
    // Obtiene una referencia al botón de registro (id="register-btn" en el HTML)
    const registerBtn = document.getElementById("register-btn");
    // Obtiene una referencia al div que muestra mensajes de error (id="error-message" en el HTML)
    const errorMessage = document.getElementById("error-message");

    // Agrega un listener (escuchador) al botón de registro que se ejecuta al hacer clic
    // La función es async porque puede necesitar hacer una petición al servidor (fetch es asíncrono)
    registerBtn.addEventListener("click", async () => {
        // Lee el valor del campo de usuario y elimina espacios en blanco al inicio y final con .trim()
        const username = usernameInput.value.trim();
        // Lee el valor del campo de contraseña y elimina espacios en blanco
        const password = passwordInput.value.trim();

        // VALIDACIÓN: Verifica que ambos campos tengan contenido
        // Si alguno está vacío (cadena vacía = falsy en JavaScript), muestra error
        if (!username || !password) {
            showError("Por favor ingresa un nombre de usuario y contraseña"); // Muestra mensaje de error
            return; // Detiene la ejecución, no continúa con el registro
        }

        // Determina el modo de base de datos: lee de localStorage si existe, si no, usa "local" por defecto
        // "vibes_db_mode" puede ser "local" (localStorage) o "server" (API Flask + Neo4j)
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL: Se usa cuando el modo es "local" O cuando la página se abre directamente desde un archivo
        // window.location.protocol === "file:" detecta si se abrió con doble clic (sin servidor web)
        if (dbMode === "local" || window.location.protocol === "file:") {
            // Lee los usuarios almacenados en localStorage; si no existen, usa un objeto vacío "{}"
            // JSON.parse convierte la cadena JSON almacenada de vuelta a un objeto JavaScript
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");

            // Verifica si el nombre de usuario ya existe en el objeto de usuarios
            // localUsers[username] será undefined si no existe, o la contraseña si ya se registró
            if (localUsers[username]) {
                showError("El usuario ya existe"); // Muestra error indicando que el nombre está ocupado
                return; // Detiene la ejecución
            }

            // Guarda el nuevo usuario: la clave es el nombre de usuario, el valor es la contraseña
            localUsers[username] = password;
            // Serializa el objeto actualizado a JSON y lo guarda en localStorage
            localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            // Guarda el nombre del usuario activo en localStorage para mantener la sesión
            // Otras páginas (home, search, etc.) leen "vibes_user" para saber quién está conectado
            localStorage.setItem("vibes_user", username);
            // Redirige al usuario a la página de selección de géneros musicales
            // genres.html es el siguiente paso del proceso de registro: elegir gustos musicales
            window.location.href = "genres.html";
            return; // Detiene la ejecución (la redirección ya se encarga del resto)
        }

        // MODO SERVIDOR: Si el modo no es "local" y no se abrió desde archivo, intenta registrar vía API
        try {
            // Hace una petición HTTP POST al endpoint de registro del servidor Flask
            const response = await fetch("/api/auth/register", {
                method: "POST", // Método HTTP: POST para enviar datos nuevos
                headers: {
                    "Content-Type": "application/json" // Indica que el cuerpo es JSON
                },
                // Convierte el objeto {username, password} a una cadena JSON para enviar al servidor
                body: JSON.stringify({ username, password })
            });

            // Espera y parsea la respuesta del servidor como JSON
            const data = await response.json();

            // Verifica si la respuesta fue exitosa (status 200-299) y el servidor confirmó el éxito
            if (response.ok && data.success) {
                // Guarda la sesión del usuario en localStorage
                localStorage.setItem("vibes_user", username);
                // Redirige a la página de selección de géneros
                window.location.href = "genres.html";
            } else {
                // Si el servidor respondió pero con un error, muestra el mensaje del servidor
                // O un mensaje genérico si no hay mensaje específico
                showError(data.message || "Error al registrar usuario");
            }
        } catch (error) {
            // MANEJO DE ERROR DE RED: Si la petición al servidor falla (servidor no disponible, etc.)
            // Se imprime el error en la consola del navegador para depuración
            console.error("Registration error:", error);

            // FALLBACK LOCAL: Si el servidor no responde, registra al usuario localmente como respaldo
            // Esto garantiza que la app funcione incluso sin servidor
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
            // Verifica si el usuario ya existe localmente
            if (localUsers[username]) {
                showError("El usuario ya existe localmente");
                return;
            }
            // Guarda el usuario localmente
            localUsers[username] = password;
            localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            // Guarda la sesión activa
            localStorage.setItem("vibes_user", username);
            // Redirige a selección de géneros
            window.location.href = "genres.html";
        }
    }); // Fin del event listener del botón de registro

    // ---- FUNCIÓN AUXILIAR: Mostrar mensaje de error ----
    // Recibe un mensaje de texto y lo muestra en el div de errores
    function showError(msg) {
        errorMessage.textContent = msg;       // Establece el texto del mensaje de error
        errorMessage.style.display = "block"; // Cambia display de "none" a "block" para hacerlo visible
    }
}); // Fin del listener DOMContentLoaded
