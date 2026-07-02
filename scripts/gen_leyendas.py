# Generador del banco DURO para el modo Leyendas (9 años).
# Pepe encontraba Estrellas demasiado fácil: esto da un salto real de dificultad
# (tablas de multiplicar, división, fracciones de una cantidad, redondeo a la centena,
# sumas/restas con llevadas de números grandes y problemas de DOS pasos).
# No toca las fichas existentes; reconstruye 9-anios/indice.json escaneando la carpeta.
import json, os, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles")
EDAD = "9-anios"


def mc(idp, concepto, fase, estrategia, texto, voz, correcta, distractores, hints, nota, visual=None):
    opciones_val = [correcta] + [d for d in distractores if d != correcta]
    vistos = []
    for v in opciones_val:
        if v not in vistos:
            vistos.append(v)
    opciones_val = vistos[:4]
    if correcta not in opciones_val:
        opciones_val[-1] = correcta
    try:
        opciones_val = sorted(opciones_val, key=lambda x: float(x))
    except (TypeError, ValueError):
        pass
    letras = ["a", "b", "c", "d"]
    opciones, correcta_id = [], None
    for i, val in enumerate(opciones_val):
        opciones.append({"id": letras[i], "texto": str(val)})
        if val == correcta:
            correcta_id = letras[i]
    return {
        "id": idp, "version": 1, "tipo": "opcion_multiple", "concepto": concepto,
        "fase_cpa": fase, "edad": EDAD, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz},
        "datos": ({"visual": visual} if visual else {}),
        "respuesta": {"opciones": opciones, "correcta": correcta_id},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }


def vf(idp, concepto, fase, estrategia, texto, voz, correcta_bool, hints, nota):
    return {
        "id": idp, "version": 1, "tipo": "verdadero_falso", "concepto": concepto,
        "fase_cpa": fase, "edad": EDAD, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz}, "datos": {},
        "respuesta": {"correcta": correcta_bool},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }


def ordenar(idp, concepto, fase, estrategia, texto, voz, numeros, hints, nota):
    return {
        "id": idp, "version": 1, "tipo": "ordenar", "concepto": concepto,
        "fase_cpa": fase, "edad": EDAD, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz},
        "datos": {"numeros": numeros},
        "respuesta": {"orden": sorted(numeros)},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }


fichas = []
N = "Banco Leyendas (dificultad alta para 9 años)."

# ------------------------------------------------------------------ MULTIPLICACION
# fase1: grupos concretos (visual de filas)
for i, (a, b) in enumerate([(3, 4), (4, 5), (2, 7), (3, 6)], start=2):
    p = a * b
    fichas.append(mc(f"9-multiplicacion-1-{i:03d}", "multiplicacion", 1, "multiplicar_grupos",
        f"{a} equipos con {b} jugadores cada uno. ¿Cuántos jugadores hay en total?",
        f"{a} grupos de {b}.", p, [p - b, p + b, p + 1],
        [f"Son {a} filas de {b}.", f"Suma {b} un total de {a} veces.",
         f"{b} × {a} = {p}."], N, visual={"tipo": "grupos", "grupos": [b] * a, "icono": "⚽"}))
# fase2: array pictórico
for i, (a, b) in enumerate([(4, 6), (5, 4), (3, 8)], start=2):
    p = a * b
    fichas.append(mc(f"9-multiplicacion-2-{i:03d}", "multiplicacion", 2, "multiplicar_grupos",
        f"Una caja tiene {a} filas de {b} balones. ¿Cuántos balones hay?",
        f"{a} filas de {b}.", p, [p - b, p + b, p - 2],
        [f"Cuenta una fila ({b}) y mira cuántas filas hay ({a}).",
         f"Es {b} repetido {a} veces.", f"{a} × {b} = {p}."], N,
        visual={"tipo": "grupos", "grupos": [b] * a, "icono": "⚽"}))
