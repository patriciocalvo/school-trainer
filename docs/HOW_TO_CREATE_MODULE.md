# Cómo crear un módulo de quiz

Este documento explica cómo crear nuevos archivos de quiz para el School Trainer.
Los quizzes son archivos `.md` ubicados en `src/quizzes/` y se cargan automáticamente en el build.

---

## 1. Taxonomía de materias y temas

La estructura de carpetas define la navegación de la app:

```
src/quizzes/
  <subject>/
    <topic>/
      <quiz-id>.md
```

Ejemplos de subjects y topics posibles:

| subject        | topic              | Descripción                             |
|----------------|--------------------|-----------------------------------------|
| `lengua`       | `ortografia`       | Reglas de escritura y ortografía        |
| `lengua`       | `comprension`      | Comprensión lectora                     |
| `lengua`       | `gramatica`        | Sustantivos, verbos, adjetivos, etc.    |
| `matematica`   | `operaciones`      | Suma, resta, multiplicación, división   |
| `matematica`   | `fracciones`       | Comparación y operaciones con fracciones|
| `matematica`   | `problemas`        | Problemas de enunciado                  |
| `ciencias`     | `ecosistemas`      | Cadenas alimentarias, biomas            |
| `ciencias`     | `cuerpo-humano`    | Sistemas y órganos                      |
| `historia`     | `argentina`        | Historia argentina                      |
| `historia`     | `mundo`            | Historia universal                      |
| `ingles`       | `vocabulario`      | Palabras y traducciones                 |
| `ingles`       | `verbos`           | Formas verbales en inglés               |
| `deportes`     | `reglas`           | Reglas de distintos deportes            |

Para registrar un subject nuevo en la app:
1. Añadir entrada en `SUBJECT_META` en `src/pages/HomePage.jsx`
2. Añadir entrada en `TOPIC_META` en `src/pages/TopicPage.jsx` (si corresponde)

---

## 2. Formato del archivo `.md`

### Frontmatter (cabecera YAML)

```yaml
---
id: <subject>-<topic>-<id-numero>
title: "Título del quiz visible al alumno"
subject: <subject>
topic: <topic>
subtopic: <subtema-opcional>
difficulty: <1|2|3>
---
```

- `difficulty`: 1 = básico, 2 = intermedio, 3 = avanzado
- `id` debe ser único en todo el proyecto
- El `title` es lo que ve el alumno en la pantalla de selección

### Estructura de preguntas

Cada pregunta comienza con `## N.` (número seguido de punto). El parser usa esta marca para separar preguntas.

```markdown
## 1. Texto completo de la pregunta, puede incluir la regla o contexto necesario.

- a) Primera opción
- b) Segunda opción
- c) Tercera opción
- d) Cuarta opción
- e) Quinta opción

**Respuesta: c**
```

**Reglas de formato estrictas:**
- Siempre 10 preguntas por quiz
- Siempre exactamente 5 opciones (a, b, c, d, e)
- La respuesta correcta va en negrita: `**Respuesta: X**`
- El label de la respuesta debe coincidir exactamente con el de la opción (minúscula: a-e)
- Una línea en blanco entre el enunciado, cada opción, y la respuesta

---

## 3. Ejemplos de preguntas por materia

### Matemática — operaciones

```markdown
## 3. Una caja tiene 48 manzanas. Si las repartís en 6 bolsas iguales, ¿cuántas manzanas hay en cada bolsa?

- a) 6
- b) 7
- c) 8
- d) 9
- e) 10

**Respuesta: c**
```

### Ciencias — ecosistemas

```markdown
## 2. En una cadena alimentaria, el organismo que fabrica su propio alimento usando la luz solar se llama:

- a) consumidor primario
- b) consumidor secundario
- c) descomponedor
- d) productor
- e) depredador

**Respuesta: d**
```

### Historia — argentina

```markdown
## 5. ¿En qué año se declaró la Independencia de las Provincias Unidas del Río de la Plata?

- a) 1810
- b) 1813
- c) 1816
- d) 1820
- e) 1825

**Respuesta: c**
```

### Inglés — vocabulario

```markdown
## 1. ¿Cuál es la traducción correcta de "butterfly" al español?

- a) abeja
- b) libélula
- c) hormiga
- d) mariposa
- e) mosca

**Respuesta: d**
```

---

## 4. Principios pedagógicos

Seguí estas guías para que el quiz sea educativamente valioso:

