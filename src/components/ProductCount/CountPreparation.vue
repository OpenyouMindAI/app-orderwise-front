<template>
  <div>
    <div class="text-h6 q-mb-md">Preparación de Conteo</div>

    <div v-if="!selectedCount">
      <!-- Lista de conteos asignados -->
      <q-card class="q-pa-md">
        <q-table
          :rows="counts"
          :columns="countColumns"
          row-key="id"
          :filter="filter"
          :pagination="{ rowsPerPage: 10 }"
          @row-click="selectCount"
        >
          <template v-slot:top-left>
            <q-input
              v-model="filter"
              dense
              filled
              placeholder="Buscar conteo..."
              clearable
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.value)" class="q-pa-sm">
                {{ formatStatus(props.value) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                icon="play_arrow"
                color="primary"
                dense
                flat
                @click.stop="selectCount(props.row)"
              >
                <q-tooltip>Iniciar este conteo</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Vista de conteo activo -->
    <div v-else>
      <q-card class="q-pa-md">
        <q-card-section class="row items-center">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            @click="selectedCount = null"
          />
          <div class="text-h6 q-ml-md">
            Conteo: {{ selectedCount.branch.name }} - {{ selectedCount.warehouse.name }}
          </div>
          <q-space />
          <div class="text-subtitle1">
            Responsable: {{ selectedCount.responsible.name }}
          </div>
        </q-card-section>

        <q-separator />

        <!-- Modo de conteo -->
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col-12 col-md-6">
              <q-toggle
                v-model="blindMode"
                label="Modo conteo ciego"
                color="primary"
              />
            </div>
            <div class="col-12 col-md-6 text-right">
              <q-btn
                icon="camera_alt"
                color="primary"
                label="Escanear código"
                @click="startScanner"
              />
            </div>
          </div>

          <!-- Buscador -->
          <q-input
            v-model="searchTerm"
            filled
            placeholder="Buscar por nombre, SKU o código..."
            class="q-mb-md"
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Progreso -->
          <div class="q-mb-md">
            <div class="flex justify-between q-mb-xs">
              <span>Progreso del conteo</span>
              <span>{{ countedItems }} de {{ totalItems }} ({{ progressPercentage }}%)</span>
            </div>
            <q-linear-progress
              :value="progressPercentage / 100"
              color="primary"
              size="10px"
              rounded
            />
          </div>

          <!-- Lista de productos -->
          <div class="row q-col-gutter-md">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="col-12 col-md-6"
            >
              <q-card
                flat
                bordered
                :class="{ 'bg-green-1': item.counted }"
              >
                <q-card-section>
                  <div class="row items-center">
                    <!-- Imagen del producto -->
                    <div class="col-3">
                      <q-img
                        :src="item.image || 'https://via.placeholder.com/100'"
                        :ratio="1"
                        class="rounded-borders"
                      />
                    </div>

                    <!-- Detalles del producto -->
                    <div class="col-6 q-px-sm">
                      <div class="text-subtitle1">{{ item.name }}</div>
                      <div class="text-caption text-grey-7">
                        SKU: {{ item.sku }} | Código: {{ item.barcode }}
                      </div>
                      <div v-if="!blindMode" class="text-caption">
                        Existencia teórica: {{ item.theoretical_quantity }} {{ item.unit }}
                      </div>
                    </div>

                    <!-- Input de cantidad -->
                    <div class="col-3">
                      <q-input
                        v-model.number="item.counted_quantity"
                        type="number"
                        min="0"
                        label="Cantidad"
                        dense
                        filled
                        @update:model-value="markAsCounted(item)"
                      />
                    </div>
                  </div>
                </q-card-section>

                <!-- Acciones -->
                <q-card-actions align="right">
                  <q-btn
                    icon="photo_camera"
                    flat
                    dense
                    color="grey"
                    @click="takePhoto(item)"
                  >
                    <q-tooltip>Tomar foto como evidencia</q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="info"
                    flat
                    dense
                    color="grey"
                    @click="showItemDetails(item)"
                  >
                    <q-tooltip>Ver detalles</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- Resumen y acciones -->
        <q-card-actions align="right">
          <q-btn
            label="Guardar borrador"
            color="secondary"
            @click="saveDraft"
          />
          <q-btn
            label="Completar conteo"
            color="primary"
            :disable="countedItems < totalItems"
            @click="completeCount"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Diálogo para escanear código -->
    <q-dialog v-model="scannerDialog">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Escanear código</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center">
          <div class="q-pa-md border rounded-borders" style="height: 200px;">
            <div class="full-height flex flex-center text-grey-6">
              Simulador de escáner (en producción usaría la cámara)
            </div>
          </div>

          <q-input
            v-model="scannedCode"
            label="O ingresar código manualmente"
            class="q-mt-md"
            filled
            @keyup.enter="processScannedCode"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="secondary" v-close-popup />
          <q-btn label="Procesar" color="primary" @click="processScannedCode" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para tomar foto -->
    <q-dialog v-model="photoDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Tomar foto de evidencia</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="text-center">
          <div class="q-pa-md border rounded-borders" style="height: 300px;">
            <div v-if="!currentPhoto" class="full-height flex flex-center text-grey-6">
              Vista previa de la cámara
            </div>
            <q-img
              v-else
              :src="currentPhoto"
              style="height: 100%;"
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              icon="photo_camera"
              label="Tomar foto"
              color="primary"
              class="q-mr-sm"
              @click="capturePhoto"
            />
            <q-btn
              icon="image"
              label="Seleccionar de galería"
              color="secondary"
              @click="selectFromGallery"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="secondary" v-close-popup />
          <q-btn
            label="Guardar"
            color="primary"
            :disable="!currentPhoto"
            @click="savePhoto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

export default {
  props: {
    counts: {
      type: Array,
      required: true
    },
    branches: {
      type: Array,
      required: true
    },
    warehouses: {
      type: Array,
      required: true
    }
  },

  setup (props, { emit }) {
    const $q = useQuasar()
    const selectedCount = ref(null)
    const filter = ref('')
    const searchTerm = ref('')
    const blindMode = ref(false)
    const scannerDialog = ref(false)
    const scannedCode = ref('')
    const photoDialog = ref(false)
    const currentPhoto = ref(null)
    const currentItem = ref(null)

    // Mock data para items de inventario
    const inventoryItems = ref([
      {
        id: 1,
        name: 'Café Premium 250g',
        sku: 'CAF-001',
        barcode: '123456789012',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 50,
        counted_quantity: null,
        unit: 'unidades',
        counted: false,
        photos: []
      },
      {
        id: 2,
        name: 'Azúcar 1kg',
        sku: 'AZU-001',
        barcode: '234567890123',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 72,
        counted_quantity: null,
        unit: 'paquetes',
        counted: false,
        photos: []
      },
      {
        id: 3,
        name: 'Leche en Polvo 400g',
        sku: 'LEC-001',
        barcode: '345678901234',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 30,
        counted_quantity: null,
        unit: 'latas',
        counted: false,
        photos: []
      },
      {
        id: 4,
        name: 'Harina 000 1kg',
        sku: 'HAR-001',
        barcode: '456789012345',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 45,
        counted_quantity: null,
        unit: 'paquetes',
        counted: false,
        photos: []
      },
      {
        id: 5,
        name: 'Aceite de Girasol 1L',
        sku: 'ACE-001',
        barcode: '567890123456',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 25,
        counted_quantity: null,
        unit: 'botellas',
        counted: false,
        photos: []
      },
      {
        id: 6,
        name: 'Sal Fina 500g',
        sku: 'SAL-001',
        barcode: '678901234567',
        image: 'https://via.placeholder.com/100',
        theoretical_quantity: 40,
        counted_quantity: null,
        unit: 'paquetes',
        counted: false,
        photos: []
      }
    ])

    const countColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'branch', label: 'Sucursal', field: row => props.branches.find(b => b.id === row.branch_office_id)?.name || '-', align: 'left' },
      { name: 'warehouse', label: 'Almacén', field: row => props.warehouses.find(w => w.id === row.warehouse_id)?.name || '-', align: 'left' },
      { name: 'status', label: 'Estado', field: 'status', align: 'center' },
      { name: 'created_at', label: 'Fecha', field: 'created_at', align: 'right' },
      { name: 'actions', label: 'Acciones', align: 'center' }
    ]

    const filteredItems = computed(() => {
      let items = [...inventoryItems.value]

      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        items = items.filter(item =>
          item.name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          item.barcode.includes(term)
        )
      }

      return items
    })

    const totalItems = computed(() => inventoryItems.value.length)
    const countedItems = computed(() => inventoryItems.value.filter(i => i.counted).length)
    const progressPercentage = computed(() => Math.round((countedItems.value / totalItems.value) * 100))

    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        in_progress: 'blue',
        completed: 'green',
        recount: 'purple'
      }
      return colors[status] || 'grey'
    }

    const formatStatus = (status) => {
      const statusMap = {
        pending: 'Pendiente',
        in_progress: 'En Progreso',
        completed: 'Completado',
        recount: 'Reconteo'
      }
      return statusMap[status] || status
    }

    const selectCount = (count) => {
      // Enriquecer el conteo con datos de sucursal y almacén
      selectedCount.value = {
        ...count,
        branch: props.branches.find(b => b.id === count.branch_office_id),
        warehouse: props.warehouses.find(w => w.id === count.warehouse_id),
        responsible: { id: count.user_id, name: 'Usuario Actual' } // En producción usaría datos reales
      }
    }

    const markAsCounted = (item) => {
      item.counted = item.counted_quantity !== null && item.counted_quantity !== undefined
    }

    const startScanner = () => {
      scannerDialog.value = true
      scannedCode.value = ''
    }

    const processScannedCode = () => {
      if (!scannedCode.value) return

      const item = inventoryItems.value.find(i => i.barcode === scannedCode.value)
      if (item) {
        $q.notify({
          message: `Producto encontrado: ${item.name}`,
          color: 'positive',
          icon: 'check_circle'
        })
        // Scroll to item
        setTimeout(() => {
          const element = document.getElementById(`item-${item.id}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.classList.add('highlight')
            setTimeout(() => element.classList.remove('highlight'), 2000)
          }
        }, 500)
      } else {
        $q.notify({
          message: 'Producto no encontrado',
          color: 'negative',
          icon: 'warning'
        })
      }

      scannerDialog.value = false
    }

    const takePhoto = (item) => {
      currentItem.value = item
      currentPhoto.value = null
      photoDialog.value = true
    }

    const capturePhoto = () => {
      // Simular toma de foto
      currentPhoto.value = 'https://via.placeholder.com/300'
      $q.notify({
        message: 'Foto simulada capturada',
        color: 'info',
        timeout: 1000
      })
    }

    const selectFromGallery = () => {
      // Simular selección de galería
      currentPhoto.value = 'https://via.placeholder.com/300'
      $q.notify({
        message: 'Foto simulada seleccionada',
        color: 'info',
        timeout: 1000
      })
    }

    const savePhoto = () => {
      if (currentItem.value && currentPhoto.value) {
        currentItem.value.photos.push(currentPhoto.value)
        $q.notify({
          message: 'Foto guardada como evidencia',
          color: 'positive',
          icon: 'check_circle'
        })
        photoDialog.value = false
      }
    }

    const showItemDetails = (item) => {
      $q.dialog({
        title: item.name,
        message: `
          <div>
            <p><strong>SKU:</strong> ${item.sku}</p>
            <p><strong>Código de barras:</strong> ${item.barcode}</p>
            <p><strong>Existencia teórica:</strong> ${item.theoretical_quantity} ${item.unit}</p>
            ${item.counted ? `<p><strong>Cantidad contada:</strong> ${item.counted_quantity} ${item.unit}</p>` : ''}
          </div>
        `,
        html: true
      })
    }

    const saveDraft = () => {
      $q.notify({
        message: 'Conteo guardado como borrador',
        color: 'info',
        icon: 'save'
      })
    }

    const completeCount = () => {
      $q.dialog({
        title: 'Confirmar',
        message: '¿Está seguro que desea marcar este conteo como completado?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        emit('count-completed', selectedCount.value.id)
        selectedCount.value = null
      })
    }

    return {
      selectedCount,
      filter,
      searchTerm,
      blindMode,
      scannerDialog,
      scannedCode,
      photoDialog,
      currentPhoto,
      inventoryItems,
      countColumns,
      filteredItems,
      totalItems,
      countedItems,
      progressPercentage,
      getStatusColor,
      formatStatus,
      selectCount,
      markAsCounted,
      startScanner,
      processScannedCode,
      takePhoto,
      capturePhoto,
      selectFromGallery,
      savePhoto,
      showItemDetails,
      saveDraft,
      completeCount
    }
  }
}
</script>

<style scoped>
.highlight {
  animation: highlight 2s;
}

@keyframes highlight {
  0% { background-color: rgba(255, 255, 0, 0.5); }
  100% { background-color: transparent; }
}

.q-table__container {
  box-shadow: none;
  border: 1px solid #e0e0e0;
}
</style>
