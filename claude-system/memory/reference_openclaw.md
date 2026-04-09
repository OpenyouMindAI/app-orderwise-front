---
name: Referencias OpenClaw y recursos del equipo
description: Ubicación de memoria compartida, credenciales, proyectos y servicios del equipo
type: reference
---

## Memoria compartida del equipo
- Memoria diaria: ~/.openclaw/workspace/memory/YYYY-MM-DD.md
- Memoria estratégica: ~/.openclaw/workspace/MEMORY.md
- Handover: ~/.openclaw/workspace/SESSION_HANDOVER.md
- Identidad: ~/.openclaw/workspace/IDENTITY.md
- Heartbeat: ~/.openclaw/workspace/HEARTBEAT.md
- Reglas: ~/.openclaw/workspace/REGLAS_Y_PERMISOS_COMPLETOS.md

## Credenciales
- TODAS en: /Users/leandro/Desktop/API.txt
- OpenAI, Meta, GHL, MercadoPago, Cloudflare, WhatsApp, Anthropic, VPS Casino, Hostinger, Discord tokens

## Proyectos workspace
- QBITS POS: ~/.openclaw/workspace/projects/app_orderwise (frontend Electron/Quasar)
- QBITS API: ~/.openclaw/workspace/projects/api_orderwise (backend Laravel)
- QBITS Closer: ~/.openclaw/workspace/projects/qbits-closer (bots ventas + webhooks)
- Andrómeda: ~/.openclaw/workspace/projects/andromeda (marketing AI)
- Casino: ~/.openclaw/workspace/projects/casino + ~/Desktop/Casino/OSPanel/domains/localhost/
- Casino VPS: ssh root@45.93.136.135 (ganamos365.net)

## Servicios que deben correr
- mp_webhook.py (puerto 3457) — MercadoPago + CAPI Meta
- cloudflared tunnel — webhooks.qbitsapp.com
- ghl_poller.py — DESACTIVADO por Leo

## Servicios Arte (Claudio)
- arte_bot.py (Telegram) — ~/.openclaw/workspace/projects/qbits-closer/arte_bot.py
- Levantar: `nohup python3 -u arte_bot.py > /tmp/arte_bot.log 2>&1 &`

## Historial de conversaciones Nimbo (OpenClaw)
- Sessions Nimbo: ~/.openclaw/agents/main/sessions/ (164MB, ~80 archivos .jsonl)
- Sessions index: ~/.openclaw/agents/main/sessions/sessions.json
- Canales activos de Nimbo: Telegram (@QbitsAr), Discord (clawbot0288), webchat (TUI), heartbeat
- Sessions Claudio: ~/.openclaw/agents/claudio/sessions/

## Historial GPT (ChatGPT export)
- Export completo: ~/Library/CloudStorage/GoogleDrive-openyoumindai@gmail.com/Mi unidad/f6ad9a36*.zip
- Contiene: conversations-000.json a conversations-007.json (~96MB de texto)
- Historial Claude AI: ~/Library/CloudStorage/GoogleDrive-openyoumindai@gmail.com/Mi unidad/historial claude ai.zip

## Google Drive
- Ruta: ~/Library/CloudStorage/GoogleDrive-openyoumindai@gmail.com/Mi unidad/
- Contenido: Andromeda, Contenido-RRSS, Dev_Gate_Reports, VIDEOS TUTORIALES SOFTWARE, GANA (casino)

## Config OpenClaw
- ~/.openclaw/openclaw.json — config principal
- ~/.openclaw/agents/ — main, claudio, claude
- ~/.openclaw/cron/jobs.json — reporte 5AM
