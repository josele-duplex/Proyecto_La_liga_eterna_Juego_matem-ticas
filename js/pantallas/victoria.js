// Pantalla 5: partido ganado.
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
  premioEnergia.innerHTML = `<strong><img src="assets/icons-svg/rayo.svg" alt="" class="icono-svg-inline"> +${energiaGanada}</strong> energía`;
  premios.appendChild(premioEnergia);
  if (progresoFinal.racha && progresoFinal.racha.dias > 0) {
    const premioRacha = document.createElement('span');
    premioRacha.className = 'premio';
    premioRacha.innerHTML = `<strong><img src="assets/icons-svg/llama.svg" alt="" class="icono-svg-inline"> ${progresoFinal.racha.dias}</strong> ${progresoFinal.racha.dias === 1 ? 'día' : 'días'} de racha`;
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

  // Si este partido desbloqueó una Leyenda del Orden nueva (FASE M3), se celebra igual que un
  // equipo nuevo: aviso destacado con acceso directo al Museo para leer su historia completa.
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
    panel.appendChild(desbloqueoLeyenda);
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
