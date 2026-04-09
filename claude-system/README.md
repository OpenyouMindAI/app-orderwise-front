# Claude System — Vectra One

Sistema completo de configuración, agentes y herramientas para Claude Code.

## Estructura

```
claude-system/
├── agents/              # Agentes especializados (~/.claude/agents/)
│   ├── architect.md     # Arquitectura, APIs, data models
│   ├── designer.md      # UI/UX, design systems, responsive
│   ├── engineer.md      # Implementación, código, tests
│   ├── devops.md        # Infra, Docker, CI/CD, VPS
│   ├── reviewer.md      # Code review, security audit
│   └── orchestrator.md  # Orquestador que delega a los demás
├── mcp/                 # Configuraciones MCP
│   └── mcp.json         # Pencil.dev MCP server config
├── libs/                # Librerías frontend
│   └── animejs/         # anime.js v4.3.6 (animaciones CSS/SVG/DOM)
├── config/              # Configuraciones adicionales
└── memory/              # Referencias y memoria del sistema
```

## Agentes

| Agente | Modelo | Color | Rol |
|--------|--------|-------|-----|
| `@architect` | opus | purple | Arquitectura, APIs, decisiones técnicas |
| `@designer` | opus | pink | UI/UX, design systems, animaciones |
| `@engineer` | sonnet | blue | Implementación, código, tests |
| `@devops` | sonnet | green | Infra, Docker, CI/CD, deploys |
| `@reviewer` | opus | orange | Code review, security audit |
| `@orchestrator` | opus | red | Delega y coordina a todos los demás |

## Herramientas integradas

- **Pencil.dev** — Canvas visual tipo Figma con MCP para Claude Code
- **anime.js v4.3.6** — Animaciones CSS/SVG/DOM
- **Responsive Viewer** — Testing multi-device en Chrome
- **Stripe MCP** — Pagos (ya instalado como plugin)
- **IRS Tax MCP** — Cálculos fiscales USA

## Instalación

```bash
# Copiar agentes
cp agents/*.md ~/.claude/agents/

# Copiar MCP config
cp mcp/mcp.json ~/.mcp.json

# Responsive Viewer
# chrome://extensions → Developer mode → Load unpacked → ~/libs/responsive-viewer/build/
```

## Uso

Claudio (Claude Code) orquesta automáticamente. Para tareas grandes, delega a los agentes especializados en paralelo. Para tareas simples, ejecuta directo.
