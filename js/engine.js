// MOTOR: juega cualquier puzle a partir de su JSON. No sabe nada del estadio, la energía ni la edad del jugador.

const Engine = {
  // Muestra un puzle en pantalla. De momento solo el tipo "opcion_multiple".
  render(puzzle, container) {
    container.innerHTML = '';

    const enunciado = document.createElement('p');
    enunciado.className = 'enunciado';
    enunciado.textContent = puzzle.enunciado.texto;
    container.appendChild(enunciado);

    const opciones = document.createElement('div');
    opciones.className = 'opciones';

    const feedback = document.createElement('p');
    feedback.className = 'feedback';

    puzzle.respuesta.opciones.forEach((opcion) => {
      const boton = document.createElement('button');
      boton.className = 'opcion';
      boton.textContent = opcion.texto;
      boton.dataset.opcionId = opcion.id;
      boton.addEventListener('click', () => {
        this.responder(puzzle, opcion.id, opciones, feedback);
      });
      opciones.appendChild(boton);
    });

    container.appendChild(opciones);
    container.appendChild(feedback);
  },

  // Comprueba la respuesta elegida y muestra una reacción distinta para acierto y error.
  responder(puzzle, opcionElegidaId, opciones, feedback) {
    const esCorrecta = opcionElegidaId === puzzle.respuesta.correcta;

    Array.from(opciones.children).forEach((boton) => {
      boton.disabled = true;
      if (boton.dataset.opcionId === puzzle.respuesta.correcta) {
        boton.classList.add('opcion-correcta');
      } else if (boton.dataset.opcionId === opcionElegidaId) {
        boton.classList.add('opcion-incorrecta');
      }
    });

    feedback.textContent = esCorrecta ? '¡Muy bien! Has acertado.' : 'No era esa. La respuesta correcta está marcada en verde.';
    feedback.className = esCorrecta ? 'feedback feedback-correcto' : 'feedback feedback-incorrecto';
  }
};

