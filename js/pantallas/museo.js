// Pantalla del Museo de la Liga (FASE M3, U5: funde A.1+A.2+A.6+A.7+A.8+C.4). Dos salas — Sala de
// Leyendas y Enciclopedia del Entrenador — consultables desde el menú en cualquier momento, no
// solo justo después de desbloquear algo.
function mostrarMuseo(perfilId, salaInicial) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '🏛 Museo de la Liga';
  app.appendChild(titulo);

  const pestanas = document.createElement('div');
  pestanas.className = 'museo-pestanas';
  const botonTrofeos = document.createElement('button');
  botonTrofeos.className = 'boton-museo-pestana';
  botonTrofeos.textContent = '🏅 Vitrina de Trofeos';
  const botonLeyendas = document.createElement('button');
  botonLeyendas.className = 'boton-museo-pestana';
  botonLeyendas.textContent = '🏆 Sala de Leyendas';
  const botonEnciclopedia = document.createElement('button');
  botonEnciclopedia.className = 'boton-museo-pestana';
  botonEnciclopedia.textContent = '📖 Enciclopedia del Entrenador';
  const botonGuia = document.createElement('button');
  botonGuia.className = 'boton-museo-pestana';
  botonGuia.textContent = '❓ Guía del Capi';
  pestanas.append(botonTrofeos, botonLeyendas, botonEnciclopedia, botonGuia);
  app.appendChild(pestanas);

  const contenido = document.createElement('div');
  app.appendChild(contenido);

  const progreso = Storage.cargarProgreso(perfilId);

  const activar = (botonActivo) => {
    [botonTrofeos, botonLeyendas, botonEnciclopedia, botonGuia].forEach((b) => b.classList.toggle('activa', b === botonActivo));
    contenido.innerHTML = '';
  };
  const irASalaTrofeos = () => {
    activar(botonTrofeos);
    contenido.appendChild(crearSalaTrofeos(perfilId, progreso));
  };
  const irASalaLeyendas = () => {
    activar(botonLeyendas);
    contenido.appendChild(crearSalaLeyendas(progreso));
  };
  const irASalaEnciclopedia = () => {
    activar(botonEnciclopedia);
    contenido.appendChild(crearSalaEnciclopedia(perfilId, progreso));
  };
  const irASalaGuia = () => {
    activar(botonGuia);
    contenido.appendChild(crearSalaGuia());
  };

  botonTrofeos.addEventListener('click', irASalaTrofeos);
  botonLeyendas.addEventListener('click', irASalaLeyendas);
  botonEnciclopedia.addEventListener('click', irASalaEnciclopedia);
  botonGuia.addEventListener('click', irASalaGuia);

  // La Vitrina es la sala por defecto: lo primero que ve el niño al abrir el Museo es todo lo
  // que ha ganado y aprendido (petición del usuario: resaltar los logros).
  if (salaInicial === 'enciclopedia') irASalaEnciclopedia();
  else if (salaInicial === 'leyendas') irASalaLeyendas();
  else if (salaInicial === 'guia') irASalaGuia();
  else irASalaTrofeos();
}

// Guía del Capi (sala de consulta): qué es cada cosa que se gana y para qué sirve, en lenguaje de
// niño. Es el REPASO: lo importante se aprende jugando (avisos de primera vez, medallas anunciadas
// en el momento), y esta sala queda para releerlo cuando se quiera. Contenido en data/guia.json.
function crearSalaGuia() {
  const grid = document.createElement('div');
  grid.className = 'museo-grid';
  guia.items.forEach((item) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-enciclopedia tarjeta-guia';

    const cabecera = document.createElement('h3');
    cabecera.textContent = `${item.icono} ${item.nombre}`;
    tarjeta.appendChild(cabecera);

    const queEs = document.createElement('p');
    queEs.innerHTML = `<strong>¿Qué es?</strong> ${item.queEs}`;
    tarjeta.appendChild(queEs);

    const paraQue = document.createElement('p');
    paraQue.innerHTML = `<strong>¿Para qué sirve?</strong> ${item.paraQueSirve}`;
    tarjeta.appendChild(paraQue);

    const botonVoz = document.createElement('button');
    botonVoz.className = 'boton-voz';
    botonVoz.textContent = '🔊 Escuchar';
    botonVoz.addEventListener('click', () => Sonido.decirVoz(`${item.nombre}. ${item.queEs} ${item.paraQueSirve}`));
    tarjeta.appendChild(botonVoz);

    grid.appendChild(tarjeta);
  });
  return grid;
}

