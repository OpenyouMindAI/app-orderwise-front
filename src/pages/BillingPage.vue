<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4">
        <q-card class="bg-teal text-white" @click="exchange = !exchange">
          <q-card-section class="text-subtitle2 text-center">
            ${{ totalBill }}
            <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
              <q-banner>
                {{ (totalBill * exchangeRate).toFixed(2) }} Bs
              </q-banner>
            </q-popup-proxy>
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
      <div class="col-12">
        <q-input dense outlined v-model="code" autofocus type="number" label="Código" @keypress.enter="getOnePorduct(this.code)">
          <template v-slot:append>
            <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :bar-style="barStyle"
          :style="`height: ${heightWindow - 220}px`"
        >
          <q-table
            row-key="name"
            title="Items"
            dense
            :rows="products"
            :columns="columns"
            :loading="loadingPage"
            :filter="filter"
            hide-pagination
            v-model:pagination="pagination"
            grid
          >
            <template v-slot:top-right>
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
                <q-card>
                  <q-card-section class="text-center q-pa-xs">
                    <q-badge round color="negative" floating>
                      <q-btn icon="close" size="xs" dense @click="deleteProduct(props)"/>
                    </q-badge>
                    <strong>{{ props.row.description }}</strong>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="flex flex-center q-pa-xs">
                    <q-list class="full-width" dense>
                      <q-item clickable v-ripple>
                        <q-item-section>Codigo:</q-item-section>
                        <q-item-section side>{{ props.row.code }}</q-item-section>
                      </q-item>
                      <q-item clickable v-ripple active-class="text-orange">
                        <q-item-section>Precio:</q-item-section>
                        <q-item-section side>{{ props.row.price }}</q-item-section>
                        <q-popup-edit v-model.number="props.row.price" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                          <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
                        </q-popup-edit>
                      </q-item>
                      <q-item clickable v-ripple active-class="bg-teal-1 text-grey-8">
                        <q-item-section>Cantidad:</q-item-section>
                        <q-item-section side>{{ props.row.amount }}</q-item-section>
                        <q-popup-edit v-model.number="props.row.amount" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                          <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
                        </q-popup-edit>
                      </q-item>
                      <q-item clickable v-ripple active-class="bg-teal-1 text-grey-8">
                        <q-item-section>Subtotal:</q-item-section>
                        <q-item-section side>{{ props.row.subtotal }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </q-scroll-area>
      </div>
      <div class="col-12">
        <div class="flex flex-center">
          <q-pagination
            v-model="pagination.page"
            :max="pagesNumber"
            :max-pages="5"
            direction-links
            boundary-links
            icon-first="skip_previous"
            icon-last="skip_next"
            icon-prev="fast_rewind"
            icon-next="fast_forward"
          />
        </div>
      </div>
    </div>
    <q-dialog v-model="modelScan">
      <stream-barcode-reader @decode="getOnePorduct"/>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[12, 8]">
      <q-btn fab icon="save" color="primary" padding="sm" @click="saveBill"/>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { db } from '../dbfire'
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { date } from 'quasar'
export default {
  // name: 'PageName',
  components: {
    StreamBarcodeReader
  },
  data () {
    return {
      exchange: false,
      exchangeRate: 0,
      modelScan: false,
      /**
       * Pagination option
       * @type {Objct}
       */
      pagination: { page: 1, rowsPerPage: 5 },
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
      code: null,
      dialogScanner: false,
      products: [],
      loadingPage: false,
      totalBill: 0,
      columns: [
        { name: 'code', align: 'left', label: 'Código', field: 'code', sortable: true },
        {
          name: 'description',
          required: true,
          label: 'Descripcion',
          align: 'left',
          field: row => row.description,
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
  },
  methods: {
    clean () {
      this.products = []
      localStorage.removeItem('products')
      this.calculateTotal()
    },
    async saveBill () {
      try {
        this.loadingPage = true
        await addDoc(collection(db, 'bills'), {
          exchange_rate: this.exchangeRate,
          total: this.totalBill,
          totalExchange: (this.totalBill * this.exchangeRate).toFixed(2),
          products: this.products,
          date: date.formatDate(Date(), 'DD/MM/YYYY')
        })
        this.loadingPage = false
        this.clean()
        this.$q.notify({
          message: 'Factura creada exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (e) {
        console.error('Error adding document: ', e)
      }
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
      const findProduct = this.products.find(product => product.code === data.code)
      if (findProduct) {
        findProduct.amount += 1
      } else {
        this.products.push(data)
      }
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    async getOnePorduct (code = this.code) {
      const docSnap = await getDoc(doc(db, 'products', code))
      if (docSnap.exists()) {
        const product = docSnap.data()
        product.amount = 1
        product.price = 0
        product.subtotal = 0
        this.validateProduct(product)
        this.code = null
        this.calculateTotal()
        this.modelScan = false
      } else {
        this.$q.notify({
          message: 'Producto no encontrado',
          icon: 'warning',
          color: 'negative'
        })
      }
    }
  }
}
</script>
