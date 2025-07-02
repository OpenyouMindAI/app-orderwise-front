<template>
  <div>
    <div class="text-h6 q-mb-md">Ajustes de Inventario Pendientes</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
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
            v-model="filters.status"
            :options="statusOptions"
            label="Filtrar por estado"
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </q-card>

    <q-table
      :rows="filteredAdjustments"
      :columns="columns"
      row-key="id"
      :filter="filter"
      :pagination="{ rowsPerPage: 10 }"
      selection="multiple"
      v-model:selected="selectedAdjustments"
    >
      <template v-slot:top-left>
        <q-input
          v-model="filter"
          dense
          filled
          placeholder="Buscar ajuste..."
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Procesar Ajustes"
          @click="processAdjustments"
          :disable="!selectedAdjustments.length"
        />
      </template>

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
            icon="visibility"
            color="info"
            dense
            flat
            @click="viewDetails(props.row)"
          >
            <q-tooltip>Ver detalles</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de detalles del ajuste -->
    <q-dialog v-model="detailsDialog">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles del Ajuste</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Información del Producto</div>
                  <div class="q-mt-md">
                    <p><strong>Nombre:</strong> {{ currentAdjustment?.product_name }}</p>
                    <p><strong>SKU:</strong> {{ currentAdjustment?.sku || 'N/A' }}</p>
                    <p><strong>Código:</strong> {{ currentAdjustment?.barcode || 'N/A' }}</p>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Información del Conteo</div>
                  <div class="q-mt-md">
                    <p><strong>Sucursal:</strong> {{ currentAdjustment?.branch?.name }}</p>
                    <p><strong>Almacén:</strong> {{ currentAdjustment?.warehouse?.name }}</p>
                    <p><strong>Responsable:</strong> {{ currentAdjustment?.responsible?.name }}</p>
                    <p><strong>Fecha:</strong> {{ formatDate(currentAdjustment?.created_at) }}</p>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Detalles del Ajuste</div>
                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-4 text-center">
                      <p><strong>Existencia Teórica</strong></p>
                      <p class="text-h6">{{ currentAdjustment?.theoretical_quantity }}</p>
                    </div>
                    <div class="col-4 text-center">
                      <p><strong>Cantidad Contada</strong></p>
                      <p class="text-h6">{{ currentAdjustment?.counted_quantity }}</p>
                    </div>
                    <div class="col-4 text-center">
                      <p><strong>Diferencia</strong></p>
                      <p class="text-h6" :class="currentAdjustment?.difference > 0 ? 'text-positive' : 'text-negative'">
                        {{ currentAdjustment?.difference }}
                      </p>
                    </div>
                  </div>

                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-6">
                      <p><strong>Valor de la Diferencia:</strong></p>
                      <p :class="currentAdjustment?.difference_value > 0 ? 'text-positive' : 'text-negative'">
                        {{ formatCurrency(currentAdjustment?.difference_value) }}
                      </p>
                    </div>
                    <div class="col-6">
                      <p><strong>Desviación:</strong></p>
                      <p :class="Math.abs(currentAdjustment?.deviation) > 10 ? 'text-negative' : ''">
                        {{ currentAdjustment?.deviation }}%
                      </p>
                    </div>
                  </div>

                  <div class="q-mt-md">
                    <p><strong>Motivo del Ajuste:</strong></p>
                    <p>{{ currentAdjustment?.adjustment_reason || 'Sin motivo especificado' }}</p>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12" v-if="currentAdjustment?.photos?.length">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1">Evidencias Fotográficas</div>
                  <div class="row q-col-gutter-md q-mt-md">
                    <div
                      v-for="(photo, index) in currentAdjustment.photos"
                      :key="index"
                      class="col-12 col-md-4"
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
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo para procesar ajustes -->
    <q-dialog v-model="processDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Confirmar Procesamiento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            Está a punto de procesar <strong>{{ selectedAdjustments.length }}</strong> ajuste(s) de inventario.
          </div>

          <div class="q-mb-md">
            <strong>Impacto total:</strong>
            <ul class="q-mt-sm">
              <li v-for="adj in selectedAdjustments" :key="adj.id">
                {{ adj.product_name }}:
                <span :class="adj.difference > 0 ? 'text-positive' : 'text-negative'">
                  {{ adj.difference }} ({{ formatCurrency(adj.difference_value) }})
                </span>
              </li>
            </ul>
          </div>

          <q-toggle
            v-model="generateMovement"
            label="Generar movimiento de inventario"
            color="primary"
          />

          <q-toggle
            v-model="notifyResponsible"
            label="Notificar al responsable"
            color="primary"
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancelar" color="secondary" v-close-popup />
          <q-btn
            label="Confirmar Procesamiento"
            color="primary"
            @click="confirmProcessing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'

