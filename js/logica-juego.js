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

// Modo de dificultad (FASE M5, B.7 modificado; Élite añadida en FASE M7): 'entrenador' (con
// pistas automáticas, por defecto), 'profesional' o 'elite' (ambas sin pistas automáticas; el
// tiempo nunca se toca en ninguna).
function dificultadDe(progreso) {
  return progreso.modoDificultad || 'entrenador';
}

// Alterna en círculo entre los tres modos de dificultad (entrenador → profesional → élite →
// entrenador). Modifica y devuelve el progreso.
function alternarDificultad(progreso) {
  const orden = ['entrenador', 'profesional', 'elite'];
  const actual = orden.indexOf(dificultadDe(progreso));
  progreso.modoDificultad = orden[(actual + 1) % orden.length];
  return progreso;
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

// Copa de Leyendas (FASE M7, B.2): lista de conceptos del equipo actual que el jugador ya domina
// (Titular o Crack) — la Copa solo sirve retos de ESTOS conceptos, mezclados, como repaso variado
// de lo ya aprendido, nunca contenido nuevo. Vacío hasta que se domine al menos uno.
function conceptosDominadosDe(progreso, indice) {
  return Progression.conceptos(indice).filter((concepto) => {
    const nivel = Progression.nivelDominioConcepto(progreso, concepto);
    return nivel === 'titular' || nivel === 'crack';
  });
}

// Aviso de primera vez (Guía del Capi jugada, no leída): la PRIMERA vez que el niño gana cada
// tipo de recompensa (energía, cromo, puntos de reforma, combo...), Capi explica en el momento
// qué es y para qué sirve — el tutorial ocurre dentro del juego, justo cuando la cosa aparece.
// Devuelve el texto del aviso (y lo marca como visto; quien llama guarda el progreso), o null si
// ya se dio. Textos en data/guia.json → avisos.
function avisoPrimeraVez(progreso, clave) {
  const texto = guia.avisos && guia.avisos[clave];
  if (!texto) return null;
  progreso.avisosVistos = progreso.avisosVistos || [];
  if (progreso.avisosVistos.includes(clave)) return null;
  progreso.avisosVistos.push(clave);
  return texto;
}

// Partido especial del día (C.3 ligero): cuál toca hoy, determinista por fecha (mismo para todos
// los perfiles y estable durante todo el día). Rota por la lista PARTIDOS_ESPECIALES.
function partidoEspecialDeHoy() {
  const hoy = new Date();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((hoy - inicioAnio) / (24 * 60 * 60 * 1000));
  return PARTIDOS_ESPECIALES[diaDelAnio % PARTIDOS_ESPECIALES.length];
}

// El Descanso (pausa a mitad de partido): elige el siguiente truco/curiosidad/juego que el
// jugador todavía no ha visto, y lo marca como visto (quien llama guarda el progreso). Cuando ya
// los ha visto todos, la lista de vistos se reinicia y la rotación vuelve a empezar — el
// conocimiento se repasa, no se agota. Sin aleatoriedad: en orden, para que dos hermanos en el
// mismo punto vean cosas distintas solo si han jugado distinto.
function elegirDescanso(progreso, datosDescansos) {
  const todos = datosDescansos.descansos;
  progreso.descansosVistos = progreso.descansosVistos || [];
  let pendientes = todos.filter((d) => !progreso.descansosVistos.includes(d.id));
  if (pendientes.length === 0) {
    progreso.descansosVistos = [];
    pendientes = todos;
  }
  const elegido = pendientes[0];
  progreso.descansosVistos.push(elegido.id);
  return elegido;
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

// Arquitecto del Estadio (FASE M6, C.1): puntos de reforma ganados por DOMINIO demostrado, nunca
// por volumen de partidas — un concepto da puntos la primera vez que llega a Titular, y otra
// tanda (aparte) la primera vez que llega a Crack. progreso.reforma.nivelesPremiados guarda el
// mejor nivel ya pagado por concepto para no volver a pagar el mismo salto dos veces: mismo patrón
// que revisarLeyendasNuevas (comparar contra lo ya registrado en cada pasada, no un evento
// puntual), así que llamar a esto tras cada acierto de Liga/Contrarreloj es seguro y barato.
function revisarPuntosReforma(progreso) {
  progreso.reforma = progreso.reforma || { puntos: 0, cesped: 0, focos: 0, grada: 0, banquillo: 0, nivelesPremiados: {} };
  let ganados = 0;
  Object.keys(progreso.dominio || {}).forEach((concepto) => {
    const nivel = Progression.nivelDominioConcepto(progreso, concepto);
    const premiado = progreso.reforma.nivelesPremiados[concepto] || null;
    if (nivel === 'titular' && premiado === null) {
      ganados += reformas.puntosPorNivelDominio.titular;
      progreso.reforma.nivelesPremiados[concepto] = 'titular';
    } else if (nivel === 'crack' && premiado !== 'crack') {
      ganados += reformas.puntosPorNivelDominio.crack;
      progreso.reforma.nivelesPremiados[concepto] = 'crack';
    }
  });
  progreso.reforma.puntos += ganados;
  return ganados;
}

// Compra la siguiente mejora de una categoría del estadio (cesped/focos/grada/banquillo) si hay
// puntos suficientes y no está ya al nivel máximo. Modifica progreso.reforma y devuelve true solo
// si la compra se realizó (para que la pantalla sepa si debe refrescarse).
function comprarMejora(progreso, categoria) {
  progreso.reforma = progreso.reforma || { puntos: 0, cesped: 0, focos: 0, grada: 0, banquillo: 0, nivelesPremiados: {} };
  const niveles = reformas.categorias[categoria].niveles;
  const nivelActual = progreso.reforma[categoria] || 0;
  if (nivelActual >= niveles.length) return false;
  const costo = niveles[nivelActual].costo;
  if (progreso.reforma.puntos < costo) return false;
  progreso.reforma.puntos -= costo;
  progreso.reforma[categoria] = nivelActual + 1;
  return true;
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
