// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment).

const PERFILES = [
  { id: 'pepe', nombre: 'Pepe' },
  { id: 'bruno', nombre: 'Bruno' },
  { id: 'invitado-1', nombre: 'Invitado 1' },
  { id: 'invitado-2', nombre: 'Invitado 2' },
  { id: 'invitado-3', nombre: 'Invitado 3' }
];

// Provisional: hasta que exista progression.js (T2.3), se elige el puzle a mano con un botón de prueba.
const PUZLES_EJEMPLO = [
  'data/puzzles/8-anios/descomposicion-fase3-abstracta.json',
  'data/puzzles/8-anios/recta-numerica-fase2-pictorica.json'
];
let indicePuzleActual = 0;

async function arrancar() {
  const perfilActivo = Storage.cargarPerfilActivo();
  if (perfilActivo) {
    mostrarPuzle(perfilActivo);
  } else {
    mostrarSelectorPerfil();
  }
}

function mostrarSelectorPerfil() {
  document.getElementById('barra-perfil').innerHTML = '';
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

  const respuesta = await fetch(PUZLES_EJEMPLO[indicePuzleActual]);
  const puzzle = await respuesta.json();
  const app = document.getElementById('app');

  Engine.render(puzzle, app, (puzzleResuelto, esCorrecta) => {
    if (esCorrecta) {
      Storage.guardarUltimoPuzle(perfilId, puzzleResuelto.id);
      mostrarProgreso(perfilId);
    }
  });

  mostrarProgreso(perfilId);
}

function mostrarProgreso(perfilId) {
  const progreso = Storage.cargarProgreso(perfilId);
  const elemento = document.getElementById('progreso');
  elemento.textContent = progreso.ultimoPuzleId
    ? `Último puzle resuelto: ${progreso.ultimoPuzleId}`
    : 'Todavía no has resuelto ningún puzle.';
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

  const botonPuzle = document.createElement('button');
  botonPuzle.textContent = 'Probar otro tipo de puzle';
  botonPuzle.addEventListener('click', () => {
    indicePuzleActual = (indicePuzleActual + 1) % PUZLES_EJEMPLO.length;
    mostrarPuzle(perfilId);
  });
  barra.appendChild(botonPuzle);
}

arrancar();
