# Segunda tanda extra de ejercicios para los TRES modos (aún más variedad).
# IDs/ficheros en rango 040+ para no chocar con lo existente. Reconstruye los 3 indices
# escaneando la carpeta (existentes + nuevos), sin pisar fichas hechas a mano.
import json, os, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles")
NOTA = "Segunda tanda extra de ejercicios (mas variedad)."


def mc(idp, concepto, fase, edad, estrategia, texto, voz, correcta, distractores, hints, visual=None):
    vals = [correcta] + [d for d in distractores if d != correcta and d >= 0]
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
            "nota": NOTA}


def recta(idp, concepto, fase, edad, estrategia, texto, voz, desde, hasta, paso, valor, hints):
    return {"id": idp, "version": 1, "tipo": "recta_numerica", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": texto, "voz": voz},
            "datos": {"recta": {"desde": desde, "hasta": hasta, "paso": paso}},
            "respuesta": {"valor_correcto": valor},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}], "nota": NOTA}


def vf(idp, concepto, fase, edad, estrategia, texto, ok, hints):
    return {"id": idp, "version": 1, "tipo": "verdadero_falso", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": texto, "voz": "Rápido: ¿verdadero o falso?"}, "datos": {},
            "respuesta": {"correcta": ok},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}], "nota": NOTA}


