<template>
  <q-page>
    <div class="row no-wrap" style="height: calc(100vh - 57px);">
      <!-- Map Section -->
      <div class="col" style="position: relative;">
        <!-- Map Container -->
        <div ref="mapContainer" style="width: 100%; height: 100%;"></div>

        <!-- Top Stats Bar -->
        <div class="absolute-top q-ma-md" style="z-index: 1000;">
          <q-card class="shadow-4" style="border-radius: 12px;">
            <q-card-section class="q-pa-md">
              <div class="row q-gutter-md">
                <!-- Active Runs -->
                <div class="col">
                  <div class="text-caption text-grey">Recorridos Activos</div>
                  <div class="text-h5 text-weight-bold text-primary">{{ activeRuns.length }}</div>
                </div>
                <!-- Total Deliveries -->
                <div class="col">
                  <div class="text-caption text-grey">Entregas Totales</div>
                  <div class="text-h5 text-weight-bold">{{ totalDeliveries }}</div>
                </div>
                <!-- Completed -->
                <div class="col">
                  <div class="text-caption text-grey">Completadas</div>
                  <div class="text-h5 text-weight-bold text-positive">{{ completedDeliveries }}</div>
                </div>
                <!-- Pending -->
                <div class="col">
                  <div class="text-caption text-grey">Pendientes</div>
                  <div class="text-h5 text-weight-bold text-warning">{{ pendingDeliveries }}</div>
                </div>
                <!-- Returning to Origin -->
                <div class="col">
                  <div class="text-caption text-grey">Retornando</div>
                  <div class="text-h5 text-weight-bold text-info">{{ returningToOriginCount }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Refresh Button -->
        <div class="absolute-top-right q-ma-md" style="z-index: 1000; margin-top: 120px !important;">
          <q-btn
            round
            color="primary"
            icon="refresh"
            size="md"
            @click="refreshData"
            :loading="loading"
          >
            <q-tooltip>Actualizar datos</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Side Panel with Tabs -->
      <div class="col-4" style="height: calc(100vh - 57px); border-left: 1px solid;" :class="$q.dark.isActive ? 'border-dark' : 'border'">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="live" icon="sensors" label="En Vivo" />
          <q-tab name="history" icon="history" label="Historial" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated style="height: calc(100vh - 115px); overflow-y: auto;">

          <!-- Live Monitoring Tab -->
          <q-tab-panel name="live">
            <!-- Header -->
            <div class="row items-center justify-between q-mb-md">
              <div class="col">
                <div class="text-h6 text-weight-bold">
                  {{ selectedRun ? `Recorrido #${selectedRun.id}` : 'Selecciona un recorrido' }}
                </div>
                <div v-if="selectedRun" class="text-caption text-grey">
                  {{ selectedRun.delivery_person?.name || 'Repartidor' }}
                </div>
                <!-- Returning to Origin Badge -->
                <div v-if="selectedRun && isRunReturningToOrigin(selectedRun)" class="q-mt-sm">
                  <q-chip color="info" text-color="white" icon="home" size="sm">
                    Retornando al origen
                  </q-chip>
                </div>
              </div>
              <!-- Deselect Button -->
              <div v-if="selectedRun" class="col-auto">
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  color="grey"
                  @click="selectedRun = null; resetAllMarkerStyles()"
                >
                  <q-tooltip>Deseleccionar</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- No Selection State -->
            <div v-if="!selectedRun" class="q-pa-xl text-center">
              <q-icon name="map" size="64px" class="q-mb-md" color="grey" />
              <div class="text-body1">Haz clic en un marcador del mapa</div>
              <div class="text-caption text-grey">para ver los detalles del recorrido</div>
            </div>

            <!-- Selected Run Details -->
            <div v-else class="q-pa-md">
          <!-- Run Info Card -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon name="schedule" size="20px" class="q-mr-sm" color="primary" />
                <div class="text-body2 text-weight-bold">Información del Recorrido</div>
              </div>

              <div class="q-gutter-sm">
                <!-- Start Time -->
                <div class="row items-center">
                  <div class="col-5 text-caption text-grey">Inicio:</div>
                  <div class="col text-body2">{{ formatTime(selectedRun.started_at) }}</div>
                </div>

                <!-- Duration -->
                <div class="row items-center">
                  <div class="col-5 text-caption text-grey">Duración:</div>
                  <div class="col text-body2">{{ calculateDuration(selectedRun.started_at) }}</div>
                </div>

                <!-- Progress -->
                <div class="row items-center">
                  <div class="col-5 text-caption text-grey">Progreso:</div>
                  <div class="col text-body2">
                    {{ selectedRunDeliveredCount }} / {{ selectedRunTotalCount }}
                    ({{ Math.round(selectedRunProgress * 100) }}%)
                  </div>
                </div>

                <!-- Status -->
                <div v-if="isRunReturningToOrigin(selectedRun)" class="row items-center">
                  <div class="col-5 text-caption text-grey">Estado:</div>
                  <div class="col">
                    <q-chip color="info" text-color="white" size="sm" icon="home">
                      Retornando al origen
                    </q-chip>
                  </div>
                </div>

                <!-- Estimated Time Remaining -->
                <div v-if="!isRunReturningToOrigin(selectedRun)" class="row items-center">
                  <div class="col-5 text-caption text-grey">Tiempo restante:</div>
                  <div class="col text-body2 text-warning">{{ estimatedTimeRemaining }}</div>
                </div>

                <!-- Distance Remaining -->
                <div v-if="!isRunReturningToOrigin(selectedRun)" class="row items-center">
                  <div class="col-5 text-caption text-grey">Distancia restante:</div>
                  <div class="col text-body2 text-warning">{{ estimatedDistanceRemaining }} km</div>
                </div>

                <!-- Distance to Origin (when returning) -->
                <div v-if="isRunReturningToOrigin(selectedRun)" class="row items-center">
                  <div class="col-5 text-caption text-grey">Distancia al origen:</div>
                  <div class="col text-body2 text-info">{{ getDistanceToOrigin(selectedRun) }} km</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <q-linear-progress
                :value="selectedRunProgress"
                color="positive"
                size="8px"
                class="q-mt-md"
                rounded
              />
            </q-card-section>
          </q-card>

          <!-- Deliveries List -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            Entregas ({{ selectedRun.items?.length || 0 }})
          </div>

          <q-list separator>
            <q-item
              v-for="(item, index) in selectedRun.items"
              :key="item.id"
              class="q-pa-md rounded-borders"
              :class="{
                'bg-positive': item.delivery_status === 'delivered',
                'bg-primary': item.delivery_status === 'arrived',
                'bg-grey-3': item.delivery_status === 'pending' && !$q.dark.isActive,
                'bg-grey-9': item.delivery_status === 'pending' && $q.dark.isActive
              }"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getDeliveryStatusColor(item.delivery_status)"
                  text-color="white"
                  size="40px"
                >
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold" :class="item.delivery_status === 'delivered' || item.delivery_status === 'arrived' ? 'text-white' : ''">
                  {{ item.invoice?.client?.name || 'Cliente' }}
                </q-item-label>
                <q-item-label caption :class="item.delivery_status === 'delivered' || item.delivery_status === 'arrived' ? 'text-grey-4' : 'text-grey'">
                  {{ item.invoice?.client?.address?.street || 'Dirección no disponible' }}
                </q-item-label>
                <q-item-label caption class="q-mt-xs">
                  <q-chip
                    :color="getDeliveryStatusColor(item.delivery_status)"
                    text-color="white"
                    size="sm"
                    dense
                  >
                    {{ getDeliveryStatusLabel(item.delivery_status) }}
                  </q-chip>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-icon
                  :name="getDeliveryStatusIcon(item.delivery_status)"
                  :color="getDeliveryStatusColor(item.delivery_status)"
                  size="24px"
                />
              </q-item-section>
            </q-item>
          </q-list>
            </div>
          </q-tab-panel>

          <!-- History Tab -->
          <q-tab-panel name="history">
            <!-- Filters -->
            <div>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Historial de Recorridos</div>

              <div class="row q-col-gutter-xs q-mb-xs">
                <div class="col-6">
                  <q-input
                    v-model="historyFilters.startDate"
                    label="Desde"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="historyFilters.endDate"
                    label="Hasta"
                    type="date"
                    outlined
                    dense
                  />
                </div>
              </div>

              <q-select
                v-model="historyFilters.deliveryPerson"
                :options="deliveryPersonOptions"
                label="Repartidor"
                outlined
                dense
                clearable
                option-value="id"
                option-label="name"
                emit-value
                map-options
                class="q-mb-xs"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-select>

              <q-btn
                color="primary"
                label="Buscar"
                icon="search"
                @click="loadHistoryRuns"
                :loading="historyLoading"
                unelevated
                class="full-width"
                size="sm"
              />
            </div>

            <q-separator />

            <!-- History List -->
            <q-list separator>
              <q-item
                v-for="run in historyRuns"
                :key="run.id"
                clickable
                @click="selectHistoryRun(run)"
                :active="selectedHistoryRun?.id === run.id"
                active-class="bg-primary text-white"
              >
                <q-item-section avatar>
                  <q-avatar color="grey" text-color="white">
                    <q-icon name="check_circle" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    Recorrido #{{ run.id }}
                  </q-item-label>
                  <q-item-label caption :class="selectedHistoryRun?.id === run.id ? 'text-grey-4' : 'text-grey'">
                    {{ run.delivery_person?.name || 'Repartidor' }}
                  </q-item-label>
                  <q-item-label caption :class="selectedHistoryRun?.id === run.id ? 'text-grey-4' : 'text-grey'">
                    {{ formatDate(run.started_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <q-badge color="positive" :label="`${run.items?.length || 0}`" />
                    <div class="text-caption q-mt-xs" :class="selectedHistoryRun?.id === run.id ? 'text-grey-4' : 'text-grey'">
                      {{ calculateCompletedDuration(run.started_at, run.completed_at) }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="historyRuns.length === 0 && !historyLoading">
                <q-item-section class="flex justify-center items-center text-grey">
                  <q-icon name="inbox" size="48px" class="q-mb-sm" />
                  <div>No se encontraron recorridos</div>
                </q-item-section>
              </q-item>
            </q-list>

            <q-inner-loading :showing="historyLoading">
              <q-spinner-dots size="50px" color="primary" />
            </q-inner-loading>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup>
/* global google */
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const $q = useQuasar()

/**
 * Google Maps instance
 * @type {Ref<google.maps.Map|null>}
 */
const map = ref(null)

/**
 * Reference to the map container DOM element
 * @type {Ref<HTMLElement|null>}
 */
const mapContainer = ref(null)

/**
 * Loading state
 * @type {Ref<boolean>}
 */
const loading = ref(false)

/**
 * List of active delivery runs
 * @type {Ref<Array<Object>>}
 */
const activeRuns = ref([])

/**
 * Currently selected delivery run
 * @type {Ref<Object|null>}
 */
const selectedRun = ref(null)

/**
 * Map markers for couriers
 * @type {Ref<Map<number, google.maps.Marker>>}
 */
const courierMarkers = ref(new Map())

/**
 * Map markers for deliveries
 * @type {Ref<Map<number, Array<google.maps.Marker>>>}
 */
const deliveryMarkers = ref(new Map())

/**
 * Polylines for routes
 * @type {Ref<Map<number, Object>>}
 */
const routePolylines = ref(new Map())

/**
 * Echo instance for real-time updates (from global)
 * @type {any}
 */
let echo = null

/**
 * Google Maps DirectionsService instance
 * @type {Ref<google.maps.DirectionsService|null>}
 */
const directionsService = ref(null)

/**
 * Interval ID for auto-refresh (deprecated - using Pusher instead)
 * @type {Ref<number|null>}
 */
const refreshInterval = ref(null)

/**
 * Active tab (live or history)
 * @type {Ref<string>}
 */
const activeTab = ref('live')

/**
 * History runs list
 * @type {Ref<Array<Object>>}
 */
const historyRuns = ref([])

/**
 * Selected history run
 * @type {Ref<Object|null>}
 */
const selectedHistoryRun = ref(null)

/**
 * History loading state
 * @type {Ref<boolean>}
 */
const historyLoading = ref(false)

/**
 * History filters
 * @type {Ref<Object>}
 */
const historyFilters = ref({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  deliveryPerson: null
})

/**
 * Delivery person options for filter
 * @type {Ref<Array<Object>>}
 */
const deliveryPersonOptions = ref([])

// Computed properties
/**
 * Total number of deliveries across all runs
 * @type {ComputedRef<number>}
 */
const totalDeliveries = computed(() => {
  return activeRuns.value.reduce((sum, run) => sum + (run.items?.length || 0), 0)
})

/**
 * Total number of completed deliveries
 * @type {ComputedRef<number>}
 */
const completedDeliveries = computed(() => {
  return activeRuns.value.reduce((sum, run) => {
    return sum + (run.items?.filter(item => item.delivery_status === 'delivered').length || 0)
  }, 0)
})

/**
 * Total number of pending deliveries
 * @type {ComputedRef<number>}
 */
const pendingDeliveries = computed(() => {
  return totalDeliveries.value - completedDeliveries.value
})

/**
 * Number of delivered items in selected run
 * @type {ComputedRef<number>}
 */
const selectedRunDeliveredCount = computed(() => {
  if (!selectedRun.value) return 0
  return selectedRun.value.items?.filter(item => item.delivery_status === 'delivered').length || 0
})

/**
 * Total number of items in selected run
 * @type {ComputedRef<number>}
 */
const selectedRunTotalCount = computed(() => {
  if (!selectedRun.value) return 0
  return selectedRun.value.items?.length || 0
})

/**
 * Progress percentage for selected run
 * @type {ComputedRef<number>}
 */
const selectedRunProgress = computed(() => {
  if (!selectedRun.value || selectedRunTotalCount.value === 0) return 0
  return selectedRunDeliveredCount.value / selectedRunTotalCount.value
})

/**
 * Estimated time remaining for selected run
 * @type {ComputedRef<string>}
 */
const estimatedTimeRemaining = computed(() => {
  if (!selectedRun.value) return '-'
  const pendingItems = selectedRun.value.items?.filter(item => item.delivery_status !== 'delivered') || []
  const totalMinutes = pendingItems.reduce((sum, item) => sum + (item.estimated_time || 15), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
})

/**
 * Estimated distance remaining for selected run
 * @type {ComputedRef<string>}
 */
const estimatedDistanceRemaining = computed(() => {
  if (!selectedRun.value) return '-'
  const pendingItems = selectedRun.value.items?.filter(item => item.delivery_status !== 'delivered') || []
  const totalKm = pendingItems.reduce((sum, item) => sum + (item.distance || 2), 0)
  return totalKm.toFixed(1)
})

onMounted(async () => {
  initializeWebSocket()
  await initializeMap()
  await loadActiveRuns()
  await loadDeliveryPersons()
})

onBeforeUnmount(() => {
  // Leave channel (don't disconnect global echo)
  if (echo) {
    echo.leave('delivery-tracking')
  }

  // Clear interval if exists
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }

  console.log('Admin monitor unmounted, cleaned up resources')
})

/**
 * Initializes Google Maps
 * @async
 * @returns {Promise<void>}
 */
async function initializeMap () {
  try {
    await loadGoogleMaps()

    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: -25.2637, lng: -57.5759 }, // Asunción, Paraguay
      zoom: 12,
      styles: darkMapStyles,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })

    directionsService.value = new google.maps.DirectionsService()

    console.log('Map initialized successfully')
  } catch (error) {
    console.error('Error initializing map:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el mapa',
      position: 'top'
    })
  }
}

