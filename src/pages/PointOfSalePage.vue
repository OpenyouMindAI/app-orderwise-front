<template>
  <q-page class="flex items-center column bg-white" style="height: calc(100vh - 120px); overflow: hidden;">
    <div style="max-width: 600px;" class="full-height">
      <!-- Main View Transition Container -->
      <transition :name="transitionName" mode="out-in">
        <!-- Keypad View -->
        <div
          v-if="currentView === 'keypad'"
          key="keypad"
          class="keypad-view-container column full-width"
        >
          <div class="keypad-section q-pa-md flex column items-center justify-center col-12">
            <!-- Display Container -->
            <div class="display-container">
              <div class="display-text">{{ formattedValue }}</div>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="backspace"
                v-ripple
                @click="handleBackspace"
                class="backspace-btn"
              />
            </div>

            <!-- Numeric Keypad -->
            <div class="keypad q-mt-md">
              <q-btn
                v-for="n in keypadNumbers"
                :key="n"
                :label="n.toString()"
                round
                unelevated
                class="keypad-btn"
                v-ripple
                @click="handleDigitInput(n.toString())"
              />
              <q-btn
                label="00"
                round
                unelevated
                class="keypad-btn"
                v-ripple
                @click="handleDigitInput('00')"
              />
              <q-btn
                label="0"
                round
                unelevated
                class="keypad-btn"
                v-ripple
                @click="handleDigitInput('0')"
              />
              <q-btn
                v-if="canProceedFromKeypad"
                icon="send"
                round
                unelevated
                color="primary"
                class="keypad-btn send-btn"
                v-ripple
                @click="proceedToPaymentMethods"
              />
            </div>
          </div>
        </div>

        <!-- Payment Methods View -->
        <div
          v-else-if="currentView === 'payment-methods'"
          key="payment-methods"
          class="flex column items-center q-pa-lg mobile-payment-container"
        >
          <div class="payment-content flex-grow">
            <div class="text-h4 text-weight-bold q-mb-md text-center">
              {{ formattedValue }}
            </div>

            <!-- Payment Methods Section -->
            <div class="text-h6 q-mb-md text-center">Métodos de Pago</div>
            <div class="payment-methods-container payment-methods-grid q-mb-lg">
              <q-btn
                v-for="method in validPaymentMethods"
                :key="method.id"
                :label="method.name"
                unelevated
                rounded
                class="payment-btn button-style no-wrap"
                align="left"
                :class="[getPaymentMethodButtonClass(method)]"
                @click="selectPaymentMethod(method)"
              />
            </div>

            <!-- Invoice Types Section -->
            <div class="text-h6 q-mb-md text-center">Tipo de Factura</div>
            <div class="payment-methods-container">
              <q-btn
                v-for="invType in invoiceTypes"
                :key="invType.id"
                :label="getInvoiceTypeLabel(invType)"
                :icon="invType.icon"
                unelevated
                rounded
                align="left"
                class="payment-btn button-style q-mb-md no-wrap"
                :class="getInvoiceTypeButtonClass(invType)"
                @click="selectInvoiceType(invType)"
              />
            </div>
          </div>
        </div>

        <!-- Client Selection View -->
        <div
          v-else-if="currentView === 'client-selection'"
          key="client-selection"
        >
          <div class="payment-content flex q-pa-lg">
            <div class="text-h4 text-weight-bold q-mb-md text-center full-width">
              {{ formattedValue }}
            </div>
            <div class="text-h6 q-mb-md text-center full-width">
              Seleccionar Cliente
            </div>

            <div class="column full-width" style="max-height: 100%">
              <!-- Search Input -->
              <q-input
                v-model="clientSearch"
                placeholder="Buscar cliente..."
                outlined
                class="q-mb-md full-width"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <!-- Add New Client Button -->
              <q-btn
                label="Agregar Nuevo Cliente"
                icon="person_add"
                unelevated
                rounded
                class="full-width q-mb-md button-style"
                color="green-6"
                text-color="white"
                @click="toggleClientDialog(true)"
              />

              <!-- Client List -->
              <div class="client-list-container flex-grow full-width">
                <q-btn
                  v-for="client in filteredClients"
                  :key="client.id"
                  :label="`${client.name + (client.document_number ? ' - ' + client.document_number : '')}`"
                  unelevated
                  rounded
                  align="left"
                  class="client-btn q-mb-md button-style"
                  :class="getClientButtonClass(client)"
                  @click="selectClient(client)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice A/B Options View -->
        <div
          v-else-if="currentView === 'invoice-options'"
          key="invoice-options"
          class="flex column items-center q-pa-lg mobile-payment-container"
        >
          <div class="payment-content flex-grow">
            <div class="text-h4 text-weight-bold q-mb-md text-center">
              {{ formattedValue }}
            </div>
            <div class="text-h6 q-mb-md text-center">
              Factura A / B - Seleccionar Opción
            </div>

            <div class="invoice-options-container">
              <q-btn
                v-for="option in voucherTypes"
                :key="getVoucherTypeId(option)"
                unelevated
                rounded
                class="invoice-option-btn q-mb-md full-width button-style"
                :class="getInvoiceOptionButtonClass(option)"
                @click="selectInvoiceOption(option)"
              >
                <div class="row items-center no-wrap full-width text-left">
                  <q-icon :name="option.icon || 'description'" size="24px" class="q-mr-md" />
                  <span style="white-space: normal; line-height: 1.2;">{{ option.Desc }}</span>
                </div>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Payment Processing Views -->
        <component
          v-else-if="isPaymentView(currentView)"
          :is="'div'"
          class="payment-view-container column items-center justify-center q-pa-md"
          style="height: 100vh"
        >
          <q-icon :name="getPaymentViewIcon(currentView)" size="80px" color="primary" class="q-mb-md" />
          <div class="text-h5 q-mb-sm">{{ getPaymentViewTitle(currentView) }}</div>
          <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
          <q-spinner-dots
            v-if="shouldShowSpinner(currentView)"
            color="primary"
            size="40px"
            class="q-mt-md"
          />
        </component>

        <!-- Operation Completed View -->
        <div
          v-else-if="currentView === 'operation-completed'"
          key="completed"
          class="full-height flex column items-center justify-center q-pa-lg text-center"
        >
          <q-icon
            name="check_circle"
            color="positive"
            size="100px"
            class="q-mb-md"
          />
          <div class="text-h5 text-weight-bold q-mb-sm">¡Operación Completada!</div>

          <!-- Vista para Transferencia -->
          <div
            v-if="selectedPaymentMethod?.acronym === 'MPTR' && transferPaymentDetails"
            class="transfer-details q-mt-md"
          >
            <q-card flat bordered class="q-pa-md" style="max-width: 500px; border-radius: 10px !important;">
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle1 text-weight-bold text-primary">
                  Detalles de la Transferencia
                </div>
              </q-card-section>

              <q-separator />

              <q-list>
                <q-item v-for="(item, index) in transferDetailsList" :key="index">
                  <q-item-section class="text-left">
                    <q-item-label caption class="text-grey-7">{{ item.label }}</q-item-label>
                    <q-item-label class="text-weight-medium text-body1">
                      {{ item.value }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>

        <!-- Vista para otros métodos de pago -->
        <div v-else class="text-h5 q-mb-lg text-grey-8">
          {{ formattedValue }}
        </div>

          <q-btn
            label="Nueva Operación"
            color="primary"
            unelevated
            rounded
            class="button-style q-mt-lg"
            @click="resetToInitialState"
          />
        </div>
      </transition>

      <!-- Navigation Buttons -->
      <transition name="slide-up">
        <div v-if="shouldShowNavButtons" class="action-buttons-fixed">
          <q-btn
            label="Volver"
            flat
            icon="arrow_back"
            class="button-style"
            @click="goBack"
          />
          <q-btn
            :label="nextButtonLabel"
            color="primary"
            :icon-right="shouldShowArrow ? 'arrow_forward' : ''"
            :disable="isNextButtonDisabled"
            class="button-style"
            @click="handleNextAction"
          />
        </div>
      </transition>

      <!-- Add Client Dialog -->
      <q-dialog v-model="showAddClientDialog" :maximized="$q.screen.lt.sm">
        <q-card :style="$q.screen.lt.sm ? '' : 'width: 700px; max-width: 80vw;'">
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Agregar Nuevo Cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="row q-col-gutter-sm">
            <!-- Nombre -->
            <div class="col-12">
              <q-input
                v-model="newClient.name"
                label="Nombre completo *"
                outlined
                class="input-style"
              />
            </div>

            <!-- Email -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="newClient.email"
                label="Email *"
                type="email"
                outlined
                class="input-style"
              />
            </div>

            <!-- Teléfono -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="newClient.users.phone_number"
                label="Teléfono"
                outlined
                class="input-style"
              />
            </div>

            <!-- Tipo y Número de Documento -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="newClient.document_type"
                :options="documentTypes"
                label="Tipo Doc."
                option-label="Desc"
                option-value="id"
                outlined
                use-input
                input-debounce="0"
                @filter="getDocumentTypes"
                class="input-style"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="newClient.document_number"
                label="Nro. Documento"
                outlined
                class="input-style"
              />
            </div>

            <!-- Condición IVA -->
            <div class="col-12">
              <q-select
                v-model="newClient.condition_iva_receptor"
                :options="conditionIvaReceptors"
                label="Condición de IVA"
                option-label="name"
                option-value="code"
                outlined
                use-input
                input-debounce="0"
                @filter="getConditionIvaReceptor"
                class="input-style"
              />
            </div>

            <div class="col-12">
              <q-checkbox
                v-model="newClient.is_credit"
                label="¿Maneja cuenta corriente?"
                class="input-style"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary q-pa-md">
            <q-btn flat label="Cancelar" @click="toggleClientDialog(false)" />
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              :disable="!isNewClientValid"
              @click="addNewClient"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { api, apiArca } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { authentication } from 'src/stores/module-authentication'

// =============================================
// CONSTANTS & CONFIGURATION
// =============================================
const KEYPAD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const MAX_INPUT_LENGTH = 9

const PAYMENT_VIEW_CONFIG = {
  EFE: { icon: 'payments', title: 'Confirmar Pago', spinner: false },
  MPTR: { icon: 'sync_alt', title: 'Esperando Transferencia', spinner: true },
  DEB: { icon: 'credit_card', title: 'Procesando Débito', spinner: true },
  CRE: { icon: 'credit_card', title: 'Procesando Crédito', spinner: true },
  MPAQR: { icon: 'qr_code_2', title: 'Escanee el QR de Mercado Pago', spinner: true }
}

const INVOICE_TYPES_CONFIG = [
  { id: 1, name: 'Consumidor Final', icon: 'person' },
  { id: 2, name: 'Facturar a un Cliente', icon: 'people_alt' },
  { id: 3, name: 'Factura A / B', icon: 'receipt_long' }
]

// const INVOICE_OPTIONS_CONFIG = [
//   { id: 1, name: 'Opción 1 - Factura A', icon: 'receipt' },
//   { id: 2, name: 'Opción 2 - Factura B', icon: 'description' },
//   { id: 3, name: 'Opción 3 - Nota de Crédito', icon: 'note_add' }
// ]

// =============================================
// COMPOSABLES & STORES
// =============================================
const $q = useQuasar()
const authStore = authentication()
const instance = getCurrentInstance()
const echoPay = instance.appContext.config.globalProperties.$echoPay

// =============================================
// REACTIVE STATE
// =============================================

// UI State
const transitionName = ref('slide-forward')
const currentView = ref('keypad')
const showAddClientDialog = ref(false)

// Input State
const inputValue = ref('')

// Selection State
const selectedPaymentMethod = ref(null)
const selectedInvoiceType = ref(null)
const selectedClient = ref(null)
const selectedInvoiceOption = ref(null)

// Data State
const paymentMethods = ref([])
const validPaymentMethods = ref([]) // Solo métodos con acrónimo válido
const invoiceTypes = ref(INVOICE_TYPES_CONFIG)
const clients = ref([])
const documentTypes = ref([])
const conditionIvaReceptors = ref([])
const voucherTypes = ref([])

// Client Management State
const clientSearch = ref('')
const newClient = ref({
  name: '',
  email: '',
  phone_number: '',
  is_credit: false,
  document_type: null,
  document_number: '',
  condition_iva_receptor: null,
  users: {
    phone_number: ''
  }
})

// Transfer State
const isWaitingForTransfer = ref(false)
const transferTimeout = ref(null)
const transferPaymentDetails = ref(null)

const transferDetailsList = computed(() => {
  if (!transferPaymentDetails.value) return []

  const details = [
    { label: 'Monto', value: `$${transferPaymentDetails.value.transaction_amount}` },
    { label: 'Email del Pagador', value: transferPaymentDetails.value.payer.email },
    { label: 'ID del Comprador', value: transferPaymentDetails.value.payer.id },
    { label: 'Código de Identificación', value: transferPaymentDetails.value.id }
  ]

  return details.filter(item => item.value)
})

// =============================================
// COMPUTED PROPERTIES
// =============================================

// UI Computed
const formattedValue = computed(() => {
  if (!inputValue.value) return '$0.00'
  const number = parseInt(inputValue.value, 10) / 100
  return `$${number.toFixed(2)}`
})

const keypadNumbers = computed(() => KEYPAD_NUMBERS)
// const invoiceOptions = computed(() => INVOICE_OPTIONS_CONFIG)

// Navigation Computed
const canProceedFromKeypad = computed(() => inputValue.value.length > 0)

const shouldShowNavButtons = computed(() => {
  const paymentAcronyms = getPaymentMethodAcronyms()
  const viewsWithButtons = ['payment-methods', 'client-selection', 'invoice-options']
  return viewsWithButtons.includes(currentView.value) || paymentAcronyms.includes(currentView.value)
})

const nextButtonLabel = computed(() => {
  if (isWaitingForTransfer.value) return 'Procesando...'
  if (isPaymentView(currentView.value)) return 'Finalizar'
  return 'Siguiente'
})

const shouldShowArrow = computed(() => !isPaymentView(currentView.value))

const isNextButtonDisabled = computed(() => {
  if (isWaitingForTransfer.value) return true

  switch (currentView.value) {
    case 'payment-methods':
      return !canProceedFromPaymentMethods()
    case 'client-selection':
      return !selectedClient.value
    case 'invoice-options':
      return !selectedInvoiceOption.value
    case 'MPTR':
      return isWaitingForTransfer.value
    default:
      return false
  }
})

// Client Management Computed
const filteredClients = computed(() => {
  if (!clientSearch.value) return clients.value
  const searchTerm = clientSearch.value.toLowerCase()
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm)
  )
})

