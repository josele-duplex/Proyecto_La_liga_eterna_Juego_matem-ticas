**Liga Eterna: Los Guardianes del Juego**

*Documento de Diseño de Juego (GDD)*

Videojuego didáctico autónomo de matemáticas para niños de 8–9 años, con modo de acceso para 6 años.

*Temática: fútbol. Versión de trabajo para producción.*

⚽

# **1\. Visión general**

Liga Eterna: Los Guardianes del Juego es un videojuego de aventura y puzles matemáticos que une dos virtudes clave: la fuerza narrativa de una temporada por estadios legendarios cuyo orden se ha roto, y la solidez didáctica de una progresión CPA (concreto–pictórico–abstracto) diseñada para desarrollar cálculo mental, flexibilidad estratégica, razonamiento numérico y resolución de problemas.

El juego está pensado para alumnado de 8–9 años con talento matemático alto, pero incluye una puerta de entrada para 6 años basada en sentido numérico, comparación de cantidades, subitización y completar 10\. La experiencia es completamente autónoma: no depende de inteligencia artificial, ni de evaluación externa, ni de conectividad permanente. Todo el aprendizaje se sostiene mediante reglas internas, pistas programadas, progresión adaptativa sin IA y retroalimentación inmediata.

El balón es el hilo conductor: cada cálculo bien resuelto mueve la jugada, repara un estadio averiado por los Fueras de Juego (criaturas del caos numérico) y acerca al jugador a levantar la copa de la Liga Eterna.

# **2\. Ficha técnica del juego**

| Campo | Definición |
| :---- | :---- |
| Título provisional | Liga Eterna: Los Guardianes del Juego |
| Género | Aventura de exploración \+ puzles matemáticos \+ RPG ligero de progreso (carrera deportiva). |
| Plataforma objetivo | Web y tablet, con prioridad iPad; adaptación a PC y móvil. Prioridad: pantalla táctil. |
| Edad principal | 8–9 años (3.º/4.º de primaria). |
| Modo secundario | Precuela autónoma (cantera/escuela de fútbol) para 6 años, con retos más visuales y guiados. |
| Público | Niños con desarrollo matemático alto, con opción de uso en aula o en casa. |
| Duración de sesión ideal | 5–12 minutos por jugada/misión; 15–20 minutos en sesiones extendidas. |
| Acceso inicial | Enlace a GitHub Pages (web app); sin instalación. Pensado para abrirse en iPad y, en menor medida, en PC. |
| Modelo | Juego premium o free-to-start con progreso local y contenidos desbloqueables. |

# **3\. Enfoque pedagógico**

En este diseño, “matemáticas avanzadas” no significa adelantar contenidos de cursos superiores de forma mecánica, sino aumentar la profundidad del pensamiento matemático. El jugador aprende a:

* descomponer números con rapidez y precisión;

* elegir entre varias estrategias de cálculo mental y justificar la más eficiente;

* trabajar dobles, casi dobles, compensación, redondeo y descomposición;

* manejar multiplicación y división como estructuras de relación, no como mera memorización;

* entender fracciones sencillas y equivalencias visuales;

* resolver problemas de lógica, series, patrones y geometría básica.

El juego combina tres capas: experiencia emocional de aventura deportiva, entrenamiento procedimental de cálculo y andamiaje conceptual para que el niño comprenda por qué funciona lo que hace.

# **4\. Mecánicas de juego (Core Gameplay)**

## **4.1 Bucle principal**

El jugador llega a un estadio del calendario de la Liga, identifica una jugada bloqueada, selecciona una misión, resuelve el puzle con herramientas matemáticas, recibe una reacción del entorno (la grada, el marcador) y desbloquea el siguiente partido.

1. Explorar el calendario de la Liga y elegir una jugada/misión.

2. Leer o escuchar el reto.

3. Manipular objetos, mover piezas, agrupar, ordenar o calcular.

4. Comprobar la solución con una acción clara dentro del juego (chutar, pasar, despejar).

5. Recibir recompensa, avance y una nueva situación matemática.

## **4.2 Sistemas principales**