/**
 * Loads all active delivery runs from backend
 * @async
 * @returns {Promise<void>}
 */
async function loadActiveRuns () {
  loading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/all-active')
    activeRuns.value = response.data.delivery_runs || []

    // Update map with all runs
    updateMapMarkers()

    console.log('Loaded active runs:', activeRuns.value.length)
  } catch (error) {
    console.error('Error loading active runs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar recorridos activos',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Load a single delivery run and update it in the list
 * @async
 * @param {number} runId - Delivery run ID
 * @returns {Promise<void>}
 */
async function loadSingleRun (runId) {
  try {
    const response = await api.get(`/invoice-delivery-runs/${runId}`)
    const updatedRun = response.data.delivery_run

    if (!updatedRun) return

    // Find and update the run in activeRuns
    const index = activeRuns.value.findIndex(run => run.id === runId)
    if (index !== -1) {
      activeRuns.value[index] = updatedRun

      // Update selected run if it's the one being updated
      if (selectedRun.value?.id === runId) {
        selectedRun.value = updatedRun
      }

      // Update map markers for this run
      updateMapMarkers()

      console.log('✅ Run updated:', runId)
    }
  } catch (error) {
    console.error('Error loading single run:', error)
  }
}

/**
 * Updates all markers on the map
 * @returns {void}
 */
function updateMapMarkers () {
  if (!map.value) return

  // Clear existing markers
  clearAllMarkers()

  // Add markers for each active run
  activeRuns.value.forEach(run => {
    addCourierMarker(run)
    addDeliveryMarkers(run)

    // Add origin marker if returning to origin
    if (isRunReturningToOrigin(run)) {
      addOriginMarker(run)
    }

    drawRoute(run)
  })

  // Fit bounds to show all markers
  fitMapBounds()
}

/**
 * Adds courier marker to map
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addCourierMarker (run) {
  // Get latest location from locations array
  const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
  
  let position = null

  if (latestLocation) {
    // Usar ubicación GPS si está disponible
    position = {
      lat: parseFloat(latestLocation.latitude),
      lng: parseFloat(latestLocation.longitude)
    }
  } else if (run.items && run.items.length > 0) {
    // Fallback: usar ubicación de la primera entrega si no hay GPS todavía
    const firstItem = run.items[0]
    const client = firstItem.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude
    
    if (lat && lng) {
      position = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
      console.log('📍 Using first delivery location as courier marker (no GPS yet)')
    }
  }

  // Si no hay ubicación disponible, no crear marcador
  if (!position) {
    console.warn('⚠️ No location available for courier marker')
    return
  }

  const marker = new google.maps.Marker({
    position,
    map: map.value,
    icon: {
      path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
      fillColor: '#2196F3',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 0.7,
      anchor: new google.maps.Point(11.5, 23.5)
    },
    title: run.delivery_person?.name || 'Repartidor',
    zIndex: 1000
  })

  // Add click listener
  marker.addListener('click', () => {
    selectRun(run)
  })

  // Calcular entregas completadas y totales para este run
  const deliveredCount = run.items?.filter(item => item.delivery_status === 'delivered').length || 0
  const totalCount = run.items?.length || 0

  // Crear info window con dirección
  const infoWindow = new google.maps.InfoWindow({
    content: 'Cargando...'
  })

  // Obtener dirección usando Geocoding API
  const geocoder = new google.maps.Geocoder()
  
  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const address = results[0].formatted_address
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 200px; max-width: 280px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #2196F3;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <span style="color: white; font-size: 18px;">🚗</span>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                ${run.delivery_person?.name || 'Repartidor'}
              </div>
              <div style="font-size: 11px; color: #666; font-weight: 500;">
                Recorrido #${run.id}
              </div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; font-size: 12px; color: #444; margin-bottom: 4px;">
              <span style="margin-right: 6px;">📍</span>
              <span style="font-weight: 500;">Ubicación actual:</span>
            </div>
            <div style="font-size: 11px; color: #666; line-height: 1.4; padding-left: 22px;">
              ${address}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; padding: 8px 10px; border-radius: 6px; margin-top: 8px;">
            <div style="display: flex; align-items: center; font-size: 12px; color: #444;">
              <span style="margin-right: 6px;">📦</span>
              <span style="font-weight: 500;">Entregas:</span>
            </div>
            <div style="font-weight: 700; font-size: 13px; color: ${deliveredCount === totalCount ? '#4CAF50' : '#2196F3'};">
              ${deliveredCount} / ${totalCount}
            </div>
          </div>
        </div>
      `)
    } else {
      // Si falla el geocoding, mostrar sin dirección
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 200px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #2196F3;">
              <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 18px;">🚗</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.delivery_person?.name || 'Repartidor'}
                </div>
                <div style="font-size: 11px; color: #666; font-weight: 500;">
                  Recorrido #${run.id}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; padding: 8px 10px; border-radius: 6px;">
              <div style="display: flex; align-items: center; font-size: 12px; color: #444;">
                <span style="margin-right: 6px;">📦</span>
                <span style="font-weight: 500;">Entregas:</span>
              </div>
              <div style="font-weight: 700; font-size: 13px; color: ${deliveredCount === totalCount ? '#4CAF50' : '#2196F3'};">
                ${deliveredCount} / ${totalCount}
              </div>
            </div>
          </div>
        </div>
      `)
    }
  })

  marker.addListener('mouseover', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseout', () => {
    infoWindow.close()
  })

  courierMarkers.value.set(run.id, marker)
}

/**
 * Adds delivery markers for a run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addDeliveryMarkers (run) {
  const markers = []

  run.items?.forEach((item, index) => {
    const client = item.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude

    if (!lat || !lng) return

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) }

    // Color based on status
    let color
    switch (item.delivery_status) {
      case 'delivered':
        color = '#4CAF50' // Green
        break
      case 'arrived':
        color = '#FF9800' // Orange
        break
      default:
        color = '#9E9E9E' // Grey
    }

    const marker = new google.maps.Marker({
      position,
      map: map.value,
      label: {
        text: String(index + 1),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    })

    markers.push(marker)
  })

  deliveryMarkers.value.set(run.id, markers)
}

/**
 * Adds origin marker for a run returning to origin
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addOriginMarker (run) {
  if (!run.branch_office) return

  const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
  const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

  if (!branchLat || !branchLng) return

  const position = { lat: branchLat, lng: branchLng }

  const marker = new google.maps.Marker({
    position,
    map: map.value,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="65" viewBox="0 0 50 65">
          <!-- Shadow -->
          <ellipse cx="25" cy="60" rx="10" ry="2" fill="rgba(0,0,0,0.3)"/>
          
          <!-- Pin shape -->
          <defs>
            <linearGradient id="originGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M25 5 C15 5 7 13 7 23 C7 35 25 60 25 60 C25 60 43 35 43 23 C43 13 35 5 25 5 Z" 
                fill="url(#originGradient)" stroke="white" stroke-width="3"/>
          
          <!-- White circle background -->
          <circle cx="25" cy="22" r="12" fill="white"/>
          
          <!-- Home icon -->
          <g transform="translate(25, 22)">
            <path d="M -6 -4 L 0 -8 L 6 -4 L 6 6 L -6 6 Z" fill="#10b981"/>
            <rect x="-2" y="2" width="4" height="4" fill="white"/>
          </g>
        </svg>
      `),
      scaledSize: new google.maps.Size(50, 65),
      anchor: new google.maps.Point(25, 65)
    },
    title: run.branch_office.name || 'Sucursal de Origen',
    zIndex: 9999
  })

  // Add info window with address
  const infoWindow = new google.maps.InfoWindow({
    content: 'Cargando...'
  })

  // Obtener dirección usando Geocoding API
  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const address = results[0].formatted_address
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 220px; max-width: 300px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 20px;">🏢</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.branch_office.name || 'Sucursal de Origen'}
                </div>
                <div style="font-size: 11px; color: #10b981; font-weight: 600;">
                  Destino de retorno
                </div>
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; font-size: 12px; color: #444; margin-bottom: 4px;">
                <span style="margin-right: 6px;">📍</span>
                <span style="font-weight: 500;">Dirección:</span>
              </div>
              <div style="font-size: 11px; color: #666; line-height: 1.4; padding-left: 22px;">
                ${address}
              </div>
            </div>
          </div>
        </div>
      `)
    } else {
      // Fallback sin dirección
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 220px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 20px;">🏢</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.branch_office.name || 'Sucursal de Origen'}
                </div>
                <div style="font-size: 11px; color: #10b981; font-weight: 600;">
                  Destino de retorno
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
    }
  })

  marker.addListener('click', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseover', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseout', () => {
    infoWindow.close()
  })

  // Store marker with deliveryMarkers for this run
  const existingMarkers = deliveryMarkers.value.get(run.id) || []
  existingMarkers.push(marker)
  deliveryMarkers.value.set(run.id, existingMarkers)
}

/**
 * Clears route polylines for a specific delivery run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRoutePolylines (runId) {
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) {
      polylines.completed.setMap(null)
    }
    if (polylines.pending) {
      polylines.pending.setMap(null)
    }
    if (polylines.returnToOrigin) {
      polylines.returnToOrigin.setMap(null)
    }
    // Don't clear GPS trail here, it's updated separately
  }
}

/**
 * Updates GPS trail for a delivery run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function updateGPSTrail (run) {
  if (!run.locations || run.locations.length < 2) return

  // Remove old GPS trail
  const existingPolylines = routePolylines.value.get(run.id)
  if (existingPolylines?.gpsTrail) {
    existingPolylines.gpsTrail.setMap(null)
  }

  // Create path from all locations (reversed because they're ordered desc)
  const gpsPath = run.locations.map(loc => ({
    lat: parseFloat(loc.latitude),
    lng: parseFloat(loc.longitude)
  })).reverse()

  // Draw new GPS trail (green line showing actual path)
  const gpsTrail = new google.maps.Polyline({
    path: gpsPath,
    geodesic: true,
    strokeColor: '#4CAF50',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map: map.value,
    zIndex: 100
  })

  // Store the GPS trail
  if (!routePolylines.value.has(run.id)) {
    routePolylines.value.set(run.id, {})
  }
  routePolylines.value.get(run.id).gpsTrail = gpsTrail

  console.log('🛣️ GPS trail updated with', gpsPath.length, 'points')
}

/**
 * Draws route for a delivery run
 * @param {Object} run - Delivery run object
 * @returns {Promise<void>}
 */
async function drawRoute (run) {
  if (!directionsService.value || !run.items || run.items.length === 0) {
    console.log('⚠️ Cannot draw route: missing data')
    return
  }

  const waypoints = []
  const completedWaypoints = []
  const pendingWaypoints = []

  run.items.forEach(item => {
    const client = item.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude

    if (lat && lng) {
      const location = new google.maps.LatLng(parseFloat(lat), parseFloat(lng))

      if (item.delivery_status === 'delivered') {
        completedWaypoints.push({ location, stopover: true })
      } else {
        pendingWaypoints.push({ location, stopover: true })
      }

      waypoints.push({ location, stopover: true })
    }
  })

  if (waypoints.length === 0) {
    console.log('⚠️ No valid waypoints found')
    return
  }

  console.log('🗺️ Drawing route:', {
    total: waypoints.length,
    completed: completedWaypoints.length,
    pending: pendingWaypoints.length
  })

  try {
    // Draw completed route (red)
    if (completedWaypoints.length >= 2) {
      const completedRequest = {
        origin: completedWaypoints[0].location,
        destination: completedWaypoints[completedWaypoints.length - 1].location,
        waypoints: completedWaypoints.length > 2 ? completedWaypoints.slice(1, -1) : [],
        travelMode: google.maps.TravelMode.DRIVING
      }

      console.log('🔴 Drawing completed route with', completedWaypoints.length, 'points')

      const completedResult = await directionsService.value.route(completedRequest)
      const completedRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        directions: completedResult,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#F44336',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      })

      if (!routePolylines.value.has(run.id)) {
        routePolylines.value.set(run.id, {})
      }
      routePolylines.value.get(run.id).completed = completedRenderer
    }

    // Draw pending route (grey)
    if (pendingWaypoints.length > 0) {
      // Determinar punto de origen para la ruta pendiente
      let originPos

      // Si hay ubicación GPS actual, usar esa
      const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
      if (latestLocation) {
        originPos = new google.maps.LatLng(parseFloat(latestLocation.latitude), parseFloat(latestLocation.longitude))
        console.log('📍 Using GPS location as origin')
      } else if (completedWaypoints.length > 0) {
        // Si hay entregas completadas, usar la última
        originPos = completedWaypoints[completedWaypoints.length - 1].location
        console.log('📍 Using last completed delivery as origin')
      } else {
        // Si no hay nada completado, usar la primera entrega pendiente como origen
        originPos = pendingWaypoints[0].location
        console.log('📍 Using first pending delivery as origin')
      }

      // Si solo hay una entrega pendiente
      if (pendingWaypoints.length === 1) {
        const pendingRequest = {
          origin: originPos,
          destination: pendingWaypoints[0].location,
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('⚪ Drawing pending route to single destination')

        const pendingResult = await directionsService.value.route(pendingRequest)
        const pendingRenderer = new google.maps.DirectionsRenderer({
          map: map.value,
          directions: pendingResult,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })

        if (!routePolylines.value.has(run.id)) {
          routePolylines.value.set(run.id, {})
        }
        routePolylines.value.get(run.id).pending = pendingRenderer
      } else {
        // Múltiples entregas pendientes
        const pendingRequest = {
          origin: originPos,
          destination: pendingWaypoints[pendingWaypoints.length - 1].location,
          waypoints: pendingWaypoints.slice(0, -1),
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('⚪ Drawing pending route with', pendingWaypoints.length, 'points')

        const pendingResult = await directionsService.value.route(pendingRequest)
        const pendingRenderer = new google.maps.DirectionsRenderer({
          map: map.value,
          directions: pendingResult,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })

        if (!routePolylines.value.has(run.id)) {
          routePolylines.value.set(run.id, {})
        }
        routePolylines.value.get(run.id).pending = pendingRenderer
      }
    }

    // Draw return to origin route (green) if all deliveries are completed and returning to origin
    if (pendingWaypoints.length === 0 && completedWaypoints.length > 0 && run.branch_office) {
      const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
      const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

      if (branchLat && branchLng) {
        const branchLocation = new google.maps.LatLng(branchLat, branchLng)
        const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
        const currentPos = latestLocation
          ? new google.maps.LatLng(parseFloat(latestLocation.latitude), parseFloat(latestLocation.longitude))
          : completedWaypoints[completedWaypoints.length - 1].location

        const returnRequest = {
          origin: currentPos,
          destination: branchLocation,
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('🟢 Drawing return to origin route')

        try {
          const returnResult = await directionsService.value.route(returnRequest)
          const returnRenderer = new google.maps.DirectionsRenderer({
            map: map.value,
            directions: returnResult,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#4CAF50',
              strokeWeight: 5,
              strokeOpacity: 0.7
            }
          })

          if (!routePolylines.value.has(run.id)) {
            routePolylines.value.set(run.id, {})
          }
          routePolylines.value.get(run.id).returnToOrigin = returnRenderer
        } catch (error) {
          console.error('Error drawing return route:', error)
        }
      }
    }

    console.log('✅ Route drawn successfully')
  } catch (error) {
    console.error('❌ Error drawing route:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al dibujar la ruta en el mapa',
      position: 'top',
      timeout: 2000
    })
  }
}

/**
 * Clears markers and routes for a specific delivery run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRunMarkers (runId) {
  console.log('🧹 Clearing markers for run:', runId)
  
  // Clear courier marker
  const courierMarker = courierMarkers.value.get(runId)
  if (courierMarker) {
    courierMarker.setMap(null)
    courierMarkers.value.delete(runId)
  }

  // Clear delivery markers
  const deliveryMarkersArray = deliveryMarkers.value.get(runId)
  if (deliveryMarkersArray) {
    deliveryMarkersArray.forEach(marker => marker.setMap(null))
    deliveryMarkers.value.delete(runId)
  }

  // Clear route polylines
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    if (polylines.returnToOrigin) polylines.returnToOrigin.setMap(null)
    routePolylines.value.delete(runId)
  }

  console.log('✅ Markers cleared for run:', runId)
}

/**
 * Clears all markers from map
 * @returns {void}
 */
function clearAllMarkers () {
  courierMarkers.value.forEach(marker => marker.setMap(null))
  courierMarkers.value.clear()

  deliveryMarkers.value.forEach(markers => {
    markers.forEach(marker => marker.setMap(null))
  })
  deliveryMarkers.value.clear()

  routePolylines.value.forEach(polylines => {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    if (polylines.returnToOrigin) polylines.returnToOrigin.setMap(null)
  })
  routePolylines.value.clear()
}

/**
 * Fits map bounds to show all markers
 * @returns {void}
 */
function fitMapBounds () {
  if (!map.value || courierMarkers.value.size === 0) return

  const bounds = new google.maps.LatLngBounds()

  courierMarkers.value.forEach(marker => {
    bounds.extend(marker.getPosition())
  })

  deliveryMarkers.value.forEach(markers => {
    markers.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
  })

  map.value.fitBounds(bounds)
}

/**
 * Updates route styles for selected run (blue) and non-selected runs (original colors)
 * @param {number} selectedRunId - ID of the selected run
 * @returns {void}
 */
function updateRouteStyles (selectedRunId) {
  routePolylines.value.forEach((polylines, runId) => {
    if (runId === selectedRunId) {
      // Rutas seleccionadas: AZUL
      if (polylines.completed) {
        const directions = polylines.completed.getDirections()
        if (directions) {
          polylines.completed.setDirections(directions)
          polylines.completed.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 6,
              strokeOpacity: 0.9
            }
          })
        }
      }
      if (polylines.pending) {
        const directions = polylines.pending.getDirections()
        if (directions) {
          polylines.pending.setDirections(directions)
          polylines.pending.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 6,
              strokeOpacity: 0.7
            }
          })
        }
      }
    } else {
      // Rutas no seleccionadas: colores originales más tenues
      if (polylines.completed) {
        const directions = polylines.completed.getDirections()
        if (directions) {
          polylines.completed.setDirections(directions)
          polylines.completed.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#F44336',
              strokeWeight: 4,
              strokeOpacity: 0.4
            }
          })
        }
      }
      if (polylines.pending) {
        const directions = polylines.pending.getDirections()
        if (directions) {
          polylines.pending.setDirections(directions)
          polylines.pending.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#9E9E9E',
              strokeWeight: 4,
              strokeOpacity: 0.3
            }
          })
        }
      }
    }
  })
}

