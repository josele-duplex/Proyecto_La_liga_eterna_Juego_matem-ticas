# Anexo — Dirección visual (adaptación realista al plan técnico)

> Este documento **no modifica ni renumera** `PLAN_TECNICO_Liga_Eterna.md`. Es un anexo que
> traduce la propuesta visual de `Ideas_Disenio_grafico/` a decisiones concretas que encajan
> con la arquitectura ya elegida (web estática HTML/CSS/JS, sin motor ni dependencias, PWA en iPad),
> y que conviene fijar **ya** para no tener que rehacer trabajo más adelante.

## 1. Qué he estudiado

- `Documento de Diseño Visual La Liga Eterna (1).md`: dirección de arte (estilo 3D estilizado cel-shading,
  psicología del color, benchmarking, camuflaje didáctico) y un roadmap de producción artística por subfases.
- `Boceto_graficos_ liga_eterna.png`: concept art board (avatar, Capi, enemigos "Fueras de Juego",
  "Leyendas del Orden", 5 estadios, elementos pieza clave, equipaciones, iluminación).
- `Boceto_graficos_ liga_eterna_2.png`: art direction document (visión, paleta, lenguaje de formas,
  herramientas matemáticas visuales, wireframes de UI).

Valoración: material **muy bueno como guía de arte**. El zonificado de color y, sobre todo, la fila de
"elementos pieza clave" (barra matemática, fichas, recta numérica, marcador) encajan directamente con
lo que ya tenemos hecho en datos (tipos de puzle, insignias, energía, calendario).

## 2. Honestidad de alcance: qué es realizable y qué no

| Propuesta del documento | ¿Realizable en nuestro proyecto? |
| --- | --- |
| Estética viva, futbolera, legible, táctil, baja ansiedad | **Sí**, con CSS/SVG. Es el objetivo. |
| Paleta, lenguaje de formas, zonificado de color, camuflaje didáctico | **Sí**, como reglas de diseño. |
| Feedback inmediato, celebraciones, marcador, animaciones suaves | **Sí**, CSS + algo de JS. |
| Ilustraciones 2D (avatar, Capi, enemigos, estadios, cromos) | **Sí, pero las imágenes las aportas tú** (IA de imagen o ilustrador); yo las integro. |
| Modelado 3D, rigging, cel-shading, VFX de motor, Unity/Unreal | **No.** Incompatible con una web estática sin motor. Fuera de alcance. |
| Pipeline AAA (80 thumbnails, Visual Bible 40-60 págs, 18-20 días de arte) | **No es necesario.** Es proceso de estudio; adoptamos sus *decisiones*, no su *volumen*. |

**Qué puedo producir yo directamente (sin ilustrador):** todo el CSS, animaciones, layout, sonido, y
SVG hechos a mano de complejidad media (escudos, recta numérica táctica, barras "holográficas", iconos,
mascotas geométricas simples). **Qué no:** ilustraciones pintadas tipo el boceto; esas se aportan como archivos.

## 3. El espíritu que SÍ conservamos

- **Lectura instantánea**: iconos grandes, texto legible, pantallas limpias, botones táctiles amplios.
- **Color con función**: el color guía la atención hacia lo educativo (acierto, pista), no decora sin más.
- **Camuflaje didáctico**: la matemática se ve como acción de fútbol (la recta numérica como césped táctico,
  la descomposición como jugada), nunca como ficha de examen.
- **Baja ansiedad**: sin cuentas atrás agresivas, animaciones suaves, celebración sí pero contenida.

## 4. Decisiones técnicas a fijar YA (para no rehacer luego)

### 4.1 Tokens de diseño en CSS (variables `:root`)
Toda la apariencia se controla con variables CSS centralizadas (color, tipografía, radios, sombras,
espaciado). Cambiar la identidad visual = cambiar variables, **nunca** tocar cada componente.

### 4.2 Temas por zona como conjuntos de variables
Las 4 familias cromáticas (mundo / matemáticas / caos / recompensa) se implementan como **clases de tema**
que redefinen las variables (p. ej. `<body class="tema-mate">`). Reskinear una zona no toca el CSS de los
componentes. Esto evita el problema clásico de colores "a pelo" repartidos por todo el código.

### 4.3 Separación piel / lógica (ya la tenemos, la reforzamos)
`styles.css` + `ui.js` pintan; `engine.js` y `progression.js` **nunca** fijan color ni estética. El motor
ya es ciego al aspecto: lo mantenemos así.

