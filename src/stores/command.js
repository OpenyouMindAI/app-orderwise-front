import { defineStore } from 'pinia'

export const useCommandStore = defineStore('commands', {
  state: () => ({
    commandsState: 0
  }),
  getters: {
    commandsGetter: (state) => state.commandsState
  },
  actions: {
    commandsAction (products) {
      this.commandsState = products
    }
  }
})
