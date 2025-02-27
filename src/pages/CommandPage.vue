<template>
  <q-page padding>
    <div class="full-width text-subtitle1 flex justify-between">
      <div>
        <q-chip style="padding: 17px 10px; border-radius: 50px;" class="bg-primary text-white cursor-pointer text-subtitle1" v-if="userSession && $q.screen.lt.sm">
          {{ userSession?.name }}
        </q-chip>
        <q-btn  v-if="isTable" rounded style="padding: 5px 15px;" class="bg-primary text-white cursor-pointer" @click="dialogTable = true">
          Mesa: {{ command?.table?.name || 'Seleccionar mesa' }}
        </q-btn>
      </div>
      <q-chip class="bg-secondary text-white cursor-pointer">
        Total: {{ formatNumber(totalBill) }}
      </q-chip>
    </div>
    <div class="relative full-width q-mt-sm" style="height: calc(100vh - 190px);" v-if="tab === 'scanner' && isTable">
      <qrcode-stream @detect="getCodeQr"/>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" class="text-center">
        <div class="scanner">
          <div class="light"></div>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-y-sm q-mt-xs" v-else-if="tab === 'menu'">
      <div class="col-12">
        <q-input
          outlined
          rounded
          label="Buscar"
          dense
          type="search"
          debounce="500"
          class="full-width"
          v-model="filter"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12">
        <q-tabs
          v-model="category"
          class="text-teal"
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
      <div class="col-12" style="max-height: calc(100vh - 290px); overflow-y: auto;">
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
          :rows="allProducts"
          :columns="productColumns"
          :loading="loadingPage"
          :filter="filter"
          :pagination="pagination"
          v-else
        >
          <template v-slot:item="props">
            <div class="col-xs-6 col-sm-3 col-md-2 col-lg-2" style="padding: 2px;">
              <q-card
                :class="findProduct(command.products, props.row) && 'shadow-20'"
                :style="`${findProduct(command.products, props.row) && 'border: solid 2px green;'}  height: 100%; border-radius: 20px;`"
                @click="openProductDetails(props.row)"
              >
                <q-img
                  fit="fill"
                  no-native-menu
                  :src="props.row?.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                  style="height: 180px;"
                  spinner-color="primary"
                >
                  <div class="absolute-bottom text-center">
                    <div class="text-bold text-body2 p-a-none">
                      {{ props.row.name.slice(0, 20) }}
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
      <q-select
        use-input
        filled
        dense
        label="Cliente"
        input-debounce="0"
        option-value="id"
        v-model="client"
        :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
        :options="clients"
        :rules="[val => !!val || 'El campo es requerido.']"
        @filter="filterClients"
      >
        <template v-slot:append>
          <q-btn
            color="primary"
            round
            icon="add_circle"
            @click.stop.prevent="(openAddClient = true)"
            size="sm"
          />
        </template>
      </q-select>
      <q-table
        dense
        grid
        row-key="name"
        style="max-height: calc(100vh - 270px); overflow: auto;"
        :rows="command.products"
        v-model:pagination="pagination"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card
              class="my-card q-mt-sm"
              style="width: 100%; border-radius: 30px; height: 120px;"
            >
              <q-card-section horizontal class="full-height">
                <q-img
                  class="col-4"
                  style="max-height: 200px;"
                  :src="props.row?.images[0] ? props.row?.images[0]?.url : 'images/404-image.jpg'"
                />
                <q-card-section class="q-pa-sm column">
                  <q-card-section class="q-pa-sm col">
                    <div class="flex justify-between q-col-gutter-sm">
                      <div class="flex justify-between items-center full-width">
                        <span class="text-body2 text-uppercase text-bold">
                          {{ props.row.name.slice(0, 20) }}
                        </span>
                      </div>
                    </div>
                    <p class="text-subtitle2 text-grey">
                      $ {{ formatNumber(props.row.price) }}
                    </p>
                  </q-card-section>
                  <q-card-actions class="q-pa-none">
                    <div class="flex justify-between items-center full-width">
                      <div style="width: 10%;">
                        <q-btn icon="delete" round size="sm" color="negative" @click="deleteProduct(props)"/>
                      </div>
                      <div class="flex items-center q-gutter-xs justify-end" style="width: 90%;">
                        <div>
                          <q-btn icon="remove" round size="sm" color="primary" @click="() => {
                              props.row.amount -= 1
                              calculate(props.row)
                            }"
                          />
                        </div>
                        <q-input
                          rounded
                          outlined
                          dense
                          label="Cantidad"
                          type="number"
                          style="width: 50%;"
                          v-model.number="props.row.amount"
                          @update:model-value="calculate(props.row)"
                        />
                        <div>
                            <q-btn icon="add" round size="sm" color="primary" @click="() => {
                                props.row.amount += 1
                                calculate(props.row)
                            }"/>
                        </div>
                      </div>
                    </div>
                  </q-card-actions>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
      <q-page-sticky position="bottom-right" :offset="[15, 10]">
        <q-btn
          round
          icon="receipt"
          color="primary"
          :loading="billLoading"
          @click="saveBill"
        />
      </q-page-sticky>
    </div>
    <q-dialog v-model="detailProduct" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 500px; max-width: 80vw;'}`"
      >
        <SlideComponent :slides="product.images" styles="height: 300px;"/>
        <q-card-section class="column q-pb-xs">
          <div class="flex justify-between items-center full-width">
            <span class="text-subtitle1 text-uppercase text-bold">
              {{ product?.name }}
            </span>
            <div class="flex justify-between items-center q-gutter-xs">
              <q-btn
                icon="remove"
                color="primary"
                round
                size="sm"
                @click="addTemporalProducts(product, product.amount -= 1)"
              />
              <q-input
                borderless
                dense
                type="number"
                style="width: 30px;"
                input-class="text-center"
                v-model.number="product.amount"
                @update:model-value="(value) => addTemporalProducts(product, value)"
              />
              <q-btn
                icon="add"
                color="primary"
                round
                size="sm"
                @click="addTemporalProducts(product, product.amount += 1)"
              />
            </div>
          </div>
          <span class="text-subtitle1">
            {{ formatNumber(product?.price) }}$
          </span>
          <span class="text-caption q-mt-sm">
            {{ product?.description }}
          </span>
        </q-card-section>
        <q-card-section class="q-px-none" v-if="product.product_addons?.length > 0">
          <div class="col-12 bg-grey-2 q-pa-sm text-dark">
            <span class="text-subtitle2">+ Adicionales</span>
          </div>
        </q-card-section>
        <q-card-section class="col q-pt-xs">
          <div
            class="flex justify-between full-width items-center"
            v-for="addon in product.product_addons" :key="addon.id"
          >
            <div class="column">
              <span class="text-body2 text-uppercase text-bold">
                {{ addon.name }}
              </span>
              <span class="text-subtitle2 text-grey">
                {{ formatNumber(addon.price) }}$
              </span>
            </div>
            <div class="flex justify-between items-center q-gutter-xs">
              <q-btn
                icon="remove"
                color="primary"
                round
                size="sm"
                @click="addTemporalProducts(addon, addon.amount -= 1)"
              />
              <q-input
                borderless
                dense
                type="number"
                style="width: 30px;"
                input-class="text-center"
                v-model.number="addon.amount"
                @update:model-value="(value) => addTemporalProducts(product, value)"
              />
              <q-btn
                icon="add"
                color="primary"
                round
                size="sm"
                @click="addTemporalProducts(addon, addon.amount += 1)"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="negative"
            label="Cerrar"
            @click="() => {
              detailProduct = false
              product = null
            }"
          />
          <q-btn
            color="primary"
            label="Agregar"
            @click="addCar"
          />
        </q-card-actions>
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

    <q-dialog v-model="openAddClient" persistent :maximized="$q.screen.lt.md">
      <q-card :style="$q.screen.lt.md ? '' : 'width: 700px; max-width: 80vw;'">
        <q-form @submit="saveClient" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm col">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.document_number"
                autofocus
                label="Número de documento"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.name"
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.phone_number"
                label="Número de teléfono"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="clientAdded.address"
                label="Dirección"
                type="textarea"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="loadingClient"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
