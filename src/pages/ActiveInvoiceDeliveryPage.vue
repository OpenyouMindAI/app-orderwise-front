<template>
  <q-page class="bg-dark">
    <div id="map" ref="mapContainer" style="width: 100%; height: 100vh; position: absolute; top: 0; left: 0;"></div>

    <!-- Loading Overlay -->
    <div v-if="!map" class="absolute-full flex flex-center bg-dark" style="z-index: 2000;">
      <div class="text-center">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-body1 q-mt-md">Cargando mapa...</div>
      </div>
    </div>

    <!-- Top Info Card - Compacto -->
    <div class="absolute-top q-ma-xs" style="z-index: 1001; pointer-events: none;">
      <q-card dark class="bg-grey-9" style="border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); pointer-events: auto; background: rgba(33, 33, 33, 0.95);">
        <q-card-section class="q-pa-sm">
          <div class="row items-center no-wrap">
            <q-btn flat round dense size="sm" icon="arrow_back" @click="confirmExit" />
            <div class="col q-px-xs">
              <div class="text-caption text-grey-5" style="font-size: 10px; line-height: 1;">Entrega {{ currentDeliveryIndex + 1 }}/{{ totalDeliveries }}</div>
              <div class="text-body2 text-weight-bold">{{ currentRouteTime }} min • {{ currentRouteDistance }} km</div>
            </div>
            <q-btn flat dense round size="sm" icon="navigation" color="primary" @click="openGoogleMaps" />
          </div>

          <!-- Progress Bar Compacta -->
          <q-linear-progress
            :value="overallProgress"
            color="green"
            track-color="grey-8"
            size="6px"
            rounded
            class="q-mt-xs"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Delivery Card - Compacto -->
    <div class="absolute-bottom q-ma-xs" style="z-index: 1001; pointer-events: none;">
      <q-card dark class="bg-grey-9" style="border-radius: 12px 12px 0 0; box-shadow: 0 -2px 8px rgba(0,0,0,0.4); pointer-events: auto; background: rgba(33, 33, 33, 0.95);">
        <!-- Header Colapsable -->
        <div class="q-pa-sm" style="cursor: pointer;" @click="showDetails = !showDetails">
          <div class="row items-center no-wrap">
            <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
              <q-icon name="person" size="18px" />
            </q-avatar>
            <div class="col">
              <div class="text-body2 text-weight-bold">{{ currentClient }}</div>
              <div class="text-caption text-grey-5" style="font-size: 11px;">{{ invoice?.products?.length || 0 }} productos • ${{ invoice?.total?.toFixed(2) }}</div>
            </div>
            <q-btn flat dense round size="sm" icon="phone" color="green" @click.stop="callClient" />
            <q-icon :name="showDetails ? 'expand_more' : 'expand_less'" size="20px" color="grey-5" class="q-ml-xs" />
          </div>
        </div>

        <!-- Detalles Expandibles -->
        <q-slide-transition>
          <div v-show="showDetails">
            <q-separator dark />
            <q-card-section class="q-pa-sm">
              <!-- Dirección Compacta -->
              <div class="row items-start q-mb-sm bg-grey-8 q-pa-xs" style="border-radius: 6px;">
                <q-icon name="location_on" color="red" size="16px" class="q-mr-xs" />
                <div class="col text-caption" style="font-size: 11px;">{{ currentAddress }}</div>
              </div>

              <!-- Action Button Compacto -->
              <q-btn
                v-if="!arrived"
                unelevated
                no-caps
                label="Marcar como Entregado"
                color="light-green-6"
                text-color="dark"
                icon="check_circle"
                class="full-width"
                style="border-radius: 8px; font-weight: bold; height: 42px; font-size: 14px;"
                @click="markDelivered"
                :loading="marking"
              />

              <!-- Delivered - Payment Options -->
              <div v-else>
                <div class="text-center q-pa-sm bg-green-9 q-mb-sm" style="border-radius: 8px;">
                  <q-icon name="check_circle" color="green" size="32px" />
                  <div class="text-body2 q-mt-xs">¡Entregado!</div>
                </div>

                <!-- Payment Buttons -->
                <div class="row q-gutter-xs">
                  <q-btn
                    unelevated
                    no-caps
                    label="Registrar Pago"
                    color="blue-6"
                    text-color="white"
                    icon="payments"
                    class="col"
                    style="border-radius: 8px; font-size: 12px;"
                    @click="openPaymentDialog"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    label="Continuar"
                    color="grey-7"
                    text-color="white"
                    icon="arrow_forward"
                    class="col"
                    style="border-radius: 8px; font-size: 12px;"
                    @click="continueToNext"
                  />
                </div>
              </div>

              <!-- Next Deliveries Compacto -->
              <div v-if="nextDeliveries.length > 0 && showDetails" class="q-mt-sm">
                <div class="text-caption text-grey-5" style="font-size: 10px;">PRÓXIMAS</div>
                <div v-for="(next, idx) in nextDeliveries.slice(0, 1)" :key="next.id" class="row items-center q-mt-xs bg-grey-8 q-pa-xs" style="border-radius: 6px;">
                  <q-avatar size="20px" color="grey-7" text-color="white" class="q-mr-xs">
                    <span style="font-size: 10px;">{{ currentDeliveryIndex + idx + 2 }}</span>
                  </q-avatar>
                  <div class="col text-caption" style="font-size: 11px;">{{ next.invoice?.client?.name }}</div>
                  <div class="text-caption text-grey-5" style="font-size: 10px;">{{ next.distance?.toFixed(1) || '-' }} km</div>
                </div>
              </div>
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Payment Dialog -->
    <q-dialog v-model="showPaymentDialog" persistent>
      <q-card dark style="min-width: 350px; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Registrar Pago</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closePaymentDialog" />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 q-mb-sm">
            Factura: <span class="text-weight-bold">{{ invoice?.code }}</span>
          </div>
          <div class="text-body2 q-mb-md">
            Total: <span class="text-green text-weight-bold">${{ invoice?.total?.toFixed(2) }}</span>
          </div>

          <!-- Single Payment Form -->
          <div class="q-gutter-md">
            <q-select
              v-model="payment.payment_method_id"
              :options="paymentMethods"
              label="Método de Pago"
              dark
              outlined
              emit-value
              map-options
            />

            <q-input
              v-model.number="payment.amount"
              type="number"
              label="Monto del Pago"
              prefix="$"
              dark
              outlined
              :rules="[val => val > 0 || 'Ingrese un monto válido']"
            />

            <!-- Photo Upload -->
            <div>
              <div class="text-caption text-grey-5 q-mb-xs">Foto del comprobante (opcional)</div>
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                capture="environment"
                style="display: none"
                @change="handlePhotoUpload"
              />
              <q-btn
                outline
                no-caps
                :label="payment.photo ? 'Cambiar foto' : 'Tomar foto'"
                icon="camera_alt"
                color="grey-5"
                class="full-width"
                @click="$refs.photoInput.click()"
              />
              <div v-if="payment.photoPreview" class="q-mt-sm text-center">
                <q-img
                  :src="payment.photoPreview"
                  style="max-height: 200px; max-width: 100%; border-radius: 8px;"
                  class="q-mx-auto"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md q-gutter-sm">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            color="grey"
            @click="closePaymentDialog"
          />
          <q-btn
            unelevated
            no-caps
            label="Guardar Pago"
            color="light-green-6"
            text-color="dark"
            icon="save"
            @click="savePayment"
            :loading="savingPayment"
            :disable="!isPaymentValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* global google */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Map and UI refs
