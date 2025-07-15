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
      message: `
        <div style="display: flex; align-items: center; padding: 8px;">
            <div style="font-weight: bold; font-size: 14px;">$${amount}</div>
            <div style="font-size: 13px;">De: ${payerInfo}</div>
        </div>
      `,
      html: true,
      color: '#00B1EA',
      textColor: 'white',
      avatar: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__small@2x.png',
      timeout: 0,
      actions: [
        // {
        //   label: 'Detalles',
        //   color: 'white',
        //   handler: () => {
        //     showDetailsModal.value = true
        //   }
        // },
        {
          icon: 'close',
          color: 'white',
          flat: true,
          round: true,
          handler: () => {}
        }
      ],
      classes: 'my-mercadopago-notify' // Clase adicional para estilos personalizados
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
