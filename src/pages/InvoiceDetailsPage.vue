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
                  <div class="product-subtotal">{{ formatNumber(product.subtotal) }}</div>
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
                  <span class="payment-amount">{{ formatNumber(payment.amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <span class="total-label">Total</span>
              <span class="total-amount">{{ formatNumber(total) }}</span>
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
      <q-dialog v-model="showSuccessModal" persistent transition-show="scale" transition-hide="scale">
        <q-card class="success-modal-modern">
          <q-card-section class="text-center q-pt-xl q-pb-md relative-position">
            <!-- Icono animado con círculos -->
            <div class="success-icon-container">
              <div class="success-circle-1"></div>
              <div class="success-circle-2"></div>
              <div class="success-circle-3"></div>
              <q-avatar size="100px" class="success-avatar">
                <q-icon name="check" size="60px" color="white" class="success-check-icon" />
              </q-avatar>
            </div>

            <!-- Título con animación -->
            <div class="text-h5 text-weight-bold q-mt-lg success-title">
              ¡Compra Exitosa!
            </div>
            <div class="text-body2 q-mt-xs success-subtitle" style="opacity: 0.7">
              Su pedido ha sido procesado correctamente
            </div>
          </q-card-section>

          <!-- Invoice Summary -->
          <q-card-section class="q-px-lg q-pb-md q-pt-none">
            <div class="modal-invoice-summary">
              <div class="modal-customer">
                <q-icon name="person" size="20px" />
                <span class="text-weight-medium">{{ previousCustomerName || 'Cliente' }}</span>
              </div>

              <q-separator class="q-my-sm" />

              <div class="modal-total">
                <span class="modal-total-label">Total Pagado</span>
                <span class="modal-total-amount">{{ formatNumber(previousTotal) }}</span>
              </div>

              <div v-if="previousPayments.length > 0" class="modal-payments q-mt-sm">
                <div
                  v-for="(payment, index) in previousPayments"
                  :key="index"
                  class="modal-payment-item"
                >
                  <q-icon name="credit_card" size="16px" />
                  <span class="payment-name">{{ payment.name }}</span>
                  <span class="payment-amount">{{ formatNumber(payment.amount) }}</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Countdown y botón cerrar -->
          <q-card-section class="q-px-lg q-pb-lg q-pt-none">
            <div class="column q-gutter-y-sm items-center">
              <div class="modal-countdown">
                <q-circular-progress
                  :value="countdownProgress"
                  size="50px"
                  :thickness="0.15"
                  color="primary"
                  track-color="grey-3"
                >
                  <span class="countdown-text">{{ countdown }}</span>
                </q-circular-progress>
              </div>
              <q-btn
                outline
                label="Cerrar"
                color="grey-8"
                @click="closeSuccessModal"
                class="full-width action-btn-close"
                size="md"
                no-caps
              />
            </div>
          </q-card-section>

          <!-- Confetti decorativo -->
          <div class="confetti-container">
            <div class="confetti" v-for="i in 20" :key="i" :style="{ left: (i * 5) + '%' }"></div>
          </div>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useCommandStore } from 'src/stores/command'
import { authentication } from 'src/stores/module-authentication'
import { useThemeStore } from 'src/stores/themeStore'
import { formatNumber } from 'src/const/mixins'
export default {
  name: 'CustomerDisplay',
  data () {
    return {
      formatNumber,
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
      currency: 'PES',
      /**
       * Locale for number formatting
       * @type {string}
       */
      locale: 'es-US',
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
      previousPayments: [],
      /**
       * Previous customer name to detect invoice closure
       * @type {String}
       */
      previousCustomerName: ''
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
    // Aplicar tema desde localStorage
    this.initializeTheme()

    this.getInvoice()
    this.setInvoiceChannel(this.invoice)
  },
  beforeUnmount () {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },
  methods: {
    /**
     * Initialize theme from localStorage
     * @returns {void}
     */
    initializeTheme () {
      try {
        const themeStore = useThemeStore()
        const savedTheme = localStorage.getItem('app-theme')

        // Aplicar dark mode
        if (savedTheme) {
          // Verificar si el tema es oscuro
          const isDark = savedTheme.toLowerCase().includes('dark') ||
                        savedTheme.toLowerCase().includes('oscuro')
          this.$q.dark.set(isDark)
        } else {
          // Si no hay tema guardado, usar el modo del sistema
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          this.$q.dark.set(prefersDark)
        }

        // Aplicar colores del tema personalizado
        if (savedTheme && themeStore.themes[savedTheme]) {
          const theme = themeStore.themes[savedTheme]
          const root = document.documentElement

          // Aplicar variables CSS personalizadas
          root.style.setProperty('--primary', theme.primary)
          root.style.setProperty('--primary-dark', theme.primaryDark)
          root.style.setProperty('--primary-light', theme.primaryLight)
          root.style.setProperty('--secondary', theme.secondary)
          root.style.setProperty('--secondary-dark', theme.secondaryDark)

          // Aplicar colores de Quasar
          if (this.$q && this.$q.colors) {
            this.$q.colors.setBrand('primary', theme.primary)
            this.$q.colors.setBrand('secondary', theme.secondary)
          }

          // También actualizar las variables de Quasar
          root.style.setProperty('--q-primary', theme.primary)
          root.style.setProperty('--q-secondary', theme.secondary)
        }
      } catch (error) {
        console.error('Error al inicializar tema:', error)
      }
    },
    /**
     * Set invoice data
     * @param {Object} invoice - Invoice data
     * @returns {void}
     */
    setInvoiceChannel (invoice) {
      const hasProducts = invoice.products && invoice.products.length > 0
      const hadProducts = this.products.length > 0
      const hasPayments = invoice.payments && invoice.payments.length > 0
      const currentTotal = invoice.totalBill || 0

      // Guardar estado ANTES de cualquier verificación
      // Solo guardar si hay datos válidos (productos, total y pagos)
      if (hasProducts && currentTotal > 0 && hasPayments) {
        this.previousTotal = currentTotal
        this.previousPayments = [...invoice.payments]
        this.previousCustomerName = invoice.client?.name || this.customerName
      }

      // Detectar cuando se cierra una factura:
      // - Tenía productos antes
      // - Ahora no tiene productos (factura limpiada)
      // - Tenemos datos guardados de la factura anterior
      if (hadProducts && !hasProducts && this.previousTotal > 0) {
        // La factura se cerró exitosamente, mostrar modal con datos anteriores
        this.showSuccessAnimation()
      } else if (!hadProducts && hasProducts) {
        // Nueva factura llegó, cerrar modal si está abierto
        if (this.showSuccessModal) {
          this.closeSuccessModal()
        }
      }

      // Actualizar datos actuales
      this.products = invoice.products || []
      this.customerName = invoice.client?.name || ''
      this.total = currentTotal
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
      this.$echo.private('invoice-details').listen(`.NewInvoiceDetails_${this.userSession.id}`, (event) => {
        console.log('Invoice update:', event)
        this.setInvoiceChannel(event.invoice)
      })
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

/* Success Modal - Modern Design */
.success-modal-modern {
  border-radius: 24px;
  min-width: 360px;
  max-width: 420px;
  overflow: hidden;
  position: relative;
}

/* Contenedor del icono con círculos animados */
.success-icon-container {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

.success-circle-1,
.success-circle-2,
.success-circle-3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #21ba45;
  opacity: 0;
}

.success-circle-1 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out;
}

.success-circle-2 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out 0.2s;
}

.success-circle-3 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out 0.4s;
}

@keyframes ripple {
  0% {
    width: 100px;
    height: 100px;
    opacity: 0.6;
  }
  100% {
    width: 180px;
    height: 180px;
    opacity: 0;
  }
}

/* Avatar con animación */
.success-avatar {
  background: linear-gradient(135deg, #21ba45 0%, #1a9e3a 100%) !important;
  box-shadow: 0 8px 24px rgba(33, 186, 69, 0.4);
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 1;
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Icono check con animación de dibujo */
.success-check-icon {
  animation: checkDraw 0.5s ease-out 0.3s both;
}

@keyframes checkDraw {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Título con animación */
.success-title {
  animation: slideUp 0.5s ease-out 0.4s both;
}

.success-subtitle {
  animation: slideUp 0.5s ease-out 0.5s both;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Modal Invoice Summary */
.modal-invoice-summary {
  background: rgba(var(--q-primary-rgb), 0.08);
  border-radius: 12px;
  padding: 1rem;
  animation: slideUp 0.5s ease-out 0.6s both;
}

.modal-customer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.modal-total-label {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.7;
}

.modal-total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--q-primary);
}

.modal-payments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-payment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(var(--q-primary-rgb), 0.08);
  border-radius: 8px;
  font-size: 0.85rem;
}

.payment-name {
  flex: 1;
  font-weight: 500;
}

.payment-amount {
  font-weight: 700;
  color: var(--q-primary);
}

/* Modal Countdown */
.modal-countdown {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slideUp 0.5s ease-out 0.7s both;
}

.countdown-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--q-primary);
}

/* Botón cerrar */
.action-btn-close {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out 0.8s both;
  border-width: 2px !important;
}

.action-btn-close:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.05);
}

body.body--dark .action-btn-close:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Confetti decorativo */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -10px;
  border-radius: 50%;
  animation: confettiFall 3s ease-out forwards;
  opacity: 0;
}

.confetti:nth-child(2n) {
  background: linear-gradient(135deg, #21ba45 0%, #1a9e3a 100%);
  animation-delay: 0.1s;
}

.confetti:nth-child(3n) {
  background: linear-gradient(135deg, #f2c94c 0%, #f2994a 100%);
  animation-delay: 0.2s;
}

.confetti:nth-child(4n) {
  width: 6px;
  height: 6px;
  animation-delay: 0.15s;
}

@keyframes confettiFall {
  0% {
    top: -10px;
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: translateX(calc(var(--random-x, 0) * 50px)) rotate(360deg);
  }
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
