<template>
  <q-page class="luxury-restaurant-designer">
    <!-- Elevated Header -->
    <header class="luxury-header">
      <div class="header-content-wrapper">
        <div class="brand-identity">
          <div class="brand-logo-circle">
            <q-icon name="restaurant" class="brand-icon" />
          </div>
          <div class="brand-text-group column">
            <span class="text-h5">Diseñador de mesas</span>
            <span class="app-subtitle">Configuración de Espacios Premium</span>
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

            <q-btn
              round
              flat
              icon="add"
              @click="showNewRoomDialog = true"
              class="add-room-button"
            >
              <q-tooltip class="luxury-tooltip">Crear Nueva Sala</q-tooltip>
            </q-btn>
          </div>

          <div class="action-buttons-group">
            <q-btn
              icon="add_circle_outline"
              label="Nueva Mesa"
              @click="showAddTableDialog = true"
              class="action-button primary-action-button"
              unelevated
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Refined Stats Bar -->
    <section class="stats-overview-bar" v-if="selectedRoom">
      <div class="stats-content-wrapper">
        <div class="room-details-section">
          <span class="room-name-display">{{ selectedRoom.name }}</span>
          <q-btn
            flat
            round
            icon="settings"
            @click="showCanvasSettings = true"
            size="sm"
            class="room-settings-button"
          >
            <q-tooltip class="luxury-tooltip">Configurar Sala</q-tooltip>
          </q-btn>
        </div>

        <div class="metrics-display-grid">
          <div class="metric-card">
            <q-icon name="table_restaurant" class="metric-icon" />
            <div class="metric-data">
              <span class="metric-value">{{ currentTables.length }}</span>
              <span class="metric-label">Mesas</span>
            </div>
          </div>

          <div class="metric-card">
            <q-icon name="people_outline" class="metric-icon" />
            <div class="metric-data">
              <span class="metric-value">{{ totalCapacity }}</span>
              <span class="metric-label">Personas</span>
            </div>
          </div>

          <div class="metric-card">
            <q-icon name="straighten" class="metric-icon" />
            <div class="metric-data">
              <span class="metric-value">{{ canvasWidth }}×{{ canvasHeight }}</span>
              <span class="metric-label">Metros</span>
            </div>
          </div>

          <div class="metric-card">
            <q-icon name="zoom_in" class="metric-icon" />
            <div class="metric-data">
              <span class="metric-value">{{ Math.round(zoomLevel * 100) }}%</span>
              <span class="metric-label">Zoom</span>
            </div>
          </div>
        </div>

        <div class="canvas-toolbar-group">
          <div class="toolbar-button-group">
            <q-btn
              icon="grid_on"
              @click="showGrid = !showGrid"
              :class="['toolbar-button', { 'is-active': showGrid }]"
              flat
              round
              size="sm"
            >
              <q-tooltip class="luxury-tooltip">Mostrar Grilla</q-tooltip>
            </q-btn>
            <q-btn
              icon="grid_4x4"
              @click="alignTablesToGrid"
              class="toolbar-button"
              flat
              round
              size="sm"
              :disable="currentTables.length === 0"
            >
              <q-tooltip class="luxury-tooltip">Alinear Mesas a Grilla</q-tooltip>
            </q-btn>
          </div>

          <div class="toolbar-button-group">
            <q-btn
              icon="save"
              @click="saveCurrentRoom"
              :loading="loadingEdit"
              class="toolbar-button save-button"
              flat
              round
              size="sm"
            >
              <q-tooltip class="luxury-tooltip">Guardar Cambios</q-tooltip>
            </q-btn>
            <q-btn
              icon="print"
              @click="printQr"
              flat
              round
              size="sm"
              class="toolbar-button print-button"
            >
              <q-tooltip class="luxury-tooltip">Imprimir QRs</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Canvas Area -->
    <main class="canvas-main-area" v-show="selectedRoom">
      <div class="canvas-edit-controls" v-if="selectedTable">
        <q-btn icon="edit" @click="showEditTableDialog = true" dense round flat class="control-btn text-white">
          <q-tooltip>Editar Mesa</q-tooltip>
        </q-btn>
        <q-btn icon="delete_outline" @click="confirmDeleteTable" dense round flat class="control-btn text-white">
          <q-tooltip>Eliminar Mesa</q-tooltip>
        </q-btn>
      </div>

      <div class="canvas-controls">
        <q-btn icon="zoom_in" @click="zoomIn" dense round flat class="control-btn"></q-btn>
        <span class="zoom-level-display">{{ Math.round(zoomLevel * 100) }}%</span>
        <q-btn icon="zoom_out" @click="zoomOut" dense round flat class="control-btn"></q-btn>
      </div>
      <div
        class="canvas-viewport-container"
        @click="selectedTable = null"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @touchstart="startPan"
        @touchmove="onPan"
        @touchend="endPan"
      >
        <div class="canvas-transform-wrapper" :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`, transition: isPanning ? 'none' : 'transform 0.1s ease-out' }">
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
              :scale="zoomLevel"
              @resizing="onTableResizing(index)"
              @dragging="onTableDragging(index)"
              @deactivated="onTableDeactivated(table, index)"
              @click.stop="onTableActivated(table, index)"
              @touchstart.stop
              @mousedown.stop
            >
              <div class="table-visual-surface">
                <div class="table-info-overlay">
                  <span class="table-name-text">{{ table.name }}</span>
                  <span class="table-capacity-text">
                    <q-icon name="person" class="capacity-icon" />
                    {{ table.capacity || 4 }}
                  </span>
                </div>
                <div class="table-status-indicator" :class="table.status || 'available'"></div>
              </div>
              <div :class="getTableDesignClass(table)">
              </div>
            </draggable-resizable-vue>
          </draggable-resizable-container>
        </div>
      </div>
    </main>

    <!-- Elegant Empty State -->
    <div v-show="!selectedRoom" class="empty-state-container">
      <div class="empty-state-illustration">
        <div class="illustration-circle-bg">
          <q-icon name="restaurant_menu" />
        </div>
      </div>
      <div class="empty-state-content">
        <h3 class="empty-state-title">Bienvenido al Mesa Designer</h3>
        <p class="empty-state-description">Crea tu primera sala para comenzar a diseñar la distribución perfecta para tu restaurante de alta gama.</p>
        <q-btn
          label="Crear Primera Sala"
          icon="add"
          @click="showNewRoomDialog = true"
          class="action-button primary-action-button large-button"
          unelevated
        />
      </div>
    </div>

    <!-- Refined Dialogs -->
    <!-- New Room Dialog -->
    <q-dialog v-model="showNewRoomDialog" persistent :maximized="$q.screen.lt.sm" transition-show="slide-up" transition-hide="slide-down">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
      >
        <q-form @submit="createNewRoom" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="dialog-title-group">
              <q-icon name="meeting_room" class="dialog-icon q-mr-sm" />
              <div class="text-h6">Nueva Sala</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showNewRoomDialog = false" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <q-input
              v-model="newRoom.name"
              label="Nombre de la sala"
              outlined
              autofocus
              class="luxury-input"
              :rules="[val => !!val || 'El campo es requerido.']"
            />

            <div class="dimension-input-group">
              <h6 class="input-group-title">Dimensiones de la Sala</h6>
              <div class="dimension-grid-inputs">
                <q-input
                  v-model.number="newRoom.width"
                  label="Ancho"
                  type="number"
                  outlined
                  min="5"
                  max="50"
                  suffix="m"
                  class="luxury-input"
                />
                <q-input
                  v-model.number="newRoom.height"
                  label="Alto"
                  type="number"
                  outlined
                  min="5"
                  max="50"
                  suffix="m"
                  class="luxury-input"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn flat label="Cancelar" @click="showNewRoomDialog = false" class="dialog-cancel-button" />
            <q-btn
              label="Crear Sala"
              type="submit"
              :loading="loadingSave"
              class="action-button primary-action-button"
              unelevated
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add Table Dialog -->
    <q-dialog v-model="showAddTableDialog" persistent :maximized="$q.screen.lt.sm" transition-show="slide-up" transition-hide="slide-down">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
      >
        <q-form @submit="addNewTable" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="dialog-title-group">
              <q-icon name="table_restaurant" class="dialog-icon q-mr-sm" />
              <div class="text-h6">Nueva Mesa</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showAddTableDialog = false" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <q-input
              v-model="newTable.name"
              label="Nombre de la mesa"
              outlined
              autofocus
              class="luxury-input"
              :rules="[val => !!val || 'El campo es requerido.']"
            />

            <div class="shape-selection-group">
              <h6 class="input-group-title">Forma de la Mesa</h6>
              <div class="shape-options-grid">
                <div
                  v-for="shape in tableShapes"
                  :key="shape.value"
                  :class="['shape-option-card', { 'is-selected': newTable.shape === shape.value }]"
                  @click="newTable.shape = shape.value"
                >
                  <div :class="['shape-preview-thumbnail', `thumbnail-${shape.value}`]"></div>
                  <span class="shape-option-label">{{ shape.label }}</span>
                </div>
              </div>
            </div>

            <q-input
              v-model.number="newTable.capacity"
              label="Capacidad"
              type="number"
              outlined
              min="1"
              max="12"
              suffix="personas"
              class="luxury-input"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn flat label="Cancelar" @click="showAddTableDialog = false" class="dialog-cancel-button" />
            <q-btn
              label="Agregar Mesa"
              type="submit"
              class="action-button primary-action-button"
              unelevated
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Edit Table Dialog -->
    <q-dialog v-model="showEditTableDialog" persistent :maximized="$q.screen.lt.sm" transition-show="slide-up" transition-hide="slide-down">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
        v-if="selectedTable"
      >
        <q-form @submit="saveTableEdit" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="dialog-title-group">
              <q-icon name="edit" class="dialog-icon q-mr-sm" />
              <div class="text-h6">Editar Mesa</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showEditTableDialog = false" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <q-input
              v-model="selectedTable.name"
              label="Nombre de la mesa"
              outlined
              class="luxury-input"
              :rules="[val => !!val || 'El campo es requerido.']"
            />

            <div class="shape-selection-group">
              <h6 class="input-group-title">Forma de la Mesa</h6>
              <div class="shape-options-grid">
                <div
                  v-for="shape in tableShapes"
                  :key="shape.value"
                  :class="['shape-option-card', { 'is-selected': selectedTable.shape === shape.value }]"
                  @click="selectedTable.shape = shape.value"
                >
                  <div :class="['shape-preview-thumbnail', `thumbnail-${shape.value}`]"></div>
                  <span class="shape-option-label">{{ shape.label }}</span>
                </div>
              </div>
            </div>

            <q-input
              v-model.number="selectedTable.capacity"
              label="Capacidad"
              type="number"
              outlined
              min="1"
              max="12"
              suffix="personas"
              class="luxury-input"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn flat label="Cancelar" @click="showEditTableDialog = false" class="dialog-cancel-button" />
            <q-btn
              label="Guardar Cambios"
              type="submit"
              class="action-button primary-action-button"
              unelevated
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Canvas Settings Dialog -->
    <q-dialog v-model="showCanvasSettings" persistent :maximized="$q.screen.lt.sm" transition-show="slide-up" transition-hide="slide-down">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 85vw;'}`"
      >
        <q-form @submit="applyCanvasSettings" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="dialog-title-group">
              <q-icon name="settings" class="dialog-icon q-mr-sm" />
              <div class="text-h6">Configurar Sala</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showCanvasSettings = false" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="dimension-input-group">
              <h6 class="input-group-title">Dimensiones de la Sala</h6>
              <div class="dimension-grid-inputs">
                <q-input
                  v-model.number="canvasWidth"
                  label="Ancho"
                  type="number"
                  outlined
                  min="5"
                  max="50"
                  suffix="m"
                  class="luxury-input"
                />
                <q-input
                  v-model.number="canvasHeight"
                  label="Alto"
                  type="number"
                  outlined
                  min="5"
                  max="50"
                  suffix="m"
                  class="luxury-input"
                />
              </div>
            </div>

            <q-input
              v-model.number="gridSize"
              label="Tamaño de grilla"
              type="number"
              outlined
              min="10"
              max="50"
              suffix="px"
              class="luxury-input"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn flat label="Cancelar" @click="showCanvasSettings = false" class="dialog-cancel-button" />
            <q-btn
              label="Aplicar"
              type="submit"
              class="action-button primary-action-button"
              unelevated
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Print QR (Hidden) -->
    <div id="printMe" v-show="false" class="print-qr-container">
      <div class="print-header-qr">
        <h2>{{ selectedRoom?.name }}</h2>
      </div>
      <div
        v-for="table in currentTables"
        :key="table.id"
        class="print-qr-item"
        v-show="table.id"
      >
        <img :id="table.id" :alt="table.name" width="200" height="200">
        <span>{{ table.name }}</span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import QRCode from 'qrcode'
