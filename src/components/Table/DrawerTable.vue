<template>
  <div
    class="luxury-restaurant-designer waiter-dashboard"
    :style="`width: ${(selectedRoom?.width || 120) * 37}px; height: ${(selectedRoom?.height || 120) * 47}px; max-width: 95vw;`"
  >
    <!-- Elevated Header -->
    <header class="luxury-header">
      <div class="header-content-wrapper">
        <div class="brand-identity">
          <div class="brand-logo-circle">
            <q-icon name="restaurant" class="brand-icon" />
          </div>
          <div class="brand-text-group column">
            <span class="app-title">Mesas</span>
            <span class="app-subtitle">Gestión de Mesas y Pedidos</span>
          </div>
        </div>

        <div class="header-controls-group">
          <div class="room-selection-area">
            <q-select
              v-model="selectedRoom"
              :options="roomOptions"
              option-label="name"
              option-value="id"
              label="Seleccionar Sala"
              outlined
              dense
              class="luxury-select"
              @update:model-value="onRoomChange"
            >
              <template v-slot:prepend>
                <q-icon name="meeting_room" class="select-icon" />
              </template>
            </q-select>
          </div>

          <div class="action-buttons-group full-width">
            <q-btn
              icon="refresh"
              label="Actualizar Mesas"
              @click="refreshTables"
              class="action-button secondary-action-button"
              flat
            />
            <slot name="header"></slot>
          </div>
        </div>
      </div>
    </header>
    <!-- Main Canvas Area -->
    <main class="canvas-main-area" v-if="selectedRoom">
      <div class="canvas-viewport-container">
        <div class="canvas-transform-wrapper" :style="{ transform: `scale(${zoomLevel})` }">
          <draggable-resizable-container
            :grid="[gridSize, gridSize]"
            :show-grid="showGrid"
            class="luxury-canvas"
            :style="canvasStyle"
          >
            <draggable-resizable-vue
              v-for="(table, index) in currentTables"
              :key="table.id || index"
              v-model:x="table.x"
              v-model:y="table.y"
              v-model:h="table.height"
              v-model:w="table.width"
              :class="getTableWrapperClass(table)"
              :handles-size="8"
              :draggable="false"
              :resizable="false"
              @click="onTableClick(table)"
            >
              <div :class="getTableDesignClass(table)">
                <div class="table-visual-surface">
                  <div class="table-gloss-effect"></div>
                  <div class="table-info-overlay">
                    <span class="table-name-text">{{ table.name }}</span>
                    <span class="table-capacity-text">
                      <q-icon name="person" class="capacity-icon" />
                      {{ table.capacity || 4 }}
                    </span>
                  </div>
                  <div class="table-status-indicator" :class="table.status || 'unoccupied'"></div>
                </div>
              </div>
              <!-- Checkbox for unoccupied tables -->
              <q-checkbox
                v-if="table.status === 'unoccupied'"
                v-model="tableSelected"
                :val="table.id"
                color="teal"
                class="fixed-top-right q-ma-xs"
              />
              <!-- Buttons for busy tables -->
              <template v-else-if="table.status === 'busy'">
                <q-btn
                  icon="receipt"
                  color="secondary"
                  size="sm"
                  round
                  class="fixed-top-right q-ma-xs"
                  @click.stop="$emit('update:invoice', table)"
                />
                <q-btn
                  icon="close"
                  color="negative"
                  size="sm"
                  round
                  class="fixed-bottom-right q-ma-xs"
                  @click.stop="$emit('update:freeTable', table)"
                  v-if="freeTable"
                />
              </template>
            </draggable-resizable-vue>
          </draggable-resizable-container>
        </div>
      </div>
    </main>

    <!-- Elegant Empty State -->
    <div v-else class="empty-state-container">
      <div class="empty-state-illustration">
        <div class="illustration-circle-bg">
          <q-icon name="restaurant_menu" />
        </div>
      </div>
      <div class="empty-state-content">
        <h3 class="empty-state-title">Bienvenido al Servicio de Mesas</h3>
        <p class="empty-state-description">Selecciona una sala para ver la distribución de mesas y gestionar pedidos.</p>
        <q-btn
          label="Seleccionar Sala"
          icon="meeting_room"
          @click="showRoomSelection = true"
          class="action-button primary-action-button large-button"
          unelevated
        />
      </div>
    </div>

    <!-- Invoice Detail Dialog (Managed by parent component via emits) -->
    <!-- This dialog is not directly in this component, but triggered by emits -->
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'