### 4.4 Ranuras de imagen opcionales en los datos
Para poder añadir arte más tarde **sin tocar código**, reservamos campos de imagen opcionales en los JSON:
- `estadios.json`: cada estadio podrá tener `"imagen"` (fondo/escudo).
- `recompensas.json`: cada insignia podrá tener `"imagen"` además del emoji actual.
- (futuro) fichas de personaje/avatar con su `"imagen"`.
Mientras no exista el archivo, se usa el placeholder actual (emoji / color). Así el arte se "enchufa" después.

### 4.5 Estrategia de assets
- Carpetas: `/assets/img/` (raster: **WebP** preferido, PNG de respaldo), `/assets/svg/` (vector),
  `/assets/fonts/`, `/assets/audio/`.
- Nombres en kebab-case: `estadio-cantera.webp`, `insignia-completar-diez.svg`.
- Iconos: emoji ahora (`⚡ 🔟 🧭`), migrables a SVG sin cambiar la lógica.

### 4.6 Tipografía autoalojada (no CDN)
Una fuente redondeada y legible (estilo Nunito / Baloo 2) **alojada en `/assets/fonts/`**, no enlazada a
un CDN. Motivo: la PWA debe funcionar sin conexión; una fuente de CDN rompería el modo offline.
Alternativa cero-peso: `system-ui`. Decisión a fijar: autoalojar o usar la del sistema, nunca CDN.

### 4.7 Accesibilidad y rendimiento en iPad
- Respetar `prefers-reduced-motion` (apagar animaciones para quien lo pida).
- Celebraciones cortas (< 1,5 s) y desactivables.
- Imágenes ligeras y dimensionadas; cuidar el peso total para que cargue rápido en tablet.

## 5. Paleta propuesta traducida a tokens (provisional, ajustable)

Tomando la guía cromática del documento:

| Zona | Uso | Colores orientativos |
| --- | --- | --- |
| Mundo principal | campo, UI base | césped `#1a7a3c`, deportivo `#1565c0`, cielo `#4fc3f7`, neutro `#f7f9fb` |
| Matemáticas | zonas de aprendizaje, "holográfico" | turquesa `#1de9b6`, azul eléctrico `#2979ff`, violeta `#7c4dff` |
| Caos | enemigos, error | morado `#6a1b9a`, magenta `#d500f9`, negro azulado `#1a1430` |
| Recompensa | éxito, cromos, trofeo | dorado `#ffc107`, amarillo solar `#ffd54f`, naranja `#ff9100` |

**Matiz pedagógico (propuesta mía):** para el fallo, en vez de un rojo de alarma, usar **naranja de
"reintenta"** (`#ff9100`). Reduce la ansiedad y encaja con "fallar es parte de aprender". El verde se reserva
para el acierto. (Hoy usamos verde/rojo; lo revisaríamos en T2.6.)

## 6. Cómo encaja con el plan (sin cambiarlo)

- **T2.6 (capa visual y sonora)** es el sitio natural para aplicar por primera vez: tokens de diseño,
  clases de tema, feedback amable, celebración contenida, y las ranuras de imagen opcionales. Implemento el
  tema CSS + placeholders SVG ahora; el arte ilustrado se sustituye cuando exista.
- **T3.1 (modo 6 años)** se beneficia directamente de las reglas de legibilidad y botones grandes.
- **Sugerencia (no renumera el plan):** cuando haya ilustraciones, una tarea futura opcional de
  "integración de assets ilustrados" que solo rellena las ranuras ya preparadas.

## 7. Rutas posibles y recomendación

- **Ruta A — base siempre entregable:** tema CSS + SVG/emoji hechos por mí, sin ilustraciones externas.
  Funciona hoy, cero dependencias, cero coste. Es el mínimo que garantizo.
- **Ruta B — recomendada:** Ruta A + ilustraciones 2D (avatar, Capi, enemigos, estadios, cromos) que tú
  generas (IA de imagen) o encarga un ilustrador, y yo integro en las ranuras del punto 4.4. Se acerca mucho
  al boceto, en 2D, sin 3D ni motor.
- **Ruta C — fuera de alcance:** producción 3D AAA en Unity/Unreal. Abandonaría toda la arquitectura actual
  y excede mis capacidades. No la recomiendo.

Recomendación: apuntar a **Ruta B**, con **Ruta A** como base que siempre funciona aunque el arte tarde.