import { nextTick } from 'vue'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'

export default {
  components: {
    DraggableResizableContainer,
    DraggableResizableVue
  },
  data () {
    return {
      selectedRoom: null,
      selectedTable: null,
      livingRooms: [],
      currentTables: [],
      showGrid: true,
      gridSize: 20,
      canvasWidth: 20,
      canvasHeight: 15,
      previousCanvasWidth: 20, // Added for scaling logic
      previousCanvasHeight: 15, // Added for scaling logic
      zoomLevel: 1,

      // Pan control states
      panX: 0,
      panY: 0,
      isPanning: false,
      startPanX: 0,
      startPanY: 0,

      // Dialog states
      showNewRoomDialog: false,
      showAddTableDialog: false,
      showEditTableDialog: false,
      showCanvasSettings: false,

      // Loading states
      loadingSave: false,
      loadingEdit: false,

      // New room data
      newRoom: {
        name: '',
        width: 20,
        height: 15
      },

      // New table data
      newTable: {
        name: '',
        shape: 'round',
        capacity: 4
      },

      // Table shapes
      tableShapes: [
        { value: 'round', label: 'Redonda', icon: 'radio_button_unchecked' },
        { value: 'square', label: 'Cuadrada', icon: 'crop_square' },
        { value: 'rectangle', label: 'Rectangular', icon: 'crop_landscape' },
        { value: 'oval', label: 'Ovalada', icon: 'oval' }
      ],

      // API params
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 100,
        dataSearch: {
          id: '',
          name: ''
        }
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

    totalCapacity () {
      return this.currentTables.reduce((sum, table) => sum + (table.capacity || 4), 0)
    },

    canvasStyle () {
      return {
        width: `${this.canvasWidth * 30}px`,
        height: `${this.canvasHeight * 30}px`
      }
    }
  },

  created () {
    this.getLivingRooms()
  },

  methods: {
    // Room management
    async getLivingRooms (params = this.params) {
      this.visible = true
      try {
        const { data } = await this.$api.get('living-rooms', { params: this.params })
        this.livingRooms = data.data
        if (this.livingRooms.length > 0 && !this.selectedRoom) {
          this.selectedRoom = this.livingRooms[0]
          this.onRoomChange(this.selectedRoom)
        }
        this.visible = false
      } catch (err) {
        this.visible = false
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },

    onRoomChange (room) {
      if (room) {
        this.currentTables = [...(room.tables || [])]
        this.canvasWidth = room.width || 20
        this.canvasHeight = room.height || 15
        this.previousCanvasWidth = this.canvasWidth // Update previous dimensions
        this.previousCanvasHeight = this.canvasHeight // Update previous dimensions
        this.selectedTable = null
        // Reset pan and zoom when changing rooms
        this.panX = 0
        this.panY = 0
        this.zoomLevel = 1
        this.handlerQr(this.currentTables)
      }
    },

    async createNewRoom () {
      this.loadingSave = true
      try {
        const { data } = await this.$api.post('living-rooms', {
          user_created_id: this.userSession?.id,
          name: this.newRoom.name,
          width: this.newRoom.width,
          height: this.newRoom.height,
          tables: []
        })

        await this.getLivingRooms()
        this.selectedRoom = this.livingRooms.find(r => r.id === data.id)
        this.onRoomChange(this.selectedRoom)
        this.showNewRoomDialog = false
        this.newRoom = { name: '', width: 20, height: 15 }

        Notify.create({
          message: 'Sala creada exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
      this.loadingSave = false
    },

    async saveCurrentRoom () {
      if (!this.selectedRoom) return

      this.loadingEdit = true
      try {
        await this.$api.put(`living-rooms/${this.selectedRoom.id}`, {
          user_created_id: this.userSession?.id,
          name: this.selectedRoom.name,
          width: this.canvasWidth,
          height: this.canvasHeight,
          tables: this.currentTables
        })

        const currentRoomId = this.selectedRoom.id
        await this.getLivingRooms()
        const updatedRoom = this.livingRooms.find(room => room.id === currentRoomId)
        if (updatedRoom) {
          this.selectedRoom = updatedRoom
          this.onRoomChange(updatedRoom)
        }

        Notify.create({
          message: 'Cambios guardados exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        Notify.create({
          message: err.message,
          icon: 'warning',
          color: 'negative'
        })
      }
      this.loadingEdit = false
    },

    // Table management
    addNewTable () {
      // Generate random positions aligned to grid
      const randomX = Math.floor(Math.random() * 10) * this.gridSize + this.gridSize * 2
      const randomY = Math.floor(Math.random() * 10) * this.gridSize + this.gridSize * 2

      const newTable = {
        isNew: true,
        id: Date.now(),
        name: this.newTable.name,
        shape: this.newTable.shape,
        capacity: this.newTable.capacity,
        width: this.getTableDefaultSize(this.newTable.shape).width,
        height: this.getTableDefaultSize(this.newTable.shape).height,
        x: randomX, // Aligned to grid
        y: randomY, // Aligned to grid
        status: 'available'
      }

      this.currentTables.push(newTable)
      this.showAddTableDialog = false
      this.newTable = { name: '', shape: 'round', capacity: 4 }
    },

    saveTableEdit () {
      this.showEditTableDialog = false

      const index = this.currentTables.findIndex(t => t.id === this.selectedTable.id)

      if (index !== -1) {
        // Reemplaza el objeto entero
        this.currentTables.splice(index, 1, { ...this.selectedTable })
      }
    },

    /**
     * Align all tables to grid
     * Rounds positions and dimensions to nearest gridSize multiple
     */
    alignTablesToGrid () {
      if (this.currentTables.length === 0) {
        this.$q.notify({
          message: 'No hay mesas para alinear',
          type: 'info',
          icon: 'info'
        })
        return
      }

      let alignedCount = 0

      this.currentTables.forEach(table => {
        // Store original values
        const originalX = table.x
        const originalY = table.y
        const originalWidth = table.width
        const originalHeight = table.height

        // Round to nearest grid multiple
        table.x = Math.round(table.x / this.gridSize) * this.gridSize
        table.y = Math.round(table.y / this.gridSize) * this.gridSize
        table.width = Math.round(table.width / this.gridSize) * this.gridSize
        table.height = Math.round(table.height / this.gridSize) * this.gridSize

        // Ensure minimum size (at least 1 grid unit)
        if (table.width < this.gridSize) table.width = this.gridSize
        if (table.height < this.gridSize) table.height = this.gridSize

        // Count if table was actually modified
        if (originalX !== table.x || originalY !== table.y ||
            originalWidth !== table.width || originalHeight !== table.height) {
          alignedCount++
        }
      })

      this.$q.notify({
        message: alignedCount > 0
          ? `${alignedCount} mesa${alignedCount > 1 ? 's' : ''} alineada${alignedCount > 1 ? 's' : ''} a la grilla`
          : 'Todas las mesas ya están alineadas',
        type: alignedCount > 0 ? 'positive' : 'info',
        icon: alignedCount > 0 ? 'check_circle' : 'info',
        timeout: 2000
      })
    },

    confirmDeleteTable () {
      if (!this.selectedTable) return

      // If the table is new and not saved, delete it locally without an API call.
      if (this.selectedTable.isNew) {
        const index = this.currentTables.findIndex(t => t.id === this.selectedTable.id)
        if (index > -1) {
          this.currentTables.splice(index, 1)
          this.selectedTable = null
          this.$q.notify({
            color: 'info',
            message: 'Mesa eliminada del diseño actual. Guarda los cambios para confirmar.',
            icon: 'delete'
          })
        }
        return
      }

      (async () => {
        try {
          await this.$api.delete(`tables/${this.selectedTable.id}`)
          this.$q.notify({
            color: 'positive',
            message: 'Mesa eliminada correctamente',
            icon: 'check'
          })
          const currentRoomId = this.selectedRoom.id
          await this.getLivingRooms()
          const updatedRoom = this.livingRooms.find(room => room.id === currentRoomId)
          if (updatedRoom) {
            this.selectedRoom = updatedRoom
            this.onRoomChange(updatedRoom)
          }
          this.selectedTable = null
        } catch (error) {
          this.$q.notify({
            color: 'negative',
            message: 'Error al eliminar la mesa: ' + (error.message || 'Error desconocido'),
            icon: 'warning'
          })
        }
      })()
    },

    // Table interactions
    onTableActivated (table, index) {
      this.selectedTable = { ...table, index }
    },

    onTableResizing (index) {
      const table = this.currentTables[index]
      if (!table) return

      // Force absolute snapping to grid in real-time
      table.x = Math.round(table.x / this.gridSize) * this.gridSize
      table.y = Math.round(table.y / this.gridSize) * this.gridSize
      table.width = Math.round(table.width / this.gridSize) * this.gridSize
      table.height = Math.round(table.height / this.gridSize) * this.gridSize

      // Update inspector if this is the selected table
      if (this.selectedTable && this.selectedTable.id === table.id) {
        this.selectedTable.x = table.x
        this.selectedTable.y = table.y
        this.selectedTable.width = table.width
        this.selectedTable.height = table.height
      }
    },

    onTableDragging (index) {
      const table = this.currentTables[index]
      if (!table) return

      // Force absolute snapping to grid in real-time
      table.x = Math.round(table.x / this.gridSize) * this.gridSize
      table.y = Math.round(table.y / this.gridSize) * this.gridSize

      // Update inspector if this is the selected table
      if (this.selectedTable && this.selectedTable.id === table.id) {
        this.selectedTable.x = table.x
        this.selectedTable.y = table.y
      }
    },

    onTableDeactivated (table, index) {
      this.currentTables[index] = { ...table }
    },

    // Canvas controls
    zoomIn () {
      this.animateZoom(Math.min(this.zoomLevel + 0.2, 2))
    },

    zoomOut () {
      this.animateZoom(Math.max(this.zoomLevel - 0.2, 0.5))
    },

    animateZoom (targetZoom) {
      const startZoom = this.zoomLevel
      const diff = targetZoom - startZoom
      const duration = 200
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Ease-out animation
        const easeOut = 1 - Math.pow(1 - progress, 3)
        this.zoomLevel = startZoom + (diff * easeOut)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    },

    // Pan controls
    startPan (event) {
      // Don't start panning if clicking on a table
      if (event.target.closest('.draggable-resizable-vue')) {
        return
      }

      this.isPanning = true

      if (event.type === 'touchstart') {
        this.startPanX = event.touches[0].clientX - this.panX
        this.startPanY = event.touches[0].clientY - this.panY
      } else {
        this.startPanX = event.clientX - this.panX
        this.startPanY = event.clientY - this.panY
      }
    },

    onPan (event) {
      if (!this.isPanning) return

      event.preventDefault()

      if (event.type === 'touchmove') {
        this.panX = event.touches[0].clientX - this.startPanX
        this.panY = event.touches[0].clientY - this.startPanY
      } else {
        this.panX = event.clientX - this.startPanX
        this.panY = event.clientY - this.startPanY
      }
    },

    endPan () {
      this.isPanning = false
    },

    applyCanvasSettings () {
      this.previousCanvasWidth = this.canvasWidth
      this.previousCanvasHeight = this.canvasHeight

      this.showCanvasSettings = false
    },

    // Utility methods
    getTableWrapperClass (table) {
      const baseClass = 'table-draggable-wrapper'
      const selectedClass = this.selectedTable?.id === table.id ? 'is-selected' : ''
      return `${baseClass} ${selectedClass}`
    },

    getTableDesignClass (table) {
      return `luxury-table table-shape-${table.shape || 'round'}`
    },

    getTableIcon (shape) {
      const shapeMap = {
        round: 'radio_button_unchecked',
        square: 'crop_square',
        rectangle: 'crop_landscape',
        oval: 'oval'
      }
      return shapeMap[shape] || 'radio_button_unchecked'
    },

    getShapeLabel (shape) {
      const shapeMap = {
        round: 'Redonda',
        square: 'Cuadrada',
        rectangle: 'Rectangular',
        oval: 'Ovalada'
      }
      return shapeMap[shape] || 'Redonda'
    },

    getTableDefaultSize (shape) {
      // All sizes are multiples of gridSize (20px) for grid alignment
      const sizeMap = {
        round: { width: 80, height: 80 }, // 4 × 20px
        square: { width: 80, height: 80 }, // 4 × 20px (changed from 70)
        rectangle: { width: 100, height: 60 }, // 5 × 20px, 3 × 20px
        oval: { width: 100, height: 80 } // 5 × 20px, 4 × 20px (changed from 90×70)
      }
      return sizeMap[shape] || { width: 80, height: 80 }
    },

    // QR Code handling
    printQr () {
      this.$htmlToPaper('printMe', {
        styles: ['stylesTable.css']
      })
    },

    handlerQr (tables) {
      const opts = {
        type: 'image/jpeg',
        errorCorrectionLevel: 'L',
        margin: 2
      }
      tables.forEach(table => {
        const docQr = {
          id: table.id,
          name: table.name,
          branch_office_id: this.branchOffice?.id,
          company_id: this.userSession?.company_session_id
        }
        const encoded = btoa(JSON.stringify(docQr))
        const urlQr = `${window.location.origin}/menu/?tab=menu&category=all&p=${encoded}`
        nextTick(() => {
          QRCode.toDataURL(urlQr, opts, function (error, url) {
            if (error) throw error
            const img = document.getElementById(table.id)
            img.src = url
          })
        })
      })
    },
    onActivated (data, index) {
      this.tableSelected = data
      this.tableSelected.index = index
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getLivingRooms(this.params)
    },
    /**
     * Add table in living room
     */
    addTable () {
      this.livingRoom.tables.push({
        name: this.tableName,
        width: 50,
        height: 50
      })
      this.tableName = null
      this.openAddTable = false
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getLivingRooms(this.params)
    },
    /**
     * Change data table
     * @param {Object} data table
     * @param {Number} i index table
     */
    onDeactivated (data, i) {
      this.livingRoom.tables.map((table, index) => {
        if (i === index) {
          return data
        }
        return table
      })
      this.openEditTable = false
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddLivingRoom = false
      this.openEditLivingRoom = false
      this.livingRoom = { tables: [] }
    },

    /**
     * Save livingRooms
     */
    saveLivingRoom () {
      this.loadingSave = true
      this.$api.post('living-rooms', {
        user_created_id: this.userSession?.id,
        branch_office_id: this.branchOffice?.id,
        ...this.livingRoom
      })
        .then(({ data }) => {
          this.getLivingRooms()
          this.openAddLivingRoom = false
          this.loadingSave = false
          this.livingRoom = {
            tables: []
          }
          Notify.create({
            message: 'Sala de estar creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingSave = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View livingRoom
     */
    editLivingRoom (event, row, index) {
      this.openEditLivingRoom = true
      this.livingRoom = row
    },
    /**
     * Save edit
     */
    saveEditLivingRoom () {
      this.loadingEdit = true
      this.$api.put(`living-rooms/${this.livingRoom.id}`, {
        user_created_id: this.userSession?.id,
        branch_office_id: this.branchOffice?.id,
        ...this.livingRoom
      })
    }
  }
}
</script>

<style>

.drv {
    border: 1px dashed #3a3a3a;
}

.drv-handles .drv-handle {
    border: 1px solid #3a3a3a;
}

/* --- Global Variables for Luxury Theme --- */
:root {
  --color-background-dark: #121212; /* Very dark gray, not pure black */
  --color-surface-dark: #1e1e1e; /* Slightly lighter dark gray for surfaces */
  --color-card-dark: #282828; /* Even lighter dark gray for cards/inputs */
  --color-text-light: #f0f0f0; /* Off-white for main text */
  --color-text-muted: #b0b0b0; /* Lighter gray for secondary text */
  --color-border-dark: #3a3a3a; /* Darker gray for borders */
  --color-accent-gold: var(--primary); /* Soft Gold */
  --color-accent-gold-light: var(--primary);
  --color-accent-gold-dark: var(--primary);
  --color-success: #4CAF50;
  --color-danger: #EF5350;

  --font-family-primary: 'Inter', sans-serif;
  --font-family-secondary: 'Playfair Display', serif; /* For titles, if desired */

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 14px;
  --spacing-unit: 0.8rem; /* Reduced spacing unit */
}

/* --- Base Page Styling --- */
.luxury-restaurant-designer {
  background-color: var(--color-background);
  font-family: var(--font-family-primary);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* Prevent horizontal scroll from transitions */
}

/* --- Header Styling --- */
.luxury-header {
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5); /* Reduced padding */
}

.header-content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5); /* Reduced gap */
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-unit);
}

.brand-logo-circle {
  width: 50px; /* Slightly smaller */
  height: 50px; /* Slightly smaller */
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(var(--color-accent-gold-dark), 0.4);
}

.brand-icon {
  font-size: 1.8rem; /* Slightly smaller */
  color: white;
}

.brand-text-group .app-title {
  font-size: 1.6rem; /* Slightly smaller */
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.03em;
}

.brand-text-group .app-subtitle {
  font-size: 0.8rem; /* Slightly smaller */
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header-controls-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-unit); /* Reduced gap */
}

.room-selection-area {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduced gap */
}

.luxury-select {
  min-width: 220px; /* Slightly smaller */
  border-radius: var(--border-radius-md);
}

.luxury-select :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-dark);
  min-height: 40px; /* Smaller height */
  padding: 0 12px; /* Smaller padding */
}

.luxury-select :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px; /* Adjust label position */
}

.luxury-select :deep(.q-field__native) {
  padding-top: 8px; /* Adjust text position */
}

.select-icon {
  color: var(--color-text-muted);
  font-size: 1.2rem; /* Smaller icon */
}

.add-room-button {
  color: var(--color-accent-gold);
  transition: all 0.2s ease-in-out;
  width: 40px; /* Smaller button */
  height: 40px; /* Smaller button */
}

.add-room-button:hover {
  background-color: rgba(var(--color-accent-gold), 0.1);
  transform: scale(1.08);
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.4rem; /* Reduced gap */
}

.action-button {
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem; /* Reduced padding */
  font-size: 0.9rem; /* Smaller font */
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.2s ease-in-out;
}

.primary-action-button {
  background-color: var(--color-accent-gold);
  color: white;
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
  background-color: var(--color-card-dark);
  color: var(--color-text-light);
}

.danger-action-button {
  color: var(--color-danger);
}

.danger-action-button:hover {
  background-color: rgba(var(--color-danger), 0.1);
}

.large-button {
  padding: 0.9rem 1.8rem; /* Reduced padding */
  font-size: 1rem; /* Smaller font */
}

/* --- Stats Bar Styling --- */
.stats-overview-bar {
  background-color: var(--color-surface-dark);
  border-bottom: 1px solid var(--color-border-dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5); /* Reduced padding */
}

.stats-content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5); /* Reduced gap */
}

