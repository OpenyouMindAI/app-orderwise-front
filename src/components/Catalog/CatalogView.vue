<template>
  <div class="catalog-view" ref="catalogViewRef">
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
            @click="$emit('change-tab', 'orders')"
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

    <!-- Desktop Card Container (visible only at 1024px+) -->
    <div class="desktop-catalog-wrapper">
      <div class="desktop-catalog-card">
        <div class="desktop-catalog-content">
          <div class="row q-col-gutter-lg">
            <!-- Left Container: col-8 - Search & Products -->
            <div class="col-7">
              <!-- Search & Categories sticky -->
              <div ref="stickyAnchorRef" :style="anchorStyle"></div>
              <div
                class="sticky-filter-container column items-center"
                :class="{ 'is-fixed': isFilterFixed }"
                ref="stickyFilterRef"
              >
                <div class="full-width q-mx-auto filter-wrapper">
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
              <div class="products-container full-width q-pa-sm">
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
            </div>

            <!-- Right Container: col-4 — Carrito (tema claro) -->
            <div class="col-5">
              <div class="right-content">
                <div class="cart-header">
                  <div class="cart-header-title">
                    <q-icon name="shopping_cart_checkout" size="22px" class="q-mr-sm cart-header-icon" />
                    Tu Pedido
                  </div>
                  <q-badge v-if="cartItems.length > 0" :label="cartCount" color="primary" rounded />
                </div>

                <!-- Empty Cart State -->
                <div v-if="cartItems.length === 0" class="empty-cart text-center q-pa-lg">
                  <div class="empty-cart-icon-wrapper">
                    <q-icon name="shopping_cart" size="44px" color="grey-4" />
                  </div>
                  <div class="empty-cart-text q-mt-sm">Tu carrito está vacío</div>
                  <div class="empty-cart-sub q-mt-xs">Agrega productos para comenzar</div>
                </div>

                <!-- Cart Items -->
                <div v-else class="cart-items">
                  <div
                    v-for="item in cartItems"
                    :key="item.id"
                    class="cart-item"
                  >
                    <div class="row items-start justify-between no-wrap">
                      <div class="cart-item-info col">
                        <div class="cart-item-name">{{ item.name }}</div>
                        <div class="cart-item-price">$ {{ formatNumber(item.price) }} × {{ item.quantity }}</div>
                      </div>
                      <div class="cart-item-total q-ml-sm">
                        $ {{ formatNumber(item.price * item.quantity) }}
                      </div>
                    </div>
                  </div>

                  <div class="cart-divider"></div>

                  <!-- Cart Total -->
                  <div class="cart-total row items-center justify-between">
                    <div class="cart-total-label">Total</div>
                    <div class="cart-total-amount">$ {{ formatNumber(cartTotal) }}</div>
                  </div>

                  <!-- Go Back Button -->
                  <q-btn
                    class="full-width q-mt-lg checkout-btn"
                    size="md"
                    unelevated
                    rounded
                    no-caps
                    @click="$emit('go-back')"
                    aria-label="Volver al inicio"
                  >
                    <q-icon name="arrow_back" size="18px" class="q-mr-xs" />
                    Volver
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet View (visible below 1024px) -->
    <div class="mobile-catalog-view">
      <!-- Search & Categories sticky -->
      <div ref="stickyAnchorRefMobile" :style="anchorStyleMobile"></div>
      <div
        class="sticky-filter-container column items-center"
        :class="{ 'is-fixed': isFilterFixedMobile }"
        ref="stickyFilterRefMobile"
      >
        <div class="full-width q-mx-auto filter-wrapper">
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
      <div class="products-container full-width q-pa-sm">
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
            :id="'category-mobile-' + cat.id"
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { useCatalogStore } from 'src/stores/catalog'
import { useOrderStore } from 'src/stores/order'
import { useCart } from 'src/composables/useCart'
import { formatNumber, notify } from 'src/const/mixins'
import SkeletonCard from 'src/components/SkeletonCard.vue'
import AuthDialog from 'src/components/Auth/AuthDialog.vue'
import { noProductImage as defaultImage } from 'src/const/images'

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

// Template refs
const catalogViewRef = ref(null)
const stickyFilterRef = ref(null)
const stickyAnchorRef = ref(null)
const stickyFilterRefMobile = ref(null)
const stickyAnchorRefMobile = ref(null)

// Mobile sticky state
const isFilterFixedMobile = ref(false)