| Sistema | Función |
| :---- | :---- |
| Exploración | Calendario de la Liga con estadios, vestuarios, túneles y zonas de entrenamiento matemático. |
| Puzles | Retos de cálculo, lógica, patrones, equivalencias, fracciones, operaciones y geometría. |
| Construcción | Uso de piezas, fichas, barras, líneas numéricas y paneles táctiles (pizarra de táctica). |
| Progreso RPG ligero | Niveles, cromos/insignias, energía de juego y mejoras visuales del avatar (equipación). |
| Misiones cortas | Ritmos de 5–10 minutos para favorecer práctica frecuente sin fatiga (como jugadas o minipartidos). |

## **4.3 Controles e interfaz**

La interfaz debe ser limpia, grande y táctil. El niño arrastra, suelta, gira, agrupa, selecciona y confirma. No se apoya en escritura larga para los niveles principales.

* Botones grandes con iconografía clara (balón, silbato, marcador).

* Pistas de audio opcionales (la voz del entrenador).

* Panel inferior con acciones disponibles.

* Arrastrar y soltar para bloques, piezas y números.

* Toque corto para seleccionar respuestas.

* Confirmación con un gesto o botón final (chutar a portería).

## **4.4 Recompensas y motivación**

El sistema recompensa no solo el acierto, sino la variedad estratégica. Un niño que resuelve una suma por descomposición puede ganar un cromo distinto a quien la resuelve con compensación o con salto en la recta numérica.

* Energía de juego: moneda base para desbloquear estadios y jornadas.

* Fragmentos del trofeo: piezas que reconstruyen la copa de la Liga Eterna.

* Insignias de estrategia: descomposición, compensación, patrones, geometría, fracciones.

* Colección visual: cromos de futbolistas, equipaciones y estadios restaurados.

* Progreso por dominio: se asciende de categoría al demostrar comprensión, no solo velocidad.

# **5\. Diseño instruccional y adaptatividad**

## **5.1 Curva de aprendizaje**

La dificultad crece por capas. Primero aparece la versión concreta del problema; luego una representación pictórica; después una exigencia más abstracta; y por último el reto mixto, donde el jugador debe elegir la mejor estrategia entre varias (como leer el partido y decidir la mejor jugada).

6. Fase 1: manipulación directa con apoyo visual completo.

7. Fase 2: representación con barras, puntos, líneas o tableros (pizarra táctica).

8. Fase 3: resolución mental con pocos apoyos.

9. Fase 4: elección estratégica entre varias vías de resolución.

## **5.2 Feedback pedagógico**

Cuando el jugador falla, el juego no castiga ni repite el mismo error de forma seca. Se activa una secuencia de ayuda breve: se resalta la parte problemática, se ofrece una pista visual, se recuerda una regla útil y se da otra oportunidad con un problema cercano (una segunda jugada, no una expulsión).

Cuando el jugador acierta, el juego refuerza tanto la solución como la estrategia: muestra por qué funciona, celebra la acción correcta (gol, repetición de la jugada) y registra qué tipo de razonamiento usó.

## **5.3 Evaluación invisible**

El sistema mide progreso sin exámenes visibles, igual que un cuerpo técnico observa el rendimiento sin parar el partido. Registra tiempo de respuesta, errores por tipo, estrategias elegidas, necesidad de pistas, capacidad de transferencia y consistencia en sesiones sucesivas.

* Exactitud por operación y por concepto.

* Fluidez en cálculo mental.

* Eficiencia estratégica.

* Persistencia ante error.

* Dominio de contenidos por estadio/región del calendario.

# **6\. Narrativa y estética**

## **6.1 Historia y premisa**

El mundo del fútbol ha perdido su orden interno. Los Estadios Legendarios, que sostenían las reglas del juego, se han averiado y sus engranajes matemáticos (el marcador, el reloj, la táctica) han quedado dispersos en campos alterados por los Fueras de Juego del Caos. El jugador encarna a un Guardián del Juego: un joven futbolista cuya misión consiste en restaurar marcadores, alineaciones y jugadas para que la Liga Eterna vuelva a disputarse.

Guiños al fútbol real: el calendario recorre estadios inspirados en templos del fútbol; aparecen homenajes a leyendas como una “10” que reparte asistencias imposibles, un guardameta legendario que detiene lo imposible, una delantera goleadora histórica y figuras actuales que brillan por su técnica. Todo se trata con nombres ficticios y guiños afectuosos, sin usar marcas ni identidades reales.

