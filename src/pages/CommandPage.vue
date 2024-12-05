<template>
  <q-page padding>
    <div class="full-width text-subtitle1 flex justify-center">
      <q-chip class="bg-teal text-white" v-if="userSession && $q.screen.lt.sm">
        {{  userSession?.roles[0]?.name }}: {{ userSession.name }}
      </q-chip>
      <q-chip class="bg-teal text-white">
        Mesa: {{ command?.table?.name || 'Sin mesa' }}
      </q-chip>
    </div>
    <div class="relative full-width" style="height: 80vh;" v-if="tab === 'scanner'">
      <qrcode-stream @detect="getTable"/>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="text-center">
        <div class="scanner">
          <div class="light"></div>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-y-xs" v-else-if="tab === 'menu'">
      <div class="col-12">
        <q-tabs
          v-model="category"
          class="text-teal"
          dense
          v-if="categories.length"
        >
          <q-tab
            name="all"
            label="Todos"
          />
          <q-tab
            :name="cat.id"
            :label="cat.name"
            :key="cat.id"
            v-for="cat in categories"
          />
        </q-tabs>
        <q-skeleton type="text" height="60px" v-else/>
      </div>
      <div class="col-12">
        <div v-if="loadingPage" class="row q-col-gutter-sm">
          <div
            class="col-xs-6 col-sm-4 col-md-3"
            v-for="i in 20" :key="i"
          >
            <SkeletonCard class="full-width"/>
          </div>
        </div>
        <q-table
          row-key="name"
          dense
          grid
          hide-pagination
          :rows="allProducts"
          :columns="productColumns"
          :loading="loadingPage"
          :filter="filter"
          :pagination="pagination"
          v-else
        >
          <template v-slot:item="props">
            <div class="col-xs-6 col-sm-4 col-md-3" style="padding: 2px;">
              <q-card
                :class="findProduct(command.products, props.row) && 'shadow-20'"
                :style="`${findProduct(command.products, props.row) && 'border: solid 2px green;'}  height: 100%; border-radius: 20px;`"
                @click="() => {
                  detailProduct = true
                  product = props.row
                }"
              >
                <q-img
                  fit="fill"
                  no-native-menu
                  :src="props.row.images[0] ? props.row.images[0].url : 'https://cdn.quasar.dev/img/image-src.png'"
                  style="height: 180px;"
                  spinner-color="primary"
                >
                  <div class="absolute-bottom text-center">
                    <div class="text-bold text-subtitle1 p-a-none">
                      {{ props.row.name }}
                    </div>
                    <span class="text-caption">
                      {{ formatNumber(props.row.price) }} $
                    </span>
                  </div>
                </q-img>
              </q-card>
            </div>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="secondary"/>
          </template>
        </q-table>
      </div>
    </div>
    <div v-else>
      <q-table
        row-key="name"
        title="Pedido"
        dense
        :rows="command.products"
        :columns="columns"
        hide-pagination
        v-model:pagination="pagination"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="amount" :props="props">
              {{ formatNumber(props.row.amount) }}
              <q-popup-edit v-model.number="props.row.amount" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                <q-input label="Cantidad" type="number" v-model.number="scope.value" autofocus @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-td>
            <q-td key="price" :props="props">
              {{ formatNumber(props.row.price) }}
            </q-td>
            <q-td key="subtotal" :props="props">
              {{ formatNumber(props.row.subtotal) }}
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-page-sticky position="bottom-right" :offset="[15, 15]">
        <q-btn
          round
          icon="receipt"
          color="primary"
          :loading="billLoading"
          @click="saveBill"
        />
      </q-page-sticky>
    </div>
    <q-dialog v-model="detailProduct" maximized>
      <q-card class="full-height">
        <q-card-section :horizontal="$q.screen.gt.xs" class="col q-pa-none">
          <div class="full-width">
            <SlideComponent :slides="product.images"/>
          </div>
          <q-card-section class="column q-pb-none">
            <div>
              <span class="text-subtitle1 text-uppercase text-bold">
                {{ product?.name }}
              </span>
              <div class="flex justify-between text-uppercase items-center col">
                <span class="text-subtitle2 text-grey">
                  {{ formatNumber(product?.price) }}$
                </span>
                <span class="text-secondary">
                  <q-btn icon="schedule" flat dense round/>
                  30 min
                </span>
              </div>
            </div>
            <span class="text-caption text-grey col">
              {{ product?.description }}
            </span>
            <q-card-actions align="right" class="q-pr-none">
              <q-btn  color="negative" label="Cerrar" @click="() => {
                detailProduct = false
                product = null
              }"/>
              <q-btn  color="primary" label="Agregar" @click="validateProduct(product)"/>
            </q-card-actions>
          </q-card-section>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