const isNewClientValid = computed(() =>
  newClient.value.name.trim() && newClient.value.email.trim()
)

// Etiquetas dinámicas para tipos de factura
const getInvoiceTypeLabel = (invType) => {
  if (invType.id === 2 && selectedClient.value) {
    return `Cliente: ${selectedClient.value.name}`
  }
  return invType.name
}

// =============================================
// HELPER FUNCTIONS
// =============================================

// Payment Method Helpers
const getPaymentMethodAcronyms = () =>
  validPaymentMethods.value.map(p => p.acronym || 'EFE')

const isPaymentView = (view) =>
  Object.keys(PAYMENT_VIEW_CONFIG).includes(view)

const getPaymentViewIcon = (view) =>
  PAYMENT_VIEW_CONFIG[view]?.icon || 'help'

const getPaymentViewTitle = (view) =>
  PAYMENT_VIEW_CONFIG[view]?.title || 'Procesando...'

const shouldShowSpinner = (view) =>
  PAYMENT_VIEW_CONFIG[view]?.spinner || false

// Payment Method Validation
const validatePaymentMethod = (method) => {
  // Verificar que tenga nombre (antes requería acrónimo no vacío)
  return method.name && method.name.trim().length > 0
}

const filterValidPaymentMethods = (methods) => {
  return methods.filter(method => {
    const isValid = validatePaymentMethod(method)
    if (!isValid) {
      console.warn(`Payment method "${method.name}" (ID: ${method.id}) filtered out: missing name`)
    }
    return isValid
  })
}

