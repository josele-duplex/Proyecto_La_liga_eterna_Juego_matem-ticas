// Pantalla: Panel de Familia (FASE M8, D.3 + D.6 + ficha familias del GDD §13). Traduce el
// registro de evaluación invisible (Evaluacion.registrar, acumulado desde M0 sin mostrarse nunca
// al niño) a lenguaje claro para madres/padres/tutores, y reúne los dos ajustes de accesibilidad
// del plan: tipografía para dislexia y exportar el progreso a un archivo. NUNCA usa palabras que
// etiqueten capacidad ("lento", "torpe", "mal") — mismo criterio de copy protector que el resto
// del juego (sección 8 del plan).
function mostrarPanelFamilia(perfilId) {
  UI.aplicarTema('mundo');
  limpiarPantalla();
  mostrarBarraPerfil(perfilId, { mostrarVolver: true });

  const progreso = Storage.cargarProgreso(perfilId);
  const perfil = PERFILES.find((p) => p.id === perfilId);
  const app = document.getElementById('app');

  const titulo = document.createElement('p');
  titulo.className = 'enunciado';
  titulo.textContent = '👪 Panel de Familia';
  app.appendChild(titulo);

  const explicacion = document.createElement('p');
  explicacion.className = 'entrenamiento-explicacion';
  explicacion.textContent = `Un resumen en lenguaje claro de cómo practica ${perfil ? perfil.nombre : 'tu hijo/a'}. Esto nunca lo ve el niño ni afecta a su partida: es solo para la familia.`;
  app.appendChild(explicacion);

  app.appendChild(crearSeccionAjustes(perfilId, progreso));
  app.appendChild(crearSeccionResumen(progreso));
  app.appendChild(crearSeccionExportar(perfilId, progreso));
}

// Ajustes de accesibilidad (D.6): tipografía para dislexia, activable con un solo toque.
function crearSeccionAjustes(perfilId, progreso) {
  const seccion = document.createElement('div');
  seccion.className = 'tarjeta-leyenda familia-seccion';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Ajustes de lectura';
  seccion.appendChild(titulo);

  const fila = document.createElement('label');
  fila.className = 'familia-ajuste-fila';
  const casilla = document.createElement('input');
  casilla.type = 'checkbox';
  casilla.checked = !!(progreso.ajustes && progreso.ajustes.tipografiaDislexia);
  casilla.addEventListener('change', () => {
    const p = Storage.cargarProgreso(perfilId);
    p.ajustes = p.ajustes || { tipografiaDislexia: false, audio: true };
    p.ajustes.tipografiaDislexia = casilla.checked;
    Storage.guardarProgreso(perfilId, p);
    document.documentElement.classList.toggle('modo-dislexia', casilla.checked);
  });
  const texto = document.createElement('span');
  texto.textContent = 'Tipografía para dislexia (más espacio entre letras y líneas)';
  fila.append(casilla, texto);
  seccion.appendChild(fila);

  return seccion;
}

// Resumen traducido del registro de evaluación (D.3): un párrafo por concepto jugado, con su
// insignia de nivel (misma escala 🥉🥈🥇 que ve el niño) y una frase que describe CÓMO le va, sin
// juzgar. Los umbrales son deliberadamente generosos: la app celebra el intento, no solo el acierto.
function crearSeccionResumen(progreso) {
  const seccion = document.createElement('div');
  seccion.className = 'tarjeta-leyenda familia-seccion';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Cómo le va, concepto a concepto';
  seccion.appendChild(titulo);

  const porConcepto = (progreso.registro && progreso.registro.porConcepto) || {};
  const conceptos = Object.keys(porConcepto);

  if (conceptos.length === 0) {
    const vacio = document.createElement('p');
    vacio.textContent = 'Todavía no hay partidas jugadas para resumir.';
    seccion.appendChild(vacio);
    return seccion;
  }

  conceptos.forEach((concepto) => {
    const datos = porConcepto[concepto];
    const nombreConcepto = NOMBRES_CONCEPTO[concepto] || concepto;
    const nivel = Progression.nivelDominioConcepto(progreso, concepto);

    const fila = document.createElement('div');
    fila.className = 'familia-fila-concepto';

    const cabecera = document.createElement('div');
    cabecera.className = 'familia-fila-cabecera';
    if (nivel) {
      const medalla = document.createElement('img');
      medalla.src = NIVELES_DOMINIO[nivel].imagenSvg;
      medalla.alt = NIVELES_DOMINIO[nivel].nombre;
      medalla.className = 'icono-medalla';
      cabecera.appendChild(medalla);
    }
    const nombre = document.createElement('strong');
    nombre.textContent = nombreConcepto.charAt(0).toUpperCase() + nombreConcepto.slice(1);
    cabecera.appendChild(nombre);
    fila.appendChild(cabecera);

    const frase = document.createElement('p');
    frase.textContent = fraseResumenConcepto(datos);
    fila.appendChild(frase);

    const botonVoz = document.createElement('button');
    botonVoz.className = 'boton-voz';
    botonVoz.textContent = '🔊 Escuchar';
    botonVoz.addEventListener('click', () => Sonido.decirVoz(`${nombre.textContent}. ${frase.textContent}`));
    fila.appendChild(botonVoz);

    seccion.appendChild(fila);
  });

  return seccion;
}

// Traduce los números crudos de una entrada de registro a una frase en lenguaje claro, sin
// etiquetar capacidad (nunca "mal", "lento", "torpe"): cuenta el apoyo que ha necesitado, no lo
// que "es". Los tres tramos son intencionadamente generosos con el niño.
function fraseResumenConcepto(datos) {
  const jugadas = datos.jugadas;
  const tasaDominio = datos.dominios / jugadas;
  const vecesJugadas = `${jugadas} ${jugadas === 1 ? 'vez' : 'veces'}`;

  if (tasaDominio >= 0.7) {
    return `Ha jugado ${vecesJugadas} y casi siempre acierta a la primera, sin apenas pistas. Lo domina con soltura.`;
  }
  if (tasaDominio >= 0.4) {
    return `Ha jugado ${vecesJugadas}. Lo va aprendiendo bien, a veces con alguna pista de apoyo — es un proceso normal.`;
  }
  return `Ha jugado ${vecesJugadas}. Todavía necesita pistas con frecuencia — nada preocupante, es justo lo que el juego está pensado para acompañar.`;
}

// Exportar progreso (D.3): descarga el progreso COMPLETO como archivo .json. A propósito, esta
// pantalla NUNCA ofrece "importar": reintroducir un archivo antiguo podría corromper el progreso
// actual sin que la familia lo note (regla explícita del plan, sección 6).
function crearSeccionExportar(perfilId, progreso) {
  const seccion = document.createElement('div');
  seccion.className = 'tarjeta-leyenda familia-seccion';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Copia del progreso';
  seccion.appendChild(titulo);

  const texto = document.createElement('p');
  texto.textContent = 'Descarga un archivo con todo el progreso guardado en este dispositivo, por si quieres guardarlo aparte.';
  seccion.appendChild(texto);

  const boton = document.createElement('button');
  boton.className = 'boton-siguiente';
  boton.textContent = '⬇️ Descargar progreso';
  boton.addEventListener('click', () => {
    const perfil = PERFILES.find((p) => p.id === perfilId);
    const nombreArchivo = `liga-eterna-progreso-${perfil ? perfil.id : perfilId}-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(progreso, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  });
  seccion.appendChild(boton);

  return seccion;
}
