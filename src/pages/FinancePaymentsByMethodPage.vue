<template>
  <q-page class="finance-page">
    <div class="header-cockpit section-fade-in q-pb-none">
      <div class="cockpit-glow"></div>
      <div class="row items-center justify-between no-wrap">
        <div class="cockpit-welcome">
          <div class="greeting-row">
            <q-icon name="history" color="primary" size="24px" class="q-mr-sm" />
            <span class="text-subtitle2 text-weight-bolder">Historial y Balance</span>
          </div>
        </div>

        <div class="cockpit-meta" v-if="!$q.screen.lt.sm">
          <div class="date-chip-modern text-uppercase">
            <q-icon name="event" size="14px" class="q-mr-xs" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Filters Bento -->
    <div class="bento-grid q-mb-md">
      <div class="bento-item span-full">
        <div class="row q-col-gutter-xs items-center">
          <div class="col-6 col-sm-auto">
            <q-input
              v-model="dateFrom"
              type="date"
              dense
              outlined
              label="Desde"
              class="filter-input"
            />
          </div>
          <div class="col-6 col-sm-auto">
            <q-input
              v-model="dateTo"
              type="date"
              dense
              outlined
              label="Hasta"
              class="filter-input"
            />
          </div>
          <div class="col-12 col-sm-auto row no-wrap items-center q-gutter-x-xs">
            <q-select
              v-model="selectedMainCashbox"
              :options="mainCashboxes"
              option-label="name"
              option-value="id"
              label="Caja"
              dense
              outlined
              emit-value
              map-options
              clearable
              class="col col-sm-auto"
              style="min-width: 150px"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance" size="20px" />
              </template>
            </q-select>
            <q-btn
              unelevated
              dense
              icon="search"
              color="primary"
              @click="loadAllData"
              :loading="loading"
              class="col-auto rounded-borders"
              style="width: 40px; height: 40px"
            >
              <q-tooltip>Buscar / Sincronizar</q-tooltip>
            </q-btn>
          </div>
          <q-space v-if="!$q.screen.lt.sm" />
          <div class="col-12 col-sm-auto q-mt-xs q-mt-sm-none">
            <q-btn
              unelevated
              color="negative"
              icon="add_circle"
              label="Registrar Gasto"
              @click="openExpenseModal"
              class="rounded-borders full-width"
              dense
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Two Columns -->
    <div class="two-column-layout">
      <q-card class="left-column bento-item no-border q-pa-none" v-if="!$q.screen.lt.sm || !selectedGlobalWithdrawal">
        <div class="column-header-modern">
          <div class="row items-center justify-between full-width">
            <div class="text-subtitle2 text-weight-bolder">LISTA DE ARQUEOS</div>
            <q-badge color="primary" rounded :label="globalWithdrawals.length" />
          </div>
        </div>

        <q-separator />

        <q-scroll-area :style="{ height: $q.screen.lt.sm ? 'calc(100vh - 350px)' : 'calc(100vh - 260px)' }">
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
      <div v-if="!$q.screen.lt.sm || selectedGlobalWithdrawal" class="column q-gutter-y-md col">
        <!-- Detail Listing -->
        <q-card class="right-column bento-item no-border q-pa-none">
          <div class="column-header-modern">
            <div class="row items-center justify-between full-width">
              <div class="row items-center q-gutter-x-sm">
                <q-btn v-if="$q.screen.lt.sm" flat round dense icon="arrow_back" color="white" @click="selectedGlobalWithdrawal = null" />
                <div class="text-subtitle2 text-weight-bolder">DETALLE DEL CONTEO</div>
              </div>
              <q-btn v-if="selectedGlobalWithdrawal" flat round dense icon="print" color="white" size="sm" />
            </div>
          </div>

          <q-separator />

          <!-- Empty State for Detail (Only desktop) -->
          <div v-if="!selectedGlobalWithdrawal && !$q.screen.lt.sm" class="empty-detail flex flex-center">
            <div class="text-center opacity-40">
              <q-icon name="mouse" size="64px" />
              <div class="text-h6 q-mt-md">Selecciona un arqueo</div>
              <div class="text-caption">Haz clic en un arqueo de la izquierda para ver su detalle</div>
            </div>
          </div>

          <!-- Detail Scroll Area -->
          <q-scroll-area v-if="selectedGlobalWithdrawal" :style="{ height: $q.screen.lt.sm ? 'calc(100vh - 550px)' : 'calc(100vh - 610px)', minHeight: '300px' }">
            <div v-if="loadingCounts" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="40px" />
            </div>

            <div v-else class="q-pa-md">
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
                  class="bento-item"
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
                        </q-item-section>
                        <q-item-section side>
                          <div class="column items-end">
                            <div class="text-subtitle2 text-weight-bold text-orange">{{ formatMoney(w.counted_amount) }}</div>
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

        <!-- Expenses List (New Bento Item) -->
        <q-card class="bento-item no-border q-pa-none overflow-hidden" v-if="!$q.screen.lt.sm || expenses.length > 0">
          <div class="column-header-modern bg-negative">
            <div class="row items-center justify-between full-width">
              <div class="text-subtitle2 text-weight-bolder">LISTA DE GASTOS</div>
              <q-badge color="white" text-color="negative" rounded :label="expenses.length" />
            </div>
          </div>

          <q-separator />

          <q-scroll-area :style="{ height: $q.screen.lt.sm ? '200px' : '300px' }">
            <div v-if="loadingExpenses" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="negative" size="40px" />
            </div>

            <q-list v-else separator padding>
              <q-item v-for="expense in expenses" :key="expense.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" size="42px">
                    <q-icon name="trending_down" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ expense.description?.replace('[expense] ', '') }}</q-item-label>
                  <q-item-label caption class="row items-center q-gutter-x-sm">
                    <span class="text-weight-medium text-grey-9">{{ expense.cashbox_name }}</span>
                    <span>•</span>
                    <span>{{ expense.date }}</span>
                  </q-item-label>
                  <q-item-label v-if="expense.notes" caption lines="1" class="text-italic q-mt-xs">
                    "{{ expense.notes }}"
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <div class="text-subtitle1 text-weight-bolder text-negative">{{ formatMoney(expense.amount) }}</div>
                    <q-btn v-if="expense.image" size="xs" color="grey-7" flat label="Ver adjunto" icon="image" dense />
                  </div>
                </q-item-section>
              </q-item>

              <div v-if="expenses.length === 0" class="flex flex-center q-pa-xl text-grey opacity-40">
                <q-icon name="money_off" size="48px" />
                <div class="full-width text-center">No hay gastos registrados</div>
              </div>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>
    </div>

    <!-- Expense Registration Modal -->
    <q-dialog v-model="showExpenseModal" persistent position="bottom" :maximized="$q.screen.lt.sm">
      <q-card class="expense-modal-card">
        <q-card-section class="q-py-md row items-center bg-negative text-white">
          <div class="text-h6 text-weight-bolder">REGISTRAR GASTO</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit="saveExpense">
          <q-card-section class="q-pa-md">
            <!-- Amount Input -->
            <div class="q-mb-xs">
              <q-input
                v-model.number="expenseForm.amount"
                type="number"
                outlined
                prefix="$"
                placeholder="0.00"
                class="amount-input-big"
                input-class="text-weight-black text-h4 text-center"
                :rules="[val => !!val && val > 0 || 'El monto debe ser mayor a 0']"
                autofocus
                dense
              />
            </div>

            <div class="row">
              <!-- Concept Selection -->
              <div class="col-12 col-sm-12">
                <q-select
                  v-model="expenseForm.concept"
                  :options="expenseConcepts"
                  outlined
                  dense
                  placeholder="Selecciona..."
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="label" size="20px" />
                  </template>
                </q-select>
              </div>

              <!-- Cashbox Selection -->
              <div class="col-12 col-sm-12">
                <q-select
                  v-model="expenseForm.cashbox_id"
                  :options="mainCashboxes"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  outlined
                  dense
                  :rules="[val => !!val || 'Requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_balance" size="20px" />
                  </template>
                </q-select>
              </div>

              <!-- Payment Method Selection -->
              <div class="col-12 col-sm-12">
                <q-select
                  v-model="expenseForm.payment_method_id"
                  :options="paymentMethods"
                  option-label="name"
                  option-value="id"
                  emit-value
                  map-options
                  outlined
                  dense
                  placeholder="Método de pago..."
                  :rules="[val => !!val || 'Requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon :name="getPMIcon(paymentMethods.find(pm => pm.id === expenseForm.payment_method_id)?.name)" size="20px" />
                  </template>
                </q-select>
              </div>
            </div>

            <!-- Image/Photo Button -->
            <div class="column q-gutter-y-xs">
              <div class="row q-col-gutter-sm items-center">
                <div class="col">
                  <q-btn
                    outline
                    color="primary"
                    icon="add_a_photo"
                    label="Subir Imagen / Foto"
                    class="full-width q-py-sm"
                    @click="openImagePicker"
                    rounded
                    dense
                  />
                  <!-- Hidden input for desktop fallback if needed -->
                  <input
                    type="file"
                    id="expense-image-file"
                    style="display: none"
                    accept="image/*"
                    @change="(e) => handleImageUpload(e.target.files[0])"
                  />
                </div>

                <div v-if="expenseForm.imageUrl" class="col-auto">
                  <q-avatar rounded size="60px" class="shadow-2 bordered">
                    <q-img :src="expenseForm.imageUrl">
                      <div class="absolute-top-right bg-transparent q-pa-xs">
                        <q-btn
                          round
                          dense
                          color="negative"
                          icon="close"
                          size="xs"
                          @click="expenseForm.imageUrl = null; expenseForm.image = null"
                        />
                      </div>
                    </q-img>
                  </q-avatar>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center" class="q-pb-lg">
            <q-btn
              label="GUARDAR GASTO"
              color="negative"
              icon="save"
              class="full-width"
              rounded
              unelevated
              type="submit"
              :loading="savingExpense"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { formatDate } from 'src/const/mixins'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const $q = useQuasar()

