## 2026-05-28 - Implementación de OCR con Tesseract.js - GPT-5 mini
Implementé OCR usando Tesseract.js y lo integré de forma mínima en la app para que puedas detectar texto en PDFs escaneados y proponer redacciones automáticas.

Resumen de lo que hice
- Añadí un nuevo módulo OCR: `pdf-anonimo/src/ocr.js`
  - Inicializa un worker de Tesseract, ejecuta reconocimiento sobre un canvas de página y normaliza las palabras detectadas (texto, bounding boxes, confianza).
  - Incluye una función heurística `findPIIMatches(...)` que busca patrones comunes (email, teléfono, NIF, IBAN) y devuelve rectángulos aproximados para redacción automática.
- Añadí un helper en el renderizador:
  - `renderPageToCanvas(pageNum, scale)` exportado desde `pdf-anonimo/src/pdf-renderer.js` — renderiza una página a un canvas (usado por OCR).
- Integré OCR en la UI:
  - Añadí un botón en la barra: `Detectar texto (OCR)` en `pdf-anonimo/index.html`.
  - Conecté el botón en `pdf-anonimo/src/main.js`: ejecuta OCR en la página actual, muestra progreso, propone coincidencias de PII y (si confirmas) añade redacciones tipo `box` sobre la página.
- Dependencia:
  - Añadí `tesseract.js` a `pdf-anonimo/package.json` (dependencia).
- Actualicé el README para documentar la funcionalidad OCR y el flujo de uso.

Archivos modificados / añadidos
- Modificado: `pdf-anonimo/package.json` (añadida dependencia `tesseract.js`)
- Modificado: `pdf-anonimo/src/pdf-renderer.js` (añadido `renderPageToCanvas`)
- Nuevo:      `pdf-anonimo/src/ocr.js` (módulo que encapsula Tesseract + heurísticas PII)
- Modificado: `pdf-anonimo/index.html` (botón UI `btn-ocr`)
- Modificado: `pdf-anonimo/src/main.js` (import OCR + handler para el botón)
- Modificado: `pdf-anonimo/README.md` (documentación de la nueva funcionalidad)
- Añadido previamente (mock screenshot): `pdf-anonimo/assets/screenshot.svg`

Cómo probarlo (local)
1. Instala dependencias:
   - cd pdf-anonimo
   - npm install
2. Arranca la app:
   - npm run dev
3. Abre la app en el navegador (Vite te dará la URL).
4. Carga un PDF escaneado (o una imagen incrustada).
5. Ve a la página que quieras y pulsa el botón "Detectar texto (OCR)".
   - Verás un overlay de carga/progreso mientras Tesseract procesa la página.
   - Al terminar, si se detectan coincidencias PII te preguntará si deseas añadir redacciones automáticas.
   - Si confirmas, las redacciones se añaden en la capa de redacción para revisarlas/editar/guardar.

Notas técnicas y limitaciones
- Calidad / escala:
  - Por defecto la OCR se ejecuta usando el mismo scale que la vista (`DEFAULT_SCALE`) para que las coordenadas encajen con el canvas visible. Si quieres mejor reconocimiento, puedes ejecutar OCR a mayor escala (p. ej. `EXPORT_SCALE`) y después escalar las cajas resultantes hacia abajo — actualmente el código usa la escala por defecto.
- Lenguajes:
  - El worker carga el idioma `spa` por defecto (español). Puedes cambiar el idioma pasando otro código (ej. `eng`) al llamar a `recognizePage(...)`.
  - Tesseract descarga datos de idiomas (traineddata) cuando se inicializa; en entornos offline o builds de producción conviene empaquetar/servir esos datos localmente (Electron) o configurar `langPath`.
- Heurísticas PII:
  - `findPIIMatches` usa patrones simples y agrupa hasta N palabras consecutivas (sliding window) para detectar emails/teléfonos/IBAN/NIF. Es una heurística: puede dar falsos positivos/negativos.
  - Recomendable enriquecer patrones/reglas (listas blancas/negra, ML, Named Entity Recognition) para producción.
- Rendimiento:
  - El OCR es costoso; se ejecuta por página bajo demanda (no en toda la colección por defecto).
  - En PDFs grandes, considera procesar en background o con `worker` más avanzado y mostrar progreso por página.
- Distribución/Electron:
  - En Electron puede ser necesario ajustar rutas a WASM/traineddata y tiempos de carga. Para builds offline empaqueta los archivos de tessdata y configura `createWorker({ langPath: ... })`.
- Seguridad/privacidad:
  - Actualmente OCR corre en el cliente (browser/Electron). Si prefieres un servicio OCR (por ejemplo, por mayor precisión o soporte de idiomas), se podría añadir opción para enviar páginas a un servicio hospedado (teniendo en cuenta privacidad y cifrado).

Sugerencias / próximos pasos posibles
- Mejorar detección PII (expresiones regulares más robustas, NER, configuración de reglas por proyecto).
- Añadir opción de idioma seleccionable en la UI.
- Ejecutar OCR en background para preprocesar todo un documento (batch).
- Añadir visualización de sugerencias antes de aplicar (p. ej. outline estilo punteado) y una lista de coincidencias para revisarlas.
- Opciones para redacción automática configurable (solo marcar, marcar+aplicar, etc).
- Empaquetado de datos de Tesseract para builds offline/Electron.

¿Quieres que lo pruebe aquí?
Puedo:
- Ejecutar `npm install` y arrancar el dev server y probar el flujo de OCR en este entorno (necesitaré permiso para ejecutar comandos). Ten en cuenta que la instalación y la descarga del modelo de Tesseract pueden tardar, y el proceso de "dev server" es interactivo; si quieres que lo haga, avísame y lo hago con un timeout controlado y te reporto los resultados (logs / capturas).
- Mejorar la heurística de PII (ej. añadir detección de nombres propios por NER).
- Añadir un selector de idioma en la UI y ajustes de OCR (scale, confiabilidad mínima).