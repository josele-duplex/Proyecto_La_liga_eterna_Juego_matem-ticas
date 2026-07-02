// Pantalla 2: elegir modo de juego (Promesas / Estrellas / Leyendas).
function mostrarSelectorModo(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: false });

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿En qué equipo juegas hoy?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'calendario';
  MODOS.forEach((modo) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'estadio';

    const desbloqueado = modoDesbloqueado(perfilId, modo);

    tarjeta.appendChild(UI.crearEmblemaModo(modo));

    const nombre = document.createElement('h2');
    nombre.textContent = desbloqueado ? `${modo.icono} ${modo.nombre}` : `🔒 ${modo.nombre}`;
    tarjeta.appendChild(nombre);

    const desc = document.createElement('p');
    desc.textContent = modo.descripcion;
    tarjeta.appendChild(desc);

    if (desbloqueado) {
      const elegir = document.createElement('button');
      elegir.className = 'boton-siguiente';
      elegir.textContent = 'Jugar en este equipo';
      elegir.addEventListener('click', () => {
        const progreso = Storage.cargarProgreso(perfilId);
        progreso.modoId = modo.id;
        Storage.guardarProgreso(perfilId, progreso);
        mostrarCalendario(perfilId);
      });
      tarjeta.appendChild(elegir);
    } else {
      tarjeta.classList.add('estadio-bloqueado');
      const candado = document.createElement('p');
      candado.className = 'aviso-bloqueado';
      const requisito = MODOS.find((m) => m.id === modo.desbloqueadoPor);
      candado.textContent = `Domina el equipo ${requisito ? requisito.nombre : 'anterior'} para desbloquearlo.`;
      tarjeta.appendChild(candado);
    }

    lista.appendChild(tarjeta);
  });
  app.appendChild(lista);
}
