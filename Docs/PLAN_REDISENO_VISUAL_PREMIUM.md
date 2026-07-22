# Plan de Rediseño Visual "Premium" — Liga Eterna

**Origen:** auditoría UX/UI aportada por el usuario (`Auditoría UX_UI.docx`, julio 2026).
**Destino:** lo ejecuta Sonnet 5, **una fase (D1–D6) por sesión**, verificando en preview y subiendo a GitHub en el mismo paso (regla vigente del proyecto).
**Naturaleza:** este documento traduce la auditoría a acciones concretas sobre el código real, corrige lo que ya está hecho para no rehacerlo, y **rechaza razonadamente** las tres propuestas de la auditoría que chocan con decisiones firmes del proyecto.

---

## 0. Veredicto sobre la auditoría

La auditoría es **buena y en su mayoría acertada** en el diagnóstico visual (exceso de blanco, jerarquía plana, botones de formulario, fondo sin profundidad). Su nota "Diseño visual 6,5/10 → 9,5/10 tras rediseño" es un objetivo razonable.

**Pero fue hecha sobre una versión anterior.** Buena parte de lo que pide como "nuevo" ya existe en el código actual (ver §1). Y tres de sus propuestas **no deben aplicarse** porque contradicen decisiones ya tomadas y validadas con el usuario (ver §3). El valor de este plan está tanto en lo que manda hacer como en lo que manda descartar.

**Restricción rectora que la auditoría ignora:** esta app es **web estática (HTML/CSS/JS, PWA offline)**, no un motor de videojuego, y **Claude no genera ilustraciones** (las aporta el usuario). Toda la "espectacularidad" se consigue con **CSS + SVG propio + animación + las ranuras de arte que el usuario ya rellena**. Compararse con Duolingo/Prodigy (apps nativas) es aspiracional en *sensación*, no en técnica. Ver [[diseno-visual-liga-eterna]].

---

## 1. Lo que la auditoría pide y YA ESTÁ HECHO (no rehacer)

Sonnet debe **verificar que siguen bien**, no reconstruirlos:

- **Marcador de partido** "tú - rival" en el banner (`.marcador-partido`, TG.1). ✅
- **Pantalla de presentación del rival "VS"** antes de cada partido (`js/pantallas/rival.js`, tema morado, provocaciones). ✅ — cubre "falta tensión / sensación de partido".
- **Destello "⚽ ¡GOL de {rival}!"** al fallar (`.flash-gol-rival`). ✅
- **Combo** de aciertos con chip y bonus (`.celebracion-combo`). ✅
- **Celebración de acierto** "⚽ ¡Golazo! Has usado X +10 energía" (`celebrarAcierto`). ✅ — cubre parte de "recompensas visuales".
- **Confeti** en victoria (`UI.celebrarVictoria`, `@keyframes caer-confeti`). ✅
- **Barra de progreso por segmentos** 🟦🟦⬜ (`.mini-progreso` / `.segmento`). ✅ — es exactamente lo que la auditoría propone como "novedad".
- **Panel de victoria con marcador tipo estadio** (`.panel-victoria`, `.marcador-final`). ✅
- **Vitrina de Trofeos** con palmarés y "lo que ya sabes hacer" (`crearSalaTrofeos`). ✅
- **Capi reactivo** con 5 expresiones (concentración/duda/ánimo/alegría/…) que cambian según la jugada. ✅ — la auditoría dice "avatar desaprovechado, solo aparece con ayuda"; **ya no es así**, Capi está en cada reto y reacciona.
- **15 animaciones** ya definidas (`rebote-error`, `destello-correcto`, `capi-brinco`, `respirar`, `pulso-decisivo`, `brillo-energia`, `vs-flotar`…). ✅

**Conclusión:** la mitad de la lista "8. Animaciones imprescindibles" y "6. Recompensas visuales" de la auditoría ya está. El trabajo real es de **PROFUNDIDAD, JERARQUÍA y ACABADO**, no de features nuevas.

---

## 2. Lo que falta de verdad (núcleo del rediseño)