## **6.2 Personajes principales**

| Personaje | Rol narrativo y educativo |
| :---- | :---- |
| Avatar del jugador | Futbolista personalizable, ágil, expresivo y con evolución visual por logros (equipación y dorsal). |
| Capi (el capitán-mentor) | Mentor guía inspirado en un viejo capitán; da consejos, celebra y orienta (sustituye a “Soro”). |
| Los Fueras de Juego | Criaturas de error que deforman números, marcadores y jugadas. |
| Las Leyendas del Orden | Cracks coleccionables que enseñan un concepto matemático cada uno (guiños a jugadores míticos y actuales). |

## **6.3 Estilo visual y sonoro**

* Estética cell-shaded con contornos claros y lectura instantánea.

* Transición visual del concreto al abstracto: hierba, balones y conos reales hacia hologramas tácticos y tramas limpias.

* Paleta viva pero no saturada (verdes de césped, blancos de líneas); prioridad a contraste y claridad.

* Animaciones cortas, redondeadas y satisfactorias para cada acierto (gol, regate, parada).

* Sonidos breves de pase, chut, silbato, red y celebración.

* Música ambiental de estadio con capas dinámicas (afición de fondo) que no suban la ansiedad.

# **7\. Flujo de trabajo y mapa del juego**

## **7.1 Flujo textual del usuario**

10. Apertura de la app (enlace de GitHub).

11. Pantalla de identidad y selección de perfil (ficha de jugador).

12. Carga del nivel estimado por dominio.

13. Entrada al calendario central de la Liga.

14. Elección entre temporada principal o entrenamiento breve.

15. Desarrollo de la misión matemática (la jugada).

16. Pantalla de gol/éxito o de ayuda según resultado.

17. Recompensa, registro de progreso y vuelta al calendario.

## **7.2 Estructura de un nivel tipo**

18. Presentación del conflicto: una jugada, un saque, una tanda de penaltis o un marcador queda bloqueado por un problema matemático.

19. Lectura o escucha del reto.

20. Exploración de material de apoyo: piezas, fichas, barras, línea numérica o pizarra táctica.

21. Resolución en una o varias fases.

22. Comprobación final mediante acción física o elección (chutar, pasar, despejar).

23. Cierre narrativo con recompensa, desbloqueo y breve reflexión.

# **8\. Contenidos matemáticos por edad**

*Los contenidos matemáticos se mantienen sin cambios respecto al diseño original. Solo cambia la ambientación de los retos.*

| Edad / perfil | Contenidos | Tipo de reto |
| :---- | :---- | :---- |
| 6 años | Subitización, conteo, comparación, series simples, completar 10, sumas y restas visuales. | Drag-and-drop, clasificar, unir parejas, tap-to-select (escuela de fútbol). |
| 8 años | Descomposición, dobles, compensación, recta numérica, inicio de multiplicación y reparto. | Puzles de estrategia, elección entre caminos/jugadas, bloques y barras. |
| 9 años | Multiplicación estructural, división conceptual, patrones, fracciones base, lógica combinatoria. | Misiones con varias soluciones, tableros tácticos y retos de transferencia. |

# **9\. Sistema de progresión**

* Estadios y jornadas del calendario desbloqueados por dominio.

* Llaves de conocimiento vinculadas a conceptos.

* Colecciones de estrategias que completan un álbum de cromos matemático.

* Misiones opcionales de reto alto (partidos de élite) para alumnado con alta capacidad.

* Ramas de exploración: el jugador puede repetir un concepto con otra mecánica/jugada para demostrar transferencia.

# **10\. Cronograma de producción sugerido**

| Fase | Duración | Entregables |
| :---- | :---- | :---- |
| Preproducción | 4–6 semanas | GDD final, bible visual, mapa de la Liga, lista de contenidos, prototipo de nivel tipo, wireframes. |
| Prototipo jugable | 4–6 semanas | Movimiento del avatar, un puzle central, interfaz base, feedback de acierto/error, guardado local. |
| Producción vertical slice | 6–8 semanas | Un estadio completo, dos tipos de puzle, sistema de progresión, música y UI finalizadas. |
| Producción MVP | 8–12 semanas | Variedad de niveles, modo 6 años, tabla de progreso/clasificación, economía ligera, pulido de accesibilidad. |
| Pruebas con niños | 2–4 semanas | Observación de comprensión, ajuste de dificultad, ritmo, legibilidad y tiempo de misión. |
| Lanzamiento 1.0 | 2 semanas | Correcciones finales, balance, empaquetado web/tablet y documentación para familias y docentes. |

