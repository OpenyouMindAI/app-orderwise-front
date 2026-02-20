<template>
  <div class="checkout-view">
    <div class="checkout-header">
      <q-btn
        icon="arrow_back_ios_new"
        flat
        round
        dense
        color="dark"
        class="back-btn bg-white shadow-2"
        size="sm"
        @click="handleBack"
      />
      <div class="header-title">Finalizar Pedido</div>
    </div>

    <!-- Authentication Overlay (shown when not authenticated) -->
    <div v-if="!isAuthenticated" class="auth-overlay">
      <div class="auth-container">
        <!-- Tabs para Login y Registro -->
        <q-tabs
          v-model="authTab"
          dense
          class="auth-tabs q-mb-md"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="login" label="INICIAR SESIÓN" no-caps />
          <q-tab name="register" label="REGISTRARSE" no-caps />
        </q-tabs>

        <q-tab-panels v-model="authTab" animated class="auth-tab-panels bg-transparent">
          <!-- Login Tab -->
          <q-tab-panel name="login" class="q-pa-none">
            <q-form @submit="handleLogin">
              <!-- Input Usuario -->
              <div class="input-container">
                <q-input
                  v-model="loginForm.username"
                  placeholder="Usuario o correo electrónico"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[val => !!val || 'El usuario es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" size="20px"/>
                  </template>
                </q-input>
              </div>

              <!-- Input Contraseña -->
              <div class="input-container">
                <q-input
                  v-model="loginForm.password"
                  placeholder="Contraseña"
                  :type="showLoginPassword ? 'text' : 'password'"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[val => !!val || 'La contraseña es requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" size="20px"/>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showLoginPassword ? 'visibility' : 'visibility_off'"
                      color="grey-5"
                      size="20px"
                      class="cursor-pointer"
                      @click="showLoginPassword = !showLoginPassword"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="login-btn full-width"
                :loading="loginLoading"
                :disable="loginLoading"
                unelevated
                no-caps
                size="lg"
              >
                <q-icon name="login" size="20px" class="q-mr-sm"/>
                Iniciar Sesión
              </q-btn>

              <!-- Divider -->
              <div class="divider-container">
                <div class="divider-line"></div>
                <span class="divider-text">O continúa con</span>
                <div class="divider-line"></div>
              </div>

              <!-- Botón Google -->
              <button
                type="button"
                class="social-btn google-btn"
                @click="handleGoogleLogin"
                :disabled="loadingGoogle || loginLoading"
              >
                <q-spinner v-if="loadingGoogle" color="grey-8" size="18px"/>
                <template v-else>
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </template>
              </button>
            </q-form>
          </q-tab-panel>

          <!-- Register Tab -->
          <q-tab-panel name="register" class="q-pa-none">
            <q-form @submit="handleRegister">
              <!-- Input Nombre -->
              <div class="input-container">
                <q-input
                  v-model="registerForm.name"
                  placeholder="Nombre"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[val => !!val || 'El nombre es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" size="20px"/>
                  </template>
                </q-input>
              </div>

              <!-- Input Apellido -->
              <div class="input-container">
                <q-input
                  v-model="registerForm.last_name"
                  placeholder="Apellido"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[val => !!val || 'El apellido es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="primary" size="20px"/>
                  </template>
                </q-input>
              </div>

              <!-- Input Email -->
              <div class="input-container">
                <q-input
                  v-model="registerForm.email"
                  placeholder="Email"
                  type="email"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[
                    val => !!val || 'El email es requerido',
                    val => /.+@.+\..+/.test(val) || 'Email inválido'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="primary" size="20px"/>
                  </template>
                </q-input>
              </div>

              <!-- Input Teléfono con selector de país -->
              <div class="phone-input-container">
                <div class="row q-col-gutter-sm">
                  <!-- Country Selector -->
                  <div class="col-5">
                    <q-select
                      v-model="selectedCountry"
                      :options="countryOptions"
                      option-label="name"
                      class="custom-input country-select"
                      borderless
                      dense
                      hide-bottom-space
                      emit-value
                      map-options
                    >
                      <template v-slot:prepend>
                        <q-icon name="flag" color="primary" size="20px"/>
                      </template>
                      <template v-slot:selected>
                        <span class="country-flag">{{ selectedCountry?.flag }}</span>
                        <span class="q-ml-xs">{{ selectedCountry?.code }}</span>
                      </template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar>
                            <span class="country-flag">{{ scope.opt.flag }}</span>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.code }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <!-- Phone Number -->
                  <div class="col-7">
                    <q-input
                      v-model="registerForm.phone_number"
                      placeholder="Teléfono"
                      type="tel"
                      class="custom-input"
                      borderless
                      dense
                      hide-bottom-space
                      :rules="phoneRule"
                      mask="###-###-####"
                    >
                      <template v-slot:prepend>
                        <q-icon name="phone" color="primary" size="20px"/>
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <!-- Input Contraseña -->
              <div class="input-container">
                <q-input
                  v-model="registerForm.password"
                  placeholder="Contraseña"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[
                    val => !!val || 'La contraseña es requerida',
                    val => val.length >= 8 || 'Mínimo 8 caracteres'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" size="20px"/>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showRegisterPassword ? 'visibility' : 'visibility_off'"
                      color="grey-5"
                      size="20px"
                      class="cursor-pointer"
                      @click="showRegisterPassword = !showRegisterPassword"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Input Confirmar Contraseña -->
              <div class="input-container">
                <q-input
                  v-model="registerForm.password_confirmation"
                  placeholder="Confirmar contraseña"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  class="custom-input"
                  borderless
                  dense
                  hide-bottom-space
                  :rules="[
                    val => !!val || 'Confirma tu contraseña',
                    val => val === registerForm.password || 'Las contraseñas no coinciden'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_outline" color="primary" size="20px"/>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPasswordConfirm ? 'visibility' : 'visibility_off'"
                      color="grey-5"
                      size="20px"
                      class="cursor-pointer"
                      @click="showPasswordConfirm = !showPasswordConfirm"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="register-btn full-width"
                :loading="registerLoading"
                :disable="registerLoading"
                unelevated
                no-caps
                size="lg"
              >
                <q-icon name="group_add" size="20px" class="q-mr-sm"/>
                Registrarse
              </q-btn>

              <!-- Divider -->
              <div class="divider-container">
                <div class="divider-line"></div>
                <span class="divider-text">O regístrate con</span>
                <div class="divider-line"></div>
              </div>

              <!-- Botón Google -->
              <button
                type="button"
                class="social-btn google-btn"
                @click="handleGoogleRegister"
                :disabled="loadingGoogle || registerLoading"
              >
                <q-spinner v-if="loadingGoogle" color="grey-8" size="18px"/>
                <template v-else>
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </template>
              </button>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </div>
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
      v-show="isAuthenticated"
    >
      <!-- Step 1: Pago -->
      <q-step
        :name="1"
        title="Pago"
        icon="payment"
        :done="currentStep > 1"
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
              </q-item-section>
            </q-item>
          </q-list>
        </div>

      </q-step>

      <!-- Step 2: Comprobante -->
      <q-step
        :name="2"
        title="Comprobante"
        icon="receipt"
        :done="currentStep > 2"
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

      <!-- Step 3: Entrega  -->
      <q-step
        :name="3"
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
import { useRegistration } from 'src/composables/useRegistration'
import { useCatalogStore } from 'src/stores/catalog'
import { authentication } from 'src/stores/module-authentication'
import { useOrderStore } from 'src/stores/order'
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
const orderStore = useOrderStore()
const { userSession } = storeToRefs(authStore)
const { paymentMethods, company } = storeToRefs(catalogStore)

// Registration composable for country selection + Google Auth
const {
  selectedCountry,
  countryOptions,
  phoneRule,
  loadingGoogle,
  registerWithGoogle,
  initializeGoogleAuthMobile
} = useRegistration()

// Estado del stepper
const currentStep = ref(1)

// Auth state
const authTab = ref('login')
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({
  name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: ''
})
const loginLoading = ref(false)
const registerLoading = ref(false)
// googleLoading viene del composable useRegistration como loadingGoogle
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showPasswordConfirm = ref(false)

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
      return selectedPaymentMethod.value
        ? `Continuar con ${selectedPaymentMethodName.value}`
        : 'Selecciona un método de pago'
    case 2:
      return 'Continuar'
    case 3:
      return 'Confirmar Pedido'
    default:
      return 'Siguiente'
  }
})

const canProceed = computed(() => {
  if (!isAuthenticated.value) {
    return false // Must be authenticated to proceed
  }

  switch (currentStep.value) {
    case 1:
      return !!selectedPaymentMethod.value
    case 2:
      return true // Voucher is optional
    case 3:
      return !!deliveryAddress.value
    default:
      return false
  }
})

// Lifecycle
onMounted(async () => {
  if (isAuthenticated.value) {
    currentStep.value = 1 // Start at payment for authenticated users
    deliveryAddress.value = userSession.value?.address || ''
  }
  // Inicializar Google Auth (necesario para móvil con Capacitor)
  await initializeGoogleAuthMobile()
})

// Stepper Methods
const handleNext = () => {
  if (!canProceed.value) return

  // Haptic feedback
  if (window.navigator?.vibrate) {
    window.navigator.vibrate(10)
  }

  // Step-specific actions
  const finalStep = isAuthenticated.value ? 3 : 4
  if (currentStep.value === finalStep) {
    submitOrder()
  } else {
    currentStep.value++
  }
}

// Methods
const resetState = () => {
  currentStep.value = 1
  selectedPaymentMethod.value = null
  voucherFile.value = null
  deliveryAddress.value = userSession.value?.address || ''
  submitting.value = false
  authTab.value = 'login'
  loginForm.value = { username: '', password: '' }
  registerForm.value = {
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: ''
  }
}

const handleBack = () => {
  resetState()
  emit('cancel')
}

const handlePaymentSelect = (methodId) => {
  selectedPaymentMethod.value = methodId
}

// Authentication handlers
const handleLogin = async () => {
  try {
    loginLoading.value = true
    await authStore.login(loginForm.value)
    deliveryAddress.value = userSession.value?.address || ''
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

    // Prepare phone number with country code
    const phoneNumber = registerForm.value.phone_number
      ? `${selectedCountry.value?.code || ''}${registerForm.value.phone_number}`.trim()
      : ''

    const { data } = await api.post(
      `public/clients/${route.params.company_id}`,
      {
        ...registerForm.value,
        phone_number: phoneNumber
      }
    )
    authStore.setSessionData(data)
    deliveryAddress.value = data.address || ''
    notify('Registro exitoso', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message || 'Error al registrarse', 'negative', 'warning')
  } finally {
    registerLoading.value = false
  }
}

// Callbacks compartidos para el flujo de Google Auth
const googleAuthCallbacks = {
  onSuccess: (data, userInfo) => {
    authStore.setSessionData(data)
    // Save Google profile photo explicitly so it always persists
    if (userInfo?.picture) {
      authStore.setProfilePhoto(userInfo.picture)
    }
    deliveryAddress.value = data.user?.address || data.address || ''
    notify('Sesión iniciada con Google', 'positive', 'check_circle')
  },
  onError: (error) => {
    console.error('Google auth error:', error)
    notify('Error al autenticarse con Google', 'negative', 'warning')
  }
}

const handleGoogleLogin = async () => {
  await registerWithGoogle(googleAuthCallbacks)
}

const handleGoogleRegister = async () => {
  await registerWithGoogle(googleAuthCallbacks)
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
      company_id: Number(route.params.company_id),
      branch_office_id: Number(route.params.branch_office_id),
      client_id: userSession.value.id,
      invoice_type_id: 1,
      type_of_service_id: 1,
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
    resetState()
    notify('¡Pedido creado exitosamente!', 'positive', 'check_circle')
    orderStore.fetchOrders()
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
  min-height: 100dvh;
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
  position: relative;
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
  padding: 0;
}

.checkout-stepper :deep(.q-stepper__header--alternative-labels .q-stepper__tab) {
  min-height: auto !important;
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

/* ==================== INPUT CONTAINERS ==================== */
.input-container {
  margin-bottom: 1rem;
}

/* ==================== CUSTOM INPUT ==================== */
.custom-input :deep(.q-field__control),
.custom-input :deep(.q-field__native) {
  min-height: 44px !important;
  height: 44px !important;
  max-height: 44px !important;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f9fafb !important;
  border: 1.5px solid #e5e7eb !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 12px;
  display: flex !important;
  align-items: center !important;
}

.custom-input :deep(.q-field__control-container) {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

.custom-input :deep(.q-field__native) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
  color: #1f2937;
  font-size: 14px;
  line-height: 1;
}

.custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.custom-input :deep(.q-field__control):hover {
  background: #ffffff !important;
  border-color: var(--primary, #667eea) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff !important;
  border-color: var(--primary, #667eea) !important;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
  transform: translateY(-1px);
}

.custom-input :deep(.q-field__prepend),
.custom-input :deep(.q-field__append) {
  height: 44px !important;
  min-height: 44px !important;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

/* ==================== AUTH BUTTONS ==================== */
.login-btn,
.register-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  border: none !important;
}

.login-btn:hover,
.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.login-btn:active,
.register-btn:active {
  transform: translateY(0);
}

/* ==================== PHONE INPUT ==================== */
.phone-input-container {
  margin-bottom: 1rem;
}

.phone-input-container .country-select :deep(.q-field__control) {
  padding-left: 12px;
  padding-right: 4px;
}

.country-flag {
  font-size: 20px;
  line-height: 1;
}

/* ==================== DIVIDER ==================== */
.divider-container {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

/* ==================== SOCIAL BUTTON ==================== */
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.social-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 12px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.finalizar-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
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

/* Authentication Overlay */
.auth-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  overflow-y: auto;
  padding: 24px 20px;
}

.auth-container {
  max-width: 480px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-tabs {
  background: transparent !important;
  margin-bottom: 24px;
}

.auth-tabs .q-tab {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.3px;
}

.auth-tab-panels {
  background: transparent;
}
</style>
