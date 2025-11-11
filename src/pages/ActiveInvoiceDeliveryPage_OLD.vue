<template>
  <q-page class="bg-dark full-height">
    <div id="map" ref="mapContainer" style="width: 100%; height: 100%;"></div>

    <!-- Top Info Card -->
    <div class="absolute-top q-ma-sm" style="z-index: 1000;">
      <q-card dark class="bg-grey-9" style="border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap q-mb-sm">
            <q-btn flat round dense size="md" icon="arrow_back" @click="confirmExit" class="q-mr-sm" />
            <div class="col">
              <div class="text-caption text-grey-5">Entrega Activa</div>
              <div class="text-h6">{{ currentDeliveryIndex + 1 }}/{{ totalDeliveries }}</div>
            </div>
            <div class="text-right">
              <div class="text-h6 text-green">{{ currentRouteTime }} min</div>
              <div class="text-caption text-grey-5">{{ currentRouteDistance }} km</div>
            </div>
            <q-btn flat dense round size="md" icon="navigation" color="primary" @click="openGoogleMaps" class="q-ml-sm" />
          </div>
          
          <!-- Route Progress -->
          <div class="q-mt-sm">
            <div class="row items-center q-mb-xs">
              <div class="text-caption text-grey-5">Progreso Total</div>
              <q-space />
              <div class="text-caption text-weight-bold">{{ deliveredCount }}/{{ totalDeliveries }} entregas</div>
            </div>
            <q-linear-progress 
              :value="overallProgress" 
              color="green" 
              track-color="grey-8"
              size="12px" 
              rounded
              class="q-mb-xs"
            />
            <div class="row items-center text-caption text-grey-5">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />
              <span>{{ totalRemainingTime }} min restantes • {{ totalRemainingDistance }} km</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Delivery Card -->
    <div class="absolute-bottom q-ma-sm" style="z-index: 1000;">
      <q-card dark class="bg-grey-9" style="border-radius: 16px; box-shadow: 0 -4px 12px rgba(0,0,0,0.3);">
        <div class="row items-center justify-center q-pa-xs" style="cursor: pointer;" @click="showDetails = !showDetails">
          <q-icon :name="showDetails ? 'expand_more' : 'expand_less'" size="24px" color="grey-5" />
        </div>
        
        <q-slide-transition>
          <div v-show="showDetails">
            <q-card-section class="q-pa-md q-pt-sm">
              <!-- Current Delivery Info -->
              <div class="q-mb-md">
                <div class="row items-center q-mb-sm">
                  <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
                    <q-icon name="person" size="24px" />
                  </q-avatar>
                  <div class="col">
                    <div class="text-body2 text-grey-5">Cliente Actual</div>
                    <div class="text-h6">{{ currentClient }}</div>
                  </div>
                  <q-btn flat dense round icon="phone" color="green" @click="callClient" />
                </div>
                
                <div class="bg-grey-8 q-pa-sm" style="border-radius: 8px;">
                  <div class="row items-start">
                    <q-icon name="location_on" color="red" size="20px" class="q-mr-sm" />
                    <div class="col text-caption">
                      {{ currentAddress }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Products Summary -->
              <div class="q-mb-md">
                <div class="row items-center q-mb-xs">
                  <q-icon name="shopping_cart" size="18px" class="q-mr-xs" />
                  <span class="text-body2">{{ invoice?.products?.length || 0 }} productos</span>
                  <q-space />
                  <span class="text-h6 text-green">${{ invoice?.total?.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Action Button -->
              <q-btn 
                v-if="!arrived" 
                unelevated 
                no-caps 
                label="Marcar como Entregado" 
                color="light-green-6" 
                text-color="dark" 
                icon="check_circle" 
                class="full-width" 
                style="border-radius: 12px; font-weight: bold; height: 56px; font-size: 16px;" 
                @click="markDelivered" 
                :loading="marking" 
              />

              <div v-else class="text-center q-pa-md bg-green-9" style="border-radius: 12px;">
                <q-icon name="check_circle" color="green" size="48px" />
                <div class="text-h6 q-mt-sm">¡Entrega completada!</div>
                <div class="text-caption text-grey-5 q-mt-xs">Cargando siguiente destino...</div>
              </div>

              <!-- Next Deliveries Preview -->
              <div v-if="nextDeliveries.length > 0" class="q-mt-md">
                <div class="text-caption text-grey-5 q-mb-sm">Próximas entregas</div>
                <div v-for="(next, idx) in nextDeliveries.slice(0, 2)" :key="next.id" class="row items-center q-mb-xs bg-grey-8 q-pa-sm" style="border-radius: 8px;">
                  <q-avatar size="24px" color="grey-7" text-color="white" class="q-mr-sm">
                    <span class="text-caption">{{ currentDeliveryIndex + idx + 2 }}</span>
                  </q-avatar>
                  <div class="col">
                    <div class="text-caption text-weight-medium">{{ next.client?.name }}</div>
                  </div>
                  <div class="text-caption text-grey-5">{{ next.distance }} km</div>
                </div>
              </div>

              <q-btn flat no-caps label="Más opciones" color="grey-5" icon="more_horiz" class="full-width q-mt-sm" @click="showOptions = true" />
            </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <q-dialog v-model="showOptions">
      <q-card dark class="bg-grey-9" style="min-width: 300px; border-radius: 16px;">
        <q-list>
          <q-item clickable v-ripple @click="viewDetails">
            <q-item-section avatar><q-icon name="info" color="primary" /></q-item-section>
            <q-item-section>Ver detalles de entrega</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="callClient">
            <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
            <q-item-section>Llamar al cliente</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="reportIssue">
            <q-item-section avatar><q-icon name="report_problem" color="orange" /></q-item-section>
            <q-item-section>Reportar problema</q-item-section>
          </q-item>
          <q-separator dark class="q-my-sm" />
          <q-item clickable v-ripple @click="cancelDelivery" class="text-negative">
            <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
            <q-item-section>Cancelar entrega</q-item-section>
          </q-item>
        </q-list>
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
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Map and UI refs
const mapContainer = ref(null)
const map = ref(null)
const showOptions = ref(false)
const showDetails = ref(true)
const marking = ref(false)
const arrived = ref(false)

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
const directionsRenderer = ref(null)

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

onMounted(async () => {
  await loadDeliveryRun()
  await initializeMap()
  await startLocationTracking()
})

onUnmounted(() => {
  stopLocationTracking()
})

async function loadDeliveryRun () {
  try {
    const response = await api.get(`/invoice-delivery-runs/${route.params.id}`)
    deliveryRun.value = response.data.delivery_run
    const items = deliveryRun.value.items || []
    const activeItem = items.find(i => i.delivery_status === 'pending' || i.delivery_status === 'arrived')
    if (activeItem) {
      invoice.value = activeItem.invoice
      if (activeItem.delivery_status === 'arrived') {
        arrived.value = true
      }
    }
    if (!invoice.value) {
      $q.notify({ type: 'warning', message: 'No hay entregas pendientes en esta ruta', position: 'top' })
      router.push({ name: 'InvoiceDeliveryTray' })
    }
  } catch (error) {
    console.error('Error loading delivery run:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar información de la entrega', position: 'top' })
    router.push({ name: 'InvoiceDeliveryTray' })
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
  allMarkers.value.forEach(marker => marker.setMap(null))
  allMarkers.value = []
  const items = deliveryRun.value?.items || []
  const pendingItems = items.filter(i => i.delivery_status === 'pending' || i.delivery_status === 'arrived')
  items.forEach((item, index) => {
    const invoiceData = item.invoice
    const client = invoiceData?.client
    const clientLat = client?.address?.latitude || client?.latitude
    const clientLng = client?.address?.longitude || client?.longitude
    let color = '#9E9E9E'
    let scale = 10
    let strokeWeight = 2
    if (item.delivery_status === 'delivered') {
      color = '#4CAF50'
      scale = 9
    } else if (item.delivery_status === 'arrived') {
      color = '#FF9800'
      scale = 12
      strokeWeight = 3
    } else if (item.delivery_status === 'pending') {
      const firstPending = pendingItems[0]
      if (item.id === firstPending?.id) {
        color = '#2979FF'
        scale = 12
        strokeWeight = 3
      } else {
        color = '#9E9E9E'
        scale = 9
      }
    }
    if (clientLat && clientLng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(clientLat), lng: parseFloat(clientLng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        title: client?.name || `Cliente ${index + 1}`
      })
      allMarkers.value.push(marker)
    }
  })
  courierMarker.value = new google.maps.Marker({
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: '#FF5722',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      rotation: 0
    }
  })
  if (allMarkers.value.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    allMarkers.value.forEach(marker => bounds.extend(marker.getPosition()))
    map.value.fitBounds(bounds)
  }
}

async function drawRoute () {
  if (routePath.value) routePath.value.setMap(null)
  futureRoutes.value.forEach(route => route.setMap(null))
  futureRoutes.value = []
  completedRoutes.value.forEach(route => route.setMap(null))
  completedRoutes.value = []
  const items = deliveryRun.value?.items || []
  const completedItems = items.filter(i => i.delivery_status === 'delivered')
  const pendingItems = items.filter(i => i.delivery_status === 'pending' || i.delivery_status === 'arrived')
  const directionsService = new google.maps.DirectionsService()
  if (completedItems.length > 0) {
    const branchOffice = deliveryRun.value?.branch_office
    const completedPoints = []
    if (branchOffice) {
      const originLat = branchOffice?.address?.latitude || branchOffice?.latitude
      const originLng = branchOffice?.address?.longitude || branchOffice?.longitude
      if (originLat && originLng) {
        completedPoints.push({ lat: parseFloat(originLat), lng: parseFloat(originLng), name: branchOffice?.name || 'Origen' })
      }
    }
    completedItems.forEach(item => {
      const client = item.invoice?.client
      const clientLat = client?.address?.latitude || client?.latitude
      const clientLng = client?.address?.longitude || client?.longitude
      if (clientLat && clientLng) {
        completedPoints.push({ lat: parseFloat(clientLat), lng: parseFloat(clientLng), name: client?.name || 'Cliente' })
      }
    })
    for (let i = 0; i < completedPoints.length - 1; i++) {
      const from = completedPoints[i]
      const to = completedPoints[i + 1]
      try {
        const result = await directionsService.route({
          origin: { lat: from.lat, lng: from.lng },
          destination: { lat: to.lat, lng: to.lng },
          travelMode: google.maps.TravelMode.DRIVING
        })
        const completedRenderer = new google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: true,
          polylineOptions: { strokeColor: '#4CAF50', strokeWeight: 5, strokeOpacity: 0.8 }
        })
        completedRenderer.setDirections(result)
        completedRoutes.value.push(completedRenderer)
      } catch (error) {
        console.error('Error drawing completed route:', error)
      }
    }
  }
  if (pendingItems.length === 0) return
  const firstPending = pendingItems[0].invoice
  const firstPendingClient = firstPending?.client
  let currentOrigin
  if (completedItems.length > 0) {
    const lastCompleted = completedItems[completedItems.length - 1].invoice
    currentOrigin = lastCompleted?.client
  } else {
    currentOrigin = deliveryRun.value?.branch_office
  }
  const originLat = currentOrigin?.address?.latitude || currentOrigin?.latitude
  const originLng = currentOrigin?.address?.longitude || currentOrigin?.longitude
  const firstDestLat = firstPendingClient?.address?.latitude || firstPendingClient?.latitude
  const firstDestLng = firstPendingClient?.address?.longitude || firstPendingClient?.longitude
  if (originLat && originLng && firstDestLat && firstDestLng) {
    try {
      const result = await directionsService.route({
        origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        destination: { lat: parseFloat(firstDestLat), lng: parseFloat(firstDestLng) },
        travelMode: google.maps.TravelMode.DRIVING
      })
      const currentRouteRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#2979FF', strokeWeight: 6, strokeOpacity: 1 }
      })
      currentRouteRenderer.setDirections(result)
      routePath.value = currentRouteRenderer
      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0]
        const leg = route.legs[0]
        routeDistance.value = leg.distance.value
        routeDuration.value = leg.duration.value
      }
      await updateRouteInfo()
    } catch (error) {
      console.error('Error drawing current route:', error)
    }
  }
  if (pendingItems.length > 1) {
    for (let i = 0; i < pendingItems.length - 1; i++) {
      const currentItem = pendingItems[i].invoice
      const nextItem = pendingItems[i + 1].invoice
      const currentClient = currentItem?.client
      const nextClient = nextItem?.client
      const currentLat = currentClient?.address?.latitude || currentClient?.latitude
      const currentLng = currentClient?.address?.longitude || currentClient?.longitude
      const nextLat = nextClient?.address?.latitude || nextClient?.latitude
      const nextLng = nextClient?.address?.longitude || nextClient?.longitude
      if (currentLat && currentLng && nextLat && nextLng) {
        try {
          const result = await directionsService.route({
            origin: { lat: parseFloat(currentLat), lng: parseFloat(currentLng) },
            destination: { lat: parseFloat(nextLat), lng: parseFloat(nextLng) },
            travelMode: google.maps.TravelMode.DRIVING
          })
          const futureRenderer = new google.maps.DirectionsRenderer({
            map: map.value,
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#9E9E9E', strokeWeight: 4, strokeOpacity: 0.7 },
            preserveViewport: true
          })
          futureRenderer.setDirections(result)
          futureRoutes.value.push(futureRenderer)
        } catch (error) {
          console.error('Error drawing future route:', error)
        }
      }
    }
  }
}

