import { defineStore } from 'pinia'

export const useCommandStore = defineStore('commands', {
  state: () => {
    return {
      command: {}
    }
  },
  getters: {
    commandGetter: (state) => state.command
  },
  actions: {
    setCommands (command) {
      this.command = {
        ...this.command,
        ...command
      }
    }
  },
  persist: {
    key: 'command'
  }
})
