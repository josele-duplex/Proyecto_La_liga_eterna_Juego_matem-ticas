# Juegos y contenido — Liga Eterna (modos Promesas y Estrellas)

> Respuesta al encargo "hacen falta muchísimos más puzles y varios juegos más para los dos primeros
> modos", apoyado en `Docs/Principios de la enseñanza de las matemáticas...md` y en didáctica actual
> (CPA, flexibilidad estratégica tipo ABN, sentido numérico, subitización, fluidez por práctica breve).

## 1. Lo ya hecho en esta tanda

### Volumen (se acababan muy pronto)
El banco pasó de ~9 y ~14 puzles a **62 (Promesas)** y **67 (Estrellas)**. Ahora hay varios puzles por
cada concepto y fase CPA, así que la selección aleatoria (con no-repetición) da variedad real y los niños
no ven siempre el mismo reto.

### Conceptos por modo (cada uno en sus 3 fases CPA: concreta → pictórica → abstracta)
- **Promesas (6):** subitización, comparar, completar 10, **sumar hasta 10** (nuevo), **series de
  números** (nuevo), **relámpago V/F** (nuevo), **alineación/ordenar** (nuevo).
- **Estrellas (8):** descomposición (cruzar la decena), recta numérica, dobles, casi-dobles,
  **restar con estrategia** (nuevo), **decenas y unidades / valor posicional** (nuevo), **relámpago
  V/F** (nuevo), **alineación/ordenar** (nuevo).

### Dos mecánicas de juego nuevas en el motor
- **Relámpago (`verdadero_falso`):** se afirma algo ("¿es verdad que 6+6=12?") y el niño decide
  Verdadero/Falso. Entrena **fluidez y cálculo mental rápido** (los "relámpagos mentales" del artículo).
- **Alineación (`ordenar`):** se tocan los números **de menor a mayor**; un toque fuera de orden cuenta
  como fallo. Entrena **sentido numérico y orden**. Es la primera mecánica táctil de varios pasos.

Cada estrategia nueva tiene su insignia (Goleador ⚽, Cuentapasos 👣, Reflejos de Portero 🧤, Estratega de
Alineación 📋, Muro Defensivo 🛡️, Arquitecto de Decenas 🏛️) — de momento con emoji, sustituibles por arte.

> El banco se generó con `scripts/gen_puzzles.py`, que escribe las fichas y reconstruye los `indice.json`
> escaneando la carpeta. Para añadir aún más, se amplían las tablas de ese script y se vuelve a ejecutar
> (no pisa las fichas hechas a mano; el índice se reconstruye con todas).

## 2. Más juegos propuestos (roadmap, por orden de valor/coste)

Mecánicas que encajan en la arquitectura (datos en JSON + un `renderXxx` en el motor), pendientes de
implementar cuando se quieran:

1. **Emparejar (`parejas`)** — unir cada operación con su resultado (7+5 ↔ 12), o una cantidad con su
   número. *Pedagogía:* equivalencia y memoria de hechos. *Coste motor:* medio.
2. **Completa arrastrando (`arrastrar_completar`)** — arrastrar el número que falta al marco de diez
   ("Completa 10/20/100" del artículo). *Pedagogía:* sentido numérico, valor posicional. *Coste:* medio
   (arrastrar en táctil).
3. **Bloques base 10 (`construir_numero`)** — formar un número con decenas y unidades tocando bloques.
   *Pedagogía:* valor posicional manipulativo (Montessori/base 10). *Coste:* medio-alto.
4. **Reto de los 4 números (`combina`)** — estilo "24 Game" adaptado: combina números para llegar a una
   meta. *Pedagogía:* flexibilidad estratégica, automatización. *Coste:* alto.
5. **Bingo matemático (`bingo`)** — marcar en un cartón el resultado que se canta. *Pedagogía:* fluidez
   en grupo/individual. *Coste:* medio.
6. **Estimación (`estimar`)** — "¿más o menos de 20?" sin calcular exacto. *Pedagogía:* sentido numérico,
   razonabilidad. *Coste:* bajo (cabe casi en opción múltiple).
7. **Number Talk / Explica tu estrategia** — el niño elige *cómo* lo resolvería (qué estrategia), no solo
   el resultado. *Pedagogía:* el corazón del artículo (flexibilidad ABN, validar varios caminos).
   *Coste:* bajo en versión "elige la estrategia", alto en versión "explícalo con voz/IA".

## 3. Más contenido fácil de añadir (sin motor nuevo)
- Subir el techo numérico de Estrellas poco a poco (sumas/restas hasta 100, recta hasta 100).
- Más contextos de fútbol por concepto (goles, minutos, dorsales, puntos de la liga) para que cada puzle
  se sienta distinto aunque la operación se repita.
- Series más ricas (de 5 en 5, de 10 en 10, hacia atrás) en "series de números".

## 4. Principios que seguimos (del artículo + didáctica actual)
- **CPA**: cada concepto vive en concreta → pictórica → abstracta.
- **Flexibilidad estratégica (ABN)**: se premia el *cómo* (estrategia → insignia), no solo el acierto.
- **Sentido numérico y subitización** antes que el cálculo mecánico.
- **Fluidez por práctica breve y repetición espaciada**: muchos puzles cortos y variados (relámpagos).
- **Feedback inmediato y amable**: acierto/fallo al instante, error en naranja (no rojo), 3 pistas que
  acompañan sin dar la respuesta.
- **Evaluación invisible** (ya existe, T3.3): mide exactitud, fluidez (tiempo) y estrategia sin examen.