const mapContainer = ref(null)
const map = ref(null)
const showOptions = ref(false)
const showDetails = ref(false) // Colapsado por defecto para no tapar el mapa
const marking = ref(false)
const arrived = ref(false)

// Payment refs
const showPaymentDialog = ref(false)
const payment = ref({
  amount: null,
  payment_method_id: null,
  photo: null,
  photoPreview: null
})
const photoInput = ref(null)
const savingPayment = ref(false)
const paymentMethods = ref([])
const pauseUpdates = ref(false) // Pausar actualizaciones durante registro de pagos

// Delivery data
const deliveryRun = ref(null)
const allDeliveries = ref([]) // All deliveries in order
const currentDeliveryIndex = ref(0)
const invoice = ref(null) // Current delivery

// Location tracking
const currentPosition = ref(null)
const watchId = ref(null)
const locationUpdateInterval = ref(null)
const LOCATION_UPDATE_FREQUENCY = 10000 // 10 seconds

// Map elements
const courierMarker = ref(null)
const deliveryMarkers = ref([])
const completedPolylines = ref([]) // Red - completed routes
const currentPolyline = ref(null) // Blue - current route
const futurePolylines = ref([]) // Gray - future routes

// Route data
const directionsService = ref(null)

// Computed properties
const totalDeliveries = computed(() => allDeliveries.value.length)
const deliveredCount = computed(() => allDeliveries.value.filter(d => d.delivery_status === 'delivered').length)
const overallProgress = computed(() => totalDeliveries.value > 0 ? deliveredCount.value / totalDeliveries.value : 0)

