# Plan de mejoras de engagement, gamificación y cultura matemática
### Addendum al GDD + arquitectura de datos + plan de ejecución por fases

> **Qué es este documento.** Resultado de la fase de arquitectura (Fable, 2026-07-02) sobre el documento de propuestas de bloques A–D. Es el plan que ejecuta Sonnet, **una fase por sesión**, en el orden indicado. Sustituye y absorbe las tareas TG.8–TG.11 del PLAN_TECNICO.
>
> **Cómo usarlo.** En cada sesión, pega el bloque de UNA fase (M1, M2…) y pide implementarla. Al cerrar cada fase, Sonnet debe pasar la checklist de QA de la sección 7 antes de dar la fase por terminada.

---

## 1. Punto de partida real (más avanzado que el documento de propuestas)

El documento de propuestas asumía un proyecto sobre el papel. La realidad del repositorio ya incluye:

| Propuesta del documento | Estado real |
|---|---|
| B.5 Guardado local | ✅ Hecho (`storage.js`, por perfil, con red de seguridad ante datos dañados) |
| B.6 Perfiles múltiples | ✅ Hecho |
| PWA instalable + offline | ✅ Hecho (`manifest.webmanifest`, `service-worker.js`) |
| Repaso espaciado por error | ✅ Hecho (TG.5, `colaRepaso` estilo Leitner) |
| C.2 Medallas de estilo / TG.4 | ✅ Hecho en esencia (`insigniasProceso`: Disparo Directo, Remontada, Rayo) |
| Racha diaria / gancho de hábito | ✅ Hecho (TG.3) |
| Energía como moneda positiva | ✅ Hecho (se gana al resolver, se gasta en power-ups que andamian — TG.7) |
| Rival narrativo del fallo | ✅ Hecho (TG.6, Fueras de Juego) |
| Modo Contrarreloj | ✅ Existe en germen: el concepto "relámpago" ya tiene cronómetro visible |
| Banco de contenidos | ✅ 458 puzles JSON en 3 edades, arquitectura JSON-first (D.2 ya es la norma) |

**Consecuencia:** todo lo que sigue se construye ENCIMA de esto. Ninguna fase debe reescribir estos sistemas, solo extenderlos.

**Deuda a vigilar:** `main.js` ronda ya las 1.000 líneas (40 KB). La fase M0 lo trocea antes de añadir más pantallas, para no repetir el patrón monolítico que la restricción 9 prohíbe.

---

## 2. Solapamientos resueltos: cinco sistemas unificados

Cada pareja/trío de propuestas redundantes se funde en UN sistema con UN nombre. Sonnet no debe implementar las propuestas originales por separado.

### U1 — Niveles de Dominio (funde B.4 + niveles Bronce/Plata/Oro de cromos)
Una sola escala por concepto, derivada del estado que ya guarda `progreso.dominio`:
- 🥉 **Aprendiz**: concepto empezado (cualquier fase CPA jugada).
- 🥈 **Titular**: dominada la fase 3 (abstracta) al menos una vez.
- 🥇 **Crack**: dominio sostenido — 3 aciertos "a la primera y sin pistas" en fase máxima, no consecutivos necesariamente.

*(La propuesta B.4 lo llamaba "Leyenda", pero ese nombre ya está triplemente ocupado en el juego: el equipo/modo Leyendas 🏆 y las Leyendas del Orden del Museo. "Crack" evita la confusión y es igual de futbolero.)*
El brillo del cromo, la barra de progreso y cualquier pantalla usan ESTA escala. No existe una taxonomía paralela.

### U2 — Contrato del Día (funde C.5 contratos + "reto del día" del GDD §13)
Al entrar cada día (aprovechando `actualizarRacha`), Capi asigna UN contrato concreto leído de `data/contratos.json` ("Hoy necesito 3 jugadas de dobles"). Cumplirlo da un bonus de energía. Un solo sistema, un solo saludo diario.

