<template>
  <q-dialog v-model="internalOpen" @hide="closeCamera" persistent>
    <q-card class="camera-capture-card shadow-24" style="min-width: 350px; max-width: 90vw; border-radius: 16px;">
      <q-card-section class="q-pa-none relative-position">
        <div class="video-container">
          <video ref="videoRef" autoplay playsinline class="camera-video"></video>

          <div v-if="loading" class="absolute-center text-white column items-center">
            <q-spinner-oval size="48px" />
            <span class="q-mt-sm">Iniciando cámara...</span>
          </div>

          <div v-if="error" class="absolute-center text-white text-center q-pa-md bg-negative rounded-borders shadow-2">
            <q-icon name="error" size="32px" class="q-mb-sm" />
            <div>{{ errorMessage }}</div>
            <q-btn flat color="white" label="Reintentar" @click="initCamera" class="q-mt-sm" />
          </div>

          <div v-if="imageCaptured" class="captured-preview-overlay">
            <img :src="capturedImageUrl" class="captured-image" />
          </div>
        </div>

        <q-btn
          flat round dense
          icon="close"
          color="white"
          class="absolute-top-right q-ma-sm close-btn-overlay"
          @click="internalOpen = false"
        />
      </q-card-section>

      <q-card-actions align="center" class="q-py-lg bg-black-dark">
        <template v-if="!imageCaptured">
          <q-btn
            round
            size="24px"
            color="white"
            text-color="primary"
            icon="photo_camera"
            :disable="loading || !!error"
            @click="capturePhoto"
            class="capture-btn"
          >
            <div class="capture-inner"></div>
          </q-btn>
        </template>

        <template v-else>
          <div class="row full-width justify-around items-center">
            <q-btn
              flat
              rounded
              color="white"
              label="Repetir"
              icon="refresh"
              @click="retake"
            />
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Usar foto"
              icon="check"
              @click="confirmPhoto"
            />
          </div>
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Hidden canvas for capture -->
  <canvas ref="canvasRef" style="display: none;"></canvas>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'capture'])

const internalOpen = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const imageCaptured = ref(false)
const capturedImageUrl = ref(null)
const capturedBlob = ref(null)

watch(() => props.modelValue, (newVal) => {
  internalOpen.value = newVal
  if (newVal) {
    initCamera()
  }
})

watch(internalOpen, (newVal) => {
  emit('update:modelValue', newVal)
})

const initCamera = async () => {
  loading.value = true
  error.value = false
  imageCaptured.value = false

  try {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err) {
    console.error('Error opening camera:', err)
    error.value = true
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage.value = 'Permiso de cámara denegado.'
    } else {
      errorMessage.value = 'Error al acceder a la cámara.'
    }
  } finally {
    loading.value = false
  }
}

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  // Set canvas dimensions to match video stream
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Draw current video frame to canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Convert to image URL for preview
  capturedImageUrl.value = canvas.toDataURL('image/jpeg', 0.8)

  // Convert to Blob for sending
  canvas.toBlob((blob) => {
    capturedBlob.value = blob
    imageCaptured.value = true
  }, 'image/jpeg', 0.8)
}

const retake = () => {
  imageCaptured.value = false
  capturedImageUrl.value = null
  capturedBlob.value = null
}

const confirmPhoto = () => {
  if (capturedBlob.value) {
    const file = new File([capturedBlob.value], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
    emit('capture', file)
    internalOpen.value = false
  }
}

const closeCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  imageCaptured.value = false
  capturedImageUrl.value = null
  capturedBlob.value = null
}

onUnmounted(() => {
  closeCamera()
})
</script>

<style scoped lang="scss">
.camera-capture-card {
  background: #000;
  overflow: hidden;
}

.video-container {
  height: 60vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captured-preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 5;
}

.captured-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.close-btn-overlay {
  background: rgba(0,0,0,0.3);
  z-index: 10;
}

.bg-black-dark {
  background: #111;
}

.capture-btn {
  border: 4px solid rgba(255,255,255,0.3);
  padding: 2px;

  &:active {
    transform: scale(0.95);
  }
}

.capture-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #fff;
}
</style>
