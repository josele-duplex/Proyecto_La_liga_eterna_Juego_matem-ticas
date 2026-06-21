// Pinta pantallas, botones y transiciones. No comprueba respuestas ni decide progresión.

const UI = {
  // Cambia la familia de color de toda la pantalla (variables CSS en css/styles.css).
  aplicarTema(nombre) {
    document.body.className = `tema-${nombre}`;
  },

  // Si el estadio tiene imagen la usa; si no, genera un escudo simple con la inicial.
  crearEscudo(estadio) {
    if (estadio.imagen) {
      const img = document.createElement('img');
      img.className = 'escudo-estadio';
      img.src = estadio.imagen;
      img.alt = estadio.nombre;
      return img;
    }
    const escudo = document.createElement('div');
    escudo.className = 'escudo-estadio escudo-placeholder';
    escudo.textContent = estadio.nombre.charAt(0).toUpperCase();
    return escudo;
  },

  // Avatar grande (selector de jugador). Si el perfil no tiene "avatar", usa una inicial.
  crearAvatarPerfil(perfil) {
    if (perfil.avatar) {
      const img = document.createElement('img');
      img.className = 'avatar-perfil';
      img.src = perfil.avatar;
      img.alt = perfil.nombre;
      return img;
    }
    const placeholder = document.createElement('div');
    placeholder.className = 'avatar-perfil avatar-placeholder';
    placeholder.textContent = perfil.nombre.charAt(0).toUpperCase();
    return placeholder;
  },

  // Avatar pequeño (barra superior). Mismo criterio que crearAvatarPerfil, en miniatura.
  crearAvatarMini(perfil) {
    if (perfil.avatar) {
      const img = document.createElement('img');
      img.className = 'avatar-mini';
      img.src = perfil.avatar;
      img.alt = perfil.nombre;
      return img;
    }
    const placeholder = document.createElement('span');
    placeholder.className = 'avatar-mini avatar-placeholder';
    placeholder.textContent = perfil.nombre.charAt(0).toUpperCase();
    return placeholder;
  },

  prefiereMenosMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Confeti breve (se borra solo). Se omite si el sistema pide menos movimiento.
  celebrarVictoria(contenedor) {
    if (this.prefiereMenosMovimiento()) return;
    const confeti = document.createElement('div');
    confeti.className = 'confeti';
    const colores = ['#ffc107', '#ff9100', '#1de9b6', '#2979ff'];
    for (let i = 0; i < 16; i++) {
      const trozo = document.createElement('span');
      trozo.style.left = `${Math.random() * 100}%`;
      trozo.style.animationDelay = `${Math.random() * 0.4}s`;
      trozo.style.backgroundColor = colores[i % colores.length];
      confeti.appendChild(trozo);
    }
    contenedor.appendChild(confeti);
    setTimeout(() => confeti.remove(), 1500);
  }
};
