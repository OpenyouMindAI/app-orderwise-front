<template>
  <q-page class="flex column bg-white" style="height: calc(100vh - 120px); overflow: hidden">
    <!-- All views are wrapped in a single transition component to ensure correct v-if/v-else-if chaining -->
    <transition :name="transitionName" mode="out-in">
      <!-- Keypad View -->
      <div
        v-if="currentView === 'keypad'"
        key="keypad"
        :class="[
          'keypad-view-container',
          $q.screen.width < 800 ? 'column' : 'row no-wrap',
          'full-width',
        ]"
      >
        <!-- Numeric Keypad -->
        <div
          :class="[
            'keypad-section',
            'q-pa-md',
            'flex',
            'column',
            'items-center',
            'justify-center',
            $q.screen.width < 800 ? 'col-12' : 'col-6',
          ]"
        >
          <div class="display-container">
            <div class="display-text">{{ formattedValue }}</div>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="backspace"
              @click="backspace"
              class="backspace-btn"
            />
          </div>
          <div class="keypad q-mt-md">
            <q-btn
              v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="n"
              :label="n.toString()"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit(n.toString())"
            />
            <q-btn
              label="00"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit('00')"
            />
            <q-btn
              label="0"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit('0')"
            />
            <q-btn
              v-if="$q.screen.width < 800 && inputValue.length > 0"
              icon="send"
              round
              unelevated
              color="primary"
              class="keypad-btn send-btn"
              @click="navigate('SHOW_PAYMENT_METHODS')"
            />
          </div>
        </div>

        <q-separator
          :vertical="!($q.screen.width < 800)"
          :horizontal="$q.screen.width < 800"
          class="separator"
        />

        <!-- Desktop Payment Methods -->
        <div
          v-if="!($q.screen.width < 800)"
          :class="[
            'payment-section',
            'q-pa-lg',
            'flex',
            'column',
            'items-center',
            'justify-start',
            'col-6',
          ]"
        >
          <transition name="fade" mode="out-in">
            <div v-if="inputValue.length > 0" key="methods" class="full-width">
              <div class="text-h6 q-mb-md text-center">
                Métodos de Pago
              </div>
              <div class="payment-methods-container payment-methods-grid q-mb-lg">
                <q-btn
                  style="border-radius: 10px; padding: 5px 15px"
                  v-for="method in paymentMethods"
                  :key="method.id"
                  :label="method.name"
                  unelevated
                  rounded
                  class="payment-btn no-wrap"
                  align="left"
                  :color="
                    selectedPaymentMethod && selectedPaymentMethod.id === method.id
                      ? 'primary'
                      : 'grey-3'
                  "
                  :text-color="
                    selectedPaymentMethod && selectedPaymentMethod.id === method.id
                      ? 'white'
                      : 'black'
                  "
                  @click="selectedPaymentMethod = method"
                />
              </div>
              <div class="text-h6 q-mb-md text-center">
                Tipo de Factura
              </div>
              <div class="payment-methods-container q-mb-lg">
                <q-btn
                  style="border-radius: 10px; padding: 5px 15px"
                  v-for="invType in invoiceTypes"
                  :key="invType.id"
                  :label="invType.name"
                  :icon="invType.icon"
                  unelevated
                  rounded
                  align="left"
                  class="payment-btn q-mb-md no-wrap"
                  :color="
                    selectedInvoiceType && selectedInvoiceType.id === invType.id
                      ? 'blue-6'
                      : 'grey-3'
                  "
                  :text-color="
                    selectedInvoiceType && selectedInvoiceType.id === invType.id
                      ? 'white'
                      : 'black'
                  "
                  @click="selectedInvoiceType = invType"
                />
              </div>

              <div class="full-width q-mt-auto q-pt-md">
                <q-btn
                  style="border-radius: 10px; padding: 5px 15px"
                  label="Siguiente"
                  color="primary"
                  icon-right="arrow_forward"
                  class="full-width"
                  :disable="!canProceedFromPaymentMethods()"
                  @click="navigate('NEXT_STEP')"
                />
              </div>
            </div>
            <div v-else key="prompt" class="full-height column flex-center text-grey-6">
              <q-icon name="keyboard" size="3em" class="q-mb-sm" />
              <div class="text-subtitle1">Ingrese importe de la venta</div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Mobile Payment Methods View -->
      <div
        v-else-if="currentView === 'payment-methods'"
        key="payment-methods"
        class="flex column items-center q-pa-lg mobile-payment-container"
      >
        <div class="payment-content flex-grow">
          <div class="text-h4 text-weight-bold q-mb-md text-center">
            {{ formattedValue }}
          </div>
          <div class="text-h6 q-mb-md text-center">
            Métodos de Pago
          </div>
          <div class="payment-methods-container payment-methods-grid q-mb-lg">
            <q-btn
              style="border-radius: 10px; padding: 5px 15px"
              v-for="method in paymentMethods"
              :key="method.id"
              :label="method.name"
              unelevated
              rounded
              class="payment-btn no-wrap"
              align="left"
              :color="
                selectedPaymentMethod && selectedPaymentMethod.id === method.id
                  ? 'primary'
                  : 'grey-3'
              "
              :text-color="
                selectedPaymentMethod && selectedPaymentMethod.id === method.id
                  ? 'white'
                  : 'black'
              "
              @click="selectedPaymentMethod = method"
            />
          </div>
          <div class="text-h6 q-mb-md text-center">
            Tipo de Factura
          </div>
          <div class="payment-methods-container">
            <q-btn
              style="border-radius: 10px; padding: 5px 15px"
              v-for="invType in invoiceTypes"
              :key="invType.id"
              :label="invType.name"
              :icon="invType.icon"
              unelevated
              rounded
              align="left"
              class="payment-btn q-mb-md no-wrap"
              :color="
                selectedInvoiceType && selectedInvoiceType.id === invType.id
                  ? 'blue-6'
                  : 'grey-3'
              "
              :text-color="
                selectedInvoiceType && selectedInvoiceType.id === invType.id
                  ? 'white'
                  : 'black'
              "
              @click="selectedInvoiceType = invType"
            />
          </div>
        </div>
      </div>

      <!-- Client Selection View -->
      <div
        v-else-if="currentView === 'client-selection'"
        key="client-selection"
        class="flex column items-center q-pa-lg mobile-payment-container"
      >
        <div class="payment-content flex-grow column full-width">
          <div class="text-h4 text-weight-bold q-mb-md text-center">
            {{ formattedValue }}
          </div>
          <div class="text-h6 q-mb-md text-center">
            Seleccionar Cliente
          </div>

          <div class="column full-width" style="max-height: 100%">
            <!-- Search input -->
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

            <!-- Add new client button -->
            <q-btn
              style="border-radius: 10px; padding: px 15px"
              label="Agregar Nuevo Cliente"
              icon="person_add"
              unelevated
              rounded
              class="full-width q-mb-md"
              color="green-6"
              text-color="white"
              @click="navigate('TOGGLE_CLIENT_DIALOG', { show: true })"
            />

            <!-- Client list container -->
            <div class="client-list-container flex-grow full-width" style="min-height: 0">
              <q-btn
                v-for="client in filteredClients"
                :key="client.id"
                style="border-radius: 10px; padding: px 15px"
                :label="`${client.name} - ${client.email}`"
                unelevated
                rounded
                align="left"
                class="client-btn q-mb-md full-width"
                :color="selectedClient && selectedClient.id === client.id ? 'primary' : 'grey-3'"
                :text-color="selectedClient && selectedClient.id === client.id ? 'white' : 'black'"
                @click="selectedClient = client"
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
              v-for="option in invoiceOptions"
              :key="option.id"
              style="border-radius: 10px; padding: 15px 20px"
              :label="option.name"
              :icon="option.icon"
              unelevated
              rounded
              align="left"
              class="invoice-option-btn q-mb-md full-width"
              :color="selectedInvoiceOption && selectedInvoiceOption.id === option.id ? 'blue-6' : 'grey-3'"
              :text-color="selectedInvoiceOption && selectedInvoiceOption.id === option.id ? 'white' : 'black'"
              @click="selectedInvoiceOption = option"
            />
          </div>
        </div>
      </div>

      <!-- Cash Payment View -->
      <div v-else-if="currentView === 27" class="payment-view-container desktop-payment-view column items-center justify-center q-pa-md">
        <q-icon name="payments" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Pago en Efectivo</div>
        <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
      </div>

      <!-- Transfer Payment View -->
      <div v-else-if="currentView === 28" class="payment-view-container desktop-payment-view column items-center justify-center q-pa-md">
        <q-icon name="sync_alt" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Esperando Transferencia</div>
        <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
        <q-spinner-dots color="primary" size="40px" class="q-mt-md" />
      </div>

      <!-- Debit Card Payment View -->
      <div v-else-if="currentView === 29" class="payment-view-container desktop-payment-view column items-center justify-center q-pa-md">
        <q-icon name="credit_card" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Procesando Débito</div>
        <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
        <q-spinner-dots color="primary" size="40px" class="q-mt-md" />
      </div>

      <!-- Credit Card Payment View -->
      <div v-else-if="currentView === 30" class="payment-view-container desktop-payment-view column items-center justify-center q-pa-md">
        <q-icon name="credit_card" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Procesando Crédito</div>
        <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
        <q-spinner-dots color="primary" size="40px" class="q-mt-md" />
      </div>

      <!-- QR Mercado Pago View -->
      <div v-else-if="currentView === 99" class="payment-view-container desktop-payment-view column items-center justify-center q-pa-md">
        <q-icon name="qr_code_2" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-sm">Escanee el QR de Mercado Pago</div>
        <div class="text-h4 text-weight-bold">{{ formattedValue }}</div>
        <q-spinner-dots color="primary" size="40px" class="q-mt-md" />
      </div>

      <!-- Operation Completed View -->
      <div
        v-else-if="currentView === 'operation-completed'"
        key="completed"
        class="desktop-payment-view column items-center justify-center q-pa-lg text-center"
      >
        <q-icon
          name="check_circle"
          color="positive"
          size="100px"
          class="q-mb-md"
        />
        <div class="text-h4 text-weight-bold q-mb-sm">¡Operación Completada!</div>
        <div class="text-h5 q-mb-lg text-grey-8">{{ formattedValue }}</div>
        <q-btn
          style="border-radius: 10px; padding: 5px 15px"
          label="Nueva Operación"
          color="primary"
          size="lg"
          unelevated
          rounded
          @click="navigate('RESET')"
        />
      </div>
    </transition>

    <!-- Action Buttons -->
    <transition name="slide-up">
      <q-footer v-if="$q.screen.lt.md && shouldShowNavButtons" class="bg-white q-pa-md" style="box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
        <q-btn
          style="border-radius: 10px; padding: 5px 15px"
          label="Volver"
          flat
          @click="navigate('GO_BACK')"
          icon="arrow_back"
        />
        <q-btn
          style="border-radius: 10px; padding: 5px 15px"
          :label="getNextButtonLabel()"
          color="primary"
          :icon-right="shouldShowArrow() ? 'arrow_forward' : ''"
          :disable="isNextButtonDisabled()"
          @click="handleNextAction"
        />
      </q-footer>
    </transition>

    <!-- Desktop Action Buttons -->
    <div v-if="$q.screen.gt.sm && shouldShowNavButtons" class="desktop-action-buttons q-pa-md bg-white" style="border-top: 1px solid #eee;">
      <div class="row items-center justify-end q-gutter-md">
        <q-btn
          style="border-radius: 10px;"
          label="Volver"
          color="grey-8"
          flat
          @click="navigate('GO_BACK')"
        />
        <q-btn
          style="border-radius: 10px; padding: 5px 15px"
          :label="getNextButtonLabel()"
          unelevated
          rounded
          color="primary"
          :icon-right="shouldShowArrow() ? 'arrow_forward' : ''"
          :disable="isNextButtonDisabled()"
          @click="handleNextAction"
        />
      </div>
    </div>

    <!-- Add Client Dialog -->
    <q-dialog v-model="showAddClientDialog">
      <q-card style="min-width: 350px; border-radius: 10px;">
        <q-card-section>
          <div class="text-h6">Agregar Nuevo Cliente</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newClient.name"
            label="Nombre completo"
            outlined
            class="q-mb-md"
            style="border-radius: 10px;"
          />
          <q-input
            v-model="newClient.email"
            label="Email"
            type="email"
            outlined
            class="q-mb-md"
            style="border-radius: 10px;"
          />
          <q-input
            v-model="newClient.phone"
            label="Teléfono"
            outlined
            style="border-radius: 10px;"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="navigate('TOGGLE_CLIENT_DIALOG', { show: false })" />
          <q-btn
            flat
            label="Agregar"
            @click="addNewClient"
            :disable="!newClient.name || !newClient.email"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State variables