# fase3: tablas (símbolos), incluida 2 cifras × 1 cifra
for i, (a, b) in enumerate([(7, 8), (6, 9), (9, 9), (6, 7), (8, 6), (4, 12), (6, 11)], start=2):
    p = a * b
    fichas.append(mc(f"9-multiplicacion-3-{i:03d}", "multiplicacion", 3, "multiplicar_grupos",
        f"{a} × {b} = ?", f"{a} por {b}.", p, [p - a, p + a, p - b],
        [f"{a} × {b} son {a} grupos de {b}.",
         f"Apóyate en una tabla que sepas (p. ej. {a} × 10 = {a*10}) y ajusta.",
         f"{a} × {b} = {p}."], N))

# ------------------------------------------------------------------ DIVISION
for i, (tot, gr) in enumerate([(12, 3), (15, 5), (10, 2), (16, 4)], start=1):
    r = tot // gr
    fichas.append(mc(f"9-division-1-{i:03d}", "division", 1, "dividir",
        f"Reparte {tot} balones en {gr} cajas iguales. ¿Cuántos balones van en cada caja?",
        f"{tot} entre {gr}.", r, [r - 1, r + 1, r + 2],
        [f"Reparte {tot} en {gr} montones iguales, uno a uno.",
         f"Busca el número que, {gr} veces, da {tot}.",
         f"{gr} × {r} = {tot}, así que {tot} ÷ {gr} = {r}."], N))
for i, (tot, gr) in enumerate([(20, 4), (18, 3), (24, 4)], start=1):
    r = tot // gr
    fichas.append(mc(f"9-division-2-{i:03d}", "division", 2, "dividir",
        f"{tot} jugadores se colocan en {gr} filas iguales. ¿Cuántos jugadores hay en cada fila?",
        f"{tot} en {gr} filas.", r, [r - 1, r + 1, r + 2],
        [f"Divide {tot} en {gr} partes iguales.",
         f"¿Qué número multiplicado por {gr} da {tot}?",
         f"{tot} ÷ {gr} = {r}."], N))
for i, (tot, gr) in enumerate([(24, 4), (36, 6), (42, 7), (45, 5), (56, 8), (63, 9)], start=1):
    r = tot // gr
    fichas.append(mc(f"9-division-3-{i:03d}", "division", 3, "dividir",
        f"{tot} ÷ {gr} = ?", f"{tot} entre {gr}.", r, [r - 1, r + 1, r + 2],
        [f"La división es lo contrario de multiplicar.",
         f"¿{gr} por cuánto es {tot}?", f"{gr} × {r} = {tot}, luego {tot} ÷ {gr} = {r}."], N))

# ------------------------------------------------------------------ FRACCIONES (de una cantidad)
for i, (num, den, tot) in enumerate([(1, 2, 6), (1, 2, 10), (1, 3, 6), (1, 4, 8)], start=2):
    r = num * tot // den
    fichas.append(mc(f"9-fracciones-1-{i:03d}", "fracciones", 1, "repartir_partes",
        f"¿Cuánto es {num}/{den} de {tot} balones?", f"{num} de {den} partes de {tot}.",
        r, [r - 1, r + 1, tot - r],
        [f"Reparte {tot} en {den} partes iguales.",
         f"Cada parte vale {tot // den}; coge {num}.",
         f"{num}/{den} de {tot} = {r}."], N, visual={"tipo": "grupos", "grupos": [tot], "icono": "⚽"}))
for i, (num, den, tot) in enumerate([(1, 3, 9), (1, 4, 12), (3, 4, 8), (2, 3, 6)], start=2):
    r = num * tot // den
    fichas.append(mc(f"9-fracciones-2-{i:03d}", "fracciones", 2, "repartir_partes",
        f"¿Cuánto es {num}/{den} de {tot}?", f"{num} tercios... de {tot}." if den == 3 else f"{num} de {den} de {tot}.",
        r, [r - 1, r + 1, tot - r],
        [f"Primero {tot} ÷ {den} = {tot // den} (una parte).",
         f"Ahora coge {num} de esas partes.",
         f"{tot // den} × {num} = {r}."], N))
for i, (num, den, tot) in enumerate([(2, 3, 9), (3, 4, 12), (1, 5, 20), (2, 5, 10), (3, 5, 15)], start=2):
    r = num * tot // den
    fichas.append(mc(f"9-fracciones-3-{i:03d}", "fracciones", 3, "repartir_partes",
        f"¿Cuánto es {num}/{den} de {tot}?", f"{num} de {den} de {tot}.",
        r, [r - 1, r + 1, num + den],
        [f"Una parte es {tot} ÷ {den} = {tot // den}.",
         f"Multiplica esa parte por {num}.",
         f"{tot // den} × {num} = {r}."], N))

