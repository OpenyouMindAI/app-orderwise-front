<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-1">
    <q-page-container>
      <div class="row no-wrap full-height">
        <!-- LEFT SECTION: PURCHASE DETAILS -->
        <div class="col-5 bg-white q-pa-md column justify-between">
          <!-- Header with customer info -->
          <div class="q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-h5 text-weight-medium text-primary">Your Purchase</div>
              <div v-if="customerName" class="customer-badge">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                {{ customerName }}
              </div>
            </div>
            <q-separator />
          </div>

          <!-- Products list -->
          <div class="col-grow overflow-auto q-pr-sm" style="max-height: calc(100vh - 450px);">
            <q-list separator>
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
                    <div class="text-subtitle1">{{ product.name }}</div>
                    <div v-if="product.description" class="text-caption text-grey-7">{{ product.description }}</div>
                  </q-item-section>
                  <q-item-section class="col-2 text-center">{{ product.quantity }}</q-item-section>
                  <q-item-section class="col-2 text-right">{{ formatCurrency(product.price) }}</q-item-section>
                  <q-item-section class="col-3 text-right text-weight-medium">{{ formatCurrency(product.subtotal) }}</q-item-section>
                </q-item>
              </transition-group>
            </q-list>
          </div>

          <!-- Order summary -->
          <div class="q-mt-md">
            <q-separator class="q-mb-md" />

            <!-- Subtotal, tax, discounts -->
            <div class="row justify-between q-mb-sm text-subtitle1">
              <div class="text-grey-7">Subtotal</div>
              <div>{{ formatCurrency(subtotal) }}</div>
            </div>
            <div class="row justify-between q-mb-sm text-subtitle1">
              <div class="text-grey-7">Tax</div>
              <div>{{ formatCurrency(tax) }}</div>
            </div>
            <div v-if="discount > 0" class="row justify-between q-mb-sm text-subtitle1 text-negative">
              <div>Discount</div>
              <div>-{{ formatCurrency(discount) }}</div>
            </div>

            <!-- Total -->
            <div class="row justify-between q-my-md total-section">
              <div class="text-h5">Total</div>
              <div class="text-h4 text-primary text-weight-bold">{{ formatCurrency(total) }}</div>
            </div>

            <!-- Payment methods -->
            <div v-if="paymentMethods.length > 0" class="q-mb-md">
              <div class="text-subtitle1 text-grey-8 q-mb-sm">Métodos de pago</div>
              <div class="payment-methods">
                <div v-for="(payment, index) in paymentMethods" :key="index" class="payment-method-item">
                  <div class="row items-center">
                    <div>
                      <div class="text-subtitle2">{{ payment.method }}</div>
                      <div class="text-weight-medium">{{ formatCurrency(payment.amount) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thank you message -->
            <div class="text-center text-grey-7 text-caption q-mt-xs">
              Thank you for your purchase!
            </div>
          </div>
        </div>

        <!-- RIGHT SECTION: PROMOTIONS -->
        <div class="col-7 bg-grey-2">
          <q-carousel
            v-model="slide"
            animated
            swipeable
            infinite
            autoplay
            :autoplay-timeout="8000"
            transition-prev="slide-right"
            transition-next="slide-left"
            control-color="primary"
            navigation
            arrows
            height="100%"
            class="bg-grey-1 shadow-1"
          >
            <!-- Featured Product Promotion -->
            <q-carousel-slide :name="1" class="column no-wrap">
              <div class="promotion-header">
                <q-icon name="star" color="amber" size="sm" class="q-mr-sm" />
                <div class="text-h6 text-weight-medium">Featured Product</div>
              </div>
              <div class="col promotion-content">
                <q-img
                  src="https://cdn.quasar.dev/img/parallax2.jpg"
                  spinner-color="primary"
                  class="full-height"
                >
                  <div class="absolute-bottom text-subtitle1 text-center promotion-gradient q-pa-md">
                    <div class="text-h5 text-weight-bold q-mb-sm">Premium Coffee Bundle</div>
                    <div class="text-subtitle1 q-mb-md">Any Coffee + Pastry</div>
                    <q-badge color="primary" class="q-pa-sm text-body2">
                      <span class="text-weight-bold">{{ formatCurrency(9.99) }}</span>
                      <span class="q-ml-xs text-caption text-weight-regular text-strike">{{ formatCurrency(14.99) }}</span>
                    </q-badge>
                  </div>
                </q-img>
              </div>
            </q-carousel-slide>

            <!-- Limited Time Offer -->
            <q-carousel-slide :name="2" class="column no-wrap">
              <div class="promotion-header">
                <q-icon name="schedule" color="deep-orange" size="sm" class="q-mr-sm" />
                <div class="text-h6 text-weight-medium">Limited Time Offer</div>
                <q-badge outline color="deep-orange" text-color="deep-orange" class="q-ml-sm">
                  Today Only
                </q-badge>
              </div>
              <div class="col promotion-content">
                <q-img
                  src="https://cdn.quasar.dev/img/mountains.jpg"
                  spinner-color="primary"
                  class="full-height"
                >
                  <div class="absolute-bottom text-subtitle1 text-center promotion-gradient q-pa-md">
                    <div class="text-h5 text-weight-bold q-mb-sm">20% Off All Desserts</div>
                    <div class="text-subtitle1 q-mb-md">Sweet treats for less</div>
                    <q-badge color="deep-orange" class="q-pa-sm text-body2">
                      <q-icon name="timer" class="q-mr-xs" />
                      <span>Valid until 6:00 PM</span>
                    </q-badge>
                  </div>
                </q-img>
              </div>
            </q-carousel-slide>

            <!-- Cross-Promotion Based on Purchase -->
            <q-carousel-slide :name="3" class="column no-wrap">
              <div class="promotion-header">
                <q-icon name="local_offer" color="teal" size="sm" class="q-mr-sm" />
                <div class="text-h6 text-weight-medium">Recommended For You</div>
              </div>
              <div class="col promotion-content">
                <q-img
                  src="https://cdn.quasar.dev/img/parallax1.jpg"
                  spinner-color="primary"
                  class="full-height"
                >
                  <div class="absolute-bottom text-subtitle1 text-center promotion-gradient q-pa-md">
                    <div class="text-h5 text-weight-bold q-mb-sm">Perfect with your coffee</div>
                    <div class="text-subtitle1 q-mb-md">Buy 2 croissants, get 1 free</div>
                    <q-badge color="teal" class="q-pa-sm text-body2">
                      <span class="text-weight-bold">{{ formatCurrency(4.50) }}</span>
                      <span class="q-ml-xs text-caption text-weight-regular text-strike">{{ formatCurrency(6.75) }}</span>
                    </q-badge>
                  </div>
                </q-img>
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'CustomerDisplay',
  data () {
    return {
      customerName: 'John Smith',
      products: [
        {
          id: 1,
          name: 'Large Americano',
          description: '100% Arabica beans',
          quantity: 2,
          price: 3.50,
          subtotal: 7.00
        },
        {
          id: 2,
          name: 'Ham & Cheese Croissant',
          quantity: 1,
          price: 4.25,
          subtotal: 4.25
        },
        {
          id: 3,
          name: 'Fresh Orange Juice',
          description: '300ml freshly squeezed',
          quantity: 1,
          price: 2.75,
          subtotal: 2.75
        },
        {
          id: 4,
          name: 'Chicken Sandwich',
          description: 'With avocado and tomato',
          quantity: 1,
          price: 5.50,
          subtotal: 5.50
        }
      ],
      subtotal: 19.50,
      tax: 1.95,
      discount: 2.00,
      total: 19.45,
      paymentMethods: [
        { method: 'Credit Card', amount: 10000000.00 },
        { method: 'Gift Card', amount: 5000000.00 },
        { method: 'Cash', amount: 400000000.45 }
      ],
      slide: 1,
      currency: 'USD',
      locale: 'en-US'
    }
  },
  methods: {
    formatCurrency (value) {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency
      }).format(value)
    },
    getPaymentIcon (method) {
      switch (method.toLowerCase()) {
        case 'credit card':
          return 'credit_card'
        case 'debit card':
          return 'credit_card'
        case 'cash':
          return 'payments'
        case 'gift card':
          return 'card_giftcard'
        case 'store credit':
          return 'store'
        case 'mobile payment':
          return 'smartphone'
        default:
          return 'payment'
      }
    },
    getPaymentColor (method) {
      switch (method.toLowerCase()) {
        case 'credit card':
          return 'primary'
        case 'debit card':
          return 'blue'
        case 'cash':
          return 'green'
        case 'gift card':
          return 'purple'
        case 'store credit':
          return 'deep-orange'
        case 'mobile payment':
          return 'teal'
        default:
          return 'grey'
      }
    }
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
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.promotion-content {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
}

/* Payment methods styling */
.payment-methods {
  display: flex;
  flex-wrap: wrap;
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
  font-size: 0.9rem;
  display: flex;
  align-items: center;
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
