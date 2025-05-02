<script setup>
import { defineProps } from 'vue'

defineProps({
  movements: Array
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
      <div class="text-caption">Stock Final: {{ row.finalStock }}</div>
      <div class="text-caption">Costo Unitario: ${{ row.unitCost }}</div>
      <div class="text-caption">Valor Total: ${{ row.totalValue }}</div>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  font-size: 0.85rem;
}
</style>
