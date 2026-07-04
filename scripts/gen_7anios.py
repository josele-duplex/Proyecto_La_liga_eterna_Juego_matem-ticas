# Generador de banco de puzles para el modo "Aspirantes" (7 anios, C1 del Plan V2).
# Banco puente entre Promesas (6, hasta 10) y Estrellas (8, decenas/cruce del 10 desde el suelo).
# Reutiliza 9 de 9 estrategias ya existentes (0 insignias nuevas en recompensas.json); solo
# "sumar_veinte" y "restar_veinte" son conceptos genuinamente nuevos. Mismo patron exacto que
# gen_puzzles.py/gen_leyendas.py: escribe fichas nuevas y reconstruye indice.json escaneando.
import json, os, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles")
EDAD = "7-anios"
os.makedirs(os.path.join(BASE, EDAD), exist_ok=True)

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
        opciones_val_sorted = sorted(opciones_val, key=lambda x: float(x))
    except (TypeError, ValueError):
        opciones_val_sorted = opciones_val
    letras = ["a", "b", "c", "d"]
    opciones = []
    correcta_id = None
    for i, val in enumerate(opciones_val_sorted):
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

def around(v, deltas):
    return [v + d for d in deltas if v + d >= 0]

fichas = []

# ------------------------------------------------------------------
# sumar_veinte (NUEVO concepto, reutiliza estrategia "sumar" de Promesas)
# ------------------------------------------------------------------
sv1 = [(10, 4), (10, 7), (9, 6)]  # fase 1, concreta (grupos)
for i, (a, b) in enumerate(sv1, start=1):
    s = a + b
    fichas.append(mc(
        f"7-sumar_veinte-1-{i:03d}", "sumar_veinte", 1, "sumar",
        f"Tienes {a} balones y llegan {b} más. ¿Cuántos hay en total?",
        f"{a} más {b}.",
        s, around(s, [-1, 1, 2]),
        [f"Junta los dos grupos: {a} y {b}.",
         f"Empieza en {a} y cuenta {b} más.",
         f"{a} + {b} = {s}."],
        "Banco Aspirantes: sumar hasta veinte (concreta).",
        visual={"tipo": "grupos", "grupos": [a, b], "icono": "⚽"}))

sv2 = [(8, 9), (11, 5), (12, 6)]  # fase 2, pictorica (grupos)
for i, (a, b) in enumerate(sv2, start=1):
    s = a + b
    fichas.append(mc(
        f"7-sumar_veinte-2-{i:03d}", "sumar_veinte", 2, "sumar",
        f"Un grupo de {a} balones y otro de {b}. ¿Cuántos son en total?",
        f"{a} más {b}.",
        s, around(s, [-1, 1, 2]),
        ["Mira los dos grupos juntos.",
         f"Empieza en {a} y cuenta {b} más.",
         f"{a} + {b} = {s}."],
        "Banco Aspirantes: sumar hasta veinte (pictorica).",
        visual={"tipo": "grupos", "grupos": [a, b], "icono": "⚽"}))

sv3 = [(13, 5), (14, 3), (9, 9), (16, 3)]  # fase 3, abstracta
for i, (a, b) in enumerate(sv3, start=1):
    s = a + b
    fichas.append(mc(
        f"7-sumar_veinte-3-{i:03d}", "sumar_veinte", 3, "sumar",
        f"¿Cuánto es {a} + {b}?",
        f"{a} más {b}.",
        s, around(s, [-1, 1, 2]),
        [f"Empieza en {a}.",
         f"Cuenta {b} más desde {a}.",
         f"{a} + {b} = {s}."],
        "Banco Aspirantes: sumar hasta veinte (abstracta)."))

# ------------------------------------------------------------------
# restar_veinte (NUEVO concepto, reutiliza estrategia "restar_estrategico" de Estrellas)
# ------------------------------------------------------------------
rv1 = [(15, 4), (18, 6), (12, 3)]  # fase 1, concreta
for i, (a, b) in enumerate(rv1, start=1):
    d = a - b
    fichas.append(mc(
        f"7-restar_veinte-1-{i:03d}", "restar_veinte", 1, "restar_estrategico",
        f"Tenías {a} balones y se escapan {b}. ¿Cuántos te quedan?",
        f"{a} menos {b}.",
        d, around(d, [-2, -1, 1, 2]),
        [f"Parte de {a} y quita {b}.",
         f"Cuenta hacia atrás {b} desde {a}.",
         f"{a} - {b} = {d}."],
        "Banco Aspirantes: restar hasta veinte (concreta)."))