/**
 * Resets all route styles to default colors
 * @returns {void}
 */
function resetAllRouteStyles () {
  routePolylines.value.forEach((polylines) => {
    if (polylines.completed) {
      const directions = polylines.completed.getDirections()
      if (directions) {
        polylines.completed.setDirections(directions)
        polylines.completed.setOptions({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#F44336',
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        })
      }
    }
    if (polylines.pending) {
      const directions = polylines.pending.getDirections()
      if (directions) {
        polylines.pending.setDirections(directions)
        polylines.pending.setOptions({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })
      }
    }
  })
}

/**
 * Selects or deselects a delivery run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function selectRun (run) {
  // Si ya está seleccionado, deseleccionar
  if (selectedRun.value?.id === run.id) {
    selectedRun.value = null
    // Restaurar todos los marcadores y rutas a su estado normal
    resetAllMarkerStyles()
    resetAllRouteStyles()
    return
  }

  // Seleccionar nuevo run
  selectedRun.value = run

  // Actualizar estilos de todos los marcadores
  courierMarkers.value.forEach((marker, id) => {
    if (id === run.id) {
      // Marcador seleccionado: carro amarillo/naranja
      marker.setIcon({
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        fillColor: '#FF9800',
        fillOpacity: 1,
        strokeColor: '#FFEB3B',
        strokeWeight: 3,
        scale: 0.8,
        anchor: new google.maps.Point(11.5, 23.5)
      })
      marker.setZIndex(2000)
    } else {
      // Marcadores no seleccionados: carro azul normal
      marker.setIcon({
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 0.7,
        anchor: new google.maps.Point(11.5, 23.5)
      })
      marker.setZIndex(1000)
    }
  })

  // Actualizar estilos de todas las rutas
  updateRouteStyles(run.id)
}

/**
 * Resets all courier marker styles to default
 * @returns {void}
 */