import { QrcodeStream } from 'vue-qrcode-reader'
import { formatNumber } from '../const/mixins'
import { useCommandStore } from '../stores/command'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
export default {
  name: 'CommandPage',
  components: {
    QrcodeStream,
    SkeletonCard,
    SlideComponent
  },
  data () {
    return {
      slide: 1,
      fullscreen: false,
      detailProduct: false,
      modelScan: false,
      loadingTable: false,
      product: null,
      billLoading: false,
      commandDialog: false,
      formatNumber,
      table: null,
      loadingPage: false,
      stars: 3,
      category: null,
      categories: [],
      totalBill: 0,
      products: [],
      columns: [
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
      ],
      /**
       * Pagination option
       * @type {Object}
       */
      pagination: { rowsPerPage: 10 },
      allProducts: [],
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
      ]
    }
  },
  created () {
    this.getCategories()
    this.category = this.$route.query.category || 'all'
    this.products = this.command.products || []
  },
  watch: {
    category (data) {
      this.$router.push({
        path: 'command',
        query: {
          tab: this.tab,
          category: data || 'all'
        }
      })
      this.getAllProducts()
    },
    table (table) {
      const store = useCommandStore()
      store.setCommands({ table })
    },
    products (products) {
      const store = useCommandStore()
      store.setCommands({ products })
    }
  },
  computed: {
    tab () {
      return this.$route.query.tab ?? 'scanner'
    },
    filter () {
      return this.$route.query.filter
    },
    command () {
      const store = useCommandStore()
      return store?.command
    },
    ...mapState(authentication, ['userSession'])
  },
  methods: {
    /**
     * Save bill and payments
     */
    async saveBill () {
      this.billLoading = true
      this.$api.post('invoices', {
        seller_id: this.userSession?.id,
        user_created_id: this.userSession?.id,
        exchange_rate: 0,
        products: this.command.products,
        tables: [this.command.table.id]
      })
        .then(({ data }) => {
          this.table = null
          this.products = []
          this.billLoading = false
          this.commandDialog = false
          this.$q.notify({
            message: 'Pedido creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.billLoading = false
          this.$q.notify({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      const index = this.products.map(productOne => productOne.id).indexOf(product.row.id)
      this.products.splice(index, 1)
      this.calculateTotal()
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
    findProduct (products, product) {
      if (products) {
        return products.find(productOne => productOne.id === product.id)
      }
      return false
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.findProduct(this.products, data)
      if (findProduct) {
        findProduct.amount += 1
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.amount = 1
        data.subtotal = 0
        data.product_id = data.id
        this.products = [
          ...this.products,
          data
        ]
        this.calculate(data)
      }
      this.notifyProductCar(this.products)
    },
    setQueryParams (query) {
      this.$router.push({
        path: 'command',
        query: {
          ...this.$route.query,
          ...query
        }
      })
    },
    notifyProductCar (products) {
      Notify.create({
        position: 'top',
        message: '¡Plato añadido con éxito! ¡Listo para confirmar su orden!',
        actions: [
          {
            label: 'Ver orden',
            color: 'white',
            handler: () => this.setQueryParams({ tab: 'command' })
          }
        ],
        icon: 'info',
        color: 'positive'
      })
    },
    /**
     * Get all tables
     */
    getAllProducts () {
      this.loadingPage = true
      this.$api.get('products', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataFilter: {
            category_id: this.category === 'all' ? null : this.category
          }
        }
      })
        .then(({ data }) => {
          this.allProducts = data
          this.loadingPage = false
        })
        .catch(err => {
          this.loadingPage = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    async getTable (code) {
      try {
        this.modelScan = false
        this.loadingTable = true
        const newCode = code[0]
        const { id } = JSON.parse(newCode.rawValue)
        const { data } = await this.$api.get(`tables/${id}`)
        this.table = data
        this.loadingTable = false
        this.setQueryParams({ tab: 'menu' })
      } catch (error) {
        this.table = null
        this.modelScan = true
        this.loadingTable = false
        console.log(error)
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getCategories () {
      this.$api.get('categories')
        .then(({ data }) => {
          this.categories = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
<style>
  .scanner {
    width: 250px;
    height: 250px;
    border: 4px solid #000;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 10px white;
    background-image: url('/images/qr.png');
    background-size: cover;
    opacity: 0.3;
  }
  @keyframes scan {
    0% {
      transform: translateY(10px);
    }
    100% {
      transform: translateY(230px);
    }
  }
  .light {
    position: absolute;
    width: 100%;
    height: 2px;
    background: red;
    top: 0;
    animation: scan 1.5s infinite alternate;
  }
  .scanner::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
    clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
  }
</style>
