/* =============================================================================
   login.js - Lógica de Inicio de Sesión
   =============================================================================
   PROPÓSITO: Maneja la autenticación de usuarios existentes en VIBES.
   FUNCIONA: Cuando el usuario ingresa sus credenciales y pulsa "Iniciar >>":
     1. Valida que ambos campos estén llenos
     2. Verifica las credenciales contra localStorage (modo local) o el servidor Flask (modo servidor)
     3. Si son correctas, guarda la sesión y redirige a home.html
     4. Si son incorrectas, muestra un mensaje de error
   FALLBACK: Si el servidor no responde, intenta autenticar localmente como respaldo.
   ============================================================================= */

// Espera a que el DOM esté completamente cargado antes de ejecutar el código
// Esto garantiza que los elementos HTML (inputs, botones) ya existan antes de intentar accederlos
document.addEventListener("DOMContentLoaded", () => {
    // Obtiene referencia al campo de texto del nombre de usuario
    const usernameInput = document.getElementById("username");
    // Obtiene referencia al campo de contraseña
    const passwordInput = document.getElementById("password");
    // Obtiene referencia al botón de inicio de sesión
    const loginBtn = document.getElementById("login-btn");
    // Obtiene referencia al div donde se muestran mensajes de error
    const errorMessage = document.getElementById("error-message");

    // Agrega un listener al botón que se ejecuta cada vez que el usuario hace clic
    // async porque puede necesitar comunicarse con el servidor (operación asíncrona)
    loginBtn.addEventListener("click", async () => {
        // Lee y limpia los valores de los campos de entrada
        const username = usernameInput.value.trim(); // .trim() elimina espacios innecesarios
        const password = passwordInput.value.trim();

        // VALIDACIÓN: Verifica que ambos campos tengan contenido
        if (!username || !password) {
            showError("Por favor ingresa usuario y contraseña de seguridad");
            return; // Detiene la ejecución si falta algún campo
        }

        // Determina el modo de base de datos: "local" (localStorage) o "server" (Flask API)
        const dbMode = localStorage.getItem("vibes_db_mode") || "local";

        // MODO LOCAL: Se usa si el modo es "local" O si la página se abrió desde un archivo (sin servidor)
        if (dbMode === "local" || window.location.protocol === "file:") {
            // Lee los usuarios almacenados en localStorage, o un objeto vacío si no hay ninguno
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");

            // Si no hay usuarios registrados, crea un usuario de demostración por defecto
            // Esto permite probar la app incluso sin haber creado una cuenta antes
            if (Object.keys(localUsers).length === 0) {
                localUsers["Pos"] = "123456"; // Usuario de prueba: Pos / 123456
                localStorage.setItem("vibes_users", JSON.stringify(localUsers)); // Guarda el usuario demo
            }

            // Verifica si el usuario existe Y si la contraseña coincide exactamente
            if (localUsers[username] && localUsers[username] === password) {
                // ÉXITO: Guarda el nombre del usuario activo en la sesión
                localStorage.setItem("vibes_user", username);
                // Redirige a la página principal (home.html)
                window.location.href = "home.html";
            } else {
                // ERROR: Las credenciales no coinciden
                showError("Usuario o contraseña incorrectos");
            }
            return; // Fin del flujo local
        }

        // MODO SERVIDOR: Intenta autenticar contra la API Flask
        try {
            // Hace una petición HTTP POST al endpoint de login del servidor
            const response = await fetch("/api/auth/login", {
                method: "POST",  // Método POST para enviar credenciales
                headers: {
                    "Content-Type": "application/json" // Indica que el cuerpo es JSON
                },
                // Envía usuario y contraseña como JSON en el cuerpo de la petición
                body: JSON.stringify({ username, password })
            });

            // Parsea la respuesta del servidor como JSON
            const data = await response.json();

            // Verifica si la autenticación fue exitosa
            if (response.ok && data.success) {
                // Guarda el nombre del usuario en la sesión local
                localStorage.setItem("vibes_user", data.username);
                // Redirige a la página principal
                window.location.href = "home.html";
            } else {
                // Muestra el mensaje de error del servidor o uno genérico
                showError(data.message || "Error al intentar iniciar sesión");
            }
        } catch (error) {
            // MANEJO DE ERROR DE RED: El servidor no respondió o hubo un problema de conexión
            console.error("Login error:", error); // Log del error para depuración

            // FALLBACK LOCAL: Intenta autenticar con los datos locales como respaldo
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");

            // Crea usuario demo si no hay usuarios registrados localmente
            if (Object.keys(localUsers).length === 0) {
                localUsers["Pos"] = "123456";
                localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            }

            // Intenta verificar credenciales localmente
            if (localUsers[username] && localUsers[username] === password) {
                localStorage.setItem("vibes_user", username);
                window.location.href = "home.html"; // Redirige al home si las credenciales coinciden
            } else {
                // Si tampoco coincide localmente, muestra error de conexión
                showError("No se pudo conectar al servidor de seguridad de VIBES");
            }
        }
    }); // Fin del event listener del botón

    // ---- FUNCIÓN AUXILIAR: Mostrar mensaje de error ----
    // Recibe un texto y lo muestra dentro del div de errores haciéndolo visible
    function showError(msg) {
        errorMessage.textContent = msg;       // Establece el contenido de texto del div
        errorMessage.style.display = "block"; // Cambia de "none" a "block" para mostrarlo
    }
}); // Fin del listener DOMContentLoaded