def orden(idp, concepto, fase, edad, estrategia, nums, hints):
    return {"id": idp, "version": 1, "tipo": "ordenar", "concepto": concepto,
            "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
            "enunciado": {"texto": "Coloca la alineación de menor a mayor. Toca los números en orden, del más pequeño al más grande.",
                          "voz": "De menor a mayor."},
            "datos": {"numeros": nums}, "respuesta": {"orden": sorted(nums)},
            "pistas": [{"nivel": 1, "tipo": "visual", "texto": hints[0]},
                       {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
                       {"nivel": 3, "tipo": "guiada", "texto": hints[2]}], "nota": NOTA}


def near(v, ds):
    return [v + d for d in ds]


F = []
def add(edad, f): F.append((edad, f))


# ===================================================== 6 ANIOS
E = "6-anios"
for i, (n, emo) in enumerate([(2, "⚽⚽"), (4, "⚽⚽⚽⚽"), (5, "⚽⚽⚽⚽⚽"), (8, "⚽⚽⚽⚽⚽⚽⚽⚽")], start=40):
    add(E, mc(f"6-subitizacion-1-{i:03d}", "subitizacion", 1, E, "reconocer_patron",
        f"{emo} ¿Cuántos balones hay? Míralo de un vistazo.", "Mira el grupo entero.",
        n, near(n, [-1, 1, 2]),
        ["No los cuentes uno a uno.", "Compáralo con una mano (5).", f"Son {n}."]))
for i, (a, b, may) in enumerate([(9, 6, True), (3, 8, True), (10, 7, False), (5, 9, False)], start=40):
    r = max(a, b) if may else min(a, b)
    pal = "mayor" if may else "menor"
    add(E, mc(f"6-comparar-3-{i:03d}", "comparar", 3, E, "comparar_cantidades",
        f"¿Qué número es {pal}: {a} o {b}?", f"{a} o {b}.", r, [a if r != a else b],
        [f"Imagina {a} y {b} en la recta.", f"El {pal} está más a la {'derecha' if may else 'izquierda'}.",
         f"El {pal} es {r}."]))
for i, n in enumerate([2, 5, 7, 9], start=40):
    r = 10 - n
    add(E, mc(f"6-completar_diez-1-{i:03d}", "completar_diez", 1, E, "completar_diez",
        f"Tienes {n} balones. ¿Cuántos faltan para 10?", f"{n} para llegar a 10.",
        r, near(r, [-1, 1, 2]),
        ["Cuenta los huecos hasta 10.", f"De {n} a 10.", f"{n} + {r} = 10."],
        visual={"tipo": "marco_diez", "llenas": n, "sueltos": 0}))
for i, (a, b) in enumerate([(2, 3), (4, 5), (3, 6), (1, 8), (5, 5)], start=40):
    r = a + b
    add(E, mc(f"6-sumar_hasta_diez-1-{i:03d}", "sumar_hasta_diez", 1, E, "sumar",
        f"{a} balones y {b} más. ¿Cuántos hay en total?", f"{a} más {b}.", r, near(r, [-1, 1, 2]),
        ["Junta los dos grupos.", f"Desde {a}, cuenta {b} más.", f"{a} + {b} = {r}."],
        visual={"tipo": "grupos", "grupos": [a, b], "icono": "⚽"}))
for i, (serie, paso, nxt) in enumerate([([3, 6, 9], 3, 12), ([2, 4, 6, 8], 2, 10), ([10, 9, 8, 7], -1, 6), ([0, 5, 10], 5, 15)], start=40):
    s = ", ".join(map(str, serie))
    add(E, mc(f"6-secuencia-2-{i:03d}", "secuencia", 2, E, "contar_secuencia",
        f"Sigue la serie: {s}, ... ¿Qué número viene?", "Sigue el patrón.", nxt, near(nxt, [-abs(paso), abs(paso), 1]),
        ["Mira cuánto cambia de un número al siguiente.",
         f"{'Sube' if paso > 0 else 'Baja'} de {abs(paso)} en {abs(paso)}.", f"Después de {serie[-1]} viene {nxt}."]))
for i, (fase, t, ok) in enumerate([(1, "¿Es verdad que 2 + 3 = 5?", True), (1, "¿Es verdad que 4 + 4 = 9?", False),
                                   (2, "¿Es verdad que 7 + 3 = 10?", True), (2, "¿Es verdad que 9 - 2 = 6?", False)], start=40):
    add(E, vf(f"6-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido", t, ok,
        ["Cuéntalo rápido.", "Hazlo en tu cabeza.", "Comprueba y decide."]))
for i, nums in enumerate([[6, 1, 9, 3], [8, 4, 2, 10], [7, 5, 1, 9, 3]], start=40):
    add(E, orden(f"6-alineacion-1-{i:03d}", "alineacion", 1, E, "ordenar_numeros", nums,
        ["Busca el más pequeño.", "Ve del menor al mayor.", "Empieza por el más pequeño."]))

# ===================================================== 8 ANIOS
E = "8-anios"
for i, (a, b) in enumerate([(6, 8), (7, 7), (9, 5), (8, 6), (7, 9)], start=40):
    r = a + b
    add(E, mc(f"8-descomposicion-3-{i:03d}", "descomposicion", 3, E, "completar_diez",
        f"{a} + {b} = ? (pasa por el 10)", f"{a} más {b}.", r, near(r, [-1, 1, 2]),
        [f"Completa la decena desde {a}.", f"De {a} a 10 hay {10 - a}.", f"{a} + {b} = {r}."]))
for i, n in enumerate([11, 12, 13, 15, 20], start=40):
    r = 2 * n
    add(E, mc(f"8-dobles-3-{i:03d}", "dobles", 3, E, "usar_dobles",
        f"¿Cuánto es el doble de {n}?", f"El doble de {n}.", r, near(r, [-2, 2, 1]),
        [f"Doble es {n} y otra vez {n}.", f"{n} + {n}.", f"El doble de {n} es {r}."]))
for i, (a, b) in enumerate([(9, 10), (11, 12), (6, 5), (12, 13), (8, 7)], start=40):
    r = a + b
    add(E, mc(f"8-casi_dobles-3-{i:03d}", "casi_dobles", 3, E, "usar_casi_dobles",
        f"{a} + {b} = ? (apóyate en un doble)", f"{a} más {b}.", r, near(r, [-1, 1, 2]),
        [f"Cerca del doble de {min(a, b)}.", f"{min(a, b)} + {min(a, b)} y ajusta.", f"{a} + {b} = {r}."]))
for i, (hasta, paso, v) in enumerate([(20, 1, 11), (20, 1, 16), (30, 5, 20), (30, 2, 24), (20, 1, 19)], start=40):
    add(E, recta(f"8-recta-numerica-2-{i:03d}", "recta_numerica", 2, E, "usar_decenas_como_referencia",
        f"Toca el punto donde está el {v} en la recta numérica.", f"Señala el {v}.", 0, hasta, paso, v,
        ["Usa el 10 como referencia.", f"El {v} está {'antes' if v < 10 else 'después'} del 10.",
         f"Cuenta de {paso} en {paso} hasta {v}."]))
for i, (a, b) in enumerate([(12, 5), (17, 8), (15, 9), (20, 7), (16, 8)], start=40):
    r = a - b
    add(E, mc(f"8-restar-2-{i:03d}", "restar", 2, E, "restar_estrategico",
        f"{a} - {b} = ?", f"{a} menos {b}.", r, near(r, [-1, 1, 2]),
        [f"Baja primero a 10 desde {a}.", f"Cuenta hacia atrás {b}.", f"{a} - {b} = {r}."]))
for i, n in enumerate([29, 41, 53, 65, 80], start=40):
    d, u = n // 10, n % 10
    add(E, mc(f"8-decenas-2-{i:03d}", "decenas", 2, E, "usar_valor_posicional",
        f"En el número {n}, ¿cuántas unidades sueltas hay (sin contar las decenas)?", f"Las unidades de {n}.",
        u, [d, n, (u + 1) % 10],
        [f"Separa {n} en decenas y unidades.", f"{n} = {d} decenas y {u} unidades.", f"{n} tiene {u} unidades."]))
for i, (fase, t, ok) in enumerate([(2, "¿Es verdad que 9 + 7 = 16?", True), (2, "¿Es verdad que 13 - 6 = 8?", False),
                                   (3, "¿Es verdad que el doble de 8 es 16?", True), (3, "¿Es verdad que 6 + 7 = 14?", False)], start=40):
    add(E, vf(f"8-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido", t, ok,
        ["Hazlo mentalmente.", "Comprueba el cálculo.", "Decide verdadero o falso."]))
for i, nums in enumerate([[31, 18, 44, 7], [25, 52, 19, 38], [60, 14, 29, 45, 8]], start=40):
    add(E, orden(f"8-alineacion-2-{i:03d}", "alineacion", 2, E, "ordenar_numeros", nums,
        ["Mira las decenas.", "Si empatan, mira las unidades.", "Del más pequeño al más grande."]))

# ===================================================== 9 ANIOS (Leyendas)
E = "9-anios"
for i, (a, b) in enumerate([(18, 4), (19, 5), (23, 3), (24, 4), (16, 6), (21, 5)], start=40):
    r = a * b
    add(E, mc(f"9-multiplicacion-3-{i:03d}", "multiplicacion", 3, E, "multiplicar_grupos",
        f"{a} × {b} = ?", f"{a} por {b}.", r, near(r, [-b, b, 1]),
        [f"Descompón {a} = {a // 10 * 10} + {a % 10}.",
         f"{a // 10 * 10} × {b} + {a % 10} × {b}.", f"{a} × {b} = {r}."]))
for i, (t, g) in enumerate([(81, 9), (60, 5), (77, 7), (96, 8), (84, 7), (90, 6)], start=40):
    r = t // g
    add(E, mc(f"9-division-3-{i:03d}", "division", 3, E, "dividir",
        f"{t} ÷ {g} = ?", f"{t} entre {g}.", r, near(r, [-1, 1, 2]),
        ["La división deshace la multiplicación.", f"¿{g} por cuánto da {t}?", f"{t} ÷ {g} = {r}."]))
for i, (n, d, t) in enumerate([(4, 5, 15), (5, 6, 18), (2, 7, 14), (3, 8, 16), (5, 8, 24)], start=40):
    r = n * t // d
    add(E, mc(f"9-fracciones-3-{i:03d}", "fracciones", 3, E, "repartir_partes",
        f"¿Cuánto es {n}/{d} de {t}?", f"{n} de {d} de {t}.", r, near(r, [-1, 1, t // d]),
        [f"Una parte es {t} ÷ {d} = {t // d}.", f"Multiplícala por {n}.", f"{t // d} × {n} = {r}."]))
for i, (n, r) in enumerate([(340, 300), (760, 800), (450, 500), (910, 900), (250, 300)], start=40):
    add(E, mc(f"9-redondeo-3-{i:03d}", "redondeo", 3, E, "redondear",
        f"Redondea {n} a la centena más cercana.", f"{n} a la centena.", r, [r - 100, r + 100, n],
        [f"{n} está entre {n // 100 * 100} y {n // 100 * 100 + 100}.",
         "Mira las decenas: 5 o más sube.", f"{n} → {r}."]))
for i, (n, r) in enumerate([(5400, 5000), (6700, 7000), (8500, 9000), (2300, 2000)], start=50):
    add(E, mc(f"9-redondeo-3-{i:03d}", "redondeo", 3, E, "redondear",
        f"Redondea {n} al millar más cercano.", f"{n} al millar.", r, [r - 1000, r + 1000, n],
        [f"{n} está entre {n // 1000 * 1000} y {n // 1000 * 1000 + 1000}.",
         "Mira las centenas: 5 o más sube.", f"{n} → {r}."]))
for i, (a, b) in enumerate([(458, 367), (639, 285), (574, 248)], start=40):
    add(E, mc(f"9-suma_llevando-3-{i:03d}", "suma_llevando", 3, E, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", a + b, near(a + b, [-10, 1, -100]),
        ["Suma por columnas.", "Lleva 1 cuando pase de 9.", f"{a} + {b} = {a + b}."]))
for i, (a, b) in enumerate([(2345, 678), (3456, 789)], start=50):
    add(E, mc(f"9-suma_llevando-3-{i:03d}", "suma_llevando", 3, E, "sumar_llevando",
        f"{a} + {b} = ?", f"{a} más {b}.", a + b, near(a + b, [-100, 10, 1]),
        ["Alinea por la derecha y suma columna a columna.", "Lleva 1 a la siguiente columna.", f"{a} + {b} = {a + b}."]))
for i, (a, b) in enumerate([(612, 348), (705, 269), (834, 567)], start=40):
    add(E, mc(f"9-resta_llevando-3-{i:03d}", "resta_llevando", 3, E, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", a - b, near(a - b, [-10, 1, 100]),
        ["Resta por columnas con préstamos.", f"Cuenta hacia delante desde {b} hasta {a}.", f"{a} - {b} = {a - b}."]))
for i, (a, b) in enumerate([(2500, 1364), (3120, 1789)], start=50):
    add(E, mc(f"9-resta_llevando-3-{i:03d}", "resta_llevando", 3, E, "restar_llevando",
        f"{a} - {b} = ?", f"{a} menos {b}.", a - b, near(a - b, [-100, 10, 1]),
        ["Réstalo por columnas.", f"O cuenta desde {b} hasta {a}.", f"{a} - {b} = {a - b}."]))
prob = [
    (40, "Un equipo marca 4 goles en cada uno de 5 partidos y encaja 7 en total. ¿Cuál es su diferencia de goles?",
     13, [20, 11, 27], ["Goles a favor: 4 × 5.", "4 × 5 = 20; resta 7.", "20 - 7 = 13."]),
    (41, "Compras 6 sobres de 5 cromos y regalas la mitad de todos. ¿Cuántos cromos te quedas?",
     15, [30, 20, 10], ["Total: 6 × 5.", "6 × 5 = 30; la mitad.", "30 ÷ 2 = 15."]),
    (42, "Hay 48 jugadores en 8 equipos iguales. Si 3 equipos no vienen, ¿cuántos jugadores faltan?",
     18, [6, 30, 24], ["Por equipo: 48 ÷ 8.", "48 ÷ 8 = 6; por 3 equipos.", "6 × 3 = 18."]),
    (43, "Un balón cuesta 9 €. Compras 3 y pagas con 50 €. ¿Cuánto te sobra?",
     23, [27, 17, 14], ["Coste: 3 × 9.", "3 × 9 = 27; resta de 50.", "50 - 27 = 23."]),
    (44, "En 4 cajas hay 7 balones en cada una. Llegan 6 balones más. ¿Cuántos balones hay ahora?",
     34, [28, 32, 42], ["En las cajas: 4 × 7.", "4 × 7 = 28; suma 6.", "28 + 6 = 34."]),
]
for idx, t, r, dist, hints in prob:
    add(E, mc(f"9-problemas-3-{idx:03d}", "problemas", 3, E, "razonar_problema", t, "Piénsalo en dos pasos.", r, dist, hints))
for i, (fase, t, ok) in enumerate([(2, "¿Es verdad que 7 × 9 = 63?", True), (2, "¿Es verdad que 64 ÷ 8 = 7?", False),
                                   (3, "¿Es verdad que 11 × 6 = 66?", True), (3, "¿Es verdad que 2/3 de 18 es 12?", True),
                                   (3, "¿Es verdad que 8 × 8 = 60?", False)], start=40):
    add(E, vf(f"9-relampago-{fase}-{i:03d}", "relampago", fase, E, "calcular_rapido", t, ok,
        ["Apóyate en una tabla.", "Calcula con cuidado.", "Decide verdadero o falso."]))
for i, nums in enumerate([[2300, 1990, 2050, 1875], [4400, 3999, 4100, 3750], [600, 5050, 605, 5500, 650]], start=40):
    add(E, orden(f"9-alineacion-3-{i:03d}", "alineacion", 3, E, "ordenar_numeros", nums,
        ["Cuenta las cifras.", "Más cifras = más grande; si empatan, primera cifra.", "Del más pequeño al más grande."]))

# ===================================================== ESCRIBIR + REINDEXAR
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
                         "ruta": f"data/puzzles/{edad}/{base}", "estrategia": p.get("estrategia")})
    entradas.sort(key=lambda e: (orden_c.index(e["concepto"]) if e["concepto"] in orden_c else 99,
                                 e["fase_cpa"], e["id"]))
    with open(os.path.join(carpeta, "indice.json"), "w", encoding="utf-8") as f:
        json.dump({"edad": edad,
                   "nota": "Catalogo de puzles de esta edad (existentes + tandas ampliadas). Regenerable; manten en sync.",
                   "puzles": entradas}, f, ensure_ascii=False, indent=2)
    print(f"{edad}: {len(entradas)} puzles en el indice")
print(f"Fichas nuevas escritas: {escritos}")
