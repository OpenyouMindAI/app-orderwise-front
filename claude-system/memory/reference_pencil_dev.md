---
name: Pencil.dev design tool
description: Pencil.dev v1.1.47 instalado — canvas visual tipo Figma con MCP para Claude Code, diseño → código
type: reference
---

**App:** `/Applications/Pencil.app` (v1.1.47 arm64)
**MCP Server:** `/Applications/Pencil.app/Contents/Resources/app.asar.unpacked/out/mcp-server-darwin-arm64`
**Config:** `~/.mcp.json` con server "pencil"

**Qué es:** Canvas de diseño visual (tipo Figma) que se conecta a Claude Code por MCP. Diseñás visualmente, Claude genera el código.

**MCP Tools disponibles:**
- `batch_design` — crear, modificar, mover, eliminar elementos de diseño
- `batch_get` — leer componentes, buscar por patterns, inspeccionar jerarquía
- `get_screenshot` — render previews, comparar antes/después
- `snapshot_layout` — analizar estructura, detectar problemas de posicionamiento
- `get_editor_state` — acceder a selección/contexto actual
- `get_variables` / `set_variables` — design tokens y temas

**Features:**
- Canvas infinito con frames, layers, componentes, variables
- Hasta 6 agentes AI diseñando en paralelo
- Copy/paste desde Figma manteniendo layouts
- Archivos `.pen` (JSON, versionable con Git)
- Gratis (necesita Claude Code subscription)
- Funciona con VSCode, Cursor, Claude Code CLI

**Uso:** Abrir Pencil.app, crear diseño, luego desde Claude Code usar las tools MCP para generar código.
**Verificar conexión:** `/mcp` en Claude Code → "pencil" debe aparecer conectado.
