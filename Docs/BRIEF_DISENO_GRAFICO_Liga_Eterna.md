# Brief de Diseño Gráfico — Liga Eterna: Los Guardianes del Juego

## 1. Resumen del proyecto

"Liga Eterna: Los Guardianes del Juego" es una app web educativa de matemáticas con temática de
fútbol, pensada para que niños practiquen cálculo mental jugando, no haciendo fichas. El jugador
es un "Guardián del Juego" que recorre un calendario de partidos (estadios), resuelve retos
matemáticos para "repararlos" y gana energía e insignias por el camino. Un mentor, "Capi"
(el capitán veterano del equipo), acompaña y anima en cada reto.

Es una aplicación real en producción (no un concepto): funciona en navegador, se instalará como
app en iPad, y ya tiene toda la lógica de juego construida. Lo que necesitamos ahora es la
ilustración: el código ya tiene "huecos" preparados para recibir las imágenes en cuanto existan.

## 2. Público objetivo

- Niños de **6 a 9 años**, jugando solos o en familia.
- Hay dos "ligas" de contenido: una más sencilla y visual para 6 años, y otra para 8-9 años con
  retos más abstractos. El diseño debe funcionar bien para todo ese rango: nada infantilizado en
  exceso, pero tampoco intimidante para el más pequeño.
- Se juega sobre todo en **tablet (iPad)**, en sesiones cortas. Iconos y botones deben leerse bien
  a tamaño táctil, no a tamaño de icono de escritorio.
- Importante: estos niños van a fallar muchas veces mientras aprenden. El diseño debe ayudar a que
  fallar se sienta parte del juego, no un castigo (ver "tono" más abajo).

## 3. Tono y estilo visual

- **Temática de fútbol**, vivida y reconocible, pero con nombres e identidades 100% ficticias
  (sin marcas, escudos o jugadores reales).
- **Ilustración 2D plana/semi-plana**, tipo videojuego casual o app educativa infantil — no
  fotorrealista, no 3D. Pensado para integrarse en una interfaz limpia de botones grandes.
- **"Camuflaje didáctico"**: la matemática debe sentirse como parte del fútbol, no como un examen
  encima de un fondo de fútbol. Por ejemplo, una recta numérica puede leerse como una franja de
  césped táctico; un marcador roto, como el "problema" que el reto va a arreglar.
- **Baja ansiedad**: colores cálidos y amables, expresiones de personajes siempre cercanas y
  alentadoras (incluso al fallar), nada de iconografía de "examen", cuenta atrás agresiva o cara de
  enfado severa.
- **Lectura instantánea**: formas simples y siluetas claras, para que un niño de 6 años reconozca
  cada elemento de un vistazo, sin detalle innecesario que se pierda en pantalla pequeña.

## 4. Pantallas clave de la interfaz (dónde vive cada asset)

Para que el diseñador entienda el contexto de uso de cada imagen, así es el recorrido del jugador:

1. **"¿Quién juega?"** — selector de perfil. Tarjetas con avatar + nombre de cada jugador
   (hermanos/familia). Ya existen 3 avatares ilustrados; puede haber más en el futuro.
2. **"¿En qué equipo juegas hoy?"** — selector de modo/dificultad. Tres tarjetas con nombre e icono:
   **Promesas** (iniciación), **Estrellas** (intermedio), **Leyendas** (avanzado, se desbloquea
   jugando bien). Necesitan una identidad visual propia y progresivamente "más grande" (de cantera
   a estrella a leyenda).
3. **Calendario de la Liga** — lista de "estadios" (partidos/niveles) con su escudo y nombre.
   Pantalla de "elige tu próximo partido".
4. **Pantalla de reto** — aquí se juega el puzle matemático. Aparece "Capi" como mentor con un
   botón de "escuchar al entrenador" (lee el enunciado en voz alta). El resto de la pantalla la
   ocupa el propio reto matemático (no necesita ilustración, pero los iconos de acierto/pista/error
   conviven con Capi).
5. **"¡Partido ganado!"** — pantalla de celebración tras completar un partido. Aquí encajan
   confeti/celebración y, si procede, el aviso de haber desbloqueado un equipo superior.

## 5. Elementos gráficos necesarios (assets)

### Ya producidos (de referencia para mantener coherencia de estilo)
- 3 avatares de "Guardián" (niño/a futbolista), de cuerpo entero, estilo ilustrado.
- 1 escudo de estadio.
- 1 insignia/badge circular.
- 1 retrato de "Capi" (el mentor), busto.

### Pendientes, por prioridad

