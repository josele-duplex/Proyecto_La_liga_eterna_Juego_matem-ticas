# Plan visual reestructurado — Liga Eterna

> Anexo de planificación creado tras recibir la guía de estilo del usuario
> (`Ideas_Disenio_grafico/Liga_Eterna_Style_Guide.docx`). No borra el plan técnico original;
> reordena el tramo final de la Fase 3 para meter el diseño gráfico en el momento óptimo y deja
> claro el reparto de trabajo (qué hace Claude / qué imágenes aporta el usuario).

## 1. Diagnóstico

El usuario reporta que **le cuesta usar la app tal como está** (sin diseño). El cuello de botella
real no son las ilustraciones, sino la **interfaz**: layout, jerarquía, tamaño táctil, color con
función. Eso se resuelve con CSS + SVG funcional, **sin depender de ninguna imagen externa**. Las
ilustraciones pintadas (personajes, insignias, escudos) añaden personalidad y se integran luego en
las ranuras de imagen que ya existen en los datos, de forma incremental y sin bloquear.

Principio rector (de la guía): *"como una app de fútbol cálida y premium, nunca como un examen
ilustrado"*. Regla de oro técnica que ya cumplimos: **el motor es ciego al aspecto**; todo el estilo
vive en `styles.css` + `ui.js`.

## 2. Reparto de trabajo

### Lo hace Claude (sin imágenes — desbloquea la usabilidad ya)
- Rediseño CSS integral: tokens, tipografía, espaciado, botones táctiles, tarjetas, jerarquía.
- Aplicación real del color por zonas (mundo / matemáticas / recompensa) según la guía.
- Tratamiento "fútbol" del área de juego (recta numérica como césped, marcador, energía).
- Animaciones y celebración contenidas; estados de acierto / pista / error amable (naranja, no rojo).
- SVG funcional de interfaz e iconos geométricos donde haga falta.
- Icono(s) de la PWA derivados del escudo existente.
- Integración de cada ilustración en su ranura a medida que el usuario la entregue.

### Lo aporta el usuario (ilustración pintada, para coherencia con lo ya producido)
Prioridad y prompts en la sección 4. En resumen: insignias de estrategia (8), emblemas de modo (3),
expresiones de Capi, escudos de estadios nuevos, y —fase futura— Fueras de Juego y Leyendas del Orden.
Opcional: archivo de fuente redondeada con licencia libre (Nunito / Baloo 2) para autoalojar; si no se
aporta, se usa `system-ui`.

## 3. Orden reestructurado del tramo final de Fase 3

| Orden | Tarea | Depende de imágenes | Quién |
| --- | --- | --- | --- |
| **1** | **T3.V1 — Rediseño visual de interfaz** (CSS + SVG funcional, todas las pantallas) | No | Claude |
| 2 | **T3.V2 — Integración de ilustraciones** (rellenar ranuras según lleguen) | Sí, incremental | Claude (con imágenes del usuario) |
| 3 | **T3.4 — PWA instalable** (manifest + service worker + icono) | No | Claude |
| 4 | **T3.6 — Accesibilidad y pulido táctil** (sobre el diseño ya aplicado) | No | Claude |
| 5 | **T3.5 — Panel para familias** (lee la evaluación invisible de T3.3) | No | Claude |

Razonamiento del orden: primero lo que quita el dolor actual (T3.V1, sin dependencias); la PWA va
**después** del rediseño para instalarla en el iPad ya bonita y poder testear con los niños; el panel
de familias se deja para el final porque no afecta a la experiencia del niño.

## 4. Prompts de imagen (el usuario genera una a una)

**Bloque de estilo común** — anteponer a CADA prompt para mantener coherencia:

> Ilustración 2D plana/semiplana, estilo app de fútbol cálida y premium, sombreado suave y corto,
> contornos limpios semigruesos, colores limpios y amables, lectura instantánea en tablet, acabado
> tipo colección de stickers de alta calidad (no realista, no 3D). Fondo transparente, una sola pieza
> centrada, sin sombra de suelo. Sin marcas, escudos ni jugadores reales. PNG, mínimo 1000 px de lado.

### 4.1 Emblemas de modo (prioridad alta — 3 piezas)
Deben escalar en prestigio visual (de cantera a leyenda) manteniendo simplicidad.
- **Promesas:** emblema circular tipo parche de academia juvenil; un balón con un brote verde naciendo,
  acento verde césped; sensación de "primeros toques, empezar".
- **Estrellas:** emblema circular; un balón con una estrella dorada destacada; acento azul deportivo;
  sensación de "jugador titular, crack".
- **Leyendas:** emblema circular más ornamentado pero sobrio; un trofeo/copa con laurel; acento dorado;
  sensación de "élite, leyenda del equipo".

### 4.2 Insignias de estrategia (prioridad alta — 8 piezas)
Todas con la misma gramática: **círculo tipo medalla deportiva**, borde de medalla (no moneda
genérica), **un icono central dominante** que represente la estrategia de un vistazo. Mismo tamaño y
grosor de borde para que la fila de insignias se vea como un set.
- **Maestro de la Decena** (completar diez): diez fichas/balones formando una decena completa.
- **Ojo de Águila** (reconocer patrón): un ojo deportivo agudo sobre un patrón de puntos.
- **Juez de la Cantidad** (comparar cantidades): una balanza con balones, comparando dos lados.
- **Rey de los Dobles** (usar dobles): dos grupos idénticos espejados + una pequeña corona.
- **As del Casi-Doble** (usar casi-dobles): dos grupos casi iguales (uno con un balón de más) + chispa.
- **Capitán de los Grupos** (multiplicar por grupos): varias filas iguales de balones (matriz) + brazalete de capitán.
- **Repartidor Justo** (repartir/fracciones): una pizza/balón dividido en partes iguales repartidas.
- **Maestro del Redondeo** (redondear): una diana con una flecha apuntando a la decena más cercana.

### 4.3 Expresiones de Capi (prioridad media — usa el Capi base como referencia)
Mismo personaje (chándal de entrenador con detalle de capitán), cara siempre visible y legible.
- **Concentración:** cejas activas, boca neutra, mirada directa (estado por defecto antes de resolver).
- **Alegría / Victoria:** ojos abiertos, sonrisa amplia, postura abierta (acierto y celebración).
- **Duda:** una ceja más alta, boca pequeña, cabeza ligeramente inclinada (al dar una pista).

### 4.4 Escudos de estadio (prioridad media — según crezca el calendario)
Mismo formato, proporción, grosor de borde y nivel de detalle que el "Estadio de la Cantera" ya hecho,
para que el calendario se vea uniforme. Un escudo nuevo por cada estadio que se añada.

### 4.5 Avatares de Guardián adicionales (prioridad baja)
Mismo estilo que Pepe / Bruno / David, cuerpo entero, para nuevos perfiles.

### 4.6 Personajes narrativos (prioridad baja — fase futura)
- **Fueras de Juego:** criaturas del error/caos numérico; material irregular, roto o corrupto,
  asimetría y geometría inestable; morados y azul noche; amenaza fantástica pero no terrorífica.
- **Leyendas del Orden:** cracks coleccionables, uniforme especial sobrio con un acento de color por
  concepto matemático; cada uno enseña un concepto.

## 5. Notas técnicas
- Las imágenes se entregan como PNG transparente y Claude las convierte a WebP dimensionado para no
  inflar el peso de la PWA (importante para que cargue rápido offline en iPad).
- La base (Ruta A: CSS + SVG) debe funcionar siempre aunque una imagen aún no exista (placeholder).
- Respetar `prefers-reduced-motion`; celebraciones < 1,5 s y desactivables.
