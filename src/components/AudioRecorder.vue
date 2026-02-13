<template>
  <div class="audio-recorder">
    <!-- Recording State -->
    <div v-if="isRecording" class="recording-state">
      <div class="recording-indicator">
        <div class="pulse-dot"></div>
        <span class="recording-time">{{ formattedTime }}</span>
      </div>
      <q-btn
        round
        color="negative"
        icon="stop"
        size="md"
        @click="stopRecording"
        class="stop-btn"
      >
        <q-tooltip>Detener grabación</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        icon="delete"
        color="grey"
        size="md"
        @click="cancelRecording"
      >
        <q-tooltip>Cancelar</q-tooltip>
      </q-btn>
    </div>

    <!-- Ready to Record -->
    <q-btn
      v-else
      round
      :color="hasRecording ? 'positive' : 'primary'"
      :icon="hasRecording ? 'check' : 'mic'"
      size="md"
      @click="hasRecording ? emit('send', audioBlob) : startRecording()"
    >
      <q-tooltip>{{ hasRecording ? 'Enviar audio' : 'Grabar audio' }}</q-tooltip>
    </q-btn>

    <!-- Cancel recorded audio -->
    <q-btn
      v-if="hasRecording && !isRecording"
      flat
      round
      icon="close"
      color="grey"
      size="sm"
      @click="clearRecording"
    >
      <q-tooltip>Cancelar</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Emits
 */
const emit = defineEmits(['send', 'recording-started', 'recording-stopped'])

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Is recording
 * @type {import('vue').Ref<boolean>}
 */
const isRecording = ref(false)

/**
 * Recording time in seconds
 * @type {import('vue').Ref<number>}
 */
const recordingTime = ref(0)

/**
 * Media recorder instance
 * @type {import('vue').Ref<MediaRecorder|null>}
 */
const mediaRecorder = ref(null)

/**
 * Audio chunks
 * @type {import('vue').Ref<Array>}
 */
const audioChunks = ref([])

/**
 * Audio blob
 * @type {import('vue').Ref<Blob|null>}
 */
const audioBlob = ref(null)

/**
 * Recording timer interval
 * @type {number|null}
 */
let recordingInterval = null

/**
 * Has recording
 * @type {import('vue').ComputedRef<boolean>}
 */
const hasRecording = computed(() => audioBlob.value !== null)

/**
 * Formatted time
 * @type {import('vue').ComputedRef<string>}
 */
const formattedTime = computed(() => {
  const minutes = Math.floor(recordingTime.value / 60)
  const seconds = recordingTime.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

/**
 * Start recording
 * @returns {Promise<void>}
 */
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
      audioBlob.value = blob
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop())
      
      emit('recording-stopped', blob)
    }
    
    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0
    
    // Start timer
    recordingInterval = setInterval(() => {
      recordingTime.value++
      
      // Auto stop after 5 minutes
      if (recordingTime.value >= 300) {
        stopRecording()
      }
    }, 1000)
    
    emit('recording-started')
  } catch (error) {
    console.error('Error starting recording:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo acceder al micrófono'
    })
  }
}

/**
 * Stop recording
 * @returns {void}
 */
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }
}

/**
 * Cancel recording
 * @returns {void}
 */
const cancelRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    audioBlob.value = null
    audioChunks.value = []
    
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }
}

/**
 * Clear recording
 * @returns {void}
 */
const clearRecording = () => {
  audioBlob.value = null
  audioChunks.value = []
  recordingTime.value = 0
}

// Cleanup on unmount
onUnmounted(() => {
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
  }
})
</script>

<style scoped lang="scss">
.audio-recorder {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recording-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fff3e0;
  border-radius: 24px;
  animation: fadeIn 0.3s;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #f44336;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.recording-time {
  font-weight: 500;
  color: #d32f2f;
  min-width: 40px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
