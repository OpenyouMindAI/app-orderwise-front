<template>
  <q-page padding>
    <div class="flex flex-wrap q-gutter-sm q-mb-sm">
      <q-select
        v-model="category"
        :options="categories"
        label="Categoría"
        option-value="id"
        option-label="name"
        style="min-width: 300px;"
        dense
        filled
        multiple
      >
        <template v-if="category.length" v-slot:append>
          <q-icon name="cancel" @click.stop.prevent="category = []" class="cursor-pointer" />
        </template>
      </q-select>
      <q-select
        v-model="typeOfService"
        :options="typeOfServices"
        style="min-width: 300px;"
        label="Tipo de servicio"
        option-value="id"
        option-label="name"
        dense
        filled
        multiple
      >
        <template v-if="typeOfService.length" v-slot:append>
          <q-icon name="cancel" @click.stop.prevent="typeOfService = []" class="cursor-pointer" />
        </template>
      </q-select>
      <q-select
        v-model="invoiceType"
        :options="invoiceTypes"
        style="min-width: 300px;"
        label="Tipo de factura"
        option-value="id"
        option-label="name"
        dense
        filled
        multiple
      >
        <template v-if="invoiceType.length" v-slot:append>
          <q-icon name="cancel" @click.stop.prevent="invoiceType = []" class="cursor-pointer" />
        </template>
      </q-select>
      <q-select
        v-if="visibleBranchOffice"
        v-model="branchOfficeSelect"
        :options="branchOffices"
        style="min-width: 300px;"
        label="Sucursales"
        option-value="id"
        option-label="name"
        dense
        filled
        multiple
      >
        <template v-if="branchOfficeSelect.length" v-slot:append>
          <q-icon name="cancel" @click.stop.prevent="branchOfficeSelect = []" class="cursor-pointer" />
        </template>
      </q-select>
    </div>
    <div class="board-command">
      <div v-for="(status, index) in statuses" :key="index">
        <q-card class="column-command">
          <q-card-section class="text-subtitle2">
            {{ status.label }}
            <q-badge rounded color="secondary" class="q-ml-xs">
              {{ status.total }}
            </q-badge>
          </q-card-section>
          <q-card-section class="scroll q-pt-sm q-gutter-sm" style="height: calc(100vh - 250px); overflow: auto;">
            <q-card
              v-for="invoice in status.data"
              :key="invoice.id"
              class="cursor-pointer"
              @click="showInvoices(invoice)"
            >

              <q-card-section class="flex justify-between items-center q-py-sm">
                <div class="grid items-center full-width">
                  <q-badge color="primary" class="text-bold">
                    {{ invoice.branch_office?.name }}
                    <q-tooltip class="text-subtitle1">
                      {{ invoice.branch_office?.name }}
                    </q-tooltip>
                  </q-badge>
                  <div class="flex items-center full-width" style="margin-top: 10px; gap: 10px;">
                    <q-btn
                      icon="arrow_back"
                      color="primary"
                      size="xs"
                      round
                      outline
                      v-if="index"
                      @click.stop="nextStatus(invoice, index - 1)"
                    />
                    <div class="text-bold">
                      {{  invoice?.invoice_type?.name }}
                      {{ invoice.code }}
                    </div>
                    <q-btn
                      v-if="index !== (statuses.length - 1)"
                      icon="arrow_forward"
                      color="primary"
                      size="xs"
                      round
                      outline
                      @click.stop="nextStatus(invoice, index + 1)"
                    />
                  </div>
                </div>
              </q-card-section>
              <q-separator/>
              <q-card-section class="column q-py-xs">
                <span class="text-bold">Artículos:</span>
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
              <q-separator/>
              <q-card-section v-if="userSession.is_root" class="q-py-sm flex justify-between items-center">
                Por pagar: {{  formatNumber(invoice.total - invoice.total_payments) }}
                <q-btn
                  color="secondary"
                  icon="print"
                  size="sm"
                  round
                  outline
                  @click.stop="print(invoice)"
                />
              </q-card-section>
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
          <q-card-actions align="center" class="q-pa-sm">
            <q-pagination
              v-model="status.page"
              :max="Math.ceil(status.total / 10)"
              input
              @update:model-value="loadInvoices(status)"
            />
          </q-card-actions>
          <q-inner-loading :showing="status.loading" color="primary" />
        </q-card>
      </div>
    </div>
    <q-dialog v-model="openEditInvoice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="flex justify-between items-center">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section class="scroll" style="height: 70vh">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input label="Código" filled v-model="invoice.code" readonly dense />
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
            <div class="col-12 q-mt-md">
              <q-separator />
            </div>
            <div class="col-12">
              <span class="text-h6">Campos para editar</span>
            </div>
            <div class="col-6">
              <q-input type="datetime-local" label="Fecha de entrega" filled v-model="invoice.delivery_date" dense />
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
            <div class="col-12">
              <q-input
                type="textarea"
                filled
                v-model="invoice.description"
                label="Descripción"
              />
            </div>
          </div>
          <!-- <q-stepper
            v-model="editTab"
            vertical
            color="primary"
            animated
          >
            <q-step
              :name="1"
              title="Datos básicos de la factura"
              icon="receipt"
              :done="editTab > 1"
            >
              <q-stepper-navigation>
                <q-btn @click="editTab = 2" color="primary" label="Ir a pagos" />
              </q-stepper-navigation>
            </q-step>
            <q-step
              :name="2"
              title="Pagos de la factura"
              icon="monetization_on"
              >
              <q-card-section class="row q-col-gutter-md">
                <div class="col-12 q-gutter-xs flex">
                  <div v-for="paymentMethod in paymentMethods" :key="paymentMethod.id">
                    <q-btn
                      color="secondary"
                      size="17px"
                      style="width: 100%"
                      :label="paymentMethod.name"
                      @click="addPayment(paymentMethod)"
                    />
                  </div>
                </div>
                <div class="col-12">
                  <q-markup-table>
                    <thead>
                      <th colspan="4">Desglose de pago</th>
                    </thead>
                    <thead>
                      <tr>
                        <th class="text-left">Método de pago</th>
                        <th class="text-left">Referencia</th>
                        <th class="text-right">Monto</th>
                        <th class="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(payment, index) in payments" :key="payment.id">
                        <td class="text-left">{{ payment.name }}</td>
                        <td class="text-left">
                          <span v-if="payment.reference"> {{ payment.reference }}</span>
                          <span v-else>-</span>
                          <q-popup-edit
                            v-model="payment.reference"
                            auto-save
                            v-slot="scope"
                          >
                            <q-input
                              v-model="scope.value"
                              autofocus
                              @keyup.enter="scope.set"
                            />
                          </q-popup-edit>
                        </td>
                        <td class="text-right">
                          {{ payment.amount }}
                          <q-popup-edit
                            v-model.number="payment.amount"
                            auto-save
                            v-slot="scope"
                          >
                            <q-input
                              v-model="scope.value"
                              autofocus
                              @keyup.enter="scope.set"
                            />
                          </q-popup-edit>
                        </td>
                        <q-td class="text-right">
                          <q-btn
                            icon="delete"
                            size="xs"
                            color="negative"
                            @click="deletePayment(index)"
                          />
                        </q-td>
                      </tr>
                      <tr>
                        <th colspan="4">
                          Restante a pagar:
                          <span v-if="invoice?.coin">
                            {{ invoice?.coin?.symbol }}
                          </span>
                          {{ pendingPayment }}
                        </th>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </div>
              </q-card-section>
              <q-btn @click="editTab = 1" color="primary" label="Volver" />
            </q-step>
          </q-stepper> -->
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="negative"
            label="Anular"
            :loading="cancelLoading"
            @click="cancelInvoice"
          />
          <q-btn
            color="secondary"
            label="Imprimir Ticket"
            @click="print(invoice)"
          />
          <q-btn
            color="primary"
            label="Guardar"
            :loading="loadingEdit"
            @click="saveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { formatDate, notify, formatNumber } from 'src/const/mixins'
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { printTicket } from 'src/const/invoice'
import { authentication } from 'src/stores/module-authentication'

