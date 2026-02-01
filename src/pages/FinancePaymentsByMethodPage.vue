<template>
  <q-page class="finance-page">
    <!-- Header Cockpit Area -->
    <div class="header-cockpit section-fade-in">
      <div class="cockpit-glow"></div>
      <div class="row items-center justify-between no-wrap">
        <div class="cockpit-welcome">
          <div class="greeting-row">
            <q-icon name="history" color="primary" size="32px" class="q-mr-sm" />
            <span class="text-subtitle1 text-weight-bolder">Historial de Arqueos y Balance</span>
          </div>
        </div>

        <div class="cockpit-meta">
          <div class="date-chip-modern text-uppercase">
            <q-icon name="event" size="14px" class="q-mr-xs" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Filters Bento -->
    <div class="bento-grid q-mb-md">
      <div class="bento-item span-full filters-bento">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-auto">
            <q-input
              v-model="dateFrom"
              type="date"
              dense
              outlined
              label="Desde"
              class="filter-input"
              @update:model-value="loadAllData"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-input
              v-model="dateTo"
              type="date"
              dense
              outlined
              label="Hasta"
              class="filter-input"
              @update:model-value="loadAllData"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-select
              v-model="selectedMainCashbox"
              :options="mainCashboxes"
              option-label="name"
              option-value="id"
              label="Filtrar por Caja Principal"
              dense
              outlined
              emit-value
              map-options
              clearable
              style="min-width: 220px"
              @update:model-value="loadAllData"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance" />
              </template>
            </q-select>
          </div>
          <q-space />
          <div class="col-auto">
            <q-btn
              flat
              dense
              round
              icon="refresh"
              color="primary"
              @click="loadAllData"
              :loading="loading"
            >
              <q-tooltip>Sincronizar todo</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Two Columns -->
    <div class="two-column-layout">
      <!-- Left Column: Global Withdrawals List -->
      <q-card class="left-column bento-item no-border q-pa-none">
        <div class="column-header-modern">
          <div class="row items-center justify-between full-width">
            <div class="text-subtitle2 text-weight-bolder">LISTA DE ARQUEOS</div>
            <q-badge color="primary" rounded :label="globalWithdrawals.length" />
          </div>
        </div>

        <q-separator />

        <q-scroll-area style="height: calc(100vh - 260px);">
          <div v-if="loadingHistory" class="flex flex-center q-pa-xs">
            <q-spinner-ios color="primary" size="40px" />
          </div>

          <q-list v-else separator padding>
            <q-item
              v-for="gw in globalWithdrawals"
              :key="gw.id"
              clickable
              :active="selectedGlobalWithdrawal?.id === gw.id"
              class="history-item"
              active-class="history-item--active"
              @click="selectGlobalWithdrawal(gw)"
            >
              <q-item-section avatar>
                <q-avatar size="40px" :color="selectedGlobalWithdrawal?.id === gw.id ? 'white' : 'blue-5'" :text-color="selectedGlobalWithdrawal?.id === gw.id ? 'primary' : 'white'">
                  <q-icon name="receipt" size="20px" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">Arqueo #{{ gw.id }}</q-item-label>
                <q-item-label caption :class="selectedGlobalWithdrawal?.id === gw.id ? 'text-white' : ''">
                  {{ formatDate(gw.date_from) }} • {{ formatTime(gw.created_at) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-right">
                  <div class="row items-center justify-end q-gutter-x-xs no-wrap q-mb-xs">
                    <q-icon name="account_balance_wallet" size="14px" :color="selectedGlobalWithdrawal?.id === gw.id ? 'white' : 'grey-7'" />
                    <span class="text-caption" :class="selectedGlobalWithdrawal?.id === gw.id ? 'text-white' : 'text-grey-7'">
                      {{ gw.cashflows_count || 0 }} arqueos
                    </span>
                  </div>
                  <div class="text-weight-bold" :class="selectedGlobalWithdrawal?.id === gw.id ? 'text-white' : 'text-primary'">
                    {{ formatMoney(gw.total_counted) }}
                  </div>
                  <q-badge
                    :color="gw.difference >= 0 ? 'positive' : 'negative'"
                    size="xs"
                    :label="formatMoney(gw.difference)"
                  />
                </div>
              </q-item-section>
            </q-item>

            <div v-if="globalWithdrawals.length === 0" class="flex flex-center q-pa-xl text-grey opacity-60">
              <q-icon name="inbox" size="48px" />
              <div class="full-width text-center">Sin arqueos en este período</div>
            </div>
          </q-list>
        </q-scroll-area>
      </q-card>

      <!-- Right Column: Detail Area -->
      <q-card class="right-column bento-item no-border q-pa-none">
        <div class="column-header-modern">
          <div class="row items-center justify-between full-width">
            <div class="text-subtitle2 text-weight-bolder">DETALLE DEL CONTEO</div>
            <q-btn v-if="selectedGlobalWithdrawal" flat round dense icon="print" color="white" size="sm" />
          </div>
        </div>

        <q-separator />

        <!-- Empty State for Detail -->
        <div v-if="!selectedGlobalWithdrawal" class="empty-detail flex flex-center">
          <div class="text-center opacity-40">
            <q-icon name="mouse" size="64px" />
            <div class="text-h6 q-mt-md">Selecciona un arqueo</div>
            <div class="text-caption">Haz clic en un arqueo de la izquierda para ver su detalle</div>
          </div>
        </div>

        <!-- Detail Listing -->
        <q-scroll-area v-else style="height: calc(100vh - 260px);">
          <div v-if="loadingCounts" class="flex flex-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <div v-else class="q-pa-md">
            <!-- Summary of the specific Global Withdrawal -->
            <div class="detail-summary-grid q-mb-lg">
              <div class="detail-stat">
                <div class="label">Ventas en Periodo</div>
                <div class="value">{{ formatMoney(globalWithdrawalDetails?.total_sales) }}</div>
              </div>
              <div class="detail-stat">
                <div class="label">Total Esperado</div>
                <div class="value">{{ formatMoney(globalWithdrawalDetails?.total_expected) }}</div>
              </div>
              <div class="detail-stat highlight">
                <div class="label">Total Contado</div>
                <div class="value text-positive">{{ formatMoney(globalWithdrawalDetails?.total_counted) }}</div>
              </div>
            </div>

            <!-- Detalle por Caja (Asociados al Arqueo Global) -->
            <div class="detail-section-title q-mb-md">
              <q-icon name="list_alt" size="20px" class="q-mr-sm" />
              ARQUEOS ASOCIADOS EN ESTE REGISTRO
            </div>

            <div v-if="cashboxesCounts?.length" class="q-gutter-y-sm">
              <q-expansion-item
                v-for="cashbox in cashboxesCounts"
                :key="cashbox.cashbox_id"
                header-class="cashbox-expansion-header"
                class="cashbox-expansion-card overflow-hidden bento-item q-pa-none"
                default-opened
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="38px">
                      <q-icon name="account_balance" size="20px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ cashbox.cashbox_name }}</q-item-label>
                    <q-item-label caption>{{ cashbox.withdrawals?.length || 0 }} arqueos contados</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-right">
                      <div class="text-subtitle2 text-weight-bold">{{ formatMoney(cashbox.total_counted) }}</div>
                      <q-badge
                        :color="cashbox.total_difference >= 0 ? 'positive' : 'negative'"
                        :label="(cashbox.total_difference >= 0 ? '+' : '') + formatMoney(cashbox.total_difference)"
                        class="diff-badge"
                      />
                    </div>
                  </q-item-section>
                </template>

                <q-card flat class="inner-withdrawal-list">
                  <q-list separator>
                    <q-item class="q-pa-none" v-for="w in cashbox.withdrawals" :key="w.id">
                      <q-item-section avatar>
                        <q-avatar
                          :color="getPMColor(w.payment_method_id)"
                          text-color="white"
                          size="32px"
                        >
                          <q-icon :name="getPMIcon(w.payment_method_name)" size="16px" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ w.payment_method_name }}</q-item-label>
                        <q-item-label caption lines="1">
                          📅 {{ w.date }}  |  🕒 {{ w.time }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-7">
                          👤 {{ w.user_name }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="column items-end">
                          <div class="text-caption text-grey-6">Esperado: {{ formatMoney(w.expected_amount) }}</div>
                          <div class="text-subtitle2 text-weight-bold text-orange">Contado: {{ formatMoney(w.counted_amount) }}</div>
                          <q-badge
                            :color="w.difference >= 0 ? 'positive' : 'negative'"
                            :label="(w.difference >= 0 ? '+' : '') + formatMoney(w.difference)"
                            rounded
                            class="q-mt-xs"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </q-expansion-item>
            </div>

            <!-- Empty Detailed List -->
            <div v-else class="flex flex-center q-pa-xl opacity-40">
              <q-icon name="list" size="48px" />
              <div class="full-width text-center">No hay desgloses para este arqueo</div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { formatDate } from 'src/const/mixins'

const $q = useQuasar()

// --- State ---
const loading = ref(false)
const loadingHistory = ref(false)
const loadingCounts = ref(false)

const dateFrom = ref('')
const dateTo = ref('')
const selectedMainCashbox = ref(null)

const branches = ref([])
const mainCashboxes = ref([])

// Balance Summary
const summary = ref({
  total_sales: 0,
  total_cash_in: 0,
  total_cash_out: 0,
  total_theoretical: 0,
  total_counted_withdrawals: 0,
  difference: 0
})

// History State
const globalWithdrawals = ref([])
const selectedGlobalWithdrawal = ref(null)
const globalWithdrawalDetails = ref(null)
const cashboxesCounts = ref([])

// --- Computeds ---
const currentDate = computed(() => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('es-ES', options)
})

// --- Methods ---

/**
 * Loads all contextual data (Balance + Arqueos List)
 */
const loadAllData = async () => {
  loading.value = true
  loadingHistory.value = true
  try {
    const params = {
      from: dateFrom.value,
      to: dateTo.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
      cashbox_id: selectedMainCashbox.value
    }

    // 1. Load Balance Report (Theoretical and Expenses)
    const balanceRes = await api.get('/reports/cashbox-balance-report', { params })
    const bData = balanceRes.data

    // 2. Load Global Withdrawals List
    const historyRes = await api.get('/reports/global-withdrawals', { params })
    globalWithdrawals.value = historyRes.data.data || []

    const hSummary = historyRes.data.summary || {}

    // 3. Sync Summary
    summary.value = bData.summary || {}
    summary.value.total_counted_withdrawals = parseFloat(hSummary.total_counted || 0)
    summary.value.difference = summary.value.total_counted_withdrawals - (summary.value.total_theoretical - (summary.value.total_cash_out || 0))

    // Reset details if no longer in list
    if (selectedGlobalWithdrawal.value && !globalWithdrawals.value.find(g => g.id === selectedGlobalWithdrawal.value.id)) {
      selectedGlobalWithdrawal.value = null
    }
  } catch (error) {
    console.error('Error loadAllData:', error)
    $q.notify({ type: 'negative', message: 'Error cargando datos financieros' })
  } finally {
    loading.value = false
    loadingHistory.value = false
  }
}

/**
 * Select and load specific counts for an arqueo
 */
const selectGlobalWithdrawal = async (gw) => {
  selectedGlobalWithdrawal.value = gw
  loadingCounts.value = true
  try {
    const { data } = await api.get(`/reports/global-withdrawals/${gw.id}/counts`)
    globalWithdrawalDetails.value = data.global_withdrawal
    cashboxesCounts.value = data.cashboxes || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar detalle del conteo' })
  } finally {
    loadingCounts.value = false
  }
}

const loadMainCashboxes = async () => {
  try {
    const { data } = await api.get('cashboxes', { params: { dataEqualFilter: { is_main: 1 } } })
    mainCashboxes.value = data
  } catch (err) {}
}

const loadBranches = async () => {
  try {
    const { data } = await api.get('branch-offices')
    branches.value = data
  } catch (err) {}
}

const setDefaultDates = () => {
  const now = new Date()
  dateFrom.value = now.toISOString().split('T')[0]
  dateTo.value = now.toISOString().split('T')[0]
}

// --- Formatters ---
const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0)
const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''

