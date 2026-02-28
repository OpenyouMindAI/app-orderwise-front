<template>
  <div class="catalog-view">
    <!-- Search & Categories -->
    <div class="sticky-filter-container">
      <div class="filter-wrapper q-mx-auto">
        <q-input
          v-model="searchQuery"
          outlined
          rounded
          label="Buscar productos..."
          dense
          type="search"
          debounce="500"
          class="full-width q-pa-sm search-input"
          aria-label="Buscar productos"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="searchQuery"
              name="close"
              class="cursor-pointer"
              color="grey-5"
              @click="searchQuery = ''"
              aria-label="Limpiar búsqueda"
            />
          </template>
        </q-input>

        <div class="category-scroll" v-show="categories.length" role="tablist" aria-label="Categorías">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-chip"
            v-ripple
            role="tab"
            :aria-selected="selectedCategory === cat.id"
            :class="{ 'category-chip--active': selectedCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>
        <q-skeleton type="text" height="52px" v-show="!categories.length" class="q-mx-sm q-mb-sm" />
      </div>
    </div>

    <!-- Products Grid -->
    <div class="full-width q-pa-md">
      <!-- Loading State -->
      <div v-show="loading" class="row q-col-gutter-sm">
        <div class="col-12" v-for="i in 8" :key="i">
          <SkeletonCard class="full-width" />
        </div>
      </div>

      <!-- Products Grouped by Category -->
      <div v-show="!loading">
        <div
          v-for="cat in groupedProducts"
          :key="cat.id"
          :id="'category-' + cat.id"
          class="category-section q-mb-lg"
        >
          <div class="category-title q-pa-sm q-mb-sm">
            {{ cat.name }}
          </div>

          <div class="row q-col-gutter-y-md">
            <div class="col-12" v-for="product in cat.products" :key="product.id">
              <q-card
                flat
                bordered
                class="product-horizontal-card"
                :class="{
                  'product-in-cart': isInCart(product.id),
                  'product-out-of-stock': !hasStock(product)
                }"
                @click="$emit('open-product', product)"
                role="button"
                :aria-label="`Ver ${product.name}`"
                tabindex="0"
                @keyup.enter="$emit('open-product', product)"
              >
                <q-card-section horizontal class="items-center">
                  <q-card-section class="q-pa-md col">
                    <div class="product-title">{{ product.name }}</div>
                    <div
                      v-if="product.description"
                      class="text-content q-mt-xs ellipsis-2-lines"
                      v-html="product.description"
                    />
                    <div class="price-text q-mt-sm">
                      $ {{ formatNumber(product.price) }}
                    </div>
                    <div v-if="isInCart(product.id)" class="in-cart-badge q-mt-xs">
                      <q-icon name="check_circle" size="14px" class="q-mr-xs" />
                      En tu pedido
                    </div>
                  </q-card-section>

                  <q-card-section class="col-auto q-pa-md">
                    <div class="relative-position product-image-wrapper">
                      <q-img
                        :src="product.images[0]?.url || defaultImage"
                        class="product-image"
                        :alt="product.name"
                        loading="lazy"
                      />
                      <div
                        v-if="!hasStock(product)"
                        class="out-of-stock-overlay flex flex-center"
                        aria-label="Producto agotado"
                      >
                        <span class="out-of-stock-text">AGOTADO</span>
                      </div>
                    </div>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="groupedProducts.length === 0 && !loading" class="empty-state text-center q-pa-xl">
          <div class="empty-state-icon-wrapper">
            <q-icon name="search_off" size="48px" color="grey-4" />
          </div>
          <div class="empty-state-title q-mt-md">Sin resultados</div>
          <div class="empty-state-subtitle q-mt-xs">
            No encontramos productos que coincidan con tu búsqueda
          </div>
          <q-btn
            v-if="searchQuery"
            flat
            rounded
            no-caps
            color="primary"
            class="q-mt-md"
            @click="searchQuery = ''"
          >
            Limpiar búsqueda
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Floating Cart Button -->
    <div class="cart-sticky-footer" v-if="cart.itemCount.value > 0">
      <q-btn
        unelevated
        rounded
        no-caps
        class="continuar-btn full-width shadow-4"
        @click="handleCartButtonClick"
      >
        <div class="row full-width justify-between items-center">
          <div class="row items-center">
            <q-badge
              color="white"
              text-color="dark"
              :label="cart.itemCount.value"
              class="q-mr-sm text-weight-bold"
            />
            <span class="text-weight-bold">Ver mi pedido</span>
          </div>
          <span class="text-weight-bold">$ {{ formatNumber(cart.total.value) }}</span>
        </div>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from 'src/stores/catalog'
import { useCart } from 'src/composables/useCart'
import { formatNumber } from 'src/const/mixins'
import { useQuasar } from 'quasar'
import SkeletonCard from 'src/components/SkeletonCard.vue'
import { noProductImage as defaultImage } from 'src/const/images'

// Props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
// Stores y composables
const catalogStore = useCatalogStore()
const cart = useCart()
const $q = useQuasar()
const { categories, products } = storeToRefs(catalogStore)

