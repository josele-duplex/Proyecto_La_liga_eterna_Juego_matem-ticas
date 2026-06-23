// Genera Docs/GUIA_FAMILIAS_Liga_Eterna.docx. Requiere el paquete npm "docx" (instalar global y
// exportar NODE_PATH, o instalarlo local). Ejecutar desde cualquier carpeta:
//   node scripts/generar_guia_familias.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Header, Footer
} = require('docx');

const VERDE = '1A7A3C';
const VERDE_OSCURO = '12552A';
const AZUL = '1565C0';
const GRIS_TEXTO = '3A3A3A';
const FONDO_SUAVE = 'EAF3EC';
const FONDO_AZUL = 'E8F0FB';

const border = { style: BorderStyle.SINGLE, size: 2, color: 'D0D7D2' };
const borders = { top: border, bottom: border, left: border, right: border };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, ...(opts.spacing || {}) },
    children: [new TextRun({ text, size: 23, color: GRIS_TEXTO, ...opts.run })],
    ...opts.para
  });
}

function pBold(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80, ...(opts.spacing || {}) },
    children: [new TextRun({ text, size: 23, bold: true, color: opts.color || VERDE_OSCURO })]
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}

function bullet(text, ref = 'bullets') {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 23, color: GRIS_TEXTO })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    spacing: { after: 160 },
    children: [new TextRun({ text, size: 23, color: GRIS_TEXTO })]
  });
}

function celda(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 4680, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: 'center',
    children: [new Paragraph({
      children: [new TextRun({ text, size: 21, bold: !!opts.bold, color: opts.color || GRIS_TEXTO })]
    })]
  });
}

