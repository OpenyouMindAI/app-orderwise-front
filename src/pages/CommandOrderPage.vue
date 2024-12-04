<template>
  <q-page padding>

  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { onMounted } from 'vue'

onMounted(() => {
  getInvoices()
})

const getInvoices = () => {
  try {
    const { data } = api.get('command-orders')
    console.log(data)
  } catch (error) {}
}
</script>
