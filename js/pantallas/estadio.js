// Pantalla "Mi Estadio" (FASE M6, C.1: Arquitecto del Estadio). Los puntos de reforma se ganan
// SOLO por dominio demostrado (revisarPuntosReforma, logica-juego.js), nunca por volumen de
// partidas jugadas — se gastan aquí en 4 mejoras visuales (césped/focos/grada/banquillo) que se
// ven en un escenario pintado con capas de CSS puro (sin arte nuevo), 100% persistentes: una vez
// comprada una mejora, nunca se pierde ni se puede "vender" por error.
function mostrarMiEstadio(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const progreso = Storage.cargarProgreso(perfilId);
  progreso.reforma = progreso.reforma || { puntos: 0, cesped: 0, focos: 0, grada: 0, banquillo: 0, nivelesPremiados: {} };

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '🏟️ Mi Estadio';
  app.appendChild(titulo);

  const explicacion = document.createElement('p');
  explicacion.className = 'entrenamiento-explicacion';
  explicacion.textContent = 'Ganas puntos de reforma cada vez que dominas de verdad un concepto (nunca por jugar más). Gástalos en mejorar tu estadio: nunca se pierden.';
  app.appendChild(explicacion);

  const puntos = document.createElement('p');
  puntos.className = 'reforma-puntos';
  puntos.innerHTML = `🔧 Puntos de reforma: <strong>${progreso.reforma.puntos}</strong>`;
  app.appendChild(puntos);

  app.appendChild(crearEscenarioEstadio(progreso.reforma));

  const grid = document.createElement('div');
  grid.className = 'museo-grid';
  Object.keys(reformas.categorias).forEach((categoria) => {
    grid.appendChild(crearTarjetaMejora(perfilId, progreso, categoria));
  });
  app.appendChild(grid);
}

// El escenario en sí: una franja de césped propia (no la de fondo de toda la app) que va ganando
// capas visuales según el nivel comprado de cada categoría. Todo con CSS, ninguna imagen nueva.
function crearEscenarioEstadio(reforma) {
  const escenario = document.createElement('div');
  escenario.className = `escenario-estadio cesped-nivel-${reforma.cesped} focos-nivel-${reforma.focos} grada-nivel-${reforma.grada}`;

  const banda = document.createElement('div');
  banda.className = 'escenario-banda';
  escenario.appendChild(banda);

  const banquillo = document.createElement('div');
  banquillo.className = `escenario-banquillo banquillo-nivel-${reforma.banquillo}`;
  const asientosPorNivel = [0, 2, 4, 6];
  for (let i = 0; i < asientosPorNivel[reforma.banquillo]; i++) {
    const asiento = document.createElement('span');
    asiento.className = 'asiento-banquillo';
    banquillo.appendChild(asiento);
  }
  escenario.appendChild(banquillo);

  return escenario;
}

// Tarjeta de una categoría de mejora: nivel actual (o "sin empezar"), y la siguiente mejora
// disponible con su coste, o "nivel máximo" si ya se compró todo. Reutiliza el estilo de
// museo-grid/tarjeta-leyenda para no inventar una cuarta variante de tarjeta en el CSS.
function crearTarjetaMejora(perfilId, progreso, categoria) {
  const datos = reformas.categorias[categoria];
  const nivelActual = progreso.reforma[categoria] || 0;

  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-leyenda tarjeta-mejora';

  const cabecera = document.createElement('div');
  cabecera.className = 'leyenda-cabecera';
  const icono = document.createElement('span');
  icono.className = 'leyenda-icono-emoji';
  icono.textContent = datos.icono;
  cabecera.appendChild(icono);
  const nombre = document.createElement('h3');
  nombre.textContent = datos.nombre;
  cabecera.appendChild(nombre);
  tarjeta.appendChild(cabecera);

  const actual = document.createElement('p');
  actual.textContent = nivelActual > 0
    ? `Ahora: ${datos.niveles[nivelActual - 1].nombre}`
    : 'Aún sin mejorar.';
  tarjeta.appendChild(actual);

  if (nivelActual >= datos.niveles.length) {
    const maximo = document.createElement('p');
    maximo.className = 'mejora-maximo';
    maximo.textContent = '🏆 Nivel máximo alcanzado.';
    tarjeta.appendChild(maximo);
    return tarjeta;
  }

  const siguiente = datos.niveles[nivelActual];
  const descripcion = document.createElement('p');
  descripcion.textContent = `Siguiente: ${siguiente.nombre} — ${siguiente.descripcion}`;
  tarjeta.appendChild(descripcion);

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente';
  boton.textContent = `Mejorar (${siguiente.costo} 🔧)`;
  boton.disabled = progreso.reforma.puntos < siguiente.costo;
  boton.addEventListener('click', () => {
    if (comprarMejora(progreso, categoria)) {
      Storage.guardarProgreso(perfilId, progreso);
      mostrarMiEstadio(perfilId);
    }
  });
  tarjeta.appendChild(boton);

  return tarjeta;
}