export default {
  components: {
    DraggableResizableContainer,
    DraggableResizableVue
  },
  props: {
    tablesSelected: {
      type: Array,
      required: true
    },
    freeTable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:tableSelected', 'update:invoice', 'update:freeTable'],
  data () {
    return {
      selectedRoom: null,
      currentTables: [],
      livingRooms: [],
      showGrid: true,
      gridSize: 20,
      canvasWidth: 20, // Default width in meters
      canvasHeight: 15, // Default height in meters
      zoomLevel: 1,

      // Internal state for table selection (synced with prop)
      tableSelected: [],

      // Status mapping for display
      statusMap: {
        unoccupied: 'Desocupada',
        busy: 'Ocupada'
      }
    }
  },

  computed: {
    ...mapState(authentication, ['userSession', 'branchOffice']),

    roomOptions () {
      return this.livingRooms.map(room => ({
        ...room,
        label: room.name,
        value: room.id
      }))
    },

    canvasStyle () {
      // 1 meter = 30 pixels (adjust as needed for visual scale)
      return {
        width: `${this.canvasWidth * 30}px`,
        height: `${this.canvasHeight * 30}px`
      }
    }
  },

  watch: {
    tableSelected: {
      handler (newVal) {
        this.$emit('update:tableSelected', newVal)
      },
      deep: true
    }
  },

  created () {
    this.getLivingRooms()
  },

  methods: {
    async getLivingRooms () {
      try {
        const { data } = await this.$api.get('living-rooms')
        this.livingRooms = data // Assuming data.data contains the array of rooms
        if (this.livingRooms.length > 0 && !this.selectedRoom) {
          this.selectedRoom = this.livingRooms[0]
          this.onRoomChange(this.selectedRoom)
          console.log(this.selectedRoom)
        }
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    async onRoomChange (room) {
      if (room) {
        this.canvasWidth = room.width || 20
        this.canvasHeight = room.height || 15
        await this.getTablesForRoom(room.id)
      }
    },

    async getTablesForRoom (roomId) {
      try {
        const { data } = await this.$api.get('tables', {
          params: {
            dataEqualFilter: {
              living_room_id: roomId
            }
          }
        })
        this.currentTables = data
      } catch (err) {
        Notify.create({
          message: `Error al cargar mesas: ${err.message}`,
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    async refreshTables () {
      if (this.selectedRoom) {
        await this.getTablesForRoom(this.selectedRoom.id)
        Notify.create({
          message: 'Mesas actualizadas',
          icon: 'check_circle',
          color: 'positive'
        })
      }
    },

    onTableClick (table) {
      if (table.status === 'busy') {
        // If busy, emit to parent to open invoice dialog
        this.$emit('update:invoice', table)
      } else {
        // If unoccupied, toggle selection in tableSelected array
        const index = this.tableSelected.indexOf(table.id)
        if (index > -1) {
          this.tableSelected.splice(index, 1)
        } else {
          this.tableSelected.push(table.id)
        }
      }
    },

    // Utility methods
    getTableWrapperClass (table) {
      const baseClass = 'table-draggable-wrapper'
      // Add 'is-selected' class if table is selected (for visual feedback)
      const selectedClass = this.tableSelected.includes(table.id) ? 'is-selected' : ''
      return `${baseClass} ${selectedClass}`
    },

    getTableDesignClass (table) {
      const baseClass = `luxury-table table-shape-${table.shape || 'round'}`
      const busyClass = table.status === 'busy' ? 'table-is-busy' : ''
      return `${baseClass} ${busyClass}`
    },

    getTableStatusLabel (status) {
      return this.statusMap[status] || status
    }
  }
}
</script>

<style>
/* --- Global Variables for Luxury Theme (Quasar Dark Mode Compatible) --- */
:root {
  /* Light Mode Defaults */
  --color-background: #f0f0f0;
  --color-surface: #ffffff;
  --color-card: #f8f8f8;
  --color-text: #333333;
  --color-text-muted: #666666;
  --color-border: #e0e0e0;

  /* Accent Colors (remain consistent across modes) */
  --color-accent-gold: #d4af37;
  --color-accent-gold-light: #e6c25a;
  --color-accent-gold-dark: #b8942e;
  --color-success: #4CAF50;
  --color-danger: #EF5350;
  --color-danger-dark: #CC3333; /* Darker shade for gradients */

  /* Table Base Colors (can be adjusted for dark mode if desired, but user asked for vibrant) */
  --table-round-bg: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%); /* Deep Amethyst Purple */
  --table-square-bg: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); /* Sapphire Blue */
  --table-rectangle-bg: linear-gradient(135deg, #16A34A 0%, #15803D 100%); /* Emerald Green */
  --table-oval-bg: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); /* Ruby Red */

  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Playfair Display', serif;

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
  --spacing-unit: 0.8rem;
}

/* Dark Mode Overrides */
body.body--dark {
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-card: #282828;
  --color-text: #f0f0f0;
  --color-text-muted: #b0b0b0;
  --color-border: #3a3a3a;
}

/* --- Base Page Styling --- */
.luxury-restaurant-designer {
  background-color: var(--color-background);
  font-family: var(--font-family-primary);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* --- Header Styling --- */
.luxury-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-unit);
}

.brand-logo-circle {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold-dark), 0.4);
}

.brand-icon {
  font-size: 1.8rem;
  color: white;
}

.brand-text-group .app-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
  letter-spacing: -0.03em;
}

.brand-text-group .app-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header-controls-group {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
}

.room-selection-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.luxury-select {
  min-width: 220px;
  background-color: var(--color-card); /* Use card color for select background */
  border-radius: var(--border-radius-md);
}

.luxury-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  min-height: 40px;
  padding: 0 12px;
}