// Estado local
const searchQuery = ref('')
const selectedCategory = ref('all')

// Computed
const groupedProducts = computed(() => {
  let filtered = products.value || []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  }

  return categories.value
    .map(cat => ({
      ...cat,
      products: filtered.filter(p => p.category_id === cat.id)
    }))
    .filter(cat => cat.products.length > 0)
})

// Métodos
const isInCart = (productId) => {
  return cart.isInCart(productId)
}

const hasStock = (product) => {
  return cart.hasStock(product, 1)
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  scrollToCategory(categoryId)

  setTimeout(() => {
    if (selectedCategory.value === categoryId) {
      selectedCategory.value = null
    }
  }, 400)
}

const scrollToCategory = async (categoryId) => {
  await nextTick()
  const el = document.getElementById(`category-${categoryId}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// En desktop el carrito es siempre visible → ir directo a checkout
// En móvil/tablet → abrir la vista de carrito
const emit = defineEmits(['open-product', 'view-cart', 'checkout'])
const handleCartButtonClick = () => {
  if ($q.screen.lt.md) {
    emit('view-cart')
  } else {
    emit('checkout')
  }
}
</script>

<style scoped>
/* ===== Base ===== */
.catalog-view {
  background: #fff;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* ===== Sticky Filter ===== */
.sticky-filter-container {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background: #ffffff;
  padding: 8px 0;
  /* Transición suave */
  transition: all 0.3s ease;
}

.filter-wrapper {
  width: 100%;
  padding: 0 8px;
}

/* ===== Search Input ===== */
.search-input :deep(.q-field__control) {
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s ease;
}

.search-input :deep(.q-field__control:hover) {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-input :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px var(--q-primary), 0 2px 8px rgba(0,0,0,0.08);
}

/* ===== Category Chips ===== */
.category-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 8px 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-chip {
  flex-shrink: 0;
  padding: 7px 18px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: #ffffff;
  color: #4a5568;
  border: 1.5px solid #e2e8f0;
  transition: all 0.18s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.category-chip:hover {
  border-color: var(--q-primary);
  color: var(--q-primary);
  background: #fafafe;
}

.category-chip:active {
  transform: scale(0.93);
}

.category-chip--active {
  background: var(--q-primary) !important;
  color: #ffffff !important;
  border-color: var(--q-primary) !important;
  animation: chip-press 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chip-press {
  0%   { transform: scale(1); }
  45%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}

.category-section {
  scroll-margin-top: 130px;
  animation: fadeInUp 0.3s ease both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.category-title {
  font-weight: 700;
  font-size: 1.2rem;
  color: #1a202c;
  border-left: 4px solid var(--q-primary);
  padding-left: 12px !important;
  line-height: 1.3;
}

/* ===== Product Card ===== */
.product-horizontal-card {
  border-radius: 14px !important;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #e8ecf0 !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  overflow: hidden;
}

.product-horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.09) !important;
  border-color: #d0d9e3 !important;
}

.product-horizontal-card:focus-visible {
  outline: 2.5px solid var(--q-primary);
  outline-offset: 2px;
}

.product-in-cart {
  border:2px solid var(--q-primary) !important;
}

.product-out-of-stock {
  background: #fafafa;
  opacity: 0.82;
}

.product-out-of-stock .product-image {
  filter: grayscale(1) opacity(0.6);
}

.product-out-of-stock .product-title,
.product-out-of-stock .price-text {
  color: #a0aec0;
}

/* ===== Product Card Content ===== */
.product-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a202c;
  line-height: 1.35;
}

.text-content {
  font-size: 0.82rem;
  line-height: 1.5;
  color: #718096;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--q-primary);
}

.in-cart-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--q-positive, #21ba45);
  background: rgba(33,186,69,0.08);
  border-radius: 20px;
  padding: 2px 10px 2px 6px;
}

/* ===== Product Image ===== */
.product-image-wrapper {
  border-radius: 10px;
  overflow: hidden;
}

.product-image {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  object-fit: cover;
}

.out-of-stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.38);
  border-radius: 10px;
}

.out-of-stock-text {
  color: #ffffff;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  background: rgba(183,28,28,0.88);
  padding: 4px 8px;
  border-radius: 6px;
}

/* ===== Empty State ===== */
.empty-state {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.empty-state-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2d3748;
}

.empty-state-subtitle {
  font-size: 0.85rem;
  color: #a0aec0;
}

/* ===== Responsive ===== */
@media (max-width: 480px) {
  .product-image {
    width: 80px;
    height: 80px;
  }
}

.catalog-view {
  overflow: visible;
}

.q-page {
  overflow: visible;
}

/* ===== Floating Cart Sticky ===== */
.cart-sticky-footer {
  position: -webkit-sticky;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  width: 100%;
  pointer-events: none;
  padding: 16px;
  background: transparent;
}

.continuar-btn {
  pointer-events: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  height: 56px;
  font-size: 1rem;
  border-radius: 16px !important;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.continuar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.continuar-btn:active {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.95);
}
</style>
