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
        <q-card-section v-if="internalBoxAlreadyOpen" class="q-pt-lg text-center">
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

        <q-card-section v-else-if="internalAvailableCashBoxes.length === 0" class="q-pt-md">
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
              :options="internalAvailableCashBoxes"
              label="Selecciona una caja"
              option-value="id"
              option-label="name"
              filled
              lazy-rules
              :rules="[val => !!val || 'Debes seleccionar una caja']"
              class="q-mb-md"
              :disable="internalAvailableCashBoxes.length === 1"
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
      newBoxName: '',
      // Estados internos del modal
      internalBoxAlreadyOpen: false,
      internalAvailableCashBoxes: [],
      cashierSession: null
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
        this.checkCashBoxStatusAndInitialize()
      }
    },
    // Watch for changes in internalAvailableCashBoxes to auto-select if only one is available
    internalAvailableCashBoxes: {
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
     * Solicita al usuario el saldo final para cerrar la caja
     * @returns {Promise<number|null>} El saldo final o null si se cancela
     */
    promptForEndBalance () {
      return new Promise((resolve) => {
        Dialog.create({
          title: 'Cerrar Caja',
          message: 'Ingresa el saldo final de la caja:',
          prompt: {
            model: '',
            type: 'number',
            placeholder: '0.00',
            suffix: '$'
          },
          cancel: {
            label: 'Cancelar',
            flat: true
          },
          persistent: true,
          ok: {
            label: 'Cerrar Caja',
            color: 'negative'
          }
        }).onOk((endBalance) => {
          const numericBalance = parseFloat(endBalance)
          if (isNaN(numericBalance)) {
            Notify.create({
              type: 'negative',
              message: 'Debes ingresar un valor numérico válido'
            })
            resolve(null)
          } else {
            resolve(numericBalance)
          }
        }).onCancel(() => {
          resolve(null)
        })
      })
    },
    /**
     * Initializes the modal with the data received from props.
     * Sets up the selected box if there's only one available.
     */
    resetForm () {
      this.initialAmount = null
      this.newBoxName = ''
      // Do not reset selectedBox if there is only one, as it's auto-selected
      if (this.internalAvailableCashBoxes.length !== 1) {
        this.selectedBox = null
      }
      // Reset internal states
      this.isReady = false
      this.internalBoxAlreadyOpen = false
      this.internalAvailableCashBoxes = []
      this.cashierSession = null
    },

    /**
     * Obtiene el estado de la caja desde localStorage
     * @returns {Object|null} El estado de la caja o null
     */
    getCashBoxStateFromLocalStorage () {
      try {
        const localState = localStorage.getItem('cashbox_state')
        if (localState) {
          return JSON.parse(localState)
        }
      } catch (error) {
        console.error('Error al leer estado desde localStorage en modal:', error)
      }
      return null
    },

    async checkCashBoxStatusAndInitialize () {
      try {
        // Verificar estado guardado en localStorage primero
        const savedState = this.getCashBoxStateFromLocalStorage()
        console.log('🔍 Verificando estado de caja al abrir modal...')
        console.log('Estado guardado en localStorage:', savedState)

        // Si no hay datos en localStorage, omitir consulta al backend
        if (!savedState) {
          console.log('✅ No hay datos de caja en localStorage, omitiendo consulta al backend (modal)')
          this.internalBoxAlreadyOpen = false
          await this.loadAvailableCashBoxes()
          this.initializeModal()
          return
        }

        // Si hay datos en localStorage, verificar con el backend
        console.log('Hay datos en localStorage, verificando con backend...')
        const response = await this.$api.get(`cashier-init?user_id=${this.cashierId}`)
        console.log('📡 ENDPOINT: GET /cashier-init (validación modal)')
        console.log('📥 RESPONSE:', JSON.stringify(response.data, null, 2))
        const cashierSession = response.data
        this.cashierSession = cashierSession

        // Verificar si la sesión está abierta
        const isSessionOpen = cashierSession &&
                             cashierSession.status === 'open' &&
                             !cashierSession.close_date
        if (isSessionOpen) {
          // Usuario tiene una caja abierta
          this.internalBoxAlreadyOpen = true
          this.internalAvailableCashBoxes = []
          console.log('✅ Usuario tiene sesión de caja abierta')
        } else {
          // Usuario no tiene caja abierta, cargar cajas disponibles
          this.internalBoxAlreadyOpen = false
          await this.loadAvailableCashBoxes()
          console.log('❌ Usuario no tiene sesión activa')
        }
        this.initializeModal()
      } catch (error) {
        // Error 404 es esperado cuando no hay sesión de caja activa
        if (error.response?.status === 404) {
          console.log('✅ No hay sesión de caja activa en modal (404 - esperado)')
          this.internalBoxAlreadyOpen = false
          await this.loadAvailableCashBoxes()
          this.initializeModal()
        } else {
          console.error('Error al verificar estado de caja en modal:', error)
          // En caso de error real, asumir que no hay caja abierta y cargar cajas disponibles
          this.internalBoxAlreadyOpen = false
          await this.loadAvailableCashBoxes()
          this.initializeModal()
        }
      }
    },

    async loadAvailableCashBoxes () {
      try {
        console.log('📦 Cargando cajas disponibles en modal...')
        // Obtener todas las cajas del sistema
        const response = await this.$api.get('cashboxes')
        console.log('📡 ENDPOINT: GET /cashboxes (modal)')
        console.log('📥 RESPONSE:', JSON.stringify(response.data, null, 2))
        const allBoxes = response.data.data || response.data || []
        // Filtrar solo las cajas activas
        this.internalAvailableCashBoxes = allBoxes.filter(box =>
          box.status === 'active' && !box.disabled
        )
        console.log(`📊 Cajas disponibles cargadas: ${this.internalAvailableCashBoxes.length}`)
      } catch (error) {
        console.error('Error al cargar cajas disponibles en modal:', error)
        this.internalAvailableCashBoxes = []
      }
    },

    initializeModal () {
      // Mark as ready to show content
      this.isReady = true
      // Set focus on appropriate element
      this.$nextTick(() => {
        if (this.internalBoxAlreadyOpen || this.internalAvailableCashBoxes.length === 0) {
          this.$refs.closeButton?.focus()
        } else if (this.internalAvailableCashBoxes.length === 1) {
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
        // Validación de datos antes de enviar
        if (!this.selectedBox || !this.selectedBox.id) {
          throw new Error('Debes seleccionar una caja válida')
        }
        if (this.initialAmount === null || this.initialAmount === '' || this.initialAmount < 0) {
          throw new Error('El monto inicial debe ser mayor o igual a cero')
        }

        // Preparar payload según especificación de la API
        const payload = {
          cashbox_id: this.selectedBox.id,
          user_id: this.cashierId,
          init_balance: parseFloat(this.initialAmount),
          init_date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
          status: 'open'
        }

        console.log('📡 ENDPOINT: POST /cashier-open')
        console.log('📤 PAYLOAD:', JSON.stringify(payload, null, 2))
        // Llamada real a la API para registrar apertura de caja
        const openResponse = await this.$api.post('cashier-open', payload)
        console.log('📥 RESPONSE:', JSON.stringify(openResponse.data, null, 2))

        Notify.create({
          type: 'positive',
          message: `Caja "${this.selectedBox.name}" abierta con éxito.`,
          caption: `Monto inicial: $${this.initialAmount}`
        })

        // Emitir evento con datos de la caja abierta
        this.$emit('box-opened', {
          cashboxId: this.selectedBox.id,
          initialBalance: this.initialAmount,
          boxName: this.selectedBox.name
        })
        this.$emit('update:modelValue', false)
      } catch (error) {
        console.error('Error al abrir caja:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Hubo un error al intentar abrir la caja.',
          caption: 'Verifica los datos e intenta nuevamente'
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
      // Validación del nombre de la caja
      if (!this.newBoxName || this.newBoxName.trim() === '') {
        Notify.create({
          type: 'negative',
          message: 'El nombre de la caja es requerido'
        })
        return
      }

      this.isSubmitting = true
      try {
        // Preparar payload según especificación de la API
        const payload = {
          name: this.newBoxName.trim(),
          status: 'active',
          branch_office_id: this.branchOffice.id
        }

        console.log('📡 ENDPOINT: POST /cashboxs')
        console.log('📤 PAYLOAD:', JSON.stringify(payload, null, 2))

        // Llamada real a la API para crear caja
        const response = await this.$api.post('cashboxs', payload)
        console.log('📥 RESPONSE:', JSON.stringify(response.data, null, 2))

        Notify.create({
          type: 'positive',
          message: `Caja "${this.newBoxName}" creada con éxito.`,
          caption: 'Ahora puedes proceder a abrirla'
        })

        // Emitir evento para que BillingPage recargue las cajas y muestre el flujo de apertura
        this.$emit('box-created', response.data)

        // Resetear el formulario pero mantener el diálogo abierto
        this.newBoxName = ''
      } catch (error) {
        console.error('Error al crear caja:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Error al crear la caja.',
          caption: 'Verifica que el nombre no esté duplicado'
        })
      } finally {
        this.isSubmitting = false
      }
    },

    async closeBox () {
      this.isSubmitting = true

      try {
        // Solicitar el saldo final al usuario
        const endBalance = await this.promptForEndBalance()

        if (endBalance === null) {
          // Usuario canceló
          this.isSubmitting = false
          return
        }

        // Validar que el saldo final sea válido
        if (endBalance < 0) {
          throw new Error('El saldo final debe ser mayor o igual a cero')
        }

        // Obtener la sesión de caja abierta actualmente
        const sessionResponse = await this.$api.get(`cashier-init?user_id=${this.cashierId}`)
        console.log('📡 ENDPOINT: GET /cashier-init (para cierre)')
        console.log('📥 RESPONSE:', JSON.stringify(sessionResponse.data, null, 2))
        const cashierSession = sessionResponse.data

        // Verificar que existe una sesión abierta
        if (!cashierSession ||
            cashierSession.status !== 'open' ||
            cashierSession.close_date) {
          throw new Error('No se encontró una sesión de caja abierta para cerrar')
        }

        // Preparar payload para el cierre
        const payload = {
          end_balance: parseFloat(endBalance)
        }

        console.log('📡 ENDPOINT: PUT /cashier-close/' + cashierSession.id)
        console.log('📤 PAYLOAD:', JSON.stringify(payload, null, 2))

        // Llamada real a la API para cerrar caja (usar PUT y el ID de la sesión)
        const closeResponse = await this.$api.put(`cashier-close/${cashierSession.id}`, payload)
        console.log('📥 RESPONSE:', JSON.stringify(closeResponse.data, null, 2))

        Notify.create({
          type: 'positive',
          message: 'La caja ha sido cerrada con éxito.',
          caption: `Saldo final: $${endBalance}`
        })

        // Emitir evento con datos del cierre
        this.$emit('box-closed', {
          cashboxId: cashierSession.cashbox_id,
          endBalance: parseFloat(endBalance),
          sessionId: cashierSession.id
        })
        this.$emit('update:modelValue', false)
      } catch (error) {
        console.error('Error al cerrar caja:', error)
        Notify.create({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Error al cerrar la caja.',
          caption: 'Intenta nuevamente o contacta al administrador'
        })
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>