// Sala de Trofeos ("Vitrina"): el palmarés completo del jugador en un solo sitio — partidos,
// copas, contrarrelojes, ascensos, leyendas, medallas por concepto, cromos... y LO APRENDIDO
// (las estrategias matemáticas reales que ya sabe usar, con su explicación de la Enciclopedia).
// Celebra tanto el ganar como el saber: mismo peso visual para ambos.
function crearSalaTrofeos(perfilId, progreso) {
  const sala = document.createElement('div');

  const trofeos = progreso.trofeos || { partidos: 0, copas: 0, contrarrelojes: 0 };
  const ascensos = (progreso.ascensosCelebrados || []).length;
  const numLeyendas = ((progreso.museo && progreso.museo.leyendasDesbloqueadas) || []).length;

  // Fila de grandes números: los logros que crecen jugando.
  const contadores = document.createElement('div');
  contadores.className = 'vitrina-contadores';
  [
    { icono: '🏅', valor: trofeos.partidos, nombre: trofeos.partidos === 1 ? 'partido ganado' : 'partidos ganados' },
    { icono: '🏆', valor: trofeos.copas, nombre: trofeos.copas === 1 ? 'Copa de Leyendas' : 'Copas de Leyendas' },
    { icono: '⚡', valor: trofeos.contrarrelojes, nombre: trofeos.contrarrelojes === 1 ? 'Contrarreloj superado' : 'Contrarrelojes superados' },
    { icono: '🎉', valor: ascensos, nombre: ascensos === 1 ? 'ascenso de división' : 'ascensos de división' },
    { icono: '🏛', valor: numLeyendas, nombre: numLeyendas === 1 ? 'Leyenda descubierta' : 'Leyendas descubiertas' },
    { icono: '🔥', valor: (progreso.racha && progreso.racha.dias) || 0, nombre: 'días de racha' }
  ].forEach(({ icono, valor, nombre }) => {
    const caja = document.createElement('div');
    caja.className = valor > 0 ? 'vitrina-contador' : 'vitrina-contador vitrina-contador-vacio';
    caja.innerHTML = `<span class="vitrina-icono">${icono}</span><span class="vitrina-numero">${valor}</span><span class="vitrina-nombre">${nombre}</span>`;
    contadores.appendChild(caja);
  });
  sala.appendChild(contadores);

  // Medallas por concepto del equipo actual (misma franja 🥉🥈🥇 del calendario, reutilizada).
  const modo = modoDe(perfilId);
  const indice = modo ? indicesPorEdad[modo.edad] : null;
  if (indice) {
    const tituloMedallas = document.createElement('h3');
    tituloMedallas.className = 'vitrina-titulo-seccion';
    tituloMedallas.textContent = `Tus medallas en ${modo.icono} ${modo.nombre}`;
    sala.appendChild(tituloMedallas);
    sala.appendChild(crearFranjaNiveles(progreso, indice));
  }

  // Cromos ganados (insignias de estrategia y de proceso), con su contador.
  const insignias = Object.keys(progreso.insignias || {});
  const proceso = Object.keys(progreso.insigniasProceso || {});
  if (insignias.length > 0 || proceso.length > 0) {
    const tituloCromos = document.createElement('h3');
    tituloCromos.className = 'vitrina-titulo-seccion';
    tituloCromos.textContent = 'Tus cromos';
    sala.appendChild(tituloCromos);
    const cromos = document.createElement('div');
    cromos.className = 'vitrina-cromos';
    insignias.forEach((estrategia) => {
      const def = recompensas.insignias[estrategia];
      if (!def) return;
      const cromo = document.createElement('div');
      cromo.className = 'vitrina-cromo';
      const chip = crearChipInsignia(def, progreso.insignias[estrategia],
        indice ? Progression.nivelDominioEstrategia(progreso, indice, estrategia) : null);
      const nombre = document.createElement('span');
      nombre.textContent = `${def.nombre} ×${progreso.insignias[estrategia]}`;
      cromo.append(chip, nombre);
      cromos.appendChild(cromo);
    });
    proceso.forEach((clave) => {
      const def = recompensas.insigniasProceso[clave];
      if (!def) return;
      const cromo = document.createElement('div');
      cromo.className = 'vitrina-cromo';
      const chip = crearChipInsignia(def, progreso.insigniasProceso[clave]);
      const nombre = document.createElement('span');
      nombre.textContent = `${def.nombre} ×${progreso.insigniasProceso[clave]}`;
      cromo.append(chip, nombre);
      cromos.appendChild(cromo);
    });
    sala.appendChild(cromos);
  }

  // Lo que has APRENDIDO: cada estrategia con cromo es una herramienta matemática real que el
  // niño ya sabe usar. Se nombra con su vocabulario técnico (FASE M1) y se explica con su entrada
  // de la Enciclopedia — el conocimiento expuesto en la vitrina, al lado de los trofeos.
  const aprendidas = insignias.filter((e) => enciclopedia.entradas[e]);
  const tituloAprendido = document.createElement('h3');
  tituloAprendido.className = 'vitrina-titulo-seccion';
  tituloAprendido.textContent = 'Lo que ya sabes hacer';
  sala.appendChild(tituloAprendido);
  if (aprendidas.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'vitrina-vacio';
    vacio.textContent = 'Juega tu primer partido y aquí aparecerán las estrategias matemáticas que vayas aprendiendo.';
    sala.appendChild(vacio);
  } else {
    const lista = document.createElement('div');
    lista.className = 'vitrina-aprendido';
    aprendidas.forEach((estrategia) => {
      const entrada = enciclopedia.entradas[estrategia];
      const fila = document.createElement('div');
      fila.className = 'vitrina-aprendido-fila';
      const vocab = document.createElement('strong');
      vocab.textContent = `✔ ${entrada.vocabulario}`;
      const queEs = document.createElement('p');
      queEs.textContent = entrada.queEs;
      fila.append(vocab, queEs);
      lista.appendChild(fila);
    });
    sala.appendChild(lista);
    const enlaceEnciclopedia = document.createElement('button');
    enlaceEnciclopedia.className = 'boton-voz';
    enlaceEnciclopedia.textContent = '📖 Ver todas en la Enciclopedia';
    enlaceEnciclopedia.addEventListener('click', () => mostrarMuseo(perfilId, 'enciclopedia'));
    sala.appendChild(enlaceEnciclopedia);
  }

  return sala;
}

