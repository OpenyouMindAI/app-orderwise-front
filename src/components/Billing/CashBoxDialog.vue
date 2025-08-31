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
        <span class="text-h6">Turno</span>
        <q-btn flat icon="close" round size="md" v-close-popup />
      </q-card-section>

      <!-- Loading State -->
      <q-inner-loading :showing="!isReady">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>

      <!-- Content when ready -->
      <div v-if="isReady">
        <!-- State 1: Cash box already open -->
        <q-card-section v-if="boxAlreadyOpen" class="q-pt-lg">
          <q-form @submit.prevent="handleCloseBox">
            <p class="text-subtitle1 text-center q-mb-md">Ingresa el saldo final para cerrar la caja.</p>
            <q-input
              ref="endBalanceInput"
              v-model.number="endBalanceAmount"
              type="number"
              label="Monto final"
              filled
              lazy-rules
              :rules="amountValidationRules"
              prefix="$"
            />
            <q-card-actions align="right" class="q-mt-sm">
              <q-btn flat label="Cancelar" color="primary" v-close-popup :disable="isSubmitting" />
              <q-btn type="submit" label="Confirmar Cierre" color="negative" :loading="isSubmitting" />
            </q-card-actions>
          </q-form>
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
          <q-form @submit.prevent="openCashBoxSession">
            <q-select
              ref="boxSelect"
              v-model="selectedCashBox"
              :options="availableCashBoxes"
              label="Selecciona una caja"
              option-value="id"
              filled
              lazy-rules
              :rules="boxSelectionRules"
              class="q-mb-md"
              :disable="availableCashBoxes.length === 1"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon
                      :name="scope.opt.open ? 'radio_button_checked' : 'radio_button_unchecked'"
                      :color="scope.opt.open ? 'negative' : 'positive'"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ scope.opt.open ? 'Caja abierta' : 'Caja cerrada' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <div class="row items-center">
                  <q-icon
                    :name="scope.opt.open ? 'radio_button_checked' : 'radio_button_unchecked'"
                    :color="scope.opt.open ? 'negative' : 'positive'"
                    class="q-mr-sm"
                  />
                  <span>{{ scope.opt.name }}</span>
                </div>
              </template>
            </q-select>

            <q-input
              ref="amountInput"
              v-model.number="initialBalance"
              type="number"
              label="Monto inicial"
              filled
              lazy-rules
              :rules="amountValidationRules"
              prefix="$"
            />

            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="Cancelar" color="primary" v-close-popup :disable="loadingOpenBox" />
              <q-btn type="submit" label="Abrir Caja" color="primary" :loading="loadingOpenBox" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notify } from 'quasar'
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
    },
    branchOffice: {
      type: Object,
      required: true
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
      loadingOpenBox: false,
      loadingCloseBox: false,

      // Form data
      selectedCashBox: null,
      initialBalance: null,
      newBoxName: '',
      endBalanceAmount: null,

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

    // Validation rules
    nameValidationRules () {
      return [val => (!!val && val.trim().length > 0) || 'El nombre es requerido']
    },

    boxSelectionRules () {
      return [val => !!val || 'Debes seleccionar una caja']
    },

    amountValidationRules () {
      return [val => (val !== null && val !== '' && val >= 0) || 'El monto es requerido y debe ser mayor o igual a cero']
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
          this.selectedCashBox = newVal[0]
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
      this.initialBalance = null
      this.newBoxName = ''
      this.endBalanceAmount = null
      this.isReady = false
      this.boxAlreadyOpen = false
      this.cashierSession = null

      // Don't reset selectedCashBox if there's only one available
      if (this.availableCashBoxes.length !== 1) {
        this.selectedCashBox = null
      }
    },

    /**
     * Set focus on the appropriate input element
     */
    setInitialFocus () {
      this.isReady = true

      this.$nextTick(() => {
        if (this.availableCashBoxes.length === 0) {
          this.$refs.newBoxNameInput?.focus()
        } else if (this.boxAlreadyOpen) {
          this.$refs.endBalanceInput?.focus()
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
     * Check current cash box status from backend
     */
    async checkCashBoxStatus () {
      try {
        const response = await this.$api.get('cashier-init')
        this.cashierSession = response.data
        this.boxAlreadyOpen = response.data && response.data.open === true
      } catch (error) {
        this.handleCashBoxStatusError(error)
      }
    },

    /**
     * Handle errors when checking cash box status
     * @param {Error} error - The error object
     */
    handleCashBoxStatusError (error) {
      // 404 is expected when no active session exists
      if (error.response?.status === 404) {
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
     * Open cash box session with new API
     */
    async openCashBoxSession () {
      try {
        this.loadingOpenBox = true

        const payload = {
          cashbox_id: this.selectedCashBox.id,
          user_id: this.cashierId,
          init_balance: parseFloat(this.initialBalance),
          init_date: new Date().toISOString().split('T')[0], // Fecha actual YYYY-MM-DD
          init_time: new Date().toTimeString().split(' ')[0], // Hora actual HH:MM:SS
          status: 'open',
          branch_office_id: this.branchOffice.id
        }

        const response = await this.$api.post('cashier-open', payload)

        this.$q.notify({
          type: 'positive',
          message: 'Caja abierta correctamente',
          timeout: 3000
        })

        // Emit event with session data
        this.$emit('box-opened', {
          sessionId: response.data.id,
          cashboxId: this.selectedCashBox.id,
          initialBalance: this.initialBalance
        })

        this.resetForm()
        this.$emit('update:modelValue', false)
      } catch (error) {
        this.handleApiError(error, 'Error al abrir la caja')
      } finally {
        this.loadingOpenBox = false
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

        const response = await this.$api.post('cashboxes', payload)

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
      // Validate the end balance amount
      const endBalance = this.endBalanceAmount
      if (endBalance === null || endBalance === '' || endBalance < 0) {
        this.showErrorNotification('El monto final es requerido y debe ser mayor o igual a cero')
        return
      }

      this.isSubmitting = true

      try {
        // Get current session to ensure we have the correct ID
        const sessionResponse = await this.$api.get('cashier-init')
        const cashierSession = sessionResponse.data

        if (!cashierSession || !cashierSession.open) {
          throw new Error('No se encontró una sesión de caja abierta para cerrar')
        }

        const payload = { end_balance: parseFloat(endBalance) }

        await this.$api.put(`cashier-close/${cashierSession.id}`, payload)

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
      if (!this.selectedCashBox?.id) {
        this.showErrorNotification('Debes seleccionar una caja válida')
        return false
      }

      if (this.initialBalance === null || this.initialBalance === '' || this.initialBalance < 0) {
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
