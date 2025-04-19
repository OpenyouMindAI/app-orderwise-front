<template>
  <q-page padding>
    <div class="flex flex-wrap justify-between">
      <div class="flex q-gutter-sm">
        <q-badge v-for="branchOffice in branchOfficeSelect" :key="branchOffice?.id">
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
    <q-dialog v-model="openEditInvoice" persistent :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 900px; max-width: 80vw;'">
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section class="scroll col" style="max-height: 90vh">
          <div class="row q-col-gutter-md">
            <div class="row q-col-gutter-sm col-sm-12 col-md-7 col-lg-7">
              <div class="col-6">
                <q-input v-model="invoice.code" label="Código" filled readonly dense />
              </div>
              <div class="col-6">
                <q-input v-model="invoice.date" label="Fecha" filled readonly dense />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled :model-value="invoice?.client?.name" readonly dense />
              </div>
              <div class="col-6">
                <q-input label="Vendedor" filled :model-value="invoice?.seller?.name" readonly dense />
              </div>
              <div class="col-12">
                <q-input v-model="invoice.address" type="textarea" autogrow label="Dirección" filled readonly dense />
              </div>
              <div class="col-12">
                <span class="text-h6">Datos de la comanda</span>
              </div>
              <div class="col-6">
                <q-input v-model="invoice.delivery_date" type="datetime-local" label="Fecha de entrega" filled dense />
              </div>
              <div class="col-6">
                <q-select
                  v-model="invoice.invoice_type"
                  use-input
                  filled
                  dense
                  label="Tipo de comprobante"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  :options="invoiceTypes"
                  :readonly="role.deliveryPerson"
                  :rules="[(val) => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="invoice.description"
                  type="textarea"
                  filled
                  label="Descripción"
                  autogrow
                  :readonly="role.deliveryPerson"
                />
              </div>
              <!-- <div class="col-12 q-mt-md">
                <div class="flex justify-between items-center">
                  <file-button-component color="primary" @upload="changeFiles" />
                </div>
                <file-component :files="files" @delete:files="deleteFile" />
              </div> -->
            </div>
            <div
              :class="`col-sm-12 col-md-5 col-lg-5 q-gutter-y-sm ${$q.screen.lt.sm ? 'full-width' : ''}`"
            >
            <q-expansion-item
              v-if="role.deliveryPerson || visibleBranchOffice"
              icon="payments"
              label="Pagos"
              style="border-radius: 10px"
              class="shadow-1 overflow-hidden"
            >
              <q-card>
                <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 150px">
                  <div
                    v-for="payment in invoice.invoice_payments"
                    :key="payment.id"
                    class="col-12 column q-gutter-y-sm"
                    v-show="invoice.invoice_payments.length > 0"
                  >
                    <div class="full-width row items-center justify-between">
                      <span class="text-subtitle2 text-uppercase">
                        {{ payment.payment_method.name }}
                      </span>
                      <span class="text-bold">
                        {{ formatNumber(payment.amount) }}
                      </span>
                    </div>
                    <img
                      v-for="file in payment.files"
                      :key="file.id"
                      :src="file.url"
                      alt="pagos"
                      style="max-height: 150px; max-width: 300px"
                    />
                  </div>
                  <div v-show="invoice.invoice_payments.length === 0" class="col-12 column q-gutter-y-sm">
                    <div class="full-width row items-center justify-between">
                      <span class="text-subtitle2 text-uppercase">
                        No hay pagos
                      </span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            <q-expansion-item
              icon="list"
              label="Artículos"
              style="border-radius: 10px"
              class="shadow-1 overflow-hidden"
              default-opened
            >
              <q-card>
                <q-card-section class="q-py-sm q-pt-none scroll" style="max-height: 250px">
                  <div v-for="product in invoice.products" :key="product.id" class="col-12 column">
                    <div class="full-width flex items-center justify-between">
                      <div class="flex q-gutter-sm items-center">
                        <file-component
                          v-if="product?.images?.length > 0"
                          :files="[product.images[0]]"
                          image-style="height: 50px; width: 50px; border-radius: 10px;"
                          only-view
                        />
                        <span class="text-body1">
                          {{ product.name.slice(0, 25) }}
                          <q-tooltip class="text-subtitle1">
                            {{ product.name }}
                          </q-tooltip>
                        </span>
                      </div>
                      <span class="text-bold">
                        {{ formatNumber(product.pivot.amount) }}
                      </span>
                    </div>
                    <q-separator class="q-mt-sm" />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="flex justify-between items-center">
          <q-badge :color="setStatusValue(invoice.status, 'color')" class="q-ml-xs text-subtitle1">
            {{ setStatusValue(invoice.status, 'label') }}
          </q-badge>
          <div class="q-gutter-sm">
            <q-btn
              v-if="!role.deliveryPerson"
              color="negative"
              label="Anular"
              icon="block"
              :loading="cancelLoading"
              @click="cancelInvoice"
            />
            <q-btn color="secondary" label="Ticket" icon="print" @click="print(invoice)" />
            <q-btn color="primary" icon="check_circle" label="Guardar" :loading="loadingEdit" @click="saveEdit()" />
          </div>
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
          <q-input
            v-model="code"
            label="Código de la comanda"
            filled
            dense
            debounce="500"
            clearable
          />
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
// import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import FileComponent from 'src/components/FileComponent.vue'

const store = authentication()

const userSession = store.userSession

const dialogFilter = ref(false)
// const files = ref([])
const route = useRoute()
const router = useRouter()
const code = ref('')

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId) getInvoiceOne(newId)
  }
)

// const setImagesToInvoice = async (files) => {
//   const formData = new FormData()
//   formData.append('fileable_type', 'App\\Models\\Invoice')
//   formData.append('fileable_id', invoice.value.id)
//   files.forEach(async (file) => {
//     formData.append('file', file.file)
//     await api.post('files', formData)
//   })
// }

// const changeFiles = async (e) => {
//   const filesSelected = await setFiles(e)
//   files.value = filesSelected
//   setImagesToInvoice(filesSelected)
// }

// const deleteFile = async (file) => {
//   try {
//     const id = file[file.length - 1]
//     await api.delete(`files/${id}`)
//   } catch (error) {
//     console.log(error)
//   }
// }

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
const setStatusValue = (sts, field) => {
  const st = statuses.value.find((status) => status.value === sts)
  return st ? st[field] : {}
}
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

watch(code, async (cat) => {
  filters('id', cat, 'dataFilter')
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
