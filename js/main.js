// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment).

const PERFILES = [
  { id: 'pepe', nombre: 'Pepe' },
  { id: 'bruno', nombre: 'Bruno' },
  { id: 'invitado-1', nombre: 'Invitado 1' },
  { id: 'invitado-2', nombre: 'Invitado 2' },
  { id: 'invitado-3', nombre: 'Invitado 3' }
];

// Nombres bonitos para mostrar el concepto en pantalla.
const NOMBRES_CONCEPTO = {
  descomposicion: 'descomposición',
  recta_numerica: 'recta numérica'
};

let indice = null;
let calendario = null;

async function arrancar() {
  indice = await (await fetch('data/puzzles/8-anios/indice.json')).json();
  calendario = await (await fetch('data/estadios.json')).json();

  const perfilActivo = Storage.cargarPerfilActivo();
  if (perfilActivo) {
    mostrarCalendario(perfilActivo);
  } else {
    mostrarSelectorPerfil();
  }
}

// --- Pantalla 1: elegir jugador ---
function mostrarSelectorPerfil() {
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
    boton.className = 'opcion';
    boton.textContent = perfil.nombre;
    boton.addEventListener('click', () => {
      Storage.guardarPerfilActivo(perfil.id);
      mostrarCalendario(perfil.id);
    });
    lista.appendChild(boton);
  });
  app.appendChild(lista);
}

// --- Pantalla 2: calendario de la Liga (elegir estadio) ---
function mostrarCalendario(perfilId) {
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = 'Calendario de la Liga';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  calendario.estadios.forEach((estadio) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

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

// --- Pantalla 3: jugar la serie de retos de un estadio ---
function iniciarEstadio(perfilId, estadio) {
  const sesion = { hechos: 0, total: estadio.retos };
  jugarReto(perfilId, estadio, sesion);
}

async function jugarReto(perfilId, estadio, sesion) {
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.siguiente(progreso, indice);
  const puzzle = await (await fetch(entrada.ruta)).json();
  const app = document.getElementById('app');

  mostrarRetoActual(puzzle, sesion);

  Engine.render(puzzle, app, (puzzleResuelto, resultado) => {
    const progresoActual = Storage.cargarProgreso(perfilId);
    progresoActual.ultimoPuzleId = puzzleResuelto.id;
    Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado);
    Storage.guardarProgreso(perfilId, progresoActual);

    sesion.hechos++;
    if (sesion.hechos >= sesion.total) {
      mostrarPartidoGanado(perfilId, estadio);
    } else {
      mostrarBotonSiguiente(perfilId, estadio, sesion);
    }
  });
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
}

function mostrarRetoActual(puzzle, sesion) {
  const concepto = NOMBRES_CONCEPTO[puzzle.concepto] || puzzle.concepto;
  document.getElementById('progreso').textContent =
    `Reto ${sesion.hechos + 1} de ${sesion.total} · ${concepto} · fase ${puzzle.fase_cpa}`;
}

function mostrarBarraPerfil(perfilId, opciones) {
  const nombrePerfil = PERFILES.find((perfil) => perfil.id === perfilId).nombre;
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  const texto = document.createElement('span');
  texto.textContent = `Jugando: ${nombrePerfil} — `;
  barra.appendChild(texto);

  if (opciones && opciones.mostrarVolver) {
    const volver = document.createElement('button');
    volver.textContent = 'Volver al calendario';
    volver.addEventListener('click', () => mostrarCalendario(perfilId));
    barra.appendChild(volver);
  }

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
