<template>
  <main class="table-canvas-main-area" :class="{ 'selection-mode': mode === 'selection' }">
    <!-- Canvas Controls (Zoom buttons) -->
    <div v-if="enableZoom" class="canvas-controls">
      <q-btn icon="zoom_in" @click="zoomIn" dense round flat class="control-btn"></q-btn>
      <span class="zoom-level-display">{{ Math.round(zoomLevel * 100) }}%</span>
      <q-btn icon="zoom_out" @click="zoomOut" dense round flat class="control-btn"></q-btn>
    </div>

    <!-- Canvas Viewport -->
    <div
      class="canvas-viewport-container"
      :class="{ 'pan-enabled': enablePan }"
      @mousedown="enablePan ? startPan($event) : null"
      @mousemove="enablePan ? onPan($event) : null"
      @mouseup="enablePan ? endPan($event) : null"
      @mouseleave="enablePan ? endPan($event) : null"
      @touchstart="enablePan ? startPan($event) : null"
      @touchmove="enablePan ? onPan($event) : null"
      @touchend="enablePan ? endPan($event) : null"
    >
      <div
        class="canvas-transform-wrapper"
        :style="transformStyle"
      >
        <draggable-resizable-container
          :grid="[gridSize, gridSize]"
          :show-grid="showGrid"
          class="luxury-canvas"
          :style="canvasStyle"
        >
          <draggable-resizable-vue
            v-for="(table, index) in tables"
            :key="table.id || index"
            v-model:x="table.x"
            v-model:y="table.y"
            v-model:h="table.height"
            v-model:w="table.width"
            :handles-size="8"
            :draggable="false"
            :resizable="false"
            :class="getTableWrapperClass(table)"
            @click="onTableClick(table)"
          >
            <div class="table-visual-surface">
              <div class="table-gloss-effect"></div>
              <div class="table-info-overlay">
                <span class="table-name-text">{{ table.name }}</span>
                <span v-if="showCapacity" class="table-capacity-text">
                  <q-icon name="person" class="capacity-icon" />
                  {{ table.capacity || 4 }}
                </span>
                <span
                  v-if="mode === 'control' && table.status === 'busy' && getInvoiceFromTable(table)?.client"
                  class="table-client-text"
                >
                  <q-icon name="account_circle" class="client-icon" />
                  {{ getInvoiceFromTable(table).client.name }}
                </span>
              </div>
              <div class="table-status-indicator" :class="table.status || 'unoccupied'"></div>

              <!-- Custom table actions slot -->
              <slot name="table-actions" :table="table" :index="index">
                <!-- Default actions if no slot provided -->
                <div v-if="table.status === 'busy'" class="table-quick-actions">
                  <q-btn
                    icon="swap_horiz"
                    size="xs"
                    round
                    color="white"
                    text-color="primary"
                    @click.stop="$emit('transfer-click', table)"
                    @touchstart.stop
                    class="quick-action-btn"
                  >
                    <q-tooltip>Cambiar Mesa</q-tooltip>
                  </q-btn>
                </div>
              </slot>
            </div>
            <div :class="getTableDesignClass(table)"></div>
          </draggable-resizable-vue>
        </draggable-resizable-container>
      </div>
    </div>
  </main>
</template>

<script>
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'

