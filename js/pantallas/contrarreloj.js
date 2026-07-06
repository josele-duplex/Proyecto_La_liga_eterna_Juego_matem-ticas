// Pantalla: Contrarreloj (FASE M5, 14.5). Formaliza el juego "Relámpago" (tipo verdadero_falso,
// con su cronómetro visible desde TG.7) como su propio modo opt-in: una serie fija de rondas,
// SIEMPRE del concepto 'relampago', con identidad visual propia (tema eléctrico morado, distinto
// de Liga/Entrenamiento/victoria). Da energía e insignias igual que Liga (incluida "Rayo del
// Relámpago" por rapidez), y actualiza el dominio de 'relampago' — pero solo su fase y sus
// aciertos limpios (Progression.actualizarFaseDominio), NUNCA la rotación de conceptos ni la cola
// de repaso de Liga, que son de otro modo y no deben verse arrastradas por partidas de aquí.
//
// Nota de alcance (desviación señalada, ver memoria del proyecto): el plan describe Contrarreloj
// como "el único lugar donde se premia la velocidad". No se ha retirado la insignia "Rayo del
// Relámpago" de las rondas de 'relampago' que ya salían dentro de la rotación normal de Liga —
// hacerlo habría significado reescribir el sistema de recompensas ya existente, en contra de la
// regla de la sección 1 del plan ("ninguna fase debe reescribir estos sistemas, solo extenderlos").
// Contrarreloj SÍ es el modo dedicado y opt-in que la fase pedía; restringir del todo esa insignia
// a este modo queda como posible mejora futura si se decide explícitamente.
function iniciarContrarreloj(perfilId) {
  const sesion = { hechos: 0, total: RONDAS_CONTRARRELOJ, aciertos: 0 };
  jugarRondaContrarreloj(perfilId, sesion);
}

function jugarRondaContrarreloj(perfilId, sesion) {
  UI.aplicarTema('contrarreloj');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.elegirPuzzleDeConcepto(progreso, indice, 'relampago');

  fetch(entrada.ruta).then((r) => r.json()).then((puzzle) => {
    const app = document.getElementById('app');
    app.className = 'pantalla-reto';

    const panel = crearPanelContrarreloj(sesion);
    app.appendChild(panel);

    const zonaJuego = document.createElement('div');
    zonaJuego.className = 'zona-juego';
    app.appendChild(zonaJuego);

    const fraseInicial = sesion.hechos === 0 ? fraseCapi('inicio_contrarreloj') : fraseCapi('inicio_normal');
    const tarjetaCapi = crearTarjetaCapi(puzzle, fraseInicial);
    app.appendChild(tarjetaCapi);

    const capacidades = Engine.render(
      puzzle,
      zonaJuego,
      (puzzleResuelto, resultado) => {
        const progresoActual = Storage.cargarProgreso(perfilId);
        progresoActual.ultimoPuzleId = puzzleResuelto.id;
        // Solo el dominio de 'relampago' (fase + aciertos limpios): ver nota de alcance arriba.
        Progression.actualizarFaseDominio(progresoActual, indice, 'relampago', puzzleResuelto.fase_cpa, resultado);
        Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
        const desbloqueado = revisarDesbloqueo(progresoActual);
        if (desbloqueado) modoRecienDesbloqueado = desbloqueado;
        const leyendasNuevas = revisarLeyendasNuevas(progresoActual, leyendas);
        if (leyendasNuevas.length > 0) leyendaRecienDesbloqueada = leyendasNuevas[0];
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
          mostrarResumenContrarreloj(perfilId, sesion);
        } else {
          mostrarBotonSiguienteContrarreloj(perfilId, sesion);
        }
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'duda', fraseCapi('fallo'));
        Sonido.sonidoFallo();
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'animo', fraseCapi('animo'));
      },
      { pistasAutomaticas: dificultadDe(progreso) !== 'profesional' }
    );

    zonaJuego.appendChild(crearZonaPoderes(perfilId, capacidades));
  });
}

function crearPanelContrarreloj(sesion) {
  const panel = document.createElement('div');
  panel.className = 'capsula-mision capsula-contrarreloj';

  const fila = document.createElement('div');
  fila.className = 'capsula-linea';
  const titulo = document.createElement('strong');
  titulo.textContent = '⚡ Contrarreloj';
  const ronda = document.createElement('span');
  ronda.className = 'capsula-concepto';
  ronda.textContent = `Ronda ${sesion.hechos + 1} de ${sesion.total}`;
  fila.append(titulo, ronda);
  panel.appendChild(fila);

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

function mostrarBotonSiguienteContrarreloj(perfilId, sesion) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '⚡ Siguiente ronda';
  boton.addEventListener('click', () => jugarRondaContrarreloj(perfilId, sesion));
  zona.appendChild(boton);
}

function mostrarResumenContrarreloj(perfilId, sesion) {
  UI.aplicarTema('recompensa');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });
  document.getElementById('app').className = 'lienzo';
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const perfil = PERFILES.find((p) => p.id === perfilId);

  const panel = document.createElement('div');
  panel.className = 'panel-victoria';

  const cabecera = document.createElement('div');
  cabecera.className = 'victoria-cabecera';
  const rayo = document.createElement('span');
  rayo.className = 'victoria-trofeo';
  rayo.textContent = '⚡';
  const titulo = document.createElement('h2');
  titulo.className = 'victoria-titulo';
  titulo.textContent = '¡CONTRARRELOJ SUPERADO!';
  cabecera.append(rayo, titulo);
  panel.appendChild(cabecera);

  const sub = document.createElement('p');
  sub.className = 'victoria-sub';
  sub.textContent = perfil
    ? `¡Vaya reflejos, ${perfil.nombre}! ${sesion.aciertos} de ${sesion.total} rondas acertadas.`
    : `${sesion.aciertos} de ${sesion.total} rondas acertadas.`;
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
