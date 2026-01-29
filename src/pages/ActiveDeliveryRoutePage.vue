<template>
  <q-page class="bg-dark full-height">
    <!-- Map Container -->
    <div id="map" ref="mapContainer" style="width: 100%; height: 100%;"></div>

    <!-- Top Info Card -->
    <div class="absolute-top q-ma-sm" style="z-index: 1000;">
      <q-card dark class="bg-grey-9" style="border-radius: 12px;">
        <q-card-section class="q-pa-sm">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="arrow_back"
              @click="confirmExit"
              class="q-mr-xs"
            />
            <div class="col">
              <div class="text-caption text-grey-5" style="line-height: 1.2;">
                {{ deliveryRoute?.route_number }}
              </div>
            </div>
            <div class="text-right q-ml-sm">
              <div class="text-body1 text-weight-bold text-green" style="line-height: 1.2;">
                {{ estimatedTime }} min
              </div>
              <div class="text-caption text-grey-5" style="line-height: 1.2;">
                {{ distance }} km
              </div>
            </div>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="summarize"
              color="primary"
              @click="showSummaryDialog = true"
              class="q-ml-xs"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Action Card -->
    <div class="absolute-bottom q-ma-sm" style="z-index: 1000;">
      <q-card dark class="bg-grey-9" style="border-radius: 12px;">
        <!-- Collapse Button -->
        <div class="row items-center justify-center q-pa-xs" style="cursor: pointer;" @click="showDetails = !showDetails">
          <q-icon :name="showDetails ? 'expand_more' : 'expand_less'" size="20px" color="grey-5" />
        </div>

        <q-slide-transition>
          <div v-show="showDetails">
            <q-card-section class="q-pa-sm q-pt-none">
              <!-- Progress -->
              <div class="row items-center q-mb-md">
                <q-icon name="route" color="primary" size="24px" class="q-mr-sm" />
                <div class="col">
                  <div class="text-caption text-grey-5">Progreso</div>
                  <q-linear-progress
                    :value="progress"
                    color="green"
                    class="q-mt-xs"
                    style="height: 8px; border-radius: 4px;"
                  />
                </div>
                <div class="q-ml-md text-caption">{{ completedStops }}/{{ totalStops }}</div>
              </div>

              <!-- Current Stop Info -->
              <div class="q-mb-md" v-if="currentStop">
                <div class="text-caption text-grey-5">Destino Actual</div>
                <div class="text-body1">{{ currentStop.client?.name }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  <q-icon name="place" size="16px" />
                  {{ getClientAddress(currentStop.client) }}
                </div>
                <div class="text-caption text-primary q-mt-xs" v-if="currentStop.client?.opening_hours">
                  <q-icon name="schedule" size="16px" />
                  {{ getOpeningHoursText(currentStop.client.opening_hours) }}
                </div>
                <div class="text-caption text-grey-5 q-mt-xs">
                  <q-icon name="inventory_2" size="16px" />
                  {{ currentStop.products?.length || 0 }} productos
                </div>
              </div>

              <!-- Action Button -->
              <q-btn
                v-if="!arrived && currentStop"
                unelevated
                no-caps
                label="He Llegado"
                color="light-green-6"
                text-color="dark"
                icon="check_circle"
                class="full-width"
                style="border-radius: 12px; font-weight: bold; height: 50px;"
                @click="markArrived"
                :loading="marking"
              />

              <div v-else-if="arrived && currentStop" class="text-center">
                <q-btn
                  unelevated
                  no-caps
                  label="Completar Entrega"
                  color="positive"
                  text-color="white"
                  icon="done_all"
                  class="full-width"
                  style="border-radius: 12px; font-weight: bold; height: 50px;"
                  @click="showDeliveryDialog = true"
                />
              </div>

              <div v-else-if="!currentStop" class="text-center q-pa-md">
                <q-icon name="celebration" color="green" size="40px" />
                <div class="text-body1 q-mt-sm">¡Todas las entregas completadas!</div>
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Delivery Dialog (Partial Delivery Support) -->
    <q-dialog v-model="showDeliveryDialog" persistent>
      <q-card style="min-width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Completar Entrega</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Cliente: {{ currentStop?.client?.name }}</div>

          <!-- Products List with Quantity Adjustment -->
          <div class="text-body2 q-mb-sm q-mt-md">Productos a Entregar:</div>
          <q-list bordered separator class="rounded-borders" style="max-height: 400px; overflow-y: auto;">
            <q-item v-for="product in deliveryProducts" :key="product.id">
              <q-item-section>
                <q-item-label>{{ product.product?.name }}</q-item-label>
                <q-item-label caption>
                  Cargado: {{ product.quantity_loaded }} • Precio: ${{ product.unit_price }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <q-input
                    v-model.number="product.quantity_delivered"
                    type="number"
                    dense
                    outlined
                    style="width: 100px;"
                    label="Entregar"
                    :min="0"
                    :max="product.quantity_loaded"
                    step="0.01"
                    :rules="[
                      val => val >= 0 || 'Mínimo 0',
                      val => val <= product.quantity_loaded || 'Máximo ' + product.quantity_loaded
                    ]"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Delivery Details -->
          <div class="q-mt-md">
            <q-input
              v-model="deliveryForm.recipient_name"
              label="Nombre del Receptor"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="deliveryForm.recipient_document"
              label="Documento del Receptor"
              outlined
              dense
              class="q-mb-sm"
            />
            <q-input
              v-model="deliveryForm.notes"
              label="Notas"
              type="textarea"
              outlined
              dense
              rows="2"
            />
          </div>

          <!-- Signature Pad -->
          <div class="q-mt-md">
            <div class="text-body2 q-mb-sm">Firma del Receptor:</div>
            <div style="border: 1px solid #ccc; border-radius: 8px; overflow: hidden;">
              <canvas
                ref="signatureCanvas"
                width="560"
                height="200"
                style="display: block; touch-action: none;"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart.prevent="startDrawing"
                @touchmove.prevent="draw"
                @touchend.prevent="stopDrawing"
              ></canvas>
            </div>
            <q-btn
              flat
              dense
              label="Limpiar Firma"
              icon="clear"
              color="negative"
              size="sm"
              class="q-mt-xs"
              @click="clearSignature"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Confirmar Entrega"
            color="positive"
            @click="completeDelivery"
            :loading="completing"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Summary Dialog -->
    <q-dialog v-model="showSummaryDialog">
      <q-card style="min-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="summarize" color="primary" />
            Resumen de Carga
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Estado de Productos</div>

          <q-list bordered separator class="rounded-borders">
            <q-item v-for="product in summary.products" :key="product.product_id">
              <q-item-section>
                <q-item-label>{{ product.product_name }}</q-item-label>
                <q-item-label caption>
                  <div class="row q-gutter-sm q-mt-xs">
                    <q-chip dense size="sm" color="blue" text-color="white">
                      Cargado: {{ product.quantity_loaded }}
                    </q-chip>
                    <q-chip dense size="sm" color="green" text-color="white">
                      Entregado: {{ product.quantity_delivered }}
                    </q-chip>
                    <q-chip dense size="sm" color="orange" text-color="white">
                      Restante: {{ product.quantity_remaining }}
                    </q-chip>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-md">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h6 text-primary">{{ summary.total_stops }}</div>
                    <div class="text-caption">Total Paradas</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h6 text-positive">{{ summary.completed_stops }}</div>
                    <div class="text-caption">Completadas</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h6 text-orange">{{ summary.pending_stops }}</div>
                    <div class="text-caption">Pendientes</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* global google */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const router = useRouter()
const routeParams = useRoute()
const $q = useQuasar()

// Refs
const mapContainer = ref(null)
const map = ref(null)
const deliveryRoute = ref(null)
const currentStop = ref(null)
const arrived = ref(false)
const marking = ref(false)
const completing = ref(false)
const showDetails = ref(true)
const showDeliveryDialog = ref(false)
const showSummaryDialog = ref(false)
const deliveryProducts = ref([])
const summary = ref({
  total_stops: 0,
  completed_stops: 0,
  pending_stops: 0,
  products: []
})

// Delivery form
const deliveryForm = ref({
  recipient_name: '',
  recipient_document: '',
  notes: '',
  latitude: null,
  longitude: null
})

// Signature
const signatureCanvas = ref(null)
const isDrawing = ref(false)
const signatureData = ref(null)

// Map markers
const courierMarker = ref(null)
const stopMarkers = ref([])
const routePaths = ref([])

// Location tracking
const currentPosition = ref(null)
const watchId = ref(null)

// Computed
const estimatedTime = computed(() => {
  if (!currentStop.value) return 0
  return currentStop.value.estimated_time_from_previous_minutes || 0
})

const distance = computed(() => {
  if (!currentStop.value) return '0.0'
  return (currentStop.value.distance_from_previous_km || 0).toFixed(1)
})

const progress = computed(() => {
  if (!deliveryRoute.value) return 0
  return completedStops.value / totalStops.value
})

const completedStops = computed(() => {
  return deliveryRoute.value?.completed_stops || 0
})

const totalStops = computed(() => {
  return deliveryRoute.value?.total_stops || 1
})

onMounted(async () => {
  await loadRoute()
  await initializeMap()
  await startLocationTracking()
  listenForUpdates()
})

onUnmounted(() => {
  stopLocationTracking()
  stopListening()
})

async function loadRoute () {
  try {
    const response = await api.get(`/delivery-routes/${routeParams.params.id}`)
    deliveryRoute.value = response.data.route

    // Get current stop (first pending or arrived)
    const stops = deliveryRoute.value.stops || []
    currentStop.value = stops.find(s => s.delivery_status === 'pending' || s.delivery_status === 'arrived')

    if (currentStop.value?.delivery_status === 'arrived') {
      arrived.value = true
      prepareDeliveryProducts()
    }

    // Load summary
    await loadSummary()
  } catch (error) {
    console.error('Error loading route:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la ruta'
    })
  }
}

