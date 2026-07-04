# Plan V2 — Banco de 7 años, rediseño visual/móvil, jugabilidad, narrativa y reflexión
### Fase de arquitectura (Fable) — para revisión del usuario antes de que Sonnet 5 ejecute

> **Qué es este documento.** Respuesta a un encargo de ampliación del plan de mejoras: diseñar (1) el banco de contenido que falta entre Promesas y Estrellas, (2) un rediseño visual centrado en móvil usando solo capacidades de Claude Code (CSS/SVG/HTML, sin arte nuevo), (3) mejoras de jugabilidad de bajo coste, (4) mejoras de narrativa, y (5) una vía de reflexión metamatemática ligera. Es papel, no código: cada sección termina en decisiones concretas que Sonnet 5 podrá ejecutar sin ambigüedad, fase a fase, igual que `PLAN_MEJORAS_ENGAGEMENT.md`.
>
> **Cómo se relaciona con lo que ya existe.** No sustituye a `PLAN_MEJORAS_ENGAGEMENT.md` (fases M0-M9, de las cuales M0-M2 ya están hechas). Este documento añade fases nuevas con sus propios prefijos (**C** contenido, **V** visual, **G** jugabilidad, **N** narrativa, **R** reflexión) y, al final, las **reconcilia todas en un único orden de ejecución**.

---

## 1. Banco de contenido "puente" (7 años)

### 1.1 El problema, con datos reales (no solo intuición)

Comparé el puzle **más difícil** de Promesas (fase 3, el techo del banco de 6 años) contra el **más fácil** de Estrellas (fase 1, el suelo del banco de 8 años):

| | Ejemplo real | Rango numérico |
|---|---|---|
| Promesas, techo | `7 + ? = 10` | dentro de 10 |
| Estrellas, suelo | `2 cajas de 10 y 3 sueltos, ¿cuántos hay?` → 23 | decenas + unidades, pasa de 20 |
| Estrellas, suelo | `6 + 6` cruzando la decena con apoyo de "completar 10" | pasa de 10 a 12 |

Es un salto curricular real: introducir la decena como unidad de conteo y sumar/restar cruzando el 10 es, en el currículo español, contenido de **1º de primaria (6-7 años)**, con pasos intermedios que el juego se salta hoy. Confirma lo que habías notado jugando con tus hijos.

### 1.2 El equipo nuevo

Se añade un **cuarto equipo**, libremente elegible como los demás (Promesas y Estrellas ya lo son hoy; solo Leyendas tiene desbloqueo — eso no cambia). Se posiciona en el array `MODOS` entre Promesas y Estrellas, sin tocar el desbloqueo de Leyendas (sigue dependiendo de Estrellas).

**Nombre propuesto: "Aspirantes" 🎯** — evita cualquier etiqueta de edad (coherente con el precedente ya fijado: "los modos se nombran con temática de fútbol, nunca '6 años'/'8 años'"). Alternativas si no convence: "Canteranos" 🎽, "Talentos" ⚡. **Decisión pendiente del usuario**, el resto del plan no depende de cuál se elija.

Banco de puzles: `data/puzzles/7-anios/`, índice propio `indice.json`, mismo formato exacto que los otros tres (`FORMATO_PUZLE.md` no cambia).

### 1.3 Conceptos y reutilización de estrategias (cero insignias nuevas)

Comprobé el mapa real concepto→estrategia de los bancos existentes antes de diseñar esto, para maximizar continuidad (un cromo que ya tiene tu hijo sigue creciendo en el equipo nuevo, en vez de crear un cromo duplicado):