// Navigation Helpers
const canProceedFromPaymentMethods = () =>
  selectedPaymentMethod.value && selectedInvoiceType.value

const getNextViewAfterPaymentMethods = () => {
  if (!selectedInvoiceType.value) return 'payment-methods'

  switch (selectedInvoiceType.value.id) {
    // case 2: // Facturar a un Cliente
    //   // Si ya hay un cliente, ir al pago. Si no, a seleccionar cliente.
    //   return selectedClient.value
    //     ? (selectedPaymentMethod.value?.acronym || 'payment-methods')
    //     : 'client-selection'
    case 3: // Factura A / B
      return 'invoice-options'
    default: // Consumidor Final
      // Si tiene acrónimo, usarlo. Si no, usar 'EFE' por defecto.
      return selectedPaymentMethod.value?.acronym || 'EFE'
  }
}

const getPreviousView = () => {
  const paymentAcronyms = getPaymentMethodAcronyms()

  switch (currentView.value) {
    case 'payment-methods':
      return 'keypad'
    case 'client-selection':
    case 'invoice-options':
      return 'payment-methods'
    case 'operation-completed':
      return currentView.value // Handled separately
    default:
      if (paymentAcronyms.includes(currentView.value)) {
        // if (selectedInvoiceType.value?.id === 2) return 'client-selection'
        if (selectedInvoiceType.value?.id === 3) return 'invoice-options'
        return 'payment-methods'
      }
      return 'keypad'
  }
}

