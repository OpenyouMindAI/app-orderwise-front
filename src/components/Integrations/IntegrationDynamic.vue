<template>
  <div>
  <q-dialog v-model="showDialog" @hide="onHide">
    <q-card class="pedidosya-dialog">
      <!-- Header con logo -->
      <q-card-section class="pedidosya-header" :style="{ background: integration?.color || 'linear-gradient(135deg, #ee2e43 0%, #d41f33 100%)' }">
        <div class="header-content">
          <q-img
            v-if="integration?.logo_url"
            :src="integration.logo_url"
            class="pedidosya-logo"
            :alt="integration.name"
          />
          <div v-else class="logo-placeholder">
            <q-icon name="extension" size="48px" color="white" />
          </div>
        </div>
      </q-card-section>

      <!-- Skeleton Loader -->
      <q-card-section v-if="loadingIntegration" class="form-section">
        <div class="skeleton-container">
          <!-- Title skeleton -->
          <div class="skeleton-title-wrapper">
            <q-skeleton type="text" width="60%" height="32px" class="skeleton-title" />
          </div>

          <!-- Description skeleton -->
          <div class="skeleton-description-wrapper">
            <q-skeleton type="text" width="80%" height="16px" class="q-mb-xs" />
            <q-skeleton type="text" width="70%" height="16px" />
          </div>

          <!-- Form fields skeleton -->
          <div class="skeleton-fields">
            <div v-for="i in 3" :key="i" class="skeleton-field">
              <q-skeleton type="rect" height="56px" class="skeleton-input" />
            </div>
          </div>

          <!-- Security message skeleton -->
          <div class="skeleton-message">
            <q-skeleton type="text" width="50%" height="14px" />
          </div>
        </div>
      </q-card-section>

      <!-- Error Section -->
      <q-card-section v-else-if="connectionError && !downloadData" class="error-section">
        <div class="error-content">
          <div class="error-icon-wrapper">
            <q-icon
              name="error"
              class="error-icon"
              color="negative"
            />
          </div>

          <div class="text-h6 text-grey-8 q-mb-sm">
            Error de Conexión
          </div>

          <p class="text-body2 text-negative q-mb-md">
            {{ connectionError }}
          </p>

          <q-banner v-if="errorType === 'validation_error'" class="bg-orange-1 text-orange-9 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            <div class="text-body2">
              Las credenciales no tienen el formato correcto. Por favor verifica los datos ingresados.
            </div>
          </q-banner>

          <q-banner v-else-if="errorType === 'connection_error'" class="bg-red-1 text-red-9 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="cloud_off" color="negative" />
            </template>
            <div class="text-body2">
              No se pudo conectar con el servicio externo. Verifica que las credenciales sean correctas.
            </div>
          </q-banner>

          <!-- Connection History -->
          <div v-if="connectionHistory.length > 0" class="history-section q-mt-lg">
            <div class="text-subtitle2 text-grey-7 q-mb-md">
              <q-icon name="history" class="q-mr-xs" />
              Historial de Intentos
            </div>

            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="(attempt, index) in connectionHistory.slice(0, 5)"
                :key="index"
                class="history-item"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="attempt.success ? 'check_circle' : 'cancel'"
                    :color="attempt.success ? 'positive' : 'negative'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ attempt.success ? 'Conexión exitosa' : 'Conexión fallida' }}
                  </q-item-label>
                  <q-item-label caption v-if="!attempt.success">
                    {{ attempt.error_message }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ formatDate(attempt.attempted_at) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <q-btn
            unelevated
            color="primary"
            label="Intentar de nuevo"
            icon="refresh"
            class="full-width q-mt-lg"
            @click="resetError"
          />
        </div>
      </q-card-section>

      <!-- Already Connected Section -->
      <q-card-section v-else-if="isAlreadyConnected && !downloadData && !connectionError" class="connected-section">
        <div class="connected-content">
          <div class="connected-icon-wrapper">
            <q-icon
              name="check_circle"
              class="connected-icon"
              color="positive"
            />
          </div>

          <div class="text-h6 text-grey-8 q-mb-sm">
            ¡Integración Activa!
          </div>

          <p class="text-body2 text-grey-6 q-mb-lg">
            Esta integración ya está conectada y funcionando correctamente.
          </p>

          <!-- Webhook Section -->
          <div v-if="webhookUrl" class="webhook-section">
            <div class="webhook-header">
              <q-icon name="webhook" size="20px" color="primary" class="q-mr-sm" />
              <span class="text-subtitle2 text-grey-8">URL de Webhook</span>
            </div>

            <q-banner class="webhook-banner q-mt-md" rounded>
              <template v-slot:avatar>
                <q-icon name="info" color="primary" />
              </template>
              <div class="text-body2 text-grey-8">
                Copia esta URL y pégala en la configuración de tu aplicación en <strong>{{ integration?.name }}</strong>.
                Esto permitirá que recibamos notificaciones automáticas de eventos importantes.
              </div>
            </q-banner>

            <div class="webhook-url-container q-mt-md">
              <q-input
                :model-value="webhookUrl"
                readonly
                filled
                dense
                class="webhook-input"
              >
                <template v-slot:prepend>
                  <q-icon name="link" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="content_copy"
                    color="primary"
                    @click="copyWebhookUrl"
                  >
                    <q-tooltip>Copiar URL</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
            </div>

            <div class="text-caption text-grey-6 q-mt-sm text-center">
              <q-icon name="lock" size="14px" class="q-mr-xs" />
              Esta URL es única para tu empresa y está protegida
            </div>
          </div>

          <!-- Connection Info -->
          <div class="connection-info q-mt-lg">
            <q-separator class="q-mb-md" />
            <div class="text-caption text-grey-6 text-center">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              Conectado desde {{ formatDate(companyIntegration?.created_at) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Formulario de credenciales -->
      <q-card-section v-else-if="!downloadData && !connectionError && !isAlreadyConnected" class="form-section">
        <div class="text-h6 text-center q-mb-md text-grey-8">
          Configurar {{ integration?.name || 'Integración' }}
        </div>
        <p class="text-body2 text-center text-grey-6 q-mb-lg">
          {{ integration?.description || 'Ingresa tus credenciales para conectar esta integración' }}
        </p>

        <q-form @submit="handleConnect" class="q-gutter-md">
          <div
            v-for="field in integration?.fields"
            :key="field.name"
          >
            <q-input
              v-model="configForm[field.name]"
              :label="field.label"
              :type="field.type === 'password' ? (showPasswords[field.name] ? 'text' : 'password') : field.type"
              :placeholder="field.placeholder"
              :rules="field.required ? [val => !!val || `${field.label} es requerido`] : []"
              filled
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon
                  :name="getFieldIcon(field.type)"
                  color="grey-6"
                />
              </template>
              <template v-if="field.type === 'password'" v-slot:append>
                <q-icon
                  :name="showPasswords[field.name] ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="togglePasswordVisibility(field.name)"
                />
              </template>
            </q-input>
          </div>

          <div class="text-caption text-grey-6 q-mt-md text-center">
            <q-icon name="lock" size="16px" class="q-mr-xs" />
            Tus credenciales se almacenan de forma segura y encriptada
          </div>
        </q-form>
      </q-card-section>

      <!-- Pantalla de éxito -->
      <q-card-section v-else class="success-section">
        <div class="success-content">
          <div class="success-icon-wrapper">
            <q-icon
              name="check_circle"
              class="success-icon"
              color="positive"
            />
          </div>

          <div class="text-h6 text-grey-8 q-mb-sm">
            ¡Conexión exitosa!
          </div>

          <p class="text-body2 text-grey-6 q-mb-lg">
            El certificado fue creado y autorizado correctamente
          </p>

          <div class="download-buttons">
            <q-btn
              :href="downloadData.certificate_url"
              target="_blank"
              unelevated
              color="primary"
              icon="download"
              label="Descargar certificado"
              class="full-width q-mb-sm"
            />
            <q-btn
              :href="downloadData.key_url"
              target="_blank"
              unelevated
              color="secondary"
              icon="vpn_key"
              label="Descargar clave privada"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions v-if="!downloadData && !loadingIntegration && !isAlreadyConnected" align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          v-close-popup
        />
        <q-btn
          unelevated
          label="Guardar"
          color="primary"
          @click="handleConnect"
          :loading="loading"
          :disable="!isFormValid"
        />
      </q-card-actions>

      <q-card-actions v-else-if="downloadData || isAlreadyConnected" align="center" class="q-pa-md">
        <q-btn
          unelevated
          label="Cerrar"
          color="primary"
          v-close-popup
          class="q-px-xl"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- App Linked Success Modal -->
  <q-dialog v-model="showLinkedModal" persistent>
    <q-card style="width: 420px; max-width: 90vw; border-radius: 16px; overflow: hidden;">
      <!-- Animated Header -->
      <div class="linked-modal-header">
        <div class="linked-modal-circles">
          <div class="circle circle--lg"></div>
          <div class="circle circle--sm"></div>
        </div>
        <q-icon name="link" size="56px" color="white" class="linked-icon" />
      </div>

      <q-card-section class="q-pa-xl text-center">
        <div class="text-h6 text-weight-bolder q-mb-sm">¡Webhook Configurado!</div>
        <p class="text-body2 text-grey-7 q-mb-md">
          Tu cuenta de <strong>Mercado Pago</strong> fue vinculada exitosamente.
          A partir de ahora, recibirás notificaciones de transferencias en tiempo real.
        </p>

        <q-banner v-if="linkedPaymentMethod" class="bg-green-1 text-green-9 rounded-borders q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="check_circle" color="green" />
          </template>
          <div class="text-body2">
            Método de pago <strong>{{ linkedPaymentMethod.name }}</strong>
            ({{ linkedPaymentMethod.acronym }}) creado automáticamente.
          </div>
        </q-banner>

        <div class="text-caption text-grey-6">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          Este modal se cierra automáticamente o presioná Aceptar.
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md q-pt-none">
        <q-btn
          unelevated
          label="Aceptar"
          color="primary"
          icon-right="check"
          class="full-width"
          style="height:48px; border-radius: 10px;"
          no-caps
          @click="confirmLinked"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, getCurrentInstance } from 'vue'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  download: {
    type: Object,
    default: null
  },
  integrationSlug: {
    type: String,
    default: 'pedidos-ya'
  }
})

