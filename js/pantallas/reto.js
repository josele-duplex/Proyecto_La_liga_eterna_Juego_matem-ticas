// Pantalla 4: jugar la serie de retos de un estadio. Las piezas de UI compartidas con
// Entrenamiento/Contrarreloj/Copa (poderes, tarjeta de Capi, celebración) viven en
// reto-comun.js (extraídas en FASE D3 para no pasar de las ~500 líneas por archivo).
// `especial` (opcional) es el partido especial
// del día (PARTIDOS_ESPECIALES): puede cambiar el número de retos y añade un bono si se cumple su
// condición — nunca castiga si no se cumple.
function iniciarEstadio(perfilId, estadio, especial) {
  const rival = RIVALES[Math.floor(Math.random() * RIVALES.length)];

  // Micro-historia del rival (FASE N1, Plan V2): se cuenta solo la PRIMERA vez que este "Fuera de
  // Juego" concreto aparece para este jugador, en su pantalla de presentación (rival.js).
  // progreso.rivalesConocidos se guarda ya aquí para que no se repita en partidos futuros.
  const progreso = Storage.cargarProgreso(perfilId);
  progreso.rivalesConocidos = progreso.rivalesConocidos || [];
  const esRivalNuevo = !progreso.rivalesConocidos.includes(rival.id);
  if (esRivalNuevo) {
    progreso.rivalesConocidos.push(rival.id);
    Storage.guardarProgreso(perfilId, progreso);
  }

  const sesion = {
    hechos: 0,
    total: (especial && especial.retos) || estadio.retos,
    golesRival: 0,
    rival,
    especial: especial || null,
    presentacionRival: esRivalNuevo ? rival.presentacion : null
  };
  // Presentación del rival estilo videojuego (pantalla "VS"): el partido siempre empieza viendo
  // a quién te enfrentas — un poco de nervio antes del primer reto.
  mostrarPresentacionRival(perfilId, estadio, sesion);
}

