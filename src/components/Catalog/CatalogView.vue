<template>
  <div class="catalog-view" ref="catalogViewRef">
    <!-- Header del Negocio -->
    <div class="header-container full-width">
      <div
        class="header-banner relative-position shadow-2"
        :style="{ backgroundImage: `url(${bannerUrl})` }"
      >
        <div class="banner-overlay"></div>
        <div class="header-content column items-center full-width q-pa-md">
          <q-avatar size="80px" class="profile-avatar shadow-5">
            <q-img :src="company?.url || 'https://cdn.quasar.dev/img/avatar.png'" />
          </q-avatar>
          <div class="text-h5 text-center text-white text-bold q-mt-md text-uppercase company-name">
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
            @click="showScheduleDialog = true"
          >
            <!-- button content -->
            <div class="row items-center no-wrap">
              <q-icon name="fiber_manual_record" size="12px" class="q-mr-xs dot-icon" />
              <div class="text-weight-bold status-text">
                {{ isCurrentlyOpen ? 'Abierto' : 'Cerrado' }}
              </div>
              <div v-if="isCurrentlyOpen && todaySchedule" class="schedule-times q-ml-xs">
                ({{ todaySchedule.from }} - {{ todaySchedule.to }})
              </div>
              <q-icon name="expand_more" size="18px" class="q-ml-xs arrow-icon" />
            </div>
          </q-btn>
          <div v-else-if="company" class="text-caption text-white opacity-70 q-mt-sm">
            Horario no disponible
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Categories (se fija via JS) -->
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
          label="Buscar"
          dense
          type="search"
          debounce="500"
          class="full-width q-pa-sm"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="category-scroll" v-show="categories.length">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-chip"
            v-ripple
            :class="{ 'category-chip--active': selectedCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </div>
        </div>
        <q-skeleton type="text" height="60px" v-show="!categories.length" />
      </div>
    </div>

    <!-- Products Grid -->
    <div class="products-container full-width q-pa-sm">
      <!-- Loading State -->
      <div v-show="loading" class="row q-col-gutter-sm">
        <div class="col-12" v-for="i in 10" :key="i">
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
                class="product-horizontal-card shadow-1"
                :class="{ 'product-in-cart': isInCart(product.id) }"
                @click="$emit('open-product', product)"
              >
                <q-card-section horizontal class="items-center">
                  <q-card-section class="q-pa-md col">
                    <div class="product-title">{{ product.name }}</div>
                    <div
                      v-if="product.description"
                      class="text-content q-mt-xs ellipsis-2-lines"
                      v-html="product.description"
                    />
                    <div class="text-h6 text-bold q-mt-sm price-text">
                      $ {{ formatNumber(product.price) }}
                    </div>
                  </q-card-section>

                  <q-card-section class="col-auto q-pa-md">
                    <q-img
                      :src="product.images[0]?.url || defaultImage"
                      class="product-image"
                    >
                      <q-badge
                        v-if="!hasStock(product)"
                        color="negative"
                        floating
                        style="top: 7px; right: 7px;"
                      >
                        Sin stock
                      </q-badge>
                    </q-img>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="groupedProducts.length === 0 && !loading" class="empty-state text-center q-pa-xl">
          <q-icon name="info" size="50px" color="grey-5" />
          <div class="text-subtitle1 text-grey-6 q-mt-md">
            No se encontraron productos
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
        <div class="text-h6">Horarios de atención</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list separator>
          <q-item v-for="day in weekSchedule" :key="day.dayKey">
            <q-item-section avatar>
              <q-avatar :color="getDayColor(day)" text-color="white" size="md">
                {{ day.dayName.charAt(0) }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium" :class="{ 'text-primary': day.isToday }">
                {{ day.dayName }}
                <q-badge v-if="day.isToday" color="primary" class="q-ml-sm">Hoy</q-badge>
              </q-item-label>

              <q-item-label caption>
                <template v-if="day.isOpen && !day.error">
                  <q-icon name="schedule" size="xs" class="q-mr-xs" />
                  <span>{{ day.openTime }} – {{ day.closeTime }}</span>
                  <q-badge
                    v-if="day.isToday && isCurrentlyOpen"
                    color="positive"
                    class="q-ml-sm"
                  >
                    Abierto
                  </q-badge>
                  <q-badge
                    v-else-if="day.isToday && !isCurrentlyOpen"
                    color="negative"
                    class="q-ml-sm"
                  >
                    Cerrado
                  </q-badge>
                </template>

                <template v-else-if="!day.isOpen && !day.error">
                  <q-icon name="block" size="xs" class="q-mr-xs" />
                  <span class="text-negative">Cerrado</span>
                </template>

                <template v-if="day.error">
                  <q-icon name="warning" color="warning" size="xs" class="q-mr-xs" />
                  <span class="text-warning">{{ day.errorMessage }}</span>
                </template>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from 'src/stores/catalog'
import { useCart } from 'src/composables/useCart'
import { formatNumber } from 'src/const/mixins'
import SkeletonCard from 'src/components/SkeletonCard.vue'

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

// Props
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['open-product'])

// Stores y composables
const catalogStore = useCatalogStore()
const cart = useCart()
const { company, categories, products } = storeToRefs(catalogStore)

// Estado local
const searchQuery = ref('')
const selectedCategory = ref('all')
const isFilterFixed = ref(false)
const showScheduleDialog = ref(false)
const currentTime = ref(new Date())
let scrollContainer = null
let timeUpdateInterval = null

// Constantes
const defaultImage = 'https://cdn.quasar.dev/img/image-src.png'

