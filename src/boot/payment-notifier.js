import { Dialog, Notify } from 'quasar'
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
    Dialog.create({
      message: `
        <div style="background-color: #00B1EA; padding: 20px; border-radius: 8px; color: white;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__small@2x.png" 
                style="height: 30px; margin-right: 10px;" alt="Mercado Pago">
            <div>
              <div style="font-size: 1.2em; font-weight: bold;">$${amount}</div>
              <div>De: ${payerInfo}</div>
            </div>
          </div>
        </div>
      `,
      html: true,
      position: 'top-right',
      seamless: true,
      ok: {
        label: 'Detalles',
        color: 'primary',
        flat: true
      },
      cancel: {
        label: 'Cerrar',
        color: 'white',
        textColor: 'black',
        flat: true
      }
    }).onOk(() => {
      showDetailsModal.value = true
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
