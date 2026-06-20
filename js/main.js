// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment).

async function arrancar() {
  const respuesta = await fetch('data/puzzles/8-anios/descomposicion-fase3-abstracta.json');
  const puzzle = await respuesta.json();
  const app = document.getElementById('app');

  Engine.render(puzzle, app, (puzzleResuelto) => {
    Storage.guardarUltimoPuzle(puzzleResuelto.id);
    mostrarUltimoPuzle();
  });

  mostrarUltimoPuzle();
}

function mostrarUltimoPuzle() {
  const progreso = Storage.cargarProgreso();
  const elemento = document.getElementById('progreso');
  elemento.textContent = progreso.ultimoPuzleId
    ? `Último puzle resuelto: ${progreso.ultimoPuzleId}`
    : 'Todavía no has resuelto ningún puzle.';
}

arrancar();

