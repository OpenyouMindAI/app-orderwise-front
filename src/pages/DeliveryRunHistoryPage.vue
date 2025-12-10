<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Filters Section -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section>
            <div class="row q-col-gutter-md items-end">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.startDate"
                  label="Fecha Inicio"
                  type="date"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filters.endDate"
                  label="Fecha Fin"
                  type="date"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="filters.deliveryPerson"
                  :options="deliveryPersonOptions"
                  label="Repartidor"
                  outlined
                  dense
                  clearable
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-2">
                <q-btn
                  color="primary"
                  label="Buscar"
                  icon="search"
                  @click="loadDeliveryRuns"
                  :loading="loading"
                  class="full-width"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- List Section -->
      <div class="col-12 col-md-5">
        <q-card flat bordered style="height: calc(100vh - 220px); overflow-y: auto;">
          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item
                v-for="run in deliveryRuns"
                :key="run.id"
                clickable
                @click="selectRun(run)"
                :active="selectedRun?.id === run.id"
                active-class="bg-primary text-white"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    <q-icon name="local_shipping" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    Recorrido #{{ run.id }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ run.delivery_person?.name || 'Repartidor' }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ formatDate(run.started_at) }} - {{ formatDate(run.completed_at) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="column items-end">
                    <q-badge color="positive" :label="`${run.items?.length || 0} entregas`" />
                    <div class="text-caption q-mt-xs">
                      {{ calculateDuration(run.started_at, run.completed_at) }}
                    </div>
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="deliveryRuns.length === 0 && !loading">
                <q-item-section class="text-center text-grey">
                  <q-icon name="inbox" size="48px" class="q-mb-sm" />
                  <div>No se encontraron recorridos</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-inner-loading :showing="loading">
            <q-spinner-dots size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>

      <!-- Map Section -->
      <div class="col-12 col-md-7">
        <q-card flat bordered style="height: calc(100vh - 220px); position: relative;">
          <div ref="mapContainer" style="width: 100%; height: 100%;"></div>

          <!-- No Selection State -->
          <div
            v-if="!selectedRun"
            class="absolute-center text-center"
            style="z-index: 1000;"
          >
            <q-icon name="map" size="64px" color="grey" class="q-mb-md" />
            <div class="text-h6 text-grey">Selecciona un recorrido</div>
            <div class="text-caption text-grey">para ver la ruta en el mapa</div>
          </div>

          <!-- Legend -->
          <div
            v-if="selectedRun"
            class="absolute-bottom-right q-ma-md"
            style="z-index: 1000;"
          >
            <q-card>
              <q-card-section class="q-pa-sm">
                <div class="text-caption text-weight-bold q-mb-xs">Leyenda</div>
                <div class="row items-center q-mb-xs">
                  <div style="width: 20px; height: 3px; background: #2196F3;" class="q-mr-xs"></div>
                  <div class="text-caption">Ruta planificada</div>
                </div>
                <div class="row items-center q-mb-xs">
                  <div style="width: 20px; height: 3px; background: #4CAF50;" class="q-mr-xs"></div>
                  <div class="text-caption">Ruta real (GPS)</div>
                </div>
                <div class="row items-center q-mb-xs">
                  <q-icon name="home" color="orange" size="16px" class="q-mr-xs" />
                  <div class="text-caption">Origen</div>
                </div>
                <div class="row items-center">
                  <q-icon name="place" color="red" size="16px" class="q-mr-xs" />
                  <div class="text-caption">Entregas</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const $q = useQuasar()

// Refs
const mapContainer = ref(null)
const map = ref(null)
const loading = ref(false)
const deliveryRuns = ref([])
const selectedRun = ref(null)
const deliveryPersonOptions = ref([])

// Filters
const filters = ref({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  deliveryPerson: null
})

// Map objects
const markers = ref([])
const polylines = ref([])

onMounted(async () => {
  await initializeMap()
  await loadDeliveryPersons()
  await loadDeliveryRuns()
})

/**
 * Initializes Google Maps
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

    console.log('Map initialized')
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

/**
 * Loads delivery persons for filter
 */
async function loadDeliveryPersons () {
  try {
    const response = await api.get('/users', {
      params: { role: 'delivery' }
    })
    deliveryPersonOptions.value = response.data.users || []
  } catch (error) {
    console.error('Error loading delivery persons:', error)
  }
}

/**
 * Loads completed delivery runs
 */
async function loadDeliveryRuns () {
  loading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/history', {
      params: {
        start_date: filters.value.startDate,
        end_date: filters.value.endDate,
        delivery_person_id: filters.value.deliveryPerson
      }
    })
    deliveryRuns.value = response.data.delivery_runs || []
    console.log('Loaded delivery runs:', deliveryRuns.value.length)
  } catch (error) {
    console.error('Error loading delivery runs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar recorridos',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Selects a delivery run and displays it on map
 */
async function selectRun (run) {
  selectedRun.value = run
  clearMap()
  await drawRunOnMap(run)
}

/**
 * Draws the selected run on the map
 */
async function drawRunOnMap (run) {
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
      markers.value.push(originMarker)
      bounds.extend(originMarker.getPosition())
    }
  }

  // 2. Draw delivery markers
  const deliveryPoints = []
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
      markers.value.push(marker)
      bounds.extend(marker.getPosition())
    }
  })

  // 3. Draw planned route (blue)
  if (deliveryPoints.length > 1) {
    const directionsService = new google.maps.DirectionsService()
    const waypoints = deliveryPoints.slice(1, -1).map(point => ({
      location: point,
      stopover: true
    }))

    try {
      const result = await directionsService.route({
        origin: deliveryPoints[0],
        destination: deliveryPoints[deliveryPoints.length - 1],
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      })

      const plannedPolyline = new google.maps.DirectionsRenderer({
        map: map.value,
        directions: result,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2196F3',
          strokeWeight: 4,
          strokeOpacity: 0.7
        }
      })
      polylines.value.push(plannedPolyline)
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
    polylines.value.push(gpsPolyline)

    // Extend bounds with GPS points
    gpsPath.forEach(point => bounds.extend(point))
  }

  // Fit map to show all markers
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
  }
}

/**
 * Clears all markers and polylines from map
 */
function clearMap () {
  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  polylines.value.forEach(polyline => {
    if (polyline.setMap) {
      polyline.setMap(null)
    }
  })
  polylines.value = []
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
function calculateDuration (startTime, endTime) {
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
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