function resetAllMarkerStyles () {
  courierMarkers.value.forEach((marker) => {
    marker.setIcon({
      path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
      fillColor: '#2196F3',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 0.7,
      anchor: new google.maps.Point(11.5, 23.5)
    })
    marker.setZIndex(1000)
  })
}

/**
 * Initializes WebSocket connection for real-time updates
 * @returns {void}
 */
function initializeWebSocket () {
  try {
    // Get global Echo instance from app
    const instance = getCurrentInstance()
    echo = instance.appContext.config.globalProperties.$echo

    if (!echo) {
      console.error('❌ Echo instance not found. Make sure pusher.js boot file is loaded.')
      return
    }

    console.log('echo configurado')

    // Listen for location updates on delivery-tracking channel
    echo.channel('delivery-tracking')
      .listen('.DeliveryLocationUpdated', (event) => {
        console.log('📍 Location updated:', event)
        updateCourierLocation(event.delivery_run_id, event.latitude, event.longitude)
      })
      .listen('.DeliveryRunStatusUpdated', (event) => {
        console.log('📦 Delivery run status updated:', event)
        const runId = event.delivery_run?.id
        const newStatus = event.new_status || event.delivery_run?.status
        
        // Si el status cambió a completed, limpiar marcadores y remover de activos
        if (newStatus === 'completed' && runId) {
          console.log('✅ Run completed via status update, cleaning up')
          clearRunMarkers(runId)
          activeRuns.value = activeRuns.value.filter(run => run.id !== runId)
          
          if (selectedRun.value?.id === runId) {
            selectedRun.value = null
            resetAllMarkerStyles()
          }
        } else if (runId) {
          // Para otros cambios de status, recargar y actualizar
          loadSingleRun(runId)
          setTimeout(() => updateMapMarkers(), 500)
        }
      })
      .listen('.DeliveryRunStarted', (event) => {
        console.log('🚀 Delivery run started:', event)
        // Reload all active runs to include the new one
        loadActiveRuns()

        $q.notify({
          type: 'positive',
          message: `Nueva ruta iniciada por ${event.delivery_run?.delivery_person?.name || 'repartidor'}`,
          position: 'top',
          icon: 'local_shipping',
          timeout: 3000
        })

        // Actualizar mapa
        setTimeout(() => updateMapMarkers(), 500)
      })
      .listen('.DeliveryRunCompleted', (event) => {
        console.log('✅ Delivery run completed:', event)
        // Remove completed run from active runs
        const completedRunId = event.delivery_run?.id
        
        // Limpiar marcadores y rutas del run completado ANTES de removerlo
        clearRunMarkers(completedRunId)
        
        // Remover de la lista de activos
        activeRuns.value = activeRuns.value.filter(run => run.id !== completedRunId)

        // Deselect if this was the selected run
        if (selectedRun.value?.id === completedRunId) {
          selectedRun.value = null
          resetAllMarkerStyles()
        }

        $q.notify({
          type: 'positive',
          message: `Ruta completada por ${event.delivery_run?.delivery_person?.name || 'repartidor'}`,
          position: 'top',
          icon: 'check_circle',
          timeout: 3000
        })

        // NO llamar a updateMapMarkers() aquí porque clearRunMarkers ya limpió todo
        // y no queremos redibujar las rutas que ya están en el mapa
        console.log('🧹 Run removed from map and active runs list')
      })

    console.log('✅ WebSocket initialized - Real-time updates active')
  } catch (error) {
    console.error('❌ Error initializing WebSocket:', error)
  }
}

