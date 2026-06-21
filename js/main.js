// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment).

const PERFILES = [
  { id: 'pepe', nombre: 'Pepe', avatar: 'assets/img/avatar-pepe.webp' },
  { id: 'bruno', nombre: 'Bruno', avatar: 'assets/img/avatar-bruno.webp' },
  { id: 'david', nombre: 'David', avatar: 'assets/img/avatar-david.webp' },
  { id: 'invitado-1', nombre: 'Invitado 1' },
  { id: 'invitado-2', nombre: 'Invitado 2' },
  { id: 'invitado-3', nombre: 'Invitado 3' }
];

// Modos de juego (cada jugador elige el suyo, no viene fijado). 'edad' apunta al banco de puzles.
const MODOS = [
  {
    id: 'promesas',
    nombre: 'Promesas',
    icono: '🌱',
    descripcion: 'Da tus primeros toques: reconoce cantidades, compara y completa 10.',
    edad: '6-anios'
  },
  {
    id: 'estrellas',
    nombre: 'Estrellas',
    icono: '⭐',
    descripcion: 'Juega como un crack: descomposición, dobles, casi-dobles y recta numérica.',
    edad: '8-anios'
  },
  {
    id: 'leyendas',
    nombre: 'Leyendas',
    icono: '🏆',
    descripcion: 'El equipo de los más grandes: multiplicación, fracciones y redondeo.',
    edad: '9-anios',
    desbloqueadoPor: 'estrellas'
  }
];

// Nombres bonitos para mostrar el concepto en pantalla.
const NOMBRES_CONCEPTO = {
  descomposicion: 'descomposición',
  recta_numerica: 'recta numérica',
  subitizacion: 'reconocer cantidades',
  comparar: 'comparar',
  completar_diez: 'completar diez',
  dobles: 'dobles',
  casi_dobles: 'casi-dobles',
  multiplicacion: 'multiplicación',
  fracciones: 'fracciones',
  redondeo: 'redondeo'
};

let indicesPorEdad = {};
let calendario = null;
let recompensas = null;

async function arrancar() {
  Sonido.cargarPreferencia();
  indicesPorEdad['6-anios'] = await (await fetch('data/puzzles/6-anios/indice.json')).json();
  indicesPorEdad['8-anios'] = await (await fetch('data/puzzles/8-anios/indice.json')).json();
  indicesPorEdad['9-anios'] = await (await fetch('data/puzzles/9-anios/indice.json')).json();
  calendario = await (await fetch('data/estadios.json')).json();
  recompensas = await (await fetch('data/recompensas.json')).json();

  const perfilActivo = Storage.cargarPerfilActivo();
  if (perfilActivo && modoDe(perfilActivo)) {
    mostrarCalendario(perfilActivo);
  } else if (perfilActivo) {
    mostrarSelectorModo(perfilActivo);
  } else {
    mostrarSelectorPerfil();
  }
}

// Devuelve el modo guardado del jugador (o null si todavía no ha elegido ninguno).
function modoDe(perfilId) {
  const progreso = Storage.cargarProgreso(perfilId);
  return MODOS.find((m) => m.id === progreso.modoId) || null;
}

// Un modo está disponible si no necesita desbloqueo, o si el jugador ya lo ha desbloqueado.
// El disparador que desbloquea (dominar el modo anterior por repetición o rapidez) llegará en T3.3.
function modoDesbloqueado(perfilId, modo) {
  if (!modo.desbloqueadoPor) return true;
  const progreso = Storage.cargarProgreso(perfilId);
  return (progreso.modosDesbloqueados || []).includes(modo.id);
}

