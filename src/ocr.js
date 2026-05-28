import { createWorker } from 'tesseract.js'
import { renderPageToCanvas, DEFAULT_SCALE } from './pdf-renderer.js'

// Simple OCR module using tesseract.js. Exports helpers to recognize a page
// and to find likely PII matches (emails, phones, IBAN, NIF, ...)

const workers = new Map()

export async function initOCR(lang = 'spa', logger = null) {
  if (workers.has(lang)) return workers.get(lang)
  const worker = createWorker({ logger: logger || (() => {}) })
  await worker.load()
  await worker.loadLanguage(lang)
  await worker.initialize(lang)
  workers.set(lang, worker)
  return worker
}

export async function recognizePage(pageNum, { lang = 'spa', scale = DEFAULT_SCALE, logger = null } = {}) {
  // Render page at requested scale to an offscreen canvas and run Tesseract on it
  const { canvas, width, height } = await renderPageToCanvas(pageNum, scale)
  const worker = await initOCR(lang, logger)

  const result = await worker.recognize(canvas)
  const data = result.data || {}

  // Normalize words to a simple shape: { text, confidence, bbox: { x,y,w,h } }
  const words = (data.words || []).map(w => {
    const bbox = w.bbox || {}
    const x0 = bbox.x0 ?? bbox.x ?? 0
    const y0 = bbox.y0 ?? bbox.y ?? 0
    const x1 = bbox.x1 ?? bbox.x1 ?? (bbox.x0 != null && bbox.x1 != null ? bbox.x1 : x0)
    const y1 = bbox.y1 ?? bbox.y1 ?? (bbox.y0 != null && bbox.y1 != null ? bbox.y1 : y0)
    const wbox = (typeof x1 === 'number' && typeof x0 === 'number') ? (x1 - x0) : (bbox.w ?? 0)
    const hbox = (typeof y1 === 'number' && typeof y0 === 'number') ? (y1 - y0) : (bbox.h ?? 0)
    return {
      text: w.text || '',
      confidence: w.confidence ?? 0,
      bbox: { x: x0, y: y0, w: wbox, h: hbox }
    }
  })

  return { text: data.text || '', words, width, height, raw: data }
}

// Heurísticas simples para detectar PII dentro del texto reconocido.
// Devuelve rectángulos aproximados para añadir redacciones.
export function findPIIMatches(words, { maxGroup = 6 } = {}) {
  const patterns = [
    { name: 'email', regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
    { name: 'phone', regex: /\b(?:\+?\d{1,3}[\s-]?)?(?:\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4})\b/ },
    { name: 'nif', regex: /\b\d{7,8}[A-Z]\b/i },
    { name: 'iban', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/ },
  ]

  const matches = []
  const used = new Array(words.length).fill(false)

  for (let i = 0; i < words.length; i++) {
    if (used[i]) continue
    let groupText = ''
    for (let j = i; j < Math.min(words.length, i + maxGroup); j++) {
      groupText = groupText ? groupText + ' ' + words[j].text : words[j].text
      const segment = words.slice(i, j + 1)
      const box = unionBoxes(segment.map(w => w.bbox))
      for (const p of patterns) {
        const m = groupText.match(p.regex)
        if (m) {
          matches.push({
            type: p.name,
            text: m[0],
            x: box.x,
            y: box.y,
            w: box.w,
            h: box.h,
          })
          for (let k = i; k <= j; k++) used[k] = true
          j = i + maxGroup // break inner loop
          break
        }
      }
    }
  }

  return matches
}

function unionBoxes(boxes) {
  if (!boxes || boxes.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
  boxes.forEach(b => {
    if (!b) return
    x1 = Math.min(x1, b.x)
    y1 = Math.min(y1, b.y)
    x2 = Math.max(x2, b.x + (b.w || 0))
    y2 = Math.max(y2, b.y + (b.h || 0))
  })
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}
