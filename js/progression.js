// PROGRESIÓN: decide qué puzle viene después según el dominio demostrado por el jugador.
// No sabe cómo se juega un puzle por dentro: solo lee el índice de contenidos (concepto + fase)
// y el progreso del jugador, y devuelve el siguiente puzle. Trabaja por concepto y por fase CPA.

const Progression = {
  // --- Umbrales fáciles de ajustar (la progresión necesitará varias pasadas de afinado) ---
  // "Domina": lo resolvió a la primera y sin pistas → sube de fase.
  esDominio(resultado) {
    return resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0;
  },
  // "Le cuesta": un fallo o una pista ya bastan → baja de fase a reforzar de inmediato. Así el
  // juego se mantiene en el "canal de flujo" (ni aburre ni frustra) sin esperar a que se atasque
  // dos veces; como esDominio exige acertar a la primera, basta UN tropiezo para notarlo.
  leCuesta(resultado) {
    return resultado.intentosFallidos >= 1 || resultado.pistasUsadas >= 1;
  },

  // Repaso espaciado (TG.5, Leitner ligero): un concepto que "le cuesta" reaparece RETOS_PARA_REPASO
  // retos después, no en el siguiente inmediato (sería repetir sobre la herida) ni nunca (se
  // olvidaría). Si al repasarlo vuelve a costarle, se reencola con el mismo plazo; si lo domina,
  // sale de la cola sola (siguiente() ya la quita al servirlo).
  RETOS_PARA_REPASO: 3,

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

    // Cola de repaso (TG.5): cada puzle resuelto acerca el turno de los conceptos ya en cola;
    // si este concepto le ha costado, entra (o vuelve a entrar) con el plazo completo.
    progreso.colaRepaso = (progreso.colaRepaso || []).map((item) => ({ ...item, enFaltan: item.enFaltan - 1 }));
    if (this.leCuesta(resultado)) {
      const existente = progreso.colaRepaso.find((item) => item.concepto === conceptoJugado);
      if (existente) existente.enFaltan = this.RETOS_PARA_REPASO;
      else progreso.colaRepaso.push({ concepto: conceptoJugado, enFaltan: this.RETOS_PARA_REPASO });
    }

    return progreso;
  },

  // Elige el siguiente puzle: del concepto actual, el de fase más cercana a la fase objetivo
  // del jugador. Si hay varios igual de adecuados (misma fase), elige al azar y evita repetir
  // el último, para dar variedad. Devuelve la entrada del índice { id, concepto, fase_cpa, ruta,
  // esRepaso } — esRepaso es true cuando este reto viene de la cola de repaso (TG.5), para que
  // la interfaz pueda avisar ("Capi te trae un repaso de…") en vez del mensaje normal.
  siguiente(progreso, indice) {
    const conceptos = this.conceptos(indice);

    progreso.colaRepaso = progreso.colaRepaso || [];
    const repasoListo = progreso.colaRepaso.find(
      (item) => item.enFaltan <= 0 && conceptos.includes(item.concepto)
    );

    let concepto;
    let esRepaso = false;
    if (repasoListo) {
      concepto = repasoListo.concepto;
      esRepaso = true;
      progreso.colaRepaso = progreso.colaRepaso.filter((item) => item !== repasoListo);
    } else {
      concepto = (progreso.conceptoActual && conceptos.includes(progreso.conceptoActual))
        ? progreso.conceptoActual
        : conceptos[0];
    }

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

    const elegido = mejores[Math.floor(Math.random() * mejores.length)];
    return esRepaso ? { ...elegido, esRepaso: true } : elegido;
  }
};
