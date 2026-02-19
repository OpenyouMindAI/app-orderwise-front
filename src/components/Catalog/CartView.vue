<template>
  <div class="cart-view">
    <!-- Header with Back Button -->
    <div class="cart-header">
      <q-btn
        icon="arrow_back_ios_new"
        flat
        round
        dense
        color="dark"
        class="back-btn bg-white shadow-2"
        size="sm"
        @click="$emit('back-to-catalog')"
      />
      <div class="header-title">Mi pedido</div>
    </div>

    <!-- Empty State -->
    <div v-if="cart.items.value.length === 0" class="empty-cart">
      <q-img src="images/car_empty.png" style="width: 300px; max-width: 80vw;" />
      <span class="text-subtitle2 text-center q-mt-md">
        No hay productos en la orden
      </span>
      <q-btn
        color="primary"
        label="Ver Catálogo"
        rounded
        unelevated
        class="q-mt-lg continuar-btn"
        @click="$emit('back-to-catalog')"
      />
    </div>

    <!-- Cart Items -->
    <template v-else>
      <div class="cart-content">
        <!-- Items List -->
        <div class="cart-items">
          <div
            v-for="item in cart.items.value"
            :key="item.id"
            class="cart-item"
          >
            <!-- Product Name and Quantity Controls -->
            <div class="item-header">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price">$ {{ formatNumber(item.subtotal) }}</div>
              </div>
              <div class="quantity-controls-cart">
                <q-btn
                  icon="remove"
                  flat
                  round
                  size="sm"
                  class="quantity-btn-cart"
                  @click="decrementQuantity(item)"
                  :disable="item.amount <= 1"
                />
                <span class="quantity-display-cart">{{ item.amount }}</span>
                <q-btn
                  icon="add"
                  flat
                  round
                  size="sm"
                  class="quantity-btn-cart"
                  @click="incrementQuantity(item)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="separator"></div>

        <!-- Summary Section -->
        <div class="cart-summary">
          <div class="summary-title">Resumen</div>

          <div class="summary-row">
            <span class="summary-label">Subtotal</span>
            <span class="summary-value">$ {{ formatNumber(cart.total.value) }}</span>
          </div>

          <div class="summary-total">
            <span class="total-label">Total</span>
            <span class="total-value">$ {{ formatNumber(cart.total.value) }}</span>
          </div>
        </div>
      </div>

      <!-- Continue Button - Moved outside for better sticky behavior and to avoid horizontal scroll -->
      <div class="cart-footer">
        <q-btn
          label="Continuar"
          unelevated
          no-caps
          class="continuar-btn full-width"
          @click="$emit('checkout')"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { useCart } from 'src/composables/useCart'
import { formatNumber } from 'src/const/mixins'

// Emits
defineEmits(['checkout', 'back-to-catalog'])

// Composables
const cart = useCart()

// Métodos de cantidad
const incrementQuantity = (item) => {
  cart.updateQuantity(item.id, item.amount + 1)
}

const decrementQuantity = (item) => {
  if (item.amount > 1) {
    cart.updateQuantity(item.id, item.amount - 1)
  }
}

</script>

<style scoped>
.cart-view {
  min-height: 100dvh;
  background: var(--background);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
}

/* Header */
.cart-header {
  gap: 1rem;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: relative;
}

.back-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
}

.back-btn :deep(.q-icon) {
  font-size: 16px;
  margin-right: -2px; /* Center adjustment for arrow_back_ios_new */
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

/* Empty State */
.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 60vh;
}

/* Cart Content */
.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Cart Items */
.cart-items {
  flex: 1;
}

.cart-item {
  padding: 20px 0;
}

.cart-item:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

/* Item Header */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* Critical for preventing flex items from pushing parent width */
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price {
  font-size: 16px;
  font-weight: 400;
  color: var(--text);
}

/* Quantity Controls */
.quantity-controls-cart {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  background: var(--surface);
}

.quantity-btn-cart {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  background: var(--surface);
  color: var(--text);
}

.quantity-btn-cart:hover {
  background: var(--background);
}

.quantity-display-cart {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
}

/* Item Observation */
.item-observation {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text-light);
  margin-top: 8px;
  padding: 8px;
  background: var(--background);
  border-radius: var(--border-radius-sm);
}

/* Separator */
.separator {
  height: 2px;
  margin: 24px 0;
  background-image: repeating-linear-gradient(
    90deg,
    var(--border),
    var(--border) 8px,
    transparent 8px,
    transparent 16px
  );
}

/* Summary */
.cart-summary {
  margin-bottom: 24px;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-label {
  font-size: 16px;
  color: var(--text-light);
}

.summary-value {
  font-size: 16px;
  color: var(--text);
  font-weight: 500;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

/* Footer */
.cart-footer {
  background: var(--surface);
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  position: relative;
  z-index: 10;
}

.continuar-btn {
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

.continuar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.continuar-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 599px) {
  .cart-content {
    padding: 16px;
  }

  .item-name {
    font-size: 16px;
  }

  .item-price {
    font-size: 14px;
  }

  .quantity-controls-cart {
    padding: 0.25rem;
  }

  .quantity-btn-cart {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }

  .quantity-display-cart {
    min-width: 28px;
    font-size: 14px;
  }
}
</style>
