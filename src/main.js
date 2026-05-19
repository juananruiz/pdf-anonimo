import './styles.css'
import { renderPage } from './pdf-renderer.js'
import { DocumentManager } from './document-manager.js'
import { MetadataPanel } from './metadata-panel.js'
import { exportAnonymizedPDF } from './exporter.js'

// ── DOM ──
const dropZone      = document.getElementById('drop-zone')
const workspace     = document.getElementById('workspace')
const fileInput     = document.getElementById('file-input')
const fileName      = document.getElementById('file-name')
const pdfCanvas     = document.getElementById('pdf-canvas')
const redactionCanvas = document.getElementById('redaction-canvas')
const pageInfo      = document.getElementById('page-info')
const btnPrev       = document.getElementById('btn-prev')
const btnNext       = document.getElementById('btn-next')
const btnUndo       = document.getElementById('btn-undo')
const btnClear      = document.getElementById('btn-clear')
const btnSave       = document.getElementById('btn-save')
const btnSaveOpen   = document.getElementById('btn-save-open')
const btnOpen       = document.getElementById('btn-open')
const btnMetadata   = document.getElementById('btn-metadata')
const btnClearMeta  = document.getElementById('btn-clear-meta')
const toolBox       = document.getElementById('tool-box')
const toolStrike    = document.getElementById('tool-strike')
const docList       = document.getElementById('doc-list')

// ── Estado ──
let currentPage = 1
let docManager = null
let metaPanel = null

// ── Init ──
docManager = new DocumentManager(redactionCanvas)
docManager.onSwitch = onDocumentSwitch
metaPanel = new MetadataPanel()

// ── Carga de PDF ──
// Drop zone principal (pantalla de bienvenida)
dropZone.addEventListener('click', () => fileInput.click())
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
dropZone.addEventListener('drop', async e => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')
  const files = [...e.dataTransfer.files].filter(f => f.type === 'application/pdf')
  for (const file of files) await loadFile(file)
})

// Botón sidebar
btnOpen.addEventListener('click', () => fileInput.click())
fileInput.addEventListener('change', async e => {
  const files = [...e.target.files].filter(f => f.type === 'application/pdf')
  for (const file of files) await loadFile(file)
  fileInput.value = ''
})

async function loadFile(file) {
  showLoading('Cargando documento…')
  try {
    await docManager.add(file)
    if (!dropZone.hidden) {
      dropZone.hidden = true
      workspace.hidden = false
      btnSave.disabled = false
      btnSaveOpen.disabled = false
      btnMetadata.disabled = false
      btnClearMeta.disabled = false
    }
  } catch (err) {
    alert('Error al cargar el PDF: ' + err.message)
  } finally {
    hideLoading()
  }
}

// ── Cambio de documento activo ──
async function onDocumentSwitch(doc) {
  currentPage = 1
  docManager.activeLayer.onRedactionChange = updateUndoState
  fileName.textContent = doc.name
  renderDocList()
  await goToPage(1)
  if (metaPanel.isOpen()) metaPanel.open()
}

// ── Sidebar ──
function renderDocList() {
  docList.innerHTML = ''
  const activeId = docManager.getActive()?.id
  docManager.getAll().forEach(doc => {
    const li = document.createElement('li')
    li.className = 'doc-item' + (doc.id === activeId ? ' active' : '')
    li.innerHTML = `
      <div class="doc-item-name" title="${escapeAttr(doc.name)}">${escapeHtml(doc.name)}</div>
      <div class="doc-item-pages">${doc.totalPages} página${doc.totalPages !== 1 ? 's' : ''}</div>
    `
    li.addEventListener('click', () => switchDoc(doc.id))
    docList.appendChild(li)
  })
}

async function switchDoc(id) {
  if (docManager.getActive()?.id === id) return
  showLoading('Cambiando documento…')
  try {
    await docManager.activate(id)
  } finally {
    hideLoading()
  }
}

// ── Navegación ──
btnPrev.addEventListener('click', () => { if (currentPage > 1) goToPage(currentPage - 1) })
btnNext.addEventListener('click', () => {
  const doc = docManager.getActive()
  if (doc && currentPage < doc.totalPages) goToPage(currentPage + 1)
})

async function goToPage(pageNum) {
  const doc = docManager.getActive()
  if (!doc) return
  currentPage = pageNum
  doc.redactionLayer.setPage(pageNum)

  const { width, height } = await renderPage(pageNum, pdfCanvas)
  doc.redactionLayer.resize(width, height)

  pageInfo.textContent = `Página ${currentPage} de ${doc.totalPages}`
  btnPrev.disabled = currentPage <= 1
  btnNext.disabled = currentPage >= doc.totalPages
  updateUndoState()
}

// ── Herramientas ──
toolBox.addEventListener('click', () => setTool('box'))
toolStrike.addEventListener('click', () => setTool('strike'))

function setTool(tool) {
  docManager.getActive()?.redactionLayer.setTool(tool)
  toolBox.classList.toggle('active', tool === 'box')
  toolStrike.classList.toggle('active', tool === 'strike')
}

function updateUndoState() {
  const doc = docManager.getActive()
  btnUndo.disabled = !doc || doc.redactionLayer.getPageRedactions(currentPage).length === 0
}

// ── Edición ──
btnUndo.addEventListener('click', () => docManager.getActive()?.redactionLayer.undo())
btnClear.addEventListener('click', () => {
  if (confirm('¿Eliminar todas las redacciones de esta página?')) {
    docManager.getActive()?.redactionLayer.clearPage()
  }
})

// ── Metadatos ──
btnMetadata.addEventListener('click', () => {
  if (metaPanel.isOpen()) metaPanel.close()
  else metaPanel.open()
})

btnClearMeta.addEventListener('click', () => {
  if (confirm('¿Eliminar todos los metadatos del documento exportado?')) {
    metaPanel.clearAll()
  }
})

// ── Exportar ──
async function doExport(options = {}) {
  const doc = docManager.getActive()
  if (!doc) return

  if (!doc.redactionLayer.hasAnyRedaction()) {
    const ok = confirm('No has marcado ninguna redacción.\n¿Deseas exportar el documento sin cambios?')
    if (!ok) return
  }

  const metadata = metaPanel.getValues()
  showLoading('Generando PDF anonimizado…')
  try {
    await exportAnonymizedPDF(
      doc.redactionLayer.getRedactions(),
      doc.name,
      metadata,
      (current, total) => updateLoadingMessage(`Procesando página ${current} de ${total}…`),
      options
    )
  } catch (err) {
    alert('Error al exportar: ' + err.message)
  } finally {
    hideLoading()
  }
}

btnSave.addEventListener('click', () => doExport())
btnSaveOpen.addEventListener('click', () => doExport({ open: true }))

// ── Loading overlay ──
function showLoading(msg) {
  let overlay = document.getElementById('loading-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'loading-overlay'
    overlay.innerHTML = `<div class="spinner"></div><p></p>`
    document.body.appendChild(overlay)
  }
  overlay.querySelector('p').textContent = msg
  overlay.hidden = false
}

function updateLoadingMessage(msg) {
  const overlay = document.getElementById('loading-overlay')
  if (overlay) overlay.querySelector('p').textContent = msg
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay')
  if (overlay) overlay.hidden = true
}

// ── Utils ──
function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;') }
function escapeAttr(str) { return String(str).replace(/"/g,'&quot;') }
