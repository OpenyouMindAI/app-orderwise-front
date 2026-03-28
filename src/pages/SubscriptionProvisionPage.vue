<template>
  <div class="success-page-fullscreen">
    <div class="animated-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="content-wrapper">
      <div class="hero-card">
        <div class="hero-badge">
          <q-icon name="bolt" size="18px" />
          <span>Activación automática</span>
        </div>

        <div v-if="loading" class="state-block">
          <div class="spinner-shell">
            <q-spinner-tail size="62px" color="primary" />
          </div>

          <h1 class="hero-title">Estamos dejando tu cuenta lista</h1>
          <p class="hero-text">
            Validamos tu pago, creamos tu empresa, cargamos tus productos y te ingresamos automáticamente.
          </p>

          <div class="steps-list">
            <div
              v-for="(step, index) in steps"
              :key="step.key"
              class="step-item"
              :class="{
                active: currentStepIndex === index,
                done: currentStepIndex > index || (provisionSuccess && currentStepIndex >= index),
                pending: currentStepIndex < index
              }"
            >
              <div class="step-indicator">
                <q-icon v-if="currentStepIndex > index || (provisionSuccess && currentStepIndex >= index)" name="check" size="16px" />
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-copy">
                <div class="step-title">{{ step.label }}</div>
                <div class="step-subtitle">{{ step.description }}</div>
              </div>
            </div>
          </div>

          <div class="loading-caption">
            {{ currentStepLabel }}
          </div>
        </div>

        <div v-else-if="provisionSuccess" class="state-block success-state">
          <div class="success-icon-wrap">
            <q-icon name="task_alt" size="52px" />
          </div>
          <h1 class="hero-title success-title">¡Todo listo!</h1>
          <p class="hero-text">
            Tu empresa ya fue creada, tus productos fueron cargados y estás entrando al sistema.
          </p>

          <div class="details-grid" v-if="paymentDetails">
            <div class="detail-card">
              <span class="detail-label">Pago</span>
              <span class="detail-value">{{ paymentDetails.payment_id }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Monto</span>
              <span class="detail-value">${{ paymentDetails.amount }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Empresa</span>
              <span class="detail-value">{{ paymentDetails.company_name }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Redirección</span>
              <span class="detail-value">Billing</span>
            </div>
          </div>

          <div class="redirect-pill">
            <q-spinner-dots size="20px" color="positive" />
            <span>Ingresando al sistema...</span>
          </div>
        </div>

        <div v-else class="state-block error-state">
          <div class="error-icon-wrap">
            <q-icon name="error_outline" size="52px" />
          </div>
          <h1 class="hero-title">No pudimos completar la activación</h1>
          <p class="hero-text">
            {{ errorMessage }}
          </p>

          <div class="error-actions">
            <q-btn
              color="primary"
              unelevated
              rounded
              no-caps
              size="lg"
              label="Reintentar"
              @click="runProvisionFlow"
            />
            <q-btn
              flat
              color="primary"
              rounded
              no-caps
              size="lg"
              label="Ir al inicio"
              @click="goHome"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { api } from 'boot/axios'
import { connectSession } from 'src/boot/session-tracking'
import { notify } from 'src/const/mixins'
import { usePixel } from 'src/composables/usePixel'
import { authentication } from 'src/stores/module-authentication'

const route = useRoute()
const router = useRouter()
const fbq = usePixel()
const store = authentication()

const loading = ref(true)
const provisionSuccess = ref(false)
const errorMessage = ref('')
const currentStepIndex = ref(0)
const paymentDetails = ref(null)

const steps = [
  {
    key: 'validating-payment',
    label: 'Validando pago',
    description: 'Comprobamos el estado del pago en Mercado Pago.'
  },
  {
    key: 'payment-validated',
    label: 'Pago validado',
    description: 'Tu pago fue aprobado correctamente.'
  },
  {
    key: 'creating-company',
    label: 'Creando tu empresa',
    description: 'Estamos preparando tu empresa y configuración inicial.'
  },
  {
    key: 'creating-user',
    label: 'Creando tu usuario',
    description: 'Generamos tu acceso y dejamos todo listo para usar.'
  }
]

const currentStepLabel = computed(() => steps[currentStepIndex.value]?.label || 'Procesando')

const launchConfetti = () => {
  const defaults = { origin: { y: 0.7 } }
  const fire = (particleRatio, opts) => confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(200 * particleRatio)
  })

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const resolveBusinessTypeId = () => {
  return route.query.business_type_id ||
    localStorage.getItem('mp_business_type_id') ||
    store.userSession?.company_session?.business_type?.id ||
    store.userSession?.companySession?.businessType?.id ||
    null
}

const cleanupPaymentStorage = () => {
  localStorage.removeItem('mp_preference_id')
  localStorage.removeItem('mp_plan_id')
  localStorage.removeItem('mp_plan_name')
  localStorage.removeItem('mp_business_type_id')
}

const persistProvisionSession = async (data) => {
  store.setSessionData({
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    refresh_token: data.refresh_token || null,
    user: data.user,
    is_demo: data.is_demo || false
  })

  store.setSubscriptionData({
    subscription: data.subscription,
    plan: data.subscription?.plan,
    has_api_access: data.subscription?.plan?.has_api_access || false,
    days_left: null
  })

  connectSession(store)
}

const runProvisionFlow = async () => {
  loading.value = true
  provisionSuccess.value = false
  errorMessage.value = ''
  currentStepIndex.value = 0

  try {
    const paymentId = route.query.payment_id
    const businessTypeId = resolveBusinessTypeId()
    const provisionApiKey = import.meta.env.VITE_APP_PROVISION_API_KEY

    if (!paymentId) {
      throw new Error('No se encontró payment_id en la URL de retorno.')
    }

    if (!businessTypeId) {
      throw new Error('No se encontró business_type_id para completar el alta automática.')
    }

    if (!provisionApiKey) {
      throw new Error('Falta configurar VITE_APP_PROVISION_API_KEY en el frontend.')
    }

    currentStepIndex.value = 0
    const checkResponse = await api.post('mercadopago/check-payment', {
      payment_id: paymentId
    })

    if (checkResponse.data.status !== 'approved') {
      throw new Error(checkResponse.data.status_detail || 'El pago todavía no figura como aprobado.')
    }

    currentStepIndex.value = 1
    await sleep(600)

    paymentDetails.value = {
      payment_id: paymentId,
      amount: checkResponse.data.transaction_amount,
      company_name: 'Nueva empresa',
      date: checkResponse.data.date_approved
    }

    if (fbq?.event) {
      fbq.event('Purchase', {
        value: checkResponse.data.transaction_amount,
        currency: 'ARS',
        content_name: localStorage.getItem('mp_plan_name') || 'Suscripción',
        content_type: 'product',
        transaction_id: paymentId
      })
    }

    currentStepIndex.value = 2

    const provisionPromise = api.post(
      'mercadopago/provision-account',
      {
        payment_id: paymentId,
        business_type_id: Number(businessTypeId)
      },
      {
        headers: {
          'X-API-Key': provisionApiKey
        }
      }
    )

    const stepTimer = setTimeout(() => {
      currentStepIndex.value = 3
    }, 900)

    const { data } = await provisionPromise
    clearTimeout(stepTimer)
    currentStepIndex.value = 3

    await persistProvisionSession(data)

    paymentDetails.value = {
      payment_id: paymentId,
      amount: data.payment?.transaction_amount || checkResponse.data.transaction_amount,
      company_name: data.company?.name || 'Nueva empresa',
      date: checkResponse.data.date_approved
    }

    cleanupPaymentStorage()
    launchConfetti()
    provisionSuccess.value = true
    loading.value = false

    notify('Pago validado y cuenta creada correctamente', 'positive', 'task_alt')

    await sleep(1500)
    router.replace({ name: 'Billing' })
  } catch (error) {
    console.error('[SubscriptionProvisionPage] Error en activación automática:', error)
    loading.value = false
    provisionSuccess.value = false
    errorMessage.value = error.response?.data?.message || error.message || 'No se pudo completar el alta automática.'
    notify(errorMessage.value, 'negative', 'warning')
  }
}

const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(() => {
  runProvisionFlow()
})
</script>

<style scoped>
.success-page-fullscreen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.animated-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #ecfeff 100%);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.06) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
}

.blob-1 {
  width: 420px;
  height: 420px;
  background: rgba(99, 102, 241, 0.30);
  top: -120px;
  right: -100px;
  animation: float 12s ease-in-out infinite;
}

.blob-2 {
  width: 340px;
  height: 340px;
  background: rgba(14, 165, 233, 0.25);
  left: -80px;
  bottom: -80px;
  animation: float 14s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(25px, 30px); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 620px;
  padding: 24px;
}

.hero-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-radius: 28px;
  box-shadow: 0 20px 70px rgba(15, 23, 42, 0.12);
  padding: 32px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.14);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.spinner-shell,
