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

    puzzle.respuesta.opciones.forEach((opcion) => {
      const boton = document.createElement('button');
      boton.className = 'opcion';
      boton.textContent = opcion.texto;
      boton.dataset.opcionId = opcion.id;
      opciones.appendChild(boton);
    });

    container.appendChild(opciones);
  }
};