// --- State ---
const loading = ref(false)
const loadingHistory = ref(false)
const loadingCounts = ref(false)
const loadingExpenses = ref(false)

const dateFrom = ref('')
const dateTo = ref('')
const selectedMainCashbox = ref(null)

const branches = ref([])
const mainCashboxes = ref([])

// Expense State
const expenses = ref([])
const showExpenseModal = ref(false)
const savingExpense = ref(false)
const expenseForm = ref({
  amount: null,
  concept: null,
  cashbox_id: null,
  date: new Date().toISOString().split('T')[0],
  notes: '',
  payment_method_id: null,
  image: null,
  imageUrl: null
})

const paymentMethods = ref([])

const expenseConcepts = [
  'Sueldos',
  'Limpieza',
  'Insumos / Materia Prima',
  'Servicios (Luz, Agua, Gas, Internet)',
  'Impuestos / Tasas',
  'Alquiler',
  'Mantenimiento',
  'Gastos Varios'
]

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
 * Loads all contextual data (Balance + Arqueos List + Expenses)
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

    // 3. Load Expenses
    loadExpenses()

    // 4. Sync Summary
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
 * Loads expenses for the selected period and cashbox
 */
const loadExpenses = async () => {
  loadingExpenses.value = true
  try {
    const params = {
      date_from: dateFrom.value,
      date_to: dateTo.value,
      cashbox_id: selectedMainCashbox.value
    }
    const { data } = await api.get('cashboxes/main-expenses', { params })
    expenses.value = data || []
  } catch (error) {
    console.error('Error loading expenses:', error)
  } finally {
    loadingExpenses.value = false
  }
}

