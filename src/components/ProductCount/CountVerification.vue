<template>
  <div>
    <div class="text-h6 q-mb-md">Verificación de Conteos</div>

    <!-- Filtros -->
    <q-card class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="filters.branch"
            :options="branches"
            option-label="name"
            label="Filtrar por sucursal"
            clearable
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="filters.warehouse"
            :options="filteredWarehouses"
            option-label="name"
            label="Filtrar por almacén"
            clearable
            emit-value
            map-options
            :disable="!filters.branch"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="filters.responsible"
            :options="employees"
            option-label="name"
            label="Filtrar por responsable"
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </q-card>

    <!-- Lista de conteos completados -->
    <q-table
      :rows="filteredCounts"
      :columns="countColumns"
      row-key="id"
      :filter="filter"
      :pagination="{ rowsPerPage: 10 }"
      @row-click="viewCountDetails"
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

      <template v-slot:body-cell-differences="props">
        <q-td :props="props">
          <div class="text-center">
            <span :class="props.row.differences > 0 ? 'text-negative' : 'text-positive'">
              {{ props.row.differences }}
            </span>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de detalles del conteo -->
    <q-dialog v-model="detailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">
            Detalles del conteo: {{ selectedCount?.branch?.name }} - {{ selectedCount?.warehouse?.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="scroll" style="height: calc(100vh - 100px);">
          <!-- Filtros de diferencias -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="differenceFilter"
                :options="differenceOptions"
                label="Mostrar diferencias"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="searchItem"
                label="Buscar ítem"
                clearable
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4 text-right">
              <q-btn
                color="primary"
                label="Solicitar Reconteo"
                @click="requestRecount"
                :disable="!selectedItems.length"
              />
            </div>
          </div>

          <!-- Tabla de diferencias -->
          <q-table
            :rows="filteredItems"
            :columns="itemColumns"
            row-key="product_id"
            :filter="searchItem"
            :pagination="{ rowsPerPage: 20 }"
            selection="multiple"
            v-model:selected="selectedItems"
          >
            <template v-slot:body-cell-difference="props">
              <q-td :props="props">
                <div :class="props.row.difference > 0 ? 'text-positive' : 'text-negative'">
                  {{ props.row.difference }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-difference_value="props">
              <q-td :props="props">
                <div :class="props.row.difference_value > 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(props.row.difference_value) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-deviation="props">
              <q-td :props="props">
                <div :class="Math.abs(props.row.deviation) > 10 ? 'text-negative' : ''">
                  {{ props.row.deviation }}%
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-photos="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.row.photos.length"
                  icon="photo_library"
                  flat
                  dense
                  color="primary"
                  @click="showPhotos(props.row)"
                >
                  <q-tooltip>Ver evidencias</q-tooltip>
                </q-btn>
                <span v-else class="text-grey-6">Sin fotos</span>
              </q-td>
            </template>
          </q-table>

          <!-- Resumen de diferencias -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Total ítems con diferencias</div>
                  <div class="text-h4 text-center" :class="totalDifferences === 0 ? 'text-positive' : 'text-negative'">
                    {{ totalDifferences }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Valor total de diferencias</div>
                  <div class="text-h4 text-center" :class="totalDifferenceValue >= 0 ? 'text-positive' : 'text-negative'">
                    {{ formatCurrency(totalDifferenceValue) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Desviación promedio</div>
                  <div class="text-h4 text-center" :class="Math.abs(averageDeviation) > 10 ? 'text-negative' : 'text-positive'">
                    {{ averageDeviation.toFixed(2) }}%
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="secondary" v-close-popup />
          <q-btn
            label="Aprobar Ajustes"
            color="primary"
            @click="approveAdjustments"
            :disable="!hasDifferences"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para ver fotos -->
    <q-dialog v-model="photosDialog">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Evidencias fotográficas</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">{{ currentPhotoItem?.product_name }}</div>

          <div class="row q-col-gutter-md">
            <div
              v-for="(photo, index) in currentPhotoItem?.photos || []"
              :key="index"
              class="col-12 col-md-6"
            >
              <q-img
                :src="photo"
                :ratio="1"
                class="rounded-borders"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para aprobar ajustes -->
    <q-dialog v-model="adjustmentDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Aprobar ajustes de inventario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            Se ajustarán <strong>{{ itemsToAdjust.length }}</strong> ítems con diferencias.
            El valor total de ajuste es de <strong>{{ formatCurrency(totalAdjustmentValue) }}</strong>.
          </div>

          <q-select
            v-model="adjustmentReason"
            :options="adjustmentReasons"
            label="Motivo del ajuste"
            :rules="[val => !!val || 'Seleccione un motivo']"
            emit-value
            map-options
          />

          <q-input
            v-if="adjustmentReason === 'other'"
            v-model="customReason"
            label="Especifique el motivo"
            class="q-mt-md"
            :rules="[val => !!val || 'Ingrese un motivo']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="secondary" v-close-popup />
          <q-btn
            label="Confirmar Ajustes"
            color="primary"
            @click="confirmAdjustments"
            :disable="!adjustmentReason || (adjustmentReason === 'other' && !customReason)"
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
    completedCounts: {
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
    },
    employees: {
      type: Array,
      required: true
    }
  },

  setup (props, { emit }) {
    const $q = useQuasar()
    const filter = ref('')
    const filters = ref({
      branch: null,
      warehouse: null,
      responsible: null
    })
    const detailsDialog = ref(false)
    const selectedCount = ref(null)
    const differenceFilter = ref('all')
    const searchItem = ref('')
    const selectedItems = ref([])
    const photosDialog = ref(false)
    const currentPhotoItem = ref(null)
    const adjustmentDialog = ref(false)
    const adjustmentReason = ref(null)
    const customReason = ref('')

    const countColumns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'branch', label: 'Sucursal', field: row => props.branches.find(b => b.id === row.branch_office_id)?.name || '-', align: 'left' },
      { name: 'warehouse', label: 'Almacén', field: row => props.warehouses.find(w => w.id === row.warehouse_id)?.name || '-', align: 'left' },
      { name: 'responsible', label: 'Responsable', field: row => props.employees.find(e => e.id === row.user_id)?.name || '-', align: 'left' },
      { name: 'date', label: 'Fecha', field: 'created_at', align: 'center' },
      { name: 'differences', label: 'Ítems con diferencias', field: row => row.details.filter(d => d.difference !== 0).length, align: 'center' },
      { name: 'status', label: 'Estado', field: 'status', align: 'center' }
    ]

    const itemColumns = [
      { name: 'product_id', label: 'ID', field: 'product_id', align: 'left' },
      { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' },
      { name: 'theoretical', label: 'Existencia teórica', field: 'theoretical_quantity', align: 'center' },
      { name: 'counted', label: 'Cantidad contada', field: 'counted_quantity', align: 'center' },
      { name: 'difference', label: 'Diferencia', field: 'difference', align: 'center' },
      { name: 'difference_value', label: 'Valor diferencia', field: 'difference_value', align: 'center' },
      { name: 'deviation', label: 'Desviación %', field: 'deviation', align: 'center' },
      { name: 'photos', label: 'Evidencias', align: 'center' }
    ]

    const differenceOptions = [
      { label: 'Todos los ítems', value: 'all' },
      { label: 'Solo diferencias positivas', value: 'positive' },
      { label: 'Solo diferencias negativas', value: 'negative' },
      { label: 'Desviaciones > 10%', value: 'significant' }
    ]

    const adjustmentReasons = [
      { label: 'Merma natural', value: 'merma' },
      { label: 'Error de carga anterior', value: 'error' },
      { label: 'Robo o pérdida', value: 'robo' },
      { label: 'Donación o muestra', value: 'donacion' },
      { label: 'Otro', value: 'other' }
    ]

    const filteredWarehouses = computed(() => {
      if (!filters.value.branch) return props.warehouses
      return props.warehouses.filter(w => w.branch_id === filters.value.branch.id)
    })

    const filteredCounts = computed(() => {
      let counts = [...props.completedCounts]

      // Aplicar filtros
      if (filters.value.branch) {
        counts = counts.filter(c => c.branch_office_id === filters.value.branch.id)
      }

      if (filters.value.warehouse) {
        counts = counts.filter(c => c.warehouse_id === filters.value.warehouse.id)
      }

      if (filters.value.responsible) {
        counts = counts.filter(c => c.user_id === filters.value.responsible.id)
      }

      // Enriquecer con datos para la tabla
      return counts.map(count => ({
        ...count,
        branch: props.branches.find(b => b.id === count.branch_office_id),
        warehouse: props.warehouses.find(w => w.id === count.warehouse_id),
        responsible: props.employees.find(e => e.id === count.user_id),
        // Calcular diferencias para cada detalle
        details: count.details.map(detail => ({
          ...detail,
          deviation: ((detail.difference / detail.theoretical_quantity) * 100).toFixed(2)
        }))
      }))
    })

    const filteredItems = computed(() => {
      if (!selectedCount.value) return []

      let items = [...selectedCount.value.details]

      // Aplicar filtro de diferencias
      if (differenceFilter.value === 'positive') {
        items = items.filter(i => i.difference > 0)
      } else if (differenceFilter.value === 'negative') {
        items = items.filter(i => i.difference < 0)
      } else if (differenceFilter.value === 'significant') {
        items = items.filter(i => Math.abs(i.deviation) > 10)
      }

      return items
    })

    const totalDifferences = computed(() => {
      return filteredItems.value.filter(i => i.difference !== 0).length
    })

    const totalDifferenceValue = computed(() => {
      return filteredItems.value.reduce((sum, item) => sum + item.difference_value, 0)
    })

    const averageDeviation = computed(() => {
      const itemsWithDifferences = filteredItems.value.filter(i => i.difference !== 0)
      if (itemsWithDifferences.length === 0) return 0

      const totalDeviation = itemsWithDifferences.reduce((sum, item) => sum + parseFloat(item.deviation), 0)
      return totalDeviation / itemsWithDifferences.length
    })

    const hasDifferences = computed(() => {
      return selectedCount.value?.details.some(d => d.difference !== 0)
    })

    const itemsToAdjust = computed(() => {
      return selectedCount.value?.details.filter(d => d.difference !== 0 && !d.adjusted) || []
    })

    const totalAdjustmentValue = computed(() => {
      return itemsToAdjust.value.reduce((sum, item) => sum + item.difference_value, 0)
    })

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
    }

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

    const viewCountDetails = (evt, row) => {
      selectedCount.value = row
      detailsDialog.value = true
      selectedItems.value = []
    }

    const showPhotos = (item) => {
      currentPhotoItem.value = item
      photosDialog.value = true
    }

    const requestRecount = () => {
      if (!selectedItems.value.length) return

      $q.dialog({
        title: 'Solicitar Reconteo',
        message: `¿Desea solicitar reconteo para ${selectedItems.value.length} ítem(s) seleccionado(s)?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        emit('recount-requested', {
          countId: selectedCount.value.id,
          items: selectedItems.value
        })
        detailsDialog.value = false
      })
    }

    const approveAdjustments = () => {
      if (!hasDifferences.value) return

      adjustmentReason.value = null
      customReason.value = ''
      adjustmentDialog.value = true
    }

    const confirmAdjustments = () => {
      const reason = adjustmentReason.value === 'other'
        ? customReason.value
        : adjustmentReasons.find(r => r.value === adjustmentReason.value)?.label

      const adjustments = itemsToAdjust.value.map(item => ({
        countId: selectedCount.value.id,
        productId: item.product_id,
        reason,
        difference: item.difference,
        differenceValue: item.difference_value
      }))

      emit('adjustments-approved', adjustments)
      adjustmentDialog.value = false
      detailsDialog.value = false
    }

    return {
      filter,
      filters,
      detailsDialog,
      selectedCount,
      differenceFilter,
      searchItem,
      selectedItems,
      photosDialog,
      currentPhotoItem,
      adjustmentDialog,
      adjustmentReason,
      customReason,
      countColumns,
      itemColumns,
      differenceOptions,
      adjustmentReasons,
      filteredWarehouses,
      filteredCounts,
      filteredItems,
      totalDifferences,
      totalDifferenceValue,
      averageDeviation,
      hasDifferences,
      itemsToAdjust,
      totalAdjustmentValue,
      formatCurrency,
      getStatusColor,
      formatStatus,
      viewCountDetails,
      showPhotos,
      requestRecount,
      approveAdjustments,
      confirmAdjustments
    }
  }
}
</script>

<style scoped>
.q-table__container {
  box-shadow: none;
  border: 1px solid #e0e0e0;
}
</style>
