<template>
  <q-page padding class="dashboard-page">
    <!-- Header Section -->
    <div>
      <h6 class="dashboard-title">Panel de análisis de ventas</h6>
      <p class="dashboard-subtitle">Información en tiempo real y métricas de rendimiento</p>
    </div>

    <div class="q-mt-sm">
      <!-- KPI Cards -->
      <div class="q-mt-md">
        <span class="text-h6 text-weight-medium section-header">
          <q-icon name="analytics"/>
          Resumen actual
        </span>
      </div>
      <div class="q-mt-md">
        <div class="row q-gutter-sm q-mt-sm">
          <!-- KPI Skeleton Loading -->
          <template v-if="loadingStates.kpis">
            <div
              v-for="index in 4"
              :key="`kpi-skeleton-${index}`"
              class="col-12 col-sm-6 col-md"
            >
              <q-card class="kpi-card" flat>
                <q-card-section class="text-center q-pa-lg">
                  <q-skeleton type="QAvatar" size="2rem" class="q-mb-md" />
                  <q-skeleton type="text" width="60%" height="2rem" class="q-mb-sm" />
                  <q-skeleton type="text" width="80%" height="1rem" />
                </q-card-section>
              </q-card>
            </div>
          </template>

          <!-- KPI Cards Data -->
          <template v-else>
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
          </template>
        </div>
      </div>

      <div class="q-mt-md">
        <span class="text-h6 text-weight-medium section-header">
          <q-icon name="analytics"/>
          Indicadores de negocio
        </span>
      </div>

      <!-- Modern Filters Card -->
      <q-card class="filters-card q-mt-md" flat>
        <q-card-section>
          <div class="q-mb-md">
            <span class="text-subtitle1 text-weight-medium section-header">
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
                :loading="loadingStates.branches"
                class="custom-input"
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
                class="custom-input"
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
                class="custom-input"
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
            <q-card class="data-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="card-header q-mb-lg">
                  <h4 class="card-title">
                    <q-icon name="inventory" class="q-mr-sm" />
                    Top 10 Productos Vendidos
                  </h4>
                </div>

                <!-- Skeleton Loading -->
                <template v-if="loadingStates.topProducts">
                  <div class="skeleton-table">
                    <div class="skeleton-table-header">
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="50%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                    </div>
                    <div v-for="i in 5" :key="`product-skeleton-${i}`" class="skeleton-table-row">
                      <q-skeleton type="text" width="10%" height="1rem" />
                      <q-skeleton type="text" width="60%" height="1rem" />
                      <q-skeleton type="text" width="15%" height="1rem" />
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div v-else-if="!topProducts.length" class="empty-state">
                  <q-icon name="inventory_2" size="3rem" class="empty-icon" />
                  <p class="empty-text q-mt-sm q-mb-none">No hay datos de productos disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="topProducts"
                  :columns="columnsTopProducts"
                  flat
                  class="data-table"
                  hide-bottom
                  :rows-per-page-options="[0]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Low Stock Products -->
          <div class="col-12 col-lg-6">
            <q-card class="data-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="card-header q-mb-lg">
                  <h4 class="card-title">
                    <q-icon name="warning" class="q-mr-sm text-orange" />
                    Alerta de stock bajo
                  </h4>
                  <q-badge
                    v-if="!loadingStates.lowStock"
                    color="orange"
                    :label="lowStockProducts.length"
                  />
                  <q-skeleton v-else type="QBadge" />
                </div>

                <!-- Skeleton Loading -->
                <template v-if="loadingStates.lowStock">
                  <div class="skeleton-table">
                    <div class="skeleton-table-header">
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="40%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                    </div>
                    <div v-for="i in 3" :key="`stock-skeleton-${i}`" class="skeleton-table-row">
                      <q-skeleton type="text" width="10%" height="1rem" />
                      <q-skeleton type="text" width="50%" height="1rem" />
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="15%" height="1rem" />
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div v-else-if="!lowStockProducts.length" class="empty-state">
                  <q-icon name="check_circle" size="3rem" class="empty-icon text-green" />
                  <p class="empty-text q-mt-sm q-mb-none">Todos los productos tienen stock suficiente</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="lowStockProducts"
                  :columns="columnsLowStock"
                  flat
                  class="data-table"
                  :rows-per-page-options="[10, 25, 50]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Top Clients -->
          <div class="col-12 col-lg-6">
            <q-card class="data-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="card-header">
                  <h4 class="card-title">
                    <q-icon name="people" class="q-mr-sm" />
                    Top 10 Clientes
                  </h4>
                </div>

                <!-- Skeleton Loading -->
                <template v-if="loadingStates.topClients">
                  <div class="skeleton-table q-mt-lg">
                    <div class="skeleton-table-header">
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="50%" height="1rem" />
                      <q-skeleton type="text" width="25%" height="1rem" />
                    </div>
                    <div v-for="i in 5" :key="`client-skeleton-${i}`" class="skeleton-table-row">
                      <q-skeleton type="text" width="10%" height="1rem" />
                      <q-skeleton type="text" width="60%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div v-else-if="!topClients.length" class="empty-state">
                  <q-icon name="people_outline" size="3rem" class="empty-icon" />
                  <p class="empty-text q-mt-sm q-mb-none">No hay datos de clientes disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="topClients"
                  :columns="columnsTopClients"
                  flat
                  class="data-table q-mt-lg"
                  hide-bottom
                  :rows-per-page-options="[0]"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Top Vendedores -->
          <div class="col-12 col-lg-6">
            <q-card class="data-card" flat>
              <q-card-section class="q-pa-lg">
                <div class="card-header q-mb-lg">
                  <h4 class="card-title">
                    <q-icon name="star" class="q-mr-sm text-amber" />
                    Top 10 Vendedores
                  </h4>
                </div>

                <!-- Skeleton Loading -->
                <template v-if="loadingStates.sellers">
                  <div class="skeleton-table">
                    <div class="skeleton-table-header">
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="40%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                    </div>
                    <div v-for="i in 5" :key="`seller-skeleton-${i}`" class="skeleton-table-row">
                      <q-skeleton type="text" width="10%" height="1rem" />
                      <q-skeleton type="text" width="50%" height="1rem" />
                      <q-skeleton type="text" width="15%" height="1rem" />
                      <q-skeleton type="text" width="20%" height="1rem" />
                    </div>
                  </div>
                </template>

                <!-- Empty State -->
                <div v-else-if="!sellerStats.length" class="empty-state">
                  <q-icon name="person_outline" size="3rem" class="empty-icon" />
                  <p class="empty-text q-mt-sm q-mb-none">No hay datos de vendedores disponibles</p>
                </div>

                <!-- Data Table -->
                <q-table
                  v-else
                  :rows="sellerStats"
                  :columns="columnsSellerStats"
                  flat
                  class="data-table"
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
        <q-card class="data-card" flat>
          <q-card-section class="q-pa-lg">
            <div class="card-header q-mb-lg">
              <h4 class="card-title">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Detalle de ventas
              </h4>
              <div class="table-actions">
                <q-btn
                  flat
                  icon="download"
                  label="Exportar"
                  @click="downloadInvoiceTable"
                  :loading="loadingStates.export"
                  class="action-btn"
                />
              </div>
            </div>

            <!-- Skeleton Loading for Invoice Table -->
            <template v-if="invoiceTable.loading">
              <div class="skeleton-table">
                <div class="skeleton-table-header">
                  <q-skeleton type="text" width="15%" height="1rem" />
                  <q-skeleton type="text" width="15%" height="1rem" />
                  <q-skeleton type="text" width="25%" height="1rem" />
                  <q-skeleton type="text" width="20%" height="1rem" />
                  <q-skeleton type="text" width="15%" height="1rem" />
                  <q-skeleton type="text" width="10%" height="1rem" />
                </div>
                <div v-for="i in 10" :key="`invoice-skeleton-${i}`" class="skeleton-table-row">
                  <q-skeleton type="text" width="12%" height="1rem" />
                  <q-skeleton type="text" width="18%" height="1rem" />
                  <q-skeleton type="text" width="30%" height="1rem" />
                  <q-skeleton type="text" width="20%" height="1rem" />
                  <q-skeleton type="text" width="12%" height="1rem" />
                  <q-skeleton type="text" width="8%" height="1rem" />
                </div>
              </div>
              <!-- Skeleton Pagination -->
              <div class="skeleton-pagination q-mt-md">
                <q-skeleton type="QBtn" />
                <q-skeleton type="text" width="100px" height="1rem" />
                <q-skeleton type="QBtn" />
              </div>
            </template>

            <!-- Empty State -->
            <div v-else-if="!invoiceTable.data.length" class="empty-state">
              <q-icon name="receipt_long" size="3rem" class="empty-icon" />
              <p class="empty-text q-mt-sm q-mb-none">No hay ventas para mostrar</p>
            </div>

            <!-- Data Table -->
            <q-table
              v-else
              :rows="invoiceTable.data"
              :columns="columnsInvoiceTable"
              flat
              class="data-table"
              v-model:pagination="invoiceTable.pagination"
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

