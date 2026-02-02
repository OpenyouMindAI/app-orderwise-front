import { ref, computed } from 'vue'
import { authentication } from 'src/stores/module-authentication'

const showDemoModal = ref(false)

export function useDemoPersuasion () {
  const store = authentication()

  const isDemo = computed(() => store.isDemoGetter)

  /**
   * Registra una acción demo con lógica en dos fases:
   *
   * PRIMERA FASE (contador >= 0):
   * - Acciones normales: +1 punto
   * - Acciones importantes: +5 puntos
   * - Al llegar a 5 puntos: muestra modal y contador pasa a -5
   *
   * SEGUNDA FASE (contador < 0):
   * - El contador negativo indica que ya se mostró el primer modal
   * - Acciones normales: +1 punto (desde -5 hacia 0)
   * - Acciones importantes: +5 puntos
   * - Al llegar a 0 o más: muestra modal y reinicia a -5
   *
   * @param {boolean} isImportant - Si es una acción importante
   */
  const trackDemoAction = (isImportant = false) => {
    if (!isDemo.value) return

    const oldCounter = parseInt(localStorage.getItem('demo_actions_counter') || '0')
    const increment = isImportant ? 5 : 1
    let counter = oldCounter + increment

    // Lógica por fases
    if (oldCounter >= 0) {
      // PRIMERA FASE: Usuario nuevo (0 a 4 puntos)
      if (counter >= 5) {
        // Alcanzó el umbral: mostrar modal y pasar a segunda fase
        showDemoModal.value = true
        counter = -5 // Marca que ya pasó la primera fase
      }
    } else {
      // SEGUNDA FASE: Ya mostró primer modal (contador inicia en -5)
      if (counter >= 0) {
        // Llegó a 0 o más: mostrar modal y reiniciar fase 2
        showDemoModal.value = true
        counter = -5
      }
    }

    localStorage.setItem('demo_actions_counter', counter.toString())
  }

  /**
   * Reinicia el tracking (útil para testing)
   */
  const resetDemoTracking = () => {
    localStorage.removeItem('demo_actions_counter')
    showDemoModal.value = false
  }

  return {
    showDemoModal,
    isDemo,
    trackDemoAction,
    resetDemoTracking
  }
}