### U3 — Diario del Entrenador (funde C.6 álbum de estrategias + "diario del jugador" del GDD §13; D.4 audio se acopla aquí si algún día se hace)
Una pantalla de metacognición: estrategias más usadas (los datos ya existen en el registro de assessment), insignias, mensajes reflexivos por reglas ("Hoy usaste la descomposición 5 veces").

### U4 — Repaso espaciado unificado (funde D.1 + TG.5 ya implementado)
La `colaRepaso` existente gana un segundo tipo de entrada:
- `tipo: "refuerzo"` — la actual: entra al fallar, cuenta en retos (`enFaltan`).
- `tipo: "mantenimiento"` — nueva (D.1): cuando un concepto llega a 🥇 Crack, se programa una revisión en días naturales con intervalos crecientes (3 → 10 → 30). Si la revisión sale bien, intervalo siguiente; si no, el concepto baja a 🥈 ("este cromo necesita entrenar de nuevo" — nunca "has olvidado").
Ambos tipos se sirven por el mismo `Progression.siguiente` sin etiquetarse como "repaso aburrido".

### U5 — Museo de la Liga (funde A.1 + A.2 + A.6 + C.4 + TG.9 álbum de cromos)
Una sola pantalla-colección con dos salas:
- **Sala de Leyendas** (A.1/A.2/C.4): cada Leyenda del Orden = matemático/a real ficcionado (Gauss, Noether, Euclides, Fibonacci, Hypatia, Pascal) con ilustración, mini-historia de 1-2 frases, curiosidad y "relato de gloria" al desbloquear.
- **Enciclopedia del Entrenador** (A.6): una entrada por estrategia descubierta — ¿qué es? / ejemplo paso a paso / ¿quién la usa en el mundo real? (absorbe A.7).
Todo el contenido en `data/leyendas.json` y `data/enciclopedia.json`. Consultable desde el menú en cualquier momento.

---

## 3. Propuestas descartadas o modificadas (y por qué)

| Propuesta | Decisión | Motivo (restricción de la sección 1 del encargo) |
|---|---|---|
| **B.1 Energía que se consume al fallar/abandonar** | ❌ **Descartada en su forma propuesta** | Es un sistema de vidas con otro nombre: castiga precisamente a quien más necesita practicar (restricción 1 y 6). La energía existente se mantiene como es hoy: **solo se gana y solo se gasta voluntariamente** en power-ups. Nunca bloquea el acceso a jugar. |
| **C.3 Eventos del Caos (tiempo acelerado, números que se mueven)** | ⚠️ Modificada y aplazada | "El tiempo corre más rápido" viola la restricción 1. Si algún día se hace, será como "partido especial" **anunciado y opcional** dentro de la Copa (fase M7+), sin tiempo, solo variaciones visuales. No entra en este plan. |
| **B.7 Modo Profesional "con menos tiempo"** | ⚠️ Modificada | Se aprueban los tres modos y su micro-copy protector literal, pero **sin reducción de tiempo** en ningún modo (la velocidad solo se premia en Contrarreloj, que es opt-in). Profesional = sin pistas automáticas, nada más. |
| **B.3 Divisiones como estructura de progresión** | ⚠️ Reducida a ceremonia | La estructura de divisiones **ya existe**: los equipos Promesas 🌱 / Estrellas ⭐ / Leyendas 🏆 con desbloqueo por dominio (`vaSobrado`). Construir "divisiones" aparte duplicaría el sistema. Lo único que falta y se aprueba: la **ceremonia de ascenso** (hoy el desbloqueo es un botón discreto en la victoria). Sin etiquetas de edad, como manda el precedente del proyecto. |
| **A.3 Temporadas temáticas** | ❌ Aplazada indefinidamente | Coste visual alto (mundos con estética propia) y cero delta pedagógico frente a los estadios ya temáticos. Contradice el anexo de diseño (AAA fuera de alcance). |
| **A.9 Árbol de conocimientos (constelación)** | ❌ Aplazada | Visualización cara de hacer bien en táctil; la Enciclopedia (U5) ya muestra conexiones entre estrategias con texto. Revisable tras M5. |
| **D.4 Explica en voz alta (grabación)** | ⚠️ Aplazada a opcional final | Requiere migrar a IndexedDB (audio no cabe en localStorage) y permisos de micrófono en iPad. Valiosa pero cara; queda como M9 opcional. |
| **D.5 Banquillo de estrategias** | ⚠️ Aplazada a opcional final | Añade fricción previa a la sesión (el momento más frágil del hábito). Solo para 8-9 años y solo tras validar M1-M5 con los niños. |
| **A.4 Prestigio intelectual** | ✔️ Absorbida | No es un sistema nuevo: son 2-3 insignias más en `insigniasProceso` ("Estratega", "Pensador"). Se hace en M1. |
| **A.8 Misiones "¿Quién descubrió esto?"** | ✔️ Reducida | No son misiones: son la "curiosidad" de cada carta del Museo (U5) con una pregunta opcional de 1 toque. Se hace dentro de M3. |

