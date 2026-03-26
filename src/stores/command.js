import { defineStore } from 'pinia'

export const useCommandStore = defineStore('commands', {
  state: () => {
    return {
      command: {},
      invoice: {}
    }
  },
  getters: {
    commandGetter: (state) => state.command,
    invoiceGetter: (state) => state.invoice
  },
  actions: {
    setCommands (command) {
      this.command = {
        ...this.command,
        ...command
      }
    },
    setInvoice (invoice) {
      this.invoice = {
        ...this.invoice,
        ...invoice
      }
    },
    resetCommand () {
      this.command = {}
      this.invoice = {}
    }
  },
  persist: {
    key: 'command'
  }
})