// Style Helpers
const getPaymentMethodButtonClass = (method) => ({
  'bg-primary text-white': selectedPaymentMethod.value?.id === method.id,
  'bg-grey-3 text-black': selectedPaymentMethod.value?.id !== method.id,
  'full-span': method.name.length > 14
})

const getInvoiceTypeButtonClass = (invType) => ({
  'bg-blue-6 text-white': selectedInvoiceType.value?.id === invType.id,
  'bg-grey-3 text-black': selectedInvoiceType.value?.id !== invType.id
})

const getClientButtonClass = (client) => ({
  'bg-primary text-white': selectedClient.value?.id === client.id,
  'bg-grey-3 text-black': selectedClient.value?.id !== client.id
})

const getVoucherTypeId = (option) => option?.id || option?.Id

const getInvoiceOptionButtonClass = (option) => {
  const optionId = getVoucherTypeId(option)
  const selectedId = selectedInvoiceOption.value ? getVoucherTypeId(selectedInvoiceOption.value) : null

  if (optionId === undefined || selectedId === undefined || selectedId === null) {
    return 'bg-grey-3 text-black'
  }

  return {
    'bg-blue-6 text-white': selectedId === optionId,
    'bg-grey-3 text-black': selectedId !== optionId
  }
}

// =============================================
// STATE MANAGEMENT FUNCTIONS
// =============================================

