<template>
  <div class="checkout-view">
    <!-- Header with Back Button -->
    <div class="checkout-header">
      <q-btn
        icon="arrow_back_ios_new"
        flat
        round
        dense
        color="dark"
        class="back-btn bg-white shadow-2"
        size="sm"
        @click="goBack"
      />
      <div class="header-title">Finalizar Pedido</div>
    </div>

    <!-- Dynamic Stepper -->
    <q-stepper
      v-model="currentStep"
      ref="stepper"
      color="primary"
      animated
      flat
      alternative-labels
      class="checkout-stepper"
    >
      <!-- Step 1: Cuenta -->
      <q-step
        :name="1"
        title="Cuenta"
        icon="person"
        :done="currentStep > 1"
      >
        <div v-if="!isAuthenticated" class="auth-step q-pa-md">
          <div class="section-heading q-mb-md text-center">Inicia sesión o regístrate</div>
          <p class="text-body2 text-grey-7 text-center q-mb-md">
            Necesitamos tus datos para procesar tu pedido
          </p>

          <q-tabs v-model="authTab" class="q-mb-md" dense align="justify">
            <q-tab name="login" label="Iniciar Sesión" />
            <q-tab name="register" label="Registrarse" />
          </q-tabs>

          <q-tab-panels v-model="authTab" animated class="bg-transparent">
            <!-- Login Panel -->
            <q-tab-panel name="login" class="q-pa-none">
              <q-form @submit="handleLogin">
                <q-input
                  v-model="loginForm.username"
                  label="Usuario"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'El usuario es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="loginForm.password"
                  label="Contraseña"
                  type="password"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'La contraseña es requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                </q-input>

                <q-btn
                  type="submit"
                  color="primary"
                  label="Iniciar Sesión"
                  :loading="loginLoading"
                  unelevated
                  rounded
                  class="full-width"
                  size="lg"
                />
              </q-form>
            </q-tab-panel>

            <!-- Register Panel -->
            <q-tab-panel name="register" class="q-pa-none">
              <q-form @submit="handleRegister">
                <q-input
                  v-model="registerForm.name"
                  label="Nombre"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'El nombre es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.phone_number"
                  label="Teléfono"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'El teléfono es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.username"
                  label="Nombre de usuario"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'El usuario es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.password"
                  label="Contraseña"
                  type="password"
                  filled
                  required
                  class="q-mb-md"
                  :rules="[val => !!val || 'La contraseña es requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" />
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.address"
                  label="Dirección"
                  type="textarea"
                  filled
                  rows="2"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" color="primary" />
                  </template>
                </q-input>

                <q-btn
                  type="submit"
                  color="primary"
                  label="Registrarse"
                  :loading="registerLoading"
                  unelevated
                  rounded
                  class="full-width"
                  size="lg"
                />
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </div>

        <div v-else class="authenticated-step q-pa-xl text-center">
          <q-icon name="check_circle" color="positive" size="80px" />
          <div class="text-h6 q-mt-md">¡Hola, {{ userSession?.name }}!</div>
          <div class="text-subtitle1 text-grey-7">Tu sesión está activa</div>
        </div>
      </q-step>

      <!-- Step 2: Pago -->
      <q-step
        :name="2"
        title="Pago"
        icon="payment"
        :done="currentStep > 2"
      >
        <div class="payment-step q-pa-md">
          <div class="section-heading q-mb-md">Método de pago</div>

          <q-list class="payment-methods-list">
            <q-item
              v-for="method in paymentMethods"
              :key="method.id"
              clickable
              v-ripple
              class="payment-method-item q-mb-sm"
              :class="{ 'selected': selectedPaymentMethod === method.id }"
              @click="handlePaymentSelect(method.id)"
            >
              <q-item-section>
                <q-item-label>
                  <q-radio
                    v-model="selectedPaymentMethod"
                    :val="method.id"
                    :label="method.name"
                    color="primary"
                  />
                </q-item-label>

                <q-item-label
                  v-if="method.attributes?.length"
                  caption
                  class="q-ml-lg q-mt-sm"
                >
                  <div class="text-caption text-grey-7">Datos del pago:</div>
                  <div
                    v-for="attr in method.attributes"
                    :key="attr.id"
                    class="text-caption text-grey-8"
                  >
                    • {{ attr.attribute_name }}
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

      </q-step>

      <!-- Step 3: Comprobante -->
      <q-step
        :name="3"
        title="Comprobante"
        icon="receipt"
        :done="currentStep > 3"
      >
        <div class="voucher-step q-pa-md">
          <div class="section-heading q-mb-md">Comprobante de Pago (Opcional)</div>
          <p class="text-body2 text-grey-7 q-mb-md">
            Si no subes el comprobante, nos contactaremos contigo vía WhatsApp o teléfono
            para la confirmación del pago.
          </p>

          <FileButtonComponent
            v-if="!voucherFile"
            ref="fileButton"
            @upload="handleFileUpload"
          >
            <template v-slot:button>
              <div
                @click="$refs.fileButton?.onClick()"
                class="file-upload-area"
              >
                <q-icon name="cloud_upload" color="primary" size="60px" />
                <span class="q-mt-md text-subtitle1">Seleccionar comprobante</span>
                <span class="text-caption text-grey-6">JPG, PNG o PDF</span>
              </div>
            </template>
          </FileButtonComponent>

          <q-card v-else flat bordered class="voucher-preview">
            <q-img :src="voucherFile.url" ratio="1" />
            <q-btn
              icon="close"
              color="negative"
              size="sm"
              round
              unelevated
              class="absolute-top-right q-ma-sm"
              @click="voucherFile = null"
            >
              <q-tooltip>Eliminar comprobante</q-tooltip>
            </q-btn>
          </q-card>
        </div>

      </q-step>

      <!-- Step 4: Confirmación -->
      <q-step
        :name="4"
        title="Entrega"
        icon="local_shipping"
      >
        <div class="address-step q-pa-md">
          <div class="section-heading q-mb-md">Confirma tu dirección de entrega</div>

          <AddressComponent
            :initial-address="deliveryAddress"
            @address-selected="handleAddressSelected"
            label="Dirección de entrega"
            class="q-mb-md"
          />

          <!-- Order Summary -->
          <q-card flat bordered class="order-summary q-mb-md">
            <q-card-section class="q-py-md">
              <div class="text-subtitle1 text-bold flex items-center">
                <q-icon name="shopping_cart" color="primary" class="q-mr-sm" size="20px" />
                Resumen del Pedido
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row justify-between q-mb-sm">
                <span class="text-body2">Productos:</span>
                <span class="text-body2 text-bold">{{ cart.itemCount }} items</span>
              </div>
              <div class="row justify-between q-mb-sm">
                <span class="text-body2">Método de pago:</span>
                <span class="text-body2 text-bold">{{ selectedPaymentMethodName }}</span>
              </div>
              <q-separator class="q-my-md" />
              <div class="row justify-between">
                <span class="text-h6">Total:</span>
                <span class="text-h6 text-bold text-primary">
                  $ {{ formatNumber(cart.total.value) }}
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>

      </q-step>
    </q-stepper>

    <!-- Smart Sticky Bottom Button -->
    <div class="checkout-footer">
      <q-btn
        :label="buttonText"
        :loading="submitting"
        :disable="!canProceed || submitting"
        unelevated
        no-caps
        class="finalizar-btn full-width"
        @click="handleNext"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCart } from 'src/composables/useCart'