Todo lo demás de los bloques A–D queda aprobado e integrado en las fases siguientes.

---

## 4. Addendum al GDD (sección 14 nueva)

Añadir conceptualmente al GDD (no hace falta reescribir el archivo; este documento ES el addendum):

**14.1 Niveles de Dominio (U1).** Escala única 🥉🥈🥇 por concepto, visible como barra en el calendario y como brillo del cromo. Se asciende por dominio demostrado, nunca por velocidad ni por edad.

**14.2 Contrato del Día (U2).** Meta diaria concreta asignada por Capi, cumplible en una sesión corta. Bonus de energía. Nunca castiga no cumplirlo: simplemente mañana hay otro.

**14.3 Museo de la Liga (U5).** Colección con Sala de Leyendas (matemáticos reales ficcionados con habilidad jugable asociada) y Enciclopedia del Entrenador (una entrada por estrategia, con aplicación en el mundo real). El vocabulario matemático técnico (A.5) aparece SIEMPRE en mayúsculas de celebración en el feedback: "¡Has usado DESCOMPOSICIÓN!".

**14.4 Repaso de mantenimiento (U4).** Los conceptos en nivel Crack programan revisiones a 3/10/30 días servidas como misiones normales. Perder brillo nunca se comunica como olvido ni como retroceso.

**14.5 Modos de juego (B.2 adaptado).** Liga (principal, existente), Entrenamiento del Capitán (práctica libre sin registro de fallos en el IED), Contrarreloj (formalización del Relámpago actual, opt-in), Copa de Leyendas (retos mixtos, fase tardía). Modos de dificultad Entrenador/Profesional/Élite con indicador 🟢/🔵/🟣 *(la propuesta B.7 llamaba "Leyenda" al tercero; se renombra a Élite por la misma colisión de nombres que en U1)* y micro-copy literal: "juegas en una liga más difícil", jamás una evaluación de capacidad.

**14.6 Arquitecto del Estadio (C.1).** Puntos de reforma ganados por dominio (no por volumen de juego) que mejoran visualmente el estadio propio: césped, focos, grada, banquillo. Persistente, acumulativo, nunca se pierde.

**14.7 Diario del Entrenador (U3).** Pantalla de metacognición con estrategias más usadas y mensajes reflexivos por reglas.

**14.8 Ascenso de división (B.3 reducido).** Los equipos existentes (Promesas → Estrellas → Leyendas) SON las divisiones; se les añade una ceremonia de ascenso breve al desbloquear el siguiente. La "Champions" (retos mixtos) es la Copa de Leyendas (14.5).

**14.9 Familia (D.3 + D.6).** Botón de exportar progreso a archivo JSON local; tipografía para dislexia activable; lectura en voz alta también en Museo y Diario.

---

## 5. Esquema de datos

