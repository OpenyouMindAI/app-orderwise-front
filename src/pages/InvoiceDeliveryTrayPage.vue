<template>
  <q-page class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="q-pa-sm">
      <q-skeleton v-for="i in 3" :key="i" height="72px" class="q-mb-xs skeleton-card" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Compact Header -->
      <div v-if="sortedInvoices.length > 0" class="header-bar">
        <div class="header-content">
          <div class="header-info">
            <span class="header-count">{{ sortedInvoices.length }}</span>
            <span class="header-label">órdenes</span>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              dense
              round
              color="primary"
              icon="map"
              @click="showMapDialog = true"
            >
              <q-tooltip>Ver mapa de rutas</q-tooltip>
            </q-btn>
            <q-btn
              v-if="selectedInvoices.length > 0"
              flat
              dense
              no-caps
              color="primary"
              class="action-btn"
              @click="startMultipleDeliveries"
              :loading="optimizingRoute"
            >
              <q-icon name="local_shipping" size="18px" class="q-mr-xs" />
              {{ selectedInvoices.length }}
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Compact List -->
      <div v-if="sortedInvoices.length > 0" class="orders-list">
        <div
          v-for="invoice in sortedInvoices"
          :key="invoice.id"
          class="order-card"
          :class="{ 'is-selected': isSelected(invoice.id) }"
          @click="toggleSelection(invoice)"
        >
          <div class="order-main">
            <!-- Left: Checkbox + Info -->
            <div class="order-left">
              <q-checkbox
                :model-value="isSelected(invoice.id)"
                color="primary"
                size="xs"
                dense
                @click.stop
              />
              <div class="order-info">
                <div class="order-code">#{{ invoice.code }}</div>
                <div class="order-client">{{ invoice.client?.name || 'Cliente' }}</div>
              </div>
            </div>

            <!-- Right: Price -->
            <div class="order-price">${{ invoice.total?.toFixed(0) }}</div>
          </div>

          <!-- Meta Info -->
          <div class="order-meta">
            <q-badge
              :color="getStatusColor(invoice.status)"
              :label="getStatusLabel(invoice.status)"
              class="status-badge"
            />
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <q-icon name="near_me" size="14px" />
              {{ invoice.distance_km }}km
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <q-icon name="schedule" size="14px" />
              {{ invoice.estimated_time_min }}min
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <q-icon name="inventory_2" size="14px" />
              {{ invoice.products?.length || 0 }}
            </span>
          </div>

          <!-- Address -->
          <div class="order-address">
            <q-icon name="place" size="14px" />
            {{ getFormattedAddress(invoice.client?.address) }}
          </div>

          <!-- Products Expansion -->
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            icon="inventory_2"
            :label="`${invoice.products?.length || 0} producto(s)`"
            header-class="products-header"
            class="products-expansion"
          >
            <div class="products-list">
              <div
                v-for="product in invoice.products"
                :key="product.id"
                class="product-item"
              >
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-qty">x{{ Number(product.pivot?.amount).toFixed(2) || 0 }}</div>
                </div>
                <q-input
                  :model-value="formatQuantity(product.quantity_to_load)"
                  @update:model-value="(val) => updateQuantity(product, val)"
                  type="number"
                  dense
                  outlined
                  :max="Number(product.pivot?.amount)"
                  min="0"
                  step="0.01"
                  class="qty-input"
                  placeholder="0.00"
                  :rules="[
                    val => val >= 0 || 'Debe ser mayor o igual a 0',
                    val => val <= Number(product.pivot?.amount) || `Máximo: ${formatQuantity(product.pivot?.amount)}`
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="local_shipping" size="14px" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sortedInvoices.length === 0" class="empty-state">
        <q-icon name="inbox" size="48px" color="grey-4" />
        <div class="empty-title">Sin órdenes</div>
        <q-btn
          flat
          dense
          color="primary"
          label="Actualizar"
          icon="refresh"
          @click="fetchPredefinedRoutes"
        />
      </div>
    </div>

    <!-- Finish Route Button - Floating (appears when all orders delivered) -->
    <div v-if="allOrdersDelivered" class="finish-route-container">
      <div class="finish-route-info">
        <div class="info-icon">
          <q-icon name="check_circle" size="20px" color="positive" />
        </div>
        <div class="info-text">
          <div class="info-title">Todas las órdenes entregadas</div>
          <div class="info-subtitle">
            {{ isNearOrigin ? 'Estás cerca del origen' : `${(distanceToOrigin / 1000).toFixed(1)} km al origen` }}
          </div>
        </div>
      </div>
      <q-btn
        unelevated
        no-caps
        :label="isNearOrigin ? 'Finalizar Recorrido' : 'Regresa al origen para finalizar'"
        :color="isNearOrigin ? 'positive' : 'grey-6'"
        :disable="!isNearOrigin"
        icon="flag"
        class="finish-route-btn"
        @click="finishRoute"
      >
        <q-tooltip v-if="!isNearOrigin">
          Debes estar a menos de {{ ORIGIN_RADIUS }}m del origen para finalizar
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Status Tabs - Fixed Bottom -->
    <div v-if="!allOrdersDelivered" class="status-tabs-container-bottom">
      <q-tabs
        v-model="statusFilter"
        dense
        no-caps
        active-color="primary"
        indicator-color="primary"
        align="justify"
        class="status-tabs"
        @update:model-value="handleStatusFilterChange"
      >
        <q-tab
          v-for="option in statusOptions"
          :key="option.value"
          :name="option.value"
          :label="option.label"
          class="status-tab"
        />
      </q-tabs>
    </div>

    <!-- Map Dialog - Uber Style -->
    <q-dialog
      v-model="showMapDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      class="map-dialog-fullscreen"
      :persistent="allOrdersDelivered"
      :no-esc-dismiss="allOrdersDelivered"
      :no-backdrop-dismiss="allOrdersDelivered"
    >
      <q-card class="map-dialog-card">
        <q-card-section class="q-pa-none map-card-section">
          <!-- Close Button - Floating -->
          <q-btn
            v-if="!allOrdersDelivered"
            flat
            dense
            round
            icon="chevron_left"
            size="md"
            class="close-btn-floating"
            @click="handleCloseMap"
          />

          <!-- Info when all delivered - can't close map -->
          <div v-else class="map-info-badge">
            <q-icon name="info" size="16px" />
            <span>Completa el recorrido para cerrar</span>
          </div>

          <!-- Map Container -->
          <div id="routeMap" class="route-map">
            <div v-if="loadingMap" class="map-loading">
              <q-spinner-dots color="primary" size="50px" />
              <div class="map-loading-text">Cargando mapa...</div>
            </div>
          </div>

          <!-- Finish Route Button in Map (when all delivered) -->
          <div v-if="allOrdersDelivered" class="map-finish-route-container">
            <div class="map-finish-info">
              <q-icon name="check_circle" size="20px" color="positive" />
              <span class="map-finish-text">
                {{ isNearOrigin ? '¡Estás en el origen!' : `${(distanceToOrigin / 1000).toFixed(1)} km al origen` }}
              </span>
            </div>
            <q-btn
              unelevated
              no-caps
              :label="isNearOrigin ? 'Finalizar Recorrido' : 'Acércate al origen'"
              :color="isNearOrigin ? 'positive' : 'grey-7'"
              :disable="!isNearOrigin"
              icon="flag"
              class="map-finish-btn"
              @click="finishRoute"
            />
          </div>

          <!-- Bottom Tabs - Uber Style -->
          <div v-if="!allOrdersDelivered" class="map-bottom-container">
            <!-- Floating Tabs -->
            <div class="map-tabs-modern">
              <div
                class="map-tab-modern"
                :class="{ active: mapViewMode === 'complete' }"
                @click="mapViewMode = 'complete'"
              >
                <q-icon name="route" size="20px" />
                <span>Ruta Asignada</span>
              </div>
              <div
                class="map-tab-modern"
                :class="{ active: mapViewMode === 'simulated' }"
                @click="mapViewMode = 'simulated'"
              >
                <q-icon name="local_shipping" size="20px" />
                <span>Órdenes</span>
              </div>
            </div>

            <!-- Filter - Minimalist -->
            <div v-if="mapViewMode === 'simulated'" class="map-filter-modern">
              <q-select
                v-model="mapStatusFilter"
                :options="statusOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                borderless
                class="filter-select-modern"
              >
                <template v-slot:prepend>
                  <q-icon name="tune" size="20px" class="text-grey-7" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps } from 'src/boot/google-maps'