/**
 * Updates courier location in real-time
 * @param {number} runId - Delivery run ID
 * @param {number} latitude - New latitude
 * @param {number} longitude - New longitude
 * @returns {void}
 */
function updateCourierLocation (runId, latitude, longitude) {
  console.log('📍 Updating courier location:', { runId, latitude, longitude })

  // Update marker position
  const marker = courierMarkers.value.get(runId)
  if (marker) {
    const newPosition = new google.maps.LatLng(latitude, longitude)
    marker.setPosition(newPosition)

    // Smooth animation
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(() => marker.setAnimation(null), 500)
  }

  // Update run data - add new location to locations array
  const run = activeRuns.value.find(r => r.id === runId)
  if (run) {
    if (!run.locations) {
      run.locations = []
    }
    // Add new location at the beginning (most recent)
    run.locations.unshift({
      latitude,
      longitude,
      recorded_at: new Date().toISOString()
    })
    // Keep only last 50 locations
    if (run.locations.length > 50) {
      run.locations = run.locations.slice(0, 50)
    }

    // Redraw the GPS trail in real-time (like Uber)
    updateGPSTrail(run)

    // Redraw routes to update pending route from current position
    clearRoutePolylines(runId)
    drawRoute(run)

    // If this is the selected run, update the sidebar info
    if (selectedRun.value?.id === runId) {
      selectedRun.value = run
    }
  }
}