### 5.1 Progreso guardado (localStorage, por perfil) — versión 2

El progreso actual no tiene número de versión. La fase M0 introduce `version: 2` y una función `Storage.migrar(progreso)` que rellena los campos nuevos con valores por defecto sin tocar los existentes. **Regla permanente: nunca renombrar ni eliminar un campo existente; solo añadir.**

```jsonc
{
  "version": 2,
  // — ya existentes (NO tocar) —
  "dominio": { "descomposicion": { "fase": 3 } },
  "conceptoActual": "dobles",
  "ultimoPuzleId": "dobles-fase3-006",
  "colaRepaso": [ { "concepto": "restar", "enFaltan": 2 } ],
  "racha": { "ultimoDia": "2026-07-02", "dias": 4 },
  // energía, insignias, cromos, registro de assessment… según estén hoy

  // — nuevos (con valor por defecto en migrar()) —
  "dominio": { "descomposicion": { "fase": 3, "aciertosLimpiosFaseMax": 2 } }, // para calcular 🥉🥈🥇
  "colaRepaso": [
    { "concepto": "restar", "enFaltan": 2, "tipo": "refuerzo" },
    { "concepto": "dobles", "tipo": "mantenimiento", "fechaRevision": "2026-07-05", "intervaloDias": 3 }
  ],
  "contratoDia": { "fecha": "2026-07-02", "id": "contrato-dobles-3", "avance": 1, "objetivo": 3, "cumplido": false },
  "museo": { "leyendasDesbloqueadas": ["gauss"], "entradasVistas": ["descomposicion"] },
  "reforma": { "puntos": 4, "cesped": 1, "focos": 0, "grada": 0, "banquillo": 0 },
  "ascensosCelebrados": ["estrellas"],   // para que la ceremonia se dispare una sola vez
  "modoDificultad": "entrenador",              // entrenador | profesional | elite
  "ajustes": { "tipografiaDislexia": false, "audio": true }
}
```

El nivel 🥉🥈🥇 **no se guarda**: se calcula siempre desde `dominio` (fase alcanzada + `aciertosLimpiosFaseMax`). Así no puede desincronizarse.

### 5.2 Contenido nuevo (JSON-first, regla D.2)

| Archivo | Contiene | Lo consume |
|---|---|---|
| `data/leyendas.json` | id, nombre ("El Arquitecto Gauss"), concepto asociado, mini-historia, curiosidad, pregunta opcional (A.8), relato de gloria, ruta de ilustración, condición de desbloqueo (ej. `{"concepto":"descomposicion","nivel":"titular"}`) | Museo |
| `data/enciclopedia.json` | una entrada por estrategia: quéEs, ejemploPasos[], quiénLaUsa (mundo real, A.7), conceptosRelacionados[] | Museo / botón "¿por qué funciona?" |
| `data/contratos.json` | plantillas de contrato: id, texto de Capi, condición (`{"insignia":"usar_dobles","veces":3}`), bonus, edades aplicables | Contrato del Día |
| `data/reformas.json` | mejoras del estadio: id, nombre, coste en puntos, niveles, capa visual (clase CSS / imagen) | Arquitecto del Estadio |
| (ceremonia de ascenso) | los textos de ceremonia se añaden a la definición de `MODOS` o a un JSON pequeño si crece | Ceremonia de ascenso |

Añadir contenido = añadir entradas a estos archivos. Cero lógica nueva.

---

## 6. Plan de ejecución por fases (orden = coste/impacto pedagógico)

> Dependencias: M0 es prerrequisito de todas. M3 depende de M1 (usa los niveles para desbloqueos). M4 depende de M1 (usa el nivel Crack). El resto son independientes entre sí y pueden reordenarse si conviene.
>
> Mapa con las tareas grandes pendientes de la FASE G del PLAN_TECNICO: TG.9 (álbum de cromos) queda absorbida por M3 (Museo); TG.8 (clasificación/temporada) queda absorbida por M2 (contrato) + M7 (ascenso); TG.10 (tienda cosmética) queda absorbida por M6 (Arquitecto del Estadio, que es cosmética con mejor anclaje pedagógico); TG.11 (metacognición) por M9/D.4 y el Diario (U3).

