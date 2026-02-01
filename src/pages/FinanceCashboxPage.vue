<template>
  <q-page class="finance-cashbox-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="history" size="48px" class="header-icon" />
          <div>
            <h1 class="page-title">Historial de Arqueos Globales</h1>
            <p class="page-subtitle">Consulta de arqueos contados por caja</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <q-card class="filters-card q-mb-md">
      <q-card-section>
        <div class="filters-grid">
          <q-input
            v-model="dateFrom"
            type="date"
            label="Desde"
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-input
            v-model="dateTo"
            type="date"
            label="Hasta"
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
          </q-input>

          <q-btn
            unelevated
            color="primary"
            label="Buscar"
            icon="search"
            @click="loadGlobalWithdrawals"
            :loading="loading"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Two Column Layout -->
    <div class="two-column-layout">
      <!-- Left Column: Global Withdrawals List (Compact) -->
      <q-card class="left-column">
        <q-card-section class="column-header">
          <div class="column-title">
            <q-icon name="receipt_long" class="q-mr-xs" />
            <span>Arqueos Globales</span>
          </div>
          <q-badge :label="`${globalWithdrawals.length}`" color="white" text-color="primary" />
        </q-card-section>

        <q-separator />

        <q-scroll-area style="height: calc(100vh - 320px);">
          <q-list separator dense>
            <q-item
              v-for="gw in globalWithdrawals"
              :key="gw.id"
              clickable
              :active="selectedGlobalWithdrawal?.id === gw.id"
              active-class="bg-primary text-white"
              @click="selectGlobalWithdrawal(gw)"
              class="global-withdrawal-item"
            >
              <q-item-section avatar>
                <q-avatar size="36px" :color="selectedGlobalWithdrawal?.id === gw.id ? 'white' : 'primary'" :text-color="selectedGlobalWithdrawal?.id === gw.id ? 'primary' : 'white'">
                  <q-icon name="receipt" size="20px" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold" style="font-size: 13px;">
                  Arqueo #{{ gw.id }}
                </q-item-label>
                <q-item-label caption :class="selectedGlobalWithdrawal?.id === gw.id ? 'text-white' : ''" style="font-size: 11px;">
                  {{ formatDate(gw.date_from) }}
                </q-item-label>
                <q-item-label caption :class="selectedGlobalWithdrawal?.id === gw.id ? 'text-white' : ''" style="font-size: 10px;">
                  {{ formatDateTime(gw.created_at) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side class="text-right">
                <q-item-label class="text-weight-bold" style="font-size: 13px;">
                  {{ formatCurrency(gw.total_counted) }}
                </q-item-label>
                <q-item-label caption>
                  <q-badge
                    :color="getDifferenceColor(gw.difference)"
                    :label="formatCurrency(gw.difference)"
                    style="font-size: 10px;"
                  />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="globalWithdrawals.length === 0 && !loading">
              <q-item-section class="text-center text-grey-6">
                <q-icon name="inbox" size="48px" class="q-mb-md" />
                <div>No hay arqueos globales</div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="loading" class="text-center q-pa-lg">
            <q-spinner-dots size="50px" color="primary" />
          </div>
        </q-scroll-area>
      </q-card>

      <!-- Right Column: Counted Withdrawals Details -->
      <q-card class="right-column">
        <q-card-section class="column-header">
          <div class="column-title">
            <q-icon name="fact_check" class="q-mr-xs" />
            <span>Arqueos Contados por Caja</span>
          </div>
          <q-btn
            v-if="selectedGlobalWithdrawal"
            flat
            dense
            round
            icon="refresh"
            color="white"
            @click="loadCounts"
            :loading="loadingCounts"
          >
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator />

        <!-- Empty State -->
        <div v-if="!selectedGlobalWithdrawal" class="empty-state">
          <q-icon name="touch_app" size="64px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">Selecciona un arqueo global</div>
          <div class="text-caption text-grey-5">Haz clic en un arqueo de la lista para ver los detalles</div>
        </div>

        <!-- Global Withdrawal Summary -->
        <div v-else-if="globalWithdrawalDetails" class="details-content">
          <q-card-section>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Esperado</div>
                <div class="summary-value text-info">{{ formatCurrency(globalWithdrawalDetails.total_expected) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Contado</div>
                <div class="summary-value text-positive">{{ formatCurrency(globalWithdrawalDetails.total_counted) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Diferencia</div>
                <div class="summary-value" :class="getDifferenceTextClass(globalWithdrawalDetails.difference)">
                  {{ formatCurrency(globalWithdrawalDetails.difference) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Cashboxes with Withdrawals -->
          <q-scroll-area style="height: calc(100vh - 480px);">
            <q-expansion-item
              v-for="cashbox in cashboxes"
              :key="cashbox.cashbox_id"
              :label="cashbox.cashbox_name"
              :caption="`${cashbox.withdrawals.length} arqueos`"
              expand-separator
              default-opened
              class="cashbox-expansion"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar color="blue-grey-7" text-color="white" size="40px">
                    <q-icon name="account_balance" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ cashbox.cashbox_name }}</q-item-label>
                  <q-item-label caption>{{ cashbox.withdrawals.length }} arqueos</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-right">
                    <div class="text-weight-bold">{{ formatCurrency(cashbox.total_counted) }}</div>
                    <q-badge
                      :color="getDifferenceColor(cashbox.total_difference)"
                      :label="formatCurrency(cashbox.total_difference)"
                    />
                  </div>
                </q-item-section>
              </template>

              <q-card flat bordered>
                <q-list separator>
                  <q-item v-for="withdrawal in cashbox.withdrawals" :key="withdrawal.id" dense>
                    <q-item-section avatar>
                      <q-avatar size="32px" :color="getPaymentMethodColor(withdrawal.payment_method_id)" text-color="white">
                        <q-icon name="payment" size="18px" />
                      </q-avatar>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ withdrawal.payment_method_name }}
                      </q-item-label>
                      <q-item-label caption>
                        <div class="row q-gutter-xs items-center">
                          <q-icon name="event" size="14px" />
                          <span>{{ withdrawal.date }}</span>
                          <q-icon name="schedule" size="14px" class="q-ml-xs" />
                          <span>{{ withdrawal.time }}</span>
                        </div>
                      </q-item-label>
                      <q-item-label caption>
                        <span class="text-grey-8">👤 {{ withdrawal.user_name }}</span>
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side class="text-right">
                      <q-item-label class="text-weight-bold">
                        {{ formatCurrency(withdrawal.counted_amount) }}
                      </q-item-label>
                      <q-item-label caption>
                        <span class="text-grey-7">Esperado: {{ formatCurrency(withdrawal.expected_amount) }}</span>
                      </q-item-label>
                      <q-item-label caption>
                        <q-badge
                          :color="getDifferenceColor(withdrawal.difference)"
                          :label="formatCurrency(withdrawal.difference)"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-expansion-item>

            <div v-if="loadingCounts" class="text-center q-pa-lg">
              <q-spinner-dots size="50px" color="primary" />
            </div>
          </q-scroll-area>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

/**
 * Quasar instance
 * @type {import('quasar').QVueGlobals}
 */
const $q = useQuasar()

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
 * Loading state
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Loading counts state
 * @type {import('vue').Ref<boolean>}
 */
const loadingCounts = ref(false)

/**
 * Global withdrawals list
 * @type {import('vue').Ref<Array>}
 */
const globalWithdrawals = ref([])

/**
 * Selected global withdrawal
 * @type {import('vue').Ref<Object|null>}
 */
const selectedGlobalWithdrawal = ref(null)

/**
 * Global withdrawal details
 * @type {import('vue').Ref<Object|null>}
 */
const globalWithdrawalDetails = ref(null)

/**
 * Cashboxes with withdrawals
 * @type {import('vue').Ref<Array>}
 */
const cashboxes = ref([])

/**
 * Set default dates
 * @returns {void}
 */
const setDefaultDates = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  dateFrom.value = firstDay.toISOString().split('T')[0]
  dateTo.value = lastDay.toISOString().split('T')[0]
}

/**
 * Load global withdrawals
 * @async
 * @returns {Promise<void>}
 */
const loadGlobalWithdrawals = async () => {
  loading.value = true
  try {
    const params = {
      date_from: dateFrom.value,
      date_to: dateTo.value
    }

    const { data } = await api.get('/reports/global-withdrawals', { params })
    globalWithdrawals.value = data.data || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar arqueos globales',
      caption: error.message
    })
  } finally {
    loading.value = false
  }
}

/**
 * Select global withdrawal
 * @param {Object} gw - Global withdrawal object
 * @returns {void}
 */
const selectGlobalWithdrawal = (gw) => {
  selectedGlobalWithdrawal.value = gw
  loadCounts()
}

/**
 * Load counts for selected global withdrawal
 * @async
 * @returns {Promise<void>}
 */
const loadCounts = async () => {
  if (!selectedGlobalWithdrawal.value) return

  loadingCounts.value = true
  try {
    const { data } = await api.get(`/reports/global-withdrawals/${selectedGlobalWithdrawal.value.id}/counts`)
    globalWithdrawalDetails.value = data.global_withdrawal
    cashboxes.value = data.cashboxes || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalles',
      caption: error.message
    })
  } finally {
    loadingCounts.value = false
  }
}

