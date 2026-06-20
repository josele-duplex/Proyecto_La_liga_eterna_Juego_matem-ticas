// MOTOR: juega cualquier puzle a partir de su JSON. No sabe nada del estadio, la energía ni la edad del jugador.

const Engine = {
  // alResponder(puzzle, esCorrecta) es opcional: avisa a quien llamó al motor de cada intento,
  // sin que el motor sepa qué hace esa otra pieza con el resultado (guardar, puntuar...).
  render(puzzle, container, alResponder) {
    container.innerHTML = '';

    const enunciado = document.createElement('p');
    enunciado.className = 'enunciado';
    enunciado.textContent = puzzle.enunciado.texto;
    container.appendChild(enunciado);

    const opciones = document.createElement('div');
    opciones.className = 'opciones';

    const feedback = document.createElement('p');
    feedback.className = 'feedback';

    // Zona de pistas: el botón solo aparece cuando el jugador falla (andamiaje T2.1).
    const zonaPistas = document.createElement('div');
    zonaPistas.className = 'zona-pistas';

    const botonPista = document.createElement('button');
    botonPista.className = 'boton-pista';
    botonPista.textContent = 'Pedir una pista';
    botonPista.hidden = true;

    const listaPistas = document.createElement('div');
    listaPistas.className = 'lista-pistas';

    zonaPistas.appendChild(botonPista);
    zonaPistas.appendChild(listaPistas);

    let pistasMostradas = 0;
    let resuelto = false;

    // Muestra la siguiente pista (visual → procedimiento → guiada). Nunca da la respuesta directa.
    botonPista.addEventListener('click', () => {
      if (pistasMostradas >= puzzle.pistas.length) return;
      const pista = puzzle.pistas[pistasMostradas];
      const texto = document.createElement('p');
      texto.className = 'pista';
      texto.textContent = `Pista ${pista.nivel}: ${pista.texto}`;
      listaPistas.appendChild(texto);
      pistasMostradas++;
      if (pistasMostradas >= puzzle.pistas.length) {
        botonPista.disabled = true;
        botonPista.textContent = 'No hay más pistas';
      }
    });

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
          feedback.textContent = '¡Muy bien! Has acertado.';
          feedback.className = 'feedback feedback-correcto';
          botonPista.hidden = true;
        } else {
          // Al fallar no se revela la respuesta: se marca el error, se deja reintentar y se ofrecen pistas.
          boton.classList.add('opcion-incorrecta');
          boton.disabled = true;
          feedback.textContent = 'No era esa. Prueba otra vez o pide una pista.';
          feedback.className = 'feedback feedback-incorrecto';
          botonPista.hidden = false;
        }

        if (alResponder) {
          alResponder(puzzle, esCorrecta);
        }
      });
      opciones.appendChild(boton);
    });

    container.appendChild(opciones);
    container.appendChild(feedback);
    container.appendChild(zonaPistas);
  }
};
