<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <q-select
        v-model="category"
        :options="categories"
        style="width: 400px;"
        label="Categoría"
        option-value="id"
        option-label="name"
        emit-value
        map-options
        dense
        class="q-mb-md"
        filled
      />
      <q-select
        v-model="invoiceType"
        :options="invoiceTypes"
        style="width: 400px;"
        label="Tipo de factura"
        option-value="id"
        option-label="name"
        emit-value
        map-options
        dense
        class="q-mb-md"
        filled
      />
    </div>
    <div class="board-command">
      <div v-for="(status, index) in statuses" :key="status" class="q-pa-xs">
        <q-card class="column-command" style="height: calc(100vh - 170px); overflow: auto;">
          <q-card-section class="text-subtitle2 q-pb-sm">
            {{ status.label }}
          </q-card-section>
          <q-card-section class="scroll q-pt-sm q-gutter-sm">
            <q-card v-for="invoice in invoices.filter(ind => ind.status === status.value)" :key="invoice.id">
              <q-card-section class="flex justify-between items-center q-pb-xs">
                <div class="flex q-gutter-sm items-center">
                  <q-btn
                    icon="arrow_back"
                    color="primary"
                    size="sm"
                    round
                    outline
                    v-if="index"
                    @click="nextStatus(invoice, index - 1)"
                  />
                  <div class="text-bold">
                    Orden
                    {{ invoice.code }}
                  </div>
                </div>
                <q-btn
                  v-if="index !== (statuses.length - 1)"
                  icon="arrow_forward"
                  color="primary"
                  size="sm"
                  round
                  outline
                  @click="nextStatus(invoice, index + 1)"
                />
              </q-card-section>
              <q-card-section class="column q-gutter-sm q-py-sm">
                <div v-for="product in invoice.products" :key="product.id">
                  <span>
                    {{ product.name }}
                  </span>
                  x
                  <span>
                    {{ product?.pivot?.amount }}
                  </span>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, watch } from 'vue'

/**
 * Select category
 * @type {Object}
 */
const category = ref(null)

/**
 * Select invoiceType
 * @type {Object}
 */
const invoiceType = ref(null)
/**
 * List invoice
 * @type {Array}
 */
const invoices = ref([])

/**
 * List invoice
 * @type {Array}
 */
const categories = ref([])
/**
 * Invoice type
 * @type {Array}
 */
const invoiceTypes = ref([])

/**
 * List status
 * @type {Array}
 */
const statuses = ref([
  {
    label: 'Pendiente',
    value: 'pending'
  },
  {
    label: 'En proceso',
    value: 'on_process'
  },
  {
    label: 'Terminado',
    value: 'finished'
  },
  {
    label: 'Entregado',
    value: 'delivered'
  }
])

const loading = ref(false)

const params = ref({})

onMounted(() => {
  getInvoices()
  getCategories()
  getInvoiceTypes()
})

watch(category, async (id) => {
  loading.value = true
  params.value = {
    dataEqualFilter: {
      ...params.value.dataEqualFilter,
      'products.category_id': id
    }
  }
  await getInvoices(params.value)
  loading.value = false
})

watch(invoiceType, async (id) => {
  loading.value = true
  params.value = {
    dataEqualFilter: {
      ...params.value.dataEqualFilter,
      invoice_type_id: id
    }
  }
  await getInvoices(params.value)
  loading.value = false
})

/**
 * Get all invoices
 */
const getInvoices = async (params = {}) => {
  try {
    const { data } = await api.get('command-orders', { params })
    invoices.value = data
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get all invoices
 */
const getCategories = async () => {
  try {
    const { data } = await api.get('categories')
    categories.value = data
  } catch (error) {
    console.log(error)
  }
}
/**
 * Get all invoices
 */
const getInvoiceTypes = async () => {
  try {
    const { data } = await api.get('invoice-types')
    invoiceTypes.value = data
  } catch (error) {
    console.log(error)
  }
}

/**
 * Change status
 * @param {Object} data invoice
 * @param {Number} index index status
 */
const nextStatus = async (data, index) => {
  try {
    data.status = statuses.value[index].value
    await api.put(`invoices/${data.id}`, data)
    getInvoices()
  } catch (error) {
    console.log(error)
  }
}

</script>

<style>

.board-command {
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
}

.column-command {
  width: 360px;
  overflow-y: auto;
}

.board::-webkit-scrollbar {
  height: 8px;
}

.board::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.board::-webkit-scrollbar-track {
  background-color: #f4f4f4;
}

.board::-webkit-scrollbar {
  height: 8px;
}

.board::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.board::-webkit-scrollbar-track {
  background-color: #f4f4f4;
}

</style>
