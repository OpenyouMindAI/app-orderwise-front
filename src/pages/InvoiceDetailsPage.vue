<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <div class="invoice-container">
        <!-- LEFT SECTION: INVOICE DETAILS -->
        <div class="invoice-details-section" v-if="products.length > 0">
          <!-- Compact Header -->
          <div class="invoice-header">
            <div class="header-content">
              <div class="invoice-title">
                <q-icon name="receipt_long" size="20px" />
                <span class="title-text">Detalle de Compra</span>
              </div>
              <div v-if="customerName" class="customer-info">
                <q-icon name="account_circle" size="16px" />
                <span class="customer-name">{{ customerName }}</span>
              </div>
            </div>
          </div>

          <!-- Products List - Scrollable -->
          <div class="products-container">
            <div class="products-list">
              <div
                v-for="(product, index) in products"
                :key="product.id"
                class="product-item"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-quantity">x{{ product.amount }}</div>
                </div>
                <div class="product-pricing">
                  <div class="product-subtotal">{{ formatCurrency(product.subtotal) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Section - Fixed at Bottom -->
          <div class="invoice-summary">
            <!-- Payment Methods -->
            <div v-if="paymentMethods.length > 0" class="payment-methods-section">
              <div class="payment-methods-list">
                <div
                  v-for="(payment, index) in paymentMethods"
                  :key="index"
                  class="payment-method"
                >
                  <q-icon name="credit_card" size="14px" />
                  <span class="payment-name">{{ payment.name }}</span>
                  <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <span class="total-label">Total</span>
              <span class="total-amount">{{ formatCurrency(total) }}</span>
            </div>

            <!-- Thank You Message -->
            <div class="thank-you-message">
              <q-icon name="favorite" size="16px" color="red-5" />
              <span>¡Gracias por su compra!</span>
            </div>
          </div>
        </div>

        <!-- RIGHT SECTION: PROMOTIONS -->
        <div :class="products.length > 0 ? 'promotions-section' : 'promotions-section-full'">
          <q-carousel
            v-model="slide"
            animated
            swipeable
            infinite
            autoplay
            :autoplay-timeout="8000"
            transition-prev="slide-right"
            transition-next="slide-left"
            class="full-height-carousel"
          >
            <q-carousel-slide :name="1" class="carousel-slide" v-if="userSession?.company_session">
              <div class="carousel-image-container">
                <q-img
                  :src="userSession?.company_session?.url"
                  spinner-color="primary"
                  fit="contain"
                  class="carousel-image"
                />
              </div>
            </q-carousel-slide>
            <q-carousel-slide
              :name="file.id"
              class="carousel-slide"
              v-for="file in files"
              :key="file.id"
            >
              <div class="carousel-image-container">
                <q-img
                  spinner-color="primary"
                  fit="contain"
                  :src="file ? file.url : 'images/404-image.jpg'"
                  class="carousel-image"
                />
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <!-- Success Modal -->
      <q-dialog v-model="showSuccessModal" persistent>
        <q-card class="success-modal">
          <q-card-section class="success-content">
            <!-- Success Animation -->
            <div class="success-animation">
              <div class="success-checkmark">
                <div class="check-icon">
                  <span class="icon-line line-tip"></span>
                  <span class="icon-line line-long"></span>
                  <div class="icon-circle"></div>
                  <div class="icon-fix"></div>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div class="success-message">
              <h4 class="success-title">¡Compra Exitosa!</h4>
              <p class="success-subtitle">Su pedido ha sido procesado correctamente</p>
            </div>

            <!-- Invoice Summary -->
            <div class="modal-invoice-summary">
              <div class="modal-customer">
                <q-icon name="person" size="18px" />
                <span>{{ customerName || 'Cliente' }}</span>
              </div>

              <div class="modal-total">
                <span class="modal-total-label">Total Pagado</span>
                <span class="modal-total-amount">{{ formatCurrency(previousTotal) }}</span>
              </div>

              <div v-if="previousPayments.length > 0" class="modal-payments">
                <div
                  v-for="(payment, index) in previousPayments"
                  :key="index"
                  class="modal-payment-item"
                >
                  <span>{{ payment.name }}</span>
                  <span>{{ formatCurrency(payment.amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Countdown -->
            <div class="modal-countdown">
              <q-circular-progress
                :value="countdownProgress"
                size="40px"
                :thickness="0.2"
                color="primary"
                track-color="grey-3"
              >
                <span class="countdown-text">{{ countdown }}</span>
              </q-circular-progress>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useCommandStore } from 'src/stores/command'
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
      /**
       * Files for carousel
       * @type {Array}
       */
      files: [],
      /**
       * Show success modal
       * @type {Boolean}
       */
      showSuccessModal: false,
      /**
       * Countdown timer
       * @type {Number}
       */
      countdown: 5,
      /**
       * Countdown interval
       * @type {Number|null}
       */
      countdownInterval: null,
      /**
       * Previous total to detect invoice closure
       * @type {Number}
       */
      previousTotal: 0,
      /**
       * Previous payments to detect invoice closure
       * @type {Array}
       */
      previousPayments: []
    }
  },
  computed: {
    ...mapState(useCommandStore, ['invoice']),
    ...mapState(authentication, ['branchOffice', 'userSession']),
    /**
     * Calculate countdown progress for circular progress bar
     * @returns {number} Progress percentage
     */
    countdownProgress () {
      return (this.countdown / 5) * 100
    }
  },
  mounted () {
    this.getInvoice()
    this.getAllProducts()
    this.setInvoiceChannel(this.invoice)
  },
  beforeUnmount () {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
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
      const hasProducts = invoice.products && invoice.products.length > 0
      const hadProducts = this.products.length > 0

      // Detectar cuando se cierra una factura:
      // - Tenía productos antes
      // - Ahora no tiene productos
      // - Tenía un total mayor a 0
      // - Tenía métodos de pago
      if (hadProducts && !hasProducts && this.previousTotal > 0 && this.previousPayments.length > 0) {
        // La factura se cerró exitosamente, mostrar modal con datos anteriores
        this.showSuccessAnimation()
      } else if (!hadProducts && hasProducts) {
        // Nueva factura llegó, cerrar modal si está abierto
        if (this.showSuccessModal) {
          this.closeSuccessModal()
        }
      }

      // Guardar estado anterior antes de actualizar
      if (hasProducts) {
        this.previousTotal = invoice.totalBill || 0
        this.previousPayments = invoice.payments || []
      }

      // Actualizar datos actuales
      this.products = invoice.products || []
      this.customerName = invoice.client?.name
      this.total = invoice.totalBill || 0
      this.paymentMethods = invoice.payments || []
      this.setInvoice(invoice)
    },
    /**
     * Show success animation modal
     * @returns {void}
     */
    showSuccessAnimation () {
      this.showSuccessModal = true
      this.countdown = 5
      this.startCountdown()
    },
    /**
     * Start countdown timer
     * @returns {void}
     */
    startCountdown () {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
      }

      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.closeSuccessModal()
        }
      }, 1000)
    },
    /**
     * Close success modal
     * @returns {void}
     */
    closeSuccessModal () {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
      this.showSuccessModal = false
      this.countdown = 5
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

<style scoped>
/* Main Container */
.invoice-container {
  display: flex;
  min-height: 100vh;
}

/* Invoice Details Section */
.invoice-details-section {
  width: 35%;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Compact Header */
.invoice-header {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  color: white;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-text {
  font-size: 1rem;
  font-weight: 600;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  align-self: flex-start;
}

.customer-name {
  font-size: 0.8rem;
  font-weight: 500;
}

/* Products Container - Scrollable */
.products-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* Product Item - Compact */
.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(var(--q-primary-rgb), 0.05);
  border-left: 3px solid var(--q-primary);
  border-radius: 6px;
  transition: all 0.2s ease;
  animation: slideInUp 0.3s ease forwards;
  opacity: 0;
}

.product-item:hover {
  background: rgba(var(--q-primary-rgb), 0.1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.product-name {
  font-size: 0.85rem;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-quantity {
  font-size: 0.75rem;
  color: var(--q-primary);
  font-weight: 700;
  background: rgba(var(--q-primary-rgb), 0.15);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-pricing {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.product-subtotal {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--q-primary);
}

/* Invoice Summary - Fixed at Bottom */
.invoice-summary {
  padding: 0.75rem 1rem;
  border-top: 2px solid rgba(var(--q-primary-rgb), 0.2);
  flex-shrink: 0;
  background: inherit;
}

/* Payment Methods - Compact */
.payment-methods-section {
  margin-bottom: 0.5rem;
}

.payment-methods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  background: rgba(var(--q-primary-rgb), 0.1);
  border-radius: 6px;
  font-size: 0.75rem;
}

.payment-name {
  font-weight: 500;
}

.payment-amount {
  font-weight: 700;
  color: var(--q-primary);
}

/* Total Section - Compact */
.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.total-label {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

/* Thank You Message - Compact */
.thank-you-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
  font-weight: 500;
}

/* Promotions Section */
.promotions-section {
  width: 65%;
  overflow: hidden;
}

.promotions-section-full {
  width: 100%;
  overflow: hidden;
}

.full-height-carousel {
  height: 100vh;
  width: 100%;
}

.carousel-slide {
  padding: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Success Modal */
.success-modal {
  min-width: 400px;
  max-width: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.success-content {
  padding: 1.5rem;
  text-align: center;
}

/* Success Animation */
.success-animation {
  margin-bottom: 1rem;
}

.success-checkmark {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #4caf50;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0px 0px 0px #4caf50;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
  position: relative;
}

.success-checkmark .check-icon {
  width: 60px;
  height: 60px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 3px solid #4caf50;
}

.success-checkmark .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .line-tip {
  top: 34px;
  left: 10px;
  width: 18px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .line-long {
  top: 28px;
  right: 6px;
  width: 35px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.success-checkmark .icon-circle {
  top: -3px;
  left: -3px;
  z-index: 10;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 3px solid rgba(76, 175, 80, 0.5);
}

.success-checkmark .icon-fix {
  top: 6px;
  width: 5px;
  left: 19px;
  z-index: 1;
  height: 63px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: var(--q-dark);
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 46px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #4caf50;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

/* Success Message */
.success-message {
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.35rem 0;
}

.success-subtitle {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0;
}

/* Modal Invoice Summary */
.modal-invoice-summary {
  background: rgba(var(--q-primary-rgb), 0.08);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.modal-customer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  opacity: 0.8;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(var(--q-primary-rgb), 0.12);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.modal-total-label {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

.modal-total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--q-primary);
}

.modal-payments {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.modal-payment-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(var(--q-primary-rgb), 0.08);
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Modal Countdown */
.modal-countdown {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
}

.countdown-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--q-primary);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 1024px) {
  .invoice-details-section {
    width: 50%;
  }
  .promotions-section {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .invoice-container {
    flex-direction: column;
  }
  .invoice-details-section {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .promotions-section {
    width: 100%;
  }
  .success-modal {
    min-width: 90%;
  }
}
</style>
