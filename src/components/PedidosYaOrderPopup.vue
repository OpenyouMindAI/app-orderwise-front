<template>
  <q-dialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    persistent
    no-esc-dismiss
    no-backdrop-dismiss
  >
    <q-card class="peya-popup">
      <!-- Header -->
      <div class="peya-header">
        <div class="peya-header-left">
          <span class="peya-logo">🛵</span>
          <div>
            <div class="peya-title">Nuevo Pedido PedidosYa</div>
            <div class="peya-code">#{{ order?.external_code || order?.external_id }}</div>
          </div>
        </div>
        <div class="peya-timer" :class="{ 'peya-timer-urgent': timerSeconds < 60 }">
          {{ formatTimer }}
        </div>
      </div>

      <!-- Customer Info -->
      <div class="peya-section">
        <div class="peya-section-label">CLIENTE</div>
        <div class="peya-customer">
          <div class="peya-customer-row">
            <q-icon name="person" size="16px" color="grey-7" />
            <span>{{ order?.customer_name || 'Cliente' }}</span>
          </div>
          <div v-if="order?.customer_phone" class="peya-customer-row">
            <q-icon name="phone" size="16px" color="grey-7" />
            <span>{{ order.customer_phone }}</span>
          </div>
          <div v-if="order?.customer_address" class="peya-customer-row">
            <q-icon name="location_on" size="16px" color="grey-7" />
            <span>{{ order.customer_address }}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="peya-section">
        <div class="peya-section-label">PRODUCTOS</div>
        <div class="peya-items">
          <div
            v-for="(item, idx) in order?.items || []"
            :key="idx"
            class="peya-item"
          >
            <div class="peya-item-qty">{{ item.quantity }}x</div>
            <div class="peya-item-name">{{ item.name }}</div>
            <div class="peya-item-price">${{ formatNumber(item.total || (item.quantity * item.unit_price)) }}</div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="order?.notes" class="peya-section">
        <div class="peya-section-label">NOTAS</div>
        <div class="peya-notes">{{ order.notes }}</div>
      </div>

      <!-- Payment & Total -->
      <div class="peya-total-section">
        <div class="peya-payment">
          <q-icon :name="order?.payment_method === 'cash' ? 'payments' : 'credit_card'" size="18px" />
          <span>{{ order?.payment_method === 'cash' ? 'Efectivo' : 'Pago online' }}</span>
        </div>
        <div class="peya-total">
          <span class="peya-total-label">TOTAL</span>
          <span class="peya-total-amount">${{ formatNumber(order?.total || 0) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="peya-actions">
        <button class="peya-btn peya-btn-reject" :disabled="loading" @click="$emit('reject', order)">
          <q-icon name="close" size="24px" />
          <span>Rechazar</span>
        </button>
        <button class="peya-btn peya-btn-accept" :disabled="loading" @click="$emit('accept', order)">
          <q-icon name="check" size="28px" />
          <span>Aceptar pedido</span>
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'PedidosYaOrderPopup',
  props: {
    show: { type: Boolean, default: false },
    order: { type: Object, default: null },
    loading: { type: Boolean, default: false }
  },
  emits: ['update:show', 'accept', 'reject'],
  data () {
    return {
      timerSeconds: 300, // 5 min
      timerInterval: null,
      audio: null
    }
  },
  computed: {
    formatTimer () {
      const min = Math.floor(this.timerSeconds / 60)
      const sec = this.timerSeconds % 60
      return `${min}:${sec.toString().padStart(2, '0')}`
    }
  },
  watch: {
    show (val) {
      if (val) {
        this.startTimer()
        this.playAlert()
      } else {
        this.stopTimer()
        this.stopAlert()
      }
    }
  },
  methods: {
    formatNumber (value) {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('es-AR').format(value)
    },
    startTimer () {
      this.timerSeconds = 300
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) this.timerSeconds--
      }, 1000)
    },
    stopTimer () {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },
    playAlert () {
      try {
        // Create oscillating alert sound
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const playBeep = () => {
          if (!this.show) return
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          gain.gain.value = 0.3
          osc.start()
          osc.stop(ctx.currentTime + 0.15)
          setTimeout(() => {
            if (!this.show) return
            const osc2 = ctx.createOscillator()
            const gain2 = ctx.createGain()
            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.frequency.value = 1100
            gain2.gain.value = 0.3
            osc2.start()
            osc2.stop(ctx.currentTime + 0.15)
          }, 200)
        }
        playBeep()
        this.audio = setInterval(playBeep, 3000) // Repeat every 3 sec
      } catch (e) {
        console.warn('Audio alert failed:', e)
      }
    },
    stopAlert () {
      if (this.audio) {
        clearInterval(this.audio)
        this.audio = null
      }
    }
  },
  beforeUnmount () {
    this.stopTimer()
    this.stopAlert()
  }
}
</script>

<style scoped>
.peya-popup {
  width: 420px;
  max-width: 95vw;
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.4);
  animation: peya-slide-in 0.3s ease-out;
}

@keyframes peya-slide-in {
  from { transform: translateY(-30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* Header */
.peya-header {
  background: linear-gradient(135deg, #FF0050 0%, #FF4D4D 100%);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}
.peya-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.peya-logo {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
.peya-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.peya-code {
  font-size: 20px;
  font-weight: 800;
}
.peya-timer {
  background: rgba(255,255,255,0.2);
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.peya-timer-urgent {
  background: #fff;
  color: #FF0050;
  animation: peya-pulse 0.5s infinite alternate;
}
@keyframes peya-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.05); }
}

/* Sections */
.peya-section {
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.peya-section-label {
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

/* Customer */
.peya-customer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

/* Items */
.peya-items {
  max-height: 200px;
  overflow-y: auto;
}
.peya-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f9fafb;
  gap: 10px;
}
.peya-item:last-child { border: none; }
.peya-item-qty {
  background: #f3f4f6;
  color: #374151;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 6px;
  min-width: 32px;
  text-align: center;
}
.peya-item-name {
  flex: 1;
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}
.peya-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

/* Notes */
.peya-notes {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  background: #fffbeb;
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
}

/* Total */
.peya-total-section {
  padding: 16px 20px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.peya-payment {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}
.peya-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.peya-total-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
}
.peya-total-amount {
  font-size: 28px;
  font-weight: 900;
  color: #111827;
  -webkit-text-stroke: 0.3px #111827;
}

/* Actions */
.peya-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  padding: 16px 20px 20px;
}
.peya-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  gap: 4px;
  font-family: inherit;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s;
}
.peya-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.peya-btn-reject {
  background: #fef2f2;
  color: #ef4444;
  border: 2px solid #fecaca;
}
.peya-btn-reject:hover:not(:disabled) {
  background: #fee2e2;
  transform: translateY(-2px);
}

.peya-btn-accept {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(34,197,94,0.35);
}
.peya-btn-accept:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(34,197,94,0.5);
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .peya-popup { border-radius: 16px !important; }
  .peya-header { padding: 14px 16px; }
  .peya-section { padding: 12px 16px; }
  .peya-actions { padding: 12px 16px 16px; }
  .peya-total-amount { font-size: 24px; }
}
</style>
