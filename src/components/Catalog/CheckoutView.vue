<template>
  <div class="checkout-view">
    <!-- Progress Indicator -->
    <div class="progress-header q-pa-md bg-white">
      <div class="text-h6 text-bold q-mb-sm">Finalizar Pedido</div>
      <q-linear-progress
        :value="stepProgress"
        color="primary"
        size="8px"
        rounded
        class="q-mt-sm"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        Paso {{ currentStep }} de {{ totalSteps }}
      </div>
    </div>

    <!-- Stepper -->
    <q-stepper
      v-model="currentStep"
      ref="stepper"
      color="primary"
      animated
      flat
      class="checkout-stepper"
    >
      <!-- Step 1: Autenticación -->
      <q-step
        :name="1"
        title="Inicio de Sesión"
        icon="person"
        :done="currentStep > 1"
      >
        <div v-if="!isAuthenticated" class="auth-step q-pa-md">
          <div class="text-h6 q-mb-md text-center">Inicia sesión o regístrate</div>
          <p class="text-body2 text-grey-7 text-center q-mb-lg">
            Necesitamos tus datos para procesar tu pedido
          </p>

          <q-tabs v-model="authTab" class="q-mb-md" dense align="justify">
            <q-tab name="login" label="Iniciar Sesión" />
            <q-tab name="register" label="Registrarse" />
          </q-tabs>

          <q-tab-panels v-model="authTab" animated>
            <!-- Login Panel -->
            <q-tab-panel name="login">
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
                    <q-icon name="person" />
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
                    <q-icon name="lock" />
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
            <q-tab-panel name="register">
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
                    <q-icon name="badge" />
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
                    <q-icon name="phone" />
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
                    <q-icon name="person" />
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
                    <q-icon name="lock" />
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
                    <q-icon name="location_on" />
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
          <div class="text-h6 q-mt-md">¡Bienvenido!</div>
          <div class="text-subtitle1 text-grey-7">{{ userSession?.name }}</div>
          <q-btn
            color="primary"
            label="Continuar"
            rounded
            unelevated
            class="q-mt-lg"
            @click="currentStep = 2"
          />
        </div>

        <q-stepper-navigation v-if="isAuthenticated">
          <q-btn
            color="primary"
            label="Siguiente"
            @click="currentStep = 2"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Método de Pago -->
      <q-step
        :name="2"
        title="Método de Pago"
        icon="payment"
        :done="currentStep > 2"
      >
        <div class="payment-step q-pa-md">
          <div class="text-h6 q-mb-md">Selecciona el método de pago</div>

          <q-list class="payment-methods-list">
            <q-item
              v-for="method in paymentMethods"
              :key="method.id"
              clickable
              v-ripple
              class="payment-method-item q-mb-sm"
              :class="{ 'selected': selectedPaymentMethod === method.id }"
              @click="selectedPaymentMethod = method.id"
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

        <q-stepper-navigation>
          <q-btn flat @click="currentStep = 1" label="Atrás" class="q-mr-sm" />
          <q-btn
            color="primary"
            label="Siguiente"
            @click="currentStep = 3"
            :disable="!selectedPaymentMethod"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Comprobante -->
      <q-step
        :name="3"
        title="Comprobante"
        icon="receipt"
        :done="currentStep > 3"
      >
        <div class="voucher-step q-pa-md">
          <div class="text-h6 q-mb-md">Comprobante de Pago (Opcional)</div>
          <p class="text-body2 text-grey-7 q-mb-lg">
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

        <q-stepper-navigation>
          <q-btn flat @click="currentStep = 2" label="Atrás" class="q-mr-sm" />
          <q-btn color="primary" label="Siguiente" @click="currentStep = 4" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 4: Dirección -->
      <q-step
        :name="4"
        title="Dirección"
        icon="location_on"
      >
        <div class="address-step q-pa-md">
          <div class="text-h6 q-mb-md">Confirma tu dirección de entrega</div>

          <q-input
            v-model="deliveryAddress"
            type="textarea"
            filled
            label="Dirección"
            rows="4"
            class="q-mb-md"
            :rules="[val => !!val || 'La dirección es requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>

          <!-- Order Summary -->
          <q-card flat bordered class="order-summary q-mb-md">
            <q-card-section class="bg-grey-2">
              <div class="text-subtitle1 text-bold">Resumen del Pedido</div>
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

        <q-stepper-navigation>
          <q-btn flat @click="currentStep = 3" label="Atrás" class="q-mr-sm" />
          <q-btn
            color="primary"
            label="Confirmar Pedido"
            icon-right="check_circle"
            :loading="submitting"
            :disable="!deliveryAddress"
            @click="submitOrder"
            unelevated
            rounded
            size="lg"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
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
const totalSteps = 4

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

const stepProgress = computed(() => (currentStep.value / totalSteps))

const selectedPaymentMethodName = computed(() => {
  const method = paymentMethods.value.find(m => m.id === selectedPaymentMethod.value)
  return method?.name || '-'
})

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    currentStep.value = 2
    deliveryAddress.value = userSession.value?.address || ''
  }
})

// Methods
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
  background: #f8f8f8;
}

.progress-header {
  border-bottom: 1px solid #e0e0e0;
}

.checkout-stepper {
  background: transparent;
}

.checkout-stepper :deep(.q-stepper__step-inner) {
  padding: 0;
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
  background: white;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
}

.payment-method-item:hover {
  border-color: var(--primary, #ff4d00);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.payment-method-item.selected {
  border-color: var(--primary, #ff4d00);
  background: rgba(255, 77, 0, 0.05);
}

/* Voucher Step */
.voucher-step {
  max-width: 500px;
  margin: 0 auto;
}

.file-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
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

.order-summary {
  border-radius: 12px;
}

/* Stepper Navigation */
.checkout-stepper :deep(.q-stepper__nav) {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
}
</style>
