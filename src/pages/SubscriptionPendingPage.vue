<template>
  <q-page class="flex flex-center bg-warning">
    <div class="text-center q-pa-xl">
      <q-icon name="schedule" size="120px" color="white" class="q-mb-md" />
      <div class="text-h3 text-white text-weight-bold q-mb-md">
        Pago Pendiente
      </div>
      <div class="text-h6 text-white q-mb-xl">
        Tu pago está siendo procesado. Te notificaremos cuando se complete.
      </div>
      <q-btn
        unelevated
        color="white"
        text-color="warning"
        label="Volver al inicio"
        size="lg"
        @click="goHome"
        class="q-px-xl"
      />
    </div>
  </q-page>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'SubscriptionPendingPage',
  setup () {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return {
      goHome
    }
  }
}
</script>
