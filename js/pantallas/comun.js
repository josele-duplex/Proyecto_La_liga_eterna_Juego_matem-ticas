// Piezas compartidas por varias pantallas: limpiar el lienzo antes de pintar una pantalla nueva,
// el chip de insignia (icono/imagen + contador) y la barra superior de perfil.

function limpiarPantalla() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'lienzo'; // por defecto, tarjeta blanca; la pantalla de reto lo cambia a 'pantalla-reto'
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';
}

// Chip de insignia para la barra de perfil (icono o imagen + contador): lo comparten las
// insignias de estrategia y las de proceso, que solo se diferencian en de dónde sale la definición.
// `nivel` (FASE M1, U1, opcional: solo insignias de estrategia lo llevan) añade el brillo del
// cromo según su Nivel de Dominio — la MISMA escala 🥉🥈🥇 que se ve en el calendario, no una
// segunda taxonomía de "cromo dorado" aparte.
function crearChipInsignia(insignia, cantidad, nivel) {
  if (!insignia) return null;
  const span = document.createElement('span');
  span.title = nivel
    ? `${insignia.nombre} (x${cantidad}) · ${NIVELES_DOMINIO[nivel].nombre}`
    : `${insignia.nombre} (x${cantidad})`;
  if (nivel) span.classList.add(`cromo-nivel-${nivel}`);
  if (insignia.imagen) {
    const img = document.createElement('img');
    img.src = insignia.imagen;
    img.alt = insignia.nombre;
    img.className = 'icono-insignia';
    span.appendChild(img);
  } else {
    span.textContent = `${insignia.icono} `;
  }
  return span;
}

// Bloques de "acabas de desbloquear algo" (equipo nuevo por ir sobrado / Leyenda del Museo):
// comunes a la pantalla de victoria de Liga (FASE M3/rediseño) y al resumen de Contrarreloj (FASE
// M5), que también pueden dispararlos. Consume y limpia las variables globales de aviso pendiente
// (main.js), así solo se celebran una vez. Devuelve un array de elementos listos para añadir al panel.
function crearBloquesDesbloqueo(perfilId) {
  const bloques = [];

  if (modoRecienDesbloqueado) {
    const modo = modoRecienDesbloqueado;
    modoRecienDesbloqueado = null;

    const desbloqueo = document.createElement('div');
    desbloqueo.className = 'victoria-desbloqueo';
    const aviso = document.createElement('p');
    aviso.textContent = `¡Vas sobrado! Has desbloqueado el equipo ${modo.icono} ${modo.nombre}.`;
    desbloqueo.appendChild(aviso);
    const probar = document.createElement('button');
    probar.className = 'boton-siguiente';
    probar.textContent = `Jugar en ${modo.nombre}`;
    // FASE M7 (B.3 reducido): en vez de saltar directo al calendario, pasa antes por una ceremonia
    // de ascenso breve y celebratoria. La ceremonia es quien marca progreso.ascensosCelebrados y
    // ajusta modoId al aceptar — este botón ya no lo hace directamente.
    probar.addEventListener('click', () => mostrarCeremoniaAscenso(perfilId, modo));
    desbloqueo.appendChild(probar);
    bloques.push(desbloqueo);
  }

  if (leyendaRecienDesbloqueada) {
    const leyenda = leyendaRecienDesbloqueada;
    leyendaRecienDesbloqueada = null;

    const desbloqueoLeyenda = document.createElement('div');
    desbloqueoLeyenda.className = 'victoria-desbloqueo';
    const aviso = document.createElement('p');
    aviso.textContent = `🏛 ¡Has desbloqueado una Leyenda del Orden: ${leyenda.icono} ${leyenda.nombre}!`;
    desbloqueoLeyenda.appendChild(aviso);
    const verMuseo = document.createElement('button');
    verMuseo.className = 'boton-siguiente';
    verMuseo.textContent = 'Ver en el Museo';
    verMuseo.addEventListener('click', () => mostrarMuseo(perfilId));
    desbloqueoLeyenda.appendChild(verMuseo);
    bloques.push(desbloqueoLeyenda);
  }

  return bloques;
}