Estas son las críticas de la auditoría que **siguen siendo ciertas** sobre el código actual:

1. **Exceso de blanco / sensación de documento.** `.zona-juego` y `.opcion` son tarjetas blancas planas con borde fino → parecen formulario. (Auditoría §2, §5)
2. **Jerarquía plana en la barra superior.** `.barra-perfil` amontona, con el MISMO peso visual: nombre, energía, racha, dificultad, 6 botones (Cambiar equipo, Museo, Mi Estadio, Familia, sonido, Cambiar jugador). El ojo no sabe qué es dato y qué es acción. (Auditoría §3)
3. **Respuestas tipo formulario.** `.opcion` no se siente como "una decisión importante en un videojuego". (Auditoría §5)
4. **Fondo sin profundidad.** Las franjas de césped existen pero son planas; no transmite "estadio con graderío". (Auditoría §7)
5. **Paleta mejorable.** Verdes/azules algo apagados frente a una referencia infantil premium. (Auditoría §3-paleta)
6. **Acabado de recompensa/celebración corto.** Existe, pero le falta el "punch" (sacudida suave, destellos dorados, sonido de estadio, MVP del partido). (Auditoría §6)

---

## 3. Decisiones de producto: lo que la auditoría propone y que NO se aplica

Sonnet **no debe implementar** estas tres cosas. Se documentan con su motivo para que la decisión quede trazada (y para que el usuario pueda revertirla explícitamente si quiere):

### 3.1 ❌ NO añadir monedas / XP / niveles "Lv.7" / gemas 💎
La auditoría propone un HUD `👦 Bruno Lv.7 · ⚡20 · 🏆35 · 💎12`. Eso introduce **cuatro economías nuevas** (XP, nivel numérico, monedas, gemas) que **duplican** las que ya existen y funcionan: **energía ⚡**, **niveles de dominio 🥉🥈🥇**, **trofeos 🏅**, **puntos de reforma 🔧**.
**Motivo:** el propio usuario pidió hace poco *"el alumno debe saber con claridad qué es la energía y para qué vale todo lo demás que gana"*. Añadir monedas y gemas encima va **en dirección contraria**: más símbolos que explicar, más confusión. **Acción:** el HUD compacto de D2 se construye con los tokens que YA existen, no con inventados.

### 3.2 ❌ NO partir a Capi en 4 personajes (Míster / Capitán / Portero / Ojeador)
La auditoría §7 propone cuatro mentores. **Motivo:** (a) la propia auditoría elogia el vínculo emocional con "el entrenador" — fragmentarlo en cuatro lo diluye; (b) cada personaje nuevo son **4× ilustraciones** que el usuario tendría que generar a mano (Capi ya tiene 5 expresiones), y **Claude no genera arte**; (c) rompe la identidad "Capi = tu entrenador" ya consolidada. **Acción:** Capi sigue siendo el mentor único. Si se quiere el matiz de "roles", se hace **sin arte nuevo**, cambiando solo el tono del mensaje según la situación (dar pista = habla como capitán; repaso = habla como quien revisa errores). Esto es copy, no personajes.

### 3.3 ❌ NO usar rojo de alarma (#EF4444) para el error del niño
La auditoría propone rojo suave para errores. **Motivo:** el proyecto fijó desde T2.6, y el usuario lo validó, que **el fallo del niño se pinta en NARANJA de "reintenta", nunca en rojo de alarma**, para no generar ansiedad (`--color-reintenta-*`). **Acción:** se mantiene el naranja para el fallo. El rojo `#EF4444` de la paleta nueva queda reservado solo para un hipotético estado destructivo real (no existe hoy), no para "has fallado".

### 3.4 Matiz sobre nombres
La auditoría escribe "Sombras FC" como rival. El proyecto ya tiene rivales propios con arte del usuario: **los Fueras de Juego** (Energía, Asustado, Malvado). **Se mantienen esos**, no se renombra a "Sombras FC". El nombre del equipo propio ("Cantera FC") sí puede usarse como etiqueta del estadio actual.

---

## 4. Principios que Sonnet NO puede romper (checklist por fase)

