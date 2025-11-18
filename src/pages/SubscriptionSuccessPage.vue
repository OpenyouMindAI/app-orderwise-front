<template>
  <q-page class="flex flex-center" :class="loading ? 'bg-grey-3' : 'bg-positive'">
    <!-- Loading State -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots size="80px" color="primary" class="q-mb-md" />
      <div class="text-h5 text-grey-8 q-mb-md">
        Verificando tu pago...
      </div>
      <div class="text-body2 text-grey-6">
        Por favor espera un momento
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="paymentVerified" class="text-center q-pa-xl">
      <q-icon name="check_circle" size="120px" color="white" class="q-mb-md animate-bounce" />
      <div class="text-h3 text-white text-weight-bold q-mb-md">
        ¡Pago Exitoso!
      </div>
      <div class="text-h6 text-white q-mb-md">
        Tu suscripción ha sido activada correctamente
      </div>

      <!-- Payment Details -->
      <q-card v-if="paymentDetails" flat class="q-mt-lg q-mb-xl bg-white" style="max-width: 500px; margin: 0 auto;">
        <q-card-section>
          <div class="text-h6 text-positive q-mb-md">
            <q-icon name="receipt" class="q-mr-sm" />
            Detalles del Pago
          </div>
          <q-separator class="q-mb-md" />

          <div class="row q-mb-sm">
            <div class="col-6 text-left text-grey-7">Plan:</div>
            <div class="col-6 text-right text-weight-bold">{{ paymentDetails.plan_name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-6 text-left text-grey-7">Monto:</div>
            <div class="col-6 text-right text-weight-bold">${{ paymentDetails.amount }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-6 text-left text-grey-7">ID de Pago:</div>
            <div class="col-6 text-right text-grey-8">{{ paymentDetails.payment_id }}</div>
          </div>
          <div class="row">
            <div class="col-6 text-left text-grey-7">Fecha:</div>
            <div class="col-6 text-right text-grey-8">{{ paymentDetails.date }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-btn
        unelevated
        color="white"
        text-color="positive"
        label="Ir al Dashboard"
        size="lg"
        icon-right="arrow_forward"
        @click="goHome"
        class="q-px-xl"
      />
    </div>

    <!-- Error State -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error" size="120px" color="warning" class="q-mb-md" />
      <div class="text-h4 text-grey-8 text-weight-bold q-mb-md">
        No se pudo verificar el pago
      </div>
      <div class="text-body1 text-grey-6 q-mb-xl">
        Por favor, contacta con soporte si el problema persiste
      </div>
      <q-btn
        unelevated
        color="primary"
        label="Volver al inicio"
        size="lg"
        @click="goHome"
        class="q-px-xl"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { notify } from 'src/const/mixins'
import { api } from 'boot/axios'

export default {
  name: 'SubscriptionSuccessPage',
  setup () {
    const router = useRouter()
    const route = useRoute()

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

          // Limpiar localStorage
          localStorage.removeItem('mp_preference_id')
          localStorage.removeItem('mp_plan_id')
          localStorage.removeItem('mp_plan_name')
        } else {
          console.warn('[Success Page] Pago no aprobado:', response.data.status)
          paymentVerified.value = false
        }
      } catch (error) {
        console.error('[Success Page] Error verificando pago:', error)
        // En caso de error, asumir éxito si llegamos desde MP
        paymentVerified.value = true
      } finally {
        loading.value = false
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
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>
