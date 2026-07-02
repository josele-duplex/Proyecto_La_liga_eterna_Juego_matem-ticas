// Pantalla 4: jugar la serie de retos de un estadio.
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
      // Contrato del Día (FASE M2, U2): si este acierto lo cumple, Capi lo celebra en vez del
      // elogio normal — es el "propósito inmediato" de la sesión, merece su propio mensaje.
      const contratoCumplidoAhora = avanzarContratoDelDia(progresoActual, puzzleResuelto);
      Storage.guardarProgreso(perfilId, progresoActual);
      Sonido.sonidoAcierto();
      celebrarAcierto(zonaJuego, recompensas.energiaPorPuzle, vocabularioDe(puzzleResuelto.estrategia));
      const mensajeCapi = contratoCumplidoAhora
        ? `¡Contrato cumplido! Aquí tienes tu bono de +${progresoActual.contratoDia.bonus}⚡.`
        : fraseAcierto(resultado);
      reaccionarCapi(tarjetaCapi, 'alegria', mensajeCapi);
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

// Convierte el feedback de acierto en una tarjeta de celebración con la energía ganada. Nombra la
// estrategia con su vocabulario técnico real (FASE M1, A.5: "Has usado DESCOMPOSICIÓN") en vez de
// un genérico "¡Muy bien!" — construye lenguaje matemático transferible fuera del juego.
function celebrarAcierto(zonaJuego, energia, vocabulario) {
  const feedback = zonaJuego.querySelector('.feedback');
  if (!feedback) return;
  feedback.className = 'feedback feedback-correcto celebracion';
  feedback.innerHTML = '';
  const titulo = document.createElement('span');
  titulo.className = 'celebracion-titulo';
  titulo.textContent = '⚽ ¡Golazo!';
  const sub = document.createElement('span');
  sub.className = 'celebracion-sub';
  sub.textContent = vocabulario ? `Has usado ${vocabulario}` : '¡Muy bien! Has acertado.';
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
