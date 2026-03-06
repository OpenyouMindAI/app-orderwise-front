<template>
  <div class="catalog-view">
    <!-- Search & Filters Sticky -->
    <div class="sticky-filter-container">
      <div class="filter-wrapper q-mx-auto">
        <q-input
          v-model="searchQuery"
          outlined rounded dense
          label="Buscar productos..."
          type="search"
          debounce="500"
          class="full-width q-pa-sm search-input"
        >
          <template v-slot:prepend><q-icon name="search" color="grey-6" /></template>
        </q-input>

        <div class="category-scroll" v-show="orderedCategories.length">
          <div
            v-for="cat in orderedCategories"
            :key="cat.id"
            class="category-chip"
            v-ripple
            :class="{ 'category-chip--active': selectedCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="full-width q-pa-md">
      <div
        v-if="searchQuery && visibleCategories.length === 0 && isFullyLoaded"
        class="empty-state text-center q-pa-xl"
      >
        <q-icon name="search_off" size="48px" color="grey-4" />
        <div class="empty-state-title q-mt-md">Sin resultados</div>
      </div>

      <template v-else>
        <!-- Iteramos categorías (Visual) -->
        <div
          v-for="cat in categoriesWithState"
          :key="cat.id"
          :id="'category-' + cat.id"
          class="category-section q-mb-lg"
          :class="{ 'category-section--hidden': isCategoryEmpty(cat) }"
        >
          <div class="category-title q-pa-sm q-mb-sm">{{ cat.name }}</div>

          <div class="category-content">
            <!--
              Lógica de Bloques:
              Iteramos sobre el skeletonCount (conteo total de la API).
              Cada 50 slots, insertamos un "Activador" (sentinel).
            -->
            <div class="row q-col-gutter-y-md">
              <template v-for="index in cat.skeletonCount" :key="'prod-slot-' + cat.id + '-' + index">

                <div
                  class="col-12"
                  :ref="el => registerBlockRef(el, getBlockId(cat.id, index))"
                >
                  <Transition name="cat-fade" mode="out-in">
                    <!-- Si el producto para este índice ya cargó, lo mostramos -->
                    <div v-if="cat.products[index - 1]">
                      <q-card
                        flat bordered
                        class="product-horizontal-card"
                        @click="$emit('open-product', cat.products[index - 1])"
                      >
                        <q-card-section horizontal class="items-center">
                          <q-card-section class="q-pa-md col">
                            <div class="product-title">{{ cat.products[index - 1].name }}</div>
                            <div class="text-content q-mt-xs ellipsis-2-lines" v-html="cat.products[index - 1].description" />
                            <div class="price-text q-mt-sm">$ {{ formatNumber(cat.products[index - 1].price) }}</div>
                          </q-card-section>
                          <q-card-section class="col-auto q-pa-md">
                            <q-img :src="cat.products[index - 1].images[0]?.url || defaultImage" class="product-image" />
                          </q-card-section>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Si no, mostramos el skeleton -->
                    <ProductSkeletonCard v-else />
                  </Transition>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useCatalogLoader } from 'src/composables/useCatalogLoader'
import { formatNumber } from 'src/const/mixins'
import ProductSkeletonCard from 'src/components/Catalog/ProductSkeletonCard.vue'
import { noProductImage as defaultImage } from 'src/const/images'

const {
  orderedCategories,
  categoriesWithState,
  isFullyLoaded,
  init,
  loadBlock,
  jumpToCategory,
  destroy
} = useCatalogLoader()
const selectedCategory = ref(null)
const searchQuery = ref('')
defineEmits(['open-product'])

// ─── Lógica de Bloques y Activadores ──────────────────────────────────────────

const isJumping = ref(false)
const BLOCK_SIZE = 50
const _currentIntersecting = new Set()
let _sharedObserver = null

/**
 * Cuando dejamos de saltar, procesamos lo que quedó visible
 */