// Loading states for each data element
const loadingStates = ref({
  branches: false,
  kpis: false,
  topProducts: false,
  topClients: false,
  lowStock: false,
  sellers: false,
  export: false
})

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
  { name: 'total_quantity', label: 'Cantidad', field: 'total_quantity', align: 'right', format: val => formatNumber(val) }
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
    branch_office_id: branchOffice.value?.id || undefined,
    start_date: `${dateRange.value.start} 00:00:00`,
    end_date: `${dateRange.value.end} 23:59:59`
  }
}

async function fetchStats () {
  // Set individual loading states
  loadingStates.value.kpis = true
  loadingStates.value.topProducts = true
  loadingStates.value.topClients = true
  loadingStates.value.lowStock = true
  loadingStates.value.sellers = true

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
  } finally {
    // Reset loading states
    loadingStates.value.kpis = false
    loadingStates.value.topProducts = false
    loadingStates.value.topClients = false
    loadingStates.value.lowStock = false
    loadingStates.value.sellers = false
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
  loadingStates.value.branches = true
  try {
    const { data } = await api.get('branch-offices')
    branchOptions.value = data || []
    if (data && data.length > 0) {
      branchOffice.value = data[0]
    }
  } catch (error) {
    notify('Error al cargar las sucursales', 'negative', 'warning')
    console.error('Error fetching branches:', error)
  } finally {
    loadingStates.value.branches = false
  }
}

