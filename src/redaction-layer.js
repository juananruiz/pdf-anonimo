import { drawRedactionShape } from './pdf-renderer.js'

export class RedactionLayer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.redactions = new Map()
    this.currentPage = 1
    this.activeTool = 'box'
    this.drawing = false
    this.startX = 0
    this.startY = 0
    this.currentRect = null
    this._rafPending = false
    this.onRedactionChange = null
    this._bindEvents()
  }

  setPage(pageNum) {
    this.currentPage = pageNum
    this.redraw()
  }

  setTool(tool) {
    this.activeTool = tool
  }

  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.redraw()
  }

  undo() {
    const list = this.redactions.get(this.currentPage)
    if (list && list.length > 0) {
      list.pop()
      this.redraw()
      this.onRedactionChange?.()
      return true
    }
    return false
  }

  clearPage() {
    this.redactions.delete(this.currentPage)
    this.redraw()
    this.onRedactionChange?.()
  }

  hasAnyRedaction() {
    for (const [, list] of this.redactions) {
      if (list.length > 0) return true
    }
    return false
  }

  getRedactions() {
    return this.redactions
  }

  getPageRedactions(pageNum = this.currentPage) {
    return this.redactions.get(pageNum) || []
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.getPageRedactions().forEach(r => drawRedactionShape(this.ctx, r))
  }

  destroy() {
    for (const [event, handler] of Object.entries(this._handlers)) {
      this.canvas.removeEventListener(event, handler)
    }
  }

  _bindEvents() {
    this._handlers = {
      mousedown: e => this._onDown(e),
      mousemove: e => this._onMove(e),
      mouseup:   e => this._onUp(e),
      mouseleave: e => this._onUp(e),
    }
    for (const [event, handler] of Object.entries(this._handlers)) {
      this.canvas.addEventListener(event, handler)
    }
  }

  _coords(e) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
    }
  }

  _onDown(e) {
    const { x, y } = this._coords(e)
    this.drawing = true
    this.startX = x
    this.startY = y
  }

  _onMove(e) {
    if (!this.drawing) return
    const { x, y } = this._coords(e)
    this.currentRect = {
      x: Math.min(this.startX, x),
      y: Math.min(this.startY, y),
      w: Math.abs(x - this.startX),
      h: Math.abs(y - this.startY),
    }
    if (this._rafPending) return
    this._rafPending = true
    requestAnimationFrame(() => {
      this._rafPending = false
      this.redraw()
      if (this.currentRect) drawRedactionShape(this.ctx, { type: this.activeTool, ...this.currentRect }, 0.7)
    })
  }

  _onUp() {
    if (!this.drawing) return
    this.drawing = false

    if (this.currentRect && this.currentRect.w > 4 && this.currentRect.h > 4) {
      const redaction = { type: this.activeTool, ...this.currentRect }
      if (!this.redactions.has(this.currentPage)) this.redactions.set(this.currentPage, [])
      this.redactions.get(this.currentPage).push(redaction)
      this.onRedactionChange?.()
    }

    this.currentRect = null
    this.redraw()
  }
}
