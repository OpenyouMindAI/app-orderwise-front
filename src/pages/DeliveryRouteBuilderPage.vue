<template>
  <q-page>
    <DeliveryRouteBuilderSkeleton v-if="loadingInitial" />
    <template v-else>
      <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-weight-bold">
          <q-btn
            flat
            color="grey-7"
            icon="arrow_back"
            round
            @click="$router.back()"
        />
          <q-icon name="route" color="primary" size="32px" class="q-mr-sm" />
          {{ deliveryRoute?.route_number || 'Nueva Ruta' }}
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          unelevated
          color="positive"
          label="Guardar Ruta"
          icon="save"
          @click="saveRoute"
          :loading="saving"
          :disable="stops.length === 0"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left Panel - Route Configuration -->
      <div class="col-12 col-sm-4 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="settings" color="primary" />
              Configuración de Ruta
            </div>

            <!-- Route Name -->
            <q-input
              v-model="routeForm.name"
              label="Nombre de la Ruta"
              outlined
              dense
              class="q-mb-md"
            />

            <!-- Partner Selection -->
            <q-select
              v-model="selectedPartner"
              :options="partners"
              option-label="name"
              option-value="id"
              label="Seleccionar Afiliado (Cargar Clientes)"
              outlined
              dense
              clearable
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              class="q-mb-md"
              @update:model-value="onPartnerChange"
              @filter="filterPartners"
            >
              <template v-slot:prepend>
                <q-icon name="handshake" />
              </template>
            </q-select>

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
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              class="q-mb-md"
              @update:model-value="onCourierChange"
              @filter="filterCouriers"
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
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              class="q-mb-md"
              @filter="filterBranches"
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
              :options="clients"
              option-label="name"
              option-value="id"
              label="Buscar Cliente"
              outlined
              dense
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              @filter="filterClients"
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
              label="Agregar Cliente"
              icon="add"
              class="full-width"
              :disable="!selectedClient"
              @click="addClientToPredefinedRoute()"
            />
          </q-card-section>
        </q-card>

        <!-- Stops List with Drag & Drop -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="list" color="primary" />
                  Orden de Paradas ({{ stops.length }})
                </div>
                <div v-if="totalDistance || totalDuration" class="text-caption text-grey-7 q-mt-xs">
                  <q-icon name="route" size="14px" />
                  {{ totalDistance }}
                  <span v-if="totalDuration">
                    • <q-icon name="schedule" size="14px" />
                    {{ totalDuration }}
                  </span>
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="stops.length > 1"
                  unelevated
                  color="primary"
                  icon="route"
                  label="Optimizar Ruta"
                  size="sm"
                  @click="optimizeRoute"
                  :loading="optimizing"
                >
                  <q-tooltip>Reordenar paradas para minimizar distancia y tiempo</q-tooltip>
                </q-btn>
              </div>
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

                      <!-- Stop Reorder Controls -->
                      <div class="column items-center q-mr-sm stop-controls">
                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          icon="keyboard_arrow_up"
                          color="primary"
                          :disable="index === 0"
                          @click.stop="moveStopUp(index)"
                        >
                          <q-tooltip>Mover arriba</q-tooltip>
                        </q-btn>

                        <div class="stop-position-wrapper">
                          <input
                            type="number"
                            :value="index + 1"
                            class="stop-position-input"
                            @change="e => updateStopPosition(element, e.target.value)"
                            @click.stop
                          />
                        </div>

                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          icon="keyboard_arrow_down"
                          color="primary"
                          :disable="index === stops.length - 1"
                          @click.stop="moveStopDown(index)"
                        >
                          <q-tooltip>Mover abajo</q-tooltip>
                        </q-btn>
                      </div>

                      <!-- Client Info -->
                      <div class="col">
                        <div class="text-body2 text-weight-medium">
                          {{ element.client?.name }}
                        </div>
                        <div class="text-caption text-grey-7">
                          <span v-if="element.distance_text">
                            <q-icon name="route" size="14px" />
                            {{ element.distance_text }}
                          </span>
                          <span v-if="element.duration_text">
                            <span v-if="element.distance_text"> • </span>
                            <q-icon name="schedule" size="14px" />
                            {{ element.duration_text }}
                          </span>
                          <span v-if="!element.distance_text && !element.duration_text && index === 0">
                            <q-icon name="flag" size="14px" />
                            Punto de inicio
                          </span>
                        </div>
                        <div v-if="element.client?.opening_hours" class="text-caption text-primary">
                          <q-icon name="schedule" size="14px" />
                          {{ getOpeningHoursText(element.client.opening_hours) }}
                        </div>
                        <!-- Warning for clients without address -->
                        <div v-if="!element.latitude || !element.longitude" class="text-caption text-warning q-mt-xs">
                          <q-icon name="warning" size="14px" />
                          Sin dirección - No se muestra en el mapa
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="row q-gutter-xs">
                        <!-- Edit address button -->
                        <q-btn
                          v-if="!element.latitude || !element.longitude"
                          flat
                          dense
                          round
                          icon="edit_location"
                          color="primary"
                          size="sm"
                          @click.stop="editStopAddress(element)"
                        >
                          <q-tooltip>Agregar dirección</q-tooltip>
                        </q-btn>
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
                    </div>
                  </q-card-section>
                  <q-inner-loading :showing="reorderingStopId === element.id">
                    <q-spinner-dots color="primary" />
                  </q-inner-loading>
                </q-card>
              </template>
            </draggable>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Panel - Map -->
      <div class="col-12 col-sm-8 col-md-8">
        <q-card style="height: calc(100vh - 120px);">
          <div id="route-map" ref="mapContainer" style="width: 100%; height: 100%;"></div>
        </q-card>
      </div>
    </div>

    <!-- Modal para agregar dirección al cliente -->
    <q-dialog v-model="showAddressModal" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="warning" color="warning" size="24px" class="q-mr-sm" />
            Dirección requerida
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelAddressModal" />
        </q-card-section>

        <q-card-section>
          <!-- Client name with transition -->
          <transition name="fade-slide" mode="out-in">
            <div :key="clientWithoutAddress?.id" class="client-name-container q-mb-md">
              <div class="text-h5 text-weight-bold text-primary q-mb-xs">
                {{ clientWithoutAddress?.name }}
              </div>
              <div class="text-body2 text-grey-7">
                Por favor, ingresa la dirección para poder agregarlo a la ruta.
              </div>
            </div>
          </transition>

          <AddressComponent
            ref="addressComponentRef"
            label="Dirección del cliente"
            @address-selected="onAddressSelected"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            label="Omitir"
            color="grey-7"
            @click="skipClientAddress"
          />
          <q-space />
          <q-btn
            unelevated
            label="Guardar y Agregar"
            color="primary"
            :disable="!newClientAddress"
            :loading="savingClientAddress"
            @click="saveClientAddressAndAdd"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
      </div>
    </template>
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
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import DeliveryRouteBuilderSkeleton from 'src/components/Skeletons/DeliveryRouteBuilderSkeleton.vue'

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
const selectedClient = ref(null)
const partners = ref([])
const selectedPartner = ref(null)
const saving = ref(false)
const optimizing = ref(false)
const loadingInitial = ref(true)

