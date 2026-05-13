# Cómo crear un módulo de quiz

Los quizzes se almacenan en la tabla `quizzes` de Supabase. Se pueden crear de tres formas:
1. **Formulario docente** — `/teacher/quizzes/new` en la app
2. **LLM + Supabase MCP** — el método recomendado para crear muchos quizzes rápido (ver abajo)
3. **SQL directo** — INSERT en el SQL Editor de Supabase

Los archivos `.md` en `src/quizzes/` son material de referencia histórico. **No se usan en runtime.**

---

## 1. Taxonomía de materias y temas

La navegación de la app se construye dinámicamente desde los valores `subject` y `topic` en la tabla `quizzes`.

Ejemplos de subjects y topics posibles:

| subject        | topic              | Descripción                             |
|----------------|--------------------|-----------------------------------------|
| `lengua`       | `ortografia`       | Reglas de escritura y ortografía        |
| `lengua`       | `comprension`      | Comprensión lectora                     |
| `lengua`       | `gramatica`        | Sustantivos, verbos, adjetivos, etc.    |
| `matematica`   | `operaciones`      | Suma, resta, multiplicación, división   |
| `matematica`   | `fracciones`       | Comparación y operaciones con fracciones|
| `matematica`   | `tablas`           | Tablas de multiplicar                   |
| `matematica`   | `problemas`        | Problemas de enunciado                  |
| `ciencias`     | `ecosistemas`      | Cadenas alimentarias, biomas            |
| `ciencias`     | `cuerpo-humano`    | Sistemas y órganos                      |
| `historia`     | `argentina`        | Historia argentina                      |
| `historia`     | `mundo`            | Historia universal                      |
| `ingles`       | `vocabulario`      | Palabras y traducciones                 |
| `ingles`       | `verbos`           | Formas verbales en inglés               |
| `deportes`     | `reglas`           | Reglas de distintos deportes            |

**Para que un subject nuevo aparezca con ícono y color en el Home**, añadirlo en `SUBJECT_META` en `src/pages/HomePage.jsx`. Si no está, aparece con valores por defecto.

---

## 2. Shape del registro en la tabla `quizzes`

```json
{
  "id": "materia-tema-subtema-01",
  "title": "🔤 Título descriptivo para el alumno",
  "subject": "lengua",
  "topic": "ortografia",
  "subtopic": "letra-h",
  "difficulty": 1,
  "is_published": true,
  "created_by": null,
  "questions": [
    {
      "text": "Enunciado de la pregunta",
      "options": [
        { "key": "a", "text": "Primera opción" },
        { "key": "b", "text": "Segunda opción" },
        { "key": "c", "text": "Tercera opción" },
        { "key": "d", "text": "Cuarta opción" },
        { "key": "e", "text": "Quinta opción" }
      ],
      "answer": "b"
    }
  ]
}
```

**Reglas:**
- `id`: kebab-case único. Ej: `lengua-ortografia-h-01`
- `subject` y `topic`: **minúsculas sin acentos** (se usan como rutas URL)
- `difficulty`: `1` = Básico, `2` = Intermedio, `3` = Avanzado
- `questions`: 8 a 10 preguntas
- `options`: exactamente 5 (claves `a` al `e`)
- `answer`: debe coincidir con una clave (`"a"` a `"e"`)

---

## 3. Crear con LLM + Supabase MCP (recomendado)

Ver la sección **"Inserción de quizzes via Supabase MCP"** en `docs/quiz-config.md`.

Resumen del flujo:
1. Configurar `.vscode/mcp.json` con la `service_role` key de Supabase
2. Abrir GitHub Copilot Agent con acceso al MCP
3. Usar el prompt modelo de `docs/quiz-config.md` indicando materia, tema y dificultad
4. El LLM genera el quiz y lo inserta directamente en la tabla `quizzes`

---

## 4. Principios pedagógicos

Seguí estas guías para que el quiz sea educativamente valioso:

| Principio                      | Qué hacer                                                                                           |
|--------------------------------|-----------------------------------------------------------------------------------------------------|
| **Regla explícita**            | Para preguntas de regla, enunciá la regla dentro de la pregunta (Q1, Q2). El alumno aprende y practica a la vez. |
| **Contexto significativo**     | Usá contextos reales y cercanos al alumno: escuela, familia, deportes, naturaleza argentina.        |
| **Distractores plausibles**    | Los distractores deben ser errores reales que cometen los alumnos, no opciones absurdas.            |
| **Progresión**                 | Q1-Q3: reconocimiento directo. Q4-Q6: aplicación en contexto. Q7-Q8: casos frontera. Q9: repaso integrador. Q10: desafío. |
| **Distribución de respuestas** | No concentres todas las respuestas en la misma letra.                                               |
| **Vocabulario apropiado**      | Usá el vocabulario y registro adecuados para la edad y país configurados en `docs/quiz-config.md`. |

---

## 5. Estructura sugerida de 10 preguntas

| N°  | Tipo                     | Descripción                                               |
|-----|--------------------------|-----------------------------------------------------------|
| Q1  | Regla explícita          | Enunciado que explica la regla + pregunta directa         |
| Q2  | Aplicación directa       | Completar o identificar aplicando la regla de Q1          |
| Q3  | Par confusible           | Contrastar dos conceptos o formas que se confunden        |
| Q4  | Aplicación en contexto   | La regla en una oración o situación real                  |
| Q5  | Segunda regla o variante | Introducir una segunda regla o caso relacionado           |
| Q6  | Aplicación segunda regla | Completar o identificar con la segunda regla              |
| Q7  | Caso frontera            | Situación menos obvia, requiere pensar más                |
| Q8  | Caso frontera 2          | Otro caso que los alumnos suelen errar                    |
| Q9  | Repaso integrador        | Mezcla ambas reglas; identificar la única opción correcta |
| Q10 | Desafío                  | Encontrar dos errores, o el caso más difícil del tema     |

---

## 6. Validación antes de publicar

### Validación de formato
| Check | Qué verificar |
|-------|--------------|
| F1 | `id` es único (no existe otro quiz con ese id en la tabla) |
| F2 | `subject` y `topic` están en minúsculas sin acentos |
| F3 | `difficulty` es 1, 2 o 3 |
| F4 | Exactamente 5 opciones por pregunta (a, b, c, d, e) |
| F5 | `answer` coincide con una de las claves de `options` |
| F6 | Todas las opciones tienen texto no vacío |

### Validación de contenido
| Check | Qué verificar |
|-------|--------------|
| C1 | La respuesta marcada como correcta es efectivamente correcta |
| C2 | Los distractores son errores plausibles, no absurdos |
| C3 | El vocabulario es apropiado para la edad configurada en `quiz-config.md` |
| C4 | No hay regionalismos prohibidos (lista en `docs/quiz-config.md`) |
| C5 | El título refleja con precisión qué se practica |

### Validación pedagógica
| Check | Qué verificar |
|-------|--------------|
| P1 | Las preguntas progresan en dificultad |
| P2 | Las respuestas correctas están distribuidas entre a, b, c, d, e |
| P3 | Q9 mezcla al menos dos conceptos del quiz |
| P4 | Q10 es notablemente más desafiante que Q1 |

