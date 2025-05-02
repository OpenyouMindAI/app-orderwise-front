<script setup>
import { defineProps } from 'vue'

defineProps({
  movements: Array,
  getColor: Function
})

const columns = [
  { name: 'date', label: 'Fecha', field: 'date', sortable: true },
  { name: 'movementType', label: 'Movimiento', field: 'movementType', sortable: true },
  { name: 'document', label: 'Documento', field: 'document' },
  { name: 'details', label: 'Detalle', field: 'details' },
  { name: 'inputQty', label: 'Entrada', field: 'inputQty', align: 'right' },
  { name: 'outputQty', label: 'Salida', field: 'outputQty', align: 'right' },
  { name: 'finalStock', label: 'Stock Final', field: 'finalStock', align: 'right' },
  { name: 'unitCost', label: 'Costo Unit.', field: 'unitCost', align: 'right' },
  { name: 'totalValue', label: 'Valor Total', field: 'totalValue', align: 'right' }
]
</script>

<template>
  <q-table
    :rows="movements"
    :columns="columns"
    row-key="id"
    flat
    bordered
    class="q-mb-md"
  >
    <template #body-cell-movementType="props">
      <q-td :props="props">
        <q-chip :color="getColor(props.value)" text-color="white" dense>{{ props.value }}</q-chip>
      </q-td>
    </template>
  </q-table>
</template>