import { useCatalogStore } from 'src/stores/catalog'
import { authentication } from 'src/stores/module-authentication'
import { formatNumber, loading, notify, setFiles } from 'src/const/mixins'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import { api } from 'boot/axios'

// Emits
const emit = defineEmits(['success', 'cancel'])

// Route
const route = useRoute()

// Stores y composables
const cart = useCart()
const catalogStore = useCatalogStore()
const authStore = authentication()
const { userSession } = storeToRefs(authStore)
const { paymentMethods, company } = storeToRefs(catalogStore)

// Estado del stepper
const currentStep = ref(1)

// Auth state
const authTab = ref('login')
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({
  name: '',
  phone_number: '',
  username: '',
  password: '',
  address: ''
})
const loginLoading = ref(false)
const registerLoading = ref(false)

// Payment state
const selectedPaymentMethod = ref(null)

// Voucher state
const voucherFile = ref(null)

// Address state
const deliveryAddress = ref('')

// Submit state
const submitting = ref(false)

// Computed
const isAuthenticated = computed(() => !!userSession.value)

const selectedPaymentMethodName = computed(() => {
  const method = paymentMethods.value.find(m => m.id === selectedPaymentMethod.value)
  return method?.name || '-'
})

// Sticky button computed properties
const buttonText = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isAuthenticated.value ? 'Siguiente' : 'Iniciar sesión para continuar'
    case 2:
      return selectedPaymentMethod.value
        ? `Continuar con ${selectedPaymentMethodName.value}`
        : 'Selecciona un método de pago'
    case 3:
      return 'Continuar'
    case 4:
      return 'Confirmar Pedido'
    default:
      return 'Siguiente'
  }
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isAuthenticated.value
    case 2:
      return !!selectedPaymentMethod.value
    case 3:
      return true // Voucher is optional
    case 4:
      return !!deliveryAddress.value
    default:
      return false
  }
})

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    currentStep.value = 2
    deliveryAddress.value = userSession.value?.address || ''
  }
})

