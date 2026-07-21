// Datos de configuración del juego: perfiles disponibles, equipos/modos, rivales narrativos y
// poderes comprables con energía. Solo datos (listas y objetos); ninguna lógica vive aquí.

const PERFILES = [
  { id: 'pepe', nombre: 'Pepe', avatar: 'assets/img/avatares/avatar-pepe.webp', avatarCelebrando: 'assets/img/avatares/avatar-pepe-celebrando.webp' },
  { id: 'bruno', nombre: 'Bruno', avatar: 'assets/img/avatares/avatar-bruno.webp', avatarCelebrando: 'assets/img/avatares/avatar-bruno-celebrando.webp' },
  { id: 'david', nombre: 'David', avatar: 'assets/img/avatares/avatar-david.webp', avatarCelebrando: 'assets/img/avatares/avatar-david-celebrando.webp' },
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
    imagen: 'assets/img/emblemas/emblema-promesas.webp',
    descripcion: 'Da tus primeros toques: reconoce cantidades, compara y completa 10.',
    edad: '6-anios'
  },
  {
    id: 'aspirantes',
    nombre: 'Aspirantes',
    icono: '🎯',
    // Sin 'imagen' a propósito (FASE C1, Plan V2: sin arte nuevo): UI.crearEmblemaModo() usa el
    // icono como placeholder cuando no hay imagen, igual que hace con estadios sin escudo.
    descripcion: 'El paso antes de ser estrella: sumas y restas hasta 20, dobles pequeños y decenas completas.',
    edad: '7-anios'
  },
  {
    id: 'estrellas',
    nombre: 'Estrellas',
    icono: '⭐',
    imagen: 'assets/img/emblemas/emblema-estrellas.webp',
    descripcion: 'Juega como un crack: descomposición, dobles, casi-dobles y recta numérica.',
    edad: '8-anios'
  },
  {
    id: 'leyendas',
    nombre: 'Leyendas',
    icono: '🏆',
    imagen: 'assets/img/emblemas/emblema-leyendas.webp',
    descripcion: 'El equipo de los más grandes: multiplicar, dividir, fracciones, redondeo, sumas y restas grandes y problemas.',
    edad: '9-anios',
    desbloqueadoPor: 'estrellas'
  }
];

// Rivales del partido (TG.6): los "Fueras de Juego", criaturas del error numérico. Se elige uno
// al azar por partido (sesion.rival) y da sentido narrativo al fallo: no "te has equivocado",
// sino "el rival te ha robado el balón" — mismo dato (un fallo), distinto envoltorio emocional.
// 'presentacion' (FASE N1, Plan V2) es la micro-historia que Capi cuenta la PRIMERA vez que este
// rival concreto aparece para el jugador (ver progreso.rivalesConocidos en pantallas/reto.js).
// 'provocaciones' (mejora de jugabilidad): frases cortas de pique que el rival suelta en la
// pantalla de presentación del partido (una al azar) — tensión de videojuego, nunca crueldad:
// pican al jugador, jamás se burlan de un fallo ya cometido.
const RIVALES = [
  {
    id: 'energia',
    nombre: 'Energía',
    imagen: 'assets/img/decoracion/fuera-de-juego-energia.webp',
    presentacion: 'Soy Energía, un Fuera de Juego que se cuela cuando corres demasiado rápido con los números. ¡Contra mí no hace falta prisa, solo calma!',
    provocaciones: [
      '¡Corre, corre, que así te equivocas antes! Ji, ji...',
      'Hoy vengo a toda velocidad. ¿Podrás mantener la calma?',
      '¡Los que van con prisa son los que más balones me regalan!'
    ]
  },
  {
    id: 'asustado',
    nombre: 'Asustado',
    imagen: 'assets/img/decoracion/fuera-de-juego-asustado.webp',
    presentacion: 'Me llamo Asustado. Aparezco cuando dudas de ti mismo antes de intentarlo. ¡Pero ya verás que puedes conmigo!',
    provocaciones: [
      '¿Y si te sale mal? ¿Y si es muy difícil? Uy, uy, uy...',
      'Yo de ti no lo intentaría... ¡espera, sí, soy yo el que tiembla!',
      'Cuando dudes, ahí estaré yo para robarte el balón...'
    ]
  },
  {
    id: 'malvado',
    nombre: 'Malvado',
    imagen: 'assets/img/decoracion/fuera-de-juego-malvado.webp',
    presentacion: 'Soy Malvado, el más travieso de los Fueras de Juego. Me encanta desordenar los números... ¡pero contigo no lo voy a conseguir!',
    provocaciones: [
      '¡Muahaha! Hoy pienso marcarte tres goles por lo menos.',
      'He desordenado todos los números del estadio. ¡A ver si te aclaras!',
      '¿Tú otra vez? Esta vez no pienso dejarte ganar tan fácil...'
    ]
  }
];

