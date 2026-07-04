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
  const botonLeyendas = document.createElement('button');
  botonLeyendas.className = 'boton-museo-pestana';
  botonLeyendas.textContent = '🏆 Sala de Leyendas';
  const botonEnciclopedia = document.createElement('button');
  botonEnciclopedia.className = 'boton-museo-pestana';
  botonEnciclopedia.textContent = '📖 Enciclopedia del Entrenador';
  pestanas.append(botonLeyendas, botonEnciclopedia);
  app.appendChild(pestanas);

  const contenido = document.createElement('div');
  app.appendChild(contenido);

  const progreso = Storage.cargarProgreso(perfilId);

  const irASalaLeyendas = () => {
    botonLeyendas.classList.add('activa');
    botonEnciclopedia.classList.remove('activa');
    contenido.innerHTML = '';
    contenido.appendChild(crearSalaLeyendas(progreso));
  };
  const irASalaEnciclopedia = () => {
    botonEnciclopedia.classList.add('activa');
    botonLeyendas.classList.remove('activa');
    contenido.innerHTML = '';
    contenido.appendChild(crearSalaEnciclopedia(perfilId, progreso));
  };

  botonLeyendas.addEventListener('click', irASalaLeyendas);
  botonEnciclopedia.addEventListener('click', irASalaEnciclopedia);

  if (salaInicial === 'enciclopedia') irASalaEnciclopedia();
  else irASalaLeyendas();
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
