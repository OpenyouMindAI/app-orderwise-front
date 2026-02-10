<template>
  <div class="success-page-fullscreen">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>

    <div class="content-wrapper">
      <transition name="scale-fade" mode="out-in">
        <div v-if="loading" class="card loading-card" key="loading">
          <div class="spinner-container">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
            </svg>
          </div>
          <h2 class="card-title">Verificando pago</h2>
          <p class="card-text">Un momento por favor...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="paymentVerified" class="card success-card" key="success">
          <div class="icon-container success-icon">
            <svg viewBox="0 0 24 24" class="check-svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>

          <h1 class="card-title text-gradient">¡Todo listo!</h1>
          <p class="card-text">Tu suscripción ha sido activada correctamente.</p>

          <div class="divider"></div>

          <!-- Payment Details (Compact) -->
          <div class="details-grid" v-if="paymentDetails">
            <div class="detail-item">
              <span class="label">Plan</span>
              <span class="value">{{ paymentDetails.plan_name }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Monto</span>
              <span class="value">${{ paymentDetails.amount }}</span>
            </div>
          </div>

          <h1 class="success-title fade-in-up">¡Pago Exitoso!</h1>
          <p class="success-subtitle fade-in-up delay-1">
            Tu suscripción ha sido activada correctamente
          </p>

          <!-- Payment Details Card -->
          <div v-if="paymentDetails" class="details-card fade-in-up delay-2">
            <div class="detail-row">
              <span class="detail-label">Plan</span>
              <span class="detail-value">{{ paymentDetails.plan_name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Monto</span>
              <span class="detail-value">${{ paymentDetails.amount }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ID de Pago</span>
              <span class="detail-value detail-id">{{ paymentDetails.payment_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha</span>
              <span class="detail-value">{{ paymentDetails.date }}</span>
            </div>
          </div>

          <!-- Action Button -->
          <button @click="goHome" class="action-button fade-in-up delay-3">
            <span>{{ needsCompanySetup ? 'Configurar mi empresa' : 'Ir al Inicio' }}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Error State -->
        <div v-else class="card error-card" key="error">
          <div class="icon-container error-icon">
            <svg viewBox="0 0 24 24" class="cross-svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
          <h2 class="card-title">Algo salió mal</h2>
          <p class="card-text">no pudimos verificar tu pago autom&aacute;ticamente.</p>
          <button @click="goHome" class="btn-secondary">Volver al inicio</button>
        </div>

      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { notify } from 'src/const/mixins'
import { api } from 'boot/axios'
import { usePixel } from 'src/composables/usePixel'
import { authentication } from 'src/stores/module-authentication'
import confetti from 'canvas-confetti'

export default {
  name: 'SubscriptionSuccessPage',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const fbq = usePixel()
    const store = authentication()

    const loading = ref(true)
    const paymentVerified = ref(false)
    const paymentDetails = ref(null)

    const launchConfetti = () => {
      const count = 200
      const defaults = {
        origin: { y: 0.7 }
      }

      function fire (particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }))
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55
      })
      fire(0.2, {
        spread: 60
      })
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      })
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      })
      fire(0.1, {
        spread: 120,
        startVelocity: 45
      })
    }

    /**
     * Check if the user needs to configure their company
     */
    const needsCompanySetup = computed(() => {
      return !store.userSession?.company_session?.id
    })

    /**
     * Verificar el estado del pago con Mercado Pago
     */
    const verifyPayment = async () => {
      try {
        // Obtener parámetros de la URL
        const paymentId = route.query.payment_id
        const preferenceId = route.query.preference_id

        console.log('[Success Page] Verificando pago:', { paymentId, preferenceId })

        if (!paymentId) {
          console.warn('[Success Page] No payment_id en URL')
          // Asumir éxito si no hay payment_id pero hay preference_id
          if (preferenceId) {
            paymentVerified.value = true
            launchConfetti()
            // Esperar un momento para que el webhook procese el pago
            await new Promise(resolve => setTimeout(resolve, 2000))
            // Recargar suscripción
            await reloadSubscription()
            return
          }
          throw new Error('No se encontró ID de pago')
        }

        // Verificar estado del pago en el backend
        const response = await api.post('mercadopago/check-payment', {
          payment_id: paymentId
        })

        console.log('[Success Page] Estado del pago:', response.data)

        if (response.data.status === 'approved') {
          paymentVerified.value = true

          // Obtener datos del pago para crear la suscripción
          const metadata = response.data.metadata || {}
          let planId = metadata.plan_id || localStorage.getItem('mp_plan_id')
          let branchCount = metadata.branch_count || 1
          let months = metadata.months || 1

          // Fallback: Decodificar external_reference
          if (!planId && response.data.external_reference) {
            try {
              const ext = JSON.parse(atob(response.data.external_reference))
              if (ext.plan_id) planId = ext.plan_id
              if (ext.branch_count) branchCount = ext.branch_count
              if (ext.months) months = ext.months
            } catch (e) {
              console.error('[Success Page] Error decoding external_reference', e)
            }
          }

          paymentDetails.value = {
            plan_name: localStorage.getItem('mp_plan_name') || 'Plan Pro',
            amount: response.data.transaction_amount,
            payment_id: paymentId,
            date: new Date(response.data.date_approved).toLocaleDateString('es-AR')
          }

          if (!planId) {
            console.error('[Success Page] Error: No se pudo obtener el plan_id')
          } else {
            // Intentar crear/asignar la suscripción
            try {
              await api.post('subscriptions', {
                subscription_plan_id: planId,
                branch_offices_count: branchCount,
                months,
                payment_id: paymentId,
                payment_method: 'mercadopago'
              })
              launchConfetti()
            } catch (subError) {
              if (subError.response && subError.response.status === 400) {
                // Ignorar si ya existe
              } else {
                console.error('[Success Page] Error creando suscripción:', subError)
              }
            }
          }

          // Pixel Event
          if (fbq?.event) {
            fbq.event('Purchase', {
              value: response.data.transaction_amount,
              currency: 'ARS',
              content_name: paymentDetails.value.plan_name,
              content_type: 'product',
              transaction_id: paymentId
            })
          }

          // Limpiar localStorage
          localStorage.removeItem('mp_preference_id')
          localStorage.removeItem('mp_plan_id')
          localStorage.removeItem('mp_plan_name')

          // Esperar un momento para que el webhook procese el pago (y opcionalmente vincule el usuario si el backend lo hace automático)
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Recargar suscripción actual y datos del usuario
          await reloadSubscription()
        } else {
          paymentVerified.value = false
        }
      } catch (error) {
        console.error('[Success Page] Error verificando pago:', error)
        // Fallback optimista
        paymentVerified.value = true
        launchConfetti()
        try {
          await new Promise(resolve => setTimeout(resolve, 2000))
          await reloadSubscription()
        } catch (e) {
          console.error(e)
        }
      } finally {
        loading.value = false
      }
    }

    /**
     * Recargar la suscripción actual del usuario y sus datos de sesión
     */
    const reloadSubscription = async () => {
      try {
        console.log('[Success Page] Recargando suscripción y sesión...')
        const response = await api.get('subscriptions/current')
        console.log('[Success Page] Suscripción actualizada:', response.data)

        // Actualizar el store de autenticación con la nueva suscripción
        store.setSubscriptionData(response.data)

        // También intentar refrescar el perfil del usuario para ver si ya tiene empresa vinculada
        const userResponse = await api.get('authentication/user')
        if (userResponse.data) {
          store.userSession = userResponse.data
        }

        // Emitir evento para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: response.data
        }))
      } catch (error) {
        console.error('[Success Page] Error recargando suscripción:', error)
      }
    }

    /**
     * Navegar según el estado de la empresa
     */
    const goHome = () => {
      if (paymentVerified.value) {
        notify('¡Suscripción activada!', 'positive', 'check_circle')
      }

      if (needsCompanySetup.value) {
        // Redirigir a la home con los parámetros de pago para que MainLayout active el modal de setup
        router.push({
          path: '/',
          query: {
            status: 'approved',
            payment_id: route.query.payment_id,
            preference_id: route.query.preference_id
          }
        })
      } else {
        // Si ya tiene empresa, ir directo al inicio
        router.push('/')
      }
    }

    onMounted(() => {
      verifyPayment()
    })

    return {
      loading,
      paymentVerified,
      paymentDetails,
      goHome,
      needsCompanySetup
    }
  }
}
</script>

