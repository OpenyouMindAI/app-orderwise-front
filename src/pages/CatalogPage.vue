<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <q-page class="catalog-page">

        <!-- Navbar con perfil de usuario -->
        <div class="catalog-navbar text-white">
          <q-toolbar class="items-center">
            <q-space />
            <div v-if="userSession" class="row items-center no-wrap">
              <q-btn
                flat
                round
                dense
                class="q-mr-sm navbar-icon-btn"
                aria-label="Ver mis pedidos"
                @click="currentTab = 'orders'"
              >
                <q-icon name="shopping_basket" size="24px" />
                <q-badge
                  v-if="orderCount > 0"
                  color="red"
                  floating
                  rounded
                  class="order-badge"
                >
                  {{ orderCount }}
                </q-badge>
              </q-btn>

              <q-btn flat round dense aria-label="Opciones de cuenta">
                <q-avatar size="40px" color="primary" text-color="white" class="user-avatar">
                  <template v-if="profilePhoto || userSession.avatar || userSession.picture || userSession.photo">
                    <q-img
                      :src="profilePhoto || userSession.avatar || userSession.picture || userSession.photo"
                      :alt="`Foto de ${userInitials}`"
                      spinner-color="white"
                      style="width:40px;height:40px;border-radius:50%"
                    >
                      <template v-slot:error>
                        <span class="absolute-full flex flex-center text-white text-weight-bold">{{ userInitials }}</span>
                      </template>
                    </q-img>
                  </template>
                  <span v-else>{{ userInitials }}</span>
                </q-avatar>
                <q-menu class="user-menu" transition-show="jump-down" transition-hide="jump-up">
                  <q-list style="min-width: 200px">
                    <q-item clickable v-close-popup @click="logout" class="user-menu-item">
                      <q-item-section avatar>
                        <q-icon name="logout" color="negative" />
                      </q-item-section>
                      <q-item-section>Cerrar sesión</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <q-btn
              v-else
              flat
              rounded
              dense
              no-caps
              color="white"
              class="login-button q-px-md"
              aria-label="Iniciar sesión"
              @click="showAuthDialog = true"
            >
              <q-icon name="person_outline" size="20px" class="q-mr-xs" />
              <span class="text-weight-bold">Iniciar Sesión</span>
            </q-btn>
          </q-toolbar>
        </div>

        <!-- Header del Negocio -->
        <div class="header-container full-width">
          <div
            class="header-banner relative-position"
            :style="{ backgroundImage: `url(${bannerUrl})` }"
            role="img"
            :aria-label="`Banner de ${company?.name}`"
          >
            <div class="banner-overlay"></div>
            <div class="header-content column items-center full-width q-pa-md">
              <q-avatar v-if="company?.url" size="110px" class="profile-avatar">
                <q-img :src="company.url" :alt="`Logo de ${company?.name}`" />
              </q-avatar>
              <div class="company-name text-center text-white text-bold text-uppercase q-mt-sm">
                {{ company?.name }}
              </div>
              <!-- Schedule Status Button -->
              <q-btn
                v-if="scheduleData"
                flat
                rounded
                no-caps
                class="schedule-status-badge q-mt-sm"
                :class="isCurrentlyOpen ? 'status-open' : 'status-closed'"
                aria-label="Ver horarios de atención"
                @click="showScheduleDialog = true"
              >
                <div class="row items-center no-wrap">
                  <span class="status-dot" :class="isCurrentlyOpen ? 'dot-open' : 'dot-closed'"></span>
                  <div class="text-weight-bold status-text q-ml-xs">
                    {{ isCurrentlyOpen ? 'Abierto' : 'Cerrado' }}
                  </div>
                  <div v-if="isCurrentlyOpen && todaySchedule" class="schedule-times q-ml-xs">
                    ({{ todaySchedule.from }} – {{ todaySchedule.to }})
                  </div>
                  <q-icon name="expand_more" size="16px" class="q-ml-xs arrow-icon" />
                </div>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Card Banner horario -->
        <div class="row justify-center q-pa-md">
          <q-card class="schedule-info-card full-width" style="max-width: 500px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <q-card-section>
              <div class="row items-center justify-between cursor-pointer q-py-sm" @click="scheduleExpanded = !scheduleExpanded">
                <q-badge
                  :color="isCurrentlyOpen ? 'green-2' : 'red-2'"
                  :text-color="isCurrentlyOpen ? 'green-8' : 'red-8'"
                  class="q-px-sm q-py-xs text-weight-bold"
                  style="border-radius: 6px;"
                >
                  {{ isCurrentlyOpen ? 'Disponible' : 'No disponible' }}
                </q-badge>
                <div class="row items-center text-grey-7">
                  <q-icon name="schedule" size="18px" class="q-mr-xs" />
                  <span v-if="todaySchedule">
                    <template v-if="todaySchedule.isOpen">
                      {{ todaySchedule.openTime }} a {{ todaySchedule.closeTime }}
                    </template>
                    <template v-else>
                      No disponible
                    </template>
                  </span>
                  <q-icon :name="scheduleExpanded ? 'arrow_drop_up' : 'arrow_drop_down'" size="24px" />
                </div>
              </div>

              <q-slide-transition>
                <div v-show="scheduleExpanded" class="q-pt-sm">
                  <div v-for="day in weekSchedule" :key="day.dayKey" class="row items-start q-mb-xs">
                    <div class="col-2 text-weight-bold" :class="day.isToday ? 'text-primary' : 'text-grey-8'">
                      {{ day.dayName.substring(0, 2).toUpperCase() }}
                    </div>
                    <div class="col-10 text-grey-7 row items-center">
                      <template v-if="day.isOpen && !day.error">
                        <q-icon name="schedule" size="16px" class="q-mr-xs" />
                        <span v-if="day.openTime && day.openTime.includes('|')" v-html="day.openTime.split('|').map(t => `<q-icon name='schedule' size='16px' class='q-mr-xs' /> ${t.trim()}`).join(' <span class=\'q-mx-sm\'>|</span> ')"></span>
                        <span v-else>{{ day.openTime }} a {{ day.closeTime }}</span>
                      </template>
                      <template v-else-if="!day.isOpen && !day.error">
                        No disponible
                      </template>
                      <template v-if="day.error">
                        <q-icon name="warning" color="warning" size="16px" class="q-mr-xs" />
                        <span class="text-warning">{{ day.errorMessage }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </q-slide-transition>
            </q-card-section>
          </q-card>
        </div>

        <!-- Main Content Area -->
        <div class="catalog-content-wrapper">
          <div class="catalog-content-card">
            <div class="catalog-content-inner">
              <div class="row q-col-gutter-lg">
                <!-- Left Column: Dynamic Tab Content -->
                <div class="col-12 col-md-7">
                  <!-- Hidden tabs navigation -->
                  <q-tabs v-model="currentTab" style="display: none">
                    <q-tab name="menu" />
                    <q-tab name="cart" />
                    <q-tab name="checkout" />
                    <q-tab name="orders" />
                  </q-tabs>

                  <q-tab-panels
                    v-model="currentTab"
                    keep-alive
                    class="catalog-panels"
                  >
                    <q-tab-panel name="menu" class="q-pa-none">
                      <CatalogView
                        :loading="loadingPage"
                        @open-product="openProductDetail"
                        @view-cart="currentTab = 'cart'"
                      />
                    </q-tab-panel>

                    <q-tab-panel v-if="!isMobileOrTablet" name="cart" class="q-pa-none">
                      <CartView
                        @checkout="goToCheckout"
                        @back-to-catalog="currentTab = 'menu'"
                      />
                    </q-tab-panel>

                    <q-tab-panel v-if="!isMobileOrTablet" name="checkout" class="q-pa-none">
                      <CheckoutView
                        @success="handleCheckoutSuccess"
                        @cancel="currentTab = 'cart'"
                      />
                    </q-tab-panel>

                    <q-tab-panel v-if="!isMobileOrTablet" name="orders" class="q-pa-none">
                      <OrdersView @back-to-catalog="currentTab = 'menu'" />
                    </q-tab-panel>
                  </q-tab-panels>
                </div>

                <!-- Right Column: Always-visible Cart (desktop ≥1024px) -->
                <div class="col-md-5 gt-sm">
                  <div class="right-content">
                    <div class="cart-header">
                      <div class="cart-header-title">
                        <q-icon name="shopping_cart_checkout" size="22px" class="q-mr-sm cart-header-icon" />
                        Tu Pedido
                      </div>
                      <q-badge v-if="cartItems.length > 0" :label="cartItemCount" color="primary" rounded />
                    </div>

                    <!-- Empty Cart State (Matching CartView.vue) -->
                    <div v-if="cartItems.length === 0" class="empty-cart-sidebar text-center q-pa-lg">
                      <q-img src="images/car_empty.png" style="width: 200px; max-width: 100%; opacity: 0.8;" />
                      <div class="empty-cart-text q-mt-md">Tu carrito está vacío</div>
                      <div class="empty-cart-sub q-mt-xs">Agrega productos para comenzar</div>
                    </div>

                    <!-- Cart Items (Enhanced Layout from CartView.vue) -->
                    <div v-else class="cart-items-container">
                      <div class="cart-items-list">
                        <div
                          v-for="item in cartItems"
                          :key="item.id"
                          class="cart-item-row"
                        >
                          <div class="item-header-sidebar">
                            <div class="item-info-sidebar">
                              <div class="item-name-sidebar">{{ item.name }}</div>
                              <div class="item-price-sidebar">$ {{ formatNumber(item.price) }}</div>
                            </div>
                            <div class="item-actions-sidebar">
                              <div class="quantity-controls-sidebar">
                                <q-btn
                                  icon="remove"
                                  flat
                                  round
                                  size="xs"
                                  class="quantity-btn-sidebar"
                                  @click="decrementQuantity(item)"
                                  :disable="item.amount <= 1"
                                />
                                <span class="quantity-display-sidebar">{{ item.amount }}</span>
                                <q-btn
                                  icon="add"
                                  flat
                                  round
                                  size="xs"
                                  class="quantity-btn-sidebar"
                                  @click="incrementQuantity(item)"
                                />
                              </div>
                              <q-btn
                                icon="delete_outline"
                                flat
                                round
                                dense
                                size="sm"
                                color="negative"
                                class="remove-item-btn-sidebar"
                                @click="removeItem(item)"
                              />
                            </div>
                          </div>
                          <!-- Observation Badge (Optional) -->
                          <div v-if="item.observation" class="item-observation-sidebar">
                            <q-icon name="chat_bubble_outline" size="12px" class="q-mr-xs" />
                            {{ item.observation }}
                          </div>
                        </div>
                      </div>

                      <div class="sidebar-separator"></div>

                      <!-- Summary Section (Matching CartView.vue) -->
                      <div class="sidebar-summary">
                        <div class="summary-row-sidebar">
                          <span class="summary-label-sidebar">Subtotal</span>
                          <span class="summary-value-sidebar">$ {{ formatNumber(cartTotal) }}</span>
                        </div>

                        <div class="summary-total-sidebar">
                          <span class="total-label-sidebar">Total</span>
                          <span class="total-value-sidebar">$ {{ formatNumber(cartTotal) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Dialog -->
        <q-dialog
          v-model="showScheduleDialog"
          position="bottom"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="schedule-dialog-card">
            <q-card-section class="row items-center q-pb-none">
              <div class="schedule-dialog-title">Horarios de atención</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup aria-label="Cerrar horarios" />
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <q-list>
                <q-item
                  v-for="day in weekSchedule"
                  :key="day.dayKey"
                  class="schedule-item"
                  :class="{ 'schedule-item--today': day.isToday }"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="getDayColor(day)"
                      text-color="white"
                      size="36px"
                      class="schedule-avatar"
                    >
                      {{ day.dayName.charAt(0) }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="schedule-day-name" :class="{ 'text-primary': day.isToday }">
                      {{ day.dayName }}
                      <q-badge v-if="day.isToday" color="primary" class="q-ml-sm" label="Hoy" />
                    </q-item-label>

                    <q-item-label caption class="schedule-hours">
                      <template v-if="day.isOpen && !day.error">
                        <q-icon name="schedule" size="12px" class="q-mr-xs" />
                        <span>{{ day.openTime }} – {{ day.closeTime }}</span>
                        <q-badge
                          v-if="day.isToday && isCurrentlyOpen"
                          color="positive"
                          class="q-ml-sm"
                          label="Abierto ahora"
                        />
                        <q-badge
                          v-else-if="day.isToday && !isCurrentlyOpen"
                          color="negative"
                          class="q-ml-sm"
                          label="Cerrado ahora"
                        />
                      </template>
                      <template v-else-if="!day.isOpen && !day.error">
                        <q-icon name="block" size="12px" class="q-mr-xs text-negative" />
                        <span class="text-negative">Cerrado</span>
                      </template>
                      <template v-if="day.error">
                        <q-icon name="warning" color="warning" size="12px" class="q-mr-xs" />
                        <span class="text-warning">{{ day.errorMessage }}</span>
                      </template>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Auth Dialog -->
        <AuthDialog v-model="showAuthDialog" />

        <!-- Product Detail Dialog -->
        <ProductDetailDialog
          v-model="showProductDetail"
          :product="selectedProduct"
          @add-to-cart="handleAddToCart"
        />

        <!-- Sub-page Dialog for Mobile/Tablet (Full Screen) -->
        <q-dialog
          v-model="isSubPageDialogOpen"
          persistent
          maximized
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <div class="bg-white full-height column no-wrap">
            <CartView
              v-if="currentTab === 'cart'"
              @checkout="goToCheckout"
              @back-to-catalog="currentTab = 'menu'"
            />
            <CheckoutView
              v-else-if="currentTab === 'checkout'"
              @success="handleCheckoutSuccess"
              @cancel="currentTab = 'cart'"
            />
            <OrdersView
              v-else-if="currentTab === 'orders'"
              @back-to-catalog="currentTab = 'menu'"
            />
          </div>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from 'src/stores/catalog'
import { authentication } from 'src/stores/module-authentication'
import { useCart } from 'src/composables/useCart'
import { useOrderStore } from 'src/stores/order'
import { formatNumber, notify } from 'src/const/mixins'
import { Notify, useQuasar } from 'quasar'

import CatalogView from 'src/components/Catalog/CatalogView.vue'
import CartView from 'src/components/Catalog/CartView.vue'
import CheckoutView from 'src/components/Catalog/CheckoutView.vue'
import OrdersView from 'src/components/Catalog/OrdersView.vue'
import ProductDetailDialog from 'src/components/Product/ProductDetailDialog.vue'
import AuthDialog from 'src/components/Auth/AuthDialog.vue'

// Day translations for schedule
const dayTranslations = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Router
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Stores
const catalogStore = useCatalogStore()
const authStore = authentication()
const orderStore = useOrderStore()
const cart = useCart()

const { company } = storeToRefs(catalogStore)
const { userSession, profilePhoto } = storeToRefs(authStore)
const { orderCount } = storeToRefs(orderStore)

// State
const currentTab = ref(route.query.tab || 'menu')
const showProductDetail = ref(false)
const selectedProduct = ref(null)
const loadingPage = ref(false)
const showScheduleDialog = ref(false)
const showAuthDialog = ref(false)
const currentTime = ref(new Date())
const scheduleExpanded = ref(true)
let savedScrollPosition = 0
let scrollContainerEl = null
let timeUpdateInterval = null

// Computed — User
const isMobileOrTablet = computed(() => $q.screen.lt.md)

const isSubPageDialogOpen = computed({
  get: () => ['cart', 'checkout', 'orders'].includes(currentTab.value) && isMobileOrTablet.value,
  set: (val) => {
    if (!val) {
      currentTab.value = 'menu'
    }
  }
})

const userInitials = computed(() => {
  if (!userSession.value) return 'U'
  const name = userSession.value.name || userSession.value.first_name || 'Usuario'
  return name.charAt(0).toUpperCase()
})

const isAuthenticated = computed(() => !!userSession.value)

// Computed — Banner & Schedule
const bannerUrl = computed(() =>
  company.value?.company_config?.other?.menu?.banner_url || ''
)

const scheduleData = computed(() =>
  company.value?.company_config?.other?.menu?.schedule
)

const getCurrentDayKey = () => {
  const currentDayIndex = currentTime.value.getDay()
  const currentDayName = daysOfWeek[currentDayIndex]
  return Object.keys(dayTranslations).find(
    key => dayTranslations[key] === currentDayName
  )
}

const isCurrentlyOpen = computed(() => {
  try {
    const currentDayKey = getCurrentDayKey()
    if (!currentDayKey || !scheduleData.value || !scheduleData.value[currentDayKey]) {
      return false
    }

    const today = scheduleData.value[currentDayKey]
    if (!today || !today.isOpen || today.hasError || !today.from || !today.to) {
      return false
    }

    const currentHours = currentTime.value.getHours()
    const currentMinutes = currentTime.value.getMinutes()
    const currentTimeInMinutes = currentHours * 60 + currentMinutes

    // Support for multiple intervals separated by '|'
    const fromIntervals = today.from.toString().split('|')
    const toIntervals = today.to.toString().split('|')

    for (let i = 0; i < fromIntervals.length; i++) {
      const fromStr = fromIntervals[i].trim()
      const toStr = toIntervals[i]?.trim()

      if (!fromStr || !toStr) continue

      const [openH, openM] = fromStr.split(':').map(Number)
      const [closeH, closeM] = toStr.split(':').map(Number)

      const openMins = (openH || 0) * 60 + (openM || 0)
      const closeMins = (closeH || 0) * 60 + (closeM || 0)

      if (currentTimeInMinutes >= openMins && currentTimeInMinutes < closeMins) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error in isCurrentlyOpen:', error)
    return false
  }
})

const todaySchedule = computed(() => {
  const currentDayKey = getCurrentDayKey()
  if (!currentDayKey || !scheduleData.value || !scheduleData.value[currentDayKey]) {
    return null
  }
  return scheduleData.value[currentDayKey]
})

const weekSchedule = computed(() => {
  if (!scheduleData.value) return []

  return dayOrder.map(day => {
    const dayData = scheduleData.value[day]
    const currentDayKey = getCurrentDayKey()

    return {
      dayName: dayTranslations[day],
      dayKey: day,
      isOpen: dayData?.isOpen || false,
      openTime: dayData?.from || '',
      closeTime: dayData?.to || '',
      error: dayData?.hasError || false,
      errorMessage: dayData?.errorMessage || '',
      isToday: day === currentDayKey
    }
  })
})

// Computed — Cart (for right panel)
const cartItems = computed(() => cart.items.value || [])
const cartTotal = computed(() => cart.total.value || 0)
const cartItemCount = computed(() => cart.itemCount.value || 0)

// Scroll container helpers
const findScrollContainer = () => {
  const panel = document.querySelector('.q-tab-panels .q-panel.scroll')
  if (panel && panel.scrollHeight > panel.clientHeight) return panel
  return document.scrollingElement || document.documentElement
}

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
  if (document.activeElement) {
    document.activeElement.blur()
  }
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

const getDayColor = (day) => {
  if (day.isToday) return 'primary'
  if (!day.isOpen) return 'grey-4'
  if (day.error) return 'warning'
  return 'grey-5'
}

const logout = async () => {
  try {
    await authStore.logout()
    cart.resetCart()
    orderStore.resetOrderStore()
    notify('Has cerrado sesión correctamente', 'positive', 'check_circle')
  } catch (error) {
    console.error('Error logging out:', error)
    authStore.forceLogout()
    cart.resetCart()
    orderStore.resetOrderStore()
  }
}

// Init - Load catalog data
onMounted(async () => {
  try {
    loadingPage.value = true

    await Promise.all([
      catalogStore.fetchCompany(route.params.company_id),
      catalogStore.fetchCategories(route.params.company_id),
      catalogStore.fetchProducts(route.params.company_id, route.params.branch_office_id),
      catalogStore.fetchPaymentMethods(route.params.company_id)
    ])

    if (isAuthenticated.value) {
      orderStore.fetchOrders()
    }
  } catch (error) {
    console.error('Error loading catalog:', error)
    notify(error.message || 'Error al cargar el catálogo', 'negative', 'warning')
  } finally {
    loadingPage.value = false
  }

  // Update time every minute for schedule status
  timeUpdateInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

// Sidebar Cart Methods
const incrementQuantity = (item) => {
  cart.updateQuantity(item.id, item.amount + 1)
}

const decrementQuantity = (item) => {
  if (item.amount > 1) {
    cart.updateQuantity(item.id, item.amount - 1)
  }
}

const removeItem = (item) => {
  cart.removeFromCart(item.id)
}

onBeforeUnmount(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
</script>

<style scoped>
.catalog-page {
  background: #f4f5f7;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* ===== Navbar ===== */
.catalog-navbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%);
}

.navbar-icon-btn {
  transition: opacity 0.2s ease;
}
.navbar-icon-btn:hover {
  opacity: 0.85;
}

.user-avatar {
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
  transition: box-shadow 0.2s ease;
}
.user-avatar:hover {
  box-shadow: 0 0 0 3px rgba(255,255,255,0.8);
}

.user-menu {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.user-menu-item {
  border-radius: 8px;
  margin: 4px;
  transition: background 0.15s ease;
}

.login-button {
  border: 1.5px solid rgba(255,255,255,0.6);
  backdrop-filter: blur(4px);
  transition: background 0.2s ease, border-color 0.2s ease;
  font-size: 0.875rem;
}
.login-button:hover {
  background: rgba(255,255,255,0.15) !important;
  border-color: rgba(255,255,255,0.9);
}

.order-badge {
  padding: 3px 5px;
  font-size: 10px;
  border: 1.5px solid rgba(255,255,255,0.8);
  min-height: 14px;
  min-width: 14px;
}

/* ===== Header Banner ===== */
.header-container {
  overflow: hidden;
}

.header-banner {
  min-height: 350px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.15) 0%,
    rgba(0,0,0,0.65) 100%
  );
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  padding-top: 56px;
}

.profile-avatar {
  box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.25);
  border-radius: 50%;
}

.company-name {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
  line-height: 1.2;
}

/* ===== Schedule Status Badge ===== */
.schedule-status-badge {
  min-height: 34px;
  padding: 4px 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(6px);
  font-size: 0.82rem;
}

.status-open {
  background: rgba(232, 245, 233, 0.92) !important;
  color: #1b5e20 !important;
}

.status-closed {
  background: rgba(255, 235, 238, 0.92) !important;
  color: #b71c1c !important;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-open {
  background: #43a047;
  box-shadow: 0 0 0 3px rgba(67,160,71,0.25);
  animation: pulse-open 2s infinite;
}

.dot-closed {
  background: #e53935;
}

@keyframes pulse-open {
  0%, 100% { box-shadow: 0 0 0 3px rgba(67,160,71,0.25); }
  50%       { box-shadow: 0 0 0 5px rgba(67,160,71,0.12); }
}

.schedule-times {
  font-size: 0.78rem;
  font-weight: 500;
  opacity: 0.85;
}

.arrow-icon {
  opacity: 0.65;
  transition: transform 0.2s ease;
}

.schedule-status-badge:hover .arrow-icon {
  transform: translateY(2px);
}

.schedule-status-badge:active {
  transform: scale(0.97);
}

/* ===== Content Wrapper (responsive desktop card) ===== */
.catalog-content-wrapper {
  padding: 0;
}

.catalog-content-card {
  overflow: visible !important;
  background: transparent;
}

.catalog-content-inner {
  padding: 0;
}

@media (min-width: 1024px) {
  .catalog-content-wrapper {
    padding: 24px 70px 48px;
  }

  .catalog-content-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  .catalog-content-inner {
    padding: 28px 40px;
  }
}

/* ===== Tab Panels ===== */
.catalog-panels {
  background: transparent;
  overflow: visible !important;
}

.catalog-panels :deep(.q-panel) {
  overflow-y: auto;
  overflow-anchor: none;
  overflow: visible !important;
}

/* ===== Right Panel — Cart (Light Theme) ===== */
.right-content {
  position: sticky;
  top: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8ecf0;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 20px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f0f2f5;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.cart-header-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.cart-header-icon {
  color: var(--q-primary);
}

/* Empty State Sidebar */
.empty-cart-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}

.empty-cart-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
}

.empty-cart-sub {
  font-size: 0.85rem;
  color: #a0aec0;
}

/* Cart Items Container */
.cart-items-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cart-items-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.cart-items-list::-webkit-scrollbar {
  width: 4px;
}
.cart-items-list::-webkit-scrollbar-track {
  background: transparent;
}
.cart-items-list::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.cart-item-row {
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.cart-item-row:last-child {
  border-bottom: none;
}

/* Item Header Sidebar */
.item-header-sidebar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.item-info-sidebar {
  flex: 1;
  min-width: 0;
}

.item-name-sidebar {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
  word-break: break-word;
}

.item-price-sidebar {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 2px;
}

/* Actions Sidebar */
.item-actions-sidebar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-controls-sidebar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #edf2f7;
}

.quantity-btn-sidebar {
  width: 24px;
  height: 24px;
  min-width: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #2d3748;
}

.quantity-display-sidebar {
  min-width: 20px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #2d3748;
}

.remove-item-btn-sidebar {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-item-btn-sidebar:hover {
  opacity: 1;
}

/* Observation Sidebar */
.item-observation-sidebar {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 6px;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-style: italic;
}

/* Sidebar Separator */
.sidebar-separator {
  height: 2px;
  margin: 16px 0;
  background-image: repeating-linear-gradient(
    90deg,
    #e2e8f0,
    #e2e8f0 8px,
    transparent 8px,
    transparent 16px
  );
}

/* Sidebar Summary */
.sidebar-summary {
  margin-bottom: 8px;
}

.summary-row-sidebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-label-sidebar {
  font-size: 0.85rem;
  color: #718096;
}

.summary-value-sidebar {
  font-size: 0.85rem;
  color: #2d3748;
  font-weight: 600;
}

.summary-total-sidebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
}

.total-label-sidebar {
  font-size: 1rem;
  font-weight: 700;
  color: #1a202c;
}

.total-value-sidebar {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--q-primary);
}

/* ===== Floating Cart Button (mobile) ===== */
.floating-cart-container {
  width: 100%;
  z-index: 2000;
}

.floating-cart-footer {
  width: 100vw;
  padding: 16px 20px;
  background: transparent;
}

.continuar-btn {
  height: 56px;
  font-size: 17px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-radius: 12px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.continuar-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.continuar-btn:active {
  transform: translateY(0);
}

/* ===== Schedule Dialog ===== */
.schedule-dialog-card {
  width: 100%;
  max-width: 480px;
  border-radius: 20px 20px 0 0;
  max-height: 72vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

.schedule-dialog-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a202c;
}

.schedule-item {
  border-radius: 10px;
  margin: 2px 0;
  transition: background 0.15s;
}

.schedule-item--today {
  background: rgba(var(--q-primary-rgb, 255,77,0), 0.05);
}

.schedule-avatar {
  font-weight: 700;
  font-size: 0.9rem;
}

.schedule-day-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.schedule-hours {
  margin-top: 2px;
  font-size: 0.8rem;
}

@media (max-width: 599px) {
  .schedule-dialog-card {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
  }
}

/* ===== Responsive ===== */
@media (max-width: 480px) {
  .company-name {
    font-size: 1.2rem;
    letter-spacing: 1px;
  }

  .header-banner {
    min-height: 230px;
  }

  .continuar-btn {
    font-size: 16px;
  }
}
</style>
