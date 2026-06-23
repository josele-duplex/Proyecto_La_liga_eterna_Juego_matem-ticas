# Tanda extra de ejercicios para los TRES modos (más variedad, que no se acaben).
# IDs/ficheros en rango 020+ para no chocar con lo existente. Reconstruye los 3 indices
# escaneando la carpeta (existentes + nuevos), sin pisar fichas hechas a mano.
import json, os, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles")


def mc(idp, concepto, fase, edad, estrategia, texto, voz, correcta, distractores, hints, nota, visual=None):
    vals = [correcta] + [d for d in distractores if d != correcta]
    vistos = []
    for v in vals:
        if v not in vistos:
            vistos.append(v)
    vals = vistos[:4]
    if correcta not in vals:
        vals[-1] = correcta
    try:
        vals = sorted(vals, key=lambda x: float(x))
    except (TypeError, ValueError):
        pass
    letras = ["a", "b", "c", "d"]
    opciones, cid = [], None
    for i, v in enumerate(vals):
        opciones.append({"id": letras[i], "texto": str(v)})
        if v == correcta:
            cid = letras[i]
    return {"id": idp, "version": 1, "tipo": "opcion_multiple", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": texto, "voz": voz},
            "datos": ({"visual": visual} if visual else {}),
            "respuesta": {"opciones": opciones, "correcta": cid},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}],
            "nota": nota}


def recta(idp, concepto, fase, edad, estrategia, texto, voz, desde, hasta, paso, valor, hints, nota):
    return {"id": idp, "version": 1, "tipo": "recta_numerica", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": texto, "voz": voz},
            "datos": {"recta": {"desde": desde, "hasta": hasta, "paso": paso}},
            "respuesta": {"valor_correcto": valor},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}],
            "nota": nota}


def vf(idp, concepto, fase, edad, estrategia, texto, voz, ok, hints, nota):
    return {"id": idp, "version": 1, "tipo": "verdadero_falso", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": texto, "voz": voz}, "datos": {},
            "respuesta": {"correcta": ok},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}],
            "nota": nota}


def orden(idp, concepto, fase, edad, estrategia, nums, hints, nota):
    return {"id": idp, "version": 1, "tipo": "ordenar", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": "Coloca la alineación de menor a mayor. Toca los números en orden, del más pequeño al más grande.",
                          "voz": "De menor a mayor."},
            "datos": {"numeros": nums}, "respuesta": {"orden": sorted(nums)},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}],
            "nota": nota}


def near(v, ds):
    return [v + d for d in ds]


F = []  # (edad, ficha)
NOTA = "Tanda extra de ejercicios (mas variedad)."


def add(edad, ficha):
    F.append((edad, ficha))


# ============================================================ 6 ANIOS (Promesas)
E = "6-anios"
# subitizacion
for i, (n, emo) in enumerate([(3, "⚽⚽⚽"), (6, "⚽⚽⚽⚽⚽⚽"), (7, "⚽⚽⚽⚽⚽⚽⚽")], start=20):
    add(E, mc(f"6-subitizacion-1-{i:03d}", "subitizacion", 1, E, "reconocer_patron",
        f"{emo} ¿Cuántos balones hay? Intenta verlo de un vistazo.", "Mira el grupo entero.",
        n, near(n, [-1, 1, 2]),
        ["No los señales uno a uno: míralos todos a la vez.",
         "Compáralo con los dedos de una mano.", f"Son {n}."], NOTA))
# comparar (qué número es mayor / menor)
pares = [(7, 3, True), (4, 9, True), (8, 5, False), (2, 6, False)]
for i, (a, b, mayor) in enumerate(pares, start=20):
    r = max(a, b) if mayor else min(a, b)
    palabra = "mayor" if mayor else "menor"
    add(E, mc(f"6-comparar-3-{i:03d}", "comparar", 3, E, "comparar_cantidades",
        f"¿Qué número es {palabra}: {a} o {b}?", f"{a} o {b}, el {palabra}.",
        r, [a if r != a else b],
        [f"Imagina {a} y {b} en la recta de números.",
         f"El {palabra} está más a la {'derecha' if mayor else 'izquierda'}.",
         f"Entre {a} y {b}, el {palabra} es {r}."], NOTA))
