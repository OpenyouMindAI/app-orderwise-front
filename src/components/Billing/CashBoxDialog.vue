<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
        <q-card style="width: 500px; max-width: 80vw; min-height: 250px;">
      <q-card-section class="q-py-sm bg-primary text-white flex justify-between items-center">
        <span class="text-h6">Abrir Caja</span>
        <q-btn flat icon="close" round size="md" v-close-popup />
      </q-card-section>

      <q-inner-loading :showing="!isReady">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <div v-if="isReady">
        <q-card-section v-if="isBoxAlreadyOpen" class="q-pt-lg text-center">
          <q-icon name="info" color="primary" size="48px" />
          <p class="q-mt-md">Ya tienes una caja abierta en este turno.</p>
          <p>¿Deseas cerrarla ahora?</p>
           <q-card-actions align="center" class="q-mt-md">
            <q-btn
              label="Cerrar Caja"
              color="negative"
              unelevated
              @click="confirmCloseBox"
              :loading="isSubmitting"
            />
          </q-card-actions>
        </q-card-section>

        <q-card-section v-else-if="availableCashBoxes.length === 0" class="q-pt-lg">
          <p class="text-info text-center">No hay cajas disponibles para abrir.</p>
           <q-card-actions align="right" class="q-mt-md">
            <q-btn ref="closeButton" flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card-section>

        <q-card-section v-else class="q-pt-md">
          <q-form @submit.prevent="submitOpenBox">
            <q-select
              ref="boxSelect"
              v-if="availableCashBoxes.length > 1"
              v-model="selectedBox"
              :options="availableCashBoxes"
              label="Selecciona una caja"
              option-value="id"
              option-label="name"
              filled
              lazy-rules
              :rules="[val => !!val || 'Debes seleccionar una caja']"
              class="q-mb-md"
            />

            <q-input
              ref="amountInput"
              v-model.number="initialAmount"
              type="number"
              label="Monto inicial"
              filled
              lazy-rules
              :rules="[val => val !== null && val !== '' && val >= 0 || 'El monto inicial es requerido']"
              prefix="$"
            />

            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancelar" color="primary" v-close-popup :disable="isSubmitting" />
              <q-btn type="submit" label="Abrir Caja" color="primary" :loading="isSubmitting" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notify, Dialog } from 'quasar'

export default {
  name: 'CashBoxDialog',
  props: {
    modelValue: Boolean,
    cashierId: {
      type: Number,
      required: true
    },
    isBoxAlreadyOpen: {
      type: Boolean,
      default: false
    },
    availableCashBoxes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'box-opened', 'box-closed'],
  data () {
    return {
      isReady: false,
      isSubmitting: false,
      selectedBox: null,
      initialAmount: null
    }
  },
  mounted () {
    this.initializeModal()
  },
  methods: {
    /**
     * Initializes the modal with the data received from props.
     * Sets up the selected box if there's only one available.
     */
    initializeModal () {
      // Auto-select if there's only one available cash box
      if (!this.isBoxAlreadyOpen && this.availableCashBoxes.length === 1) {
        this.selectedBox = this.availableCashBoxes[0]
      }
      // Mark as ready to show content
      this.isReady = true
      // Set focus on appropriate element
      this.$nextTick(() => {
        if (this.isBoxAlreadyOpen || this.availableCashBoxes.length === 0) {
          this.$refs.closeButton?.focus()
        } else if (this.availableCashBoxes.length > 1) {
          this.$refs.cashBoxSelect?.focus()
        } else {
          this.$refs.initialAmountInput?.focus()
        }
      })
    },

    async submitOpenBox () {
      this.isSubmitting = true
      try {
        const payload = {
          cash_box_id: this.selectedBox.id,
          init_amount: this.initialAmount,
          cashier_id: this.cashierId,
          status: 'open'
        }

        // Simulación de envío (para testing)
        console.log('Payload que se enviaría a la API:', payload)
        // Aquí iría la llamada real a la API: await this.$api.post('init-cashbox', payload)

        Notify.create({
          type: 'positive',
          message: `Caja "${this.selectedBox.name}" abierta con éxito (Simulación).`
        })

        this.$emit('box-opened')
        this.$emit('update:modelValue', false)
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.message || 'Hubo un error al intentar abrir la caja.'
        })
      } finally {
        this.isSubmitting = false
      }
    },

    confirmCloseBox () {
      Dialog.create({
        title: 'Confirmar Cierre',
        message: '¿Estás seguro de que quieres cerrar la caja? Esta acción no se puede deshacer.',
        persistent: true,
        ok: {
          label: 'Sí, Cerrar Caja',
          color: 'negative',
          unelevated: true
        },
        cancel: {
          label: 'Cancelar',
          flat: true
        }
      }).onOk(() => {
        this.closeBox()
      })
    },

    async closeBox () {
      this.isSubmitting = true
      console.log('Closing box...')
      // Aquí iría la llamada real a la API: await this.$api.post('close-cashbox', { ... })
      setTimeout(() => {
        Notify.create({
          type: 'positive',
          message: 'La caja ha sido cerrada con éxito (Simulación).'
        })
        this.$emit('box-closed')
        this.$emit('update:modelValue', false)
        this.isSubmitting = false
        console.log('Mock close successful.')
      }, 1000)
    }
  }
}
</script>