import { authentication } from 'src/stores/module-authentication'

// Router and UI utilities
const router = useRouter()
const $q = useQuasar()

/**
 * Array of selected invoices for delivery
 * @type {import('vue').Ref<Array>}
 */
const selectedInvoices = ref([])

/**
 * Array of assigned delivery routes
 * @type {import('vue').Ref<Array>}
 */
const assignedRoutes = ref([])

/**
 * Sorted and filtered invoices list
 * @type {import('vue').Ref<Array>}
 */
const sortedInvoices = ref([])

/**
 * Loading state for main content
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(false)

/**
 * Loading state for route optimization
 * @type {import('vue').Ref<boolean>}
 */
const optimizingRoute = ref(false)

/**
 * Whether courier has an active delivery run
 * @type {import('vue').Ref<boolean>}
 */
const hasActiveRun = ref(false)

/**
 * Current GPS location of the courier
 * @type {import('vue').Ref<Object|null>}
 */
const currentLocation = ref(null)

/**
 * Current status filter for orders list
 * @type {import('vue').Ref<string>}
 */
const statusFilter = ref('all')

/**
 * Controls map dialog visibility
 * @type {import('vue').Ref<boolean>}
 */
const showMapDialog = ref(false)

/**
 * Current map view mode (complete or simulated)
 * @type {import('vue').Ref<string>}
 */
const mapViewMode = ref('complete')

/**
 * Status filter for orders map view
 * @type {import('vue').Ref<string>}
 */
const mapStatusFilter = ref('all')

/**
 * Google Maps instance
 * @type {import('vue').Ref<Object|null>}
 */
const map = ref(null)

/**
 * Array of Google Maps marker objects
 * @type {import('vue').Ref<Array>}
 */
const mapMarkers = ref([])

/**
 * Array of DirectionsRenderer objects for route segments
 * @type {import('vue').Ref<Array>}
 */
const routePaths = ref([])

/**
 * Loading state for map initialization
 * @type {import('vue').Ref<boolean>}
 */
const loadingMap = ref(false)

/**
 * Whether all orders are delivered
 * @type {import('vue').Ref<boolean>}
 */