async function startLocationTracking () {
  try {
    const isNativePlatform = $q.platform.is.capacitor || $q.platform.is.cordova
    if (isNativePlatform) {
      const { Geolocation } = await import('@capacitor/geolocation')
      const permission = await Geolocation.requestPermissions()
      if (permission.location !== 'granted') {
        $q.notify({ type: 'warning', message: 'Se requieren permisos de ubicación', position: 'top' })
        return
      }
      watchId.value = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }, (position) => {
        if (position) updateCourierPosition(position)
      })
    } else {
      if (!navigator.geolocation) throw new Error('Geolocation no soportada en este navegador')
      watchId.value = navigator.geolocation.watchPosition((position) => updateCourierPosition(position), (error) => console.error('Geolocation error:', error), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
    }
    locationInterval.value = setInterval(() => sendLocationToServer(), 5000)
    isTracking.value = true
    $q.notify({ type: 'positive', message: 'GPS tracking iniciado', position: 'top', timeout: 2000 })
  } catch (error) {
    console.error('Error starting location tracking:', error)
    $q.notify({ type: 'negative', message: 'Error al iniciar GPS tracking: ' + error.message, position: 'top' })
  }
}

function updateCourierPosition (position) {
  const coords = position.coords
  currentPosition.value = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, altitude: coords.altitude, heading: coords.heading, speed: coords.speed }
  if (courierMarker.value) {
    const latLng = new google.maps.LatLng(coords.latitude, coords.longitude)
    courierMarker.value.setPosition(latLng)
    if (coords.heading !== null) {
      const icon = courierMarker.value.getIcon()
      icon.rotation = coords.heading
      courierMarker.value.setIcon(icon)
    }
  }
  updateRouteFromCurrentPosition()
}

