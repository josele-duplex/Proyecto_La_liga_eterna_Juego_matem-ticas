// Pantalla 3: calendario de la Liga (elegir estadio).
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

  // Contrato del Día (FASE M2, U2): se asegura (asigna si no había uno hoy) y se muestra siempre
  // que se entra al calendario, no solo la primera vez, para que el niño pueda ver su progreso.
  const indiceModo = indicesPorEdad[modo.edad];
  if (indiceModo) {
    const progresoParaContrato = Storage.cargarProgreso(perfilId);
    const contrato = asegurarContratoDelDia(progresoParaContrato, indiceModo, contratos);
    Storage.guardarProgreso(perfilId, progresoParaContrato);
    app.appendChild(crearTarjetaContrato(contrato));
  }

  // Niveles de Dominio (FASE M1, U1): un vistazo rápido a 🥉🥈🥇 por concepto del equipo actual.
  if (indiceModo) {
    app.appendChild(crearFranjaNiveles(Storage.cargarProgreso(perfilId), indiceModo));
  }

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

  // Partido especial del día (C.3 ligero): un partido con una condición distinta cada día, para
  // variar la dinámica. Se juega en el primer estadio del calendario; solo cambia la condición.
  const especialHoy = partidoEspecialDeHoy();
  const tarjetaEspecial = document.createElement('div');
  tarjetaEspecial.className = 'estadio tarjeta-especial';
  const nombreEspecial = document.createElement('h2');
  nombreEspecial.textContent = `${especialHoy.icono} ${especialHoy.nombre}`;
  tarjetaEspecial.appendChild(nombreEspecial);
  const descEspecial = document.createElement('p');
  descEspecial.textContent = `Partido especial de hoy: ${especialHoy.descripcion} Bono: +${especialHoy.bono}⚡`;
  tarjetaEspecial.appendChild(descEspecial);
  const jugarEspecial = document.createElement('button');
  jugarEspecial.className = 'boton-siguiente';
  jugarEspecial.textContent = 'Aceptar el desafío';
  jugarEspecial.addEventListener('click', () => iniciarEstadio(perfilId, calendario.estadios[0], especialHoy));
  tarjetaEspecial.appendChild(jugarEspecial);
  lista.appendChild(tarjetaEspecial);

  app.appendChild(lista);

  // Modos especiales (FASE M5, 14.5): Entrenamiento del Capitán (práctica libre, no toca la
  // progresión) y Contrarreloj (rondas de Relámpago a toda velocidad, opt-in). El tercer modo de
  // la fase, la dificultad Entrenador/Profesional, ya está siempre visible como chip en la barra
  // de perfil de arriba — no necesita una tarjeta propia aquí.
  const subtitulo = document.createElement('h3');
  subtitulo.className = 'subtitulo-calendario';
  subtitulo.textContent = 'Modos especiales';
  app.appendChild(subtitulo);

  const especiales = document.createElement('div');
  especiales.className = 'calendario';

  const tarjetaEntrenamiento = document.createElement('div');
  tarjetaEntrenamiento.className = 'estadio';
  const nombreEntrenamiento = document.createElement('h2');
  nombreEntrenamiento.textContent = '🎯 Entrenamiento del Capitán';
  tarjetaEntrenamiento.appendChild(nombreEntrenamiento);
  const descEntrenamiento = document.createElement('p');
  descEntrenamiento.textContent = 'Practica el concepto que quieras, sin rival ni marcador. No afecta a tu partido de Liga.';
  tarjetaEntrenamiento.appendChild(descEntrenamiento);
  const botonEntrenamiento = document.createElement('button');
  botonEntrenamiento.className = 'boton-siguiente';
  botonEntrenamiento.textContent = 'Entrenar';
  botonEntrenamiento.addEventListener('click', () => mostrarSelectorEntrenamiento(perfilId));
  tarjetaEntrenamiento.appendChild(botonEntrenamiento);
  especiales.appendChild(tarjetaEntrenamiento);

  const tarjetaContrarreloj = document.createElement('div');
  tarjetaContrarreloj.className = 'estadio';
  const nombreContrarreloj = document.createElement('h2');
  nombreContrarreloj.textContent = '⚡ Contrarreloj';
  tarjetaContrarreloj.appendChild(nombreContrarreloj);
  const descContrarreloj = document.createElement('p');
  descContrarreloj.textContent = `${RONDAS_CONTRARRELOJ} rondas de Relámpago a toda velocidad. Aquí sí cuenta ir rápido.`;
  tarjetaContrarreloj.appendChild(descContrarreloj);
  const botonContrarreloj = document.createElement('button');
  botonContrarreloj.className = 'boton-siguiente';
  botonContrarreloj.textContent = 'Jugar Contrarreloj';
  botonContrarreloj.addEventListener('click', () => iniciarContrarreloj(perfilId));
  tarjetaContrarreloj.appendChild(botonContrarreloj);
  especiales.appendChild(tarjetaContrarreloj);

  // Copa de Leyendas (FASE M7, B.2): serie de retos mixtos con conceptos que el jugador YA domina
  // (Titular o Crack) en su equipo actual. Si todavía no hay ninguno, se muestra bloqueada (mismo
  // patrón visual que un equipo sin desbloquear en modo.js) en vez de arrancar una sesión vacía.
  const tarjetaCopa = document.createElement('div');
  tarjetaCopa.className = 'estadio';
  const nombreCopa = document.createElement('h2');
  nombreCopa.textContent = '🏆 Copa de Leyendas';
  tarjetaCopa.appendChild(nombreCopa);

  const dominados = indiceModo ? conceptosDominadosDe(Storage.cargarProgreso(perfilId), indiceModo) : [];
  if (dominados.length > 0) {
    const descCopa = document.createElement('p');
    descCopa.textContent = `${RONDAS_COPA} retos mixtos de nivel 🟣 Élite, con conceptos que ya dominas.`;
    tarjetaCopa.appendChild(descCopa);
    const botonCopa = document.createElement('button');
    botonCopa.className = 'boton-siguiente';
    botonCopa.textContent = 'Jugar la Copa';
    botonCopa.addEventListener('click', () => iniciarCopa(perfilId));
    tarjetaCopa.appendChild(botonCopa);
  } else {
    tarjetaCopa.classList.add('estadio-bloqueado');
    const avisoCopa = document.createElement('p');
    avisoCopa.className = 'aviso-bloqueado';
    avisoCopa.textContent = 'Domina (Titular o Crack) al menos un concepto de tu equipo actual para desbloquearla.';
    tarjetaCopa.appendChild(avisoCopa);
  }
  especiales.appendChild(tarjetaCopa);

  app.appendChild(especiales);
}

