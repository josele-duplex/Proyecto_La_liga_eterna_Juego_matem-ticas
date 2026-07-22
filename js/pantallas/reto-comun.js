// Piezas de UI compartidas por las 4 pantallas que resuelven un puzle con Engine.render (Liga en
// reto.js, Entrenamiento del Capitán, Contrarreloj y Copa de Leyendas): el panel de poderes, la
// tarjeta del entrenador Capi con sus reacciones, y la celebración de acierto. Extraído de reto.js
// en la FASE D3 (rediseño visual premium) porque ese archivo ya rozaba las ~500 líneas — regla del
// proyecto de trocear antes de seguir creciendo, no una fase de contenido nueva.

// Panel de poderes (TG.7): gastar energía en ayudas que nunca revelan la respuesta directa.
// "Ojo del Águila" solo existe para opción múltiple (lo añade engine.js) y empieza oculto hasta
// el primer fallo; "Consejo del Capitán" está siempre disponible; "Tiempo Extra" solo existe en
// Relámpago (cronómetro de renderVerdaderoFalso). Cada poder se paga solo si tuvo efecto real.
function crearZonaPoderes(perfilId, capacidades) {
  const zona = document.createElement('div');
  zona.className = 'zona-poderes';

  const crearBoton = (poder, id, alUsar) => {
    const boton = document.createElement('button');
    boton.id = id;
    boton.className = 'boton-poder';
    const textoNormal = `${poder.icono} ${poder.nombre} (-${poder.costo}⚡)`;
    boton.textContent = textoNormal;

    boton.addEventListener('click', () => {
      const progreso = Storage.cargarProgreso(perfilId);
      if ((progreso.energia || 0) < poder.costo) {
        boton.textContent = 'Te falta energía ⚡';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      if (alUsar() === false) {
        boton.textContent = 'No hace falta aquí';
        setTimeout(() => { boton.textContent = textoNormal; }, 1400);
        return;
      }
      progreso.energia -= poder.costo;
      Storage.guardarProgreso(perfilId, progreso);
      mostrarBarraPerfil(perfilId, { mostrarVolver: true, ocultarCambiarEquipo: true, ocultarMuseo: true });
      boton.disabled = true;
      boton.classList.add('boton-poder-usado');
    });

    zona.appendChild(boton);
    return boton;
  };

  if (capacidades.usarOjoAguila) {
    const boton = crearBoton(PODERES.ojo_aguila, 'poder-ojo-aguila', capacidades.usarOjoAguila);
    boton.hidden = true;
  }

  crearBoton(PODERES.consejo_capitan, 'poder-consejo-capitan', capacidades.usarConsejoCapitan);

  if (capacidades.usarTiempoExtra) {
    crearBoton(PODERES.tiempo_extra, 'poder-tiempo-extra', () => capacidades.usarTiempoExtra(PODERES.tiempo_extra.segundos));
  }

  return zona;
}

// Tarjeta del entrenador Capi: retrato grande, bocadillo y botón para escuchar el enunciado.
// `fraseInicial` la decide quien llama (jugada decisiva/repaso en Liga — TG.1/TG.5 —, o el saludo
// tranquilo de Entrenamiento/Contrarreloj, FASE M5): esta función solo pinta, no elige el mensaje.
function crearTarjetaCapi(puzzle, fraseInicial) {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta-capi';

  const img = document.createElement('img');
  img.id = 'avatar-capi-actual';
  img.className = 'capi-retrato';
  img.src = 'assets/img/capi/avatar-capi-concentracion.webp';
  img.alt = 'Capi, tu entrenador';
  tarjeta.appendChild(img);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'capi-cuerpo';

  const bocadillo = document.createElement('p');
  bocadillo.id = 'capi-bocadillo';
  bocadillo.className = 'bocadillo-capi';
  bocadillo.textContent = fraseInicial;
  cuerpo.appendChild(bocadillo);

  const boton = document.createElement('button');
  boton.className = 'boton-voz';
  boton.textContent = '🔊 Escuchar';
  boton.addEventListener('click', () => Sonido.decirVoz(puzzle.enunciado.voz));
  cuerpo.appendChild(boton);

  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

// Cambia la pose y el bocadillo de Capi según lo que pasa, con un pequeño rebote.
function reaccionarCapi(tarjeta, estado, frase) {
  const poses = { normal: 'concentracion', duda: 'duda', alegria: 'alegria', animo: 'animo' };
  const img = tarjeta.querySelector('#avatar-capi-actual');
  const bocadillo = tarjeta.querySelector('#capi-bocadillo');
  if (img) img.src = `assets/img/capi/avatar-capi-${poses[estado] || 'concentracion'}.webp`;
  if (bocadillo) bocadillo.textContent = frase;
  tarjeta.classList.remove('capi-rebote');
  void tarjeta.offsetWidth; // reinicia la animación
  tarjeta.classList.add('capi-rebote');
}

// Convierte el feedback de acierto en una tarjeta de celebración con la energía ganada. Nombra la
// estrategia con su vocabulario técnico real (FASE M1, A.5: "Has usado DESCOMPOSICIÓN") en vez de
// un genérico "¡Muy bien!" — construye lenguaje matemático transferible fuera del juego.
// `energia` es opcional (FASE M5): Entrenamiento del Capitán no reparte energía (a propósito, para
// no mezclar recompensas con la práctica libre), así que si es 0/undefined se omite esa línea.
function celebrarAcierto(zonaJuego, energia, vocabulario) {
  const feedback = zonaJuego.querySelector('.feedback');
  if (!feedback) return;
  feedback.className = 'feedback feedback-correcto celebracion';
  feedback.innerHTML = '';
  const titulo = document.createElement('span');
  titulo.className = 'celebracion-titulo';
  titulo.textContent = '⚽ ¡Golazo!';
  const sub = document.createElement('span');
  sub.className = 'celebracion-sub';
  sub.textContent = vocabulario ? `Has usado ${vocabulario}` : '¡Muy bien! Has acertado.';
  feedback.append(titulo, sub);
  if (energia) {
    const en = document.createElement('span');
    en.className = 'celebracion-energia';
    en.textContent = `+${energia} energía`;
    feedback.append(en);
  }

  // FASE D5 (rediseño premium, auditoría §6): "punch" de recompensa — sacudida suave del panel
  // de reto + destellos dorados que estallan desde la tarjeta. Se omiten si el sistema pide menos
  // movimiento (mismo patrón que UI.celebrarVictoria con el confeti).
  if (!UI.prefiereMenosMovimiento()) {
    const app = document.getElementById('app');
    if (app) {
      app.classList.remove('sacudida-golazo');
      void app.offsetWidth; // reinicia la animación si dos aciertos llegan seguidos
      app.classList.add('sacudida-golazo');
      setTimeout(() => app.classList.remove('sacudida-golazo'), 400);
    }
    const NUM_DESTELLOS = 8;
    for (let i = 0; i < NUM_DESTELLOS; i++) {
      const destello = document.createElement('span');
      destello.className = 'destello-dorado';
      destello.style.setProperty('--angulo', `${(360 / NUM_DESTELLOS) * i}deg`);
      destello.style.setProperty('--retraso', `${Math.random() * 0.1}s`);
      feedback.appendChild(destello);
      setTimeout(() => destello.remove(), 750);
    }
  }
}
