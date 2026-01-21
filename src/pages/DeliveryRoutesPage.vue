<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          <q-icon name="route" color="primary" size="32px" class="q-mr-sm" />
          Rutas de Entrega
        </div>
        <div class="text-caption text-grey-7">
          Gestiona y monitorea las rutas de entrega
        </div>
      </div>
      <q-btn
        unelevated
        color="positive"
        label="Nueva Ruta"
        icon="add"
        @click="createRoute()"
      />
    </div>

    <!-- Routes List -->
    <q-card flat bordered>
      <q-card-section class="q-pa-none">
        <q-table
          :rows="routes"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="filter"
          flat
          v-model:pagination="paginationConfig"
          @request="setPagination"
        >
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:body-cell-route_number="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.route_number }}</div>
              <div class="text-caption text-grey-7">{{ props.row.name }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                dense
                size="sm"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-courier="props">
            <q-td :props="props">
              <div v-if="props.row.courier">
                <q-icon name="person" size="16px" class="q-mr-xs" />
                {{ props.row.courier.name }}
              </div>
              <div v-else class="text-grey-6">Sin asignar</div>
            </q-td>
          </template>

          <template v-slot:body-cell-distance="props">
            <q-td :props="props">
              <div>
                <q-icon name="straighten" size="16px" class="q-mr-xs" />
                {{ props.row.total_distance_km || 0 }} km
              </div>
              <div class="text-caption text-grey-7">
                <q-icon name="schedule" size="14px" />
                {{ props.row.estimated_duration_minutes || 0 }} min
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="visibility"
                color="primary"
                size="sm"
                @click="viewRoute(props.row)"
              >
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'draft' || props.row.status === 'assigned'"
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click="editRoute(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="deleteRoute(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <!-- Route Details Dialog (Minimalist Preview) -->
    <q-dialog v-model="showDetailsDialog">
      <q-card class="preview-card" style="width: 900px; max-width: 95vw;">
        <div class="row no-wrap" style="height: 500px;">
          <!-- Left Panel: Info & Stops -->
          <div
            class="col-4 flex flex-column"
            :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'"
            :style="{ borderRight: `1px solid ${$q.dark.isActive ? '#444' : '#eee'}` }"
          >
            <q-card-section class="q-pb-none">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle2 text-grey-7 font-mono">{{ selectedRoute?.route_number }}</div>
                  <div class="text-h6 text-weight-bold truncate" style="max-width: 250px;">
                    {{ selectedRoute?.name || 'Ruta sin nombre' }}
                  </div>
                </div>
                <q-btn
                  icon="edit"
                  flat
                  round
                  dense
                  v-close-popup
                  color="grey-7"
                  size="sm"
                  @click="editRoute(selectedRoute)"
                />
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  v-close-popup
                  color="grey-7"
                  size="sm"
                />
              </div>

              <!-- Partner & Courier Info -->
              <div class="column q-mt-sm q-gutter-y-xs">
                <div class="row items-center no-wrap text-caption text-weight-medium" v-if="selectedRoute?.partner">
                  <q-icon name="handshake" size="16px" color="primary" class="q-mr-xs" />
                  <span class="truncate">{{ selectedRoute.partner.name }}</span>
                </div>
                <div class="row items-center no-wrap text-caption text-grey-7" v-if="selectedRoute?.courier">
                  <q-icon name="person" size="16px" class="q-mr-xs" />
                  <span class="truncate">{{ selectedRoute.courier.name }}</span>
                </div>
              </div>
              <div class="row q-mt-sm text-caption text-grey-6 q-gutter-x-md">
                <div v-if="selectedRoute?.total_distance_km" class="row items-center">
                  <q-icon name="straighten" class="q-mr-xs" /> {{ selectedRoute.total_distance_km }} km
                </div>
                <div v-if="selectedRoute?.estimated_duration_minutes" class="row items-center">
                  <q-icon name="schedule" class="q-mr-xs" /> {{ selectedRoute.estimated_duration_minutes }} min
                </div>
              </div>
            </q-card-section>

            <q-separator q-mt-md />

            <q-card-section class="q-pa-none overflow-auto" style="flex: 1;">
              <div
                class="text-subtitle2 text-weight-bold"
                :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-8'"
              >
                Paradas ({{ previewStops.length }})
              </div>
              <q-list dense padding>
                <q-item v-for="(stop, index) in previewStops" :key="stop.id" class="q-py-sm">
                  <q-item-section avatar style="min-width: 32px;">
                    <div class="stop-num">{{ index + 1 }}</div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium text-body2 truncate">
                      {{ stop.client?.name }}
                    </q-item-label>
                    <q-item-label caption class="text-truncate-2 text-grey-6" style="line-height: 1.2; font-size: 11px;">
                      {{ getClientAddress(stop.client) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="stop.delivery_status">
                    <q-icon
                      :name="stop.delivery_status === 'delivered' ? 'check_circle' : 'radio_button_unchecked'"
                      :color="getStopColor(stop.delivery_status)"
                      size="18px"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </div>

          <!-- Right Panel: Map Preview -->
          <div class="col-8 relative-position">
            <div id="preview-map" ref="mapContainer" style="width: 100%; height: 100%;"></div>
            <!-- Empty state for map -->
            <div v-if="!previewStops.length" class="absolute-center text-center text-grey-5">
              <q-icon name="map" size="48px" />
              <div>Sin paradas para mostrar</div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const router = useRouter()
const $q = useQuasar()

// Refs
const routes = ref([])
const couriers = ref([])
const loading = ref(false)
const showDetailsDialog = ref(false)
const selectedRoute = ref(null)
const filter = ref('')

// Map Preview Refs
const mapContainer = ref(null)
const map = ref(null)
const stopMarkers = ref([])
const routePaths = ref([])
const mapReady = ref(false)

// Computed stops for preview (handling different possible field names)
const previewStops = computed(() => {
  if (!selectedRoute.value) return []
  return selectedRoute.value.stops ||
         selectedRoute.value.route_clients ||
         selectedRoute.value.routeClients ||
         []
})

// Pagination config (like ProductPage)
const paginationConfig = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

// Params for API (like ProductPage)
const params = ref({
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  perPage: 15,
  paginate: 'true',
  dataSearch: {},
  dataEqualFilter: {}
})

// Table columns
const columns = [
  {
    name: 'route_number',
    label: 'Ruta',
    field: 'route_number',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'partner',
    label: 'Jefe de ruta',
    field: 'partner',
    format: row => `${row?.name || '-'}`,
    align: 'left',
    sortable: true
  },
  {
    name: 'courier',
    label: 'Repartidor',
    field: 'courier',
    align: 'left',
    sortable: true
  },
  {
    name: 'distance',
    label: 'Distancia/Tiempo',
    field: 'total_distance_km',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

onMounted(() => {
  loadCouriers()
  setPagination({
    pagination: paginationConfig.value,
    filter: undefined
  })
})

// Watch filter
watch(filter, () => {
  params.value.page = 1
  getRoutes(params.value)
})

// Wash Dialog for map initialization
watch(showDetailsDialog, async (val) => {
  if (val) {
    await nextTick()
    await initializePreviewMap()
    await updatePreviewMap()
  } else {
    // Clear map refs
    map.value = null
    stopMarkers.value = []
    routePaths.value = []
  }
})

/**
 * Initializes the Google Map for the route preview
 */
async function initializePreviewMap () {
  try {
    await loadGoogleMaps()
    if (!mapContainer.value) return

    const google = window.google
    const isDarkMode = $q.dark.isActive
    const center = { lat: -34.6037, lng: -58.3816 } // Default (Buenos Aires)

    map.value = new google.maps.Map(mapContainer.value, {
      center,
      zoom: 12,
      styles: isDarkMode ? darkMapStyles : [],
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative'
    })

    mapReady.value = true
  } catch (error) {
    console.error('Error initializing preview map:', error)
  }
}

/**
 * Updates the preview map with markers and route paths
 */
async function updatePreviewMap () {
  if (!map.value || !selectedRoute.value) return

  const google = window.google
  const stops = previewStops.value

  // Clear existing markers/paths
  stopMarkers.value.forEach(m => m.setMap(null))
  stopMarkers.value = []
  routePaths.value.forEach(p => p.setMap(null))
  routePaths.value = []

  if (stops.length === 0) return

  const bounds = new google.maps.LatLngBounds()

  // Add stops markers
  stops.forEach((stop, index) => {
    const lat = parseFloat(stop.latitude)
    const lng = parseFloat(stop.longitude)

    if (isNaN(lat) || isNaN(lng)) return

    const position = { lat, lng }
    bounds.extend(position)

    const marker = new google.maps.Marker({
      position,
      map: map.value,
      label: {
        text: (index + 1).toString(),
        color: 'white',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: getStopColor(stop.delivery_status),
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 14
      },
      title: stop.client?.name || 'Parada'
    })

    stopMarkers.value.push(marker)
  })

  // Draw simple path between stops if coordinates exist
  const pathCoordinates = stops
    .map(s => ({ lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }))
    .filter(c => !isNaN(c.lat) && !isNaN(c.lng))

  if (pathCoordinates.length > 1) {
    const routePath = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#2196F3',
      strokeOpacity: 0.8,
      strokeWeight: 4
    })

    routePath.setMap(map.value)
    routePaths.value.push(routePath)
  }

  // Adjust map to fit bounds
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
    // Avoid too much zoom if only one stop
    if (stops.length === 1) {
      map.value.setZoom(15)
    }
  }
}

async function loadCouriers () {
  try {
    const { data } = await api.get('delivery-persons')
    couriers.value = data || []
  } catch (error) {
    console.error('Error loading couriers:', error)
  }
}

function getRoutes (params = params.value) {
  loading.value = true
  api.get('delivery-routes', { params })
    .then(({ data }) => {
      routes.value = data.data || []
      paginationConfig.value.rowsNumber = data.total || 0
      loading.value = false
    })
    .catch(err => {
      loading.value = false
      $q.notify({
        message: err.message || 'Error al cargar las rutas',
        icon: 'warning',
        color: 'negative'
      })
    })
}

function setPagination (data) {
  params.value.sortOrder = data.pagination.descending ? 'desc' : 'asc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getRoutes(params.value)
}

function applyFilters (dataEqualFilter) {
  params.value.dataEqualFilter = dataEqualFilter
  params.value.page = 1
  getRoutes(params.value)
}

function createRoute () {
  router.push({ name: 'DeliveryRouteBuilder' })
}

function editRoute (route) {
  router.push({ name: 'DeliveryRouteBuilder', params: { id: route.id } })
}

function viewRoute (route) {
  selectedRoute.value = route
  showDetailsDialog.value = true
}

async function deleteRoute (route) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la ruta ${route.route_number}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`delivery-routes/${route.id}`)

      $q.notify({
        type: 'positive',
        message: 'Ruta eliminada exitosamente'
      })

      getRoutes(params.value)
    } catch (error) {
      console.error('Error deleting route:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar la ruta'
      })
    }
  })
}

function getStatusColor (status) {
  const colors = {
    draft: 'grey',
    assigned: 'blue',
    in_progress: 'orange',
    completed: 'positive',
    cancelled: 'negative'
  }
  return colors[status] || 'grey'
}

function getStatusLabel (status) {
  const labels = {
    draft: 'Borrador',
    assigned: 'Asignada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status] || status
}

function getStopColor (status) {
  const colors = {
    pending: 'grey',
    arrived: 'orange',
    delivered: 'positive',
    failed: 'negative',
    skipped: 'grey-5'
  }
  return colors[status] || 'grey'
}

function getClientAddress (client) {
  if (!client?.address) return ''

  if (typeof client.address === 'string') {
    return client.address
  }

  if (typeof client.address === 'object') {
    return client.address.formattedAddress || client.address.street || ''
  }

  return ''
}
</script>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stop-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #2196FB;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.3);
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

#preview-map {
  background-color: #f8f9fa;
  border-left: 1px solid rgba(0,0,0,0.05);
}

.preview-card {
  border-radius: 12px !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2) !important;
  overflow: hidden;
}

.font-mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.5px;
}

/* Custom Scrollbar for the stops list */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
.body--dark .overflow-auto::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
}
.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.2);
}
</style>