### FASE M0 — Salud técnica (prerrequisito)
- Añadir `version: 2` y `Storage.migrar()` (sección 5.1). Migración probada con un progreso v1 real.
- Trocear `main.js`: extraer las pantallas a módulos (`js/pantallas/…` o similar), sin cambiar comportamiento. `main.js` queda como orquestador de <300 líneas.
- *Terminado cuando:* la app funciona idéntica a antes, un perfil antiguo carga sin perder nada, y ningún archivo JS supera ~500 líneas.

### FASE M1 — Vocabulario matemático + Niveles de Dominio (A.5, U1, A.4) — el mayor impacto pedagógico por línea de código
- Feedback de acierto nombra la estrategia técnica en mayúsculas ("¡Has usado COMPENSACIÓN!"), leyendo el nombre desde el JSON del puzle/recompensas.
- Calcular nivel 🥉🥈🥇 desde `dominio`; mostrarlo como barra por concepto (en perfil o calendario) y como brillo del cromo. Una sola escala (U1).
- Añadir 2-3 insignias de proceso nuevas (A.4): "Estratega" (usó la estrategia premiada del puzle), "Pensador" (acertó un problema de dos pasos — concepto `problemas` — a la primera). *(Nota: el proyecto usa 3 fases CPA, no 4; la "fase de transferencia" del documento de propuestas no existe como tal.)*
- *Terminado cuando:* al resolver, el niño ve el nombre técnico de su estrategia; cada concepto muestra su nivel; los cromos brillan según esa misma escala.

### FASE M2 — Contrato del Día (U2)
- `data/contratos.json` + lógica: al primer saludo del día (gancho en `actualizarRacha`), Capi asigna un contrato compatible con la edad y los conceptos ya empezados. Progreso visible, bonus de energía al cumplirlo. No cumplirlo no tiene consecuencia alguna.
- *Terminado cuando:* cada día hay un contrato nuevo, se puede cumplir jugando normal, y el bonus se cobra una sola vez.

### FASE M3 — Museo de la Liga (U5: A.1, A.2, A.6, A.7, A.8, C.4)
- `data/leyendas.json` (las 6 leyendas de la tabla A.1) y `data/enciclopedia.json` (una entrada por estrategia existente en `recompensas.json`).
- Pantalla Museo con dos salas, accesible desde el menú. Desbloqueo de leyenda al alcanzar la condición (nivel Titular del concepto asociado) con "relato de gloria". Audio/lectura en voz alta en estas pantallas (parte de D.6).
- Ilustraciones: usar las de `diseno/` si existen; si no, placeholder con emoji + nombre (el arte se añade después sin tocar código).
- *Terminado cuando:* se desbloquea al menos una leyenda jugando de verdad, su historia se puede releer, y añadir una leyenda nueva = añadir una entrada JSON.

### FASE M4 — Repaso de mantenimiento (U4 / D.1)
- Extender `colaRepaso` con `tipo: "mantenimiento"` e intervalos 3/10/30 días (sección 5.1). Al llegar un concepto a 🥇, programar revisión; `Progression.siguiente` la sirve cuando `fechaRevision <= hoy`, con prioridad menor que los refuerzos.
- Si la revisión sale limpia → intervalo siguiente; si no → nivel baja a 🥈 y mensaje "este cromo necesita entrenar de nuevo" (copy literal, nunca "has olvidado").
- *Terminado cuando:* un concepto Crack genera revisión (probar manipulando la fecha), y las entradas de refuerzo actuales siguen funcionando igual.