**Prioridad alta (se usan ahora mismo en la app):**
- **Insignias/medallas** (faltan 8 de 9): círculos tipo "medalla de logro", cada una representando
  una estrategia matemática de forma visual y amigable, no un símbolo abstracto. Lista de nombres
  ya definidos: Maestro de la Decena, Ojo de Águila, Juez de la Cantidad, Rey de los Dobles, As del
  Casi-Doble, Capitán de los Grupos, Repartidor Justo, Maestro del Redondeo (más una ya hecha:
  Navegante de la Recta). Mismo formato circular que la insignia existente, para que toda la fila de
  insignias se vea como un set coherente.
- **Identidad de los 3 equipos/modos** (Promesas / Estrellas / Leyendas): un icono o emblema simple
  por modo (más allá del emoji actual 🌱⭐🏆), pensado para tarjeta grande y legible, con sensación
  de progresión entre los tres (de "primeros pasos" a "leyenda del equipo").
- **Escudos de estadio adicionales**: de momento solo existe el del "Estadio de la Cantera"; el
  calendario crecerá con más estadios y cada uno necesitará su propio escudo (mismo estilo y
  tamaño que el ya producido, para que el calendario se vea uniforme).

**Prioridad media (aparecerán pronto en el plan del juego):**
- **Más avatares de Guardián**, mismo estilo que los 3 existentes, para nuevos perfiles de jugador.
- **Pose/expresión adicional de Capi** (por ejemplo, animado o "pensativo" al dar una pista), además
  del retrato base ya hecho.

**Prioridad baja (fases futuras, no urgente):**
- Los "Fueras de Juego" (criaturas del error/caos numérico) y las "Leyendas del Orden" (cracks
  coleccionables, cada uno asociado a un concepto matemático) son parte de la narrativa del juego
  pero todavía no tienen una pantalla construida. Si el diseñador tiene tiempo/presupuesto de sobra,
  son buenos candidatos para una segunda tanda, pero no son necesarios para el lanzamiento.

## 6. Paleta de colores

El proyecto ya usa una paleta funcional por zonas (definida en CSS, no negociable en su lógica de
uso, pero abierta a ajuste fino de tono):

| Zona / uso | Color orientativo |
| --- | --- |
| Mundo principal (calendario, navegación) | Verde césped `#1a7a3c`, azul deportivo `#1565c0` |
| Modo "jugar reto" (zona matemática) | Turquesa/azul eléctrico `#2979ff` |
| Celebración / recompensa | Dorado `#ffc107`, naranja `#ff9100` |
| Acierto | Verde `#2e7d32` |
| Fallo / reintenta | **Naranja**, no rojo (`#ff9100`) — decisión deliberada para que fallar no
  se sienta como una alarma, sino como "vuelve a intentarlo" |
| Fondo neutro | Gris muy claro `#f7f9fb` |

El diseñador no tiene que ceñirse a estos hex exactos para la ilustración (son tokens de interfaz,
no de arte), pero sí debe mantener la **lógica de color**: verde/azul para lo cotidiano, dorado/
naranja para la celebración, y evitar el rojo como color de error.

## 7. Especificaciones técnicas de entrega

- Formato de entrega: **PNG con fondo transparente** (la integración final se hace en WebP, pero
  eso lo gestionamos nosotros a partir del PNG).
- Resolución: ilustraciones a tamaño suficiente para reescalar sin pixelarse (mínimo ~1000px en su
  lado mayor); nosotros las redimensionamos a los tamaños finales de cada pantalla.
- Cada asset es una pieza independiente (sin fondo de escena detrás), para poder colocarla sobre
  los fondos de color de la interfaz.
- No se necesita animación, spritesheets ni rigging: todo el movimiento (celebraciones, transiciones)
  ya está hecho con CSS por nuestro lado.

## 8. Qué NO se necesita (para evitar malentendidos de alcance)

- No hace falta diseño 3D, modelado ni cel-shading de motor de videojuego.
- No hace falta diseñar pantallas completas de UI (botones, tipografía, layout) — eso ya existe en
  código; lo que se necesita son las **ilustraciones que se insertan dentro** de esa interfaz.
- No hace falta una guía de marca completa ni un "visual bible" extenso; basta con coherencia de
  estilo entre los assets que ya existen y los nuevos.

## 9. Referencias de estilo ya validadas

Se pueden compartir con el diseñador, si resulta útil, los 4 assets ya producidos (3 avatares de
Guardián, escudo de estadio, insignia, retrato de Capi) como muestra del nivel de detalle y estilo
que se busca para todo lo nuevo.
