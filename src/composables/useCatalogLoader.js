/**
 * useCatalogLoader
 *
 * Carga bajo demanda de productos por categoría.
 *
 * Estrategia:
 *  - La primera categoría se carga de inmediato al inicializar.
 *  - El resto se carga SOLO cuando el usuario llega a esa sección
 *    (via IntersectionObserver en CatalogView) o cuando hace click
 *    en una categoría del menú (jumpToCategory).
 *  - Nunca se pre-cargan categorías que el usuario no ha visitado.
 *  - Tamaño de página: 50 productos por categoría.
 */

import { ref, computed } from 'vue'
import { api } from 'boot/axios'

const PAGE_SIZE = 50 // productos a mostrar por categoría
const DEFAULT_SKELETON = 5 // skeletons si product_count no está disponible

export function useCatalogLoader () {
  // ─── Estado reactivo ────────────────────────────────────────────────────────

  /**
   * Mapa categoríaId → { status, products, error, skeletonCount }
   * status: 'idle' | 'loading' | 'loaded' | 'error'
   */
  const categoryState = ref({})

  /** Lista de categorías ordenada por `order` */
  const orderedCategories = ref([])

  /** Parámetros de la empresa para cada fetch */
  let _companyId = null
  let _branchOfficeId = null

  // ─── Helpers internos ───────────────────────────────────────────────────────

  /** Inicializa el estado de una categoría si no existe aún */
  function _ensureState (cat) {
    if (!categoryState.value[cat.id]) {
      const count = cat.product_count
        ? Math.min(cat.product_count, PAGE_SIZE)
        : DEFAULT_SKELETON
      categoryState.value[cat.id] = {
        status: 'idle',
        products: [],
        error: null,
        skeletonCount: count
      }
    }
    return categoryState.value[cat.id]
  }

  /** Fetch real de productos para una categoría */
  async function _fetchCategory (catId) {
    const { data } = await api.get(`public/products/${_companyId}`, {
      params: {
        stock: true,
        withStock: true,
        sortOrder: 'desc',
        sortBy: 'sold',
        branch_office_id: _branchOfficeId,
        dataEqualFilter: {
          show_catalog: 1,
          'category.show_catalog': 1,
          category_id: catId
        }
      }
    })
    const raw = Array.isArray(data) ? data : (data?.data ?? [])
    return raw.slice(0, PAGE_SIZE)
  }

  // ─── API pública ─────────────────────────────────────────────────────────────

  /**
   * Carga una categoría si no está ya cargada o en progreso.
   * Es idempotente: llamarla múltiples veces es seguro.
   */
  async function loadCategory (catId) {
    const state = categoryState.value[catId]
    if (!state || state.status === 'loading' || state.status === 'loaded') return

    state.status = 'loading'
    state.error = null
    try {
      state.products = await _fetchCategory(catId)
      state.status = 'loaded'
    } catch (err) {
      state.status = 'error'
      state.error = err?.message ?? 'Error desconocido'
    }
  }

  /**
   * Inicializa el loader con las categorías y parámetros de empresa.
   * Solo carga la PRIMERA categoría de inmediato.
   * El resto queda en 'idle' hasta que el IntersectionObserver los active.
   */
  function init (categories, companyId, branchOfficeId) {
    _companyId = companyId
    _branchOfficeId = branchOfficeId ?? null

    // Ordenar por order y guardar referencia
    orderedCategories.value = [...categories].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )

    // Inicializar estado de todas las categorías (idle + skeletons)
    orderedCategories.value.forEach(cat => _ensureState(cat))

    // Cargar solo la primera categoría de forma inmediata
    if (orderedCategories.value.length > 0) {
      loadCategory(orderedCategories.value[0].id)
    }
  }

  /**
   * Navegación directa a una categoría (click en el menú).
   * Carga inmediata de esa categoría; el resto sigue bajo demanda.
   */
  async function jumpToCategory (targetCategoryId) {
    await loadCategory(targetCategoryId)
  }

  /**
   * Reintentar la carga de una categoría que falló.
   */
  async function retry (categoryId) {
    const state = categoryState.value[categoryId]
    if (!state || state.status !== 'error') return
    state.status = 'idle'
    await loadCategory(categoryId)
  }

  /**
   * Liberar recursos (llamar en onBeforeUnmount).
   */
  function destroy () {
    // El IntersectionObserver se limpia en CatalogView; aquí solo
    // reseteamos las referencias internas.
    _companyId = null
    _branchOfficeId = null
  }

  // ─── Computed de conveniencia ────────────────────────────────────────────────

  /** Categorías enriquecidas con estado de carga, listas para el template */
  const categoriesWithState = computed(() =>
    orderedCategories.value.map(cat => {
      const state = categoryState.value[cat.id] ?? {
        status: 'idle',
        products: [],
        error: null,
        skeletonCount: DEFAULT_SKELETON
      }
      return {
        ...cat,
        status: state.status,
        products: state.products,
        error: state.error,
        skeletonCount: state.skeletonCount
      }
    })
  )

  /** true cuando todas las categorías terminaron de cargar (o fallaron) */
  const isFullyLoaded = computed(() =>
    orderedCategories.value.length > 0 &&
    orderedCategories.value.every(cat => {
      const s = categoryState.value[cat.id]
      return s?.status === 'loaded' || s?.status === 'error'
    })
  )

  return {
    categoryState,
    orderedCategories,
    categoriesWithState,
    isFullyLoaded,
    init,
    loadCategory,
    jumpToCategory,
    retry,
    destroy
  }
}
