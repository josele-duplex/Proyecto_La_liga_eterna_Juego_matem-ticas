// Pantalla: Ceremonia de ascenso (FASE M7, B.3 reducido). Antes, desbloquear un equipo superior
// solo mostraba un botón discreto dentro del panel de victoria (M3/M5); ahora ese botón lleva
// primero por esta ceremonia breve y celebratoria — mismo look que la pantalla de victoria, pero
// dedicada por completo al ascenso — antes de entrar al calendario del nuevo equipo. Quien marca
// progreso.modoId y progreso.ascensosCelebrados es esta pantalla (al aceptar), no quien la invoca.
function mostrarCeremoniaAscenso(perfilId, modo) {
  UI.aplicarTema('recompensa');
  document.getElementById('app').className = 'lienzo';
  document.getElementById('app').innerHTML = '';
  const zona = document.getElementById('siguiente');
  zona.innerHTML = '';

  const perfil = PERFILES.find((p) => p.id === perfilId);

  const panel = document.createElement('div');
  panel.className = 'panel-victoria panel-ascenso';

  const cabecera = document.createElement('div');
  cabecera.className = 'victoria-cabecera';
  const trofeo = document.createElement('span');
  trofeo.className = 'victoria-trofeo';
  trofeo.textContent = '🎉';
  const titulo = document.createElement('h2');
  titulo.className = 'victoria-titulo';
  titulo.textContent = '¡ASCENSO DE DIVISIÓN!';
  cabecera.append(trofeo, titulo);
  panel.appendChild(cabecera);

  const sub = document.createElement('p');
  sub.className = 'victoria-sub';
  sub.textContent = perfil
    ? `¡Lo has conseguido, ${perfil.nombre}! Subes al equipo ${modo.nombre}.`
    : `¡Subes al equipo ${modo.nombre}!`;
  panel.appendChild(sub);

  const grupo = document.createElement('div');
  grupo.className = 'grupo-victoria';
  const emblemaWrap = document.createElement('div');
  emblemaWrap.className = 'ascenso-emblema';
  emblemaWrap.appendChild(UI.crearEmblemaModo(modo));
  grupo.appendChild(emblemaWrap);
  const capi = document.createElement('img');
  capi.className = 'capi-victoria';
  capi.src = 'assets/img/capi/avatar-capi-alegria.webp';
  capi.alt = '¡Capi celebra contigo!';
  grupo.appendChild(capi);
  panel.appendChild(grupo);

  const descripcion = document.createElement('p');
  descripcion.textContent = modo.descripcion;
  panel.appendChild(descripcion);

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente boton-cta';
  boton.textContent = `Jugar mi primer partido en ${modo.nombre}`;
  boton.addEventListener('click', () => {
    const progreso = Storage.cargarProgreso(perfilId);
    progreso.modoId = modo.id;
    progreso.ascensosCelebrados = progreso.ascensosCelebrados || [];
    if (!progreso.ascensosCelebrados.includes(modo.id)) progreso.ascensosCelebrados.push(modo.id);
    Storage.guardarProgreso(perfilId, progreso);
    mostrarCalendario(perfilId);
  });
  panel.appendChild(boton);

  zona.appendChild(panel);
  Sonido.sonidoVictoria();
  UI.celebrarVictoria(panel);
}
