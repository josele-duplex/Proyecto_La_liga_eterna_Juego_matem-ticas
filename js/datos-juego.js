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
const RIVALES = [
  { id: 'energia', nombre: 'Energía', imagen: 'assets/img/decoracion/fuera-de-juego-energia.webp' },
  { id: 'asustado', nombre: 'Asustado', imagen: 'assets/img/decoracion/fuera-de-juego-asustado.webp' },
  { id: 'malvado', nombre: 'Malvado', imagen: 'assets/img/decoracion/fuera-de-juego-malvado.webp' }
];

// Poderes (TG.7): formas concretas de gastar la energía que AYUDAN sin saltarse el aprendizaje
// (ninguno revela la respuesta directa). El motor (engine.js) expone cómo ejecutarlos; aquí solo
// se decide el coste y cuándo mostrarlos.
const PODERES = {
  ojo_aguila: { nombre: 'Ojo del Águila', icono: '👁️', costo: 15 },
  consejo_capitan: { nombre: 'Consejo del Capitán', icono: '🧠', costo: 10 },
  tiempo_extra: { nombre: 'Tiempo Extra', icono: '⏱️', costo: 10, segundos: 5 }
};

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
  problemas: 'problemas'
};
