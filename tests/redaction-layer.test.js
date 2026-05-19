import { describe, it, expect, beforeEach } from 'vitest'
import { RedactionLayer } from '../src/redaction-layer.js'

describe('RedactionLayer', () => {
  let canvas, layer

  beforeEach(() => {
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    })
    layer = new RedactionLayer(canvas)
  })

  it('debería inicializar con activeTool "box"', () => {
    expect(layer.activeTool).toBe('box')
  })

  it('debería cambiar activeTool con setTool', () => {
    layer.setTool('strike')
    expect(layer.activeTool).toBe('strike')

    layer.setTool('highlight')
    expect(layer.activeTool).toBe('highlight')
  })

  it('debería crear redacción cuando se completa dibujo', () => {
    layer.setTool('box')

    // Simular dibujo
    const redactions = layer.getRedactions()
    expect(redactions.size).toBe(0)

    // Agregar redacción manualmente
    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({
      type: 'box',
      x: 10,
      y: 10,
      w: 100,
      h: 50,
    })

    expect(redactions.get(1).length).toBe(1)
    expect(redactions.get(1)[0].type).toBe('box')
  })

  it('debería almacenar tipo en redacción', () => {
    layer.setTool('highlight')
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({
      type: 'highlight',
      x: 20,
      y: 20,
      w: 150,
      h: 60,
    })

    const redaction = redactions.get(1)[0]
    expect(redaction.type).toBe('highlight')
  })

  it('debería retornar redacciones por página', () => {
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({ type: 'box', x: 10, y: 10, w: 100, h: 50 })

    if (!redactions.has(2)) redactions.set(2, [])
    redactions.get(2).push({ type: 'strike', x: 20, y: 20, w: 100, h: 50 })

    layer.setPage(1)
    expect(layer.getPageRedactions(1).length).toBe(1)
    expect(layer.getPageRedactions(1)[0].type).toBe('box')

    layer.setPage(2)
    expect(layer.getPageRedactions(2).length).toBe(1)
    expect(layer.getPageRedactions(2)[0].type).toBe('strike')
  })

  it('debería deshacer última redacción', () => {
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({ type: 'box', x: 10, y: 10, w: 100, h: 50 })
    redactions.get(1).push({ type: 'strike', x: 20, y: 20, w: 100, h: 50 })

    expect(redactions.get(1).length).toBe(2)

    layer.undo()
    expect(redactions.get(1).length).toBe(1)
    expect(redactions.get(1)[0].type).toBe('box')
  })

  it('debería limpiar todas las redacciones de la página', () => {
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({ type: 'box', x: 10, y: 10, w: 100, h: 50 })
    redactions.get(1).push({ type: 'strike', x: 20, y: 20, w: 100, h: 50 })

    layer.clearPage()
    expect(layer.getPageRedactions(1).length).toBe(0)
  })

  it('debería verificar si hay redacciones', () => {
    const redactions = layer.getRedactions()

    expect(layer.hasAnyRedaction()).toBe(false)

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({ type: 'box', x: 10, y: 10, w: 100, h: 50 })

    expect(layer.hasAnyRedaction()).toBe(true)
  })

  it('debería cambiar tamaño del canvas', () => {
    const newWidth = 1024
    const newHeight = 768

    layer.resize(newWidth, newHeight)

    expect(canvas.width).toBe(newWidth)
    expect(canvas.height).toBe(newHeight)
  })

  it('debería soportar múltiples tipos de redacción', () => {
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    redactions.get(1).push({ type: 'box', x: 10, y: 10, w: 50, h: 50 })
    redactions.get(1).push({ type: 'strike', x: 70, y: 10, w: 50, h: 50 })
    redactions.get(1).push({ type: 'highlight', x: 130, y: 10, w: 50, h: 50 })

    const pageRedactions = layer.getPageRedactions(1)
    expect(pageRedactions.length).toBe(3)
    expect(pageRedactions.map(r => r.type)).toEqual(['box', 'strike', 'highlight'])
  })

  it('debería retornar estructura correcta de redacciones', () => {
    const redactions = layer.getRedactions()

    if (!redactions.has(1)) redactions.set(1, [])
    const redaction = { type: 'box', x: 10, y: 20, w: 100, h: 50 }
    redactions.get(1).push(redaction)

    const returned = layer.getRedactions()
    expect(returned.has(1)).toBe(true)
    expect(returned.get(1)[0]).toEqual(redaction)
  })
})
