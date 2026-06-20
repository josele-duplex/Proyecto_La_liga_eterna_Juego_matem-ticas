// Guarda y carga el progreso en el dispositivo. No sabe nada de fútbol ni de matemáticas.
// El progreso se guarda por perfil, para que cada jugador tenga el suyo separado.

const Storage = {
  CLAVE_PERFIL_ACTIVO: 'liga-eterna:perfil-activo',

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
    return guardado ? JSON.parse(guardado) : {};
  },

  guardarProgreso(perfilId, progreso) {
    localStorage.setItem(this.claveProgreso(perfilId), JSON.stringify(progreso));
  }
};
