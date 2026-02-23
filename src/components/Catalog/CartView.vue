<template>
  <PageContainer
    title="Mi pedido"
    @back="$emit('back-to-catalog')"
    footer-button-label="Continuar"
    :footer-button-visible="cart.items.value.length > 0"
    @footer-click="$emit('checkout')"
  >
    <!-- Empty Cart State -->
    <div v-if="cart.items.value.length === 0" class="empty-cart-view text-center q-pa-lg">
      <q-img src="images/car_empty.png" style="width: 200px; max-width: 100%; opacity: 0.8;" />
      <div class="empty-cart-text q-mt-md">Tu carrito está vacío</div>
      <div class="empty-cart-sub q-mt-xs">Agrega productos para comenzar</div>
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
    <div v-else class="cart-items-container-view">
      <div class="cart-items-list-view">
        <div
          v-for="item in cart.items.value"
          :key="item.id"
          class="cart-item-row-view"
        >
          <div class="item-header-view">
            <div class="item-info-view">
              <div class="item-name-view">{{ item.name }}</div>
              <div class="item-price-view">$ {{ formatNumber(item.price) }}</div>
            </div>
            <div class="item-actions-view">
              <div class="quantity-controls-view">
                <q-btn
                  icon="remove"
                  flat
                  round
                  size="xs"
                  class="quantity-btn-view"
                  @click="decrementQuantity(item)"
                  :disable="item.amount <= 1"
                />
                <span class="quantity-display-view">{{ item.amount }}</span>
                <q-btn
                  icon="add"
                  flat
                  round
                  size="xs"
                  class="quantity-btn-view"
                  @click="incrementQuantity(item)"
                />
              </div>
              <q-btn
                icon="delete_outline"
                flat
                round
                dense
                size="sm"
                color="negative"
                class="remove-item-btn-view"
                @click="removeItem(item)"
              />
            </div>
          </div>
          <!-- Observation Badge -->
          <div v-if="item.observation" class="item-observation-view">
            <q-icon name="chat_bubble_outline" size="12px" class="q-mr-xs" />
            {{ item.observation }}
          </div>
        </div>
      </div>

      <div class="sidebar-separator"></div>

      <!-- Summary Section -->
      <div class="sidebar-summary">
        <div class="summary-row-sidebar">
          <span class="summary-label-sidebar">Subtotal</span>
          <span class="summary-value-sidebar">$ {{ formatNumber(cart.total.value) }}</span>
        </div>

        <div class="summary-total-sidebar">
          <span class="total-label-sidebar">Total</span>
          <span class="total-value-sidebar">$ {{ formatNumber(cart.total.value) }}</span>
        </div>
      </div>
    </div>

  </PageContainer>
</template>

<script setup>
import { useCart } from 'src/composables/useCart'
import { formatNumber } from 'src/const/mixins'
import PageContainer from 'src/components/Navigation/PageContainer.vue'

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

const removeItem = (item) => {
  cart.removeFromCart(item.id)
}
</script>

<style scoped>
/* Page Layout */
.cart-items-container-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.cart-items-list-view {
  flex: 1;
}

/* Empty State */
.empty-cart-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.empty-cart-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
}

.empty-cart-sub {
  font-size: 0.95rem;
  color: #a0aec0;
}

/* Item Row */
.cart-item-row-view {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.cart-item-row-view:last-child {
  border-bottom: none;
}

.item-header-view {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.item-info-view {
  flex: 1;
  min-width: 0;
}

.item-name-view {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
}

.item-price-view {
  font-size: 0.9rem;
  color: #718096;
  margin-top: 4px;
}

/* Actions */
.item-actions-view {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-controls-view {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #edf2f7;
}

.quantity-btn-view {
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #2d3748;
}

.quantity-display-view {
  min-width: 24px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #2d3748;
}

.remove-item-btn-view {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-item-btn-view:hover {
  opacity: 1;
}

/* Observation */
.item-observation-view {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 8px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-style: italic;
}

/* Separator */
.sidebar-separator {
  height: 2px;
  margin: 20px 0;
  background-image: repeating-linear-gradient(
    90deg,
    #e2e8f0,
    #e2e8f0 8px,
    transparent 8px,
    transparent 16px
  );
}

/* Summary */
.sidebar-summary {
  margin-bottom: 20px;
}

.summary-row-sidebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.summary-label-sidebar {
  font-size: 0.9rem;
  color: #718096;
}

.summary-value-sidebar {
  font-size: 0.95rem;
  color: #2d3748;
  font-weight: 600;
}

.summary-total-sidebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
}

.total-label-sidebar {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a202c;
}

.total-value-sidebar {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--q-primary);
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .cart-items-container-view {
    padding: 16px;
  }
}
</style>