.room-details-section {
  display: flex;
  align-items: center;
  gap: 0.8rem; /* Reduced gap */
}

.room-name-display {
  font-size: 1.8rem; /* Slightly smaller */
  font-weight: 700;
  margin: 0;
  color: var(--color-text-light);
  letter-spacing: -0.03em;
}

.room-settings-button {
  color: var(--color-text-muted);
  transition: all 0.2s ease-in-out;
}

.room-settings-button:hover {
  color: var(--color-accent-gold);
  transform: rotate(90deg);
}

.metrics-display-grid {
  display: flex;
  gap: var(--spacing-unit); /* Reduced gap */
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Reduced gap */
  padding: 0.8rem 1rem; /* Reduced padding */
  background-color: var(--color-card-dark);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--border-radius-md);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
}

.metric-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.3);
}

.metric-icon {
  width: 36px; /* Smaller */
  height: 36px; /* Smaller */
  background-color: var(--color-accent-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-background-dark);
  font-size: 1.1rem; /* Smaller */
}

.metric-data {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.1rem; /* Smaller */
  font-weight: 700;
  color: var(--color-text-light);
  line-height: 1;
}

.metric-label {
  font-size: 0.7rem; /* Smaller */
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.canvas-toolbar-group {
  display: flex;
  gap: 0.8rem; /* Reduced gap */
}

.toolbar-button-group {
  display: flex;
  background-color: var(--color-card-dark);
  border-radius: var(--border-radius-md);
  padding: 0.2rem; /* Reduced padding */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.toolbar-button {
  color: var(--color-text-muted);
  transition: all 0.2s ease-in-out;
  border-radius: var(--border-radius-sm);
  width: 36px; /* Smaller */
  height: 36px; /* Smaller */
}

.toolbar-button:hover {
  background-color: var(--color-surface-dark);
  color: var(--color-text-light);
  transform: scale(1.05);
}

.toolbar-button.is-active {
  background-color: var(--color-accent-gold);
  color: var(--color-background-dark);
}

.save-button {
  color: var(--color-success);
}

.save-button:hover {
  background-color: rgba(var(--color-success), 0.1);
}

.print-button {
  color: var(--color-text-muted);
}

.print-button:hover {
  background-color: rgba(var(--color-text-muted), 0.1);
}

/* --- Main Canvas Area --- */
.canvas-main-area {
  flex: 1;
  background:
    radial-gradient(circle at 25px 25px, rgba(var(--color-border-dark), 0.5) 1px, transparent 1px),
    var(--color-background-dark);
  background-size: 50px 50px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.canvas-viewport-container {
  display: flex;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.canvas-viewport-container:active {
  cursor: grabbing;
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(33, 33, 33, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.canvas-edit-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(33, 33, 33, 0.95);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.canvas-controls .control-btn,
.canvas-edit-controls .control-btn {
  color: var(--color-text-light);
  transition: all 0.2s ease;
}

.canvas-controls .control-btn:hover,
.canvas-edit-controls .control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.zoom-level-display {
  color: var(--color-text-light);
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.canvas-transform-wrapper {
  transform-origin: center center;
  will-change: transform;
}

.luxury-canvas {
  background-color: var(--color-surface-dark);
  border: 2px solid var(--color-border-dark);
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
  cursor: grab;
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
  position: absolute;
  top: 0;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15); /* Subtle inner border */
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.3); /* Inner shadow for depth */
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
  font-size: 1rem; /* Slightly smaller */
  font-weight: 700;
  letter-spacing: 0.02em;
}

.table-capacity-text {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.8rem; /* Slightly smaller */
  opacity: 0.95;
}

.capacity-icon {
  font-size: 0.8rem; /* Slightly smaller */
}

.table-status-indicator {
  position: absolute;
  top: 8px; /* Smaller offset */
  right: 8px; /* Smaller offset */
  width: 12px; /* Smaller */
  height: 12px; /* Smaller */
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.table-status-indicator.available {
  background-color: #10b981; /* Emerald Green */
}

.table-status-indicator.occupied {
  background-color: #ef4444; /* Ruby Red */
}

.table-status-indicator.reserved {
  background-color: #f59e0b; /* Amber Orange */
}

/* --- Specific Table Shapes (Vibrant & Elegant) --- */
.table-shape-round {
  background: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%); /* Deep Amethyst Purple */
  border-radius: 50%;
}

.table-shape-square {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); /* Sapphire Blue */
  border-radius: var(--border-radius-md);
}

.table-shape-rectangle {
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%); /* Emerald Green */
  border-radius: var(--border-radius-lg);
}

.table-shape-oval {
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); /* Ruby Red */
  border-radius: 50%;
  transform: scaleX(1.3); /* Make it more elliptical */
}

/* --- Empty State Styling --- */
.empty-state-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 1.5); /* Reduced padding */
  min-height: calc(100vh - 180px);
}