async function jugarReto(perfilId, estadio, sesion) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });
  mostrarCargaBalon();

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.siguiente(progreso, indice);
  const puzzle = await (await fetch(entrada.ruta)).json();

  // El último reto de la serie es la "jugada decisiva" (TG.1): más teatro, sin cambiar la
  // mecánica (sigue siendo un reto normal, solo se presenta con más tensión).
  const esDecisivo = sesion.hechos === sesion.total - 1;

  // Pantalla de reto como "panel de videojuego": el #app deja de ser una sola tarjeta blanca y pasa a
  // apilar paneles flotando sobre el césped (banner de estadio, cápsula de misión, zona de juego, Capi).
  const app = document.getElementById('app');
  app.innerHTML = ''; // quita el balón de carga (FASE D6)
  app.className = 'pantalla-reto';

  // FASE V2 (Plan V2): banner de estadio y cápsula de misión fusionados en UNA sola tarjeta
  // (antes eran dos tarjetas independientes, cada una con su propio padding/sombra/margen —
  // en móvil eso sobraba espacio vertical que hacía falta para que la pista cupiera sin scroll).
  const panelMision = crearPanelMision(estadio, sesion, puzzle, esDecisivo, entrada.esRepaso);
  app.appendChild(panelMision);

  const zonaJuego = document.createElement('div');
  zonaJuego.className = esDecisivo ? 'zona-juego zona-juego-decisiva' : 'zona-juego';
  app.appendChild(zonaJuego);

  const fraseInicial = esDecisivo
    ? fraseCapi('inicio_decisivo')
    : entrada.esRepaso
      ? fraseCapi('inicio_repaso')
      : fraseCapi('inicio_normal');
  const tarjetaCapi = crearTarjetaCapi(puzzle, fraseInicial);
  app.appendChild(tarjetaCapi);

  // El rival solo "marca" una vez por reto (el primer fallo), aunque el niño falle varias veces
  // probando opciones: no queremos inflar el marcador por tanteo, solo dar tensión real.
  let falloContado = false;

  const capacidades = Engine.render(
    puzzle,
    zonaJuego,
    (puzzleResuelto, resultado) => {
      const progresoActual = Storage.cargarProgreso(perfilId);
      progresoActual.ultimoPuzleId = puzzleResuelto.id;
      // FASE M4 (U4/D.1): si esta jugada era una revisión de mantenimiento que salió costosa, el
      // nivel del concepto baja de Crack a Titular dentro de actualizar() — lo detectamos
      // comparando el nivel antes/después para poder avisarlo con el copy literal correcto,
      // nunca "has olvidado".
      const nivelAntes = Progression.nivelDominioConcepto(progresoActual, puzzleResuelto.concepto);
      Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado, entrada.esRepaso, entrada.tipoRepaso);
      const cromoNecesitaEntrenar = nivelAntes === 'crack'
        && Progression.nivelDominioConcepto(progresoActual, puzzleResuelto.concepto) !== 'crack';
      Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
      const desbloqueado = revisarDesbloqueo(progresoActual);
      if (desbloqueado) modoRecienDesbloqueado = desbloqueado;
      // Museo de la Liga (FASE M3): puede desbloquear como mucho 1-2 leyendas de golpe (raro);
      // solo guardamos la primera para no saturar la pantalla de victoria con una lista larga.
      const leyendasNuevas = revisarLeyendasNuevas(progresoActual, leyendas);
      if (leyendasNuevas.length > 0) leyendaRecienDesbloqueada = leyendasNuevas[0];
      // ¿Este acierto sube la medalla del concepto? Se anuncia en el momento (el niño debe SENTIR
      // qué gana y por qué, no descubrirlo en un menú). Solo Titular/Crack: anunciar Aprendiz en
      // cada concepto nuevo sería ruido.
      const nivelDespues = Progression.nivelDominioConcepto(progresoActual, puzzleResuelto.concepto);
      const ordenNiveles = [null, 'aprendiz', 'titular', 'crack'];
      const medallaSubida = ordenNiveles.indexOf(nivelDespues) > ordenNiveles.indexOf(nivelAntes)
        && (nivelDespues === 'titular' || nivelDespues === 'crack');
      // Arquitecto del Estadio (FASE M6): puntos de reforma por dominio, no por volumen —
      // revisarPuntosReforma ya se encarga de no pagar el mismo salto de nivel dos veces.
      // Se acumulan en la sesión para ENSEÑARLOS en la victoria (antes se ganaban en silencio).
      const reformaGanada = revisarPuntosReforma(progresoActual);
      sesion.reformaGanada = (sesion.reformaGanada || 0) + reformaGanada;
      otorgarRecompensa(progresoActual, puzzleResuelto.estrategia);
      otorgarInsigniasProceso(progresoActual, puzzleResuelto, resultado);
      // Combo (mejora de jugabilidad): retos seguidos resueltos limpios (a la primera, sin
      // pistas) DENTRO del partido. A partir de 3, energía extra. Fallar solo reinicia el
      // contador: nunca quita nada.
      const fueLimpio = resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0;
      sesion.combo = fueLimpio ? (sesion.combo || 0) + 1 : 0;
      const bonusCombo = sesion.combo >= 3 ? 5 : 0;
      if (bonusCombo) progresoActual.energia += bonusCombo;
      // Contrato del Día (FASE M2, U2): si este acierto lo cumple, Capi lo celebra en vez del
      // elogio normal — es el "propósito inmediato" de la sesión, merece su propio mensaje.
      const contratoCumplidoAhora = avanzarContratoDelDia(progresoActual, puzzleResuelto);
      // Avisos de primera vez (Guía del Capi jugada): la primera energía, el primer cromo, los
      // primeros puntos de reforma o el primer combo se explican en el momento. Se dispara COMO
      // MUCHO uno por acierto (el primero pendiente de la lista): si dos cosas nuevas coinciden
      // en la misma jugada, la segunda se explica en el siguiente acierto — nunca se pierde,
      // porque la condición es "ya tienes esto" y no "acaba de aparecer justo ahora".
      // CLAVE: solo se consume (se marca visto) si de verdad va a mostrarse — si un mensaje de
      // mayor prioridad (contrato, medalla...) gana el bocadillo de Capi este turno, el aviso
      // queda pendiente para el siguiente acierto en vez de perderse en silencio.
      const hayMensajePrioritario = contratoCumplidoAhora || cromoNecesitaEntrenar || medallaSubida;
      const avisoNuevo = hayMensajePrioritario ? null
        : (progresoActual.energia > 0 && avisoPrimeraVez(progresoActual, 'energia'))
        || (Object.keys(progresoActual.insignias || {}).length > 0 && avisoPrimeraVez(progresoActual, 'cromo'))
        || (((progresoActual.reforma && progresoActual.reforma.puntos > 0) || reformaGanada > 0) && avisoPrimeraVez(progresoActual, 'reforma'))
        || (sesion.combo >= 2 && avisoPrimeraVez(progresoActual, 'combo'))
        || null;
      Storage.guardarProgreso(perfilId, progresoActual);
      Sonido.sonidoAcierto();
      celebrarAcierto(zonaJuego, recompensas.energiaPorPuzle, vocabularioDe(puzzleResuelto.estrategia));
      // Chip de combo en la tarjeta de celebración: el jugador ve la racha crecer en el momento.
      if (sesion.combo >= 2) {
        const feedback = zonaJuego.querySelector('.feedback');
        if (feedback) {
          const chipCombo = document.createElement('span');
          chipCombo.className = 'celebracion-combo';
          chipCombo.textContent = bonusCombo
            ? `🔥 ¡Combo ×${sesion.combo}! +${bonusCombo}⚡ extra`
            : `🔥 ¡Combo ×${sesion.combo}!`;
          feedback.appendChild(chipCombo);
        }
      }
      // El copy de "necesita entrenar de nuevo" es LITERAL (regla del plan, sección 8): no se
      // parafrasea ni se pasa por el banco de variantes de fraseCapi. Prioridad de mensajes de
      // Capi: contrato > cromo que necesita entrenar > medalla nueva > aviso de primera vez > elogio.
      const nombreConcepto = NOMBRES_CONCEPTO[puzzleResuelto.concepto] || puzzleResuelto.concepto;
      const mensajeCapi = contratoCumplidoAhora
        ? fraseCapi('contrato_cumplido', { bono: progresoActual.contratoDia.bonus })
        : cromoNecesitaEntrenar
          ? `Este cromo de ${nombreConcepto} necesita entrenar de nuevo. ¡Vamos a por ello!`
          : medallaSubida
            ? (nivelDespues === 'crack'
              ? `¡MEDALLA DE CRACK en ${nombreConcepto}! 🥇 Lo dominas de verdad: esto suma puntos de reforma para tu estadio.`
              : `¡Medalla de Titular en ${nombreConcepto}! 🥈 Ya lo resuelves tú solo en su nivel más alto.`)
            : avisoNuevo || fraseAcierto(resultado);
      reaccionarCapi(tarjetaCapi, 'alegria', mensajeCapi);
      mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true, brilloEnergia: true });
      // El reto ya está resuelto: los poderes dejan de poder usarse (no tiene sentido gastar
      // energía en una pregunta que ya se acertó, mientras el niño ve la celebración).
      zonaJuego.querySelectorAll('.boton-poder').forEach((b) => { b.disabled = true; });

      // Reflexión metamatemática ligera (FASE R1, Plan V2): mismo criterio que la insignia
      // "Estratega" (limpio y en fase abstracta) — deliberadamente poco frecuente, para no saturar.
      const resolucionExcepcional = resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0
        && puzzleResuelto.fase_cpa === 3;
      if (resolucionExcepcional) {
        mostrarReflexionLigera(zonaJuego, perfilId);
      }

      sesion.hechos++;
      if (sesion.hechos >= sesion.total) {
        mostrarPartidoGanado(perfilId, estadio, sesion);
      } else {
        mostrarBotonSiguiente(perfilId, estadio, sesion);
      }
    },
    () => {
      // Tras el primer fallo, Capi pasa a "duda" y anima a pedir pista (sistema de expresiones);
      // el marcador refleja la presión del rival (TG.1), pero solo cuenta el primer fallo del reto.
      // El rival "Fueras de Juego" (TG.6) da sentido narrativo al fallo: no "te equivocaste",
      // sino "te ha robado el balón" — el dato es el mismo, el envoltorio emocional es mejor.
      let fraseFallo = fraseCapi('fallo');
      if (!falloContado) {
        falloContado = true;
        sesion.golesRival++;
        const marcador = panelMision.querySelector('.marcador-partido');
        // FASE D6 (rediseño premium, auditoría §8): el tanteo "salta" en vez de cambiar en seco.
        if (marcador) {
          marcador.textContent = `${sesion.hechos} - ${sesion.golesRival}`;
          marcador.classList.remove('marcador-cambio');
          void marcador.offsetWidth;
          marcador.classList.add('marcador-cambio');
        }
        if (sesion.rival) {
          fraseFallo = fraseCapi('fallo_con_rival', { rival: sesion.rival.nombre });
          const rivalImg = panelMision.querySelector('#rival-mini-actual');
          if (rivalImg) {
            rivalImg.classList.remove('rival-ataca');
            void rivalImg.offsetWidth; // reinicia la animación
            rivalImg.classList.add('rival-ataca');
          }
          // Destello de gol rival (sensación de videojuego): un cartel breve que cruza la
          // pantalla cuando el rival marca. Solo el PRIMER fallo del reto (los reintentos no
          // vuelven a dispararlo) y nunca con "reducir movimiento" activado.
          if (!UI.prefiereMenosMovimiento()) {
            const flash = document.createElement('div');
            flash.className = 'flash-gol-rival';
            const cartel = document.createElement('div');
            cartel.className = 'flash-gol-cartel';
            const img = document.createElement('img');
            img.src = sesion.rival.imagen;
            img.alt = sesion.rival.nombre;
            const texto = document.createElement('span');
            texto.textContent = `⚽ ¡GOL de ${sesion.rival.nombre}!`;
            cartel.append(img, texto);
            flash.appendChild(cartel);
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 1400);
          }
        }
        // "Ojo del Águila" solo aparece tras el primer fallo, igual que el botón de pista.
        const ojoAguila = document.getElementById('poder-ojo-aguila');
        if (ojoAguila) ojoAguila.hidden = false;
      }
      reaccionarCapi(tarjetaCapi, 'duda', fraseFallo);
      Sonido.sonidoFallo();
    },
    () => {
      // Al pedir la primera pista, Capi da ánimos en vez de quedarse en la duda.
      reaccionarCapi(tarjetaCapi, 'animo', fraseCapi('animo'));
    },
    // Modo de dificultad (FASE M5, B.7 modificado; Élite en FASE M7): en Profesional o Élite, la
    // pista deja de aparecer sola tras fallar (sigue disponible pagando "Consejo del Capitán").
    // Nunca se toca el tiempo. Solo Entrenador conserva las pistas automáticas.
    { pistasAutomaticas: dificultadDe(progreso) === 'entrenador' }
  );

  // Cabecera "⚽ Jugada clave · Minuto N" (FASE D3, rediseño premium): Engine.render() ya limpió y
  // reconstruyó el interior de zonaJuego, así que se añade DESPUÉS, como primer hijo, para que
  // quede por encima del enunciado. "Minuto" es solo el número de reto dentro del partido —
  // cosmético, no una escala real de tiempo de fútbol.
  const cabeceraJugada = document.createElement('p');
  cabeceraJugada.className = 'zona-juego-cabecera';
  cabeceraJugada.textContent = `⚽ Jugada clave · Minuto ${sesion.hechos + 1}`;
  zonaJuego.insertBefore(cabeceraJugada, zonaJuego.firstChild);

  zonaJuego.appendChild(crearZonaPoderes(perfilId, capacidades));
}

