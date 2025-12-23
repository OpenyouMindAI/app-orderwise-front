<template>
  <q-dialog :model-value="show" @update:model-value="$emit('update:show', $event)">
    <q-card style="width: 900px; max-width: 95vw;">
      <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
        <span class="text-h6">Desglose de pago</span>
        <q-btn flat icon="close" round size="md" @click="closeModal"/>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <!-- Payment Methods Buttons -->
        <div class="col-xs-12 col-sm-4 col-md-4 col-lg-3 q-gutter-xs">
          <q-btn
            color="secondary"
            size="17px"
            style="width: 100%"
            :label="paymentMethod.name"
            v-for="(paymentMethod, index) in paymentMethods.slice(0, 5)"
            :key="paymentMethod.id"
            @click="addPayment(paymentMethod)"
            class="payment-method-btn"
          >
            <q-badge
              v-if="index < 5 && $q.screen.gt.sm && !$q.platform.is.nativeMobile"
              color="negative"
              align="bottom"
              floating
            >
              F{{ index + 2 }}
            </q-badge>
          </q-btn>
        </div>

        <!-- Payment Details -->
        <div class="col-xs-12 col-sm-8 col-md-8 col-lg-9">
          <!-- Table Close Toggle -->
          <q-toggle
            v-if="showTableClose && !visibleCloseTable"
            :model-value="tableClose"
            @update:model-value="$emit('update:table-close', $event)"
            label="Cerrar mesa"
            class="q-mb-md"
          />

          <!-- Payments Table - Desktop -->
          <q-markup-table class="q-mb-md" v-if="$q.screen.gt.xs">
            <thead>
              <tr>
                <th class="text-left" v-if="userSession?.company_session?.company_config?.other?.partial_billing">✅</th>
                <th class="text-left">Método de pago</th>
                <th class="text-left">Referencia</th>
                <th class="text-right">Monto</th>
                <th class="text-right" v-if="exchangeRate">Cambio</th>
                <th class="text-right">% Descuento</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(payment, index) in localPayments" :key="payment.id || index">
                <td class="text-left" v-if="userSession?.company_session?.company_config?.other?.partial_billing">
                  <q-checkbox v-model="payment.checked" />
                </td>
                <td class="text-left">{{ payment.name }}</td>
                <td class="text-left">
                  <span v-if="payment.reference">{{ payment.reference }}</span>
                  <span v-else>-</span>
                  <q-popup-edit
                    :model-value="payment.reference"
                    @update:model-value="updatePaymentReference(payment, index, $event)"
                    auto-save
                    v-slot="scope"
                  >
                    <q-input
                      v-model="scope.value"
                      autofocus
                      @keyup.enter="scope.set"
                    />
                  </q-popup-edit>
                </td>
                <td class="text-right">
                  {{ formatNumber(payment.amount) }}
                  <q-popup-edit
                    :model-value="payment.amount"
                    @update:model-value="updatePaymentAmount(payment, index, $event)"
                    auto-save
                    v-slot="scope"
                  >
                    <q-input
                      v-model.number="scope.value"
                      autofocus
                      @keyup.enter="scope.set"
                    />
                  </q-popup-edit>
                </td>
                <td class="text-right" v-if="exchangeRate">
                  {{ exchangeRate.coin?.symbol }} {{ formatNumber(payment.amount * exchangeRate.amount) }}
                </td>
                <td class="text-right">{{ payment.discount_percentage || 0 }}%</td>
                <td class="text-center q-gutter-x-xs">
                  <q-btn
                    icon="delete"
                    color="negative"
                    rounded
                    dense
                    @click="deletePayment(index)"
                  />
                  <q-btn
                    v-if="payment.acronym === 'MPQA'"
                    rounded
                    dense
                    icon="qr_code"
                    color="secondary"
                    @click="$emit('qr-payment', payment)"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <!-- Payments Cards - Mobile -->
          <div v-else class="payment-cards-mobile q-mb-md">
            <div
              v-for="(payment, index) in localPayments"
              :key="payment.id || index"
              class="payment-card-item"
            >
              <div class="payment-card-header">
                <div class="payment-card-title">
                  <q-checkbox
                    v-if="userSession?.company_session?.company_config?.other?.partial_billing"
                    v-model="payment.checked"
                    dense
                    class="q-mr-xs"
                  />
                  <span class="payment-method-name">{{ payment.name }}</span>
                </div>
                <div class="payment-card-actions">
                  <q-btn
                    v-if="payment.acronym === 'MPQA'"
                    icon="qr_code"
                    color="secondary"
                    flat
                    dense
                    round
                    size="sm"
                    @click="$emit('qr-payment', payment)"
                  />
                  <q-btn
                    icon="delete"
                    color="negative"
                    flat
                    dense
                    round
                    size="sm"
                    @click="deletePayment(index)"
                  />
                </div>
              </div>
              <div class="payment-card-body">
                <div class="payment-card-row">
                  <span class="payment-label">Monto:</span>
                  <span class="payment-value payment-amount">
                    {{ formatNumber(payment.amount) }}
                    <q-popup-edit
                      :model-value="payment.amount"
                      @update:model-value="updatePaymentAmount(payment, index, $event)"
                      auto-save
                      v-slot="scope"
                    >
                      <q-input
                        v-model.number="scope.value"
                        autofocus
                        dense
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </span>
                </div>
                <div class="payment-card-row" v-if="exchangeRate">
                  <span class="payment-label">T. Cambio:</span>
                  <span class="payment-value">{{ exchangeRate.coin?.symbol }} {{ formatNumber(payment.amount * exchangeRate.amount) }}</span>
                </div>
                <div class="payment-card-row">
                  <span class="payment-label">Ref:</span>
                  <span class="payment-value">
                    {{ payment.reference || '-' }}
                    <q-popup-edit
                      :model-value="payment.reference"
                      @update:model-value="updatePaymentReference(payment, index, $event)"
                      auto-save
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        autofocus
                        dense
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </span>
                </div>
                <div class="payment-card-row" v-if="payment.discount_percentage">
                  <span class="payment-label">Desc:</span>
                  <span class="payment-value">{{ payment.discount_percentage }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Summary -->
          <q-item style="border: none !important">
            <q-item-section v-if="pendingPayment >= 0">
              RESTANTE POR COBRAR
            </q-item-section>
            <q-item-section v-else>
              VUELTO
            </q-item-section>
            <q-item-section side v-if="coin" class="text-bold">
              <div style="display: flex; align-items: center; gap: 10px">
                <span>
                  {{ coin.symbol }}
                </span>
                <span>
                  {{ formatNumber(Math.abs(pendingPayment)) }}
                </span>
                <span v-if="exchangeRate">
                  |
                </span>
                <span v-if="exchangeRate">
                  {{ exchangeRate.coin?.symbol }} {{ formatNumber(Math.abs(pendingPayment * exchangeRate.amount)) }}
                </span>
              </div>
            </q-item-section>
          </q-item>

          <q-list separator bordered style="border-radius: 10px;" dense>
            <!-- Subtotal -->
            <q-item class="bg-positive text-white text-h6" style="border-radius: 10px 10px 0px 0px; border-top: none !important">
              <q-item-section>
                TOTAL
              </q-item-section>
              <q-item-section side v-if="coin" class="text-white text-bold">
                <div style="display: flex; align-items: center; gap: 7px">
                  <span>
                    {{ coin.symbol }}
                  </span>
                  <span>
                    {{ formatNumber(totalAmount) }}
                  </span>
                  <span v-if="exchangeRate">
                    |
                  </span>
                  <span v-if="exchangeRate">
                    {{ exchangeRate?.coin?.symbol }} {{ formatNumber(totalAmount * exchangeRate.amount) }}
                  </span>
                </div>
              </q-item-section>
            </q-item>

            <!-- Selected Payment Methods -->
            <q-item
              v-for="paymentMethod in selectedPaymentMethods"
              :key="paymentMethod.name"
              v-show="selectedPaymentMethods.length > 0"
            >
              <q-item-section>
                {{ paymentMethod.name }}
                <span v-if="paymentMethod.discount_percentage > 0" class="text-caption text-positive">
                  ({{ paymentMethod.discount_percentage }}% descuento)
                </span>
              </q-item-section>
              <q-item-section side v-if="coin">
                <div style="display: flex; align-items: center; gap: 7px" class="text-bold">
                  <span>
                    {{ coin.symbol }}
                  </span>
                  <span>
                    {{ formatNumber(paymentMethod.amount) }}
                  </span>
                  <span v-if="exchangeRate">
                    |
                  </span>
                  <span v-if="exchangeRate">
                    {{ exchangeRate?.coin?.symbol }} {{ formatNumber(paymentMethod.amount * exchangeRate.amount) }}
                  </span>
                </div>
                <span v-if="paymentMethod.discountAmount > 0" class="text-positive">
                  (-{{ coin.symbol }} {{ formatNumber(paymentMethod.discountAmount) }})
                </span>
              </q-item-section>
            </q-item>

            <!-- Total Discount -->
            <q-item v-if="discountAmount > 0" class="text-subtitle1">
              <q-item-section>
                DESCUENTO TOTAL
              </q-item-section>
              <q-item-section side v-if="coin">
                <div style="display: flex; align-items: center; gap: 7px" class="text-bold">
                  <span>
                    {{ coin.symbol }}
                  </span>
                  <span>
                    {{ formatNumber(discountAmount) }}
                  </span>
                </div>
              </q-item-section>
            </q-item>

            <!-- Final Total with Discount -->
            <q-item
              v-if="discountAmount > 0"
              class="bg-positive text-white text-h6 text-bold"
              style="border-radius: 0px 0px 10px 10px; border-top: none !important"
            >
              <q-item-section>
                <q-item-label>TOTAL</q-item-label>
              </q-item-section>
              <q-item-section side v-if="coin" class="text-white">
                {{ coin.symbol }} {{ formatNumber(totalWithDiscount) }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-gutter-y-sm">
        <q-btn
          v-for="action in actions"
          :key="action.key"
          :label="action.label"
          :icon="action.icon"
          :color="action.color"
          :class="$q.screen.lt.sm ? 'full-width' : ''"
          :loading="loading"
          @click="handleActionClick(action)"
        >
          <q-badge
            v-if="action.showBadge && $q.screen.gt.sm && !$q.platform.is.nativeMobile"
            color="negative"
            align="bottom"
            floating
          >
            {{ action.shortcut }}
          </q-badge>
        </q-btn>
      </q-card-actions>
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
        { key: 'save', label: 'Guardar sin imprimir', icon: 'save', color: 'primary', showBadge: true, shortcut: 'F9' }
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
      const paymentFund = localPayments.value.find(p => p.payment_method_id === payment.payment_method_id)
      if (paymentFund) {
        paymentFund.amount = payment.amount
        paymentFund.discount_amount = payment.discount_amount
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
      handleKeyboardShortcut
    }
  }
}
</script>

<style scoped>
.q-markup-table {
  border-radius: 8px;
  overflow: hidden;
}

.q-markup-table thead th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.q-list {
  border: 1px solid #e0e0e0;
}

.q-item {
  min-height: 40px;
}

.text-bold {
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.payment-method-btn {
  position: relative;
}

.payment-method-btn .q-badge {
  font-size: 10px;
  font-weight: 600;
  min-width: 20px;
  height: 16px;
  line-height: 16px;
}

/* Mobile Payment Cards */
.payment-cards-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-card-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
}

.payment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-card-title {
  display: flex;
  align-items: center;
}

.payment-method-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.payment-card-actions {
  display: flex;
  gap: 4px;
}

.payment-card-body {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}

.payment-card-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.payment-label {
  font-size: 11px;
  color: #888;
}

.payment-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.payment-amount {
  font-weight: 700;
  color: #21BA45;
  font-size: 14px;
}
</style>
