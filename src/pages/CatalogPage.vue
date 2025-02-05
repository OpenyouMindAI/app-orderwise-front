<template>
  <q-page padding>
    <div class="full-width text-subtitle1 flex justify-end">
      <!-- <div>
        <q-chip style="padding: 17px 10px; border-radius: 50px;" class="bg-primary text-white cursor-pointer text-subtitle1" v-if="userSession && $q.screen.lt.sm">
          {{ userSession?.name }}
        </q-chip>
        <q-btn rounded style="padding: 5px 15px;" class="bg-primary text-white cursor-pointer" @click="dialogTable = true">
          Mesa: {{ command?.table?.name || 'Seleccionar mesa' }}
        </q-btn>
      </div> -->
      <q-chip class="bg-secondary text-white cursor-pointer">
        Total: {{ formatNumber(totalBill) }}
      </q-chip>
    </div>
    <!-- <div class="relative full-width q-mt-sm" style="height: calc(100vh - 190px);" v-if="tab === 'menu'">
      <qrcode-stream @detect="getCodeQr"/>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="text-center">
        <div class="menu">
          <div class="light"></div>
        </div>
      </div>
    </div> -->
    <div class="row q-col-gutter-y-xs q-mt-sm" v-if="tab === 'menu'">
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
            <div class="col-xs-12 col-sm-4 col-md-4" style="padding: 5px;">
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
                  spinner-color="primary"
                  style="height: 300px;"
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
    <div v-else class="q-mt-sm">
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
          <div class="full-width" :style="`width: ${$q.screen.gt.xs ? '60%' : '100%'};`">
            <SlideComponent :slides="product.images"/>
          </div>
          <q-card-section class="column q-pb-none" :style="`width: ${$q.screen.gt.xs ? '40%' : '100%'};`">
            <div>
              <span class="text-subtitle1 text-uppercase text-bold">
                {{ product?.name }}
              </span>
              <div class="flex justify-between text-uppercase items-center col">
                <span class="text-subtitle2 text-grey">
                  {{ formatNumber(product?.price) }}$
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
    <q-dialog v-model="dialogTable" maximized>
      <drawer-table
        ref="drawerTable"
        :tablesSelected="tableSelected"
        @update:tableSelected="setTableSelected"
      >
        <template v-slot:top>
          <q-card-section class="flex items-center justify-between bg-primary text-white q-py-sm">
            <span class="text-h6">Seleccionar mesa</span>
            <q-btn flat round dense @click="dialogTable = false" icon="close" class="q-ml-sm"/>
          </q-card-section>
        </template>
      </drawer-table>
    </q-dialog>
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
// import { QrcodeStream } from 'vue-qrcode-reader'
import { formatNumber, notify } from '../const/mixins'
import { useCommandStore } from '../stores/command'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
export default {
  name: 'CommandPage',
  components: {
    // QrcodeStream,
    SkeletonCard,
    SlideComponent,
    DrawerTable
  },
  data () {
    return {
      /**
       * Slide
       * @type {Number}
       */
      slide: 1,
      /**
       * Dialog table
       * @type {Boolean}
       */
      dialogTable: false,
      /**
       * Details product
       * @type {Boolean}
       */
      detailProduct: false,
      /**
       * Loading table
       * @type {Boolean}
       */
      loadingTable: false,
      /**
       * Product
       * @type {Object}
       */
      product: null,
      /**
       * Bill loading
       * @type {Boolean}
       */
      billLoading: false,
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Table
       * @type {Object}
       */
      table: null,
      /**
       * Loading page
       * @type {Boolean}
       */
      loadingPage: false,
      /**
       * Category selected
       * @type {Object}
       */
      category: null,
      /**
       * Categories
       * @type {Array}
       */
      categories: [],
      /**
       * Total bill
       * @type {Number}
       */
      totalBill: 0,
      /**
       * Products
       * @type {Array}
       */
      products: [],
      /**
       * Columns
       * @type {Array}
       */
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Nombre',
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
      /**
       * All products
       * @type {Array}
       */
      allProducts: [],
      /**
       * Table selected
       * @type {Array}
       */
      tableSelected: [],
      /**
       * Product columns
       * @type {Array}
       */
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
          label: 'Descripción',
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
    this.calculateTotal()
  },
  watch: {
    category (data) {
      this.$router.push({
        path: this.$route.path,
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
      return this.$route.query.tab ?? 'menu'
    },
    filter () {
      return this.$route.query.filter
    },
    command () {
      const store = useCommandStore()
      return store?.command
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  methods: {
    /**
     * After save bill
     */
    afterSaveBill () {
      this.table = null
      this.products = []
      this.tableSelected = []
      this.setQueryParams({ tab: 'menu' })
      this.totalBill = 0
      notify('Pedido creado exitosamente', 'positive', 'check_circle')
    },
    /**
     * Set table selected
     * @param {Object} data table selected
     */
    async setTableSelected (data) {
      this.table = data[0]
      this.tableSelected = [this.table]
      await this.getTable(data)
      this.dialogTable = false
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      if (!this.command?.table?.id) {
        notify('No se puede crear pedido sin mesa', 'negative', 'warning')
        return
      }
      try {
        this.billLoading = true
        await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          products: this.command.products,
          branch_office_id: this.branchOffice?.id,
          tables: [this.command.table.id]
        })
        this.afterSaveBill()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.billLoading = false
      }
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
      if (this.validStockProduct(data, data.amount)) {
        data.subtotal = data.price * data.amount
        this.calculateTotal()
      } else {
        data.amount = 1
      }
    },
    /**
     * Find product
     * @param {Array} products products
     * @param {Object} product product
     */
    findProduct (products, product) {
      if (products) {
        return products.find(productOne => productOne.id === product.id)
      }
      return false
    },
    /**
     * Valid stock product
     * @param {Object} data data
     * @param {Number} amount amount
     */
    validStockProduct (data, amount) {
      const stock = data.branch_office_stocks[0]
      if (!data.skip_stock) {
        if (stock.stock_quantity < amount) {
          notify(
            `No hay stock suficiente para ${data.name}, cantidad restante: ${stock.stock_quantity}`,
            'negative',
            'warning'
          )
          return false
        }
      }
      return true
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.findProduct(this.products, data)

      if (!this.validStockProduct(data, this.quantity)) return

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
    /**
     * Set query params
     * @param {Object} query query params
     */
    setQueryParams (query) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          ...query
        }
      })
    },
    /**
     * Notify product car
     */
    notifyProductCar () {
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
     * Get all products
     */
    async getAllProducts () {
      try {
        this.loadingPage = true
        const { data } = await this.$api.get(`public/products/${this.$route.params.company_id}`, {
          params: {
            stock: true,
            withStock: true,
            dataFilter: {
              category_id: this.category === 'all' ? null : this.category
            }
          }
        })
        this.allProducts = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.loadingPage = false
      }
    },
    /**
     * Get categories
     */
    async getCategories () {
      try {
        const { data } = await this.$api.get(`public/categories/${this.$route.params.company_id}`)
        this.categories = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    }
  }
}
</script>
<style>
  .menu {
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
  .menu::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
    clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
  }
</style>