async function updateRouteFromCurrentPosition () {
  if (!currentPosition.value || !invoice.value?.client) return
  const client = invoice.value.client
  const clientLat = client?.address?.latitude || client?.latitude
  const clientLng = client?.address?.longitude || client?.longitude
  if (!clientLat || !clientLng) return
  try {
    const directionsService = new google.maps.DirectionsService()
    const result = await directionsService.route({
      origin: { lat: currentPosition.value.latitude, lng: currentPosition.value.longitude },
      destination: { lat: parseFloat(clientLat), lng: parseFloat(clientLng) },
      travelMode: google.maps.TravelMode.DRIVING
    })
    if (result.routes && result.routes.length > 0) {
      const route = result.routes[0]
      if (route.legs && route.legs.length > 0) {
        const leg = route.legs[0]
        routeDistance.value = leg.distance.value
        routeDuration.value = leg.duration.value
      }
    }
  } catch (error) {
    console.error('Error updating route from current position:', error)
  }
}

async function sendLocationToServer () {
  if (!currentPosition.value) return
  try {
    const accuracy = currentPosition.value.accuracy ? Math.min(currentPosition.value.accuracy, 100000) : null
    await api.post(`/invoice-delivery-runs/${route.params.id}/locations`, {
      latitude: currentPosition.value.latitude,
      longitude: currentPosition.value.longitude,
      accuracy: accuracy,
      altitude: currentPosition.value.altitude,
      heading: currentPosition.value.heading,
      speed: currentPosition.value.speed,
      device_type: $q.platform.is.capacitor ? 'mobile' : 'web'
    })
  } catch (error) {
    console.error('Error sending location:', error)
  }
}

