<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-gutter-md">
        <div class="col-12">
          <div class="text-h4 q-mb-md">Pagos por Método</div>
          <q-separator class="q-mb-md" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { Notify } from 'quasar'
import { api } from 'src/boot/services'
import { onMounted, ref } from 'vue'

const paymentsByMethod = ref([])

onMounted(() => {
  getPaymentsByMethod()
})

const getPaymentsByMethod = async () => {
  try {
    const { data } = await api.get('finances/payments-by-method')
    paymentsByMethod.value = data
  } catch (error) {
    Notify.create({
      message: error.message,
      type: 'negative'
    })
  }
}
</script>
