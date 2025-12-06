<template>
  <q-dialog :model-value="show" :maximized="$q.screen.lt.sm" @update:model-value="$emit('update:show', $event)">
    <q-card class="partial-payment-card" :style="$q.screen.lt.sm ? '' : 'width: 800px; max-width: 90vw; height: 100%; max-height: 85vh;'">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          Cobro Parcial
          <span class="text-h6 text-weight-bold text-primary q-ml-sm">
            Total: {{ currencySymbol }}{{ formatNumber(remainingDebt) }}
          </span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Split Bill Tabs (se oculta en finish) -->
      <div class="tabs-container" :class="{ 'tabs-hidden': activeTab === 'finish' }">
        <q-tabs
          v-model="activeTab"
          class="invoice-tabs"
          indicator-color="primary"
          active-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="amount" label="Por Monto" icon="payments" :disable="isAmountTabDisabled" />
          <q-tab name="item" label="Por Item" icon="receipt" :disable="isItemTabDisabled" />
          <q-tab name="person" label="Por Persona" icon="people" :disable="isPersonTabDisabled" />
        </q-tabs>
      </div>

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" class="invoice-body" animated>
        <!-- Por Monto Tab -->
        <q-tab-panel name="amount">
          <div class="split-content q-pa-md">
            <div class="text-h6 q-mb-md">
              <q-icon name="payments" />
              Dividir por Monto
            </div>
            <p class="text-body2 text-grey-7">
              Ingrese los montos a cobrar para cada persona o grupo.
            </p>
            <!-- Aquí irá la lógica para dividir por monto -->
            <div class="q-mt-md">
              <q-input
                v-model.number="splitAmount"
                type="number"
                label="Monto a dividir"
                outlined
                dense
                :prefix="currencySymbol"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Por Item Tab -->
        <q-tab-panel name="item">
          <div class="split-content q-pa-md">
            <div class="text-h6 q-mb-md">
              <q-icon name="receipt" />
              Dividir por Item
            </div>
            <p class="text-body2 text-grey-7">
              Seleccione los items para cada persona o grupo.
            </p>
            <!-- Aquí irá la lógica para dividir por item -->
            <div class="products-list q-mt-md">
              <div
                v-for="product in sortedProducts"
                :key="product.uniqueKey"
                class="product-item-split q-pa-sm q-mb-sm"
                :class="{ 'bg-grey-2': isItemPaid(product.uniqueKey) }"
              >
                <q-checkbox
                  v-model="selectedProducts"
                  :val="product.uniqueKey"
                  :label="product.name"
                  :disable="isItemPaid(product.uniqueKey)"
                />
                <span class="text-caption text-grey-7">
                  {{ currencySymbol }}{{ formatNumber(product.displayPrice) }}
                  <q-icon v-if="isItemPaid(product.uniqueKey)" name="check_circle" color="positive" class="q-ml-sm" />
                </span>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- Por Persona Tab -->
        <q-tab-panel name="person">
          <div class="split-content q-pa-md">
            <div class="text-h6 q-mb-md">
              <q-icon name="people" />
              Dividir por Persona
            </div>
            <p class="text-body2 text-grey-7">
              Divida la cuenta equitativamente entre el número de personas.
            </p>
            <!-- Aquí irá la lógica para dividir por persona -->
            <div class="q-mt-md">
              <q-input
                v-model.number="numberOfPeople"
                type="number"
                label="Número de personas"
                outlined
                dense
                min="1"
              />
              <div v-if="numberOfPeople > 0" class="q-mt-md">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2">Monto por persona:</div>
                    <div class="text-h6 text-primary">
                      {{ currencySymbol }}{{ formatNumber(remainingDebt / numberOfPeople) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <!-- Group Payment Tab -->
        <!-- Confirmar procedimiento de pago -->
        <q-tab-panel name="confirm">
          <div class="split-content q-pa-md">

            <q-card flat bordered class="q-pa-md bg-grey-1 q-mb-md">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-7">Tipo de División</div>
                  <div class="text-body1 text-weight-medium">
                    {{ paymentSummary.typeLabel }}
                  </div>
                </div>

                <div class="col-6 text-right">
                  <div class="text-subtitle2 text-grey-7">Lo que se está cancelando</div>
                  <div class="text-h5 text-positive text-weight-bold">
                    {{ currencySymbol }}{{ formatNumber(paymentSummary.amountToPay) }}
                  </div>
                </div>
              </div>
            </q-card>

            <!-- Payment Methods Cards -->
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">
                <q-icon name="credit_card" class="q-mr-sm" />
                Métodos de Pago
              </div>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="col-6 col-sm-4 col-md-3"
                >
                  <q-card
                    flat
                    bordered
                    class="payment-method-card q-pa-sm cursor-pointer"
                    :class="{ 'disabled-card': pendingPayment <= 0 }"
                    @click="pendingPayment > 0 ? addPayment(method) : null"
                  >
                    <div class="row items-center q-gutter-sm">
                      <q-icon
                        :name="getPaymentMethodIcon(method.name)"
                        size="sm"
                        color="primary"
                      />
                      <div class="text-body2">{{ method.name }}</div>
                    </div>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- Payment Summary -->
            <q-card flat bordered class="q-pa-md bg-grey-1 q-mb-md">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-subtitle2 text-grey-7">Monto a pagar</div>
                  <div class="text-h6">
                    {{ currencySymbol }}{{ formatNumber(paymentSummary.amountToPay) }}
                  </div>
                </div>

                <div class="col-6 text-right">
                  <div class="text-subtitle2 text-grey-7">Total pagado</div>
                  <div class="text-h5 text-positive text-weight-bold">
                    {{ currencySymbol }}{{ formatNumber(totalPaymentAmount) }}
                  </div>
                </div>

                <div class="col-12" v-if="partialPayments.length > 0">
                  <q-separator />
                </div>

                <!-- Lista de Métodos de Pago Agregados -->
                <div class="col-12" v-if="partialPayments.length > 0">
                  <div class="text-subtitle2 text-grey-7 q-mb-sm">Métodos de pago seleccionados</div>
                  <q-list separator bordered dense style="border-radius: 8px;">
                    <q-item
                      v-for="(payment, index) in partialPayments"
                      :key="index"
                      class="q-py-sm"
                    >
                      <q-item-section>
                        <div class="text-weight-medium">{{ payment.name }}</div>
                      </q-item-section>
                      <q-item-section side>
                        <div class="row items-center q-gutter-xs">
                          <div class="text-weight-medium">
                            {{ currencySymbol }}{{ formatNumber(payment.amount) }}
                          </div>
                          <q-btn
                            icon="edit"
                            color="primary"
                            flat
                            round
                            dense
                            size="sm"
                          >
                            <q-popup-edit
                              :model-value="payment.amount"
                              @update:model-value="updatePaymentAmount(payment, index, $event)"
                              auto-save
                              v-slot="scope"
                            >
                              <q-input
                                v-model.number="scope.value"
                                autofocus
                                type="number"
                                @keyup.enter="scope.set"
                              />
                            </q-popup-edit>
                            <q-tooltip>Editar monto</q-tooltip>
                          </q-btn>
                          <q-btn
                            icon="delete"
                            color="negative"
                            flat
                            round
                            dense
                            size="sm"
                            @click="deletePayment(index)"
                          >
                            <q-tooltip>Eliminar</q-tooltip>
                          </q-btn>
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12" v-if="partialPayments.length > 0">
                  <q-separator />
                </div>

                <div class="col-12 text-right">
                  <div class="text-subtitle2 text-grey-7">Pendiente</div>
                  <div class="text-h6 text-warning">
                    {{ currencySymbol }}{{ formatNumber(pendingPayment) }}
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Mensaje de Finalización - Solo se muestra cuando remainingDebt === 0 -->
        <q-tab-panel name="finish">
          <div class="split-content q-pa-lg text-center">
            <!-- Success Icon -->
            <div class="q-mb-lg">
              <q-icon name="check_circle" color="positive" size="5rem" />
            </div>

            <!-- Success Message -->
            <div class="text-h5 text-weight-bold text-positive q-mb-sm">
              ¡Pago Completado!
            </div>
            <p class="text-body2 text-grey-6 q-mb-lg">
              El monto total ha sido cancelado exitosamente.
            </p>

            <!-- Total Pagado Card -->
            <q-card flat class="bg-positive text-white q-mb-md" style="border-radius: 12px;">
              <q-card-section class="q-py-md">
                <div class="text-caption text-white-7">TOTAL PAGADO</div>
                <div class="text-h4 text-weight-bold">
                  {{ currencySymbol }} {{ formatNumber(totalAmount) }}
                </div>
              </q-card-section>
            </q-card>

            <!-- Resumen de Pagos -->
            <div v-if="consolidatedPayments.length > 0" class="q-mb-md">
              <div class="text-subtitle2 text-grey-7 q-mb-sm text-left">Desglose de pagos</div>
              <q-card flat bordered style="border-radius: 8px;">
                <q-list dense>
                  <q-item v-for="(payment, index) in consolidatedPayments" :key="index" class="q-ma-xs">
                    <q-item-section avatar>
                      <q-icon :name="getPaymentMethodIcon(payment.name)" color="grey-7" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ payment.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-weight-medium text-dark">
                        {{ currencySymbol }} {{ formatNumber(payment.amount) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>

            <!-- Checkbox Cerrar Mesa -->
            <q-checkbox
              v-if="showTableClose"
              v-model="closeTableOnFinish"
              label="Cerrar mesa al finalizar"
              color="primary"
              class="q-mt-sm"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="invoice-actions">
        <q-btn
          label="Volver"
          flat
          @click="handleCancel"
          class="cancel-btn"
          v-if="activeTab !== 'finish'"
        />
        <q-space />

        <!-- Botones normales (antes de finish) -->
        <q-btn
          v-if="activeTab !== 'finish'"
          :label="buttonLabel"
          color="positive"
          @click="handleNextAction"
          :loading="loading"
          :disable="!isStepValid"
        />

        <!-- Botones de finalización (solo en finish) -->
        <div v-if="activeTab === 'finish'" class="finish-buttons">
          <q-btn
            label="Imprimir Factura"
            icon="print"
            color="primary"
            @click="handlePrintInvoice"
            :loading="loading"
            class="q-ml-sm finish-btn"
          />
          <q-btn
            label="Guardar sin imprimir"
            icon="save"
            color="secondary"
            @click="handleSaveWithoutPrint"
            :loading="loading"
            class="finish-btn"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { authentication } from 'src/stores/module-authentication'

// Constantes para estados de tabs
const TAB_STATES = {
  AMOUNT: 'amount',
  ITEM: 'item',
  PERSON: 'person',
  CONFIRM: 'confirm',
  FINISH: 'finish'
}

// Constantes para etiquetas de tipo de pago
const PAYMENT_TYPE_LABELS = {
  [TAB_STATES.AMOUNT]: 'Por Monto Fijo',
  [TAB_STATES.ITEM]: 'Por Items',
  [TAB_STATES.PERSON]: 'Por Persona'
}

export default {
  name: 'PartialPaymentModal',
  emits: ['update:show', 'confirm', 'cancel'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    products: {
      type: Array,
      default: () => []
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    paymentMethods: {
      type: Array,
      default: () => []
    },
    coin: {
      type: Object,
      default: null
    },
    exchangeRate: {
      type: Object,
      default: null
    },
    userSession: {
      type: Object,
      default: null
    },
    cashBoxState: {
      type: Object,
      default: null
    },
    showTableClose: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const $q = useQuasar()
    const authStore = authentication()
    const { userSession } = storeToRefs(authStore)

    // ==================== Estado Local ====================
    const activeTab = ref(TAB_STATES.AMOUNT)
    const splitAmount = ref(0)
    const numberOfPeople = ref(1)
    const selectedProducts = ref([])
    const selectedSplitType = ref(null)
    const remainingDebt = ref(props.totalAmount)
    const paidItemKeys = ref(new Set())
    const previousTab = ref(null)
    const firstSplitType = ref(null) // Trackea el primer tipo de división usado
    const closeTableOnFinish = ref(false) // Toggle para cerrar mesa al finalizar

    // Variables para pago por persona
    const amountPerPerson = ref(0)
    const peoplePaymentCount = ref(0)

    // Variables para gestión de pagos
    const partialPayments = ref([]) // Pagos de la transacción actual
    const allPayments = ref([]) // Todos los pagos acumulados de todas las transacciones

    // ==================== Funciones Puras ====================
    const formatNumber = (value) => {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('es-CO').format(value)
    }

    const calculateItemsTotal = (expandedList, selectedKeys) => {
      return expandedList
        .filter(p => selectedKeys.includes(p.uniqueKey))
        .reduce((sum, p) => sum + p.displayPrice, 0)
    }

    // TODO:
    const calculatePersonAmount = (debt, people, savedAmount) => {
      const amount = savedAmount > 0 ? savedAmount : debt / (people || 1)
      return Math.round(amount * 100) / 100
    }

    // Consolidar pagos por método de pago (sumar montos del mismo método)
    const consolidatePayments = (payments) => {
      const consolidated = {}

      payments.forEach(payment => {
        const key = payment.payment_method_id
        if (consolidated[key]) {
          // Si ya existe, sumar amount y discount_amount
          consolidated[key].amount += payment.amount
          consolidated[key].discount_amount = (consolidated[key].discount_amount || 0) + (payment.discount_amount || 0)
        } else {
          // Si no existe, crear nuevo
          consolidated[key] = { ...payment }
        }
      })

      // Convertir objeto a array
      return Object.values(consolidated)
    }

    const resetState = () => {
      activeTab.value = TAB_STATES.AMOUNT
      splitAmount.value = 0
      numberOfPeople.value = 1
      selectedProducts.value = []
      selectedSplitType.value = null
      remainingDebt.value = props.totalAmount
      paidItemKeys.value.clear()
      amountPerPerson.value = 0
      peoplePaymentCount.value = 0
      previousTab.value = null
      firstSplitType.value = null
      partialPayments.value = []
      allPayments.value = []
      closeTableOnFinish.value = false
    }

    // ==================== Watchers ====================
    watch(() => props.show, (newVal) => {
      if (newVal) resetState()
    })

    watch(() => props.totalAmount, (newVal) => {
      remainingDebt.value = newVal
    })

    // ==================== Computed Properties ====================
    const currentPaymentType = computed(() => selectedSplitType.value || activeTab.value)

    // Obtener el objeto coin completo desde userSession (similar a BillingPage.vue)
    const coin = computed(() => {
      return userSession.value?.company_session?.company_config?.coin || null
    })

    const currencySymbol = computed(() => {
      return coin.value?.symbol || null
    })

    // Computed properties para deshabilitar tabs incompatibles
    const isAmountTabDisabled = computed(() => {
      // Deshabilitar si está en confirm
      if (activeTab.value === TAB_STATES.CONFIRM) return true
      // Nunca se deshabilita - siempre se puede usar "Por Monto"
      return false
    })

    const isItemTabDisabled = computed(() => {
      // Deshabilitar si está en confirm
      if (activeTab.value === TAB_STATES.CONFIRM) return true
      // Solo se deshabilita si se usó "Por Monto" o "Por Persona" primero
      return firstSplitType.value === TAB_STATES.AMOUNT || firstSplitType.value === TAB_STATES.PERSON
    })

    const isPersonTabDisabled = computed(() => {
      // Deshabilitar si está en confirm
      if (activeTab.value === TAB_STATES.CONFIRM) return true
      // Nunca se deshabilita - siempre se puede usar "Por Persona"
      return false
    })

    // Pagos consolidados (sumados por método de pago)
    const consolidatedPayments = computed(() => {
      return consolidatePayments(allPayments.value)
    })

    const isStepValid = computed(() => {
      const validations = {
        [TAB_STATES.AMOUNT]: () => splitAmount.value > 0 && splitAmount.value <= remainingDebt.value,
        [TAB_STATES.ITEM]: () => selectedProducts.value.length > 0,
        [TAB_STATES.PERSON]: () => numberOfPeople.value > 0,
        [TAB_STATES.CONFIRM]: () => pendingPayment.value === 0,
        [TAB_STATES.FINISH]: () => true
      }
      return validations[activeTab.value]?.() || false
    })

    const paymentSummary = computed(() => {
      const type = currentPaymentType.value
      let amountToPay = 0
      let typeLabel = ''

      switch (type) {
        case TAB_STATES.AMOUNT: {
          amountToPay = splitAmount.value
          typeLabel = PAYMENT_TYPE_LABELS[TAB_STATES.AMOUNT]
          break
        }

        case TAB_STATES.ITEM: {
          amountToPay = calculateItemsTotal(expandedProducts.value, selectedProducts.value)
          typeLabel = `${PAYMENT_TYPE_LABELS[TAB_STATES.ITEM]} (${selectedProducts.value.length} seleccionados)`
          break
        }

        case TAB_STATES.PERSON: {
          const currentPayment = peoplePaymentCount.value + 1
          const isLastPerson = currentPayment === numberOfPeople.value

          // Si es la última persona, pagar exactamente lo que queda para evitar diferencias de redondeo
          if (isLastPerson) {
            amountToPay = remainingDebt.value
          } else {
            amountToPay = calculatePersonAmount(remainingDebt.value, numberOfPeople.value, amountPerPerson.value)
          }

          typeLabel = `${PAYMENT_TYPE_LABELS[TAB_STATES.PERSON]} (${currentPayment} de ${numberOfPeople.value})`
          break
        }
      }

      return {
        amountToPay,
        remainingAmount: remainingDebt.value - amountToPay,
        typeLabel
      }
    })

    const isItemPaid = (key) => paidItemKeys.value.has(key)

    const expandedProducts = computed(() => {
      const list = []
      props.products.forEach(p => {
        const qty = Math.floor(parseFloat(p.pivot?.amount || 1))
        const unitPrice = parseFloat(p.pivot?.price || p.price || 0)

        for (let i = 0; i < qty; i++) {
          list.push({
            ...p,
            uniqueKey: `${p.id}_${i}`,
            displayPrice: unitPrice,
            originalId: p.id
          })
        }
      })
      return list
    })

    const sortedProducts = computed(() => {
      return [...expandedProducts.value].sort((a, b) => {
        const aPaid = isItemPaid(a.uniqueKey)
        const bPaid = isItemPaid(b.uniqueKey)
        return aPaid === bPaid ? 0 : (aPaid ? 1 : -1)
      })
    })

    const buttonLabel = computed(() => {
      const labels = {
        [TAB_STATES.AMOUNT]: 'Continuar',
        [TAB_STATES.ITEM]: 'Continuar',
        [TAB_STATES.PERSON]: 'Continuar',
        [TAB_STATES.CONFIRM]: 'Confirmar Pago',
        [TAB_STATES.FINISH]: remainingDebt.value > 0 ? 'Continuar Cobrando' : 'Cerrar'
      }
      return labels[activeTab.value] || 'Siguiente'
    })

    // ==================== Métodos de Navegación ====================
    const confirmSelection = () => {
      previousTab.value = activeTab.value
      selectedSplitType.value = activeTab.value

      // Establecer el primer tipo de división usado (solo la primera vez)
      if (firstSplitType.value === null) {
        firstSplitType.value = activeTab.value
      }

      if (activeTab.value === TAB_STATES.PERSON && amountPerPerson.value === 0) {
        amountPerPerson.value = Math.round((remainingDebt.value / (numberOfPeople.value || 1)) * 100) / 100
      }

      activeTab.value = TAB_STATES.CONFIRM
    }

    const finishPayment = () => {
      remainingDebt.value -= paymentSummary.value.amountToPay

      if (selectedSplitType.value === TAB_STATES.ITEM) {
        selectedProducts.value.forEach(key => paidItemKeys.value.add(key))
      }

      if (selectedSplitType.value === TAB_STATES.PERSON) {
        peoplePaymentCount.value++
      }

      // Guardar los pagos de esta transacción en allPayments
      allPayments.value.push(...partialPayments.value)

      // Limpiar pagos de la transacción actual
      partialPayments.value = []

      // Manejar el flujo según la deuda restante
      if (remainingDebt.value === 0) {
        // Mostrar mensaje de finalización exitosa
        activeTab.value = TAB_STATES.FINISH
      } else {
        // Aún hay deuda, resetear para el siguiente pago
        resetForNextPayment()
      }
    }

    const resetForNextPayment = () => {
      if (selectedSplitType.value === TAB_STATES.PERSON) {
        activeTab.value = TAB_STATES.CONFIRM
      } else {
        activeTab.value = previousTab.value || TAB_STATES.AMOUNT
        splitAmount.value = 0
        numberOfPeople.value = 1
        selectedProducts.value = []
        selectedSplitType.value = null
        amountPerPerson.value = 0
        peoplePaymentCount.value = 0
      }
    }

    // ==================== Gestión de Pagos ====================
    const totalPaymentAmount = computed(() => {
      return partialPayments.value.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    })

    const pendingPayment = computed(() => {
      return paymentSummary.value.amountToPay - totalPaymentAmount.value
    })

    const promptPaymentAmount = (method) => {
      return new Promise((resolve) => {
        const discountText = method.discount_percentage > 0
          ? ` (${method.discount_percentage}% de descuento)`
          : ''

        $q.dialog({
          title: `Pago con ${method.name}${discountText}`,
          message: `Ingrese el monto a pagar con ${method.name}.`,
          persistent: true,
          prompt: {
            model: pendingPayment.value > 0 ? pendingPayment.value.toString() : '',
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
            resolve(null)
          }
        }).onCancel(() => resolve(null))
          .onDismiss(() => resolve(null))
      })
    }

    const addPayment = async (method) => {
      if (pendingPayment.value <= 0) return

      const amount = await promptPaymentAmount(method)
      if (amount === null) return

      const parsedAmount = parseFloat(amount)
      const payment = {
        name: method.name,
        acronym: method.acronym,
        amount: parsedAmount,
        reference: null,
        coin_id: props.coin?.id ?? null,
        payment_method_id: method.id,
        exchange: props.exchangeRate?.amount,
        user_created_id: props.userSession?.id ?? null,
        discount_percentage: method.percentage || 0,
        discount_amount: method.percentage
          ? (parsedAmount * method.percentage) / 100
          : 0
      }

      // Check if payment method already exists
      const existingIndex = partialPayments.value.findIndex(p => p.payment_method_id === method.id)
      if (existingIndex >= 0) {
        // Reemplazar el objeto completo para mantener todos los campos actualizados
        partialPayments.value[existingIndex] = payment
      } else {
        partialPayments.value.push(payment)
      }
    }

    const deletePayment = (index) => {
      partialPayments.value.splice(index, 1)
    }

    const updatePaymentAmount = (payment, index, newAmount) => {
      payment.amount = parseFloat(newAmount) || 0
    }

    const handleFinish = () => {
      if (remainingDebt.value > 0) {
        // Si aún hay deuda pendiente, continuar con el siguiente pago
        resetForNextPayment()
      } else {
        // Solo cerrar el modal cuando la deuda esté completamente pagada
        emit('update:show', false)
        previousTab.value = null
        // No emitimos confirmación al padre
      }
    }

    const handlePrintInvoice = () => {
      console.log('=== PARTIAL PAYMENT DEBUG ===')
      console.log('All Payments:', allPayments.value)
      console.log('Consolidated Payments:', consolidatedPayments.value)
      console.log('Params:', {
        branch_office_id: props.userSession?.branch_office_id,
        cashbox_user_id: props.cashBoxState?.id,
        payments: consolidatedPayments.value,
        total_amount: props.totalAmount
      })

      // Emitir evento con la estructura de action-click de PaymentModal
      emit('confirm', {
        action: 'invoice',
        params: {
          branch_office_id: props.userSession?.branch_office_id,
          cashbox_user_id: props.cashBoxState?.id,
          payments: consolidatedPayments.value,
          total_amount: props.totalAmount
        },
        payments: consolidatedPayments.value,
        tableClose: closeTableOnFinish.value
      })
    }

    const handleSaveWithoutPrint = () => {
      emit('confirm', {
        action: 'save',
        params: {
          branch_office_id: props.userSession?.branch_office_id,
          cashbox_user_id: props.cashBoxState?.id,
          payments: consolidatedPayments.value,
          total_amount: props.totalAmount
        },
        payments: consolidatedPayments.value,
        tableClose: closeTableOnFinish.value
      })
    }

    // ==================== Utilidades de UI ====================
    const getPaymentMethodIcon = (methodName) => {
      const iconMap = {
        Efectivo: 'payments',
        'Tarjeta de Crédito': 'credit_card',
        'Tarjeta de Débito': 'payment',
        Transferencia: 'account_balance',
        Cheque: 'receipt',
        Otros: 'more_horiz'
      }

      // Buscar coincidencia parcial en el nombre
      for (const [key, icon] of Object.entries(iconMap)) {
        if (methodName.toLowerCase().includes(key.toLowerCase())) {
          return icon
        }
      }

      return 'credit_card' // Icono por defecto
    }

    // ==================== Handlers de Eventos ====================
    const handleCancel = () => {
      if (activeTab.value === TAB_STATES.CONFIRM) {
        activeTab.value = selectedSplitType.value || TAB_STATES.AMOUNT
        selectedSplitType.value = null
        return
      }
      emit('update:show', false)
      emit('cancel')
    }

    const handleNextAction = () => {
      const transitions = {
        [TAB_STATES.AMOUNT]: confirmSelection,
        [TAB_STATES.ITEM]: confirmSelection,
        [TAB_STATES.PERSON]: confirmSelection,
        [TAB_STATES.CONFIRM]: finishPayment,
        [TAB_STATES.FINISH]: handleFinish
      }

      transitions[activeTab.value]?.()
    }

    // ==================== Return ====================
    return {
      activeTab,
      splitAmount,
      numberOfPeople,
      selectedProducts,
      isStepValid,
      buttonLabel,
      paymentSummary,
      formatNumber,
      handleCancel,
      handleNextAction,
      remainingDebt,
      sortedProducts,
      isItemPaid,
      getPaymentMethodIcon,
      currencySymbol,
      isAmountTabDisabled,
      isItemTabDisabled,
      isPersonTabDisabled,
      // Payment management
      partialPayments,
      totalPaymentAmount,
      pendingPayment,
      addPayment,
      deletePayment,
      updatePaymentAmount,
      consolidatedPayments,
      handlePrintInvoice,
      handleSaveWithoutPrint,
      closeTableOnFinish
    }
  }
}
</script>

<style scoped>
.partial-payment-card {
  display: flex;
  flex-direction: column;
}

.partial-payment-card .invoice-body {
  overflow-y: auto;
  flex: 1;
}

.split-content {
  min-height: 300px;
}

.product-item-split {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-item-split:hover {
  background-color: #f5f5f5;
}

.invoice-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.cancel-btn {
  color: #666;
}

/* Botones de finalización */
.finish-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}

/* En móvil: botones apilados verticalmente */
@media (max-width: 599px) {
  .finish-buttons {
    flex-direction: column;
  }

  .finish-btn {
    width: 100%;
    margin-left: 0 !important;
  }
}

/* En desktop: botones horizontales */
@media (min-width: 600px) {
  .finish-buttons {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* Animación del contenedor de tabs */
.tabs-container {
  overflow: hidden;
  transition: opacity 0.3s ease;
  opacity: 1;
}

.tabs-container.tabs-hidden {
  opacity: 0;
}
</style>
