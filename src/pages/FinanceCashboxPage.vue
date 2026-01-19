<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-gutter-md">
        <div class="col-12">
          <div class="text-h4 q-mb-md">Caja</div>
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

const cashboxes = ref([])

onMounted(() => {
  getCashboxes()
})

const getCashboxes = async () => {
  try {
    const { data } = await api.get('cashboxes')
    cashboxes.value = data
  } catch (error) {
    Notify.create({
      message: error.message,
      type: 'negative'
    })
  }
}
</script>
