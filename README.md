# PDF Anónimo

Aplicación web para anonimizar documentos PDF mediante redacción interactiva.

## Características

- 📄 **Visualización de PDF** — Renderiza PDFs en el navegador
- ✏️ **Redacción Interactiva** — Selecciona y redacta áreas del documento
- 🎨 **Editor Visual** — Interfaz intuitiva para gestionar redacciones
- 💾 **Exportación** — Descarga el PDF anonimizado
- 📋 **Gestor de Documentos** — Maneja metadatos y propiedades

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
3. Selecciona áreas a redactar
4. Descarga el documento anonimizado

## Desarrollo

### Scripts disponibles

- `npm run dev` — Inicia servidor de desarrollo
- `npm run build` — Construye para producción
- `npm run preview` — Vista previa de build

### Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT.

## Autor

**Juan Andrés Ruiz** — [@juananruiz](https://github.com/juananruiz)

---

Para reportar bugs o sugerencias, abre un [issue en GitHub](https://github.com/juananruiz/pdf-anonimo/issues).
