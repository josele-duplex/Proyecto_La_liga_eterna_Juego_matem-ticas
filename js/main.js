// Arranca el juego y conecta las piezas (engine, progression, storage, ui, audio, assessment).

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
    descripcion: 'El equipo de los más grandes: multiplicación, fracciones y redondeo.',
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
  decenas: 'decenas y unidades'
};

// Por debajo de esto, y acertando a la primera, una respuesta de Relámpago cuenta como "veloz"
// para la insignia de proceso correspondiente (no requiere racha, solo reflejos rápidos).
const UMBRAL_VELOCISTA_MS = 4000;

let indicesPorEdad = {};
let calendario = null;
let recompensas = null;
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

  mostrarPortada(() => {
    const perfilActivo = Storage.cargarPerfilActivo();
    if (perfilActivo && modoDe(perfilActivo)) {
      mostrarCalendario(perfilActivo);
    } else if (perfilActivo) {
      mostrarSelectorModo(perfilActivo);
    } else {
      mostrarSelectorPerfil();
    }
  });
}

// --- Pantalla 0: portada (pantalla de título), siempre la primera al abrir la app. Imagen a
// pantalla completa con un único botón real "¡A jugar!"; ese toque es también el primer gesto
// del usuario en iOS, así que de paso desbloquea el audio (Web Audio exige un gesto para sonar).
function mostrarPortada(alContinuar) {
  const portada = document.getElementById('portada');
  portada.className = 'pantalla-portada';

  const sonidoBoton = document.createElement('button');
  sonidoBoton.className = 'portada-sonido';
  sonidoBoton.textContent = Sonido.activo ? '🔊' : '🔇';
  sonidoBoton.addEventListener('click', () => {
    sonidoBoton.textContent = Sonido.alternar() ? '🔊' : '🔇';
  });
  portada.appendChild(sonidoBoton);

  const boton = document.createElement('button');
  boton.className = 'portada-boton';
  boton.textContent = '⚽ ¡A jugar!';
  boton.addEventListener('click', () => {
    Sonido.obtenerContexto();
    portada.innerHTML = '';
    portada.className = '';
    alContinuar();
  });
  portada.appendChild(boton);
}

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

// --- Pantalla 1: elegir jugador ---
function mostrarSelectorPerfil() {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  document.getElementById('barra-perfil').innerHTML = '';

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿Quién juega?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'opciones';
  PERFILES.forEach((perfil) => {
    const boton = document.createElement('button');
    boton.className = 'opcion boton-perfil';
    boton.appendChild(UI.crearAvatarPerfil(perfil));
    const nombre = document.createElement('span');
    nombre.textContent = perfil.nombre;
    boton.appendChild(nombre);
    boton.addEventListener('click', () => {
      Storage.guardarPerfilActivo(perfil.id);
      mostrarSelectorModo(perfil.id);
    });
    lista.appendChild(boton);
  });
  app.appendChild(lista);
}