const currentClient = computed(() => invoice.value?.client?.name || 'Cliente')
const currentAddress = computed(() => {
  const addr = invoice.value?.client?.address
  if (!addr) return 'Dirección no disponible'
  return addr.formattedAddress || addr.street || addr.name || 'Dirección no disponible'
})

const nextDeliveries = computed(() => {
  return allDeliveries.value.slice(currentDeliveryIndex.value + 1)
    .filter(d => d.delivery_status === 'pending')
})

// Current route metrics
const currentRouteTime = computed(() => {
  const delivery = allDeliveries.value[currentDeliveryIndex.value]
  return delivery?.estimated_time || '-'
})

const currentRouteDistance = computed(() => {
  const delivery = allDeliveries.value[currentDeliveryIndex.value]
  return delivery?.distance ? delivery.distance.toFixed(1) : '-'
})

// Total remaining metrics
const totalRemainingTime = computed(() => {
  const remaining = allDeliveries.value.slice(currentDeliveryIndex.value)
    .filter(d => d.delivery_status !== 'delivered')
    .reduce((sum, d) => sum + (d.estimated_time || 0), 0)
  return Math.ceil(remaining)
})

const totalRemainingDistance = computed(() => {
  const remaining = allDeliveries.value.slice(currentDeliveryIndex.value)
    .filter(d => d.delivery_status !== 'delivered')
    .reduce((sum, d) => sum + (d.distance || 0), 0)
  return remaining.toFixed(1)
})

// Payment computed properties
const isPaymentValid = computed(() => {
  return payment.value.amount > 0 && payment.value.payment_method_id
})

onMounted(async () => {
  await loadDeliveryRun()
  await initializeMap()
  await startLocationTracking()
  await loadPaymentMethods()
})

onUnmounted(() => {
  stopLocationTracking()
})

// Watch for delivery changes to update routes
watch(currentDeliveryIndex, async () => {
  if (!pauseUpdates.value) {
    await drawAllRoutes()
  }
})

async function loadPaymentMethods () {
  try {
    const response = await api.get('/payment-methods')
    paymentMethods.value = response.data.map(pm => ({
      label: pm.name,
      value: pm.id
    }))
    // Set default to first method
    if (paymentMethods.value.length > 0) {
      newPayment.value.payment_method_id = paymentMethods.value[0].value
    }
  } catch (error) {
    console.error('Error loading payment methods:', error)
  }
}

async function loadDeliveryRun (updateCurrentIndex = true) {
  try {
    console.log('Loading delivery run:', route.params.id)
    const response = await api.get(`/invoice-delivery-runs/${route.params.id}`)
    deliveryRun.value = response.data.delivery_run
    allDeliveries.value = deliveryRun.value.items || []

    console.log('Delivery run loaded:', deliveryRun.value)
    console.log('All deliveries:', allDeliveries.value)

    // Only update current index if specified (not after marking as delivered)
    if (updateCurrentIndex) {
      // Find current active delivery
      const activeIndex = allDeliveries.value.findIndex(
        item => item.delivery_status === 'pending' || item.delivery_status === 'arrived'
      )

      console.log('Active delivery index:', activeIndex)

      if (activeIndex !== -1) {
        currentDeliveryIndex.value = activeIndex
        invoice.value = allDeliveries.value[activeIndex].invoice
        console.log('Current invoice:', invoice.value)

        if (allDeliveries.value[activeIndex].delivery_status === 'arrived') {
          arrived.value = true
        }
      } else {
        $q.notify({ type: 'warning', message: 'No hay entregas pendientes', position: 'top' })
        router.push({ name: 'InvoiceDeliveryTray' })
      }
    }
  } catch (error) {
    console.error('Error loading delivery run:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar información', position: 'top' })
    router.push({ name: 'InvoiceDeliveryTray' })
  }
}