const setTransition = (transition) => {
  transitionName.value = transition
}

const resetAllState = () => {
  setTransition('fade')
  currentView.value = 'keypad'
  inputValue.value = ''
  selectedPaymentMethod.value = validPaymentMethods.value[0] || null
  selectedInvoiceType.value = invoiceTypes.value[0] || null
  selectedClient.value = null
  selectedInvoiceOption.value = null
  clientSearch.value = ''
  showAddClientDialog.value = false
  isWaitingForTransfer.value = false
  transferPaymentDetails.value = null

  if (transferTimeout.value) {
    clearTimeout(transferTimeout.value)
    transferTimeout.value = null
  }
}

// =============================================
// INPUT HANDLING
// =============================================

const handleDigitInput = (digit) => {
  if (inputValue.value.length < MAX_INPUT_LENGTH) {
    inputValue.value += digit
  }
}

const handleBackspace = () => {
  if (inputValue.value.length > 0) {
    inputValue.value = inputValue.value.slice(0, -1)
  }
}

const handleKeyPress = (e) => {
  if (currentView.value !== 'keypad') return

  if (e.key >= '0' && e.key <= '9') {
    handleDigitInput(e.key)
  } else if (e.key === 'Backspace') {
    handleBackspace()
  } else if (e.key === 'Enter' && canProceedFromKeypad.value) {
    proceedToPaymentMethods()
  }
}

// =============================================
// SELECTION HANDLERS
// =============================================

const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method
}

const selectInvoiceType = (invType) => {
  selectedInvoiceType.value = invType

  // Si se presiona "Facturar a un Cliente" (ID 2), siempre ir a la selección de cliente
  // para permitir elegir uno nuevo o cambiar el existente.
  // Caso 1: Consumidor Final (ID 1) -> Limpiar cliente
  if (invType.id === 1) {
    selectedClient.value = null
    return
  }

  // Caso 2: Facturar a un Cliente (ID 2) -> Siempre ir a selección
  if (invType.id === 2) {
    setTransition('slide-forward')
    currentView.value = 'client-selection'
    return
  }

  // Caso 3: Otros tipos de factura (A/B, etc.) -> Ir a selección solo si no hay cliente
  if (!selectedClient.value) {
    setTransition('slide-forward')
    currentView.value = 'client-selection'
  }
}

const selectClient = (client) => {
  selectedClient.value = client

  // Después de seleccionar cliente, regresar a métodos de pago
  setTransition('slide-backward')
  currentView.value = 'payment-methods'
}

const selectInvoiceOption = (option) => {
  selectedInvoiceOption.value = option
}

// =============================================
// NAVIGATION FUNCTIONS
// =============================================

const proceedToPaymentMethods = () => {
  if (!canProceedFromKeypad.value) return
  setTransition('slide-forward')
  currentView.value = 'payment-methods'
}

const proceedToNextStep = () => {
  if (!canProceedFromPaymentMethods()) return
  setTransition('slide-forward')
  currentView.value = getNextViewAfterPaymentMethods()
}

const proceedToPaymentView = () => {
  if (!selectedPaymentMethod.value) return
  setTransition('slide-forward')
  // Usar acrónimo si existe, sino 'EFE'
  currentView.value = selectedPaymentMethod.value.acronym || 'EFE'
}

