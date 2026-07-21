// Pantalla: presentación del rival ("VS", estilo videojuego). Antes de cada partido, el Fuera de
// Juego de hoy salta al campo, suelta una provocación y sube un poco el pulso — la tensión buena
// de un videojuego, nunca burla de un fallo (las provocaciones pican ANTES de jugar, jamás
// después de fallar). La primera vez que aparece un rival se cuenta su historia (FASE N1); las
// siguientes, una provocación al azar. Un solo botón: empezar el partido.
function mostrarPresentacionRival(perfilId, estadio, sesion) {
  UI.aplicarTema('contrarreloj'); // morado: el color del "mundo del caos" (guía de estilo).
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });

  const rival = sesion.rival;
  const app = document.getElementById('app');

  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-vs';

  const anuncio = document.createElement('p');
  anuncio.className = 'vs-anuncio';
  anuncio.textContent = sesion.especial
    ? `${sesion.especial.icono} Partido especial: ${sesion.especial.nombre}`
    : `🏟 ${estadio.nombre}`;
  tarjeta.appendChild(anuncio);

  const titulo = document.createElement('h2');
  titulo.className = 'vs-titulo';
  titulo.textContent = `¡${rival.nombre} salta al campo!`;
  tarjeta.appendChild(titulo);

  const img = document.createElement('img');
  img.className = 'vs-rival';
  img.src = rival.imagen;
  img.alt = `Fuera de Juego: ${rival.nombre}`;
  tarjeta.appendChild(img);

  // Primera vez: su historia. Después: una provocación al azar (pique de videojuego).
  const provocaciones = rival.provocaciones || [];
  const frase = document.createElement('p');
  frase.className = 'vs-provocacion';
  frase.textContent = sesion.presentacionRival
    ? sesion.presentacionRival
    : `"${provocaciones[Math.floor(Math.random() * provocaciones.length)] || '...'}"`;
  tarjeta.appendChild(frase);

  if (sesion.especial) {
    const condicion = document.createElement('p');
    condicion.className = 'vs-condicion';
    condicion.textContent = `${sesion.especial.descripcion} Si lo consigues: +${sesion.especial.bono}⚡ extra. Si no, ganas el partido igual.`;
    tarjeta.appendChild(condicion);
  }

  const respuesta = document.createElement('p');
  respuesta.className = 'vs-capi';
  respuesta.textContent = `Capi: "Tranquilo, ${sesion.total} retos y lo dejamos fuera de juego. ¡Tú puedes!"`;
  tarjeta.appendChild(respuesta);

  app.appendChild(tarjeta);

  const zona = document.getElementById('siguiente');
  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = '⚽ ¡Que empiece el partido!';
  boton.addEventListener('click', () => jugarReto(perfilId, estadio, sesion));
  zona.appendChild(boton);
}