/**
 * Updates delivery status in real-time
 * @param {number} runId - Delivery run ID
 * @param {number} itemId - Delivery item ID
 * @param {string} status - New status
 * @returns {void}
 */
function updateDeliveryStatus (runId, itemId, status) {
  const run = activeRuns.value.find(r => r.id === runId)
  if (run) {
    const item = run.items?.find(i => i.id === itemId)
    if (item) {
      item.delivery_status = status

      // Redraw route with updated colors
      clearRouteForRun(runId)
      drawRoute(run)

      // Update delivery markers
      updateDeliveryMarkersForRun(run)
    }
  }
}

/**
 * Clears route polylines for a specific run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRouteForRun (runId) {
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    routePolylines.value.delete(runId)
  }
}

/**
 * Updates delivery markers for a specific run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function updateDeliveryMarkersForRun (run) {
  const markers = deliveryMarkers.value.get(run.id)
  if (!markers) return

  markers.forEach(marker => marker.setMap(null))
  deliveryMarkers.value.delete(run.id)

  addDeliveryMarkers(run)
}

/**
 * Refreshes all data
 * @async
 * @returns {Promise<void>}
 */
async function refreshData () {
  await loadActiveRuns()
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados',
    position: 'top',
    timeout: 1000
  })
}

/**
 * Formats timestamp to readable time
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
function formatTime (timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Calculates duration since start
 * @param {string} startTime - ISO timestamp
 * @returns {string}
 */
