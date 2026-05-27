particlesJS("particles-js", {
  particles: {
    number: {
      value: 80
    },
    color: {
      value: "#39FF14"
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.5
    },
    size: {
      value: 3
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#39FF14",
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 2
    }
  }
});

// Limpiar sesión al volver a la página de bienvenida
localStorage.removeItem("vibes_user");