/**
 * Modal state for adding address to client
 * @type {boolean}
 */
const showAddressModal = ref(false)

/**
 * Client that needs an address
 * @type {object|null}
 */
const clientWithoutAddress = ref(null)

/**
 * New address selected for the client
 * @type {object|null}
 */
const newClientAddress = ref(null)

/**
 * Loading state for saving client address
 * @type {boolean}
 */
const savingClientAddress = ref(false)

/**
 * Reference to the AddressComponent
 * @type {object|null}
 */
const addressComponentRef = ref(null)

/**
 * The actual stop being edited (if in edit mode)
 * @type {object|null}
 */
const stopBeingEdited = ref(null)

/**
 * Queue of clients from partner that need address processing
 * @type {array}
 */
const clientsQueue = ref([])

/**
 * Current index in the clients queue being processed
 * @type {number}
 */
const currentClientIndex = ref(0)

/**
 * Flag to indicate if we're processing partner clients
 * @type {boolean}
 */
const processingPartnerClients = ref(false)

/**
 * ID of the stop currently being reordered
 * @type {number|null}
 */
const reorderingStopId = ref(null)

// Form
const routeForm = ref({
  name: '',
  courier: null,
  origin_branch: null,
  notes: ''
})

// Map markers and paths
const originMarker = ref(null)
const stopMarkers = ref([])
const routePaths = ref([])

// Computed properties
const totalDistance = computed(() => {
  if (stops.value.length === 0) return ''

  const totalMeters = stops.value.reduce((sum, stop) => {
    return sum + (stop.distance_value || 0)
  }, 0)

  if (totalMeters === 0) return ''

  if (totalMeters >= 1000) {
    return `${(totalMeters / 1000).toFixed(1)} km`
  }
  return `${totalMeters} m`
})

const totalDuration = computed(() => {
  if (stops.value.length === 0) return ''

  const totalSeconds = stops.value.reduce((sum, stop) => {
    return sum + (stop.duration_value || 0)
  }, 0)

  if (totalSeconds === 0) return ''

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
})

