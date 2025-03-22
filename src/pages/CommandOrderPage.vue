<template>
  <q-page padding>
    <div class="flex flex-wrap justify-between">
      <div class="flex q-gutter-sm">
        <q-badge v-for="branchOffice in branchOfficeSelect" :key="branchOffice.id">
          {{ branchOffice.name }}
        </q-badge>
      </div>
      <q-btn icon="filter_alt" color="primary" @click="dialogFilter = true" round size="sm"/>
    </div>
    <div class="board-command q-gutter-x-md q-py-sm justify-start">
      <div v-for="(status, index) in statuses" :key="index">
        <q-card class="column-command" v-if="!setPermissionsByUser(status.permissions)">
          <q-card-section class="text-subtitle2">
            {{ status.label }}
            <q-badge rounded color="secondary" class="q-ml-xs">
              {{ status.total }}
            </q-badge>
          </q-card-section>
          <q-card-section class="scroll q-pt-sm q-gutter-sm" style="height: calc(100vh - 235px); overflow: auto;">
            <q-card
              v-for="invoice in status.data"
              :key="invoice.id"
              class="cursor-pointer"
              @click="showInvoices(invoice)"
            >

              <q-card-section class="flex justify-between items-center q-py-sm">
                <div class="grid items-center full-width">
                  <div class="flex justify-between full-width">
                    <q-badge color="primary" class="text-bold">
                      {{ invoice.branch_office?.name }}
                      <q-tooltip class="text-subtitle1">
                        {{ invoice.branch_office?.name }}
                      </q-tooltip>
                    </q-badge>
                    <q-badge color="secondary" class="text-bold" v-if="invoice?.delivery_person">
                      {{ invoice.delivery_person?.name }}
                      <q-tooltip class="text-subtitle1">
                        {{ invoice.delivery_person?.name }}
                      </q-tooltip>
                    </q-badge>
                  </div>
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
              <q-card-section  class="q-py-sm" v-if="invoice.client">
                Cliente: <span class="text-bold">{{ invoice.client?.name }}</span>
              </q-card-section>
              <q-separator/>
              <q-card-section class="q-py-sm flex justify-between items-center">
                <span v-if="visibleBranchOffice || role.deliveryPerson">
                  Por pagar: {{  formatNumber(invoice.total - invoice.total_payments) }}
                </span>
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
                <q-input
                  type="textarea"
                  readonly
                  label="Descripción"
                  autogrow
                  borderless
                  :model-value="invoice.description"
                />
              </q-card-section>
              <q-separator/>
              <q-card-section  class="text-bold q-py-sm">
                Fecha: {{ formatDate(invoice.created_at, 'DD/MM/YYYY HH:mm:ss') }}
              </q-card-section>
              <q-separator v-if="invoice.delivery_date"/>
              <q-card-section  class="text-bold q-py-sm" v-if="invoice.delivery_date">
                Fecha de entrega: {{ formatDate(invoice.delivery_date, 'DD/MM/YYYY HH:mm:ss') }}
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
    <q-dialog v-model="openEditInvoice" persistent maximized>
      <q-card>
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section class="scroll" style="height: 82vh">
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
            <div class="col-6" v-if="!role.deliveryPerson">
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
            <div class="col-12">
              <q-input
                type="textarea"
                autogrow label="Dirección"
                filled
                v-model="invoice.address"
                readonly
                dense
              />
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
                :readonly="role.deliveryPerson"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-12" v-if="invoice.status === 'finished'">
              <q-select
                use-input
                filled
                dense
                label="Repartidor"
                input-debounce="0"
                option-value="id"
                v-model="invoice.delivery_person"
                :options="deliveryPersons"
                :readonly="role.deliveryPerson"
                :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
                @filter="filterDeliveryPersons"
              />
            </div>
            <div class="col-12">
              <q-input
                type="textarea"
                filled
                v-model="invoice.description"
                :readonly="role.deliveryPerson"
                label="Descripción"
              />
            </div>
            <div class="col-12" v-if="role.deliveryPerson || visibleBranchOffice">
              <span class="text-h6">Pagos</span>
            </div>
            <div
              class="col-12 q-mt-md column"
              v-for="payment in invoice.invoice_payments"
              :key="payment.id" v-show="role.deliveryPerson || visibleBranchOffice"
            >
              <span class="text-subtitle1 text-uppercase">
                {{ payment.payment_method.name }}
              </span>
              <img
                v-for="file in payment.files"
                :key="file.id"
                :src="file.url"
                alt="pagos"
                style="max-height: 300px; max-width: 500px;"
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
            v-if="!role.deliveryPerson"
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
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
      full-height
    >
      <q-card class="column full-height" style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white flex justify-between items-center">
          <div class="text-h6">Filtros</div>
          <q-btn icon="close" flat round dense @click="dialogFilter = false" />
        </q-card-section>

        <q-card-section class="col q-pt-sm q-gutter-md">
          <q-select
            dense
            use-input
            filled
            label="Vendedor"
            input-debounce="0"
            option-value="id"
            clearable
            v-model="seller"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="sellers"
            :readonly="!validate"
            v-if="!role.deliveryPerson"
            @filter="filterSellers"
          />
          <q-select
            dense
            use-input
            filled
            label="Repartidor"
            input-debounce="0"
            option-value="id"
            clearable
            v-model="deliveryPerson"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="deliveryPersons"
            :readonly="!validate"
            @filter="filterDeliveryPersons"
          />
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
            v-if="userSession.is_root"
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
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { formatDate, notify, formatNumber, loading } from 'src/const/mixins'
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { printTicket } from 'src/const/invoice'
import { authentication } from 'src/stores/module-authentication'
import { useRoute, useRouter } from 'vue-router'