async function loadSummary () {
  try {
    const response = await api.get(`/delivery-routes/${routeParams.params.id}/summary`)
    summary.value = response.data.summary
  } catch (error) {
    console.error('Error loading summary:', error)
  }
}

async function initializeMap () {
  await loadGoogleMaps()

  map.value = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.603722, lng: -58.381592 },
    zoom: 13,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    styles: darkMapStyles
  })

  addMapMarkers()
  await drawRoute()
}

function addMapMarkers () {
  const stops = deliveryRoute.value?.stops || []

  stops.forEach((stop, index) => {
    const lat = stop.latitude
    const lng = stop.longitude

    if (!lat || !lng) return

    let color = '#9E9E9E' // Grey - future
    let scale = 10

    if (stop.delivery_status === 'delivered') {
      color = '#4CAF50' // Green - completed
      scale = 9
    } else if (stop.delivery_status === 'arrived') {
      color = '#FF9800' // Orange - waiting
      scale = 12
    } else if (stop.id === currentStop.value?.id) {
      color = '#2979FF' // Blue - current
      scale = 12
    }

    const marker = new google.maps.Marker({
      position: { lat: parseFloat(lat), lng: parseFloat(lng) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale,
        fillColor: color,
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
  })

  // Courier marker
  courierMarker.value = new google.maps.Marker({
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: '#FF5722',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2
    }
  })

  // Fit bounds
  if (stopMarkers.value.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    stopMarkers.value.forEach(marker => bounds.extend(marker.getPosition()))
    map.value.fitBounds(bounds)
  }
}

async function drawRoute () {
  // Similar to ActiveTransportPage - draw route between stops
  // Implementation omitted for brevity - reuse logic from ActiveTransportPage
}

async function startLocationTracking () {
  try {
    const isNativePlatform = $q.platform.is.capacitor || $q.platform.is.cordova

    if (isNativePlatform) {
      const { Geolocation } = await import('@capacitor/geolocation')
      const permission = await Geolocation.requestPermissions()

      if (permission.location !== 'granted') {
        return
      }

      watchId.value = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        (position) => {
          if (position) updateCourierPosition(position)
        }
      )
    } else {
      if (!navigator.geolocation) return

      watchId.value = navigator.geolocation.watchPosition(
        (position) => updateCourierPosition(position),
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  } catch (error) {
    console.error('Error starting location tracking:', error)
  }
}

function updateCourierPosition (position) {
  const coords = position.coords

  currentPosition.value = {
    latitude: coords.latitude,
    longitude: coords.longitude
  }

  deliveryForm.value.latitude = coords.latitude
  deliveryForm.value.longitude = coords.longitude

  if (courierMarker.value) {
    const latLng = new google.maps.LatLng(coords.latitude, coords.longitude)
    courierMarker.value.setPosition(latLng)
  }
}

function stopLocationTracking () {
  if (watchId.value) {
    const isNativePlatform = $q.platform.is.capacitor || $q.platform.is.cordova

    if (isNativePlatform) {
      import('@capacitor/geolocation').then(({ Geolocation }) => {
        Geolocation.clearWatch({ id: watchId.value })
      })
    } else {
      navigator.geolocation.clearWatch(watchId.value)
    }

    watchId.value = null
  }
}

async function markArrived () {
  marking.value = true

  try {
    await api.post(`/delivery-routes/${deliveryRoute.value.id}/stops/${currentStop.value.id}/arrived`)

    arrived.value = true
    prepareDeliveryProducts()

    $q.notify({
      type: 'positive',
      message: 'Llegada registrada'
    })
  } catch (error) {
    console.error('Error marking arrived:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al registrar llegada'
    })
  } finally {
    marking.value = false
  }
}

function prepareDeliveryProducts () {
  deliveryProducts.value = (currentStop.value?.products || []).map(p => ({
    ...p,
    quantity_delivered: p.quantity_loaded // Default to full delivery
  }))
}

async function completeDelivery () {
  completing.value = true

  try {
    const response = await api.post(
      `/delivery-routes/${deliveryRoute.value.id}/stops/${currentStop.value.id}/complete`,
      {
        products: deliveryProducts.value.map(p => ({
          id: p.id,
          quantity_delivered: p.quantity_delivered
        })),
        signature: signatureData.value,
        recipient_name: deliveryForm.value.recipient_name,
        recipient_document: deliveryForm.value.recipient_document,
        notes: deliveryForm.value.notes,
        latitude: deliveryForm.value.latitude,
        longitude: deliveryForm.value.longitude
      }
    )

    const allCompleted = response.data.all_completed

    $q.notify({
      type: 'positive',
      message: 'Entrega completada exitosamente'
    })

    showDeliveryDialog.value = false

    if (allCompleted) {
      $q.notify({
        type: 'positive',
        message: '¡Todas las entregas completadas! Ruta finalizada.',
        icon: 'celebration',
        timeout: 3000
      })

      setTimeout(() => {
        router.replace({ name: 'DeliveryRoutes' })
      }, 2000)
    } else {
      // Load next stop
      await loadRoute()
      arrived.value = false
      resetDeliveryForm()
    }
  } catch (error) {
    console.error('Error completing delivery:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al completar entrega'
    })
  } finally {
    completing.value = false
  }
}

function resetDeliveryForm () {
  deliveryForm.value = {
    recipient_name: '',
    recipient_document: '',
    notes: '',
    latitude: currentPosition.value?.latitude,
    longitude: currentPosition.value?.longitude
  }
  deliveryProducts.value = []
  clearSignature()
}

// Signature functions
function startDrawing (event) {
  isDrawing.value = true
  const canvas = signatureCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  const x = (event.clientX || event.touches[0].clientX) - rect.left
  const y = (event.clientY || event.touches[0].clientY) - rect.top

  ctx.beginPath()
  ctx.moveTo(x, y)
}

function draw (event) {
  if (!isDrawing.value) return

  const canvas = signatureCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()

  const x = (event.clientX || event.touches[0].clientX) - rect.left
  const y = (event.clientY || event.touches[0].clientY) - rect.top

  ctx.lineTo(x, y)
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.stroke()
}

function stopDrawing () {
  if (isDrawing.value) {
    isDrawing.value = false
    signatureData.value = signatureCanvas.value.toDataURL()
  }
}

function clearSignature () {
  const canvas = signatureCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  signatureData.value = null
}

function getClientAddress (client) {
  if (!client?.address) return 'Sin dirección'

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

function listenForUpdates () {
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

function confirmExit () {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Salir de la ruta activa?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    router.back()
  })
}
</script>

<style scoped>
.bg-dark {
  background-color: #1a1a1a;
}
</style>