.success-icon-wrap,
.error-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.spinner-shell {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.10), rgba(14, 165, 233, 0.10));
}

.success-icon-wrap {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(16, 185, 129, 0.12));
  color: #16a34a;
}

.error-icon-wrap {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.14), rgba(248, 113, 113, 0.12));
  color: #dc2626;
}

.hero-title {
  font-size: 32px;
  line-height: 1.08;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
  letter-spacing: -0.03em;
}

.success-title {
  background: linear-gradient(135deg, #16a34a, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-text {
  font-size: 16px;
  line-height: 1.65;
  color: #64748b;
  max-width: 500px;
  margin: 0 0 24px;
}

.steps-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  transition: 0.25s ease;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.72);
}

.step-item.active {
  border-color: rgba(79, 70, 229, 0.35);
  background: rgba(79, 70, 229, 0.06);
  transform: translateY(-1px);
}

.step-item.done {
  border-color: rgba(34, 197, 94, 0.24);
  background: rgba(34, 197, 94, 0.06);
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
  font-size: 13px;
  background: #e2e8f0;
  color: #475569;
}

.step-item.active .step-indicator {
  background: #4f46e5;
  color: white;
}

.step-item.done .step-indicator {
  background: #16a34a;
  color: white;
}

.step-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 3px;
}

.step-subtitle {
  font-size: 13px;
  color: #64748b;
  line-height: 1.45;
}

.loading-caption,
.redirect-pill {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: #334155;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
}

.details-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 10px 0 8px;
}

.detail-card {
  text-align: left;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.16);
  padding: 14px 16px;
}

.detail-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.detail-value {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 640px) {
  .hero-card {
    padding: 24px 18px;
    border-radius: 24px;
  }

  .hero-title {
    font-size: 27px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    padding: 12px 13px;
  }
}
</style>
