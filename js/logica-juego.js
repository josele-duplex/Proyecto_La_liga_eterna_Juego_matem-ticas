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

// Museo de la Liga (FASE M3, U5): revisa si alguna Leyenda del Orden nueva se desbloquea con el
// dominio actual (nivel Titular o Crack en su concepto asociado — Progression.nivelDominioConcepto
// no necesita saber de qué banco/edad es el concepto, lee directamente progreso.dominio). Modifica
// progreso.museo.leyendasDesbloqueadas y devuelve las leyendas NUEVAS de esta pasada (normalmente
// ninguna o una sola), para poder celebrarlas en la pantalla de victoria.
function revisarLeyendasNuevas(progreso, datosLeyendas) {
  progreso.museo = progreso.museo || { leyendasDesbloqueadas: [], entradasVistas: [] };
  const nuevas = [];
  datosLeyendas.leyendas.forEach((leyenda) => {
    if (progreso.museo.leyendasDesbloqueadas.includes(leyenda.id)) return;
    const nivel = Progression.nivelDominioConcepto(progreso, leyenda.concepto);
    if (nivel === 'titular' || nivel === 'crack') {
      progreso.museo.leyendasDesbloqueadas.push(leyenda.id);
      nuevas.push(leyenda);
    }
  });
  return nuevas;
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

// Contrato del Día (FASE M2, U2): funde el "reto del día" del GDD original con los contratos de
// C.5 en un único sistema. Si ya hay uno asignado hoy, lo devuelve tal cual (idempotente: se puede
// llamar cada vez que se entra al calendario sin reasignar). Si no, elige uno determinista: si el
// jugador ya tiene alguna insignia de estrategia dentro del banco de su equipo actual, le pide
// practicarla unas veces más; si es nuevo y no tiene ninguna, le pide un número de jugadas
// cualquiera (siempre cumplible, para que el primer día también tenga contrato). Modifica y
// devuelve progreso.contratoDia.
function asegurarContratoDelDia(progreso, indice, datosContratos) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (progreso.contratoDia && progreso.contratoDia.fecha === hoy) return progreso.contratoDia;

  const estrategiasDelBanco = [...new Set(indice.puzles.map((p) => p.estrategia).filter(Boolean))];
  const estrategiasConocidas = Object.keys(progreso.insignias || {}).filter((e) => estrategiasDelBanco.includes(e));

  const rango = datosContratos.objetivoMaximo - datosContratos.objetivoMinimo + 1;
  const objetivo = datosContratos.objetivoMinimo + Math.floor(Math.random() * rango);

  let contrato;
  if (estrategiasConocidas.length > 0) {
    const estrategia = estrategiasConocidas[Math.floor(Math.random() * estrategiasConocidas.length)];
    contrato = { fecha: hoy, tipo: 'insignia', estrategia, objetivo, avance: 0, bonus: datosContratos.energiaBonus, cumplido: false };
  } else {
    contrato = { fecha: hoy, tipo: 'retos', objetivo, avance: 0, bonus: datosContratos.energiaBonus, cumplido: false };
  }

  progreso.contratoDia = contrato;
  return contrato;
}

// Texto de Capi para el contrato del día, relleno desde las plantillas de contratos.json.
function textoContrato(contrato, datosContratos) {
  if (contrato.tipo === 'insignia') {
    const vocab = vocabularioDe(contrato.estrategia) || NOMBRES_CONCEPTO[contrato.estrategia] || contrato.estrategia;
    return datosContratos.plantillaEstrategia
      .replace('{objetivo}', contrato.objetivo)
      .replace('{vocabulario}', vocab);
  }
  return datosContratos.plantillaGenerica.replace('{objetivo}', contrato.objetivo);
}

// Tras resolver un puzle, avanza el contrato del día si aplica y cobra el bono la primera vez que
// se cumple (nunca más de una vez). Modifica progreso.contratoDia y, si cobra, progreso.energia.
// Devuelve true solo en el instante en que se acaba de cumplir (para poder celebrarlo en pantalla).
function avanzarContratoDelDia(progreso, puzzle) {
  const contrato = progreso.contratoDia;
  if (!contrato || contrato.cumplido) return false;

  const aplica = contrato.tipo === 'retos' || puzzle.estrategia === contrato.estrategia;
  if (!aplica) return false;

  contrato.avance = Math.min(contrato.avance + 1, contrato.objetivo);
  if (contrato.avance >= contrato.objetivo) {
    contrato.cumplido = true;
    progreso.energia = (progreso.energia || 0) + contrato.bonus;
    return true;
  }
  return false;
}

// Banco de frases de Capi (FASE G1, Plan V2): elige una variante al azar de frasesCapi.json para
// la situación dada, y rellena los {marcadores} que traiga (nombre, días, rival, bono...). Así
// Capi no repite literalmente lo mismo cada vez — la repetición mata la inmersión más rápido que
// casi cualquier otra cosa en una sesión diaria.
function fraseCapi(clave, reemplazos) {
  const variantes = frasesCapi[clave];
  if (!variantes || variantes.length === 0) return '';
  let frase = variantes[Math.floor(Math.random() * variantes.length)];
  if (reemplazos) {
    Object.keys(reemplazos).forEach((k) => {
      frase = frase.replace(`{${k}}`, reemplazos[k]);
    });
  }
  return frase;
}

// Frase de Capi al acertar, según CÓMO se ha llegado al acierto (elogio al esfuerzo/estrategia,
// no a "ser listo" — mentalidad de crecimiento): directo y sin ayuda, remontada tras fallar, o
// pista bien aprovechada. Las tres son válidas; ninguna es mejor persona, solo distinto camino.
function fraseAcierto(resultado) {
  if (resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0) {
    return fraseCapi('acierto_limpio');
  }
  if (resultado.intentosFallidos >= 1) {
    return fraseCapi('remontada');
  }
  return fraseCapi('ayuda');
}