# ------------------------------------------------------------------ REDONDEO (decena y centena)
for i, (n, r) in enumerate([(34, 30), (78, 80), (61, 60), (85, 90)], start=2):
    fichas.append(mc(f"9-redondeo-1-{i:03d}", "redondeo", 1, "redondear",
        f"Redondea {n} a la decena más cercana.", f"{n} a la decena.",
        r, [r - 10, r + 10, n],
        [f"{n} está entre {n // 10 * 10} y {n // 10 * 10 + 10}.",
         "Mira la unidad: si es 5 o más, sube; si no, baja.",
         f"{n} se redondea a {r}."], N))
for i, (n, r) in enumerate([(47, 50), (23, 20), (55, 60)], start=2):
    fichas.append(mc(f"9-redondeo-2-{i:03d}", "redondeo", 2, "redondear",
        f"Redondea {n} a la decena más cercana.", f"{n} a la decena.",
        r, [r - 10, r + 10, n],
        [f"{n} está entre {n // 10 * 10} y {n // 10 * 10 + 10}.",
         "La unidad manda: 5 o más sube, menos de 5 baja.",
         f"{n} → {r}."], N))
# start=11 para que estos ids (centena) NO choquen con redondeo-fase3-abstracta.json, que es el
# 9-redondeo-3-001 hecho a mano.
for i, (n, r) in enumerate([(340, 300), (470, 500), (650, 700), (180, 200), (120, 100)], start=11):
    fichas.append(mc(f"9-redondeo-3-{i:03d}", "redondeo", 3, "redondear",
        f"Redondea {n} a la centena más cercana.", f"{n} a la centena.",
        r, [r - 100, r + 100, n],
        [f"{n} está entre {n // 100 * 100} y {n // 100 * 100 + 100}.",
         "Mira la cifra de las decenas: 5 o más sube de centena.",
         f"{n} se redondea a {r}."], N))

# ------------------------------------------------------------------ SUMA con llevadas
for i, (a, b) in enumerate([(28, 5), (47, 6), (39, 4)], start=1):
    s = a + b
    fichas.append(mc(f"9-suma_llevando-1-{i:03d}", "suma_llevando", 1, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", s, [s - 1, s + 1, s - 10],
        [f"Completa primero la decena desde {a}.",
         f"De {a} a {a // 10 * 10 + 10} hay {a // 10 * 10 + 10 - a}; reparte el {b}.",
         f"{a} + {b} = {s}."], N))
for i, (a, b) in enumerate([(47, 38), (56, 27), (65, 19)], start=1):
    s = a + b
    fichas.append(mc(f"9-suma_llevando-2-{i:03d}", "suma_llevando", 2, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", s, [s - 10, s + 10, s - 1],
        ["Suma primero las decenas y luego las unidades.",
         f"{a // 10 * 10} + {b // 10 * 10} = {a // 10 * 10 + b // 10 * 10}; añade {a % 10} + {b % 10}.",
         f"{a} + {b} = {s}."], N))
for i, (a, b) in enumerate([(129, 45), (234, 158), (276, 47), (188, 96)], start=1):
    s = a + b
    fichas.append(mc(f"9-suma_llevando-3-{i:03d}", "suma_llevando", 3, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", s, [s - 10, s + 1, s - 100],
        ["Suma por partes: centenas, decenas y unidades.",
         "Cuando una columna pase de 9, te llevas 1 a la siguiente.",
         f"{a} + {b} = {s}."], N))

# ------------------------------------------------------------------ RESTA con llevadas
for i, (a, b) in enumerate([(32, 7), (43, 8), (51, 6)], start=1):
    s = a - b
    fichas.append(mc(f"9-resta_llevando-1-{i:03d}", "resta_llevando", 1, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", s, [s - 1, s + 1, s + 10],
        [f"Baja primero a la decena: de {a} a {a // 10 * 10}.",
         f"Quita {a % 10} y luego lo que falte de {b}.",
         f"{a} - {b} = {s}."], N))
