<template>
  <q-dialog
    v-model="internalModel"
    no-focus-restore
    no-refocus
    :maximized="$q.screen.lt.sm"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="product-detail-card" flat>
      <!-- Scrollable Content -->
      <div class="product-content-scroll">
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
            class="back-btn bg-white shadow-2"
            size="sm"
            @click="close"
          />
        </div>
      </div>

      <!-- Content Section -->
      <div class="q-pa-lg">
        <div class="row justify-between items-center no-wrap q-mb-sm">
          <div class="text-h6 text-bold text-dark product-name">{{ product?.name }}</div>
          <div class="text-h6 text-bold product-price">
            $ {{ formatNumber(product?.price) }}
          </div>
        </div>

        <div
          v-if="product?.description"
          class="text-body2 text-grey-7 q-mb-lg description-text"
          v-html="product.description"
        />

        <!-- Quantity Selector -->
        <div class="quantity-container q-mb-lg">
          <div class="quantity-selector row no-wrap items-center">
            <q-btn
              flat
              round
              icon="remove"
              class="quantity-btn"
              size="sm"
              @click="decrement"
              :disable="quantity <= 1"
            />
            <div class="col text-center text-h6 text-weight-bold quantity-value">
              {{ quantity }}
            </div>
            <q-btn
              flat
              round
              icon="add"
              class="quantity-btn"
              size="sm"
              @click="increment"
            />
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section q-mb-xl">
          <div class="text-subtitle1 text-bold text-dark q-mb-sm">Comentarios</div>
          <q-input
            v-model="localObservation"
            placeholder="Agrega comentarios"
            filled
            bg-color="grey-1"
            borderless
            type="textarea"
            rows="3"
            class="comment-input"
          />
        </div>
      </div>
      </div>

      <!-- Fixed Bottom Button -->
      <div class="action-footer">
        <q-btn
          unelevated
          rounded
          no-caps
          color="dark"
          text-color="white"
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
  height: 100dvh;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Override for maximized state on mobile */
.q-dialog__inner--maximized .product-detail-card {
  max-width: 100%;
  height: 100dvh;
  border-radius: 0;
}

.product-content-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--background);
}

.hero-section {
  width: 100%;
}

.hero-image {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.back-button-overlay {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 10;
}

.back-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: -2px;
}

.product-name {
  line-height: 1.2;
  font-size: 20px;
  color: var(--text);
  margin: 0 !important;
}

.product-price {
  font-size: 20px;
  color: var(--text);
}

.description-text {
  line-height: 1.5;
  color: var(--text-light);
  font-size: 14px;
}

.quantity-container {
  display: flex;
  justify-content: center;
}

.quantity-selector {
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  padding: 4px 8px;
  width: 100%;
  max-width: 300px;
  height: 56px;
  background: var(--surface);
  gap: 12px;
}

.quantity-btn {
  color: var(--text);
}

.quantity-value {
  font-size: 18px;
  color: var(--text);
}

.comment-input :deep(.q-field__control) {
  border-radius: var(--border-radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
}

.comment-input :deep(.q-field__native) {
  color: var(--text);
}

.action-footer {
  background: var(--surface);
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  z-index: 10;
}

.add-to-order-btn {
  height: 56px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 12px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.add-to-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.add-to-order-btn:active {
  transform: translateY(0);
}

.opacity-2 {
  opacity: 0.2;
}
</style>
