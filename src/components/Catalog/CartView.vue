<template>
  <div class="cart-view">
    <!-- Header -->
    <div class="cart-header q-pa-md bg-white">
      <div class="text-h5 text-bold">Tu Pedido</div>
      <div class="text-subtitle2 text-grey-7">
        {{ cart.itemCount }} {{ cart.itemCount === 1 ? 'producto' : 'productos' }}
      </div>
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
        class="q-mt-lg"
        @click="$emit('back-to-catalog')"
      />
    </div>

    <!-- Cart Items -->
    <div v-else class="cart-items-container">
      <div class="cart-items q-pa-md">
        <q-card
          v-for="item in cart.items.value"
          :key="item.id"
          class="cart-item-card q-mb-md"
          flat
          bordered
        >
          <q-card-section horizontal>
            <q-img
              :src="item.images[0]?.url || defaultImage"
              class="cart-item-image"
            />

            <q-card-section class="col column q-pa-md">
              <!-- Product Name & Delete -->
              <div class="row justify-between items-start q-mb-xs">
                <div class="text-body2 text-bold product-name">
                  {{ item.name }}
                </div>
                <q-btn
                  icon="delete"
                  round
                  flat
                  size="sm"
                  color="negative"
                  @click="removeItem(item)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>

              <!-- Price -->
              <div class="text-subtitle2 text-grey-7 q-mb-sm">
                $ {{ formatNumber(item.price) }} c/u
              </div>

              <!-- Observation -->
              <div class="observation-section q-mb-sm">
                <div v-if="item.observation" class="observation-text">
                  <q-icon name="comment" size="18px" color="grey-7" class="q-mr-xs" />
                  <span class="text-caption text-grey-8">{{ item.observation }}</span>
                </div>
                <q-btn
                  flat
                  dense
                  size="sm"
                  :icon="item.observation ? 'edit' : 'add_comment'"
                  :label="item.observation ? 'Editar' : 'Agregar observación'"
                  color="primary"
                  class="observation-btn"
                  @click="openObservationDialog(item)"
                />
              </div>

              <!-- Quantity Controls -->
              <div class="quantity-section row items-center justify-between">
                <div class="quantity-controls row items-center no-wrap">
                  <q-btn
                    icon="remove"
                    round
                    flat
                    size="sm"
                    color="grey-7"
                    @click="decrementQuantity(item)"
                    :disable="item.amount <= 1"
                  />

                  <q-input
                    v-model.number="item.amount"
                    type="number"
                    dense
                    outlined
                    class="quantity-input q-mx-sm"
                    @update:model-value="updateItemQuantity(item, $event)"
                    :min="1"
                  />

                  <q-btn
                    icon="add"
                    round
                    flat
                    size="sm"
                    color="grey-7"
                    @click="incrementQuantity(item)"
                  />
                </div>

                <!-- Subtotal -->
                <div class="text-h6 text-bold text-primary">
                  $ {{ formatNumber(item.subtotal) }}
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>

      <!-- Summary Footer -->
      <div class="cart-footer">
        <!-- Total Summary -->
        <q-card class="total-card q-mx-md q-mb-md" flat bordered>
          <q-card-section>
            <div class="row justify-between items-center">
              <span class="text-h6">Total</span>
              <span class="text-h5 text-bold text-primary">
                $ {{ formatNumber(cart.total.value) }}
              </span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Checkout Button -->
        <div class="q-pa-md">
          <q-btn
            color="primary"
            label="Proceder al Pago"
            icon-right="arrow_forward"
            rounded
            unelevated
            size="lg"
            class="full-width checkout-btn"
            @click="$emit('checkout')"
          />
        </div>
      </div>
    </div>

    <!-- Observation Dialog -->
    <q-dialog v-model="showObservationDialog">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="text-h6 bg-primary text-white">
          Observación
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="currentObservation"
            filled
            autofocus
            type="textarea"
            rows="3"
            placeholder="Agrega comentarios sobre este producto..."
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveObservation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCart } from 'src/composables/useCart'
import { formatNumber } from 'src/const/mixins'
import { Notify } from 'quasar'

// Emits
const emit = defineEmits(['checkout', 'back-to-catalog'])

// Composables
const cart = useCart()

// Estado local
const showObservationDialog = ref(false)
const currentItem = ref(null)
const currentObservation = ref('')

// Constantes
const defaultImage = 'https://cdn.quasar.dev/img/image-src.png'

// Métodos
const incrementQuantity = (item) => {
  const success = cart.updateQuantity(item.id, item.amount + 1)
  if (!success) {
    // El composable ya muestra la notificación de error
    item.amount = item.amount // Forzar re-render
  }
}

const decrementQuantity = (item) => {
  if (item.amount > 1) {
    cart.updateQuantity(item.id, item.amount - 1)
  }
}

const updateItemQuantity = (item, newQuantity) => {
  if (!newQuantity || newQuantity < 1) {
    item.amount = 1
    cart.updateQuantity(item.id, 1)
    return
  }

  const success = cart.updateQuantity(item.id, newQuantity)
  if (!success) {
    // Revertir al valor anterior si falla
    item.amount = cart.getCartItem(item.id)?.amount || 1
  }
}

const removeItem = (item) => {
  Notify.create({
    message: `¿Eliminar ${item.name} del carrito?`,
    color: 'negative',
    position: 'top',
    actions: [
      {
        label: 'Cancelar',
        color: 'white',
        handler: () => {}
      },
      {
        label: 'Eliminar',
        color: 'white',
        handler: () => {
          cart.removeFromCart(item.id)
          Notify.create({
            message: 'Producto eliminado',
            color: 'positive',
            icon: 'check_circle',
            position: 'top'
          })
        }
      }
    ]
  })
}

const openObservationDialog = (item) => {
  currentItem.value = item
  currentObservation.value = item.observation || ''
  showObservationDialog.value = true
}

const saveObservation = () => {
  if (currentItem.value) {
    cart.updateObservation(currentItem.value.id, currentObservation.value)
    Notify.create({
      message: 'Observación guardada',
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
  }
  showObservationDialog.value = false
}
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
}

.cart-header {
  border-bottom: 1px solid #e0e0e0;
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

/* Cart Items */
.cart-items-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}

.cart-item-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  background: white;
}

.cart-item-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cart-item-image {
  width: 100px;
  height: 100px;
  min-width: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.product-name {
  flex: 1;
  line-height: 1.3;
  max-width: 200px;
}

/* Observation Section */
.observation-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.observation-text {
  display: flex;
  align-items: flex-start;
  padding: 4px 0;
}

.observation-btn {
  align-self: flex-start;
  margin-left: -8px;
}

/* Quantity Controls */
.quantity-section {
  margin-top: auto;
}

.quantity-controls {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 2px;
}

.quantity-input {
  width: 60px;
}

.quantity-input :deep(.q-field__control) {
  height: 32px;
  min-height: 32px;
}

.quantity-input :deep(.q-field__native) {
  text-align: center;
  font-weight: bold;
}

/* Footer */
.cart-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.total-card {
  background: #f9f9f9;
  border-radius: 12px;
}

.checkout-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: #ff4d00 !important;
  box-shadow: 0 4px 12px rgba(255, 77, 0, 0.3);
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  box-shadow: 0 6px 16px rgba(255, 77, 0, 0.4);
  transform: translateY(-2px);
}

.checkout-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 599px) {
  .cart-item-image {
    width: 80px;
    height: 80px;
    min-width: 80px;
  }

  .product-name {
    font-size: 0.9rem;
    max-width: 150px;
  }

  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
