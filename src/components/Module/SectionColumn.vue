<template>
  <q-card class="section-column-card full-height">
    <!-- Section Header -->
    <q-card-section class="section-header q-pb-xs">
      <div class="row items-center">
        <q-icon :name="section.icon" size="24px" class="q-mr-sm" />
        <div class="text-h6 ellipsis">{{ section.name }}</div>
        <q-space />

        <!-- Section Movement Buttons -->
        <div class="section-controls q-mr-sm">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="chevron_left"
            :disable="isFirstSection"
            class="q-mr-xs"
            @click="$emit('move-section-left', section.id)"
          >
            <q-tooltip>Move section left</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="chevron_right"
            :disable="isLastSection"
            @click="$emit('move-section-right', section.id)"
          >
            <q-tooltip>Move section right</q-tooltip>
          </q-btn>
        </div>

        <q-btn-dropdown flat dense round icon="more_vert">
          <q-list>
            <q-item v-close-popup clickable @click="$emit('edit-section', section)">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>Edit Section</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="$emit('delete-section', section)">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>Delete Section</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="text-caption text-grey">{{ items.length }} items</div>
    </q-card-section>

    <q-separator />

    <!-- Items Container -->
    <q-card-section class="items-container q-pa-sm">
      <div class="column q-gutter-y-sm">
        <ItemCard
          v-for="(item, index) in items"
          :key="item.id"
          :item="item"
          :section-name="section.name"
          :is-first="index === 0"
          :is-last="index === items.length - 1"
          :position="index + 1"
          :total-items="items.length"
          @edit="$emit('edit-item', item)"
          @delete="$emit('delete-item', item)"
          @move-up="$emit('move-item-up', item.id)"
          @move-down="$emit('move-item-down', item.id)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="items.length === 0" class="empty-state q-pa-md text-center text-grey">
        <q-icon name="inbox" size="48px" />
        <div class="q-mt-sm">No items</div>
      </div>

      <!-- Add Item Button -->
      <div class="q-mt-md">
        <q-btn
          flat
          outline
          color="primary"
          icon="add"
          label="Add Item"
          class="full-width"
          @click="$emit('add-item', section.id)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import ItemCard from './ItemCard.vue'

const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  isFirstSection: {
    type: Boolean,
    default: false,
  },
  isLastSection: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'edit-section',
  'delete-section',
  'add-item',
  'edit-item',
  'delete-item',
  'move-item-up',
  'move-item-down',
  'move-section-left',
  'move-section-right',
])

// Computed properties for section positioning
const isFirstSection = computed(() => props.section.index === 1)
const isLastSection = computed(() => {
  // This would need to be passed from parent or calculated differently
  // For now, we'll use a simple check
  return false // Will be handled by parent component
})
</script>

<style scoped>
.section-column-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
}

.section-header {
  flex-shrink: 0;
}

.items-container {
  flex: 1;
  overflow-y: auto;
  min-height: 50px;
}

.section-controls {
  display: flex;
  align-items: center;
}

.empty-state {
  opacity: 0.7;
  padding: 20px 0;
}

@media (max-width: 600px) {
  .section-controls {
    display: none;
  }
}
</style>