for i, (a, b) in enumerate([(52, 27), (63, 48), (70, 34)], start=1):
    s = a - b
    fichas.append(mc(f"9-resta_llevando-2-{i:03d}", "resta_llevando", 2, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", s, [s - 10, s + 10, s + 1],
        ["Resta por partes, pidiendo prestado a la decena si hace falta.",
         f"Cuenta hacia delante desde {b} hasta {a}.",
         f"{a} - {b} = {s}."], N))
for i, (a, b) in enumerate([(100, 37), (145, 68), (234, 159), (200, 86)], start=1):
    s = a - b
    fichas.append(mc(f"9-resta_llevando-3-{i:03d}", "resta_llevando", 3, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", s, [s - 10, s + 1, s + 100],
        ["Réstalo por partes o cuenta hacia delante desde el número pequeño.",
         f"Desde {b}, ¿cuánto falta para llegar a {a}?",
         f"{a} - {b} = {s}."], N))

# ------------------------------------------------------------------ PROBLEMAS de dos pasos
problemas = [
    (1, "3 cajas con 4 balones cada una. ¿Cuántos balones hay en total?",
     "Tres cajas de cuatro.", 12, [9, 7, 16],
     ["Es una multiplicación: 3 grupos de 4.", "3 × 4.", "3 × 4 = 12."]),
    (2, "Hay 20 cromos y los repartes en 4 montones iguales. ¿Cuántos cromos hay en cada montón?",
     "Veinte entre cuatro.", 5, [4, 6, 8],
     ["Reparte 20 en 4 partes iguales.", "20 ÷ 4.", "20 ÷ 4 = 5."]),
    (3, "Cada caja tiene 6 balones. Compras 3 cajas y regalas 4 balones. ¿Cuántos te quedan?",
     "Tres cajas de seis, menos cuatro.", 14, [18, 12, 15],
     ["Primero cuántos compras: 3 × 6.", "3 × 6 = 18; ahora quita 4.", "18 - 4 = 14."]),
    (4, "Tienes 24 cromos. Repartes la mitad y luego ganas 5. ¿Cuántos tienes ahora?",
     "La mitad de veinticuatro, más cinco.", 17, [12, 19, 7],
     ["La mitad de 24 primero.", "24 ÷ 2 = 12; ahora suma 5.", "12 + 5 = 17."]),
    (5, "Un equipo marca 2 goles en cada uno de 5 partidos y encaja 3 en total. ¿Cuál es su diferencia de goles?",
     "Dos por cinco, menos tres.", 7, [10, 6, 13],
     ["Primero los goles a favor: 2 × 5.", "2 × 5 = 10; resta los 3 encajados.", "10 - 3 = 7."]),
    (6, "Compras 4 paquetes de 5 pegatinas y usas 8. ¿Cuántas pegatinas te quedan?",
     "Cuatro por cinco, menos ocho.", 12, [20, 13, 9],
     ["Cuántas pegatinas en total: 4 × 5.", "4 × 5 = 20; ahora quita 8.", "20 - 8 = 12."]),
    (7, "En el estadio hay 8 filas de 10 asientos. Se ocupan 25. ¿Cuántos asientos quedan libres?",
     "Ocho por diez, menos veinticinco.", 55, [80, 65, 45],
     ["Cuántos asientos hay: 8 × 10.", "8 × 10 = 80; resta los 25 ocupados.", "80 - 25 = 55."]),
]
for idx, texto, voz, r, dist, hints in problemas:
    fase = 1 if idx <= 2 else 3
    fichas.append(mc(f"9-problemas-{fase}-{idx:03d}", "problemas", fase, "razonar_problema",
        texto, voz, r, dist, hints, N))

