// Pantalla: Copa de Leyendas (FASE M7, B.2). Serie especial de retos MIXTOS: cada ronda elige al
// azar un concepto entre los que el jugador YA domina (Titular o Crack) en su equipo actual —
// repaso variado de lo aprendido, nunca contenido nuevo. Es la manifestación concreta de la
// dificultad 🟣 Élite (14.5/14.8): "la Champions League solo la juegan los de primera división".
// Igual que Contrarreloj (FASE M5), toca SOLO el dominio del concepto de cada ronda
// (Progression.actualizarFaseDominio), nunca la rotación de conceptos ni la cola de repaso de
// Liga — jugar la Copa no debe desordenar el interleaving del modo Liga.
function iniciarCopa(perfilId) {
  const sesion = { hechos: 0, total: RONDAS_COPA, aciertos: 0, ultimoConcepto: null };
  jugarRondaCopa(perfilId, sesion);
}

function jugarRondaCopa(perfilId, sesion) {
  UI.aplicarTema('copa');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const dominados = conceptosDominadosDe(progreso, indice);

  // Red de seguridad: la tarjeta del calendario ya comprueba esto antes de ofrecer el botón, pero
  // si por lo que sea se llega aquí sin ningún concepto dominado, se vuelve al calendario sin
  // romper nada en vez de intentar elegir un puzle de una lista vacía.
  if (dominados.length === 0) {
    mostrarCalendario(perfilId);
    return;
  }

  let concepto = dominados[Math.floor(Math.random() * dominados.length)];
  if (dominados.length > 1 && concepto === sesion.ultimoConcepto) {
    const alternativas = dominados.filter((c) => c !== sesion.ultimoConcepto);
    concepto = alternativas[Math.floor(Math.random() * alternativas.length)];
  }
  sesion.ultimoConcepto = concepto;

  const entrada = Progression.elegirPuzzleDeConcepto(progreso, indice, concepto);

  fetch(entrada.ruta).then((r) => r.json()).then((puzzle) => {
    const app = document.getElementById('app');
    app.className = 'pantalla-reto';

    const panel = crearPanelCopa(sesion, concepto);
    app.appendChild(panel);

    const zonaJuego = document.createElement('div');
    zonaJuego.className = 'zona-juego';
    app.appendChild(zonaJuego);

    const fraseInicial = sesion.hechos === 0 ? fraseCapi('inicio_copa') : fraseCapi('inicio_normal');
    const tarjetaCapi = crearTarjetaCapi(puzzle, fraseInicial);
    app.appendChild(tarjetaCapi);

    const capacidades = Engine.render(
      puzzle,
      zonaJuego,
      (puzzleResuelto, resultado) => {
        const progresoActual = Storage.cargarProgreso(perfilId);
        progresoActual.ultimoPuzleId = puzzleResuelto.id;
        // Solo el dominio del concepto de ESTA ronda (fase + aciertos limpios): ver nota de
        // alcance en la cabecera del archivo.
        Progression.actualizarFaseDominio(progresoActual, indice, concepto, puzzleResuelto.fase_cpa, resultado);
        Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
        const desbloqueado = revisarDesbloqueo(progresoActual);
        if (desbloqueado) modoRecienDesbloqueado = desbloqueado;
        const leyendasNuevas = revisarLeyendasNuevas(progresoActual, leyendas);
        if (leyendasNuevas.length > 0) leyendaRecienDesbloqueada = leyendasNuevas[0];
        revisarPuntosReforma(progresoActual);
        otorgarRecompensa(progresoActual, puzzleResuelto.estrategia);
        otorgarInsigniasProceso(progresoActual, puzzleResuelto, resultado);
        avanzarContratoDelDia(progresoActual, puzzleResuelto);
        Storage.guardarProgreso(perfilId, progresoActual);

        sesion.aciertos++;
        Sonido.sonidoAcierto();
        celebrarAcierto(zonaJuego, recompensas.energiaPorPuzle, vocabularioDe(puzzleResuelto.estrategia));
        reaccionarCapi(tarjetaCapi, 'alegria', fraseAcierto(resultado));
        mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true, brilloEnergia: true });
        zonaJuego.querySelectorAll('.boton-poder').forEach((b) => { b.disabled = true; });

        sesion.hechos++;
        if (sesion.hechos >= sesion.total) {
          mostrarResumenCopa(perfilId, sesion);
        } else {
          mostrarBotonSiguienteCopa(perfilId, sesion);
        }
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'duda', fraseCapi('fallo'));
        Sonido.sonidoFallo();
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'animo', fraseCapi('animo'));
      },
      // Igual que Liga/Contrarreloj: Profesional y Élite quitan las pistas automáticas.
      { pistasAutomaticas: dificultadDe(progreso) === 'entrenador' }
    );

    zonaJuego.appendChild(crearZonaPoderes(perfilId, capacidades));
  });
}

