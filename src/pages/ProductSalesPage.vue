<template>
  <q-page padding>
    <!-- Header Section -->
    <div>
      <h6 class="dashboard-title">Panel de análisis de ventas</h6>
      <p class="dashboard-subtitle">Información en tiempo real y métricas de rendimiento</p>
    </div>

    <div class="q-mt-sm">
      <!-- KPI Cards -->
       <div class="q-mt-md">
         <span class="text-h6 text-weight-medium">
           <q-icon name="analytics"/>
           Resumen de actual
         </span>
       </div>
      <div class="q-mt-md">
        <div class="row q-gutter-sm q-mt-sm">
          <div
            v-for="(kpi, index) in kpiCards"
            :key="kpi.label"
            class="col-12 col-sm-6 col-md"
          >
            <q-card class="kpi-card" flat :class="`kpi-card-${index + 1}`">
              <q-card-section class="text-center q-pa-lg">
                <div class="kpi-icon q-mb-md">
                  <q-icon :name="kpi.icon" size="2rem" />
                </div>
                <div class="kpi-value">{{ formatNumber(kpi.value) }}</div>
                <div class="kpi-label">{{ kpi.label }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <div class="q-mt-md">
        <span class="text-h6 text-weight-medium">
          <q-icon name="analytics"/>
          Indicadores de negocio
        </span>
      </div>
      <!-- Modern Filters Card -->
      <q-card class="q-mt-md" flat>
        <q-card-section>
          <div class="q-mb-md">
            <span class="text-subtitle1 text-weight-medium">
              <q-icon name="tune" class="q-mr-sm" />
              Filtros y controles
            </span>
          </div>
          <div class="row items-center q-gutter-sm justify-between">
            <div class="col-12 col-md-3">
              <q-select
                v-model="branchOffice"
                :options="branchOptions"
                label="Sucursales"
                option-label="name"
                filled
                dense
                emit-value
                map-options
                clearable
                clear-icon="close"
              >
                <template #prepend>
                  <q-icon name="business" />
                </template>
              </q-select>
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="dateRange.start"
                label="Desde"
                filled
                dense
                mask="####-##-##"
              >
                <template #prepend>
                  <q-icon name="event" />
                </template>
                <template #append>
                  <q-icon name="calendar_today" @click="showFromDate = true" class="cursor-pointer" />
                </template>
              </q-input>
              <q-popup-proxy v-model="showFromDate">
                <q-date v-model="dateRange.start" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </div>
            <div class="col-6 col-md-3">
              <q-input
                v-model="dateRange.end"
                label="Hasta"
                filled
                dense
                mask="####-##-##"
              >
                <template #prepend>
                  <q-icon name="event" />
                </template>
                <template #append>
                  <q-icon name="calendar_today" @click="showToDate = true" class="cursor-pointer" />
                </template>
              </q-input>
              <q-popup-proxy v-model="showToDate">
                <q-date v-model="dateRange.end" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                @click="refreshAll"
                color="primary"
                class="refresh-btn full-width"
                :loading="isLoading"
              >
                <q-icon name="refresh" class="q-mr-sm" />
                Refrescar
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Charts Section -->
      <div class="charts-section q-mt-md">
        <div class="row q-col-gutter-xl">
          <!-- Top Products -->
          <div class="col-12 col-lg-6">
            <q-card class="chart-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="chart-header q-mb-lg">
                  <h4 class="chart-title">
                    <q-icon name="inventory" class="q-mr-sm" />
                    Top 10 Productos Vendidos
                  </h4>
                </div>

                <!-- Empty State -->
                <div v-if="!topProducts.length" class="empty-state">
                  <q-icon name="inventory_2" size="3rem" color="grey-5" />
                  <p class="text-grey-6 q-mt-sm q-mb-none">No hay datos de productos disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="topProducts"
                  :columns="columnsTopProducts"
                  flat
                  class="modern-table"
                  hide-bottom
                  :rows-per-page-options="[0]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Low Stock Products -->
          <div class="col-12 col-lg-6">
            <q-card class="table-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="table-header q-mb-lg">
                  <h4 class="table-title">
                    <q-icon name="warning" class="q-mr-sm text-orange" />
                    Alerta de stock bajo
                  </h4>
                  <q-badge color="orange" :label="lowStockProducts.length"/>
                </div>

                <!-- Empty State -->
                <div v-if="!lowStockProducts.length" class="empty-state">
                  <q-icon name="check_circle" size="3rem" color="green-5" />
                  <p class="text-grey-6 q-mt-sm q-mb-none">Todos los productos tienen stock suficiente</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="lowStockProducts"
                  :columns="columnsLowStock"
                  flat
                  class="modern-table"
                  :rows-per-page-options="[10, 25, 50]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Top Clients -->
          <div class="col-12 col-lg-6">
            <q-card class="chart-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="chart-header">
                  <h4 class="chart-title">
                    <q-icon name="people" class="q-mr-sm" />
                    Top 10 Clientes
                  </h4>
                </div>

                <!-- Empty State -->
                <div v-if="!topClients.length" class="empty-state">
                  <q-icon name="people_outline" size="3rem" color="grey-5" />
                  <p class="text-grey-6 q-mt-sm q-mb-none">No hay datos de clientes disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="topClients"
                  :columns="columnsTopClients"
                  flat
                  class="modern-table q-mt-lg"
                  hide-bottom
                  :rows-per-page-options="[0]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Top Vendedores -->
          <div class="col-12 col-lg-6">
            <q-card class="table-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="table-header q-mb-lg">
                  <h4 class="table-title">
                    <q-icon name="star" class="q-mr-sm text-amber" />
                    Top 10 Vendedores
                  </h4>
                </div>

                <!-- Empty State -->
                <div v-if="!sellerStats.length" class="empty-state">
                  <q-icon name="person_outline" size="3rem" color="grey-5" />
                  <p class="text-grey-6 q-mt-sm q-mb-none">No hay datos de vendedores disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="sellerStats"
                  :columns="columnsSellerStats"
                  flat
                  class="modern-table"
                  hide-bottom
                  :rows-per-page-options="[0]"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="invoice-section q-mt-md">
        <q-card class="table-card" flat>
          <q-card-section class="q-pa-lg">
            <div class="table-header q-mb-lg">
              <h4 class="table-title">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Detalle de ventas
              </h4>
              <div class="table-actions">
                <q-btn flat icon="download" label="Exportar" @click="downloadInvoiceTable"/>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!invoiceTable.data.length && !invoiceTable.loading" class="empty-state">
              <q-icon name="receipt_long" size="3rem" color="grey-5" />
              <p class="text-grey-6 q-mt-sm q-mb-none">No hay ventas para mostrar</p>
            </div>

            <!-- Data Table -->
            <q-table
              v-else
              :rows="invoiceTable.data"
              :columns="columnsInvoiceTable"
              flat
              class="modern-table"
              v-model:pagination="invoiceTable.pagination"
              :loading="invoiceTable.loading"
              @request="onRequestInvoiceTable"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { formatDate, formatNumber, notify } from 'src/const/mixins'

// Reactive data
const branchOffice = ref(null)
const branchOptions = ref([])
const today = formatDate(new Date(), 'YYYY-MM-DD')
const dateRange = ref({ start: today, end: today })
const showFromDate = ref(false)
const showToDate = ref(false)
const isLoading = ref(false)

const kpis = ref({})
const topProducts = ref([])
const topClients = ref([])
const lowStockProducts = ref([])
const paymentMethods = ref([])
const sellerStats = ref([])

const invoiceTable = ref({
  data: [],
  pagination: { page: 1, rowsPerPage: 15, rowsNumber: 0 },
  loading: false
})

// Table columns - Todas las etiquetas en español
const columnsTopProducts = [
  { name: 'product_id', label: 'ID', field: 'product_id', align: 'left', style: 'width: 80px' },
  { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' },
  { name: 'total_quantity', label: 'Cantidad', field: 'total_quantity', align: 'right', format: val => `${val}` }
]

const columnsTopClients = [
  { name: 'client_id', label: 'ID', field: 'client_id', align: 'left', style: 'width: 80px' },
  { name: 'client_name', label: 'Cliente', field: 'client_name', align: 'left' },
  { name: 'total_spent', label: 'Total gastado', field: 'total_spent', align: 'right', format: val => formatNumber(val) }
]

const columnsLowStock = [
  { name: 'product_id', label: 'ID', field: 'product_id', align: 'left', style: 'width: 80px' },
  { name: 'product_name', label: 'Producto', field: 'product_name', align: 'left' },
  { name: 'stock_quantity', label: 'Stock actual', field: 'stock_quantity', align: 'right' },
  { name: 'min_stock', label: 'Stock mínimo', field: 'min_stock', align: 'right' }
]

const columnsSellerStats = [
  { name: 'seller_id', label: 'ID', field: 'seller_id', align: 'left', style: 'width: 80px' },
  { name: 'seller_name', label: 'Vendedor', field: 'seller_name', align: 'left' },
  { name: 'invoice_count', label: 'Facturas', field: 'invoice_count', align: 'right' },
  { name: 'total_sales', label: 'Ventas totales', field: 'total_sales', align: 'right', format: val => formatNumber(val) }
]

const columnsInvoiceTable = [
  { name: 'invoice', label: 'Factura', field: row => row.invoice?.code, align: 'left' },
  { name: 'category', label: 'Categoría', field: row => row?.product?.category?.name, align: 'left' },
  { name: 'product', label: 'Producto', field: row => row.product?.name?.slice(0, 40), align: 'left' },
  { name: 'client', label: 'Cliente', field: row => row.invoice?.client?.name, align: 'left' },
  { name: 'seller', label: 'Vendedor', field: row => row.invoice?.seller?.name || '-', align: 'left' },
  { name: 'amount', label: 'Cantidad', field: 'amount', align: 'right' },
  { name: 'price', label: 'Precio', field: 'price', align: 'right', format: val => formatNumber(val) }
]

// Computed properties
const kpiCards = computed(() => [
  {
    label: 'Facturas de hoy',
    value: kpis.value.invoice_count_today || 0,
    icon: 'receipt'
  },
  {
    label: 'Total de hoy',
    value: kpis.value.total_today || 0,
    icon: 'today'
  },
  {
    label: 'Total de la semana',
    value: kpis.value.total_week || 0,
    icon: 'date_range'
  },
  {
    label: 'Promedio de ventas',
    value: kpis.value.average_ticket || 0,
    icon: 'attach_money'
  }
])

function getFilters () {
  return {
    branch_office_id: branchOffice.value.id || undefined,
    start_date: `${dateRange.value.start} 00:00:00`,
    end_date: `${dateRange.value.end} 23:59:59`
  }
}

async function fetchStats () {
  try {
    const params = getFilters()
    const [
      kpisRes,
      topProductsRes,
      topClientsRes,
      lowStockRes,
      paymentRes,
      sellerRes
    ] = await Promise.all([
      api.get('dashboard/global-kpis', { params }),
      api.get('dashboard/top-products', { params }),
      api.get('dashboard/top-clients', { params }),
      api.get('dashboard/low-stock-products', { params }),
      api.get('dashboard/payment-method-stats', { params }),
      api.get('dashboard/seller-stats', { params })
    ])

    kpis.value = kpisRes.data || {}
    topProducts.value = topProductsRes.data || []
    topClients.value = topClientsRes.data || []
    lowStockProducts.value = lowStockRes.data || []
    paymentMethods.value = paymentRes.data || []
    sellerStats.value = sellerRes.data || []
  } catch (error) {
    notify('Error al cargar los datos del dashboard', 'negative', 'warning')
    console.error('Error fetching stats:', error)
  }
}

async function fetchInvoiceTable (pagination = { page: 1, rowsPerPage: 15 }) {
  invoiceTable.value.loading = true
  try {
    const params = {
      ...getFilters(),
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage
    }
    const { data } = await api.get('dashboard/table', { params })
    invoiceTable.value.data = data.data
    invoiceTable.value.pagination = {
      ...pagination,
      rowsNumber: data.total
    }
  } catch (error) {
    notify('Error al cargar las ventas', 'negative', 'warning')
    console.error('Error fetching invoice table:', error)
    invoiceTable.value.data = []
  } finally {
    invoiceTable.value.loading = false
  }
}

function onRequestInvoiceTable ({ pagination }) {
  fetchInvoiceTable(pagination)
}

async function refreshAll () {
  isLoading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchInvoiceTable(invoiceTable.value.pagination)
    ])
    notify('Datos actualizados correctamente', 'positive', 'check_circle')
  } catch (error) {
    notify('Error al actualizar los datos', 'negative', 'warning')
  } finally {
    isLoading.value = false
  }
}