# ------------------------------------------------------------------ RELAMPAGO (verdadero/falso, cálculo rápido)
relampago = [
    (1, 1, "¿Es verdad que 6 × 7 = 42?", "Seis por siete, ¿cuarenta y dos?", True,
     ["6 × 7 son 6 grupos de 7.", "Cuenta de 7 en 7 seis veces.", "6 × 7 = 42, es verdad."]),
    (1, 2, "¿Es verdad que 8 × 4 = 30?", "Ocho por cuatro, ¿treinta?", False,
     ["8 × 4 son 8 grupos de 4.", "4, 8, 12... ocho veces.", "8 × 4 = 32, no 30: es falso."]),
    (2, 3, "¿Es verdad que la mitad de 18 es 9?", "La mitad de dieciocho.", True,
     ["Reparte 18 en 2 partes iguales.", "18 ÷ 2.", "18 ÷ 2 = 9, es verdad."]),
    (2, 4, "¿Es verdad que 9 × 9 = 81?", "Nueve por nueve.", True,
     ["9 × 9, el último de la tabla del 9.", "9 × 10 = 90; quita un 9.", "90 - 9 = 81, es verdad."]),
    (3, 5, "¿Es verdad que 7 × 8 = 54?", "Siete por ocho.", False,
     ["7 × 8 está cerca de 7 × 10 = 70.", "7 × 8 = 56.", "Es 56, no 54: falso."]),
    (3, 6, "¿Es verdad que 100 - 45 = 55?", "Cien menos cuarenta y cinco.", True,
     ["De 45 a 100, ¿cuánto falta?", "45 + 55 = 100.", "100 - 45 = 55, es verdad."]),
]
for fase, i, texto, voz, ok, hints in relampago:
    fichas.append(vf(f"9-relampago-{fase}-{i:03d}", "relampago", fase, "calcular_rapido",
        texto, voz, ok, hints, N))

# ------------------------------------------------------------------ ALINEACION (ordenar números grandes)
alineacion = [
    (1, 1, [34, 12, 50, 28]),
    (1, 2, [90, 45, 18, 73]),
    (2, 3, [120, 99, 210, 150]),
    (2, 4, [305, 99, 250, 180]),
    (3, 5, [410, 140, 99, 320, 260]),
    (3, 6, [500, 350, 405, 299, 450]),
]
for fase, i, nums in alineacion:
    fichas.append(ordenar(f"9-alineacion-{fase}-{i:03d}", "alineacion", fase, "ordenar_numeros",
        "Coloca la alineación de menor a mayor. Toca los números en orden, del más pequeño al más grande.",
        "De menor a mayor.", nums,
        ["Fíjate primero en cuántas cifras tiene cada número.",
         "Más cifras = más grande; con las mismas cifras, mira la primera.",
         "Empieza por el más pequeño y ve subiendo."], N))

# ------------------------------------------------------------------ ESCRIBIR
carpeta = os.path.join(BASE, EDAD)
escritos = 0
for ficha in fichas:
    concepto = ficha["concepto"]
    fase = ficha["fase_cpa"]
    # nombre de fichero: <concepto>-fase<f>-<NNN>.json a partir del id
    num = ficha["id"].split("-")[-1]
    nombre = f"{concepto.replace('_','-')}-fase{fase}-{num}.json"
    with open(os.path.join(carpeta, nombre), "w", encoding="utf-8") as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)
    escritos += 1

# Reconstruir indice escaneando TODOS los json (existentes + nuevos)
ORDEN = ["multiplicacion", "division", "fracciones", "redondeo",
         "suma_llevando", "resta_llevando", "problemas", "relampago", "alineacion"]
entradas = []
for ruta in glob.glob(os.path.join(carpeta, "*.json")):
    base = os.path.basename(ruta)
    if base == "indice.json":
        continue
    with open(ruta, encoding="utf-8") as f:
        p = json.load(f)
    entradas.append({"id": p["id"], "concepto": p["concepto"], "fase_cpa": p["fase_cpa"],
                     "ruta": f"data/puzzles/{EDAD}/{base}", "estrategia": p.get("estrategia")})
entradas.sort(key=lambda e: (ORDEN.index(e["concepto"]) if e["concepto"] in ORDEN else 99,
                             e["fase_cpa"], e["id"]))
indice = {"edad": EDAD,
          "nota": "Catalogo de puzles de Leyendas (9). Dificultad alta. Regenerable; manten en sync al anadir puzles.",
          "puzles": entradas}
with open(os.path.join(carpeta, "indice.json"), "w", encoding="utf-8") as f:
    json.dump(indice, f, ensure_ascii=False, indent=2)

print(f"Fichas nuevas escritas: {escritos}")
print(f"9-anios: {len(entradas)} puzles en el indice")