/**
 * Get difference color
 * @param {number} difference - Difference amount
 * @returns {string}
 */
const getDifferenceColor = (difference) => {
  if (difference > 0) return 'positive'
  if (difference < 0) return 'negative'
  return 'grey'
}

/**
 * Get difference text class
 * @param {number} difference - Difference amount
 * @returns {string}
 */
const getDifferenceTextClass = (difference) => {
  if (difference > 0) return 'text-positive'
  if (difference < 0) return 'text-negative'
  return 'text-grey-7'
}

/**
 * Get payment method color
 * @param {number} id - Payment method ID
 * @returns {string}
 */
const getPaymentMethodColor = (id) => {
  const colors = ['primary', 'positive', 'orange', 'cyan', 'purple', 'teal', 'pink', 'indigo']
  return colors[id % colors.length]
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount || 0)
}

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string}
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

/**
 * Format date time
 * @param {string} dateString - Date string
 * @returns {string}
 */
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  setDefaultDates()
  loadGlobalWithdrawals()
})
</script>

<style scoped>
.finance-cashbox-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: var(--q-primary);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: var(--q-dark);
}

.body--dark .page-title {
  color: #f1f5f9;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
}

/* Filters */
.filters-card {
  border-radius: 12px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
  height: calc(100vh - 280px);
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-column {
    max-height: 400px;
  }
}

.left-column,
.right-column {
  border-radius: 12px;
  overflow: hidden;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--q-primary) 0%, #1976d2 100%);
  color: white;
  padding: 12px 16px;
}

.column-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
}

/* Global Withdrawal Item */
.global-withdrawal-item {
  transition: all 0.2s ease;
  padding: 8px 12px;
}

.global-withdrawal-item:hover {
  background: rgba(var(--q-primary-rgb), 0.05);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 400px);
  padding: 48px;
  text-align: center;
}

/* Details Content */
.details-content {
  height: 100%;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.body--dark .summary-item {
  background: #1e293b;
  border-color: #334155;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 22px;
  font-weight: 800;
}

/* Cashbox Expansion */
.cashbox-expansion {
  border-bottom: 1px solid #e2e8f0;
}

.body--dark .cashbox-expansion {
  border-bottom-color: #334155;
}

/* Responsive */
@media (max-width: 599px) {
  .finance-cashbox-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .summary-value {
    font-size: 18px;
  }
}
</style>