.empty-state-illustration {
  margin-bottom: calc(var(--spacing-unit) * 2.5); /* Reduced margin */
}

.illustration-circle-bg {
  width: 120px; /* Smaller */
  height: 120px; /* Smaller */
  background: linear-gradient(135deg, var(--color-accent-gold) 0%, var(--color-accent-gold-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 28px rgba(var(--color-accent-gold), 0.3);
  margin: 0 auto;
}

.illustration-circle-bg .q-icon {
  font-size: 3.5rem; /* Smaller */
  color: var(--color-background-dark);
}

.empty-state-content .empty-state-title {
  font-size: 2.2rem; /* Smaller */
  font-weight: 700;
  margin-bottom: 0.8rem; /* Reduced margin */
  color: var(--color-text-light);
  letter-spacing: -0.04em;
}

.empty-state-content .empty-state-description {
  font-size: 1.05rem; /* Smaller */
  color: var(--color-text-muted);
  margin-bottom: calc(var(--spacing-unit) * 2); /* Reduced margin */
  max-width: 500px; /* Smaller max-width */
  line-height: 1.5;
}

/* --- Floating Table Inspector --- */
.table-inspector-panel {
  position: fixed;
  top: 50%;
  right: calc(var(--spacing-unit) * 1.5); /* Reduced offset */
  transform: translateY(-50%);
  width: 320px; /* Smaller width */
  background-color: var(--color-surface-dark);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border-dark);
  z-index: 2000;
  overflow: hidden;
}

.inspector-header-section {
  display: flex;
  align-items: center;
  gap: 0.8rem; /* Reduced gap */
  padding: calc(var(--spacing-unit) * 1.2); /* Reduced padding */
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  color: var(--color-background-dark);
}

.table-shape-preview {
  width: 50px; /* Smaller */
  height: 50px; /* Smaller */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
}

.preview-shape-demo {
  width: 32px; /* Smaller */
  height: 24px; /* Smaller */
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.shape-demo-round {
  border-radius: 50%;
  background-color: #6D28D9;
}

.shape-demo-square {
  border-radius: 4px;
  background-color: #06B6D4;
}

.shape-demo-rectangle {
  border-radius: 6px;
  background-color: #16A34A;
  transform: scaleX(1.3);
}

.shape-demo-oval {
  border-radius: 50%;
  background-color: #DC2626;
  transform: scaleX(1.4);
}

.table-meta-info .inspector-table-name {
  font-size: 1.15rem; /* Smaller */
  font-weight: 700;
  margin: 0 0 0.2rem 0;
  letter-spacing: 0.02em;
  color: var(--color-background-dark);
}

.table-meta-info .inspector-table-shape {
  font-size: 0.8rem; /* Smaller */
  opacity: 0.9;
  color: rgba(var(--color-background-dark), 0.8);
}

.inspector-close-button {
  color: rgba(var(--color-background-dark), 0.7);
  margin-left: auto;
}

.inspector-close-button:hover {
  color: var(--color-background-dark);
  background-color: rgba(255, 255, 255, 0.1);
}

.inspector-details-list {
  padding: calc(var(--spacing-unit) * 1.2); /* Reduced padding */
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Reduced gap */
  margin-bottom: 0.8rem; /* Reduced margin */
  color: var(--color-text-light);
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  font-size: 1.05rem; /* Smaller */
  color: var(--color-text-muted);
}

.inspector-action-buttons {
  display: flex;
  gap: 0.4rem; /* Reduced gap */
  padding: 0.8rem calc(var(--spacing-unit) * 1.2); /* Reduced padding */
  background-color: rgba(0, 0, 0, 0.05);
  border-top: 1px solid var(--color-border-dark);
}

.inspector-action-button {
  flex: 1;
  font-size: 0.8rem; /* Smaller */
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease-in-out;
  color: var(--color-text-muted);
}

.inspector-action-button:hover {
  background-color: var(--color-card-dark);
  color: var(--color-text-light);
}

.inspector-action-button.danger-button {
  color: var(--color-danger);
}

.inspector-action-button.danger-button:hover {
  background-color: rgba(var(--color-danger), 0.1);
}

/* --- Slide Transitions for Inspector --- */
.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-in-right-enter-from {
  transform: translateX(100%) translateY(-50%);
  opacity: 0;
}

.slide-in-right-leave-to {
  transform: translateX(100%) translateY(-50%);
  opacity: 0;
}

/* --- Dialog Styling --- */
.luxury-dialog {
  width: 500px; /* Smaller width */
  max-width: 90vw;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.table-creation-dialog {
  width: 600px; /* Smaller width */
}

/* Maximized Dialog Adjustments */
.q-dialog--maximized .luxury-dialog {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  border-radius: 0 !important;
}

.q-dialog--maximized .luxury-dialog .q-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.q-dialog--maximized .luxury-dialog .dialog-body-content {
  flex: 1;
  overflow-y: auto;
}

.dialog-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing-unit) * 1.5); /* Reduced padding */
  background: linear-gradient(135deg, var(--color-accent-gold-dark) 0%, var(--color-accent-gold) 100%);
  color: white;
}