const allOrdersDelivered = ref(false)

/**
 * Whether courier is near origin to finish route
 * @type {import('vue').Ref<boolean>}
 */
const isNearOrigin = ref(false)

/**
 * Distance to origin in meters
 * @type {import('vue').Ref<number|null>}
 */
const distanceToOrigin = ref(null)

/**
 * Watch ID for geolocation tracking
 * @type {import('vue').Ref<number|null>}
 */
const watchId = ref(null)

/**
 * Origin branch coordinates
 * @type {import('vue').Ref<Object|null>}
 */
const originBranch = ref(null)

/**
 * Radius in meters to consider "near origin" (500m = 0.5km)
 * @type {number}
 */
const ORIGIN_RADIUS = 500

// Authentication store
const store = authentication()

/**
 * Available status filter options
 * @type {Array<Object>}
 */
const statusOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Finalizadas', value: 'finished' },
  { label: 'En Proceso', value: 'on_process' },
  { label: 'Pendientes', value: 'pending' }
]

// Lifecycle hook - check for active delivery run on mount
onMounted(async () => {
  await checkActiveRun()
  if (!hasActiveRun.value) {
    await getCurrentLocation()
    await fetchPredefinedRoutes()
  }
})

/**
 * Checks if the courier has an active delivery run
 * Redirects to active delivery page if found
 * @async
 * @returns {Promise<void>}
 */
async function checkActiveRun () {
  try {
    const response = await api.get('/invoice-delivery-runs/active')
    if (response.data.delivery_run && response.data.delivery_run.id) {
      hasActiveRun.value = true
      console.log('Active delivery run found:', response.data.delivery_run.id)

      $q.notify({
        type: 'info',
        message: 'Tienes una entrega activa',
        position: 'top'
      })

      // Only redirect if we have a valid ID
      if (response.data.delivery_run.id) {
        router.push({
          name: 'ActiveInvoiceDelivery',
          params: { id: response.data.delivery_run.id.toString() }
        })
      }
    } else {
      hasActiveRun.value = false
    }
  } catch (error) {
    console.error('Error checking active run:', error)
    hasActiveRun.value = false
  }
}

/**
 * Checks if an invoice is currently selected
 * @param {number} invoiceId - The invoice ID to check
 * @returns {boolean} True if invoice is selected
 */
function isSelected (invoiceId) {
  return selectedInvoices.value.some(i => i.id === invoiceId)
}

/**
 * Toggles the selection state of an invoice
 * @param {Object} invoice - The invoice object to toggle
 * @returns {void}
 */
function toggleSelection (invoice) {
  const index = selectedInvoices.value.findIndex(i => i.id === invoice.id)
  if (index > -1) {
    selectedInvoices.value.splice(index, 1)
  } else {
    selectedInvoices.value.push(invoice)
  }
}

/**
 * Starts a delivery run with multiple selected invoices
 * Validates that all invoices are finished before starting
 * @async
 * @returns {Promise<void>}
 */
async function startMultipleDeliveries () {
  if (selectedInvoices.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos una factura',
      position: 'top'
    })
    return
  }

  // Validate that all orders are finished
  const nonFinishedInvoices = selectedInvoices.value.filter(inv => inv.status !== 'finished')
  if (nonFinishedInvoices.length > 0) {
    $q.notify({
      type: 'negative',
      message: `Solo puedes iniciar viajes con órdenes finalizadas. ${nonFinishedInvoices.length} orden(es) no están finalizadas.`,
      position: 'top',
      timeout: 3000
    })
    return
  }

  optimizingRoute.value = true

  try {
    // Usar el orden establecido en la ruta (stop_order) sin optimizar
    // Las rutas ya vienen ordenadas desde el backend
    const orderedInvoices = [...selectedInvoices.value].sort((a, b) => {
      return (a.stop_order || 0) - (b.stop_order || 0)
    })

    // Prepare invoice data with product quantities
    const invoicesData = orderedInvoices.map(invoice => ({
      invoice_id: invoice.id,
      products: (invoice.products || []).map(product => ({
        product_id: product.id,
        quantity_to_load: product.quantity_to_load || 0
      }))
    })).filter(invoice => invoice.products.length > 0)

    // Start delivery with established route order
    const response = await api.post('/invoice-delivery-runs/start', {
      invoices: invoicesData
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: `Viaje iniciado: ${orderedInvoices.length} entregas en el orden establecido`,
      position: 'top',
      timeout: 3000
    })

    router.push({
      name: 'ActiveInvoiceDelivery',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting multiple deliveries:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar entrega',
      position: 'top'
    })
  } finally {
    optimizingRoute.value = false
  }
}

/**
 * FUNCIÓN DESHABILITADA - Ya no se optimiza la ruta
 * Se respeta el orden establecido en DeliveryRoute (stop_order)
 *
 * Optimizes the delivery route order using backend algorithm
 * @async
 * @param {Array<Object>} invoices - Array of invoice objects to optimize
 * @returns {Promise<Array<Object>>} Optimized array of invoices
 */
