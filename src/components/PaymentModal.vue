<template>
  <q-dialog  :model-value="show" @update:model-value="$emit('update:show', $event)">
    <q-card class="payment-modal" full-height>
      <!-- Header -->
      <q-card-section class="bg-primary text-white q-pa-xs flex items-center">
        <q-icon name="account_balance_wallet" size="22px" />
        <div class="text-h6 q-ml-sm">Procesar Pago</div>
        <q-space />
        <q-btn flat dense round icon="close" @click="closeModal" />
      </q-card-section>

      <!-- Content -->
      <q-card-section class="payment-content q-pa-xs">

        <!-- Payments Added -->
        <div v-if="localPayments.length > 0" class="q-mb-sm">
          <div v-if="$q.screen.gt.xs" class="payments-table-container">
            <q-table
              :rows="localPayments"
              :columns="paymentsColumns"
              row-key="id"
              flat
              dense
              hide-pagination
              :rows-per-page-options="[0]"
              class="payments-table"
            >
              <template v-slot:body-cell-name="props">
                <q-td :props="props">
                  <div class="row items-center q-gutter-sm">
                    <q-avatar :color="props.rowIndex === 0 ? 'primary' : 'grey-7'" text-color="white" size="32px">
                      <q-icon :name="getPaymentIcon(props.row.acronym)" size="18px" />
                    </q-avatar>
                    <div>
                      <div class="text-weight-bold">{{ props.row.name }}</div>
                      <div class="text-caption text-grey-6">
                        Ref:
                        <q-popup-edit
                          v-model="props.row.reference"
                          auto-save
                          v-slot="scope"
                          @update:model-value="(val) => val !== undefined && updatePaymentReference(props.row, props.rowIndex, val)"
                        >
                          <q-input
                            label="Referencia"
                            type="text"
                            v-model="scope.value"
                            dense
                            autofocus
                            @keyup.enter="scope.set"
                          />
                        </q-popup-edit>
                        <span class="text-primary cursor-pointer">
                          {{ props.row.reference || 'Sin ref' }}
                          <q-icon name="edit" size="10px"/>
                        </span>
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-acronym="props">
                <q-td :props="props" class="text-center">
                  <q-badge color="grey-7" class="text-weight-bold">
                    {{ props.row.acronym }}
                  </q-badge>
                </q-td>
              </template>
              <template v-slot:body-cell-amount="props">
                <q-td :props="props" class="text-right">
                  <div>
                    <q-popup-edit
                      v-model.number="props.row.amount"
                      auto-save
                      v-slot="scope"
                      @update:model-value="(val) => val !== undefined && updatePaymentAmount(props.row, props.rowIndex, parseFloat(val))"
                    >
                      <q-input
                        label="Monto"
                        type="number"
                        @focus="e => e.target.select()"
                        v-model.number="scope.value"
                        dense
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                    <div class="cursor-pointer">
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ formatNumber(props.row.amount) }}
                        <q-icon name="edit" size="sm" class="q-ml-xs"/>
                      </div>
                      <div v-if="exchangeRate" class="text-caption text-grey-6">
                        {{ exchangeRate.coin?.symbol }} {{ formatNumber(props.row.amount * exchangeRate.amount) }}
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-discount="props">
                <q-td :props="props" class="text-center">
                  <q-badge v-if="props.row.discount_percentage" color="positive" class="text-weight-bold">
                    {{ props.row.discount_percentage }}%
                  </q-badge>
                  <span v-else class="text-grey-6">-</span>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-right">
                  <q-btn
                    v-if="props.row.acronym === 'MPQA'"
                    icon="qr_code"
                    color="secondary"
                    flat
                    round
                    size="sm"
                    @click="$emit('qr-payment', props.row)"
                  >
                    <q-tooltip>Generar QR</q-tooltip>
                  </q-btn>
                  <q-checkbox
                    v-if="userSession?.company_session?.company_config?.other?.partial_billing"
                    v-model="props.row.checked"
                    color="primary"
                    size="sm"
                    class="q-mx-xs"
                  />
                  <q-btn
                    icon="delete"
                    color="negative"
                    flat
                    round
                    size="sm"
                    @click="deletePayment(props.rowIndex)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <div v-else class="payments-grid">
            <q-card
              v-for="(payment, index) in localPayments"
              :key="payment.id || index"
              dense
              flat
              class="payment-card"
            >
              <q-card-section>
                <div class="row items-center justify-between q-pa-xs">
                  <div class="row items-center q-gutter-xs">
                    <q-avatar :color="index === 0 ? 'primary' : 'grey-7'" text-color="white" size="32px">
                      <q-icon :name="getPaymentIcon(payment.acronym)" size="18px" />
                    </q-avatar>
                    <div>
                      <div class="row items-center q-gutter-xs">
                        <span class="text-body2 text-weight-bold">{{ payment.name }}</span>
                      </div>
                      <div class="text-caption text-grey-6" style="font-size: 10px;">
                        Ref:
                        <q-popup-edit
                          v-model="payment.reference"
                          auto-save
                          v-slot="scope"
                          @update:model-value="(val) => val !== undefined && updatePaymentReference(payment, index, val)"
                        >
                          <q-input
                            label="Referencia"
                            type="text"
                            v-model="scope.value"
                            dense
                            autofocus
                            @keyup.enter="scope.set"
                          />
                        </q-popup-edit>
                        <span class="text-primary cursor-pointer">
                          {{ payment.reference || 'Sin ref' }}
                          <q-icon name="edit" size="8px"/>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="row items-center q-gutter-xs column">
                    <div class="row items-end justify-between">
                      <div>
                        <q-popup-edit
                          v-model.number="payment.amount"
                          auto-save
                          v-slot="scope"
                          @update:model-value="(val) => val !== undefined && updatePaymentAmount(payment, index, parseFloat(val))"
                        >
                          <q-input
                            label="Monto"
                            type="number"
                            @focus="e => e.target.select()"
                            v-model.number="scope.value"
                            dense
                            autofocus
                            @keyup.enter="scope.set"
                          />
                        </q-popup-edit>
                        <div class="text-body1 text-weight-bold text-primary cursor-pointer">
                          {{ formatNumber(payment.amount) }}
                          <q-icon name="edit" size="8px" class="q-ml-xs"/>
                        </div>
                        <div v-if="exchangeRate" class="text-caption text-grey-5" style="font-size: 9px; margin-top: 2px;">
                          Equivalente: {{ exchangeRate.coin?.symbol }} {{ formatNumber(payment.amount * exchangeRate.amount) }}
                        </div>
                      </div>
                    </div>
                    <div class="row q-gutter-xs justify-end">
                      <q-btn
                        v-if="payment.acronym === 'MPQA'"
                        icon="qr_code"
                        color="secondary"
                        flat
                        round
                        size="xs"
                        @click="$emit('qr-payment', payment)"
                      >
                        <q-tooltip>Generar QR</q-tooltip>
                      </q-btn>
                      <q-checkbox
                        v-if="userSession?.company_session?.company_config?.other?.partial_billing"
                        v-model="payment.checked"
                        color="primary"
                        size="xs"
                      />
                      <q-btn
                        icon="delete"
                        color="negative"
                        size="sm"
                        flat
                        rounded
                        @click="deletePayment(index)"
                      >
                        <q-tooltip>Eliminar</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
                <q-badge
                  v-if="payment.discount_percentage"
                  color="positive"
                  class="discount-badge"
                >
                  {{ payment.discount_percentage }}% descuento
                </q-badge>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="column q-gutter-sm">
          <!-- Falta/Cambio -->
          <div v-if="pendingPayment !== 0" class="row items-center justify-between q-pa-sm" :class="pendingPayment > 0 ? 'bg-orange-1' : 'bg-green-1'" style="border-radius: 8px;">
            <div class="row items-center q-gutter-xs">
              <q-icon :name="pendingPayment > 0 ? 'info' : 'check_circle'" :color="pendingPayment > 0 ? 'orange' : 'green'" size="16px"/>
              <span class="text-caption text-weight-bold" :class="pendingPayment > 0 ? 'text-orange-9' : 'text-green-9'">
                {{ pendingPayment > 0 ? 'Falta:' : 'Cambio:' }}
              </span>
            </div>
            <span class="text-body2 text-weight-bold" :class="pendingPayment > 0 ? 'text-orange-9' : 'text-green-9'">
              {{ formatNumber(Math.abs(pendingPayment)) }}
            </span>
          </div>

          <!-- Total a Pagar -->
          <div class="total-compact row items-center justify-between">
            <span class="text-body1 text-grey-7">Total a Pagar</span>
            <div class="text-right">
              <div class="text-h6 text-weight-bold text-primary">
                {{ formatNumber(discountAmount > 0 ? totalWithDiscount : totalAmount) }}
              </div>
              <div v-if="exchangeRate" class="text-caption text-grey-5">
                {{ exchangeRate.coin?.symbol }} {{ formatNumber((discountAmount > 0 ? totalWithDiscount : totalAmount) * exchangeRate.amount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="q-mb-sm q-mt-md">
          <div class="payment-methods-grid">
            <q-btn
              v-for="(paymentMethod, index) in paymentMethods.slice(0, 5)"
              :key="paymentMethod.id"
              unelevated
              :color="index === 0 ? 'primary' : 'grey-7'"
              :text-color="'white'"
              @click="addPayment(paymentMethod)"
            >
              <div class="column items-center q-gutter-y-xs">
                <q-icon :name="getPaymentIcon(paymentMethod.acronym)" size="24px" />
                <span class="text-caption text-weight-medium" style="font-size: 10px;">{{ paymentMethod.name.length > 12 ? paymentMethod.name.substring(0, 12) + '...' : paymentMethod.name }}</span>
              </div>
              <q-badge
                v-if="index < 5 && $q.screen.gt.xs"
                color="negative"
                floating
                class="shortcut-badge"
              >
                F{{ index + 2 }}
              </q-badge>
            </q-btn>
          </div>
        </div>

        <!-- Table Close Toggle -->
        <div v-if="showTableClose && !visibleCloseTable" class="q-mb-sm">
          <q-checkbox
            :model-value="tableClose"
            @update:model-value="$emit('update:table-close', $event)"
            label="Cerrar mesa al finalizar"
            color="primary"
            size="md"
          />
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-separator />
      <div class="footer-actions q-pa-sm">
        <q-btn
          v-for="action in actions"
          :key="action.key"
          :color="action.color"
          unelevated
          no-caps
          :loading="loading"
          class="action-btn"
          @click="handleActionClick(action)"
        >
          <div class="column items-center">
            <q-icon :name="action.icon" size="20px" />
            <span class="text-caption text-weight-medium">{{ action.label }}</span>
          </div>
          <q-badge
            v-if="action.showBadge && $q.screen.gt.sm"
            color="white"
            text-color="negative"
            floating
            class="text-weight-bold shortcut-badge-footer"
          >
            {{ action.shortcut }}
          </q-badge>
        </q-btn>
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
    show: {
      type: Boolean,
      default: false
    },
    visibleCloseTable: {
      type: Boolean,
      default: false
    },
    exchangeRate: {
      type: Object,
      default: null
    },
    paymentMethods: {
      type: Array,
      default: () => []
    },
    payments: {
      type: Array,
      default: () => []
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    coin: {
      type: Object,
      default: null
    },
    showTableClose: {
      type: Boolean,
      default: false
    },
    tableClose: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Array,
      default: () => [
        { key: 'invoice', label: 'Factura', icon: 'print', color: 'secondary', showBadge: true, shortcut: 'F7' },
        { key: 'command', label: 'Comanda', icon: 'print', color: 'warning', showBadge: true, shortcut: 'F8' },
        { key: 'save', label: 'Sin imprimir', icon: 'save', color: 'primary', showBadge: true, shortcut: 'F9' }
      ]
    },
    loading: {
      type: Boolean,
      default: false
    },
    userSession: {
      type: Object,
      default: null
    },
    cashBoxState: {
      type: Object,
      default: null
    },
    typeOfService: {
      type: Object,
      default: null
    },
    invoiceType: {
      type: Object,
      default: null
    }
  },
  setup (props, { emit }) {
    const $q = useQuasar()

    // Local reactive data
    const localPayments = ref([...props.payments])

    // Watch for external payment changes
    watch(() => props.payments, (newPayments) => {
      localPayments.value = [...newPayments]
    }, { deep: true })

    // Computed properties
    const totalPayment = computed(() => {
      let total = 0
      localPayments.value.forEach((payment) => {
        total += payment.amount || 0
      })
      return total
    })

    const totalPaymentWithDiscount = computed(() => {
      let total = 0
      localPayments.value.forEach((payment) => {
        total += (payment.amount - (payment.discount_amount || 0)) || 0
      })
      return total
    })

    const discountAmount = computed(() => {
      let totalDiscount = 0
      localPayments.value.forEach((payment) => {
        if (payment.discount_percentage && payment.discount_percentage > 0) {
          const discountAmount = (payment.amount * payment.discount_percentage) / 100
          totalDiscount += discountAmount
        }
      })
      return totalDiscount
    })

    const totalWithDiscount = computed(() => {
      return props.totalAmount - discountAmount.value
    })

    const pendingPayment = computed(() => {
      return props.totalAmount - totalPayment.value
    })

    const selectedPaymentMethods = computed(() => {
      return localPayments.value.map(payment => ({
        name: payment.name,
        amount: payment.amount,
        exchange: payment.exchange,
        discount_percentage: payment.discount_percentage || 0,
        discountAmount: payment.discount_percentage ? (payment.amount * payment.discount_percentage) / 100 : 0
      }))
    })

    // Table columns for payments
    const paymentsColumns = [
      {
        name: 'name',
        label: 'Método de Pago',
        field: 'name',
        align: 'left',
        headerStyle: 'font-weight: 600;'
      },
      {
        name: 'discount',
        label: 'Descuento',
        field: 'discount_percentage',
        align: 'center',
        headerStyle: 'font-weight: 600;'
      },
      {
        name: 'amount',
        label: 'Monto',
        field: 'amount',
        align: 'right',
        headerStyle: 'font-weight: 600;'
      },
      {
        name: 'actions',
        label: 'Acciones',
        field: 'actions',
        align: 'right',
        headerStyle: 'font-weight: 600;'
      }
    ]

    // Methods
    const formatNumber = (value) => {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('es-CO').format(value)
    }

    const hasPendingPayment = () => {
      return pendingPayment.value && pendingPayment.value > 0
    }

    const createPayment = (data, amount) => {
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
        discount_amount: data.percentage
          ? ((parseFloat(amount) || pendingPayment.value) * data.percentage) / 100
          : 0
      }
    }

    const promptPaymentAmount = (data, emptyInput = false) => {
      return new Promise((resolve) => {
        const discountText = data.discount_percentage > 0
          ? ` (${data.discount_percentage}% de descuento)`
          : ''

        $q.dialog({
          title: `Pago con ${data.name}${discountText}`,
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
          if (!isNaN(amount) && amount > 0) {
            resolve(amount)
          } else {
            resolve(pendingPayment.value)
          }
        }).onCancel(() => resolve(pendingPayment.value))
          .onDismiss(() => resolve(pendingPayment.value))
      })
    }

    const addPayment = async (data) => {
      if (!hasPendingPayment()) return

      if ((data.acronym && data.acronym.toLowerCase() === 'efe')) {
        const amount = await promptPaymentAmount(data, true)
        if (amount !== null) {
          const payment = createPayment(data, amount)
          appendPayment(payment)
        }
      } else {
        const amount = pendingPayment.value
        const payment = createPayment(data, amount)
        appendPayment(payment)
      }
    }

    const appendPayment = (payment) => {
      const paymentFund = localPayments.value.find(
        p => p.payment_method_id === payment.payment_method_id &&
        !p.invoice_payment_id
      )
      if (paymentFund) {
        paymentFund.amount = paymentFund.amount + payment.amount
        paymentFund.discount_amount = paymentFund.discount_amount + payment.discount_amount
      } else {
        localPayments.value.push(payment)
      }

      emit('payment-update', { payment, payments: localPayments.value })
    }

    const deletePayment = (index) => {
      const deletedPayment = localPayments.value[index]
      localPayments.value.splice(index, 1)
      emit('payment-delete', { payment: deletedPayment, index, payments: localPayments.value })
    }

    const updatePaymentAmount = (payment, index, newAmount) => {
      payment.amount = parseFloat(newAmount) || 0
      // Recalculate discount amount if percentage exists
      if (payment.discount_percentage) {
        payment.discount_amount = (payment.amount * payment.discount_percentage) / 100
      }
      emit('payment-update', { payment, index, payments: localPayments.value })
    }

    const updatePaymentReference = (payment, index, newReference) => {
      payment.reference = newReference
      emit('payment-update', { payment, index, payments: localPayments.value })
    }

    const paymentModel = (payments) => {
      if (pendingPayment.value < 0) {
        const cash = payments.find(payment => payment.acronym === 'EFE')
        if (cash) {
          cash.amount = cash.amount - Math.abs(pendingPayment.value)
        }
      }
      return payments.filter(payment => payment.amount > 0)
    }

    const setModelInvoice = () => {
      return {
        branch_office_id: props.userSession?.branch_office_id,
        cashbox_user_id: props.cashBoxState?.id,
        payments: paymentModel(localPayments.value),
        total_amount: props.totalAmount
      }
    }

    const setParamsBill = () => {
      // Obtener datos de validación
      const typeOfService = props.typeOfService || props.userSession?.company_session?.type_of_service
      const invoiceType = props.invoiceType || props.userSession?.company_session?.invoice_type
      const withoutPayment = ['T', 'P', 'CC'] // Tipos que NO requieren pagos
      const withServiceType = [4] // mostrador

      // 2. Validación general: Si NO está en withoutPayment Y hay pago pendiente → requiere pago
      if (!withoutPayment.includes(invoiceType?.acronym_serie) && pendingPayment.value > 0) {
        $q.notify({
          message: 'La factura no puede ser generada sin pagar el monto total',
          type: 'negative',
          icon: 'warning'
        })
        return false
      }

      // 3. Validación mostrador: Si es mostrador Y hay pago pendiente → requiere pago
      if (withServiceType.includes(typeOfService?.code) && pendingPayment.value > 0) {
        $q.notify({
          message: 'La factura no puede ser generada sin pagar el monto total',
          type: 'negative',
          icon: 'warning'
        })
        return false
      }

      return setModelInvoice()
    }

    const handleActionClick = async (action) => {
      const params = setParamsBill()
      if (!params) return

      // Emit action to parent for processing
      emit('action-click', {
        action: action.key,
        params,
        payments: localPayments.value,
        tableClose: props.tableClose
      })

      // If table should be closed, handle it internally
      if (props.tableClose && props.userSession) {
        await handleTableClose(params)
      }
    }

    const handleTableClose = async (params) => {
      try {
        // Clear local payments after successful table close
        localPayments.value = []

        // Close the modal
        emit('update:show', false)

        // NOTE: Removed window.location.reload() because TableControlPage
        // handles the table update internally via refreshTables() method.
        // The reload was causing the page to refresh before print operations completed.
      } catch (error) {
        console.error('Error handling table close:', error)
      }
    }

    const closeModal = () => {
      emit('update:show', false)
    }


    const getPaymentIcon = (acronym) => {
      const icons = {
        EFE: 'payments',
        TAR: 'credit_card',
        TRA: 'account_balance',
        MPQA: 'qr_code_2',
        CHE: 'receipt',
        CRE: 'schedule'
      }
      return icons[acronym] || 'payment'
    }

    // Keyboard shortcuts handler
    const handleKeyboardShortcut = (event) => {
      // Only handle when modal is open
      if (!props.show) return

      // Handle F2-F6 for payment methods
      if (event.key >= 'F2' && event.key <= 'F6') {
        event.preventDefault()

        const keyNumber = parseInt(event.key.substring(1)) // Extract number from F2, F3, etc.
        const methodIndex = keyNumber - 2 // F2 = index 0, F3 = index 1, etc.

        if (methodIndex >= 0 && methodIndex < props.paymentMethods.length && methodIndex < 5) {
          const paymentMethod = props.paymentMethods[methodIndex]
          addPayment(paymentMethod)

          // Show visual feedback
          $q.notify({
            message: `Método de pago: ${paymentMethod.name}`,
            type: 'positive',
            timeout: 1000,
            position: 'top'
          })
        }
      }
    }

    // Setup keyboard event listeners
    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyboardShortcut)
      }
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyboardShortcut)
      }
    })

    return {
      localPayments,
      totalPayment,
      totalPaymentWithDiscount,
      discountAmount,
      totalWithDiscount,
      pendingPayment,
      selectedPaymentMethods,
      paymentsColumns,
      formatNumber,
      hasPendingPayment,
      addPayment,
      appendPayment,
      deletePayment,
      updatePaymentAmount,
      updatePaymentReference,
      handleActionClick,
      closeModal,
      setModelInvoice,
      setParamsBill,
      paymentModel,
      handleKeyboardShortcut,
      getPaymentIcon
    }
  }
}
</script>