.dialog-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Reduced gap */
}

.dialog-icon {
  font-size: 1.3rem; /* Smaller */
}

.dialog-title-text {
  font-size: 1.15rem; /* Smaller */
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dialog-close-button {
  color: rgba(var(--color-background-light), 0.7);
}

.dialog-close-button:hover {
  color: var(--color-background-light);
}

.dialog-body-content {
  padding: calc(var(--spacing-unit) * 1.5); /* Reduced padding */
}

.dialog-action-buttons {
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 1.5); /* Reduced padding */
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem; /* Reduced gap */
}

.dialog-cancel-button {
  color: var(--color-text-muted);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease-in-out;
}

.dialog-cancel-button:hover {
  background-color: var(--color-card-dark);
  color: var(--color-text-light);
}

.luxury-input {
  margin-bottom: var(--spacing-unit); /* Reduced margin */
}

.luxury-input:last-child {
  margin-bottom: 0;
}

.luxury-input :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-dark);
  background-color: var(--color-card-dark);
  color: var(--color-text-light);
  min-height: 40px; /* Smaller height */
  padding: 0 12px; /* Smaller padding */
}

.luxury-input :deep(.q-field__label) {
  color: var(--color-text-muted);
  top: 10px; /* Adjust label position */
}

.luxury-input :deep(.q-field__native) {
  padding-top: 8px; /* Adjust text position */
}

