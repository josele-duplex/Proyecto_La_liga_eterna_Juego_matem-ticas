// MOTOR: juega cualquier puzle a partir de su JSON. No sabe nada del estadio, la energía ni la edad del jugador.
// render() reparte el trabajo según puzzle.tipo. Lo común a cualquier tipo (enunciado, feedback,
// pistas) vive aquí; lo específico de cada tipo vive en su propio "renderXxx".

const Engine = {
  // alResolver(puzzle, resultado) es opcional: avisa UNA vez, cuando el puzle se resuelve, e incluye
  // resultado = { intentosFallidos, pistasUsadas, tiempoMs } para que otras piezas (progresión,
  // evaluación) sepan cómo le fue. alFallar() es opcional: avisa en cada intento fallido (p. ej.
  // para un sonido). El motor solo mide y notifica: no sabe qué hará nadie con esos avisos.
  render(puzzle, container, alResolver, alFallar) {
    container.innerHTML = '';

    const enunciado = document.createElement('p');
    enunciado.className = 'enunciado';
    enunciado.textContent = puzzle.enunciado.texto;
    container.appendChild(enunciado);

    const feedback = document.createElement('p');
    feedback.className = 'feedback';

    const pistas = this.crearControlPistas(puzzle);
    let intentosFallidos = 0;
    const inicio = Date.now();

    const marcarResultado = (esCorrecta) => {
      feedback.textContent = esCorrecta
        ? '¡Muy bien! Has acertado.'
        : 'No era esa. Prueba otra vez o pide una pista.';
      feedback.className = esCorrecta ? 'feedback feedback-correcto' : 'feedback feedback-incorrecto';

      if (esCorrecta) {
        pistas.ocultar();
        if (alResolver) {
          alResolver(puzzle, {
            intentosFallidos,
            pistasUsadas: pistas.usadas(),
            tiempoMs: Date.now() - inicio
          });
        }
      } else {
        intentosFallidos++;
        pistas.activar();
        if (alFallar) alFallar();
      }
    };

    // Cada tipo de juego tiene su propia forma de pintarse. Añadir un juego nuevo = añadir un
    // renderXxx y una entrada aquí; el resto del motor (enunciado, pistas, feedback) no cambia.
    const renderers = {
      recta_numerica: this.renderRectaNumerica,
      verdadero_falso: this.renderVerdaderoFalso,
      ordenar: this.renderOrdenar
    };
    const renderTipo = renderers[puzzle.tipo] || this.renderOpcionMultiple;
    container.appendChild(renderTipo.call(this, puzzle, marcarResultado));

    container.appendChild(feedback);
    container.appendChild(pistas.elemento);
  },

  // El botón de pista solo aparece tras el primer fallo. Nunca da la respuesta directa.
  crearControlPistas(puzzle) {
    const zona = document.createElement('div');
    zona.className = 'zona-pistas';

    const boton = document.createElement('button');
    boton.className = 'boton-pista';
    boton.textContent = 'Pedir una pista';
    boton.hidden = true;

    const lista = document.createElement('div');
    lista.className = 'lista-pistas';

    zona.appendChild(boton);
    zona.appendChild(lista);

    let mostradas = 0;
    boton.addEventListener('click', () => {
      if (mostradas >= puzzle.pistas.length) return;
      const pista = puzzle.pistas[mostradas];
      const texto = document.createElement('p');
      texto.className = 'pista';
      texto.textContent = `Pista ${pista.nivel}: ${pista.texto}`;
      lista.appendChild(texto);
      mostradas++;
      if (mostradas >= puzzle.pistas.length) {
        boton.disabled = true;
        boton.textContent = 'No hay más pistas';
      }
    });

    return {
      elemento: zona,
      activar() { boton.hidden = false; },
      ocultar() { boton.hidden = true; },
      usadas() { return mostradas; }
    };
  },

  // tipo "opcion_multiple": el jugador toca uno de varios botones de respuesta.
  renderOpcionMultiple(puzzle, marcarResultado) {
    const opciones = document.createElement('div');
    opciones.className = 'opciones';
    let resuelto = false;

    puzzle.respuesta.opciones.forEach((opcion) => {
      const boton = document.createElement('button');
      boton.className = 'opcion';
      boton.textContent = opcion.texto;
      boton.dataset.opcionId = opcion.id;
      boton.addEventListener('click', () => {
        if (resuelto) return;
        const esCorrecta = opcion.id === puzzle.respuesta.correcta;

        if (esCorrecta) {
          resuelto = true;
          boton.classList.add('opcion-correcta');
          Array.from(opciones.children).forEach((b) => { b.disabled = true; });
        } else {
          boton.classList.add('opcion-incorrecta');
          boton.disabled = true;
        }

        marcarResultado(esCorrecta);
      });
      opciones.appendChild(boton);
    });

    return opciones;
  },

  // tipo "recta_numerica": el jugador toca el punto correcto en una recta numérica.
  renderRectaNumerica(puzzle, marcarResultado) {
    const { desde, hasta, paso } = puzzle.datos.recta;
    const recta = document.createElement('div');
    recta.className = 'recta-numerica';
    let resuelto = false;

    for (let valor = desde; valor <= hasta; valor += paso) {
      const punto = document.createElement('button');
      punto.className = 'punto-recta';
      punto.textContent = valor;
      punto.addEventListener('click', () => {
        if (resuelto) return;
        const esCorrecta = valor === puzzle.respuesta.valor_correcto;

        if (esCorrecta) {
          resuelto = true;
          punto.classList.add('opcion-correcta');
          Array.from(recta.children).forEach((b) => { b.disabled = true; });
        } else {
          punto.classList.add('opcion-incorrecta');
          punto.disabled = true;
        }

        marcarResultado(esCorrecta);
      });
      recta.appendChild(punto);
    }

    return recta;
  },

  // tipo "verdadero_falso" (juego "Relámpago"): se muestra una afirmación y el niño decide si es
  // verdadera o falsa. Para fluidez y cálculo mental rápido. respuesta.correcta es true/false.
  renderVerdaderoFalso(puzzle, marcarResultado) {
    const cont = document.createElement('div');
    cont.className = 'opciones opciones-vf';
    let resuelto = false;

    [
      { texto: '✅ Verdadero', valor: true },
      { texto: '❌ Falso', valor: false }
    ].forEach(({ texto, valor }) => {
      const boton = document.createElement('button');
      boton.className = 'opcion opcion-vf';
      boton.textContent = texto;
      boton.addEventListener('click', () => {
        if (resuelto) return;
        const esCorrecta = valor === puzzle.respuesta.correcta;
        if (esCorrecta) {
          resuelto = true;
          boton.classList.add('opcion-correcta');
          Array.from(cont.children).forEach((b) => { b.disabled = true; });
        } else {
          boton.classList.add('opcion-incorrecta');
          boton.disabled = true;
        }
        marcarResultado(esCorrecta);
      });
      cont.appendChild(boton);
    });

    return cont;
  },

  // tipo "ordenar" (juego "Alineación"): el niño toca los números en orden (el correcto está en
  // respuesta.orden; datos.numeros es el orden desordenado en que se muestran). Cada acierto fija
  // un número; un toque fuera de orden cuenta como fallo. Se resuelve al colocar todos en orden.
  renderOrdenar(puzzle, marcarResultado) {
    const orden = puzzle.respuesta.orden;
    const cont = document.createElement('div');
    cont.className = 'opciones opciones-ordenar';
    let siguiente = 0;
    let resuelto = false;

    puzzle.datos.numeros.forEach((num) => {
      const boton = document.createElement('button');
      boton.className = 'opcion opcion-ordenar';
      boton.textContent = num;
      boton.addEventListener('click', () => {
        if (resuelto || boton.disabled) return;
        if (num === orden[siguiente]) {
          boton.classList.add('opcion-correcta');
          boton.disabled = true;
          siguiente++;
          if (siguiente >= orden.length) {
            resuelto = true;
            marcarResultado(true);
          }
        } else {
          boton.classList.add('opcion-incorrecta');
          marcarResultado(false);
          setTimeout(() => boton.classList.remove('opcion-incorrecta'), 500);
        }
      });
      cont.appendChild(boton);
    });

    return cont;
  }
};
