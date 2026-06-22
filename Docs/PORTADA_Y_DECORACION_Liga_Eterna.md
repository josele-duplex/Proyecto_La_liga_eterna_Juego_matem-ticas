# Portada, decoración e inmersión visual — Liga Eterna

> Continuación de `PLAN_VISUAL_Liga_Eterna.md`. Responde a tres encargos del usuario: (1) diseñar una
> portada, (2) sumar imágenes de decoración para dar inmersión, (3) que los avatares intervengan en el
> juego para reforzar la empatía. Incluye especificaciones técnicas y prompts listos para generar arte.

## 1. La portada (pantalla de título)

### 1.1 Qué es, técnicamente
La portada **no es solo una imagen**: es una pantalla HTML nueva (la primera que se ve al abrir la app),
con una **imagen de fondo a pantalla completa** y, encima, **botones reales** de la interfaz. La imagen
es decorado; los botones los pinta el código (así son pulsables, escalan y no se deforman).

Tiene además una función técnica importante en iPad: **el iOS no deja sonar audio hasta el primer toque
del usuario**. La portada con su botón "¡A jugar!" es justo ese primer toque, así que de paso
**desbloquea el sonido** del juego. Por eso ahora sí tiene sentido una portada (antes la habíamos
descartado): cumple una función real, no es solo decorativa.

### 1.2 Botones que debe tener
La portada debe ser **simple**: un único protagonista.
- **"¡A jugar!"** — botón primario grande, centrado en la zona inferior. Lleva al selector de jugador
  (la pantalla "¿Quién juega?") y desbloquea el audio.
- (Opcional, pequeño, esquina) **botón de sonido 🔊/🔇** — por si se quiere silenciar desde el inicio.

**Lo que NO debe llevar:** los 4 botones que tiene la imagen actual (*Aventura / Cálculo Mental /
Recompensas / Para todas las edades*). Esos son etiquetas de marketing, no pantallas de la app: no
llevan a ningún sitio en nuestro flujo real (jugador → equipo → calendario → reto). Si están dibujados
en la imagen, chocan con el botón real "¡A jugar!".

### 1.3 Cómo pedir la imagen (cambios sobre la portada que ya tienes)
La portada actual (`diseno/arte-generado/Imagan portada.png`) **gusta y el estilo es el correcto**; solo
hay que pedir una versión revisada que deje sitio a los botones reales. Cambios a pedir:

1. **Quitar el botón de "play" dibujado** y **los 4 botones de abajo** (Aventura/Cálculo Mental/etc.).
2. Dejar una **zona inferior central despejada** (sin personajes ni texto en el tercio inferior medio),
   donde irá el botón real "¡A jugar!".
3. Mantener todo lo demás: el título "LA LIGA ETERNA — Los Guardianes del Juego", el jugador, Capi, los
   Fueras de Juego, el estadio de fondo, los números mágicos. El título dibujado **sí** se queda (es
   identidad de marca, no un botón).
4. **Composición segura para recortes:** la app se juega en iPad (vertical y horizontal) y en PC. Pide
   la escena con los elementos importantes **centrados y con aire en los bordes**, para poder recortarla
   a vertical sin cortar a los personajes.

**Especificación técnica de entrega:**
- Formato: **PNG o JPG** (no necesita transparencia, es un fondo completo). Nosotros lo pasamos a WebP.
- Resolución: **mínimo 1920 px de ancho** (mejor 2400) para que se vea nítida en pantallas grandes.
- Proporción: **16:9 horizontal**, con los personajes y el título dentro del 80% central (zona segura).
- Una sola imagen, sin marcos ni bordes añadidos.

**Prompt sugerido (revisión de la portada):**
> Pantalla de título de videojuego infantil de fútbol, estilo 2D ilustrado cálido y premium, mismo
> estilo que la portada existente. Un niño futbolista con balón a la izquierda y un entrenador veterano
> carismático (chándal azul, brazalete de capitán) a la derecha, en un gran estadio iluminado con
> gradas llenas. En lo alto, el título "LA LIGA ETERNA" en letras grandes doradas y azules con un balón,
> y debajo "Los Guardianes del Juego". Pequeñas criaturas traviesas de color morado (errores numéricos)
> asomando por las esquinas. Números y símbolos matemáticos brillando sutilmente en el ambiente.
> IMPORTANTE: dejar el tercio inferior central vacío y despejado (sin texto ni personajes ahí), para
> colocar un botón. Sin botones dibujados, sin interfaz, sin marcas reales. Composición centrada con
> aire en los bordes. 16:9, alta resolución.