function calculateDuration (startTime) {
  if (!startTime) return '-'
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}

/**
 * Gets color for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusColor (status) {
  switch (status) {
    case 'delivered':
      return 'positive'
    case 'arrived':
      return 'warning'
    case 'pending':
      return 'grey'
    default:
      return 'grey'
  }
}

/**
 * Gets label for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusLabel (status) {
  switch (status) {
    case 'delivered':
      return 'Entregado'
    case 'arrived':
      return 'En ubicación'
    case 'pending':
      return 'Pendiente'
    default:
      return 'Desconocido'
  }
}

/**
 * Gets icon for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusIcon (status) {
  switch (status) {
    case 'delivered':
      return 'check_circle'
    case 'arrived':
      return 'location_on'
    case 'pending':
      return 'schedule'
    default:
      return 'help'
  }
}

/**
 * Checks if a run is returning to origin
 * @param {Object} run - Delivery run object
 * @returns {boolean}
 */
function isRunReturningToOrigin (run) {
  if (!run || !run.items || run.items.length === 0) return false
  // All items are delivered
  return run.items.every(item => item.delivery_status === 'delivered')
}

/**
 * Number of runs returning to origin
 * @type {ComputedRef<number>}
 */
const returningToOriginCount = computed(() => {
  return activeRuns.value.filter(run => isRunReturningToOrigin(run)).length
})

