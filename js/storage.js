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

  // Reseteo puntual pedido por el usuario (2026-07-21): borra el progreso de TODOS los perfiles
  // de PERFILES (datos-juego.js), como si nadie hubiera jugado nunca — trofeos, medallas,
  // energía, todo. Se dispara UNA sola vez por dispositivo, marcado con RESETEO_MARCA; si se
  // sube una versión nueva de la marca en el futuro, se podría repetir, así que solo se toca esa
  // constante si de verdad se quiere otro reseteo global. No toca la preferencia de sonido ni qué
  // perfil estaba activo, solo el progreso guardado de cada uno.
  RESETEO_MARCA: 'reseteo-2026-07-21',

  aplicarReseteoUnaVez() {
    const CLAVE_RESETEO_APLICADO = 'liga-eterna:reseteo-aplicado';
    if (localStorage.getItem(CLAVE_RESETEO_APLICADO) === this.RESETEO_MARCA) return;
    PERFILES.forEach((perfil) => localStorage.removeItem(this.claveProgreso(perfil.id)));
    localStorage.setItem(CLAVE_RESETEO_APLICADO, this.RESETEO_MARCA);
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