const emit = defineEmits(['update:modelValue', 'connect', 'linked', 'payment-method-created'])

const showDialog = ref(props.modelValue)
const integration = ref(null)
const configForm = ref({})
const showPasswords = ref({})
const loading = ref(false)
const loadingIntegration = ref(false)
const downloadData = ref(props.download)
const connectionError = ref(null)
const errorType = ref(null)
const connectionHistory = ref([])
const isAlreadyConnected = ref(false)
const companyIntegration = ref(null)
const webhookUrl = ref(null)
const store = authentication()

const company = computed(() => store.userSession?.company_session)

const branch = computed(() => store.branchOffice)

const isFormValid = computed(() => {
  if (!integration.value?.fields) return false

  return integration.value.fields
    .filter(f => f.required)
    .every(f => configForm.value[f.name])
})

const getFieldIcon = (type) => {
  const icons = {
    text: 'text_fields',
    password: 'lock',
    email: 'email',
    url: 'link',
    number: 'numbers'
  }
  return icons[type] || 'text_fields'
}

const togglePasswordVisibility = (fieldName) => {
  showPasswords.value[fieldName] = !showPasswords.value[fieldName]
}

const loadIntegration = async () => {
  loadingIntegration.value = true
  try {
    const { data } = await api.get('company-integrations/available')
    integration.value = data.find(i => i.slug === props.integrationSlug)

    if (integration.value) {
      // Check if already connected
      if (integration.value.is_configured) {
        await loadCompanyIntegration()
        await loadConnectionHistory()
      } else {
        // Initialize form with empty values
        integration.value.fields?.forEach(field => {
          configForm.value[field.name] = ''
        })
      }
    }
  } catch (error) {
    console.error('Error loading integration:', error)
  } finally {
    loadingIntegration.value = false
  }
}