# completar_diez
for i, n in enumerate([3, 6, 8, 1, 4], start=20):
    r = 10 - n
    add(E, mc(f"6-completar_diez-1-{i:03d}", "completar_diez", 1, E, "completar_diez",
        f"Tienes {n} balones en la caja. ¿Cuántos faltan para tener 10?", f"{n} para llegar a 10.",
        r, near(r, [-1, 1, 2]),
        [f"Cuenta los huecos vacíos hasta 10.", f"De {n} a 10.", f"{n} + {r} = 10."], NOTA,
        visual={"tipo": "marco_diez", "llenas": n, "sueltos": 0}))
# sumar_hasta_diez
for i, (a, b) in enumerate([(3, 4), (5, 2), (6, 3), (4, 4), (2, 7)], start=20):
    r = a + b
    add(E, mc(f"6-sumar_hasta_diez-2-{i:03d}", "sumar_hasta_diez", 2, E, "sumar",
        f"{a} balones y {b} balones más. ¿Cuántos hay?", f"{a} más {b}.",
        r, near(r, [-1, 1, 2]),
        [f"Junta los dos grupos.", f"Parte de {a} y cuenta {b} más.", f"{a} + {b} = {r}."], NOTA,
        visual={"tipo": "grupos", "grupos": [a, b], "icono": "⚽"}))
# secuencia
sec = [(2, [2, 4, 6, 8], 10), (1, [5, 6, 7, 8], 9), (5, [5, 10, 15], 20), (2, [1, 3, 5, 7], 9), (10, [10, 20, 30], 40)]
for i, (paso, serie, nxt) in enumerate(sec, start=20):
    s = ", ".join(str(x) for x in serie)
    add(E, mc(f"6-secuencia-2-{i:03d}", "secuencia", 2, E, "contar_secuencia",
        f"Sigue la serie: {s}, ... ¿Qué número viene ahora?", "Sigue el patrón.",
        nxt, near(nxt, [-paso, paso, 1]),
        [f"Mira cuánto sube de un número al siguiente.", f"Va de {paso} en {paso}.",
         f"Después de {serie[-1]} viene {nxt}."], NOTA))
# relampago
rel6 = [(1, "¿Es verdad que 3 + 4 = 7?", True), (1, "¿Es verdad que 5 + 2 = 8?", False),
        (2, "¿Es verdad que 6 + 4 = 10?", True), (2, "¿Es verdad que 8 - 1 = 6?", False)]
for i, (fase, texto, ok) in enumerate(rel6, start=20):
    add(E, vf(f"6-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido",
        texto, "Rápido: ¿verdadero o falso?", ok,
        ["Cuenta con los dedos si hace falta.", "Hazlo en tu cabeza, rápido.",
         "Comprueba el resultado y decide."], NOTA))
# alineacion
for i, nums in enumerate([[5, 2, 8, 4], [9, 1, 6, 3], [7, 10, 2, 5]], start=20):
    add(E, orden(f"6-alineacion-1-{i:03d}", "alineacion", 1, E, "ordenar_numeros", nums,
        ["Busca el más pequeño de todos.", "Ve tocando del menor al mayor.",
         "Empieza por el más pequeño y sube."], NOTA))

# ============================================================ 8 ANIOS (Estrellas)
E = "8-anios"
# descomposicion (completar la decena)
for i, (a, b) in enumerate([(8, 5), (9, 6), (7, 6), (8, 7), (9, 8)], start=20):
    r = a + b
    add(E, mc(f"8-descomposicion-3-{i:03d}", "descomposicion", 3, E, "completar_diez",
        f"{a} + {b} = ? (pasa primero por el 10)", f"{a} más {b} cruzando el diez.",
        r, near(r, [-1, 1, 2]),
        [f"Completa la decena desde {a}.",
         f"De {a} a 10 hay {10 - a}; reparte el {b}.", f"{a} + {b} = {r}."], NOTA))
# dobles
for i, n in enumerate([6, 7, 8, 9, 10], start=20):
    r = 2 * n
    add(E, mc(f"8-dobles-3-{i:03d}", "dobles", 3, E, "usar_dobles",
        f"¿Cuánto es el doble de {n}? ({n} + {n})", f"El doble de {n}.",
        r, near(r, [-2, 1, 2]),
        [f"Doble es {n} y otra vez {n}.", f"{n} + {n}.", f"El doble de {n} es {r}."], NOTA))