/*
async function optimizeRoute (invoices) {
  if (invoices.length <= 1) {
    return invoices
  }

  try {
    const response = await api.post('/invoice-delivery-runs/optimize-route', {
      invoices: invoices.map(i => ({
        id: i.id,
        client_location: {
          lat: i.client?.address?.latitude || i.client?.latitude,
          lng: i.client?.address?.longitude || i.client?.longitude,
          name: i.client?.name
        }
      }))
    })

    // Merge optimized order with original invoice data
    const optimizedInvoices = response.data.optimized_invoices || []
    return optimizedInvoices.map(optimizedInvoice => {
      const originalInvoice = invoices.find(inv => inv.id === optimizedInvoice.id)
      return {
        ...originalInvoice,
        ...optimizedInvoice,
        products: originalInvoice?.products || []
      }
    })
  } catch (error) {
    console.error('Error optimizing route:', error)
    return invoices
  }
}
*/

/**
 * Gets the courier's current GPS location
 * @async
 * @returns {Promise<void>}
 */
async function getCurrentLocation () {
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    } catch (error) {
      console.log('No se pudo obtener la ubicación:', error)
    }
  }
}

/**
 * Fetches the assigned route data for the courier from the backend
 * @async
 * @returns {Promise<void>}
 */
async function fetchAssignedRoute () {
  try {
    const response = await api.get('/delivery-routes/route-map-data')
    assignedRoutes.value = response.data.routes || []
  } catch (error) {
    console.error('Error fetching assigned route:', error)
  }
}

/**
 * Fetches predefined routes and their associated orders
 * Processes orders with distance calculations and route order
 * @async
 * @returns {Promise<void>}
 */
async function fetchPredefinedRoutes () {
  loading.value = true
  try {
    // Get orders based on assigned routes
    const response = await api.get('/delivery-routes/my-route-orders', {
      params: {
        status: statusFilter.value
      }
    })

    const ordersData = response.data.orders || []
    assignedRoutes.value = response.data.routes || []

    // Process orders
    const processedInvoices = ordersData.map(orderItem => {
      const invoice = orderItem.order

      // Initialize quantity_to_load for products (allow partial deliveries)
      if (invoice.products) {
        invoice.products.forEach(product => {
          const amount = parseFloat(product.pivot?.amount || 0)
          product.quantity_to_load = parseFloat(amount.toFixed(2))
        })
      }

      // Use route coordinates
      const lat = orderItem.latitude
      const lng = orderItem.longitude

      // Calculate distance from current location
      let distance = 0
      if (currentLocation.value && lat && lng) {
        const R = 6371 // Earth radius in km
        const dLat = (lat - currentLocation.value.lat) * Math.PI / 180
        const dLng = (lng - currentLocation.value.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(currentLocation.value.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        distance = R * c
      }

      return {
        ...invoice,
        latitude: lat,
        longitude: lng,
        stop_order: orderItem.stop_order,
        distance_km: distance.toFixed(1),
        estimated_time_min: Math.round(distance / 40 * 60) // Average 40 km/h
      }
    })

    // Maintain route order (already sorted by stop_order)
    sortedInvoices.value = processedInvoices
  } catch (error) {
    console.error('Error fetching route orders:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar órdenes de la ruta',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Formats a numeric value to 2 decimal places
 * @param {number|string|null} value - The value to format
 * @returns {string} Formatted value with 2 decimals
 */
function formatQuantity (value) {
  if (value === null || value === undefined || value === '') return '0.00'
  return parseFloat(value).toFixed(2)
}

/**
 * Updates the quantity to load for a product with validation
 * @param {Object} product - The product object to update
 * @param {number|string} value - The new quantity value
 * @returns {void}
 */
function updateQuantity (product, value) {
  if (value === null || value === undefined || value === '') {
    product.quantity_to_load = 0
    return
  }

  const numValue = parseFloat(value)
  const maxAmount = parseFloat(product.pivot?.amount || 0)

  // Allow partial deliveries (can be less than ordered)
  if (numValue < 0) {
    product.quantity_to_load = 0
    $q.notify({
      type: 'warning',
      message: 'La cantidad no puede ser negativa',
      position: 'top',
      timeout: 2000
    })
  } else if (numValue > maxAmount) {
    product.quantity_to_load = parseFloat(maxAmount.toFixed(2))
    $q.notify({
      type: 'warning',
      message: `No puede cargar más de ${maxAmount.toFixed(2)} unidades`,
      position: 'top',
      timeout: 2000
    })
  } else {
    product.quantity_to_load = parseFloat(numValue.toFixed(2))
  }
}

/**
 * Formats an address object or string into a readable format
 * @param {Object|string} address - The address to format
 * @returns {string} Formatted address string
 */
function getFormattedAddress (address) {
  if (!address) return 'Dirección no disponible'

  if (typeof address === 'object') {
    return address.formattedAddress || address.street || address.name || 'Dirección no disponible'
  }

  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address)
      return parsed.formattedAddress || parsed.street || parsed.name || address
    } catch (e) {
      return address
    }
  }

  return 'Dirección no disponible'
}

/**
 * Initializes the Google Maps instance and renders the initial view
 * @async
 * @returns {Promise<void>}
 */
async function initMap () {
  loadingMap.value = true

  try {
    // Cargar Google Maps primero
    const loaded = await loadGoogleMaps()

    if (!loaded || !window.google) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar Google Maps. Verifica tu conexión a internet.',
        position: 'top'
      })
      return
    }

    const mapElement = document.getElementById('routeMap')
    if (!mapElement) return

    map.value = new window.google.maps.Map(mapElement, {
      zoom: 13,
      center: currentLocation.value || { lat: 0, lng: 0 },
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR
      },
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      }
    })

    // Limpiar elementos previos del mapa
    clearMapElements()

    // Cargar ruta asignada si no está cargada
    if (mapViewMode.value === 'complete' && assignedRoutes.value.length === 0) {
      await fetchAssignedRoute()
    }

    if (mapViewMode.value === 'complete') {
      renderCompleteRoute()
    } else {
      renderSimulatedRoute()
    }
  } catch (error) {
    console.error('Error inicializando mapa:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al inicializar el mapa',
      position: 'top'
    })
  } finally {
    loadingMap.value = false
  }
}

