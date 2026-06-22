# Generador de banco de puzles para los modos Promesas (6) y Estrellas (8).
# Escribe fichas JSON nuevas (no toca las existentes) y reconstruye los indice.json
# escaneando la carpeta, para que existentes + nuevas queden listadas y en sync.
import json, os, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles")

def esc(*objs):
    return None  # placeholder, no usado

def mc(idp, concepto, fase, edad, estrategia, texto, voz, correcta, distractores, hints, nota):
    """Construye una ficha opcion_multiple. 'correcta' y 'distractores' son numeros o strings."""
    opciones_val = [correcta] + [d for d in distractores if d != correcta]
    # quitar duplicados conservando orden
    vistos = []
    for v in opciones_val:
        if v not in vistos:
            vistos.append(v)
    opciones_val = vistos[:4]
    if correcta not in opciones_val:
        opciones_val[-1] = correcta
    # ordenar numericamente si son numeros para que no se note la posicion del correcto
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
        "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz}, "datos": {},
        "respuesta": {"opciones": opciones, "correcta": correcta_id},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }

def recta(idp, concepto, fase, edad, estrategia, texto, voz, desde, hasta, paso, valor, hints, nota):
    return {
        "id": idp, "version": 1, "tipo": "recta_numerica", "concepto": concepto,
        "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz},
        "datos": {"recta": {"desde": desde, "hasta": hasta, "paso": paso}},
        "respuesta": {"valor_correcto": valor},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }

def vf(idp, concepto, fase, edad, estrategia, texto, voz, correcta_bool, hints, nota):
    return {
        "id": idp, "version": 1, "tipo": "verdadero_falso", "concepto": concepto,
        "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
        "enunciado": {"texto": texto, "voz": voz}, "datos": {},
        "respuesta": {"correcta": correcta_bool},
        "pistas": [
            {"nivel": 1, "tipo": "visual", "texto": hints[0]},
            {"nivel": 2, "tipo": "procedimiento", "texto": hints[1]},
            {"nivel": 3, "tipo": "guiada", "texto": hints[2]},
        ],
        "nota": nota,
    }

