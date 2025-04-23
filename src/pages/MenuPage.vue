<template>
  <q-page padding>
    <div class="full-width text-subtitle1 flex justify-between items-center" v-if="tab !== 'orders'">
      <span class="text-h6">Pedido</span>
      <q-chip class="bg-secondary text-white cursor-pointer">
        {{ this.paramsUrl.name }}
      </q-chip>
      <q-chip class="bg-secondary text-white cursor-pointer">
        Total: {{ formatNumber(totalBill) }}
      </q-chip>
    </div>
    <div class="row q-col-gutter-y-xs q-mt-sm" v-if="tab === 'menu'">
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
      <div class="col-12" style="max-height: calc(100vh - 290px); overflow-y: auto;">
        <q-tabs
          v-model="category"
          class="text-teal overflow-hidden"
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
      <div class="col-12" style="max-height: calc(100vh - 260px); overflow-y: auto;">
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
          :loading="loadingPage"
          :filter="filter"
          :pagination="pagination"
          v-else
        >
          <template v-slot:item="props">
            <div class="col-xs-6 col-sm-3 col-md-2 col-lg-2" style="padding: 5px;">
              <q-card
                :class="findProduct(command.products, props.row) && 'shadow-20'"
                :style="`${findProduct(command.products, props.row) && 'border: solid 2px green;'}  height: 100%; border-radius: 20px;`"
                @click="openProductDetails(props.row)"
              >
                <q-img
                  fit="fill"
                  no-native-menu
                  :src="props.row.images[0] ? props.row.images[0].url : 'https://cdn.quasar.dev/img/image-src.png'"
                  spinner-color="primary"
                  style="height: 180px;"
                >
                  <div class="absolute-full column items-center justify-center text-center">
                    <div class="text-bold text-body1">
                      {{ props.row.name.slice(0, 20) }}
                    </div>
                    <span class="text-subtitle2">
                      {{ formatNumber(props.row.price) }} $
                    </span>
                    <q-badge v-if="!validStockProduct(props.row, 1)" color="negative" floating style="top: 7px; right: 7px;">
                      Sin stock
                    </q-badge>
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
    <div v-else-if="tab === 'command'" class="q-mt-sm">
      <q-table
        row-key="name"
        dense
        grid
        style="max-height: calc(100vh - 210px); overflow: auto;"
        :rows="command.products"
        hide-pagination
        v-model:pagination="pagination"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card
              class="my-card q-mt-sm"
              style="width: 100%; max-width: 400px; border-radius: 30px;"
            >
              <q-card-section horizontal class="full-height">
                <q-img
                  class="col-4"
                  style="max-height: 132px;"
                  :src="props.row?.images[0] ? props.row?.images[0]?.url : 'images/404-image.jpg'"
                />
                <q-card-section class="q-pa-sm column">
                  <q-card-section class="q-pa-sm col">
                    <span class="text-body2 text-uppercase text-bold">
                      {{ props.row.name.slice(0, 20) }}
                    </span>
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
        <template v-slot:no-data>
          <div class="full-width column flex-center justify-center">
            <q-img src="images/car_empty.png" style="width: 300px; max-width: 80vw;" />
            <span class="text-subtitle2 text-center">
              No hay productos en la orden
            </span>
          </div>
        </template>
      </q-table>
      <q-page-sticky position="bottom-right" :offset="[15, 5]">
        <q-btn
          round
          icon="receipt"
          color="primary"
          :loading="billLoading"
          @click="saveOrder"
        />
      </q-page-sticky>
    </div>
    <q-dialog v-model="detailProduct">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 400px; max-width: 80vw;'}`"
      >
        <SlideComponent :slides="product.images" styles="height: 200px;"/>
        <q-card-section class="scroll q-pa-none col" style="max-height: calc(100vh - 150px); overflow: auto;">
          <q-card-section class="column q-pb-xs">
            <div class="column justify-between full-width">
              <span class="text-subtitle1 text-uppercase text-bold">
                {{ product?.name }}
              </span>
              <span class="text-subtitle1">
                {{ formatNumber(product?.price) }}$
              </span>
              <div class="flex justify-between items-center q-gutter-xs">
                <q-btn
                  icon="remove"
                  color="primary"
                  round
                  flat
                  size="lg"
                  @click="addTemporalProducts(product, product.amount -= 1)"
                />
                <q-input
                  borderless
                  dense
                  type="number"
                  style="width: 40px;"
                  input-class="text-center"
                  v-model.number="product.amount"
                  @update:model-value="(value) => addTemporalProducts(product, value)"
                />
                <q-btn
                  icon="add"
                  color="primary"
                  round
                  flat
                  size="lg"
                  @click="addTemporalProducts(product, product.amount += 1)"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-px-none col" v-if="product.product_addons?.length > 0">
            <div class="col-12 bg-grey-2 q-pa-sm text-dark">
              <span class="text-subtitle2">+ Adicionales</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-xs">
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
          <q-separator />
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
    <q-dialog v-model="openLoginDialog" persistent>
      <q-card :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 400px; max-width: 80vw;'">
        <q-form @submit="loginAt" class="column full-height">
          <q-card-section class="flex justify-between q-gutter-x-sm text-white bg-primary">
            <span class="text-h6">Iniciar sesión</span>
            <q-btn icon="close" flat round dense @click="openLoginDialog = false"/>
          </q-card-section>
          <q-card-section class="col">
            <div class="row q-gutter-y-sm">
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="user.username"
                  label="Nombre de usuario"
                />
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="user.password"
                  label="Contraseña"
                  type="password"
                />
              </div>
              <div class="col-12 text-right">
                <q-btn flat color="secondary" label="No tengo una cuenta" @click="openAddClient = true" />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Iniciar sesión" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="detailsDialog" persistent maximized>
      <q-card>
        <q-card-section class="flex justify-between items-center bg-primary text-white">
          <span class="text-h6">Detalles de la orden</span>
          <q-btn icon="close" flat round dense @click="detailsDialog = false" />
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
            <div class="col-12">
              <q-input
                type="textarea"
                filled
                v-model="invoice.description"
                readonly
                label="Descripción"
              />
            </div>
            <div class="col-12">
              <span class="text-h6">Pagos</span>
            </div>
            <div class="col-12 q-mt-md column" v-for="payment in invoice.invoice_payments" :key="payment.id">
              <span class="text-subtitle1 text-uppercase">
                {{ payment.payment_method.name }}
              </span>
              <img v-for="file in payment.files" alt="pago" :key="file.id" :src="file.url" style="max-height: 300px; max-width: 400px;" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
