<template>
  <div class="audio-player-premium" :class="{ 'is-own': isOwn }">
    <div class="player-controls">
      <q-btn
        flat
        round
        ripple
        :icon="isPlaying ? 'pause' : 'play_arrow'"
        :color="isOwn ? 'white' : 'primary'"
        size="md"
        class="play-btn"
        @click="togglePlay"
      />
    </div>

    <div class="player-body">
      <div class="waveform-container" @click="seek">
        <div class="waveform-bg">
          <div v-for="i in 15" :key="i" class="bar" :style="{ height: getBarHeight(i) }"></div>
        </div>
        <div class="waveform-progress" :style="{ width: (progress * 100) + '%' }">
          <div v-for="i in 15" :key="i" class="bar" :style="{ height: getBarHeight(i) }"></div>
        </div>
      </div>
      <div class="player-meta">
        <span class="time-text">{{ formattedCurrentTime }}</span>
        <q-space />
        <q-icon v-if="isOwn" name="done_all" size="14px" class="status-icon" />
      </div>
    </div>

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
  },
  isOwn: {
    type: Boolean,
    default: false
  }
})

/**
 * Audio element ref
 */
const audioElement = ref(null)

/**
 * Is playing
 */
const isPlaying = ref(false)

/**
 * Current time
 */
const currentTime = ref(0)

/**
 * Duration
 */
const duration = ref(0)

/**
 * Progress
 */
const progress = computed(() => {
  if (duration.value === 0) return 0
  return currentTime.value / duration.value
})

/**
 * Formatted current time
 */
const formattedCurrentTime = computed(() => formatTime(currentTime.value || 0))

/**
 * Format time
 */
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Toggle play/pause
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
 */
const seek = (event) => {
  if (!audioElement.value || !duration.value) return

  const container = event.currentTarget
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width

  audioElement.value.currentTime = percentage * duration.value
}

const getBarHeight = (i) => {
  const heights = [30, 50, 80, 40, 60, 90, 70, 40, 50, 80, 60, 40, 30, 50, 20]
  return heights[i - 1] + '%'
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const onError = () => {
  console.error('Audio load error:', props.src)
}

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
})
</script>

<style scoped lang="scss">
.audio-player-premium {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  min-width: 220px;
  border-radius: 12px;
  background: white;
  user-select: none;

  &.is-own {
    background: transparent;
    color: white;

    .waveform-bg .bar { background: rgba(255, 255, 255, 0.3); }
    .waveform-progress .bar { background: white; }
    .time-text { color: rgba(255, 255, 255, 0.9); }
  }

  &:not(.is-own) {
    border: 1px solid rgba(0, 0, 0, 0.05);
    background: #f8f9fa;

    .waveform-bg .bar { background: #e0e0e0; }
    .waveform-progress .bar { background: var(--q-primary); }
    .time-text { color: #666; }
  }
}

.player-controls {
  flex-shrink: 0;
}

.play-btn {
  background: rgba(0, 0, 0, 0.03);
}

.player-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.waveform-container {
  height: 24px;
  position: relative;
  cursor: pointer;
}

.waveform-bg, .waveform-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.waveform-progress {
  width: 0;
  overflow: hidden;
  transition: width 0.1s linear;
  z-index: 10;
}

.bar {
  flex: 1;
  min-width: 2px;
  border-radius: 1px;
}

.player-meta {
  display: flex;
  align-items: center;
  font-size: 10px;
}

.status-icon {
  margin-left: 4px;
  opacity: 0.8;
}
</style>
