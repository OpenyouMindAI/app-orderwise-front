<template>
  <q-page padding>
    <q-form ref="saveBill" @submit="saveBill">
      <div class="row q-col-gutter-sm">
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-4">
          <q-card class="bg-teal text-white" @click="exchange = !exchange">
            <q-card-section class="text-subtitle2 text-center">
              <span v-if="coin">{{ coin.symbol }}</span>{{ totalBill }}
              <!-- <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
                <q-banner>
                  {{ (totalBill * exchangeRate).toFixed(2) }} Bs
                </q-banner>
              </q-popup-proxy> -->
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-4">
          <q-card class="bg-orange text-white">
            <q-card-section class="text-subtitle2 text-center">
              Cambio S{{ exchangeRate }}
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-xs-4">
          <q-card class="bg-primary text-white">
            <q-card-section class="text-subtitle2 text-center">
              Items:
              {{ products.length }}
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <q-select
            use-input
            filled
            dense
            label="Cliente"
            input-debounce="0"
            option-value="id"
            v-model="client"
            clearable
            :option-label="row => `${row.document_number} | ${row.name}`"
            :options="clients"
            :rules="[val => !!val || 'El campo es requerido.']"
            @filter="filterClients"
          >
            <template v-slot:append>
              <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddClient = true)" size="sm"/>
            </template>
          </q-select>
        </div>
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
          <q-select
            use-input
            filled
            dense
            label="Tipo de servicio"
            input-debounce="0"
            option-label="name"
            option-value="id"
            v-model="invoiceType"
            :options="invoiceTypes"
            :rules="[val => !!val || 'El campo es requerido.']"
            @filter="filterInvoiceTypes"
          />
        </div>
        <!-- <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 col-xs-6">
          <q-select
            filled
            dense
            label="Impuesto"
            :option-label="row => `${row.name} ${row.amount}%`"
            option-value="id"
            v-model="taxe"
            :options="taxes"
            :rules="[val => !!val || 'El campo es requerido.']"
          />
        </div> -->
        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
          <q-select
            filled
            dense
            label="Moneda"
            option-label="name"
            option-value="id"
            v-model="coin"
            :options="coins"
            :rules="[val => !!val || 'El campo es requerido.']"
          />
        </div>
        <div class="col-6">
          <div class="row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6">
              <q-input filled dense v-model="barcode" autofocus type="number" label="Código" @keypress.enter="getOnePorduct(this.barcode)">
                <template v-slot:append>
                  <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
                </template>
              </q-input>
            </div>
            <div class=" col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6 q-gutter-sm">
              <q-btn color="orange" icon="table_restaurant" @click="dialogTable = true">
                <q-badge floating color="negative">
                  {{ tableSelected.length }}
                </q-badge>
              </q-btn>
              <q-btn
                color="secondary"
                icon="attach_money"
                @click="dialogPayment = true"
              >
                <q-badge floating color="negative">
                  {{ payments.length }}
                </q-badge>
              </q-btn>
              <q-btn
                icon="print"
                color="primary"
                @click="submitBill"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-12">
              <q-table
                row-key="name"
                title="Articulos"
                dense
                :rows="products"
                :columns="columns"
                :loading="loadingPage"
                hide-pagination
                v-model:pagination="pagination"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                    </q-td>
                    <q-td key="amount" :props="props">
                      {{ props.row.amount }}
                      <q-popup-edit v-model.number="props.row.amount" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                        <q-input label="Cantidad" type="number" v-model.number="scope.value" autofocus @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="price" :props="props">
                      {{ props.row.price }}
                      <q-popup-edit v-model.number="props.row.price" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                        <q-input label="Precio" type="number" v-model.number="scope.value" autofocus @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ props.row.subtotal }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>
        <div class="col-6" style="max-height: 50px;">
          <q-table
            row-key="name"
            dense
            grid
            hide-pagination
            :rows="allPorducts"
            :columns="productColumns"
            :loading="loadingPage"
            :filter="filter"
            v-model:pagination="pagination"
          >
            <template v-slot:top>
              <div class="row full-width q-col-gutter-xs">
                <div class="col-6">
                  <q-select
                    use-input
                    filled
                    dense
                    clearable
                    label="Categorías"
                    input-debounce="0"
                    option-label="name"
                    option-value="id"
                    v-model="category"
                    :options="categories"
                    @filter="filterCategories"
                  />
                </div>
                <div class="col-6">
                  <q-input filled dense debounce="300" v-model="filter" placeholder="Buscar">
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </div>
            </template>
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
                <q-card class="my-card">
                  <q-img style="height: 200px; width: 100%" :src="props.row.images[0] ? props.row.images[0].url : 'https://cdn.quasar.dev/img/image-src.png'" @click="validateProduct(props.row)">
                    <div class="absolute-full text-subtitle2 flex flex-center">
                      {{ props.row.name }}
                    </div>
                  </q-img>
                </q-card>
              </div>
            </template>
          </q-table>
        </div>
      </div>
    </q-form>
    <q-dialog v-model="modelScan">
      <stream-barcode-reader @debarcode="getOnePorduct"/>
    </q-dialog>
    <q-dialog v-model="dialogPayment">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-3 q-gutter-xs">
            <q-btn
              color="secondary"
              size="17px"
              style="width: 100%"
              :label="paymentMethod.name"
              v-for="paymentMethod in paymentMethods" :key="paymentMethod.id"
              @click="addPayment(paymentMethod)"
            />
          </div>
          <div class="col-9">
            <q-markup-table>
              <thead>
                <th colspan="4">Desglose de pago</th>
              </thead>
              <thead>
                <tr>
                  <th class="text-left">Metodo de pago</th>
                  <th class="text-left">Referencia</th>
                  <th class="text-right">Monto</th>
                  <th class="text-right">Aciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, index) in payments" :key="payment.id">
                  <td class="text-left">{{ payment.name }}</td>
                  <td class="text-left">
                    {{ payment.reference }}
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
                    <span v-if="coin">{{ coin.symbol }}</span>{{ pendingPayment }}
                  </th>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Guardar y cerrar"
            v-close-popup
            color="primary"
          />
          <q-btn
            label="Guardar e imprimir factura"
            @click="submitBill"
            color="secondary"
          />
          <q-btn
            label="Cancelar"
            @click="cancelPayment"
            color="negative"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogTable" maximized>
      <q-card>
        <q-card-actions class="q-pb-none q-px-md">
          <q-select
            filled
            v-model="livingRoom"
            label="Sala de estar"
            option-label="name"
            option-value="id"
            style="min-width: 300px;"
            dense
            :options="livingRooms"
          />
          <q-space/>
          <q-btn color="primary" label="Aceptar" @click="dialogTable = false"/>
          <q-btn color="negative" label="Cancelar" @click="dialogTable = false"/>
        </q-card-actions>
        <q-card-section>
          <draggable-resizable-container
            :show-grid="true"
            class="container"
          >
            <draggable-resizable-vue
              v-for="table in tables"
              :key="table.id"
              v-model:x="table.x"
              v-model:y="table.y"
              v-model:h="table.height"
              v-model:w="table.width"
              class="element-one"
              :style="table.status ==='unoccupied' ? 'background-color: blue;': 'background-color: orange;'"
              :handles-size="10"
              :draggable="false"
              :resizable="false"
            >
              <span class="absolute-center">
                {{ table.name }} {{ statusTable[table.status] }}
              </span>
              <q-checkbox v-model="tableSelected" :val="table.id" color="teal" class="fixed-top-right" v-if="table.status === 'unoccupied'"/>
              <q-btn icon="restart_alt" color="negative" size="sm" round class="fixed-top-right" @click="freeTable(table)" v-else/>
            </draggable-resizable-vue>
          </draggable-resizable-container>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.document_number"
                autofocus
                label="Número de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.email"
                autofocus
                type="email"
                label="Correo"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit"/>
            <q-btn color="orange" label="Cancelar" @click="(openAddClient = false)" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <div id="printMe" v-show="false">
      <invoice-print :data="invoice" v-if="invoice"/>
    </div>
  </q-page>
