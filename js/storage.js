// Guarda y carga el progreso en el dispositivo. No sabe nada de fútbol ni de matemáticas.
// El progreso se guarda por perfil, para que cada jugador tenga el suyo separado.

const Storage = {
  CLAVE_PERFIL_ACTIVO: 'liga-eterna:perfil-activo',
  VERSION_PROGRESO: 2,

  claveProgreso(perfilId) {
    return `liga-eterna:progreso:${perfilId}`;
  },

  guardarPerfilActivo(perfilId) {
    localStorage.setItem(this.CLAVE_PERFIL_ACTIVO, perfilId);
  },

  cargarPerfilActivo() {
    return localStorage.getItem(this.CLAVE_PERFIL_ACTIVO);
  },

  borrarPerfilActivo() {
    localStorage.removeItem(this.CLAVE_PERFIL_ACTIVO);
  },

  cargarProgreso(perfilId) {
    const guardado = localStorage.getItem(this.claveProgreso(perfilId));
    return this.migrar(guardado ? JSON.parse(guardado) : {});
  },

  guardarProgreso(perfilId, progreso) {
    localStorage.setItem(this.claveProgreso(perfilId), JSON.stringify(progreso));
  },

  // Trae cualquier progreso guardado (de esta versión o de una anterior, incluida la que no tenía
  // ni campo "version") a la forma actual, sin tocar ni renombrar nada que ya existiera — solo
  // añade lo que falte con un valor por defecto inofensivo. Así un progreso de hace meses sigue
  // cargando entero. Regla para el futuro: cuando una fase nueva necesite un campo nuevo en el
  // progreso, se añade AQUÍ con su valor por defecto; nunca se renombra ni se borra un campo viejo.
  migrar(progreso) {
    if (progreso.version === this.VERSION_PROGRESO) return progreso;
    progreso.version = this.VERSION_PROGRESO;
    return progreso;
  },

  // Racha de días jugados seguidos (hábito de práctica breve y frecuente). Se llama una vez al
  // entrar al calendario; si ya se había contado hoy, no hace nada. Devuelve {dias, esNuevoDia}
  // para que quien llama sepa si debe saludar (solo la primera vez que se entra cada día).
  actualizarRacha(perfilId) {
    const progreso = this.cargarProgreso(perfilId);
    const hoy = new Date().toISOString().slice(0, 10);
    const racha = progreso.racha || { ultimoDia: null, dias: 0 };

    if (racha.ultimoDia === hoy) {
      return { dias: racha.dias, esNuevoDia: false };
    }

    const msPorDia = 24 * 60 * 60 * 1000;
    const diferenciaDias = racha.ultimoDia
      ? Math.round((new Date(hoy) - new Date(racha.ultimoDia)) / msPorDia)
      : null;

    racha.dias = diferenciaDias === 1 ? racha.dias + 1 : 1;
    racha.ultimoDia = hoy;
    progreso.racha = racha;
    this.guardarProgreso(perfilId, progreso);

    return { dias: racha.dias, esNuevoDia: true };
  }
};