const store = authentication()

const userSession = store.userSession

const branchOffice = computed(() => store.branchOfficeGetter)
/**
 * Local storage
 */
const categoryCommand = JSON.parse(localStorage.getItem('category-command')) || []
/**
 * Local storage
 */
const invoiceTypeCommand = JSON.parse(localStorage.getItem('invoiceType-command')) || []
/**
 * Local storage
 */
const typeOfServiceCommand = JSON.parse(localStorage.getItem('typeOfService-command')) || []
/**
 * List branch office
 * @type {Array}
 */
const branchOfficeSelect = ref([])
/**
 * Select invoice
 * @type {Object}
 */
const invoice = ref(null)
/**
 * Loading edit
 * @type {Boolean}
 */
const loadingEdit = ref(false)
/**
 * Loading cancel
 * @type {Boolean}
 */
const cancelLoading = ref(false)
/**
 * List invoice
 * @type {Array}
 */
const typeOfServices = ref([])
/**
 * Open edit invoice
 * @type {Boolean}
 */
const openEditInvoice = ref(false)
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
 * Select typeOfService
 * @type {Object}
 */
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
/**
 * Branch office
 * @type {Array}
 */
const branchOffices = ref([])

const visibleBranchOffice = userSession.is_root || userSession.is_super_admin