rv2 = [(16, 7), (19, 8), (14, 6)]  # fase 2, "marcador"
for i, (a, b) in enumerate(rv2, start=1):
    d = a - b
    fichas.append(mc(
        f"7-restar_veinte-2-{i:03d}", "restar_veinte", 2, "restar_estrategico",
        f"El marcador iba {a} y bajan {b}. ¿En cuánto queda?",
        f"{a} menos {b}.",
        d, around(d, [-2, -1, 1, 2]),
        [f"Parte de {a}.",
         f"Quita {b} contando hacia atrás.",
         f"{a} - {b} = {d}."],
        "Banco Aspirantes: restar hasta veinte (marcador)."))

rv3 = [(17, 9), (20, 8), (18, 9), (13, 5)]  # fase 3, abstracta
for i, (a, b) in enumerate(rv3, start=1):
    d = a - b
    fichas.append(mc(
        f"7-restar_veinte-3-{i:03d}", "restar_veinte", 3, "restar_estrategico",
        f"¿Cuánto es {a} - {b}?",
        f"{a} menos {b}.",
        d, around(d, [-2, -1, 1, 2]),
        [f"Parte de {a}.",
         f"Cuenta hacia atrás {b}.",
         f"{a} - {b} = {d}."],
        "Banco Aspirantes: restar hasta veinte (abstracta)."))

# ------------------------------------------------------------------
# dobles (reutiliza concepto/estrategia de Estrellas; numeros pequenos, 2 a 5)
# ------------------------------------------------------------------
dob1 = [2, 3]  # fase 1, concreta
for i, n in enumerate(dob1, start=1):
    s = n + n
    fichas.append(mc(
        f"7-dobles-1-{i:03d}", "dobles", 1, "usar_dobles",
        f"Dos equipos con {n} balones cada uno. ¿Cuántos hay en total? ({'⚽'*n} y {'⚽'*n})",
        f"El doble de {n}.",
        s, around(s, [-2, -1, 1, 2]),
        [f"Son dos grupos iguales de {n}.",
         f"El doble de {n} es {n} + {n}.",
         f"{n} + {n} = {s}."],
        "Banco Aspirantes: dobles pequeños (concreta)."))

dob2 = [3, 4]  # fase 2, pictorica
for i, n in enumerate(dob2, start=1):
    s = n + n
    fichas.append(mc(
        f"7-dobles-2-{i:03d}", "dobles", 2, "usar_dobles",
        f"Dos grupos iguales de {n}. ¿Cuál es el doble de {n}?",
        f"El doble de {n}.",
        s, around(s, [-2, -1, 1, 2]),
        ["Son dos grupos iguales.",
         f"El doble de {n} es {n} + {n}.",
         f"{n} + {n} = {s}."],
        "Banco Aspirantes: dobles pequeños (pictorica).",
        visual={"tipo": "grupos", "grupos": [n, n], "icono": "⚽"}))

dob3 = [2, 4, 5]  # fase 3, abstracta
for i, n in enumerate(dob3, start=1):
    s = n + n
    fichas.append(mc(
        f"7-dobles-3-{i:03d}", "dobles", 3, "usar_dobles",
        f"¿Cuánto es el doble de {n}?",
        f"El doble de {n}.",
        s, around(s, [-2, -1, 1, 2]),
        [f"El doble de {n} es {n} + {n}.",
         "Súmalo contigo mismo.",
         f"{n} + {n} = {s}."],
        "Banco Aspirantes: dobles pequeños (abstracta)."))

# ------------------------------------------------------------------
# decenas (reutiliza concepto/estrategia de Estrellas; SOLO decenas completas,
# sin mezclar con sueltos -- eso lo introduce Estrellas despues, como salto siguiente)
# ------------------------------------------------------------------
fichas.append(mc(
    "7-decenas-1-001", "decenas", 1, "usar_valor_posicional",
    "1 caja llena con 10 balones. ¿Cuántos balones hay?",
    "Una decena completa.",
    10, [8, 9, 11],
    ["Cuenta cuántas cajas de 10 hay.", "Una caja llena son 10.", "1 decena son 10."],
    "Banco Aspirantes: decenas completas (concreta).",
    visual={"tipo": "grupos", "grupos": [10], "icono": "⚽"}))