| Concepto (7 años) | Reutiliza concepto de | Estrategia (reutilizada, **0 nuevas**) | Qué aporta de nuevo |
|---|---|---|---|
| `sumar_veinte` **(nuevo)** | — | `sumar` (la misma "Goleador" de Promesas) | sumas sin llevar hasta 20, sin el límite de 10 |
| `restar_veinte` **(nuevo)** | — | `restar_estrategico` (la misma "Muro Defensivo" de Estrellas) | primeras restas sencillas hasta 20 |
| `dobles` | Estrellas | `usar_dobles` | dobles pequeños (hasta 5+5), antes de los de Estrellas (6+6, 7+7...) |
| `decenas` | Estrellas | `usar_valor_posicional` | "una decena son 10, dos decenas son 20" — SIN mezclar aún con sueltos (eso ya lo hace Estrellas) |
| `comparar` | Promesas | `comparar_cantidades` | mismo concepto, números hasta 20 |
| `secuencia` | Promesas | `contar_secuencia` | series más largas, hasta 20-30 |
| `completar_diez` | ambos | `completar_diez` | igual que ya comparten Promesas/Estrellas |
| `relampago` | ambos | `calcular_rapido` | mismo juego, números hasta 20 |
| `alineacion` | ambos | `ordenar_numeros` | ordenar hasta 20-30 |

Solo 2 conceptos son genuinamente nuevos (`sumar_veinte`, `restar_veinte`); el resto son extensiones numéricas de conceptos que ya existen en un banco vecino. **Cero entradas nuevas en `recompensas.json`**: las 9 estrategias ya tienen nombre, icono y vocabulario técnico (de la FASE M1).

### 1.4 Tipos de puzle (motor sin tocar)

Todo se cubre con los 4 tipos que **ya existen** en `engine.js` — cero riesgo, cero código nuevo en el motor:

| Concepto | Tipo | Apoyo visual fase 1 (concreta) |
|---|---|---|
| `sumar_veinte`, `restar_veinte`, `dobles`, `comparar` | `opcion_multiple` | `datos.visual: {tipo:'grupos', grupos:[10,7], icono:'⚽'}` — el motor YA dibuja grupos sin límite de 10 (a diferencia de `marco_diez`, que sí está limitado a 10 casillas); sirve tal cual para números hasta 20. |
| `decenas` | `opcion_multiple` | `grupos:[10,10]` (dos decenas completas, sin sueltos en fase 1) |
| `recta_numerica` (si se añade, ver 1.6) | `recta_numerica` | recta ya soporta cualquier rango vía `desde/hasta/paso` |
| `relampago` | `verdadero_falso` | — |
| `alineacion` | `ordenar` | — |
| `secuencia` | `opcion_multiple` | — |
| `completar_diez` | `opcion_multiple` | `marco_diez` (sirve igual, es fase concreta hasta 10) |

**Una única pieza que SÍ pediría código nuevo (opcional, no imprescindible):** un mini-juego "Emparejar" (tocar una ficha con la operación, p. ej. "8+7", y luego la ficha con el resultado, "15") encajaría muy bien en esta franja de edad — es más manipulativo/lúdico que "elige la opción correcta" y refuerza fluidez. Necesitaría un `renderEmparejar` nuevo en `engine.js` (~50-70 líneas, mismo patrón que los renderers existentes) y un tipo `emparejar` en el formato de puzle. **Lo dejo como opcional**: el banco de 7 años funciona igual de bien sin él. Decisión del usuario: ¿lo incluimos (más variedad, un pelín de código nuevo) o nos quedamos 100% JSON con los tipos que ya existen (cero riesgo)?

### 1.5 Ejemplos concretos (2 por concepto, para validar el diseño — el volumen real lo genera un script)

