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

  // Repaso de mantenimiento (FASE M4, U4/D.1): cuando un concepto llega a Crack se programa una
  // revisión a estos intervalos crecientes (en DÍAS naturales, no en retos como el refuerzo de
  // arriba). Si sale limpia, el siguiente intervalo es el próximo de esta lista (se queda en el
  // último, 30, indefinidamente); si sale costosa, el nivel baja a Titular.
  INTERVALOS_MANTENIMIENTO: [3, 10, 30],

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

  // Sube/baja la fase CPA de un concepto (y cuenta los aciertos limpios en su fase máxima) según
  // el resultado de UNA jugada. Extraído de actualizar() (FASE M5) para que Contrarreloj pueda
  // tocar SOLO el dominio de 'relampago' sin arrastrar la rotación de conceptos ni la cola de
  // repaso de Liga — si no, jugar Contrarreloj corrompería el interleaving y el repaso espaciado
  // del modo Liga (la QA de cada fase exige justo lo contrario). Devuelve { faseMax, justoAhoraCrack }
  // para que actualizar() siga programando el mantenimiento exactamente igual que antes.
  actualizarFaseDominio(progreso, indice, conceptoJugado, faseJugada, resultado) {
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
    // Se guarda si ESTE acierto es justo el que cruza el umbral de Crack, para programar la
    // primera revisión de mantenimiento (FASE M4) más abajo.
    let justoAhoraCrack = false;
    if (this.esDominio(resultado) && faseJugada === faseMax) {
      const anterior = progreso.dominio[conceptoJugado].aciertosLimpiosFaseMax || 0;
      const nuevoValor = anterior + 1;
      progreso.dominio[conceptoJugado].aciertosLimpiosFaseMax = nuevoValor;
      justoAhoraCrack = anterior < this.UMBRAL_CRACK && nuevoValor >= this.UMBRAL_CRACK;
    }

    return { faseMax, justoAhoraCrack };
  },

  // Actualiza el progreso tras resolver un puzle de Liga: sube/baja la fase CPA de ese concepto
  // (vía actualizarFaseDominio) y rota al siguiente concepto. `fueRepaso` indica si el puzle venía
  // de la cola de repaso (cualquier tipo); en ese caso NO se mueve el puntero de rotación, para
  // que el repaso no desordene la vuelta normal. `tipoRepaso` ('refuerzo' | 'mantenimiento' |
  // undefined, FASE M4) distingue de cuál de las dos colas venía, para aplicar la lógica de
  // intervalos de mantenimiento. Modifica y devuelve el progreso.
  actualizar(progreso, indice, conceptoJugado, faseJugada, resultado, fueRepaso, tipoRepaso) {
    const { justoAhoraCrack } = this.actualizarFaseDominio(progreso, indice, conceptoJugado, faseJugada, resultado);

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

    // Cola de repaso (TG.5 refuerzo + FASE M4 mantenimiento, U4). CLAVE: quitar/añadir entradas de
    // la cola se hace AQUÍ y no en siguiente(), porque el objeto que se guarda en disco es este. La
    // app recarga el progreso entre siguiente() y actualizar(), así que cualquier cambio que
    // hiciera siguiente() a la cola se perdería — y un repaso ya servido nunca se eliminaba: se
    // repetía sin fin (era el bug del bucle que reportó el usuario).
    progreso.colaRepaso = progreso.colaRepaso || [];
    let entradaMantenimientoServida = null;

    // 1) Si este reto venía de la cola de repaso, ya está servido: quítalo (del tipo que sea).
    if (fueRepaso) {
      const i = progreso.colaRepaso.findIndex(
        (item) => item.concepto === conceptoJugado && (item.tipo || 'refuerzo') === (tipoRepaso || 'refuerzo')
      );
      if (i >= 0) entradaMantenimientoServida = progreso.colaRepaso.splice(i, 1)[0];
    }

    // 2) Acerca el turno de los refuerzos que siguen en cola (el mantenimiento cuenta por fecha,
    // no por retos, así que no se toca aquí).
    progreso.colaRepaso = progreso.colaRepaso.map((item) =>
      item.tipo === 'mantenimiento' ? item : { ...item, enFaltan: item.enFaltan - 1 }
    );

    // 3) Refuerzo (TG.5): si este concepto ha costado, entra (o vuelve a entrar) con el plazo
    // completo. No aplica si el reto que acaba de resolverse era ya una revisión de mantenimiento
    // (ese caso lo gestiona el bloque 4 de abajo, con su propia consecuencia).
    if (this.leCuesta(resultado) && tipoRepaso !== 'mantenimiento') {
      const existente = progreso.colaRepaso.find((item) => item.concepto === conceptoJugado && (item.tipo || 'refuerzo') === 'refuerzo');
      if (existente) existente.enFaltan = this.RETOS_PARA_REPASO;
      else progreso.colaRepaso.push({ concepto: conceptoJugado, enFaltan: this.RETOS_PARA_REPASO, tipo: 'refuerzo' });
    }

    // 4) Mantenimiento (FASE M4, U4/D.1). Dos entradas posibles:
    //    a) Este reto ERA una revisión de mantenimiento: si salió limpia, se reprograma al
    //       siguiente intervalo (3→10→30, se queda en 30); si costó, el nivel baja a Titular
    //       (nunca se dice "has olvidado", solo "necesita entrenar de nuevo" — eso lo muestra
    //       quien llama, comparando el nivel antes/después).
    //    b) El concepto acaba de cruzar el umbral de Crack en ESTE acierto: se programa su
    //       primera revisión, salvo que ya hubiera una pendiente (no debería, pero por si acaso).
    if (tipoRepaso === 'mantenimiento') {
      if (this.esDominio(resultado)) {
        const intervaloAnterior = entradaMantenimientoServida ? entradaMantenimientoServida.intervaloDias : this.INTERVALOS_MANTENIMIENTO[0];
        const siguienteIntervalo = this.avanzarIntervalo(intervaloAnterior);
        progreso.colaRepaso.push({
          concepto: conceptoJugado,
          tipo: 'mantenimiento',
          intervaloDias: siguienteIntervalo,
          fechaRevision: this.fechaMasDias(siguienteIntervalo)
        });
      } else if (this.leCuesta(resultado)) {
        progreso.dominio[conceptoJugado].aciertosLimpiosFaseMax = this.UMBRAL_TITULAR;
      }
    } else if (justoAhoraCrack) {
      const yaProgramado = progreso.colaRepaso.some((item) => item.tipo === 'mantenimiento' && item.concepto === conceptoJugado);
      if (!yaProgramado) {
        progreso.colaRepaso.push({
          concepto: conceptoJugado,
          tipo: 'mantenimiento',
          intervaloDias: this.INTERVALOS_MANTENIMIENTO[0],
          fechaRevision: this.fechaMasDias(this.INTERVALOS_MANTENIMIENTO[0])
        });
      }
    }

    return progreso;
  },

  // Siguiente intervalo de mantenimiento tras una revisión limpia: el próximo de la lista, o se
  // queda en el último (30) si ya estaba en él o el valor no se reconoce.
  avanzarIntervalo(intervaloActual) {
    const i = this.INTERVALOS_MANTENIMIENTO.indexOf(intervaloActual);
    if (i === -1 || i === this.INTERVALOS_MANTENIMIENTO.length - 1) {
      return this.INTERVALOS_MANTENIMIENTO[this.INTERVALOS_MANTENIMIENTO.length - 1];
    }
    return this.INTERVALOS_MANTENIMIENTO[i + 1];
  },

  // Fecha (YYYY-MM-DD) dentro de `dias` días naturales desde hoy.
  fechaMasDias(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().slice(0, 10);
  },

  // Elige el siguiente puzle: del concepto actual, el de fase más cercana a la fase objetivo
  // del jugador. Si hay varios igual de adecuados (misma fase), elige al azar y evita repetir
  // el último, para dar variedad. Devuelve la entrada del índice { id, concepto, fase_cpa, ruta,
  // esRepaso, tipoRepaso } — esRepaso es true cuando este reto viene de la cola de repaso (TG.5
  // refuerzo o FASE M4 mantenimiento), para que la interfaz pueda avisar ("Capi te trae un
  // repaso de…") en vez del mensaje normal. Entre los dos tipos, el REFUERZO tiene prioridad
  // (U4 lo pide explícitamente): si ambos están listos a la vez, se sirve antes el refuerzo.
  siguiente(progreso, indice) {
    const conceptos = this.conceptos(indice);

    progreso.colaRepaso = progreso.colaRepaso || [];
    const hoy = new Date().toISOString().slice(0, 10);
    const listos = progreso.colaRepaso.filter((item) => {
      if (!conceptos.includes(item.concepto)) return false;
      return item.tipo === 'mantenimiento' ? item.fechaRevision <= hoy : item.enFaltan <= 0;
    });
    const repasoListo = listos.find((item) => item.tipo !== 'mantenimiento') || listos[0];

    // siguiente() NO toca la cola: solo elige. Quien la modifica y guarda es actualizar() (ver
    // arriba). Esto evita el bug del bucle: el item servido se elimina en el progreso que SÍ se
    // persiste, no en este (que se descarta).
    let concepto;
    let esRepaso = false;
    let tipoRepaso = null;
    if (repasoListo) {
      concepto = repasoListo.concepto;
      esRepaso = true;
      tipoRepaso = repasoListo.tipo || 'refuerzo';
    } else {
      concepto = (progreso.conceptoActual && conceptos.includes(progreso.conceptoActual))
        ? progreso.conceptoActual
        : conceptos[0];
    }

    const elegido = this.elegirPuzzleDeConcepto(progreso, indice, concepto);
    return esRepaso ? { ...elegido, esRepaso: true, tipoRepaso } : elegido;
  },

  // Elige un puzle concreto de un concepto YA decidido, en la fase más cercana a la fase objetivo
  // del jugador para ESE concepto (evita repetir el último si hay alternativa). Extraído de
  // siguiente() (FASE M5) para que Entrenamiento del Capitán y Contrarreloj puedan pedir un puzle
  // "a la medida" de un concepto fijo sin pasar por la rotación ni la cola de repaso de Liga.
  elegirPuzzleDeConcepto(progreso, indice, concepto) {
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
