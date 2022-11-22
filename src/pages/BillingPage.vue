<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <q-card class="bg-teal text-white" @click="exchange = !exchange">
          <q-card-section class="text-subtitle2 text-center">
            <span v-if="coin">{{ coin.symbol }}</span>
            {{ totalBill }}
            <!-- <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
              <q-banner>
                {{ (totalBill * exchangeRate).toFixed(2) }} Bs
              </q-banner>
            </q-popup-proxy> -->
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="bg-orange text-white">
          <q-card-section class="text-subtitle2 text-center">
            Taza {{ exchangeRate }} Bs
            <q-popup-edit v-model.number="exchangeRate" auto-save v-slot="scope" @update:model-value="saveExchangeRate">
              <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="bg-primary text-white">
          <q-card-section class="text-subtitle2 text-center">
            Items:
            {{ products.length }}
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-select
          use-input
          filled
          dense
          label="Cliente"
          input-debounce="0"
          option-label="name"
          option-value="id"
          v-model="client"
          :options="clients"
          :rules="[val => !!val || 'El campo es requerido.']"
          @filter="filterClients"
        />
      </div>
      <div class="col-4">
        <q-select
          use-input
          filled
          dense
          label="Tipo de factura"
          input-debounce="0"
          option-label="name"
          option-value="id"
          v-model="invoiceType"
          :options="invoiceTypes"
          :rules="[val => !!val || 'El campo es requerido.']"
          @filter="filterInvoiceTypes"
        />
      </div>
      <div class="col-4">
        <q-select
          use-input
          filled
          dense
          label="Moneda"
          input-debounce="0"
          option-label="name"
          option-value="id"
          v-model="coin"
          :options="coins"
          :rules="[val => !!val || 'El campo es requerido.']"
        />
      </div>
      <div class="col-4">
        <q-input filled
        dense v-model="barcode" autofocus type="number" label="Código" @keypress.enter="getOnePorduct(this.barcode)">
          <template v-slot:append>
            <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
          </template>
        </q-input>
      </div>
      <div class="col-2 q-gutter-sm">
        <q-btn color="orange" icon="table_restaurant" @click="dialogTable = true">
          <q-badge floating color="negative">
            {{ tableSelected.length }}
          </q-badge>
        </q-btn>
        <q-btn color="secondary" icon="attach_money" @click="dialogPayment = true"/>
      </div>
      <div class="col-12">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          style="height: 30vh"
        >
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
              </q-tr>
            </template>
          </q-table>
        </q-scroll-area>
      </div>
    </div>
    <q-dialog v-model="modelScan">
      <stream-barcode-reader @debarcode="getOnePorduct"/>
    </q-dialog>
    <q-dialog v-model="dialogPayment">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="q-pb-none">
          <div class="text-h6">
            Restante por pagar S 100
          </div>
        </q-card-section>
        <q-card-section class="row q-col-gutter-sm">
          <div class="row col-6 q-gutter-md">
            <div v-for="paymentMethod in paymentMethods" :key="paymentMethod.id">
              <q-btn :label="paymentMethod.name" @click="addPayment(paymentMethod)" color="secondary" size="17px" style="min-width: 110px"/>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogTable" maximized>
      <q-card>
        <q-card-actions align="right" class="q-pb-none">
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
              :handles-size="10"
              :draggable="false"
              :resizable="false"
            >
              <span class="absolute-center">
                {{ table.name }}
              </span>
              <q-checkbox v-model="tableSelected" :val="table.id" color="teal" class="fixed-top-right"/>
            </draggable-resizable-vue>
          </draggable-resizable-container>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[12, 8]">
      <q-btn fab icon="save" color="primary" padding="sm" @click="saveBill"/>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify } from 'quasar'
import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
export default {
  // name: 'PageName',
  components: {
    StreamBarcodeReader,
    DraggableResizableVue,
    DraggableResizableContainer
  },
  data () {
    return {
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
      pagination: { rowsPerPage: 0 },
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
        { name: 'subtotal', align: 'right', label: 'Subtotal', field: 'subtotal', sortable: true }
      ]
    }
  },
  computed: {
    heightWindow () {
      return screen.height
    },
    pagesNumber () {
      return Math.ceil(this.products.length / this.pagination.rowsPerPage)
    }
  },
  created () {
    this.getLocalStorage()
    this.getTables()
    this.getCoins()
    this.getPaymentMethods()
  },
  methods: {
    addPayment (data) {
      console.log(data)
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
    filterClients (value, update) {
      this.$api.get('clients', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataSearch: {
            name: value
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
    clean () {
      this.products = []
      localStorage.removeItem('products')
      this.calculateTotal()
    },
    /**
     * Get all tables
     */
    getTables () {
      this.$api.get('tables', {
        params: {
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
    async saveBill () {
      // try {
      //   this.loadingPage = true
      //   await addDoc(collection(db, 'bills'), {
      //     exchange_rate: this.exchangeRate,
      //     total: this.totalBill,
      //     totalExchange: (this.totalBill * this.exchangeRate).toFixed(2),
      //     products: this.products,
      //     date: date.formatDate(Date(), 'DD/MM/YYYY')
      //   })
      //   this.loadingPage = false
      //   this.clean()
      //   this.$q.notify({
      //     message: 'Factura creada exitosamente',
      //     icon: 'check_circle',
      //     color: 'positive'
      //   })
      // } catch (e) {
      //   console.error('Error adding document: ', e)
      // }
    },
    getLocalStorage () {
      this.exchangeRate = localStorage.getItem('exchangeRate') ?? 0
      this.products = JSON.parse(localStorage.getItem('products')) ?? []
      this.calculateTotal()
    },
    saveExchangeRate () {
      localStorage.setItem('exchangeRate', this.exchangeRate)
      this.calculateTotal()
    },
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    calculateTotal () {
      let total = 0
      this.products.forEach(product => {
        total += product.subtotal
      })
      this.totalBill = total
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    calculate (data) {
      data.subtotal = data.price * data.amount
      this.calculateTotal()
    },
    validateProduct (data) {
      const findProduct = this.products.find(product => product.id === data.id)
      if (findProduct) {
        findProduct.amount += 1
      } else {
        this.products.push(data)
      }
      localStorage.setItem('products', JSON.stringify(this.products))
    },
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
            product.amount = 1
            product.subtotal = 0
            this.validateProduct(product)
            this.barcode = null
            this.calculate(product)
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
  background-color: blue;
  color: white;
}
</style>