# casi_dobles
for i, (a, b) in enumerate([(6, 7), (7, 8), (8, 9), (5, 6), (4, 5)], start=20):
    r = a + b
    add(E, mc(f"8-casi_dobles-3-{i:03d}", "casi_dobles", 3, E, "usar_casi_dobles",
        f"{a} + {b} = ? (apóyate en un doble)", f"{a} más {b}, casi un doble.",
        r, near(r, [-1, 1, 2]),
        [f"Está cerca del doble de {a}.", f"{a} + {a} = {2 * a}, y uno más.", f"{a} + {b} = {r}."], NOTA))
# recta_numerica
for i, (hasta, paso, valor) in enumerate([(20, 1, 13), (20, 1, 17), (20, 2, 14), (30, 5, 25), (20, 2, 8)], start=20):
    add(E, recta(f"8-recta-numerica-2-{i:03d}", "recta_numerica", 2, E, "usar_decenas_como_referencia",
        f"Toca el punto donde está el {valor} en la recta numérica.", f"Señala el {valor}.",
        0, hasta, paso, valor,
        [f"Localiza primero el 10 como referencia.",
         f"El {valor} está {'antes' if valor < 10 else 'después'} del 10.",
         f"Cuenta de {paso} en {paso} hasta {valor}."], NOTA))
# restar
for i, (a, b) in enumerate([(15, 7), (14, 6), (16, 9), (13, 5), (18, 9)], start=20):
    r = a - b
    add(E, mc(f"8-restar-2-{i:03d}", "restar", 2, E, "restar_estrategico",
        f"{a} - {b} = ?", f"{a} menos {b}.", r, near(r, [-1, 1, 2]),
        [f"Baja primero a 10 desde {a}.", f"Cuenta hacia atrás {b} desde {a}.", f"{a} - {b} = {r}."], NOTA))
# decenas (valor posicional)
for i, n in enumerate([34, 47, 58, 62, 76], start=20):
    d, u = n // 10, n % 10
    add(E, mc(f"8-decenas-2-{i:03d}", "decenas", 2, E, "usar_valor_posicional",
        f"En el número {n}, ¿cuántas decenas hay?", f"Las decenas de {n}.",
        d, near(d, [-1, 1, 2]) + [n],
        [f"Separa {n} en decenas y unidades.", f"{n} = {d} decenas y {u} unidades.",
         f"{n} tiene {d} decenas."], NOTA))
# relampago
rel8 = [(2, "¿Es verdad que 8 + 8 = 16?", True), (2, "¿Es verdad que 14 - 5 = 8?", False),
        (3, "¿Es verdad que 7 + 6 = 13?", True), (3, "¿Es verdad que el doble de 9 es 17?", False)]
for i, (fase, texto, ok) in enumerate(rel8, start=20):
    add(E, vf(f"8-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido",
        texto, "Rápido: ¿verdadero o falso?", ok,
        ["Hazlo mentalmente.", "Comprueba el cálculo con cuidado.", "Decide verdadero o falso."], NOTA))
# alineacion
for i, nums in enumerate([[24, 12, 35, 8], [40, 19, 27, 33], [50, 9, 28, 41, 16]], start=20):
    add(E, orden(f"8-alineacion-2-{i:03d}", "alineacion", 2, E, "ordenar_numeros", nums,
        ["Fíjate en las decenas de cada número.", "A igualdad de decenas, mira las unidades.",
         "Del más pequeño al más grande."], NOTA))

# ============================================================ 9 ANIOS (Leyendas) - mas y mas duro
E = "9-anios"
# multiplicacion (2 cifras x 1)
for i, (a, b) in enumerate([(13, 4), (15, 3), (14, 5), (16, 4), (12, 6), (17, 3)], start=20):
    r = a * b
    add(E, mc(f"9-multiplicacion-3-{i:03d}", "multiplicacion", 3, E, "multiplicar_grupos",
        f"{a} × {b} = ?", f"{a} por {b}.", r, near(r, [-b, b, 2]),
        [f"Descompón: {a} = {a // 10 * 10} + {a % 10}.",
         f"{a // 10 * 10} × {b} = {a // 10 * 10 * b} y {a % 10} × {b} = {a % 10 * b}; súmalos.",
         f"{a} × {b} = {r}."], NOTA))
# division
for i, (t, g) in enumerate([(72, 8), (48, 6), (54, 9), (40, 8), (49, 7), (64, 8)], start=20):
    r = t // g
    add(E, mc(f"9-division-3-{i:03d}", "division", 3, E, "dividir",
        f"{t} ÷ {g} = ?", f"{t} entre {g}.", r, near(r, [-1, 1, 2]),
        ["La división deshace la multiplicación.", f"¿{g} por cuánto da {t}?", f"{t} ÷ {g} = {r}."], NOTA))
