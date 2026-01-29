import { ref, computed } from 'vue'
import { authentication } from 'src/stores/module-authentication'

export function useDemoPersuasion () {
  const store = authentication()
  const showDemoModal = ref(false)

  // Determinar si el usuario está en modo demo leyendo el store
  const isDemo = computed(() => store.isDemoGetter)

  /**
   * Registra una acción demo y decide si mostrar el modal.
   * Lógica:
   * - Mostrar la primera vez (contador = 1).
   * - Luego mostrar cada 5 acciones adicionales (contador = 6, 11, 16...).
   */
  const trackDemoAction = () => {
    if (!isDemo.value) return

    // Obtener y actualizar contador persistente
    const currentCounter = parseInt(localStorage.getItem('demo_actions_counter') || '0')
    const nextCounter = currentCounter + 1
    localStorage.setItem('demo_actions_counter', nextCounter.toString())

    // Lógica para mostrar el modal: primera vez y cada 5 acciones
    if (nextCounter === 1 || (nextCounter > 1 && (nextCounter - 1) % 5 === 0)) {
      showDemoModal.value = true
    }
  }

  return {
    showDemoModal,
    isDemo,
    trackDemoAction
  }
}
