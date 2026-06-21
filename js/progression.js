// PROGRESIÓN: decide qué puzle viene después según el dominio demostrado por el jugador.
// No sabe cómo se juega un puzle por dentro: solo lee el índice de contenidos (concepto + fase)
// y el progreso del jugador, y devuelve el siguiente puzle. Trabaja por concepto y por fase CPA.

const Progression = {
  // --- Umbrales fáciles de ajustar (la progresión necesitará varias pasadas de afinado) ---
  // "Domina": lo resolvió a la primera y sin pistas → sube de fase.
  esDominio(resultado) {
    return resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0;
  },
  // "Le cuesta": dos o más fallos, o dos o más pistas → baja de fase a reforzar.
  leCuesta(resultado) {
    return resultado.intentosFallidos >= 2 || resultado.pistasUsadas >= 2;
  },

  // Lista de fases disponibles para un concepto (según lo que haya en el índice).
  fasesDe(indice, concepto) {
    return indice.puzles.filter((p) => p.concepto === concepto).map((p) => p.fase_cpa);
  },

  // Conceptos del índice, en el orden en que aparecen por primera vez.
  conceptos(indice) {
    const vistos = [];
    indice.puzles.forEach((p) => {
      if (!vistos.includes(p.concepto)) vistos.push(p.concepto);
    });
    return vistos;
  },

  // Actualiza el progreso tras resolver un puzle: sube / mantiene / baja de fase, y cambia de
  // concepto cuando se domina la fase más alta del concepto actual. Modifica y devuelve el progreso.
  actualizar(progreso, indice, conceptoJugado, faseJugada, resultado) {
    progreso.dominio = progreso.dominio || {};
    if (!progreso.dominio[conceptoJugado]) {
      progreso.dominio[conceptoJugado] = { fase: faseJugada };
    }

    const fases = this.fasesDe(indice, conceptoJugado);
    const faseMax = Math.max(...fases);
    const faseMin = Math.min(...fases);

    let nuevaFase = faseJugada;
    if (this.esDominio(resultado)) {
      nuevaFase = Math.min(faseJugada + 1, faseMax);
    } else if (this.leCuesta(resultado)) {
      nuevaFase = Math.max(faseJugada - 1, faseMin);
    }
    progreso.dominio[conceptoJugado].fase = nuevaFase;

    // Si ha dominado la fase más alta de este concepto, pasa al siguiente concepto.
    const conceptos = this.conceptos(indice);
    if (this.esDominio(resultado) && faseJugada === faseMax) {
      const i = conceptos.indexOf(conceptoJugado);
      progreso.conceptoActual = conceptos[(i + 1) % conceptos.length];
    } else {
      progreso.conceptoActual = conceptoJugado;
    }

    return progreso;
  },

  // Elige el siguiente puzle: del concepto actual, el de fase más cercana a la fase objetivo
  // del jugador. Si hay varios igual de adecuados (misma fase), elige al azar y evita repetir
  // el último, para dar variedad. Devuelve la entrada del índice { id, concepto, fase_cpa, ruta }.
  siguiente(progreso, indice) {
    const conceptos = this.conceptos(indice);
    const concepto = (progreso.conceptoActual && conceptos.includes(progreso.conceptoActual))
      ? progreso.conceptoActual
      : conceptos[0];

    progreso.dominio = progreso.dominio || {};
    const faseObjetivo = progreso.dominio[concepto]
      ? progreso.dominio[concepto].fase
      : Math.min(...this.fasesDe(indice, concepto));

    const candidatos = indice.puzles.filter((p) => p.concepto === concepto);
    const distancia = (p) => Math.abs(p.fase_cpa - faseObjetivo);
    const minDistancia = Math.min(...candidatos.map(distancia));
    let mejores = candidatos.filter((p) => distancia(p) === minDistancia);

    if (mejores.length > 1 && progreso.ultimoPuzleId) {
      const sinRepetir = mejores.filter((p) => p.id !== progreso.ultimoPuzleId);
      if (sinRepetir.length > 0) mejores = sinRepetir;
    }

    return mejores[Math.floor(Math.random() * mejores.length)];
  }
};
