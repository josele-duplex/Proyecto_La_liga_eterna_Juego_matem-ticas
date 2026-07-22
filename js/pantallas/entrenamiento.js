// Pantalla: Entrenamiento del Capitán (FASE M5, B.2 adaptado). Practica libre de UN concepto a la
// vez, sin presión: nada de rival, marcador ni jugada decisiva. A propósito, los resultados
// **solo** alimentan el registro de evaluación invisible (Evaluacion.registrar) — nunca se llama a
// Progression.actualizar, así que ni la fase CPA ni la cola de repaso de Liga se mueven un
// milímetro (regla explícita de la FASE M5: "no mueve la progresión"). Tampoco se da energía ni
// insignias aquí (ver celebrarAcierto en reto.js): así el niño puede fallar cuanto quiera sin que
// nada de esto se sienta como un coste ni como un atajo para farmear recompensas.
function mostrarSelectorEntrenamiento(perfilId) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const app = document.getElementById('app');

  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '🎯 Entrenamiento del Capitán';
  app.appendChild(titulo);

  const explicacion = document.createElement('p');
  explicacion.className = 'entrenamiento-explicacion';
  explicacion.textContent = 'Elige qué quieres practicar. Aquí no hay rival ni marcador: prueba tranquilo, no cuenta para tu partido de Liga.';
  app.appendChild(explicacion);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  Progression.conceptos(indice).forEach((concepto) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    const nivel = Progression.nivelDominioConcepto(progreso, concepto);
    const nombre = document.createElement('h2');
    nombre.textContent = `${nivel ? NIVELES_DOMINIO[nivel].icono : '⚪'} ${NOMBRES_CONCEPTO[concepto] || concepto}`;
    tarjeta.appendChild(nombre);

    const boton = document.createElement('button');
    boton.className = 'boton-siguiente';
    boton.textContent = 'Practicar';
    boton.addEventListener('click', () => jugarRetoEntrenamiento(perfilId, concepto, 0));
    tarjeta.appendChild(boton);

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}

function jugarRetoEntrenamiento(perfilId, concepto, rondasSeguidas) {
  UI.aplicarTema('mate');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });
  mostrarCargaBalon();

  const modo = modoDe(perfilId) || MODOS[0];
  const indice = indicesPorEdad[modo.edad];
  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = Progression.elegirPuzzleDeConcepto(progreso, indice, concepto);

  fetch(entrada.ruta).then((r) => r.json()).then((puzzle) => {
    const app = document.getElementById('app');
    app.innerHTML = ''; // quita el balón de carga (FASE D6)
    app.className = 'pantalla-reto';

    const panel = crearPanelEntrenamiento(concepto, rondasSeguidas);
    app.appendChild(panel);

    const zonaJuego = document.createElement('div');
    zonaJuego.className = 'zona-juego';
    app.appendChild(zonaJuego);

    const tarjetaCapi = crearTarjetaCapi(puzzle, fraseCapi('inicio_entrenamiento'));
    app.appendChild(tarjetaCapi);

    // Sin crearZonaPoderes aquí, a propósito: los poderes cuestan energía, y este es justo el
    // espacio pensado para que equivocarse no cueste nada. Precisamente por eso, aquí las pistas
    // SIEMPRE son automáticas (se ignora el modo Profesional): Entrenamiento no tiene ningún poder
    // de respaldo para conseguir ayuda, así que suprimirlas dejaría al niño sin ninguna salida —
    // justo lo contrario de lo que pide un espacio pensado para practicar sin miedo a fallar.
    Engine.render(
      puzzle,
      zonaJuego,
      (puzzleResuelto, resultado) => {
        const progresoActual = Storage.cargarProgreso(perfilId);
        progresoActual.ultimoPuzleId = puzzleResuelto.id;
        Evaluacion.registrar(progresoActual, puzzleResuelto, resultado);
        Storage.guardarProgreso(perfilId, progresoActual);
        Sonido.sonidoAcierto();
        celebrarAcierto(zonaJuego, 0, vocabularioDe(puzzleResuelto.estrategia));
        reaccionarCapi(tarjetaCapi, 'alegria', fraseAcierto(resultado));
        mostrarBotonSiguienteEntrenamiento(perfilId, concepto, rondasSeguidas + 1);
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'duda', fraseCapi('fallo'));
        Sonido.sonidoFallo();
      },
      () => {
        reaccionarCapi(tarjetaCapi, 'animo', fraseCapi('animo'));
      }
    );
  });
}

function crearPanelEntrenamiento(concepto, rondasSeguidas) {
  const panel = document.createElement('div');
  panel.className = 'capsula-mision';

  const fila = document.createElement('div');
  fila.className = 'capsula-linea';
  const titulo = document.createElement('strong');
  titulo.textContent = '🎯 Entrenamiento libre';
  const conceptoSpan = document.createElement('span');
  conceptoSpan.className = 'capsula-concepto';
  conceptoSpan.textContent = `⚽ ${NOMBRES_CONCEPTO[concepto] || concepto}`;
  fila.append(titulo, conceptoSpan);
  panel.appendChild(fila);

  if (rondasSeguidas > 0) {
    const contador = document.createElement('p');
    contador.className = 'entrenamiento-contador';
    contador.textContent = `Llevas ${rondasSeguidas} ${rondasSeguidas === 1 ? 'reto practicado' : 'retos practicados'} hoy.`;
    panel.appendChild(contador);
  }

  return panel;
}

function mostrarBotonSiguienteEntrenamiento(perfilId, concepto, rondasSeguidas) {
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const seguir = document.createElement('button');
  seguir.className = 'boton-siguiente boton-cta';
  seguir.textContent = '🎯 Otro reto de este concepto';
  seguir.addEventListener('click', () => jugarRetoEntrenamiento(perfilId, concepto, rondasSeguidas));
  zona.appendChild(seguir);

  const otro = document.createElement('button');
  otro.textContent = 'Elegir otro concepto';
  otro.addEventListener('click', () => mostrarSelectorEntrenamiento(perfilId));
  zona.appendChild(otro);
}