<style scoped>
/* Modal Principal con diseño futurista adaptado a theme */
.payment-modal {
  display: flex;
  flex-direction: column;
  font-family: inherit;
  width: 750px;
  max-width: 90vw;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.payment-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 56px - 80px);
  padding: 6px;
  background: var(--q-color-page);
}

/* Grid de métodos de pago con diseño moderno */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 3fr));
  gap: 6px;
}

@media (max-width: 599px) {
  .payment-methods-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
}

@media (max-width: 400px) {
  .payment-methods-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
}

.shortcut-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  background: var(--q-color-negative);
  color: var(--q-color-on-negative);
  border-radius: 4px;
  padding: 1px 4px;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(var(--q-negative-rgb), 0.3);
}

/* Payments Table (Desktop) con diseño moderno */
.payments-table-container {
  border-radius: 16px;
  overflow: hidden;
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-outline);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.payments-table {
  background: transparent;
}

.payments-table :deep(.q-table__top),
.payments-table :deep(.q-table__bottom) {
  display: none;
}

.payments-table :deep(thead tr) {
  background: var(--q-color-surface-variant);
}

.payments-table :deep(thead th) {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 16px 12px;
  font-weight: 700;
  color: var(--q-color-on-surface);
  border-bottom: 2px solid var(--q-color-primary);
}