```json
// sumar_veinte, fase 1 (concreta)
{
  "concepto": "sumar_veinte", "fase_cpa": 1, "estrategia": "sumar",
  "enunciado": { "texto": "Tienes 10 balones y llegan 6 más. ¿Cuántos hay?", "voz": "Diez más seis." },
  "datos": { "visual": { "tipo": "grupos", "grupos": [10, 6], "icono": "⚽" } },
  "respuesta": { "opciones": [{"id":"a","texto":"14"},{"id":"b","texto":"15"},{"id":"c","texto":"16"},{"id":"d","texto":"17"}], "correcta": "c" }
}

// restar_veinte, fase 3 (abstracta)
{
  "concepto": "restar_veinte", "fase_cpa": 3, "estrategia": "restar_estrategico",
  "enunciado": { "texto": "18 - 5 = ?", "voz": "Dieciocho menos cinco." },
  "respuesta": { "opciones": [{"id":"a","texto":"12"},{"id":"b","texto":"13"},{"id":"c","texto":"14"}], "correcta": "b" }
}

// decenas, fase 1 (concreta, SIN sueltos mezclados — a diferencia de Estrellas)
{
  "concepto": "decenas", "fase_cpa": 1, "estrategia": "usar_valor_posicional",
  "enunciado": { "texto": "2 cajas llenas de 10 balones cada una. ¿Cuántos balones en total?", "voz": "Dos decenas completas." },
  "datos": { "visual": { "tipo": "grupos", "grupos": [10, 10], "icono": "⚽" } },
  "respuesta": { "opciones": [{"id":"a","texto":"12"},{"id":"b","texto":"20"},{"id":"c","texto":"22"}], "correcta": "b" }
}

// dobles, fase 2 (pictórica, dobles pequeños)
{
  "concepto": "dobles", "fase_cpa": 2, "estrategia": "usar_dobles",
  "enunciado": { "texto": "Dos grupos iguales de 4. ¿Cuál es el doble de 4?", "voz": "El doble de cuatro." },
  "datos": { "visual": { "tipo": "grupos", "grupos": [4, 4], "icono": "⚽" } },
  "respuesta": { "opciones": [{"id":"a","texto":"6"},{"id":"b","texto":"8"},{"id":"c","texto":"9"}], "correcta": "b" }
}
```

Las pistas (3 niveles, obligatorias) siguen el mismo patrón visual→procedimiento→guiada de todo el proyecto; no se listan aquí por espacio, pero el generador las incluirá igual que en los bancos existentes.

### 1.6 Generación y volumen objetivo

- Script nuevo `scripts/gen_7anios.py`, mismo patrón que `gen_puzzles.py`/`gen_leyendas.py` (funciones `mc()`, `recta()`, `vf()`, `ordenar()` por tipo; reconstruye `indice.json` escaneando la carpeta al final).
- Objetivo inicial: **~80-90 puzles** (9 conceptos × 3 fases × 2-4 variantes), escalable después con "tandas" extra igual que se hizo con Promesas (9→119) y Estrellas (14→141).
- Terminado cuando: el banco carga en el selector de equipo, un niño puede jugar una jornada completa, y la validación de integridad (script Python ya usado en fases anteriores: ids únicos, estrategia con vocabulario, tipo conocido) da 0 errores.

---

## 2. Rediseño visual — solo CSS/SVG (sin arte nuevo)

### 2.1 Restricción de partida

Todo lo que sigue se hace con lo que Claude Code puede escribir directamente: CSS, SVG a mano, HTML. **Cero imágenes nuevas** (esas las genera el usuario aparte, como hasta ahora). No se toca `engine.js` ni la lógica de juego — es una capa de presentación.

### 2.2 Por qué SVG y no solo emoji (razón técnica real, no estética)

El emoji "⚽" se renderiza de forma **distinta en cada plataforma** (Apple, Google, Samsung, Windows tienen su propio dibujo de cada emoji; algunos ni existen en versiones antiguas de Android). Esto ya nos mordió una vez (el balón decorativo confundido con el conteo — aunque ese bug era de posición, no de plataforma, el riesgo de inconsistencia visual entre dispositivos es real y crece con cada emoji que usamos como icono de marca). Propuesta: sustituir por **SVG propio** los 5-6 iconos de "interfaz" que aparecen en TODAS las pantallas (no los cientos de emoji decorativos sueltos, que no merece la pena tocar):

| Icono actual (emoji) | Dónde aparece | SVG propio a crear |
|---|---|---|
| 🚩 (distintivo de jugada) | esquina de cada pregunta | banderín de córner, trazo simple, 2 colores |
| ⚡ (energía) | barra de perfil, poderes, contrato | rayo, relleno sólido color marca |
| 🔥 (racha) | barra de perfil | llama simple, 2 tonos |
| 🥉🥈🥇 (niveles de dominio) | franja de calendario, brillo de cromos | medalla circular con cinta, 3 variantes de color |
| 🔒 (equipo bloqueado) | selector de equipo | candado simple |