.luxury-select :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px;
}

.luxury-select :deep(.q-field__native) {
  padding-top: 8px;
}

.select-icon {
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.action-button {
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.2s ease-in-out;
}

.primary-action-button {
  background-color: var(--color-accent-gold);
  color: var(--color-background); /* Text color should contrast with gold */
  box-shadow: 0 2px 8px rgba(var(--color-accent-gold), 0.3);
}

.primary-action-button:hover {
  background-color: var(--color-accent-gold-light);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold), 0.4);
}

.secondary-action-button {
  color: var(--color-text-muted);
}

.secondary-action-button:hover {
  background-color: var(--color-card);
  color: var(--color-text);
}

.large-button {
  padding: 0.9rem 1.8rem;
  font-size: 1rem;
}

/* --- Main Canvas Area --- */
.canvas-main-area {
  flex: 1;
  padding: calc(var(--spacing-unit) * 1.5);
  background:
    radial-gradient(circle at 25px 25px, rgba(var(--color-border), 0.5) 1px, transparent 1px),
    var(--color-background);
  background-size: 50px 50px;
  /* Removed min-height to allow canvas to adapt fully */
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-viewport-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%; /* Ensure it takes full height of parent */
  width: 100%;
}

.canvas-transform-wrapper {
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.luxury-canvas {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
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

/* --- Table Styling --- */
.table-draggable-wrapper {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.3));
}

.table-draggable-wrapper:hover {
  transform: translateY(-3px) scale(1.02);
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.4));
}

.table-draggable-wrapper.is-selected {
  z-index: 1000;
  filter:
    drop-shadow(0 0 0 3px var(--color-accent-gold))
    drop-shadow(0 9px 24px rgba(0, 0, 0, 0.5));
  transform: translateY(-3px) scale(1.02);
}

.luxury-table {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3);
}

