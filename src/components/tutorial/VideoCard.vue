<template>
  <q-card
    class="video-card"
    flat
    bordered
    :class="{ 'draggable-card': draggable }"
    @click="$emit('click')"
  >
    <div class="video-thumb-wrapper">
      <template v-if="video.miniature_url">
        <q-img
          :src="video.miniature_url"
          :ratio="16/9"
          class="video-thumb"
        >
          <template v-slot:loading>
            <q-skeleton type="rect" class="absolute-full" />
          </template>
        </q-img>
      </template>
      <template v-else>
        <video
          :src="video.video_url"
          class="video-thumb video-preview"
          preload="metadata"
          muted
          playsinline
          controlsList="nodownload"
          @loadeddata="$event.target.currentTime = 0.5"
        ></video>
      </template>

      <!-- Duration badge (if available) -->
      <div v-if="video.duration" class="duration-badge">
        {{ formatDuration(video.duration) }}
      </div>

      <!-- Device type indicator -->
      <q-chip
        v-if="video.device_type !== 'both'"
        dense
        :icon="video.device_type === 'desktop' ? 'desktop_windows' : 'smartphone'"
        class="device-badge"
      >
        {{ video.device_type === 'desktop' ? 'Desktop' : 'Mobile' }}
      </q-chip>

      <!-- Drag handle for reorder mode -->
      <div v-if="draggable" class="drag-handle">
        <q-icon name="drag_indicator" size="24px" />
      </div>
    </div>

    <q-card-section class="card-content">
      <div class="content-wrapper">
        <q-avatar size="40px" class="channel-avatar">
          <img :src="qBitsLogo.isoLogoColor" alt="Qbits" />
        </q-avatar>

        <div class="video-info">
          <div class="video-title" :title="video.title">
            {{ video.title }}
          </div>
          <div class="video-meta">
            <span class="channel-name">Qbits</span>
          </div>
          <div class="video-stats">
            <span class="views">
              <q-icon name="visibility" size="12px" />
              {{ formatViews(video.views_count) }}
            </span>
            <span class="separator">•</span>
            <span class="date">{{ formatDate(video.created_at) }}</span>
            <span class="separator">•</span>
            <span class="likes">
              <q-icon name="thumb_up" size="12px" />
              {{ formatNumber(video.likes_count) }}
            </span>
          </div>
        </div>

        <!-- Menu for admin actions -->
        <q-btn
          v-if="isAdmin"
          flat
          round
          icon="more_vert"
          size="sm"
          class="menu-btn"
          @click.stop
        >
          <q-menu>
            <q-list dense>
              <q-item clickable v-close-popup @click.stop="$emit('edit')">
                <q-item-section avatar>
                  <q-icon name="edit" color="primary" />
                </q-item-section>
                <q-item-section>Editar</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click.stop="$emit('delete')">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" />
                </q-item-section>
                <q-item-section>Eliminar</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { qBitsLogo, formatDate } from 'src/const/mixins'

/**
 * Props definition
 */
defineProps({
  /**
   * Video object
   * @type {object}
   */
  video: {
    type: Object,
    required: true
  },
  /**
   * Whether user is admin
   * @type {boolean}
   */
  isAdmin: {
    type: Boolean,
    default: false
  },
  /**
   * Whether card is draggable (reorder mode)
   * @type {boolean}
   */
  draggable: {
    type: Boolean,
    default: false
  }
})

/**
 * Emit events
 */
defineEmits(['click', 'edit', 'delete'])

/**
 * Format view count for display
 * @param {number} count - View count
 * @returns {string} Formatted view count
 */
const formatViews = (count) => {
  if (!count) return '0 vistas'
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M vistas'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K vistas'
  }
  return count + ' vistas'
}

/**
 * Format number for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format video duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.video-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--q-background);

  body.body--dark & {
    background: #181818;
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    .video-thumb {
      transform: scale(1.02);
    }
  }

  &.draggable-card {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    .drag-handle {
      display: flex;
    }
  }
}

.video-thumb-wrapper {
  position: relative;
  overflow: hidden;

  .video-thumb {
    transition: transform 0.3s ease;
  }

  .video-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    aspect-ratio: 16/9;
  }

  .duration-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .device-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 0.625rem;
    height: 20px;
  }

  .drag-handle {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    color: white;
  }
}

.card-content {
  padding: 12px;
}

.content-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .channel-avatar {
    flex-shrink: 0;
  }

  .video-info {
    flex: 1;
    min-width: 0;
  }

  .video-title {
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .video-meta {
    .channel-name {
      color: var(--q-grey-7);
      font-size: 0.8125rem;

      body.body--dark & {
        color: var(--q-grey-5);
      }
    }
  }

  .video-stats {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--q-grey-6);
    font-size: 0.75rem;
    margin-top: 2px;

    .separator {
      color: var(--q-grey-4);
    }

    .q-icon {
      margin-right: 2px;
    }
  }

  .menu-btn {
    flex-shrink: 0;
    margin: -4px -8px 0 0;
  }
}
</style>
