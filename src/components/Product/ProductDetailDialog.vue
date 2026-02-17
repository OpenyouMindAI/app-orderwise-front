<template>
  <q-dialog
    v-model="internalModel"
    no-focus-restore
    no-refocus
    :maximized="$q.screen.lt.sm"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="product-detail-card">
      <!-- Hero Image Selection -->
      <div class="hero-section relative-position">
        <q-img
          :src="heroImage"
          class="hero-image"
          height="350px"
          fit="cover"
        >
          <template v-slot:loading>
            <q-skeleton height="350px" square />
          </template>
        </q-img>
        <div class="back-button-overlay">
          <q-btn
            icon="arrow_back_ios_new"
            flat
            round
            dense
            color="dark"
            class="bg-white shadow-2"
            size="sm"
            @click="close"
          />
        </div>
      </div>

      <!-- Content Section -->
      <q-card-section class="q-pa-lg">
        <div class="row justify-between items-start no-wrap q-mb-sm">
          <div class="text-h6 text-bold text-dark product-name">{{ product?.name }}</div>
          <div class="text-h6 text-bold text-primary price-tag">
            $ {{ formatNumber(product?.price) }}
          </div>
        </div>

        <div
          v-if="product?.description"
          class="text-body2 text-grey-7 q-mb-lg description-text"
          v-html="product.description"
        />

        <!-- Quantity Selector -->
        <div class="quantity-container q-mb-xl">
          <div class="quantity-selector row no-wrap items-center">
            <q-btn
              flat
              round
              icon="remove"
              color="grey-7"
              size="md"
              @click="decrement"
              :disable="quantity <= 1"
            />
            <q-separator vertical inset class="q-mx-sm" />
            <div class="col text-center text-h6 text-weight-bold quantity-value">
              {{ quantity }}
            </div>
            <q-separator vertical inset class="q-mx-sm" />
            <q-btn
              flat
              round
              icon="add"
              color="grey-7"
              size="md"
              @click="increment"
            />
          </div>
        </div>

        <q-separator class="q-my-lg opacity-2" />

        <!-- Comments Section -->
        <div class="comments-section q-mb-xl">
          <div class="text-subtitle1 text-bold text-dark q-mb-sm">Comentarios</div>
          <q-input
            v-model="localObservation"
            placeholder="Agrega comentarios"
            filled
            bg-color="grey-2"
            borderless
            type="textarea"
            rows="3"
            class="comment-input"
          />
        </div>
      </q-card-section>

      <!-- Fixed Bottom Button -->
      <div class="action-footer q-pa-md bg-white border-top">
        <q-btn
          unelevated
          rounded
          color="primary"
          class="full-width add-to-order-btn"
          @click="addToOrder"
        >
          <div class="row full-width justify-between items-center q-px-sm">
            <span class="text-bold">Agregar a mi pedido</span>
            <span class="text-bold">$ {{ formatNumber(totalPrice) }}</span>
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { formatNumber } from 'src/const/mixins'

export default {
  name: 'ProductDetailDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'add-to-cart'],
  data () {
    return {
      quantity: 1,
      localObservation: ''
    }
  },
  computed: {
    internalModel: {
      get () {
        return this.modelValue
      },
      set (val) {
        this.$emit('update:modelValue', val)
      }
    },
    heroImage () {
      return this.product?.images?.[0]?.url || 'https://cdn.quasar.dev/img/image-src.png'
    },
    totalPrice () {
      return (this.product?.price || 0) * this.quantity
    }
  },
  watch: {
    modelValue (val) {
      if (val) {
        this.quantity = 1
        this.localObservation = ''
      }
    }
  },
  methods: {
    formatNumber,
    increment () {
      this.quantity++
    },
    decrement () {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    close () {
      this.internalModel = false
    },
    addToOrder () {
      const cartProduct = {
        ...this.product,
        amount: this.quantity,
        observation: this.localObservation,
        subtotal: this.totalPrice
      }
      this.$emit('add-to-cart', cartProduct)
      this.close()
    }
  }
}
</script>

<style scoped>
.product-detail-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  border-radius: 24px;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Override for maximized state on mobile */
.q-dialog__inner--maximized .product-detail-card {
  max-width: 100%;
  max-height: 100vh;
  border-radius: 0;
}

.hero-section {
  width: 100%;
}

.hero-image {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.back-button-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}

.back-button-overlay :deep(.q-btn) {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-button-overlay :deep(.q-btn .q-icon) {
  font-size: 16px;
  margin-right: -2px; /* Center adjustment for arrow_back_ios_new */
}

.product-name {
  line-height: 1.2;
}

.price-tag {
  color: #ff4d00 !important; /* Matches prominent orange in image */
}

.description-text {
  line-height: 1.5;
}

.quantity-container {
  display: flex;
  justify-content: center;
}

.quantity-selector {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 4px;
  width: 100%;
  max-width: 400px;
  height: 56px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.quantity-value {
  font-size: 1.2rem;
}

.comment-input :deep(.q-field__control) {
  border-radius: 12px;
}

.action-footer {
  position: sticky;
  bottom: 0;
  z-index: 100;
  border-top: 1px solid #f0f0f0;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.add-to-order-btn {
  height: 56px;
  font-size: 1.1rem;
  background-color: #ff4d00 !important; /* Premium orange */
}

.opacity-2 {
  opacity: 0.2;
}

/* Scroll adjustments */
.product-detail-card {
  display: flex;
  flex-direction: column;
}

.q-card-section {
  flex: 1;
  overflow-y: auto;
}
</style>
