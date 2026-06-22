# Formato de un puzle (la "viga maestra")

> Este documento fija **cómo se describe cualquier puzle** en un archivo JSON. El motor del juego (`engine.js`) solo sabe leer este formato: si una ficha está bien escrita, el motor la juega sin tocar el código. Crear contenido nuevo será **rellenar fichas como esta**, no programar.

---

## 1. La idea en una frase

Un puzle es un **archivo de texto (JSON)** que describe un reto: qué se pregunta, con qué datos, cuál es la respuesta correcta y qué pistas dar. El motor lee esa ficha y la convierte en una jugada. El mismo motor sirve para 6, 8 y 9 años: solo cambia la ficha.

---

## 2. Anatomía de un puzle (los campos)

Estos son los campos de una ficha. Los que llevan ⭐ son los que el plan técnico marcó como imprescindibles (sección 1.3).

| Campo | Qué es | Ejemplo |
|---|---|---|
| `id` | Nombre único del puzle. Convención: `edad-concepto-fase-número`. | `"8-descomposicion-3-001"` |
| `version` | Versión del **formato** (no del puzle). Empieza en 1; sube solo si cambiamos las reglas de este documento. | `1` |
| `tipo` ⭐ | El **tipo de reto**. Le dice al motor *cómo se juega* y cómo leer `datos` y `respuesta`. | `"opcion_multiple"` |
| `concepto` | El contenido matemático, para que la progresión agrupe puzles ("dame otro de descomposición"). | `"descomposicion"` |
| `fase_cpa` ⭐ | La fase de aprendizaje: **1 = concreta** (objetos), **2 = pictórica** (dibujos), **3 = abstracta** (solo números). | `3` |
| `edad` | Grupo al que va dirigido. | `"8-anios"` |
| `estrategia` ⭐ | La **estrategia que se premia**: no la respuesta, sino el "buen camino" que queremos reforzar. La usa el sistema de recompensas (insignias). | `"completar_diez"` |
| `enunciado` ⭐ | Lo que se le dice al niño. `texto` (lo que se lee en pantalla) y `voz` (lo que dice el entrenador, opcional). | ver ejemplos |
| `datos` ⭐ | Los **datos manipulables** del reto. Su forma **depende del `tipo`**. | ver ejemplos |
| `respuesta` ⭐ | Cómo se **valida** la respuesta. Su forma también **depende del `tipo`**. | ver ejemplos |
| `pistas` ⭐ | Lista de **3 ayudas crecientes** (ver sección 4). | ver ejemplos |
| `nota` | Comentario humano para quien diseña el puzle. **El motor lo ignora.** Sirve para "comentar" la ficha. | `"Suma 8+5 cruzando la decena."` |

---

## 3. Por qué `tipo` es la clave de todo

El motor no tiene un "if" por cada reto posible. En su lugar, conoce un **puñado de tipos de interacción**, y cada `tipo` define qué forma tienen `datos` y `respuesta`. Así, añadir variedad = añadir fichas, no reescribir el motor.

- En la Fase 1 usamos **un** tipo: `opcion_multiple` (el niño toca una de varias opciones). Los tres primeros ejemplos lo usan.
- En T2.2 se añadió un segundo tipo, `recta_numerica` (señalar un punto en una recta), **sin tocar nada del código de `opcion_multiple`**: esto confirma que el motor reparte el trabajo por `tipo` tal y como se diseñó.
- Quedan pendientes de añadir cuando hagan falta: `entrada_numerica` (escribir el número), `agrupar` (juntar objetos en grupos).
- **Regla de oro:** si un `tipo` nuevo no cabe en este esquema sin forzarlo, no lo parcheamos: revisamos el formato. Ese es justo el riesgo nº 1 del plan.

### Forma de `datos` y `respuesta` para `tipo: "opcion_multiple"`

- `datos.representacion`: cómo se muestra el reto según la fase CPA — `"objetos"`, `"marco_diez"` o `"numerica"`.
- `datos.operacion`: la cuenta en sí (`expresion` para mostrar, `sumandos` para el motor).
- `datos` puede llevar campos extra de apoyo visual (p. ej. `marco_diez` con cuántas casillas hay llenas).
- `respuesta.opciones`: lista de opciones, cada una con `id` y `texto`.
- `respuesta.correcta`: el `id` de la opción correcta.

### Forma de `datos` y `respuesta` para `tipo: "recta_numerica"`

- `datos.recta`: `{ desde, hasta, paso }` — define los puntos que se pueden tocar (de `desde` a `hasta`, cada `paso`).
- `respuesta.valor_correcto`: el número que hay que señalar.

