import { defineStore } from 'pinia'
import { useTourStore } from './tourStore'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'purple', // Tema por defecto
    showThemeSelector: false, // No mostrar por defecto
    themes: {
      purple: {
        name: 'Púrpura Moderno',
        primary: '#667eea',
        primaryDark: '#764ba2',
        primaryLight: 'rgba(102, 126, 234, 0.1)',
        primaryMedium: 'rgba(102, 126, 234, 0.5)',
        secondary: '#764ba2',
        secondaryLight: 'rgba(118, 75, 162, 0.1)',
        secondaryDark: '#6d28d9',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        orbGradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        orbGradient2: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        orbGradient3: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      ocean: {
        name: 'Océano Profundo',
        primary: '#0ea5e9',
        primaryDark: '#0284c7',
        primaryLight: 'rgba(14, 165, 233, 0.1)',
        primaryMedium: 'rgba(14, 165, 233, 0.5)',
        secondary: '#06b6d4',
        secondaryLight: 'rgba(6, 182, 212, 0.1)',
        secondaryDark: '#0891b2',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        orbGradient1: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        orbGradient2: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        orbGradient3: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
      },
      sunset: {
        name: 'Atardecer Cálido',
        primary: '#f97316',
        primaryDark: '#ea580c',
        primaryLight: 'rgba(249, 115, 22, 0.1)',
        primaryMedium: 'rgba(249, 115, 22, 0.5)',
        secondary: '#fb923c',
        secondaryLight: 'rgba(251, 146, 60, 0.1)',
        secondaryDark: '#ea580c',
        gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        orbGradient1: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        orbGradient2: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
        orbGradient3: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      },
      forest: {
        name: 'Bosque Esmeralda',
        primary: '#10b981',
        primaryDark: '#059669',
        primaryLight: 'rgba(16, 185, 129, 0.1)',
        primaryMedium: 'rgba(16, 185, 129, 0.5)',
        secondary: '#34d399',
        secondaryLight: 'rgba(52, 211, 153, 0.1)',
        secondaryDark: '#059669',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        orbGradient1: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        orbGradient2: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        orbGradient3: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)'
      },
      rose: {
        name: 'Rosa Elegante',
        primary: '#ec4899',
        primaryDark: '#db2777',
        primaryLight: 'rgba(236, 72, 153, 0.1)',
        primaryMedium: 'rgba(236, 72, 153, 0.5)',
        secondary: '#f472b6',
        secondaryLight: 'rgba(244, 114, 182, 0.1)',
        secondaryDark: '#db2777',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        orbGradient1: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        orbGradient2: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        orbGradient3: 'linear-gradient(135deg, #fda4af 0%, #fb7185 100%)'
      },
      indigo: {
        name: 'Índigo Nocturno',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        primaryLight: 'rgba(99, 102, 241, 0.1)',
        primaryMedium: 'rgba(99, 102, 241, 0.5)',
        secondary: '#818cf8',
        secondaryLight: 'rgba(129, 140, 248, 0.1)',
        secondaryDark: '#4f46e5',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        orbGradient1: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        orbGradient2: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        orbGradient3: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)'
      },
      amber: {
        name: 'Ámbar Dorado',
        primary: '#f59e0b',
        primaryDark: '#d97706',
        primaryLight: 'rgba(245, 158, 11, 0.1)',
        primaryMedium: 'rgba(245, 158, 11, 0.5)',
        secondary: '#fbbf24',
        secondaryLight: 'rgba(251, 191, 36, 0.1)',
        secondaryDark: '#d97706',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        orbGradient1: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        orbGradient2: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        orbGradient3: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)'
      },
      teal: {
        name: 'Turquesa Tropical',
        primary: '#14b8a6',
        primaryDark: '#0d9488',
        primaryLight: 'rgba(20, 184, 166, 0.1)',
        primaryMedium: 'rgba(20, 184, 166, 0.5)',
        secondary: '#2dd4bf',
        secondaryLight: 'rgba(45, 212, 191, 0.1)',
        secondaryDark: '#0d9488',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
        orbGradient1: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
        orbGradient2: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
        orbGradient3: 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)'
      },
      crimson: {
        name: 'Carmesí Intenso',
        primary: '#dc2626',
        primaryDark: '#b91c1c',
        primaryLight: 'rgba(220, 38, 38, 0.1)',
        primaryMedium: 'rgba(220, 38, 38, 0.5)',
        secondary: '#ef4444',
        secondaryLight: 'rgba(239, 68, 68, 0.1)',
        secondaryDark: '#b91c1c',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        orbGradient1: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        orbGradient2: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        orbGradient3: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
      },
      slate: {
        name: 'Pizarra Profesional',
        primary: '#475569',
        primaryDark: '#334155',
        primaryLight: 'rgba(71, 85, 105, 0.1)',
        primaryMedium: 'rgba(71, 85, 105, 0.5)',
        secondary: '#64748b',
        secondaryLight: 'rgba(100, 116, 139, 0.1)',
        secondaryDark: '#334155',
        gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
        orbGradient1: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
        orbGradient2: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
        orbGradient3: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
      }
    }
  }),

  getters: {
    theme: (state) => state.themes[state.currentTheme],
    allThemes: (state) => state.themes
  },

  actions: {
    initTheme () {
      // Cargar tema desde localStorage
      const savedTheme = localStorage.getItem('app-theme')
      const showSelector = localStorage.getItem('show-theme-selector')

      // Usar tourStore en lugar de localStorage
      const tourStore = useTourStore()
      tourStore.initFromLocalStorage()

      // Si hay un tema guardado, usarlo
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme
        this.showThemeSelector = false
      } else {
        this.currentTheme = 'purple'
        // Solo mostrar si no se ha cerrado antes Y no hay tour activo/por iniciar
        if ((showSelector === null || showSelector === 'true') && !tourStore.isTourActiveOrPending) {
          this.showThemeSelector = true
        } else if (tourStore.isTourActiveOrPending) {
          tourStore.setPendingModal('themeSelector', true)
        }
      }

      // Si el usuario cerró el modal, respetarlo
      if (showSelector === 'false') {
        this.showThemeSelector = false
      }

      this.applyTheme()
    },

    setTheme (themeName) {
      if (this.themes[themeName]) {
        this.currentTheme = themeName

        // Guardar en localStorage
        try {
          localStorage.setItem('app-theme', themeName)
        } catch (error) {
          console.error('❌ Error al guardar en localStorage:', error)
        }

        this.applyTheme()
      } else {
        console.error('❌ Tema no encontrado:', themeName)
      }
    },

    applyTheme () {
      const theme = this.theme
      const root = document.documentElement

      // Aplicar variables CSS
      root.style.setProperty('--primary', theme.primary)
      root.style.setProperty('--primary-dark', theme.primaryDark)
      root.style.setProperty('--primary-light', theme.primaryLight)
      root.style.setProperty('--primary-medium', theme.primaryMedium)
      root.style.setProperty('--secondary', theme.secondary)
      root.style.setProperty('--secondary-light', theme.secondaryLight)
      root.style.setProperty('--secondary-dark', theme.secondaryDark)
      root.style.setProperty('--primary-gradient', theme.gradient)

      // Aplicar colores de Quasar usando colors.setBrand
      if (window.Quasar && window.Quasar.colors) {
        window.Quasar.colors.setBrand('primary', theme.primary)
        window.Quasar.colors.setBrand('secondary', theme.secondary)
      }

      // También actualizar las variables SCSS de Quasar dinámicamente
      root.style.setProperty('--q-primary', theme.primary)
      root.style.setProperty('--q-secondary', theme.secondary)

      // Forzar actualización del DOM
      setTimeout(() => {
        const event = new Event('theme-changed')
        window.dispatchEvent(event)
      }, 100)
    },

    hideThemeSelector () {
      this.showThemeSelector = false
      localStorage.setItem('show-theme-selector', 'false')
      // Asegurar que el tema actual esté guardado
      localStorage.setItem('app-theme', this.currentTheme)
    },

    showThemeSelectorModal () {
      this.showThemeSelector = true
    }
  }
})