import { QrcodeStream } from 'vue-qrcode-reader'
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
    QrcodeStream,
    SkeletonCard,
    SlideComponent,
    DrawerTable
  },
  data () {
    return {
      /**
       * Clients
       * @type {Array}
       */
      clients: [],
      /**
       * Client
       * @type {Object}
       */
      client: null,
      /**
       * Filter
       * @type {String}
       */
      filter: null,
      /**
       * Client added
       * @type {Object}
       */
      clientAdded: {},
      /**
       * Temporal products
       * @type {Array}
       */
      temporalProducts: [],
      /**
       * Open add client
       * @type {Boolean}
       */
      openAddClient: false,
      /**
       * Loading client
       * @type {Boolean}
       */
      loadingClient: false,
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
          label: 'Descripción',
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
      pagination: { rowsPerPage: 50 },
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
      isTable: 1,
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
    this.isTable = this.userSession?.company_session?.company_config?.is_table
    this.getCategories()
    this.category = this.$route.query.category || 'all'
    this.products = this.command.products || []
    this.calculateTotal()
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
    },
    filter (data) {
      this.setQueryParams({
        filter: data
      })
    }
  },
  computed: {
    tab () {
      return this.$route.query.tab ?? 'menu'
    },
    command () {
      const store = useCommandStore()
      return store?.command
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  methods: {
    addCar () {
      this.temporalProducts.forEach(product => this.validateProduct(product))
      this.notifyProductCar(this.products)
      this.detailProduct = false
      this.temporalProducts = []
    },
    /**
     * Open product details
     * @param {Object} product
     */
    openProductDetails (product) {
      this.detailProduct = true
      this.product = product
      this.product.amount = 0
      if (product.product_addons && product.product_addons.length > 0) {
        this.product.product_addons = product.product_addons.map(addon => {
          addon.amount = 0
          return addon
        })
      }
    },
    /**
     * Save clients
     */
    saveClient () {
      this.loadingClient = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.openAddClient = false
          this.clientAdded = {}
          this.client = data
          this.loadingClient = false
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingClient = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * After save bill
     */
    afterSaveBill () {
      this.table = null
      this.client = null
      this.clientAdded = {}
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
     * Select category
     * @param {String} value user Session Value filter
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
     * Save bill and payments
     */
    async saveBill () {
      if (!this.command?.table?.id && this.isTable) {
        notify('No se puede crear pedido sin mesa', 'negative', 'warning')
        return
      }

      if (this.products.length === 0) {
        notify('No se puede crear pedido sin productos', 'negative', 'warning')
        return
      }

      if (!this.client) {
        notify('No se puede crear pedido sin cliente', 'negative', 'warning')
        return
      }

      try {
        this.billLoading = true
        await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          client_id: this.client?.id,
          products: this.command.products,
          branch_office_id: this.branchOffice?.id,
          tables: this.isTable ? [this.command?.table?.id] : [],
          company_id: this.userSession?.company_session_id
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
      data.subtotal = data.price * data.amount
      this.calculateTotal()
    },
    addTemporalProducts (data, amount) {
      const findProduct = this.findProduct(this.temporalProducts, data)
      if (findProduct) {
        findProduct.amount = amount
      } else {
        this.temporalProducts.push({
          ...data,
          amount
        })
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
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.findProduct(this.products, data)
      if (findProduct) {
        findProduct.amount += data.amount
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.subtotal = 0
        data.product_id = data.id
        this.products = [
          ...this.products,
          data
        ]
        this.calculate(data)
      }
    },
    /**
     * Set query params
     * @param {Object} query query params
     */
    setQueryParams (query) {
      this.$router.push({
        path: 'command',
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
        message: '¡Producto añadido con éxito! ¡Listo para confirmar su orden!',
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
    getCodeQr (code) {
      const newCode = code[0]
      const { id } = JSON.parse(newCode.rawValue)
      this.getTable(id)
    },
    /**
     * Get table
     * @param {Object} code code
     */
    async getTable (id) {
      try {
        this.loadingTable = true
        const { data } = await this.$api.get(`tables/${id}`)
        this.loadingTable = false
        if (data.status === 'busy') {
          notify('La mesa está ocupada', 'negative', 'warning')
          return
        }
        this.table = data
        this.setQueryParams({ tab: 'menu' })
      } catch (error) {
        this.table = null
        this.loadingTable = false
        notify(error.message, 'negative', 'warning')
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
