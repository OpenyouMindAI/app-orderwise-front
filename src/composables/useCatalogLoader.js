/**
 * useCatalogLoader - Lógica de Activadores por Bloques de 50
 *
 * En lugar de cargar por categoría, dividimos todo el catálogo en bloques
 * virtuales de 50 productos (basados en el product_count de cada categoría).
 *
 * Esto permite:
 *  - Carga predecible de 50 en 50 productos.
 *  - Minimizar peticiones agrupando categorías pequeñas en un solo bloque.
 *  - Manejar categorías gigantes dividiéndolas en varios bloques.
 */

import { ref, computed } from 'vue'
import { api } from 'boot/axios'

const BLOCK_SIZE = 50
const DEFAULT_SKELETON = 5

export function useCatalogLoader () {
  // ─── Estado ────────────────────────────────────────────────────────────────
  const categoryState = ref({})
  const blockState = ref({}) // blockId -> 'idle' | 'loading' | 'loaded' | 'error'
  const orderedCategories = ref([])

  let _companyId = null
  let _branchOfficeId = null
  let _totalProducts = 0

  // Mapa para saber en qué global index empieza cada categoría
  // catId -> firstGlobalIndex
  const _catOffsets = new Map()

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function _ensureCategoryState (cat) {
    if (!categoryState.value[cat.id]) {
      const apiCount = cat.product_count ?? cat.products_count
      const count = typeof apiCount === 'number' ? apiCount : DEFAULT_SKELETON
      categoryState.value[cat.id] = {
        status: 'idle',
        // Array de tamaño fijo para mantener la posición exacta
        products: new Array(count).fill(null),
        skeletonCount: count
      }
    }
  }

  /**
   * Carga un bloque específico (página de la API global)
   */
  async function loadBlock (blockId) {
    if (blockState.value[blockId] === 'loading' || blockState.value[blockId] === 'loaded') return

    blockState.value[blockId] = 'loading'

    // TEST: Retraso de 1s para ver las transiciones
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const { data } = await api.get(`public/products/${_companyId}`, {
        params: {
          stock: true,
          withStock: true,
          sortOrder: 'asc',
          sortBy: 'category.sort_order',
          page: blockId + 1,
          perPage: BLOCK_SIZE,
          paginate: true,
          branch_office_id: _branchOfficeId,
          dataEqualFilter: {
            show_catalog: 1,
            'category.show_catalog': 1
          }
        }
      })

      const products = Array.isArray(data) ? data : (data?.data ?? [])

      // Distribuir productos a sus posiciones exactas
      products.forEach((p, indexInPage) => {
        const globalIndex = (blockId * BLOCK_SIZE) + indexInPage
        const catId = p.category_id
        const state = categoryState.value[catId]
        const offset = _catOffsets.get(catId)

        if (state && offset !== undefined) {
          const localIndex = globalIndex - offset
          // Solo asignamos si el índice cae dentro de la categoría
          if (localIndex >= 0 && localIndex < state.skeletonCount) {
            state.products[localIndex] = p
            state.status = 'loaded'
          }
        }
      })

      blockState.value[blockId] = 'loaded'
    } catch (err) {
      console.error(`Error cargando bloque ${blockId}:`, err)
      blockState.value[blockId] = 'error'
    }
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  function init (categories, companyId, branchOfficeId) {
    _companyId = companyId
    _branchOfficeId = branchOfficeId ?? null

    // 1. Ordenar categorías
    orderedCategories.value = [...categories].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
    )

    // 2. Calcular offsets y total
    _totalProducts = 0
    _catOffsets.clear()
    categoryState.value = {}
    blockState.value = {}

    orderedCategories.value.forEach(cat => {
      _catOffsets.set(cat.id, _totalProducts)
      _ensureCategoryState(cat)
      _totalProducts += categoryState.value[cat.id].skeletonCount
    })

    // 3. Inicializar estados de bloques
    const numBlocks = Math.ceil(_totalProducts / BLOCK_SIZE)
    for (let i = 0; i < numBlocks; i++) {
      blockState.value[i] = 'idle'
    }

    // Cargar primer bloque inmediatamente
    if (numBlocks > 0) loadBlock(0)
  }

  /**
   * Navegación por chips: calcula qué bloque(s) contienen a la categoría
   */
  async function jumpToCategory (catId) {
    const offset = _catOffsets.get(catId)
    if (offset === undefined) return

    const startBlock = Math.floor(offset / BLOCK_SIZE)
    // Una categoría puede estar en varios bloques, cargamos al menos el primero
    await loadBlock(startBlock)
  }

  function destroy () {
    _companyId = null
    _branchOfficeId = null
  }

  // ─── Computed ──────────────────────────────────────────────────────────────

  const blocks = computed(() => {
    const numBlocks = Math.ceil(_totalProducts / BLOCK_SIZE)
    const result = []
    for (let i = 0; i < numBlocks; i++) {
      result.push({
        id: i,
        status: blockState.value[i] || 'idle'
      })
    }
    return result
  })

  const categoriesWithState = computed(() =>
    orderedCategories.value.map(cat => ({
      ...cat,
      ...categoryState.value[cat.id]
    }))
  )

  const isFullyLoaded = computed(() =>
    Object.values(blockState.value).every(s => s === 'loaded' || s === 'error')
  )
  return {
    orderedCategories,
    blocks,
    categoriesWithState,
    isFullyLoaded,
    init,
    loadBlock,
    jumpToCategory,
    destroy
  }
}