# fracciones de cantidad
for i, (n, d, t) in enumerate([(2, 3, 12), (3, 4, 16), (2, 5, 15), (3, 5, 20), (5, 6, 12)], start=20):
    r = n * t // d
    add(E, mc(f"9-fracciones-3-{i:03d}", "fracciones", 3, E, "repartir_partes",
        f"¿Cuánto es {n}/{d} de {t}?", f"{n} de {d} de {t}.",
        r, near(r, [-1, 1, t // d]),
        [f"Una parte es {t} ÷ {d} = {t // d}.", f"Multiplica esa parte por {n}.", f"{t // d} × {n} = {r}."], NOTA))
# redondeo a la centena y al millar
for i, (n, r) in enumerate([(230, 200), (470, 500), (550, 600), (810, 800), (160, 200)], start=20):
    add(E, mc(f"9-redondeo-3-{i:03d}", "redondeo", 3, E, "redondear",
        f"Redondea {n} a la centena más cercana.", f"{n} a la centena.",
        r, [r - 100, r + 100, n],
        [f"{n} está entre {n // 100 * 100} y {n // 100 * 100 + 100}.",
         "Mira las decenas: 5 o más sube de centena.", f"{n} → {r}."], NOTA))
for i, (n, r) in enumerate([(3400, 3000), (2700, 3000), (4500, 5000), (1200, 1000)], start=30):
    add(E, mc(f"9-redondeo-3-{i:03d}", "redondeo", 3, E, "redondear",
        f"Redondea {n} al millar más cercano.", f"{n} al millar.",
        r, [r - 1000, r + 1000, n],
        [f"{n} está entre {n // 1000 * 1000} y {n // 1000 * 1000 + 1000}.",
         "Mira las centenas: 5 o más sube de millar.", f"{n} → {r}."], NOTA))
# suma con llevadas (3 y 4 cifras)
for i, (a, b) in enumerate([(347, 286), (568, 175), (729, 184)], start=20):
    add(E, mc(f"9-suma_llevando-3-{i:03d}", "suma_llevando", 3, E, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", a + b, near(a + b, [-10, 1, -100]),
        ["Suma por columnas: unidades, decenas, centenas.",
         "Cuando una columna pase de 9, llévate 1.", f"{a} + {b} = {a + b}."], NOTA))
for i, (a, b) in enumerate([(1234, 567), (2480, 765)], start=30):
    add(E, mc(f"9-suma_llevando-3-{i:03d}", "suma_llevando", 3, E, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", a + b, near(a + b, [-100, 10, 1]),
        ["Alinéalos por la derecha y suma columna a columna.",
         "Lleva 1 a la siguiente columna cuando pase de 9.", f"{a} + {b} = {a + b}."], NOTA))
# resta con llevadas
for i, (a, b) in enumerate([(523, 187), (640, 275), (812, 458)], start=20):
    add(E, mc(f"9-resta_llevando-3-{i:03d}", "resta_llevando", 3, E, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", a - b, near(a - b, [-10, 1, 100]),
        ["Resta por columnas pidiendo prestado si hace falta.",
         f"Desde {b}, cuenta hacia delante hasta {a}.", f"{a} - {b} = {a - b}."], NOTA))
for i, (a, b) in enumerate([(1500, 638), (2034, 879)], start=30):
    add(E, mc(f"9-resta_llevando-3-{i:03d}", "resta_llevando", 3, E, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", a - b, near(a - b, [-100, 10, 1]),
        ["Réstalo por columnas con préstamos.",
         f"O cuenta hacia delante desde {b} hasta {a}.", f"{a} - {b} = {a - b}."], NOTA))
# problemas de dos pasos
prob = [
    (20, "Un equipo gana 3 puntos por victoria. Gana 6 partidos y pierde 2 (0 puntos). ¿Cuántos puntos tiene?",
     18, [20, 16, 24], ["Solo puntúan las victorias.", "6 × 3 puntos.", "6 × 3 = 18."]),
    (21, "Compras 5 cajas de 8 cromos y repartes 12 con tus amigos. ¿Cuántos te quedan?",
     28, [40, 30, 20], ["Cuántos cromos en total: 5 × 8.", "5 × 8 = 40; quita 12.", "40 - 12 = 28."]),
    (22, "Hay 36 jugadores en 6 equipos iguales. Si juntas 2 equipos, ¿cuántos jugadores hay en ese grupo?",
     12, [6, 18, 9], ["Cuántos por equipo: 36 ÷ 6.", "36 ÷ 6 = 6; junta 2 equipos.", "6 × 2 = 12."]),
    (23, "Una entrada cuesta 7 €. Compras 4 entradas y pagas con 50 €. ¿Cuánto te devuelven?",
     22, [28, 18, 12], ["Cuánto cuestan: 4 × 7.", "4 × 7 = 28; resta de 50.", "50 - 28 = 22."]),
    (24, "En 3 cajas hay 9 balones cada una. Se pinchan 5. ¿Cuántos balones buenos quedan?",
     22, [27, 24, 18], ["Cuántos en total: 3 × 9.", "3 × 9 = 27; quita 5.", "27 - 5 = 22."]),
]
for idx, texto, r, dist, hints in prob:
    add(E, mc(f"9-problemas-3-{idx:03d}", "problemas", 3, E, "razonar_problema", texto,
        "Piénsalo en dos pasos.", r, dist, hints, NOTA))
# relampago
rel9 = [(2, "¿Es verdad que 6 × 8 = 48?", True), (2, "¿Es verdad que 56 ÷ 7 = 9?", False),
        (3, "¿Es verdad que 12 × 5 = 60?", True), (3, "¿Es verdad que 3/4 de 20 es 15?", True),
        (3, "¿Es verdad que 9 × 7 = 64?", False)]
for i, (fase, texto, ok) in enumerate(rel9, start=20):
    add(E, vf(f"9-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido",
        texto, "Rápido: ¿verdadero o falso?", ok,
        ["Apóyate en una tabla que sepas.", "Calcula con cuidado.", "Decide verdadero o falso."], NOTA))
# alineacion (numeros grandes)
for i, nums in enumerate([[1200, 990, 1050, 875], [3400, 2999, 3100, 2750], [500, 4050, 405, 4500, 450]], start=20):
    add(E, orden(f"9-alineacion-3-{i:03d}", "alineacion", 3, E, "ordenar_numeros", nums,
        ["Cuenta las cifras de cada número.", "Más cifras = más grande; si empatan, mira la primera cifra.",
         "Del más pequeño al más grande."], NOTA))

# ============================================================ ESCRIBIR + REINDEXAR
escritos = 0
for edad, ficha in F:
    concepto = ficha["concepto"].replace("_", "-")
    num = ficha["id"].split("-")[-1]
    nombre = f"{concepto}-fase{ficha['fase_cpa']}-{num}.json"
    with open(os.path.join(BASE, edad, nombre), "w", encoding="utf-8") as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)
    escritos += 1

ORDEN = {
    "6-anios": ["subitizacion", "comparar", "completar_diez", "sumar_hasta_diez", "secuencia", "relampago", "alineacion"],
    "8-anios": ["descomposicion", "dobles", "casi_dobles", "recta_numerica", "restar", "decenas", "relampago", "alineacion"],
    "9-anios": ["multiplicacion", "division", "fracciones", "redondeo", "suma_llevando", "resta_llevando", "problemas", "relampago", "alineacion"],
}
for edad, orden_c in ORDEN.items():
    carpeta = os.path.join(BASE, edad)
    entradas = []
    for ruta in glob.glob(os.path.join(carpeta, "*.json")):
        base = os.path.basename(ruta)
        if base == "indice.json":
            continue
        with open(ruta, encoding="utf-8") as f:
            p = json.load(f)
        entradas.append({"id": p["id"], "concepto": p["concepto"], "fase_cpa": p["fase_cpa"],
                         "ruta": f"data/puzzles/{edad}/{base}"})
    entradas.sort(key=lambda e: (orden_c.index(e["concepto"]) if e["concepto"] in orden_c else 99,
                                 e["fase_cpa"], e["id"]))
    with open(os.path.join(carpeta, "indice.json"), "w", encoding="utf-8") as f:
        json.dump({"edad": edad,
                   "nota": "Catalogo de puzles de esta edad (existentes + tandas ampliadas). Regenerable; manten en sync.",
                   "puzles": entradas}, f, ensure_ascii=False, indent=2)
    print(f"{edad}: {len(entradas)} puzles en el indice")

print(f"Fichas nuevas escritas: {escritos}")
