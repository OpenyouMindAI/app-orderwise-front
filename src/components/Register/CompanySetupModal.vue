<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="company-setup-card">
      <!-- Header minimalista -->
      <div class="setup-header">
        <div class="icon-container">
          <q-icon :name="currentStep === 1 ? 'business' : 'settings'" size="32px" color="white"/>
        </div>
        <h4 class="setup-title">{{ currentStep === 1 ? 'Configura tu Empresa' : 'Configuración de Facturación' }}</h4>
        <p class="setup-subtitle">{{ currentStep === 1 ? 'Completa estos datos para comenzar' : 'Valores por defecto para facturación' }}</p>
        <!-- Progress indicator -->
        <div class="step-indicator">
          <div class="step-dot" :class="{ active: currentStep === 1, completed: currentStep > 1 }">1</div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step-dot" :class="{ active: currentStep === 2 }">2</div>
        </div>
      </div>

      <!-- Step 1: Formulario de Empresa -->
      <div v-if="currentStep === 1" class="setup-body">
        <q-form @submit="createCompany" class="company-form">
          <!-- Nombre de empresa -->
          <div class="input-group">
            <q-input
              v-model="form.company_name"
              placeholder="Nombre de la empresa"
              class="minimal-input"
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- RNC / Cédula -->
          <div class="input-group">
            <q-input
              v-model="form.company_document"
              placeholder="RNC / Cédula"
              class="minimal-input"
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Email -->
          <div class="input-group">
            <q-input
              v-model="form.company_email"
              type="email"
              placeholder="Correo electrónico"
              class="minimal-input"
              :rules="[
                val => !!val || 'Campo requerido',
                val => /.+@.+\..+/.test(val) || 'Correo inválido'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Teléfono -->
          <div class="input-group">
            <q-input
              v-model="form.company_phone"
              placeholder="Teléfono"
              class="minimal-input"
              :rules="[val => !!val || 'Campo requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="phone" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Dirección (opcional) -->
          <div class="input-group">
            <q-input
              v-model="form.company_address"
              placeholder="Dirección (opcional)"
              class="minimal-input"
              type="textarea"
              rows="2"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Botón -->
          <q-btn
            type="submit"
            class="submit-btn"
            :loading="loading"
            :disable="loading"
            unelevated
            no-caps
          >
            <q-icon name="arrow_forward" size="20px" class="q-mr-sm"/>
            Continuar
          </q-btn>
        </q-form>
      </div>

      <!-- Step 2: Configuración de Facturación -->
      <div v-if="currentStep === 2" class="setup-body">
        <q-form @submit.prevent="saveConfiguration" class="company-form">
          <!-- Grid de 2 columnas -->
          <div class="config-grid">
            <!-- Cliente por defecto -->
            <div class="input-group">
              <label class="input-label">Cliente</label>
              <q-select
                v-model="configForm.client"
                :options="clients"
                option-label="name"
                option-value="id"
                class="minimal-select"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" size="18px"/>
                </template>
              </q-select>
            </div>

            <!-- Tipo de factura -->
            <div class="input-group">
              <label class="input-label">Tipo de factura</label>
              <q-select
                v-model="configForm.invoiceType"
                :options="invoiceTypes"
                option-label="name"
                option-value="id"
                class="minimal-select"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="receipt" color="primary" size="18px"/>
                </template>
              </q-select>
            </div>

            <!-- Método de pago -->
            <div class="input-group">
              <label class="input-label">Método de pago</label>
              <q-select
                v-model="configForm.paymentMethod"
                :options="paymentMethods"
                option-label="name"
                option-value="id"
                class="minimal-select"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="payment" color="primary" size="18px"/>
                </template>
              </q-select>
            </div>

            <!-- Moneda -->
            <div class="input-group">
              <label class="input-label">Moneda</label>
              <q-select
                v-model="configForm.coin"
                :options="coins"
                option-label="name"
                option-value="id"
                class="minimal-select"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" color="primary" size="18px"/>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Botones -->
          <div class="button-group">
            <q-btn
              flat
              class="skip-btn"
              @click="skipConfiguration"
              :disable="loading"
            >
              Omitir
            </q-btn>
            <q-btn
              type="submit"
              class="submit-btn"
              :loading="loading"
              :disable="loading"
              unelevated
              no-caps
            >
              <q-icon name="rocket_launch" size="20px" class="q-mr-sm"/>
              Finalizar y Comenzar
            </q-btn>
          </div>
        </q-form>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'company-created'])

// State
const loading = ref(false)
const currentStep = ref(1)
const companyData = ref(null)

// Form data - Step 1
const form = ref({
  company_name: '',
  company_document: '',
  company_email: '',
  company_phone: '',
  company_address: ''
})

// Form data - Step 2 (Configuración de facturación)
const configForm = ref({
  client: null,
  invoiceType: null,
  typeOfService: null,
  paymentMethod: null,
  coin: null,
  point_of_sale: '001'
})

// Opciones para los selects
const clients = ref([])
const invoiceTypes = ref([])
const typeOfServices = ref([])
const paymentMethods = ref([])
const coins = ref([])

/**
 * Cargar datos para los selects (solo cuando se necesite)
 */