Cada uno es un `<svg>` inline de 15-25 líneas (path simples, no arte complejo), reemplazando el `textContent`/`content:` actual por `innerHTML` con el SVG. Ventaja añadida: se puede animar con CSS igual que ahora (el brillo de "Crack" ya usa `filter:drop-shadow`, que funciona igual sobre SVG).

**Alcance deliberadamente pequeño**: 5-6 iconos, no un sistema de iconos completo. El resto de emoji (⚽🏆🎉 etc., puramente decorativos y variados) se quedan como están — tocarlos todos sería un coste alto por un beneficio marginal.

### 2.3 Sistema de breakpoints más completo

Hoy solo existe `@media (max-width: 480px)`. Se propone un sistema de 4 rangos, con nombres para que el código se entienda solo:

```css
/* Token de referencia (comentario, no CSS ejecutable):
   - móvil pequeño:  ≤ 380px  (iPhone SE y similares)
   - móvil:          381–599px
   - tablet:         600–1024px  (ya cubierto razonablemente hoy)
   - escritorio:     > 1024px
*/
```

Motivo: hoy "móvil" es un único cajón de 0 a 480px, pero un iPhone SE (375×667) y un Android grande (412×915) tienen necesidades distintas — el primero necesita la compactación agresiva ya aplicada, el segundo no tanto. Separarlos permite no sacrificar aire visual en los móviles que sí tienen espacio.

### 2.4 La tarea que quedó pendiente: fusionar banner + cápsula

Ya lo señalé la vez pasada como el paso que de verdad cerraría el hueco de scroll en el iPhone SE. Propuesta concreta: en `crearBannerEstadio` y `crearCapsulaMision` (ambas en `pantallas/reto.js`), en vez de dos `<div>` con su propia tarjeta blanca, fusionarlas en **una sola tarjeta** con dos filas internas (escudo+nombre+rival+marcador arriba, reto+concepto+fase+progreso abajo). Ahorra el padding y el `gap` duplicados de dos tarjetas independientes (~25-30px adicionales en móvil). Requiere tocar `reto.js` (estructura DOM) y CSS, no el motor.

### 2.5 Pulido visual general (toda la app, no solo móvil)

- **Jerarquía tipográfica**: revisar que los tamaños de fuente seleccionen bien qué es lo más importante en cada pantalla (hoy el enunciado y las opciones a veces compiten en peso visual).
- **Contraste y sombras**: pasada de coherencia (todas las tarjetas ya usan `--sombra-suave`/`--sombra-media`, pero alguna tarjeta nueva reciente — contrato del día, franja de niveles — podría alinear mejor sus radios/sombras con el resto).
- **Landscape en móvil**: hoy es casi injugable sin scroll (lo medí: 2.5 pantallas de scroll). Propuesta ligera: una regla `@media (max-height: 420px) and (orientation: landscape)` que reduzca drásticamente el padding vertical de paneles (sin rediseñar el layout a dos columnas, que sería mucho más caro) — un parche razonable, no una solución perfecta.
- **Altura de viewport dinámica**: cambiar `min-height: 100vh` por `min-height: 100dvh` (con `100vh` como *fallback* para navegadores viejos) para evitar el salto de contenido cuando la barra de Safari aparece/desaparece.
- **Safe-area en iPhones con notch**: añadir `padding: env(safe-area-inset-top) env(safe-area-inset-right) ...` al `.marco` y a la portada.

### 2.6 Terminado cuando

Un iPhone SE (375×667) muestra pregunta+respuestas sin scroll (hoy falta ~94px, la fusión de 2.4 más los ajustes de 2.5 deberían cerrarlo); los 5-6 iconos SVG sustituyen a su emoji equivalente sin cambiar tamaño/posición visual; landscape deja de necesitar scroll de página completa; verificado en iPad que nada cambia (ya es la plataforma prioritaria y funciona bien).

---

## 3. Jugabilidad — mejoras fáciles (coste bajo, sin tocar restricciones)

