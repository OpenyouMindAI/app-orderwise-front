<template>
  <q-dialog :model-value="show" @update:model-value="$emit('update:show', $event)">
    <q-card class="payment-modal-v2">
      <!-- Close Button -->
      <button class="pm-close" @click="closeModal">
        <q-icon name="close" size="18px" />
      </button>

      <!-- Total Header -->
      <div class="pm-header">
        <div class="pm-total-label">Total a cobrar</div>
        <div class="pm-total-amount">
          $<span>{{ formatNumber(discountAmount > 0 ? totalWithDiscount : totalAmount) }}</span>
        </div>
        <div v-if="exchangeRate" class="pm-total-exchange">
          {{ exchangeRate.coin?.symbol }} {{ formatNumber((discountAmount > 0 ? totalWithDiscount : totalAmount) * exchangeRate.amount) }}
        </div>
      </div>

      <!-- Payments Added (below total) -->
      <div class="pm-section pm-section-payments" v-if="localPayments.length > 0">
        <div
          v-for="(payment, index) in localPayments"
          :key="'pay-' + (payment.id || index)"
          class="pm-payment-entry"
        >
          <div class="pm-entry-icon" :class="getMethodColorClass(payment.acronym)">
            <q-icon :name="getPaymentIcon(payment.acronym)" size="18px" />
          </div>
          <div class="pm-entry-info">
            <div class="pm-entry-name">{{ payment.name }}</div>
            <div class="pm-entry-ref" @click="() => {}">
              {{ payment.reference || 'Sin referencia' }}
              <q-popup-edit
                v-model="payment.reference"
                auto-save
                v-slot="scope"
                @update:model-value="(val) => val !== undefined && updatePaymentReference(payment, index, val)"
              >
                <q-input v-model="scope.value" dense autofocus label="Referencia" @keyup.enter="scope.set" />
              </q-popup-edit>
            </div>
          </div>
          <div class="pm-entry-amount" @click="() => {}">
            ${{ formatNumber(payment.amount) }}
            <q-popup-edit
              v-model.number="payment.amount"
              auto-save
              v-slot="scope"
              @update:model-value="(val) => val !== undefined && updatePaymentAmount(payment, index, parseFloat(val))"
            >
              <q-input type="number" v-model.number="scope.value" dense autofocus label="Monto" @keyup.enter="scope.set" @focus="e => e.target.select()" />
            </q-popup-edit>
          </div>
          <div v-if="payment.discount_percentage" class="pm-entry-discount">
            -{{ payment.discount_percentage }}%
          </div>
          <button class="pm-entry-delete" @click="deletePayment(index)">
            <q-icon name="delete" size="16px" />
          </button>
        </div>
      </div>

      <!-- Status Bar (below payments) -->
      <div
        v-if="localPayments.length > 0"
        class="pm-status"
        :class="pendingPayment <= 0 ? 'pm-status-complete' : 'pm-status-pending'"
      >
        <div class="pm-status-label">
          {{ pendingPayment <= 0 ? '✓ Pago completo' : 'Falta pagar' }}
        </div>
        <div class="pm-status-amount" v-if="pendingPayment > 0">
          ${{ formatNumber(pendingPayment) }}
        </div>
        <div class="pm-status-amount" v-else-if="pendingPayment < 0">
          Cambio: ${{ formatNumber(Math.abs(pendingPayment)) }}
        </div>
      </div>

      <div class="pm-divider" />

      <!-- Payment Methods -->
      <div class="pm-section">
        <div class="pm-section-label">Método de pago</div>
        <div class="pm-methods-grid">
          <div
            v-for="(method, index) in paymentMethods.slice(0, 6)"
            :key="method.id"
            class="pm-method-card"
            :class="{ 'pm-method-active': localPayments.some(p => p.payment_method_id === method.id) }"
            @click="addPayment(method)"
          >
            <div v-if="index < 5 && $q.screen.gt.sm" class="pm-method-shortcut">F{{ index + 2 }}</div>
            <div class="pm-method-icon" :class="getMethodColorClass(method.acronym)">
              <q-icon :name="getPaymentIcon(method.acronym)" size="20px" />
            </div>
            <div class="pm-method-name">{{ method.name.length > 12 ? method.name.substring(0, 12) + '...' : method.name }}</div>
            <q-tooltip>{{ method.name }}</q-tooltip>
          </div>
        </div>
      </div>

      <!-- Table Close Option -->
      <div v-if="showTableClose" class="pm-table-close">
        <q-checkbox
          :model-value="tableClose"
          @update:model-value="$emit('update:table-close', $event)"
          label="Cerrar mesa al cobrar"
          color="primary"
          dense
        />
      </div>

      <!-- Footer Actions -->
      <div class="pm-footer">
        <!-- Mobile: share nativo directo -->
        <button
          v-if="$q.platform.is.mobile"
          class="pm-action pm-action-share"
          :disabled="loading"
          @click="handleActionClick({ key: 'share' })"
        >
          <q-icon name="share" size="22px" />
          <span>Compartir</span>
        </button>
        <!-- Desktop: menú con opciones -->
        <button
          v-else
          class="pm-action pm-action-share"
          :disabled="loading"
        >
          <q-icon name="share" size="22px" />
          <span>Compartir</span>
          <q-menu anchor="top middle" self="bottom middle" class="pm-share-menu">
            <q-list dense style="min-width: 180px">
              <q-item clickable v-close-popup @click="handleActionClick({ key: 'share-whatsapp' })">
                <q-item-section avatar><q-icon name="chat" color="green" /></q-item-section>
                <q-item-section>WhatsApp</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleActionClick({ key: 'share-email' })">
                <q-item-section avatar><q-icon name="email" color="red" /></q-item-section>
                <q-item-section>Email</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleActionClick({ key: 'share-download' })">
                <q-item-section avatar><q-icon name="download" color="blue" /></q-item-section>
                <q-item-section>Descargar PDF</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </button>
        <button class="pm-action pm-action-invoice" :disabled="loading" @click="handleActionClick({ key: 'invoice' })">
          <q-icon name="receipt_long" size="22px" />
          <span>Factura</span>
        </button>
        <button class="pm-action pm-action-command" :disabled="loading" @click="handleActionClick({ key: 'command' })">
          <q-icon name="list_alt" size="22px" />
          <span>Comanda</span>
        </button>
        <button class="pm-action pm-action-save" :disabled="loading" @click="handleActionClick({ key: 'save' })">
          <q-icon name="save" size="22px" />
          <span>Sin imprimir</span>
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'PaymentModal',
  emits: [
    'update:show',
    'update:table-close',
    'payment-update',
    'payment-delete',
    'qr-payment',
    'action-click'
  ],
  props: {
    show: { type: Boolean, default: false },
    visibleCloseTable: { type: Boolean, default: false },
    exchangeRate: { type: Object, default: null },
    paymentMethods: { type: Array, default: () => [] },
    payments: { type: Array, default: () => [] },
    totalAmount: { type: Number, default: 0 },
    coin: { type: Object, default: null },
    showTableClose: { type: Boolean, default: false },
    tableClose: { type: Boolean, default: false },
    actions: {
      type: Array,
      default: () => [
        { key: 'share', label: 'Compartir', icon: 'ios_share' },
        { key: 'invoice', label: 'Factura', icon: 'receipt_long' },
        { key: 'command', label: 'Comanda', icon: 'list_alt' },
        { key: 'save', label: 'Sin imprimir', icon: 'save' }
      ]
    },
    loading: { type: Boolean, default: false },
    userSession: { type: Object, default: null },
    cashBoxState: { type: Object, default: null },
    typeOfService: { type: Object, default: null },
    invoiceType: { type: Object, default: null }
  },
  setup (props, { emit }) {
    const $q = useQuasar()
    const localPayments = ref([...props.payments])

    watch(() => props.payments, (newPayments) => {
      localPayments.value = [...newPayments]
    }, { deep: true })

    const totalPayment = computed(() => {
      return localPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0)
    })

    const discountAmount = computed(() => {
      return localPayments.value.reduce((sum, p) => {
        return sum + (p.discount_percentage ? (p.amount * p.discount_percentage) / 100 : 0)
      }, 0)
    })

    const totalWithDiscount = computed(() => props.totalAmount - discountAmount.value)

    const pendingPayment = computed(() => props.totalAmount - totalPayment.value)

    const formatNumber = (value) => {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('es-CO').format(value)
    }

    const hasPendingPayment = () => pendingPayment.value > 0

    const createPayment = (data, amount) => {
      const isBilling = !!(data.is_billing || data.bill)
      return {
        name: data.name,
        acronym: data.acronym,
        amount: parseFloat(amount) || pendingPayment.value,
        reference: null,
        coin_id: props.coin?.id ?? null,
        payment_method_id: data.id,
        exchange: props.exchangeRate?.amount,
        user_created_id: props.userSession?.id ?? null,
        discount_percentage: data.percentage || 0,
        discount_amount: data.percentage ? ((parseFloat(amount) || pendingPayment.value) * data.percentage) / 100 : 0,
        is_billing: isBilling,
        checked: isBilling
      }
    }

    const promptPaymentAmount = (data, emptyInput = false) => {
      return new Promise((resolve) => {
        $q.dialog({
          title: `Pago con ${data.name}`,
          message: `Ingrese el monto a pagar con ${data.name}.`,
          persistent: true,
          prompt: {
            model: emptyInput ? '' : pendingPayment.value.toString(),
            type: 'number',
            min: 0,
            filled: true,
            'input-style': 'text-align: center'
          },
          cancel: true,
          color: 'primary'
        }).onOk(data => {
          const amount = parseFloat(data)
          resolve(!isNaN(amount) && amount > 0 ? amount : pendingPayment.value)
        }).onCancel(() => resolve(pendingPayment.value))
          .onDismiss(() => resolve(pendingPayment.value))
      })
    }

    const addPayment = async (data) => {
      if (!hasPendingPayment()) return
      if (data.acronym && data.acronym.toLowerCase() === 'efe') {
        const amount = await promptPaymentAmount(data, true)
        if (amount !== null) appendPayment(createPayment(data, amount))
      } else {
        appendPayment(createPayment(data, pendingPayment.value))
      }
    }

    const appendPayment = (payment) => {
      const existing = localPayments.value.find(p => p.payment_method_id === payment.payment_method_id && !p.invoice_payment_id)
      if (existing) {
        existing.amount += payment.amount
        existing.discount_amount += payment.discount_amount
      } else {
        localPayments.value.push(payment)
      }
      emit('payment-update', { payment, payments: localPayments.value })
    }

    const deletePayment = (index) => {
      const deleted = localPayments.value[index]
      localPayments.value.splice(index, 1)
      emit('payment-delete', { payment: deleted, index, payments: localPayments.value })
    }

    const updatePaymentAmount = (payment, index, newAmount) => {
      payment.amount = parseFloat(newAmount) || 0
      if (payment.discount_percentage) {
        payment.discount_amount = (payment.amount * payment.discount_percentage) / 100
      }
      emit('payment-update', { payment, index, payments: localPayments.value })
    }

    const updatePaymentReference = (payment, index, newRef) => {
      payment.reference = newRef
      emit('payment-update', { payment, index, payments: localPayments.value })
    }

    const paymentModel = (payments) => {
      if (pendingPayment.value < 0) {
        const cash = payments.find(p => p.acronym === 'EFE')
        if (cash) cash.amount = cash.amount - Math.abs(pendingPayment.value)
      }
      return payments.filter(p => p.amount > 0)
    }

    const setParamsBill = () => {
      const typeOfService = props.typeOfService || props.userSession?.company_session?.type_of_service
      const invoiceType = props.invoiceType || props.userSession?.company_session?.invoice_type
      const withoutPayment = ['T', 'P', 'CC']
      const withServiceType = [4]

      if (!withoutPayment.includes(invoiceType?.acronym_serie) && pendingPayment.value > 0) {
        $q.notify({ message: 'La factura no puede ser generada sin pagar el monto total', type: 'negative', icon: 'warning' })
        return false
      }
      if (withServiceType.includes(typeOfService?.code) && pendingPayment.value > 0) {
        $q.notify({ message: 'La factura no puede ser generada sin pagar el monto total', type: 'negative', icon: 'warning' })
        return false
      }
      return {
        branch_office_id: props.userSession?.branch_office_id,
        cashbox_user_id: props.cashBoxState?.id,
        payments: paymentModel(localPayments.value),
        total_amount: props.totalAmount
      }
    }

    const handleActionClick = async (action) => {
      const params = setParamsBill()
      if (!params) return
      emit('action-click', { action: action.key, params, payments: localPayments.value, tableClose: props.tableClose })
      if (props.tableClose && props.userSession) {
        localPayments.value = []
        emit('update:show', false)
      }
    }

    const closeModal = () => emit('update:show', false)

    const getPaymentIcon = (acronym) => {
      const icons = { EFE: 'payments', TAR: 'credit_card', TRA: 'account_balance', MPQA: 'qr_code_2', MPAQR: 'qr_code_2', MPTR: 'account_balance', CHE: 'receipt', CRE: 'schedule' }
      return icons[acronym] || 'payment'
    }

    const getMethodColorClass = (acronym) => {
      const colors = { EFE: 'pm-icon-cash', TAR: 'pm-icon-debit', TRA: 'pm-icon-transfer', MPTR: 'pm-icon-transfer', MPQA: 'pm-icon-qr', MPAQR: 'pm-icon-qr', CRE: 'pm-icon-credit', CHE: 'pm-icon-debit' }
      return colors[acronym] || 'pm-icon-default'
    }

    const handleKeyboardShortcut = (event) => {
      if (!props.show) return
      if (event.key >= 'F2' && event.key <= 'F6') {
        event.preventDefault()
        const idx = parseInt(event.key.substring(1)) - 2
        if (idx >= 0 && idx < props.paymentMethods.length && idx < 5) {
          addPayment(props.paymentMethods[idx])
        }
      }
    }

    onMounted(() => window.addEventListener('keydown', handleKeyboardShortcut))
    onUnmounted(() => window.removeEventListener('keydown', handleKeyboardShortcut))

    return {
      localPayments, totalPayment, discountAmount, totalWithDiscount, pendingPayment,
      formatNumber, hasPendingPayment, addPayment, deletePayment, updatePaymentAmount,
      updatePaymentReference, handleActionClick, closeModal, getPaymentIcon, getMethodColorClass
    }
  }
}
</script>

