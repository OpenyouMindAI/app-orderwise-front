<template>
  <q-page padding>
    <div class="flex flex-wrap q-gutter-sm q-mb-sm">
      <q-select
        v-model="category"
        :options="categories"
        style="width: 200px;"
        label="Categoría"
        option-value="id"
        option-label="name"
        dense
        filled
        clearable
      />
      <q-select
        v-model="invoiceType"
        :options="invoiceTypes"
        style="width: 400px;"
        label="Tipo de factura"
        option-value="id"
        option-label="name"
        dense
        filled
        clearable
      />
      <q-select
        v-model="typeOfService"
        :options="typeOfServices"
        style="width: 200px;"
        label="Tipo de servicio"
        option-value="id"
        option-label="name"
        dense
        filled
        clearable
      />
    </div>
    <div class="board-command">
      <div v-for="(status, index) in statuses" :key="status" class="q-pa-xs">
        <q-card class="column-command" style="height: calc(100vh - 170px); overflow: auto;">
          <q-card-section class="text-subtitle2 q-pb-sm">
            {{ status.label }}
          </q-card-section>
          <q-card-section class="scroll q-pt-sm q-gutter-sm">
            <q-card
              v-for="invoice in invoices.filter(ind => ind.status === status.value)"
              :key="invoice.id"
              class="cursor-pointer"
              @click="showInvoices(invoice)"
            >
              <q-card-section class="flex justify-between items-center q-pb-xs">
                <div class="flex q-gutter-sm items-center">
                  <q-btn
                    icon="arrow_back"
                    color="primary"
                    size="sm"
                    round
                    outline
                    v-if="index"
                    @click.stop="nextStatus(invoice, index - 1)"
                  />
                  <div class="text-bold">
                    {{  invoice?.invoice_type?.name }}
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
                  @click.stop="nextStatus(invoice, index + 1)"
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
              <!-- <q-separator/>
              <q-card-section v-if="userSession.is_root" class="q-py-sm">
                Por pagar: {{  formatNumber(invoice.total - invoice.total_payments) }}
              </q-card-section> -->
              <q-separator v-if="invoice.description"/>
              <q-card-section  class="q-py-sm" v-if="invoice.description">
                {{  invoice.description }}
              </q-card-section>
              <q-separator/>
              <q-card-section  class="text-bold q-py-sm">
                Fecha: {{ formatDate(invoice.created_at, 'DD/MM/YYYY HH:mm:ss') }}
              </q-card-section>
              <q-separator v-if="invoice.delivery_date"/>
              <q-card-section  class="text-bold q-py-sm" v-if="invoice.delivery_date">
                <div>
                  Fecha de entrega: {{ formatDate(invoice.delivery_date, 'DD/MM/YYYY HH:mm:ss') }}
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-dialog v-model="openEditInvoice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-tabs
          v-model="editTab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="details" label="Detalles de la factura" />
          <q-tab name="payments" label="Detalles de pago" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="editTab" animated>
          <q-tab-panel name="details">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input label="Código" filled v-model="invoice.id" readonly dense />
              </div>
              <div class="col-6">
                <q-select
                  use-input
                  filled
                  dense
                  label="Tipo de factura"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  v-model="invoice.invoice_type"
                  :options="invoiceTypes"
                  :rules="[val => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled :model-value="invoice?.client?.name" readonly dense />
              </div>
              <div class="col-6">
                <q-input label="Vendedor" filled :model-value="invoice?.seller?.name" readonly dense />
              </div>
              <div class="col-6">
                <q-select
                  filled
                  readonly
                  dense
                  label="Mesas"
                  v-model="invoice.tables"
                  option-label="name"
                  multiple
                />
              </div>
              <div class="col-6">
                <q-input label="Fecha" filled v-model="invoice.date" readonly dense />
              </div>
              <div class="col-6">
                <q-input type="datetime-local" label="Fecha de entrega" filled v-model="invoice.delivery_date" dense />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="payments">
            <q-markup-table dense>
              <thead>
                <tr>
                  <th class="text-left">Método de pago</th>
                  <th class="text-left">Referencia</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment) in invoice.invoice_payments" :key="payment.id">
                  <td class="text-left">
                    {{ payment.payment_method.name }}
                  </td>
                  <td class="text-left">
                    <span v-if="payment.reference">
                      {{ payment.reference }}
                    </span>
                    <span v-else>
                      -
                    </span>
                  </td>
                  <td class="text-right">
                    {{ payment.amount }}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" class="text-right">
                    Total:
                  </td>
                  <td class="text-right">
                    {{ invoice.total_payments }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-tab-panel>
        </q-tab-panels>
        <q-card-actions align="right">
          <q-btn color="negative" label="cancelar" @click="openEditInvoice = false"/>
          <q-btn color="secondary" label="Imprimir Ticket" @click="print"/>
          <q-btn color="primary" label="Guardar" @click="saveEdit"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div id="printMe" v-show="false">
      <invoice-print :data="invoice" v-if="invoice"/>
    </div>
    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { formatDate } from 'src/const/mixins'
import { ref, onMounted, watch, onUnmounted } from 'vue'
import InvoicePrint from '../components/InvoicePrint.vue'
import { useQuasar } from 'quasar'
// import { authentication } from 'src/stores/module-authentication'

// const store = authentication()

// const userSession = store.userSession

const $q = useQuasar()
/**
 * Local storage
 */
const categoryCommand = JSON.parse(localStorage.getItem('category-command')) || null
/**
 * Local storage
 */
const invoiceTypeCommand = JSON.parse(localStorage.getItem('invoiceType-command')) || null
/**
 * Local storage
 */
const typeOfServiceCommand = JSON.parse(localStorage.getItem('typeOfService-command')) || null
/**
 * Select category
 * @type {Object}
 */
const category = ref(categoryCommand)
/**
 * Select invoiceType
 * @type {Object}
 */
const invoiceType = ref(invoiceTypeCommand)
/**
 * List invoice
 * @type {Array}
 */
const invoices = ref([])

const invoice = ref(null)
/**
 * List invoice
 * @type {Array}
 */
const typeOfServices = ref([])

const openEditInvoice = ref(false)

const typeOfService = ref(typeOfServiceCommand)

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

const interval = ref(null)

const editTab = ref('details')

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

const params = ref({
  sortOrder: 'asc',
  sortBy: 'delivery_date',
  dataEqualFilter: {
    'products.category_id': categoryCommand?.id,
    invoice_type_id: invoiceTypeCommand?.id
  }
})

onMounted(() => {
  getInvoices(params.value)
  interval.value = setInterval(() => {
    getInvoices(params.value)
  }, 10000)
  getCategories()
  getInvoiceTypes()
  getTypeOfServices()
})

onUnmounted(() => {
  clearInterval(interval.value)
})

watch(category, async (cat) => {
  localStorage.setItem('category-command', JSON.stringify(cat))
  params.value = {
    ...params.value,
    dataEqualFilter: {
      ...params.value.dataEqualFilter,
      'products.category_id': cat?.id
    }
  }
  await getInvoices(params.value)
})

watch(invoiceType, async (it) => {
  localStorage.setItem('invoiceType-command', JSON.stringify(it))
  params.value = {
    ...params.value,
    dataEqualFilter: {
      ...params.value.dataEqualFilter,
      invoice_type_id: it?.id
    }
  }
  await getInvoices(params.value)
})

watch(typeOfService, async (it) => {
  localStorage.setItem('typeOfService-command', JSON.stringify(it))
  params.value = {
    ...params.value,
    dataEqualFilter: {
      ...params.value.dataEqualFilter,
      type_of_service_id: it?.id
    }
  }
  await getInvoices(params.value)
})

/**
 * Print invoice
 * @param {Object} data invoice saved
 */
const print = (data) => {
  console.log($q)
  // $q.$htmlToPaper('printMe', {
  //   styles: [
  //     'ticketStyle.css'
  //   ]
  // })
}

const showInvoices = (data) => {
  invoice.value = data
  setTimeout(() => {
    openEditInvoice.value = true
  }, 100)
}

/**
 * Get all invoices
 */
const getInvoices = async (params = {}) => {
  try {
    loading.value = true
    const { data } = await api.get('command-orders', { params })
    invoices.value = data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
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
const getTypeOfServices = async () => {
  try {
    const { data } = await api.get('type-of-services')
    typeOfServices.value = data
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
    await api.put(`invoice-status-command/${data.id}`, { status: statuses.value[index].value })
    getInvoices(params.value)
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
  width: 350px;
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