// --- Pantalla 2: elegir modo de juego (Promesas / Estrellas) ---
function mostrarSelectorModo(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿En qué equipo juegas hoy?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  MODOS.forEach((modo) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    const desbloqueado = modoDesbloqueado(perfilId, modo);

    tarjeta.appendChild(UI.crearEmblemaModo(modo));

    const nombre = document.createElement('h2');
    nombre.textContent = desbloqueado ? `${modo.icono} ${modo.nombre}` : `🔒 ${modo.nombre}`;
    tarjeta.appendChild(nombre);

    const desc = document.createElement('p');
    desc.textContent = modo.descripcion;
    tarjeta.appendChild(desc);

    if (desbloqueado) {
      const elegir = document.createElement('button');
      elegir.className = 'boton-siguiente';
      elegir.textContent = 'Jugar en este equipo';
      elegir.addEventListener('click', () => {
        const progreso = Storage.cargarProgreso(perfilId);
        progreso.modoId = modo.id;
        Storage.guardarProgreso(perfilId, progreso);
        mostrarCalendario(perfilId);
      });
      tarjeta.appendChild(elegir);
    } else {
      tarjeta.classList.add('estadio-bloqueado');
      const candado = document.createElement('p');
      candado.className = 'aviso-bloqueado';
      const requisito = MODOS.find((m) => m.id === modo.desbloqueadoPor);
      candado.textContent = `Domina el equipo ${requisito ? requisito.nombre : 'anterior'} para desbloquearlo.`;
      tarjeta.appendChild(candado);
    }

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}

// --- Pantalla 3: calendario de la Liga (elegir estadio) ---
function mostrarCalendario(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();

  // Racha de días jugados (TG.3): se cuenta una vez al día. Si es la primera vez que se entra
  // hoy, Capi saluda con la racha; si ya se había contado, la barra de perfil la sigue mostrando.
  const racha = Storage.actualizarRacha(perfilId);
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const modo = modoDe(perfilId) || MODOS[0];
  const app = document.getElementById('app');

  if (racha.esNuevoDia) {
    app.appendChild(crearSaludoCapi(perfilId, racha.dias));
  }

  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = `Calendario de la Liga — ${modo.icono} ${modo.nombre}`;
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  calendario.estadios.forEach((estadio) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    tarjeta.appendChild(UI.crearEscudo(estadio));

    const nombre = document.createElement('h2');
    nombre.textContent = estadio.nombre;
    tarjeta.appendChild(nombre);

    const desc = document.createElement('p');
    desc.textContent = estadio.descripcion;
    tarjeta.appendChild(desc);

    const jugar = document.createElement('button');
    jugar.className = 'boton-siguiente';
    jugar.textContent = 'Jugar partido';
    jugar.addEventListener('click', () => iniciarEstadio(perfilId, estadio));
    tarjeta.appendChild(jugar);

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}

// Saludo de Capi al entrar por primera vez en el día: refuerza el hábito de práctica diaria.
function crearSaludoCapi(perfilId, dias) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const saludo = document.createElement('div');
  saludo.className = 'saludo-capi';

  const img = document.createElement('img');
  img.className = 'capi-mini';
  img.src = 'assets/img/capi/avatar-capi-alegria.webp';
  img.alt = 'Capi te saluda';
  saludo.appendChild(img);

  const texto = document.createElement('p');
  const nombre = perfil ? perfil.nombre : 'campeón';
  texto.textContent = dias > 1
    ? `¡Hola, ${nombre}! Llevas ${dias} días seguidos entrenando. 🔥 ¡Sigue así!`
    : `¡Hola, ${nombre}! Hoy empieza tu racha de entrenamiento. 🔥`;
  saludo.appendChild(texto);

  return saludo;
}

// --- Pantalla 4: jugar la serie de retos de un estadio ---
function iniciarEstadio(perfilId, estadio) {
  const rival = RIVALES[Math.floor(Math.random() * RIVALES.length)];
  const sesion = { hechos: 0, total: estadio.retos, golesRival: 0, rival };
  jugarReto(perfilId, estadio, sesion);
}

async function jugarReto(perfilId, estadio, sesion) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true });

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.siguiente(progreso, indice);
  const puzzle = await (await fetch(entrada.ruta)).json();

  // El último reto de la serie es la "jugada decisiva" (TG.1): más teatro, sin cambiar la
  // mecánica (sigue siendo un reto normal, solo se presenta con más tensión).
  const esDecisivo = sesion.hechos === sesion.total - 1;

  // Pantalla de reto como "panel de videojuego": el #app deja de ser una sola tarjeta blanca y pasa a
  // apilar paneles flotando sobre el césped (banner de estadio, cápsula de misión, zona de juego, Capi).
  const app = document.getElementById('app');
  app.className = 'pantalla-reto';

  const banner = crearBannerEstadio(estadio, sesion);
  app.appendChild(banner);
  app.appendChild(crearCapsulaMision(puzzle, sesion, esDecisivo, entrada.esRepaso));

  const zonaJuego = document.createElement('div');
  zonaJuego.className = esDecisivo ? 'zona-juego zona-juego-decisiva' : 'zona-juego';
  app.appendChild(zonaJuego);

  const tarjetaCapi = crearTarjetaCapi(puzzle, esDecisivo, entrada.esRepaso);
  app.appendChild(tarjetaCapi);

  // El rival solo "marca" una vez por reto (el primer fallo), aunque el niño falle varias veces
  // probando opciones: no queremos inflar el marcador por tanteo, solo dar tensión real.
  let falloContado = false;

  const capacidades = Engine.render(
    puzzle,
    zonaJuego,
    (puzzleResuelto, resultado) => {
      const progresoActual = Storage.cargarProgreso(perfilId);
      progresoActual.ultimoPuzleId = puzzleResuelto.id;
      Progression.actualizar(progresoActual, indice, puzzleResuelto.concepto, puzzleResuelto.fase_cpa, resultado, entrada.esRepaso);
      Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
      const desbloqueado = revisarDesbloqueo(progresoActual);
      if (desbloqueado) modoRecienDesbloqueado = desbloqueado;
      otorgarRecompensa(progresoActual, puzzleResuelto.estrategia);
      otorgarInsigniasProceso(progresoActual, puzzleResuelto, resultado);
      Storage.guardarProgreso(perfilId, progresoActual);
      Sonido.sonidoAcierto();
      celebrarAcierto(zonaJuego, recompensas.energiaPorPuzle);
      reaccionarCapi(tarjetaCapi, 'alegria', fraseAcierto(resultado));
      mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, brilloEnergia: true });
      // El reto ya está resuelto: los poderes dejan de poder usarse (no tiene sentido gastar
      // energía en una pregunta que ya se acertó, mientras el niño ve la celebración).
      zonaJuego.querySelectorAll('.boton-poder').forEach((b) => { b.disabled = true; });

      sesion.hechos++;
      if (sesion.hechos >= sesion.total) {
        mostrarPartidoGanado(perfilId, estadio, sesion);
      } else {
        mostrarBotonSiguiente(perfilId, estadio, sesion);
      }
    },
    () => {
      // Tras el primer fallo, Capi pasa a "duda" y anima a pedir pista (sistema de expresiones);
      // el marcador refleja la presión del rival (TG.1), pero solo cuenta el primer fallo del reto.
      // El rival "Fueras de Juego" (TG.6) da sentido narrativo al fallo: no "te equivocaste",
      // sino "te ha robado el balón" — el dato es el mismo, el envoltorio emocional es mejor.
      let fraseFallo = 'Casi. Piensa otra vez… ¿quieres una pista?';
      if (!falloContado) {
        falloContado = true;
        sesion.golesRival++;
        const marcador = banner.querySelector('.marcador-partido');
        if (marcador) marcador.textContent = `${sesion.hechos} - ${sesion.golesRival}`;
        if (sesion.rival) {
          fraseFallo = `¡${sesion.rival.nombre} te ha robado el balón! Recupéralo: piensa otra vez.`;
          const rivalImg = banner.querySelector('#rival-mini-actual');
          if (rivalImg) {
            rivalImg.classList.remove('rival-ataca');
            void rivalImg.offsetWidth; // reinicia la animación
            rivalImg.classList.add('rival-ataca');
          }
        }
        // "Ojo del Águila" solo aparece tras el primer fallo, igual que el botón de pista.
        const ojoAguila = document.getElementById('poder-ojo-aguila');
        if (ojoAguila) ojoAguila.hidden = false;
      }
      reaccionarCapi(tarjetaCapi, 'duda', fraseFallo);
      Sonido.sonidoFallo();
    },
    () => {
      // Al pedir la primera pista, Capi da ánimos en vez de quedarse en la duda.
      reaccionarCapi(tarjetaCapi, 'animo', '¡Tú puedes! Aquí va una ayuda.');
    }
  );

  zonaJuego.appendChild(crearZonaPoderes(perfilId, capacidades));
}

