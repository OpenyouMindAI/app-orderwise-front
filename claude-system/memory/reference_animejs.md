---
name: anime.js library
description: anime.js v4.3.6 instalado en ~/libs para animaciones frontend — usar cuando necesitemos animar CSS, SVG, DOM
type: reference
---

**Ubicación:** `/Users/leandro/libs/node_modules/animejs/`

**Versión:** 4.3.6

**Bundles listos para usar:**
- ESM: `dist/bundles/anime.esm.js` (y `.min.js`)
- UMD: `dist/bundles/anime.umd.js` (y `.min.js`)
- Modules: `dist/modules/index.js`

**Módulos disponibles:**
- `animation` — animaciones core
- `timeline` — secuencias y timelines
- `draggable` — drag & drop animado
- `svg` — morphing, motion path, drawable
- `text` — split text para animaciones de texto
- `events/scroll` — animaciones vinculadas a scroll
- `easings` — eases, spring, cubic-bezier, steps, linear, irregular
- `layout` — animaciones de layout
- `animatable` — propiedades animables reactivas
- `scope` — scoping de animaciones
- `utils` — stagger, random, chainable, time

**Uso rápido (ESM):**
```js
import { animate, stagger } from 'animejs';

animate('.element', {
  translateX: 250,
  rotate: '1turn',
  duration: 800,
  delay: stagger(100),
  ease: 'outExpo'
});
```

**Uso CDN (UMD):**
```html
<script src="/libs/anime.umd.min.js"></script>
```

**Status:** Descargado y listo para pruebas. Si funciona bien, convertir en skill reutilizable.
