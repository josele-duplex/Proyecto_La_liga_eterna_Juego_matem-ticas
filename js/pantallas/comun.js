// Piezas compartidas por varias pantallas: limpiar el lienzo antes de pintar una pantalla nueva,
// el chip de insignia (icono/imagen + contador) y la barra superior de perfil.

function limpiarPantalla() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'lienzo'; // por defecto, tarjeta blanca; la pantalla de reto lo cambia a 'pantalla-reto'
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';
}

// FASE D6 (rediseño premium, auditoría §8): balón girando mientras se hace fetch() del próximo
// puzle. Se llama justo después de limpiarPantalla() (así ocupa el hueco vacío) en cada pantalla
// que carga un reto (reto.js, entrenamiento.js, copa.js, contrarreloj.js); quien lo llama es quien
// vuelve a vaciar #app al recibir el JSON, así que no hace falta una función para quitarlo.
function mostrarCargaBalon() {
  const app = document.getElementById('app');
  const carga = document.createElement('div');
  carga.className = 'carga-balon';
  const balon = document.createElement('span');
  balon.className = 'balon-girando';
  const texto = document.createElement('p');
  texto.textContent = 'Preparando la jugada…';
  carga.append(balon, texto);
  app.appendChild(carga);
}

// Chip de insignia para la barra de perfil (icono o imagen + contador): lo comparten las
// insignias de estrategia y las de proceso, que solo se diferencian en de dónde sale la definición.
// `nivel` (FASE M1, U1, opcional: solo insignias de estrategia lo llevan) añade el brillo del
// cromo según su Nivel de Dominio — la MISMA escala 🥉🥈🥇 que se ve en el calendario, no una
// segunda taxonomía de "cromo dorado" aparte.
function crearChipInsignia(insignia, cantidad, nivel) {
  if (!insignia) return null;
  const span = document.createElement('span');
  span.title = nivel
    ? `${insignia.nombre} (x${cantidad}) · ${NIVELES_DOMINIO[nivel].nombre}`
    : `${insignia.nombre} (x${cantidad})`;
  if (nivel) span.classList.add(`cromo-nivel-${nivel}`);
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

// Bloques de "acabas de desbloquear algo" (equipo nuevo por ir sobrado / Leyenda del Museo):
// comunes a la pantalla de victoria de Liga (FASE M3/rediseño) y al resumen de Contrarreloj (FASE
// M5), que también pueden dispararlos. Consume y limpia las variables globales de aviso pendiente
// (main.js), así solo se celebran una vez. Devuelve un array de elementos listos para añadir al panel.
function crearBloquesDesbloqueo(perfilId) {
  const bloques = [];

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
    // FASE M7 (B.3 reducido): en vez de saltar directo al calendario, pasa antes por una ceremonia
    // de ascenso breve y celebratoria. La ceremonia es quien marca progreso.ascensosCelebrados y
    // ajusta modoId al aceptar — este botón ya no lo hace directamente.
    probar.addEventListener('click', () => mostrarCeremoniaAscenso(perfilId, modo));
    desbloqueo.appendChild(probar);
    bloques.push(desbloqueo);
  }

  if (leyendaRecienDesbloqueada) {
    const leyenda = leyendaRecienDesbloqueada;
    leyendaRecienDesbloqueada = null;

    const desbloqueoLeyenda = document.createElement('div');
    desbloqueoLeyenda.className = 'victoria-desbloqueo';
    const aviso = document.createElement('p');
    aviso.textContent = `🏛 ¡Has desbloqueado una Leyenda del Orden: ${leyenda.icono} ${leyenda.nombre}!`;
    desbloqueoLeyenda.appendChild(aviso);
    const verMuseo = document.createElement('button');
    verMuseo.className = 'boton-siguiente';
    verMuseo.textContent = 'Ver en el Museo';
    verMuseo.addEventListener('click', () => mostrarMuseo(perfilId));
    desbloqueoLeyenda.appendChild(verMuseo);
    bloques.push(desbloqueoLeyenda);
  }

  return bloques;
}