<style scoped>
/* Main Container */
.success-page-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Background Blobs */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #c7d2fe; /* indigo-200 */
  top: -100px;
  right: -100px;
  animation: float 10s ease-in-out infinite;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: #bae6fd; /* sky-200 */
  bottom: -50px;
  left: -50px;
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, 30px); }
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

/* Card Styles */
.card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow:
    0 10px 40px -10px rgba(0,0,0,0.08),
    0 0 0 1px rgba(255,255,255,0.8) inset;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

/* Typography */
.card-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b; /* slate-800 */
  margin: 16px 0 8px;
  letter-spacing: -0.5px;
}

.text-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-text {
  font-size: 16px;
  color: #64748b; /* slate-500 */
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Divider */
.divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0; /* slate-200 */
  margin: 8px 0 24px;
}

/* Icons */
.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.success-icon {
  background: #dcfce7; /* green-100 */
  color: #16a34a; /* green-600 */
}

.error-icon {
  background: #fee2e2; /* red-100 */
  color: #dc2626; /* red-600 */
}

.check-svg, .cross-svg {
  width: 40px;
  height: 40px;
  fill: currentColor;
}

/* Spinner */
.spinner {
  animation: rotate 2s linear infinite;
  width: 50px;
  height: 50px;
}
.spinner .path {
  stroke: #4f46e5;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}
@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* Details Grid */
.details-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
}

.detail-item .label {
  color: #64748b;
}

.detail-item .value {
  font-weight: 600;
  color: #334155;
}

/* Buttons */
.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #334155;
}

/* Transitions */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.4s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