watch(isJumping, (val) => {
  if (!val) {
    _currentIntersecting.forEach(blockId => {
      loadBlock(blockId)
    })
    _currentIntersecting.clear()
  }
})

function getBlockId (catId, localIndex) {
  const offset = _getCategoryOffset(catId)
  const globalIndex = offset + (localIndex - 1)
  return Math.floor(globalIndex / BLOCK_SIZE)
}

function getObserver () {
  if (!_sharedObserver) {
    _sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const blockId = parseInt(entry.target.dataset.blockId)
        if (entry.isIntersecting) {
          _currentIntersecting.add(blockId)
          if (!isJumping.value) {
            loadBlock(blockId)
          }
        } else {
          _currentIntersecting.delete(blockId)
        }
      })
    }, { rootMargin: '600px 0px' })
  }
  return _sharedObserver
}

function registerBlockRef (el, blockId) {
  if (!el) return
  // Si el bloque ya cargó, no necesitamos observar nada
  // Pero lo dejamos observar por si acaso el cache se limpia o para simplicidad,
  // el loader.loadBlock ya tiene sus propios guards.
  el.dataset.blockId = blockId
  getObserver().observe(el)
}

// Helper para obtener el offset de la categoría (calculado en init)
function _getCategoryOffset (catId) {
  let offset = 0
  for (const cat of orderedCategories.value) {
    if (cat.id === catId) return offset
    offset += (cat.product_count ?? 5)
  }
  return offset
}

// ─── Métodos de Navegación ────────────────────────────────────────────────────

function initLoader (categories, companyId, branchOfficeId) {
  init(categories, companyId, branchOfficeId)
}
defineExpose({ initLoader })

const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  isJumping.value = true

  // Cargar el bloque que contiene esta categoría inmediatamente
  await jumpToCategory(categoryId)

  await nextTick()
  const el = document.getElementById(`category-${categoryId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Después de que termine el scroll (aprox 1s), permitimos triggers de nuevo
  setTimeout(() => {
    isJumping.value = false
    if (selectedCategory.value === categoryId) {
      selectedCategory.value = null
    }
  }, 1000)
}

const filteredProducts = (cat) => {
  if (!searchQuery.value) return cat.products
  const q = searchQuery.value.toLowerCase()
  return cat.products.filter(p => p.name.toLowerCase().includes(q))
}

const visibleCategories = computed(() =>
  categoriesWithState.value.filter(cat =>
    !searchQuery.value || filteredProducts(cat).length > 0
  )
)

const isCategoryEmpty = (cat) =>
  searchQuery.value && filteredProducts(cat).length === 0

onBeforeUnmount(() => {
  if (_sharedObserver) {
    _sharedObserver.disconnect()
    _sharedObserver = null
  }
  destroy()
})
</script>

<style scoped>
.sticky-filter-container {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.category-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px;
  scrollbar-width: none;
}
.category-chip {
  padding: 6px 16px;
  border-radius: 20px;
  background: #f0f2f5;
  white-space: nowrap;
  cursor: pointer;
  font-size: 0.9rem;
}
.category-chip--active {
  background: var(--q-primary);
  color: #fff;
}
.category-section {
  scroll-margin-top: 130px; /* Offset para que no quede bajo el sticky header */
}
.category-section--hidden {
  display: none;
}
.category-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  padding-left: 12px;
  border-left: 4px solid var(--q-primary);
}
.product-horizontal-card {
  border-radius: 12px;
  cursor: pointer;
}
.product-title { font-weight: 600; font-size: 1rem; }
.text-content { font-size: 0.85rem; color: #718096; }
.price-text { font-weight: 700; color: var(--q-primary); }
.product-image { width: 80px; height: 80px; border-radius: 8px; }

/* Activador invisible */
.block-activator {
  height: 0px;
  width: 0px;
  visibility: hidden;
  position: absolute;
}

/* Transiciones */
.cat-fade-enter-active, .cat-fade-leave-active { transition: opacity 0.3s ease; }
.cat-fade-enter-from, .cat-fade-leave-to { opacity: 0; }
</style>