// Panel de poderes (TG.7): gastar energía en ayudas que nunca revelan la respuesta directa.
// "Ojo del Águila" solo existe para opción múltiple (lo añade engine.js) y empieza oculto hasta
// el primer fallo; "Consejo del Capitán" está siempre disponible; "Tiempo Extra" solo existe en
// Relámpago (cronómetro de renderVerdaderoFalso). Cada poder se paga solo si tuvo efecto real.
function crearZonaPoderes(perfilId, capacidades) {
  const zona = document.createElement('div');
  zona.className = 'zona-poderes';

  const crearBoton = (poder, id, alUsar) => {
    const boton = document.createElement('button');
    boton.id = id;
    boton.className = 'boton-poder';
    const textoNormal = `${poder.icono} ${poder.nombre} (-${poder.costo}⚡)`;
    boton.textContent = textoNormal;

    boton.addEventListener('click', () => {
      const progreso = Storage.cargarProgreso(perfilId);
      if ((progreso.energia || 0) < poder.costo) {
        boton.textContent = 'Te falta energía ⚡';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      if (alUsar() === false) {
        boton.textContent = 'No hace falta aquí';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      progreso.energia -= poder.costo;
      Storage.guardarProgreso(perfilId, progreso);
      mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true });
      boton.disabled = true;
      boton.classList.add('boton-poder-usado');
    });

    zona.appendChild(boton);
    return boton;
  };

  if (capacidades.usarOjoAguila) {
    const boton = crearBoton(PODERES.ojo_aguila, 'poder-ojo-aguila', capacidades.usarOjoAguila);
    boton.hidden = true;
  }

  crearBoton(PODERES.consejo_capitan, 'poder-consejo-capitan', capacidades.usarConsejoCapitan);

  if (capacidades.usarTiempoExtra) {
    crearBoton(PODERES.tiempo_extra, 'poder-tiempo-extra', () => capacidades.usarTiempoExtra(PODERES.tiempo_extra.segundos));
  }

  return zona;
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

// Insignias de proceso (TG.4): premian el CÓMO se ha jugado, igual en cualquier concepto
// (a diferencia de las insignias de estrategia, que son por contenido matemático).
function otorgarInsigniasProceso(progreso, puzzle, resultado) {
  progreso.insigniasProceso = progreso.insigniasProceso || {};
  const sumar = (clave) => {
    progreso.insigniasProceso[clave] = (progreso.insigniasProceso[clave] || 0) + 1;
  };

  if (resultado.intentosFallidos === 0 && resultado.pistasUsadas === 0) sumar('sin_pistas');
  if (resultado.intentosFallidos >= 1) sumar('remontada');
  if (puzzle.tipo === 'verdadero_falso' && resultado.intentosFallidos === 0 && resultado.tiempoMs <= UMBRAL_VELOCISTA_MS) {
    sumar('velocista');
  }
}

// Banner con la identidad del estadio (escudo + nombre) y el marcador del partido (TG.1), arriba
// de la pantalla de reto. El marcador empieza en "aciertos - fallos del reto actual" y se va
// actualizando en vivo (ver jugarReto) para dar tensión real sin cambiar la mecánica de fondo.
function crearBannerEstadio(estadio, sesion) {
  const banner = document.createElement('div');
  banner.className = 'banner-estadio';
  banner.appendChild(UI.crearEscudo(estadio));
  const nombre = document.createElement('span');
  nombre.className = 'banner-estadio-nombre';
  nombre.textContent = `🏟 ${estadio.nombre}`;
  banner.appendChild(nombre);

  // El rival "Fueras de Juego" de este partido (TG.6): se anima al fallar (ver jugarReto).
  if (sesion.rival) {
    const rivalImg = document.createElement('img');
    rivalImg.className = 'rival-mini';
    rivalImg.id = 'rival-mini-actual';
    rivalImg.src = sesion.rival.imagen;
    rivalImg.alt = `Fuera de Juego: ${sesion.rival.nombre}`;
    rivalImg.title = `Tu rival hoy: ${sesion.rival.nombre}`;
    banner.appendChild(rivalImg);
  }

  const marcador = document.createElement('span');
  marcador.className = 'marcador-partido';
  marcador.title = 'Tu equipo - Rival';
  marcador.textContent = `${sesion.hechos} - ${sesion.golesRival}`;
  banner.appendChild(marcador);

  return banner;
}

// Cápsula de misión: en qué reto vas, qué concepto y fase, con una mini barra de progreso del
// partido. El último reto de la serie se presenta como "jugada decisiva" (TG.1, más teatro); un
// reto que vuelve de la cola de repaso (TG.5) lleva una pequeña etiqueta "🔁 Repaso".
function crearCapsulaMision(puzzle, sesion, esDecisivo, esRepaso) {
  const concepto = NOMBRES_CONCEPTO[puzzle.concepto] || puzzle.concepto;
  const capsula = document.createElement('div');
  capsula.className = esDecisivo ? 'capsula-mision capsula-decisiva' : 'capsula-mision';

  const linea = document.createElement('div');
  linea.className = 'capsula-linea';
  const reto = document.createElement('strong');
  reto.textContent = esDecisivo
    ? '⚡ ¡Penalti! Jugada decisiva'
    : `Reto ${sesion.hechos + 1} de ${sesion.total}`;
  const cpt = document.createElement('span');
  cpt.className = 'capsula-concepto';
  cpt.textContent = `⚽ ${concepto}`;
  linea.appendChild(reto);
  linea.appendChild(cpt);
  if (esRepaso && !esDecisivo) {
    const repaso = document.createElement('span');
    repaso.className = 'capsula-repaso';
    repaso.textContent = '🔁 Repaso';
    linea.appendChild(repaso);
  }
  const fase = document.createElement('span');
  fase.className = 'capsula-fase';
  fase.textContent = `Fase ${puzzle.fase_cpa}`;
  linea.appendChild(fase);
  capsula.appendChild(linea);

  const barra = document.createElement('div');
  barra.className = 'mini-progreso';
  for (let i = 0; i < sesion.total; i++) {
    const seg = document.createElement('span');
    seg.className = 'segmento';
    if (i < sesion.hechos) seg.classList.add('segmento-hecho');
    else if (i === sesion.hechos) seg.classList.add('segmento-actual');
    barra.appendChild(seg);
  }
  capsula.appendChild(barra);
  return capsula;
}

// Tarjeta del entrenador Capi: retrato grande, bocadillo y botón para escuchar el enunciado.
// En la jugada decisiva (TG.1) el primer mensaje sube la tensión; en un repaso (TG.5) avisa de
// que es un refuerzo, no un reto nuevo (la decisiva manda si coinciden, es más rara y más teatral).
function crearTarjetaCapi(puzzle, esDecisivo, esRepaso) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-capi';

  const img = document.createElement('img');
  img.id = 'avatar-capi-actual';
  img.className = 'capi-retrato';
  img.src = 'assets/img/capi/avatar-capi-concentracion.webp';
  img.alt = 'Capi, tu entrenador';
  tarjeta.appendChild(img);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'capi-cuerpo';

  const bocadillo = document.createElement('p');
  bocadillo.id = 'capi-bocadillo';
  bocadillo.className = 'bocadillo-capi';
  if (esDecisivo) {
    bocadillo.textContent = '¡Este es el momento, campeón! Concéntrate, sé que puedes.';
  } else if (esRepaso) {
    bocadillo.textContent = 'Te traigo un repaso de algo que se nos resistió. ¡Vamos a dominarlo!';
  } else {
    bocadillo.textContent = '¡Vamos, campeón! Escucha mi consejo.';
  }
  cuerpo.appendChild(bocadillo);

  const boton = document.createElement('button');
  boton.className = 'boton-voz';
  boton.textContent = '🔊 Escuchar';
  boton.addEventListener('click', () => Sonido.decirVoz(puzzle.enunciado.voz));
  cuerpo.appendChild(boton);

  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

// Cambia la pose y el bocadillo de Capi según lo que pasa, con un pequeño rebote.
function reaccionarCapi(tarjeta, estado, frase) {
  const poses = { normal: 'concentracion', duda: 'duda', alegria: 'alegria', animo: 'animo' };
  const img = tarjeta.querySelector('#avatar-capi-actual');
  const bocadillo = tarjeta.querySelector('#capi-bocadillo');
  if (img) img.src = `assets/img/capi/avatar-capi-${poses[estado] || 'concentracion'}.webp`;
  if (bocadillo) bocadillo.textContent = frase;
  tarjeta.classList.remove('capi-rebote');
  void tarjeta.offsetWidth; // reinicia la animación
  tarjeta.classList.add('capi-rebote');
}

// Convierte el feedback de acierto en una tarjeta de celebración con la energía ganada.
function celebrarAcierto(zonaJuego, energia) {
  const feedback = zonaJuego.querySelector('.feedback');
  if (!feedback) return;
  feedback.className = 'feedback feedback-correcto celebracion';
  feedback.innerHTML = '';
  const titulo = document.createElement('span');
  titulo.className = 'celebracion-titulo';
  titulo.textContent = '⚽ ¡Golazo!';
  const sub = document.createElement('span');
  sub.className = 'celebracion-sub';
  sub.textContent = '¡Muy bien! Has acertado.';
  const en = document.createElement('span');
  en.className = 'celebracion-energia';
  en.textContent = `+${energia} energía`;
  feedback.append(titulo, sub, en);
}

function mostrarBotonSiguiente(perfilId, estadio, sesion) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '⚽ Siguiente reto';
  boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  zona.appendChild(boton);
}

