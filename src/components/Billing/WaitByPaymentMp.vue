<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card style="width: 500px; max-width: 80vw;">
      <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
        <div class="text-h6">
          Escanee el código qr
        </div>
        <q-btn icon="close" flat round dense @click="cancelOrder">
          <q-tooltip class="text-body2" anchor="bottom middle" max-width="300px">
            Al cancelar el pago, el proceso en la plataforma de Mercado Pago será interrumpido,
            y será necesario iniciar nuevamente el procedimiento para completar el pago.
          </q-tooltip>
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-none" v-if="!paymentData">
        <q-img src="animates/qr.gif" alt="qr_ gift" v-show="!loading" style="max-height: 400px;">
          <div class="absolute-full text-h6 text-center flex flex-center" style="background: rgba(0,0,0,0.4)">
            En espera de que el cliente proceda a escanear el código QR.
          </div>
          <q-btn icon="info" flat round color="white" class="absolute all-pointer-events absolute-bottom-right">
            <q-tooltip class="text-body2" anchor="bottom middle">
              El cliente debe escanear el código QR para realizar el pago
            </q-tooltip>
          </q-btn>
        </q-img>
      </q-card-section>
      <q-card-section v-else class="col">
        <div class="text-center text-positive column q-col-gutter-y-sm q-mt-sm">
          <success-component />
          <span class="text-subtitle1">El pago se ha realizado con éxito</span>
        </div>
        <div class="text-center text-positive column q-mt-md q-col-gutter-y-sm">
          <span class="text-body2">N° de pago Mercado Pago: {{ paymentData?.id }}</span>
          <span class="text-body2">Referencia: {{ paymentData.external_reference }}</span>
        </div>
      </q-card-section>
      <q-card-actions v-if="paymentData">
        <q-btn label="Aceptar" color="positive" class="full-width" @click="acceptPayment" />
      </q-card-actions>
      <q-inner-loading color="primary" size="2.5em" :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { apiQPay } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { onMounted, ref, watch } from 'vue'
import { echoPay } from 'src/boot/pusher'
import SuccessComponent from './SuccessComponent.vue'
import { authentication } from 'src/stores/module-authentication'

const store = authentication()

const { branchOffice } = store
/**
 * Model value component
 * @type {Object}
 */
const modelValue = defineModel({ required: true })

/**
 * Emits component
 * @type {Object}
 */
const emit = defineEmits(['paymentSuccess'])

/**
 * Props component
 * @type {Object}
 */
const props = defineProps({
  /**
   * Invoice data
   * @type {Object}
   */
  invoice: {
    type: Object,
    require: true
  }
})

/**
 * Loading
 * @type {Boolean}
 */
const loading = ref(true)

/**
 * Reference external
 * @type {String}
 */
const referenceExternal = ref(null)
/**
 * Payment data
 * @type {Object}
 */
const paymentData = ref(null)

onMounted(() => {
  createOrder(props.invoice)
})

watch(referenceExternal, (val) => {
  const channel = echoPay.channel('mercado-pago-payment')
  channel.listen(`.mercado-pago-payment.${val}`, (data) => {
    paymentData.value = data.payment
  })
})

const acceptPayment = () => {
  emit('paymentSuccess', paymentData.value)
  modelValue.value = false
}

/**
 * Create order
 * @param {Object} invoice invoice
 */

const createOrder = async (invoice) => {
  try {
    loading.value = true
    const modelOrder = setBillModel(invoice)
    const { data } = await apiQPay.post('/mercadopago/qr-attended/orders/store', modelOrder)
    referenceExternal.value = data.external_reference
    notify('Listo para escanear el código QR', 'positive', 'check_circle')
  } catch (error) {
    notify(error?.response?.data?.message || error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}
/**
 * Converts amount and price to the minimal unit, ensuring integer quantity.
 * @param {number} amount - The quantity in the original unit.
 * @param {number} price - The price for that quantity.
 * @param {string} originalUnit - E.g., 'kg', 'liter'
 * @returns {object} - { minimalAmount, minimalUnit, pricePerMinimalUnit }
 */
const convertToMinimalUnit = (quantity, price, originalUnit) => {
  const conversions = {
    kg: { factor: 1000, minimalUnit: 'g' },
    ml: { factor: 1000, minimalUnit: 'ml' },
    unit: { factor: 1, minimalUnit: 'unit' }
  }

  const conv = conversions[originalUnit.toLowerCase()]
  if (!conv) throw new Error('Unit not supported')

  const minimalAmount = Math.round(quantity * conv.factor)
  const pricePerMinimalUnit = price / conv.factor

  return {
    minimalAmount,
    minimalUnit: conv.minimalUnit,
    pricePerMinimalUnit
  }
}

/**
 * Set bill model
 * @param {Object} model model bill
 * @returns {Object}
 */

const setBillModel = (model) => {
  return {
    ...model,
    externalStoreId: branchOffice?.id,
    externalPosId: '1',
    description: model.description || model.title,
    products: model.products.map(product => {
      // const conversion = convertToMinimalUnit(product.quantity, product.price, product.unit_of_measure?.acronym)
      return {
        ...product,
        price: product.subtotal,
        quantity: 1,
        category: product?.category?.name || 'Sin categoría',
        unit_measure: product?.unit_of_measure?.name,
        currency_id: product.currency_id
      }
    })
  }
}

/**
 * Cancel order
 */

const cancelOrder = async () => {
  try {
    loading.value = true
    await apiQPay.delete(`/mercadopago/qr-attended/orders/delete/${branchOffice?.id}`)
    modelValue.value = false
    notify('Orden cancelada exitosamente', 'warning', 'check_circle')
    referenceExternal.value = null
  } catch (error) {
    notify(error?.response?.data?.message || error.message, 'negative', 'warning')
  } finally {
    modelValue.value = false
    loading.value = false
  }
}

</script>
