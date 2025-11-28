<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          <q-icon name="route" color="primary" size="32px" class="q-mr-sm" />
          {{ deliveryRoute?.route_number || 'Nueva Ruta' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ deliveryRoute?.name || 'Construye tu ruta de entrega dinámicamente' }}
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          v-if="deliveryRoute && deliveryRoute.status === 'draft'"
          outline
          color="primary"
          label="Optimizar Ruta"
          icon="auto_fix_high"
          @click="optimizeRoute"
          :loading="optimizing"
        />
        <q-btn
          v-if="deliveryRoute && (deliveryRoute.status === 'draft' || deliveryRoute.status === 'assigned')"
          unelevated
          color="positive"
          label="Guardar Ruta"
          icon="save"
          @click="saveRoute"
          :loading="saving"
        />
        <q-btn
          flat
          color="grey-7"
          label="Volver"
          icon="arrow_back"
          @click="$router.back()"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left Panel - Route Configuration -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="settings" color="primary" />
              Configuración de Ruta
            </div>

            <!-- Route Type -->
            <q-select
              v-model="routeForm.route_type"
              :options="routeTypeOptions"
              label="Tipo de Ruta"
              outlined
              dense
              class="q-mb-md"
              :disable="!!deliveryRoute"
            >
              <template v-slot:prepend>
                <q-icon :name="routeForm.route_type === 'predefined' ? 'event_repeat' : 'edit_road'" />
              </template>
            </q-select>

            <!-- Operating Days (only for predefined) -->
            <q-select
              v-if="routeForm.route_type === 'predefined'"
              v-model="routeForm.operating_days"
              :options="daysOfWeek"
              label="Días de Operación"
              outlined
              dense
              multiple
              use-chips
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-select>

            <!-- Route Name -->
            <q-input
              v-model="routeForm.name"
              label="Nombre de la Ruta"
              outlined
              dense
              class="q-mb-md"
            />

            <!-- Courier Selection -->
            <q-select
              v-model="routeForm.courier"
              :options="couriers"
              option-label="name"
              option-value="id"
              label="Asignar Repartidor"
              outlined
              dense
              clearable
              class="q-mb-md"
              @update:model-value="onCourierChange"
              @popup-show="loadCouriers"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-select>

            <!-- Origin Branch -->
            <q-select
              v-model="routeForm.origin_branch"
              :options="branches"
              option-label="name"
              option-value="id"
              label="Sucursal de Origen"
              outlined
              dense
              class="q-mb-md"
              @popup-show="loadBranches"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>

            <!-- Notes -->
            <q-input
              v-model="routeForm.notes"
              label="Notas"
              type="textarea"
              outlined
              dense
              rows="3"
            />
          </q-card-section>

          <q-separator />

          <!-- Route Stats -->
          <q-card-section v-if="deliveryRoute">
            <div class="text-subtitle2 q-mb-sm">Estadísticas de Ruta</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-chip color="primary" text-color="white" icon="place" dense>
                  {{ deliveryRoute.total_stops || 0 }} paradas
                </q-chip>
              </div>
              <div class="col-6">
                <q-chip color="orange" text-color="white" icon="straighten" dense>
                  {{ deliveryRoute.total_distance_km || 0 }} km
                </q-chip>
              </div>
              <div class="col-12">
                <q-chip color="green" text-color="white" icon="schedule" dense>
                  {{ deliveryRoute.estimated_duration_minutes || 0 }} min estimados
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Add Client Section -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="add_location" color="positive" />
              Agregar Cliente
            </div>

            <!-- Client Search -->
            <q-select
              v-model="selectedClient"
              :options="filteredClients"
              option-label="name"
              option-value="id"
              label="Buscar Cliente"
              outlined
              dense
              use-input
              input-debounce="300"
              @filter="filterClients"
              @popup-show="() => loadClients()"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      {{ getClientAddress(scope.opt) }}
                    </q-item-label>
                    <q-item-label caption v-if="scope.opt.opening_hours">
                      <q-icon name="schedule" size="12px" />
                      {{ getOpeningHoursText(scope.opt.opening_hours) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-btn
              unelevated
              color="positive"
              :label="routeForm.route_type === 'predefined' ? 'Agregar Cliente' : 'Agregar a Ruta'"
              icon="add"
              class="full-width"
              :disable="!selectedClient"
              @click="routeForm.route_type === 'predefined' ? addClientToPredefinedRoute() : showProductDialog = true"
            />
          </q-card-section>
        </q-card>

        <!-- Stops List with Drag & Drop -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="list" color="primary" />
              Orden de Paradas ({{ stops.length }})
              <q-chip v-if="stops.length > 0" dense color="grey-3" class="q-ml-sm">
                Arrastra para reordenar
              </q-chip>
            </div>

            <div v-if="stops.length === 0" class="text-center text-grey-6 q-py-lg">
              <q-icon name="location_off" size="48px" />
              <div class="q-mt-sm">No hay paradas agregadas</div>
            </div>

            <draggable
              v-model="stops"
              item-key="id"
              handle=".drag-handle"
              @end="onStopReorder"
              class="stops-list"
            >
              <template #item="{ element, index }">
                <q-card
                  flat
                  bordered
                  class="stop-card q-mb-sm"
                  :class="{ 'stop-active': selectedStop?.id === element.id }"
                  @click="selectStop(element)"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center no-wrap">
                      <!-- Drag Handle -->
                      <q-icon
                        name="drag_indicator"
                        class="drag-handle cursor-move q-mr-sm"
                        color="grey-6"
                      />

                      <!-- Stop Number -->
                      <div class="stop-number q-mr-sm">
                        {{ index + 1 }}
                      </div>

                      <!-- Client Info -->
                      <div class="col">
                        <div class="text-body2 text-weight-medium">
                          {{ element.client?.name }}
                        </div>
                        <div class="text-caption text-grey-7">
                          {{ element.products?.length || 0 }} productos
                          <span v-if="element.distance_from_previous_km">
                            • {{ element.distance_from_previous_km }} km
                          </span>
                          <span v-if="element.estimated_time_from_previous_minutes">
                            • {{ element.estimated_time_from_previous_minutes }} min
                          </span>
                        </div>
                        <div v-if="element.client?.opening_hours" class="text-caption text-primary">
                          <q-icon name="schedule" size="12px" />
                          {{ getOpeningHoursText(element.client.opening_hours) }}
                        </div>
                      </div>

                      <!-- Actions -->
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        size="sm"
                        @click.stop="removeStop(element)"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </template>
            </draggable>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Panel - Map -->
      <div class="col-12 col-md-8">
        <q-card style="height: calc(100vh - 120px);">
          <div id="route-map" ref="mapContainer" style="width: 100%; height: 100%;"></div>
        </q-card>
      </div>
    </div>

    <!-- Product Selection Dialog (only for dynamic routes) -->
    <q-dialog v-if="routeForm.route_type === 'dynamic'" v-model="showProductDialog" persistent>
      <q-card style="min-width: 600px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Productos para {{ selectedClient?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- Product Search -->
          <q-input
            v-model="productSearch"
            label="Buscar producto"
            outlined
            dense
            class="q-mb-md"
            @update:model-value="(val) => loadProducts(val)"
            debounce="300"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Selected Products -->
          <div class="text-subtitle2 q-mb-sm">Productos Seleccionados ({{ selectedProducts.length }})</div>
          <q-list bordered separator class="rounded-borders q-mb-md" style="max-height: 300px; overflow-y: auto;">
            <q-item v-for="(item, index) in selectedProducts" :key="index">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.product.name }}</q-item-label>
                <q-item-label caption>
                  Precio: ${{ item.unit_price }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <q-input
                    v-model.number="item.quantity_ordered"
                    type="number"
                    dense
                    outlined
                    style="width: 80px;"
                    label="Cant."
                    min="0"
                    step="0.01"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    size="sm"
                    @click="removeProduct(index)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Available Products -->
          <div class="text-subtitle2 q-mb-sm">Productos Disponibles</div>
          <q-list bordered separator class="rounded-borders" style="max-height: 200px; overflow-y: auto;">
            <q-item
              v-for="product in filteredProducts"
              :key="product.id"
              clickable
              @click="addProduct(product)"
            >
              <q-item-section>
                <q-item-label>{{ product.name }}</q-item-label>
                <q-item-label caption>
                  Stock: {{ product.stock }} • Precio: ${{ product.price }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="add_circle" color="positive" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Agregar a Ruta"
            color="positive"
            :disable="selectedProducts.length === 0"
            @click="addStopToRoute"
            :loading="addingStop"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* global google */
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'
import draggable from 'vuedraggable'

const router = useRouter()
const routeParams = useRoute()
const $q = useQuasar()

// Refs
const mapContainer = ref(null)
const map = ref(null)
const deliveryRoute = ref(null)
const stops = ref([])
const selectedStop = ref(null)
const couriers = ref([])
const branches = ref([])
const clients = ref([])
const filteredClients = ref([])
const products = ref([])
const selectedClient = ref(null)
const selectedProducts = ref([])
const productSearch = ref('')
const showProductDialog = ref(false)
const saving = ref(false)
const optimizing = ref(false)
const addingStop = ref(false)

// Form
const routeForm = ref({
  name: '',
  route_type: 'dynamic',
  operating_days: [],
  courier: null,
  origin_branch: null,
  notes: ''
})

// Route type options
const routeTypeOptions = [
  { label: 'Dinámica', value: 'dynamic' },
  { label: 'Predefinida', value: 'predefined' }
]

// Days of week
const daysOfWeek = [
  { label: 'Lunes', value: 'monday' },
  { label: 'Martes', value: 'tuesday' },
  { label: 'Miércoles', value: 'wednesday' },
  { label: 'Jueves', value: 'thursday' },
  { label: 'Viernes', value: 'friday' },
  { label: 'Sábado', value: 'saturday' },
  { label: 'Domingo', value: 'sunday' }
]

// Map markers and paths
const originMarker = ref(null)
const stopMarkers = ref([])
const routePaths = ref([])

// Computed
const filteredProducts = computed(() => {
  if (!productSearch.value) return products.value

  const search = productSearch.value.toLowerCase()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.barcode?.toLowerCase().includes(search)
  )
})

onMounted(async () => {
  await loadInitialData()
  await initializeMap()

  // Set route type from query parameter
  if (routeParams.query.type) {
    routeForm.value.route_type = routeParams.query.type
  }

  if (routeParams.params.id) {
    await loadRoute()
  }

  // Listen for real-time updates
  if (deliveryRoute.value) {
    listenForUpdates()
  }
})

onUnmounted(() => {
  stopListening()
})

// Watch stops for real-time map updates
watch(stops, async () => {
  await nextTick()
  updateMapRoute()
}, { deep: true })

async function loadInitialData () {
  // No cargar nada al inicio - se cargará bajo demanda
}

async function loadCouriers () {
  if (couriers.value.length > 0) return
  try {
    const { data } = await api.get('delivery-persons')
    couriers.value = data || []
  } catch (error) {
    console.error('Error loading couriers:', error)
  }
}

async function loadBranches () {
  if (branches.value.length > 0) return
  try {
    const branchesRes = await api.get('/branch-offices')
    branches.value = branchesRes.data || []
  } catch (error) {
    console.error('Error loading branches:', error)
  }
}

async function loadClients (searchTerm = '') {
  try {
    const params = searchTerm ? { search: searchTerm } : {}
    const clientsRes = await api.get('clients', { params })
    clients.value = clientsRes.data || []
    filteredClients.value = clients.value
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

async function loadProducts (searchTerm = '') {
  try {
    const params = searchTerm ? { search: searchTerm } : {}
    const productsRes = await api.get('products', { params })
    products.value = productsRes.data || []
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

async function loadRoute () {
  try {
    const response = await api.get(`/delivery-routes/${routeParams.params.id}`)
    deliveryRoute.value = response.data.route
    stops.value = deliveryRoute.value.stops || []

    // Populate form
    routeForm.value = {
      name: deliveryRoute.value.name || '',
      courier: deliveryRoute.value.courier || null,
      origin_branch: deliveryRoute.value.originBranch || null,
      notes: deliveryRoute.value.notes || ''
    }

    // Update map
    await nextTick()
    updateMapRoute()
  } catch (error) {
    console.error('Error loading route:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la ruta'
    })
  }
}

async function initializeMap () {
  await loadGoogleMaps()

  map.value = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.603722, lng: -58.381592 },
    zoom: 12,
    mapTypeControl: false,
    fullscreenControl: true,
    streetViewControl: false,
    styles: darkMapStyles
  })
}

async function updateMapRoute () {
  // Clear existing markers and paths
  if (originMarker.value) {
    originMarker.value.setMap(null)
  }
  stopMarkers.value.forEach(marker => marker.setMap(null))
  stopMarkers.value = []
  routePaths.value.forEach(path => path.setMap(null))
  routePaths.value = []

  if (!routeForm.value.origin_branch || stops.value.length === 0) {
    return
  }

  // Add origin marker
  const origin = routeForm.value.origin_branch
  const originAddress = origin.address || {}
  const originLat = originAddress.latitude || origin.latitude
  const originLng = originAddress.longitude || origin.longitude

  if (originLat && originLng) {
    originMarker.value = new google.maps.Marker({
      position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#FF9800',
        fillOpacity: 1,
        strokeColor: '#fff',
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
  }

  // Add stop markers
  const bounds = new google.maps.LatLngBounds()
  if (originLat && originLng) {
    bounds.extend(new google.maps.LatLng(originLat, originLng))
  }

  stops.value.forEach((stop, index) => {
    const lat = stop.latitude
    const lng = stop.longitude

    if (!lat || !lng) return

    const marker = new google.maps.Marker({
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 11,
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      },
      label: {
        text: (index + 1).toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      title: stop.client?.name
    })

    stopMarkers.value.push(marker)
    bounds.extend(new google.maps.LatLng(lat, lng))

    // Add click listener
    marker.addListener('click', () => {
      selectStop(stop)
    })
  })

  // Fit bounds
  if (stopMarkers.value.length > 0 || originMarker.value) {
    map.value.fitBounds(bounds)
  }

  // Draw route
  await drawRoute()
}

async function drawRoute () {
  if (!routeForm.value.origin_branch || stops.value.length === 0) {
    return
  }

  const directionsService = new google.maps.DirectionsService()

  // Build waypoints
  const origin = routeForm.value.origin_branch
  const originAddress = origin.address || {}
  const originLat = originAddress.latitude || origin.latitude
  const originLng = originAddress.longitude || origin.longitude

  if (!originLat || !originLng) return

  // Draw route segments
  let prevLat = originLat
  let prevLng = originLng

  for (let i = 0; i < stops.value.length; i++) {
    const stop = stops.value[i]
    const stopLat = stop.latitude
    const stopLng = stop.longitude

    if (!stopLat || !stopLng) continue

    try {
      const result = await directionsService.route({
        origin: { lat: parseFloat(prevLat), lng: parseFloat(prevLng) },
        destination: { lat: parseFloat(stopLat), lng: parseFloat(stopLng) },
        travelMode: google.maps.TravelMode.DRIVING
      })

      const renderer = new google.maps.DirectionsRenderer({
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

      prevLat = stopLat
      prevLng = stopLng
    } catch (error) {
      console.error('Error drawing route segment:', error)
    }
  }
}

async function filterClients (val, update) {
  if (val === '') {
    update(async () => {
      await loadClients()
    })
  } else {
    update(async () => {
      await loadClients(val)
    })
  }
}

function getClientAddress (client) {
  if (!client.address) return 'Sin dirección'

  const addr = typeof client.address === 'string'
    ? JSON.parse(client.address)
    : client.address

  return addr.formattedAddress || addr.street || 'Sin dirección'
}

function getOpeningHoursText (openingHours) {
  if (!openingHours) return ''

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
  const todayHours = openingHours[today]

  if (!todayHours) return 'Cerrado hoy'

  return `${todayHours.open} - ${todayHours.close}`
}

function addProduct (product) {
  const existing = selectedProducts.value.find(p => p.product.id === product.id)
  if (existing) {
    $q.notify({
      type: 'warning',
      message: 'Producto ya agregado'
    })
    return
  }

  selectedProducts.value.push({
    product,
    product_id: product.id,
    quantity_ordered: 1,
    quantity_loaded: 1,
    unit_price: product.price
  })
}

function removeProduct (index) {
  selectedProducts.value.splice(index, 1)
}

async function addClientToPredefinedRoute () {
  if (!selectedClient.value) return

  // For predefined routes, just add client to stops list (no products yet)
  const newStop = {
    id: Date.now(), // Temporary ID
    client_id: selectedClient.value.id,
    client: selectedClient.value,
    stop_order: stops.value.length + 1,
    delivery_status: 'pending',
    latitude: selectedClient.value.address?.latitude,
    longitude: selectedClient.value.address?.longitude,
    products: [] // No products for predefined routes
  }

  stops.value.push(newStop)

  $q.notify({
    type: 'positive',
    message: 'Cliente agregado a la ruta'
  })

  // Reset
  selectedClient.value = null

  // Update map
  await nextTick()
  updateMapRoute()
}

async function addStopToRoute () {
  if (!selectedClient.value || selectedProducts.value.length === 0) {
    return
  }

  if (!deliveryRoute.value) {
    // Create route first
    await createRoute()
  }

  addingStop.value = true

  try {
    const response = await api.post(`/delivery-routes/${deliveryRoute.value.id}/stops`, {
      client_id: selectedClient.value.id,
      products: selectedProducts.value.map(p => ({
        product_id: p.product_id,
        quantity_ordered: p.quantity_ordered,
        quantity_loaded: p.quantity_loaded || p.quantity_ordered,
        unit_price: p.unit_price
      }))
    })

    stops.value.push(response.data.stop)

    $q.notify({
      type: 'positive',
      message: 'Parada agregada exitosamente'
    })

    // Reset
    selectedClient.value = null
    selectedProducts.value = []
    showProductDialog.value = false

    // Update map
    await nextTick()
    updateMapRoute()
  } catch (error) {
    console.error('Error adding stop:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al agregar parada'
    })
  } finally {
    addingStop.value = false
  }
}

async function createRoute () {
  try {
    const payload = {
      name: routeForm.value.name || 'Nueva Ruta',
      route_type: routeForm.value.route_type,
      courier_id: routeForm.value.courier?.id,
      origin_branch_id: routeForm.value.origin_branch?.id,
      notes: routeForm.value.notes
    }

    // Add operating days for predefined routes
    if (routeForm.value.route_type === 'predefined') {
      payload.operating_days = routeForm.value.operating_days.map(d => d.value || d)
      
      // Add clients from stops for predefined routes
      if (stops.value.length > 0) {
        payload.clients = stops.value.map((stop, index) => ({
          client_id: stop.client_id,
          stop_order: index + 1,
          estimated_time_minutes: 15
        }))
      }
    }

    const response = await api.post('/delivery-routes', payload)

    deliveryRoute.value = response.data.route

    $q.notify({
      type: 'positive',
      message: 'Ruta creada exitosamente'
    })

    // Update URL
    router.replace({ name: 'DeliveryRouteBuilder', params: { id: deliveryRoute.value.id } })

    // Listen for updates
    listenForUpdates()
  } catch (error) {
    console.error('Error creating route:', error)
    throw error
  }
}

async function saveRoute () {
  if (!deliveryRoute.value) {
    await createRoute()
    return
  }

  saving.value = true

  try {
    await api.patch(`/delivery-routes/${deliveryRoute.value.id}`, {
      name: routeForm.value.name,
      courier_id: routeForm.value.courier?.id,
      origin_branch_id: routeForm.value.origin_branch?.id,
      notes: routeForm.value.notes
    })

    $q.notify({
      type: 'positive',
      message: 'Ruta guardada exitosamente'
    })
  } catch (error) {
    console.error('Error saving route:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar la ruta'
    })
  } finally {
    saving.value = false
  }
}

async function onStopReorder () {
  if (!deliveryRoute.value) return

  // Update stop orders
  const reorderedStops = stops.value.map((stop, index) => ({
    id: stop.id,
    stop_order: index + 1
  }))

  try {
    await api.post(`/delivery-routes/${deliveryRoute.value.id}/stops/reorder`, {
      stops: reorderedStops
    })

    // Map will update automatically via watch
  } catch (error) {
    console.error('Error reordering stops:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al reordenar paradas'
    })
  }
}

async function removeStop (stop) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar parada de ${stop.client?.name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/delivery-routes/${deliveryRoute.value.id}/stops/${stop.id}`)

      const index = stops.value.findIndex(s => s.id === stop.id)
      if (index > -1) {
        stops.value.splice(index, 1)
      }

      $q.notify({
        type: 'positive',
        message: 'Parada eliminada'
      })
    } catch (error) {
      console.error('Error removing stop:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar parada'
      })
    }
  })
}

async function optimizeRoute () {
  if (!deliveryRoute.value || stops.value.length < 2) {
    $q.notify({
      type: 'warning',
      message: 'Se necesitan al menos 2 paradas para optimizar'
    })
    return
  }

  optimizing.value = true

  try {
    const response = await api.post(`/delivery-routes/${deliveryRoute.value.id}/optimize`)

    deliveryRoute.value = response.data.route
    stops.value = deliveryRoute.value.stops || []

    $q.notify({
      type: 'positive',
      message: 'Ruta optimizada exitosamente'
    })

    // Map will update automatically via watch
  } catch (error) {
    console.error('Error optimizing route:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al optimizar ruta'
    })
  } finally {
    optimizing.value = false
  }
}

function selectStop (stop) {
  selectedStop.value = stop

  // Center map on stop
  if (stop.latitude && stop.longitude) {
    map.value.panTo({
      lat: parseFloat(stop.latitude),
      lng: parseFloat(stop.longitude)
    })
    map.value.setZoom(15)
  }
}

function onCourierChange () {
  if (deliveryRoute.value) {
    saveRoute()
  }
}

function listenForUpdates () {
  if (!deliveryRoute.value) return

  const channel = echo.channel(`delivery-route.${deliveryRoute.value.id}`)

  channel.listen('.route.updated', async () => {
    await loadRoute()
  })
}

function stopListening () {
  if (deliveryRoute.value) {
    echo.leave(`delivery-route.${deliveryRoute.value.id}`)
  }
}
</script>

<style scoped>
.stop-card {
  transition: all 0.3s;
  cursor: pointer;
}

.stop-card:hover {
  background-color: rgba(33, 150, 243, 0.05);
}

.stop-active {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
}

.stop-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.drag-handle {
  cursor: move;
}

.drag-handle:hover {
  color: #2196F3;
}

.stops-list {
  min-height: 100px;
}
</style>
