<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <div class="row no-wrap" style="min-height: 100vh">
        <!-- LEFT SECTION: PURCHASE DETAILS -->
        <div class="col-5 bg-white q-pa-md" v-if="products.length > 0">
          <!-- Header with customer info -->
          <div class="q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h5 text-weight-medium text-primary">Su Compra</div>
              <div v-if="customerName" class="customer-badge">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                {{ customerName }}
              </div>
            </div>
            <q-separator />
          </div>

          <!-- Products list -->
          <div class="col-grow overflow-auto q-pr-sm" style="max-height: calc(100vh - 100px);">
            <q-list separator dense>
              <!-- Column headers -->
              <q-item class="text-caption text-grey-7 q-py-xs">
                <q-item-section class="col-5">Producto</q-item-section>
                <q-item-section class="col-2 text-center">Cantidad</q-item-section>
                <q-item-section class="col-2 text-right">Precio</q-item-section>
                <q-item-section class="col-3 text-right">Subtotal</q-item-section>
              </q-item>

              <!-- Product items -->
              <transition-group
                appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
              >
                <q-item v-for="product in products" :key="product.id" class="q-py-xs">
                  <q-item-section class="col-5">
                    <div class="text-body2">{{ product.name }}</div>
                  </q-item-section>
                  <q-item-section class="col-2 text-center">{{ product.amount }}</q-item-section>
                  <q-item-section class="col-2 text-right">{{ formatCurrency(product.price) }}</q-item-section>
                  <q-item-section class="col-3 text-right text-weight-medium">{{ formatCurrency(product.subtotal) }}</q-item-section>
                </q-item>
              </transition-group>
            </q-list>
          </div>
        </div>

        <!-- RIGHT SECTION: PROMOTIONS -->
        <div :class="products.length > 0 ? 'col-7 column justify-between q-pb-sm': 'col-12'">
          <q-carousel
            v-model="slide"
            animated
            swipeable
            infinite
            autoplay
            :autoplay-timeout="8000"
            transition-prev="slide-right"
            transition-next="slide-left"
            :style="products.length > 0 ? 'height: calc(100vh - 120px)' : 'height: calc(100vh - 10px)'"
          >
            <!-- Featured Product Promotion -->
            <q-carousel-slide :name="1" class="column no-wrap q-pb-none" v-if="userSession?.company_session">
              <div class="promotion-content">
                <q-img
                  :src="userSession?.company_session?.url"
                  spinner-color="primary"
                  fit="contain"
                  :style="products.length > 0 ? 'height: calc(100vh - 90px)' : 'height: calc(100vh - 50px)'"
                />
              </div>
            </q-carousel-slide>
            <q-carousel-slide :name="file.id" class="column no-wrap q-pb-none" v-for="file in files" :key="file.id">
              <div class="promotion-content">
                <q-img
                  spinner-color="primary"
                  fit="cover"
                  :src="file ? file.url : 'images/404-image.jpg'"
                  style="height: 100vh"
                />
              </div>
            </q-carousel-slide>
          </q-carousel>
          <!-- Order summary -->
          <div class="q-px-md" v-if="products.length > 0">
            <!-- Total -->
            <div class="row text-h5 justify-between total-section bg-positive text-white">
              <div>Total</div>
              <div class="text-h4 text-weight-bold">{{ formatCurrency(total) }}</div>
            </div>
            <!-- Payment methods -->
            <div v-if="paymentMethods.length > 0" class="q-mb-xs">
              <div class="payment-methods">
                <div v-for="(payment, index) in paymentMethods" :key="index" class="payment-method-item">
                  <div class="row items-center q-gutter-x-md">
                    <q-icon name="payments" size="md" class="q-mr-xs" />
                    <div>
                      <div class="text-subtitle2">{{ payment.name }}</div>
                      <div class="text-weight-medium">{{ formatCurrency(payment.amount) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Thank you message -->
            <div class="text-center text-grey-7 text-subtitle1 q-mt-xs">
              Gracias por su compra. ¡Vuelva pronto!
            </div>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useCommandStore } from 'src/stores/command'
import { notify } from '../const/mixins'
import { authentication } from 'src/stores/module-authentication'
export default {
  name: 'CustomerDisplay',
  data () {
    return {
      /**
       * Customer name
       * @type {string}
       */
      customerName: '',
      /**
       * Product list
       * @type {Array}
       */
      products: [],
      /**
       * Total amount
       * @type {number}
       */
      total: 0,
      /**
       * Payment methods
       * @type {Array}
       */
      paymentMethods: [],
      allProducts: [],
      /**
       * Slide index for the carousel
       * @type {Number}
       */
      slide: 1,
      /**
       * Currency type
       * @type {String}
       */
      currency: 'USD',
      /**
       * Locale for number formatting
       * @type {string}
       */
      locale: 'en-US',

      files: []
    }
  },
  computed: {
    ...mapState(useCommandStore, ['invoice']),
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  mounted () {
    this.getInvoice()
    this.getAllProducts()
    this.setInvoiceChannel(this.invoice)
  },
  methods: {
    /**
     * Format currency based on locale and currency type
     * @param {number} value - Value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency (value) {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency
      }).format(value)
    },
    /**
     * Get all products
     * @param {Object} params params to search
     */
    getAllProducts () {
      this.files = this.$companyConfig.files
    },
    /**
     * Set invoice data
     * @param {Object} invoice - Invoice data
     * @returns {void}
     */
    setInvoiceChannel (invoice) {
      this.products = invoice.products || []
      this.customerName = invoice.client?.name
      this.total = invoice.totalBill || 0
      this.paymentMethods = invoice.payments || []
      this.setInvoice(invoice)
    },
    /**
     * Get invoice
     * @returns {void}
     */
    getInvoice () {
      this.$echo.private('invoice-details').listen(`.NewInvoiceDetails_${this.userSession.id}`, async (event) => {
        console.log(event)
        this.setInvoiceChannel(event.invoice)
      })
      // this.channel.onmessage = (event) => {
      //   if (event.data.tipo === 'invoiceChanel') {
      //     const invoice = JSON.parse(event.data.invoice)
      //     this.setInvoiceChannel(invoice)
      //   }
      // }
    },
    ...mapActions(useCommandStore, ['setInvoice'])
  }
}
</script>

<style>
/* Promotion styling */
.promotion-gradient {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4), transparent);
  width: 100%;
}

.promotion-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
}

.promotion-content {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

/* Payment methods styling */
.payment-methods {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  gap: 8px;
}

.payment-method-item {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 160px;
}

/* Customer badge */
.customer-badge {
  background-color: #f0f8ff;
  color: #0d47a1;
  border-radius: 16px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  font-size: 18px;
}

/* Total section */
.total-section {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  align-items: center;
}

/* Text strike-through for original prices */
.text-strike {
  text-decoration: line-through;
}

/* Animations */
.animated {
  animation-duration: 0.5s;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
