<template>
  <div class="success-page-fullscreen">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Content Container -->
    <div class="content-container">
      <!-- Loading State -->
      <transition name="fade">
        <div v-if="loading" class="state-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <h2 class="state-title fade-in-up">Verificando tu pago</h2>
          <p class="state-subtitle fade-in-up delay-1">Esto solo tomará un momento...</p>
        </div>
      </transition>

      <!-- Success State -->
      <transition name="fade">
        <div v-if="!loading && paymentVerified" class="state-content">
          <!-- Success Icon with Animation -->
          <div class="success-icon-container">
            <div class="success-checkmark">
              <div class="check-icon">
                <span class="icon-line line-tip"></span>
                <span class="icon-line line-long"></span>
                <div class="icon-circle"></div>
                <div class="icon-fix"></div>
              </div>
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
            <span>Ir al Dashboard</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </transition>

      <!-- Error State -->
      <transition name="fade">
        <div v-if="!loading && !paymentVerified" class="state-content">
          <div class="error-icon-container">
            <div class="error-icon">⚠️</div>
          </div>

          <h2 class="error-title fade-in-up">No se pudo verificar el pago</h2>
          <p class="error-subtitle fade-in-up delay-1">
            Por favor, contacta con soporte si el problema persiste
          </p>

          <button @click="goHome" class="action-button secondary fade-in-up delay-2">
            <span>Volver al inicio</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { notify } from 'src/const/mixins'
import { api } from 'boot/axios'
import { useFbq } from 'vue3-facebook-pixel'

export default {
  name: 'SubscriptionSuccessPage',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const fbq = useFbq()

    const loading = ref(true)
    const paymentVerified = ref(false)
    const paymentDetails = ref(null)

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
            // Esperar un momento para que el webhook procese el pago
            await new Promise(resolve => setTimeout(resolve, 2000))
            // Recargar suscripción
            await reloadSubscription()
            return
          }
          throw new Error('No se encontró ID de pago')
        }

        // Verificar estado del pago en el backend
        const response = await api.post('mercadopago/check-payment-status', {
          payment_id: paymentId
        })

        console.log('[Success Page] Estado del pago:', response.data)

        if (response.data.status === 'approved') {
          paymentVerified.value = true
          paymentDetails.value = {
            plan_name: localStorage.getItem('mp_plan_name') || 'Plan Pro',
            amount: response.data.transaction_amount,
            payment_id: paymentId,
            date: new Date(response.data.date_approved).toLocaleDateString('es-AR')
          }

          // Pixel Event: Purchase
          // Pixel Event: Purchase
          if (fbq?.event) {
            fbq.event('Purchase', {
              value: response.data.transaction_amount,
              currency: response.data.currency_id || 'ARS',
              content_name: paymentDetails.value.plan_name
            })
          }

          // Limpiar localStorage
          localStorage.removeItem('mp_preference_id')
          localStorage.removeItem('mp_plan_id')
          localStorage.removeItem('mp_plan_name')

          // Esperar un momento para que el webhook procese el pago
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Recargar suscripción actual
          await reloadSubscription()
        } else {
          console.warn('[Success Page] Pago no aprobado:', response.data.status)
          paymentVerified.value = false
        }
      } catch (error) {
        console.error('[Success Page] Error verificando pago:', error)
        // En caso de error, asumir éxito si llegamos desde MP
        paymentVerified.value = true
        // Intentar recargar suscripción de todos modos
        try {
          await new Promise(resolve => setTimeout(resolve, 2000))
          await reloadSubscription()
        } catch (e) {
          console.error('[Success Page] Error recargando suscripción:', e)
        }
      } finally {
        loading.value = false
      }
    }

    /**
     * Recargar la suscripción actual del usuario
     */
    const reloadSubscription = async () => {
      try {
        console.log('[Success Page] Recargando suscripción...')
        const response = await api.get('subscriptions/current')
        console.log('[Success Page] Suscripción actualizada:', response.data)

        // Emitir evento para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: response.data
        }))
      } catch (error) {
        console.error('[Success Page] Error recargando suscripción:', error)
      }
    }

    const goHome = () => {
      if (paymentVerified.value) {
        notify('¡Suscripción activada exitosamente!', 'positive', 'check_circle')
      }
      router.push('/')
    }

    onMounted(() => {
      verifyPayment()
    })

    return {
      loading,
      paymentVerified,
      paymentDetails,
      goHome
    }
  }
}
</script>

<style scoped>
/* Fullscreen Container */
.success-page-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Animated Background */
.animated-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  bottom: -200px;
  right: -200px;
  animation-delay: 7s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Content Container */
.content-container {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.state-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

/* Loading Spinner */
.loading-spinner {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation-delay: 0.2s;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: rgba(255, 255, 255, 0.4);
  animation-delay: 0.4s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Success Checkmark Animation */
.success-icon-container {
  margin: 0 auto 40px;
}

.success-checkmark {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.check-icon {
  width: 120px;
  height: 120px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.icon-line {
  height: 5px;
  background-color: white;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.line-tip {
  top: 56px;
  left: 25px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.line-long {
  top: 48px;
  right: 18px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(255, 255, 255, 0.5);
  animation: icon-circle 1s ease-in-out;
}

.icon-fix {
  top: 12px;
  width: 10px;
  left: 32px;
  z-index: 1;
  height: 95px;
  position: absolute;
  transform: rotate(-45deg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 25px;
    top: 56px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 18px;
    top: 48px;
  }
}

@keyframes icon-circle {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Typography */
.state-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.state-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px;
  font-weight: 400;
}

.success-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.success-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 40px;
  font-weight: 400;
  line-height: 1.5;
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.error-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 40px;
  font-weight: 400;
  line-height: 1.6;
}

/* Details Card */
.details-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  margin: 0 auto 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: white;
  font-weight: 600;
}

.detail-id {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  opacity: 0.9;
}

/* Action Button */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.3px;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.action-button:active {
  transform: translateY(0);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.action-button svg {
  transition: transform 0.3s ease;
}

.action-button:hover svg {
  transform: translateX(4px);
}

/* Error Icon */
.error-icon-container {
  margin: 0 auto 40px;
}

.error-icon {
  font-size: 100px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* Fade Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fade In Up Animation */
.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

.delay-1 {
  animation-delay: 0.2s;
}

.delay-2 {
  animation-delay: 0.4s;
}

.delay-3 {
  animation-delay: 0.6s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .success-title {
    font-size: 36px;
  }

  .success-subtitle,
  .state-subtitle {
    font-size: 16px;
  }

  .details-card {
    padding: 24px;
  }

  .action-button {
    padding: 16px 32px;
    font-size: 15px;
  }

  .gradient-orb {
    filter: blur(60px);
  }

  .orb-1 {
    width: 300px;
    height: 300px;
  }

  .orb-2 {
    width: 250px;
    height: 250px;
  }

  .orb-3 {
    width: 200px;
    height: 200px;
  }
}
</style>