function mostrarBarraPerfil(perfilId, opciones) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progreso = Storage.cargarProgreso(perfilId);
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  // Tipografía para dislexia (FASE M8, D.6): se aplica en <html>, no en <body>, a propósito — el
  // body cambia entero de className en cada UI.aplicarTema('tema-...') de cualquier pantalla, así
  // que una clase de accesibilidad ahí se perdería en la siguiente pantalla. mostrarBarraPerfil ya
  // se llama desde CASI todas las pantallas del juego, así que es el único sitio que hace falta
  // tocar para que el ajuste se mantenga siempre, sin depender de cada pantalla nueva que se añada.
  document.documentElement.classList.toggle('modo-dislexia', !!(progreso.ajustes && progreso.ajustes.tipografiaDislexia));

  barra.appendChild(UI.crearAvatarMini(perfil));

  const texto = document.createElement('span');
  texto.className = 'barra-jugando';
  texto.textContent = `Jugando: ${perfil.nombre}`;
  barra.appendChild(texto);

  // Iconos SVG propios (FASE V1, Plan V2) en vez de emoji: se ven igual en cualquier
  // plataforma. progreso.energia/racha.dias son siempre números (nunca texto del usuario),
  // así que construir con innerHTML aquí es seguro.
  const energia = document.createElement('span');
  energia.className = 'barra-energia';
  if (opciones && opciones.brilloEnergia) energia.classList.add('brillo-energia');
  energia.innerHTML = `<img src="assets/icons-svg/rayo.svg" alt="" class="icono-svg-inline"> ${progreso.energia || 0}`;
  // Tocar la energía abre la Guía del Capi ("¿qué es esto y para qué sirve?") — salvo en mitad
  // de un reto, donde navegar fuera abandonaría la pregunta (mismo criterio que el botón Museo).
  energia.title = 'Tu energía. Toca para ver la Guía del Capi.';
  if (!(opciones && opciones.ocultarMuseo)) {
    energia.classList.add('barra-energia-tocable');
    energia.addEventListener('click', () => mostrarMuseo(perfilId, 'guia'));
  }
  barra.appendChild(energia);

  // Racha de días jugados (TG.3): solo se muestra si ya hay al menos un día contado.
  if (progreso.racha && progreso.racha.dias > 0) {
    const racha = document.createElement('span');
    racha.className = 'barra-racha';
    racha.title = `${progreso.racha.dias} ${progreso.racha.dias === 1 ? 'día seguido' : 'días seguidos'} jugando`;
    racha.innerHTML = `<img src="assets/icons-svg/llama.svg" alt="" class="icono-svg-inline"> ${progreso.racha.dias}`;
    barra.appendChild(racha);
  }

  // Modo de dificultad (FASE M5, B.7 modificado): indicador SIEMPRE visible, nunca una evaluación
  // de capacidad. Un toque alterna en círculo entre los tres modos (Élite añadida en FASE M7). El
  // copy de Profesional/Élite es LITERAL (regla del plan, sección 8): "juegas en una liga más difícil".
  const chipDificultad = document.createElement('button');
  chipDificultad.className = 'chip-dificultad';
  const TITULOS_DIFICULTAD = {
    entrenador: 'Modo Entrenador: pistas automáticas activadas.',
    profesional: 'Modo Profesional: juegas en una liga más difícil (sin pistas automáticas).',
    elite: 'Modo Élite: juegas en la liga más difícil (sin pistas automáticas).'
  };
  const pintarDificultad = () => {
    const info = MODOS_DIFICULTAD[dificultadDe(Storage.cargarProgreso(perfilId))];
    chipDificultad.textContent = `${info.icono} ${info.nombre}`;
    chipDificultad.title = TITULOS_DIFICULTAD[info.id];
  };
  pintarDificultad();
  chipDificultad.addEventListener('click', () => {
    const p = Storage.cargarProgreso(perfilId);
    alternarDificultad(p);
    Storage.guardarProgreso(perfilId, p);
    pintarDificultad();
  });
  barra.appendChild(chipDificultad);

  // El nivel de dominio (para el brillo) necesita el índice de puzles del equipo actual; si el
  // jugador todavía no ha elegido equipo (p. ej. en la propia pantalla de selección), se omite.
  const modoParaNivel = modoDe(perfilId);
  const indiceParaNivel = modoParaNivel ? indicesPorEdad[modoParaNivel.edad] : null;

  Object.keys(progreso.insignias || {}).forEach((estrategia) => {
    const nivel = indiceParaNivel ? Progression.nivelDominioEstrategia(progreso, indiceParaNivel, estrategia) : null;
    const chip = crearChipInsignia(recompensas.insignias[estrategia], progreso.insignias[estrategia], nivel);
    if (chip) barra.appendChild(chip);
  });

  // Insignias de proceso (TG.4): el CÓMO se ha jugado, no el contenido matemático.
  Object.keys(progreso.insigniasProceso || {}).forEach((clave) => {
    const chip = crearChipInsignia(recompensas.insigniasProceso[clave], progreso.insigniasProceso[clave]);
    if (chip) barra.appendChild(chip);
  });

  if (opciones && opciones.mostrarVolver) {
    const volver = document.createElement('button');
    volver.textContent = 'Volver al calendario';
    volver.addEventListener('click', () => mostrarCalendario(perfilId));
    barra.appendChild(volver);
  }

  if (modoDe(perfilId) && !(opciones && opciones.ocultarCambiarEquipo)) {
    const cambiarModo = document.createElement('button');
    cambiarModo.textContent = 'Cambiar de equipo';
    cambiarModo.addEventListener('click', () => mostrarSelectorModo(perfilId));
    barra.appendChild(cambiarModo);
  }

  // Museo de la Liga (FASE M3): consultable desde cualquier pantalla salvo durante el reto (donde
  // distraería a mitad de una pregunta) — mismo criterio que "Cambiar de equipo".
  if (!(opciones && opciones.ocultarMuseo)) {
    const museo = document.createElement('button');
    museo.textContent = '🏛 Museo';
    museo.addEventListener('click', () => mostrarMuseo(perfilId));
    barra.appendChild(museo);
  }

  // Mi Estadio (FASE M6, C.1): mismo criterio de visibilidad que el Museo (reutiliza el flag
  // ocultarMuseo en vez de añadir uno nuevo — ambos son "consulta secundaria, oculta a mitad de reto").
  if (!(opciones && opciones.ocultarMuseo)) {
    const estadio = document.createElement('button');
    estadio.textContent = '🏟️ Mi Estadio';
    estadio.addEventListener('click', () => mostrarMiEstadio(perfilId));
    barra.appendChild(estadio);
  }

  // Panel de Familia (FASE M8, D.3+D.6): mismo criterio de visibilidad que Museo/Mi Estadio.
  if (!(opciones && opciones.ocultarMuseo)) {
    const familia = document.createElement('button');
    familia.textContent = '👪 Familia';
    familia.addEventListener('click', () => mostrarPanelFamilia(perfilId));
    barra.appendChild(familia);
  }

  const sonidoBoton = document.createElement('button');
  sonidoBoton.className = 'boton-sonido';
  sonidoBoton.title = 'Activar o desactivar el sonido';
  sonidoBoton.textContent = Sonido.activo ? '🔊' : '🔇';
  sonidoBoton.addEventListener('click', () => {
    sonidoBoton.textContent = Sonido.alternar() ? '🔊' : '🔇';
  });
  barra.appendChild(sonidoBoton);

  const boton = document.createElement('button');
  boton.textContent = 'Cambiar de jugador';
  boton.addEventListener('click', () => {
    Storage.borrarPerfilActivo();
    mostrarSelectorPerfil();
  });
  barra.appendChild(boton);
}
