// Reglas del juego que NO pintan nada en pantalla: qué equipo toca, cuándo se desbloquea el
// siguiente, qué recompensa gana una jugada y qué frase premia el camino seguido. Usa los datos de
// datos-juego.js y el progreso guardado (Storage/Evaluacion); no sabe nada de DOM.

// Por debajo de esto, y acertando a la primera, una respuesta de Relámpago cuenta como "veloz"
// para la insignia de proceso correspondiente (no requiere racha, solo reflejos rápidos).
const UMBRAL_VELOCISTA_MS = 4000;

// Devuelve el modo guardado del jugador (o null si todavía no ha elegido ninguno).
function modoDe(perfilId) {
  const progreso = Storage.cargarProgreso(perfilId);
  return MODOS.find((m) => m.id === progreso.modoId) || null;
}

// Un modo está disponible si no necesita desbloqueo, o si el jugador ya lo ha desbloqueado.
function modoDesbloqueado(perfilId, modo) {
  if (!modo.desbloqueadoPor) return true;
  const progreso = Storage.cargarProgreso(perfilId);
  return (progreso.modosDesbloqueados || []).includes(modo.id);
}

// Tras una jugada: si el jugador va sobrado con su equipo actual (por repetición o rapidez) y hay
// un equipo superior que se desbloquea con este, lo desbloquea. Modifica el progreso (lo guarda
// quien llama) y devuelve el modo recién desbloqueado, o null si no hay nada que desbloquear ahora.
function revisarDesbloqueo(progreso) {
  const modoActual = MODOS.find((m) => m.id === progreso.modoId);
  if (!modoActual) return null;

  const superior = MODOS.find((m) => m.desbloqueadoPor === modoActual.id);
  if (!superior) return null;

  progreso.modosDesbloqueados = progreso.modosDesbloqueados || [];
  if (progreso.modosDesbloqueados.includes(superior.id)) return null;
  if (!Evaluacion.vaSobrado(progreso)) return null;

  progreso.modosDesbloqueados.push(superior.id);
  return superior;
}

// Da energía y, según la estrategia usada, una insignia distinta. Modifica el progreso recibido.
function otorgarRecompensa(progreso, estrategia) {
  progreso.energia = (progreso.energia || 0) + recompensas.energiaPorPuzle;
  if (recompensas.insignias[estrategia]) {
    progreso.insignias = progreso.insignias || {};
    progreso.insignias[estrategia] = (progreso.insignias[estrategia] || 0) + 1;
  }
}

// Nombre técnico real de una estrategia (FASE M1, A.5): lo que el niño ve al acertar ("Has usado
// DESCOMPOSICIÓN"). Distinto de insignia.nombre, que es el nombre gamificado del cromo ("Maestro
// de la Decena") — construye vocabulario matemático transferible, el cromo es la recompensa.
function vocabularioDe(estrategia) {
  const insignia = recompensas.insignias[estrategia];
  return insignia ? insignia.vocabulario : null;
}

// Insignias de proceso (TG.4, ampliadas en FASE M1/A.4): premian el CÓMO se ha jugado, igual en
// cualquier concepto (a diferencia de las insignias de estrategia, que son por contenido
// matemático). "Estratega" y "Pensador" premian específicamente creatividad/solidez de
// razonamiento, pensadas para el alumnado de alta capacidad al que apunta el GDD.
function otorgarInsigniasProceso(progreso, puzzle, resultado) {
  progreso.insigniasProceso = progreso.insigniasProceso || {};
  const sumar = (clave) => {
    progreso.insigniasProceso[clave] = (progreso.insigniasProceso[clave] || 0) + 1;
  };

  const limpio = resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0;
  if (limpio) sumar('sin_pistas');
  if (resultado.intentosFallidos >= 1) sumar('remontada');
  if (puzzle.tipo === 'verdadero_falso' && resultado.intentosFallidos === 0 && resultado.tiempoMs <= UMBRAL_VELOCISTA_MS) {
    sumar('velocista');
  }
  // Estratega: aplicó la estrategia limpiamente en fase abstracta (sin apoyos concretos ni
  // pictóricos) — ya no cuenta, la ha interiorizado como herramienta propia.
  if (limpio && puzzle.fase_cpa === 3) sumar('estratega');
  // Pensador: acertó a la primera un problema de dos pasos (concepto "problemas"), el reto que
  // más exige combinar varias operaciones con criterio.
  if (puzzle.concepto === 'problemas' && resultado.intentosFallidos === 0) sumar('pensador');
}

// Frase de Capi al acertar, según CÓMO se ha llegado al acierto (elogio al esfuerzo/estrategia,
// no a "ser listo" — mentalidad de crecimiento): directo y sin ayuda, remontada tras fallar, o
// pista bien aprovechada. Las tres son válidas; ninguna es mejor persona, solo distinto camino.
function fraseAcierto(resultado) {
  if (resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0) {
    return '¡Directo y sin pistas! Esa es la jugada de un crack.';
  }
  if (resultado.intentosFallidos >= 1) {
    return '¡Buena remontada! No te has rendido y lo has conseguido.';
  }
  return '¡Bien pensado pedir ayuda en el momento justo!';
}