/**
 * Opens expense modal and resets form
 */
const openExpenseModal = () => {
  expenseForm.value = {
    amount: null,
    concept: null,
    cashbox_id: selectedMainCashbox.value || (mainCashboxes.value.length ? mainCashboxes.value[0].id : null),
    date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_method_id: null,
    image: null,
    imageUrl: null
  }

  // Pre-select "Efectivo"
  if (paymentMethods.value.length) {
    const cashMethod = paymentMethods.value.find(pm => pm.name.toLowerCase().includes('efectivo'))
    if (cashMethod) {
      expenseForm.value.payment_method_id = cashMethod.id
    } else {
      expenseForm.value.payment_method_id = paymentMethods.value[0].id
    }
  }

  showExpenseModal.value = true
}

/**
 * Handles image selection from file input
 */
const handleImageUpload = (file) => {
  if (file) {
    expenseForm.value.image = file
    expenseForm.value.imageUrl = URL.createObjectURL(file)
  }
}

/**
 * Open image picker with options (Camera or Gallery)
 */
const openImagePicker = () => {
  // En dispositivos móviles usamos el diálogo de Quasar para elegir fuente
  if ($q.platform.is.capacitor || $q.platform.is.nativeMobile) {
    $q.dialog({
      title: 'Agregar Comprobante',
      message: '¿Cómo deseas agregar la imagen?',
      options: {
        type: 'radio',
        model: 'camera',
        items: [
          { label: 'Tomar Foto', value: 'camera', icon: 'photo_camera' },
          { label: 'Seleccionar de Galería', value: 'gallery', icon: 'photo_library' }
        ]
      },
      cancel: true,
      persistent: true
    }).onOk(async (source) => {
      await captureImage(source)
    })
  } else {
    // En web usamos el input file escondido o el q-file
    document.getElementById('expense-image-file')?.click()
  }
}