/**
 * Clears all markers and route paths from the map
 * Removes all visual elements and empties the tracking arrays
 * @returns {void}
 */
function clearMapElements () {
  // Remove markers one by one
  while (mapMarkers.value.length > 0) {
    const marker = mapMarkers.value.pop()
    if (marker) {
      try {
        marker.setMap(null)
        marker.setVisible(false)
      } catch (e) {
        console.warn('Error removing marker:', e)
      }
    }
  }

  // Remove route paths one by one
  while (routePaths.value.length > 0) {
    const renderer = routePaths.value.pop()
    if (renderer) {
      try {
        renderer.setMap(null)
      } catch (e) {
        console.warn('Error removing route:', e)
      }
    }
  }
}

/**
 * Renders the complete assigned route on the map
 * Shows all stops in the courier's assigned route with markers and connecting lines
 * @async
 * @returns {Promise<void>}
 */
async function renderCompleteRoute () {
  if (!map.value) return

  // Load route data if not already loaded
  if (assignedRoutes.value.length === 0) {
    await fetchAssignedRoute()
  }

  if (assignedRoutes.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No tienes rutas asignadas para hoy',
      position: 'top'
    })
    return
  }

  const bounds = new window.google.maps.LatLngBounds()
  const directionsService = new window.google.maps.DirectionsService()

  // Process each assigned route
  for (const route of assignedRoutes.value) {
    const originBranch = route.origin_branch

    if (!originBranch || !originBranch.address) {
      continue
    }

    // Get coordinates from origin_branch.address
    const originAddress = originBranch.address
    const originLat = originAddress.latitude
    const originLng = originAddress.longitude

    if (!originLat || !originLng) {
      continue
    }

    // Create origin marker
    const originMarker = new window.google.maps.Marker({
      position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      map: map.value,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#FF9800',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      label: {
        text: 'O',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold'
      },
      title: originBranch.name
    })
    mapMarkers.value.push(originMarker)
    bounds.extend(new window.google.maps.LatLng(originLat, originLng))

    // Create stop markers
    const stops = route.route_clients || []

    stops.forEach((stop) => {
      const clientAddress = stop?.client?.address

      if (clientAddress?.latitude && clientAddress?.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(clientAddress.latitude), lng: parseFloat(clientAddress.longitude) },
          map: map.value,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#2196F3',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          label: {
            text: stop.stop_order.toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          title: stop.client?.name || 'Cliente'
        })
        mapMarkers.value.push(marker)
        bounds.extend(new window.google.maps.LatLng(clientAddress.latitude, clientAddress.longitude))
      }
    })

    // Draw route segment by segment
    let prevLat = originLat
    let prevLng = originLng

    for (const stop of stops) {
      const clientAddress = stop?.client?.address
      if (!clientAddress?.latitude || !clientAddress?.longitude) continue

      try {
        const result = await directionsService.route({
          origin: { lat: parseFloat(prevLat), lng: parseFloat(prevLng) },
          destination: { lat: parseFloat(clientAddress.latitude), lng: parseFloat(clientAddress.longitude) },
          travelMode: window.google.maps.TravelMode.DRIVING
        })

        const renderer = new window.google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#2196F3',
            strokeWeight: 4,
            strokeOpacity: 0.8
          },
          preserveViewport: true
        })

        renderer.setDirections(result)
        routePaths.value.push(renderer)

        prevLat = clientAddress.latitude
        prevLng = clientAddress.longitude
      } catch (error) {
        console.error('Error dibujando segmento:', error)
      }
    }
  }

  if (mapMarkers.value.length > 0) {
    map.value.fitBounds(bounds)
  }
}

/**
 * Renders the simulated route on the map showing only orders
 * Displays orders filtered by status with markers and connecting route lines
 * @async
 * @returns {Promise<void>}
 */
