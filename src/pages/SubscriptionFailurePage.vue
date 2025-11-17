<template>
  <q-page class="flex flex-center bg-negative">
    <div class="text-center q-pa-xl">
      <q-icon name="error" size="120px" color="white" class="q-mb-md" />
      <div class="text-h3 text-white text-weight-bold q-mb-md">
        Pago Rechazado
      </div>
      <div class="text-h6 text-white q-mb-xl">
        Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
      </div>
      <div class="q-gutter-md">
        <q-btn
          unelevated
          color="white"
          text-color="negative"
          label="Intentar de nuevo"
          size="lg"
          @click="retry"
          class="q-px-xl"
        />
        <q-btn
          flat
          color="white"
          label="Volver al inicio"
          size="lg"
          @click="goHome"
          class="q-px-xl"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { useRouter } from 'vue-router'
import { notify } from 'src/const/mixins'

export default {
  name: 'SubscriptionFailurePage',
  setup () {
    const router = useRouter()

    const retry = () => {
      router.push('/')
      notify('Intenta seleccionar tu plan nuevamente', 'info', 'info')
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      retry,
      goHome
    }
  }
}
</script>