const transitionName = ref('slide-forward')
const inputValue = ref('')
const currentView = ref('keypad')
const paymentMethods = ref([])
const selectedPaymentMethod = ref(null)
const invoiceTypes = ref([])
const selectedInvoiceType = ref(null)

// Client selection data
const clientSearch = ref('')
const selectedClient = ref(null)
const showAddClientDialog = ref(false)
const newClient = ref({
  name: '',
  email: '',
  phone: ''
})
const clients = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@email.com', phone: '123456789' },
  { id: 2, name: 'María García', email: 'maria@email.com', phone: '987654321' },
  { id: 3, name: 'Carlos López', email: 'carlos@email.com', phone: '456789123' },
  { id: 4, name: 'Ana Martínez', email: 'ana@email.com', phone: '789123456' }
])

// Invoice A/B options
const selectedInvoiceOption = ref(null)
const invoiceOptions = ref([
  { id: 1, name: 'Opción 1 - Factura A', icon: 'receipt' },
  { id: 2, name: 'Opción 2 - Factura B', icon: 'description' },
  { id: 3, name: 'Opción 3 - Nota de Crédito', icon: 'note_add' }
])

// Computed properties
const formattedValue = computed(() => {
  if (!inputValue.value) {
    return '$0.00'
  }
  const number = parseInt(inputValue.value, 10) / 100
  return `$${number.toFixed(2)}`
})