/**
 * Gets distance to origin for a run
 * @param {Object} run - Delivery run object
 * @returns {string}
 */
function getDistanceToOrigin (run) {
  if (!run || !run.branch_office) return '-'

  const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
  if (!latestLocation) return '-'

  const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
  const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

  if (!branchLat || !branchLng) return '-'

  const distance = calculateDistance(
    parseFloat(latestLocation.latitude),
    parseFloat(latestLocation.longitude),
    branchLat,
    branchLng
  )

  return (distance / 1000).toFixed(1)
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
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
 * Loads delivery persons for history filter
 */
async function loadDeliveryPersons () {
  try {
    // Obtener todos los usuarios y filtrar por rol de repartidor
    const response = await api.get('/users')
    const users = response.data.users || response.data.data || response.data || []

    // Filtrar usuarios que sean repartidores (puedes ajustar según tu estructura)
    deliveryPersonOptions.value = users.filter(user =>
      user.role === 'delivery' ||
      user.roles?.some(role => role.name === 'delivery' || role.name === 'repartidor')
    )

    console.log('Delivery persons loaded:', deliveryPersonOptions.value.length)
  } catch (error) {
    console.error('Error loading delivery persons:', error)

    // Fallback: obtener de los recorridos activos
    try {
      const runsResponse = await api.get('/invoice-delivery-runs/all-active')
      const runs = runsResponse.data.delivery_runs || []

      // Extraer repartidores únicos de los recorridos
      const uniquePersons = new Map()
      runs.forEach(run => {
        if (run.delivery_person) {
          uniquePersons.set(run.delivery_person.id, run.delivery_person)
        }
      })

      deliveryPersonOptions.value = Array.from(uniquePersons.values())
      console.log('Delivery persons from runs:', deliveryPersonOptions.value.length)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
  }
}

/**
 * Loads history runs with filters
 */
async function loadHistoryRuns () {
  historyLoading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/history', {
      params: {
        start_date: historyFilters.value.startDate,
        end_date: historyFilters.value.endDate,
        delivery_person_id: historyFilters.value.deliveryPerson
      }
    })
    historyRuns.value = response.data.delivery_runs || []
    console.log('Loaded history runs:', historyRuns.value.length)
  } catch (error) {
    console.error('Error loading history runs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial',
      position: 'top'
    })
  } finally {
    historyLoading.value = false
  }
}

/**
 * Selects a history run and displays it on map
 */
async function selectHistoryRun (run) {
  selectedHistoryRun.value = run
  selectedRun.value = null // Clear live selection
  clearAllMarkers()
  await drawHistoryRunOnMap(run)
}

/**
 * Draws history run on map with planned and actual routes
 */
async function drawHistoryRunOnMap (run) {
  if (!map.value || !run) return

  const bounds = new google.maps.LatLngBounds()

  // 1. Draw origin marker
  if (run.branch_office) {
    const originLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
    const originLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

    if (originLat && originLng) {
      const originMarker = new google.maps.Marker({
        position: { lat: originLat, lng: originLng },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF9800',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        },
        title: 'Origen'
      })
      courierMarkers.value.set('origin', originMarker)
      bounds.extend(originMarker.getPosition())
    }
  }

  // 2. Draw delivery markers
  const deliveryPoints = []
  const markers = []
  run.items?.forEach((item, index) => {
    const client = item.invoice?.client
    const lat = parseFloat(client?.address?.latitude || client?.latitude)
    const lng = parseFloat(client?.address?.longitude || client?.longitude)

    if (lat && lng) {
      const position = { lat, lng }
      deliveryPoints.push(position)

      const marker = new google.maps.Marker({
        position,
        map: map.value,
        label: {
          text: String(index + 1),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#F44336',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        },
        title: client?.name || 'Cliente'
      })
      markers.push(marker)
      bounds.extend(marker.getPosition())
    }
  })
  deliveryMarkers.value.set(run.id, markers)

  // 3. Draw planned route (blue)
  if (deliveryPoints.length > 1 && directionsService.value) {
    const waypoints = deliveryPoints.slice(1, -1).map(point => ({
      location: point,
      stopover: true
    }))

    try {
      const result = await directionsService.value.route({
        origin: deliveryPoints[0],
        destination: deliveryPoints[deliveryPoints.length - 1],
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      })

      const plannedRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        directions: result,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2196F3',
          strokeWeight: 4,
          strokeOpacity: 0.7
        }
      })

      if (!routePolylines.value.has(run.id)) {
        routePolylines.value.set(run.id, {})
      }
      routePolylines.value.get(run.id).planned = plannedRenderer
    } catch (error) {
      console.error('Error drawing planned route:', error)
    }
  }

  // 4. Draw actual GPS route (green)
  if (run.locations && run.locations.length > 1) {
    const gpsPath = run.locations.map(loc => ({
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude)
    })).reverse() // Reverse because locations are ordered desc

    const gpsPolyline = new google.maps.Polyline({
      path: gpsPath,
      geodesic: true,
      strokeColor: '#4CAF50',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map.value
    })

    if (!routePolylines.value.has(run.id)) {
      routePolylines.value.set(run.id, {})
    }
    routePolylines.value.get(run.id).actual = gpsPolyline

    // Extend bounds with GPS points
    gpsPath.forEach(point => bounds.extend(point))
  }

  // Fit map to show all markers
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
  }
}

/**
 * Formats date to readable string
 */
function formatDate (dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculates duration between two dates
 */
function calculateCompletedDuration (startTime, endTime) {
  if (!startTime || !endTime) return '-'
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.border {
  border-color: rgba(0, 0, 0, 0.12);
}

.border-dark {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