// Panel de misión (FASE V2, Plan V2): fusiona lo que antes eran dos tarjetas — el banner de
// estadio (escudo, nombre, rival, marcador — TG.1/TG.6) y la cápsula de misión (en qué reto vas,
// concepto, fase, mini barra de progreso) — en una sola, con dos filas internas. Menos padding y
// sombra duplicados, un gap menos entre paneles: exactamente el ahorro de espacio vertical que
// hacía falta en móvil sin sacrificar ninguno de los dos contenidos. El último reto de la serie se
// presenta como "jugada decisiva" (TG.1, más teatro); un reto que vuelve de la cola de repaso
// (TG.5) lleva la etiqueta "🔁 Repaso".
function crearPanelMision(estadio, sesion, puzzle, esDecisivo, esRepaso) {
  const concepto = NOMBRES_CONCEPTO[puzzle.concepto] || puzzle.concepto;
  const panel = document.createElement('div');
  panel.className = esDecisivo ? 'capsula-mision capsula-decisiva' : 'capsula-mision';

  // Fila 1: identidad del estadio + marcador (antes "banner-estadio", ahora una fila, no una
  // tarjeta propia).
  const fila1 = document.createElement('div');
  fila1.className = 'banner-estadio';
  fila1.appendChild(UI.crearEscudo(estadio));
  const nombreEstadio = document.createElement('span');
  nombreEstadio.className = 'banner-estadio-nombre';
  nombreEstadio.textContent = `🏟 ${estadio.nombre}`;
  fila1.appendChild(nombreEstadio);

  // El rival "Fueras de Juego" de este partido (TG.6): se anima al fallar (ver jugarReto).
  if (sesion.rival) {
    const rivalImg = document.createElement('img');
    rivalImg.className = 'rival-mini';
    rivalImg.id = 'rival-mini-actual';
    rivalImg.src = sesion.rival.imagen;
    rivalImg.alt = `Fuera de Juego: ${sesion.rival.nombre}`;
    rivalImg.title = `Tu rival hoy: ${sesion.rival.nombre}`;
    fila1.appendChild(rivalImg);
  }

  const marcador = document.createElement('span');
  marcador.className = 'marcador-partido';
  marcador.title = 'Tu equipo - Rival';
  marcador.textContent = `${sesion.hechos} - ${sesion.golesRival}`;
  fila1.appendChild(marcador);
  panel.appendChild(fila1);

  // Fila 2: reto actual, concepto, fase y repaso (antes "cápsula de misión").
  const fila2 = document.createElement('div');
  fila2.className = 'capsula-linea';
  const reto = document.createElement('strong');
  reto.textContent = esDecisivo
    ? '⚡ ¡Penalti! Jugada decisiva'
    : `Reto ${sesion.hechos + 1} de ${sesion.total}`;
  const cpt = document.createElement('span');
  cpt.className = 'capsula-concepto';
  cpt.textContent = `⚽ ${concepto}`;
  fila2.appendChild(reto);
  fila2.appendChild(cpt);
  if (esRepaso && !esDecisivo) {
    const repaso = document.createElement('span');
    repaso.className = 'capsula-repaso';
    repaso.textContent = '🔁 Repaso';
    fila2.appendChild(repaso);
  }
  const fase = document.createElement('span');
  fase.className = 'capsula-fase';
  fase.textContent = `Fase ${puzzle.fase_cpa}`;
  fila2.appendChild(fase);
  panel.appendChild(fila2);

  // FASE D5 (rediseño premium, auditoría §6): la barra de progreso del partido se lee como las
  // dos partes de un encuentro real, no solo como "reto N de M" (dato ya disponible, cosmético).
  const etiquetaParte = document.createElement('span');
  etiquetaParte.className = 'etiqueta-parte';
  etiquetaParte.textContent = sesion.hechos < sesion.total / 2 ? '⚽ Primera parte' : '⚽ Segunda parte';
  panel.appendChild(etiquetaParte);

  const barra = document.createElement('div');
  barra.className = 'mini-progreso';
  for (let i = 0; i < sesion.total; i++) {
    const seg = document.createElement('span');
    seg.className = 'segmento';
    if (i < sesion.hechos) seg.classList.add('segmento-hecho');
    else if (i === sesion.hechos) seg.classList.add('segmento-actual');
    barra.appendChild(seg);
  }
  panel.appendChild(barra);

  return panel;
}

