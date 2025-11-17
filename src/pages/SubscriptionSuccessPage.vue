<template>
  <q-page class="flex flex-center bg-positive">
    <div class="text-center q-pa-xl">
      <q-icon name="check_circle" size="120px" color="white" class="q-mb-md" />
      <div class="text-h3 text-white text-weight-bold q-mb-md">
        ¡Pago Exitoso!
      </div>
      <div class="text-h6 text-white q-mb-xl">
        Tu suscripción ha sido activada correctamente
      </div>
      <q-btn
        unelevated
        color="white"
        text-color="positive"
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
import { notify } from 'src/const/mixins'

export default {
  name: 'SubscriptionSuccessPage',
  setup () {
    const router = useRouter()

    const goHome = () => {
      notify('Suscripción activada exitosamente', 'positive', 'check_circle')
      router.push('/')
    }

    return {
      goHome
    }
  }
}
</script>
