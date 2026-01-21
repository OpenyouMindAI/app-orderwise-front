<template>
  <div class="dropdown-menu-wrapper" ref="wrapperRef">
    <!-- Trigger Button -->
    <q-btn
      v-bind="$attrs"
      @click.stop="toggle"
    />

    <!-- Dropdown Tool (Panel + Backdrop) -->
    <Teleport to="body">
      <!-- Backdrop -->
      <div
        v-if="isOpen"
        class="dropdown-backdrop"
        @click.stop="close"
      />

      <!-- Panel -->
      <Transition name="slide-up" appear>
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="dropdown-panel"
          :style="panelStyle"
          @click.stop
        >
          <div class="dropdown-content">
            <slot />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  /**
   * Target element selector to anchor the dropdown to
   * If not provided, will anchor to the wrapper
   */
  target: {
    type: String,
    default: null
  },
  /**
   * Anchor position on the target element
   */
  anchor: {
    type: String,
    default: 'top middle',
    validator: (v) => ['top left', 'top middle', 'top right', 'bottom left', 'bottom middle', 'bottom right'].includes(v)
  },
  /**
   * Offset from anchor [x, y]
   */
  offset: {
    type: Array,
    default: () => [0, 8]
  }
})

const emit = defineEmits(['open', 'close'])

const isOpen = ref(false)
const wrapperRef = ref(null)
const dropdownRef = ref(null)
const targetRect = ref(null)

const panelStyle = computed(() => {
  if (!targetRect.value) return {}

  const rect = targetRect.value
  const [anchorV, anchorH] = props.anchor.split(' ')
  const [offsetX, offsetY] = props.offset

  let top, left, transform = ''

  // Vertical positioning
  if (anchorV === 'top') {
    top = rect.top - offsetY
    transform = 'translateY(-100%)'
  } else {
    top = rect.bottom + offsetY
  }

  // Horizontal positioning
  if (anchorH === 'left') {
    left = rect.left + offsetX
  } else if (anchorH === 'middle') {
    left = rect.left + rect.width / 2 + offsetX
    transform += ' translateX(-50%)'
  } else {
    left = rect.right + offsetX
    transform += ' translateX(-100%)'
  }

  return {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    transform: transform.trim(),
    width: `${rect.width}px`,
    zIndex: 10002 // Encima del backdrop
  }
})

const updatePosition = () => {
  const targetEl = props.target
    ? document.querySelector(props.target)
    : wrapperRef.value

  if (targetEl) {
    targetRect.value = targetEl.getBoundingClientRect()
  }
}

const toggle = () => {
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const open = async () => {
  // Notificar a otros para que cierren e identificarnos
  document.dispatchEvent(new CustomEvent('dropdown-close-all', {
    detail: { openerId: wrapperRef.value }
  }))

  updatePosition()
  isOpen.value = true
  emit('open')

  await nextTick()
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
}

const close = () => {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

// Close when another dropdown opens
const handleCloseAll = (e) => {
  if (isOpen.value && (!e.detail || e.detail.openerId !== wrapperRef.value)) {
    close()
  }
}

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('dropdown-close-all', handleCloseAll)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('dropdown-close-all', handleCloseAll)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

// Expose close method for parent components
defineExpose({ close, open, toggle })
</script>

<style scoped>
.dropdown-menu-wrapper {
  display: inline-block;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000; /* Debajo de los botones del sticky (10001) */
}

.dropdown-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dropdown-content {
  max-height: 40vh;
  overflow-y: auto;
}

/* Transitions - Más rápidas */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px) translateX(-50%) !important;
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
}

/* Dark mode support */
.body--dark .dropdown-panel {
  background: #1d1d1d;
}
</style>