// Poderes (TG.7): formas concretas de gastar la energía que AYUDAN sin saltarse el aprendizaje
// (ninguno revela la respuesta directa). El motor (engine.js) expone cómo ejecutarlos; aquí solo
// se decide el coste y cuándo mostrarlos.
const PODERES = {
  ojo_aguila: { nombre: 'Ojo del Águila', icono: '👁️', costo: 15 },
  consejo_capitan: { nombre: 'Consejo del Capitán', icono: '🧠', costo: 10 },
  tiempo_extra: { nombre: 'Tiempo Extra', icono: '⏱️', costo: 10, segundos: 5 }
};

// Niveles de Dominio (FASE M1, U1): icono y nombre a mostrar para cada nivel de la escala única
// 🥉🥈🥇. El nivel en sí lo calcula Progression.nivelDominioConcepto/nivelDominioEstrategia;
// esto es solo cómo se pinta cada uno.
const NIVELES_DOMINIO = {
  aprendiz: { icono: '🥉', imagenSvg: 'assets/icons-svg/medalla-aprendiz.svg', nombre: 'Aprendiz' },
  titular: { icono: '🥈', imagenSvg: 'assets/icons-svg/medalla-titular.svg', nombre: 'Titular' },
  crack: { icono: '🥇', imagenSvg: 'assets/icons-svg/medalla-crack.svg', nombre: 'Crack' }
};

// Modos de dificultad (FASE M5, B.7 modificado; Élite añadida en FASE M7 ahora que existe la Copa
// de Leyendas, retos mixtos): indicador siempre visible en la barra de perfil, nunca una
// evaluación de capacidad. Entrenador tiene pistas automáticas; Profesional y Élite las quitan
// (mismo efecto mecánico — Élite es el nombre del escalón más alto, sin inventar una restricción
// nueva que el plan no pide). NINGÚN modo toca el tiempo.
const MODOS_DIFICULTAD = {
  entrenador: { id: 'entrenador', nombre: 'Entrenador', icono: '🟢' },
  profesional: { id: 'profesional', nombre: 'Profesional', icono: '🔵' },
  elite: { id: 'elite', nombre: 'Élite', icono: '🟣' }
};

// Contrarreloj (FASE M5, 14.5): número de rondas por sesión, siempre puzles del concepto
// 'relampago' (presente en los 4 bancos de edad).
const RONDAS_CONTRARRELOJ = 5;

// Partido especial del día (mejora de jugabilidad, C.3 en versión ligera): cada día el calendario
// ofrece UN partido con una condición distinta al partido normal, para variar la dinámica. Se
// elige de forma determinista por fecha (día del año % lista), igual para todos los perfiles.
// Ningún tipo castiga: si no se cumple la condición, se gana el partido igual, solo sin el bono.
const PARTIDOS_ESPECIALES = [
  {
    id: 'porteria-cero',
    nombre: 'Portería a cero',
    icono: '🧤',
    descripcion: 'Gana el partido sin que el rival marque ningún gol.',
    bono: 20,
    retos: 3
  },
  {
    id: 'partido-largo',
    nombre: 'Partido de 5 retos',
    icono: '🏃',
    descripcion: 'Un partido más largo de lo normal: aguanta los 5 retos.',
    bono: 15,
    retos: 5
  }
];

// Copa de Leyendas (FASE M7, B.2): rondas de la serie especial, mezclando conceptos que el
// jugador YA domina (Titular o Crack) en su equipo actual — retos variados de repaso, no contenido
// nuevo. Reutiliza la misma cantidad que Contrarreloj para que ambos modos especiales se sientan
// del mismo tamaño de sesión.
const RONDAS_COPA = 5;

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
  redondeo: 'redondeo',
  sumar_hasta_diez: 'sumar hasta 10',
  secuencia: 'series de números',
  relampago: 'relámpago',
  alineacion: 'alineación',
  restar: 'restar',
  decenas: 'decenas y unidades',
  division: 'división',
  suma_llevando: 'sumas con llevadas',
  resta_llevando: 'restas con llevadas',
  problemas: 'problemas',
  sumar_veinte: 'sumar hasta 20',
  restar_veinte: 'restar hasta 20'
};