fichas.append(mc(
    "7-decenas-1-002", "decenas", 1, "usar_valor_posicional",
    "2 cajas llenas de 10 balones cada una. ¿Cuántos balones hay en total?",
    "Dos decenas completas.",
    20, [10, 12, 21],
    ["Cada caja tiene 10: son 2 decenas.", "2 decenas son 10 + 10.", "10 + 10 = 20."],
    "Banco Aspirantes: decenas completas (concreta).",
    visual={"tipo": "grupos", "grupos": [10, 10], "icono": "⚽"}))
fichas.append(mc(
    "7-decenas-2-001", "decenas", 2, "usar_valor_posicional",
    "3 grupos de 10 balones. ¿Cuántos balones hay en total?",
    "Tres decenas completas.",
    30, [20, 29, 31],
    ["Cada grupo es una decena.", "3 decenas son 10 + 10 + 10.", "10 + 10 + 10 = 30."],
    "Banco Aspirantes: decenas completas (pictorica).",
    visual={"tipo": "grupos", "grupos": [10, 10, 10], "icono": "⚽"}))
fichas.append(mc(
    "7-decenas-2-002", "decenas", 2, "usar_valor_posicional",
    "4 grupos de 10 balones. ¿Cuántos balones hay en total?",
    "Cuatro decenas completas.",
    40, [30, 39, 41],
    ["Cada grupo es una decena.", "4 decenas son 10+10+10+10.", "Son 40 en total."],
    "Banco Aspirantes: decenas completas (pictorica).",
    visual={"tipo": "grupos", "grupos": [10, 10, 10, 10], "icono": "⚽"}))
fichas.append(mc(
    "7-decenas-3-001", "decenas", 3, "usar_valor_posicional",
    "¿Cuánto es 3 decenas?",
    "Tres decenas.",
    30, [20, 13, 40],
    ["Una decena son 10.", "3 decenas son 3 veces 10.", "10 + 10 + 10 = 30."],
    "Banco Aspirantes: decenas completas (abstracta)."))
fichas.append(mc(
    "7-decenas-3-002", "decenas", 3, "usar_valor_posicional",
    "¿Cuántas decenas hay en 40?",
    "Decenas de cuarenta.",
    4, [3, 5, 40],
    ["Piensa en cuántos grupos de 10 caben en 40.", "40 = 10+10+10+10.", "Hay 4 decenas."],
    "Banco Aspirantes: decenas completas (abstracta)."))
fichas.append(mc(
    "7-decenas-3-003", "decenas", 3, "usar_valor_posicional",
    "2 decenas + 1 decena = ?",
    "Dos decenas más una decena.",
    30, [20, 10, 21],
    ["2 decenas son 20.", "Súmale 1 decena más (10).", "20 + 10 = 30."],
    "Banco Aspirantes: decenas completas (abstracta)."))

# ------------------------------------------------------------------
# comparar (reutiliza concepto/estrategia de Promesas; extiende hasta 20)
# ------------------------------------------------------------------
comp1 = [(8, 5, "más"), (4, 9, "menos"), (7, 3, "más")]  # fase 1, emoji (concreta, cantidades moderadas)
for i, (na, nb, palabra) in enumerate(comp1, start=1):
    azul_mayor = na > nb
    if palabra == "más":
        resp = "Equipo Azul" if azul_mayor else "Equipo Rojo"
    else:
        resp = "Equipo Azul" if not azul_mayor else "Equipo Rojo"
    otra = "Equipo Rojo" if resp == "Equipo Azul" else "Equipo Azul"
    fichas.append(mc(
        f"7-comparar-1-{i:03d}", "comparar", 1, "comparar_cantidades",
        f"Equipo Azul: {'🔵'*na}  Equipo Rojo: {'🔴'*nb}  ¿Qué equipo tiene {palabra} jugadores?",
        f"Busca el equipo con {palabra} jugadores.",
        resp, [otra],
        ["Mira los dos grupos: ¿cuál ocupa más sitio?",
         f"Cuenta cada equipo: Azul {na} y Rojo {nb}.",
         f"Azul tiene {na} y Rojo {nb}: el que tiene {palabra} es {resp.split()[1]}."],
        "Banco Aspirantes: comparar (concreta)."))

