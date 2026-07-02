// Pantalla 1: elegir jugador.
function mostrarSelectorPerfil() {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  document.getElementById('barra-perfil').innerHTML = '';

  const app = document.getElementById('app');
  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '¿Quién juega?';
  app.appendChild(titulo);

  const lista = document.createElement('div');
  lista.className = 'opciones';
  PERFILES.forEach((perfil) => {
    const boton = document.createElement('button');
    boton.className = 'opcion boton-perfil';
    boton.appendChild(UI.crearAvatarPerfil(perfil));
    const nombre = document.createElement('span');
    nombre.textContent = perfil.nombre;
    boton.appendChild(nombre);
    boton.addEventListener('click', () => {
      Storage.guardarPerfilActivo(perfil.id);
      try {
        mostrarSelectorModo(perfil.id);
      } catch (e) {
        // Si el progreso guardado de este jugador estuviera dañado y reventara al entrar, en vez de
        // dejarlo bloqueado para siempre lo reiniciamos (datos corruptos, de todas formas inservibles)
        // y volvemos a entrar limpio. Solo salta si algo va mal; en uso normal nunca se ejecuta.
        console.error(`Progreso de ${perfil.id} dañado; reiniciándolo.`, e);
        Storage.guardarProgreso(perfil.id, {});
        mostrarSelectorModo(perfil.id);
      }
    });
    lista.appendChild(boton);
  });
  app.appendChild(lista);
}