// Mobile anchor style computed
const anchorStyleMobile = computed(() => {
  if (isFilterFixedMobile.value && stickyFilterRefMobile.value) {
    return { height: stickyFilterRefMobile.value.offsetHeight + 'px' }
  }
  return { height: '0px' }
})

// Props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['open-product', 'change-tab', 'go-back'])

// Stores y composables
const catalogStore = useCatalogStore()
const authStore = authentication()
const orderStore = useOrderStore()
const cart = useCart()
const { company, categories, products } = storeToRefs(catalogStore)
const { userSession, profilePhoto } = storeToRefs(authStore)
const { orderCount } = storeToRefs(orderStore)

// Estado local
const searchQuery = ref('')
const selectedCategory = ref('all')
const isFilterFixed = ref(false)
const showScheduleDialog = ref(false)
const showAuthDialog = ref(false)
const currentTime = ref(new Date())
let scrollContainer = null
let timeUpdateInterval = null

// Computed
const userInitials = computed(() => {
  if (!userSession.value) return 'U'
  const name = userSession.value.name || userSession.value.first_name || 'Usuario'
  return name.charAt(0).toUpperCase()
})

const bannerUrl = computed(() =>
  company.value?.company_config?.other?.menu?.banner_url || ''
)

const scheduleData = computed(() =>
  company.value?.company_config?.other?.menu?.schedule
)

// Get current day key
const getCurrentDayKey = () => {
  const currentDayIndex = currentTime.value.getDay()
  const currentDayName = daysOfWeek[currentDayIndex]
  return Object.keys(dayTranslations).find(
    key => dayTranslations[key] === currentDayName
  )
}

// Check if currently open
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

    const [openHours, openMinutes] = today.from.split(':').map(Number)
    const [closeHours, closeMinutes] = today.to.split(':').map(Number)

    const openTimeInMinutes = openHours * 60 + openMinutes
    const closeTimeInMinutes = closeHours * 60 + closeMinutes

    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes
  } catch (error) {
    console.error('Error in isCurrentlyOpen:', error)
    return false
  }
})

// Get today's schedule
const todaySchedule = computed(() => {
  const currentDayKey = getCurrentDayKey()
  if (!currentDayKey || !scheduleData.value || !scheduleData.value[currentDayKey]) {
    return null
  }
  return scheduleData.value[currentDayKey]
})

// Get full week schedule for dialog
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

// Placeholder para cuando el filtro se fija (evita el "salto" de contenido)
const anchorStyle = computed(() => {
  if (isFilterFixed.value && stickyFilterRef.value) {
    return { height: stickyFilterRef.value.offsetHeight + 'px' }
  }
  return { height: '0px' }
})

const groupedProducts = computed(() => {
  let filtered = products.value || []

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    )
  }

  // Agrupar por categorías
  return categories.value
    .map(cat => ({
      ...cat,
      products: filtered.filter(p => p.category_id === cat.id)
    }))
    .filter(cat => cat.products.length > 0)
})

// Cart computed properties
const cartItems = computed(() => cart.cartItems || [])
const cartTotal = computed(() => cart.cartTotal || 0)
const cartCount = computed(() => cart.cartCount || 0)

// --- Scroll container detection & sticky via JS ---
const findScrollContainer = () => {
  if (!catalogViewRef.value) {
    return document.scrollingElement || document.documentElement
  }

  let el = catalogViewRef.value
  while (el) {
    const style = window.getComputedStyle(el)
    const overflowY = style.overflowY
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      el.scrollHeight > el.clientHeight
    ) {
      return el
    }
    el = el.parentElement
  }
  return document.scrollingElement || document.documentElement
}

const onScroll = () => {
  if (!stickyAnchorRef.value || !stickyFilterRef.value || !scrollContainer) return

  const anchorRect = stickyAnchorRef.value.getBoundingClientRect()

  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    isFilterFixed.value = anchorRect.top <= 0
  } else {
    const containerRect = scrollContainer.getBoundingClientRect()
    isFilterFixed.value = anchorRect.top <= containerRect.top
  }
}

const setScrollTop = (value, smooth = true) => {
  if (!scrollContainer) return

  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    window.scrollTo({ top: value, behavior: smooth ? 'smooth' : 'instant' })
  } else {
    if (smooth) {
      scrollContainer.scrollTo({ top: value, behavior: 'smooth' })
    } else {
      scrollContainer.scrollTop = value
    }
  }
}