// Sala de Leyendas (A.1/A.2/C.4): cada Leyenda del Orden es un matemático/a real ficcionado con
// una habilidad jugable. Bloqueada = candado + pista de qué dominar; desbloqueada = historia
// completa, curiosidad, habilidad y "relato de gloria", con lectura en voz alta (D.6).
function crearSalaLeyendas(progreso) {
  const grid = document.createElement('div');
  grid.className = 'museo-grid';
  const desbloqueadas = (progreso.museo && progreso.museo.leyendasDesbloqueadas) || [];

  leyendas.leyendas.forEach((leyenda) => {
    const desbloqueada = desbloqueadas.includes(leyenda.id);
    const tarjeta = document.createElement('div');
    tarjeta.className = desbloqueada ? 'tarjeta-leyenda' : 'tarjeta-leyenda tarjeta-leyenda-bloqueada';

    if (desbloqueada) {
      const cabecera = document.createElement('div');
      cabecera.className = 'leyenda-cabecera';
      if (leyenda.imagen) {
        const img = document.createElement('img');
        img.className = 'leyenda-icono-imagen';
        img.src = leyenda.imagen;
        img.alt = leyenda.nombre;
        cabecera.appendChild(img);
      } else {
        const icono = document.createElement('span');
        icono.className = 'leyenda-icono-emoji';
        icono.textContent = leyenda.icono;
        cabecera.appendChild(icono);
      }
      const nombre = document.createElement('h3');
      nombre.textContent = leyenda.nombre;
      cabecera.appendChild(nombre);
      tarjeta.appendChild(cabecera);

      const historia = document.createElement('p');
      historia.className = 'leyenda-historia';
      historia.textContent = leyenda.miniHistoria;
      tarjeta.appendChild(historia);

      const curiosidad = document.createElement('p');
      curiosidad.className = 'leyenda-curiosidad';
      curiosidad.textContent = `💡 ${leyenda.curiosidad}`;
      tarjeta.appendChild(curiosidad);

      const habilidad = document.createElement('p');
      habilidad.className = 'leyenda-habilidad';
      habilidad.innerHTML = `<strong>${leyenda.habilidad}:</strong> ${leyenda.habilidadDescripcion}`;
      tarjeta.appendChild(habilidad);

      const gloria = document.createElement('p');
      gloria.className = 'leyenda-gloria';
      gloria.textContent = leyenda.relatoGloria;
      tarjeta.appendChild(gloria);

      const botonVoz = document.createElement('button');
      botonVoz.className = 'boton-voz';
      botonVoz.textContent = '🔊 Escuchar';
      botonVoz.addEventListener('click', () => Sonido.decirVoz(`${leyenda.miniHistoria} ${leyenda.curiosidad}`));
      tarjeta.appendChild(botonVoz);

      // Micro-reto opcional "¿Quién descubrió esto?" (A.8): pregunta de un toque, nunca bloquea.
      if (leyenda.pregunta) tarjeta.appendChild(crearMicroPregunta(leyenda));
    } else {
      const candado = document.createElement('img');
      candado.src = 'assets/icons-svg/candado.svg';
      candado.alt = 'Bloqueado';
      candado.className = 'leyenda-candado';
      tarjeta.appendChild(candado);
      const nombre = document.createElement('h3');
      nombre.textContent = '???';
      tarjeta.appendChild(nombre);
      const pista = document.createElement('p');
      pista.className = 'leyenda-pista-bloqueo';
      const nombreConcepto = NOMBRES_CONCEPTO[leyenda.concepto] || leyenda.concepto;
      pista.textContent = `Domina ${nombreConcepto} para desbloquear esta Leyenda.`;
      tarjeta.appendChild(pista);
    }

    grid.appendChild(tarjeta);
  });

  return grid;
}

