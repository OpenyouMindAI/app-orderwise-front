<template>
  <q-page class="flex flex-center bg-white">
    <transition name="slide-fade" mode="out-in">
      <!-- Keypad and Payment Methods View -->
      <div
        v-if="currentView === 'keypad'"
        key="keypad"
        :class="[
          'keypad-view-container',
          $q.screen.lt.md ? 'column' : 'row no-wrap',
          'full-width'
        ]"
      >
        <!-- Numeric Keypad - 50% width on desktop -->
        <div :class="[
          'keypad-section',
          'q-pa-md',
          'flex',
          'column',
          'items-center',
          'justify-center',
          $q.screen.lt.md ? 'col-12' : 'col-6'
        ]">
          <div class="display-container">
            <div class="display-text">{{ formattedValue }}</div>
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="backspace"
              @click="backspace"
              class="backspace-btn"
            />
          </div>

          <div class="keypad q-mt-md">
            <q-btn
              v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
              :key="n"
              :label="n"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit(n.toString())"
            />
            <q-btn
              label="00"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit('00')"
            />
            <q-btn
              label="0"
              round
              unelevated
              class="keypad-btn"
              @click="inputDigit('0')"
            />
          </div>
        </div>

        <q-separator
          :vertical="!$q.screen.lt.md"
          :horizontal="$q.screen.lt.md"
          class="separator"
        />

        <!-- Payment Methods - 50% width on desktop -->
        <div :class="[
          'payment-section',
          'q-pa-lg',
          'flex',
          'column',
          'items-center',
          $q.screen.lt.md ? 'justify-evenly col-12' : 'justify-center col-6'
        ]">
          <transition name="fade" mode="out-in">
            <div v-if="inputValue.length > 0" key="methods" class="full-width">
              <div class="text-h6 q-mb-lg text-center" style="color: #333;">
                Métodos de Pago
              </div>
              <q-btn
                v-for="(method, index) in paymentMethods"
                :key="method"
                :label="method"
                unelevated
                rounded
                class="payment-btn q-mb-md"
                @click="selectPaymentMethod(index)"
              />
            </div>
            <div v-else key="prompt" class="text-center text-grey-6">
              <q-icon name="keyboard" size="3em" class="q-mb-sm" />
              <div class="text-subtitle1">Ingrese importe de la venta</div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Card Payment View -->
      <div
        v-else-if="currentView === 'card'"
        key="card"
        class="full-height flex column items-center justify-center q-pa-lg"
      >
        <q-icon name="credit_card" size="80px" color="primary" class="q-mb-md" />
        <div class="text-h5 q-mb-md">Pago con Tarjeta</div>
        <div class="text-h4 text-weight-bold q-mb-xl">{{ formattedValue }}</div>
        <div class="text-subtitle1 text-grey-7">
          Por favor, inserte o deslice la tarjeta.
        </div>
        <q-btn
          label="Volver"
          color="primary"
          @click="goBack"
          class="q-mt-xl"
        />
      </div>

      <!-- Mercado Pago QR View -->
      <div
        v-else-if="currentView === 'mercadopago'"
        key="mercadopago"
        class="full-height flex column items-center justify-center q-pa-lg"
      >
        <div class="text-h5 q-mb-md">Pagar con Mercado Pago</div>
        <div class="text-h4 text-weight-bold q-mb-md">{{ formattedValue }}</div>
        <q-img
          src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png"
          style="width: 250px; height: 250px;"
          class="q-mb-md"
        />
        <div class="text-subtitle1 text-grey-7">
          Escanea el código QR con la app de Mercado Pago.
        </div>
        <q-btn
          label="Volver"
          color="primary"
          @click="goBack"
          class="q-mt-lg"
        />
      </div>
    </transition>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const inputValue = ref('')
const currentView = ref('keypad') // 'keypad', 'card', 'mercadopago'
const paymentMethods = ['Pago con Tarjeta', 'Mercado Pago', 'Metodo 3']

const formattedValue = computed(() => {
  if (!inputValue.value) {
    return '$0.00'
  }
  const number = parseInt(inputValue.value, 10) / 100
  return `$${number.toFixed(2)}`
})

const inputDigit = (digit) => {
  if (inputValue.value.length < 9) { // Limit input length
    inputValue.value += digit
  }
}

const backspace = () => {
  if (inputValue.value.length > 0) {
    inputValue.value = inputValue.value.slice(0, -1)
  }
}

const selectPaymentMethod = (index) => {
  if (index === 0) {
    currentView.value = 'card'
  } else if (index === 1) {
    currentView.value = 'mercadopago'
  } else {
    console.log(`Payment method selected: ${paymentMethods[index]}`)
  }
}

const goBack = () => {
  currentView.value = 'keypad'
  inputValue.value = '' // Reset amount
}

const handleKeyPress = (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputDigit(e.key)
  } else if (e.key === 'Backspace') {
    backspace()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.pos-card {
  transition: all 0.3s ease;
  max-width: 800px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
}

.keypad-view-container {
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
}

.keypad-section,
.payment-section {
  min-height: 500px;
}

.full-width {
  width: 100%;
}

.display-container {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  position: relative;
  width: 100%;
  max-width: 300px;
}

.display-text {
  font-size: 2rem;
  font-weight: 500;
  color: #333;
}

.backspace-btn {
  color: #555;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 280px;
}

.keypad-btn {
  font-size: 1.5rem;
  font-weight: 400;
  background-color: #f0f0f0;
  color: #333;
  width: 75px;
  height: 75px;
}

.keypad-btn:hover {
  background-color: #e0e0e0;
}

.payment-btn {
  width: 100%;
  height: 60px;
  font-size: 1.1rem;
  text-transform: none;
  background-color: #f0f0f0;
  color: #333;
}

.payment-btn:hover {
  background-color: var(--q-primary);
  color: white;
}

.q-btn:hover {
  box-shadow: none !important;
}

.separator {
  margin: 16px 0;
}

/* Mobile adjustments */
@media (max-width: 850px) {
  .pos-card {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }

  .q-page {
    padding: 0 !important;
  }

  .keypad-view-container {
    height: 100%;
    min-height: 100vh;
  }

  .keypad-section,
  .payment-section {
    min-height: 50vh;
    margin: 1rem 0;
  }

  .separator {
    margin: 8px 0;
  }
}

/* Desktop specific styles */
@media (min-width: 851px) {
  .keypad-section,
  .payment-section {
    flex: 1;
    max-width: 50%;
  }
}

/* --- Transition Animations --- */
/* For payment methods panel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* For view switching */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
