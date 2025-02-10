<template>
  <q-page padding>
    <div class="full-width text-subtitle1 flex justify-between items-center">
      <!-- <div>
        <q-chip style="padding: 17px 10px; border-radius: 50px;" class="bg-primary text-white cursor-pointer text-subtitle1" v-if="userSession && $q.screen.lt.sm">
          {{ userSession?.name }}
        </q-chip>
        <q-btn rounded style="padding: 5px 15px;" class="bg-primary text-white cursor-pointer" @click="dialogTable = true">
          Mesa: {{ command?.table?.name || 'Seleccionar mesa' }}
        </q-btn>
      </div> -->
      <span class="text-h6">Pedido</span>
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
            <div class="col-xs-6 col-sm-4 col-md-4" style="padding: 5px;">
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
                  :style="$q.screen.xs ? 'height: 150px;' : 'height: 300px;'"
                >
                  <div :class="$q.screen.xs ? 'absolute-full column items-center justify-center' : 'absolute-bottom text-center'">
                    <div class="text-bold text-subtitle1">
                      {{ props.row.name }}
                    </div>
                    <span class="text-caption">
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
    <div v-else class="q-mt-sm">
      <q-table
        row-key="name"
        dense
        grid
        style="max-height: calc(100vh - 210px); overflow: auto;"
        :rows="command.products"
        :columns="columns"
        hide-pagination
        v-model:pagination="pagination"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-3">
            <q-card class="my-card q-mt-sm" style="width: 97%; max-width: 400px; border-radius: 30px;">
              <q-card-section horizontal class="full-height">
                <q-img
                  class="col-4"
                  style="max-height: 200px;"
                  :src="props.row.images[0] ? props.row.images[0].url : 'images/404-image.jpg'"
                />
                <q-card-section class="column full-height">
                  <q-card-section class="q-pa-none">
                    <div class="flex justify-between">
                      <div class="flex justify-between items-center full-width">
                        <span class="text-subtitle2 text-uppercase text-bold">
                          {{ props.row.name }}
                        </span>
                        <span>
                          $ {{ formatNumber(props.row.price) }}
                        </span>
                      </div>
                      <div>
                        <span>
                          {{ props.row.description }}
                        </span>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-actions class="flex justify-between q-px-none">
                    <q-btn icon="delete" round size="sm" color="negative" @click="deleteProduct(props)"/>
                    <q-input
                      rounded
                      outlined
                      dense
                      v-model="props.row.amount"
                      label="Cantidad"
                      type="number"
                      style="width: 70%;"
                      @update:model-value="calculate(props.row)"
                    />
                  </q-card-actions>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
      <q-page-sticky position="bottom-right" :offset="[15, 5]">
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
    <q-dialog v-model="openAddClient" persistent :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 700px; max-width: 80vw;'">
        <q-form @submit="saveClient" class="column full-height">
          <q-card-section class="flex q-gutter-x-sm text-white bg-primary">
            <q-btn icon="arrow_back_ios" flat round dense @click="openAddClient = false"/>
            <span class="text-h6">Registrarse</span>
          </q-card-section>
          <q-card-section class="col">
            <div class="row q-gutter-y-sm">
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="client.name"
                  label="Nombre"
                />
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  filled
                  v-model="client.phone_number"
                  label="Número de teléfono"
                  :rules="[val => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="client.username"
                  label="Nombre de usuario"
                />
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="client.password"
                  label="Contraseña"
                  type="password"
                />
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <q-input
                  filled
                  v-model="client.address"
                  label="Dirección"
                  type="textarea"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit"/>
          </q-card-actions>
        </q-form>
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
    <q-dialog v-model="dialogPayment" position="bottom">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'paymentMethod'">
        <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
          <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="dialogPayment = false"/>
          <span class="text-subtitle1 text-uppercase text-bold">
            Método de pago
          </span>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-none">
          <p>
            Seleccione el método de pago que desea utilizar para pagar la factura.
            <br />
            Cuando seleccione el método de pago y confirme el pago,
            debe ingresar el comprobante de pago.
          </p>
        </q-card-section>
        <q-card-section class="q-gutter-sm q-pt-none">
          <q-card flat bordered v-for="payment in paymentMethods" :key="payment.id">
            <q-card-section class="q-py-sm">
              <q-radio v-model="paymentMethod" :val="payment.id" :label="payment.name" />
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-actions align="center" v-if="paymentMethod">
          <q-btn class="full-width" color="primary" label="Confirmar" @click="tabPayment = 'voucher'" />
        </q-card-actions>
      </q-card>
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'voucher'">
        <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
          <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="tabPayment = 'paymentMethod'"/>
          <span class="text-subtitle1 text-uppercase text-bold">
           Comprobante de pago
          </span>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-none">
          <p>
            Si no sube el comprobante de pago,
            se contactaran con usted via whatsapp o teléfono.
            para la confirmación del pago.
          </p>
        </q-card-section>
        <q-card-section class="q-pb-xs q-pt-sm flex justify-start items-center q-gutter-x-sm">
          <FileButtonComponent ref="fileButton" @upload="setFile" v-if="!file">
            <template v-slot:button>
              <div
                @click="$refs.fileButton.onClick()"
                class="flex flex-center column"
                style="height: 100px; min-width: 100%; border: 1px dashed #e0e0e0; border-radius: 5px; padding: 10px;">
                <q-icon name="image" color="primary" size="50px" />
                <span>
                  Seleccionar comprobante
                </span>
              </div>
            </template>
          </FileButtonComponent>
          <q-img v-else :src="file.url" style="border-radius: 10px;">
            <q-btn
              class="absolute all-pointer-events"
              size="sm"
              icon="close"
              color="negative"
              style="top: 1px; right: 1px"
              push
              dense
              round
              @click="file = null"
            >
              <q-tooltip>
                Eliminar Imagen
              </q-tooltip>
            </q-btn>
          </q-img>
        </q-card-section>
        <q-card-actions align="center" v-if="paymentMethod">
          <q-btn class="full-width" color="primary" label="Confirmar" @click="tabPayment = 'address'" />
        </q-card-actions>
      </q-card>
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 400px; max-width: 80vw;'" v-if="tabPayment === 'address'">
        <q-card-section class="q-pb-xs flex justify-start items-center q-gutter-x-sm">
          <q-btn icon="arrow_back_ios" size="sm" flat round dense @click="tabPayment = 'voucher'"/>
          <span class="text-subtitle1 text-uppercase text-bold">
           Confirmar dirección
          </span>
        </q-card-section>
        <q-card-section class="q-pt-sm q-pb-none">
          <p>
            Confirme su dirección para recibir el pedido.
          </p>
        </q-card-section>
        <q-card-section class="q-pb-xs q-pt-sm">
          <q-input type="textarea" v-model="address" filled label="Dirección" class="full-width" />
        </q-card-section>
        <q-card-actions align="center" v-if="address">
          <q-btn class="full-width" color="primary" label="Confirmar" @click="saveOrder" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script>
