<script setup>
import { formatNumber } from 'src/const/mixins'
import { computed, defineProps } from 'vue'

const emit = defineEmits(['update:setPagination'])

const props = defineProps({
  movements: Array,
  getColor: Function,
  paginationConfig: {
    type: Object,
    default: () => {
      return {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true
      }
    }
  }
})

const pagination = computed(() => props.paginationConfig)

const columns = [
  { name: 'date', label: 'Fecha', field: 'date', sortable: true, align: 'left' },
  { name: 'movementType', label: 'Movimiento', field: 'movementType', sortable: true, align: 'center' },
  { name: 'document', label: 'Documento', field: 'document', align: 'left' },
  { name: 'details', label: 'Detalle', field: 'details', align: 'left' },
  { name: 'inputQty', label: 'Entrada', field: 'inputQty', align: 'right', format: row => formatNumber(row) },
  { name: 'outputQty', label: 'Salida', field: 'outputQty', align: 'right', format: row => formatNumber(row) },
  { name: 'balance', label: 'Stock', field: 'balance', align: 'right', format: row => formatNumber(row) },
  { name: 'unitCost', label: 'Costo Unit.', field: 'unitCost', align: 'right', format: row => formatNumber(row) },
  { name: 'totalValue', label: 'Valor Total', field: 'totalValue', align: 'right', format: row => formatNumber(row) }
]

</script>

<template>
  <q-table
    row-key="id"
    flat
    bordered
    binary-state-sort
    :rows="movements"
    :columns="columns"
    v-model:pagination="pagination"
    @request="($event) => emit('update:setPagination', $event)"
  >
    <template #body-cell-movementType="props">
      <q-td :props="props">
        <q-chip :color="getColor(props.value)" text-color="white" dense>
          {{ props.value }}
        </q-chip>
      </q-td>
    </template>
  </q-table>
</template>
