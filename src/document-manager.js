import { loadPDFDoc, setActiveDocument } from './pdf-renderer.js'
import { RedactionLayer } from './redaction-layer.js'

let nextId = 1

export class DocumentManager {
  constructor(redactionCanvas) {
    this.redactionCanvas = redactionCanvas
    this.documents = []    // [{ id, name, pdfDoc, totalPages, savedRedactions }]
    this.activeId = null
    this.activeLayer = null   // única RedactionLayer viva en todo momento
    this.onSwitch = null      // callback(doc) al cambiar de documento activo
  }

  async add(file) {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await loadPDFDoc(arrayBuffer)
    const id = nextId++
    const doc = { id, name: file.name, pdfDoc, totalPages: pdfDoc.numPages, savedRedactions: new Map() }
    this.documents.push(doc)
    await this.activate(id)
    return doc
  }

  async activate(id) {
    // Guardar redacciones del documento activo antes de salir
    if (this.activeId !== null && this.activeLayer) {
      const prev = this._get(this.activeId)
      if (prev) prev.savedRedactions = this._cloneRedactions(this.activeLayer.getRedactions())
      this.activeLayer.destroy()
      this.activeLayer = null
    }

    const doc = this._get(id)
    if (!doc) throw new Error(`Documento ${id} no encontrado`)

    // Crear nueva layer y restaurar redacciones guardadas
    this.activeLayer = new RedactionLayer(this.redactionCanvas)
    for (const [page, list] of doc.savedRedactions) {
      this.activeLayer.getRedactions().set(page, [...list])
    }

    this.activeId = id
    setActiveDocument(doc.pdfDoc)
    this.onSwitch?.(this.getActive())
    return this.getActive()
  }

  getActive() {
    const doc = this._get(this.activeId)
    if (!doc) return null
    return { ...doc, redactionLayer: this.activeLayer }
  }

  getAll() {
    return this.documents
  }

  _get(id) {
    return this.documents.find(d => d.id === id) || null
  }

  _cloneRedactions(redactions) {
    return new Map([...redactions].map(([k, v]) => [k, [...v]]))
  }
}
