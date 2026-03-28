<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['barcode-scanned'])

// Estado del escáner
let barcodeBuffer = ''
let lastKeyTime = null
let keyPressCount = 0
let totalTimeBetweenKeys = 0

// Configuración ajustable
const config = {
  minLength: 5, // Longitud mínima del código
  maxAvgTime: 80, // Tiempo máximo promedio entre caracteres (ms)
  finishDelay: 120, // Si no llega Enter, cerrar lectura por pausa corta
  allowedChars: /^[a-zA-Z0-9-]+$/ // Caracteres permitidos en el código
}

let finishTimer = null

const resetScanState = () => {
  barcodeBuffer = ''
  lastKeyTime = null
  keyPressCount = 0
  totalTimeBetweenKeys = 0
  if (finishTimer) {
    clearTimeout(finishTimer)
    finishTimer = null
  }
}

const emitIfValidScan = () => {
  const avgTimePerChar = totalTimeBetweenKeys / Math.max(1, (keyPressCount - 1))
  if (barcodeBuffer.length >= config.minLength && avgTimePerChar < config.maxAvgTime) {
    emit('barcode-scanned', barcodeBuffer)
  }
  resetScanState()
}

const handleKeyDown = (event) => {
  // Ignorar teclas especiales excepto Enter
  if (event.key !== 'Enter' && (event.key.length > 1 || !config.allowedChars.test(event.key))) {
    return
  }

  const currentTime = Date.now()

  // Si es la primera tecla del posible código de barras
  if (barcodeBuffer === '' && event.key !== 'Enter') {
    lastKeyTime = currentTime
    barcodeBuffer = event.key
    keyPressCount = 1
    if (finishTimer) clearTimeout(finishTimer)
    finishTimer = setTimeout(() => emitIfValidScan(), config.finishDelay)
    return
  }

  // Si ya estamos en medio de un posible escaneo
  if (barcodeBuffer !== '') {
    const timeSinceLastKey = currentTime - lastKeyTime
    lastKeyTime = currentTime

    if (event.key !== 'Enter') {
      totalTimeBetweenKeys += timeSinceLastKey
      keyPressCount += 1
      barcodeBuffer += event.key
      if (finishTimer) clearTimeout(finishTimer)
      finishTimer = setTimeout(() => emitIfValidScan(), config.finishDelay)
    } else {
      emitIfValidScan()
    }
  }
}

// Configurar listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <!-- Componente invisible que solo provee funcionalidad -->
  <div v-show="false"></div>
</template>
