<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="bg-primary text-white row items-center">
        <div class="text-h6">Detalle de Pagos: {{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="payments"
          :columns="columns"
          row-key="id"
          flat
          bordered
          dense
          :filter="filter"
          v-model:pagination="computedPagination"
          :loading="loading"
          @request="(requestEvent) => $emit('request', requestEvent)"
        >
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.amount) }}
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'PaymentDetailsDialog',
  props: {
    modelValue: Boolean,
    title: {
      type: String,
      default: 'Todos'
    },
    payments: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'request', 'update:pagination'],
  setup (props, { emit }) {
    const filter = ref('')

    watch(() => props.pagination.filter, (newFilter) => {
      filter.value = newFilter
    })

    const columns = [
      { name: 'invoice_number', label: 'Número de Factura', align: 'left', field: 'invoice_number', sortable: true },
      { name: 'date', label: 'Fecha', align: 'left', field: 'date', sortable: true, format: val => new Date(val).toLocaleString() },
      { name: 'payment_method_name', label: 'Método de Pago', align: 'left', field: 'payment_method_name', sortable: true },
      { name: 'amount', label: 'Monto', align: 'right', field: 'amount', sortable: true }
    ]

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
    }

    const computedPagination = computed({
      get: () => props.pagination,
      set: (value) => emit('update:pagination', value)
    })

    watch(filter, (newValue) => {
      emit('request', { pagination: { ...props.pagination, page: 1 }, filter: newValue })
    })

    return { columns, formatCurrency, filter, computedPagination }
  }
})
</script>