async function initializeMap () {
  try {
    await loadGoogleMaps()

    // Get initial center from first delivery or default
    let center = { lat: -34.603722, lng: -58.381592 }
    if (allDeliveries.value.length > 0) {
      const firstDelivery = allDeliveries.value[0]
      const location = getDeliveryLocation(firstDelivery)
      if (location.lat && location.lng) {
        center = location
      }
    }

    const mapOptions = {
      center,
      zoom: 15, // Zoom más cercano
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    }

    map.value = new google.maps.Map(mapContainer.value, mapOptions)
    directionsService.value = new google.maps.DirectionsService()

    console.log('Map initialized successfully')

    // Draw markers immediately (routes will be drawn when GPS is available)
    await drawAllRoutes()
  } catch (error) {
    console.error('Error initializing map:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar el mapa', position: 'top' })
  }
}

async function drawAllRoutes () {
  if (!map.value) {
    console.log('Map not initialized yet')
    return
  }

  if (allDeliveries.value.length === 0) {
    console.log('No deliveries to draw')
    return
  }

  if (!currentPosition.value) {
    console.log('No GPS position yet, showing delivery markers only')
    // Show delivery markers without routes
    clearAllMarkers()
    allDeliveries.value.forEach((delivery, idx) => {
      const color = idx === currentDeliveryIndex.value ? '#2196F3' : '#9E9E9E'
      addDeliveryMarker(delivery, idx + 1, color)
    })
    fitMapBounds()
    return
  }

  console.log('Drawing all routes with GPS position')

  // Clear existing polylines
  clearAllPolylines()
  clearAllMarkers()

  const origin = currentPosition.value

  // Draw completed routes (RED)
  for (let i = 0; i < currentDeliveryIndex.value; i++) {
    const delivery = allDeliveries.value[i]
    if (delivery.delivery_status === 'delivered') {
      await drawRoute(
        i === 0 ? origin : getDeliveryLocation(allDeliveries.value[i - 1]),
        getDeliveryLocation(delivery),
        '#EF5350', // Red
        completedPolylines.value
      )
    }
  }

  // Draw current route (BLUE)
  const currentDelivery = allDeliveries.value[currentDeliveryIndex.value]
  if (currentDelivery) {
    await drawRoute(
      origin, // Always from current position
      getDeliveryLocation(currentDelivery),
      '#2196F3', // Blue
      [currentPolyline],
      true // Update distance/time
    )

    // Add marker for current delivery
    addDeliveryMarker(currentDelivery, currentDeliveryIndex.value + 1, '#2196F3')
  }

  // Draw future routes (GRAY)
  for (let i = currentDeliveryIndex.value + 1; i < allDeliveries.value.length; i++) {
    const delivery = allDeliveries.value[i]
    const prevDelivery = allDeliveries.value[i - 1]

    await drawRoute(
      getDeliveryLocation(prevDelivery),
      getDeliveryLocation(delivery),
      '#9E9E9E', // Gray
      futurePolylines.value
    )

    // Add marker for future delivery
    addDeliveryMarker(delivery, i + 1, '#9E9E9E')
  }

  // Add courier marker
  updateCourierMarker()

  // Fit bounds to show all markers
  fitMapBounds()
}

async function drawRoute (origin, destination, color, polylinesArray, updateMetrics = false) {
  if (!directionsService.value) return

  try {
    const request = {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS
      },
      optimizeWaypoints: false
    }

    const result = await new Promise((resolve, reject) => {
      directionsService.value.route(request, (result, status) => {
        if (status === 'OK') resolve(result)
        else reject(status)
      })
    })

    const route = result.routes[0]
    const leg = route.legs[0]

    // Update metrics if this is the current route
    if (updateMetrics) {
      const delivery = allDeliveries.value[currentDeliveryIndex.value]
      delivery.distance = leg.distance.value / 1000 // Convert to km
      delivery.estimated_time = Math.ceil(leg.duration.value / 60) // Convert to minutes
    }

    // Draw polyline
    const polyline = new google.maps.Polyline({
      path: route.overview_path,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 5,
      map: map.value
    })

    if (Array.isArray(polylinesArray)) {
      polylinesArray.push(polyline)
    } else {
      polylinesArray.value = polyline
    }
  } catch (error) {
    console.error('Error drawing route:', error)
  }
}