Heredados del proyecto; verificar en CADA fase antes de cerrar:

- **Táctil ≥ 44px** en todo lo pulsable (niños). No bajar ningún botón existente de 2.75rem.
- **`prefers-reduced-motion`**: toda animación nueva se desactiva bajo esa media query. La sacudida de pantalla, imprescindible que la respete.
- **Contraste WCAG AA** en texto sobre color (comprobar tras el cambio de paleta).
- **Media queries al FINAL del archivo** (lección ya documentada: si no, quedan muertas por cascada).
- **Sin ilustraciones inventadas.** Solo CSS, SVG propio, y las ranuras de imagen que ya existen. Nada de pedir arte nuevo como requisito de una fase.
- **Subir `VERSION` del `service-worker.js`** cada fase (esqueleto cacheado) — si no, los dispositivos no ven el cambio.
- **Verificar en preview** con puerto rotado (caché del SW) y **devolver a 8766** al terminar; `git push` en el mismo paso que el commit.
- **No tocar la lógica de juego** (progresión, storage, evaluación). Esto es puramente capa visual: CSS + pequeños retoques de estructura DOM en pantallas.

---

## 5. Fases del rediseño (una por sesión)

Ordenadas de fundacional→específico y de bajo→alto riesgo. Cada una es autónoma y deja la app entregable.

### D1 — Paleta y tokens de profundidad *(fundacional, bajo riesgo)*
**Objetivo:** refrescar el sistema de color y añadir los tokens de sombra/gradiente que D2–D6 reutilizarán.
**Cambios (`css/styles.css`, solo `:root` y temas):**
- Modernizar la paleta acercándola a la auditoría, manteniendo la identidad: verde estadio `#0F8A43`, azul victoria `#2563EB`, dorado recompensa `#FBBF24`, energía naranja `#F97316`. Ajustar `--color-primario`/`-oscuro` de cada tema con estos.
- **Mantener** el naranja de reintenta para el fallo (§3.3). No introducir el rojo.
- Añadir tokens nuevos reutilizables: `--sombra-carta` (sombra física con borde inferior, para el efecto "botón que se hunde"), `--gradiente-superficie` (blanco→gris muy tenue, para matar el blanco plano), `--dorado-brillo`.
- Verificar contraste AA de todos los textos sobre los nuevos primarios.
**Aceptación:** la app se ve igual de estructurada pero con color más vivo; 0 regresiones de contraste; ninguna pantalla rota.

### D2 — HUD compacto y jerarquía de la barra superior *(resuelve auditoría §3)*
**Objetivo:** que de un vistazo se distinga **datos** (lo que tienes) de **acciones** (a dónde ir).
**Cambios (`js/pantallas/comun.js` `mostrarBarraPerfil` + CSS):**
- Agrupar a la izquierda un **bloque HUD de datos** compacto y con más peso visual: avatar + nombre, ⚡energía, 🥇nivel de dominio del equipo, 🏅nº de trofeos. **Solo tokens existentes** (§3.1), sin XP/monedas.
- Agrupar a la derecha las **acciones secundarias** (Museo, Mi Estadio, Familia, Cambiar equipo/jugador, sonido) con menos peso: iconos más pequeños, o colapsadas tras un botón "☰ Más" que despliegue, para que dejen de competir. Mantener 44px reales en lo que quede pulsable.
- La energía sigue siendo tocable → Guía del Capi (ya existe).
**Aceptación:** en móvil la barra ya no envuelve en 2-3 filas de botones iguales; el niño identifica sus stats sin leer; todos los toques ≥44px.

