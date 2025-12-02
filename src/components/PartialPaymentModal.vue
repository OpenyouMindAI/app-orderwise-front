<template>
  <q-dialog :model-value="show" @update:model-value="$emit('update:show', $event)">
    <q-card style="width: 800px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          Cobro Parcial
          <span class="text-subtitle1 text-weight-regular text-grey-8 q-ml-sm">
            Total: ${{ formatNumber(remainingDebt) }}
          </span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Split Bill Tabs -->
      <q-tabs
        v-model="activeTab"
        class="invoice-tabs"
        indicator-color="primary"
        active-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="amount" label="Por Monto" icon="payments" />
        <q-tab name="item" label="Por Item" icon="receipt" />
        <q-tab name="person" label="Por Persona" icon="people" />
      </q-tabs>

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
                prefix="$"
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
                :key="product.id"
                class="product-item-split q-pa-sm q-mb-sm"
                :class="{ 'bg-grey-2': isProductPaid(product.id) }"
              >
                <q-checkbox
                  v-model="selectedProducts"
                  :val="product.id"
                  :label="product.name"
                  :disable="isProductPaid(product.id)"
                />
                <span class="text-caption text-grey-7">
                  ${{ formatNumber(product.pivot?.price || product.price) }}
                  <q-icon v-if="isProductPaid(product.id)" name="check_circle" color="positive" class="q-ml-sm" />
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
                      ${{ formatNumber(remainingDebt / numberOfPeople) }}
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
            <div class="text-h6 q-mb-md text-primary">
              <q-icon name="check_circle" />
              Confirmar Cobro Parcial
            </div>

            <q-card flat bordered class="q-pa-md bg-grey-1">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="text-subtitle2 text-grey-7">Tipo de División</div>
                  <div class="text-body1 text-weight-medium">
                    {{ paymentSummary.typeLabel }}
                  </div>
                </div>

                <div class="col-12">
                  <q-separator class="q-my-sm" />
                </div>

                <div class="col-6">
                  <div class="text-subtitle2 text-grey-7">Total a cancelar</div>
                  <div class="text-h6">
                    ${{ formatNumber(remainingDebt) }}
                  </div>
                </div>

                <div class="col-6 text-right">
                  <div class="text-subtitle2 text-grey-7">Lo que se está cancelando</div>
                  <div class="text-h5 text-positive text-weight-bold">
                    ${{ formatNumber(paymentSummary.amountToPay) }}
                  </div>
                </div>

                <div class="col-12">
                  <q-separator class="q-my-sm" />
                </div>

                <div class="col-12 text-right">
                  <div class="text-subtitle2 text-grey-7">Lo que falta por cobrar</div>
                  <div class="text-h6 text-warning">
                    ${{ formatNumber(paymentSummary.remainingAmount) }}
                  </div>
                </div>
              </div>
            </q-card>

            <div class="q-mt-md text-center text-grey-8">
              <p>¿Está seguro que desea procesar este pago parcial?</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- Proceso de pago -->
        <q-tab-panel name="process">
          <div class="split-content q-pa-md">
            <div class="text-h6 q-mb-md">
              <q-icon name="payments" />
              Proceso de Cobro Parcial
            </div>
            <p class="text-body2 text-grey-7">
              Proceso de cobro parcial.
            </p>
            <!-- Aquí irá la lógica para el proceso de cobro parcial -->
          </div>
        </q-tab-panel>

        <!-- Mensaje de Finalización -->
        <q-tab-panel name="finish">
          <div class="split-content q-pa-md">
            <div class="text-h6 q-mb-md">
              <q-icon name="payments" />
              Finalización de Cobro Parcial
            </div>
            <p class="text-body2 text-grey-7">
              Finalización de cobro parcial.
            </p>
            <!-- Aquí irá la lógica para la finalización de cobro parcial -->
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
        <q-btn
          :label="buttonLabel"
          color="positive"
          @click="handleNextAction"
          :loading="loading"
          :disable="!isStepValid"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'

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
    }
  },
  setup (props, { emit }) {
    // Local state
    const activeTab = ref('amount')
    const splitAmount = ref(0)
    const numberOfPeople = ref(1)
    const selectedProducts = ref([])
    const selectedSplitType = ref(null)
    const remainingDebt = ref(props.totalAmount)
    const paidProductIds = ref(new Set())

    // Reset state when modal is shown
    watch(() => props.show, (newVal) => {
      if (newVal) {
        activeTab.value = 'amount'
        splitAmount.value = 0
        numberOfPeople.value = 1
        selectedProducts.value = []
        selectedSplitType.value = null
        remainingDebt.value = props.totalAmount
        paidProductIds.value.clear()
      }
    })

    watch(() => props.totalAmount, (newVal) => {
      remainingDebt.value = newVal
    })

    // Computed
    const isStepValid = computed(() => {
      if (activeTab.value === 'amount') {
        return splitAmount.value > 0 && splitAmount.value <= remainingDebt.value
      } else if (activeTab.value === 'item') {
        return selectedProducts.value.length > 0
      } else if (activeTab.value === 'person') {
        return numberOfPeople.value > 0
      } else if (['confirm', 'process', 'finish'].includes(activeTab.value)) {
        return true
      }
      return false
    })

    const paymentSummary = computed(() => {
      let amountToPay = 0
      let typeLabel = ''

      // Usar el tipo seleccionado si existe, o la tab actual
      const type = selectedSplitType.value || activeTab.value

      if (type === 'amount') {
        amountToPay = splitAmount.value
        typeLabel = 'Por Monto Fijo'
      } else if (type === 'item') {
        amountToPay = props.products
          .filter(p => selectedProducts.value.includes(p.id))
          .reduce((sum, p) => {
            const price = parseFloat(p.pivot?.price || p.price || 0)
            const amount = parseFloat(p.pivot?.amount || 1)
            return sum + (price * amount)
          }, 0)
        typeLabel = `Por Items (${selectedProducts.value.length} seleccionados)`
      } else if (type === 'person') {
        amountToPay = remainingDebt.value / (numberOfPeople.value || 1)
        typeLabel = `Por Persona (1 de ${numberOfPeople.value})`
      }

      return {
        amountToPay,
        remainingAmount: remainingDebt.value - amountToPay,
        typeLabel
      }
    })

    const isProductPaid = (id) => paidProductIds.value.has(id)

    const sortedProducts = computed(() => {
      return [...props.products].sort((a, b) => {
        const aPaid = isProductPaid(a.id)
        const bPaid = isProductPaid(b.id)
        if (aPaid === bPaid) return 0
        return aPaid ? 1 : -1
      })
    })

    const buttonLabel = computed(() => {
      switch (activeTab.value) {
        case 'amount':
        case 'item':
        case 'person':
          return 'Continuar'
        case 'confirm':
          return 'Confirmar Pago'
        case 'process':
          return 'Finalizar'
        case 'finish':
          return remainingDebt.value > 0 ? 'Continuar Cobrando' : 'Cerrar'
        default:
          return 'Siguiente'
      }
    })

    // Methods
    const formatNumber = (value) => {
      if (!value && value !== 0) return '0'
      return new Intl.NumberFormat('es-CO').format(value)
    }

    const handleCancel = () => {
      if (['confirm', 'process'].includes(activeTab.value)) {
        activeTab.value = selectedSplitType.value || 'amount'
        selectedSplitType.value = null
        return
      }
      emit('update:show', false)
      emit('cancel')
    }

    const handleNextAction = () => {
      // Navegación basada en la tab actual
      if (['amount', 'item', 'person'].includes(activeTab.value)) {
        selectedSplitType.value = activeTab.value
        activeTab.value = 'confirm'
      } else if (activeTab.value === 'confirm') {
        // Emitir evento con los datos para procesar
        handleConfirm()
        activeTab.value = 'process'
      } else if (activeTab.value === 'process') {
        remainingDebt.value -= paymentSummary.value.amountToPay

        if (selectedSplitType.value === 'item') {
          selectedProducts.value.forEach(id => paidProductIds.value.add(id))
        }

        activeTab.value = 'finish'
      } else if (activeTab.value === 'finish') {
        if (remainingDebt.value > 0) {
          activeTab.value = 'amount'
          splitAmount.value = 0
          numberOfPeople.value = 1
          selectedProducts.value = []
          selectedSplitType.value = null
        } else {
          emit('update:show', false)
        }
      }
    }

    const handleConfirm = () => {
      const data = {
        type: selectedSplitType.value || activeTab.value,
        splitAmount: splitAmount.value,
        numberOfPeople: numberOfPeople.value,
        selectedProducts: selectedProducts.value
      }
      emit('confirm', data)
    }

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
      isProductPaid
    }
  }
}
</script>

<style scoped>
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
</style>