async function fetchBranches () {
  try {
    const { data } = await api.get('branch-offices')
    branchOptions.value = data || []
    if (data && data.length > 0) {
      branchOffice.value = data[0]
    }
  } catch (error) {
    notify('Error al cargar las sucursales', 'negative', 'warning')
    console.error('Error fetching branches:', error)
  }
}

async function downloadInvoiceTable () {
  try {
    const response = await api.post('dashboard/export-table', { ...getFilters() }, {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ventas.xlsx'
    document.body.appendChild(link) // Necesario para móviles

    // Click programático, funciona en desktop y móvil
    link.click()

    // Limpieza
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    }, 100)
  } catch (error) {
    notify('Error al exportar la tabla', 'negative', 'warning')
    console.error('Error downloading invoice table:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await fetchBranches()
  await fetchStats()
  await fetchInvoiceTable()
})
</script>

<style scoped>
.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.dashboard-subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
}

.section-title {
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
}

.refresh-btn {
  font-weight: 600;
  text-transform: none;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.kpi-card-1::before { background: linear-gradient(90deg, #667eea, #764ba2); }
.kpi-card-2::before { background: linear-gradient(90deg, #f093fb, #f5576c); }
.kpi-card-3::before { background: linear-gradient(90deg, #4facfe, #00f2fe); }
.kpi-card-4::before { background: linear-gradient(90deg, #43e97b, #38f9d7); }

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.kpi-icon {
  color: #667eea;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.kpi-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.chart-card, .table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.chart-card:hover, .table-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.chart-header, .table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title, .table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-table :deep(.q-table thead th) {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.modern-table :deep(.q-table tbody tr:hover) {
  background: #f8f9fa;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* Estado vacío profesional y compacto */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  min-height: 120px;
}

.empty-state p {
  font-size: 0.9rem;
  max-width: 200px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .kpi-value {
    font-size: 1.4rem;
  }

  .chart-header, .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .empty-state {
    min-height: 100px;
    padding: 1.5rem 1rem;
  }
}
</style>
