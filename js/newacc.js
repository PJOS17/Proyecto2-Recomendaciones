// VIBES - Lógica de Creación de Cuentas
document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const registerBtn = document.getElementById("register-btn");
    const errorMessage = document.getElementById("error-message");

    registerBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Por favor ingresa un nombre de usuario y contraseña");
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
            if (localUsers[username]) {
                showError("El usuario ya existe");
                return;
            }
            localUsers[username] = password;
            localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            localStorage.setItem("vibes_user", username);
            window.location.href = "genres.html";
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Guardar la sesión temporal para la selección de gustos
                localStorage.setItem("vibes_user", username);
                // Redirigir a selección de géneros
                window.location.href = "genres.html";
            } else {
                showError(data.message || "Error al registrar usuario");
            }
        } catch (error) {
            console.error("Registration error:", error);
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
            if (localUsers[username]) {
                showError("El usuario ya existe localmente");
                return;
            }
            localUsers[username] = password;
            localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            localStorage.setItem("vibes_user", username);
            window.location.href = "genres.html";
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = "block";
    }
});