const getPMColor = (id) => ['primary', 'positive', 'orange', 'cyan', 'purple', 'teal'][id % 6]
const getPMIcon = (name) => {
  const n = (name || '').toLowerCase()
  if (n.includes('efectivo')) return 'payments'
  if (n.includes('tarjeta')) return 'credit_card'
  if (n.includes('transf')) return 'swap_horiz'
  return 'payment'
}

onMounted(() => {
  setDefaultDates()
  loadBranches()
  loadMainCashboxes()
  loadAllData()
})
</script>

<style scoped>
.finance-page {
  padding: 0px;
  width: 1400px;
  max-width: 95vw;
  margin: 0 auto;
  font-family: 'Outfit', sans-serif;
}

/* Header */
.header-cockpit {
  padding: 10px 16px;
  position: relative;
}

.cockpit-glow {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(var(--q-primary-rgb), 0.1) 0%, transparent 70%);
}

.date-chip-modern {
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

body.body--dark .date-chip-modern {
  background: #1e293b;
  border-color: #334155;
}

/* Bento & Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0 16px;
}

@media (max-width: 1024px) { .bento-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .bento-grid { grid-template-columns: 1fr; } }

.bento-item {
  background: white;
  border-radius: 16px;
  padding: 7px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

body.body--dark .bento-item { background: #1e293b; border-color: #334155; }

.span-full { grid-column: 1 / -1; }

/* Stats Tiles */
.stat-hero { display: flex; align-items: center; gap: 16px; }
.stat-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.bg-soft-primary { background: rgba(var(--q-primary-rgb), 0.1); }
.bg-soft-info { background: rgba(var(--q-info-rgb), 0.1); }
.bg-soft-negative { background: rgba(var(--q-negative-rgb), 0.1); }
.bg-soft-positive { background: rgba(var(--q-positive-rgb), 0.1); }

.stat-val { font-size: 20px; font-weight: 800; }
.stat-lab { font-size: 11px; font-weight: 600; color: #64748b; }

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
  padding: 0 16px;
}

@media (max-width: 900px) { .two-column-layout { grid-template-columns: 1fr; } }

.column-header-modern {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 16px 16px 0 0;
}

.history-item { border-radius: 8px; margin: 4px 8px; transition: all 0.2s; }
.history-item--active { background: var(--q-primary); color: white; transform: translateX(4px); }

.empty-detail { height: 400px; }

/* Detail Specifics */
.detail-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-stat {
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}
body.body--dark .detail-stat { background: #0f172a; }

.detail-stat.highlight { background: rgba(var(--q-positive-rgb), 0.05); }
.detail-stat .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.detail-stat .value { font-size: 16px; font-weight: 900; }

.cashbox-group { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
body.body--dark .cashbox-group { border-color: #334155; }

.cashbox-header-item { background: white; }
body.body--dark .cashbox-header-item { background: #1e293b; }

.counts-inner-card { border: none !important; }
</style>
