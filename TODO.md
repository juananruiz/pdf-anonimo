## Funcionalidades recomendadas (pendientes / a considerar)

### Prioridad Alta
- OCR para PDFs escaneados (Tesseract.js o servicio OCR): sin OCR no se puede redactar texto que está como imagen. (Implementar: nuevo módulo `ocr.js` o extender `pdf-renderer.js`).
- Detección automática de PII / patrones (emails, teléfonos, NIF, IBAN, nombres): opción para detectar y sugerir redacciones automáticamente. (UI: `redaction-layer.js` / back: `document-manager.js`).
- Limpieza completa de metadata y attachments: eliminar XMP, metadatos ocultos y ficheros incrustados antes de exportar. (`document-manager.js`, `exporter.js`).
- Manejo de PDFs protegidos por contraseña: soporte para pedir contraseña o procesar PDFs cifrados. (`pdf-renderer.js`).
- Registro de auditoría (audit log) para cumplir con requisitos legales: quién/redactó/quién exportó/fecha. (`document-manager.js` + `exporter.js`).

### Prioridad Media
- Batch processing / CLI para procesar carpetas de PDFs (útil para administración).
- Soporte para campos de formulario: opción de conservar, aplanar o limpiar form fields.
- Comportamiento con firmas digitales: aclarar si se invalidan firmas o cómo manejarlas.
- Integración con almacenamiento en la nube: Google Drive, OneDrive, S3 — import/export.
- Accesibilidad (WCAG): roles ARIA, navegación por teclado, contraste.
- Internacionalización (i18n): strings y UI traducible.

Prioridad Baja / Futuro
- Colaboración en tiempo real / roles y autenticación (si la app va a usarse por equipos).
- API / plugin system para añadir reglas de redacción personalizadas.
- Mejoras de rendimiento para PDFs muy grandes (streaming, paginado progresivo).

## Mejoras para el README
- Añadir:
  - Badges: CI (build), tests, coverage, versión.
  - Requisitos: Node/npm versiones recomendadas, SOs soportados.
  - Comandos exactos (ej.: `npm run dev` puerto por defecto de Vite, `npm run electron:dev` requisitos).
  - Sección "Limitaciones conocidas" y "Seguridad / privacidad" (explicar manejo de archivos temporales).
  - Guía para contribución más detallada (issue templates, PR template, code of conduct).
  - Enlace a releases/binaries (cuando haya builds de Electron) y notas sobre codesigning.
  - Añadir un ejemplo visual (GIF de flujo: cargar PDF → seleccionar redacción → exportar).
