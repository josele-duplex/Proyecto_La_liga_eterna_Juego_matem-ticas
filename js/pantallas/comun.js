// Piezas compartidas por varias pantallas: limpiar el lienzo antes de pintar una pantalla nueva,
// el chip de insignia (icono/imagen + contador) y la barra superior de perfil.

function limpiarPantalla() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.className = 'lienzo'; // por defecto, tarjeta blanca; la pantalla de reto lo cambia a 'pantalla-reto'
  document.getElementById('siguiente').innerHTML = '';
  document.getElementById('progreso').textContent = '';
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

  // El nivel de dominio (para el brillo) necesita el índice de puzles del equipo actual; si el
  // jugador todavía no ha elegido equipo (p. ej. en la propia pantalla de selección), se omite.
  const modoParaNivel = modoDe(perfilId);
  const indiceParaNivel = modoParaNivel ? indicesPorEdad[modoParaNivel.edad] : null;

  Object.keys(progreso.insignias || {}).forEach((estrategia) => {
    const nivel = indiceParaNivel ? Progression.nivelDominioEstrategia(progreso, indiceParaNivel, estrategia) : null;
    const chip = crearChipInsignia(recompensas.insignias[estrategia], progreso.insignias[estrategia], nivel);
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