.luxury-input :deep(.q-field__control):hover:before {
  border-color: var(--color-accent-gold) !important;
}

.luxury-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-accent-gold) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-accent-gold), 0.3);
}

/* --- Input Group Styling --- */
.dimension-input-group,
.shape-selection-group {
  margin-top: var(--spacing-unit); /* Reduced margin */
}

.input-group-title {
  font-size: 0.8rem; /* Smaller */
  font-weight: 600;
  margin: 0 0 0.8rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dimension-grid-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem; /* Reduced gap */
}

/* --- Shape Options Grid --- */
.shape-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem; /* Reduced gap */
  margin-bottom: var(--spacing-unit); /* Reduced margin */
}

.shape-option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-unit) 0.8rem; /* Reduced padding */
  border: 2px solid var(--color-border-dark);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.shape-option-card:hover {
  border-color: var(--color-accent-gold);
  background-color: rgba(var(--color-accent-gold), 0.05);
  transform: translateY(-1px);
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.2);
}

.shape-option-card.is-selected {
  border-color: var(--color-accent-gold);
  background-color: rgba(var(--color-accent-gold), 0.1);
  box-shadow: 0 3px 9px rgba(var(--color-accent-gold), 0.3);
}

.shape-preview-thumbnail {
  width: 48px; /* Smaller */
  height: 36px; /* Smaller */
  margin-bottom: 0.6rem; /* Reduced margin */
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.thumbnail-round {
  background: linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%);
  border-radius: 50%;
}