function getDeliveryLocation (delivery) {
  const client = delivery.invoice?.client
  const lat = client?.address?.latitude || client?.latitude
  const lng = client?.address?.longitude || client?.longitude
  return { lat, lng }
}

function addDeliveryMarker (delivery, number, color) {
  const location = getDeliveryLocation(delivery)

  const marker = new google.maps.Marker({
    position: location,
    map: map.value,
    label: {
      text: String(number),
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold'
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 20,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2
    }
  })

  deliveryMarkers.value.push(marker)
}

function updateCourierMarker () {
  if (!currentPosition.value) return

  if (courierMarker.value) {
    courierMarker.value.setPosition(currentPosition.value)
  } else {
    courierMarker.value = new google.maps.Marker({
      position: currentPosition.value,
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        rotation: 0
      },
      zIndex: 1000
    })
  }
}

function clearAllPolylines () {
  completedPolylines.value.forEach(p => p.setMap(null))
  completedPolylines.value = []

  if (currentPolyline.value) {
    currentPolyline.value.setMap(null)
    currentPolyline.value = null
  }

  futurePolylines.value.forEach(p => p.setMap(null))
  futurePolylines.value = []
}

function clearAllMarkers () {
  deliveryMarkers.value.forEach(m => m.setMap(null))
  deliveryMarkers.value = []
}

function fitMapBounds () {
  if (!map.value) return

  const bounds = new google.maps.LatLngBounds()

  if (currentPosition.value) {
    bounds.extend(currentPosition.value)
  }

  allDeliveries.value.forEach(delivery => {
    const location = getDeliveryLocation(delivery)
    if (location.lat && location.lng) {
      bounds.extend(location)
    }
  })

  // Only fit bounds if we have multiple points
  if (allDeliveries.value.length > 1 || currentPosition.value) {
    map.value.fitBounds(bounds)

    // Adjust zoom - keep it between 14 and 17
    const listener = google.maps.event.addListener(map.value, 'idle', () => {
      const currentZoom = map.value.getZoom()
      if (currentZoom > 17) {
        map.value.setZoom(17)
      } else if (currentZoom < 14) {
        map.value.setZoom(14)
      }
      google.maps.event.removeListener(listener)
    })
  } else {
    // Single delivery, just center on it with good zoom
    map.value.setZoom(15)
  }
}

async function startLocationTracking () {
  if (!navigator.geolocation) {
    $q.notify({ type: 'warning', message: 'Geolocalización no disponible', position: 'top' })
    return
  }

  // Get initial position
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })

    currentPosition.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }

    updateCourierMarker()
    await drawAllRoutes()
  } catch (error) {
    console.error('Error getting initial position:', error)
  }

  // Watch position continuously
  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      currentPosition.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      updateCourierMarker()
    },
    (error) => console.error('Error watching position:', error),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )

  // Send location to server every 10 seconds
  locationUpdateInterval.value = setInterval(async () => {
    if (currentPosition.value) {
      try {
        await api.post(`/invoice-delivery-runs/${route.params.id}/update-location`, {
          latitude: currentPosition.value.lat,
          longitude: currentPosition.value.lng
        })
      } catch (error) {
        console.error('Error updating location:', error)
      }
    }
  }, LOCATION_UPDATE_FREQUENCY)
}

function stopLocationTracking () {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value)
    watchId.value = null
  }

  if (locationUpdateInterval.value) {
    clearInterval(locationUpdateInterval.value)
    locationUpdateInterval.value = null
  }
}