<style scoped>
/* ===== MODAL CONTAINER ===== */
.payment-modal-v2 {
  width: 440px;
  max-width: 95vw;
  border-radius: 24px !important;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  position: relative;
}

.pm-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}
.pm-close:hover { background: #e5e7eb; }

/* ===== HEADER / TOTAL ===== */
.pm-header {
  padding: 32px 24px 24px;
  text-align: center;
}
.pm-total-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 6px;
}
.pm-total-amount {
  font-size: 48px;
  font-weight: 900;
  color: #111827;
  line-height: 1;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: -1px;
  -webkit-text-stroke: 0.5px #111827;
}
.pm-total-amount span { color: #6366f1; -webkit-text-stroke: 0.5px #6366f1; }
.pm-total-exchange {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

.pm-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 0 24px;
}

/* ===== SECTIONS ===== */
.pm-section {
  padding: 16px 24px;
}
.pm-section-payments {
  padding-top: 0;
  padding-bottom: 8px;
}
.pm-section-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}

/* ===== PAYMENT METHODS GRID ===== */
.pm-methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.pm-method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 4px 8px;
  border-radius: 12px;
  border: 2px solid #f3f4f6;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 4px;
  user-select: none;
}
.pm-method-card:hover {
  border-color: #6366f1;
  background: #eef2ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99,102,241,0.15);
}
.pm-method-card.pm-method-active {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.pm-method-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pm-icon-cash { background: #dcfce7; color: #16a34a; }
.pm-icon-debit { background: #dbeafe; color: #2563eb; }
.pm-icon-credit { background: #fae8ff; color: #9333ea; }
.pm-icon-transfer { background: #fef3c7; color: #d97706; }
.pm-icon-qr { background: #e0f2fe; color: #0284c7; }
.pm-icon-default { background: #f3f4f6; color: #6b7280; }

.pm-method-name {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}
.pm-method-card {
  position: relative;
}
.pm-method-shortcut {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  background: #6366f1;
  padding: 1px 5px;
  border-radius: 5px;
  line-height: 1.4;
  box-shadow: 0 1px 3px rgba(99,102,241,0.3);
  z-index: 1;
}

/* ===== PAYMENT ENTRIES ===== */
.pm-payment-entry {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 8px;
  gap: 12px;
  transition: all 0.2s;
}
.pm-payment-entry:hover { background: #f3f4f6; }

.pm-entry-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pm-entry-info { flex: 1; min-width: 0; }
.pm-entry-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}
.pm-entry-ref {
  font-size: 11px;
  color: #9ca3af;
  cursor: pointer;
}
.pm-entry-ref:hover { color: #6366f1; }
.pm-entry-amount {
  font-size: 16px;
  font-weight: 700;
  color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}
.pm-entry-amount:hover { text-decoration: underline; }
.pm-entry-discount {
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}
.pm-entry-delete {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: #fef2f2;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.pm-entry-delete:hover { background: #fee2e2; transform: scale(1.1); }

/* ===== STATUS BAR ===== */
.pm-status {
  margin: 0 24px 16px;
  padding: 10px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pm-status-complete {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.pm-status-pending {
  background: #fffbeb;
  border: 1px solid #fde68a;
}
.pm-status-label { font-size: 13px; font-weight: 500; }
.pm-status-complete .pm-status-label { color: #16a34a; }
.pm-status-pending .pm-status-label { color: #d97706; }
.pm-status-amount { font-size: 15px; font-weight: 700; }
.pm-status-complete .pm-status-amount { color: #16a34a; }
.pm-status-pending .pm-status-amount { color: #d97706; }

/* ===== TABLE CLOSE ===== */
.pm-table-close {
  padding: 0 24px 12px;
}

/* ===== FOOTER ACTIONS ===== */
.pm-footer {
  padding: 16px 24px 24px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.pm-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 6px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  gap: 5px;
  color: white;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pm-action:hover {
  transform: translateY(-3px);
}
.pm-action:active {
  transform: translateY(0);
}
.pm-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
.pm-action span {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

/* Gradients */
.pm-action-share {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 14px rgba(102,126,234,0.35);
}
.pm-action-share:hover { box-shadow: 0 6px 20px rgba(102,126,234,0.5); }

.pm-action-invoice {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 14px rgba(245,87,108,0.35);
}
.pm-action-invoice:hover { box-shadow: 0 6px 20px rgba(245,87,108,0.5); }

.pm-action-command {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 4px 14px rgba(79,172,254,0.35);
}
.pm-action-command:hover { box-shadow: 0 6px 20px rgba(79,172,254,0.5); }

.pm-action-save {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #4b5563 !important;
  box-shadow: 0 4px 14px rgba(168,237,234,0.35);
}
.pm-action-save:hover { box-shadow: 0 6px 20px rgba(168,237,234,0.5); }
.pm-action-save span { color: #4b5563; }

/* ===== SHARE MENU ===== */
.pm-share-menu {
  border-radius: 14px !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
  overflow: hidden;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .payment-modal-v2 { border-radius: 18px !important; }
  .pm-header { padding: 24px 20px 18px; }
  .pm-total-amount { font-size: 36px; }
  .pm-section { padding: 12px 20px; }
  .pm-footer { padding: 12px 20px 20px; gap: 8px; }
  .pm-methods-grid { gap: 8px; }
  .pm-method-card { padding: 10px 6px 8px; }
  .pm-action { padding: 12px 4px; border-radius: 12px; }
}
</style>