### FASE M5 — Modos de juego (B.2 adaptado + B.7 modificado)
- **Entrenamiento del Capitán**: elegir concepto y practicar libre; los resultados NO alteran fase CPA ni cola de repaso (solo suman al registro). Ambiente tranquilo.
- **Contrarreloj**: formalizar el Relámpago como modo opt-in con su identidad visual; único lugar donde se premia velocidad.
- **Modos de dificultad** Entrenador/Profesional (Élite queda para cuando existan retos mixtos): indicador 🟢/🔵 siempre visible, copy literal de la sección 4 (14.5). Profesional = sin pistas automáticas; **sin tocar tiempos**.
- *Terminado cuando:* los tres accesos existen desde el calendario, y jugar en Entrenamiento no mueve la progresión.

### FASE M6 — Arquitecto del Estadio (C.1)
- `data/reformas.json` + puntos de reforma ganados al subir de nivel de dominio (no por volumen). Pantalla "Mi estadio" con las mejoras compradas, persistentes, en capas CSS/imagen.
- *Terminado cuando:* subir un concepto a Titular da puntos, se puede comprar una mejora y sobrevive a recargar.

### FASE M7 — Ceremonia de ascenso (B.3 reducido) + Copa de Leyendas (B.2)
- Ceremonia breve y celebratoria cuando `revisarDesbloqueo` abre un equipo nuevo (hoy es solo un botón en la victoria); se registra en `ascensosCelebrados` para dispararse una sola vez. Copa de Leyendas: serie especial con conceptos mezclados ya dominados del equipo actual (aquí nace el modo de dificultad Élite de B.7).
- *Terminado cuando:* el ascenso se celebra una sola vez y la Copa sirve retos de conceptos variados ya dominados.

### FASE M8 — Familia y accesibilidad (D.3 + D.6 + ficha familias del GDD §13)
- Botón exportar progreso a JSON descargable; tipografía dislexia activable en ajustes; panel para familias que traduce el registro de assessment a lenguaje claro.
- *Terminado cuando:* el archivo exportado se descarga en iPad (compartir/guardar) y reimportarlo… no: reimportar NO entra (solo exportar, para no abrir la puerta a corromper progreso).

### FASE M9 — Opcionales (solo si tras probar con los niños apetecen)
- D.4 Explica en voz alta (requiere IndexedDB), D.5 Banquillo de estrategias, C.3 partidos especiales anunciados, A.9 árbol de constelación.

---

## 7. Checklist de QA (D.7) — obligatoria al cierre de CADA fase

1. **Persistencia:** crear perfil → jugar 2 retos → recargar página → todo sigue (dominio, energía, cromos, campos nuevos de la fase).
2. **Migración:** un progreso guardado ANTES de la fase carga sin errores ni pérdidas.
3. **Sin duplicados:** cromos/insignias/leyendas no se duplican al recargar ni al reganar.
4. **IED/progresión intacta:** jugar en el modo nuevo (si lo hay) no corrompe `dominio` ni `colaRepaso` del modo Liga.
5. **Offline real:** con la red desactivada (no solo servidor local), la app abre y se juega un reto.
6. **Restricciones:** repasar la sección 1 del encargo — en particular: ¿algo bloquea el acceso a la práctica? ¿algún fallo se castiga? ¿algún texto etiqueta capacidad? Si sí, corregir antes de cerrar.
7. **Tamaño de archivos:** ningún JS supera ~500 líneas; el contenido nuevo vive en JSON, no en código.

## 8. Reglas permanentes para Sonnet

- Una fase por sesión; no adelantarse a fases posteriores.
- Contenido pedagógico SIEMPRE en `data/*.json` (D.2). Si una fase te tienta a meter textos en JS, es señal de que falta un archivo JSON.
- Cualquier desviación del plan se señala explícitamente al usuario, nunca en silencio.
- Nunca renombrar/eliminar campos del progreso guardado; solo añadir + migrar.
- El copy protector de los modos de dificultad y del repaso de mantenimiento es **literal** (secciones 4 y 6): no parafrasearlo.