const store = authentication()

const userSession = store.userSession

const dialogFilter = ref(false)

const route = useRoute()
const router = useRouter()

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId) getInvoiceOne(newId)
  }
)

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

/**
 * Sellers
 * @type {Array}
 */
const sellers = ref([])
/**
 * Selected seller
 * @type {Object}
 */
const seller = ref(null)
/**
 * Sellers
 * @type {Array}
 */
const deliveryPersons = ref([])
/**
 * Selected seller
 * @type {Object}
 */
const deliveryPerson = ref(null)
/**
 * Visible branch office
 * @type {Object}
 */
const visibleBranchOffice = userSession.is_root || userSession.is_super_admin
/**
 * Interval of the status
 * @type {Number}
 */
const interval = ref(null)
const role = ref({})

const validate = ref(true)

const permissions = ['SAM']

/**
 * List status
 * @type {Array}
 */
const statuses = ref([
  { label: 'Pendiente', value: 'pending', data: [], page: 1, loading: false, permissions: ['DP'] },
  { label: 'En proceso', value: 'on_process', data: [], page: 1, loading: false, permissions: ['DP'] },
  { label: 'Terminado', value: 'finished', data: [], page: 1, loading: false, permissions: [] },
  { label: 'Entregado', value: 'delivered', data: [], page: 1, loading: false, permissions: [] }
])

/**
 * Params search
 * @type {Object}
 */
const params = ref({
  sortOrder: 'asc',
  sortBy: 'delivery_date',
  whereIn: {
    'products.category_id': categoryCommand.map(item => item.id),
    invoice_type_id: invoiceTypeCommand.map(item => item.id),
    branch_office_id: branchOffice.value
  }
})

onMounted(async () => {
  await setPermissions()
  getCategories()
  getInvoiceTypes()
  getTypeOfServices()
  getBranchOffices()
  if (route.query.id) getInvoiceOne(route.query.id)
})

watch(openEditInvoice, (data) => {
  if (!data) {
    router.push({ name: 'CommandOrder' })
  }
})

/**
 * Load invoices
 * @param {Object} status status
 */
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

watch(seller, async (seller) => {
  localStorage.setItem('seller-command', JSON.stringify(seller))
  const ids = seller?.id ? [seller?.id] : []
  filters('seller_id', ids, 'whereIn')
})

watch(deliveryPerson, async (data) => {
  const ids = data?.id ? [data?.id] : []
  filters('delivery_person_id', ids, 'whereIn')
})

watch(validate, async (data) => {
  if (!data) {
    if (role.value.seller) {
      seller.value = userSession
    }
    if (role.value.deliveryPerson) {
      deliveryPerson.value = userSession
    }
  }
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

const setPermissions = () => {
  validate.value = userSession.is_root || userSession.roles.some(role => permissions.includes(role.acronym))

  role.value = {
    seller: setPermissionsByUser(['SEL']),
    deliveryPerson: setPermissionsByUser(['DP'])
  }

  interval.value = setInterval(() => {
    getInvoices(params.value)
  }, 20000)
}

const setPermissionsByUser = (data) => {
  return userSession.roles.some(role => data.includes(role.acronym))
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

const getInvoiceOne = async (id) => {
  try {
    loading(true)
    const { data } = await api.get(`invoices/${id}`)
    showInvoices(data.data)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading(false)
  }
}

/**
 * Get all invoices
 */
const getInvoices = async (dataFilter = {}) => {
  params.value = dataFilter
  statuses.value.forEach((column) => loadInvoices(column))
}
/**
 * Get all sellers
 */
const filterSellers = async (value, update) => {
  try {
    const { data } = await api.get('sellers', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      sellers.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
/**
 * Get all sellers
 */
const filterDeliveryPersons = async (value, update) => {
  try {
    const { data } = await api.get('delivery-persons', {
      params: {
        dataSearch: {
          name: value,
          document_number: value
        }
      }
    })
    update(() => {
      deliveryPersons.value = data
    })
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}
/**
 * Get all invoices
 */
const getBranchOffices = async () => {
  try {
    if (userSession.is_root || role.value.deliveryPerson) {
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
      invoice_type_id: invoice.value?.invoice_type?.id,
      delivery_person_id: invoice.value?.delivery_person?.id
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
  overflow-x: auto;
  display: flex;
}

.column-command {
  width: 350px;
  overflow-y: auto;
}

</style>