.table-visual-surface {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.table-gloss-effect {
  position: absolute;
  top: 10%;
  left: 20%;
  right: 20%;
  height: 30%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-radius: inherit;
  filter: blur(8px);
  opacity: 0.8;
}

.table-info-overlay {
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.table-name-text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.table-capacity-text {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.8rem;
  opacity: 0.95;
}

.capacity-icon {
  font-size: 0.8rem;
}

.table-status-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.table-status-indicator.unoccupied {
  background-color: var(--color-success); /* Green for unoccupied */
}

.table-status-indicator.busy {
  background-color: var(--color-danger); /* Red for busy */
}

/* --- Specific Table Shapes (Vibrant & Elegant) --- */
.table-shape-round {
  background: var(--table-round-bg);
  border-radius: 50%;
}

.table-shape-square {
  background: var(--table-square-bg);
  border-radius: var(--border-radius-md);
}

.table-shape-rectangle {
  background: var(--table-rectangle-bg);
  border-radius: var(--border-radius-lg);
}

.table-shape-oval {
  background: var(--table-oval-bg);
  border-radius: 50%;
  transform: scaleX(1.3);
}

/* --- Busy Table Background (More prominent) --- */
.luxury-table.table-is-busy {
  background: linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-dark) 100%);
  box-shadow: 0 0 15px rgba(var(--color-danger), 0.6);
  animation: pulse-red 1.5s infinite alternate; /* Optional: subtle pulse */
}

@keyframes pulse-red {
  from { box-shadow: 0 0 15px rgba(var(--color-danger), 0.6); }
  to { box-shadow: 0 0 25px rgba(var(--color-danger), 0.8); }
}

/* --- Empty State Styling --- */
.empty-state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 1.5);
  min-height: calc(100vh - 180px); /* Keep a min-height for empty state */
}

.empty-state-illustration {
  margin-bottom: calc(var(--spacing-unit) * 2.5);
}

.illustration-circle-bg {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--color-accent-gold) 0%, var(--color-accent-gold-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(var(--color-accent-gold), 0.3);
  margin: 0 auto;
}

.illustration-circle-bg .q-icon {
  font-size: 3.5rem;
  color: var(--color-background);
}

.empty-state-content .empty-state-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: var(--color-text);
  letter-spacing: -0.04em;
}

.empty-state-content .empty-state-description {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: calc(var(--spacing-unit) * 2);
  max-width: 500px;
  line-height: 1.5;
}

/* --- Dialog Styling (General, for consistency) --- */
.luxury-dialog {
  width: 500px;
  max-width: 90vw;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background-color: var(--color-surface);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border);
}

.dialog-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing-unit) * 1.5);
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  color: var(--color-background);
}

.dialog-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.dialog-icon {
  font-size: 1.3rem;
}

.dialog-title-text {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dialog-close-button {
  color: rgba(var(--color-background), 0.7);
}

.dialog-close-button:hover {
  color: var(--color-background);
  background-color: rgba(255, 255, 255, 0.1);
}

.dialog-body-content {
  padding: calc(var(--spacing-unit) * 1.5);
}

.dialog-action-buttons {
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5);
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.dialog-cancel-button {
  color: var(--color-text-muted);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease-in-out;
}

.dialog-cancel-button:hover {
  background-color: var(--color-card);
  color: var(--color-text);
}

.luxury-input :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-card);
  color: var(--color-text);
  min-height: 40px;
  padding: 0 12px;
}

.luxury-input :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px;
}

.luxury-input :deep(.q-field__native) {
  padding-top: 8px;
}

.luxury-input :deep(.q-field__control):hover:before {
  border-color: var(--color-accent-gold) !important;
}

.luxury-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-accent-gold) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-accent-gold), 0.3);
}

/* --- Responsive Design --- */
@media (max-width: 1200px) {
  .header-content-wrapper {
    flex-direction: column;
    gap: var(--spacing-unit);
    align-items: flex-start;
  }

  .header-controls-group {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .luxury-header {
    padding: 0.8rem;
  }

  .brand-identity {
    flex-direction: column;
    gap: 0.4rem;
    text-align: center;
  }

  .header-controls-group {
    flex-direction: column;
    gap: 0.8rem;
  }

  .room-selection-area {
    width: 100%;
  }

  .luxury-select {
    flex: 1;
    min-width: auto;
  }

  .action-buttons-group {
    justify-content: center;
    flex-wrap: wrap;
  }

  .canvas-main-area {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .luxury-dialog {
    width: 95vw;
  }

  .dialog-header-section,
  .dialog-body-content,
  .dialog-action-buttons {
    padding: var(--spacing-unit);
  }
}
</style>