function tablaConceptos(filas) {
  const anchoTotal = 9360;
  const c1 = 2400, c2 = 4060, c3 = 2900;
  const cabecera = new TableRow({
    tableHeader: true,
    children: [
      celda('Idea', { width: c1, fill: VERDE, bold: true, color: 'FFFFFF' }),
      celda('Qué significa', { width: c2, fill: VERDE, bold: true, color: 'FFFFFF' }),
      celda('Ejemplo en el juego', { width: c3, fill: VERDE, bold: true, color: 'FFFFFF' })
    ]
  });
  const filasTabla = filas.map((f, i) => new TableRow({
    children: [
      celda(f[0], { width: c1, fill: i % 2 === 0 ? FONDO_SUAVE : 'FFFFFF', bold: true }),
      celda(f[1], { width: c2, fill: i % 2 === 0 ? FONDO_SUAVE : 'FFFFFF' }),
      celda(f[2], { width: c3, fill: i % 2 === 0 ? FONDO_SUAVE : 'FFFFFF' })
    ]
  }));
  return new Table({
    width: { size: anchoTotal, type: WidthType.DXA },
    columnWidths: [c1, c2, c3],
    rows: [cabecera, ...filasTabla]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 23, color: GRIS_TEXTO } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial', color: VERDE_OSCURO },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: VERDE, space: 4 } } }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, font: 'Arial', color: AZUL },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 280 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 520, hanging: 280 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'La Liga Eterna · Guía para familias', size: 16, color: '8A8A8A', italics: true })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Página ', size: 16, color: '8A8A8A' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '8A8A8A' })
          ]
        })]
      })
    },
    children: [
      // Portada
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
        new TextRun({ text: '⚽ LA LIGA ETERNA', bold: true, size: 44, color: VERDE_OSCURO })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
        new TextRun({ text: 'Los Guardianes del Juego', size: 26, italics: true, color: AZUL })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 380 }, children: [
        new TextRun({ text: 'Guía rápida para familias', size: 22, color: '6B6B6B' })
      ]}),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: VERDE, space: 8 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: VERDE, space: 8 } },
        children: [new TextRun({
          text: 'Cómo empezar a jugar, y qué hay detrás de las matemáticas que vais a ver — explicado sin tecnicismos, aunque a vosotros os las enseñaran de otra manera (o no os las enseñaran así nunca).',
          size: 22, italics: true, color: GRIS_TEXTO
        })]
      }),

      // 1. Qué es
      h1('¿Qué es La Liga Eterna?'),
      p('Es un juego educativo de fútbol pensado para que los niños practiquen matemáticas unos minutos cada día, casi sin darse cuenta de que están “estudiando”. Cada acierto avanza un partido; cada fallo da pie a una pista, nunca a la respuesta.'),
      p('Funciona en el móvil, la tablet o el ordenador. Una vez instalada, no necesita conexión a internet ni ninguna cuenta: todo el progreso se guarda en el propio dispositivo, por jugador.'),

      // 2. Cómo empezar
      h1('Cómo empezar a jugar'),
      numbered('Abre la dirección de la app que te hayan pasado. En el iPad, ábrela con Safari (es importante: con otros navegadores no se puede instalar). En Android o un ordenador, vale cualquier navegador.'),
      numbered('Toca “¡A jugar!” en la pantalla de portada. Hazlo siempre con un toque real: ese primer toque es lo que activa el sonido del juego.'),
      numbered('(Recomendado) Instálala en la pantalla de inicio para que abra como una app de verdad y funcione sin conexión. En iPad: botón de compartir → “Añadir a pantalla de inicio”. En Android: menú de Chrome → “Instalar app”.'),
      numbered('Elige quién juega. Cada niño tiene su propio progreso guardado por separado; nadie pisa el avance de otro.'),
      numbered('Elige el equipo (el nivel): 🌱 Promesas (iniciación), ⭐ Estrellas (más avanzado) o 🏆 Leyendas (se desbloquea solo cuando el juego detecta que el niño domina Estrellas). No hace falta acertar el nivel a la primera ni vigilarlo: el propio juego sube o baja la dificultad según cómo le vaya.'),
      numbered('Elige un estadio en el calendario y pulsa “Jugar partido”. Cada partido es una serie corta de preguntas (retos) seguidas; al terminarlas, se gana el partido.'),

      // 3. Tranquilidad metodológica
      h1('Si a ti te enseñaron las matemáticas de otra forma, tranquilo/a'),
      p('Es muy probable que los ejercicios del juego no se parezcan a como aprendiste tú: aquí no aparecen sumas en columna “de toda la vida”, sino dibujos, recuentos y preguntas como “¿cuánto te falta para llegar a 10?”. No es que el método antiguo estuviera mal, ni que el nuevo sea más difícil: es que ahora se enseña primero a entender los números y a moverse con soltura entre ellos, y el cálculo en columna (si hace falta) llega después, ya con esa base.'),
      p('No necesitas saber explicar la teoría para acompañar a tu hijo o hija. El juego ya lo explica con pistas graduadas y nunca exige un único camino: si tu peque prefiere contar con los dedos o usar el método que tú le enseñes, y llega al resultado correcto, es igual de válido.'),

      // 4. Ideas matemáticas
      h1('Las ideas matemáticas que vais a ver'),
      p('Un resumen de los conceptos más habituales en el juego, explicados con ejemplos sencillos. No hace falta leerlos todos de golpe: sirven como referencia para cuando tu hijo o hija te pregunte “¿por qué lo hace así?”.'),
      tablaConceptos([
        [
          'Completar la decena (descomposición)',
          'Para sumar pasando del 10 (como 9 + 4), en vez de contar uno a uno, se “presta” un trocito de un número al otro hasta llegar a 10, que es mucho más fácil de manejar.',
          '9 + 4: le quito 1 al 4 para que el 9 llegue a 10. Quedan 10 + 3 = 13. Es más rápido que contar 9, 10, 11, 12, 13 uno a uno.'
        ],
        [
          'Dobles y casi-dobles',
          'Aprenderse unos pocos “dobles” (7+7, 8+8…) de memoria y usarlos como atajo para sumas parecidas, en vez de calcular cada suma desde cero.',
          '7 + 7 = 14 (doble). Entonces 7 + 8 es ese doble más 1: 14 + 1 = 15. El doble ya aprendido ahorra trabajo.'
        ],
        [
          'Reconocer cantidades a simple vista (subitización)',
          'Saber cuántos objetos hay sin contarlos uno por uno, por el patrón que forman (como los puntos de un dado). Es la base de “tener sentido de los números”.',
          'El juego muestra un grupo de balones y el niño dice cuántos hay de un vistazo, antes de aprender a sumarlos o restarlos.'
        ],
        [
          'La recta numérica',
          'Pensar los números como puntos en una línea ordenada ayuda a entender cuál es “más grande”, cuánto falta entre dos números, y a sumar o restar como si fueran saltos hacia delante o atrás.',
          'Para resolver 8 + 3, el niño “salta” desde el 8 tres pasos hacia delante en la recta hasta llegar al 11, en vez de memorizar el resultado sin más.'
        ],
        [
          'Decenas y unidades (valor posicional)',
          'Entender que en un número como 47, el 4 no vale “4”, vale 4 decenas (40). Es la base para que, más adelante, las cuentas en columna tengan sentido y no sean solo pasos memorizados.',
          'El juego separa visualmente un número en “paquetes de 10” y sueltos, para que se vea de un vistazo cuántas decenas y unidades tiene.'
        ]
      ]),

      // 5. Cómo acompañar
      h1('Cómo acompañar (sin hacerlo por él o ella)'),
      bullet('No le digas la respuesta directa. Si se atasca, anímale a usar las pistas del propio juego: son tres, cada vez un poco más clara, y ninguna da el resultado final.'),
      bullet('Si falla, no pasa nada: el juego lo marca en naranja, no en rojo, a propósito, para no generar ansiedad por el error. Tú tampoco necesitas reaccionar como si fuera grave.'),
      bullet('No hace falta que vigiles el nivel: el juego sube la dificultad si le resulta fácil y la baja si le cuesta, de forma automática.'),
      bullet('Elogia el cómo, no solo si acierta: “qué bien que lo has vuelto a intentar” vale más que “qué listo eres”. El juego ya hace esto mismo con sus propios mensajes.'),
      bullet('Mejor unos minutos cada día que una sesión larga de vez en cuando: el juego está pensado para practicar poco y a menudo.'),
      bullet('Si tu hijo o hija quiere resolverlo “a su manera” (con los dedos, dibujando, o con el método que le enseñaste tú), déjale: cualquier camino que llegue al resultado correcto es válido. Cuantas más formas de pensar un mismo problema conozca, mejor.'),

      // 6. FAQ
      h1('Preguntas frecuentes'),
      pBold('¿Tengo que entender estos métodos para ayudar a mi hijo o hija?'),
      p('No. El juego explica cada paso con sus propias pistas. Esta guía es solo para que, si te lo preguntan, tengas una idea de por dónde va y no te pille de nuevas.'),
      pBold('¿Y si yo le enseño un método distinto al del juego?'),
      p('Perfecto. Cuantas más estrategias conozca, más flexible será con los números. Lo importante es que entienda lo que hace, no que memorice un único camino.'),
      pBold('¿Cuánto tiempo debería jugar al día?'),
      p('Con 10-15 minutos diarios es suficiente para notar progreso; es más eficaz que una sesión larga una vez a la semana.'),
      pBold('¿Funciona sin conexión a internet?'),
      p('Sí, una vez instalada la primera vez. El progreso se guarda en el propio dispositivo.'),
      pBold('¿Qué pasa si juegan varios hermanos en el mismo dispositivo?'),
      p('Cada uno elige su nombre al entrar y el juego guarda el progreso de cada niño por separado, sin mezclarlos.')
    ]
  }]
});

const rutaSalida = path.join(__dirname, '..', 'Docs', 'GUIA_FAMILIAS_Liga_Eterna.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(rutaSalida, buffer);
  console.log('Generado:', rutaSalida);
});
