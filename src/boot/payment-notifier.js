import { Notify } from 'quasar'
import { formatNumber } from 'src/const/mixins'
import { ref } from 'vue'

const showDetailsModal = ref(false)
const currentPayment = ref(null)

export function usePaymentNotifier () {
  const showPaymentNotification = (paymentData) => {
    currentPayment.value = paymentData

    const amount = formatNumber(paymentData.transaction_amount)

    const payerInfo = getPayerInfo(paymentData.payer)

    // Mostrar notificación
    Notify.create({
      type: paymentData.status === 'approved' ? 'positive' : 'warning',
      position: 'top-right',
      timeout: 10000,
      message: `Pago recibido: ${amount}`,
      caption: `De: ${payerInfo}`,
      icon: 'payments',
      actions: [
        {
          label: 'Detalles',
          color: 'white',
          handler: () => {
            showDetailsModal.value = true
          }
        }
      ]
    })
  }

  const getPayerInfo = (payer) => {
    if (payer.first_name && payer.last_name) {
      return `${payer.first_name} ${payer.last_name}`
    }
    return payer.email || 'No especificado'
  }

  return {
    showPaymentNotification,
    showDetailsModal,
    currentPayment
  }
}
