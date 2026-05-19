import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href

export const DEFAULT_SCALE = 1.5
export const EXPORT_SCALE = 2.5

let pdfDocument = null
let offscreenCanvas = null

export async function loadPDFDoc(arrayBuffer) {
  return pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
}

export function setActiveDocument(doc) {
  pdfDocument = doc
}

export async function getDocumentMetadata() {
  if (!pdfDocument) return {}
  const { info } = await pdfDocument.getMetadata()
  return {
    title:    info.Title    || '',
    author:   info.Author   || '',
    subject:  info.Subject  || '',
    keywords: info.Keywords || '',
    creator:  info.Creator  || '',
    producer: info.Producer || '',
    creationDate:     info.CreationDate     || '',
    modificationDate: info.ModDate || '',
  }
}

async function getPageViewport(pageNum, scale) {
  const page = await pdfDocument.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  return { page, viewport }
}

export async function renderPage(pageNum, canvas, scale = DEFAULT_SCALE) {
  if (!pdfDocument) throw new Error('No hay documento cargado')
  const { page, viewport } = await getPageViewport(pageNum, scale)
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise
  return { width: viewport.width, height: viewport.height }
}

export async function renderPageOffscreen(pageNum, redactions, scale = EXPORT_SCALE) {
  if (!pdfDocument) throw new Error('No hay documento cargado')
  const { page, viewport } = await getPageViewport(pageNum, scale)

  if (!offscreenCanvas) offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = viewport.width
  offscreenCanvas.height = viewport.height

  const ctx = offscreenCanvas.getContext('2d')
  await page.render({ canvasContext: ctx, viewport }).promise

  const pageRedactions = redactions.get(pageNum) || []
  pageRedactions.forEach(r => drawRedactionShape(ctx, r, 1, scale / DEFAULT_SCALE))

  const blob = await new Promise(resolve => offscreenCanvas.toBlob(resolve, 'image/png'))
  return { blob, width: viewport.width, height: viewport.height }
}

export function drawRedactionShape(ctx, r, alpha = 1, scaleFactor = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  const x = r.x * scaleFactor
  const y = r.y * scaleFactor
  const w = r.w * scaleFactor
  const h = r.h * scaleFactor
  if (r.type === 'box') {
    ctx.fillStyle = '#000000'
    ctx.fillRect(x, y, w, h)
  } else if (r.type === 'strike') {
    ctx.strokeStyle = '#cc0000'
    ctx.lineWidth = Math.max(h, 3)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y + h / 2)
    ctx.lineTo(x + w, y + h / 2)
    ctx.stroke()
  } else if (r.type === 'highlight') {
    ctx.fillStyle = '#FFFF00'
    ctx.globalAlpha = alpha * 0.4
    ctx.fillRect(x, y, w, h)
  }
  ctx.restore()
}

export function getTotalPages() {
  return pdfDocument ? pdfDocument.numPages : 0
}