// Micro-reto opcional "¿Quién descubrió esto?" (A.8): verdadero/falso de un solo toque, sin
// puntuar ni guardar nada — es cultura matemática, no una evaluación más.
function crearMicroPregunta(leyenda) {
  const zona = document.createElement('div');
  zona.className = 'leyenda-micropregunta';
  const texto = document.createElement('p');
  texto.textContent = `❓ ${leyenda.pregunta}`;
  zona.appendChild(texto);

  const botones = document.createElement('div');
  botones.className = 'leyenda-micropregunta-botones';
  [{ etiqueta: 'Verdad', valor: true }, { etiqueta: 'Mentira', valor: false }].forEach(({ etiqueta, valor }) => {
    const boton = document.createElement('button');
    boton.className = 'boton-poder';
    boton.textContent = etiqueta;
    boton.addEventListener('click', () => {
      const acierto = valor === leyenda.respuestaPregunta;
      texto.textContent = acierto ? '✅ ¡Correcto!' : '👍 Es cierto — ¡ahora ya lo sabes!';
      Array.from(botones.children).forEach((b) => { b.disabled = true; });
    });
    botones.appendChild(boton);
  });
  zona.appendChild(botones);

  return zona;
}

// Enciclopedia del Entrenador (A.6, absorbe A.7): una entrada por estrategia, siempre consultable,
// con ejemplo paso a paso y aplicación en el mundo real. Marca las entradas vistas (una sola vez,
// guardado en batch) por si el futuro Diario del Entrenador quiere mostrar cuántas se han leído.
function crearSalaEnciclopedia(perfilId, progreso) {
  const lista = document.createElement('div');
  lista.className = 'museo-grid';

  progreso.museo = progreso.museo || { leyendasDesbloqueadas: [], entradasVistas: [] };
  let hayEntradasNuevas = false;

  Object.keys(enciclopedia.entradas).forEach((clave) => {
    const entrada = enciclopedia.entradas[clave];
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-enciclopedia';

    const nombre = document.createElement('h3');
    nombre.textContent = entrada.vocabulario;
    tarjeta.appendChild(nombre);

    const queEs = document.createElement('p');
    queEs.innerHTML = `<strong>¿Qué es?</strong> ${entrada.queEs}`;
    tarjeta.appendChild(queEs);

    const pasos = document.createElement('ol');
    pasos.className = 'enciclopedia-pasos';
    entrada.ejemploPasos.forEach((paso) => {
      const li = document.createElement('li');
      li.textContent = paso;
      pasos.appendChild(li);
    });
    tarjeta.appendChild(pasos);

    const quienLaUsa = document.createElement('p');
    quienLaUsa.className = 'enciclopedia-mundo-real';
    quienLaUsa.innerHTML = `<strong>¿Quién la usa?</strong> ${entrada.quienLaUsa}`;
    tarjeta.appendChild(quienLaUsa);

    const botonVoz = document.createElement('button');
    botonVoz.className = 'boton-voz';
    botonVoz.textContent = '🔊 Escuchar';
    botonVoz.addEventListener('click', () => Sonido.decirVoz(entrada.queEs));
    tarjeta.appendChild(botonVoz);

    if (!progreso.museo.entradasVistas.includes(clave)) {
      progreso.museo.entradasVistas.push(clave);
      hayEntradasNuevas = true;
    }

    lista.appendChild(tarjeta);
  });

  if (hayEntradasNuevas) Storage.guardarProgreso(perfilId, progreso);

  return lista;
}
