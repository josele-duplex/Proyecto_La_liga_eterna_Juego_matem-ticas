// Puerta de adulto (privacidad del informe de familia): el Panel de Familia cuelga del menú "☰ Más"
// junto a Museo y Mi Estadio, así que sin barrera cualquier niño llegaba de un toque al informe
// "Cómo le va, concepto a concepto" — justo lo que su copy prometía que nunca vería. Esto NO es
// seguridad real (nada en el dispositivo lo es), solo un filtro por edad: una multiplicación escrita
// CON LETRAS y con números altos, fuera del alcance de un niño pequeño que aún trabaja las tablas.
// Se elige de un banco fijo para no depender de un conversor número→texto en español.
const RETOS_PUERTA_ADULTO = [
  { texto: 'catorce por doce', respuesta: 168 },
  { texto: 'trece por quince', respuesta: 195 },
  { texto: 'diecisiete por doce', respuesta: 204 },
  { texto: 'dieciséis por catorce', respuesta: 224 },
  { texto: 'dieciocho por trece', respuesta: 234 },
  { texto: 'diecinueve por doce', respuesta: 228 },
  { texto: 'quince por dieciséis', respuesta: 240 },
  { texto: 'catorce por dieciocho', respuesta: 252 }
];

// mostrarPuertaAdulto(perfilId, alPasar): pide el reto y solo llama a `alPasar` si se resuelve.
// Es el ÚNICO camino recomendado hacia mostrarPanelFamilia — igual que entrarEnPerfil lo es hacia
// jugar un perfil. Mantiene la barra de perfil arriba para que el niño pueda volver sin bloquearse.
function mostrarPuertaAdulto(perfilId, alPasar) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const app = document.getElementById('app');
  const reto = RETOS_PUERTA_ADULTO[Math.floor(Math.random() * RETOS_PUERTA_ADULTO.length)];

  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '👪 Panel de Familia';
  app.appendChild(titulo);

  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-leyenda familia-seccion';

  const aviso = document.createElement('p');
  aviso.className = 'entrenamiento-explicacion';
  aviso.textContent = 'Esta sección es para un adulto. Para entrar, resuelve la operación:';
  tarjeta.appendChild(aviso);

  const enunciadoReto = document.createElement('p');
  enunciadoReto.className = 'enunciado';
  enunciadoReto.textContent = `${reto.texto} = ?`;
  tarjeta.appendChild(enunciadoReto);

  const campo = document.createElement('input');
  campo.type = 'number';
  campo.inputMode = 'numeric';
  campo.className = 'pin-campo';
  campo.autocomplete = 'off';
  campo.placeholder = 'Escribe el resultado';
  tarjeta.appendChild(campo);

  const error = document.createElement('p');
  error.className = 'pin-error';
  tarjeta.appendChild(error);

  const comprobar = () => {
    if (Number(campo.value) === reto.respuesta) {
      alPasar();
    } else {
      error.textContent = 'No es correcto. Esta parte es solo para la familia.';
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
  tarjeta.appendChild(boton);

  app.appendChild(tarjeta);
  campo.focus();
}
