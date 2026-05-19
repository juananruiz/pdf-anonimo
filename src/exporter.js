import { PDFDocument } from 'pdf-lib'
import { renderPageOffscreen, getTotalPages } from './pdf-renderer.js'

export async function exportAnonymizedPDF(redactions, originalName, metadata, onProgress, options = {}) {
  const totalPages = getTotalPages()
  const pdfDoc = await PDFDocument.create()

  // Aplicar metadatos editados (vacíos si fueron borrados)
  if (metadata.title)    pdfDoc.setTitle(metadata.title)
  if (metadata.author)   pdfDoc.setAuthor(metadata.author)
  if (metadata.subject)  pdfDoc.setSubject(metadata.subject)
  if (metadata.keywords) pdfDoc.setKeywords([metadata.keywords])
  if (metadata.creator)  pdfDoc.setCreator(metadata.creator)
  if (metadata.producer) pdfDoc.setProducer(metadata.producer)

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(pageNum, totalPages)

    const { blob, width, height } = await renderPageOffscreen(pageNum, redactions)
    const arrayBuffer = await blob.arrayBuffer()
    const pngImage = await pdfDoc.embedPng(arrayBuffer)
    const page = pdfDoc.addPage([width, height])
    page.drawImage(pngImage, { x: 0, y: 0, width, height })
  }

  const pdfBytes = await pdfDoc.save()
  const baseName = originalName.replace(/\.pdf$/i, '')
  const downloadName = `${baseName}-anonimizado.pdf`

  // octet-stream fuerza descarga en Chrome (application/pdf lo abre en el visor)
  const downloadUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/octet-stream' }))
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = downloadName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)

  if (options.open) {
    const openUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    window.open(openUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(openUrl), 2000)
  }
}