| Mejora | Coste | Qué aporta |
|---|---|---|
| **Banco de frases variadas de Capi** (`data/frases-capi.json`: arrays de 4-6 variantes por situación — acierto limpio, remontada, fallo, ánimo — elegidas al azar) | Bajo (JSON + una función que elige al azar) | Hoy Capi repite literalmente la misma frase cada vez; con sesiones diarias esto se nota rápido. Encaja con D.2 (JSON-first). |
| **Adelantar "Entrenamiento del Capitán"** (ya estaba en M5, se puede sacar antes): practicar un concepto suelto sin que cuente para el IED ni la cola de repaso | Medio (una pantalla nueva + flag "no registrar" en `Progression`/`Evaluacion`) | Sesiones cortas de repaso libre, sin presión — pedido implícito varias veces en el histórico del proyecto. |
| **"Reintentar este mismo reto"** tras un partido, antes de pasar al siguiente estadio | Bajo | Refuerza un concepto recién fallado sin esperar a que la cola de repaso lo traiga sola. |
| **Variedad de celebraciones** (2-3 animaciones de confeti/gol distintas, elegidas al azar) | Bajo (CSS, ya existe la base) | Evita que la celebración se sienta idéntica siempre. |
| **Racha visual reforzada**: a partir de 7 días, un pequeño cambio visual en el icono de racha (llama más grande/dorada) | Bajo | Motivación intrínseca de progreso visible (coherente con restricción 1), sin añadir presión. |

Ninguna de estas toca el motor de puzles ni introduce tiempo límite/penalización nuevos — todas caben en el criterio de "fácil de implementar" que pediste.

---

## 4. Narrativa — más ganas de volver, dentro de las reglas ya fijadas

Recuerdo la restricción de la sección 1 del plan original: motivación **intrínseca** (curiosidad, dominio, progreso) siempre por encima de la extrínseca, nunca mecánicas manipulativas. Todo lo de aquí es narrativa/texto, no presión de tiempo ni FOMO.

- **El banco de frases de Capi (sección 3)** ya es, de hecho, la mejora narrativa de mayor impacto por coste — repetición literal mata la inmersión más rápido que casi cualquier otra cosa.
- **Micro-historias de los rivales "Fueras de Juego"**: hoy son solo un nombre e imagen. Una frase de "presentación" la primera vez que aparece cada uno (`data/rivales.json` con un campo `presentacion`), sin bloquear nada.
- **Reacción de Capi a hitos, no solo a cada reto**: un mensaje especial (ya existe para el Contrato del Día) cuando se alcanza un cromo Crack por primera vez, o cuando se desbloquea un equipo — mensajes existentes se pueden enriquecer con más variedad de la sección 3.
- **Lo que NO propongo**: revivir "Temporadas temáticas" (A.3, ya rechazada por coste visual alto) ni ningún mecanismo de tiempo límite/urgencia — seguiría contradiciendo la restricción 1.

Esto conecta directamente con la **FASE M3 (Museo de la Liga)** ya planificada, que sigue siendo la pieza narrativa grande pendiente — este bloque son mejoras narrativas *pequeñas* que no dependen de M3 y se pueden hacer antes o en paralelo.

---

## 5. Reflexión metamatemática — ligera, opcional, poco frecuente

Pediste explícitamente cuidado aquí: bien hecho ayuda a consolidar aprendizaje (verbalizar/clasificar el propio razonamiento es una de las prácticas con más respaldo en investigación), mal hecho (con fricción o frecuencia excesiva) puede saturar a un niño de 6-9 años que solo quiere seguir jugando.

**Propuesta concreta — "¿Cómo lo pensaste?"**: tras un acierto **especialmente logrado** (no todos: solo cuando `resultado` es limpio Y en fase 3, es decir, exactamente el mismo criterio que ya usa la insignia "Estratega" de M1 — reutilizar el criterio, no inventar uno nuevo), Capi ofrece un botón opcional con 3-4 chips de **solo toque, sin texto libre**:

> "Lo vi de un vistazo" · "Usé una estrategia" · "Fui probando" · "Pedí ayuda y por fin entendí"