.payments-table :deep(tbody td) {
  padding: 12px;
  border-bottom: 1px solid var(--q-color-outline);
  background: var(--q-color-surface);
}

.payments-table :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.payments-table :deep(tbody tr:hover) {
  background: var(--q-color-surface-variant);
  transform: scale(1.01);
  transition: all 0.2s ease;
}

/* Payments Grid (Mobile) con cards futuristas */
.payments-grid {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

@media (max-width: 599px) {
  .payments-grid {
    grid-template-columns: 1fr;
  }
}

.payment-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.payment-card :deep(.q-card__section) {
  padding: 0 !important;
}

.payment-card:hover {
  transform: translateY(-2px) scale(1.01);
  border-color: var(--q-color-primary);
}

.payment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.discount-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 9px;
  font-weight: 700;
  background: var(--q-color-positive);
  color: var(--q-color-on-positive);
  border-radius: 6px;
  padding: 2px 6px;
  box-shadow: 0 2px 4px rgba(var(--q-positive-rgb), 0.3);
}

/* Total Compact con diseño destacado */
.total-compact {
  background: var(--q-color-surface-variant);
  border: 2px solid var(--q-color-primary);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Footer Actions con diseño futurista */
.footer-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: var(--q-color-surface);
  border-top: 1px solid var(--q-color-outline);
}

