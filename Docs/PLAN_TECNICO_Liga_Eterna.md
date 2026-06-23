# Plan de trabajo técnico — *Liga Eterna: Los Guardianes del Juego*

> **Qué es este documento.** Es el mapa de obra del proyecto: la arquitectura, el orden en que se construyen las piezas y los criterios para saber cuándo cada pieza está terminada. Pensado para guardarse en la raíz del repositorio y consultarse en cada sesión de Claude Code. No contiene código.

> **Cómo usarlo.** En cada sesión con Sonnet, abre este archivo, elige **una** tarea, pega su bloque (problema + dependencias + criterio de "terminado") y pide que la implemente. Una tarea por sesión.

---

## 0. Vocabulario mínimo (para no perderse)

Tres términos imprescindibles, definidos en una frase:

- **JSON**: un formato de texto para guardar datos ordenados (listas, fichas, valores). Aquí lo usaremos para describir cada puzle sin tocar el código del juego.
- **Motor (engine)**: la parte del programa que sabe *jugar* a un puzle (mostrarlo, comprobar la respuesta, dar pistas), pero que no sabe nada de *qué* puzle es. Recibe un JSON y lo convierte en una jugada.
- **Estado (state)**: la "memoria viva" de la partida — qué nivel va, cuánta energía tiene, qué cromos lleva. Es lo único que se guarda en el dispositivo.

La idea rectora de todo el plan: **los datos (qué puzle, qué contenido matemático) van separados del motor (cómo se juega) y de la pintura (cómo se ve).** Si esos tres mundos están separados, podrás crear cientos de puzles nuevos sin tocar el código, y el modo 6 años y el modo 8-9 años compartirán el mismo motor.

---

## 1. Arquitectura general

### 1.1 Estructura de carpetas

```
liga-eterna/
├── index.html              ← punto de entrada único
├── manifest.webmanifest    ← convierte la web en app instalable (PWA)
├── service-worker.js       ← permite que funcione sin conexión
├── /css/
│   └── styles.css          ← toda la apariencia
├── /js/
│   ├── main.js             ← arranca el juego y conecta las piezas
│   ├── engine.js           ← MOTOR: juega cualquier puzle a partir de su JSON
│   ├── progression.js      ← decide qué viene después (progresión por dominio)
│   ├── storage.js          ← guarda y carga el progreso en el dispositivo
│   ├── ui.js               ← pinta pantallas, botones, transiciones
│   ├── audio.js            ← sonidos y la "voz del entrenador"
│   └── assessment.js       ← evaluación invisible (registra cómo juega)
├── /data/
│   ├── puzzles/            ← un JSON por tipo de puzle (los CONTENIDOS)
│   │   ├── 6-anios/
│   │   ├── 8-anios/
│   │   └── 9-anios/
│   ├── estadios.json       ← el calendario/mapa de la Liga
│   └── recompensas.json    ← cromos, insignias, energía
├── /assets/
│   ├── /img/
│   └── /audio/
└── /docs/
    └── PLAN_TECNICO.md     ← este documento
```

### 1.2 Qué debe estar desacoplado y por qué

"Desacoplado" significa que dos piezas no se conocen por dentro: se hablan por un canal claro y acordado, de modo que puedes cambiar una sin romper la otra. Estas son las separaciones que conviene respetar desde el primer día:

| Pieza | Qué hace | Qué NO debe saber |
|---|---|---|
| **engine.js** (motor) | Recibe el JSON de un puzle, lo muestra, comprueba la respuesta, dispara pistas. | No sabe qué estadio es, ni cuánta energía hay, ni si el jugador tiene 6 u 8 años. Solo juega lo que le dan. |
| **data/puzzles** (contenidos) | Describe cada reto matemático en JSON: enunciado, fase CPA, respuesta correcta, pistas. | No contiene código. Es texto que el motor interpreta. |
| **progression.js** (progresión) | Decide qué puzle toca según el dominio demostrado. | No sabe *cómo* se juega un puzle por dentro; solo pide al motor "juega este" y escucha el resultado. |
| **storage.js** (guardado) | Escribe y lee el estado en el dispositivo. | No sabe nada de fútbol ni de matemáticas; solo guarda y devuelve datos. |
| **ui.js** (capa visual/narrativa) | Pinta estadios, marcadores, celebraciones; aplica la temática de fútbol. | No comprueba respuestas ni decide progresión. Solo muestra lo que las otras piezas le dicen. |
| **assessment.js** (evaluación invisible) | Observa y registra: tiempo, errores por tipo, estrategia usada, pistas pedidas. | No interrumpe el juego ni decide nada; solo escucha y anota. |

