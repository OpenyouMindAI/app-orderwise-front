<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 500px; max-width: 80vw; min-height: 250px;">
      <!-- Header Section -->
      <q-card-section class="q-py-sm bg-primary text-white flex justify-between items-center">
        <span class="text-h6">Abrir Caja</span>
        <q-btn flat icon="close" round size="md" v-close-popup />
      </q-card-section>

      <!-- Loading State -->
      <q-inner-loading :showing="!isReady">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Content when ready -->
      <div v-if="isReady">
        <!-- State 1: Cash box already open -->
        <q-card-section v-if="boxAlreadyOpen" class="q-pt-lg text-center">
          <q-icon name="info" color="primary" size="48px" />
          <p class="q-mt-md">Ya tienes una caja abierta en este turno.</p>
          <p>¿Deseas cerrarla ahora?</p>
          <q-card-actions align="center" class="q-mt-md">
            <q-btn
              label="Cerrar Caja"
              color="negative"
              unelevated
              @click="handleCloseBox"
              :loading="isSubmitting"
            />
          </q-card-actions>
        </q-card-section>

        <!-- State 2: No cash boxes available - create first one -->
        <q-card-section v-else-if="availableCashBoxes.length === 0" class="q-pt-md">
          <p class="text-subtitle1 text-center q-mb-md">No hay cajas registradas. Crea la primera.</p>

          <q-form @submit.prevent="handleCreateAndOpenBox">
            <q-input
              ref="newBoxNameInput"
              v-model="newBoxName"
              label="Nombre de la caja"
              filled
              lazy-rules
              :rules="nameValidationRules"
            />

            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancelar" color="primary" v-close-popup :disable="isSubmitting" />
              <q-btn type="submit" label="Crear y Abrir" color="primary" :loading="isSubmitting" />
            </q-card-actions>
          </q-form>
        </q-card-section>

        <!-- State 3: Cash boxes available - select and open -->
        <q-card-section v-else class="q-pt-md">
          <q-form @submit.prevent="handleOpenBox">
            <q-select
              ref="boxSelect"
              v-model="selectedBox"
              :options="availableCashBoxes"
              label="Selecciona una caja"
              option-value="id"
              option-label="name"
              filled
              lazy-rules
              :rules="boxSelectionRules"
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
              :rules="amountValidationRules"
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

  // ==========================================
  // COMPONENT CONFIGURATION
  // ==========================================
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

  // ==========================================
  // REACTIVE DATA
  // ==========================================
  data () {
    return {
      // Loading and submission states
      isReady: false,
      isSubmitting: false,

      // Form data
      selectedBox: null,
      initialAmount: null,
      newBoxName: '',

      // Internal component state
      boxAlreadyOpen: false,
      cashierSession: null
    }
  },

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================
  computed: {
    authStore () {
      return authentication()
    },

    branchOffice () {
      return this.authStore.branchOffice
    },

    // Validation rules
    nameValidationRules () {
      return [val => (!!val && val.trim().length > 0) || 'El nombre es requerido']
    },

    boxSelectionRules () {
      return [val => !!val || 'Debes seleccionar una caja']
    },

    amountValidationRules () {
      return [val => (val !== null && val !== '' && val >= 0) || 'El monto inicial es requerido']
    }
  },

  // ==========================================
  // WATCHERS
  // ==========================================
  watch: {
    // Initialize when dialog opens
    modelValue (newValue) {
      if (newValue) {
        this.initializeDialog()
      }
    },

    // Auto-select box if only one is available
    availableCashBoxes: {
      handler (newVal) {
        if (newVal && newVal.length === 1) {
          this.selectedBox = newVal[0]
        }
      },
      immediate: true
    }
  },

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  mounted () {
    // The watcher for modelValue will handle initialization on open
  },

  // ==========================================
  // METHODS
  // ==========================================
  methods: {
    // ------------------------------------------
    // Initialization Methods
    // ------------------------------------------

    /**
     * Initialize dialog when opened
     */
    async initializeDialog () {
      this.resetForm()
      await this.checkCashBoxStatus()
      this.setInitialFocus()
    },

    /**
     * Reset form to initial state
     */
    resetForm () {
      this.initialAmount = null
      this.newBoxName = ''
      this.isReady = false
      this.boxAlreadyOpen = false
      this.cashierSession = null

      // Don't reset selectedBox if there's only one available
      if (this.availableCashBoxes.length !== 1) {
        this.selectedBox = null
      }
    },

    /**
     * Set focus on the appropriate input element
     */
    setInitialFocus () {
      this.isReady = true

      this.$nextTick(() => {
        if (this.boxAlreadyOpen || this.availableCashBoxes.length === 0) {
          // No specific focus needed for these states

        } else if (this.availableCashBoxes.length === 1) {
          // Focus amount input if box is auto-selected
          this.$refs.amountInput?.focus()
        } else {
          // Focus box selection
          this.$refs.boxSelect?.focus()
        }
      })
    },

    // ------------------------------------------
    // Cash Box Status Methods
    // ------------------------------------------

    /**
     * Check current cash box status from localStorage and backend
     */
    async checkCashBoxStatus () {
      try {
        const savedState = this.getCashBoxStateFromStorage()
        console.log('🔍 Verificando estado de caja al abrir modal:', savedState)

        // If no localStorage data, skip backend check
        if (!savedState) {
          console.log('✅ No hay datos de caja en localStorage')
          this.boxAlreadyOpen = false
          return
        }

        // Verify with backend if localStorage has data
        console.log('📡 Verificando con backend...')
        const response = await this.$api.get(`cashier-init?user_id=${this.cashierId}`)
        console.log('📥 Estado de caja desde backend:', response.data)

        this.cashierSession = response.data
        this.boxAlreadyOpen = this.isSessionOpen(response.data)
      } catch (error) {
        this.handleCashBoxStatusError(error)
      }
    },

    /**
     * Get cash box state from localStorage
     * @returns {Object|null} Cash box state or null
     */
    getCashBoxStateFromStorage () {
      try {
        const localState = localStorage.getItem('cashbox_state')
        return localState ? JSON.parse(localState) : null
      } catch (error) {
        console.error('Error reading localStorage:', error)
        return null
      }
    },

    /**
     * Check if cashier session is open
     * @param {Object} session - Cashier session data
     * @returns {boolean} True if session is open
     */
    isSessionOpen (session) {
      return session &&
             session.status === 'open' &&
             !session.close_date
    },

    /**
     * Handle errors when checking cash box status
     * @param {Error} error - The error object
     */
    handleCashBoxStatusError (error) {
      // 404 is expected when no active session exists
      if (error.response?.status === 404) {
        console.log('✅ No hay sesión activa (404 - esperado)')
        this.boxAlreadyOpen = false
      } else {
        console.error('Error verificando estado de caja:', error)
        this.boxAlreadyOpen = false
      }
    },

    // ------------------------------------------
    // Form Submission Handlers
    // ------------------------------------------

    /**
     * Handle opening an existing cash box
     */
    async handleOpenBox () {
      if (!this.validateOpenBoxForm()) return

      this.isSubmitting = true

      try {
        const payload = {
          cashbox_id: this.selectedBox.id,
          user_id: this.cashierId,
          init_balance: parseFloat(this.initialAmount),
          init_date: new Date().toISOString().split('T')[0],
          status: 'open'
        }

        console.log('📡 POST /cashier-open', payload)
        const response = await this.$api.post('cashier-open', payload)
        console.log('📥 Response:', response.data)

        this.showSuccessNotification(`Caja "${this.selectedBox.name}" abierta con éxito`, `Monto inicial: $${this.initialAmount}`)

        this.$emit('box-opened', {
          cashboxId: this.selectedBox.id,
          initialBalance: this.initialAmount,
          boxName: this.selectedBox.name
        })

        this.closeDialog()
      } catch (error) {
        this.handleApiError(error, 'Error al abrir caja')
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * Handle creating and opening a new cash box
     */
    async handleCreateAndOpenBox () {
      if (!this.validateNewBoxForm()) return

      this.isSubmitting = true

      try {
        const payload = {
          name: this.newBoxName.trim(),
          status: 'active',
          branch_office_id: this.branchOffice.id
        }

        console.log('📡 POST /cashboxes', payload)
        const response = await this.$api.post('cashboxes', payload)
        console.log('📥 Response:', response.data)

        this.showSuccessNotification(`Caja "${this.newBoxName}" creada con éxito`, 'Ahora puedes proceder a abrirla')

        this.$emit('box-created', response.data)

        // Wait a moment for parent to update available boxes, then reinitialize
        await this.$nextTick()
        setTimeout(() => {
          this.initializeDialog()
        }, 100)
      } catch (error) {
        this.handleApiError(error, 'Error al crear caja', 'Verifica que el nombre no esté duplicado')
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * Handle closing the current cash box
     */
    async handleCloseBox () {
      const confirmed = await this.confirmCloseBox()
      if (!confirmed) return

      const endBalance = await this.promptForEndBalance()
      if (endBalance === null) return

      this.isSubmitting = true

      try {
        // Get current session to ensure we have the correct ID
        const sessionResponse = await this.$api.get(`cashier-init?user_id=${this.cashierId}`)
        const cashierSession = sessionResponse.data

        if (!this.isSessionOpen(cashierSession)) {
          throw new Error('No se encontró una sesión de caja abierta para cerrar')
        }

        const payload = { end_balance: parseFloat(endBalance) }

        console.log(`📡 PUT /cashier-close/${cashierSession.id}`, payload)
        const response = await this.$api.put(`cashier-close/${cashierSession.id}`, payload)
        console.log('📥 Response:', response.data)

        this.showSuccessNotification('La caja ha sido cerrada con éxito', `Saldo final: $${endBalance}`)

        this.$emit('box-closed', {
          cashboxId: cashierSession.cashbox_id,
          endBalance: parseFloat(endBalance),
          sessionId: cashierSession.id
        })

        this.closeDialog()
      } catch (error) {
        this.handleApiError(error, 'Error al cerrar caja')
      } finally {
        this.isSubmitting = false
      }
    },

    // ------------------------------------------
    // Validation Methods
    // ------------------------------------------

    /**
     * Validate open box form
     * @returns {boolean} True if valid
     */
    validateOpenBoxForm () {
      if (!this.selectedBox?.id) {
        this.showErrorNotification('Debes seleccionar una caja válida')
        return false
      }

      if (this.initialAmount === null || this.initialAmount === '' || this.initialAmount < 0) {
        this.showErrorNotification('El monto inicial debe ser mayor o igual a cero')
        return false
      }

      return true
    },

    /**
     * Validate new box form
     * @returns {boolean} True if valid
     */
    validateNewBoxForm () {
      if (!this.newBoxName?.trim()) {
        this.showErrorNotification('El nombre de la caja es requerido')
        return false
      }

      return true
    },

    // ------------------------------------------
    // Dialog Interaction Methods
    // ------------------------------------------

    /**
     * Show confirmation dialog for closing cash box
     * @returns {Promise<boolean>} True if confirmed
     */
    confirmCloseBox () {
      return new Promise((resolve) => {
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
        }).onOk(() => resolve(true))
          .onCancel(() => resolve(false))
      })
    },

    /**
     * Prompt user for end balance when closing cash box
     * @returns {Promise<number|null>} End balance or null if cancelled
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
          if (isNaN(numericBalance) || numericBalance < 0) {
            this.showErrorNotification('Debes ingresar un valor numérico válido mayor o igual a cero')
            resolve(null)
          } else {
            resolve(numericBalance)
          }
        }).onCancel(() => resolve(null))
      })
    },

    // ------------------------------------------
    // Utility Methods
    // ------------------------------------------

    /**
     * Close the dialog
     */
    closeDialog () {
      this.$emit('update:modelValue', false)
    },

    /**
     * Show success notification
     * @param {string} message - Main message
     * @param {string} caption - Optional caption
     */
    showSuccessNotification (message, caption = '') {
      Notify.create({
        type: 'positive',
        message,
        caption
      })
    },

    /**
     * Show error notification
     * @param {string} message - Error message
     */
    showErrorNotification (message) {
      Notify.create({
        type: 'negative',
        message
      })
    },

    /**
     * Handle API errors and show appropriate notifications
     * @param {Error} error - The error object
     * @param {string} defaultMessage - Default error message
     * @param {string} caption - Optional caption
     */
    handleApiError (error, defaultMessage, caption = 'Intenta nuevamente') {
      console.error(defaultMessage, error)

      const message = error.response?.data?.message ||
                     error.message ||
                     defaultMessage

      Notify.create({
        type: 'negative',
        message,
        caption
      })
    }
  }
}
</script>
