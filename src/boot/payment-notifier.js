import { useQuasar } from 'quasar'
import { ref } from 'vue'

const showDetailsModal = ref(false)
const currentPayment = ref(null)

export function usePaymentNotifier () {
  const $q = useQuasar()

  const showPaymentNotification = (paymentData) => {
    // Guardar los datos para el modal
    currentPayment.value = paymentData

    // Formatear información básica
    const amount = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: paymentData.currency_id
    }).format(paymentData.transaction_amount)

    const payerInfo = getPayerInfo(paymentData.payer)

    // Mostrar notificación
    $q.notify({
      type: paymentData.status === 'approved' ? 'positive' : 'warning',
      position: 'top-right',
      timeout: 5000,
      message: `Pago recibido: ${amount}`,
      caption: `De: ${payerInfo}`,
      icon: 'payments',
      actions: [
        {
          label: 'Detalles',
          color: 'white',
          handler: () => { showDetailsModal.value = true }
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