def ordenar(idp, concepto, fase, edad, estrategia, texto, voz, numeros, hints, nota):
    return {
        "id": idp, "version": 1, "tipo": "ordenar", "concepto": concepto,
        "fase_cpa": fase, "edad": edad, "estrategia": estrategia,
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

fichas = {"6-anios": [], "8-anios": []}

# ------------------------------------------------------------------
# 6 ANIOS - PROMESAS
# ------------------------------------------------------------------
E6 = "6-anios"

# subitizacion (reconocer_patron) - variantes nuevas
sub = [
    (1, 4, "⚽⚽⚽⚽"), (1, 5, "⚽⚽⚽⚽⚽"), (1, 2, "⚽⚽"),
]
for i, (fase, n, emo) in enumerate(sub, start=2):
    fichas[E6].append(mc(
        f"6-subitizacion-1-{i:03d}", "subitizacion", 1, E6, "reconocer_patron",
        f"{emo} ¿Cuántos balones hay? Intenta saberlo de un vistazo, sin contar uno a uno.",
        "Mira el grupo entero de una sola mirada.",
        n, around(n, [-1, 1, 2]),
        ["Mira todos los balones a la vez, no los señales uno a uno.",
         "¿Son más o menos que los dedos de una mano?",
         f"Hay un grupo y, de un vistazo, son {n}."],
        "Banco ampliado: subitizacion concreta."))
sub2 = [(2, 6, "Dos filas de 3"), (2, 4, "Dos filas de 2"), (2, 5, "Una fila de 5")]
for i, (fase, n, desc) in enumerate(sub2, start=2):
    fichas[E6].append(mc(
        f"6-subitizacion-2-{i:03d}", "subitizacion", 2, E6, "reconocer_patron",
        f"{desc} de balones. ¿Cuántos hay en total, sin contarlos de uno en uno?",
        "Reconoce las filas de un vistazo.",
        n, around(n, [-1, 1, 2]),
        ["Mira la forma del grupo (las filas).",
         "Si son dos filas iguales, piensa en el doble.",
         f"Son {n} balones en total."],
        "Banco ampliado: subitizacion pictorica (patrones)."))
sub3 = [(3, 7, 5, 2), (3, 8, 5, 3), (3, 6, 4, 2)]
for i, (fase, n, a, b) in enumerate(sub3, start=2):
    fichas[E6].append(mc(
        f"6-subitizacion-3-{i:03d}", "subitizacion", 3, E6, "reconocer_patron",
        f"Ves un grupo de {a} y otro de {b} de un vistazo. ¿Cuántos son juntos?",
        f"Un grupo de {a} y otro de {b}.",
        n, around(n, [-1, 1, 2]),
        [f"No cuentes desde 1: parte del grupo de {a}.",
         f"Desde {a}, añade {b} más.",
         f"{a} + {b} = {n}."],
        "Banco ampliado: subitizacion conceptual (componer de un vistazo)."))

# comparar (comparar_cantidades) - siempre Azul vs Rojo, coherente con los emojis
comp1 = [(1, 5, 3, "más"), (1, 2, 4, "más"), (1, 3, 5, "menos"), (1, 6, 4, "menos")]
for i, (fase, na, nb, palabra) in enumerate(comp1, start=2):
    azul_mayor = na > nb
    if palabra == "más":
        resp = "Equipo Azul" if azul_mayor else "Equipo Rojo"
    else:
        resp = "Equipo Azul" if not azul_mayor else "Equipo Rojo"
    otra = "Equipo Rojo" if resp == "Equipo Azul" else "Equipo Azul"
    fichas[E6].append(mc(
        f"6-comparar-1-{i:03d}", "comparar", 1, E6, "comparar_cantidades",
        f"Equipo Azul: {'🔵'*na}  Equipo Rojo: {'🔴'*nb}  ¿Qué equipo tiene {palabra} jugadores?",
        f"Busca el equipo con {palabra} jugadores.",
        resp, [otra],
        ["Mira los dos grupos: ¿cuál ocupa más sitio?",
         f"Cuenta cada equipo: Azul {na} y Rojo {nb}.",
         f"Azul tiene {na} y Rojo {nb}: el que tiene {palabra} es {resp.split()[1]}."],
        "Banco ampliado: comparar concreta."))
comp3 = [(3, 7, 4, "mayor", 7), (3, 5, 8, "mayor", 8), (3, 6, 9, "menor", 6), (3, 3, 8, "menor", 3)]
for i, (fase, a, b, palabra, resp) in enumerate(comp3, start=2):
    fichas[E6].append(mc(
        f"6-comparar-3-{i:03d}", "comparar", 3, E6, "comparar_cantidades",
        f"¿Qué número es {palabra}: {a} o {b}?",
        f"Decide cuál es {palabra}.",
        resp, [a if resp != a else b],
        ["Imagina los dos números en la recta: uno está más lejos.",
         f"El {palabra} está más {'a la derecha' if palabra=='mayor' else 'a la izquierda'}.",
         f"Entre {a} y {b}, el {palabra} es {resp}."],
        "Banco ampliado: comparar abstracta."))

# completar_diez
cd = [3, 6, 8, 1, 4, 9, 2, 7]
for i, n in enumerate(cd, start=2):
    falta = 10 - n
    fase = 1 if i <= 4 else (2 if i <= 6 else 3)
    rep = ("balones en la caja" if fase == 1 else ("casillas llenas del marco de diez" if fase == 2 else None))
    if fase == 3:
        texto = f"{n} + ? = 10. ¿Qué número falta para llegar a 10?"
    else:
        texto = f"Tienes {n} {rep}. ¿Cuántas faltan para completar 10?"
    fichas[E6].append(mc(
        f"6-completar-diez-{fase}-{i:03d}", "completar_diez", fase, E6, "completar_diez",
        texto, f"{n} para llegar a 10.",
        falta, around(falta, [-1, 1, 2]),
        [f"Piensa en el marco de diez con {n} llenas.",
         "Cuenta los huecos que quedan hasta 10.",
         f"{n} + {falta} = 10."],
        "Banco ampliado: completar diez."))

# sumar_hasta_diez (sumar)
sumas = [(1, 2, 3), (1, 4, 2), (1, 3, 3), (2, 5, 3), (2, 4, 4), (2, 6, 2), (3, 5, 4), (3, 7, 2), (3, 3, 5)]
for i, (fase, a, b) in enumerate(sumas, start=1):
    s = a + b
    if fase == 1:
        texto = f"{'⚽'*a} y {'⚽'*b}. ¿Cuántos balones hay en total?"
    elif fase == 2:
        texto = f"Un grupo de {a} balones y otro de {b}. ¿Cuántos son en total?"
    else:
        texto = f"¿Cuánto es {a} + {b}?"
    fichas[E6].append(mc(
        f"6-sumar-{fase}-{i:03d}", "sumar_hasta_diez", fase, E6, "sumar",
        texto, f"{a} más {b}.",
        s, around(s, [-1, 1, 2]),
        [f"Junta los dos grupos: {a} y {b}.",
         f"Empieza en {a} y cuenta {b} más.",
         f"{a} + {b} = {s}."],
        "Banco nuevo: sumar hasta 10."))

# secuencia (contar_secuencia)
seqs = [(1, [1,2,3], 1, 4), (1, [2,3,4], 1, 5), (2, [2,4,6], 2, 8), (2, [5,6,7], 1, 8),
        (3, [2,4,6,8], 2, 10), (3, [10,9,8], -1, 7), (3, [0,5,10], 5, 15)]
for i, (fase, serie, paso, resp) in enumerate(seqs, start=1):
    serie_txt = ", ".join(str(x) for x in serie) + ", ?"
    direc = "suben" if paso > 0 else "bajan"
    fichas[E6].append(mc(
        f"6-secuencia-{fase}-{i:03d}", "secuencia", fase, E6, "contar_secuencia",
        f"Serie: {serie_txt}  ¿Qué número viene ahora?",
        "¿Qué número sigue en la serie?",
        resp, around(resp, [-1, 1, 2]),
        [f"Mira cómo {direc} los números.",
         f"Cada paso cambia de {abs(paso)} en {abs(paso)}.",
         f"Después de {serie[-1]} viene {resp}."],
        "Banco nuevo: series de numeros."))

# relampago (verdadero_falso, calcular_rapido)
rel6 = [(1, 2, 3, 5, True), (1, 4, 1, 6, False), (2, 3, 4, 7, True), (2, 5, 2, 8, False),
        (3, 6, 3, 9, True), (3, 4, 4, 9, False)]
for i, (fase, a, b, c, ok) in enumerate(rel6, start=1):
    fichas[E6].append(vf(
        f"6-relampago-{fase}-{i:03d}", "relampago", fase, E6, "calcular_rapido",
        f"⚡ Relámpago: ¿es verdad que {a} + {b} = {c}?",
        f"¿{a} más {b} es {c}?",
        ok,
        [f"Calcula {a} + {b} en tu cabeza.",
         f"Suma {a} y {b} contando rápido.",
         f"{a} + {b} = {a+b}. ¿Coincide con {c}?"],
        "Banco nuevo: relampago verdadero/falso."))

# alineacion (ordenar, ordenar_numeros)
ord6 = [(1, [3,1,2]), (1, [2,4,1]), (2, [5,2,4,1]), (2, [3,6,2,5]), (3, [7,3,9,1]), (3, [8,2,5,10])]
for i, (fase, nums) in enumerate(ord6, start=1):
    fichas[E6].append(ordenar(
        f"6-alineacion-{fase}-{i:03d}", "alineacion", fase, E6, "ordenar_numeros",
        "Alineación: toca los números de menor a mayor para ordenar al equipo.",
        "Ordena tocando del más pequeño al más grande.",
        nums,
        ["Empieza por el número más pequeño.",
         "Cada vez, busca el menor de los que quedan.",
         f"El más pequeño es {min(nums)}; sigue subiendo desde ahí."],
        "Banco nuevo: ordenar de menor a mayor."))

# ------------------------------------------------------------------
# 8 ANIOS - ESTRELLAS
# ------------------------------------------------------------------
E8 = "8-anios"

# descomposicion (completar_diez) - sumas cruzando la decena
desc = [(1, 7, 5), (1, 9, 4), (2, 6, 7), (2, 8, 6), (3, 7, 8), (3, 9, 6), (3, 8, 7)]
for i, (fase, a, b) in enumerate(desc, start=2):
    s = a + b
    if fase == 1:
        texto = f"Tienes {a} balones y llegan {b} más. Completa primero la decena. ¿Cuántos hay en total?"
    elif fase == 2:
        texto = f"Marco de diez con {a} y al lado {b} sueltos. ¿Cuánto suman?"
    else:
        texto = f"¿Cuánto es {a} + {b}? Apóyate en el 10."
    falta = 10 - a
    fichas[E8].append(mc(
        f"8-descomposicion-{fase}-{i:03d}", "descomposicion", fase, E8, "completar_diez",
        texto, f"{a} más {b} pasando por el 10.",
        s, around(s, [-1, 1, 2]),
        [f"Primero lleva el {a} hasta 10.",
         f"Quita {falta} al {b} para completar la decena: 10 y lo que sobra.",
         f"{a} + {falta} = 10, y 10 + {b-falta} = {s}."],
        "Banco ampliado: descomposicion (completar la decena)."))

# recta_numerica (usar_decenas_como_referencia)
rectas = [(1, 6), (1, 9), (2, 14), (2, 17), (3, 12), (3, 18), (3, 11)]
for i, (fase, t) in enumerate(rectas, start=2):
    if t <= 10:
        proc = f"Desde el 0, o retrocede desde el 10: {10-t} menos que 10."
    else:
        proc = f"Desde el 10, cuenta {t-10} pasos más a la derecha."
    fichas[E8].append(recta(
        f"8-recta-numerica-{fase}-{i:03d}", "recta_numerica", fase, E8, "usar_decenas_como_referencia",
        f"Toca el punto donde está el {t} en la recta numérica.",
        f"Usa el 10 como referencia para encontrar el {t}.",
        0, 20, 1, t,
        ["Localiza primero el 10, que está en la mitad.",
         proc,
         f"El {t} está {'antes' if t<10 else 'después'} del 10."],
        "Banco ampliado: recta numerica usando el 10."))

# dobles (usar_dobles)
dob = [(1, 4), (1, 5), (2, 6), (2, 8), (3, 9), (3, 7), (3, 4)]
for i, (fase, n) in enumerate(dob, start=2):
    s = n + n
    if fase == 1:
        texto = f"Dos equipos con {n} balones cada uno. ¿Cuántos balones hay? ({'⚽'*n} y {'⚽'*n})"
    elif fase == 2:
        texto = f"Dos grupos iguales de {n}. ¿Cuál es el doble de {n}?"
    else:
        texto = f"¿Cuánto es el doble de {n}? ({n} + {n})"
    fichas[E8].append(mc(
        f"8-dobles-{fase}-{i:03d}", "dobles", fase, E8, "usar_dobles",
        texto, f"El doble de {n}.",
        s, around(s, [-2, -1, 1, 2]),
        [f"Son dos grupos iguales de {n}.",
         f"El doble de {n} es {n} + {n}.",
         f"{n} + {n} = {s}."],
        "Banco ampliado: dobles."))

# casi_dobles (usar_casi_dobles)
cdo = [(1, 4), (1, 6), (2, 5), (2, 7), (3, 8), (3, 6), (3, 4)]
for i, (fase, n) in enumerate(cdo, start=2):
    a, b = n, n + 1
    s = a + b
    if fase == 1:
        texto = f"Un equipo con {a} y otro con {b} balones. ¿Cuántos hay en total?"
    elif fase == 2:
        texto = f"{a} + {b}: casi son dos grupos iguales. ¿Cuánto suman?"
    else:
        texto = f"¿Cuánto es {a} + {b}? Usa el doble de {a}."
    fichas[E8].append(mc(
        f"8-casi-dobles-{fase}-{i:03d}", "casi_dobles", fase, E8, "usar_casi_dobles",
        texto, f"{a} más {b}, casi un doble.",
        s, around(s, [-2, -1, 1, 2]),
        [f"Fíjate: {a} y {b} casi son iguales.",
         f"Haz el doble de {a} y suma 1 más.",
         f"{a} + {a} = {a+a}, y uno más es {s}."],
        "Banco ampliado: casi-dobles."))

# restar (restar_estrategico)
res = [(1, 7, 3), (1, 9, 4), (2, 12, 5), (2, 15, 6), (3, 14, 8), (3, 17, 9), (3, 11, 4)]
for i, (fase, a, b) in enumerate(res, start=1):
    d = a - b
    if fase == 1:
        texto = f"Tenías {a} balones y se escapan {b}. ¿Cuántos te quedan? ({'⚽'*min(a,8)}...)"
    elif fase == 2:
        texto = f"El marcador iba {a} y bajan {b}. ¿En cuánto queda?"
    else:
        texto = f"¿Cuánto es {a} - {b}?"
    fichas[E8].append(mc(
        f"8-restar-{fase}-{i:03d}", "restar", fase, E8, "restar_estrategico",
        texto, f"{a} menos {b}.",
        d, around(d, [-2, -1, 1, 2]),
        [f"Parte de {a} y quita {b}.",
         f"Cuenta hacia atrás {b} desde {a} (o baja al 10 primero).",
         f"{a} - {b} = {d}."],
        "Banco nuevo: restar con estrategia."))

# decenas (usar_valor_posicional)
dec = [(1, 2, 3), (1, 3, 4), (2, 34, 'decenas', 3), (2, 47, 'unidades', 7),
       (3, 30, 4), (3, 50, 6), (3, 20, 8)]
for i, item in enumerate(dec, start=1):
    fase = item[0]
    if fase == 1:
        _, d, u = item
        total = d * 10 + u
        texto = f"{d} cajas de 10 balones y {u} sueltos. ¿Cuántos balones hay en total?"
        correcta = total
        hints = [f"Cada caja tiene 10: son {d} decenas.",
                 f"{d} decenas son {d*10}, y luego {u} sueltos.",
                 f"{d*10} + {u} = {total}."]
        estrat_text = f"{d} decenas y {u} unidades."
    elif fase == 2:
        _, num, cual, correcta = item
        texto = f"El número {num}: ¿cuántas {cual} tiene?"
        d = num // 10; u = num % 10
        hints = [f"En {num}, la primera cifra son las decenas y la segunda las unidades.",
                 f"{num} tiene {d} decenas y {u} unidades.",
                 f"Las {cual} de {num} son {correcta}."]
        estrat_text = f"valor posicional de {num}."
    else:
        _, dpart, upart = item
        total = dpart + upart
        texto = f"¿Cuánto es {dpart} + {upart}?"
        correcta = total
        hints = [f"{dpart} son decenas exactas.",
                 f"Junta las decenas y las unidades.",
                 f"{dpart} + {upart} = {total}."]
        estrat_text = f"{dpart} más {upart}."
    fichas[E8].append(mc(
        f"8-decenas-{fase}-{i:03d}", "decenas", fase, E8, "usar_valor_posicional",
        texto, estrat_text,
        correcta, around(correcta, [-10, -1, 1, 10]),
        hints, "Banco nuevo: decenas y unidades (valor posicional)."))

# relampago 8
rel8 = [(1, 6, 6, 12, True), (1, 8, 5, 12, False), (2, 7, 8, 15, True), (2, 9, 7, 15, False),
        (3, 13, 4, 9, True, '-'), (3, 16, 8, 9, False, '-')]
for i, item in enumerate(rel8, start=1):
    if len(item) == 5:
        fase, a, b, c, ok = item
        texto = f"⚡ Relámpago: ¿es verdad que {a} + {b} = {c}?"
        voz = f"¿{a} más {b} es {c}?"
        hints = [f"Calcula {a} + {b} rápido.", f"Suma {a} y {b}.", f"{a} + {b} = {a+b}. ¿Es {c}?"]
    else:
        fase, a, b, c, ok, _ = item
        texto = f"⚡ Relámpago: ¿es verdad que {a} - {b} = {c}?"
        voz = f"¿{a} menos {b} es {c}?"
        hints = [f"Calcula {a} - {b} rápido.", f"Quita {b} a {a}.", f"{a} - {b} = {a-b}. ¿Es {c}?"]
    fichas[E8].append(vf(
        f"8-relampago-{fase}-{i:03d}", "relampago", fase, E8, "calcular_rapido",
        texto, voz, ok, hints, "Banco nuevo: relampago verdadero/falso (8)."))

# alineacion 8
ord8 = [(1, [12,8,15]), (1, [20,11,17]), (2, [9,14,6,18]), (2, [13,7,16,10]),
        (3, [21,15,30,9]), (3, [18,24,12,27])]
for i, (fase, nums) in enumerate(ord8, start=1):
    fichas[E8].append(ordenar(
        f"8-alineacion-{fase}-{i:03d}", "alineacion", fase, E8, "ordenar_numeros",
        "Alineación: toca los números de menor a mayor para colocar la alineación.",
        "Ordena del más pequeño al más grande.",
        nums,
        ["Empieza por el más pequeño.",
         "Cada vez busca el menor de los que quedan.",
         f"El más pequeño es {min(nums)}."],
        "Banco nuevo: ordenar (8)."))

# ------------------------------------------------------------------
# Escribir ficheros nuevos y reconstruir indices
# ------------------------------------------------------------------
def nombre_fichero(idp):
    # 8-descomposicion-2-003 -> descomposicion-fase2-003.json
    partes = idp.split("-")
    edad = partes[0]
    num = partes[-1]
    fase = partes[-2]
    concepto = "-".join(partes[1:-2])
    return f"{concepto}-fase{fase}-{num}.json"

escritos = 0
for edad, lista in fichas.items():
    carpeta = os.path.join(BASE, edad)
    for ficha in lista:
        ruta = os.path.join(carpeta, nombre_fichero(ficha["id"]))
        ficha["ruta_rel"] = f"data/puzzles/{edad}/{nombre_fichero(ficha['id'])}"
        ruta_rel = ficha.pop("ruta_rel")
        with open(ruta, "w", encoding="utf-8") as f:
            json.dump(ficha, f, ensure_ascii=False, indent=2)
        escritos += 1

# Reconstruir indice escaneando TODOS los json (existentes + nuevos)
ORDEN_CONCEPTO = {
    "6-anios": ["subitizacion", "comparar", "completar_diez", "sumar_hasta_diez", "secuencia", "relampago", "alineacion"],
    "8-anios": ["descomposicion", "dobles", "casi_dobles", "recta_numerica", "restar", "decenas", "relampago", "alineacion"],
}
for edad in ["6-anios", "8-anios"]:
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
    orden = ORDEN_CONCEPTO[edad]
    entradas.sort(key=lambda e: (orden.index(e["concepto"]) if e["concepto"] in orden else 99,
                                 e["fase_cpa"], e["id"]))
    indice = {"edad": edad,
              "nota": "Catalogo de puzles de esta edad (existentes + banco ampliado). La progresion lo lee para elegir el siguiente puzle por concepto y fase. Regenerable; manten en sync al anadir puzles.",
              "puzles": entradas}
    with open(os.path.join(carpeta, "indice.json"), "w", encoding="utf-8") as f:
        json.dump(indice, f, ensure_ascii=False, indent=2)
    print(f"{edad}: {len(entradas)} puzles en el indice")

print(f"Fichas nuevas escritas: {escritos}")