const filteredClients = computed(() => {
  if (!clientSearch.value) {
    return clients.value
  }
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(clientSearch.value.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.value.toLowerCase())
  )
})

const shouldShowNavButtons = computed(() => {
  const paymentMethodIds = paymentMethods.value.map(p => p.id)
  const viewsWithButtons = ['payment-methods', 'client-selection', 'invoice-options']
  return viewsWithButtons.includes(currentView.value) || paymentMethodIds.includes(currentView.value)
})

// Auxiliary functions for better readability
const setTransition = (transition) => {
  transitionName.value = transition
}

const canProceedFromPaymentMethods = () => {
  return selectedPaymentMethod.value && selectedInvoiceType.value
}

const getNextViewAfterPaymentMethods = () => {
  switch (selectedInvoiceType.value.id) {
    case 2: return 'client-selection'
    case 3: return 'invoice-options'
    default: return selectedPaymentMethod.value.id
  }
}

const getPreviousView = () => {
  const paymentMethodIds = paymentMethods.value.map(p => p.id)

  switch (currentView.value) {
    case 'payment-methods':
      return 'keypad'

    case 'client-selection':
    case 'invoice-options':
      return 'payment-methods'

    case 'operation-completed':
      // En lugar de volver, resetear
      resetAllState()
      return currentView.value // Mantenemos la vista actual después del reset

    default:
      // Para vistas de métodos de pago
      if (paymentMethodIds.includes(currentView.value)) {
        if (selectedInvoiceType.value?.id === 2) {
          return 'client-selection'
        } else if (selectedInvoiceType.value?.id === 3) {
          return 'invoice-options'
        }
        return 'payment-methods'
      }
      return 'keypad'
  }
}

