# Documento de Diseño Visual: *La Liga Eterna*

## Dirección de Arte y Estilo Visual

Para conectar con los jugadores de 8–15 años (Generación Z/Alpha), se recomienda un estilo **3D estilizado y caricaturesco**. Un arte estilizado (p. ej. cel-shading o baja polígonos con texturas pintadas) enfatiza la imaginación y la expresividad sobre el realismo. Juegos populares como *The Legend of Zelda: BotW* y *Fortnite* usan esta estética: colores vivos, formas exageradas y personajes amistosos, creando un ambiente “cool” y accesible para niños mayores. A esa edad toleran gráficos más detallados y “edgy” que los niños pequeños, siempre que no les sobrecarguen cognitivamente. En la práctica, se puede optar por modelos con proporciones caricaturescas (ojos grandes, extremidades redondeadas) y escenarios luminosos. Esto facilita la identificación visual de elementos (poderes, obstáculos) y hace el juego memorable. A diferencia de gráficos hiperrealistas (pesados de producir y menos “atemporales”), el estilo estilizado resistirá mejor el paso del tiempo y apelará por igual a niños y niñas.

## Psicología del Color y UI/UX

La paleta debe ser **brillante y contrastante** pero equilibrada. Por ejemplo, usar verdes esmeralda y azules cielo para los campos y entornos naturales (calmantes y atractivos), combinados con acentos cálidos como amarillos y naranjas para elementos interactivos (resaltar respuestas correctas, efectos de gol). Los colores azules y verdes favorecen la concentración y transmiten serenidad, mientras que toques de rojo o naranja dirigen la atención hacia eventos importantes (alarma, logros). Es vital no saturar el ojo; se sugiere un fondo claro o neutro en la UI con iconos de colores vivos para señalización. Por ejemplo, un menú en tonos blancos/grises suaves con botones coloreados contrastantes (verde para “continuar”, naranja para “solucionar”) ayuda a no abrumar.

La **UI** debe ser intuitiva y dinámica: utilizar íconos grandes, tipografía legible y retroalimentación inmediata (animaciones cortas o sonidos al presionar botones) para mantener el interés de los niños. Debe evitarse el exceso de elementos en pantalla (espacios limpios) y priorizar la consistencia visual. Por ejemplo, la barra de progreso del juego puede ser una cinta animada que se llena con partículas en cada acierto. Siguiendo principios de diseño infantil, las interfaces más simples (layout minimalista) facilitan la navegación. Además, animaciones sutiles en la UI (íconos que “rebotan” al seleccionarse) y efectos sonoros motivantes refuerzan cada interacción, pues los niños responden mejor a feedback visual y auditivo. En resumen: usar color para enfocar la atención en lo educativo (respuestas correctas, pistas) mientras se mantiene una estética amigable y sin sobresaturar.

## Benchmarking (Juegos Referentes)

Del análisis de éxitos globales en edades similares surgen varias claves visuales para *La Liga Eterna*:

- **Colores vivos y alto contraste**. Títulos como *Fall Guys* y *Fortnite* usan paletas saturadas que llaman la atención. Contrastes fuertes (objetos brillantes sobre fondos limpios) guían al jugador hacia los objetivos.  
- **Personajes y objetos amigables, caricaturescos**. Figuras simples y simpáticas (e.j. los “bean” de *Fall Guys* o los avatares de *Roblox*) generan empatía inmediata en niños. Las siluetas pronunciadas facilitan la identificación a distancia.  
- **Entornos estilizados y coherentes**. Mundos fantasiosos con detalles expresivos (como en *Zelda: Tears of the Kingdom*) mantienen la inmersión. La cuidadosa dirección de arte en paisajes coloridos inspira curiosidad.  
- **Interactividad visual constante**. Efectos dinámicos (partículas al encestar un gol, animaciones al resolver un problema) recompensan visualmente y refuerzan la jugabilidad. Aprender se siente como un logro dentro del propio juego.  
- **Claridad en la información en pantalla**. Interfaces limpias al estilo *Roblox*/*Fortnite* con iconos evidentes y texto grande aseguran que los niños no se pierdan. Por ejemplo, flechas de gran tamaño señalando la meta, como en *Fall Guys*, ayudan a entender la meta sin explicaciones largas.  
  Integrar estas claves asegurará que *La Liga Eterna* compita visualmente con los gigantes del mercado y enganche a su público objetivo.

## Camuflaje Didáctico

La enseñanza debe ir **disfrazada de juego AAA**. Una estrategia es integrar las mecánicas educativas dentro de la propia narrativa futbolera. Por ejemplo, para desbloquear un estadio especial, el jugador puede “ajustar la potencia” de un gol resolviendo gráficas numéricas como si calibrara un disparo. En lugar de menús de examen, usar minijuegos visuales: ordenar bloques numéricos para construir la portería correcta, o combinar poderes de jugadores respondiendo sumas. Según estudios de edutainment, los videojuegos logran atención plena mediante narrativas inmersivas y **”seamless integration”** del contenido educativo. Es decir, las matemáticas o ciencias deben presentarse como retos propios del juego (rescate de personajes, competencias de habilidades) en vez de lecciones aisladas.

La estética “AAA” potencia esta integración: escenarios ricos en detalles y efectos visuales atractivos motivan al jugador a explorar y cumplir las metas. El arte del juego influye en la motivación intrínseca: entornos y personajes visualmente interesantes incitan a descubrir secretos y superar retos. Así, cada ejercicio educativo se vive como una victoria visual (con destellos, sonidos triunfales, avatares celebrando), evitando la sensación de “tarea escolar”. En resumen, combinar mecánicas de aprendizaje con feedback visual envolvente (luces, partículas, animaciones) hará que aprender se perciba como parte natural de la experiencia lúdica.

## Roadmap de Diseño Gráfico (de 0 al motor)

1. **Investigación y Conceptualización**: Crear moodboards y bocetos conceptuales que definan la identidad visual (paleta inicial, estilos de personajes, ambiente de los estadios fantásticos). Documentar referencias (juegos mencionados, arte deportivo, fantasía).  
2. **Concept Art Detallado**: Dibujar arte conceptual de personajes clave (jugadores, guardianes) y escenarios principales. Definir proporciones, expresiones y vestuarios. Iterar los conceptos basados en pruebas con el público objetivo (niños de prueba).  
3. **Diseño de Assets 3D**: Modelar en 3D los personajes y objetos a partir de los concept art aprobados. Empezar con mallas básicas (bloques) para proporciones, luego detallar. Modelar también elementos de escenario (portería, balón, elementos de fondo).  
4. **Texturizado y Shading**: Pintar texturas estilizadas (pinceladas, brochazos digitales) de alta saturación según paletas definidas. Aplicar shaders de estilo cel-shading o plana para lograr contraste limpio. Ajustar materiales para que luzcan vibrantes en el motor.  
5. **Rigging y Animación**: Crear esqueleto para personajes (jugadores, NPCs). Animar movimientos de fútbol (correr, chutar, celebrar) y gestos educativos (señalar, saltar de alegría). Ensayar ciclos de animación fluidos y expresiones que refuercen el estilo amigable.  
6. **Diseño UI/UX**: Prototipar la interfaz en 2D: layout de HUD (puntuaciones, barras, opciones), iconos e ilustraciones UI. Definir tipografías amigables y sistema de menús. Implementar wireframes interactivos que demuestren flujos de usuario sencillos y atractivos para niños.  
7. **Implementación en Motor**: Importar assets al motor de juego (Unity/Unreal). Colocar personajes en la escena, diseñar niveles de prueba. Integrar las animaciones y VFX (destellos al gol, humo cuando se acierta). Configurar el sistema de cámara para ángulos dinámicos.  
8. **Integración de VFX y Sonido**: Añadir efectos visuales llamativos para eventos claves (explosión de confeti al anotar, luces en objetivos). Incorporar sonidos de acierto/fallo sincronizados con la acción. Verificar que los efectos refuercen la jugabilidad sin distraer.  
9. **Prueba y Iteración**: Testeo de jugabilidad con niños del rango 8–15 para ajustar dificultad visual y feedback. Refinar colores, tamaño de textos e iconos según legibilidad observada. Ajustar animaciones y efectos para mayor claridad.  
10. **Optimización y Exportación**: Afinar iluminación global y post-procesado para lograr la atmósfera deseada. Optimizar recursos (niveles de detalle, atlas de texturas) para buen rendimiento. Finalmente, empaquetar los assets y el UI exportable al motor, listo para producción.

Cada paso se documenta con entregables visuales claros: moodboards, sketches, renders y prototipos en juego. Esta hoja de ruta garantiza una producción organizada y coherente del estilo gráfico, desde la idea inicial hasta el montaje final en el motor de juego.

**Fuentes:** Estudios de diseño infantil y color en videojuegos, así como análisis de juegos exitosos, sustentan cada recomendación para que *La Liga Eterna* resulte atractivo y educativo a partes iguales.

## **Paso 1 del roadmap: Investigación y conceptualización**

### **Objetivo: fijar el ADN visual antes de dibujar un solo asset**

La base del proyecto ya está bien definida en el GDD: un juego de aventura y puzles matemáticos para 8–9 años, con una puerta de entrada para 6 años, pensado para **web/tablet**, con prioridad **táctil**, y con una estética ya orientada a **cell-shading, contornos claros, lectura instantánea y paleta viva pero no saturada**.

Este primer paso no consiste en “hacer arte”, sino en **tomar decisiones visuales irreversibles con criterio**. Si esta fase está bien cerrada, todo lo demás avanza más rápido: personajes, escenarios, UI, animación, VFX y exportación al motor.

---

## **1\) Qué se decide en esta fase**

### **A. La identidad visual del juego**

Hay que dejar cerradas estas preguntas:

* ¿El mundo se siente más **deportivo-fantástico** o más **deportivo-realista estilizado**?  
* ¿Los personajes son más **heroicos**, más **cómicos** o más **chibi atléticos**?  
* ¿La cámara y el encuadre están pensados para **claridad educativa** o para **espectáculo**?  
* ¿La interfaz se integra en el mundo o flota como HUD puro?

Mi recomendación para *La Liga Eterna* es una identidad de **“fútbol épico-luminoso”**:  
un mundo reconocible como fútbol, pero elevado a fantasía tecnológica y narrativa, con lectura rápida para niños y energía de juego comercial premium.

### **B. El tono visual por edad**

El GDD ya marca un rango amplio: 8–9 años como núcleo, con modo 6 años como acceso.  
Eso obliga a un diseño que combine dos cosas:

* **suficiente detalle y actitud para no parecer infantilizado**,  
* **suficiente limpieza para no saturar ni confundir**.

### **C. La gramática visual de aprendizaje**

También hay que definir cómo se ve el conocimiento cuando aparece en pantalla:  
barras, líneas numéricas, fichas, tableros, hologramas, paneles tácticos, etc.  
El GDD ya propone esa transición concreta–pictórica–abstracta y el uso de material de apoyo visual en la jugada.

---

## **2\) Entregables concretos del Paso 1**

### **1\. Visual Bible de 8–12 páginas**

Debe incluir:

* tono general  
* referencias visuales  
* formas base  
* nivel de detalle  
* reglas de color  
* lenguaje de iluminación  
* tratamiento del UI  
* tratamiento del aprendizaje en pantalla

### **2\. Moodboards por bloques**

Conviene dividirlos en 5 carpetas o láminas:

* **Mundo / estadios**  
* **Personajes / avatar / enemigos**  
* **UI / HUD / menús**  
* **Matemáticas visuales / herramientas**  
* **VFX / feedback / celebración**

### **3\. Tres claves visuales definidas**

Antes de producir, hay que dejar fijadas estas tres decisiones:

* **Silueta:** qué hace reconocible un personaje en 1 segundo.  
* **Color script:** qué familia cromática domina cada tipo de entorno.  
* **Fidelidad estilizada:** cuánto detalle cabe sin perder legibilidad.

### **4\. One-page de dirección de arte**

Una sola hoja que responda:

* qué se ve  
* cómo se siente  
* qué no se permite  
* qué referencia está dentro del estilo  
* qué referencia queda fuera

---

## **3\) Trabajo paso a paso dentro de esta fase**

### **Paso 1.1 — Auditar el GDD visualmente**

Extraer del documento todos los elementos que ya condicionan el arte:

* fútbol como hilo conductor  
* estadios legendarios  
* criaturas del caos numérico  
* avatar personalizable  
* mentor capitán  
* recompensas visuales tipo cromos, trofeo, insignias  
* lectura táctil y botones grandes.

### **Paso 1.2 — Seleccionar el lenguaje visual principal**

Elegir una de estas rutas y cerrarla:

* **3D estilizado con cel-shading**  
* **2.5D híbrido**  
* **pixel art hipervitaminado**

Para este proyecto, la más fuerte es:

**3D estilizado con cel-shading y lectura tipo animación deportiva premium**

Porque encaja con el fútbol, con la progresión de estadio a estadio y con la necesidad de animaciones expresivas, sin caer en hiperrealismo pesado.

### **Paso 1.3 — Definir el “grado de juguete”**

Hay que fijar si el juego se percibe más como:

* juguete táctil,  
* serie de animación,  
* competición deportiva,  
* o aventura de fantasía.

La mejor mezcla aquí es:

**competición deportiva \+ serie de animación \+ tablero táctico interactivo**

### **Paso 1.4 — Establecer referencias prohibidas y permitidas**

Esto ahorra muchísimo tiempo.

**Permitidas:**

* formas redondeadas  
* lectura clara a distancia  
* colores vivos controlados  
* energía juvenil  
* feedback visual inmediato

**Prohibidas:**

* realismo sucio  
* exceso de microdetalle  
* interfaces densas  
* estética oscura sin función  
* símbolos que parezcan tarea escolar

---

## **4\) Qué debe producir arte en este punto**

### **A. Miniaturas de personajes**

No modelos finales: solo **silhouette sheets**.

Debe verse:

* avatar  
* Capi  
* 2–3 enemigos  
* 2–3 “Leyendas del Orden”  
* 1 estadio  
* 1 escenario de entrenamiento

### **B. Pruebas de color**

Tres rutas cromáticas:

* **mundo principal**  
* **zonas de aprendizaje**  
* **estado de éxito / recompensa**

### **C. Pruebas de interfaz**

Wireframes de:

* calendario central  
* pantalla de misión  
* panel de apoyo matemático  
* pantalla de éxito  
* menú de perfil

### **D. Prueba de “camuflaje didáctico”**

Un mockup que muestre una operación matemática integrada como acción de fútbol:  
pasar, chutar, ordenar, despejar, restaurar, activar.

---

## **5\) Criterios de aprobación de esta fase**

El paso 1 solo se considera cerrado si se puede responder con claridad a estas seis preguntas:

1. ¿Qué estilo visual tiene el juego?  
2. ¿Qué paleta manda en el mundo principal?  
3. ¿Cómo se distingue una acción educativa de una decoración?  
4. ¿Qué hace reconocible al avatar y a los enemigos?  
5. ¿Cómo se ve una misión en 2 segundos?  
6. ¿Cómo conviven la fantasía deportiva y la claridad pedagógica?

Si alguna de esas respuestas sigue siendo ambigua, todavía no conviene pasar a producción.

---

## **6\) Resultado esperado al terminar este paso**

Al cerrar esta fase, deberías tener:

* una estética ya decidida,  
* una guía de color,  
* una dirección de UI clara,  
* un lenguaje de formas consistente,  
* un mapa visual del juego,  
* y un criterio compartido para que todo el equipo dibuje “la misma Liga Eterna”.

# **DOCUMENTO DE PRODUCCIÓN VISUAL**

# **PASO 1 — INVESTIGACIÓN Y CONCEPTUALIZACIÓN**

**Proyecto:** *La Liga Eterna: Los Guardianes del Juego*  
**Fase:** Preproducción artística  
**Duración estimada:** 2-3 semanas  
**Objetivo:** Definir la identidad visual completa del proyecto y generar una guía artística que permita producir el juego con coherencia y eficiencia.

---

# **OBJETIVOS DEL PASO 1**

Al finalizar esta fase, el equipo deberá haber establecido:

* El ADN visual del juego.  
* El estilo gráfico definitivo.  
* El lenguaje de formas.  
* Las proporciones y expresividad de personajes.  
* La identidad cromática.  
* Las referencias visuales válidas y prohibidas.  
* La integración visual de las matemáticas.  
* Las bases para personajes, escenarios, UI y efectos visuales.

No se producen todavía modelos finales.

---

# **SUBFASE 1.1**

# **AUDITORÍA DEL GDD**

### **Objetivo**

Extraer todos los elementos que condicionan el apartado artístico.

---

## **Subtareas**

### **1.1.1 Análisis de la narrativa**

Identificar:

* Guardianes del Juego.  
* Capi.  
* Leyendas del Orden.  
* Fueras de Juego.  
* Estadios legendarios.  
* Trofeo de la Liga Eterna.

---

### **1.1.2 Análisis de las mecánicas**

Catalogar:

* Puzles.  
* Coleccionables.  
* Cromos.  
* Insignias.  
* Tableros tácticos.  
* Barras matemáticas.  
* Hologramas.

---

### **1.1.3 Análisis del público objetivo**

Segmentos:

| Edad | Perfil |
| ----- | ----- |
| 6-7 años | Accesibilidad máxima |
| 8-9 años | Público principal |
| 10-12 años | Jugadores avanzados |
| 13-15 años | Alta capacidad y reto |

---

## **Entregables**

* Documento de requisitos visuales.  
* Lista de assets.  
* Mapa de sistemas.

---

# **SUBFASE 1.2**

# **BENCHMARKING Y REFERENCIAS**

---

## **Objetivo**

Estudiar los juegos con mayor capacidad de atracción sobre Generación Alpha.

---

## **Referencias principales**

### **Fortnite**

Se adopta:

* Personajes expresivos.  
* Colores vivos.  
* Feedback espectacular.

---

### **Zelda Tears of the Kingdom**

Se adopta:

* Mundo épico.  
* Iluminación cinematográfica.  
* Escenarios memorables.

---

### **Roblox**

Se adopta:

* Legibilidad.  
* Claridad.  
* Facilidad de comprensión.

---

### **Fall Guys**

Se adopta:

* Siluetas simples.  
* Animaciones exageradas.  
* Humor visual.

---

### **Minecraft**

Se adopta:

* Aprendizaje por descubrimiento.  
* Recompensa constante.  
* Progresión visible.

---

## **Entregables**

Moodboards:

### **Personajes**

* 30 imágenes.

### **Escenarios**

* 30 imágenes.

### **UI**

* 20 imágenes.

### **VFX**

* 20 imágenes.

### **Iluminación**

* 20 imágenes.

---

# **SUBFASE 1.3**

# **DEFINICIÓN DEL ESTILO VISUAL**

---

## **Decisión principal**

### **3D estilizado con Cell Shading**

Inspiraciones:

* Fortnite  
* Zelda  
* Mario Wonder  
* Pixar

---

## **Características**

### **Proporciones**

Altura:

6 cabezas.

Manos:

10% más grandes.

Ojos:

20% más grandes.

Piernas:

Ligeramente largas.

---

### **Lenguaje de formas**

#### **Héroes**

Formas redondeadas.

Comunican:

* Confianza.  
* Energía.  
* Simpatía.

---

#### **Fueras de Juego**

Formas irregulares.

Comunican:

* Caos.  
* Error.  
* Desorden.

---

#### **Leyendas del Orden**

Formas equilibradas.

Comunican:

* Sabiduría.  
* Maestría.

---

## **Entregables**

Visual Bible v0.1

---

# **SUBFASE 1.4**

# **PSICOLOGÍA DEL COLOR**

---

## **Mundo principal**

Verdes vivos.

Azules deportivos.

Blancos brillantes.

Inspiración:

Champions League \+ Zelda.

---

## **Matemáticas**

Turquesas.

Azules eléctricos.

Violetas holográficos.

---

## **Caos**

Morados.

Magentas.

Negros azulados.

---

## **Recompensas**

Dorado.

Amarillo solar.

Naranja.

---

## **Entregables**

Guía cromática.

Color script inicial.

---

# **SUBFASE 1.5**

# **SILUETAS Y EXPLORACIÓN**

---

## **Personajes a diseñar**

### **Avatar del jugador**

3 variantes.

---

### **Capi**

5 siluetas.

---

### **Fueras de Juego**

10 diseños.

---

### **Leyendas del Orden**

8 diseños.

---

### **Robot árbitro**

4 diseños.

---

## **Escenarios**

### **Estadio del Orden**

15 thumbnails.

---

### **Arena de los Números**

15 thumbnails.

---

### **Laberinto Algebraico**

15 thumbnails.

---

### **Torre de las Fracciones**

15 thumbnails.

---

### **Fortaleza del Caos**

20 thumbnails.

---

## **Entregables**

80 thumbnails.

---

# **SUBFASE 1.6**

# **CONCEPT ART DE PERSONAJES**

---

## **Objetivo**

Definir el aspecto de los personajes principales.

---

## **Avatar**

### **Vistas**

* Frontal.  
* Trasera.  
* Perfil.

---

### **Expresiones**

* Alegría.  
* Sorpresa.  
* Duda.  
* Concentración.  
* Victoria.  
* Frustración.

---

### **Equipaciones**

Local.

Visitante.

Élite.

Legendaria.

---

## **Capi**

Expresiones:

* Serenidad.  
* Orgullo.  
* Preocupación.  
* Humor.

---

## **Fueras de Juego**

Diseños:

### **Desorden**

Relacionado con errores numéricos.

---

### **Glitcho**

Relacionado con patrones.

---

### **Borronix**

Relacionado con cantidades.

---

## **Entregables**

10 character sheets.

---

# **SUBFASE 1.7**

# **CONCEPT ART DE ESCENARIOS**

---

## **Objetivo**

Construir la identidad del mundo.

---

## **Escenarios principales**

### **Estadio del Orden**

Sensación:

Esperanza.

---

### **Arena de los Números**

Sensación:

Competición.

---

### **Laberinto Algebraico**

Sensación:

Misterio.

---

### **Torre de las Fracciones**

Sensación:

Descubrimiento.

---

### **Fortaleza del Caos**

Sensación:

Amenaza.

---

## **Producción**

Para cada escenario:

### **Vista general**

1 pieza.

### **Planos interiores**

3 piezas.

### **Props principales**

10 piezas.

### **Iluminación día.**

### **Iluminación noche.**

---

## **Entregables**

25 concept arts.

---

# **SUBFASE 1.8**

# **DISEÑO DE LAS MATEMÁTICAS VISUALES**

---

## **Objetivo**

Camuflar el aprendizaje.

---

## **Herramientas**

### **Barras matemáticas**

Aspecto holográfico.

---

### **Línea numérica**

Convertida en césped táctico.

---

### **Fracciones**

Convertidas en marcadores y ruedas.

---

### **Multiplicaciones**

Convertidas en sistemas de pases.

---

### **Patrones**

Convertidos en formaciones.

---

## **Entregables**

20 mockups.

---

# **SUBFASE 1.9**

# **WIREFRAMES DE UI**

---

## **Pantallas**

### **Menú principal**

---

### **Calendario de la Liga**

---

### **Perfil del jugador**

---

### **Pantalla de misión**

---

### **Pantalla de recompensa**

---

### **Álbum de cromos**

---

### **Tienda de equipaciones**

---

## **Entregables**

30 wireframes.

---

# **SUBFASE 1.10**

# **DOCUMENTACIÓN DE ESTILO**

---

## **Crear**

### **Visual Bible v1.0**

Contendrá:

* Proporciones.  
* Formas.  
* Color.  
* Iluminación.  
* Materiales.  
* Personajes.  
* Escenarios.  
* UI.  
* VFX.  
* Iconografía.

---

## **Entregables**

Documento de 40-60 páginas.

---

# **CALENDARIO**

| Subfase | Días |
| ----- | ----- |
| 1.1 Auditoría | 2 |
| 1.2 Benchmarking | 3 |
| 1.3 Estilo visual | 2 |
| 1.4 Color | 2 |
| 1.5 Exploración | 4 |
| 1.6 Personajes | 4 |
| 1.7 Escenarios | 4 |
| 1.8 Matemáticas visuales | 2 |
| 1.9 UI | 3 |
| 1.10 Documentación | 3 |

**Duración total estimada: 18-20 días laborables.**

---

# **CHECKLIST FINAL DE APROBACIÓN**

## **Identidad visual**

* El estilo general es reconocible.  
* La estética resulta atractiva para 8-15 años.  
* La mezcla fútbol \+ fantasía \+ matemáticas funciona.

---

## **Personajes**

* Todos tienen siluetas reconocibles.  
* Se distinguen en menos de dos segundos.  
* Las expresiones son claras.  
* Existe suficiente carisma.

---

## **Escenarios**

* Cada estadio tiene una identidad propia.  
* La iluminación comunica emociones.  
* Existen hitos visuales memorables.

---

## **Color**

* La paleta es coherente.  
* Hay contraste suficiente.  
* Los elementos interactivos destacan.

---

## **Matemáticas**

* No parecen ejercicios escolares.  
* Están integradas en el mundo.  
* El jugador percibe que está jugando y no estudiando.

---

## **UI**

* La navegación es intuitiva.  
* Puede usarse sin texto extenso.  
* Funciona perfectamente en tablet.

---

## **Producción**

* El equipo comparte la misma dirección artística.  
* Existe una Visual Bible completa.  
* Se dispone de referencias suficientes.  
* Los concept arts permiten pasar a modelado 3D.

---

# **DECISIÓN DE GATE**

### **□ APROBADO PARA PASO 2**

**Concept Art y Diseño Definitivo de Personajes y Escenarios**

### **□ REQUIERE ITERACIÓN**

**Revisar subfases pendientes antes de comenzar producción.**

Este "Gate 1" es probablemente el más importante de todo el proyecto, porque determina el aspecto que tendrá *La Liga Eterna* durante toda su vida útil.