</template>

<script>
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify, date } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import InvoicePrint from '../components/InvoicePrint.vue'
export default {
  // name: 'PageName',
  components: {
    StreamBarcodeReader,
    DraggableResizableVue,
    DraggableResizableContainer,
    InvoicePrint
  },
  data () {
    return {
      openAddClient: false,
      clientAdded: {
        username: 'client',
        password: '123456'
      },
      invoice: null,
      livingRoom: null,
      taxes: [],
      taxe: null,
      statusTable: {
        unoccupied: 'Libre',
        busy: 'Acupada'
      },
      category: null,
      payments: [],
      livingRooms: [],
      paymentMethods: [],
      dialogPayment: false,
      invoiceTypes: [],
      invoiceType: null,
      coins: [],
      coin: null,
      clients: [],
      client: null,
      tableSelected: [],
      dialogTable: false,
      exchange: false,
      exchangeRate: 0,
      modelScan: false,
      tables: [],
      /**
       * Pagination option
       * @type {Objct}
       */
      pagination: { rowsPerPage: 10 },
      thumbStyle: {
        right: '4px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      },
      barStyle: {
        right: '2px',
        borderRadius: '9px',
        backgroundColor: '#027be3',
        width: '9px',
        opacity: 0.2
      },
      filter: '',
      barcode: null,
      dialogScanner: false,
      products: [],
      loadingPage: false,
      totalBill: 0,
      allPorducts: [],
      categories: [],
      userSession: {},
      productColumns: [
        {
          name: 'barcode',
          align: 'left',
          label: 'Código',
          field: 'barcode',
          sortable: true
        },
        {
          name: 'name',
          required: true,
          label: 'Descripcion',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        {
          name: 'category',
          align: 'right',
          label: 'Categoría',
          field: row => row.category.name,
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        }
      ],
      columns: [
        { name: 'barcode', align: 'left', label: 'Código', field: 'barcode', sortable: true },
        {
          name: 'name',
          required: true,
          label: 'Descripcion',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        { name: 'amount', align: 'right', label: 'Cantidad', field: 'amount', sortable: true },
        { name: 'price', align: 'right', label: 'Precio', field: 'price', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Subtotal', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ]
    }
  },
  computed: {
    heightWindow () {
      return screen.height
    },
    pagesNumber () {
      return Math.ceil(this.products.length / this.pagination.rowsPerPage)
    },
    pendingPayment () {
      return this.totalBill - this.totalPayment
    },
    totalPayment () {
      let totalPayment = 0
      this.payments.forEach((payment) => {
        totalPayment = totalPayment + payment.amount
      })
      return totalPayment
    }
  },
  watch: {
    category () {
      this.getAllPorducts()
    },
    tableSelected (data) {
      localStorage.setItem('tableSelected', JSON.stringify(data))
    },
    payments (data) {
      localStorage.setItem('payments', JSON.stringify(data))
    },
    client (data) {
      localStorage.setItem('client', JSON.stringify(data))
    },
    invoiceType (data) {
      localStorage.setItem('invoiceType', JSON.stringify(data))
    },
    products (data) {
      localStorage.setItem('products', JSON.stringify(data))
    },
    livingRoom (data) {
      this.getTables(data)
    },
    dialogTable (data) {
      this.getTables(this.livingRoom)
    }
  },
  created () {
    this.getLocalStorage()
    this.getCoins()
    this.getTaxes()
    this.getPaymentMethods()
    this.getAllPorducts()
    this.getLivingRooms()
    this.getExchange()
    this.userSession = JSON.parse(localStorage.getItem('user'))
  },
  methods: {
    /**
     * Get Data in exchange
     */
    getExchange () {
      this.$api.get('exchange-rate', {
        start_date: date.formatDate(new Date(), 'DD/MM/YYYY'),
        coin: 'PEN'
      })
        .then(({ data }) => {
          this.exchangeRate = data.venta
        })
    },
    /**
     * Save clients
     */
    saveClient () {
      this.visible = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.openAddClient = false
          this.visible = false
          this.clientAdded = {}
          this.client = data
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Submit bill
     */
    submitBill () {
      this.$refs.saveBill.submit()
    },
    /**
     * Get all livingRooms
     * @param {Object} params search params
     */
    getLivingRooms () {
      this.$api.get('living-rooms')
        .then(({ data }) => {
          this.livingRooms = data
          this.livingRoom = data[0]
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Cancelar payment
     */
    cancelPayment () {
      this.dialogPayment = false
      this.payments = []
    },
    /**
     * Add bill payment
     * @param {Object} data data payments
     */
    addPayment (data) {
      this.payments.push({
        name: data.name,
        amount: this.pendingPayment,
        reference: '-',
        coin_id: this.coin.id,
        payment_method_id: data.id,
        user_created_id: this.userSession.id
      })
      localStorage.setItem('payments', JSON.stringify(this.payments))
    },
    /**
     * Get all payment-methods
     */
    getPaymentMethods () {
      this.$api.get('payment-methods')
        .then(({ data }) => {
          this.paymentMethods = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterInvoiceTypes (value, update) {
      this.$api.get('invoice-types', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.invoiceTypes = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterCategories (value, update) {
      this.$api.get('categories', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.categories = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getCoins () {
      this.$api.get('coins', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.coins = data
          this.coin = data[0]
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getTaxes () {
      this.$api.get('taxes', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.taxes = data
          this.taxe = data[0]
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Select category
     * @param {String} valueuserSession Value filter
     * @param {Callback} update update options
     */
    filterClients (value, update) {
      this.$api.get('clients', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataSearch: {
            name: value,
            document_number: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.clients = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Free table
     * @param {Object} table  table data
     */

    freeTable (table) {
      this.$api.post('free-tables', table)
        .then(({ data }) => {
          this.getTables(this.livingRoom)
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Get all tables
     */
    getTables (data) {
      this.$api.get('tables', {
        params: {
          dataFilter: {
            living_room_id: data.id
          },
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.tables = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Get all tables
     */
    getAllPorducts () {
      this.$api.get('products', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataFilter: {
            category_id: this.category ? this.category.id : null
          }
        }
      })
        .then(({ data }) => {
          this.allPorducts = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Clear invoice
     */
    clear () {
      this.payments = []
      this.products = []
      this.tableSelected = []
      this.client = null
      this.invoiceType = null
      this.products = []
      this.dialogPayment = false
      this.calculateTotal()
      setTimeout(() => {
        this.$refs.saveBill.resetValidation()
      }, 100)
    },
    printBill (data) {
      this.invoice = data
      setTimeout(() => {
        this.$htmlToPaper('printMe')
      })
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      this.$api.post('invoices', {
        client_id: this.client.id,
        seller_id: this.userSession.id,
        coin_id: this.coin.id,
        taxe: 0, // this.taxe.amount,
        invoice_type_id: this.invoiceType.id,
        user_created_id: this.userSession.id,
        exchange_rate: this.exchangeRate,
        products: this.products,
        payments: this.payments,
        tables: this.tableSelected
      })
        .then(({ data }) => {
          this.clear()
          this.printBill(data.data)
          this.$q.notify({
            message: 'Factura creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.$q.notify({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Get local storage
     */
    getLocalStorage () {
      this.products = JSON.parse(localStorage.getItem('products')) ?? []
      this.payments = JSON.parse(localStorage.getItem('payments')) ?? []
      this.tableSelected = JSON.parse(localStorage.getItem('tableSelected')) ?? []
      this.client = JSON.parse(localStorage.getItem('client')) ?? null
      this.invoiceType = JSON.parse(localStorage.getItem('invoiceType')) ?? null
      this.calculateTotal()
    },
    /**
     * Save exchange rate
     */
    saveExchangeRate () {
      this.calculateTotal()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
    },
    /**
     * Delete invoice payment
     * @param {Number} index value index payments
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
    },
    /**
     * Calculate the total
     */
    calculateTotal () {
      let total = 0
      this.products.forEach(product => {
        total += product.subtotal
      })
      this.totalBill = total
    },
    /**
     * Calculate the total and subtotal
     * @param {Object} data props products
     */
    calculate (data) {
      data.subtotal = data.price * data.amount
      this.calculateTotal()
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.products.find(product => product.id === data.id)
      if (findProduct) {
        findProduct.amount += 1
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.amount = 1
        data.subtotal = 0
        data.product_id = data.id
        this.products.push(data)
        this.calculate(data)
      }
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     */
    async getOnePorduct (barcode = this.barcode) {
      this.$api.get('products', {
        params: {
          dataFilter: {
            barcode: this.barcode
          }
        }
      })
        .then(({ data }) => {
          const product = data[0]
          if (product) {
            this.validateProduct(product)
            this.barcode = null
            this.modelScan = false
          } else {
            this.$q.notify({
              message: 'Producto no encontrado',
              icon: 'warning',
              color: 'negative'
            })
          }
        })
        .catch((error) => {
          this.$q.notify({
            message: error.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
<style>
.container {
  width: 100%;
  height: 86vh;
  border: 1px solid black;
}

.element-one {
  color: white;
}
</style>