.thumbnail-square {
  background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
  border-radius: 6px;
}

.thumbnail-rectangle {
  background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
  border-radius: 8px;
}

.thumbnail-oval {
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
  border-radius: 50%;
  transform: scaleX(1.4);
}

.shape-option-label {
  font-size: 0.8rem; /* Smaller */
  font-weight: 500;
}

/* --- Luxury Tooltips --- */
.luxury-tooltip {
  background-color: var(--color-accent-gold);
  color: var(--color-background-dark);
  font-size: 0.7rem; /* Smaller */
  font-weight: 600;
  border-radius: 5px; /* Smaller */
  padding: 0.4rem 0.7rem; /* Smaller */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

/* --- Print QR Styles (Hidden) --- */
.print-qr-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing-unit) * 1.5); /* Reduced gap */
  padding: calc(var(--spacing-unit) * 1.5); /* Reduced padding */
}

.print-header-qr {
  width: 100%;
  text-align: center;
  margin-bottom: calc(var(--spacing-unit) * 1.5); /* Reduced margin */
}

.print-header-qr h2 {
  font-size: 1.8rem; /* Smaller */
  font-weight: 700;
  color: #333; /* Dark text for print */
}

.print-qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem; /* Reduced gap */
  page-break-inside: avoid;
}