Ejemplo: [`data/puzzles/8-anios/recta-numerica-fase2-pictorica.json`](../data/puzzles/8-anios/recta-numerica-fase2-pictorica.json).

### Apoyo visual de la fase pictórica/concreta: `datos.visual` (opcional, cualquier tipo)

Para que la fase **pictórica** muestre el dibujo de verdad (y no solo lo describa con palabras), un
puzle puede incluir `datos.visual`. El motor lo dibuja encima de la respuesta. Es opcional: sin él, no
se dibuja nada. Formas soportadas:

- **Marco de diez:** `"visual": { "tipo": "marco_diez", "llenas": 8, "sueltos": 5 }` → un marco de 10
  casillas con 8 marcadas y, al lado, 5 puntos sueltos. Para completar la decena y descomponer.
- **Grupos de objetos:** `"visual": { "tipo": "grupos", "grupos": [7, 7], "icono": "⚽" }` → una fila
  por grupo (aquí, dos filas de 7 balones). Para dobles, subitización de patrones, sumar dos grupos, etc.

### Forma de `datos` y `respuesta` para `tipo: "verdadero_falso"` (juego "Relámpago")

- `datos`: vacío (la afirmación va en `enunciado.texto`, p. ej. "¿es verdad que 6 + 6 = 12?").
- `respuesta.correcta`: **`true` o `false`** (booleano). El niño pulsa "✅ Verdadero" o "❌ Falso".

### Forma de `datos` y `respuesta` para `tipo: "ordenar"` (juego "Alineación")

- `datos.numeros`: lista de números **distintos**, en el orden desordenado en que se muestran.
- `respuesta.orden`: la misma lista **ordenada** (de menor a mayor). El niño toca los números en ese
  orden; un toque fuera de orden cuenta como fallo y se resuelve al colocarlos todos.

---

## 4. Las pistas (3 niveles, andamiaje)

Cada puzle trae **3 pistas crecientes**. Nunca dan la respuesta de golpe; acompañan (esto es la tarea T2.1):

1. **Visual** (`tipo: "visual"`) — dirige la mirada. Ej.: "Mira el marco de diez, ¿cuántos huecos quedan?".
2. **Procedimiento** (`tipo: "procedimiento"`) — sugiere el paso. Ej.: "Quita 2 al grupo de 5 para completar la decena".
3. **Guiada** (`tipo: "guiada"`) — casi resuelve, pero deja el último paso al niño. Ej.: "8 + 2 = 10, y 10 + 3 = … ¿cuánto es?".

Cada pista puede llevar `accion_visual`: una pista opcional para la capa visual (`ui.js`), p. ej. `"resaltar_huecos_marco"`. Si el motor o la interfaz aún no saben hacerla, la ignoran sin romperse.

---

## 5. Cómo se añade un puzle nuevo

1. Copia una ficha de ejemplo de la misma fase.
2. Cambia `id`, `enunciado`, los números de `datos`, las `opciones` y la `correcta`.
3. Reescribe las 3 `pistas` para esos números.
4. Guárdala en la carpeta de su edad (`/data/puzzles/8-anios/`, etc.).

No hace falta tocar ningún archivo `.js`.

---

## 6. Los ejemplos incluidos

Tres fichas del **mismo** reto matemático — sumar **8 + 5 completando la decena** — en las tres fases CPA, para enseñar que cambiar de fase es **cambiar la representación, no el motor**:

- [`data/puzzles/8-anios/descomposicion-fase1-concreta.json`](../data/puzzles/8-anios/descomposicion-fase1-concreta.json) — con balones que se cuentan.
- [`data/puzzles/8-anios/descomposicion-fase2-pictorica.json`](../data/puzzles/8-anios/descomposicion-fase2-pictorica.json) — con un marco de diez dibujado.
- [`data/puzzles/8-anios/descomposicion-fase3-abstracta.json`](../data/puzzles/8-anios/descomposicion-fase3-abstracta.json) — solo con números.

---

## 7. Decisión tomada: 3 fases CPA

El plan técnico mencionaba "fase CPA 1-4", pero hemos fijado el método CPA estándar de **3 fases**: `fase_cpa` solo toma los valores **1 (Concreta)**, **2 (Pictórica)** y **3 (Abstracta)**. Si en el futuro hiciera falta un 4º nivel, se podría añadir sin romper las fichas existentes.

---

*Documento de referencia. Si el formato cambia, sube `version` y anótalo aquí.*