const resetAllState = () => {
  setTransition('fade')
  currentView.value = 'keypad'
  inputValue.value = ''
  selectedPaymentMethod.value = paymentMethods.value.length > 0 ? paymentMethods.value[0] : null
  selectedInvoiceType.value = invoiceTypes.value.length > 0 ? invoiceTypes.value[0] : null
  selectedClient.value = null
  selectedInvoiceOption.value = null
  clientSearch.value = ''
  showAddClientDialog.value = false
}

const addClientToList = (clientData) => {
  const newId = Math.max(...clients.value.map(c => c.id)) + 1
  const newClient = {
    id: newId,
    ...clientData
  }

  clients.value.push(newClient)
  selectedClient.value = newClient

  $q.notify({
    type: 'positive',
    message: 'Cliente agregado exitosamente',
    position: 'top'
  })
}

// UNIFIED NAVIGATION FUNCTION
const navigate = (action, options = {}) => {
  switch (action) {
    // Navegación hacia adelante
    case 'SHOW_PAYMENT_METHODS':
      if (inputValue.value.length > 0) {
        setTransition('slide-forward')
        currentView.value = 'payment-methods'
      }
      break

    case 'NEXT_STEP':
      if (!canProceedFromPaymentMethods()) return

      setTransition('slide-forward')
      currentView.value = getNextViewAfterPaymentMethods()
      break

    case 'TO_PAYMENT_VIEW':
      if (!selectedPaymentMethod.value) return

      setTransition('slide-forward')
      currentView.value = selectedPaymentMethod.value.id
      break

    case 'COMPLETE_OPERATION':
      setTransition('slide-forward')
      currentView.value = 'operation-completed'
      break

    // Navegación hacia atrás
    case 'GO_BACK':
      setTransition('slide-backward')
      currentView.value = getPreviousView()
      break

    // Acciones especiales
    case 'RESET':
      resetAllState()
      break

    case 'TOGGLE_CLIENT_DIALOG':
      showAddClientDialog.value = options.show ?? !showAddClientDialog.value
      break

    case 'ADD_CLIENT':
      if (options.clientData) {
        addClientToList(options.clientData)
      }
      break

    // Navegación directa a vistas específicas
    case 'GO_TO_VIEW':
      if (options.view) {
        setTransition(options.transition || 'slide-forward')
        currentView.value = options.view
      }
      break

    default:
      console.warn(`Acción de navegación desconocida: ${action}`)
      break
  }
}

