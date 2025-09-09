<template>
  <q-card class="item-card" :class="{ 'deleted-item': item.deleted_at }">
    <q-card-section class="q-pb-xs">
      <div class="row items-center">
        <q-icon :name="item.icon" size="20px" class="q-mr-sm text-primary" />
        <div class="text-subtitle1 ellipsis flex-1">{{ item.title }}</div>

        <!-- Position Controls -->
        <div class="position-controls q-mr-sm">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="keyboard_arrow_up"
            :disable="isFirst"
            class="position-btn"
            @click="$emit('move-up')"
          >
            <q-tooltip>Move up</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="keyboard_arrow_down"
            :disable="isLast"
            class="position-btn"
            @click="$emit('move-down')"
          >
            <q-tooltip>Move down</q-tooltip>
          </q-btn>
        </div>

        <q-btn-dropdown flat dense round icon="more_vert">
          <q-list>
            <q-item v-close-popup clickable @click="$emit('edit', item)">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>Edit</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="$emit('delete', item)">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>Delete</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="item.link" class="text-caption q-mb-xs">
        <a :href="item.link" target="_blank" class="link">
          <q-icon name="link" size="14px" class="q-mr-xs" />
          {{ truncateLink(item.link) }}
        </a>
      </div>

      <div class="row items-center justify-between q-mt-sm">
        <div class="row items-center">
          <q-chip v-if="sectionName" dense size="sm" color="primary" text-color="white" class="q-px-sm q-mr-sm">
            {{ sectionName }}
          </q-chip>

          <!-- Position Indicator -->
          <q-badge color="grey-6" class="position-badge">{{ position }}/{{ totalItems }}</q-badge>
        </div>

        <q-badge color="grey-6">
          <q-icon name="schedule" size="12px" class="q-mr-xs" />
          {{ formatRelativeTime(item.updated_at) }}
        </q-badge>
      </div>

      <!-- Tooltip for timestamps -->
      <q-tooltip anchor="center middle" self="center middle">
        <div>Created: {{ formatDate(item.created_at) }}</div>
        <div>Updated: {{ formatDate(item.updated_at) }}</div>
        <div v-if="item.deleted_at">Deleted: {{ formatDate(item.deleted_at) }}</div>
        <div>Position: {{ position }} of {{ totalItems }}</div>
      </q-tooltip>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  sectionName: {
    type: String,
    default: '',
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
})

defineEmits(['edit', 'delete', 'move-up', 'move-down'])

// Helper functions
const truncateLink = (link) => {
  if (!link) return ''
  const maxLength = 30
  return link.length > maxLength ? link.substring(0, maxLength) + '...' : link
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 30) return `${diffDay}d ago`

  return formatDate(dateString).split(',')[0]
}
</script>

<style scoped>
.item-card {
  transition: all 0.2s ease;
  border-radius: 8px;
  position: relative;
}

.item-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.item-card:hover .position-controls {
  opacity: 1;
}

.deleted-item {
  opacity: 0.6;
  background-color: #ffebee;
  border: 1px dashed #f44336;
}

.position-controls {
  display: flex;
  flex-direction: column;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.position-btn {
  width: 24px;
  height: 24px;
  min-height: 24px;
}

.position-badge {
  font-size: 10px;
  padding: 2px 6px;
}

.link {
  color: #1976d2;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.flex-1 {
  flex: 1;
}

@media (max-width: 600px) {
  .position-controls {
    opacity: 1;
  }

  .position-btn {
    width: 20px;
    height: 20px;
    min-height: 20px;
  }
}
</style>
