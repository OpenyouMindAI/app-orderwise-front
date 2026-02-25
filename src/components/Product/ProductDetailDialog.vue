<template>
  <q-dialog
    v-model="internalModel"
    no-focus-restore
    no-refocus
    :maximized="$q.screen.lt.md"
    transition-show="fade"
    transition-hide="fade"
  >
    <PageContainer
      class="product-detail-card"
      :show-back-button="true"
      @back="close"
      :overlay-header="true"
      :footer-button-label="hasStock ? `Agregar a mi pedido — $ ${formatNumber(totalPrice)}` : 'Agotado'"
      :footer-button-disable="!hasStock"
      @footer-click="addToOrder"
    >
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
        <div class="comments-section">
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

        <div v-if="!hasStock" class="out-of-stock-banner q-mt-lg flex flex-center">
          <q-icon name="error_outline" color="negative" size="xs" class="q-mr-xs" />
          <span class="text-negative text-weight-bold">Producto actualmente sin unidades disponibles</span>
        </div>
      </div>
    </PageContainer>
  </q-dialog>
</template>

<script>
import { formatNumber } from 'src/const/mixins'
import { noProductImage as defaultImage } from 'src/const/images'
import PageContainer from 'src/components/Navigation/PageContainer.vue'

export default {
  name: 'ProductDetailDialog',
  components: {
    PageContainer
  },
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
      return this.product?.images?.[0]?.url || defaultImage
    },
    totalPrice () {
      return (this.product?.price || 0) * this.quantity
    },
    hasStock () {
      if (!this.product) return false
      const stock = this.product.is_bundle ? this.product.bundle_stock : this.product.normal_stock
      return this.product.skip_stock || stock >= this.quantity
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
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

/* Override PageContainer's 100dvh only on Desktop */
@media (min-width: 1024px) {
  .product-detail-card :deep(.page-container) {
    min-height: auto !important;
  }
}

/* Fullscreen for Mobile/Tablet */
@media (max-width: 1023px) {
  .product-detail-card {
    height: 100dvh;
    max-width: 100%;
    border-radius: 0;
  }
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

.opacity-2 {
  opacity: 0.2;
}
</style>
