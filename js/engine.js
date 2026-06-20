// MOTOR: juega cualquier puzle a partir de su JSON. No sabe nada del estadio, la energía ni la edad del jugador.
// render() reparte el trabajo según puzzle.tipo. Lo común a cualquier tipo (enunciado, feedback,
// pistas) vive aquí; lo específico de cada tipo vive en su propio "renderXxx".

const Engine = {
  // alResponder(puzzle, esCorrecta) es opcional: avisa a quien llamó al motor de cada intento,
  // sin que el motor sepa qué hace esa otra pieza con el resultado (guardar, puntuar...).
  render(puzzle, container, alResponder) {
    container.innerHTML = '';

    const enunciado = document.createElement('p');
    enunciado.className = 'enunciado';
    enunciado.textContent = puzzle.enunciado.texto;
    container.appendChild(enunciado);

    const feedback = document.createElement('p');
    feedback.className = 'feedback';

    const pistas = this.crearControlPistas(puzzle);

    const marcarResultado = (esCorrecta) => {
      feedback.textContent = esCorrecta
        ? '¡Muy bien! Has acertado.'
        : 'No era esa. Prueba otra vez o pide una pista.';
      feedback.className = esCorrecta ? 'feedback feedback-correcto' : 'feedback feedback-incorrecto';

      if (esCorrecta) {
        pistas.ocultar();
      } else {
        pistas.activar();
      }

      if (alResponder) {
        alResponder(puzzle, esCorrecta);
      }
    };

    const renderTipo = puzzle.tipo === 'recta_numerica' ? this.renderRectaNumerica : this.renderOpcionMultiple;
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
      ocultar() { boton.hidden = true; }
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
  }
};