// --- Pantalla 1: elegir jugador ---
function mostrarSelectorPerfil() {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  document.getElementById('barra-perfil').innerHTML = '';

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿Quién juega?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'opciones';
  PERFILES.forEach((perfil) => {
    const boton = document.createElement('button');
    boton.className = 'opcion boton-perfil';
    boton.appendChild(UI.crearAvatarPerfil(perfil));
    const nombre = document.createElement('span');
    nombre.textContent = perfil.nombre;
    boton.appendChild(nombre);
    boton.addEventListener('click', () => {
      Storage.guardarPerfilActivo(perfil.id);
      mostrarSelectorModo(perfil.id);
    });
    lista.appendChild(boton);
  });
  app.appendChild(lista);
}

// --- Pantalla 2: elegir modo de juego (Promesas / Estrellas) ---
function mostrarSelectorModo(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿En qué equipo juegas hoy?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  MODOS.forEach((modo) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    const desbloqueado = modoDesbloqueado(perfilId, modo);

    const nombre = document.createElement('h2');
    nombre.textContent = desbloqueado ? `${modo.icono} ${modo.nombre}` : `🔒 ${modo.nombre}`;
    tarjeta.appendChild(nombre);

    const desc = document.createElement('p');
    desc.textContent = modo.descripcion;
    tarjeta.appendChild(desc);

    if (desbloqueado) {
      const elegir = document.createElement('button');
      elegir.className = 'boton-siguiente';
      elegir.textContent = 'Jugar en este equipo';
      elegir.addEventListener('click', () => {
        const progreso = Storage.cargarProgreso(perfilId);
        progreso.modoId = modo.id;
        Storage.guardarProgreso(perfilId, progreso);
        mostrarCalendario(perfilId);
      });
      tarjeta.appendChild(elegir);
    } else {
      tarjeta.classList.add('estadio-bloqueado');
      const candado = document.createElement('p');
      candado.className = 'aviso-bloqueado';
      const requisito = MODOS.find((m) => m.id === modo.desbloqueadoPor);
      candado.textContent = `Domina el equipo ${requisito ? requisito.nombre : 'anterior'} para desbloquearlo.`;
      tarjeta.appendChild(candado);
    }

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}

// --- Pantalla 3: calendario de la Liga (elegir estadio) ---
function mostrarCalendario(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const modo = modoDe(perfilId) || MODOS[0];
  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = `Calendario de la Liga — ${modo.icono} ${modo.nombre}`;
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  calendario.estadios.forEach((estadio) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    tarjeta.appendChild(UI.crearEscudo(estadio));

    const nombre = document.createElement('h2');
    nombre.textContent = estadio.nombre;
    tarjeta.appendChild(nombre);

    const desc = document.createElement('p');
    desc.textContent = estadio.descripcion;
    tarjeta.appendChild(desc);

    const jugar = document.createElement('button');
    jugar.className = 'boton-siguiente';
    jugar.textContent = 'Jugar partido';
    jugar.addEventListener('click', () => iniciarEstadio(perfilId, estadio));
    tarjeta.appendChild(jugar);

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}

// --- Pantalla 4: jugar la serie de retos de un estadio ---
function iniciarEstadio(perfilId, estadio) {
  const sesion = { hechos: 0, total: estadio.retos };
  jugarReto(perfilId, estadio, sesion);
}

async function jugarReto(perfilId, estadio, sesion) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.siguiente(progreso, indice);
  const puzzle = await (await fetch(entrada.ruta)).json();
  const app = document.getElementById('app');

  mostrarRetoActual(puzzle, sesion);

  Engine.render(
    puzzle,
    app,
    (puzzleResuelto, resultado) => {
      const progresoActual = Storage.cargarProgreso(perfilId);
      progresoActual.ultimoPuzleId = puzzleResuelto.id;
      Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado);
      otorgarRecompensa(progresoActual, puzzleResuelto.estrategia);
      Storage.guardarProgreso(perfilId, progresoActual);
      Sonido.sonidoAcierto();
      mostrarBarraPerfil(perfilId, { mostrarVolver: true });

      sesion.hechos++;
      if (sesion.hechos >= sesion.total) {
        mostrarPartidoGanado(perfilId, estadio);
      } else {
        mostrarBotonSiguiente(perfilId, estadio, sesion);
      }
    },
    () => Sonido.sonidoFallo()
  );

  mostrarBotonVoz(app, puzzle);
}