@media (max-width: 599px) {
  .footer-actions {
    gap: 8px;
    padding: 12px;
  }
}

.action-btn {
  border-radius: 16px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--q-color-surface);
  border: 2px solid var(--q-color-outline);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: var(--q-color-primary);
  background: var(--q-color-surface-variant);
}

.action-btn:active {
  transform: translateY(-1px) scale(1.01);
  transition: all 0.1s ease;
}

.action-btn.text-negative {
  background: var(--q-color-surface-variant);
  border-color: var(--q-color-negative);
  color: var(--q-color-on-surface);
}

.action-btn.text-negative:hover {
  background: var(--q-color-error-container);
  border-color: var(--q-color-error);
  color: var(--q-color-on-error-container);
}

.shortcut-badge-footer {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 10px;
  font-weight: 700;
  background: var(--q-color-primary);
  color: var(--q-color-on-primary);
  border-radius: 6px;
  padding: 2px 6px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(var(--q-primary-rgb), 0.3);
}

@media (max-width: 599px) {
  .action-btn {
    min-height: 52px;
    padding: 10px 6px;
    font-size: 12px;
  }
}

/* Utilities con micro-interacciones */
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.cursor-pointer:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.cursor-pointer:active {
  transform: scale(0.98);
  transition: all 0.1s ease;
}

/* Responsive */
@media (max-width: 599px) {
  .scroll-area {
    max-height: calc(100vh - 56px - 80px);
  }

  .total-card .text-h3 {
    font-size: 2rem;
  }

  .alert-banner .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