const createInvoice = async () => {
  try {
    const userSession = authStore.userSession
    const branchOffice = authStore.branchOffice
    const coin = userSession?.company_session?.company_config?.coin
    const typeOfService = userSession?.company_session?.company_config?.type_of_service

    if (!userSession || !branchOffice || !coin || !typeOfService) {
      console.error('❌ Datos de sesión insuficientes para crear la factura.')
      $q.notify({
        type: 'negative',
        message: 'No se pudo crear la factura. Faltan datos de sesión.',
        position: 'top'
      })
      return
    }

    const totalAmount = parseInt(inputValue.value, 10) / 100

    // Validar si requiere voucherType y lo tiene
    if (selectedInvoiceType.value?.id === 3 && !selectedInvoiceOption.value) {
      $q.notify({
        message: 'Debe seleccionar un tipo de comprobante (A, B, etc.)',
        type: 'warning'
      })
      return
    }

    const paymentData = {
      payment_method_id: selectedPaymentMethod.value?.id,
      amount: totalAmount,
      reference: transferPaymentDetails.value?.id || null,
      name: selectedPaymentMethod.value?.name,
      acronym: selectedPaymentMethod.value?.acronym,
      coin_id: coin.id,
      user_created_id: userSession.id
    }

    const payments = []
    if (paymentData.amount > 0) {
      payments.push(paymentData)
    }

    const payload = {
      title: 'Ticket',
      client_id: selectedInvoiceType.value?.id === 1
        ? (clients.value.find(c => c.name.toLowerCase() === 'consumidor final')?.id || clients.value[0]?.id)
        : selectedClient.value?.id,
      seller_id: userSession.id,
      coin_id: coin.id,
      description: '',
      type_of_service_id: typeOfService.id,
      invoice_type_id: selectedInvoiceType.value.id, // Use selected invoice type ID
      user_created_id: userSession.id,
      branch_office_id: branchOffice.id,
      exchange_rate: 0,
      total_amount: totalAmount,
      delivery_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: 'delivered',
      electronic_invoice: null,
      payments,
      voucherType: selectedInvoiceType.value?.id === 3 ? selectedInvoiceOption.value : null // Include voucherType
    }
    await api.post('/invoices', payload)
  } catch (error) {
    console.error('❌ Error al crear la factura:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al registrar la factura.',
      position: 'top'
    })
  }
}

const completeOperation = async () => {
  // Solo crear factura si el pago fue exitoso
  if (!isWaitingForTransfer.value || transferPaymentDetails.value) {
    await createInvoice()
  }
  setTransition('slide-forward')
  currentView.value = 'operation-completed'
}

const goBack = () => {
  if (currentView.value === 'operation-completed') {
    resetAllState()
    return
  }

  // Limpiar selecciones al regresar de ciertas vistas
  if (currentView.value === 'client-selection') {
    selectedClient.value = null
    clientSearch.value = ''
  } else if (currentView.value === 'invoice-options') {
    selectedInvoiceOption.value = null
  }

  setTransition('slide-backward')
  currentView.value = getPreviousView()
}

const resetToInitialState = () => {
  resetAllState()
}

const handleNextAction = () => {
  if (isPaymentView(currentView.value)) {
    completeOperation()
  } else if (currentView.value === 'payment-methods') {
    proceedToNextStep()
  } else if (['client-selection', 'invoice-options'].includes(currentView.value)) {
    proceedToPaymentView()
  }
}

// =============================================
// CLIENT MANAGEMENT
// =============================================

const toggleClientDialog = (show) => {
  showAddClientDialog.value = show
}

const getDocumentTypes = async (val, update) => {
  try {
    const userSession = authStore.userSession
    const { data } = await apiArca.get('metadata/document-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      documentTypes.value = data
    })
  } catch (err) {
    console.error('Error fetching document types:', err)
    $q.notify({
      message: 'Ocurrió un error al obtener tipos de documento',
      color: 'negative'
    })
  }
}

const getConditionIvaReceptor = async (val, update) => {
  try {
    const userSession = authStore.userSession
    const { data } = await apiArca.get('metadata/condition-iva-receptors', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      conditionIvaReceptors.value = data
    })
  } catch (err) {
    console.error('Error fetching IVA conditions:', err)
    $q.notify({
      message: 'Ocurrió un error al obtener condiciones de IVA',
      color: 'negative'
    })
  }
}

const addNewClient = async () => {
  if (!isNewClientValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete los campos requeridos.',
      position: 'top'
    })
    return
  }

  try {
    const clientData = { ...newClient.value }

    // Format fields as JSON string if they are objects (matching ClientPage logic)
    if (clientData.document_type && typeof clientData.document_type === 'object') {
      clientData.document_type = JSON.stringify(clientData.document_type)
    }

    if (clientData.condition_iva_receptor && typeof clientData.condition_iva_receptor === 'object') {
      clientData.condition_iva_receptor = JSON.stringify(clientData.condition_iva_receptor)
    }

    const { data } = await api.post('clients', clientData)

    $q.notify({
      type: 'positive',
      message: 'Cliente agregado exitosamente.',
      position: 'top'
    })

    // Refresh clients list and select the new one
    await fetchClients()
    const createdClient = data.data
    if (createdClient) {
      selectClient(createdClient)
    }

    showAddClientDialog.value = false
    // Reset form
    newClient.value = {
      name: '',
      email: '',
      phone_number: '',
      is_credit: false,
      document_type: null,
      document_number: '',
      condition_iva_receptor: null,
      users: { phone_number: '' }
    }
  } catch (error) {
    console.error('Error adding client:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al agregar el cliente.',
      position: 'top'
    })
  }
}

