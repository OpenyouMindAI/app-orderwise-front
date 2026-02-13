<template>
  <div class="audio-player">
    <q-btn
      flat
      round
      dense
      :icon="isPlaying ? 'pause' : 'play_arrow'"
      color="primary"
      size="sm"
      @click="togglePlay"
    />

    <div class="audio-progress">
      <q-linear-progress
        :value="progress"
        color="primary"
        class="progress-bar"
        @click="seek"
      />
      <div class="audio-time">
        <span>{{ formattedCurrentTime }}</span>
        <span class="text-grey-6">/</span>
        <span>{{ formattedDuration }}</span>
      </div>
    </div>

    <q-btn
      flat
      round
      dense
      icon="download"
      color="grey"
      size="sm"
      @click="download"
    >
      <q-tooltip>Descargar</q-tooltip>
    </q-btn>

    <audio
      ref="audioElement"
      :src="src"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onError"
      style="display: none"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Props
 */
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    default: 'audio.webm'
  }
})

/**
 * Quasar instance
 * @type {object}
 */
const $q = useQuasar()

/**
 * Audio element ref
 * @type {import('vue').Ref<HTMLAudioElement|null>}
 */
const audioElement = ref(null)

/**
 * Is playing
 * @type {import('vue').Ref<boolean>}
 */
const isPlaying = ref(false)

/**
 * Current time
 * @type {import('vue').Ref<number>}
 */
const currentTime = ref(0)

/**
 * Duration
 * @type {import('vue').Ref<number>}
 */
const duration = ref(0)

/**
 * Progress
 * @type {import('vue').ComputedRef<number>}
 */
const progress = computed(() => {
  if (duration.value === 0) return 0
  return currentTime.value / duration.value
})

/**
 * Formatted current time
 * @type {import('vue').ComputedRef<string>}
 */
const formattedCurrentTime = computed(() => formatTime(currentTime.value))

/**
 * Formatted duration
 * @type {import('vue').ComputedRef<string>}
 */
const formattedDuration = computed(() => formatTime(duration.value))

/**
 * Format time
 * @param {number} seconds - Time in seconds
 * @returns {string}
 */
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Toggle play/pause
 * @returns {void}
 */
const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

/**
 * Seek to position
 * @param {MouseEvent} event - Click event
 * @returns {void}
 */
const seek = (event) => {
  if (!audioElement.value) return

  const progressBar = event.currentTarget
  const rect = progressBar.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width

  audioElement.value.currentTime = percentage * duration.value
}

/**
 * On loaded metadata
 * @returns {void}
 */
const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

/**
 * On time update
 * @returns {void}
 */
const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

/**
 * On ended
 * @returns {void}
 */
const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

/**
 * On error
 * @returns {void}
 */
const onError = () => {
  $q.notify({
    type: 'negative',
    message: 'Error al cargar el audio'
  })
}

/**
 * Download audio
 * @returns {void}
 */
const download = () => {
  const link = document.createElement('a')
  link.href = props.src
  link.download = props.filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Cleanup on unmount
onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
})
</script>

<style scoped lang="scss">
.audio-player {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  max-width: 300px;
}

.audio-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  cursor: pointer;
  border-radius: 4px;
  height: 4px;
}

.audio-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #616161;
}
</style>
