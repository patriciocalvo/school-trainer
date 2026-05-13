# quiz-config.md — Configuración cultural y pedagógica

Este archivo define el contexto cultural, la edad objetivo, el nivel escolar y las restricciones de lenguaje que se aplican a **todos** los quizzes del proyecto.

Cuando uses un LLM para generar un quiz nuevo, pasale este archivo como contexto.

---

## Configuración activa

```yaml
pais_target:    Argentina
edad_target:    9 años
nivel_escolar:  4to grado primaria
idioma:         Español (variante rioplatense)
curriculo:      DGCyE / Nación – Provincia de Buenos Aires
registro:       informal-correcto
tuteo:          vos  # "¿Lo sabés vos?" — nunca "tú"
```

---

## Contextos culturales preferidos

Los enunciados y ejemplos deben usar contextos familiares para un niño de 9 años en Argentina:

| Categoría          | Ejemplos concretos                                                  |
|--------------------|---------------------------------------------------------------------|
| **Familia**        | mamá, papá, abuelos, hermanos, primos; asados familiares           |
| **Escuela**        | recreo, pizarrón, maestro/a, cuaderno, mochila, acto escolar       |
| **Deportes**       | fútbol (Messi, cancha, gol), básquet, vóley, natación              |
| **Naturaleza AR**  | pampas, ríos Paraná y Uruguay, Patagonia, cóndor, hornero          |
| **Comida**         | empanadas, mate (de los adultos), alfajor, medialunas, facturas    |
| **Ciudad/barrio**  | plaza, almacén, verdulería, kiosco, colectivo                      |
| **Festividades**   | 25 de Mayo, 9 de Julio, Día del Maestro, Día del Estudiante        |

---

## Regionalismos prohibidos

Evitá estas expresiones que no son naturales para un niño argentino de 9 años:

### México
- cuate, güey, wey, ahorita (como "enseguida"), chavo/chava, órale, híjole, chido

### España
- tío/tía (coloquial), chaval, vosotros/vuestro, jolín, guay, mola, hostia, coger (en sentido neutro)

### Chile
- po, weon/weón, cachai, al tiro (como "ahora mismo")

### Colombia
- parce, bacano, chévere (es aceptado en algunos contextos pero preferir términos neutros)

### Evitar en general
- Anglicismos innecesarios cuando existe la palabra en español rioplatense
- Expresiones de adultos que un niño de 9 años no reconocería

---

## Nivel de lenguaje apropiado por materia

| Materia       | Vocabulario                                     | Longitud de enunciado            |
|---------------|-------------------------------------------------|----------------------------------|
| Lengua        | Palabras del grado; si se introduce término técnico, explicarlo en la misma pregunta | Máximo 3 líneas |
| Matemática    | Números hasta 10.000; fracciones simples; operaciones básicas | Enunciados de problema: máximo 2 oraciones |
| Ciencias      | Términos científicos básicos explicados; comparaciones con objetos cotidianos | Moderado, con contexto |
| Historia      | Vocabulario histórico básico; nombres propios argentinos; fechas patrias | Breve, sin jerga académica |
| Inglés        | Nivel A1-A2; vocabulario de uso cotidiano; frases simples | Muy breve; no mezclar español en la opción |
| Deportes      | Léxico del deporte argentino; fútbol como referencia cultural central | Informal y cercano |

---

## Pautas de registro

- **Tuteo con "vos"**: siempre usar "vos" y las conjugaciones correspondientes (`sabés`, `podés`, `escribís`), nunca "tú" ni "usted" en contexto de pregunta al alumno.
- **Registro informal-correcto**: el tono es amigable y cercano, como un maestro que explica con entusiasmo, pero sin caer en groserías ni en lenguaje demasiado formal.
- **Sin violencia ni contenido inapropiado**: los contextos deben ser positivos, familiares, escolares o deportivos.
- **Género**: preferir enunciados neutros o alternar géneros. Ejemplo: "La alumna…" en algunas preguntas, "El alumno…" en otras.

---

## Cómo adaptar este archivo a otro país o edad

Si querés generar quizzes para otro contexto, modificá la sección "Configuración activa" y la tabla de contextos culturales. Ejemplo:

```yaml
# Configuración alternativa: México, 10 años, 5to grado
pais_target:    México
edad_target:    10 años
nivel_escolar:  5to grado primaria
idioma:         Español (variante mexicana)
curriculo:      SEP México
registro:       informal-correcto
tuteo:          tú  # En México no se usa "vos"
```

Para México, los contextos culturales cambiarían a: tacos, tortas, colonia/vecindario, fútbol mexicano, Día de Muertos, independencia (16 de Septiembre), etc. Y los regionalismos prohibidos serían los argentinos ("boludo", "pibe", "che", "re-").

---

## Uso de emojis en los quizzes

Para quizzes dirigidos a niños (edad_target ≤ 12 años), los emojis son recomendados para hacer el contenido más visual y motivador.

### Dónde usar emojis

| Lugar           | Recomendación                                                                 | Ejemplo                                      |
|-----------------|-------------------------------------------------------------------------------|----------------------------------------------|
| **Título**      | Un emoji al inicio que represente el tema                                     | `"✏️ V y B: el pasado con -aba"`             |
| **Enunciado**   | Un emoji al inicio o al final de la pregunta para dar contexto visual         | `"🐄 ¿Cuál de estas palabras está bien escrita?"` |
| **Opciones**    | Emoji en opciones que representen objetos concretos (no en todas, solo si ayuda) | `"a) 🍎 manzana"` en un quiz de vocabulario |

**Regla general:** máximo 1–2 emojis por pregunta. El emoji apoya la comprensión, no la reemplaza. No emojis en opciones de respuesta de texto puro (ortografía, gramática) — solo en contextos de vocabulario o imágenes.

### Emojis sugeridos por materia

| Materia       | Emojis sugeridos                                     |
|---------------|------------------------------------------------------|
| Lengua        | ✏️ 📝 🔤 📖 💬                                      |
| Matemática    | 🔢 ➕ ➖ ✖️ 🍕 🍎 🎈 (para contextualizar problemas) |
| Ciencias      | 🌿 🐾 🔬 🌎 ☀️ 🌧️ 🦁                              |
| Historia      | 🏛️ 🇦🇷 📜 🕰️                                      |
| Inglés        | 🌎 💬 🐶 🐱 🏠 (vocabulario cotidiano)              |
| Deportes      | ⚽ 🏀 🏊 🎯 🏆                                      |

---

## Notas para el LLM

Cuando generés un quiz:
1. Leé esta configuración antes de escribir cualquier enunciado
2. Verificá que cada opción y contexto sea reconocible para un niño argentino de 9 años
3. Aplicá el tuteo con "vos" en todas las preguntas dirigidas al alumno
4. Revisá que ningún enunciado contenga regionalismos de la lista prohibida
5. Si tenés dudas sobre si un término es apropiado, preferí uno más neutro o cotidiano
