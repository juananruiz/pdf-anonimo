# PDF Anónimo

Aplicación web para anonimizar documentos PDF mediante redacción interactiva.

## Características

- 📄 **Visualización de PDF** — Renderiza PDFs en el navegador
- ✏️ **Redacción Interactiva** — Selecciona y redacta áreas del documento
- 🎨 **Editor Visual** — Interfaz intuitiva para gestionar redacciones
- 💾 **Exportación** — Descarga el PDF anonimizado
- 📋 **Gestor de Documentos** — Maneja metadatos y propiedades
- 🔎 **OCR (scanned PDFs)** — Reconocimiento de texto en PDFs escaneados (Tesseract.js) para poder redactar texto que está dentro de imágenes

## Captura de pantalla

![Captura de pantalla de PDF Anónimo](assets/screenshot.svg)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/juananruiz/pdf-anonimo.git
cd pdf-anonimo

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
src/
├── main.js              # Punto de entrada principal
├── pdf-renderer.js      # Renderizado de PDFs
├── redaction-layer.js   # Capa de redacción e interacción
├── metadata-panel.js    # Panel de metadatos
├── document-manager.js  # Gestión de documentos
├── exporter.js          # Exportación a PDF
└── styles.css          # Estilos de la aplicación
```

## Tecnologías

- **Vite** — Herramienta de build rápida
- **Modern JavaScript** — ES6+
- **PDF.js** — Procesamiento de PDFs (a través de CDN)

## Uso

1. Abre la aplicación en tu navegador
2. Carga un PDF
3. Si el PDF está escaneado (texto como imagen), usa el botón "Detectar texto (OCR)" en la barra de herramientas para ejecutar OCR en la página actual. El sistema propondrá redacciones automáticas para coincidencias de PII (correo, teléfono, NIF, IBAN), que podrás aceptar o descartar.
4. Selecciona manualmente áreas adicionales a redactar
5. Descarga el documento anonimizado
6. Dale una estrella al producto si te resulta útil
7. Para reportar bugs o sugerencias, abre un [issue en GitHub](https://github.com/juananruiz/pdf-anonimo/issues).

## Desarrollo

### Scripts disponibles

- `npm run dev` — Inicia servidor de desarrollo (web)
- `npm run build` — Construye para producción (web)
- `npm run preview` — Vista previa de build
- `npm test` — Ejecuta suite de tests
- `npm run electron:dev` — Abre la app como ventana de escritorio (modo dev)
- `npm run electron:build` — Genera ejecutable/instalador en `dist-electron/`

### App de escritorio (Electron)

Para usar la app como aplicación nativa de escritorio:

```bash
# Desarrollo (hot reload)
npm run electron:dev

# Generar ejecutable
npm run electron:build
# → dist-electron/PDF Anónimo-1.0.0.dmg  (macOS)
# → dist-electron/PDF Anónimo Setup.exe   (Windows)
# → dist-electron/PDF Anónimo.AppImage   (Linux)
```

### Testing

El proyecto incluye una suite completa de tests unitarios usando **Vitest**:

```bash
npm test
```

**Coverage:**
- Tests para `RedactionLayer` — Gestión de redacciones, undo/redo, tipos
- Tests para `drawRedactionShape` — Renderizado de caja, tachar, resaltado
- Tests para diferentes tipos de redacción — box, strike, highlight
- 17 tests que verifican funcionalidad crítica

Todos los tests deben pasar antes de hacer commit:

```bash
npm test -- --reporter=verbose
```

### Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Autor

**Juan Antonio Ruiz** — [@juananruiz](https://github.com/juananruiz)

## Licencia

Este proyecto está bajo licencia MIT.

## Referencias

### Proyectos similares

- https://github.com/jjdeharo/anonim-pdf
- https://github.com/Mauricio333bit/anonimizadorPDF/

---