// Tarjeta del Contrato del Día (FASE M2, U2): el texto de Capi, una barra de progreso y el estado
// (en curso o ya cumplido). Se ve cada vez que se entra al calendario, no solo la primera del día.
function crearTarjetaContrato(contrato) {
  const tarjeta = document.createElement('div');
  tarjeta.className = contrato.cumplido ? 'tarjeta-contrato contrato-cumplido' : 'tarjeta-contrato';

  const texto = document.createElement('p');
  texto.className = 'contrato-texto';
  texto.textContent = `📋 ${textoContrato(contrato, contratos)}`;
  tarjeta.appendChild(texto);

  const barra = document.createElement('div');
  barra.className = 'contrato-barra';
  const relleno = document.createElement('div');
  relleno.className = 'contrato-relleno';
  relleno.style.width = `${Math.min(100, Math.round((contrato.avance / contrato.objetivo) * 100))}%`;
  barra.appendChild(relleno);
  tarjeta.appendChild(barra);

  const estado = document.createElement('p');
  estado.className = 'contrato-estado';
  estado.textContent = contrato.cumplido
    ? `✅ ¡Contrato cumplido! +${contrato.bonus}⚡`
    : `${contrato.avance} de ${contrato.objetivo} · recompensa ⚡${contrato.bonus}`;
  tarjeta.appendChild(estado);

  return tarjeta;
}

// Franja de Niveles de Dominio (FASE M1, U1): un chip por concepto del equipo actual, con su
// icono 🥉🥈🥇 (o ⚪ si el jugador aún no lo ha empezado). Da un vistazo del progreso global sin
// tener que entrar a jugar; la misma escala se ve en el brillo de los cromos de la barra superior.
function crearFranjaNiveles(progreso, indice) {
  const franja = document.createElement('div');
  franja.className = 'franja-niveles';
  Progression.conceptos(indice).forEach((concepto) => {
    const nivel = Progression.nivelDominioConcepto(progreso, concepto);
    const nombreConcepto = NOMBRES_CONCEPTO[concepto] || concepto;

    const chip = document.createElement('span');
    chip.className = nivel ? `chip-nivel cromo-nivel-${nivel}` : 'chip-nivel chip-nivel-vacio';
    chip.title = nivel
      ? `${nombreConcepto}: ${NIVELES_DOMINIO[nivel].nombre}`
      : `${nombreConcepto}: todavía sin empezar`;

    // Medalla SVG propia para los niveles ya alcanzados (FASE V1, Plan V2): mismo trazo en
    // cualquier plataforma. Sin nivel (aún sin empezar) se deja el círculo hueco, que no forma
    // parte del alcance de los 5-6 iconos de interfaz a sustituir.
    let icono;
    if (nivel) {
      icono = document.createElement('img');
      icono.src = NIVELES_DOMINIO[nivel].imagenSvg;
      icono.alt = NIVELES_DOMINIO[nivel].nombre;
      icono.className = 'icono-medalla';
    } else {
      icono = document.createElement('span');
      icono.textContent = '⚪';
    }
    const nombre = document.createElement('span');
    nombre.textContent = nombreConcepto;

    chip.append(icono, nombre);
    franja.appendChild(chip);
  });
  return franja;
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
    ? fraseCapi('saludo_racha_n', { nombre, dias })
    : fraseCapi('saludo_racha_1', { nombre });
  saludo.appendChild(texto);

  return saludo;
}