**Por qué esto resuelve el problema del doble modo (6 años / 8-9 años):** si el motor solo entiende JSON, el modo 6 años no es "otro juego", sino **los mismos archivos de motor cargando otra carpeta de puzles** (`/data/puzzles/6-anios/`) con retos más visuales y guiados. La temática (fútbol, escuela/cantera) vive en la capa visual y en los textos del JSON, no en la lógica. Cero duplicación de motor.

### 1.3 Decisiones que conviene fijar AHORA (caras de cambiar después)

Estas tres decisiones son las "vigas maestras". Cambiarlas a mitad de obra obliga a rehacer mucho; conviene cerrarlas en la primera fase.

1. **El formato JSON de un puzle.** Antes de crear puzles, hay que decidir cómo se describe uno: qué campos tiene (tipo de reto, fase CPA 1-4, enunciado, datos manipulables, respuesta válida, secuencia de pistas, estrategia que premia). Si este formato está bien pensado, crear contenido nuevo será rellenar fichas; si está mal pensado, cada puzle nuevo será una pelea. **Esta es la decisión más importante de todo el proyecto.**

2. **El formato del estado guardado.** Qué se guarda exactamente del progreso (perfil, dominio por concepto, energía, cromos, estadios desbloqueados) y con qué estructura. Cambiarlo después puede dejar inservibles los progresos ya guardados de tus hijos.

3. **Cómo se organizan los contenidos matemáticos.** El criterio para agrupar puzles: por concepto (descomposición, dobles, fracciones…) y por fase CPA, no por estadio. Así un mismo concepto puede aparecer en varios estadios y el sistema de progresión puede pedir "otro puzle de descomposición, pero en fase abstracta" sin buscar a ciegas.

**Decisiones que SÍ pueden esperar** (sin coste): el aspecto visual concreto de cada estadio, la música, el número final de niveles, los nombres y guiños a leyendas del fútbol, las animaciones de celebración. Todo eso se puede añadir y cambiar al final sin tocar la estructura.

---

## 2. Desglose en fases y tareas

> Cada tarea está pensada para una sesión corta. El orden respeta las dependencias: no empieces una tarea si su dependencia no está marcada como terminada.

### FASE 1 — Prototipo jugable

**Meta de la fase:** que un puzle se pueda jugar de principio a fin en el iPad, con guardado, aunque sea feo.

**T1.1 — Esqueleto del proyecto y arranque**
- *Problema que resuelve:* tener un `index.html` que cargue y muestre algo, con la estructura de carpetas creada.
- *Depende de:* nada.
- *Terminado cuando:* al abrir `index.html` en el navegador (y en el iPad) aparece una pantalla inicial vacía sin errores en la consola.

**T1.2 — Definir el formato JSON de un puzle** ⭐ (viga maestra)
- *Problema que resuelve:* fijar cómo se describe cualquier puzle. Se entrega como un documento corto + 2 o 3 ejemplos reales en JSON (uno por fase CPA).
- *Depende de:* T1.1.
- *Terminado cuando:* existe un archivo de ejemplo en `/data/puzzles/` que describe un puzle de suma por descomposición, validado y comentado, y un breve documento que explica cada campo.

**T1.3 — Motor mínimo (engine.js)**
- *Problema que resuelve:* leer un JSON de puzle y mostrarlo en pantalla con sus opciones de respuesta.
- *Depende de:* T1.2.
- *Terminado cuando:* el motor carga el JSON de ejemplo y muestra el reto en pantalla, sin comprobar todavía si la respuesta es correcta.

**T1.4 — Comprobación de respuesta y feedback básico**
- *Problema que resuelve:* que el motor diga si la respuesta es correcta y reaccione (acierto/fallo).
- *Depende de:* T1.3.
- *Terminado cuando:* al responder, el juego distingue acierto de error y muestra una reacción visible distinta para cada caso.

**T1.5 — Guardado local (storage.js)**
- *Problema que resuelve:* recordar el progreso entre sesiones en el propio dispositivo.
- *Depende de:* T1.4.
- *Terminado cuando:* cierras y reabres la página y el último puzle resuelto sigue registrado.

**T1.6 — Pantalla de perfil mínima**
- *Problema que resuelve:* poder elegir/crear un jugador (uno por hijo) para que cada uno tenga su progreso.
- *Depende de:* T1.5.
- *Terminado cuando:* se puede crear al menos dos perfiles y cada uno conserva su progreso por separado.

---

### FASE 2 — Vertical slice (un estadio completo)