// Input handling functions
const inputDigit = (digit) => {
  if (inputValue.value.length < 9) {
    inputValue.value += digit
  }
}

const backspace = () => {
  if (inputValue.value.length > 0) {
    inputValue.value = inputValue.value.slice(0, -1)
  }
}

// Button behavior functions
const getNextButtonLabel = () => {
  const paymentMethodIds = paymentMethods.value.map(p => p.id)
  if (paymentMethodIds.includes(currentView.value)) {
    return 'Finalizar'
  }
  return 'Siguiente'
}

const shouldShowArrow = () => {
  const paymentMethodIds = paymentMethods.value.map(p => p.id)
  return !paymentMethodIds.includes(currentView.value)
}

const isNextButtonDisabled = () => {
  if (currentView.value === 'payment-methods') {
    return !canProceedFromPaymentMethods()
  } else if (currentView.value === 'client-selection') {
    return !selectedClient.value
  } else if (currentView.value === 'invoice-options') {
    return !selectedInvoiceOption.value
  }
  return false
}

const handleNextAction = () => {
  const paymentMethodIds = paymentMethods.value.map(p => p.id)

  if (paymentMethodIds.includes(currentView.value)) {
    navigate('COMPLETE_OPERATION')
  } else if (currentView.value === 'payment-methods') {
    navigate('NEXT_STEP')
  } else if (['client-selection', 'invoice-options'].includes(currentView.value)) {
    navigate('TO_PAYMENT_VIEW')
  }
}

// Client management
const addNewClient = () => {
  if (!newClient.value.name || !newClient.value.email) {
    $q.notify({
      type: 'negative',
      message: 'Nombre y email son obligatorios',
      position: 'top'
    })
    return
  }

  navigate('ADD_CLIENT', {
    clientData: { ...newClient.value }
  })

  // Limpiar formulario
  newClient.value = { name: '', email: '', phone: '' }
  navigate('TOGGLE_CLIENT_DIALOG', { show: false })
}