function crearPanelCopa(sesion, concepto) {
  const panel = document.createElement('div');
  panel.className = 'capsula-mision capsula-copa';

  const fila = document.createElement('div');
  fila.className = 'capsula-linea';
  const titulo = document.createElement('strong');
  titulo.textContent = '🏆 Copa de Leyendas';
  const badge = document.createElement('span');
  badge.className = 'badge-elite';
  badge.textContent = '🟣 Élite';
  fila.append(titulo, badge);
  panel.appendChild(fila);

  const linea2 = document.createElement('div');
  linea2.className = 'capsula-linea';
  const ronda = document.createElement('span');
  ronda.className = 'capsula-concepto';
  ronda.textContent = `Ronda ${sesion.hechos + 1} de ${sesion.total} · ⚽ ${NOMBRES_CONCEPTO[concepto] || concepto}`;
  linea2.appendChild(ronda);
  panel.appendChild(linea2);

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

function mostrarBotonSiguienteCopa(perfilId, sesion) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '🏆 Siguiente reto de la Copa';
  boton.addEventListener('click', () => jugarRondaCopa(perfilId, sesion));
  zona.appendChild(boton);
}

function mostrarResumenCopa(perfilId, sesion) {
  UI.aplicarTema('recompensa');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });
  document.getElementById('app').className = 'lienzo';
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const perfil = PERFILES.find((p) => p.id === perfilId);

  // Vitrina de trofeos: cada Copa superada suma al palmarés (Sala de Trofeos del Museo).
  const progresoTrofeos = Storage.cargarProgreso(perfilId);
  progresoTrofeos.trofeos = progresoTrofeos.trofeos || { partidos: 0, copas: 0, contrarrelojes: 0 };
  progresoTrofeos.trofeos.copas++;
  Storage.guardarProgreso(perfilId, progresoTrofeos);

  const panel = document.createElement('div');
  panel.className = 'panel-victoria';

  const cabecera = document.createElement('div');
  cabecera.className = 'victoria-cabecera';
  const trofeo = document.createElement('span');
  trofeo.className = 'victoria-trofeo';
  trofeo.textContent = '🏆';
  const titulo = document.createElement('h2');
  titulo.className = 'victoria-titulo';
  titulo.textContent = '¡COPA DE LEYENDAS SUPERADA!';
  cabecera.append(trofeo, titulo);
  panel.appendChild(cabecera);

  const sub = document.createElement('p');
  sub.className = 'victoria-sub';
  sub.textContent = perfil
    ? `¡Nivel Élite, ${perfil.nombre}! ${sesion.aciertos} de ${sesion.total} retos acertados.`
    : `${sesion.aciertos} de ${sesion.total} retos acertados.`;
  panel.appendChild(sub);

  const grupo = document.createElement('div');
  grupo.className = 'grupo-victoria';
  if (perfil && perfil.avatarCelebrando) {
    const jugador = document.createElement('img');
    jugador.className = 'avatar-victoria';
    jugador.src = perfil.avatarCelebrando;
    jugador.alt = `${perfil.nombre} celebra`;
    grupo.appendChild(jugador);
  }
  const capi = document.createElement('img');
  capi.className = 'capi-victoria';
  capi.src = 'assets/img/capi/avatar-capi-alegria.webp';
  capi.alt = '¡Capi celebra contigo!';
  grupo.appendChild(capi);
  panel.appendChild(grupo);

  const premios = document.createElement('div');
  premios.className = 'victoria-premios';
  const energiaGanada = sesion.aciertos * recompensas.energiaPorPuzle;
  const premioEnergia = document.createElement('span');
  premioEnergia.className = 'premio';
  premioEnergia.innerHTML = `<strong><img src="assets/icons-svg/rayo.svg" alt="" class="icono-svg-inline"> +${energiaGanada}</strong> energía`;
  premios.appendChild(premioEnergia);
  panel.appendChild(premios);

  crearBloquesDesbloqueo(perfilId).forEach((bloque) => panel.appendChild(bloque));

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '🏟 Volver al calendario';
  boton.addEventListener('click', () => mostrarCalendario(perfilId));
  panel.appendChild(boton);

  zona.appendChild(panel);
  Sonido.sonidoVictoria();
  UI.celebrarVictoria(panel);
}
