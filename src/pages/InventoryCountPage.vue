<template>
  <div class="q-pa-md">
    <q-tabs
      v-model="currentTab"
      align="left"
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
      class="text-grey-8"
    >
      <q-tab name="assign" icon="assignment" label="Asignar Conteo" />
      <q-tab name="prepare" icon="inventory" label="Preparar Conteo" />
      <q-tab name="verify" icon="checklist" label="Verificar Conteo" />
      <q-tab name="adjust" icon="adjust" label="Ajustes" />
      <q-tab name="reports" icon="assessment" label="Reportes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="currentTab" animated>
      <!-- Asignación de Conteo -->
      <q-tab-panel name="assign">
        <assign-count
          :branches="branches"
          :warehouses="warehouses"
          :employees="employees"
          @count-assigned="handleCountAssigned"
        />
      </q-tab-panel>

      <!-- Preparación de Conteo -->
      <q-tab-panel name="prepare">
        <count-preparation
          :counts="activeCounts"
          :branches="branches"
          :warehouses="warehouses"
          @count-completed="handleCountCompleted"
        />
      </q-tab-panel>

      <!-- Verificación de Conteo -->
      <q-tab-panel name="verify">
        <count-verification
          :completed-counts="completedCounts"
          @recount-requested="handleRecountRequest"
          @adjustments-approved="handleAdjustmentsApproved"
        />
      </q-tab-panel>

      <!-- Ajustes -->
      <q-tab-panel name="adjust">
        <count-adjustments
          :pending-adjustments="pendingAdjustments"
          @adjustments-processed="handleAdjustmentsProcessed"
        />
      </q-tab-panel>

      <!-- Reportes -->
      <q-tab-panel name="reports">
        <div class="text-h6">Reportes de Conteo</div>
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="reportFilter.branch"
                  :options="branches"
                  option-label="name"
                  option-value="id"
                  label="Sucursal"
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="reportFilter.warehouse"
                  :options="filteredWarehouses"
                  option-label="name"
                  option-value="id"
                  label="Almacén"
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="reportFilter.responsible"
                  :options="employees"
                  option-label="name"
                  option-value="id"
                  label="Responsable"
                  clearable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="reportFilter.dateRange"
                  label="Rango de fechas"
                  type="daterange"
                  clearable
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" label="Generar Reporte" @click="generateReport" />
            <q-btn color="secondary" label="Exportar a Excel" @click="exportToExcel" />
          </q-card-actions>
        </q-card>

        <!-- Dashboard de métricas -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-4">
            <q-card class="text-center">
              <q-card-section>
                <div class="text-h6">Conteos Completados</div>
                <div class="text-h3 text-primary">{{ metrics.completedCounts }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card class="text-center">
              <q-card-section>
                <div class="text-h6">Ítems con Diferencias</div>
                <div class="text-h3 text-orange">{{ metrics.itemsWithDifferences }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-md-4">
            <q-card class="text-center">
              <q-card-section>
                <div class="text-h6">Valor de Ajustes</div>
                <div class="text-h3" :class="metrics.adjustmentValue >= 0 ? 'text-positive' : 'text-negative'">
                  {{ formatCurrency(metrics.adjustmentValue) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AssignCount from 'src/components/ProductCount/AssignCount.vue'
import CountPreparation from 'src/components/ProductCount/CountPreparation.vue'
import CountVerification from 'src/components/ProductCount/CountVerification.vue'
import CountAdjustments from 'src/components/ProductCount/CountAdjustments.vue'

export default {
  components: {
    AssignCount,
    CountPreparation,
    CountVerification,
    CountAdjustments
  },
  setup () {
    const $q = useQuasar()
    const currentTab = ref('assign')

    // Mock data
    const branches = ref([
      { id: 1, name: 'Sucursal Central' },
      { id: 2, name: 'Sucursal Norte' },
      { id: 3, name: 'Sucursal Sur' }
    ])

    const warehouses = ref([
      { id: 1, branch_id: 1, name: 'Almacén Principal' },
      { id: 2, branch_id: 1, name: 'Almacén Secundario' },
      { id: 3, branch_id: 2, name: 'Almacén Norte' },
      { id: 4, branch_id: 3, name: 'Almacén Sur' }
    ])

    const employees = ref([
      { id: 1, name: 'Juan Pérez', role: 'Encargado de Almacén' },
      { id: 2, name: 'María Gómez', role: 'Asistente de Almacén' },
      { id: 3, name: 'Carlos Ruiz', role: 'Asistente de Almacén' }
    ])

    // Mock data más completa para inventoryCounts
    const inventoryCounts = ref([
      {
        id: 1,
        branch_office_id: 1,
        warehouse_id: 1,
        user_id: 1,
        status: 'completed',
        periodicity: 'mensual',
        created_at: '2023-06-15',
        updated_at: '2023-06-15',
        details: [
          {
            product_id: 101,
            product_name: 'Café Premium 250g',
            counted_quantity: 48,
            theoretical_quantity: 50,
            difference: -2,
            difference_value: -120.00,
            adjusted: false,
            photos: []
          },
          {
            product_id: 102,
            product_name: 'Azúcar 1kg',
            counted_quantity: 75,
            theoretical_quantity: 72,
            difference: 3,
            difference_value: 45.00,
            adjusted: true,
            adjustment_reason: 'Error de carga anterior',
            photos: []
          }
        ]
      },
      {
        id: 2,
        branch_office_id: 1,
        warehouse_id: 2,
        user_id: 2,
        status: 'in_progress',
        periodicity: null,
        created_at: '2023-06-16',
        updated_at: '2023-06-16',
        details: [
          {
            product_id: 103,
            product_name: 'Leche 1L',
            counted_quantity: 30,
            theoretical_quantity: 32,
            difference: -2,
            difference_value: -80.00,
            adjusted: false,
            photos: []
          }
        ]
      },
      {
        id: 3,
        branch_office_id: 2,
        warehouse_id: 3,
        user_id: 3,
        status: 'pending',
        periodicity: 'cíclico',
        created_at: '2023-06-17',
        updated_at: '2023-06-17',
        details: []
      },
      {
        id: 4,
        branch_office_id: 3,
        warehouse_id: 4,
        user_id: 1,
        status: 'completed',
        periodicity: 'mensual',
        created_at: '2023-06-18',
        updated_at: '2023-06-18',
        details: [
          {
            product_id: 104,
            product_name: 'Harina 0000 1kg',
            counted_quantity: 42,
            theoretical_quantity: 40,
            difference: 2,
            difference_value: 60.00,
            adjusted: false,
            photos: []
          }
        ]
      }
    ])
    const metrics = ref({
      completedCounts: 5,
      itemsWithDifferences: 12,
      adjustmentValue: -345.50
    })

    const reportFilter = ref({
      branch: null,
      warehouse: null,
      responsible: null,
      dateRange: null
    })

    // Computed properties
    const filteredWarehouses = computed(() => {
      if (!reportFilter.value.branch) return warehouses.value
      return warehouses.value.filter(w => w.branch_id === reportFilter.value.branch.id)
    })

    const activeCounts = computed(() => {
      return inventoryCounts.value.filter(c => c.status === 'in_progress' || c.status === 'pending')
    })

    const completedCounts = computed(() => {
      return inventoryCounts.value.filter(c => c.status === 'completed')
    })

    const pendingAdjustments = computed(() => {
      return completedCounts.value.flatMap(count =>
        count.details.filter(d => !d.adjusted && d.difference !== 0)
      )
    })

    // Methods
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
    }

    const handleCountAssigned = (newCount) => {
      inventoryCounts.value.push({
        ...newCount,
        id: Math.max(...inventoryCounts.value.map(c => c.id)) + 1,
        status: 'pending',
        details: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      $q.notify({
        message: 'Conteo asignado correctamente',
        color: 'positive',
        icon: 'check_circle'
      })
      currentTab.value = 'prepare'
    }

    const handleCountCompleted = (countId) => {
      const index = inventoryCounts.value.findIndex(c => c.id === countId)
      if (index !== -1) {
        inventoryCounts.value[index].status = 'completed'
        inventoryCounts.value[index].updated_at = new Date().toISOString()
        $q.notify({
          message: 'Conteo completado y listo para verificación',
          color: 'positive',
          icon: 'check_circle'
        })
        currentTab.value = 'verify'
      }
    }

    const handleRecountRequest = ({ countId, items }) => {
      const index = inventoryCounts.value.findIndex(c => c.id === countId)
      if (index !== -1) {
        inventoryCounts.value[index].status = 'recount'
        // Agregar lógica para asignar reconteo
        $q.notify({
          message: 'Reconteo solicitado para los ítems seleccionados',
          color: 'info',
          icon: 'info'
        })
      }
    }

    const handleAdjustmentsApproved = (adjustments) => {
      // Actualizar los detalles con los ajustes aprobados
      adjustments.forEach(adj => {
        const count = inventoryCounts.value.find(c => c.id === adj.countId)
        if (count) {
          const detail = count.details.find(d => d.product_id === adj.productId)
          if (detail) {
            detail.adjusted = true
            detail.adjustment_reason = adj.reason
          }
        }
      })

      $q.notify({
        message: 'Ajustes aprobados correctamente',
        color: 'positive',
        icon: 'check_circle'
      })
      currentTab.value = 'adjust'
    }

    const handleAdjustmentsProcessed = () => {
      $q.notify({
        message: 'Ajustes procesados e integrados al Kardex',
        color: 'positive',
        icon: 'check_circle'
      })
      // Actualizar métricas
      metrics.value.completedCounts += 1
    }

    const generateReport = () => {
      $q.notify({
        message: 'Reporte generado correctamente',
        color: 'positive',
        icon: 'description'
      })
    }

    const exportToExcel = () => {
      $q.notify({
        message: 'Exportando a Excel...',
        color: 'info',
        icon: 'download'
      })
    }

    onMounted(() => {
      // Simular carga de datos
      setTimeout(() => {
        $q.notify({
          message: 'Datos de inventario cargados',
          color: 'info',
          timeout: 1000
        })
      }, 500)
    })

    return {
      currentTab,
      branches,
      warehouses,
      employees,
      inventoryCounts,
      metrics,
      reportFilter,
      filteredWarehouses,
      activeCounts,
      completedCounts,
      pendingAdjustments,
      formatCurrency,
      handleCountAssigned,
      handleCountCompleted,
      handleRecountRequest,
      handleAdjustmentsApproved,
      handleAdjustmentsProcessed,
      generateReport,
      exportToExcel
    }
  }
}
</script>

<style scoped>
.q-tab-panel {
  padding: 16px 0;
}

.q-card {
  border-radius: 8px;
}

.text-h3 {
  font-weight: 500;
}
</style>
