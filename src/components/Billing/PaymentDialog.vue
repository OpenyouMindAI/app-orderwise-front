<template>
  <q-dialog v-model="modelValue">
    <q-card style="width: 900px; max-width: 90vw;">
      <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
        <span class="text-h6">Desglose de pago</span>
        <q-btn flat icon="close" round size="md" v-close-popup/>
      </q-card-section>
      <q-card-section class="row q-col-gutter-md q-px-sm">
        <div class="col-xs-12 col-sm-4 col-md-4 col-lg-3 q-gutter-xs">
          <q-btn
            color="secondary"
            size="17px"
            style="width: 100%"
            :label="paymentMethod.name"
            v-for="paymentMethod in paymentMethods" :key="paymentMethod.id"
            @click="addPayment(paymentMethod)"
          />
        </div>
        <div class="col-xs-12 col-sm-8 col-md-8 col-lg-9 q-gutter-xs">
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Método de pago</th>
                <th class="text-left">Referencia</th>
                <th class="text-right">Monto</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(payment, index) in payments" :key="payment.id">
                <td class="text-left">{{ payment.name }}</td>
                <td class="text-left">
                  <span v-if="payment.reference"> {{ payment.reference }}</span>
                  <span v-else>-</span>
                  <q-popup-edit
                    v-model="payment.reference"
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
                    v-model.number="payment.amount"
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
                <q-td class="text-center q-gutter-x-xs">
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
                      @click="waitingPayment = true"
                    />
                </q-td>
              </tr>
              <tr>
                <th colspan="4">
                  Restante a pagar:
                  <span v-if="coin">{{ coin.symbol }}</span>{{ formatNumber(pendingPayment) }}
                </th>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-gutter-y-sm">
        <q-btn
          label="Guardar"
          @click="emit('save', payments)"
          color="secondary"
          :class="$q.screen.lt.sm ? 'full-width' : ''"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { notify } from '../../const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { api } from 'src/boot/axios'

defineModel({
  modelValue: false
})

const paymentMethods = ref([])

const payments = ref([])

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save'])

const store = authentication()

const userSession = store.userSession

onMounted(() => {
  getPaymentMethods()
})

/**
 * Get all payment-methods
 */
const getPaymentMethods = async () => {
  try {
    const { data } = await api.get('payment-methods')
    paymentMethods.value = data
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

/**
 * Delete invoice payment
 * @param {Number} index value index payments
 */
const deletePayment = (index) => {
  payments.value.splice(index, 1)
}

/**
 * Add bill payment
 * @param {Object} data data payments
 */
const addPayment = (data) => {
  payments.value.push({
    name: data.name,
    acronym: data.acronym,
    amount: 0,
    reference: null,
    coin_id: props.invoice?.coin?.id,
    payment_method_id: data.id,
    user_created_id: userSession.id
  })
}

</script>