// Keyboard handling
const handleKeyPress = (e) => {
  if (currentView.value === 'keypad') {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key)
    } else if (e.key === 'Backspace') {
      backspace()
    } else if (
      e.key === 'Enter' &&
        $q.screen.width < 800 &&
        inputValue.value.length > 0
    ) {
      navigate('SHOW_PAYMENT_METHODS')
    }
  }
}

// Data fetching
const getPaymentMethods = async () => {
  try {
    const { data } = await api.get('payment-methods')
    console.log('Payment Methods from API:', data)
    paymentMethods.value = data
    if (paymentMethods.value.length > 0) {
      selectedPaymentMethod.value = paymentMethods.value[0]
    }
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    // Fallback to mock data in case of an error
    const mockPaymentMethods = [
      { id: 27, name: 'Efectivo' },
      { id: 28, name: 'Transferencia' },
      { id: 29, name: 'Débito' },
      { id: 30, name: 'Crédito' },
      { id: 99, name: 'QR Mercado Pago' }
    ]
    paymentMethods.value = mockPaymentMethods
    if (paymentMethods.value.length > 0) {
      selectedPaymentMethod.value = paymentMethods.value[0]
    }
  }
}

const getInvoiceTypes = async () => {
  invoiceTypes.value = [
    { id: 1, name: 'Consumidor Final', icon: 'person' },
    { id: 2, name: 'Facturar a un Cliente', icon: 'people_alt' },
    { id: 3, name: 'Factura A / B', icon: 'receipt_long' }
  ]
  if (invoiceTypes.value.length > 0) {
    selectedInvoiceType.value = invoiceTypes.value[0]
  }
}

const initializeViews = () => {
  getInvoiceTypes()
  getPaymentMethods()
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  initializeViews()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.pos-card {
  transition: all 0.3s ease;
  max-width: 800px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.keypad-view-container {
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
}

.keypad-section,
.payment-section {
  min-height: 500px;
}

.full-width {
  width: 100%;
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
}

.send-btn:hover {
  background-color: var(--q-primary) !important;
  opacity: 0.8;
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
  font-size: 1.1rem;
  text-transform: none;
  justify-content: flex-start;
}

.payment-methods-container {
  width: 100%;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.desktop-payment-view {
  height: 100%;
}

@media (max-width: 799px) {
  .desktop-payment-view {
    height: 100vh; /* Full screen on mobile */
    padding-top: 50px; /* Adjust for header or other elements */
  }
}

.client-list {
  max-height: 250px; /* Altura fija más pequeña */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.client-list::-webkit-scrollbar {
  width: 4px;
}

.client-list::-webkit-scrollbar-track {
  background: transparent;
}

.client-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 2px;
}

.invoice-options-container {
  width: 100%;
}

.mobile-payment-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: 70px;
  overflow-y: auto; /* Add vertical scroll when content overflows */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.payment-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  width: 100%;
  /* height: calc(100vh - 120px); */
}

.payment-content::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.client-list-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  width: 100%;
  display: flex;
  flex-direction: column;
}

.action-buttons-fixed {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  z-index: 1000;
}

.q-btn:hover {
  box-shadow: none !important;
}

.separator {
  margin: 16px 0;
}

@media (max-width: 850px) {
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

  .separator {
    display: none;
  }

  .keypad {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  .keypad .keypad-btn:nth-child(12) {
    grid-column: 3;
    grid-row: 4;
  }
}

@media (min-width: 851px) {
  .keypad-section,
  .payment-section {
    flex: 1;
    max-width: 50%;
  }

  .action-buttons-fixed {
    position: static;
    background: transparent;
    border-top: none;
    margin-top: 24px;
  }

  .payment-content {
    padding-bottom: 0;
  }
}

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
  overflow: hidden; /* Ocultar scroll durante transiciones */
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
  overflow: hidden; /* Ocultar scroll durante transiciones */
}

.slide-backward-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-backward-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.client-list-container {
  min-height: 200px; /* Altura mínima para evitar cambios bruscos */
  max-height: 300px;
}
</style>
