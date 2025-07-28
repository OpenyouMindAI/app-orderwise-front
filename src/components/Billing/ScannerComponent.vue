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
  maxAvgTime: 50, // Tiempo máximo promedio entre caracteres (ms)
  allowedChars: /^[a-zA-Z0-9-]+$/ // Caracteres permitidos en el código
}

const resetScanState = () => {
  barcodeBuffer = ''
  lastKeyTime = null
  keyPressCount = 0
  totalTimeBetweenKeys = 0
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
    return
  }

  // Si ya estamos en medio de un posible escaneo
  if (barcodeBuffer !== '') {
    // Calcular tiempo desde la última tecla
    const timeSinceLastKey = currentTime - lastKeyTime
    lastKeyTime = currentTime

    if (event.key !== 'Enter') {
      // Acumular tiempo y contar teclas
      totalTimeBetweenKeys += timeSinceLastKey
      keyPressCount += 1
      barcodeBuffer += event.key
    } else {
      // Se presionó Enter - verificar si es un escaneo válido
      const avgTimePerChar = totalTimeBetweenKeys / Math.max(1, (keyPressCount - 1))

      // Verificar requisitos
      if (barcodeBuffer.length >= config.minLength && avgTimePerChar < config.maxAvgTime) {
        emit('barcode-scanned', barcodeBuffer)
      }
      resetScanState()
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