export default {
  name: 'TableCanvas',

  components: {
    DraggableResizableContainer,
    DraggableResizableVue
  },

  props: {
    // Data
    tables: {
      type: Array,
      required: true,
      default: () => []
    },
    selectedRoom: {
      type: Object,
      default: null
    },

    // Visual configuration
    scaleFactor: {
      type: Number,
      default: 30 // pixels per meter
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    gridSize: {
      type: Number,
      default: 20
    },
    showCapacity: {
      type: Boolean,
      default: true
    },

    // Interactivity
    mode: {
      type: String,
      default: 'control',
      validator: (val) => ['control', 'selection'].includes(val)
    },
    selectedTables: {
      type: Array,
      default: () => []
    },

    // Zoom & Pan
    enableZoom: {
      type: Boolean,
      default: true
    },
    enablePan: {
      type: Boolean,
      default: true
    },
    initialZoom: {
      type: Number,
      default: 1
    },

    // Size
    containerWidth: {
      type: String,
      default: 'auto'
    },
    containerHeight: {
      type: String,
      default: 'auto'
    }
  },

  emits: [
    'table-click',
    'table-selected',
    'transfer-click',
    'zoom-changed',
    'pan-changed'
  ],

  data () {
    return {
      zoomLevel: this.initialZoom,
      panX: 0,
      panY: 0,
      isPanning: false,
      startPanX: 0,
      startPanY: 0
    }
  },

  computed: {
    canvasStyle () {
      const width = this.selectedRoom?.width || 20
      const height = this.selectedRoom?.height || 15

      return {
        width: `${width * this.scaleFactor}px`,
        height: `${height * this.scaleFactor}px`
      }
    },

    transformStyle () {
      const translate = this.enablePan
        ? `translate(${this.panX}px, ${this.panY}px) `
        : ''
      const scale = `scale(${this.zoomLevel})`
      const transition = this.isPanning ? 'none' : 'transform 0.1s ease-out'

      return {
        transform: translate + scale,
        transition
      }
    }
  },

  methods: {
    // Table interaction
    onTableClick (table) {
      this.$emit('table-click', table)

      if (this.mode === 'selection' && table.status === 'unoccupied') {
        this.$emit('table-selected', table.id)
      }
    },

    getTableWrapperClass (table) {
      const classes = ['table-draggable-wrapper']

      if (this.mode === 'selection' && this.selectedTables.includes(table.id)) {
        classes.push('is-selected')
      }

      return classes.join(' ')
    },

    getTableDesignClass (table) {
      const baseClass = `luxury-table table-shape-${table.shape || 'round'}`
      const busyClass = table.status === 'busy' ? 'table-is-busy' : ''
      return `${baseClass} ${busyClass}`
    },

    getInvoiceFromTable (table) {
      return table.invoices && table.invoices.length > 0 ? table.invoices[0] : null
    },

    // Zoom methods
    zoomIn () {
      const newZoom = Math.min(this.zoomLevel + 0.2, 2)
      this.smoothZoom(newZoom)
    },

    zoomOut () {
      const newZoom = Math.max(this.zoomLevel - 0.2, 0.5)
      this.smoothZoom(newZoom)
    },

    smoothZoom (targetZoom) {
      const startZoom = this.zoomLevel
      const duration = 200
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)

        this.zoomLevel = startZoom + (targetZoom - startZoom) * easeOut

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.$emit('zoom-changed', this.zoomLevel)
        }
      }

      requestAnimationFrame(animate)
    },

    // Pan methods
    startPan (event) {
      if (event.target.closest('.draggable-resizable-vue')) {
        return
      }

      this.isPanning = true
      const touch = event.touches ? event.touches[0] : event
      this.startPanX = touch.clientX - this.panX
      this.startPanY = touch.clientY - this.panY
      event.currentTarget.style.cursor = 'grabbing'
    },

    onPan (event) {
      if (!this.isPanning) return

      const touch = event.touches ? event.touches[0] : event
      this.panX = touch.clientX - this.startPanX
      this.panY = touch.clientY - this.startPanY

      if (event.cancelable) {
        event.preventDefault()
      }
    },

    endPan (event) {
      if (!this.isPanning) return

      this.isPanning = false
      event.currentTarget.style.cursor = 'grab'
      this.$emit('pan-changed', { x: this.panX, y: this.panY })
    }
  }
}
</script>

<style scoped>
/* Base styles for canvas */
.table-canvas-main-area {
  flex: 1;
  background: radial-gradient(circle at 25px 25px, rgba(224, 224, 224, 0.5) 1px, transparent 1px), #f0f0f0;
  background-size: 50px 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.canvas-viewport-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 14px;
}

.canvas-viewport-container.pan-enabled {
  cursor: grab;
  user-select: none;
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.control-btn {
  color: var(--q-primary);
}

.zoom-level-display {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: center;
}

.canvas-transform-wrapper {
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-canvas {
  background-color: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.luxury-canvas::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Dark mode support */
body.body--dark .table-canvas-main-area {
  background: radial-gradient(circle at 25px 25px, rgba(58, 58, 58, 0.5) 1px, transparent 1px), #121212;
}

body.body--dark .luxury-canvas {
  background-color: #1e1e1e;
  border-color: #3a3a3a;
}

body.body--dark .zoom-level-display {
  color: #f0f0f0;
}
</style>
