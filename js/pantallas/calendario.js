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

  // Niveles de Dominio (FASE M1, U1): un vistazo rápido a 🥉🥈🥇 por concepto del equipo actual.
  const indiceModo = indicesPorEdad[modo.edad];
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
  app.appendChild(lista);
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

    const icono = document.createElement('span');
    icono.textContent = nivel ? NIVELES_DOMINIO[nivel].icono : '⚪';
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
    ? `¡Hola, ${nombre}! Llevas ${dias} días seguidos entrenando. 🔥 ¡Sigue así!`
    : `¡Hola, ${nombre}! Hoy empieza tu racha de entrenamiento. 🔥`;
  saludo.appendChild(texto);

  return saludo;
}