Un toque, se guarda en `progreso.registro` (ya existe esa estructura de `assessment.js`), listo. **Nunca aparece si el niño no quiere** (se puede cerrar sin elegir nada) y, sobre todo, **no aparece en cada reto** — solo en el subconjunto ya "Estratega", que de por sí es minoritario. Esto es la semilla de la futura "Diario del Entrenador" (U3 del plan original), pero mucho más barata y ya con la cautela que pediste incorporada de fábrica.

**Lo que dejo aparcado, tal y como pediste**: grabación de voz explicando el razonamiento (D.4 del plan original). Motivo por el que no lo prioriza ni Fable ni tú: coste técnico (migrar a IndexedDB, permisos de micrófono en iPad) + el mismo riesgo de saturación que ya has señalado, posiblemente mayor que el de los chips (hablar en voz alta pide más esfuerzo/vergüenza a un niño que tocar un icono). Queda anotado en el plan por si en el futuro cambia el contexto (p. ej. si los niños piden explícitamente poder "explicarle a Capi" lo que hicieron).

---

## 6. Otras ideas (menor prioridad, para que elijas si entran)

- **Modo oscuro**: fácil en CSS (ya hay tokens en `:root`), pero dudoso valor pedagógico para el público objetivo — lo dejaría fuera salvo que lo pidas.
- **Estadísticas visuales simples para el niño** (no el panel de familias, algo más lúdico: "esta semana jugaste en 3 estadios") — se solapa con el "Diario del Entrenador" (U3), mejor no duplicar.
- **Sonidos de ambiente de grada variables por estadio** — coste de producción de audio, no solo código; aparcar.

---

## 7. Reconciliación con el roadmap existente (orden de ejecución propuesto)

```
✅ M0 — Salud técnica (migración + trocear main.js)
✅ M1 — Vocabulario técnico + Niveles de Dominio
✅ M2 — Contrato del Día
──────────────────────────────────────────────
   C1 — Banco de 7 años ("Aspirantes")            ← nuevo, sección 1
   V1 — Iconos SVG de interfaz + breakpoints        ← nuevo, sección 2.2-2.3
   V2 — Fusión banner+cápsula + landscape/safe-area ← nuevo, sección 2.4-2.5
   G1 — Frases variadas de Capi + Entrenamiento     ← nuevo, sección 3 (Entrenamiento adelantado de M5)
        del Capitán adelantado
   N1 — Micro-historias de rivales                  ← nuevo, sección 4
   R1 — "¿Cómo lo pensaste?" (chips, sin voz)        ← nuevo, sección 5
──────────────────────────────────────────────
   M3 — Museo de la Liga (sin cambios)
   M4 — Repaso de mantenimiento (sin cambios)
   M5 — Modos de juego (Contrarreloj, dificultad — Entrenamiento ya salió en G1)
   M6 — Arquitecto del Estadio
   M7 — Ascenso y Copa de Leyendas
   M8 — Familia y accesibilidad
   M9 — Opcionales (incluye D.4 grabación de voz, aparcada)
```

**Recomendación de orden**: C1 primero (es contenido puro, sin dependencias, y resuelve un problema real que ya has visto jugando con tus hijos); V1+V2 después (visual, independiente de contenido); G1/N1/R1 son pequeños y se pueden intercalar en cualquier momento sin bloquear nada. Ninguno de estos bloquea ni es bloqueado por M3-M9.

## 8. Decisiones que necesito que confirmes antes de que Sonnet ejecute

1. **Nombre del equipo nuevo**: ¿"Aspirantes" 🎯, o prefieres otro?
2. **¿Incluimos el mini-juego "Emparejar"** (código nuevo en `engine.js`, ~50-70 líneas) o nos quedamos 100% con los tipos existentes para el banco de 7 años?
3. **¿Autorizas tocar `reto.js`** para fusionar banner+cápsula (V2), o prefieres que esa parte quede solo como CSS de compactación adicional sin cambiar la estructura DOM?
4. **Orden**: ¿de acuerdo con C1 → V1 → V2 → G1/N1/R1 → seguir con M3, o prefieres otro orden?

---

*Documento de arquitectura. Cuando confirmes las decisiones de la sección 8, cada bloque (C1, V1, V2, G1, N1, R1) se ejecuta como una fase independiente, una por sesión, con la misma checklist de QA que las fases M.*