.print-qr-item span {
  font-size: 0.9rem; /* Smaller */
  font-weight: 600;
  color: #333; /* Dark text for print */
}

/* --- Responsive Design --- */
@media (max-width: 1200px) {
  .header-content-wrapper,
  .stats-content-wrapper {
    flex-direction: column;
    gap: var(--spacing-unit);
    align-items: flex-start;
  }

  .header-controls-group {
    width: 100%;
    justify-content: space-between;
  }

  .metrics-display-grid {
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
  }

  .canvas-toolbar-group {
    width: 100%;
    justify-content: center;
  }

  .table-inspector-panel {
    position: fixed;
    bottom: calc(var(--spacing-unit) * 1.5);
    right: var(--spacing-unit);
    left: var(--spacing-unit);
    top: auto;
    transform: none;
    width: auto;
    max-height: 40vh;
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .luxury-header,
  .stats-overview-bar {
    padding: 0.6rem;
  }

  .brand-identity {
    width: 100%;
    flex-direction: row;
    gap: 0.5rem;
    text-align: left;
  }

  .brand-logo-circle {
    width: 40px;
    height: 40px;
  }

  .brand-icon {
    font-size: 1.4rem;
  }

  .brand-text-group .text-h5 {
    font-size: 1.1rem;
  }

  .app-subtitle {
    font-size: 0.65rem;
  }

  .header-controls-group {
    flex-direction: column;
    gap: 0.6rem;
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
    width: 100%;
  }

  .action-button {
    flex: 1;
    min-width: 120px;
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  /* Stats bar compacto para móvil */
  .stats-overview-bar {
    padding: 0.5rem;
  }

  .room-details-section {
    gap: 0.3rem;
  }

  .room-name-display {
    font-size: 1rem;
  }

  /* Ocultar métricas menos importantes en móvil */
  .metrics-display-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }

  .metric-card {
    padding: 0.4rem 0.6rem;
    gap: 0.3rem;
  }

  .metric-icon {
    font-size: 1rem;
  }

  .metric-value {
    font-size: 0.9rem;
  }

  .metric-label {
    font-size: 0.6rem;
  }

  /* Canvas toolbar compacto */
  .canvas-toolbar-group {
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .toolbar-button-group {
    gap: 0.2rem;
  }

  .toolbar-button {
    width: 32px !important;
    height: 32px !important;
    min-height: 32px !important;
  }

  /* Canvas controls móvil */
  .canvas-controls,
  .canvas-edit-controls {
    bottom: 10px;
    padding: 3px;
  }

  .canvas-controls {
    right: 10px;
  }

  .canvas-edit-controls {
    left: 10px;
  }

  .control-btn {
    width: 28px !important;
    height: 28px !important;
    min-height: 28px !important;
  }

  .zoom-level-display {
    font-size: 0.7rem;
    min-width: 32px;
  }

  /* Inspector panel móvil */
  .table-inspector-panel {
    padding: 0.8rem;
    max-height: 35vh;
  }

  .inspector-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .inspector-section-title {
    font-size: 0.7rem;
    margin: 0.4rem 0;
  }

  .inspector-field {
    margin-bottom: 0.5rem;
  }

  .inspector-field-label {
    font-size: 0.7rem;
  }

  .inspector-field-value {
    font-size: 0.85rem;
  }

  .shape-options-grid {
    grid-template-columns: 1fr;
  }

  .dimension-grid-inputs {
    grid-template-columns: 1fr;
  }

  /* Diálogos */
  .luxury-dialog {
    width: 95vw;
  }
}

@media (max-width: 480px) {
  .luxury-header {
    padding: 0.5rem;
  }

  .brand-identity {
    gap: 0.4rem;
  }

  .brand-logo-circle {
    width: 36px;
    height: 36px;
  }

  .brand-icon {
    font-size: 1.2rem;
  }

  .brand-text-group .text-h5 {
    font-size: 1rem;
  }

  .app-subtitle {
    display: none; /* Ocultar subtítulo en pantallas muy pequeñas */
  }

  .action-buttons-group {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
  }

  /* Stats bar ultra compacto */
  .stats-overview-bar {
    padding: 0.4rem;
  }

  .metrics-display-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }

  .metric-card {
    padding: 0.3rem 0.5rem;
  }

  /* Toolbar vertical */
  .canvas-toolbar-group {
    flex-direction: column;
    gap: 0.3rem;
  }

  .toolbar-button-group {
    justify-content: center;
    width: 100%;
  }

  /* Inspector ultra compacto */
  .table-inspector-panel {
    padding: 0.6rem;
    max-height: 30vh;
  }

  .inspector-actions {
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .inspector-action-btn {
    flex: 1;
    min-width: 80px;
  }

  /* Diálogos */
  .luxury-dialog {
    width: 98vw;
  }

  .dialog-header-section,
  .dialog-body-content,
  .dialog-action-buttons {
    padding: 0.8rem;
  }

  .dialog-title-text {
    font-size: 1rem;
  }
}
</style>