// =============================================
// TRANSFER HANDLING
// =============================================

const listenForTransfers = () => {
  try {
    // Clear existing timeout
    if (transferTimeout.value) {
      clearTimeout(transferTimeout.value)
      transferTimeout.value = null
    }

    if (!echoPay) {
      console.warn('EchoPay not available, skipping transfer listener.')
      return
    }

    const userSession = authStore.userSession
    const branchOffice = authStore.branchOffice

    if (!userSession || !branchOffice) {
      console.warn('User session or branch office not available, skipping transfer listener.')
      return
    }

    const qpayId = userSession.company_session?.company_config?.other?.qpay_id
    const branchOfficeId = branchOffice.id

    if (!qpayId || !branchOfficeId) {
      console.warn('QPay ID or Branch Office ID not found, skipping transfer listener.')
      return
    }

    isWaitingForTransfer.value = true

    const channelName = 'mercado-pago-payment'
    const eventName = `.mercado-pago-payment.${qpayId}.${branchOfficeId}`

    const channel = echoPay.channel(channelName)
    channel.listen(eventName, (data) => {
      if (data?.payment) {
        // Obtener el monto solicitado (en centavos)
        const requestedAmountCents = parseInt(inputValue.value, 10)
        const requestedAmount = requestedAmountCents / 100

        // Obtener el monto recibido
        const receivedAmount = parseFloat(data.payment.transaction_amount || 0)

        // Validar que los montos sean exactamente idénticos
        if (receivedAmount === requestedAmount) {
          transferPaymentDetails.value = data.payment // Guardar detalles del pago
          isWaitingForTransfer.value = false
          $q.notify({
            type: 'positive',
            message: `Pago recibido: ${receivedAmount.toFixed(2)}`,
            position: 'top'
          })
          completeOperation()
        }
      }
    })
  } catch (error) {
    console.error('Error in listenForTransfers:', error)
    isWaitingForTransfer.value = false
  }
}

const stopListeningForTransfers = () => {
  try {
    if (transferTimeout.value) {
      clearTimeout(transferTimeout.value)
      transferTimeout.value = null
    }

    isWaitingForTransfer.value = false

    const userSession = authStore.userSession
    const branchOffice = authStore.branchOffice
    const qpayId = userSession?.company_session?.company_config?.other?.qpay_id

    if (qpayId && branchOffice?.id && echoPay) {
      const channelName = 'mercado-pago-payment'
      echoPay.leave(channelName)
    }
  } catch (error) {
    console.error('Error in stopListeningForTransfers:', error)
  }
}

// =============================================
// API FUNCTIONS
// =============================================

const fetchClients = async () => {
  try {
    const { data } = await api.get('clients')
    clients.value = data
  } catch (error) {
    console.error('Error fetching clients:', error)
    clients.value = [
      { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone_number: '123456789' },
      { id: 2, name: 'María García', email: 'maria@email.com', phone_number: '987654321' }
    ]
  }
}

const fetchPaymentMethods = async () => {
  try {
    const { data } = await api.get('payment-methods')
    const validMethods = filterValidPaymentMethods(data)

    paymentMethods.value = data // Guardar todos los métodos (para referencia)
    validPaymentMethods.value = validMethods // Solo los válidos para mostrar

    if (validMethods.length > 0) {
      selectedPaymentMethod.value = validMethods[0]
    } else {
      console.warn('No valid payment methods found with acronyms')
      selectedPaymentMethod.value = null
    }
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    // Fallback data - todos tienen acrónimo válido
    const mockPaymentMethods = [
      { id: 27, name: 'Efectivo', acronym: 'EFE' },
      { id: 28, name: 'Transferencia', acronym: 'MPTR' },
      { id: 29, name: 'Débito', acronym: 'DEB' },
      { id: 30, name: 'Crédito', acronym: 'CRE' },
      { id: 99, name: 'QR Mercado Pago', acronym: 'MPAQR' }
    ]

    paymentMethods.value = mockPaymentMethods
    validPaymentMethods.value = mockPaymentMethods // Todos son válidos

    if (mockPaymentMethods.length > 0) {
      selectedPaymentMethod.value = mockPaymentMethods[0]
    }
  }
}

