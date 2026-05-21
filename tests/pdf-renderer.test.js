import { describe, it, expect, beforeEach } from 'vitest'
import { drawRedactionShape } from '../src/pdf-renderer.js'

describe('drawRedactionShape', () => {
  let canvas, ctx

  beforeEach(() => {
    // Mock canvas
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    ctx = canvas.getContext('2d')
  })

  it('debería dibujar caja negra para tipo "box"', () => {
    const redaction = { type: 'box', x: 10, y: 10, w: 100, h: 50 }
    const saveStub = () => {}
    const restoreStub = () => {}

    ctx.save = saveStub
    ctx.restore = restoreStub

    const originalFillRect = ctx.fillRect
    let fillRectCalled = false
    let capturedFillStyle = null

    ctx.fillRect = function(x, y, w, h) {
      fillRectCalled = true
      capturedFillStyle = this.fillStyle
      return originalFillRect.call(this, x, y, w, h)
    }

    drawRedactionShape(ctx, redaction)

    expect(fillRectCalled).toBe(true)
    expect(capturedFillStyle).toBe('#000000')
  })

  it('debería dibujar línea roja para tipo "strike"', () => {
    const redaction = { type: 'strike', x: 10, y: 10, w: 100, h: 50 }

    const originalStroke = ctx.stroke
    let strokeCalled = false
    let capturedStrokeStyle = null

    ctx.stroke = function() {
      strokeCalled = true
      capturedStrokeStyle = this.strokeStyle
      return originalStroke.call(this)
    }

    drawRedactionShape(ctx, redaction)

    expect(strokeCalled).toBe(true)
    expect(capturedStrokeStyle).toBe('#cc0000')
  })

  it('debería dibujar amarillo para tipo "highlight"', () => {
    const redaction = { type: 'highlight', x: 10, y: 10, w: 100, h: 50 }

    const originalFillRect = ctx.fillRect
    let capturedFillStyle = null

    ctx.fillRect = function(x, y, w, h) {
      capturedFillStyle = this.fillStyle
      return originalFillRect.call(this, x, y, w, h)
    }

    drawRedactionShape(ctx, redaction)

    expect(capturedFillStyle.toLowerCase()).toBe('#ffff00')
  })

  it('debería aplicar alpha para box', () => {
    const redaction = { type: 'box', x: 10, y: 10, w: 100, h: 50 }
    const alpha = 0.8

    const originalFillRect = ctx.fillRect
    let capturedGlobalAlpha = null

    ctx.fillRect = function(x, y, w, h) {
      capturedGlobalAlpha = ctx.globalAlpha
      return originalFillRect.call(this, x, y, w, h)
    }

    drawRedactionShape(ctx, redaction, alpha)

    expect(capturedGlobalAlpha).toBeCloseTo(alpha, 5)
  })

  it('debería aplicar alpha reducido para highlight', () => {
    const redaction = { type: 'highlight', x: 10, y: 10, w: 100, h: 50 }
    const alpha = 1

    const originalFillRect = ctx.fillRect
    let capturedGlobalAlpha = null

    ctx.fillRect = function(x, y, w, h) {
      capturedGlobalAlpha = ctx.globalAlpha
      return originalFillRect.call(this, x, y, w, h)
    }

    drawRedactionShape(ctx, redaction, alpha)

    expect(capturedGlobalAlpha).toBeCloseTo(alpha * 0.4, 5)
  })

  it('debería pixelar región para tipo "smear" usando pdfCanvas', () => {
    const pdfCanvas = document.createElement('canvas')
    pdfCanvas.width = 800
    pdfCanvas.height = 600
    const pdfCtx = pdfCanvas.getContext('2d')
    pdfCtx.fillStyle = '#ff0000'
    pdfCtx.fillRect(0, 0, 800, 600)

    const redaction = { type: 'smear', x: 10, y: 10, w: 100, h: 50 }

    let drawImageCalled = false
    const originalDrawImage = ctx.drawImage
    ctx.drawImage = function(...args) {
      drawImageCalled = true
      return originalDrawImage.apply(this, args)
    }

    drawRedactionShape(ctx, redaction, 1, 1, pdfCanvas)

    expect(drawImageCalled).toBe(true)
    const pixel = ctx.getImageData(50, 30, 1, 1).data
    expect(pixel[0]).toBeGreaterThan(0)
  })

  it('debería aplicar scaleFactor a coordenadas', () => {
    const redaction = { type: 'box', x: 10, y: 10, w: 100, h: 50 }
    const scaleFactor = 2

    const originalFillRect = ctx.fillRect
    let capturedCoords = null

    ctx.fillRect = function(x, y, w, h) {
      capturedCoords = { x, y, w, h }
      return originalFillRect.call(this, x, y, w, h)
    }

    drawRedactionShape(ctx, redaction, 1, scaleFactor)

    expect(capturedCoords.x).toBe(20)
    expect(capturedCoords.y).toBe(20)
    expect(capturedCoords.w).toBe(200)
    expect(capturedCoords.h).toBe(100)
  })
})
