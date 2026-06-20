// Sonidos y la "voz del entrenador". Tonos generados con Web Audio (sin archivos de sonido,
// para no pesar la PWA offline). Se llama "Sonido" y no "Audio" para no chocar con el
// constructor nativo window.Audio.

const Sonido = {
  activo: true,
  contexto: null,
  CLAVE: 'liga-eterna:sonido',

  cargarPreferencia() {
    this.activo = localStorage.getItem(this.CLAVE) !== 'no';
  },

  alternar() {
    this.activo = !this.activo;
    localStorage.setItem(this.CLAVE, this.activo ? 'si' : 'no');
    return this.activo;
  },

  obtenerContexto() {
    if (!this.contexto) {
      const ContextoAudio = window.AudioContext || window.webkitAudioContext;
      this.contexto = new ContextoAudio();
    }
    return this.contexto;
  },

  // Un tono breve y suave (sin clics ni golpes secos) para no sobresaltar.
  tono(frecuencia, duracionMs, retrasoMs = 0) {
    if (!this.activo) return;
    const ctx = this.obtenerContexto();
    const inicio = ctx.currentTime + retrasoMs / 1000;
    const oscilador = ctx.createOscillator();
    const volumen = ctx.createGain();
    oscilador.type = 'sine';
    oscilador.frequency.value = frecuencia;
    volumen.gain.setValueAtTime(0.0001, inicio);
    volumen.gain.exponentialRampToValueAtTime(0.15, inicio + 0.02);
    volumen.gain.exponentialRampToValueAtTime(0.0001, inicio + duracionMs / 1000);
    oscilador.connect(volumen);
    volumen.connect(ctx.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + duracionMs / 1000);
  },

  sonidoAcierto() {
    this.tono(880, 150);
    this.tono(1175, 180, 100);
  },

  // Tono grave y breve: invita a reintentar, no penaliza ni alarma.
  sonidoFallo() {
    this.tono(330, 180);
  },

  sonidoVictoria() {
    [659, 784, 988, 1318].forEach((frecuencia, i) => this.tono(frecuencia, 220, i * 120));
  },

  // Lee en voz alta el campo puzzle.enunciado.voz. Solo se activa por un clic del jugador
  // (nunca solo al cargar la pantalla), para no resultar intrusivo.
  decirVoz(texto) {
    if (!this.activo || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const enunciado = new SpeechSynthesisUtterance(texto);
    enunciado.lang = 'es-ES';
    enunciado.rate = 0.95;
    window.speechSynthesis.speak(enunciado);
  }
};
