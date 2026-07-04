// Pantalla 4: jugar la serie de retos de un estadio.
function iniciarEstadio(perfilId, estadio) {
  const rival = RIVALES[Math.floor(Math.random() * RIVALES.length)];

  // Micro-historia del rival (FASE N1, Plan V2): Capi la cuenta solo la PRIMERA vez que este
  // "Fuera de Juego" concreto aparece para este jugador. progreso.rivalesConocidos se guarda ya
  // aquí (antes de jugar ningún reto) para que no se repita en partidos futuros con el mismo rival.
  const progreso = Storage.cargarProgreso(perfilId);
  progreso.rivalesConocidos = progreso.rivalesConocidos || [];
  const esRivalNuevo = !progreso.rivalesConocidos.includes(rival.id);
  if (esRivalNuevo) {
    progreso.rivalesConocidos.push(rival.id);
    Storage.guardarProgreso(perfilId, progreso);
  }

  const sesion = {
    hechos: 0, total: estadio.retos, golesRival: 0, rival,
    presentacionRival: esRivalNuevo ? rival.presentacion : null
  };
  jugarReto(perfilId, estadio, sesion);
}

async function jugarReto(perfilId, estadio, sesion) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });

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
  app.className = 'pantalla-reto';

  // FASE V2 (Plan V2): banner de estadio y cápsula de misión fusionados en UNA sola tarjeta
  // (antes eran dos tarjetas independientes, cada una con su propio padding/sombra/margen —
  // en móvil eso sobraba espacio vertical que hacía falta para que la pista cupiera sin scroll).
  const panelMision = crearPanelMision(estadio, sesion, puzzle, esDecisivo, entrada.esRepaso);
  app.appendChild(panelMision);

  const zonaJuego = document.createElement('div');
  zonaJuego.className = esDecisivo ? 'zona-juego zona-juego-decisiva' : 'zona-juego';
  app.appendChild(zonaJuego);

  const tarjetaCapi = crearTarjetaCapi(puzzle, esDecisivo, entrada.esRepaso);
  // Micro-historia del rival (FASE N1): solo en el primer reto del partido y solo si es la
  // primera vez que aparece este rival — sustituye al mensaje de inicio normal, una vez.
  if (sesion.hechos === 0 && sesion.presentacionRival) {
    const bocadilloInicial = tarjetaCapi.querySelector('#capi-bocadillo');
    if (bocadilloInicial) bocadilloInicial.textContent = sesion.presentacionRival;
  }
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
      Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado, entrada.esRepaso);
      Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
      const desbloqueado = revisarDesbloqueo(progresoActual);
      if (desbloqueado) modoRecienDesbloqueado = desbloqueado;
      // Museo de la Liga (FASE M3): puede desbloquear como mucho 1-2 leyendas de golpe (raro);
      // solo guardamos la primera para no saturar la pantalla de victoria con una lista larga.
      const leyendasNuevas = revisarLeyendasNuevas(progresoActual, leyendas);
      if (leyendasNuevas.length > 0) leyendaRecienDesbloqueada = leyendasNuevas[0];
      otorgarRecompensa(progresoActual, puzzleResuelto.estrategia);
      otorgarInsigniasProceso(progresoActual, puzzleResuelto, resultado);
      // Contrato del Día (FASE M2, U2): si este acierto lo cumple, Capi lo celebra en vez del
      // elogio normal — es el "propósito inmediato" de la sesión, merece su propio mensaje.
      const contratoCumplidoAhora = avanzarContratoDelDia(progresoActual, puzzleResuelto);
      Storage.guardarProgreso(perfilId, progresoActual);
      Sonido.sonidoAcierto();
      celebrarAcierto(zonaJuego, recompensas.energiaPorPuzle, vocabularioDe(puzzleResuelto.estrategia));
      const mensajeCapi = contratoCumplidoAhora
        ? fraseCapi('contrato_cumplido', { bono: progresoActual.contratoDia.bonus })
        : fraseAcierto(resultado);
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
        if (marcador) marcador.textContent = `${sesion.hechos} - ${sesion.golesRival}`;
        if (sesion.rival) {
          fraseFallo = fraseCapi('fallo_con_rival', { rival: sesion.rival.nombre });
          const rivalImg = panelMision.querySelector('#rival-mini-actual');
          if (rivalImg) {
            rivalImg.classList.remove('rival-ataca');
            void rivalImg.offsetWidth; // reinicia la animación
            rivalImg.classList.add('rival-ataca');
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
    }
  );

  zonaJuego.appendChild(crearZonaPoderes(perfilId, capacidades));
}

