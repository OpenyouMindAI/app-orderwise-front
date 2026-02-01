<template>
  <q-page class="finance-page">
    <!-- Header Cockpit Area -->
    <div class="header-cockpit section-fade-in">
      <div class="cockpit-glow"></div>
      <div class="row items-center justify-between no-wrap">
        <div class="cockpit-welcome">
          <div class="greeting-row">
            <span class="text-h5 text-weight-bolder">Estado de Caja</span>
          </div>
          <div class="welcome-subtitle">
            <span class="text-caption opacity-60">Reporte en tiempo real de saldos por método de pago</span>
          </div>
        </div>

        <div class="cockpit-meta">
          <div class="date-chip-modern">
            <q-icon name="event" size="14px" class="q-mr-xs" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Bento -->
    <div class="bento-grid q-mb-md">
      <div class="bento-item span-full filters-bento">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-5 col-sm-auto">
            <q-input
              v-model="dateFrom"
              type="date"
              dense
              outlined
              label="Desde"
              @update:model-value="debouncedLoad"
            />
          </div>
          <div class="col-5 col-sm-auto">
            <q-input
              v-model="dateTo"
              type="date"
              dense
              outlined
              label="Hasta"
              @update:model-value="debouncedLoad"
            />
          </div>
          <q-space />
          <div class="col-12 col-sm-auto">
            <q-select
              v-model="selectedBranch"
              :options="branches"
              option-label="name"
              option-value="id"
              label="Sucursal"
              dense
              outlined
              emit-value
              map-options
              clearable
              style="min-width: 200px"
              @update:model-value="loadData"
            />
          </div>
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              icon="refresh"
              color="primary"
              @click="loadData"
              :loading="loading"
            >
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasData" class="empty-glitch flex flex-center q-py-xl">
      <div class="text-center opacity-40">
        <q-icon name="summarize" size="64px" class="q-mb-sm" />
        <div class="text-subtitle1">Sin datos</div>
        <div class="text-caption">No se encontraron movimientos en el período seleccionado</div>
      </div>
    </div>

    <template v-else>
      <!-- Global Stats -->
      <div class="bento-grid q-mb-md">
        <div class="bento-item stat-hero span-small-mobile span-1-desktop">
          <div class="stat-icon-wrap bg-soft-primary">
            <q-icon name="trending_up" size="28px" color="primary" />
          </div>
          <div class="stat-data">
            <div class="stat-val">{{ formatMoney(summary.total_sales) }}</div>
            <div class="stat-lab">Total Ventas</div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop">
          <div class="stat-icon-wrap bg-soft-positive">
            <q-icon name="account_balance_wallet" size="28px" color="positive" />
          </div>
          <div class="stat-data">
            <div class="stat-val text-positive">{{ formatMoney(summary.total_cash_in - summary.total_cash_out) }}</div>
            <div class="stat-lab">Flujo Neto (+/-)</div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop">
          <div class="stat-icon-wrap bg-soft-warning">
            <q-icon name="payments" size="28px" color="warning" />
          </div>
          <div class="stat-data">
            <div class="stat-val">{{ formatMoney(summary.total_withdrawals) }}</div>
            <div class="stat-lab">Retiros</div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop">
          <div class="stat-icon-wrap bg-soft-info">
            <q-icon name="savings" size="28px" color="info" />
          </div>
          <div class="stat-data">
            <div class="stat-val text-info">{{ formatMoney(summary.total_theoretical) }}</div>
            <div class="stat-lab">Total en Caja</div>
          </div>
        </div>
      </div>

      <!-- Payment Methods Section -->
      <div class="bento-item q-mb-md">
        <div class="bento-header">
          <q-icon name="payment" class="q-mr-xs" />
          <span>Desglose por Método de Pago</span>
        </div>

        <div class="payment-methods-grid">
          <div
            v-for="pm in paymentMethods"
            :key="pm.payment_method_id"
            class="payment-method-card"
          >
            <div class="method-header">
              <q-avatar size="44px" :color="getColor(pm.payment_method_id)" text-color="white" class="shadow-2">
                <q-icon :name="getIcon(pm.payment_method_name)" size="24px" />
              </q-avatar>
              <div class="method-title">
                <div class="method-name">{{ pm.payment_method_name }}</div>
                <div class="method-balance">{{ formatMoney(pm.total) }}</div>
              </div>
            </div>

            <div class="method-details">
              <div class="detail-row">
                <span class="detail-label">Ventas:</span>
                <span class="detail-value text-positive">+ {{ formatMoney(pm.sales) }}</span>
              </div>
              <div v-if="pm.init_cashbox > 0" class="detail-row">
                <span class="detail-label">Fondo Inicial:</span>
                <span class="detail-value">+ {{ formatMoney(pm.init_cashbox) }}</span>
              </div>
              <div v-if="pm.cash_in > 0" class="detail-row">
                <span class="detail-label">Entradas:</span>
                <span class="detail-value text-positive">+ {{ formatMoney(pm.cash_in) }}</span>
              </div>
              <div v-if="pm.cash_out > 0" class="detail-row">
                <span class="detail-label">Salidas:</span>
                <span class="detail-value text-negative">- {{ formatMoney(pm.cash_out) }}</span>
              </div>
              <div v-if="pm.withdrawal > 0" class="detail-row">
                <span class="detail-label">Retiros:</span>
                <span class="detail-value text-negative">- {{ formatMoney(pm.withdrawal) }}</span>
              </div>

              <q-separator class="q-my-sm" />

              <div class="detail-row detail-row--total">
                <span class="detail-label">Saldo Teórico:</span>
                <span class="detail-value" :class="pm.total >= 0 ? 'text-primary' : 'text-negative'">
                  {{ formatMoney(pm.total) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cashboxes Summary Section -->
      <div class="bento-item">
        <div class="bento-header">
          <q-icon name="point_of_sale" class="q-mr-xs" />
          <span>Saldo por Caja Física</span>
        </div>

        <div class="cashboxes-grid">
          <div
            v-for="cb in cashboxes"
            :key="cb.cashbox_id"
            class="cashbox-card"
          >
            <div class="cashbox-header">
              <q-avatar size="44px" color="blue-grey-7" text-color="white" class="shadow-2">
                <q-icon name="account_balance" size="24px" />
              </q-avatar>
              <div class="cashbox-title">
                <div class="cashbox-name">{{ cb.cashbox_name }}</div>
                <div class="cashbox-balance">{{ formatMoney(cb.total) }}</div>
              </div>
            </div>

            <div class="cashbox-details">
              <div class="detail-caption">Desglose de montos recibidos:</div>
              <div
                v-for="method in cb.methods"
                :key="method.name"
                class="detail-row"
              >
                <span class="detail-label">{{ method.name }}:</span>
                <span class="detail-value">{{ formatMoney(method.total) }}</span>
              </div>

              <q-separator class="q-my-sm" v-if="cb.methods && cb.methods.length > 0" />

              <div class="detail-row detail-row--total">
                <span class="detail-label">Total Neto Recibido:</span>
                <span class="detail-value text-primary">{{ formatMoney(cb.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

/**
 * Loading state
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Date from filter
 * @type {import('vue').Ref<string>}
 */
const dateFrom = ref('')

/**
 * Date to filter
 * @type {import('vue').Ref<string>}
 */
const dateTo = ref('')

/**
 * Selected Branch
 * @type {import('vue').Ref<number|null>}
 */
const selectedBranch = ref(null)

/**
 * Available branches
 * @type {import('vue').Ref<Array>}
 */
const branches = ref([])

/**
 * Summary data
 * @type {import('vue').Ref<Object>}
 */
const summary = ref({
  total_sales: 0,
  total_cash_in: 0,
  total_cash_out: 0,
  total_withdrawals: 0,
  total_theoretical: 0,
  total_init_cashbox: 0
})

/**
 * Payment methods data
 * @type {import('vue').Ref<Array>}
 */
const paymentMethods = ref([])

/**
 * Cashboxes data
 * @type {import('vue').Ref<Array>}
 */
const cashboxes = ref([])

/**
 * Check if has data
 * @type {import('vue').ComputedRef<boolean>}
 */
const hasData = computed(() => paymentMethods.value.length > 0 || cashboxes.value.length > 0)

/**
 * Get current date formatted
 * @type {import('vue').ComputedRef<string>}
 */
const currentDate = computed(() => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('es-ES', options)
})

/**
 * Timer for search debounce
 * @type {ReturnType<typeof setTimeout> | null}
 */
let debounceTimer = null

/**
 * Debounced load
 * @returns {void}
 */
const debouncedLoad = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadData, 300)
}

/**
 * Load data from API
 * @async
 * @returns {Promise<void>}
 */
const loadData = async () => {
  loading.value = true
  try {
    const params = {}
    if (dateFrom.value) params.from = dateFrom.value
    if (dateTo.value) params.to = dateTo.value
    if (selectedBranch.value) params.branch_office_id = selectedBranch.value

    const { data } = await api.get('/reports/cashbox-balance-report', { params })

    summary.value = data.summary || {}
    paymentMethods.value = data.by_payment_method || []
    cashboxes.value = data.by_cashbox || []
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos',
      caption: error.message || 'Error desconocido'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Load branches
 * @async
 * @returns {Promise<void>}
 */
const loadBranches = async () => {
  try {
    const { data } = await api.get('/branch-offices')
    branches.value = data
  } catch (error) {
    console.error('Error loading branches:', error)
  }
}

/**
 * Get color for payment method
 * @param {number} id - Payment method ID
 * @returns {string}
 */
const getColor = (id) => {
  const colors = ['primary', 'positive', 'orange', 'cyan', 'purple', 'teal', 'pink', 'indigo']
  return colors[id % colors.length]
}

/**
 * Get icon for payment method
 * @param {string} name - Payment method name
 * @returns {string}
 */
const getIcon = (name) => {
  const n = (name || '').toLowerCase()
  if (n.includes('efectivo')) return 'payments'
  if (n.includes('tarjeta') || n.includes('débito') || n.includes('crédito')) return 'credit_card'
  if (n.includes('transferencia')) return 'swap_horiz'
  if (n.includes('mercado') || n.includes('mp')) return 'account_balance_wallet'
  if (n.includes('qr')) return 'qr_code'
  return 'payment'
}

/**
 * Format money
 * @param {number} amount - Amount
 * @returns {string}
 */
const formatMoney = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount || 0)
}

onMounted(() => {
  const now = new Date()
  dateFrom.value = now.toISOString().split('T')[0]
  dateTo.value = now.toISOString().split('T')[0]

  loadBranches()
  loadData()
})
</script>

<style scoped>
/**
 * Finance Page Layout - Bento Grid System (matching HomePage)
 */
.finance-page {
  overflow-x: hidden;
  padding: 0px;
  padding-bottom: 96px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
}

@media (min-width: 1024px) {
  .finance-page {
    padding: 10px;
    padding-bottom: 48px;
  }
}

body.body--dark .finance-page {
  background: #0b0f1a;
}

/**
 * Header Cockpit
 */
.header-cockpit {
  padding: 24px 8px;
  margin-bottom: 8px;
  position: relative;
}

.cockpit-glow {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(var(--q-primary-rgb), 0.1) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

.welcome-subtitle {
  margin-top: 4px;
  font-weight: 500;
}

.date-chip-modern {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

body.body--dark .date-chip-modern {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

/**
 * Bento Grid Central
 */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.bento-item {
  background: white;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .bento-item {
  background: #161d2b;
  border: 1px solid rgba(255,255,255,0.03);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.bento-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
}

.span-full { grid-column: 1 / -1; }
.span-full-mobile { grid-column: 1 / -1; }
.span-small-mobile { grid-column: span 1; }

@media (min-width: 1024px) {
  .span-2-desktop { grid-column: span 2; }
  .span-1-desktop { grid-column: span 1; }
}

/**
 * Bento Header
 */
.bento-header {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

/**
 * Stats Tiles
 */
.stat-hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  min-height: auto;
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-hero:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(5deg);
}

.bg-soft-primary { background: rgba(var(--q-primary-rgb), 0.1); }
.bg-soft-positive { background: rgba(var(--q-positive-rgb), 0.1); }
.bg-soft-warning { background: rgba(var(--q-warning-rgb), 0.1); }
.bg-soft-info { background: rgba(var(--q-info-rgb), 0.1); }

.stat-val {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.stat-lab {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
}

/**
 * Filters Bento
 */
.filters-bento {
  padding: 12px 16px;
}

/**
 * Payment Methods Grid
 */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .payment-methods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .payment-methods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.payment-method-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .payment-method-card {
  background: #1e293b;
  border-color: #334155;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.method-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.method-title {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

body.body--dark .method-name {
  color: #f1f5f9;
}

.method-balance {
  font-size: 16px;
  font-weight: 900;
  color: var(--q-primary);
  margin-top: 2px;
}

.method-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/**
 * Cashboxes Grid
 */
.cashboxes-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .cashboxes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cashboxes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.cashbox-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .cashbox-card {
  background: #1e293b;
  border-color: #334155;
}

.cashbox-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.cashbox-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cashbox-title {
  flex: 1;
}

.cashbox-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

body.body--dark .cashbox-name {
  color: #f1f5f9;
}

.cashbox-balance {
  font-size: 16px;
  font-weight: 900;
  color: var(--q-primary);
  margin-top: 2px;
}

.cashbox-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-caption {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

/**
 * Detail Rows (universal)
 */
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.detail-row--total {
  font-weight: 800;
  font-size: 13px;
  margin-top: 4px;
}

.detail-label {
  color: #64748b;
  font-weight: 600;
}

.detail-value {
  font-weight: 700;
  color: #1e293b;
}

body.body--dark .detail-value {
  color: #f1f5f9;
}

/**
 * Empty glitch
 */
.empty-glitch {
  min-height: 200px;
}

/**
 * Utilities
 */
.opacity-60 { opacity: 0.6; }
.opacity-40 { opacity: 0.4; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

/**
 * Responsive
 */
@media (max-width: 599px) {
  .finance-page {
    padding: 16px;
  }

  .stat-val {
    font-size: 16px;
  }

  .header-cockpit {
    padding: 16px 8px;
  }
}
</style>