async function renderSimulatedRoute () {
  if (!map.value) return

  const bounds = new window.google.maps.LatLngBounds()
  const directionsService = new window.google.maps.DirectionsService()

  try {
    // Get orders data from backend
    const response = await api.get('/delivery-routes/orders-map-data', {
      params: { status: mapStatusFilter.value }
    })

    const stops = response.data.stops || []
    const routesData = response.data.routes_data || []

    if (stops.length === 0) {
      $q.notify({
        type: 'info',
        message: `No hay órdenes ${mapStatusFilter.value === 'all' ? '' : 'con estado ' + mapStatusFilter.value}`,
        position: 'top'
      })
      return
    }

    // Get origin from first stop
    const origin = stops[0]?.origin

    if (origin && origin.latitude && origin.longitude) {
      const originMarker = new window.google.maps.Marker({
        position: { lat: parseFloat(origin.latitude), lng: parseFloat(origin.longitude) },
        map: map.value,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#FF9800',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        label: {
          text: 'O',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        title: origin.name
      })
      mapMarkers.value.push(originMarker)
      bounds.extend(new window.google.maps.LatLng(origin.latitude, origin.longitude))
    }

    // Create order markers
    stops.forEach((stop) => {
      if (stop.latitude && stop.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(stop.latitude), lng: parseFloat(stop.longitude) },
          map: map.value,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#2196F3',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          label: {
            text: stop.position.toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          title: `#${stop.order_code} - ${stop.client_name}`
        })

        // Create InfoWindow with order data
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #111;">#${stop.order_code}</h3>
              <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
                <strong>Cliente:</strong> ${stop.client_name}<br>
                <strong>Total:</strong> $${stop.order_total?.toFixed(2)}<br>
                <strong>Estado:</strong> ${getStatusLabel(stop.order_status)}<br>
                <strong>Parada:</strong> #${stop.position}
              </p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(map.value, marker)
        })

        mapMarkers.value.push(marker)
        bounds.extend(new window.google.maps.LatLng(stop.latitude, stop.longitude))
      }
    })

    // Draw route segment by segment
    if (origin && origin.latitude && origin.longitude) {
      let prevLat = origin.latitude
      let prevLng = origin.longitude

      for (const stop of stops) {
        if (!stop.latitude || !stop.longitude) continue

        try {
          const result = await directionsService.route({
            origin: { lat: parseFloat(prevLat), lng: parseFloat(prevLng) },
            destination: { lat: parseFloat(stop.latitude), lng: parseFloat(stop.longitude) },
            travelMode: window.google.maps.TravelMode.DRIVING
          })

          const renderer = new window.google.maps.DirectionsRenderer({
            map: map.value,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 4,
              strokeOpacity: 0.8
            },
            preserveViewport: true
          })

          renderer.setDirections(result)
          routePaths.value.push(renderer)

          prevLat = stop.latitude
          prevLng = stop.longitude
        } catch (error) {
          console.error('Error dibujando segmento:', error)
        }
      }
    }

    if (mapMarkers.value.length > 0) {
      map.value.fitBounds(bounds)
    }
  } catch (error) {
    console.error('Error loading orders map:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el mapa de órdenes',
      position: 'top'
    })
  }
}

/**
 * Gets the color associated with an order status
 * @param {string} status - The status code (finished, on_process, pending)
 * @returns {string} Hex color code
 */
function getStatusColor (status) {
  const colors = {
    finished: '#10b981',
    on_process: '#f59e0b',
    pending: '#6b7280'
  }
  return colors[status] || '#6b7280'
}

/**
 * Gets the localized label for an order status
 * @param {string} status - The status code (finished, on_process, pending)
 * @returns {string} The localized status label
 */
function getStatusLabel (status) {
  const labels = {
    finished: 'Finalizada',
    on_process: 'En Proceso',
    pending: 'Pendiente'
  }
  return labels[status] || status
}

// Watch for changes in map view mode (tab switching)
watch(mapViewMode, async (newMode) => {
  if (map.value) {
    // Clear map before rendering new view
    clearMapElements()

    if (newMode === 'complete') {
      if (assignedRoutes.value.length === 0) {
        await fetchAssignedRoute()
      }
      renderCompleteRoute()
    } else {
      renderSimulatedRoute()
    }
  }
})

watch(showMapDialog, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      initMap()
    }, 300)
  }
})

// Watch for changes in status filter (Orders tab only)
watch(mapStatusFilter, () => {
  if (map.value && mapViewMode.value === 'simulated') {
    clearMapElements()
    renderSimulatedRoute()
  }
})

// Watch for changes in orders to check if all are delivered
watch(sortedInvoices, (newInvoices) => {
  checkIfAllOrdersDelivered(newInvoices)
}, { deep: true })

/**
 * Checks if all orders in the route are delivered
 * @param {Array} invoices - Array of invoices to check
 * @returns {void}
 */
function checkIfAllOrdersDelivered (invoices) {
  if (invoices.length === 0) {
    allOrdersDelivered.value = false
    return
  }

  // Check if all invoices have delivery_person_id and are delivered
  const allDelivered = invoices.every(invoice =>
    invoice.delivery_person_id && invoice.status === 'delivered'
  )

  if (allDelivered && !allOrdersDelivered.value) {
    allOrdersDelivered.value = true
    startLocationTracking()

    // Abrir el mapa automáticamente para mostrar ruta de regreso
    showMapDialog.value = true
    setTimeout(() => {
      showReturnRouteOnMap()
    }, 500)

    $q.notify({
      type: 'positive',
      message: '¡Todas las órdenes entregadas! Regresa al origen para finalizar',
      icon: 'check_circle',
      position: 'top',
      timeout: 5000
    })
  } else if (!allDelivered && !allOrdersDelivered.value) {
    // Solo resetear si no estábamos en modo "todas entregadas"
    // Una vez que todas están entregadas, mantener el estado hasta finalizar
    allOrdersDelivered.value = false
    stopLocationTracking()
  }
  // Si allOrdersDelivered.value ya es true, mantenerlo así hasta que se finalice manualmente
}

/**
 * Starts continuous location tracking to monitor distance to origin
 * @returns {void}
 */