/**
 * Captures image using Capacitor Camera
 */
const captureImage = async (source) => {
  try {
    const cameraSource = source === 'camera' ? CameraSource.Camera : CameraSource.Photos
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: cameraSource
    })

    if (image.dataUrl) {
      expenseForm.value.imageUrl = image.dataUrl

      // Convert DataURL to File object for FormData
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      expenseForm.value.image = new File([blob], `expense_${Date.now()}.${image.format}`, { type: blob.type })
    }
  } catch (error) {
    console.error('Error capturing image:', error)
  }
}

/**
 * Saves the expense record
 */
const saveExpense = async () => {
  savingExpense.value = true
  try {
    const formData = new FormData()
    formData.append('amount', expenseForm.value.amount)
    formData.append('description', `[expense] ${expenseForm.value.concept}`)
    formData.append('cashbox_id', expenseForm.value.cashbox_id)
    formData.append('payment_method_id', expenseForm.value.payment_method_id)
    formData.append('date', expenseForm.value.date)
    formData.append('notes', expenseForm.value.notes)
    formData.append('type', 'expense')

    if (expenseForm.value.image) {
      formData.append('image', expenseForm.value.image)
    }

    await api.post('cashboxes/main-expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    $q.notify({ type: 'positive', message: 'Gasto registrado correctamente', icon: 'check' })
    showExpenseModal.value = false
    loadAllData()
  } catch (error) {
    console.error('Error saving expense:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al registrar el gasto',
      caption: error.response?.data?.message || error.message
    })
  } finally {
    savingExpense.value = false
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

const loadPaymentMethods = async () => {
  try {
    const { data } = await api.get('payment-methods')
    paymentMethods.value = data
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
  loadPaymentMethods()
  loadAllData()
})
</script>

<style scoped>
.finance-page {
  padding: 0px;
  width: 100%;
  max-width: 1400px;
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
  padding: 5px;
  border: 1px solid rgba(0,0,0,0.05);
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
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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

/* Expense Modal Styles */
.expense-modal-card {
  border-radius: 24px 24px 0 0 !important;
  max-width: 600px !important;
  margin: 0 auto;
}

.amount-input-big :deep(input) {
  padding: 8px 0 !important;
  letter-spacing: -1px;
}

.detail-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 1px;
}
</style>