// Barra superior (FASE D2, HUD compacto — Docs/PLAN_REDISENO_VISUAL_PREMIUM.md): antes era una
// única fila donde datos (energía, racha, cromos...) y acciones (Museo, cambiar equipo, sonido...)
// competían con el mismo peso visual, hasta 8+ elementos que envolvían en 2-3 filas en móvil (la
// auditoría UX/UI lo señaló como jerarquía confusa). Ahora se separan en dos bloques: `.hud-datos`
// (izquierda, "lo que tienes": avatar, energía, nivel del equipo, trofeos, racha) y
// `.hud-acciones` (derecha, "a dónde ir": siempre visibles solo Volver y el chip de dificultad —
// el resto vive colapsado tras "☰ Más"). La colección completa de cromos por estrategia ya NO se
// repite aquí (crecía sin límite): se ve entera en la Vitrina de Trofeos del Museo.
function mostrarBarraPerfil(perfilId, opciones) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progreso = Storage.cargarProgreso(perfilId);
  const barra = document.getElementById('barra-perfil');
  barra.innerHTML = '';

  // Tipografía para dislexia (FASE M8, D.6): se aplica en <html>, no en <body>, a propósito — el
  // body cambia entero de className en cada UI.aplicarTema('tema-...') de cualquier pantalla, así
  // que una clase de accesibilidad ahí se perdería en la siguiente pantalla. mostrarBarraPerfil ya
  // se llama desde CASI todas las pantallas del juego, así que es el único sitio que hace falta
  // tocar para que el ajuste se mantenga siempre, sin depender de cada pantalla nueva que se añada.
  document.documentElement.classList.toggle('modo-dislexia', !!(progreso.ajustes && progreso.ajustes.tipografiaDislexia));

  const datos = document.createElement('div');
  datos.className = 'hud-datos';

  datos.appendChild(UI.crearAvatarMini(perfil));

  const texto = document.createElement('span');
  texto.className = 'barra-jugando';
  texto.textContent = perfil.nombre;
  datos.appendChild(texto);

  // Iconos SVG propios (FASE V1, Plan V2) en vez de emoji: se ven igual en cualquier
  // plataforma. progreso.energia/racha.dias son siempre números (nunca texto del usuario),
  // así que construir con innerHTML aquí es seguro.
  const energia = document.createElement('span');
  energia.className = 'barra-energia hud-chip';
  if (opciones && opciones.brilloEnergia) energia.classList.add('brillo-energia');
  energia.innerHTML = `<img src="assets/icons-svg/rayo.svg" alt="" class="icono-svg-inline"> ${progreso.energia || 0}`;
  // Tocar la energía abre la Guía del Capi ("¿qué es esto y para qué sirve?") — salvo en mitad
  // de un reto, donde navegar fuera abandonaría la pregunta (mismo criterio que el botón Museo).
  energia.title = 'Tu energía. Toca para ver la Guía del Capi.';
  if (!(opciones && opciones.ocultarMuseo)) {
    energia.classList.add('barra-energia-tocable');
    energia.addEventListener('click', () => mostrarMuseo(perfilId, 'guia'));
  }
  datos.appendChild(energia);

  // Nivel de dominio del EQUIPO (FASE D2): un único chip agregado ("cuántos conceptos dominas del
  // todo") en vez de la fila creciente de un cromo por estrategia que había antes aquí — esa
  // colección completa se ve en la Vitrina de Trofeos del Museo, no hace falta repetirla arriba.
  const modoParaNivel = modoDe(perfilId);
  const indiceParaNivel = modoParaNivel ? indicesPorEdad[modoParaNivel.edad] : null;
  if (indiceParaNivel) {
    const nivelEquipo = nivelDominioEquipoDe(progreso, indiceParaNivel);
    const chipNivel = document.createElement('span');
    chipNivel.className = 'hud-chip';
    chipNivel.title = `${nivelEquipo.crack} de ${nivelEquipo.total} conceptos dominados del todo (🥇 Crack) en ${modoParaNivel.nombre}`;
    chipNivel.innerHTML = `<img src="${NIVELES_DOMINIO.crack.imagenSvg}" alt="" class="icono-svg-inline"> ${nivelEquipo.crack}/${nivelEquipo.total}`;
    datos.appendChild(chipNivel);
  }

  // Trofeos (FASE M6/M7, ya existentes en progreso.trofeos): total de partidos + Copas +
  // Contrarrelojes ganados, un único número que crece con cada victoria. El palmarés detallado
  // (uno por tipo) sigue en la Vitrina.
  const trofeos = progreso.trofeos || { partidos: 0, copas: 0, contrarrelojes: 0 };
  const totalTrofeos = trofeos.partidos + trofeos.copas + trofeos.contrarrelojes;
  const chipTrofeos = document.createElement('span');
  chipTrofeos.className = 'hud-chip';
  chipTrofeos.title = `${totalTrofeos} ${totalTrofeos === 1 ? 'trofeo ganado' : 'trofeos ganados'} en total. Ver la Vitrina completa en el Museo.`;
  chipTrofeos.textContent = `🏅 ${totalTrofeos}`;
  datos.appendChild(chipTrofeos);

  // Racha de días jugados (TG.3): solo se muestra si ya hay al menos un día contado.
  if (progreso.racha && progreso.racha.dias > 0) {
    const racha = document.createElement('span');
    racha.className = 'barra-racha hud-chip';
    racha.title = `${progreso.racha.dias} ${progreso.racha.dias === 1 ? 'día seguido' : 'días seguidos'} jugando`;
    racha.innerHTML = `<img src="assets/icons-svg/llama.svg" alt="" class="icono-svg-inline"> ${progreso.racha.dias}`;
    datos.appendChild(racha);
  }

  barra.appendChild(datos);

  const acciones = document.createElement('div');
  acciones.className = 'hud-acciones';

  if (opciones && opciones.mostrarVolver) {
    const volver = document.createElement('button');
    volver.className = 'hud-boton-volver';
    volver.textContent = 'Volver al calendario';
    volver.addEventListener('click', () => mostrarCalendario(perfilId));
    acciones.appendChild(volver);
  }

  // Modo de dificultad (FASE M5, B.7 modificado): indicador SIEMPRE visible, nunca una evaluación
  // de capacidad — por eso queda fuera del menú colapsado "☰ Más", no es una acción de navegación
  // sino un ajuste que siempre debe verse. Un toque alterna en círculo entre los tres modos (Élite
  // añadida en FASE M7). El copy de Profesional/Élite es LITERAL (regla del plan, sección 8).
  const chipDificultad = document.createElement('button');
  chipDificultad.className = 'chip-dificultad';
  const TITULOS_DIFICULTAD = {
    entrenador: 'Modo Entrenador: pistas automáticas activadas.',
    profesional: 'Modo Profesional: juegas en una liga más difícil (sin pistas automáticas).',
    elite: 'Modo Élite: juegas en la liga más difícil (sin pistas automáticas).'
  };
  const pintarDificultad = () => {
    const info = MODOS_DIFICULTAD[dificultadDe(Storage.cargarProgreso(perfilId))];
    chipDificultad.textContent = `${info.icono} ${info.nombre}`;
    chipDificultad.title = TITULOS_DIFICULTAD[info.id];
  };
  pintarDificultad();
  chipDificultad.addEventListener('click', () => {
    const p = Storage.cargarProgreso(perfilId);
    alternarDificultad(p);
    Storage.guardarProgreso(perfilId, p);
    pintarDificultad();
  });
  acciones.appendChild(chipDificultad);

  // Menú "☰ Más" (FASE D2): agrupa las acciones secundarias que antes competían en la misma fila
  // (Cambiar equipo, Museo, Mi Estadio, Familia, sonido, Cambiar jugador). Se abre/cierra con un
  // toque; un click fuera del menú también lo cierra (con limpieza explícita del listener de
  // documento en cada camino de salida, para no acumular uno nuevo cada vez que se reconstruye
  // la barra — cosa que pasa en CADA cambio de pantalla).
  const botonMas = document.createElement('button');
  botonMas.className = 'hud-menu-boton';
  botonMas.textContent = '☰ Más';
  botonMas.title = 'Más opciones';
  acciones.appendChild(botonMas);

  const menu = document.createElement('div');
  menu.className = 'hud-menu';
  let cerrarAlTocarFuera = null;
  const cerrarMenu = () => {
    menu.classList.remove('hud-menu-abierto');
    if (cerrarAlTocarFuera) {
      document.removeEventListener('click', cerrarAlTocarFuera);
      cerrarAlTocarFuera = null;
    }
  };
  botonMas.addEventListener('click', (evento) => {
    evento.stopPropagation();
    const seAbre = !menu.classList.contains('hud-menu-abierto');
    cerrarMenu();
    if (seAbre) {
      menu.classList.add('hud-menu-abierto');
      cerrarAlTocarFuera = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== botonMas) cerrarMenu();
      };
      // En el siguiente tick, para no capturar este mismo click que acaba de abrir el menú.
      setTimeout(() => document.addEventListener('click', cerrarAlTocarFuera), 0);
    }
  });

  // Cada opción del menú cierra el menú (y su listener de documento) antes de navegar — igual de
  // importante que el cierre por click-fuera, porque un click EN un botón del menú nunca pasa por
  // esa ruta (el botón está "dentro" del menú, no "fuera").
  const anadirOpcionMenu = (etiqueta, alPulsar) => {
    const boton = document.createElement('button');
    boton.textContent = etiqueta;
    boton.addEventListener('click', () => {
      cerrarMenu();
      alPulsar();
    });
    menu.appendChild(boton);
  };

  if (modoDe(perfilId) && !(opciones && opciones.ocultarCambiarEquipo)) {
    anadirOpcionMenu('Cambiar de equipo', () => mostrarSelectorModo(perfilId));
  }

  // Museo de la Liga (FASE M3) y Mi Estadio (FASE M6): consultables desde cualquier pantalla
  // salvo durante el reto (donde distraerían a mitad de una pregunta).
  if (!(opciones && opciones.ocultarMuseo)) {
    anadirOpcionMenu('🏛 Museo', () => mostrarMuseo(perfilId));
    anadirOpcionMenu('🏟️ Mi Estadio', () => mostrarMiEstadio(perfilId));
    anadirOpcionMenu('👪 Familia', () => mostrarPuertaAdulto(perfilId, () => mostrarPanelFamilia(perfilId)));
  }

  const opcionSonido = document.createElement('button');
  opcionSonido.className = 'boton-sonido';
  const pintarSonido = () => { opcionSonido.textContent = Sonido.activo ? '🔊 Sonido activado' : '🔇 Sonido silenciado'; };
  pintarSonido();
  opcionSonido.addEventListener('click', () => {
    Sonido.alternar();
    pintarSonido();
  });
  menu.appendChild(opcionSonido);

  anadirOpcionMenu('Cambiar de jugador', () => {
    Storage.borrarPerfilActivo();
    mostrarSelectorPerfil();
  });

  acciones.appendChild(menu);
  barra.appendChild(acciones);
}
