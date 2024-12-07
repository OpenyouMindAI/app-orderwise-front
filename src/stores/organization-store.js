import { defineStore } from 'pinia'

export const useOrganizationStore = defineStore('Organization', {
  state: () => ({
    /**
     * General basic
     * @type {Object}
     */
    generalBasic: {}
  }),

  getters: {
    /**
     * Get general basic
     * @returns {Object}
     */
    generateBasicGetter (state) {
      return state.generalBasic
    }
  },

  actions: {
    /**
     * Set general basic
     * @param {Object} data
     */
    setGeneralBasic (data) {
      this.generalBasic = data
    }
  },
  persist: true
})
