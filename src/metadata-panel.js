import { getDocumentMetadata } from './pdf-renderer.js'

const FIELDS = [
  { key: 'title',    label: 'Título' },
  { key: 'author',   label: 'Autor' },
  { key: 'subject',  label: 'Asunto' },
  { key: 'keywords', label: 'Palabras clave' },
  { key: 'creator',  label: 'Creado con' },
  { key: 'producer', label: 'Productor' },
]

const READ_ONLY_FIELDS = [
  { key: 'creationDate',     label: 'Fecha de creación' },
  { key: 'modificationDate', label: 'Fecha de modificación' },
]

export class MetadataPanel {
  constructor() {
    this._panel = null
    this._values = {}
    this._build()
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen()) this.close()
    })
  }

  async open() {
    this._values = await getDocumentMetadata()
    this._render()
    this._panel.hidden = false
  }

  close() {
    this._panel.hidden = true
  }

  isOpen() {
    return !this._panel.hidden
  }

  // Devuelve los metadatos actuales editados por el usuario
  getValues() {
    return { ...this._values }
  }

  _build() {
    const panel = document.createElement('div')
    panel.id = 'metadata-panel'
    panel.hidden = true
    panel.innerHTML = `
      <div id="metadata-header">
        <h2>Metadatos del documento</h2>
        <button id="metadata-close" title="Cerrar (Esc)">✕</button>
      </div>
      <div id="metadata-body"></div>
      <div id="metadata-footer">
        <button id="metadata-clear" class="btn btn-danger">Eliminar todos los metadatos</button>
      </div>
    `
    document.getElementById('app').appendChild(panel)
    panel.querySelector('#metadata-close').addEventListener('click', () => this.close())
    panel.querySelector('#metadata-clear').addEventListener('click', () => this.clearAll())
    this._panel = panel
  }

  _render() {
    const body = this._panel.querySelector('#metadata-body')
    body.innerHTML = ''

    FIELDS.forEach(({ key, label }) => {
      const row = document.createElement('div')
      row.className = 'meta-row'
      row.innerHTML = `
        <label>${label}</label>
        <input type="text" data-key="${key}" value="${this._escape(this._values[key] || '')}" />
      `
      row.querySelector('input').addEventListener('input', e => {
        this._values[key] = e.target.value
      })
      body.appendChild(row)
    })

    READ_ONLY_FIELDS.forEach(({ key, label }) => {
      if (!this._values[key]) return
      const row = document.createElement('div')
      row.className = 'meta-row'
      row.innerHTML = `
        <label>${label}</label>
        <span class="meta-readonly">${this._escape(this._values[key])}</span>
      `
      body.appendChild(row)
    })
  }

  clearAll() {
    FIELDS.forEach(({ key }) => { this._values[key] = '' })
    READ_ONLY_FIELDS.forEach(({ key }) => { this._values[key] = '' })
    this._render()
  }

  _escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  }
}
