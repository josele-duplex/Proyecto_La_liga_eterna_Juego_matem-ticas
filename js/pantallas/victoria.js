// Pantalla 5: partido ganado.
function mostrarPartidoGanado(perfilId, estadio, sesion) {
  UI.aplicarTema('recompensa');
  document.getElementById('app').className = 'lienzo';
  document.getElementById('app').innerHTML = '';
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const perfil = PERFILES.find((p) => p.id === perfilId);
  const progresoFinal = Storage.cargarProgreso(perfilId);

  // Vitrina de trofeos: cada partido ganado cuenta y se queda para siempre (se enseña en la
  // Sala de Trofeos del Museo). Lazy-default, mismo patrón que reforma/contratoDia.
  progresoFinal.trofeos = progresoFinal.trofeos || { partidos: 0, copas: 0, contrarrelojes: 0 };
  progresoFinal.trofeos.partidos++;

  // Partido especial del día: si la condición se cumplió, el bono se cobra aquí (una sola vez,
  // en el mismo guardado que el trofeo). No cumplirla no quita nada: el partido se gana igual.
  let bonoEspecial = 0;
  if (sesion && sesion.especial) {
    const cumplido = sesion.especial.id === 'porteria-cero' ? sesion.golesRival === 0 : true;
    if (cumplido) {
      bonoEspecial = sesion.especial.bono;
      progresoFinal.energia = (progresoFinal.energia || 0) + bonoEspecial;
    }
  }
  Storage.guardarProgreso(perfilId, progresoFinal);

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
  // Total de partidos ganados (vitrina): el niño ve crecer su palmarés en cada victoria.
  const premioPartidos = document.createElement('span');
  premioPartidos.className = 'premio';
  premioPartidos.innerHTML = `<strong>🏅 ${progresoFinal.trofeos.partidos}</strong> ${progresoFinal.trofeos.partidos === 1 ? 'partido ganado' : 'partidos ganados'}`;
  premios.appendChild(premioPartidos);
  // Puntos de reforma ganados en ESTE partido: antes se ganaban en silencio y el niño no sabía
  // ni que existían — ahora se ven aquí, con su destino ("para Mi Estadio") bien claro.
  if (sesion && sesion.reformaGanada > 0) {
    const premioReforma = document.createElement('span');
    premioReforma.className = 'premio';
    premioReforma.innerHTML = `<strong>🔧 +${sesion.reformaGanada}</strong> para Mi Estadio`;
    premios.appendChild(premioReforma);
  }
  // Bono del partido especial cumplido: se celebra con nombre y apellidos.
  if (bonoEspecial > 0) {
    const premioEspecial = document.createElement('span');
    premioEspecial.className = 'premio premio-especial';
    premioEspecial.innerHTML = `<strong>${sesion.especial.icono} +${bonoEspecial}⚡</strong> ${sesion.especial.nombre}`;
    premios.appendChild(premioEspecial);
  }
  panel.appendChild(premios);

  // Acceso directo a la Sala de Trofeos del Museo: justo después de ganar es cuando más apetece
  // ver el palmarés completo (todo lo ganado y lo aprendido).
  const verVitrina = document.createElement('button');
  verVitrina.className = 'boton-voz';
  verVitrina.textContent = '🏅 Ver mi vitrina de trofeos';
  verVitrina.addEventListener('click', () => mostrarMuseo(perfilId, 'trofeos'));
  panel.appendChild(verVitrina);

  // Si este partido desbloqueó un equipo superior por ir sobrado, o una Leyenda del Museo nueva
  // (FASE M3), se ofrecen aquí destacados (FASE M5: función compartida con el resumen de
  // Contrarreloj, que también puede dispararlos).
  crearBloquesDesbloqueo(perfilId).forEach((bloque) => panel.appendChild(bloque));

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
