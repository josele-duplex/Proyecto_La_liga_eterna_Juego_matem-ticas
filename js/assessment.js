// EVALUACIÓN INVISIBLE: acumula en el progreso cómo juega cada niño, sin que vea nada parecido a un
// test. No pinta nada en pantalla ni decide la dificultad (de eso va la progresión): solo escucha el
// resultado de cada puzle y lo guarda. Más adelante, el panel para familias (T3.5) leerá este registro.

const Evaluacion = {
  // --- Umbrales ajustables (cuándo consideramos que un niño "va sobrado" con su equipo actual) ---
  RACHA_PARA_SUBIR: 5,     // dominios seguidos (0 fallos, 0 pistas) => va sobrado por repetición.
  TIEMPO_RAPIDO_MS: 6000,  // por debajo de esto, y acertando a la primera, cuenta como respuesta rápida.
  RAPIDAS_PARA_SUBIR: 5,   // jugadas rápidas-y-dominadas seguidas => va sobrado por rapidez.
  MAX_HISTORIAL: 12,       // cuántas jugadas recientes guardamos para mirar rachas.

  // Un "dominio" es lo mismo que para la progresión: resuelto a la primera y sin pistas.
  esDominio(resultado) {
    return resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0;
  },

  // Registra una jugada en el progreso: totales por concepto + las últimas jugadas. Modifica y
  // devuelve el progreso. No juzga "en general": solo acumula señales para leerlas después.
  registrar(progreso, puzzle, resultado) {
    progreso.registro = progreso.registro || { porConcepto: {}, ultimasJugadas: [] };
    const reg = progreso.registro;

    const c = puzzle.concepto;
    const porC = reg.porConcepto[c] = reg.porConcepto[c] || {
      jugadas: 0, dominios: 0, fallosTotales: 0, pistasTotales: 0, tiempoTotalMs: 0
    };

    const dominio = this.esDominio(resultado);
    porC.jugadas++;
    if (dominio) porC.dominios++;
    porC.fallosTotales += resultado.intentosFallidos;
    porC.pistasTotales += resultado.pistasUsadas;
    porC.tiempoTotalMs += resultado.tiempoMs || 0;

    reg.ultimasJugadas.push({
      concepto: c,
      fase: puzzle.fase_cpa,
      dominio,
      tiempoMs: resultado.tiempoMs || 0
    });
    if (reg.ultimasJugadas.length > this.MAX_HISTORIAL) reg.ultimasJugadas.shift();

    return progreso;
  },

  // ¿El jugador va sobrado en lo que está jugando ahora? Dos vías, como pide el diseño:
  // por REPETICIÓN (racha de dominios) o por RAPIDEZ (varias seguidas dominadas y rápidas).
  // Solo mira las jugadas recientes, que son todas del modo activo (se juega un modo cada vez).
  vaSobrado(progreso) {
    const ultimas = (progreso.registro && progreso.registro.ultimasJugadas) || [];
    if (ultimas.length < this.RACHA_PARA_SUBIR) return false;

    const colaDominio = this._colaFinal(ultimas, (j) => j.dominio);
    if (colaDominio >= this.RACHA_PARA_SUBIR) return true;

    const colaRapida = this._colaFinal(
      ultimas,
      (j) => j.dominio && j.tiempoMs > 0 && j.tiempoMs <= this.TIEMPO_RAPIDO_MS
    );
    return colaRapida >= this.RAPIDAS_PARA_SUBIR;
  },

  // Cuántas jugadas finales seguidas cumplen una condición (mirando desde la última hacia atrás).
  _colaFinal(lista, cumple) {
    let n = 0;
    for (let i = lista.length - 1; i >= 0; i--) {
      if (cumple(lista[i])) n++;
      else break;
    }
    return n;
  }
};