**Meta de la fase:** una región del juego completamente jugable y agradable, con dos tipos de puzle, progresión y aspecto cuidado. Es la prueba de que el juego "funciona" de verdad.

**T2.1 — Sistema de pistas graduadas (3 niveles)**
- *Problema que resuelve:* el andamiaje pedagógico — pista visual → pista de procedimiento → pista guiada.
- *Depende de:* T1.4.
- *Terminado cuando:* al fallar, el jugador puede pedir hasta tres pistas de ayuda creciente sin que se le dé la respuesta directa.

**T2.2 — Segundo tipo de puzle**
- *Problema que resuelve:* demostrar que el motor es realmente genérico (que sirve para más de un reto).
- *Depende de:* T1.3, T1.2.
- *Terminado cuando:* un segundo tipo de puzle (por ejemplo, recta numérica o agrupación) funciona reutilizando el mismo motor, solo cambiando su JSON.

**T2.3 — Progresión por dominio (progression.js)**
- *Problema que resuelve:* decidir qué puzle viene después según cómo lo está haciendo el jugador.
- *Depende de:* T1.4, T2.2.
- *Terminado cuando:* tras resolver varios puzles, el juego encadena automáticamente el siguiente con dificultad coherente (sube si domina, refuerza si falla).

**T2.4 — Mapa/calendario de la Liga (un estadio)**
- *Problema que resuelve:* dar el marco de aventura — elegir misión desde el calendario.
- *Depende de:* T2.3.
- *Terminado cuando:* hay una pantalla de calendario con un estadio que, al tocarlo, lanza su serie de puzles.

**T2.5 — Recompensas (energía, cromos, insignias de estrategia)**
- *Problema que resuelve:* la motivación ligada a estrategia, no solo a acierto.
- *Depende de:* T2.3.
- *Terminado cuando:* resolver un puzle otorga energía y, según la estrategia usada, una insignia distinta; las recompensas se guardan en el perfil.

**T2.6 — Capa visual y sonora del estadio (ui.js + audio.js)**
- *Problema que resuelve:* vestir la temática de fútbol — estética, marcador, celebración, voz del entrenador.
- *Depende de:* T2.4, T2.5.
- *Terminado cuando:* el estadio se ve y suena como un partido (con la prudencia de no subir la ansiedad), y el conjunto resulta agradable en iPad.

---

### FASE 3 — MVP (producto mínimo usable)

**Meta de la fase:** suficiente contenido y robustez para que tus hijos jueguen días seguidos.

**T3.1 — Modo 6 años (cantera)**
- *Problema que resuelve:* la puerta de entrada para los pequeños, reutilizando motor.
- *Depende de:* T2.3, T2.6.
- *Terminado cuando:* cargando la carpeta `/data/puzzles/6-anios/`, el mismo motor ofrece retos visuales y guiados (subitización, comparar, completar 10) sin código nuevo de motor.

**T3.2 — Banco de contenidos matemáticos (8 y 9 años)**
- *Problema que resuelve:* variedad real de puzles por concepto y fase CPA.
- *Depende de:* T1.2, T2.2.
- *Terminado cuando:* existe un volumen de puzles JSON suficiente para varias jornadas, organizados por concepto y fase.

**T3.3 — Evaluación invisible (assessment.js)**
- *Problema que resuelve:* registrar progreso real sin exámenes (tiempo, errores por tipo, estrategias, pistas, persistencia).
- *Depende de:* T2.3, T2.5.
- *Terminado cuando:* el juego acumula en el perfil un registro de cómo juega cada niño, sin mostrarle nada parecido a un test.

**T3.4 — Convertir en PWA instalable**
- *Problema que resuelve:* poder "añadir a pantalla de inicio" en el iPad y funcionar sin conexión.
- *Depende de:* T1.1 (y conviene hacerlo cuando la estructura esté estable).
- *Terminado cuando:* desde Safari en el iPad se puede instalar y abrir como app, y funciona sin red.

**T3.5 — Panel para familias/docente**
- *Problema que resuelve:* traducir la evaluación invisible a lenguaje claro (qué domina, qué le cuesta).
- *Depende de:* T3.3.
- *Terminado cuando:* existe una pantalla sencilla, separada del juego del niño, que resume su progreso sin tono de examen.

**T3.6 — Accesibilidad y pulido táctil**
- *Problema que resuelve:* botones grandes, zonas de toque amplias, evitar zoom accidental, contraste.
- *Depende de:* T2.6.
- *Terminado cuando:* un niño puede jugar en iPad sin toques fallidos ni gestos que estorben.

---