async function downloadInvoiceTable () {
  loadingStates.value.export = true
  try {
    const { data } = await api.get('dashboard/export-table', {
      params: getFilters(),
      responseType: 'blob'
    })
    const blob = new Blob([data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ventas.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()

    notify('Archivo exportado correctamente', 'positive', 'download')
  } catch (error) {
    notify('Error al exportar la tabla', 'negative', 'warning')
    console.error('Error downloading invoice table:', error)
  } finally {
    loadingStates.value.export = false
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
/* ===== BASE STYLES ===== */
.dashboard-page {
  background-color: #f5f5f5;
  color: #1a1a1a;
  min-height: 100vh;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.dashboard-subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0.5rem 0 0 0;
  color: #666666;
}

.section-header {
  color: #1a1a1a !important;
  display: flex;
  align-items: center;
}

/* ===== CARDS ===== */
.kpi-card,
.data-card,
.filters-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
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

.kpi-card:hover,
.data-card:hover,
.filters-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}

.kpi-icon {
  color: #667eea;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.kpi-label {
  font-size: 0.85rem;
  color: #666666;
  font-weight: 500;
}

/* ===== CARD HEADERS ===== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
}

/* ===== TABLES ===== */
.data-table {
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
}

.data-table :deep(.q-table) {
  background-color: #ffffff;
  color: #1a1a1a;
}

.data-table :deep(.q-table thead) {
  background-color: #f8f9fa;
}

.data-table :deep(.q-table thead th) {
  background-color: #f8f9fa !important;
  color: #1a1a1a !important;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 2px solid #e0e0e0;
  padding: 12px 16px;
}

.data-table :deep(.q-table tbody) {
  background-color: #ffffff;
}

.data-table :deep(.q-table tbody tr) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.data-table :deep(.q-table tbody tr:hover) {
  background-color: #f5f5f5 !important;
}

.data-table :deep(.q-table tbody td) {
  color: #1a1a1a !important;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 16px;
}

.data-table :deep(.q-table__bottom) {
  background-color: #ffffff;
  color: #1a1a1a;
  border-top: 1px solid #e0e0e0;
}

.data-table :deep(.q-table__bottom .q-btn) {
  color: #1a1a1a;
}

/* ===== INPUTS ===== */
.custom-input :deep(.q-field__control) {
  background-color: #ffffff;
  color: #1a1a1a;
}

.custom-input :deep(.q-field__label) {
  color: #666666;
}

.custom-input :deep(.q-field__native) {
  color: #1a1a1a;
}

.custom-input :deep(.q-icon) {
  color: #666666;
}

/* ===== BUTTONS ===== */
.refresh-btn,
.action-btn {
  font-weight: 600;
  text-transform: none;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* ===== EMPTY STATES ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  min-height: 120px;
}

.empty-icon {
  color: #999999;
}

.empty-text {
  font-size: 0.9rem;
  max-width: 200px;
  line-height: 1.4;
  color: #666666;
}

/* ===== SKELETON STYLES ===== */
.skeleton-table {
  width: 100%;
}

.skeleton-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  gap: 16px;
}

.skeleton-table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}

.skeleton-table-row:last-child {
  border-radius: 0 0 8px 8px;
}

.skeleton-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

/* ===== DARK MODE STYLES ===== */
.body--dark .dashboard-page {
  background-color: #121212;
  color: #ffffff;
}

.body--dark .dashboard-title {
  color: #ffffff;
}

.body--dark .dashboard-subtitle {
  color: #b3b3b3;
}

.body--dark .section-header {
  color: #ffffff !important;
}

/* Dark mode cards */
.body--dark .kpi-card,
.body--dark .data-card,
.body--dark .filters-card {
  background-color: #1e1e1e;
  border: 1px solid #333333;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.body--dark .kpi-card:hover,
.body--dark .data-card:hover,
.body--dark .filters-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}

.body--dark .kpi-value {
  color: #ffffff;
}

.body--dark .kpi-label {
  color: #b3b3b3;
}

.body--dark .card-title {
  color: #ffffff;
}

/* Dark mode tables */
.body--dark .data-table {
  background-color: #1e1e1e;
}

.body--dark .data-table :deep(.q-table) {
  background-color: #1e1e1e;
  color: #ffffff;
}

.body--dark .data-table :deep(.q-table thead) {
  background-color: #2a2a2a;
}

.body--dark .data-table :deep(.q-table thead th) {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  border-bottom: 2px solid #333333;
}

.body--dark .data-table :deep(.q-table tbody) {
  background-color: #1e1e1e;
}

.body--dark .data-table :deep(.q-table tbody tr) {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
}

.body--dark .data-table :deep(.q-table tbody tr:hover) {
  background-color: #2a2a2a !important;
}

.body--dark .data-table :deep(.q-table tbody td) {
  color: #ffffff !important;
  border-bottom: 1px solid #333333;
}

.body--dark .data-table :deep(.q-table__bottom) {
  background-color: #1e1e1e;
  color: #ffffff;
  border-top: 1px solid #333333;
}

.body--dark .data-table :deep(.q-table__bottom .q-btn) {
  color: #ffffff;
}

/* Dark mode inputs */
.body--dark .custom-input :deep(.q-field__control) {
  background-color: #2a2a2a;
  color: #ffffff;
}

.body--dark .custom-input :deep(.q-field__label) {
  color: #b3b3b3;
}

.body--dark .custom-input :deep(.q-field__native) {
  color: #ffffff;
}

.body--dark .custom-input :deep(.q-icon) {
  color: #b3b3b3;
}

/* Dark mode empty states */
.body--dark .empty-icon {
  color: #666666;
}

.body--dark .empty-text {
  color: #b3b3b3;
}

/* Dark mode skeletons */
.body--dark .skeleton-table-header {
  background-color: #2a2a2a;
  border: 1px solid #333333;
}

.body--dark .skeleton-table-row {
  background-color: #1e1e1e;
  border-left: 1px solid #333333;
  border-right: 1px solid #333333;
  border-bottom: 1px solid #333333;
}

.body--dark :deep(.q-skeleton--type-text) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.body--dark :deep(.q-skeleton--type-QAvatar) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.body--dark :deep(.q-skeleton--type-QBtn) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.body--dark :deep(.q-skeleton--type-QBadge) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* ===== SKELETON ANIMATION ===== */
:deep(.q-skeleton) {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .kpi-value {
    font-size: 1.4rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .empty-state {
    min-height: 100px;
    padding: 1.5rem 1rem;
  }

  .skeleton-table-header,
  .skeleton-table-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>
