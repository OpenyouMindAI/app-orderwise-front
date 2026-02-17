<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <q-page class="catalog-page">

        <!-- Tabs Navigation (Hidden - Navigation is programmatic) -->
        <q-tabs
          v-model="currentTab"
          style="display: none"
        >
          <q-tab name="menu" />
          <q-tab name="cart" />
          <q-tab name="checkout" />
          <q-tab name="orders" />
        </q-tabs>

        <!-- Tab Panels -->
        <q-tab-panels
          v-model="currentTab"
          animated
          transition-prev="slide-right"
          transition-next="slide-left"
          keep-alive
          class="catalog-panels"
        >
          <!-- Tab 1: Catálogo -->
          <q-tab-panel name="menu" class="q-pa-none">
            <CatalogView
              :loading="loadingPage"
              @open-product="openProductDetail"
            />
          </q-tab-panel>

          <!-- Tab 2: Carrito -->
          <q-tab-panel name="cart" class="q-pa-none">
            <CartView
              @checkout="goToCheckout"
              @back-to-catalog="currentTab = 'menu'"
            />
          </q-tab-panel>

          <!-- Tab 3: Checkout -->
          <q-tab-panel name="checkout" class="q-pa-none">
            <CheckoutView
              @success="handleCheckoutSuccess"
              @cancel="currentTab = 'cart'"
            />
          </q-tab-panel>

          <!-- Tab 4: Órdenes -->
          <q-tab-panel name="orders" class="q-pa-none">
            <OrdersView />
          </q-tab-panel>
        </q-tab-panels>

        <!-- Floating Action Button (solo en tab catálogo con productos en carrito) -->
        <!-- Floating Bottom Button (similar to ProductDetailDialog / CartView) -->
        <q-page-sticky
          v-if="currentTab === 'menu' && cart.total.value > 0"
          position="bottom"
          :offset="[0, 0]"
          class="floating-cart-container"
        >
          <div class="floating-cart-footer">
            <q-btn
              unelevated
              rounded
              no-caps
              class="continuar-btn full-width shadow-4"
              @click="currentTab = 'cart'"
            >
              <div class="row full-width justify-between items-center q-px-sm">
                <div class="row items-center">
                  <q-badge
                    color="white"
                    text-color="dark"
                    :label="cart.itemCount.value"
                    class="q-mr-sm text-weight-bold"
                    style="padding: 4px 8px"
                  />
                  <span class="text-weight-bold">Ver mi pedido</span>
                </div>
                <span class="text-weight-bold">$ {{ formatNumber(cart.total.value) }}</span>
              </div>
            </q-btn>
          </div>
        </q-page-sticky>

        <!-- Schedule Status (solo en tab catálogo) -->
        <q-page-sticky
          v-if="currentTab === 'menu'"
          position="bottom-right"
          :offset="[15, 10]"
        >
          <ScheduleStatus
            :schedule="company?.company_config?.other?.menu?.schedule"
            @update:isCurrentlyOpen="(val) => isCurrentlyOpen = val"
          />
        </q-page-sticky>

        <!-- ÚNICO MODAL: Product Detail -->
        <ProductDetailDialog
          v-model="showProductDetail"
          :product="selectedProduct"
          @add-to-cart="handleAddToCart"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from 'src/stores/catalog'
import { authentication } from 'src/stores/module-authentication'
import { useCart } from 'src/composables/useCart'
import { formatNumber, notify } from 'src/const/mixins'
import { Notify } from 'quasar'

// Components
import CatalogView from 'src/components/Catalog/CatalogView.vue'
import CartView from 'src/components/Catalog/CartView.vue'
import CheckoutView from 'src/components/Catalog/CheckoutView.vue'
import OrdersView from 'src/components/Catalog/OrdersView.vue'
import ProductDetailDialog from 'src/components/Product/ProductDetailDialog.vue'
import ScheduleStatus from 'src/components/Command/ScheduleStatus.vue'

// Router
const route = useRoute()
const router = useRouter()

// Stores
const catalogStore = useCatalogStore()
const authStore = authentication()
const cart = useCart()

const { company } = storeToRefs(catalogStore)
const { userSession } = storeToRefs(authStore)

// State
const currentTab = ref(route.query.tab || 'menu')
const showProductDetail = ref(false)
const selectedProduct = ref(null)
const loadingPage = ref(false)
const isCurrentlyOpen = ref(false)
let savedScrollPosition = 0
let scrollContainerEl = null

