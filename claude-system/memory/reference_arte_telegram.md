---
name: Bot Telegram Arte
description: Token, script y cómo levantar el bot de Telegram de Arte/Claudio
type: reference
---

- **Token:** 8740900698:AAHxYDrU7zng9vAAVwZ1qdcoMUP_o-YPTX0
- **Script:** ~/.openclaw/workspace/projects/qbits-closer/arte_bot.py
- **Log:** /tmp/arte_bot.log
- **Backend:** Claude Anthropic (claude-sonnet-4-6)
- **API Key:** en ~/Desktop/API.txt (línea 143)
- **Levantar:** `cd ~/.openclaw/workspace/projects/qbits-closer && nohup python3 -u arte_bot.py > /tmp/arte_bot.log 2>&1 &`
- **Verificar:** `ps aux | grep arte_bot | grep -v grep`
- **Funcionalidades:** chat IA, /exec (comandos Mac), /status (servicios), /memory (equipo), /clear

**Importante:** El bot usa la API de Anthropic directamente, NO pasa por Claude Code. Es un proceso Python independiente que corre 24/7 mientras la Mac esté encendida. Si se apaga la Mac, hay que levantarlo de nuevo al arrancar.
