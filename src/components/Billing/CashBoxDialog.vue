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

        <q-card-section v-else-if="availableCashBoxes.length === 0" class="q-pt-md">
          <p class="text-subtitle1 text-center q-mb-md">No hay cajas registradas. Crea la primera.</p>
          <q-form @submit.prevent="submitNewBox">
            <q-input
              ref="newBoxNameInput"
              v-model="newBoxName"
              label="Nombre de la caja"
              filled
              lazy-rules
              :rules="[val => !!val && val.trim().length > 0 || 'El nombre es requerido']"
            />
            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancelar" color="primary" v-close-popup :disable="isSubmitting" />
              <q-btn type="submit" label="Crear y Abrir" color="primary" :loading="isSubmitting" />
            </q-card-actions>
          </q-form>
        </q-card-section>

        <q-card-section v-else class="q-pt-md">
          <q-form @submit.prevent="submitOpenBox">
            <q-select
              ref="boxSelect"
              v-model="selectedBox"
              :options="availableCashBoxes"
              label="Selecciona una caja"
              option-value="id"
              option-label="name"
              filled
              lazy-rules
              :rules="[val => !!val || 'Debes seleccionar una caja']"
              class="q-mb-md"
              :disable="availableCashBoxes.length === 1"
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
import { authentication } from 'src/stores/module-authentication'

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
  emits: ['update:modelValue', 'box-opened', 'box-closed', 'box-created'],
  data () {
    return {
      isReady: false,
      isSubmitting: false,
      selectedBox: null,
      initialAmount: null,
      newBoxName: ''
    }
  },
  computed: {
    authStore () {
      return authentication()
    },
    branchOffice () {
      return this.authStore.branchOffice
    }
  },
  watch: {
    modelValue (newValue) {
      if (newValue) {
        this.resetForm()
        this.initializeModal()
      }
    },
    // Watch for changes in availableCashBoxes to auto-select if only one is available
    availableCashBoxes: {
      handler (newVal) {
        if (newVal && newVal.length === 1) {
          this.selectedBox = newVal[0]
        }
      },
      immediate: true // Run the handler immediately on component mount
    }
  },
  mounted () {
    // The watcher for modelValue will handle initialization on open.
  },
  methods: {
    /**
     * Initializes the modal with the data received from props.
     * Sets up the selected box if there's only one available.
     */
    resetForm () {
      this.initialAmount = null
      this.newBoxName = ''
      // Do not reset selectedBox if there is only one, as it's auto-selected
      if (this.availableCashBoxes.length !== 1) {
        this.selectedBox = null
      }
    },

    initializeModal () {
      // Mark as ready to show content
      this.isReady = true
      // Set focus on appropriate element
      this.$nextTick(() => {
        if (this.isBoxAlreadyOpen || this.availableCashBoxes.length === 0) {
          this.$refs.closeButton?.focus()
        } else if (this.availableCashBoxes.length === 1) {
          // If one box is auto-selected, focus the amount input
          this.$refs.amountInput?.focus()
        } else {
          // Otherwise, focus the box selection
          this.$refs.boxSelect?.focus()
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

    async submitNewBox () {
      if (!this.newBoxName || this.newBoxName.trim() === '') {
        return
      }
      this.isSubmitting = true
      try {
        const payload = {
          name: this.newBoxName,
          disabled: false,
          branch_office_id: this.branchOffice.id
        }
        // Llamada a la API (interceptada por MSW)
        await this.$api.post('cashboxs', payload)

        Notify.create({
          type: 'positive',
          message: `Caja "${this.newBoxName}" creada con éxito.`
        })

        this.$emit('box-created')
        // No cerramos el diálogo, BillingPage se encargará de recargar y mostrar el flujo de apertura
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.message || 'Error al crear la caja.'
        })
      } finally {
        this.isSubmitting = false
      }
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