### FASE G — Gamificación, Engagement y Aprendizaje adaptativo

**Meta de la fase:** que el niño sienta que *juega un partido* (no que hace ejercicios) y que quiera volver cada día, sin sacrificar la pedagogía. Nace de una consultoría de gamificación educativa (2026-06-23); detalle completo y razonamiento en el historial de conversación, no repetido aquí.

**TG.1 — Partido con marcador y reto decisivo** ✅ *(hecho)*
- *Problema que resuelve:* "3 retos = partido ganado" era plano; ahora hay marcador y tensión.
- *Depende de:* T2.4, rediseño V2 de la pantalla de reto.
- *Terminado cuando:* el banner de estadio muestra un marcador "tu equipo - rival" que sube con cada acierto y fallo del reto actual; el último reto de la serie se presenta como "jugada decisiva" (⚡ ¡Penalti!, marco dorado pulsante); la pantalla de victoria muestra el resultado final ("Victoria perfecta" si el rival no marcó).

**TG.2 — Dificultad adaptativa afinada al "canal de flujo"** ✅ *(hecho)*
- *Problema que resuelve:* mantener al niño en ~80% de aciertos, bajando de fase CPA en cuanto se atasca, no tras dos tropiezos.
- *Depende de:* T2.3, T3.3.
- *Terminado cuando:* `Progression.leCuesta` baja de fase con **un** fallo o **una** pista (antes hacían falta dos); `esDominio` sigue exigiendo acierto a la primera sin pistas para subir.

**TG.3 — Racha de entrenamiento + gancho diario** ✅ *(hecho)*
- *Problema que resuelve:* crear el hábito de práctica breve y frecuente.
- *Depende de:* T1.5, portada.
- *Terminado cuando:* `Storage.actualizarRacha` cuenta días seguidos jugados; Capi saluda con la racha la primera vez que se entra cada día al calendario; la barra de perfil muestra "🔥 N"; la pantalla de victoria anima a volver mañana.

**TG.4 — Insignias de proceso y elogio al esfuerzo** ✅ *(hecho)*
- *Problema que resuelve:* premiar el *buen camino* y la persistencia (mentalidad de crecimiento), no solo el acierto.
- *Depende de:* T2.5, T3.3.
- *Terminado cuando:* se otorgan insignias de proceso —"Disparo Directo" (sin pistas ni fallos), "Remontada" (acierto tras fallar), "Rayo del Relámpago" (rápido en Relámpago)— y Capi elogia la estrategia/esfuerzo con una frase distinta según el camino seguido.

**TG.5 — Repaso espaciado por error** ✅ *(hecho)*
- *Problema que resuelve:* convertir los fallos en repaso programado en vez de tropiezos sueltos.
- *Depende de:* T2.3, T3.3.
- *Terminado cuando:* `progreso.colaRepaso` encola un concepto que "le cuesta" (`Progression.actualizar`) con una cuenta atrás de 3 retos; `Progression.siguiente` lo sirve como repaso (`esRepaso: true`) en cuanto llega su turno, saltándose la rotación normal; Capi avisa ("Te traigo un repaso de algo que se nos resistió") y la cápsula de misión muestra "🔁 Repaso". Si vuelve a costar, se reencola; si se domina, sale solo.

**TG.6 — Rival "Fueras de Juego"** ✅ *(hecho)*
- *Problema que resuelve:* dar al fallo sentido narrativo (drama deportivo) y un adversario real al partido.
- *Depende de:* TG.1, ilustraciones de las criaturas del error (3 ya integradas: energía/asustado/malvado).
- *Terminado cuando:* `iniciarEstadio` elige un rival al azar (`RIVALES`) que se muestra en el banner de estadio; al fallar, el rival se anima ("¡X te ha robado el balón!") en vez del genérico "casi"; la victoria cierra con "Has dejado fuera de juego a X".

**TG.7 — Power-ups que andamian** ✅ *(hecho)*
- *Problema que resuelve:* dar destino a la energía ⚡ con ayudas que no saltan el aprendizaje.
- *Depende de:* T2.1, T2.5.
- *Terminado cuando:* se puede gastar energía en "Ojo del Águila" (-15⚡, tacha una opción incorrecta, solo opción múltiple, solo tras el primer fallo), "Consejo del Capitán" (-10⚡, adelanta la pista de procedimiento, cualquier tipo) y "Tiempo Extra" (-10⚡, +5s, solo Relámpago — que de paso ganó un cronómetro visible de 8s, ausente hasta ahora a pesar del nombre). Ninguno revela la respuesta directa; cada uno solo cobra energía si tuvo efecto real.