import { formatDate, formatNumber, loading, notify, setFiles } from '../const/mixins'
import { useCommandStore } from '../stores/command'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { status } from 'src/const/invoice'
export default {
  name: 'CatalogPage',
  components: {
    SkeletonCard,
    SlideComponent
  },
  data () {
    return {
      status,
      formatDate,
      tabPayment: 'paymentMethod',
      client: {},
      user: {},
      address: '',
      invoices: [],
      paymentMethod: null,
      openAddClient: false,
      dialogPayment: false,
      openLoginDialog: false,
      paymentMethods: [],
      temporalProducts: [],
      file: null,
      company: null,
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
      invoice: null,
      detailsDialog: false,
      filter: '',
      paramsUrl: null,
      /**
       * Pagination option
       * @type {Object}
       */
      invoicePagination: {
        rowsPerPage: 10,
        rowsNumber: 10,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
    }
  },
  created () {
    if (this.$route.query.p) {
      this.paramsUrl = JSON.parse(atob(this.$route.query.p))
      this.getCompany(this.paramsUrl)
      this.getCategories(this.paramsUrl)
      this.getPaymentMethods(this.paramsUrl)
    } else {
      this.$router.go(-1)
    }
    this.category = this.$route.query.category || 'all'
    this.products = this.command.products || []
    this.calculateTotal()
  },
  watch: {
    category (data) {
      this.setQueryParams({ category: data || 'all', tab: this.tab })
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
    command () {
      const store = useCommandStore()
      return store?.command
    },
    ...mapState(authentication, ['userSession', 'branchOffice'])
  },
  methods: {
    /**
     * Open product details
     * @param {Object} product
     */
    openProductDetails (product) {
      this.detailProduct = true
      this.product = product
      this.product.amount = 1
      this.addTemporalProducts(product, product.amount)
      if (product.product_addons && product.product_addons.length > 0) {
        this.product.product_addons = product.product_addons.map(addon => {
          addon.amount = 0
          return addon
        })
      }
    },
    /**
     * Add product to car
     */
    addCar () {
      this.temporalProducts.forEach(product => {
        console.log(product)
        this.validateProduct(product)
      })
      this.notifyProductCar(this.products)
      this.detailProduct = false
      this.temporalProducts = []
      this.product = {
        amount: 1,
        quantity: 1
      }
    },
    /**
     * Add temporal products
     */
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
     * Open details
     * @param {Object} data invoice
     */
    openDetails (data) {
      this.invoice = data
      this.detailsDialog = true
    },
    /**
     * Get company
     */
    async getCompany (params) {
      try {
        const { data } = await this.$api.get(`public/company/${params.company_id}`)
        this.company = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Set file
     * @param {Array} files files
     */
    async setFile (files) {
      const file = await setFiles(files)
      this.file = file[0]
    },
    /**
     * After save bill
     */
    afterSaveBill () {
      this.products = []
      this.setQueryParams({ tab: 'menu' })
      this.totalBill = 0
      this.file = null
      this.paymentMethod = null
      this.tabPayment = 'paymentMethod'
      notify('Pedido creado exitosamente', 'positive', 'check_circle')
    },
    /**
     * Save order
     */
    async saveOrder () {
      try {
        loading(true)
        await this.$api.post('public/command-orders', {
          seller_id: this.userSession?.id,
          products: this.command.products,
          company_id: this.paramsUrl.company_id,
          client_id: this.company?.company_config?.client_id,
          tables: [this.paramsUrl.id],
          code: 1
        })
        this.afterSaveBill()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
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
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
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
     * Login app
     */
    async loginAt () {
      try {
        loading(true)
        await this.login(this.user)
        this.openLoginDialog = false
        this.dialogPayment = true
        this.user = {}
      } catch (error) {
        notify(error?.response?.data?.message || error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Valid stock product
     * @param {Object} data data
     * @param {Number} amount amount
     */
    validStockProduct (data, amount) {
      const stock = data.is_bundle ? data.bundle_stock : data.normal_stock
      if (!data.skip_stock) {
        return stock >= amount
      }
      return true
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data) {
      const findProduct = this.findProduct(this.products, data)

      if (!this.validStockProduct(data, 1)) {
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
        return
      }
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
      console.log(query)
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
     * Get all products
     */
    async getAllProducts () {
      try {
        this.loadingPage = true
        const { data } = await this.$api.get(`public/products/${this.paramsUrl.company_id}`, {
          params: {
            stock: true,
            withStock: true,
            mostSold: true,
            branch_office_id: this.paramsUrl.branch_office_id,
            dataEqualFilter: {
              category_id: this.category === 'all' ? null : this.category,
              show_catalog: 1,
              'category.show_catalog': 1
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
    async getCategories (params) {
      try {
        const { data } = await this.$api.get(`public/categories/${params.company_id}`, {
          params: {
            show_catalog: 1
          }
        })
        this.categories = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get categories
     */
    async getPaymentMethods (params) {
      try {
        const { data } = await this.$api.get(`public/payment-methods/${params.company_id}`)
        this.paymentMethods = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    ...mapActions(authentication, ['setSessionData', 'login'])
  }
}
</script>