| Principio                      | Qué hacer                                                                                           |
|--------------------------------|-----------------------------------------------------------------------------------------------------|
| **Regla explícita**            | Para preguntas de regla, enunciá la regla dentro de la pregunta (Q1, Q2). El alumno aprende y practica a la vez. |
| **Contexto significativo**     | Usá contextos reales y cercanos al alumno: escuela, familia, deportes, naturaleza argentina.        |
| **Distractores plausibles**    | Los distractores deben ser errores reales que cometen los alumnos, no opciones absurdas o irrelevantes. |
| **Progresión**                 | Q1-Q3: reconocimiento directo. Q4-Q6: aplicación en contexto. Q7-Q8: casos frontera o excepciones. Q9: repaso integrador. Q10: desafío. |
| **Distribución de respuestas** | No concentres todas las respuestas en la misma letra. Distribuí: 2 en a/b, 3 en c/d, 2 en e (aproximadamente). |
| **Pares confusibles**          | Si hay pares que se confunden (homófonos, conceptos similares), incluí preguntas que los contrasten directamente. |
| **Carga cognitiva**            | Enunciados claros y cortos. Una sola idea por pregunta. Evitá dobles negaciones ("¿cuál NO es incorrecto?"). |
| **Vocabulario apropiado**      | Usá el vocabulario y registro adecuados para la edad y país configurados en `docs/quiz-config.md`.  |

---

## 5. Estructura sugerida de 10 preguntas

| N°  | Tipo                     | Descripción                                               |
|-----|--------------------------|-----------------------------------------------------------|
| Q1  | Regla explícita          | Enunciado que explica la regla + pregunta directa         |
| Q2  | Aplicación directa       | Completar o identificar aplicando la regla de Q1          |
| Q3  | Par confusible o excepción | Contrastar dos conceptos o formas que se confunden      |
| Q4  | Aplicación en contexto   | La regla en una oración o situación real                  |
| Q5  | Segunda regla o variante | Introducir una segunda regla o caso relacionado           |
| Q6  | Aplicación segunda regla | Completar o identificar con la segunda regla              |
| Q7  | Caso frontera            | Situación menos obvia, requiere pensar más                |
| Q8  | Caso frontera 2          | Otro caso que los alumnos suelen errar                    |
| Q9  | Repaso integrador        | Mezcla ambas reglas; identificar la única opción correcta |
| Q10 | Desafío                  | Encontrar dos errores, o el caso más difícil del tema     |

---

## 6. Prompt para generar quizzes con un LLM

Copiá y completá este prompt al usar ChatGPT, Claude u otro LLM:

```
Creá un quiz para la app School Trainer siguiendo las instrucciones a continuación.

## Configuración del proyecto
Lee el archivo docs/quiz-config.md para conocer el país, la edad del alumno,
el nivel escolar, el idioma y las restricciones culturales. Respetá todas las
configuraciones al pie de la letra.

## Tarea
Materia: [subject]
Tema: [topic]
Subtema: [subtopic]
Dificultad: [1/2/3]
ID propuesto: [subject-topic-NN]
Título: "[Título descriptivo del quiz]"

## Qué debe cubrir el quiz
[Describí qué reglas, conceptos o habilidades debe practicar el alumno.
Sé específico: mencioná las reglas exactas, los pares confusibles, los casos
especiales. Cuanto más detallás, mejor será el quiz.]

## Formato requerido
- 10 preguntas numeradas como ## N.
- 5 opciones por pregunta (a, b, c, d, e)
- La respuesta correcta en **Respuesta: X**
- Frontmatter YAML completo al inicio (id, title, subject, topic, subtopic, difficulty)
- Respetá la estructura exacta del ejemplo en docs/HOW_TO_CREATE_MODULE.md

## Principios pedagógicos
- Q1-Q2: enunciado con regla explícita + aplicación directa
- Q3-Q4: pares confusibles o casos que los alumnos suelen errar
- Q5-Q6: segunda regla o variante del tema
- Q7-Q8: casos frontera
- Q9: repaso integrador (mezcla de reglas)
- Q10: desafío (dos errores, o el caso más difícil)
- Distractores plausibles: errores reales, no opciones absurdas
- Respuestas distribuidas en a, b, c, d, e (no todas en la misma letra)
```

---

## 7. Validación obligatoria antes de guardar el archivo

Antes de agregar un quiz al proyecto, ejecutá los siguientes controles:

### Nivel 1 — Validación de formato (automático con `npm run build`)

Después de escribir el archivo, corré:

```bash
npm run build
```

Si el build falla, el parser encontró un error de formato. Revisá:

| Check | Qué verificar |
|-------|--------------|
| F1 | El frontmatter abre y cierra con `---` en líneas propias |
| F2 | El campo `id` existe y es único en el proyecto |
| F3 | `subject` y `topic` coinciden con la carpeta donde está el archivo |
| F4 | `difficulty` es 1, 2 o 3 |
| F5 | Exactamente 10 preguntas (`## 1.` … `## 10.`) |
| F6 | Cada pregunta tiene exactamente las opciones a, b, c, d, e |
| F7 | Cada pregunta tiene una línea `**Respuesta: X**` donde X ∈ {a,b,c,d,e} |
| F8 | No hay líneas vacías extra dentro del bloque de opciones |

### Nivel 2 — Validación de contenido (manual)

Leé el archivo completo y verificá:

| Check | Qué verificar |
|-------|--------------|
| C1 | La respuesta marcada como correcta es efectivamente la respuesta correcta |
| C2 | Los distractores son errores plausibles, no opciones absurdas o irrelevantes |
| C3 | El vocabulario es apropiado para la edad configurada en `quiz-config.md` |
| C4 | Los contextos culturales son los apropiados para el país configurado |
| C5 | No hay regionalismos prohibidos (lista en `docs/quiz-config.md`) |
| C6 | El título refleja con precisión qué se practica en el quiz |
| C7 | Ninguna pregunta tiene dos respuestas posibles igualmente correctas |
| C8 | El enunciado de cada pregunta es autosuficiente (no depende de la anterior) |

### Nivel 3 — Validación pedagógica (manual)

| Check | Qué verificar |
|-------|--------------|
| P1 | Las preguntas progresan en dificultad (Q1 más fácil que Q10) |
| P2 | Las respuestas correctas están distribuidas entre a, b, c, d, e |
| P3 | Q9 mezcla al menos dos conceptos del quiz |
| P4 | Q10 es notablemente más desafiante que Q1 |
| P5 | Las reglas están explicitadas en los enunciados (no se asume conocimiento previo) |

### Reporte de validación

Cuando enviés un quiz para revisión o pull request, incluí un breve reporte:

```
Quiz: [id]
F: ✅ todos | ⚠️ F3: subject no coincide con carpeta
C: ✅ todos | ⚠️ C2: distractor en Q4 no es plausible
P: ✅ todos
```

---

## 8. Registrar el subject y topic en la app

Si el quiz usa un subject o topic nuevo que no existe en la app todavía:

**`src/pages/HomePage.jsx` — agregar en `SUBJECT_META`:**

```js
const SUBJECT_META = {
  lengua:      { label: 'Lengua',      emoji: '📚', color: 'bg-blue-100 ...' },
  matematica:  { label: 'Matemática',  emoji: '🔢', color: 'bg-green-100 ...' },
  ciencias:    { label: 'Ciencias',    emoji: '🔬', color: 'bg-yellow-100 ...' },
  historia:    { label: 'Historia',    emoji: '🏛️', color: 'bg-orange-100 ...' },
  ingles:      { label: 'Inglés',      emoji: '🌎', color: 'bg-purple-100 ...' },
  deportes:    { label: 'Deportes',    emoji: '⚽', color: 'bg-red-100 ...' },
  // agregar nuevos subjects aquí
};
```

**`src/pages/TopicPage.jsx` — agregar en `TOPIC_META`:**

```js
const TOPIC_META = {
  ortografia:      { label: 'Ortografía',      emoji: '✏️' },
  comprension:     { label: 'Comprensión',     emoji: '📖' },
  gramatica:       { label: 'Gramática',       emoji: '🔤' },
  operaciones:     { label: 'Operaciones',     emoji: '➕' },
  fracciones:      { label: 'Fracciones',      emoji: '½' },
  problemas:       { label: 'Problemas',       emoji: '🧮' },
  ecosistemas:     { label: 'Ecosistemas',     emoji: '🌿' },
  'cuerpo-humano': { label: 'Cuerpo humano',   emoji: '🫀' },
  argentina:       { label: 'Argentina',       emoji: '🇦🇷' },
  vocabulario:     { label: 'Vocabulario',     emoji: '💬' },
  // agregar nuevos topics aquí
};
```
