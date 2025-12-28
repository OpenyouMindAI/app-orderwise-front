import { defineStore } from 'pinia'

export const useTourStore = defineStore('tour', {
  state: () => ({
    // Estado del tour
    isActive: false,
    needsBillingTour: false,
    hasSeenBillingTour: false,

    // Modales que deben reabrirse después del tour
    pendingModals: {
      cashBox: false,
      themeSelector: false
    }
  }),

  getters: {
    /**
     * Verifica si el tour está activo o va a comenzar
     */
    tourWillStart: (state) => {
      return state.needsBillingTour && !state.hasSeenBillingTour
    },

    /**
     * Verifica si el tour está activo o por iniciar
     */
    isTourActiveOrPending: (state) => {
      return state.isActive || (state.needsBillingTour && !state.hasSeenBillingTour)
    }
  },

  actions: {
    /**
     * Inicializar el store desde localStorage
     */
    initFromLocalStorage () {
      this.isActive = localStorage.getItem('tour_active') === 'true'
      this.needsBillingTour = localStorage.getItem('needs_billing_tour') === 'true'
      this.hasSeenBillingTour = localStorage.getItem('has_seen_billing_tour') === 'true'
    },

    /**
     * Iniciar el tour
     */
    startTour () {
      this.isActive = true
      localStorage.setItem('tour_active', 'true')
    },

    /**
     * Finalizar el tour
     */
    finishTour () {
      this.isActive = false
      this.hasSeenBillingTour = true
      this.needsBillingTour = false

      localStorage.setItem('has_seen_billing_tour', 'true')
      localStorage.removeItem('needs_billing_tour')
      localStorage.removeItem('tour_active')

      console.log('✅ Tour finalizado')
    },

    /**
     * Marcar que se necesita el tour de facturación
     */
    setNeedsBillingTour (value) {
      this.needsBillingTour = value
      if (value) {
        localStorage.setItem('needs_billing_tour', 'true')
      } else {
        localStorage.removeItem('needs_billing_tour')
      }
    },

    /**
     * Marcar que un modal debe reabrirse después del tour
     */
    setPendingModal (modalName, shouldOpen) {
      if (Object.prototype.hasOwnProperty.call(this.pendingModals, modalName)) {
        this.pendingModals[modalName] = shouldOpen
        console.log(`📋 Modal ${modalName} marcado para ${shouldOpen ? 'abrir' : 'no abrir'} después del tour`)
      }
    },

    /**
     * Obtener y limpiar el estado de un modal pendiente
     */
    getPendingModal (modalName) {
      const shouldOpen = this.pendingModals[modalName] || false
      this.pendingModals[modalName] = false
      return shouldOpen
    },

    /**
     * Limpiar todos los modales pendientes
     */
    clearPendingModals () {
      this.pendingModals = {
        cashBox: false,
        themeSelector: false
      }
    }
  }
})
