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

  // Niveles de Dominio (FASE M1, U1): escala única 🥉🥈🥇 por concepto, para no tener dos
  // taxonomías paralelas (una del calendario, otra de los cromos). Se calcula siempre a partir de
  // dominio[concepto], nunca se guarda como campo aparte, así no puede desincronizarse.
  NIVELES_DOMINIO: ['aprendiz', 'titular', 'crack'],
  UMBRAL_TITULAR: 1, // dominó la fase más alta al menos una vez.
  UMBRAL_CRACK: 3,   // la dominó varias veces (dominio sostenido, no un golpe de suerte).

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

  // Actualiza el progreso tras resolver un puzle: sube/baja la fase CPA de ese concepto y rota al
  // siguiente concepto. `fueRepaso` indica si el puzle venía de la cola de repaso (TG.5); en ese
  // caso NO se mueve el puntero de rotación, para que el repaso no desordene la vuelta normal.
  // Modifica y devuelve el progreso.
  actualizar(progreso, indice, conceptoJugado, faseJugada, resultado, fueRepaso) {
    progreso.dominio = progreso.dominio || {};
    if (!progreso.dominio[conceptoJugado]) {
      progreso.dominio[conceptoJugado] = { fase: faseJugada };
    }

    const fases = this.fasesDe(indice, conceptoJugado);
    const faseMax = Math.max(...fases);
    const faseMin = Math.min(...fases);

    // Progresivo/regresivo: cada concepto recuerda su PROPIA fase CPA. Acertar a la primera y sin
    // pistas sube de fase; un tropiezo la baja. Esto es independiente de qué concepto toque jugar.
    let nuevaFase = faseJugada;
    if (this.esDominio(resultado)) {
      nuevaFase = Math.min(faseJugada + 1, faseMax);
    } else if (this.leCuesta(resultado)) {
      nuevaFase = Math.max(faseJugada - 1, faseMin);
    }
    progreso.dominio[conceptoJugado].fase = nuevaFase;

    // Niveles de Dominio (FASE M1, U1): cuenta cuántas veces se ha resuelto LIMPIO (sin fallos ni
    // pistas) en la fase más alta del concepto. No se resetea al bajar de fase circunstancialmente
    // (eso ya lo refleja "fase"): este contador mide "lo bien dominado que está en general".
    if (this.esDominio(resultado) && faseJugada === faseMax) {
      progreso.dominio[conceptoJugado].aciertosLimpiosFaseMax =
        (progreso.dominio[conceptoJugado].aciertosLimpiosFaseMax || 0) + 1;
    }

    // Rotación de conceptos (interleaving): tras CADA reto normal se avanza al siguiente concepto
    // de la lista, en círculo. Así el niño ve variedad y NUNCA se queda atascado repitiendo el
    // mismo concepto (la causa del bug: antes solo se rotaba al dominar la fase más alta, y un
    // único fallo dejaba al jugador encerrado). Un reto de repaso no mueve el puntero.
    const conceptos = this.conceptos(indice);
    if (!fueRepaso) {
      const i = conceptos.indexOf(conceptoJugado);
      progreso.conceptoActual = conceptos[(i + 1) % conceptos.length];
    } else if (!progreso.conceptoActual || !conceptos.includes(progreso.conceptoActual)) {
      progreso.conceptoActual = conceptos[0];
    }

    // Cola de repaso (TG.5). CLAVE: quitar/añadir conceptos de la cola se hace AQUÍ y no en
    // siguiente(), porque el objeto que se guarda en disco es este. La app recarga el progreso
    // entre siguiente() y actualizar(), así que cualquier cambio que hiciera siguiente() a la cola
    // se perdería — y un repaso ya servido nunca se eliminaba: se repetía sin fin (era el bug del
    // bucle que reportó el usuario: "¿Cuál es la mitad de 8?" / "qué número es mayor").
    progreso.colaRepaso = progreso.colaRepaso || [];
    // 1) Si este reto venía de la cola de repaso, ya está servido: quítalo de la cola.
    if (fueRepaso) {
      const i = progreso.colaRepaso.findIndex((item) => item.concepto === conceptoJugado);
      if (i >= 0) progreso.colaRepaso.splice(i, 1);
    }
    // 2) Acerca el turno de los conceptos que siguen en cola.
    progreso.colaRepaso = progreso.colaRepaso.map((item) => ({ ...item, enFaltan: item.enFaltan - 1 }));
    // 3) Si este concepto le ha costado, entra (o vuelve a entrar) con el plazo completo.
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

    // siguiente() NO toca la cola: solo elige. Quien la modifica y guarda es actualizar() (ver
    // arriba). Esto evita el bug del bucle: el item servido se elimina en el progreso que SÍ se
    // persiste, no en este (que se descarta).
    let concepto;
    let esRepaso = false;
    if (repasoListo) {
      concepto = repasoListo.concepto;
      esRepaso = true;
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
  },

  // La fase más alta disponible para un concepto (según el índice), o null si el concepto no
  // existe en él. La usan tanto actualizar() como el cálculo de nivel de dominio.
  faseMaxDe(indice, concepto) {
    const fases = this.fasesDe(indice, concepto);
    return fases.length ? Math.max(...fases) : null;
  },

  // Nivel de Dominio (FASE M1, U1) de UN concepto: null si el jugador todavía no lo ha empezado
  // (ni siquiera aparece en dominio); si no, 'aprendiz' | 'titular' | 'crack' según cuántas veces
  // lo ha resuelto limpio en su fase más alta (aciertosLimpiosFaseMax, ver actualizar()).
  nivelDominioConcepto(progreso, concepto) {
    const entrada = (progreso.dominio || {})[concepto];
    if (!entrada) return null;
    const limpios = entrada.aciertosLimpiosFaseMax || 0;
    if (limpios >= this.UMBRAL_CRACK) return 'crack';
    if (limpios >= this.UMBRAL_TITULAR) return 'titular';
    return 'aprendiz';
  },

  // Nivel de Dominio asociado a una ESTRATEGIA (para el brillo del cromo en la barra de perfil,
  // que se agrupa por estrategia, no por concepto): el mejor nivel entre los conceptos que premian
  // esa estrategia. Casi siempre hay un único concepto por estrategia; "completar_diez" es la
  // excepción (la comparten Promesas y Estrellas), así que se coge el más alto de los dos.
  nivelDominioEstrategia(progreso, indice, estrategia) {
    const conceptos = [...new Set(
      indice.puzles.filter((p) => p.estrategia === estrategia).map((p) => p.concepto)
    )];
    let mejor = null;
    conceptos.forEach((concepto) => {
      const nivel = this.nivelDominioConcepto(progreso, concepto);
      if (!nivel) return;
      if (!mejor || this.NIVELES_DOMINIO.indexOf(nivel) > this.NIVELES_DOMINIO.indexOf(mejor)) {
        mejor = nivel;
      }
    });
    return mejor;
  }
};