const interval = ref(null)

/**
 * List status
 * @type {Array}
 */
const statuses = ref([
  { label: 'Pendiente', value: 'pending', data: [], page: 1, loading: false },
  { label: 'En proceso', value: 'on_process', data: [], page: 1, loading: false },
  { label: 'Terminado', value: 'finished', data: [], page: 1, loading: false },
  { label: 'Entregado', value: 'delivered', data: [], page: 1, loading: false }
])

const params = ref({
  sortOrder: 'asc',
  sortBy: 'delivery_date',
  whereIn: {
    'products.category_id': categoryCommand.map(item => item.id),
    invoice_type_id: invoiceTypeCommand.map(item => item.id),
    branch_office_id: branchOffice.value
  }
})

onMounted(() => {
  interval.value = setInterval(() => {
    getInvoices(params.value)
  }, 20000)
  getCategories()
  getInvoiceTypes()
  getTypeOfServices()
  getBranchOffices()
})

const loadInvoices = async (status) => {
  try {
    status.loading = true
    const { data } = await api.get('command-orders', {
      params: {
        ...params.value,
        page: status.page,
        perPage: 10,
        paginate: true,
        dataEqualFilter: {
          status: status.value
        }
      }
    })
    status.data = data.data
    status.total = data.total
  } catch (error) {
    console.error(`Error al cargar datos para ${status.label}:`, error)
  } finally {
    status.loading = false
  }
}

onUnmounted(() => {
  clearInterval(interval.value)
})

watch(category, async (cat) => {
  localStorage.setItem('category-command', JSON.stringify(cat))
  const ids = cat.map((item) => item.id)
  filters('products.category_id', ids, 'whereIn')
})

watch(invoiceType, async (it) => {
  localStorage.setItem('invoiceType-command', JSON.stringify(it))
  const ids = it.map((item) => item.id)
  filters('invoice_type_id', ids, 'whereIn')
})

watch(typeOfService, async (it) => {
  localStorage.setItem('typeOfService-command', JSON.stringify(it))
  const ids = it.map((item) => item.id)
  filters('type_of_service_id', ids, 'whereIn')
})

watch(branchOfficeSelect, async (bo) => {
  localStorage.setItem('branchOffice-command', JSON.stringify(bo))
  const ids = bo.map((item) => item.id)
  filters('branch_office_id', ids, 'whereIn')
})

/**
 * Filters
 * @param {String} field field
 * @param {Array} value value
 * @param {String} filterParams filterParams
 */
const filters = (field, value, filterParams) => {
  params.value[filterParams] = {
    ...params.value[filterParams],
    [field]: value
  }
  getInvoices(params.value)
}
/**
 * Print invoice
 * @param {Object} data invoice saved
 */
const print = (data) => {
  const doc = printTicket(data, userSession)
  const pdfUrl = doc.output('bloburl')
  window.open(pdfUrl, '_blank')
}
/**
 * Show invoice
 * @param {Object} data invoice saved
 */
const showInvoices = (data) => {
  invoice.value = data
  setTimeout(() => {
    openEditInvoice.value = true
  }, 100)
}

/**
 * Get all invoices
 */
const getInvoices = async (dataFilter = {}) => {
  params.value = dataFilter
  statuses.value.forEach((column) => loadInvoices(column))
}

/**
 * Get all invoices
 */
const getBranchOffices = async () => {
  try {
    if (visibleBranchOffice) {
      const { data } = await api.get('branch-offices')
      branchOffices.value = data
      branchOfficeSelect.value = data
    } else {
      branchOfficeSelect.value = [branchOffice.value]
    }
  } catch (error) {
    notify(error.message, 'negative', 'warning')
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
 * Save edit
 */
const saveEdit = async () => {
  try {
    loadingEdit.value = true
    await api.put(`invoices/${invoice.value.id}`, {
      ...invoice.value,
      invoice_type_id: invoice.value?.invoice_type?.id
    })
    notify('Factura editada exitosamente', 'positive', 'check_circle')
    getInvoices(params.value)
    openEditInvoice.value = false
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loadingEdit.value = false
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
/**
 * Change status
 * @param {Object} data invoice
 * @param {Number} index index status
 */
const cancelInvoice = async () => {
  try {
    cancelLoading.value = true
    await api.put(`invoice-status-command/${invoice.value.id}`, { status: 'cancelled' })
    getInvoices(params.value)
    notify('Factura anulada exitosamente', 'positive', 'check_circle')
    openEditInvoice.value = false
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    cancelLoading.value = false
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

</style>
