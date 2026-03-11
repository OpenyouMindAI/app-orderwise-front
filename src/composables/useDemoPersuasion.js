import { ref, computed } from 'vue'
import { authentication } from 'src/stores/module-authentication'

const showDemoModal = ref(false)
const demoClickCount = ref(0)
let demoTimer = null

// Configuración
const CLICK_THRESHOLD = 10
const TIMER_DURATION = 2 * 60 * 1000 // 2 minutos

// Variable de entorno para habilitar/deshabilitar la persuasión de la demo
const ENABLE_PERSUASION = import.meta.env.VITE_ENABLE_DEMO_PERSUASION !== 'false'

export function useDemoPersuasion () {
  const store = authentication()

  const isDemo = computed(() => store.isDemoGetter && ENABLE_PERSUASION)

  /**
   * Resets and restarts the inactivity/interval timer
   * Reinicia el temporizador para evitar superposiciones
   */
  const resetTimer = () => {
    if (demoTimer) clearInterval(demoTimer)
    if (!isDemo.value) return

    demoTimer = setInterval(() => {
      triggerDemoModal('timer')
    }, TIMER_DURATION)
  }

  /**
   * Triggers the demo modal and resets counters/timers
   * Activa el modal, reinicia contador de clicks y temporizador
   * @param {string} source - Origen del trigger (debug)
   */
  const triggerDemoModal = (source = 'unknown') => {
    if (!isDemo.value) return
    // console.log(`Demo modal triggered by: ${source}`)

    showDemoModal.value = true
    demoClickCount.value = 0
    resetTimer() // Reiniciar timer para que no salte inmediatamente después
  }

  /**
   * Tracks a user action (click).
   * Triggers modal if threshold is reached.
   * Incrementa contador y verifica si llegó a 10.
   */
  const trackDemoAction = () => {
    if (!isDemo.value) return

    // Increment click count
    demoClickCount.value++

    // Check threshold
    if (demoClickCount.value >= CLICK_THRESHOLD) {
      triggerDemoModal('clicks')
    }
  }

  /**
   * Initializes the persuasion logic.
   * Should be called when the main layout mounts.
   * 1. Muestra modal inmediatamente.
   * 2. Inicia el temporizador.
   */
  const initDemoPersuasion = () => {
    if (!isDemo.value) return

    // 1. Immediate trigger on join
    triggerDemoModal('init')

    // 2. Start the timer (triggerDemoModal already calls resetTimer, but to be sure/explicit)
    // resetTimer() is called inside triggerDemoModal
  }

  /**
   * Stops the persuasion logic (e.g. on logout/unmount)
   * Limpia el temporizador.
   */
  const stopDemoPersuasion = () => {
    if (demoTimer) clearInterval(demoTimer)
    demoTimer = null
    demoClickCount.value = 0
  }

  return {
    showDemoModal,
    isDemo,
    trackDemoAction,
    initDemoPersuasion,
    stopDemoPersuasion
  }
}