import { Notify } from 'quasar'
// import { QrcodeStream } from 'vue-qrcode-reader'
import { formatNumber, loading, notify, setFiles } from '../const/mixins'
import { useCommandStore } from '../stores/command'
import SkeletonCard from '../components/SkeletonCard.vue'
import SlideComponent from '../components/SlideComponent.vue'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
export default {
  name: 'CommandPage',
  components: {
    // QrcodeStream,
    SkeletonCard,
    SlideComponent,
    FileButtonComponent
  },
  data () {
    return {
      tabPayment: 'paymentMethod',
      client: {},
      user: {},
      address: '',
      paymentMethod: null,
      openAddClient: false,
      dialogPayment: false,
      openLoginDialog: false,
      paymentMethods: [],
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
    this.getCompany()
    this.getCategories()
    this.getPaymentMethods()
    this.category = this.$route.query.category || 'all'
    this.products = this.command.products || []
    this.calculateTotal()
    this.address = this.userSession?.address
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
    async getCompany () {
      try {
        const { data } = await this.$api.get(`public/company/${this.$route?.params?.company_id}`)
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
     * Save clients
     */
    async saveClient () {
      try {
        loading(true)
        const { data } = await this.$api.post(`public/clients/${this.$route.params.company_id}`, this.client)
        this.openAddClient = false
        this.client = {}
        console.log(data)
        this.setSessionData(data)
      } catch (error) {
        console.error(error)
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Save order
     */
    async saveOrder () {
      try {
        loading(true)
        await this.$api.post('command-orders', {
          seller_id: this.userSession?.id,
          products: this.command.products,
          address: this.address,
          company_id: this.$route?.params?.company_id,
          client_id: this.userSession.id,
          payments: [
            {
              payment_method_id: this.paymentMethod,
              amount: this.totalBill,
              reference: null,
              exchange: 1,
              coin_id: this.company?.company_config?.coin_id
            }
          ]
        })
        this.afterSaveBill()
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      if (!this.userSession) {
        this.openLoginDialog = true
        return
      }
      this.dialogPayment = true
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

      if (!this.validStockProduct(data, this.quantity)) {
        notify(
          `No hay stock suficiente para ${data.name}`,
          'negative',
          'warning'
        )
        return
      }

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
    },
    /**
     * Get categories
     */
    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get(`public/payment-methods/${this.$route.params.company_id}`)
        this.paymentMethods = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    ...mapActions(authentication, ['setSessionData', 'login'])
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