comp2 = [(10, 13, "mayor", 13), (15, 9, "menor", 9), (12, 14, "mayor", 14)]  # fase 2
for i, (a, b, palabra, resp) in enumerate(comp2, start=1):
    fichas.append(mc(
        f"7-comparar-2-{i:03d}", "comparar", 2, "comparar_cantidades",
        f"¿Qué número es {palabra}: {a} o {b}?",
        f"Decide cuál es {palabra}.",
        resp, [a if resp != a else b],
        ["Imagina los dos números en la recta numérica.",
         f"El {palabra} está más {'a la derecha' if palabra=='mayor' else 'a la izquierda'}.",
         f"Entre {a} y {b}, el {palabra} es {resp}."],
        "Banco Aspirantes: comparar hasta 20 (pictorica)."))

comp3 = [(16, 12, "mayor", 16), (11, 19, "menor", 11), (18, 8, "mayor", 18)]  # fase 3
for i, (a, b, palabra, resp) in enumerate(comp3, start=1):
    fichas.append(mc(
        f"7-comparar-3-{i:03d}", "comparar", 3, "comparar_cantidades",
        f"¿Qué número es {palabra}: {a} o {b}?",
        f"Decide cuál es {palabra}.",
        resp, [a if resp != a else b],
        ["Piensa en los dos números sin dibujarlos.",
         f"El {palabra} está más {'a la derecha' if palabra=='mayor' else 'a la izquierda'} en la recta.",
         f"Entre {a} y {b}, el {palabra} es {resp}."],
        "Banco Aspirantes: comparar hasta 20 (abstracta)."))

# ------------------------------------------------------------------
# secuencia (reutiliza concepto/estrategia de Promesas; extiende hasta 20-30)
# ------------------------------------------------------------------
seqs = [
    (1, [1, 2, 3], 1, 4), (1, [6, 7, 8], 1, 9),
    (2, [10, 12, 14], 2, 16), (2, [15, 16, 17], 1, 18),
    (3, [5, 10, 15], 5, 20), (3, [20, 18, 16], -2, 14), (3, [6, 12, 18], 6, 24),
]
for i, (fase, serie, paso, resp) in enumerate(seqs, start=1):
    serie_txt = ", ".join(str(x) for x in serie) + ", ?"
    direc = "suben" if paso > 0 else "bajan"
    fichas.append(mc(
        f"7-secuencia-{fase}-{i:03d}", "secuencia", fase, "contar_secuencia",
        f"Serie: {serie_txt}  ¿Qué número viene ahora?",
        "¿Qué número sigue en la serie?",
        resp, around(resp, [-1, 1, 2]),
        [f"Mira cómo {direc} los números.",
         f"Cada paso cambia de {abs(paso)} en {abs(paso)}.",
         f"Después de {serie[-1]} viene {resp}."],
        "Banco Aspirantes: series hasta 20-30."))

# ------------------------------------------------------------------
# completar_diez (mismo concepto/estrategia que Promesas/Estrellas, fichas propias)
# ------------------------------------------------------------------
cd = [2, 5, 7]  # fase 1
for i, n in enumerate(cd, start=1):
    falta = 10 - n
    fichas.append(mc(
        f"7-completar_diez-1-{i:03d}", "completar_diez", 1, "completar_diez",
        f"Tienes {n} balones en la caja. ¿Cuántas faltan para completar 10?",
        f"{n} para llegar a 10.",
        falta, around(falta, [-1, 1, 2]),
        [f"Piensa en el marco de diez con {n} llenas.",
         "Cuenta los huecos que quedan hasta 10.",
         f"{n} + {falta} = 10."],
        "Banco Aspirantes: completar diez (concreta).",
        visual={"tipo": "marco_diez", "llenas": n, "sueltos": 0}))
cd2 = [3, 8]  # fase 2
for i, n in enumerate(cd2, start=1):
    falta = 10 - n
    fichas.append(mc(
        f"7-completar_diez-2-{i:03d}", "completar_diez", 2, "completar_diez",
        f"Marco de diez con {n} casillas llenas. ¿Cuántas faltan para completar 10?",
        f"{n} para llegar a 10.",
        falta, around(falta, [-1, 1, 2]),
        ["Cuenta las casillas llenas del marco.",
         "Cuenta los huecos que quedan.",
         f"{n} + {falta} = 10."],
        "Banco Aspirantes: completar diez (pictorica).",
        visual={"tipo": "marco_diez", "llenas": n, "sueltos": 0}))