const loadCompanyIntegration = async () => {
  try {
    const { data: companyIntegrations } = await api.get('company-integrations')
    const found = companyIntegrations.find(
      ci => ci.integration.slug === props.integrationSlug
    )

    if (found) {
      companyIntegration.value = found
      isAlreadyConnected.value = true
      // Generate webhook URL if integration supports it
      if (integration.value.has_webhook) {
        const apiBaseUrl = process.env.VITE_APP_API_URL || 'http://localhost:8000'
        webhookUrl.value = `${apiBaseUrl}webhook/${props.integrationSlug}?company_id=${company.value.id}&branch_id=${branch.value.id}`
      }
    }
  } catch (error) {
    console.error('Error loading company integration:', error)
  }
}

const loadConnectionHistory = async () => {
  try {
    // Get company integrations to find the ID
    const { data: companyIntegrations } = await api.get('company-integrations')
    const companyIntegration = companyIntegrations.find(
      ci => ci.integration.slug === props.integrationSlug
    )

    if (companyIntegration) {
      const { data } = await api.get(`company-integrations/${companyIntegration.id}/connection-history`)
      connectionHistory.value = data.history || []
    }
  } catch (error) {
    console.error('Error loading connection history:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const resetError = () => {
  connectionError.value = null
  errorType.value = null
}

const copyWebhookUrl = () => {
  if (webhookUrl.value) {
    navigator.clipboard.writeText(webhookUrl.value)
    Notify.create({
      message: 'URL copiada al portapapeles',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    })
  }
}

watch(() => props.modelValue, (newVal) => {
  showDialog.value = newVal
  // Always reload integration when dialog opens
  if (newVal) {
    loadIntegration()
    startLinkListener()
  } else {
    stopLinkListener()
  }
})

watch(() => props.download, (newVal) => {
  downloadData.value = newVal
})

watch(showDialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConnect = async () => {
  loading.value = true
  connectionError.value = null
  errorType.value = null

  try {
    const { data } = await api.post('company-integrations', {
      integration_id: integration.value.id,
      credentials: configForm.value
    })

    if (data.success) {
      // Check if there's connection data (like ARCA certificates)
      if (data.data.connection_data) {
        downloadData.value = data.data.connection_data
      } else {
        // Success without download data
        emit('connect', data)
        showDialog.value = false
      }
    }
  } catch (error) {
    console.log('Connection error:', error)

    if (error) {
      if (error.status === 400 && error.data) {
        connectionError.value = error.data.error || 'Error al conectar con la integración'
        errorType.value = error.data.error_type || 'connection_error'
      } else {
        connectionError.value = error.data?.message || 'Error inesperado al conectar'
        errorType.value = 'connection_error'
      }
    } else {
      connectionError.value = error?.message || 'Error de conexión desconocido'
      errorType.value = 'connection_error'
    }

    // Reload connection history after failed attempt
    try {
      await loadConnectionHistory()
    } catch (historyError) {
      console.error('Error loading connection history:', historyError)
    }
  } finally {
    loading.value = false
  }
}

const onHide = () => {
  configForm.value = {}
  showPasswords.value = {}
  downloadData.value = null
  connectionError.value = null
  errorType.value = null
  connectionHistory.value = []
  integration.value = null
  isAlreadyConnected.value = false
  companyIntegration.value = null
  webhookUrl.value = null
  stopLinkListener()
}

// ─────────────────────────────────────────────────────────
// App-Linking Echo listener
// ─────────────────────────────────────────────────────────

/**
 * Whether the linking success modal is visible
 * @type {boolean}
 */
const showLinkedModal = ref(false)

/**
 * The payment method auto-created on linking
 * @type {object|null}
 */
const linkedPaymentMethod = ref(null)

/**
 * Reference to the active Echo channel subscription
 * @type {any}
 */
let linkChannel = null

/**
 * Start listening for the app-linked event on the Echo channel.
 * @return {void}
 */
const startLinkListener = () => {
  if (!company.value?.id || !branch.value?.id) return

  const { proxy } = getCurrentInstance() ?? {}
  const echoPay = proxy?.$echoPay
  if (!echoPay) return

  const channelName = 'mercado-pago-link'
  const eventName = `.mercado-pago-linked.${company.value.id}.${branch.value.id}`

  console.log('Listening for event:', eventName)

  linkChannel = echoPay.channel(channelName)
  linkChannel.listen(eventName, (data) => {
    linkedPaymentMethod.value = data.payment_method || null
    showLinkedModal.value = true
    emit('linked', data)
  })
}

/**
 * Stop listening and leave the Echo channel.
 * @return {void}
 */
const stopLinkListener = () => {
  if (linkChannel) {
    try {
      const { proxy } = getCurrentInstance() ?? {}
      proxy?.$echoPay?.leaveChannel('mercado-pago-link')
    } catch (_) {}
    linkChannel = null
  }
}

/**
 * Confirm the app-linked modal and refresh integration data.
 * @return {void}
 */
const confirmLinked = async () => {
  showLinkedModal.value = false
  linkedPaymentMethod.value = null
  emit('payment-method-created')
  // Reload integration data so the dialog reflects the latest state
  await loadIntegration()
}

onBeforeUnmount(() => {
  stopLinkListener()
})
</script>

<style scoped lang="scss">
.pedidosya-dialog {
  width: 550px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.pedidosya-header {
  background: linear-gradient(135deg, #ee2e43 0%, #d41f33 100%);
  padding: 40px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pedidosya-logo {
  width: 320px;
  max-width: 70vw;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.logo-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-section {
  padding: 32px 24px;
}

.success-section {
  padding: 48px 24px;
}

.error-section {
  padding: 48px 24px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.error-icon-wrapper {
  margin-bottom: 24px;
  animation: shake 0.5s ease-out;
}

.error-icon {
  font-size: 120px;
  filter: drop-shadow(0 4px 12px rgba(244, 67, 54, 0.3));
}

.connected-section {
  padding: 48px 24px;
}

.connected-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.connected-icon-wrapper {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
}

.connected-icon {
  font-size: 120px;
  filter: drop-shadow(0 4px 12px rgba(33, 186, 69, 0.3));
}

.webhook-section {
  width: 100%;
  max-width: 500px;
  margin-top: 24px;
}

.webhook-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.webhook-banner {
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%);
  border: 1px solid #90caf9;
}

body.body--dark .webhook-banner {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.webhook-url-container {
  width: 100%;
}

.webhook-input :deep(.q-field__control) {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

body.body--dark .webhook-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.webhook-input :deep(.q-field__native) {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #1976d2;
}

body.body--dark .webhook-input :deep(.q-field__native) {
  color: #64b5f6;
}

.connection-info {
  width: 100%;
  max-width: 500px;
}

.history-section {
  width: 100%;
  max-width: 500px;
  text-align: left;
}

.history-item {
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

body.body--dark .history-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon-wrapper {
  margin-bottom: 24px;
  animation: scaleIn 0.5s ease-out;
}

.success-icon {
  font-size: 120px;
  filter: drop-shadow(0 4px 12px rgba(33, 186, 69, 0.3));
}

.download-buttons {
  width: 100%;
  max-width: 400px;
  margin-top: 16px;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-btn) {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.3px;
}

/* Skeleton Loader Styles */
.skeleton-container {
  animation: fadeIn 0.3s ease-in;
}

.skeleton-title-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.skeleton-title {
  border-radius: 8px;
}

.skeleton-description-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.skeleton-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.skeleton-field {
  width: 100%;
}

.skeleton-input {
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-message {
  display: flex;
  justify-content: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

:deep(.q-skeleton) {
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.08) 50%,
    rgba(0, 0, 0, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

body.body--dark :deep(.q-skeleton) {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

<style scoped lang="scss">
.linked-modal-header {
  background: linear-gradient(135deg, #00b1ea 0%, #009fd4 100%);
  padding: 40px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.linked-modal-circles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);

  &--lg {
    width: 240px;
    height: 240px;
    top: -80px;
    right: -60px;
  }

  &--sm {
    width: 140px;
    height: 140px;
    bottom: -50px;
    left: -40px;
  }
}

.linked-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.2));
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
</style>
