// VIBES - Lógica de Inicio de Sesión
document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const errorMessage = document.getElementById("error-message");

    loginBtn.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Por favor ingresa usuario y contraseña de seguridad");
            return;
        }

        const dbMode = localStorage.getItem("vibes_db_mode") || "local";
        if (dbMode === "local" || window.location.protocol === "file:") {
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
            if (Object.keys(localUsers).length === 0) {
                localUsers["Pos"] = "123456";
                localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            }
            if (localUsers[username] && localUsers[username] === password) {
                localStorage.setItem("vibes_user", username);
                window.location.href = "home.html";
            } else {
                showError("Usuario o contraseña incorrectos");
            }
            return;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Guardar la sesión del usuario
                localStorage.setItem("vibes_user", data.username);
                // Redirigir a Home
                window.location.href = "home.html";
            } else {
                showError(data.message || "Error al intentar iniciar sesión");
            }
        } catch (error) {
            console.error("Login error:", error);
            let localUsers = JSON.parse(localStorage.getItem("vibes_users") || "{}");
            if (Object.keys(localUsers).length === 0) {
                localUsers["Pos"] = "123456";
                localStorage.setItem("vibes_users", JSON.stringify(localUsers));
            }
            if (localUsers[username] && localUsers[username] === password) {
                localStorage.setItem("vibes_user", username);
                window.location.href = "home.html";
            } else {
                showError("No se pudo conectar al servidor de seguridad de VIBES");
            }
        }
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = "block";
    }
});