export default {
  props: {
    pendingAdjustments: {
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
      status: null
    })
    const selectedAdjustments = ref([])
    const detailsDialog = ref(false)
    const currentAdjustment = ref(null)
    const processDialog = ref(false)
    const generateMovement = ref(true)
    const notifyResponsible = ref(false)

    const columns = [
      { name: 'id', label: 'ID', field: 'id', align: 'left' },
      { name: 'product', label: 'Producto', field: 'product_name', align: 'left' },
      { name: 'branch', label: 'Sucursal', field: row => row.branch?.name || '-', align: 'left' },
      { name: 'warehouse', label: 'Almacén', field: row => row.warehouse?.name || '-', align: 'left' },
      { name: 'theoretical', label: 'Existencia teórica', field: 'theoretical_quantity', align: 'center' },
      { name: 'counted', label: 'Cantidad contada', field: 'counted_quantity', align: 'center' },
      { name: 'difference', label: 'Diferencia', field: 'difference', align: 'center' },
      { name: 'difference_value', label: 'Valor diferencia', field: 'difference_value', align: 'center' },
      { name: 'status', label: 'Estado', field: 'status', align: 'center' },
      { name: 'actions', label: 'Acciones', align: 'center' }
    ]

    const statusOptions = [
      { label: 'Pendiente', value: 'pending' },
      { label: 'Aprobado', value: 'approved' },
      { label: 'Rechazado', value: 'rejected' }
    ]

    const filteredWarehouses = computed(() => {
      if (!filters.value.branch) return props.warehouses
      return props.warehouses.filter(w => w.branch_id === filters.value.branch.id)
    })

    const filteredAdjustments = computed(() => {
      let adjustments = [...props.pendingAdjustments]

      // Aplicar filtros
      if (filters.value.branch) {
        adjustments = adjustments.filter(a => a.branch_office_id === filters.value.branch.id)
      }

      if (filters.value.warehouse) {
        adjustments = adjustments.filter(a => a.warehouse_id === filters.value.warehouse.id)
      }

      if (filters.value.status) {
        adjustments = adjustments.filter(a => a.status === filters.value.status)
      }

      // Enriquecer con datos para la tabla
      return adjustments.map(adj => ({
        ...adj,
        branch: props.branches.find(b => b.id === adj.branch_office_id),
        warehouse: props.warehouses.find(w => w.id === adj.warehouse_id),
        responsible: props.employees.find(e => e.id === adj.user_id),
        deviation: ((adj.difference / adj.theoretical_quantity) * 100).toFixed(2)
      }))
    })

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
    }

    const getStatusColor = (status) => {
      const colors = {
        pending: 'orange',
        approved: 'green',
        rejected: 'red'
      }
      return colors[status] || 'grey'
    }

    const formatStatus = (status) => {
      const statusMap = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado'
      }
      return statusMap[status] || status
    }

    const viewDetails = (adjustment) => {
      currentAdjustment.value = adjustment
      detailsDialog.value = true
    }

    const processAdjustments = () => {
      if (!selectedAdjustments.value.length) return
      processDialog.value = true
    }

    const confirmProcessing = () => {
      emit('adjustments-processed', {
        adjustments: selectedAdjustments.value,
        generateMovement: generateMovement.value,
        notifyResponsible: notifyResponsible.value
      })

      $q.notify({
        message: 'Ajustes procesados correctamente',
        color: 'positive',
        icon: 'check_circle'
      })

      processDialog.value = false
      selectedAdjustments.value = []
    }

    return {
      filter,
      filters,
      selectedAdjustments,
      detailsDialog,
      currentAdjustment,
      processDialog,
      generateMovement,
      notifyResponsible,
      columns,
      statusOptions,
      filteredWarehouses,
      filteredAdjustments,
      formatCurrency,
      formatDate,
      getStatusColor,
      formatStatus,
      viewDetails,
      processAdjustments,
      confirmProcessing
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