onMounted(() => {
  nextTick(() => {
    if (!catalogViewRef.value) return
    scrollContainer = findScrollContainer()
    if (!scrollContainer) return

    if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
      window.addEventListener('scroll', onScroll, { passive: true })
    } else {
      scrollContainer.addEventListener('scroll', onScroll, { passive: true })
    }
  })

  timeUpdateInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    window.removeEventListener('scroll', onScroll)
  } else if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', onScroll)
  }

  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
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

  let el = document.getElementById(`category-mobile-${categoryId}`)
  if (!el) {
    el = document.getElementById(`category-${categoryId}`)
  }

  if (!el || !scrollContainer) return

  const stickyHeight = stickyFilterRef.value?.offsetHeight || stickyFilterRefMobile.value?.offsetHeight || 140

  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    const elRect = el.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const targetPosition = scrollTop + elRect.top - stickyHeight - 12
    setScrollTop(targetPosition)
  } else {
    const containerRect = scrollContainer.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const currentScroll = scrollContainer.scrollTop
    const targetPosition = currentScroll + (elRect.top - containerRect.top) - stickyHeight - 12
    setScrollTop(targetPosition)
  }
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
</script>

<style scoped>
/* ===== Base ===== */
.catalog-view {
  min-height: 100vh;
  background: #f4f5f7;
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

/* ===== Header Banner ===== */
.header-container {
  overflow: hidden;
}

.header-banner {
  min-height: 270px;
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

/* ===== Desktop Wrapper ===== */
.desktop-catalog-wrapper {
  padding: 24px 48px 48px;
}

.desktop-catalog-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  overflow: hidden;
}

.desktop-catalog-content {
  padding: 28px 40px;
}

/* ===== Sticky Filter ===== */
.sticky-filter-container {
  width: 100%;
  transition: box-shadow 0.25s ease;
}

.sticky-filter-container.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  background: #ffffff;
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
  box-shadow: 0 3px 10px rgba(var(--q-primary-rgb, 255,77,0), 0.3);
  animation: chip-press 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chip-press {
  0%   { transform: scale(1); }
  45%  { transform: scale(0.94); }
  100% { transform: scale(1); }
}

/* ===== Products Container ===== */
.products-container {
  max-width: 620px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.category-section {
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
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb, 255,77,0), 0.2) !important;
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

/* ===== Right Panel — Cart (Light Theme) ===== */
.right-content {
  position: sticky;
  top: 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8ecf0;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 20px;
  min-height: 320px;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f0f2f5;
  margin-bottom: 16px;
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

.empty-cart {
  padding: 24px 0;
}

.empty-cart-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.empty-cart-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.empty-cart-sub {
  font-size: 0.8rem;
  color: #a0aec0;
}

.cart-items {
  max-height: calc(100vh - 340px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.cart-items::-webkit-scrollbar {
  width: 4px;
}
.cart-items::-webkit-scrollbar-track {
  background: transparent;
}
.cart-items::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}

.cart-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #edf2f7;
  transition: background 0.15s ease;
}

.cart-item:hover {
  background: #f0f4f8;
}

.cart-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
}

.cart-item-price {
  font-size: 0.78rem;
  color: #718096;
  margin-top: 3px;
}

.cart-item-total {
  font-size: 0.88rem;
  font-weight: 700;
  color: #2d3748;
  white-space: nowrap;
}

.cart-divider {
  height: 1.5px;
  background: #edf2f7;
  margin: 14px 0;
  border-radius: 1px;
}

.cart-total {
  padding-top: 4px;
}

.cart-total-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
}

.cart-total-amount {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--q-primary);
}

/* ===== Checkout (Volver) Button ===== */
.checkout-btn {
  background: linear-gradient(135deg, var(--q-primary) 0%, color-mix(in srgb, var(--q-primary) 80%, #000) 100%);
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: filter 0.2s ease, transform 0.15s ease;
}

.checkout-btn:hover {
  filter: brightness(1.07);
}

.checkout-btn:active {
  transform: scale(0.98);
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

/* ===== Order Badge ===== */
.order-badge {
  padding: 3px 5px;
  font-size: 10px;
  border: 1.5px solid rgba(255,255,255,0.8);
  min-height: 14px;
  min-width: 14px;
}

/* ===== Responsive ===== */
@media (max-width: 1023px) {
  .desktop-catalog-wrapper {
    display: none;
  }
}

@media (min-width: 1024px) {
  .mobile-catalog-view {
    display: none;
  }
}

@media (max-width: 480px) {
  .company-name {
    font-size: 1.2rem;
    letter-spacing: 1px;
  }

  .product-image {
    width: 80px;
    height: 80px;
  }

  .header-banner {
    min-height: 230px;
  }
}
</style>