// Find the real scrollable container (Quasar panels use .q-panel)
const findScrollContainer = () => {
  const panel = document.querySelector('.q-tab-panels .q-panel.scroll')
  if (panel && panel.scrollHeight > panel.clientHeight) return panel
  return document.scrollingElement || document.documentElement
}

// Computed
const isAuthenticated = computed(() => !!userSession.value)

// Watch tab changes and sync with URL
watch(currentTab, (newTab) => {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      tab: newTab
    }
  })
})

// Watch route changes (for back button)
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== currentTab.value) {
    currentTab.value = newTab
  }
})

// Watch product detail dialog to restore scroll position
watch(showProductDetail, (isOpen) => {
  if (!isOpen && scrollContainerEl) {
    // Modal closed - restore scroll position on the correct container
    requestAnimationFrame(() => {
      if (scrollContainerEl === document.scrollingElement || scrollContainerEl === document.documentElement) {
        window.scrollTo({ top: savedScrollPosition, behavior: 'instant' })
      } else {
        scrollContainerEl.scrollTop = savedScrollPosition
      }
    })
  }
})

// Methods
const openProductDetail = (product) => {
  // Blur any focused element to prevent scroll-on-refocus when modal closes
  if (document.activeElement) {
    document.activeElement.blur()
  }
  // Find and capture scroll position from the real scroll container
  scrollContainerEl = findScrollContainer()
  if (scrollContainerEl === document.scrollingElement || scrollContainerEl === document.documentElement) {
    savedScrollPosition = window.scrollY || window.pageYOffset
  } else {
    savedScrollPosition = scrollContainerEl.scrollTop
  }
  selectedProduct.value = { ...product }
  showProductDetail.value = true
}

const handleAddToCart = (cartProduct) => {
  const success = cart.addToCart(
    cartProduct,
    cartProduct.amount,
    cartProduct.observation
  )

  if (success) {
    Notify.create({
      position: 'top',
      message: '¡Producto añadido con éxito! ¡Listo para confirmar su orden!',
      actions: [
        {
          label: 'Ver Carrito',
          color: 'white',
          handler: () => {
            currentTab.value = 'cart'
          }
        }
      ],
      icon: 'info',
      color: 'positive',
      timeout: 3000
    })
  }
}

const goToCheckout = () => {
  if (!isAuthenticated.value) {
    currentTab.value = 'checkout'
    return
  }
  currentTab.value = 'checkout'
}

const handleCheckoutSuccess = () => {
  currentTab.value = 'orders'
}

// Init - Load catalog data
onMounted(async () => {
  try {
    loadingPage.value = true

    // Cargar datos del catálogo
    await Promise.all([
      catalogStore.fetchCompany(route.params.company_id),
      catalogStore.fetchCategories(route.params.company_id),
      catalogStore.fetchProducts(route.params.company_id, route.params.branch_office_id),
      catalogStore.fetchPaymentMethods(route.params.company_id)
    ])
  } catch (error) {
    console.error('Error loading catalog:', error)
    notify(error.message || 'Error al cargar el catálogo', 'negative', 'warning')
  } finally {
    loadingPage.value = false
  }
})
</script>

<style scoped>
.catalog-page {
  background: #f8f8f8;
  min-height: 100vh;
}

/* Tabs Navigation */
.catalog-tabs {
  position: sticky;
  top: 0;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.catalog-tabs :deep(.q-tab) {
  min-height: 52px;
}

.catalog-tabs :deep(.q-tab__label) {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Tab Panels */
.catalog-panels {
  background: transparent;
}

.catalog-panels :deep(.q-panel) {
  overflow-y: auto;
  overflow-anchor: none;
}

/* Floating Cart Button */
.floating-cart-container {
  width: 100%;
  z-index: 2000;
}

.floating-cart-footer {
  width: 100vw;
  padding: 16px 20px;
  background: transparent; /* Or a subtle gradient if needed, but transparent for "floating" look */
}

.continuar-btn {
  height: 56px;
  font-size: 17px;
  font-weight: 600;
  background: var(--text);
  color: var(--surface);
  border-radius: var(--border-radius-md);
  letter-spacing: 0.3px;
  transition: var(--transition-transform);
}

.continuar-btn:active {
  transform: translateY(2px);
}

/* Badge en tabs */
.q-tab :deep(.q-badge) {
  top: 8px;
  right: 8px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .catalog-tabs :deep(.q-tab__label) {
    font-size: 0.7rem;
  }

  .continuar-btn {
    font-size: 16px;
  }
}
</style>
