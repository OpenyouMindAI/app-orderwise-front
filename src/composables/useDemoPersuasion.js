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
    let currentCounter = parseInt(localStorage.getItem('demo_actions_counter') || '0')
    currentCounter++

    // Lógica para mostrar el modal:
    // - Primera vez (acción 1)
    // - Cada 5 acciones adicionales (acción 6, 11, 16...)
    // Se muestra cuando (currentCounter - 1) es múltiplo de 5, o simplemente en la primera acción.
    if (currentCounter === 1 || (currentCounter > 1 && (currentCounter - 1) % 5 === 0)) {
      showDemoModal.value = true
    }

    localStorage.setItem('demo_actions_counter', currentCounter.toString())
  }

  return {
    showDemoModal,
    isDemo,
    trackDemoAction
  }
}