// Reflexión metamatemática ligera (FASE R1, Plan V2): un botón opcional de un solo toque que, al
// tocarlo, despliega 4 chips de opción fija (nunca texto libre ni voz). Si el niño no lo toca, no
// pasa nada — no bloquea "Siguiente reto" ni exige elegir. Deliberadamente poco frecuente: solo se
// llama a esta función tras un acierto ya excepcional (ver el resolver de Engine.render arriba).
function mostrarReflexionLigera(zonaJuego, perfilId) {
  const OPCIONES = [
    { id: 'vistazo', texto: 'Lo vi de un vistazo' },
    { id: 'estrategia', texto: 'Usé una estrategia' },
    { id: 'probando', texto: 'Fui probando' },
    { id: 'ayuda', texto: 'Pedí ayuda y por fin entendí' }
  ];

  const zona = document.createElement('div');
  zona.className = 'zona-reflexion';

  const boton = document.createElement('button');
  boton.className = 'boton-reflexion';
  boton.textContent = '🤔 ¿Cómo lo pensaste?';
  boton.addEventListener('click', () => {
    zona.innerHTML = '';
    OPCIONES.forEach((opcion) => {
      const chip = document.createElement('button');
      chip.className = 'chip-reflexion';
      chip.textContent = opcion.texto;
      chip.addEventListener('click', () => {
        const progreso = Storage.cargarProgreso(perfilId);
        Evaluacion.registrarReflexion(progreso, opcion.id);
        Storage.guardarProgreso(perfilId, progreso);
        zona.innerHTML = '';
        const gracias = document.createElement('p');
        gracias.className = 'reflexion-gracias';
        gracias.textContent = '¡Gracias por contármelo! 🌟';
        zona.appendChild(gracias);
      });
      zona.appendChild(chip);
    });
  });
  zona.appendChild(boton);

  zonaJuego.appendChild(zona);
}

function mostrarBotonSiguiente(perfilId, estadio, sesion) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';

  // El Descanso: a mitad de partido (como el descanso de un partido de verdad), el botón lleva a
  // una pausa tranquila con un truco/curiosidad/juego (data/descansos.json) antes de la segunda
  // parte. Solo una vez por partido, y solo si el partido tiene al menos 3 retos (con menos no
  // hay "mitad" que valga la pena interrumpir).
  const mitad = Math.ceil(sesion.total / 2);
  const tocaDescanso = sesion.total >= 3 && sesion.hechos === mitad && !sesion.descansoHecho;
  if (tocaDescanso) {
    sesion.descansoHecho = true;
    boton.textContent = '🥤 ¡Al descanso!';
    boton.addEventListener('click', () => mostrarDescanso(perfilId, estadio, sesion));
  } else {
    boton.textContent = '⚽ Siguiente reto';
    boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  }
  zona.appendChild(boton);
}