function mostrarPartidoGanado(perfilId, estadio, sesion) {
  UI.aplicarTema('recompensa');
  document.getElementById('app').className = 'lienzo';
  document.getElementById('app').innerHTML = '';
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progresoFinal = Storage.cargarProgreso(perfilId);

  // Toda la pantalla de victoria vive dentro de UN panel con fondo propio: así el texto se lee
  // siempre (antes flotaba directamente sobre el césped verde y los colores rojo/azul se perdían),
  // y la celebración queda recogida y con jerarquía clara.
  const panel = document.createElement('div');
  panel.className = 'panel-victoria';

  // Cabecera dorada de celebración: el titular grande que faltaba.
  const cabecera = document.createElement('div');
  cabecera.className = 'victoria-cabecera';
  const trofeo = document.createElement('span');
  trofeo.className = 'victoria-trofeo';
  trofeo.textContent = '🏆';
  const titulo = document.createElement('h2');
  titulo.className = 'victoria-titulo';
  titulo.textContent = '¡PARTIDO GANADO!';
  cabecera.append(trofeo, titulo);
  panel.appendChild(cabecera);

  const sub = document.createElement('p');
  sub.className = 'victoria-sub';
  sub.textContent = perfil
    ? `¡Gran partido, ${perfil.nombre}! ${estadio.nombre} conquistado.`
    : `¡Partido ganado en ${estadio.nombre}!`;
  panel.appendChild(sub);

  // Capi y el propio avatar del jugador celebran juntos (empatía: el niño ve "su" jugador, no
  // solo al entrenador). Los invitados no tienen pose "celebrando" propia: se quedan con Capi.
  const grupo = document.createElement('div');
  grupo.className = 'grupo-victoria';
  if (perfil && perfil.avatarCelebrando) {
    const jugador = document.createElement('img');
    jugador.className = 'avatar-victoria';
    jugador.src = perfil.avatarCelebrando;
    jugador.alt = `${perfil.nombre} celebra`;
    grupo.appendChild(jugador);
  }
  const capi = document.createElement('img');
  capi.className = 'capi-victoria';
  capi.src = 'assets/img/capi/avatar-capi-alegria.webp';
  capi.alt = '¡Capi celebra contigo!';
  grupo.appendChild(capi);
  panel.appendChild(grupo);

  // Marcador final con aspecto de marcador de estadio (TG.1): tú vs. el rival Fuera de Juego (TG.6).
  if (sesion) {
    const marcador = document.createElement('div');
    marcador.className = 'marcador-final';

    const ladoTu = document.createElement('div');
    ladoTu.className = 'marcador-lado';
    ladoTu.innerHTML = '<span class="marcador-equipo">TÚ</span>';

    const tanteo = document.createElement('span');
    tanteo.className = 'marcador-tanteo';
    tanteo.textContent = `${sesion.hechos} - ${sesion.golesRival}`;

    const ladoRival = document.createElement('div');
    ladoRival.className = 'marcador-lado';
    if (sesion.rival) {
      const img = document.createElement('img');
      img.className = 'marcador-rival-img';
      img.src = sesion.rival.imagen;
      img.alt = sesion.rival.nombre;
      const nom = document.createElement('span');
      nom.className = 'marcador-equipo';
      nom.textContent = sesion.rival.nombre;
      ladoRival.append(img, nom);
    } else {
      ladoRival.innerHTML = '<span class="marcador-equipo">RIVAL</span>';
    }

    marcador.append(ladoTu, tanteo, ladoRival);
    panel.appendChild(marcador);

    if (sesion.golesRival === 0) {
      const perfecta = document.createElement('p');
      perfecta.className = 'victoria-perfecta';
      perfecta.textContent = '⭐ ¡Victoria perfecta! No te marcaron ni una.';
      panel.appendChild(perfecta);
    }
    if (sesion.rival) {
      const rivalNota = document.createElement('p');
      rivalNota.className = 'rival-derrotado';
      rivalNota.textContent = `Has dejado fuera de juego a ${sesion.rival.nombre}. 🎉`;
      panel.appendChild(rivalNota);
    }
  }

  // Fila de premios: energía ganada en el partido y racha (TG.3). Cifras grandes y legibles.
  const premios = document.createElement('div');
  premios.className = 'victoria-premios';
  const energiaGanada = (sesion ? sesion.hechos : 0) * recompensas.energiaPorPuzle;
  const premioEnergia = document.createElement('span');
  premioEnergia.className = 'premio';
  premioEnergia.innerHTML = `<strong>⚡ +${energiaGanada}</strong> energía`;
  premios.appendChild(premioEnergia);
  if (progresoFinal.racha && progresoFinal.racha.dias > 0) {
    const premioRacha = document.createElement('span');
    premioRacha.className = 'premio';
    premioRacha.innerHTML = `<strong>🔥 ${progresoFinal.racha.dias}</strong> ${progresoFinal.racha.dias === 1 ? 'día' : 'días'} de racha`;
    premios.appendChild(premioRacha);
  }
  panel.appendChild(premios);

  // Si en este partido desbloqueó un equipo superior por ir sobrado, se lo ofrecemos aquí, destacado.
  if (modoRecienDesbloqueado) {
    const modo = modoRecienDesbloqueado;
    modoRecienDesbloqueado = null;

    const desbloqueo = document.createElement('div');
    desbloqueo.className = 'victoria-desbloqueo';
    const aviso = document.createElement('p');
    aviso.textContent = `¡Vas sobrado! Has desbloqueado el equipo ${modo.icono} ${modo.nombre}.`;
    desbloqueo.appendChild(aviso);
    const probar = document.createElement('button');
    probar.className = 'boton-siguiente';
    probar.textContent = `Jugar en ${modo.nombre}`;
    probar.addEventListener('click', () => {
      const progreso = Storage.cargarProgreso(perfilId);
      progreso.modoId = modo.id;
      Storage.guardarProgreso(perfilId, progreso);
      mostrarCalendario(perfilId);
    });
    desbloqueo.appendChild(probar);
    panel.appendChild(desbloqueo);
  }

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '🏟 Volver al calendario';
  boton.addEventListener('click', () => mostrarCalendario(perfilId));
  panel.appendChild(boton);

  // Gancho para mañana (TG.3): mantiene viva la racha de entrenamiento, al pie del panel.
  if (progresoFinal.racha && progresoFinal.racha.dias > 0) {
    const teaser = document.createElement('p');
    teaser.className = 'teaser-racha';
    teaser.textContent = '¡Vuelve mañana a por tu próximo partido y no pierdas la racha!';
    panel.appendChild(teaser);
  }

  zona.appendChild(panel);
  Sonido.sonidoVictoria();
  UI.celebrarVictoria(panel);
}

