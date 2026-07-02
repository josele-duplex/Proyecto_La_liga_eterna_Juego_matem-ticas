// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment) y
// mantiene el estado compartido de la sesión (índices de puzles, calendario, recompensas, el modo
// recién desbloqueado). Las pantallas concretas viven en js/pantallas/; los datos de configuración
// en js/datos-juego.js; la lógica sin DOM en js/logica-juego.js.

let indicesPorEdad = {};
let calendario = null;
let recompensas = null;
let contratos = null;
// Si el jugador acaba de desbloquear un equipo superior por ir sobrado, lo guardamos aquí para
// sugerírselo al terminar el partido (un buen momento de pausa, no a mitad de un reto).
let modoRecienDesbloqueado = null;

async function arrancar() {
  Sonido.cargarPreferencia();
  indicesPorEdad['6-anios'] = await (await fetch('data/puzzles/6-anios/indice.json')).json();
  indicesPorEdad['8-anios'] = await (await fetch('data/puzzles/8-anios/indice.json')).json();
  indicesPorEdad['9-anios'] = await (await fetch('data/puzzles/9-anios/indice.json')).json();
  calendario = await (await fetch('data/estadios.json')).json();
  recompensas = await (await fetch('data/recompensas.json')).json();
  contratos = await (await fetch('data/contratos.json')).json();

  mostrarPortada(() => {
    // Red de seguridad: si al retomar el último perfil algo falla (p. ej. un progreso guardado
    // corrupto de una versión vieja), NO dejamos la app en blanco. Caemos al selector de jugador,
    // que siempre funciona, para que el niño pueda elegir y seguir jugando. Así un perfil con datos
    // dañados nunca "no abre" la aplicación entera.
    try {
      const perfilActivo = Storage.cargarPerfilActivo();
      if (perfilActivo && modoDe(perfilActivo)) {
        mostrarCalendario(perfilActivo);
      } else if (perfilActivo) {
        mostrarSelectorModo(perfilActivo);
      } else {
        mostrarSelectorPerfil();
      }
    } catch (e) {
      console.error('No se pudo retomar el último perfil; volviendo al selector.', e);
      Storage.borrarPerfilActivo();
      mostrarSelectorPerfil();
    }
  });
}

// Registra el service worker (T3.4): hace que el juego siga funcionando sin conexión.
// Ruta relativa para que funcione igual en local y publicado en una subcarpeta de GitHub Pages.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });

  // Cuando una versión nueva toma el control (gracias a skipWaiting en el service worker), la
  // página recarga UNA vez para empezar a usar el código nuevo de inmediato. El flag evita un
  // bucle de recargas. Así los arreglos llegan al dispositivo en el siguiente arranque con red,
  // sin tener que reinstalar la app ni borrar la caché a mano.
  let recargandoPorSW = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargandoPorSW) return;
    recargandoPorSW = true;
    window.location.reload();
  });
}

arrancar();
