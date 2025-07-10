<template>
  <q-dialog v-model="showModal" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card>
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">Detalles completos del pago</div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Información básica</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row q-col-gutter-y-sm">
                  <div class="col-6"><strong>Monto:</strong></div>
                  <div class="col-6 text-right">{{ formattedAmount }}</div>

                  <div class="col-6"><strong>Pagador:</strong></div>
                  <div class="col-6 text-right">{{ payerInfo }}</div>

                  <div class="col-6"><strong>Método:</strong></div>
                  <div class="col-6 text-right">{{ payment.payment_method_id }}</div>

                  <div class="col-6"><strong>Fecha:</strong></div>
                  <div class="col-6 text-right">{{ formattedDate }}</div>

                  <div class="col-6"><strong>Estado:</strong></div>
                  <div class="col-6 text-right" :class="statusClass">
                    {{ payment.status }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Transacción</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row q-col-gutter-y-sm">
                  <div class="col-6"><strong>ID Transacción:</strong></div>
                  <div class="col-6 text-right">{{ payment.id }}</div>

                  <div class="col-6"><strong>Monto neto:</strong></div>
                  <div class="col-6 text-right">
                    {{ payment.transaction_details.net_received_amount }} {{ payment.currency_id }}
                  </div>

                  <div class="col-6"><strong>Tipo operación:</strong></div>
                  <div class="col-6 text-right">{{ payment.operation_type }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6">Datos técnicos completos</div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <pre class="q-pa-md bg-grey-2 rounded-borders">{{ formattedPayment }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    payment: {
      type: Object,
      required: true
    },
    showModal: {
      type: Boolean,
      required: true
    }
  },

  setup (props) {
    const formattedAmount = computed(() => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: props.payment.currency_id
      }).format(props.payment.transaction_amount)
    })

    const payerInfo = computed(() => {
      const p = props.payment.payer
      if (p.first_name && p.last_name) {
        return `${p.first_name} ${p.last_name} (${p.email})`
      }
      return p.email || 'No especificado'
    })

    const formattedDate = computed(() => {
      return new Date(props.payment.date_approved).toLocaleString()
    })

    const statusClass = computed(() => {
      return {
        'text-positive': props.payment.status === 'approved',
        'text-warning': props.payment.status !== 'approved'
      }
    })

    const formattedPayment = computed(() => {
      return JSON.stringify(props.payment, null, 2)
    })

    return {
      formattedAmount,
      payerInfo,
      formattedDate,
      statusClass,
      formattedPayment
    }
  }
}
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