**TG.8 — Clasificación y temporada** *(pendiente, apuesta grande)*
**TG.9 — Álbum de cromos** *(pendiente, apuesta grande)*
**TG.10 — Tienda cosmética** *(pendiente, apuesta grande, necesita arte)*
**TG.11 — Metacognición ligera ("¿cómo lo hiciste?")** *(pendiente, opcional)*

---

### FASE 4 — Pruebas con niños

**T4.1 — Sesión de observación con tus hijos** — jugar y anotar dónde se atascan, qué no entienden, qué ritmo cansa.
**T4.2 — Ajuste de dificultad y ritmo** — afinar la progresión y los tiempos de misión según lo observado.
**T4.3 — Ajuste de legibilidad y tiempos** — tamaños, claridad de enunciados, duración real de cada jugada.

### FASE 5 — Lanzamiento 1.0

**T5.1 — Balance final y corrección de errores.**
**T5.2 — Empaquetado y publicación en GitHub Pages** (el enlace definitivo).
**T5.3 — Breve guía para familias/docentes.**

---

## 3. Puntos de riesgo técnico

Estas son las partes donde es más probable que la arquitectura necesite repensarse sobre la marcha. **Cuando te atasques en una de estas, es señal de que conviene una sesión con un modelo más potente (Opus) en lugar de insistir con Sonnet.**

1. **El formato JSON del puzle (T1.2).** Es la viga maestra. Si al crear el segundo o tercer tipo de puzle (T2.2) descubres que el formato no da para describirlos sin forzarlo, hay que rediseñarlo cuanto antes, no parchearlo. Riesgo alto porque todo lo demás se apoya aquí.

2. **La progresión adaptativa (T2.3).** Decidir "qué viene después" según el dominio es lógica delicada: es fácil que quede demasiado rígida (aburre) o demasiado floja (frustra). Probablemente requiera varias pasadas de ajuste y es candidata natural a consulta de arquitectura.

3. **La evaluación invisible (T3.3).** Recoger señales útiles (estrategia usada, transferencia, persistencia) sin que el sistema se vuelva enrevesado es sutil. El riesgo no es que falle, sino que registre datos que luego no sirven para nada. Conviene diseñar bien *qué* se mide antes de programar *cómo*.

---

## 4. Consideraciones para iPad y GitHub Pages

Cosas a prever desde el diseño (no hace falta detalle técnico ahora, solo no olvidarlas):

- **PWA instalable:** planear desde el principio que el juego pueda "añadirse a la pantalla de inicio" del iPad y abrirse a pantalla completa. Se resuelve con dos archivos de configuración; mejor preverlo que añadirlo a la fuerza al final.
- **Guardado en el propio dispositivo:** todo el progreso vive en el iPad, sin servidor ni login. Implica avisar de que borrar los datos del navegador borraría el progreso (conviene una opción de copia de seguridad sencilla).
- **Audio que necesita un primer toque:** el iPad no deja sonar audio hasta que el usuario toca algo; prever un botón inicial de "¡A jugar!" que active el sonido.
- **Gestos táctiles:** evitar que el doble toque haga zoom y que un arrastre largo seleccione texto sin querer. Diseñar zonas de toque grandes.
- **Orientación y escalado:** decidir pronto si se juega en horizontal y cómo se adapta la interfaz entre la pantalla del iPad y la del PC, para que no se corten elementos.
- **Rutas relativas:** en GitHub Pages el juego no vive en la raíz del dominio; conviene que todos los enlaces a archivos sean relativos desde el principio para que no se rompan al publicar.

---

## 5. Checklist de la Fase 1 (para empezar ya)

- [ ] **T1.1** — Esqueleto del proyecto y arranque (carpetas + `index.html` que carga sin errores).
- [ ] **T1.2** ⭐ — Definir el formato JSON de un puzle (documento + 2-3 ejemplos por fase CPA).
- [ ] **T1.3** — Motor mínimo que lee un JSON y muestra el puzle.
- [ ] **T1.4** — Comprobación de respuesta con feedback de acierto/error.
- [ ] **T1.5** — Guardado local del progreso en el dispositivo.
- [ ] **T1.6** — Pantalla de perfil con varios jugadores independientes.

> Empieza por T1.1 y T1.2 en ese orden. T1.2 es la decisión más importante de todo el proyecto: dedícale tiempo y, si dudas de si el formato aguantará, esa es una buena pregunta para una sesión de Opus antes de seguir.

---

*Documento de referencia del proyecto. Mantener actualizado a medida que se cierren tareas.*
