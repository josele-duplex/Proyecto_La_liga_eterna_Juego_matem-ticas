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

async function arrancar() {
  const respuesta = await fetch('data/puzzles/8-anios/indice.json');
  indice = await respuesta.json();

  const perfilActivo = Storage.cargarPerfilActivo();
  if (perfilActivo) {
    mostrarPuzle(perfilActivo);
  } else {
    mostrarSelectorPerfil();
  }
}

function mostrarSelectorPerfil() {
  document.getElementById('barra-perfil').innerHTML = '';
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';

  const app = document.getElementById('app');
  app.innerHTML = '';

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
      mostrarPuzle(perfil.id);
    });
    lista.appendChild(boton);
  });

  app.appendChild(lista);
}

async function mostrarPuzle(perfilId) {
  mostrarBarraPerfil(perfilId);
  document.getElementById('siguiente').innerHTML = '';

  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.siguiente(progreso, indice);

  const respuesta = await fetch(entrada.ruta);
  const puzzle = await respuesta.json();
  const app = document.getElementById('app');

  mostrarRetoActual(puzzle);

  Engine.render(puzzle, app, (puzzleResuelto, resultado) => {
    const progresoActual = Storage.cargarProgreso(perfilId);
    progresoActual.ultimoPuzleId = puzzleResuelto.id;
    Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado);
    Storage.guardarProgreso(perfilId, progresoActual);
    mostrarBotonSiguiente(perfilId);
  });
}

function mostrarBotonSiguiente(perfilId) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente';
  boton.textContent = 'Siguiente reto →';
  boton.addEventListener('click', () => mostrarPuzle(perfilId));
  zona.appendChild(boton);
}

function mostrarRetoActual(puzzle) {
  const concepto = NOMBRES_CONCEPTO[puzzle.concepto] || puzzle.concepto;
  document.getElementById('progreso').textContent = `Reto actual: ${concepto} · fase ${puzzle.fase_cpa}`;
}

function mostrarBarraPerfil(perfilId) {
  const nombrePerfil = PERFILES.find((perfil) => perfil.id === perfilId).nombre;
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  const texto = document.createElement('span');
  texto.textContent = `Jugando: ${nombrePerfil} — `;
  barra.appendChild(texto);

  const boton = document.createElement('button');
  boton.textContent = 'Cambiar de jugador';
  boton.addEventListener('click', () => {
    Storage.borrarPerfilActivo();
    mostrarSelectorPerfil();
  });
  barra.appendChild(boton);
}

arrancar();
