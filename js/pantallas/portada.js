// Pantalla 0: portada (pantalla de título), siempre la primera al abrir la app. Imagen a
// pantalla completa con un único botón real "¡A jugar!"; ese toque es también el primer gesto
// del usuario en iOS, así que de paso desbloquea el audio (Web Audio exige un gesto para sonar).
function mostrarPortada(alContinuar) {
  const portada = document.getElementById('portada');
  portada.className = 'pantalla-portada';

  const sonidoBoton = document.createElement('button');
  sonidoBoton.className = 'portada-sonido';
  sonidoBoton.textContent = Sonido.activo ? '🔊' : '🔇';
  sonidoBoton.addEventListener('click', () => {
    sonidoBoton.textContent = Sonido.alternar() ? '🔊' : '🔇';
  });
  portada.appendChild(sonidoBoton);

  const boton = document.createElement('button');
  boton.className = 'portada-boton';
  boton.textContent = '⚽ ¡A jugar!';
  boton.addEventListener('click', () => {
    Sonido.obtenerContexto();
    portada.innerHTML = '';
    portada.className = '';
    alContinuar();
  });
  portada.appendChild(boton);
}
