---
name: Claude Code agent team
description: 5 agentes especializados configurados en ~/.claude/agents/ — architect, designer, engineer, devops, reviewer
type: reference
---

**Ubicación:** `~/.claude/agents/`

**Agentes configurados:**
- `@architect` (opus, purple) — arquitectura, APIs, data models, ADRs
- `@designer` (opus, pink) — UI/UX, design systems, responsive, animaciones
- `@engineer` (sonnet, blue) — implementación, código, tests, integraciones
- `@devops` (sonnet, green) — infra, Docker, CI/CD, VPS, SSL
- `@reviewer` (opus, orange) — code review, security audit, quality checks

**Cómo usar:**
- `@architect revisá la arquitectura del módulo de pagos`
- `@designer creá el design system para el dashboard`
- `@engineer implementá la integración con Stripe`
- `@devops configurá el deploy con Docker`
- `@reviewer revisá el PR antes de mergear`

**Agent Teams (experimental):**
- Activar con `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Permite múltiples agentes trabajando en paralelo coordinados
- Un lead + teammates con task list compartida

**Repos de agentes pre-hechos:**
- VoltAgent: 130+ agentes → github.com/VoltAgent/awesome-claude-code-subagents
- wshobson: 182 agentes → github.com/wshobson/agents
- aitmpl.com: 600+ marketplace

**Comandos:**
- `/agents` — UI interactiva para crear/ver/editar agentes
- `claude --agent <name>` — correr sesión completa como ese agente
