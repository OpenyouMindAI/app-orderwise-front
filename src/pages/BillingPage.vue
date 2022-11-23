<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
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
        <q-input filled dense v-model="barcode" autofocus type="number" label="Código" @keypress.enter="getOnePorduct(this.barcode)">
          <template v-slot:append>
            <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
          </template>
        </q-input>
      </div>
      <div class="col-4 q-gutter-sm">
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
          @click="saveBill"
        />
      </div>
      <div class="col-6">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          style="height: 50vh; background-color: beige;"
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
                <q-td key="actions" :props="props">
                  <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-scroll-area>
      </div>
      <div class="col-6">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          style="height: 50vh; background-color: beige;"
        >
          <q-table
            row-key="name"
            dense
            grid
            hide-pagination
            :rows="allPorducts"
            :columns="productColumns"
            :loading="loadingPage"
            v-model:pagination="pagination"
          >
            <template v-slot:item="props">
              <q-card class="my-card">
                <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
                  <div class="absolute-bottom text-subtitle2 text-center">
                    {{ props.row.name }}
                  </div>
                </q-img>
              </q-card>
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
            @click="saveBill"
            color="secondary"
          />
          <q-btn
            label="Cancelar"
            @click="saveBill"
            color="negative"
          />
        </q-card-actions>
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
      payments: [],
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
      allPorducts: [],
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
      console.log(totalPayment)
      return totalPayment
    }
  },
  created () {
    this.getLocalStorage()
    this.getTables()
    this.getCoins()
    this.getPaymentMethods()
    this.getAllPorducts()
  },
  methods: {
    /**
     * Add bill payment
     * @param {Object} data data payments
     */
    addPayment (data) {
      this.payments.push({
        name: data.name,
        amount: this.pendingPayment,
        reference: '-',
        payment_method_id: data.id
      })
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
    /**
     * Clean formulary
     */
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
    /**
     * Get all tables
     */
    getAllPorducts () {
      this.$api.get('products', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
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
     * Save bill and payments
     */
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
    /**
     * Get local storage
     */
    getLocalStorage () {
      this.exchangeRate = localStorage.getItem('exchangeRate') ?? 0
      this.products = JSON.parse(localStorage.getItem('products')) ?? []
      this.calculateTotal()
    },
    /**
     * Save exchange rate
     */
    saveExchangeRate () {
      localStorage.setItem('exchangeRate', this.exchangeRate)
      this.calculateTotal()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    /**
     *
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
      localStorage.setItem('products', JSON.stringify(this.products))
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
      } else {
        this.products.push(data)
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
