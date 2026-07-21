// Pantalla: El Descanso. Pausa a mitad de partido (como el descanso de un partido de verdad) que
// relaja la dinámica: sin pregunta, sin cronómetro, sin recompensa. Capi cuenta un truco
// matemático, una curiosidad o un juego para enseñar a los amigos (data/descansos.json). Un solo
// botón para saltar a la segunda parte — nunca bloquea ni se alarga: leerlo es opcional, seguir
// jugando siempre está a un toque.
function mostrarDescanso(perfilId, estadio, sesion) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });

  const progreso = Storage.cargarProgreso(perfilId);
  const entrada = elegirDescanso(progreso, descansos);
  Storage.guardarProgreso(perfilId, progreso);

  const ETIQUETAS = {
    truco: '🎩 Truco del Capi',
    curiosidad: '💡 ¿Sabías que...?',
    juego: '🎲 Juego para el patio'
  };

  const app = document.getElementById('app');

  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '🥤 ¡Descanso!';
  app.appendChild(titulo);

  const marcadorTexto = document.createElement('p');
  marcadorTexto.className = 'descanso-marcador';
  marcadorTexto.textContent = `Primera parte jugada: vas ${sesion.hechos} - ${sesion.golesRival}. Respira, que esto también es entrenar.`;
  app.appendChild(marcadorTexto);

  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-descanso';

  const etiqueta = document.createElement('span');
  etiqueta.className = `descanso-etiqueta descanso-${entrada.tipo}`;
  etiqueta.textContent = ETIQUETAS[entrada.tipo] || '💡 Del Capi';
  tarjeta.appendChild(etiqueta);

  const tituloTruco = document.createElement('h3');
  tituloTruco.textContent = entrada.titulo;
  tarjeta.appendChild(tituloTruco);

  const texto = document.createElement('p');
  texto.className = 'descanso-texto';
  texto.textContent = entrada.texto;
  tarjeta.appendChild(texto);

  if (entrada.paraAmigos) {
    const amigos = document.createElement('p');
    amigos.className = 'descanso-amigos';
    amigos.textContent = `🤝 ${entrada.paraAmigos}`;
    tarjeta.appendChild(amigos);
  }

  const botonVoz = document.createElement('button');
  botonVoz.className = 'boton-voz';
  botonVoz.textContent = '🔊 Escuchar';
  botonVoz.addEventListener('click', () => {
    Sonido.decirVoz(`${entrada.titulo}. ${entrada.texto} ${entrada.paraAmigos || ''}`);
  });
  tarjeta.appendChild(botonVoz);

  app.appendChild(tarjeta);

  // Capi acompaña el descanso con su pose de ánimo (pulgar arriba), sin bocadillo nuevo: la
  // tarjeta ya es su mensaje.
  const capi = document.createElement('img');
  capi.className = 'capi-descanso';
  capi.src = 'assets/img/capi/avatar-capi-animo.webp';
  capi.alt = 'Capi, en el descanso';
  app.appendChild(capi);

  const zona = document.getElementById('siguiente');
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '⚽ ¡Segunda parte!';
  boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  zona.appendChild(boton);
}