### D3 — Respuestas como "cartas" y tarjeta de pregunta como "jugada" *(auditoría §4, §5)*
**Objetivo:** que responder se sienta como elegir una carta, no rellenar un formulario.
**Cambios (CSS `.opcion`, `.zona-juego`, `.enunciado`; retoque menor en `reto.js` para la cabecera):**
- `.opcion`: de campo blanco a **carta con profundidad** — `--gradiente-superficie`, borde inferior grueso (efecto físico), `--sombra-carta`, y al pulsar hundirse + rebote (ampliar `rebote-error`/`destello-correcto` ya existentes). Acierto = destello dorado; fallo = naranja (no rojo).
- `.zona-juego`: matar el blanco plano con `--gradiente-superficie` y una cabecera fina **"⚽ JUGADA CLAVE · Minuto N"** (el "minuto" = número de reto, puramente cosmético; reutiliza el dato de sesión, no crea lógica).
- Mantener el apoyo visual de balones (`.visual-apoyo`) que ya existe y que la auditoría §4 pide.
**Aceptación:** las respuestas tienen relieve y feedback táctil claro; la pregunta parece una misión; sin perder legibilidad ni bajar de 44px; reduced-motion respetado.

### D4 — Fondo con profundidad de estadio *(auditoría §7)*
**Objetivo:** que el fondo transmita "estadio", no "patrón verde".
**Cambios (CSS `body`, `body::before/::after`, quizá un SVG propio ligero):**
- Enriquecer el degradado del fondo: banda de horizonte/graderío arriba (gradiente + siluetas muy tenues de público hechas con CSS o un SVG propio inline, **sin ilustración externa**), foco cenital más marcado, viñeta más presente para dar volumen.
- Las franjas de césped ganan perspectiva sutil (más juntas hacia el "fondo").
- Las tarjetas deben seguir flotando **perfectamente legibles** encima (comprobar contraste).
**Aceptación:** sensación de profundidad clara en una captura; texto de las tarjetas sigue AA; sin coste de rendimiento perceptible (nada de imágenes pesadas).

### D5 — Punch de recompensa y fin de fase *(auditoría §6)*
**Objetivo:** rematar la celebración para que "sepa a gol".
**Cambios (CSS + `victoria.js`/`reto.js`, sin lógica nueva):**
- Reforzar `celebrarAcierto`: **sacudida suave de pantalla** (respeta reduced-motion), **destellos dorados**, mantener el sonido Web Audio ya existente.
- Pantalla de fin de partido: reetiquetar el progreso como **"⚽ Primera parte / Segunda parte"** sobre `.mini-progreso`, y añadir **"⭐ MVP del partido: {nombre}"** en `.panel-victoria` (dato ya disponible: el perfil). Reutiliza el marcador tipo estadio que ya existe.
- Descartar cualquier "moneda/XP" en la celebración (§3.1): se celebra energía, trofeo y racha, que ya están.
**Aceptación:** acertar y ganar se sienten notablemente más "premium"; nada parpadea bajo reduced-motion; sonido opcional (respeta el mute existente).

### D6 — Movimiento fino y pulido final *(auditoría §8)*
**Objetivo:** los detalles de movimiento que separan "escolar" de "videojuego".
**Cambios (CSS + pequeños hooks):**
- **Balón girando** como indicador de carga mientras se hace `fetch` del puzle (spinner temático CSS, sin librería).
- **Marcador con count-up** al cambiar el tanteo (animación de número), **barra de progreso fluida** (transición del relleno), transición suave entre pantallas.
- Repasar que todos los CTAs respiran (`respirar` ya existe) y que las animaciones nuevas están todas bajo `prefers-reduced-motion`.
**Aceptación:** carga, marcador y progreso se sienten vivos; pase completo de un partido sin saltos bruscos; reduced-motion desactiva todo el movimiento no esencial.

---

## 6. Qué se entrega al final

Tras D1–D6, la app conserva **toda su lógica** (contenido, progresión, economía, accesibilidad) y gana el acabado "videojuego premium" que pide la auditoría, **dentro del alcance real** (CSS/SVG, sin arte inventado, sin economías nuevas, sin fragmentar a Capi). Objetivo de la auditoría (6,5 → ~9,5 en diseño visual) alcanzable sin tocar la base.

**Fuera de alcance (explícito):** monedas/XP/gemas/niveles numéricos (§3.1), 4 personajes (§3.2), rojo de alarma para el fallo (§3.3), renombrar rivales a "Sombras FC" (§3.4), y cualquier ilustración nueva como requisito (el usuario la aporta si quiere; el rediseño no depende de ella).