## 2. Imágenes de decoración (inmersión visual)

Objetivo: que cada pantalla "respire estadio" sin recargar ni pesar (la PWA debe seguir siendo ligera
para funcionar sin conexión). Regla: **decoración repetible = CSS/SVG hecho por Claude; piezas con
personaje o ilustración = imagen generada por el usuario**.

### 2.1 Lo que hace Claude (sin imágenes nuevas)
- El **fondo de césped** con franjas, viñeta y foco de luz por zonas — **ya hecho**.
- Posibles añadidos CSS/SVG cuando se quiera: marco de **marcador** tipo estadio para la barra superior,
  **banderines** SVG en cabeceras, torres de **focos** estilizadas en las esquinas.

### 2.2 Lo que aporta el usuario (piezas ilustradas, PNG transparente)
Por prioridad de impacto/inmersión:
1. **Fueras de Juego** (3-4 criaturas del error numérico): aparecen como "rivales" pequeños en la
   pantalla de reto, dando sentido de aventura. Morados/azul noche, traviesos no terroríficos.
   *Prompt base:* «Criatura pequeña y traviesa de energía morada que representa un error numérico, ojos
   grandes expresivos, forma redondeada simpática, no da miedo, estilo 2D ilustrado cálido, fondo
   transparente». Generar 3-4 variantes distintas.
2. **Cartel/pancarta de grada** ("¡VAMOS!", confeti) como adorno de la pantalla de victoria.
3. **Trofeo de la Liga** suelto (sin escudo), para hitos y para la futura pantalla de logros.
4. **Iconos de premio**: balón de oro, bota de oro — para recompensas especiales.

(Especificación técnica común: PNG transparente, mínimo 1000 px de lado, una pieza por archivo, sin
sombra de suelo — igual que las insignias ya integradas.)

## 3. Avatares que intervienen en el juego (empatía)

Hoy el avatar del jugador (Pepe/Bruno/David) solo se ve en "¿Quién juega?" y mini en la barra. Para que
el niño sienta que **es él quien juega**, el avatar puede aparecer en momentos clave:

### 3.1 Plan de integración (de más barato a más completo)
- **(A) Ya posible, sin arte nuevo — recomendado primero:** mostrar el avatar del jugador **celebrando
  junto a Capi** en la pantalla de "¡Partido ganado!" (reutilizando la imagen de avatar que ya existe,
  en grande y con el mismo brinco). Y **dirigirse al niño por su nombre** en los mensajes ("¡Bien hecho,
  Pepe!"). Esto lo puede hacer Claude sin imágenes nuevas.
- **(B) Con una pose nueva por niño:** una ilustración "celebrando" de cada avatar (brazos arriba), para
  la victoria, distinta de la pose neutra. Más empática que reutilizar la pose de pie.
- **(C) Avatar reactivo durante el reto (más ambicioso):** un avatar pequeño del jugador en una esquina
  que cambie de gesto al acertar/fallar, como hace Capi. Requiere 2-3 expresiones por niño (coste alto
  de arte: 3 niños × varias caras), así que se deja para más adelante.

### 3.2 Qué pedir (poses por avatar, prioridad media)
Para la opción (B), una pose **"celebrando"** de cada Guardián (Pepe, Bruno, David), **mismo personaje y
estilo que su avatar actual**, brazos en alto festejando, cuerpo entero, PNG transparente, fondo limpio.
*Prompt base (ajustar el nombre/aspecto a cada avatar existente):* «El mismo niño futbolista de [avatar
de referencia], celebrando con los brazos en alto y una gran sonrisa, cuerpo entero, mismo estilo 2D
ilustrado, equipación idéntica, fondo transparente, sin sombra de suelo, alta resolución».

## 4. Orden sugerido
1. **Claude (sin esperar arte):** opción 3.1(A) — avatar del jugador celebra en la victoria + nombre en
   los mensajes. Y la portada como pantalla HTML, usando de momento la imagen actual recortada (mejora
   en cuanto llegue la versión revisada).
2. **Usuario:** generar la portada revisada (§1.3) y, si quiere, las poses "celebrando" (§3.2) y los
   Fueras de Juego (§2.2).
3. **Claude:** integrar cada pieza en su ranura a medida que llegue.

## 5. Recordatorio técnico
Toda imagen generada por IA suele llegar con un **falso fondo transparente** (cuadritos grises pintados
como píxeles, no transparencia real); Claude lo limpia antes de integrar. Y al tocar el "esqueleto"
(CSS/JS/iconos) hay que **subir la versión del service worker** para que el cambio llegue a dispositivos
que ya instalaron la app.