// Panel de poderes (TG.7): gastar energía en ayudas que nunca revelan la respuesta directa.
// "Ojo del Águila" solo existe para opción múltiple (lo añade engine.js) y empieza oculto hasta
// el primer fallo; "Consejo del Capitán" está siempre disponible; "Tiempo Extra" solo existe en
// Relámpago (cronómetro de renderVerdaderoFalso). Cada poder se paga solo si tuvo efecto real.
function crearZonaPoderes(perfilId, capacidades) {
  const zona = document.createElement('div');
  zona.className = 'zona-poderes';

  const crearBoton = (poder, id, alUsar) => {
    const boton = document.createElement('button');
    boton.id = id;
    boton.className = 'boton-poder';
    const textoNormal = `${poder.icono} ${poder.nombre} (-${poder.costo}⚡)`;
    boton.textContent = textoNormal;

    boton.addEventListener('click', () => {
      const progreso = Storage.cargarProgreso(perfilId);
      if ((progreso.energia || 0) < poder.costo) {
        boton.textContent = 'Te falta energía ⚡';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      if (alUsar() === false) {
        boton.textContent = 'No hace falta aquí';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      progreso.energia -= poder.costo;
      Storage.guardarProgreso(perfilId, progreso);
      mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });
      boton.disabled = true;
      boton.classList.add('boton-poder-usado');
    });

    zona.appendChild(boton);
    return boton;
  };

  if (capacidades.usarOjoAguila) {
    const boton = crearBoton(PODERES.ojo_aguila, 'poder-ojo-aguila', capacidades.usarOjoAguila);
    boton.hidden = true;
  }

  crearBoton(PODERES.consejo_capitan, 'poder-consejo-capitan', capacidades.usarConsejoCapitan);

  if (capacidades.usarTiempoExtra) {
    crearBoton(PODERES.tiempo_extra, 'poder-tiempo-extra', () => capacidades.usarTiempoExtra(PODERES.tiempo_extra.segundos));
  }

  return zona;
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

// Tarjeta del entrenador Capi: retrato grande, bocadillo y botón para escuchar el enunciado.
// En la jugada decisiva (TG.1) el primer mensaje sube la tensión; en un repaso (TG.5) avisa de
// que es un refuerzo, no un reto nuevo (la decisiva manda si coinciden, es más rara y más teatral).
function crearTarjetaCapi(puzzle, esDecisivo, esRepaso) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-capi';

  const img = document.createElement('img');
  img.id = 'avatar-capi-actual';
  img.className = 'capi-retrato';
  img.src = 'assets/img/capi/avatar-capi-concentracion.webp';
  img.alt = 'Capi, tu entrenador';
  tarjeta.appendChild(img);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'capi-cuerpo';

  const bocadillo = document.createElement('p');
  bocadillo.id = 'capi-bocadillo';
  bocadillo.className = 'bocadillo-capi';
  if (esDecisivo) {
    bocadillo.textContent = fraseCapi('inicio_decisivo');
  } else if (esRepaso) {
    bocadillo.textContent = fraseCapi('inicio_repaso');
  } else {
    bocadillo.textContent = fraseCapi('inicio_normal');
  }
  cuerpo.appendChild(bocadillo);

  const boton = document.createElement('button');
  boton.className = 'boton-voz';
  boton.textContent = '🔊 Escuchar';
  boton.addEventListener('click', () => Sonido.decirVoz(puzzle.enunciado.voz));
  cuerpo.appendChild(boton);

  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

// Cambia la pose y el bocadillo de Capi según lo que pasa, con un pequeño rebote.
function reaccionarCapi(tarjeta, estado, frase) {
  const poses = { normal: 'concentracion', duda: 'duda', alegria: 'alegria', animo: 'animo' };
  const img = tarjeta.querySelector('#avatar-capi-actual');
  const bocadillo = tarjeta.querySelector('#capi-bocadillo');
  if (img) img.src = `assets/img/capi/avatar-capi-${poses[estado] || 'concentracion'}.webp`;
  if (bocadillo) bocadillo.textContent = frase;
  tarjeta.classList.remove('capi-rebote');
  void tarjeta.offsetWidth; // reinicia la animación
  tarjeta.classList.add('capi-rebote');
}

// Convierte el feedback de acierto en una tarjeta de celebración con la energía ganada. Nombra la
// estrategia con su vocabulario técnico real (FASE M1, A.5: "Has usado DESCOMPOSICIÓN") en vez de
// un genérico "¡Muy bien!" — construye lenguaje matemático transferible fuera del juego.
function celebrarAcierto(zonaJuego, energia, vocabulario) {
  const feedback = zonaJuego.querySelector('.feedback');
  if (!feedback) return;
  feedback.className = 'feedback feedback-correcto celebracion';
  feedback.innerHTML = '';
  const titulo = document.createElement('span');
  titulo.className = 'celebracion-titulo';
  titulo.textContent = '⚽ ¡Golazo!';
  const sub = document.createElement('span');
  sub.className = 'celebracion-sub';
  sub.textContent = vocabulario ? `Has usado ${vocabulario}` : '¡Muy bien! Has acertado.';
  const en = document.createElement('span');
  en.className = 'celebracion-energia';
  en.textContent = `+${energia} energía`;
  feedback.append(titulo, sub, en);
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
  boton.textContent = '⚽ Siguiente reto';
  boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  zona.appendChild(boton);
}
