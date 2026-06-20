// Guarda y carga el progreso en el dispositivo.

const Storage = {
  CLAVE: 'liga-eterna:progreso',

  cargarProgreso() {
    const guardado = localStorage.getItem(this.CLAVE);
    return guardado ? JSON.parse(guardado) : {};
  },

  guardarUltimoPuzle(puzzleId) {
    const progreso = this.cargarProgreso();
    progreso.ultimoPuzleId = puzzleId;
    localStorage.setItem(this.CLAVE, JSON.stringify(progreso));
  }
};