function stopLocationTracking () {
  if (watchId.value) {
    const isNativePlatform = $q.platform.is.capacitor || $q.platform.is.cordova
    if (isNativePlatform) {
      import('@capacitor/geolocation').then(({ Geolocation }) => Geolocation.clearWatch({ id: watchId.value }))
    } else {
      navigator.geolocation.clearWatch(watchId.value)
    }
    watchId.value = null
  }
  if (locationInterval.value) {
    clearInterval(locationInterval.value)
    locationInterval.value = null
  }
  isTracking.value = false
}

async function updateRouteInfo () {
  if (!routeDistance.value || !routeDuration.value) return
  try {
    await api.patch(`/invoice-delivery-runs/${route.params.id}`, {
      total_distance_km: (routeDistance.value / 1000).toFixed(2),
      estimated_duration_minutes: Math.ceil(routeDuration.value / 60)
    })
  } catch (error) {
    console.error('Error updating route info:', error)
  }
}

async function markDelivered () {
  marking.value = true
  try {
    // Mark as arrived and delivered in one step
    const response = await api.post(`/invoice-delivery-runs/${route.params.id}/verify/${invoice.value.id}`)
    
    if (response.data.delivery_run) deliveryRun.value = response.data.delivery_run
    arrived.value = true
    
    $q.notify({ type: 'positive', message: 'Entrega completada exitosamente', position: 'top' })
    
    // Check if all deliveries are completed
    if (response.data.all_delivered) {
      $q.notify({ 
        type: 'positive', 
        message: '¡Todas las entregas completadas! Ruta finalizada.', 
        position: 'top', 
        timeout: 3000, 
        icon: 'celebration' 
      })
      setTimeout(() => router.replace({ name: 'InvoiceDeliveryTray' }), 2000)
    } else {
      // Load next delivery
      const pendingItems = response.data.delivery_run?.items?.filter(i => i.delivery_status === 'pending')
      $q.notify({ 
        type: 'info', 
        message: `Quedan ${pendingItems.length} entrega(s) pendiente(s)`, 
        position: 'top', 
        timeout: 2000 
      })
      arrived.value = false
      await loadDeliveryRun()
      if (invoice.value) await drawRoute()
    }
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

// QR verification and Pusher listeners removed - direct delivery confirmation

function openGoogleMaps () {
  const client = invoice.value?.client
  const clientLat = client?.address?.latitude || client?.latitude
  const clientLng = client?.address?.longitude || client?.longitude
  if (!clientLat || !clientLng) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${clientLat},${clientLng}&travelmode=driving`
  window.open(url, '_blank')
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

function viewDetails () {
  showOptions.value = false
}

function callClient () {
  showOptions.value = false
  const phone = invoice.value?.client?.phone || invoice.value?.client?.phone_number
  if (phone) window.open(`tel:${phone}`, '_self')
}

function reportIssue () {
  showOptions.value = false
}

function cancelDelivery () {
  showOptions.value = false
  $q.dialog({
    title: 'Cancelar Entrega',
    message: '¿Estás seguro de cancelar esta entrega?',
    dark: true,
    prompt: { model: '', type: 'textarea', label: 'Motivo de cancelación', filled: true, dark: true },
    cancel: { flat: true, label: 'No', color: 'grey-5' },
    ok: { unelevated: true, label: 'Sí, cancelar', color: 'negative' }
  }).onOk(async (reason) => {
    try {
      await api.post(`/invoice-delivery-runs/${route.params.id}/cancel`, { reason })
      stopLocationTracking()
      $q.notify({ type: 'info', message: 'Entrega cancelada', position: 'top' })
      router.replace({ name: 'InvoiceDeliveryTray' })
    } catch (error) {
      console.error('Error canceling delivery:', error)
      $q.notify({ type: 'negative', message: 'Error al cancelar entrega', position: 'top' })
    }
  })
}
</script>

<style scoped>
.bg-dark { background-color: #1a1a1a; }
#map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
</style>