const loadInitialData = async () => {
  try {
    // Cargar clientes
    const clientsRes = await api.get('/clients')
    clients.value = clientsRes.data

    // Cargar tipos de factura
    const invoiceTypesRes = await api.get('/invoice-types')
    invoiceTypes.value = invoiceTypesRes.data

    // Cargar tipos de servicio
    const servicesRes = await api.get('/type-of-services')
    typeOfServices.value = servicesRes.data

    // Cargar métodos de pago
    const paymentsRes = await api.get('/payment-methods')
    paymentMethods.value = paymentsRes.data

    // Cargar monedas
    const coinsRes = await api.get('/coins')
    coins.value = coinsRes.data

    // Establecer valores por defecto
    if (clients.value.length > 0) {
      configForm.value.client = clients.value[0]
    }
    if (invoiceTypes.value.length > 0) {
      configForm.value.invoiceType = invoiceTypes.value[0]
    }
    if (typeOfServices.value.length > 0) {
      configForm.value.typeOfService = typeOfServices.value[0]
    }
    if (paymentMethods.value.length > 0) {
      configForm.value.paymentMethod = paymentMethods.value[0]
    }
    if (coins.value.length > 0) {
      configForm.value.coin = coins.value[0]
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
    notify('Error al cargar datos de configuración', 'warning', 'warning')
  }
}

/**
 * Create company - Step 1
 */
const createCompany = async () => {
  try {
    loading.value = true

    const { data } = await api.post('authentication/setup-company', form.value)

    companyData.value = data
    notify('¡Empresa creada exitosamente!', 'positive', 'check_circle')

    // Asegurar que el token esté configurado en axios
    if (data.access_token) {
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
    }

    // Cargar datos para el paso 2
    await loadInitialData()

    // Pasar al siguiente paso
    currentStep.value = 2
  } catch (error) {
    const message = error.response?.data?.message || 'Error al crear empresa'
    notify(message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Save configuration - Step 2
 */
const saveConfiguration = async () => {
  try {
    loading.value = true

    // Enviar con la estructura correcta
    await api.post('/company-configs', {
      coin_id: configForm.value.coin?.id,
      type_of_service_id: configForm.value.typeOfService?.id,
      invoice_type_id: configForm.value.invoiceType?.id,
      payment_method_id: configForm.value.paymentMethod?.id,
      client_id: configForm.value.client?.id,
      point_of_sale: configForm.value.point_of_sale
    })

    notify('¡Configuración guardada exitosamente!', 'positive', 'check_circle')

    // Emitir evento con todos los datos
    emit('company-created', companyData.value)

    // Cerrar modal
    emit('update:modelValue', false)
  } catch (error) {
    const message = error.response?.data?.message || 'Error al guardar configuración'
    notify(message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Saltar configuración
 */
const skipConfiguration = () => {
  emit('company-created', companyData.value)
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* Card principal */
.company-setup-card {
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3),
              0 8px 32px rgba(0, 0, 0, 0.15);
  animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

@keyframes modalEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Header */
.setup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 20px;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

.icon-container {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.setup-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
}

.setup-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
}

/* Body */
.setup-body {
  padding: 20px;
  background: white;
  overflow-y: auto;
  flex: 1;
}

.company-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Config grid - 2 columnas */
.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 4px;
}

/* Input groups */
.input-group {
  animation: slideUp 0.5s ease-out backwards;
}

.input-group:nth-child(1) { animation-delay: 0.1s; }
.input-group:nth-child(2) { animation-delay: 0.2s; }
.input-group:nth-child(3) { animation-delay: 0.3s; }
.input-group:nth-child(4) { animation-delay: 0.4s; }
.input-group:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Inputs minimalistas */
.minimal-input :deep(.q-field__control) {
  height: 44px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 16px;
}

.minimal-input :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.minimal-input :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.minimal-input :deep(.q-field__native) {
  color: #1f2937;
  font-size: 14px;
  padding-left: 8px;
}

.minimal-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
}

/* Textarea */
.minimal-input :deep(textarea.q-field__native) {
  padding-top: 12px;
  resize: none;
}

/* Botón submit */
.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: btnEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s backwards;
  transition: all 0.3s ease;
  border: none !important;
  color: white;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.submit-btn:active {
  transform: translateY(0);
}

@keyframes btnEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Step indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.step-dot.completed {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.step-line {
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.step-line.active {
  background: rgba(255, 255, 255, 0.5);
}

/* Input label */
.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

/* Select minimalista */
.minimal-select :deep(.q-field__control) {
  height: 40px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 14px;
}

.minimal-select :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.minimal-select :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.minimal-select :deep(.q-field__native) {
  color: #1f2937;
  font-size: 14px;
  padding-left: 8px;
}

/* Button group */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.skip-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.button-group .submit-btn {
  flex: 2;
}

/* Responsive */
@media (max-width: 600px) {
  .company-setup-card {
    max-width: 95%;
    max-height: 85vh;
  }

  .setup-header {
    padding: 20px 16px;
  }

  .setup-title {
    font-size: 18px;
  }

  .setup-subtitle {
    font-size: 12px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .setup-body {
    padding: 16px;
  }

  .config-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .minimal-input :deep(.q-field__control) {
    height: 42px;
  }

  .minimal-select :deep(.q-field__control) {
    height: 38px;
  }

  .submit-btn {
    height: 42px;
  }

  .skip-btn {
    height: 42px;
  }

  .button-group {
    gap: 8px;
  }
}
</style>