# **11\. Riesgos de diseño y mitigación**

| Riesgo | Mitigación |
| :---- | :---- |
| Demasiada complejidad narrativa | Mantener la primera jornada corta y legible; desbloquear historia solo tras dominar el juego. |
| Sobrecarga matemática | Usar una sola idea fuerte por jugada/misión y repetirla con variantes. |
| Fatiga visual o cognitiva | Sesiones cortas, transición suave, uso de descansos y pantalla de pausa (descanso del partido). |
| Poca rejugabilidad | Rutas alternativas, medallas de estrategia y partidos opcionales de reto alto. |
| Desigualdad entre niveles de habilidad | Rangos adaptativos y rutas de apoyo visual para 6 años (cantera). |

# **12\. Criterios de éxito**

* El niño entiende qué debe hacer sin ayuda adulta constante.

* Se observan mejoras en fluidez, estrategias y confianza matemática.

* El juego mantiene interés durante sesiones breves repetidas.

* La capa de 6 años funciona como entrada natural al sistema.

* La producción del primer estadio puede ejecutarse como vertical slice realista.

# **13\. Mejoras sencillas propuestas**

Las siguientes mejoras son fáciles de implementar y no alteran los contenidos matemáticos ni el enfoque pedagógico. Se dividen en técnicas (pensadas para iPad y, en menor medida, PC, con apertura mediante enlace de GitHub) y didáctico-pedagógicas.

## **13.1 Mejoras técnicas**

| Mejora | Por qué es sencilla y útil |
| :---- | :---- |
| PWA (web app instalable) | Al servir desde GitHub Pages, añadir un manifest y un service worker permite “Añadir a pantalla de inicio” en el iPad y funcionar sin conexión. Es configuración, no rediseño. |
| Guardado local por perfil | Usar el almacenamiento del propio navegador para que cada hijo tenga su ficha y progreso sin login ni servidor. Coherente con el carácter autónomo del juego. |
| Diseño “táctil primero” y a prueba de toques | Botones grandes, zonas de toque amplias y bloqueo del zoom accidental por doble toque en iPad. Mejora la experiencia sin tocar la lógica. |
| Orientación y escalado fijos | Bloquear o adaptar a horizontal y escalar la interfaz a la pantalla evita cortes entre iPad y PC. Es CSS y un par de ajustes. |
| Audio activado por gesto | iPad exige una interacción del usuario para reproducir sonido; un botón inicial de “¡A jugar\!” lo resuelve y evita silencios inesperados. |
| Versión visible en pantalla | Mostrar un pequeño número de versión ayuda a saber qué build están usando tras cada actualización en GitHub. |

## **13.2 Mejoras didáctico-pedagógicas**

| Mejora | Fundamento |
| :---- | :---- |
| “¿Por qué funciona?” opcional | Tras acertar, un botón breve muestra la justificación de la estrategia. Refuerza la comprensión conceptual (la C de CPA) sin frenar el ritmo. |
| Pista en tres niveles | Andamiaje graduado: primera pista visual, segunda pista de procedimiento, tercera pista guiada. Sostiene la zona de desarrollo próximo sin dar la respuesta. |
| Diario del jugador | Un resumen sencillo (jugadas resueltas, estrategias usadas, cromos ganados) que el niño puede mirar. Fomenta la metacognición de forma natural. |
| Modo cooperativo por turnos | Dos hijos en el mismo iPad resuelven jugadas alternas. Verbalizar la estrategia al otro consolida el aprendizaje (aprendizaje entre iguales). |
| Reto del día | Una jugada breve diaria mantiene la práctica frecuente y distribuida en el tiempo, más eficaz que sesiones largas y esporádicas. |
| Ficha para familias/docente | Un panel sencillo que traduzca la evaluación invisible (qué domina, qué le cuesta) en lenguaje claro, sin convertirlo en examen. |

**Fin del documento**