function startLocationTracking () {
  if (!navigator.geolocation) {
    console.error('Geolocation not supported')
    return
  }

  // Get origin coordinates
  if (assignedRoutes.value.length > 0) {
    const route = assignedRoutes.value[0]
    if (route.origin) {
      originBranch.value = {
        lat: parseFloat(route.origin.latitude),
        lng: parseFloat(route.origin.longitude),
        name: route.origin.name
      }
    }
  }

  if (!originBranch.value) {
    console.error('No origin branch found')
    return
  }

  // Start watching position
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      const currentPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      currentLocation.value = currentPos

      // Calculate distance to origin
      const distance = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        originBranch.value.lat,
        originBranch.value.lng
      )

      distanceToOrigin.value = distance
      isNearOrigin.value = distance <= ORIGIN_RADIUS

      // Update map route if map is open
      if (showMapDialog.value && map.value) {
        showReturnRouteOnMap()
      }

      console.log(`Distance to origin: ${distance.toFixed(0)}m, Near: ${isNearOrigin.value}`)
    },
    (error) => {
      console.error('Error tracking location:', error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  )
}

/**
 * Stops location tracking
 * @returns {void}
 */
function stopLocationTracking () {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance (lat1, lng1, lat2, lng2) {
  const R = 6371e3 // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Handles status filter change
 * Prevents reloading if all orders are delivered
 * @returns {void}
 */
function handleStatusFilterChange () {
  if (!allOrdersDelivered.value) {
    fetchPredefinedRoutes()
  }
}

/**
 * Handles closing the map dialog
 * Only allows closing if all orders are not delivered
 * @returns {void}
 */
function handleCloseMap () {
  if (!allOrdersDelivered.value) {
    showMapDialog.value = false
  }
}

/**
 * Finishes the delivery route and returns courier to dashboard
 * @async
 * @returns {Promise<void>}
 */
async function finishRoute () {
  if (!isNearOrigin.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes estar cerca del origen para finalizar el recorrido',
      position: 'top'
    })
    return
  }

  $q.dialog({
    title: 'Finalizar Recorrido',
    message: '¿Estás seguro de que deseas finalizar el recorrido? Has completado todas las entregas.',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Finalizar',
      color: 'positive',
      unelevated: true
    },
    persistent: false
  }).onOk(async () => {
    try {
      // Stop location tracking
      stopLocationTracking()

      // Clear state
      allOrdersDelivered.value = false
      isNearOrigin.value = false
      distanceToOrigin.value = null

      // Close map
      showMapDialog.value = false

      $q.notify({
        type: 'positive',
        message: '¡Recorrido finalizado exitosamente!',
        icon: 'flag',
        position: 'top'
      })

      // Reload orders
      await fetchPredefinedRoutes()
    } catch (error) {
      console.error('Error finishing route:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al finalizar el recorrido',
        position: 'top'
      })
    }
  })
}

/**
 * Shows the return route on the map from current location to origin
 * @async
 * @returns {Promise<void>}
 */
async function showReturnRouteOnMap () {
  if (!map.value || !currentLocation.value || !originBranch.value) {
    console.error('Map, current location or origin not available')
    return
  }

  try {
    await loadGoogleMaps()

    // Clear previous map elements
    clearMapElements()

    const bounds = new window.google.maps.LatLngBounds()

    // Add current location marker (courier)
    const courierMarker = new window.google.maps.Marker({
      position: { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
      map: map.value,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      label: {
        text: '📍',
        fontSize: '16px'
      },
      title: 'Tu ubicación'
    })
    mapMarkers.value.push(courierMarker)
    bounds.extend(new window.google.maps.LatLng(currentLocation.value.lat, currentLocation.value.lng))

    // Add origin marker
    const originMarker = new window.google.maps.Marker({
      position: { lat: originBranch.value.lat, lng: originBranch.value.lng },
      map: map.value,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      label: {
        text: '🏢',
        fontSize: '18px'
      },
      title: originBranch.value.name || 'Origen'
    })
    mapMarkers.value.push(originMarker)
    bounds.extend(new window.google.maps.LatLng(originBranch.value.lat, originBranch.value.lng))

    // Draw route from current location to origin
    const directionsService = new window.google.maps.DirectionsService()
    const result = await directionsService.route({
      origin: { lat: currentLocation.value.lat, lng: currentLocation.value.lng },
      destination: { lat: originBranch.value.lat, lng: originBranch.value.lng },
      travelMode: window.google.maps.TravelMode.DRIVING
    })

    const renderer = new window.google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 5,
        strokeOpacity: 0.8
      },
      preserveViewport: false
    })

    renderer.setDirections(result)
    routePaths.value.push(renderer)

    // Fit bounds
    map.value.fitBounds(bounds)
  } catch (error) {
    console.error('Error showing return route:', error)
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
}

/* Header */
.header-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  max-width: 100%;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-count {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.header-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.action-btn {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

/* Finish Route Container - Fixed Bottom */
.finish-route-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 100;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.12);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.finish-route-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 1px solid #86efac;
}

.info-icon {
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 2px;
}

.info-subtitle {
  font-size: 12px;
  color: #15803d;
}