async function markDelivered () {
  marking.value = true
  try {
    const response = await api.post(`/invoice-delivery-runs/${route.params.id}/verify/${invoice.value.id}`)

    // Update delivery run data but DON'T change current index
    if (response.data.delivery_run) {
      deliveryRun.value = response.data.delivery_run
      allDeliveries.value = response.data.delivery_run.items || []
    }
    
    arrived.value = true

    $q.notify({ type: 'positive', message: 'Entrega completada exitosamente', position: 'top' })

    // NO verificar ni redirigir automáticamente
    // Esperar a que el usuario elija registrar pago o continuar
    // La verificación de última entrega se hace en continueToNext()
  } catch (error) {
    console.error('Error marking delivered:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al completar entrega',
      position: 'top'
    })
  } finally {
    marking.value = false
  }
}

function openGoogleMaps () {
  const client = invoice.value?.client
  const clientLat = client?.address?.latitude || client?.latitude
  const clientLng = client?.address?.longitude || client?.longitude
  if (!clientLat || !clientLng) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${clientLat},${clientLng}&travelmode=driving`
  window.open(url, '_blank')
}

function callClient () {
  const phone = invoice.value?.client?.phone_number
  if (phone) {
    window.location.href = `tel:${phone}`
  }
}

function confirmExit () {
  $q.dialog({
    title: 'Salir de la entrega',
    message: '¿Estás seguro de salir? El GPS tracking se detendrá.',
    dark: true,
    cancel: { flat: true, label: 'Cancelar', color: 'grey-5' },
    ok: { unelevated: true, label: 'Salir', color: 'negative' }
  }).onOk(() => {
    stopLocationTracking()
    router.back()
  })
}

// Payment functions
function handlePhotoUpload (event) {
  const file = event.target.files[0]
  if (file) {
    payment.value.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      payment.value.photoPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function savePayment () {
  if (!isPaymentValid.value) {
    $q.notify({ type: 'warning', message: 'Complete los datos del pago', position: 'top' })
    return
  }

  savingPayment.value = true
  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('invoice_id', invoice.value.id)
    formData.append('payments[0][amount]', payment.value.amount)
    formData.append('payments[0][payment_method_id]', payment.value.payment_method_id)

    if (payment.value.photo) {
      formData.append('payments[0][photo]', payment.value.photo)
    }

    console.log('Enviando pago:', {
      amount: payment.value.amount,
      payment_method_id: payment.value.payment_method_id,
      has_photo: !!payment.value.photo
    })

    const response = await api.post('/invoice-payments/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    console.log('Respuesta del servidor:', response.data)

    $q.notify({ type: 'positive', message: 'Pago registrado exitosamente', position: 'top' })
    closePaymentDialog()
    continueToNext()
  } catch (error) {
    console.error('Error saving payment:', error)
    console.error('Error details:', error.response?.data)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar pago',
      position: 'top'
    })
  } finally {
    savingPayment.value = false
  }
}

function openPaymentDialog () {
  pauseUpdates.value = true // Pausar actualizaciones automáticas
  showPaymentDialog.value = true
}

function closePaymentDialog () {
  showPaymentDialog.value = false
  pauseUpdates.value = false // Reanudar actualizaciones
  payment.value = {
    amount: null,
    payment_method_id: paymentMethods.value.length > 0 ? paymentMethods.value[0].value : null,
    photo: null,
    photoPreview: null
  }
}

async function continueToNext () {
  pauseUpdates.value = false // Reanudar actualizaciones antes de continuar

  // Check if all deliveries are completed
  if (currentDeliveryIndex.value + 1 >= allDeliveries.value.length) {
    // Es la última entrega - completar el delivery run
    try {
      await api.post(`/invoice-delivery-runs/${route.params.id}/complete`)

      $q.notify({
        type: 'positive',
        message: '¡Todas las entregas completadas! Ruta finalizada.',
        position: 'top',
        timeout: 3000,
        icon: 'celebration'
      })

      setTimeout(() => router.replace({ name: 'InvoiceDeliveryTray' }), 2000)
    } catch (error) {
      console.error('Error completing delivery run:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al finalizar ruta',
        position: 'top'
      })
    }
  } else {
    // Move to next delivery
    currentDeliveryIndex.value++
    invoice.value = allDeliveries.value[currentDeliveryIndex.value].invoice
    arrived.value = false
    drawAllRoutes()
    $q.notify({ type: 'info', message: 'Siguiente entrega', position: 'top' })
  }
}
</script>

<style scoped>
.bg-dark {
  background-color: #121212;
}
</style>