onMounted(async () => {
  try {
    // Load initial data while showing skeleton
    await loadInitialData()

    if (routeParams.params.id) {
      await loadRoute()
    }

    // Hide skeleton and wait for DOM update to ensure mapContainer is available
    loadingInitial.value = false
    await nextTick()

    // Now safe to initialize map
    await initializeMap()

    // Draw existing route if stops exist
    if (stops.value.length > 0) {
      await updateMapRoute()
    }

    // Listen for real-time updates
    if (deliveryRoute.value) {
      listenForUpdates()
    }
  } catch (error) {
    console.error('Error in onMounted:', error)
    loadingInitial.value = false
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

function filterCouriers (value, update) {
  api.get('delivery-persons', {
    params: {
      sortBy: 'id',
      sortOrder: 'desc',
      dataSearch: {
        name: value
      }
    }
  })
    .then(({ data }) => {
      update(() => {
        couriers.value = data || []
      })
    })
    .catch(err => {
      console.error('Error loading couriers:', err)
      $q.notify({
        type: 'negative',
        message: 'Error al buscar repartidores',
        icon: 'warning'
      })
    })
}

function filterBranches (value, update) {
  api.get('/branch-offices', {
    params: {
      sortBy: 'id',
      sortOrder: 'desc',
      dataSearch: {
        name: value
      }
    }
  })
    .then(({ data }) => {
      update(() => {
        branches.value = data || []
      })
    })
    .catch(err => {
      console.error('Error loading branches:', err)
      $q.notify({
        type: 'negative',
        message: 'Error al buscar sucursales',
        icon: 'warning'
      })
    })
}

/**
 * Filters the list of partners based on the input value.
 * @params {string} value The search term to filter partners by.
 * @params {function} update The Quasar update function to refresh the options list.
 * @return {void}
 */
function filterPartners (value, update) {
  api.get('partners', {
    params: {
      sortBy: 'id',
      sortOrder: 'desc',
      dataSearch: {
        name: value,
        document_number: value
      }
    }
  })
    .then(({ data }) => {
      update(() => {
        partners.value = data || []
      })
    })
    .catch(err => {
      console.error('Error loading partners:', err)
      $q.notify({
        type: 'negative',
        message: 'Error al buscar socios',
        icon: 'warning'
      })
    })
}

/**
 * Handles the event when a partner is selected.
 * Fetches all clients associated with the selected partner and adds them as stops.
 * @params {object} partner The selected partner object.
 * @return {Promise<void>}
 */
async function onPartnerChange (partner) {
  if (!partner) return

  $q.loading.show({
    message: `Cargando clientes de ${partner.name}...`
  })

  try {
    const data = partner.clients || []

    if (data && data.length > 0) {
      // Filter out clients already in the stops list
      const existingClientIds = stops.value.map(s => s.client_id)
      const newClients = data.filter(c => !existingClientIds.includes(c.id))

      if (newClients.length === 0) {
        $q.loading.hide()
        $q.notify({
          type: 'info',
          message: 'Todos los clientes de este socio ya están en la ruta',
          icon: 'info'
        })
        return
      }

      // Initialize queue for processing clients
      clientsQueue.value = [...newClients]
      currentClientIndex.value = 0
      processingPartnerClients.value = true

      $q.loading.hide()

      // Notify if some clients were skipped
      if (newClients.length < data.length) {
        $q.notify({
          type: 'info',
          message: `Se omitieron ${data.length - newClients.length} clientes que ya estaban en la ruta`,
          timeout: 2000
        })
      }

      // Start processing clients one by one
      await processNextClientInQueue()
    } else {
      $q.loading.hide()
      $q.notify({
        type: 'warning',
        message: 'El socio seleccionado no tiene clientes asociados'
      })
    }
  } catch (err) {
    console.error('Error loading partner clients:', err)
    $q.loading.hide()
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los clientes del socio'
    })
  }
}

/**
 * Processes the next client in the queue from partner selection
 * @return {Promise<void>}
 */
async function processNextClientInQueue () {
  if (!processingPartnerClients.value || currentClientIndex.value >= clientsQueue.value.length) {
    // Finished processing all clients
    processingPartnerClients.value = false
    clientsQueue.value = []
    currentClientIndex.value = 0

    // Show summary
    const withoutAddress = stops.value.filter(s => !s.latitude || !s.longitude).length

    $q.notify({
      type: 'positive',
      message: `Se procesaron ${stops.value.length} clientes`,
      caption: withoutAddress > 0 ? `${withoutAddress} sin dirección (no se muestran en el mapa)` : ''
    })

    await nextTick()
    updateMapRoute()
    return
  }

  const client = clientsQueue.value[currentClientIndex.value]

  // Extract coordinates
  let lat = null
  let lng = null
  const clientAddress = client.address

  if (clientAddress) {
    if (typeof clientAddress === 'string') {
      try {
        const parsed = JSON.parse(clientAddress)
        lat = parsed.latitude
        lng = parsed.longitude
      } catch (e) {
        console.warn('Could not parse client address:', clientAddress)
      }
    } else if (typeof clientAddress === 'object') {
      lat = clientAddress.latitude
      lng = clientAddress.longitude
    }
  }

  lat = lat || client.latitude
  lng = lng || client.longitude

  if (!lat || !lng) {
    // Client doesn't have address - show modal
    clientWithoutAddress.value = client
    newClientAddress.value = null
    showAddressModal.value = true
    // Modal actions will handle continuing the queue
  } else {
    // Client has address - add directly
    const newStop = {
      id: Date.now() + currentClientIndex.value,
      client_id: client.id,
      client,
      stop_order: stops.value.length + 1,
      delivery_status: 'pending',
      latitude: lat,
      longitude: lng,
      products: []
    }
    stops.value.push(newStop)

    // Move to next client
    currentClientIndex.value++
    await processNextClientInQueue()
  }
}

async function loadRoute () {
  try {
    const response = await api.get(`/delivery-routes/${routeParams.params.id}`)
    deliveryRoute.value = response.data.route
    // Process routeClients (static routes) - API returns snake_case
    const routeClients = deliveryRoute.value.route_clients || deliveryRoute.value.routeClients || deliveryRoute.value.stops || []
    stops.value = routeClients.map((stop, index) => {
      // Extract latitude and longitude from client address
      let lat = stop.latitude
      let lng = stop.longitude

      // If stop doesn't have coordinates, try to get from client
      if ((!lat || !lng) && stop.client) {
        const clientAddress = stop.client.address

        if (clientAddress) {
          // If address is a JSON string, parse it
          if (typeof clientAddress === 'string') {
            try {
              const parsed = JSON.parse(clientAddress)
              lat = lat || parsed.latitude
              lng = lng || parsed.longitude
            } catch (e) {
              // If parsing fails, address might be a plain string
              console.warn('Could not parse client address:', clientAddress)
            }
          } else if (typeof clientAddress === 'object') {
            // If address is already an object
            lat = lat || clientAddress.latitude
            lng = lng || clientAddress.longitude
          }
        }

        // Fallback to direct client properties
        lat = lat || stop.client.latitude
        lng = lng || stop.client.longitude
      }

      const mappedStop = {
        ...stop,
        client_id: stop.client_id || stop.client?.id,
        latitude: lat,
        longitude: lng,
        // Preserve distance and duration if they exist
        distance_text: stop.distance_text,
        duration_text: stop.duration_text,
        distance_value: stop.distance_value,
        duration_value: stop.duration_value
      }

      return mappedStop
    })

    // Populate form
    routeForm.value = {
      name: deliveryRoute.value.name || '',
      courier: deliveryRoute.value.courier || null,
      partner: deliveryRoute.value.partner || null,
      origin_branch: deliveryRoute.value.originBranch || deliveryRoute.value.origin_branch || null,
      notes: deliveryRoute.value.notes || ''
    }
    selectedPartner.value = deliveryRoute.value.partner || null
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
  try {
    console.log('Initializing map...')
    await loadGoogleMaps()
    console.log('Google Maps loaded, mapContainer:', mapContainer.value)

    if (!mapContainer.value) {
      console.error('Map container not found!')
      return
    }

    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: -34.603722, lng: -58.381592 },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
      styles: darkMapStyles
    })

    console.log('Map initialized successfully:', !!map.value)
  } catch (error) {
    console.error('Error initializing map:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al inicializar el mapa'
    })
  }
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

  if (!map.value) {
    console.warn('updateMapRoute: Map not initialized yet')
    return
  }

  if (!routeForm.value.origin_branch) {
    console.warn('updateMapRoute: Missing origin_branch')
    return
  }

  if (stops.value.length === 0) {
    console.warn('updateMapRoute: No stops to draw')
    return
  }

  console.log('updateMapRoute: Data check:', {
    origin: routeForm.value.origin_branch,
    stopsCount: stops.value.length
  })

  // Add origin marker
  const origin = routeForm.value.origin_branch
  let originLat = null
  let originLng = null

  // Extract coordinates from origin branch
  if (origin.address) {
    const addr = typeof origin.address === 'string' ? JSON.parse(origin.address) : origin.address
    originLat = addr.latitude
    originLng = addr.longitude
  }

  // Fallback to direct properties if any
  originLat = originLat || origin.latitude
  originLng = originLng || origin.longitude

  console.log('updateMapRoute: Origin coordinates:', { originLat, originLng })

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

  console.log('Processing stops for markers...')
  stops.value.forEach((stop, index) => {
    const lat = stop.latitude
    const lng = stop.longitude

    console.log(`Stop ${index + 1}:`, {
      client: stop.client?.name,
      lat,
      lng,
      hasCoordinates: !!(lat && lng)
    })

    if (!lat || !lng) {
      console.warn(`Stop ${index + 1} missing coordinates, skipping`)
      return
    }

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

    console.log(`Marker ${index + 1} created successfully`)
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

  // Draw route and calculate distances
  await drawRoute()
  await calculateDistancesAndTimes()
}

// Watch origin branch for map updates
watch(() => routeForm.value.origin_branch, async () => {
  await nextTick()
  updateMapRoute()
})

async function calculateDistancesAndTimes () {
  if (!map.value || !routeForm.value.origin_branch || stops.value.length === 0) {
    return
  }

  const distanceMatrixService = new google.maps.DistanceMatrixService()

  // Get origin coordinates
  const origin = routeForm.value.origin_branch
  let originLat = null
  let originLng = null

  // Extract coordinates from origin branch
  if (origin.address) {
    const addr = typeof origin.address === 'string' ? JSON.parse(origin.address) : origin.address
    originLat = addr.latitude
    originLng = addr.longitude
  }

  // Fallback to direct properties
  originLat = originLat || origin.latitude
  originLng = originLng || origin.longitude

  if (!originLat || !originLng) return

  // Calculate distance and time for each stop
  for (let i = 0; i < stops.value.length; i++) {
    const stop = stops.value[i]
    const stopLat = stop.latitude
    const stopLng = stop.longitude

    if (!stopLat || !stopLng) continue

    // Determine origin for this stop (previous stop or branch)
    let fromLat, fromLng
    if (i === 0) {
      fromLat = originLat
      fromLng = originLng
    } else {
      const prevStop = stops.value[i - 1]
      fromLat = prevStop.latitude
      fromLng = prevStop.longitude
    }

    if (!fromLat || !fromLng) continue

    try {
      const result = await new Promise((resolve, reject) => {
        distanceMatrixService.getDistanceMatrix(
          {
            origins: [{ lat: parseFloat(fromLat), lng: parseFloat(fromLng) }],
            destinations: [{ lat: parseFloat(stopLat), lng: parseFloat(stopLng) }],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
          },
          (response, status) => {
            if (status === 'OK') {
              resolve(response)
            } else {
              reject(status)
            }
          }
        )
      })

      if (result.rows[0]?.elements[0]?.status === 'OK') {
        const element = result.rows[0].elements[0]
        stop.distance_text = element.distance.text
        stop.duration_text = element.duration.text
        stop.distance_value = element.distance.value // meters
        stop.duration_value = element.duration.value // seconds
      }
    } catch (error) {
      console.error('Error calculating distance:', error)
    }
  }
}

async function drawRoute () {
  if (!map.value || !routeForm.value.origin_branch || stops.value.length === 0) {
    console.warn('drawRoute: Missing map, origin_branch or stops')
    return
  }

  console.log('drawRoute: Starting route drawing...')
  const directionsService = new google.maps.DirectionsService()

  // Build waypoints
  const origin = routeForm.value.origin_branch
  let originLat = null
  let originLng = null

  // Extract coordinates from origin branch
  if (origin.address) {
    const addr = typeof origin.address === 'string' ? JSON.parse(origin.address) : origin.address
    originLat = addr.latitude
    originLng = addr.longitude
  }

  // Fallback to direct properties if any
  originLat = originLat || origin.latitude
  originLng = originLng || origin.longitude

  console.log('drawRoute: Origin:', { originLat, originLng })

  if (!originLat || !originLng) {
    console.warn('drawRoute: Origin missing coordinates')
    return
  }

  // Draw route segments
  let prevLat = originLat
  let prevLng = originLng

  for (let i = 0; i < stops.value.length; i++) {
    const stop = stops.value[i]
    const stopLat = stop.latitude
    const stopLng = stop.longitude

    console.log(`drawRoute: Processing segment to stop ${i + 1}:`, { stopLat, stopLng })

    if (!stopLat || !stopLng) {
      console.warn(`drawRoute: Stop ${i + 1} missing coordinates, skipping path`)
      continue
    }

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

function filterClients (value, update) {
  api.get('clients', {
    params: {
      sortBy: 'id',
      sortOrder: 'desc',
      onlyClients: true,
      dataSearch: {
        name: value,
        document_number: value
      }
    }
  })
    .then(({ data }) => {
      update(() => {
        clients.value = data
      })
    })
    .catch(err => {
      console.error('Error loading clients:', err)
      $q.notify({
        type: 'negative',
        message: 'Error al buscar clientes',
        icon: 'warning'
      })
    })
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

/**
 * Adds a client to the predefined route. If client has no address, shows modal to add one.
 * @return {Promise<void>}
 */
async function addClientToPredefinedRoute () {
  if (!selectedClient.value) return

  // Check if client is already in the stops list
  if (stops.value.some(s => s.client_id === selectedClient.value.id)) {
    $q.notify({
      type: 'warning',
      message: 'Este cliente ya está agregado a la ruta',
      icon: 'warning'
    })
    selectedClient.value = null
    return
  }

  // Extract coordinates from client address
  let lat = null
  let lng = null

  const clientAddress = selectedClient.value.address

  if (clientAddress) {
    // If address is a JSON string, parse it
    if (typeof clientAddress === 'string') {
      try {
        const parsed = JSON.parse(clientAddress)
        lat = parsed.latitude
        lng = parsed.longitude
      } catch (e) {
        console.warn('Could not parse client address:', clientAddress)
      }
    } else if (typeof clientAddress === 'object') {
      // If address is already an object
      lat = clientAddress.latitude
      lng = clientAddress.longitude
    }
  }

  // Fallback to direct client properties
  lat = lat || selectedClient.value.latitude
  lng = lng || selectedClient.value.longitude

  if (!lat || !lng) {
    // Show modal to add address
    clientWithoutAddress.value = selectedClient.value
    newClientAddress.value = null
    showAddressModal.value = true
    return
  }
  // For predefined routes, just add client to stops list (no products yet)
  const newStop = {
    id: Date.now(), // Temporary ID
    client_id: selectedClient.value.id,
    client: selectedClient.value,
    stop_order: stops.value.length + 1,
    delivery_status: 'pending',
    latitude: lat,
    longitude: lng,
    products: [] // No products for predefined routes
  }

  // Automatic partner association if a partner is selected
  if (selectedPartner.value && (newStop.client && (!newStop.client.partner_id || newStop.client.partner_id !== selectedPartner.value.id))) {
    try {
      await api.put(`/clients/${newStop.client.id}`, {
        ...newStop.client,
        partner_id: selectedPartner.value.id
      })
      newStop.client.partner_id = selectedPartner.value.id
      $q.notify({
        type: 'info',
        message: `Cliente asociado a ${selectedPartner.value.name}`,
        timeout: 1000
      })
    } catch (e) {
      console.error('Error auto-associating client:', e)
    }
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

/**
 * Handles address selection from AddressComponent
 * @params {object} address The selected address object
 * @return {void}
 */
function onAddressSelected (address) {
  newClientAddress.value = address
}

/**
 * Cancels the address modal and resets state
 * @return {void}
 */
function cancelAddressModal () {
  showAddressModal.value = false
  clientWithoutAddress.value = null
  newClientAddress.value = null
  stopBeingEdited.value = null

  // If not processing partner clients, also reset selectedClient
  if (!processingPartnerClients.value) {
    selectedClient.value = null
  }

  if (addressComponentRef.value) {
    addressComponentRef.value.resetAddress()
  }

  // If processing partner clients, stop the queue
  if (processingPartnerClients.value) {
    processingPartnerClients.value = false
    clientsQueue.value = []
    currentClientIndex.value = 0
  }
}

/**
 * Skips adding address for current client and adds them without coordinates
 * @return {Promise<void>}
 */
async function skipClientAddress () {
  if (!clientWithoutAddress.value) return

  // Check if we're editing an existing stop
  if (stopBeingEdited.value) {
    // Just close the modal, don't add duplicate
    showAddressModal.value = false
    clientWithoutAddress.value = null
    newClientAddress.value = null
    stopBeingEdited.value = null

    if (addressComponentRef.value) {
      addressComponentRef.value.resetAddress()
    }

    $q.notify({
      type: 'info',
      message: 'No se realizaron cambios en la dirección'
    })
    return
  }

  // Add client to stops WITHOUT coordinates (only if not editing)
  const newStop = {
    id: Date.now(),
    client_id: clientWithoutAddress.value.id,
    client: clientWithoutAddress.value,
    stop_order: stops.value.length + 1,
    delivery_status: 'pending',
    latitude: null,
    longitude: null,
    products: []
  }

  stops.value.push(newStop)

  // Reset address component for next client
  if (addressComponentRef.value) {
    addressComponentRef.value.resetAddress()
  }

  // Continue processing queue if in partner mode
  if (processingPartnerClients.value) {
    // Close modal temporarily to show transition
    showAddressModal.value = false
    await nextTick()

    currentClientIndex.value++
    await processNextClientInQueue()
  } else {
    // Single client mode
    showAddressModal.value = false
    clientWithoutAddress.value = null
    newClientAddress.value = null
    selectedClient.value = null
    await nextTick()
    updateMapRoute()
  }
}

/**
 * Opens the address modal to edit a stop's address
 * @params {object} stop The stop to edit
 * @return {void}
 */
function editStopAddress (stop) {
  stopBeingEdited.value = stop // Store the stop being edited
  clientWithoutAddress.value = stop.client
  newClientAddress.value = null
  processingPartnerClients.value = false // Not in partner mode
  showAddressModal.value = true
}

/**
 * Saves the client address and adds them to the route
 * @return {Promise<void>}
 */
async function saveClientAddressAndAdd () {
  if (!clientWithoutAddress.value || !newClientAddress.value) return

  savingClientAddress.value = true

  try {
    // Update client with new address
    await api.put(`/clients/${clientWithoutAddress.value.id}`, {
      ...clientWithoutAddress.value,
      address: newClientAddress.value
    })

    // Check if we're editing an existing stop
    if (stopBeingEdited.value) {
      // Update the existing stop
      stopBeingEdited.value.latitude = newClientAddress.value.latitude
      stopBeingEdited.value.longitude = newClientAddress.value.longitude
      stopBeingEdited.value.client.address = newClientAddress.value

      $q.notify({
        type: 'positive',
        message: 'Dirección actualizada correctamente'
      })

      showAddressModal.value = false
      clientWithoutAddress.value = null
      newClientAddress.value = null
      stopBeingEdited.value = null

      if (addressComponentRef.value) {
        addressComponentRef.value.resetAddress()
      }

      await nextTick()
      updateMapRoute()
    } else {
      // Add new stop with the new coordinates
      const newStop = {
        id: Date.now(),
        client_id: clientWithoutAddress.value.id,
        client: {
          ...clientWithoutAddress.value,
          address: newClientAddress.value
        },
        stop_order: stops.value.length + 1,
        delivery_status: 'pending',
        latitude: newClientAddress.value.latitude,
        longitude: newClientAddress.value.longitude,
        products: []
      }

      stops.value.push(newStop)

      $q.notify({
        type: 'positive',
        message: 'Dirección guardada y cliente agregado a la ruta'
      })

      // Reset address component for next client
      if (addressComponentRef.value) {
        addressComponentRef.value.resetAddress()
      }

      // Continue processing queue if in partner mode
      if (processingPartnerClients.value) {
        // Close modal temporarily to show transition
        showAddressModal.value = false
        await nextTick()

        currentClientIndex.value++
        await processNextClientInQueue()
      } else {
        // Single client mode
        showAddressModal.value = false
        clientWithoutAddress.value = null
        newClientAddress.value = null
        selectedClient.value = null
        await nextTick()
        updateMapRoute()
      }
    }
  } catch (error) {
    console.error('Error saving client address:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la dirección del cliente',
      caption: error.message || 'Intenta nuevamente'
    })
  } finally {
    savingClientAddress.value = false
  }
}

async function createRoute () {
  // Check partner associations before saving
  if (selectedPartner.value) {
    const unassociatedClients = stops.value.filter(stop =>
      !stop.client || !stop.client.partner_id || stop.client.partner_id !== selectedPartner.value.id
    )

    if (unassociatedClients.length > 0) {
      const confirmed = await showPartnerAssociationDialog(unassociatedClients)
      if (confirmed) {
        await associateClientsWithPartner(unassociatedClients)
      }
    }
  }

  // Si ya existe una ruta, actualizar en lugar de crear
  if (deliveryRoute.value) {
    await saveRoute()
    return
  }

  try {
    const payload = {
      name: routeForm.value.name || 'Nueva Ruta',
      courier_id: routeForm.value.courier?.id,
      partner_id: selectedPartner.value?.id,
      origin_branch_id: routeForm.value.origin_branch?.id,
      notes: routeForm.value.notes
    }

    // Add clients from stops for predefined routes
    if (stops.value.length > 0) {
      payload.clients = stops.value.map((stop, index) => ({
        client_id: stop.client_id,
        stop_order: index + 1,
        latitude: stop.latitude,
        longitude: stop.longitude,
        estimated_time_minutes: stop.estimated_time_minutes || 15,
        // Include distance and time data if available
        distance_km: stop.distance_value ? (stop.distance_value / 1000).toFixed(2) : null,
        estimated_time_from_previous_minutes: stop.duration_value ? Math.round(stop.duration_value / 60) : null
      }))

      // Calculate totals
      const totalDistance = stops.value.reduce((sum, stop) => sum + (stop.distance_value || 0), 0)
      const totalDuration = stops.value.reduce((sum, stop) => sum + (stop.duration_value || 0), 0)

      payload.total_distance_km = totalDistance > 0 ? (totalDistance / 1000).toFixed(2) : null
      payload.estimated_duration_minutes = totalDuration > 0 ? Math.round(totalDuration / 60) : null
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

  // Check partner associations before saving
  if (selectedPartner.value) {
    const unassociatedClients = stops.value.filter(stop =>
      !stop.client || !stop.client.partner_id || stop.client.partner_id !== selectedPartner.value.id
    )

    console.log('Unassociated clients:', unassociatedClients)

    if (unassociatedClients.length > 0) {
      const confirmed = await showPartnerAssociationDialog(unassociatedClients)
      if (confirmed) {
        await associateClientsWithPartner(unassociatedClients)
      }
    }
  }

  saving.value = true

  try {
    const payload = {
      name: routeForm.value.name,
      courier_id: routeForm.value.courier?.id,
      partner_id: selectedPartner.value?.id,
      origin_branch_id: routeForm.value.origin_branch?.id,
      notes: routeForm.value.notes
    }

    // Include clients/stops for predefined routes
    if (stops.value.length > 0) {
      payload.clients = stops.value.map((stop, index) => ({
        client_id: stop.client_id,
        stop_order: index + 1,
        latitude: stop.latitude,
        longitude: stop.longitude,
        estimated_time_minutes: stop.estimated_time_minutes || 15,
        // Include distance and time data if available
        distance_km: stop.distance_value ? (stop.distance_value / 1000).toFixed(2) : null,
        estimated_time_from_previous_minutes: stop.duration_value ? Math.round(stop.duration_value / 60) : null
      }))

      // Calculate totals
      const totalDistance = stops.value.reduce((sum, stop) => sum + (stop.distance_value || 0), 0)
      const totalDuration = stops.value.reduce((sum, stop) => sum + (stop.duration_value || 0), 0)

      payload.total_distance_km = totalDistance > 0 ? (totalDistance / 1000).toFixed(2) : null
      payload.estimated_duration_minutes = totalDuration > 0 ? Math.round(totalDuration / 60) : null
    }

    await api.patch(`/delivery-routes/${deliveryRoute.value.id}`, payload)

    $q.notify({
      type: 'positive',
      message: 'Ruta guardada exitosamente'
    })

    // Reload route to get updated data
    await loadRoute()
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

/**
 * Shows a dialog to confirm associating clients with the selected partner.
 * @params {array} clients List of clients to be associated.
 * @return {Promise<boolean>}
 */
function showPartnerAssociationDialog (clients) {
  return new Promise((resolve) => {
    $q.dialog({
      title: 'Asociar Clientes',
      message: `Hay ${clients.length} cliente(s) que no están asociados al afiliado <b>${selectedPartner.value.name}</b>. ¿Deseas asociarlos automáticamente antes de guardar?`,
      html: true,
      ok: {
        label: 'Sí, asociar todos',
        color: 'positive',
        unelevated: true
      },
      cancel: {
        label: 'No, solo guardar',
        color: 'grey-7',
        flat: true
      },
      persistent: true
    }).onOk(() => {
      resolve(true)
    }).onCancel(() => {
      resolve(false)
    }).onDismiss(() => {
      resolve(false)
    })
  })
}

/**
 * Associates a list of clients with the selected partner via API.
 * @params {array} stopsToUpdate List of stops whose clients need association.
 * @return {Promise<void>}
 */
async function associateClientsWithPartner (stopsToUpdate) {
  $q.loading.show({
    message: `Asociando ${stopsToUpdate.length} clientes a ${selectedPartner.value.name}...`
  })

  try {
    const promises = stopsToUpdate.map(stop => {
      return api.put(`/clients/${stop.client.id}`, {
        ...stop.client,
        partner_id: selectedPartner.value.id
      })
    })

    await Promise.all(promises)

    // Update local state to reflect changes
    stopsToUpdate.forEach(stop => {
      if (stop.client) {
        stop.client.partner_id = selectedPartner.value.id
      }
    })

    $q.notify({
      type: 'positive',
      message: `${stopsToUpdate.length} clientes asociados exitosamente`
    })
  } catch (error) {
    console.error('Error associating clients:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al asociar algunos clientes',
      caption: 'La ruta se guardará igualmente'
    })
  } finally {
    $q.loading.hide()
  }
}

async function optimizeRoute () {
  if (stops.value.length < 2 || !routeForm.value.origin_branch) {
    return
  }

  optimizing.value = true

  try {
    // Get origin coordinates
    const origin = routeForm.value.origin_branch
    const originAddress = origin.address || {}
    const originLat = originAddress.latitude || origin.latitude
    const originLng = originAddress.longitude || origin.longitude

    if (!originLat || !originLng) {
      throw new Error('No se pudo obtener la ubicación de la sucursal')
    }

    // Prepare waypoints for optimization
    const waypoints = stops.value.map(stop => ({
      location: {
        lat: parseFloat(stop.latitude),
        lng: parseFloat(stop.longitude)
      },
      stopover: true
    }))

    // Use Google Directions Service with waypoint optimization
    const directionsService = new google.maps.DirectionsService()

    const result = await new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
          destination: { lat: parseFloat(originLat), lng: parseFloat(originLng) }, // Return to origin
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
          if (status === 'OK') {
            resolve(response)
          } else {
            reject(status)
          }
        }
      )
    })

    // Get optimized order
    const optimizedOrder = result.routes[0].waypoint_order

    // Reorder stops based on optimization
    const optimizedStops = optimizedOrder.map(index => stops.value[index])
    stops.value = optimizedStops

    $q.notify({
      type: 'positive',
      message: 'Ruta optimizada exitosamente',
      caption: 'Las paradas se reordenaron para minimizar distancia y tiempo'
    })

    // Map will update automatically via watch
  } catch (error) {
    console.error('Error optimizing route:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al optimizar la ruta',
      caption: error.message || 'Intenta nuevamente'
    })
  } finally {
    optimizing.value = false
  }
}

/**
 * Updates the reorder on the server and shows loading
 * @params {number|null} stopId ID of the stop that was moved
 * @return {Promise<void>}
 */
async function triggerReorder (stopId = null) {
  if (!deliveryRoute.value) return

  reorderingStopId.value = stopId

  // Update stop orders for the API
  const reorderedStops = stops.value.map((stop, index) => ({
    id: stop.id,
    stop_order: index + 1
  }))

  try {
    await api.post(`/delivery-routes/${deliveryRoute.value.id}/stops/reorder`, {
      stops: reorderedStops
    })
  } catch (error) {
    console.error('Error reordering stops:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al reordenar paradas'
    })
  } finally {
    reorderingStopId.value = null
  }
}

/**
 * Moves a stop up in the list
 * @params {number} index Current index of the stop
 * @return {void}
 */
const moveStopUp = (index) => {
  if (index <= 0) return
  const item = stops.value.splice(index, 1)[0]
  stops.value.splice(index - 1, 0, item)
  triggerReorder(item.id)
}

/**
 * Moves a stop down in the list
 * @params {number} index Current index of the stop
 * @return {void}
 */
const moveStopDown = (index) => {
  if (index >= stops.value.length - 1) return
  const item = stops.value.splice(index, 1)[0]
  stops.value.splice(index + 1, 0, item)
  triggerReorder(item.id)
}

/**
 * Updates a stop position to a specific number
 * @params {object} stop The stop object
 * @params {string|number} newPos The new position (1-based)
 * @return {void}
 */
const updateStopPosition = (stop, newPos) => {
  const index = stops.value.findIndex(s => s.id === stop.id)
  if (index === -1) return

  let targetIndex = parseInt(newPos) - 1
  if (isNaN(targetIndex)) return

  // Clamp targetIndex
  targetIndex = Math.max(0, Math.min(targetIndex, stops.value.length - 1))

  if (targetIndex === index) return

  const item = stops.value.splice(index, 1)[0]
  stops.value.splice(targetIndex, 0, item)
  triggerReorder(item.id)
}

/**
 * Handles reorder event from draggable component
 * @return {Promise<void>}
 */
async function onStopReorder () {
  await triggerReorder()
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

.stop-controls {
  width: 36px;
}

.stop-position-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stop-position-input {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: white;
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  outline: none;
  padding: 0;
  -moz-appearance: textfield; /* Firefox */
  appearance: none;
}

.stop-position-input::-webkit-outer-spin-button,
.stop-position-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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

/* Transition for client name change in modal */
.client-name-container {
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%);
  border-left: 4px solid #2196F3;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