.finish-route-btn {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

/* Status Tabs - Fixed Bottom */
.status-tabs-container-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.status-tabs {
  background: white;
}

.status-tabs :deep(.q-tab) {
  min-height: 56px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.status-tabs :deep(.q-tab--active) {
  color: #1976d2;
  font-weight: 600;
}

.status-tabs :deep(.q-tab__indicator) {
  height: 3px;
  border-radius: 0 0 3px 3px;
  top: 0;
  bottom: auto;
}

/* Add padding to page container to prevent content from being hidden behind tabs */
.page-container {
  padding-bottom: 56px;
}

/* Extra padding when finish route container is visible */
.page-container:has(+ .finish-route-container) {
  padding-bottom: 180px;
}

/* Map Dialog - Fullscreen without padding */
.map-dialog-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

.map-dialog-fullscreen :deep(.q-dialog__backdrop) {
  background: rgba(0, 0, 0, 0) !important;
}

.map-dialog-fullscreen :deep(.q-dialog__inner) {
  padding: 0 !important;
  margin: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

.map-dialog-fullscreen :deep(.q-dialog__inner--minimized) {
  padding: 0 !important;
}

.map-dialog-fullscreen :deep(.q-dialog__inner--maximized) {
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

.map-dialog-card {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
}

.map-card-section {
  width: 100%;
  height: 100vh;
  position: relative;
  padding: 0 !important;
  overflow: hidden;
}

/* Close Button - Floating (Minimalist) */
.close-btn-floating {
  position: absolute;
  top: 15px;
  left: 12px;
  z-index: 1001;
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.close-btn-floating:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

/* Map Info Badge */
.map-info-badge {
  position: absolute;
  top: 15px;
  left: 12px;
  z-index: 1001;
  background: #3b82f6;
  color: white;
  padding: 10px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 13px;
  font-weight: 500;
}

/* Google Maps Controls - Fix z-index */
.route-map :deep(.gm-style .gm-style-mtc),
.route-map :deep(.gm-style button),
.route-map :deep(.gm-bundled-control) {
  z-index: 100 !important;
}

/* Map Bottom Container - Uber Style */
.map-bottom-container {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

/* Floating Tabs - Modern */
.map-tabs-modern {
  display: flex;
  background: white;
  border-radius: 100px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  gap: 4px;
}

.map-tab-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.map-tab-modern:hover {
  background: #f5f5f5;
  color: #111;
}

.map-tab-modern.active {
  background: #111;
  color: white;
}

.map-tab-modern.active:hover {
  background: #000;
}

.map-tab-modern span {
  font-size: 13px;
  font-weight: 600;
}

/* Finish Route in Map */
.map-finish-route-container {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: calc(100% - 32px);
  max-width: 400px;
}

.map-finish-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px 20px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.map-finish-text {
  font-size: 14px;
  font-weight: 600;
  color: #166534;
}

.map-finish-btn {
  width: 100%;
  height: 56px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Filter - Minimalist */
.map-filter-modern {
  background: white;
  border-radius: 100px;
  padding: 4px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.filter-select-modern {
  font-size: 14px;
  font-weight: 500;
}

.filter-select-modern :deep(.q-field__control) {
  height: 40px;
  padding: 0;
}

.filter-select-modern :deep(.q-field__native) {
  color: #111;
  font-weight: 500;
}

.filter-select-modern :deep(.q-field__append) {
  color: #666;
}

/* Responsive */
@media (max-width: 600px) {
  .map-tabs-modern {
    width: calc(100vw - 32px);
    justify-content: center;
  }

  .map-tab-modern {
    flex: 1;
    justify-content: center;
    padding: 10px 16px;
  }

  .map-tab-modern span {
    font-size: 12px;
  }

  .map-filter-modern {
    width: calc(100vw - 32px);
  }
}

.route-map {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Ensure Google Maps controls are visible */
.route-map :deep(.gmnoprint),
.route-map :deep(.gm-style-cc) {
  z-index: 100 !important;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 2000;
  gap: 16px;
}

.map-loading-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

/* Orders List */
.orders-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Order Card - Ultra Compact */
.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-card:active {
  transform: scale(0.99);
}

.order-card.is-selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Main Row */
.order-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.order-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.order-code {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.order-client {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-price {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  white-space: nowrap;
}

/* Meta Info */
.order-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
  padding-left: 32px;
}

.status-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.meta-divider {
  color: #d1d5db;
}

/* Address */
.order-address {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
  padding-left: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Products Expansion */
.products-expansion {
  margin-top: 6px;
  border-top: 1px solid #f3f4f6;
  padding-top: 6px;
}

.products-expansion :deep(.q-item) {
  min-height: 32px;
  padding: 4px 0;
}

.products-header {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  padding: 0;
  min-height: 28px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 4px 0;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 12px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-qty {
  font-size: 11px;
  color: #6b7280;
}

.qty-input {
  width: 90px;
  flex-shrink: 0;
}

.qty-input :deep(.q-field__control) {
  height: 32px;
  min-height: 32px;
}

.qty-input :deep(.q-field__native) {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  text-align: right;
  padding-right: 8px;
}

.qty-input :deep(.q-field__prepend) {
  padding-right: 4px;
}

.qty-input :deep(.q-icon) {
  color: #9ca3af;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #9ca3af;
}

/* Loading Skeleton */
.skeleton-card {
  border-radius: 8px;
}

/* Mobile Optimizations */
@media (max-width: 600px) {
  .order-card {
    padding: 9px 10px;
  }

  .order-code {
    font-size: 13px;
  }

  .order-price {
    font-size: 15px;
  }
}
</style>