// Da energía y, según la estrategia usada, una insignia distinta. Modifica el progreso recibido.
function otorgarRecompensa(progreso, estrategia) {
  progreso.energia = (progreso.energia || 0) + recompensas.energiaPorPuzle;
  if (recompensas.insignias[estrategia]) {
    progreso.insignias = progreso.insignias || {};
    progreso.insignias[estrategia] = (progreso.insignias[estrategia] || 0) + 1;
  }
}

// Chip de insignia para la barra de perfil (icono o imagen + contador): lo comparten las
// insignias de estrategia y las de proceso, que solo se diferencian en de dónde sale la definición.
function crearChipInsignia(insignia, cantidad) {
  if (!insignia) return null;
  const span = document.createElement('span');
  span.title = `${insignia.nombre} (x${cantidad})`;
  if (insignia.imagen) {
    const img = document.createElement('img');
    img.src = insignia.imagen;
    img.alt = insignia.nombre;
    img.className = 'icono-insignia';
    span.appendChild(img);
  } else {
    span.textContent = `${insignia.icono} `;
  }
  return span;
}

function mostrarBarraPerfil(perfilId, opciones) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progreso = Storage.cargarProgreso(perfilId);
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  barra.appendChild(UI.crearAvatarMini(perfil));

  const texto = document.createElement('span');
  texto.className = 'barra-jugando';
  texto.textContent = `Jugando: ${perfil.nombre}`;
  barra.appendChild(texto);

  const energia = document.createElement('span');
  energia.className = 'barra-energia';
  if (opciones && opciones.brilloEnergia) energia.classList.add('brillo-energia');
  energia.textContent = `⚡ ${progreso.energia || 0}`;
  barra.appendChild(energia);

  // Racha de días jugados (TG.3): solo se muestra si ya hay al menos un día contado.
  if (progreso.racha && progreso.racha.dias > 0) {
    const racha = document.createElement('span');
    racha.className = 'barra-racha';
    racha.title = `${progreso.racha.dias} ${progreso.racha.dias === 1 ? 'día seguido' : 'días seguidos'} jugando`;
    racha.textContent = `🔥 ${progreso.racha.dias}`;
    barra.appendChild(racha);
  }

  Object.keys(progreso.insignias || {}).forEach((estrategia) => {
    const chip = crearChipInsignia(recompensas.insignias[estrategia], progreso.insignias[estrategia]);
    if (chip) barra.appendChild(chip);
  });

  // Insignias de proceso (TG.4): el CÓMO se ha jugado, no el contenido matemático.
  Object.keys(progreso.insigniasProceso || {}).forEach((clave) => {
    const chip = crearChipInsignia(recompensas.insigniasProceso[clave], progreso.insigniasProceso[clave]);
    if (chip) barra.appendChild(chip);
  });

  if (opciones && opciones.mostrarVolver) {
    const volver = document.createElement('button');
    volver.textContent = 'Volver al calendario';
    volver.addEventListener('click', () => mostrarCalendario(perfilId));
    barra.appendChild(volver);
  }

  if (modoDe(perfilId) && !(opciones && opciones.ocultarCambiarEquipo)) {
    const cambiarModo = document.createElement('button');
    cambiarModo.textContent = 'Cambiar de equipo';
    cambiarModo.addEventListener('click', () => mostrarSelectorModo(perfilId));
    barra.appendChild(cambiarModo);
  }

  const sonidoBoton = document.createElement('button');
  sonidoBoton.className = 'boton-sonido';
  sonidoBoton.title = 'Activar o desactivar el sonido';
  sonidoBoton.textContent = Sonido.activo ? '🔊' : '🔇';
  sonidoBoton.addEventListener('click', () => {
    sonidoBoton.textContent = Sonido.alternar() ? '🔊' : '🔇';
  });
  barra.appendChild(sonidoBoton);

  const boton = document.createElement('button');
  boton.textContent = 'Cambiar de jugador';
  boton.addEventListener('click', () => {
    Storage.borrarPerfilActivo();
    mostrarSelectorPerfil();
  });
  barra.appendChild(boton);
}

function limpiarPantalla() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'lienzo'; // por defecto, tarjeta blanca; la pantalla de reto lo cambia a 'pantalla-reto'
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';
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
