import { defineStore } from 'pinia'

export const darkModeStore = defineStore('counter', {
  state: () => ({
    darkMode: false
  }),
  getters: {
    darkModeGetter: (state) => state.darkMode
  },
  actions: {
    setDarkMode (darkMode) {
      this.darkMode = darkMode
    }
  },
  persist: true
})
