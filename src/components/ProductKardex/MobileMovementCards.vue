<script setup>
import { defineProps, ref, watch } from 'vue'

/**
 * Props
 * @type {Object}
 */
const props = defineProps({
  movements: Array,
  total: {
    type: Number,
    default: 10
  }
})

/**
 * Emits
 * @type {Array}
 */
const emit = defineEmits(['update:current'])

/**
 * Current page
 * @type {Object}
 */
const current = ref(1)

/**
 * Watch current page
 * @param {Object} data current page
 */
watch(current, (data) => {
  emit('update:current', data)
})

</script>

<template>
  <div class="q-gutter-sm">
    <q-card v-for="row in movements" :key="row.id" class="q-pa-sm bg-grey-1">
      <div class="text-subtitle2 q-mb-xs">{{ row.date }} - {{ row.movementType }}</div>
      <div class="text-caption">Documento: {{ row.document }}</div>
      <div class="text-caption">Detalle: {{ row.details }}</div>
      <div class="text-caption">Entrada: {{ row.inputQty }}</div>
      <div class="text-caption">Salida: {{ row.outputQty }}</div>
      <div class="text-caption">Costo Unitario: ${{ row.unitCost }}</div>
      <div class="text-caption">Valor Total: ${{ row.totalValue }}</div>
    </q-card>
    <div class="q-py-xs flex flex-center">
      <q-pagination
        v-model="current"
        :max="props.total"
        :max-pages="5"
        direction-links
        boundary-links
        flat
        input
        icon-first="skip_previous"
        icon-last="skip_next"
        icon-prev="fast_rewind"
        icon-next="fast_forward"
      />
    </div>
  </div>
</template>

<style scoped>
.q-card {
  font-size: 0.85rem;
}
</style>
