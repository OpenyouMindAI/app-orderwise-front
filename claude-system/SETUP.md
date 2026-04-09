# Setup rápido — integracion-v.5

## Pasos post-merge

### 1. Agentes (ya activos)
Los 6 agentes en `agents/` ya están copiados en `~/.claude/agents/`.
Verificar con `/agents` en Claude Code.

### 2. Pencil.dev
- App instalada en `/Applications/Pencil.app`
- MCP configurado en `~/.mcp.json`
- Verificar conexión: `/mcp` en Claude Code → "pencil" debe aparecer

### 3. Responsive Viewer
```bash
# Abrir Chrome → chrome://extensions → Developer mode → Load unpacked
# Seleccionar: ~/libs/responsive-viewer/build/
```

### 4. anime.js
Ya disponible en `~/libs/node_modules/animejs/`.
Bundles en `libs/animejs/dist/bundles/`.

### 5. Verificación
- [ ] `@architect` responde en Claude Code
- [ ] `@designer` responde en Claude Code
- [ ] `@engineer` responde en Claude Code
- [ ] `@devops` responde en Claude Code
- [ ] `@reviewer` responde en Claude Code
- [ ] `@orchestrator` delega correctamente
- [ ] Pencil.dev MCP conecta
- [ ] Responsive Viewer cargado en Chrome
