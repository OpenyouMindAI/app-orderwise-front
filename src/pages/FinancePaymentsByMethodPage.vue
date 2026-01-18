<template>
  <q-page class="finance-page">
    <!-- Compact Header -->
    <div class="page-header q-mb-md">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h5 text-weight-bold">Resumen de Arqueos</div>
          <div class="text-caption text-grey-6">Totales consolidados por método de pago y caja</div>
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

    <!-- Compact Date Filter -->
    <q-card flat class="filter-card q-mb-md">
      <q-card-section class="q-pa-sm">
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
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasData" class="text-center q-py-xl">
      <q-icon name="summarize" size="64px" color="grey-4" />
      <div class="text-subtitle1 text-grey-6 q-mt-md">Sin datos</div>
      <div class="text-caption text-grey-5">No hay arqueos en el período seleccionado</div>
    </div>

    <template v-else>
      <!-- Global Cards -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6 col-sm-3">
          <q-card flat class="stat-card stat-card--ventas q-pa-none">
            <q-card-section class="q-pa-none flex">
              <div class="stat-icon">
                <q-icon name="trending_up" size="20px" />
              </div>
              <div class="column">
                <div class="stat-label">Total Ventas</div>
                <div class="stat-value">{{ formatCompact(summary.total_sales) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat class="stat-card stat-card--arqueos">
            <q-card-section class="q-pa-none flex">
              <div class="stat-icon">
                <q-icon name="receipt_long" size="20px" />
              </div>
              <div>
                <div class="stat-label">Total Arqueos</div>
                <div class="stat-value">{{ summary.total_count }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat class="stat-card stat-card--contado">
            <q-card-section class="q-pa-sm flex">
              <div class="stat-icon">
                <q-icon name="account_balance_wallet" size="20px" />
              </div>
              <div>
                <div class="stat-label">Total Contado</div>
                <div class="stat-value">{{ formatCompact(summary.total_counted) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6 col-sm-3">
          <q-card flat class="stat-card" :class="summary.total_difference >= 0 ? 'stat-card--ok' : 'stat-card--error'">
            <q-card-section class="q-pa-none flex">
              <div class="stat-icon">
                <q-icon name="compare_arrows" size="20px" />
              </div>
              <div>
                <div class="stat-label">Diferencia</div>
                <div class="stat-value">{{ formatNumber(summary.total_difference) }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="section-header q-mb-sm">
        <q-icon name="payment" size="18px" class="q-mr-xs" />
        <span>Por Método de Pago</span>
      </div>

      <div class="row q-col-gutter-sm q-mb-md">
        <div
          v-for="pm in paymentMethods"
          :key="pm.payment_method_id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card flat class="method-card">
            <q-card-section class="q-pa-sm">
              <div class="method-header">
                <q-avatar size="32px" :color="getColor(pm.payment_method_id)" text-color="white">
                  <q-icon :name="getIcon(pm.payment_method_name)" size="18px" />
                </q-avatar>
                <div class="method-title">
                  <div class="method-name">{{ pm.payment_method_name }}</div>
                  <div class="method-count">{{ pm.count }} arqueo(s)</div>
                </div>
              </div>
              <div class="method-amounts">
                <div class="amount-row">
                  <span>Esperado:</span>
                  <span class="text-blue text-weight-medium">{{ formatMoney(pm.total_expected) }}</span>
                </div>
                <div class="amount-row">
                  <span>Contado:</span>
                  <span class="text-positive text-weight-medium">{{ formatMoney(pm.total_counted) }}</span>
                </div>
                <div class="amount-row amount-row--diff">
                  <span>Diferencia:</span>
                  <span :class="pm.difference >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-bold">
                    {{ pm.difference >= 0 ? '+' : '' }}{{ formatMoney(pm.difference) }}
                  </span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Cashboxes -->
      <div class="section-header q-mb-sm">
        <q-icon name="account_balance" size="18px" class="q-mr-xs" />
        <span>Por Caja Destino</span>
      </div>

      <div class="row q-col-gutter-sm q-mb-md">
        <div
          v-for="cb in cashboxes"
          :key="cb.cashbox_id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card flat class="cashbox-card">
            <q-card-section class="q-pa-sm">
              <div class="cashbox-header">
                <q-avatar size="36px" color="deep-purple" text-color="white">
                  <q-icon name="savings" size="20px" />
                </q-avatar>
                <div class="cashbox-title">
                  <div class="cashbox-name">{{ cb.cashbox_name }}</div>
                  <div class="cashbox-methods">{{ cb.payment_methods.length }} método(s)</div>
                </div>
              </div>
              <div class="cashbox-total">
                <div class="total-label">Total a Depositar</div>
                <div class="total-value">{{ formatMoney(cb.total_to_deposit) }}</div>
              </div>
              <q-expansion-item
                dense
                dense-toggle
                label="Ver desglose"
                header-class="text-caption text-primary"
              >
                <div class="breakdown">
                  <div
                    v-for="method in cb.payment_methods"
                    :key="method.payment_method_id"
                    class="breakdown-row"
                  >
                    <span class="breakdown-method">{{ method.payment_method_name }}</span>
                    <span class="breakdown-amount text-positive">{{ formatMoney(method.total_counted) }}</span>
                  </div>
                </div>
              </q-expansion-item>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Recent Withdrawals List -->
      <div class="section-header q-mb-sm">
        <q-icon name="history" size="18px" class="q-mr-xs" />
        <span>Arqueos Recientes</span>
      </div>

      <q-card flat class="list-card">
        <q-list separator>
          <q-item
            v-for="gw in recent"
            :key="gw.id"
            dense
          >
            <q-item-section avatar>
              <q-avatar size="32px" color="primary" text-color="white">
                #{{ gw.id }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">
                {{ formatDateShort(gw.date_from) }} - {{ formatDateShort(gw.date_to) }}
              </q-item-label>
              <q-item-label caption>{{ gw.user?.name || 'Sin usuario' }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-weight-bold text-positive">
                {{ formatMoney(gw.total_counted) }}
              </q-item-label>
              <q-item-label caption>
                <q-badge
                  :color="gw.difference >= 0 ? 'positive' : 'negative'"
                  :label="(gw.difference >= 0 ? '+' : '') + formatCompact(gw.difference)"
                />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { formatNumber } from 'src/const/mixins'

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
 * Summary data
 * @type {import('vue').Ref<Object>}
 */
const summary = ref({
  total_count: 0,
  total_sales: 0,
  total_expected: 0,
  total_counted: 0,
  total_difference: 0
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
 * Recent withdrawals
 * @type {import('vue').Ref<Array>}
 */
const recent = ref([])

/**
 * Check if has data
 * @type {import('vue').ComputedRef<boolean>}
 */
const hasData = computed(() => summary.value.total_count > 0)

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
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value

    const { data } = await api.get('/reports/global-withdrawals/summary', { params })

    summary.value = data.general || {}
    paymentMethods.value = data.by_payment_method || []
    cashboxes.value = data.by_cashbox || []
    recent.value = data.recent || []
  } catch (error) {
    console.error('Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    loading.value = false
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

/**
 * Format compact
 * @param {number} amount - Amount
 * @returns {string}
 */
const formatCompact = (amount) => {
  const num = Math.abs(amount || 0)
  const sign = amount < 0 ? '-' : ''
  if (num >= 1000000) return `${sign}$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${sign}$${(num / 1000).toFixed(0)}K`
  return `${sign}$${num.toFixed(0)}`
}

/**
 * Format date short
 * @param {string} dateStr - Date string
 * @returns {string}
 */
const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

onMounted(() => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  dateFrom.value = firstDay.toISOString().split('T')[0]
  dateTo.value = lastDay.toISOString().split('T')[0]

  loadData()
})
</script>

<style scoped>
.finance-page {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  padding: 12px 0;
}

/* Filter Card */
.filter-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.body--dark .filter-card {
  background: #1e293b;
  border-color: #334155;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #475569;
}

.body--dark .section-header {
  color: #94a3b8;
}

/* Stat Cards */
.stat-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card--ventas {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0px;
}

.stat-card--arqueos {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0px;
}

.stat-card--contado {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0px;
}

.stat-card--ok {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0px;
}

.stat-card--error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0px;
}

.body--dark .stat-card {
  background: #1e293b;
  border-color: #334155;
}

.stat-icon {
  margin-bottom: 10px;
}

.stat-label {
  font-weight: 200;
}

.stat-value {
  font-weight: 700;
  color: white;
}

/* Method Card */
.method-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s;
}

.method-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.body--dark .method-card {
  background: #1e293b;
  border-color: #334155;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.method-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.method-count {
  font-size: 0.7rem;
  color: #64748b;
}

.method-amounts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.amount-row--diff {
  padding-top: 4px;
  border-top: 1px dashed #e2e8f0;
  margin-top: 2px;
}

.body--dark .amount-row--diff {
  border-color: #475569;
}

/* Cashbox Card */
.cashbox-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s;
}

.cashbox-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.body--dark .cashbox-card {
  background: #1e293b;
  border-color: #334155;
}

.cashbox-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.cashbox-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.cashbox-methods {
  font-size: 0.7rem;
  color: #64748b;
}

.cashbox-total {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  margin-bottom: 8px;
}

.body--dark .cashbox-total {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
}

.total-label {
  font-size: 0.7rem;
  color: #059669;
  margin-bottom: 2px;
}

.body--dark .total-label {
  color: #6ee7b7;
}

.total-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #047857;
}

.body--dark .total-value {
  color: #a7f3d0;
}

.breakdown {
  background: #f8fafc;
  border-radius: 6px;
  padding: 6px;
  margin-top: 6px;
}

.body--dark .breakdown {
  background: #334155;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.75rem;
}

.breakdown-method {
  color: #64748b;
}

.breakdown-amount {
  font-weight: 600;
}

/* List Card */
.list-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.body--dark .list-card {
  background: #1e293b;
  border-color: #334155;
}

/* Responsive */
@media (max-width: 599px) {
  .finance-page {
    padding: 12px;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .total-value {
    font-size: 1.2rem;
  }
}
</style>