const getVoucherTypes = async () => {
  try {
    const userSession = authStore.userSession
    const { data } = await apiArca.get('metadata/voucher-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    voucherTypes.value = data
  } catch (err) {
    $q.notify({
      message: err.message || 'Error al obtener tipos de comprobante',
      type: 'negative',
      icon: 'warning'
    })
  }
}

const initializeData = async () => {
  // Set default selections
  if (invoiceTypes.value.length > 0) {
    selectedInvoiceType.value = invoiceTypes.value[0]
  }

  // Fetch data
  await Promise.all([
    fetchPaymentMethods(),
    fetchClients(),
    getVoucherTypes() // Fetch voucher types on mount
  ])
}

// =============================================
// WATCHERS
// =============================================

watch(currentView, (newView, oldView) => {
  if (newView === 'MPTR') {
    listenForTransfers()
  } else if (oldView === 'MPTR') {
    stopListeningForTransfers()
  }
})

// =============================================
// LIFECYCLE HOOKS
// =============================================

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  initializeData()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (currentView.value === 'MPTR') {
    stopListeningForTransfers()
  }
})
</script>

<style scoped>
/* =============================================
   GLOBAL STYLES
   ============================================= */
.pos-card {
  transition: all 0.3s ease;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.full-width {
  width: 100%;
}

.button-style {
  border-radius: 10px;
  padding: 5px 15px;
}

.input-style {
  border-radius: 10px;
}

.dialog-card {
  border-radius: 10px;
}

/* =============================================
   KEYPAD STYLES
   ============================================= */
.keypad-view-container {
  width: 100%;
  min-height: 600px;
}

.keypad-section {
  min-height: 500px;
}

.display-container {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  position: relative;
  width: 100%;
  max-width: 300px;
}

.display-text {
  font-size: 2rem;
  font-weight: 500;
  color: #333;
}

.backspace-btn {
  color: #555;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 280px;
  grid-template-rows: repeat(4, 1fr);
}

.keypad-btn {
  font-size: 1.5rem;
  font-weight: 400;
  background-color: #f0f0f0;
  color: #333;
  width: 75px;
  height: 75px;
}

.keypad-btn:hover {
  background-color: #e0e0e0;
}

.send-btn {
  background-color: var(--q-primary) !important;
  color: white !important;
  grid-column: 3;
  grid-row: 4;
}

.send-btn:hover {
  background-color: var(--q-primary) !important;
  opacity: 0.8;
}

/* =============================================
   PAYMENT & CLIENT SELECTION STYLES
   ============================================= */
.payment-methods-grid .payment-btn.full-span {
  grid-column: span 2;
}

.payment-btn {
  width: 100%;
  font-size: 1.1rem;
  text-transform: none;
}

.client-btn {
  font-size: 1rem;
  text-transform: none;
  justify-content: flex-start;
}

.invoice-option-btn {
  font-size: 1rem;
  text-transform: none;
  min-height: 64px;
  padding: 12px 16px;
}

.payment-methods-container {
  width: 100%;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.invoice-options-container {
  width: 100%;
  max-height: calc(100dvh - 250px);
  overflow-y: auto;
  padding-right: 5px; /* Prevent scrollbar overlap content */
}

/* =============================================
   MOBILE CONTAINER STYLES
   ============================================= */
.mobile-payment-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.payment-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
}

.payment-content::-webkit-scrollbar {
  display: none;
}

.client-list-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 300px;
}

.client-list-container::-webkit-scrollbar {
  display: none;
}

/* =============================================
   NAVIGATION STYLES
   ============================================= */
.action-buttons-fixed {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  z-index: 1000;
}

@media (max-width: 600px) {
  .action-buttons-fixed {
    padding: 0.75rem 1rem;
    gap: 8px;
  }
}

/* =============================================
   RESPONSIVE STYLES
   ============================================= */
.pos-card {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  box-shadow: none;
}

.q-page {
  padding: 0 !important;
}

.keypad-view-container {
  height: 100%;
}

.keypad-section {
  margin: auto;
}

/* =============================================
   TRANSITION ANIMATIONS
   ============================================= */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-forward-enter-active,
.slide-forward-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-forward-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-forward-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-backward-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-backward-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* =============================================
   UTILITY STYLES
   ============================================= */
.q-btn:hover {
  box-shadow: none !important;
}

.full-height {
  height: 100%;
}

.payment-view-container {
  height: 100vh;
}
</style>
