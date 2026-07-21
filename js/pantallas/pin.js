// Contraseña de perfil (privacidad familiar, no seguridad real): algunos perfiles llevan un
// campo `pin` en datos-juego.js (PERFILES) para que un hermano no entre sin querer en la partida
// de otro. `entrarEnPerfil` es el ÚNICO punto por el que se debe entrar a jugar con un perfil —
// lo usan tanto el selector de jugador (perfil.js) como la reanudación automática al abrir la app
// (main.js), para que la contraseña se pida SIEMPRE, no solo la primera vez que se elige.
function entrarEnPerfil(perfilId, alEntrar) {
  const perfil = PERFILES.find((p) => p.id === perfilId);
  if (perfil && perfil.pin) {
    mostrarPantallaPin(perfil, alEntrar);
  } else {
    alEntrar();
  }
}

function mostrarPantallaPin(perfil, alEntrar) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  document.getElementById('barra-perfil').innerHTML = '';

  const app = document.getElementById('app');

  const cabecera = document.createElement('div');
  cabecera.className = 'pin-cabecera';
  cabecera.appendChild(UI.crearAvatarPerfil(perfil));
  const nombre = document.createElement('p');
  nombre.className = 'enunciado';
  nombre.textContent = `Hola, ${perfil.nombre}`;
  cabecera.appendChild(nombre);
  app.appendChild(cabecera);

  const instrucciones = document.createElement('p');
  instrucciones.className = 'entrenamiento-explicacion';
  instrucciones.textContent = 'Escribe tu contraseña para entrar en tu partida.';
  app.appendChild(instrucciones);

  const campo = document.createElement('input');
  campo.type = 'password';
  campo.className = 'pin-campo';
  campo.autocomplete = 'off';
  campo.placeholder = 'Contraseña';
  app.appendChild(campo);

  const error = document.createElement('p');
  error.className = 'pin-error';
  app.appendChild(error);

  // Sin distinción de mayúsculas/espacios: son contraseñas familiares para que no entre otro
  // hermano por error, no una credencial real — cuanto menos roce, mejor para un niño pequeño.
  const comprobar = () => {
    if (campo.value.trim().toLowerCase() === perfil.pin.toLowerCase()) {
      alEntrar();
    } else {
      error.textContent = 'Esa no es. ¡Inténtalo otra vez!';
      campo.value = '';
      campo.focus();
    }
  };

  campo.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') comprobar();
  });

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = 'Entrar';
  boton.addEventListener('click', comprobar);
  app.appendChild(boton);

  const volver = document.createElement('button');
  volver.textContent = 'No soy yo, volver';
  volver.addEventListener('click', () => {
    Storage.borrarPerfilActivo();
    mostrarSelectorPerfil();
  });
  app.appendChild(volver);

  campo.focus();
}
