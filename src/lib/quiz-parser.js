/**
 * Minimal YAML-like frontmatter parser for browser compatibility.
 * Supports: string values (with/without quotes), integer values, null.
 * @param {string} raw
 * @returns {{ data: Record<string, any>, content: string }}
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const data = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    if (!key) continue
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    } else if (value === 'null' || value === '') {
      value = null
    } else if (/^\d+$/.test(value)) {
      value = parseInt(value, 10)
    }
    data[key] = value
  }

  return { data, content: match[2] }
}

/**
 * Parse raw .md content into a structured Quiz object.
 *
 * Expected markdown structure:
 * ---
 * id: vb-basico-01
 * title: "Uso de V y B - Nivel Básico 1"
 * subject: lengua
 * topic: ortografia
 * subtopic: v-vs-b
 * difficulty: 1
 * ---
 *
 * ## 1. Texto de la pregunta con _____ en blanco.
 *
 * - a) opcion1
 * - b) opcion2
 * - c) opcion3
 * - d) opcion4
 * - e) opcion5
 *
 * **Respuesta: a**
 *
 * @param {string} raw - Raw markdown string
 * @returns {{ id, title, subject, topic, subtopic, difficulty, questions: Array<{ text, options, answer }> }}
 */
export function parseQuiz(raw) {
  const { data: frontmatter, content } = parseFrontmatter(raw)

  // Split body into question blocks by "## N." headers
  const questionBlocks = content
    .split(/^##\s+\d+\./m)
    .map((b) => b.trim())
    .filter(Boolean)

  const questions = questionBlocks.map((block) => {
    // Extract answer line first, then remove it from block
    const answerMatch = block.match(/\*\*Respuesta:\s*([a-e])\*\*/i)
    const answer = answerMatch ? answerMatch[1].toLowerCase() : null

    // Remove answer line
    const blockWithoutAnswer = block.replace(/\*\*Respuesta:\s*[a-e]\*\*/i, '').trim()

    // Extract options (lines starting with "- x)")
    const optionLines = blockWithoutAnswer.match(/^-\s+([a-e])\)\s+(.+)$/gm) || []
    const options = optionLines.map((line) => {
      const match = line.match(/^-\s+([a-e])\)\s+(.+)$/)
      return { key: match[1].toLowerCase(), text: match[2].trim() }
    })

    // Question text is everything before the first option line
    const optionStart = blockWithoutAnswer.search(/^-\s+[a-e]\)/m)
    const text =
      optionStart === -1
        ? blockWithoutAnswer.trim()
        : blockWithoutAnswer.slice(0, optionStart).trim()

    return { text, options, answer }
  })

  return {
    id: frontmatter.id,
    title: frontmatter.title,
    subject: frontmatter.subject,
    topic: frontmatter.topic,
    subtopic: frontmatter.subtopic ?? null,
    difficulty: frontmatter.difficulty ?? 1,
    questions,
  }
}