cd3 = [4, 6, 9]  # fase 3
for i, n in enumerate(cd3, start=1):
    falta = 10 - n
    fichas.append(mc(
        f"7-completar_diez-3-{i:03d}", "completar_diez", 3, "completar_diez",
        f"{n} + ? = 10. ¿Qué número falta?",
        f"{n} para llegar a 10.",
        falta, around(falta, [-1, 1, 2]),
        [f"Piensa en {n} y en 10.",
         "Cuenta desde ahí hasta 10.",
         f"{n} + {falta} = 10."],
        "Banco Aspirantes: completar diez (abstracta)."))

# ------------------------------------------------------------------
# relampago (mismo concepto/estrategia; sumas y restas hasta 15 aprox.)
# ------------------------------------------------------------------
rel = [
    (1, "6 + 5 = 11", True), (1, "8 + 4 = 13", False),
    (2, "9 + 6 = 15", True), (2, "7 + 7 = 15", False),
    (3, "12 - 4 = 8", True), (3, "14 - 6 = 9", False), (3, "10 + 5 = 15", True),
]
for i, (fase, afirmacion, ok) in enumerate(rel, start=1):
    fichas.append(vf(
        f"7-relampago-{fase}-{i:03d}", "relampago", fase, "calcular_rapido",
        f"⚡ Relámpago: ¿es verdad que {afirmacion}?",
        f"¿{afirmacion}?",
        ok,
        ["Calcula la cuenta en tu cabeza.",
         "Repite la operación paso a paso.",
         "Comprueba el resultado con cuidado."],
        "Banco Aspirantes: relámpago hasta 15."))

# ------------------------------------------------------------------
# alineacion (mismo concepto/estrategia; ordenar hasta 20-30)
# ------------------------------------------------------------------
ords = [
    (1, [12, 8, 15]), (1, [10, 17, 6]),
    (2, [14, 20, 9, 18]), (2, [11, 16, 7, 13]),
    (3, [22, 15, 30, 9]), (3, [25, 12, 28, 18]),
]
for i, (fase, nums) in enumerate(ords, start=1):
    fichas.append(ordenar(
        f"7-alineacion-{fase}-{i:03d}", "alineacion", fase, "ordenar_numeros",
        "Alineación: toca los números de menor a mayor para colocar al equipo.",
        "Ordena del más pequeño al más grande.",
        nums,
        ["Empieza por el número más pequeño.",
         "Cada vez busca el menor de los que quedan.",
         f"El más pequeño es {min(nums)}."],
        "Banco Aspirantes: ordenar hasta 20-30."))

# ------------------------------------------------------------------
# Escribir ficheros y reconstruir indice.json
# ------------------------------------------------------------------
def nombre_fichero(idp):
    partes = idp.split("-")
    num = partes[-1]
    fase = partes[-2]
    concepto = "-".join(partes[1:-2])
    return f"{concepto}-fase{fase}-{num}.json"

carpeta = os.path.join(BASE, EDAD)
escritos = 0
for ficha in fichas:
    ruta = os.path.join(carpeta, nombre_fichero(ficha["id"]))
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)
    escritos += 1

ORDEN_CONCEPTO = ["sumar_veinte", "restar_veinte", "completar_diez", "dobles",
                  "decenas", "comparar", "secuencia", "relampago", "alineacion"]
entradas = []
for ruta in glob.glob(os.path.join(carpeta, "*.json")):
    base = os.path.basename(ruta)
    if base == "indice.json":
        continue
    with open(ruta, encoding="utf-8") as f:
        p = json.load(f)
    entradas.append({"id": p["id"], "concepto": p["concepto"], "fase_cpa": p["fase_cpa"],
                     "ruta": f"data/puzzles/{EDAD}/{base}", "estrategia": p.get("estrategia")})
entradas.sort(key=lambda e: (ORDEN_CONCEPTO.index(e["concepto"]) if e["concepto"] in ORDEN_CONCEPTO else 99,
                             e["fase_cpa"], e["id"]))
indice = {"edad": EDAD,
          "nota": "Catalogo de puzles del equipo Aspirantes (7 anios, banco puente entre Promesas y Estrellas). Regenerable; manten en sync al anadir puzles.",
          "puzles": entradas}
with open(os.path.join(carpeta, "indice.json"), "w", encoding="utf-8") as f:
    json.dump(indice, f, ensure_ascii=False, indent=2)

print(f"{EDAD}: {len(entradas)} puzles en el indice")
print(f"Fichas escritas: {escritos}")