// Stepper Methods
const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    emit('cancel')
  }
}

const handleNext = () => {
  if (!canProceed.value) return

  // Haptic feedback
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(10)
  }

  // Step-specific actions
  if (currentStep.value === 4) {
    submitOrder()
  } else {
    currentStep.value++
  }
}

// Methods
const handlePaymentSelect = (methodId) => {
  // Haptic feedback
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(10)
  }
  selectedPaymentMethod.value = methodId
}

const handleLogin = async () => {
  try {
    loginLoading.value = true
    await authStore.login(loginForm.value)
    deliveryAddress.value = userSession.value?.address || ''
    currentStep.value = 2
    notify('Sesión iniciada correctamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message || 'Error al iniciar sesión', 'negative', 'warning')
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    registerLoading.value = true
    const { data } = await api.post(
      `public/clients/${route.params.company_id}`,
      registerForm.value
    )
    authStore.setSessionData(data)
    deliveryAddress.value = data.address || registerForm.value.address
    currentStep.value = 2
    notify('Registro exitoso', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message || 'Error al registrarse', 'negative', 'warning')
  } finally {
    registerLoading.value = false
  }
}

const handleFileUpload = async (files) => {
  try {
    const uploaded = await setFiles(files)
    voucherFile.value = uploaded[0]
    notify('Comprobante cargado', 'positive', 'check_circle')
  } catch (error) {
    notify('Error al cargar el comprobante', 'negative', 'warning')
  }
}

const handleAddressSelected = (addressData) => {
  if (addressData) {
    deliveryAddress.value = addressData.formattedAddress
  } else {
    deliveryAddress.value = ''
  }
}

const submitOrder = async () => {
  try {
    submitting.value = true
    loading(true)

    // Crear la orden
    const { data } = await api.post('command-orders', {
      seller_id: userSession.value?.id,
      products: cart.items.value,
      address: deliveryAddress.value,
      company_id: route.params.company_id,
      client_id: userSession.value.id,
      code: 1,
      payments: [{
        payment_method_id: selectedPaymentMethod.value,
        amount: cart.total.value,
        reference: null,
        exchange: 1,
        coin_id: company.value?.company_config?.coin_id
      }]
    })

    // Subir comprobante si existe
    if (voucherFile.value && data.invoice_payments?.length) {
      const formData = new FormData()
      formData.append('file', voucherFile.value.file)
      formData.append('fileable_type', 'App\\Models\\InvoicePayment')
      formData.append('fileable_id', data.invoice_payments[0].id)
      await api.post('files', formData)
    }

    // Limpiar carrito y notificar éxito
    cart.clearCart()
    notify('¡Pedido creado exitosamente!', 'positive', 'check_circle')
    emit('success', data)
  } catch (error) {
    notify(error.message || 'Error al crear el pedido', 'negative', 'warning')
  } finally {
    submitting.value = false
    loading(false)
  }
}
</script>

<style scoped>
.checkout-view {
  min-height: 100vh;
  background: var(--background);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Header */
.checkout-header {
  gap: 1rem;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: -2px; /* Center adjustment for arrow_back_ios_new */
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.checkout-stepper {
  flex: 1;
  background: transparent;
}

.checkout-stepper :deep(.q-stepper__header) {
  padding: 0 4px;
  position: sticky;
  top: 73px; /* Height of checkout-header (16*2 + 20 + 21ish) */
  z-index: 99;
}

.checkout-stepper :deep(.q-stepper__tab) {
  padding: 8px 4px;
  transition: all 0.3s ease;
}

.checkout-stepper :deep(.q-stepper__dot) {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.checkout-stepper :deep(.q-stepper__label) {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-top: 8px;
}

.checkout-stepper :deep(.q-stepper__step-inner) {
  padding: 16px 0;
}

.section-heading {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
}

/* Auth Step */
.auth-step {
  max-width: 500px;
  margin: 0 auto;
}

.authenticated-step {
  max-width: 400px;
  margin: 0 auto;
}

/* Payment Step */
.payment-step {
  max-width: 600px;
  margin: 0 auto;
}

.payment-methods-list {
  background: transparent;
}

.payment-method-item {
  background: var(--surface);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.payment-method-item:active {
  transform: scale(0.97);
}

.payment-method-item.selected {
  border-color: var(--primary, #ff4d00);
  background: rgba(255, 77, 0, 0.05);
  box-shadow: 0 4px 12px rgba(var(--primary), 0.2);
  animation: pulse-border 2s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(var(--primary), 0.2);
  }
  50% {
    box-shadow: 0 4px 16px rgba(var(--primary), 0.35);
  }
}

/* Voucher Step */
.voucher-step {
  max-width: 500px;
  margin: 0 auto;
}

.file-upload-area {
  border: 1px dashed var(--border);
  border-radius: var(--border-radius-md);
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--surface);
}

.file-upload-area:hover {
  border-color: var(--primary, #ff4d00);
  background: rgba(255, 77, 0, 0.02);
}

.voucher-preview {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

/* Address Step */
.address-step {
  max-width: 600px;
  margin: 0 auto;
}

/* Mobile-friendly inputs */
.q-field :deep(input),
.q-field :deep(textarea) {
  font-size: max(16px, 1rem); /* Prevent iOS zoom */
}

.q-field :deep(.q-field__control) {
  min-height: 48px; /* Touch-friendly */
}

.order-summary {
  border-radius: 12px;
}

/* Stepper Navigation */
.checkout-stepper :deep(.q-stepper__nav) {
  padding: 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

/* Footer */
.checkout-footer {
  position: sticky;
  bottom: 0;
  background: var(--surface);
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  margin-top: auto;
  z-index: 1000;
}

.finalizar-btn {
  height: 56px;
  font-size: 17px;
  font-weight: 600;
  background: var(--text);
  color: var(--surface);
  border-radius: var(--border-radius-md);
  letter-spacing: 0.3px;
  transition: var(--transition-transform);
}

.finalizar-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.finalizar-btn:active:not(:disabled) {
  transform: translateY(0);
}

.finalizar-btn:disabled {
  background: var(--border) !important;
  color: var(--text-light) !important;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Safe area support */
@supports (padding: max(0px)) {
  .checkout-footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}
</style>