// Computed
const bannerUrl = computed(() =>
  company.value?.company_config?.other?.menu?.banner_url ||
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800'
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

// --- Scroll container detection & sticky via JS ---

/**
 * Encuentra el contenedor que realmente tiene scroll.
 * En Quasar Layout, puede ser .q-page, .q-panel, o el document/window.
 */
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
  // Fallback: usar document.scrollingElement o window
  return document.scrollingElement || document.documentElement
}

const onScroll = () => {
  if (!stickyAnchorRef.value || !stickyFilterRef.value || !scrollContainer) return

  // Comprobar si el anchor ha pasado el top del viewport/contenedor
  const anchorRect = stickyAnchorRef.value.getBoundingClientRect()

  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    // Scroll a nivel de documento
    isFilterFixed.value = anchorRect.top <= 0
  } else {
    // Scroll dentro de un contenedor
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
  // Esperar un tick para que el DOM esté completamente renderizado
  nextTick(() => {
    if (!catalogViewRef.value) return

    scrollContainer = findScrollContainer()

    // Registrar evento de scroll
    if (!scrollContainer) return

    if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
      window.addEventListener('scroll', onScroll, { passive: true })
    } else {
      scrollContainer.addEventListener('scroll', onScroll, { passive: true })
    }
  })

  // Update time every minute for schedule
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

  // Desmarcar después de la animación para que parezca un botón (feedback táctil)
  setTimeout(() => {
    if (selectedCategory.value === categoryId) {
      selectedCategory.value = null
    }
  }, 400)
}

const scrollToCategory = async (categoryId) => {
  await nextTick()

  const el = document.getElementById(`category-${categoryId}`)
  if (!el || !scrollContainer) return

  const stickyHeight = stickyFilterRef.value?.offsetHeight || 140

  if (scrollContainer === document.scrollingElement || scrollContainer === document.documentElement) {
    // Scroll a nivel de documento
    const elRect = el.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const targetPosition = scrollTop + elRect.top - stickyHeight - 12
    setScrollTop(targetPosition)
  } else {
    // Scroll dentro de un contenedor
    const containerRect = scrollContainer.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const currentScroll = scrollContainer.scrollTop
    const targetPosition = currentScroll + (elRect.top - containerRect.top) - stickyHeight - 12
    setScrollTop(targetPosition)
  }
}

const getDayColor = (day) => {
  if (day.isToday) return 'primary'
  if (!day.isOpen) return 'grey-7'
  if (day.error) return 'warning'
  return 'grey-5'
}
</script>

<style scoped>
.catalog-view {
  min-height: 100vh;
  background: #f8f8f8;
}

/* Header Styles */
.header-container {
  overflow: hidden;
  border-radius: 0;
}

.header-banner {
  min-height: 280px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
}

.profile-avatar {
  background: white;
}

.company-name {
  text-shadow: 0 2px 10px rgba(0,0,0,0.7);
  letter-spacing: 2px;
}

.description-text {
  text-shadow: 0 1px 5px rgba(0,0,0,0.7);
  opacity: 0.9;
}

/* Filter Section - Normal flow */
.sticky-filter-container {
  background: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding-bottom: 4px;
  width: 100%;
  transition: box-shadow 0.2s ease;
}

/* Filter Section - Fixed to top via JS */
.sticky-filter-container.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.filter-wrapper {
  max-width: 600px;
}

.category-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 8px 8px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.category-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.category-chip {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  background: var(--surface, #f0f0f0);
  color: var(--text, #333);
  border: 1.5px solid var(--border, #e0e0e0);
  transition: all 0.2s ease;
}

.category-chip:active {
  transform: scale(0.92);
  filter: brightness(0.9);
}

.category-chip--active {
  background: var(--primary) !important;
  color: white !important;
  border-color: var(--primary) !important;
  animation: chip-press 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes chip-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Products Section */
.products-container {
  justify-self: center;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 100px;
}

.category-title {
  font-family: var(--font-primary);
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--text);
}

.product-horizontal-card {
  border-radius: var(--border-radius-lg, 12px);
  transition: var(--transition-transform, all 0.2s ease), var(--transition-shadow, all 0.2s ease);
  cursor: pointer;
  background: var(--surface, white);
  border: 1px solid var(--border, #e0e0e0);
}

.product-horizontal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.1)) !important;
}

.product-in-cart {
  box-shadow: 0 0 0 2px var(--primary, #ff4d00) !important;
}

.product-title {
  font-weight: 700;
  line-height: 1.2;
  font-size: 1.1rem;
  color: var(--text);
}

.text-content {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-light, #666);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-text {
  color: var(--primary, #ff4d00);
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius-md, 8px);
  object-fit: cover;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Schedule Status Button */
.schedule-status-badge {
  padding: 4px 16px;
  min-height: 36px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
}

.status-open {
  background: #e8f5e9 !important;
  color: #2e7d32 !important;
}

.status-open .dot-icon {
  color: #4caf50;
}

.status-closed {
  background: #ffebee !important;
  color: #c62828 !important;
}

.status-closed .dot-icon {
  color: #f44336;
}

.schedule-times {
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
}

.arrow-icon {
  opacity: 0.7;
}

.schedule-status-badge:hover {
  filter: brightness(1.05);
}

.schedule-status-badge:active {
  transform: scale(0.97);
}

/* Schedule Dialog */
.schedule-dialog-card {
  width: 100%;
  max-width: 500px;
  border-radius: 16px 16px 0 0;
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 599px) {
  .schedule-dialog-card {
    max-width: 100%;
  }
}
</style>