function mostrarBotonVoz(app, puzzle) {
  const fila = document.createElement('div');
  fila.className = 'fila-voz';

  const avatarCapi = document.createElement('img');
  avatarCapi.className = 'avatar-capi';
  avatarCapi.src = 'assets/img/avatar-capi.webp';
  avatarCapi.alt = 'Capi';
  fila.appendChild(avatarCapi);

  const boton = document.createElement('button');
  boton.className = 'boton-voz';
  boton.textContent = '🔊 Escuchar al entrenador';
  boton.addEventListener('click', () => Sonido.decirVoz(puzzle.enunciado.voz));
  fila.appendChild(boton);

  app.insertBefore(fila, app.firstChild);
}

function mostrarBotonSiguiente(perfilId, estadio, sesion) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente';
  boton.textContent = 'Siguiente reto →';
  boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  zona.appendChild(boton);
}

function mostrarPartidoGanado(perfilId, estadio) {
  UI.aplicarTema('recompensa');
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const mensaje = document.createElement('p');
  mensaje.className = 'feedback feedback-correcto';
  mensaje.textContent = `¡Partido ganado en ${estadio.nombre}!`;
  zona.appendChild(mensaje);

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente';
  boton.textContent = 'Volver al calendario';
  boton.addEventListener('click', () => mostrarCalendario(perfilId));
  zona.appendChild(boton);

  Sonido.sonidoVictoria();
  UI.celebrarVictoria(zona);
}

function mostrarRetoActual(puzzle, sesion) {
  const concepto = NOMBRES_CONCEPTO[puzzle.concepto] || puzzle.concepto;
  document.getElementById('progreso').textContent =
    `Reto ${sesion.hechos + 1} de ${sesion.total} · ${concepto} · fase ${puzzle.fase_cpa}`;
}

// Da energía y, según la estrategia usada, una insignia distinta. Modifica el progreso recibido.
function otorgarRecompensa(progreso, estrategia) {
  progreso.energia = (progreso.energia || 0) + recompensas.energiaPorPuzle;
  if (recompensas.insignias[estrategia]) {
    progreso.insignias = progreso.insignias || {};
    progreso.insignias[estrategia] = (progreso.insignias[estrategia] || 0) + 1;
  }
}

function mostrarBarraPerfil(perfilId, opciones) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progreso = Storage.cargarProgreso(perfilId);
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  barra.appendChild(UI.crearAvatarMini(perfil));

  const texto = document.createElement('span');
  texto.textContent = `Jugando: ${perfil.nombre} — ⚡ ${progreso.energia || 0} — `;
  barra.appendChild(texto);

  Object.keys(progreso.insignias || {}).forEach((estrategia) => {
    const insignia = recompensas.insignias[estrategia];
    if (!insignia) return;
    const span = document.createElement('span');
    span.title = `${insignia.nombre} (x${progreso.insignias[estrategia]})`;
    if (insignia.imagen) {
      const img = document.createElement('img');
      img.src = insignia.imagen;
      img.alt = insignia.nombre;
      img.className = 'icono-insignia';
      span.appendChild(img);
    } else {
      span.textContent = `${insignia.icono} `;
    }
    barra.appendChild(span);
  });

  if (opciones && opciones.mostrarVolver) {
    const volver = document.createElement('button');
    volver.textContent = 'Volver al calendario';
    volver.addEventListener('click', () => mostrarCalendario(perfilId));
    barra.appendChild(volver);
  }

  if (modoDe(perfilId)) {
    const cambiarModo = document.createElement('button');
    cambiarModo.textContent = 'Cambiar de equipo';
    cambiarModo.addEventListener('click', () => mostrarSelectorModo(perfilId));
    barra.appendChild(cambiarModo);
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

function limpiarPantalla() {
  document.getElementById('app').innerHTML = '';
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';
}

arrancar();
