<template>
  <q-page class="bg-dark full-height">
    <!-- Map Container -->
    <div id="map" ref="mapContainer" style="width: 100%; height: 100%;"></div>

    <!-- Top Info Card - Compacto -->
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
              <div class="text-caption text-grey-5" style="line-height: 1.2;">#{{ transfer?.transfer_number }}</div>
            </div>
            <div class="text-right q-ml-sm">
              <div class="text-body1 text-weight-bold text-green" style="line-height: 1.2;">{{ estimatedTime }} min</div>
              <div class="text-caption text-grey-5" style="line-height: 1.2;">{{ distance }} km</div>
            </div>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="navigation"
              color="primary"
              @click="openGoogleMaps"
              class="q-ml-xs"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Action Card - Colapsable -->
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
            <q-icon name="local_shipping" color="primary" size="24px" class="q-mr-sm" />
            <div class="col">
              <div class="text-caption text-grey-5">Progreso</div>
              <q-linear-progress
                :value="progress"
                color="green"
                class="q-mt-xs"
                style="height: 8px; border-radius: 4px;"
              />
            </div>
            <div class="q-ml-md text-caption">{{ deliveredCount }}/{{ totalCount }}</div>
          </div>

          <!-- Current Transfer Info -->
          <div class="q-mb-md">
            <div class="text-caption text-grey-5">Destino Actual</div>
            <div class="text-body1">{{ currentDestination }}</div>
            <div class="text-caption text-grey-5 q-mt-xs">
              <q-icon name="inventory_2" size="16px" />
              {{ transfer?.products?.length || 0 }} productos
            </div>
          </div>

          <!-- Action Button -->
          <q-btn
            v-if="!arrived"
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

          <div v-else class="text-center q-pa-md">
            <q-icon name="check_circle" color="green" size="40px" />
            <div class="text-body1 q-mt-sm q-mb-md">Esperando confirmación de entrega</div>

            <!-- QR Code -->
            <div class="q-mb-md" v-if="qrCodeData">
              <div class="text-caption text-grey-5 q-mb-sm">Muestra este QR al receptor</div>
              <div class="flex flex-center">
                <img :src="qrCodeData" alt="QR Code" style="width: 200px; height: 200px; border: 2px solid #fff; border-radius: 8px; padding: 10px; background: white;" />
              </div>
            </div>

            <div class="text-caption text-grey-5">El receptor debe escanear el QR para confirmar</div>
          </div>

          <!-- More Options -->
          <q-btn
            flat
            no-caps
            label="Más opciones"
            color="grey-5"
            icon="more_horiz"
            class="full-width q-mt-sm"
            @click="showOptions = true"
          />
        </q-card-section>
          </div>
        </q-slide-transition>
      </q-card>
    </div>

    <!-- Options Dialog -->
    <q-dialog v-model="showOptions">
      <q-card dark class="bg-grey-9" style="min-width: 300px; border-radius: 16px;">
        <q-list>
          <q-item clickable v-ripple @click="viewDetails">
            <q-item-section avatar>
              <q-icon name="info" color="primary" />
            </q-item-section>
            <q-item-section>Ver detalles de entrega</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="callSupport">
            <q-item-section avatar>
              <q-icon name="phone" color="primary" />
            </q-item-section>
            <q-item-section>Llamar a soporte</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="reportIssue">
            <q-item-section avatar>
              <q-icon name="report_problem" color="orange" />
            </q-item-section>
            <q-item-section>Reportar problema</q-item-section>
          </q-item>

          <q-separator dark class="q-my-sm" />

          <q-item clickable v-ripple @click="cancelTransport" class="text-negative">
            <q-item-section avatar>
              <q-icon name="cancel" color="negative" />
            </q-item-section>
            <q-item-section>Cancelar transporte</q-item-section>
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
import { echo } from 'src/boot/pusher'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Refs
const mapContainer = ref(null)
const map = ref(null)
const transfer = ref(null)
const deliveryRun = ref(null)
const isTracking = ref(false)
const arrived = ref(false)
const marking = ref(false)
const showOptions = ref(false)
const showDetails = ref(true)
const qrCodeData = ref(null)
const pollingInterval = ref(null)

// Location tracking
const currentPosition = ref(null)
const watchId = ref(null)
const locationInterval = ref(null)

// Map markers
const courierMarker = ref(null)
const originMarker = ref(null)
const destinationMarker = ref(null)
const routePath = ref(null)

// Google Maps route data
const routeDistance = ref(null) // en metros
const routeDuration = ref(null) // en segundos

// Computed
const estimatedTime = computed(() => {
  if (routeDuration.value) {
    return Math.ceil(routeDuration.value / 60) // convertir segundos a minutos
  }
  return deliveryRun.value?.estimated_duration_minutes || 15
})

const distance = computed(() => {
  if (routeDistance.value) {
    return (routeDistance.value / 1000).toFixed(1) // convertir metros a km
  }
  return deliveryRun.value?.total_distance_km?.toFixed(1) || '10.5'
})

const progress = computed(() => {
  if (!deliveryRun.value) return 0
  const delivered = deliveryRun.value.delivered_transfers_count || 0
  const total = deliveryRun.value.total_transfers_count || 1
  return delivered / total
})

const deliveredCount = computed(() => {
  return deliveryRun.value?.delivered_transfers_count || 0
})

const totalCount = computed(() => {
  return deliveryRun.value?.total_transfers_count || 1
})

const currentDestination = computed(() => {
  return transfer.value?.destination_branch_office?.name || 'Destino'
})

onMounted(async () => {
  await loadDeliveryRun()
  await initializeMap()
  await startLocationTracking()
})

onUnmounted(() => {
  stopLocationTracking()
  stopListening()
})

async function loadDeliveryRun () {
  try {
    const response = await api.get(`/delivery-runs/${route.params.id}`)
    deliveryRun.value = response.data.delivery_run

    console.log('Delivery Run loaded:', deliveryRun.value)

    // Get first pending or arrived transfer (camelCase from backend)
    const transfers = deliveryRun.value.delivery_run_transfers || []
    const activeTransfer = transfers.find(t => t.delivery_status === 'pending' || t.delivery_status === 'arrived')

    if (activeTransfer) {
      transfer.value = activeTransfer.transfer_stock
      console.log('Transfer loaded:', transfer.value)
      console.log('Origin:', transfer.value?.origin_branch_office)
      console.log('Destination:', transfer.value?.destination_branch_office)

      // Si ya está en estado arrived, mostrar QR y iniciar polling
      if (activeTransfer.delivery_status === 'arrived') {
        arrived.value = true
        await generateQRCode()
        startListeningForVerification()
      }
    }

    if (!transfer.value) {
      $q.notify({
        type: 'warning',
        message: 'No hay transferencias pendientes en este viaje',
        position: 'top'
      })
      router.push({ name: 'CourierTray' })
    }
  } catch (error) {
    console.error('Error loading delivery run:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar información del viaje',
      position: 'top'
    })
    router.push({ name: 'CourierTray' })
  }
}

async function initializeMap () {
  // Wait for Google Maps to load
  await loadGoogleMaps()

  // Initialize map
  map.value = new google.maps.Map(mapContainer.value, {
    center: { lat: -34.603722, lng: -58.381592 }, // Default Buenos Aires
    zoom: 13,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    styles: darkMapStyles
  })

  // Add markers
  addMapMarkers()

  // Draw route
  await drawRoute()
}

function addMapMarkers () {
  const origin = transfer.value?.origin_branch_office
  const destination = transfer.value?.destination_branch_office

  console.log('Adding markers - Origin:', origin)
  console.log('Adding markers - Destination:', destination)

  // Get coordinates from address object or direct properties
  const originLat = origin?.address?.latitude || origin?.latitude
  const originLng = origin?.address?.longitude || origin?.longitude
  const destLat = destination?.address?.latitude || destination?.latitude
  const destLng = destination?.address?.longitude || destination?.longitude

  // Origin marker (green)
  if (originLat && originLng) {
    originMarker.value = new google.maps.Marker({
      position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      },
      label: {
        text: 'A',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    })
  }

  // Destination marker (blue)
  if (destLat && destLng) {
    destinationMarker.value = new google.maps.Marker({
      position: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
      map: map.value,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      },
      label: {
        text: 'B',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    })
  }

  // Courier marker (will be updated with GPS)
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

  // Adjust map bounds to show all markers
  if (originLat && destLat) {
    const bounds = new google.maps.LatLngBounds()
    bounds.extend({ lat: parseFloat(originLat), lng: parseFloat(originLng) })
    bounds.extend({ lat: parseFloat(destLat), lng: parseFloat(destLng) })
    map.value.fitBounds(bounds)
  }
}

async function drawRoute () {
  const origin = transfer.value?.origin_branch_office
  const destination = transfer.value?.destination_branch_office

  console.log('Drawing route - Origin:', origin)
  console.log('Drawing route - Destination:', destination)

  // Get coordinates from address object or direct properties
  const originLat = origin?.address?.latitude || origin?.latitude
  const originLng = origin?.address?.longitude || origin?.longitude
  const destLat = destination?.address?.latitude || destination?.latitude
  const destLng = destination?.address?.longitude || destination?.longitude

  if (!originLat || !destLat) {
    console.error('Missing coordinates for route')
    $q.notify({
      type: 'warning',
      message: 'Las sucursales no tienen coordenadas configuradas',
      position: 'top'
    })
    return
  }

  const directionsService = new google.maps.DirectionsService()
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map.value,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#4285F4',
      strokeWeight: 5,
      strokeOpacity: 0.8
    }
  })

  try {
    const result = await directionsService.route({
      origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
      travelMode: google.maps.TravelMode.DRIVING
    })

    directionsRenderer.setDirections(result)
    routePath.value = directionsRenderer

    // Extraer distancia y duración de la ruta
    if (result.routes && result.routes.length > 0) {
      const route = result.routes[0]
      if (route.legs && route.legs.length > 0) {
        const leg = route.legs[0]
        routeDistance.value = leg.distance.value // metros
        routeDuration.value = leg.duration.value // segundos

        console.log('Route info:', {
          distance: leg.distance.text,
          duration: leg.duration.text,
          distanceMeters: leg.distance.value,
          durationSeconds: leg.duration.value
        })

        // Enviar al backend para actualizar el delivery run
        await updateRouteInfo()
      }
    }
  } catch (error) {
    console.error('Error drawing route:', error)
  }
}

async function startLocationTracking () {
  try {
    // Request permissions
    const permission = await Geolocation.requestPermissions()

    if (permission.location !== 'granted') {
      $q.notify({
        type: 'warning',
        message: 'Se requieren permisos de ubicación',
        position: 'top'
      })
      return
    }

    // Start watching position
    watchId.value = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position) => {
        if (position) {
          updateCourierPosition(position)
        }
      }
    )

    // Send location to server every 5 seconds
    locationInterval.value = setInterval(() => {
      sendLocationToServer()
    }, 5000)

    isTracking.value = true

    $q.notify({
      type: 'positive',
      message: 'GPS tracking iniciado',
      position: 'top',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error starting location tracking:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar GPS tracking',
      position: 'top'
    })
  }
}

function updateCourierPosition (position) {
  const coords = position.coords

  currentPosition.value = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    heading: coords.heading,
    speed: coords.speed
  }

  // Update marker on map
  if (courierMarker.value) {
    const latLng = new google.maps.LatLng(coords.latitude, coords.longitude)
    courierMarker.value.setPosition(latLng)

    // Update rotation if heading available
    if (coords.heading !== null) {
      const icon = courierMarker.value.getIcon()
      icon.rotation = coords.heading
      courierMarker.value.setIcon(icon)
    }

    // Center map on courier (optional)
    // map.value.panTo(latLng)
  }

  // Recalculate route from current position to destination
  updateRouteFromCurrentPosition()
}

async function updateRouteFromCurrentPosition () {
  if (!currentPosition.value || !transfer.value?.destination_branch_office) return

  const destination = transfer.value.destination_branch_office
  const destLat = destination?.address?.latitude || destination?.latitude
  const destLng = destination?.address?.longitude || destination?.longitude

  if (!destLat || !destLng) return

  try {
    const directionsService = new google.maps.DirectionsService()
    const result = await directionsService.route({
      origin: {
        lat: currentPosition.value.latitude,
        lng: currentPosition.value.longitude
      },
      destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
      travelMode: google.maps.TravelMode.DRIVING
    })

    // Update time and distance based on current position
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
    await api.post(`/delivery-runs/${route.params.id}/locations`, {
      latitude: currentPosition.value.latitude,
      longitude: currentPosition.value.longitude,
      accuracy: currentPosition.value.accuracy,
      altitude: currentPosition.value.altitude,
      heading: currentPosition.value.heading,
      speed: currentPosition.value.speed,
      device_type: 'mobile'
    })
  } catch (error) {
    console.error('Error sending location:', error)
  }
}

function stopLocationTracking () {
  if (watchId.value) {
    Geolocation.clearWatch({ id: watchId.value })
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
    await api.patch(`/delivery-runs/${route.params.id}`, {
      total_distance_km: (routeDistance.value / 1000).toFixed(2),
      estimated_duration_minutes: Math.ceil(routeDuration.value / 60)
    })

    console.log('Route info updated in backend')
  } catch (error) {
    console.error('Error updating route info:', error)
  }
}

async function markArrived () {
  marking.value = true
  try {
    const response = await api.post(`/delivery-runs/${route.params.id}/arrived/${transfer.value.id}`)

    // Actualizar delivery run con la respuesta del backend
    if (response.data.delivery_run) {
      deliveryRun.value = response.data.delivery_run
    }

    arrived.value = true

    // Generate QR Code
    await generateQRCode()

    $q.notify({
      type: 'positive',
      message: 'Llegada registrada. Muestra el QR al receptor.',
      position: 'top'
    })

    // Listen for verification via Pusher
    startListeningForVerification()
  } catch (error) {
    console.error('Error marking arrived:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al registrar llegada',
      position: 'top'
    })
  } finally {
    marking.value = false
  }
}

function startListeningForVerification () {
  // Escuchar eventos Pusher en lugar de polling
  const channel = echo.channel(`delivery-run.${route.params.id}`)
  
  channel.listen('.transfer.verified', async (event) => {
    console.log('Transfer verified event received:', event)

    if (event.transfer_stock_id === transfer.value.id) {
      $q.notify({
        type: 'positive',
        message: 'Entrega verificada exitosamente',
        position: 'top'
      })

      if (event.all_delivered) {
        // All done! Show success message and go back to tray
        $q.notify({
          type: 'positive',
          message: '¡Todas las entregas completadas! Viaje finalizado.',
          position: 'top',
          timeout: 3000,
          icon: 'celebration'
        })

        // Wait a moment before redirecting
        setTimeout(() => {
          router.replace({ name: 'CourierTray' })
        }, 2000)
      } else {
        // Hay más transferencias pendientes
        const response = await api.get(`/delivery-runs/${route.params.id}`)
        const pendingTransfers = response.data.delivery_run?.delivery_run_transfers?.filter(
          t => t.delivery_status === 'pending'
        )

        $q.notify({
          type: 'info',
          message: `Quedan ${pendingTransfers.length} transferencia(s) pendiente(s)`,
          position: 'top',
          timeout: 2000
        })

        // Resetear estado y cargar siguiente transferencia
        arrived.value = false
        qrCodeData.value = null
        
        // Recargar delivery run y siguiente transferencia
        await loadDeliveryRun()
        if (transfer.value) {
          await drawRoute()
        }
      }
    }
  })
}

function stopListening () {
  // Dejar de escuchar eventos Pusher
  echo.leave(`delivery-run.${route.params.id}`)
}

async function generateQRCode () {
  try {
    // Crear datos del QR igual que en el PDF
    const qrData = JSON.stringify({
      type: 'transfer_stock',
      id: transfer.value.id,
      transfer_number: transfer.value.transfer_number,
      origin: transfer.value.origin_branch_office?.name,
      destination: transfer.value.destination_branch_office?.name,
      date: new Date().toISOString().split('T')[0]
    })

    // Usar una librería de QR para generar en el frontend
    // Por ahora, pediremos al backend que genere el QR
    const response = await api.post('/transfer-stocks/generate-qr', {
      transfer_id: transfer.value.id
    })

    qrCodeData.value = `data:image/png;base64,${response.data.qr_code}`
  } catch (error) {
    console.error('Error generating QR code:', error)
    // Si falla, intentar generar localmente con QRCode.js
  }
}

function openGoogleMaps () {
  const destination = transfer.value?.destination_branch_office
  if (!destination?.latitude || !destination?.longitude) return

  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
  window.open(url, '_blank')
}

function confirmExit () {
  $q.dialog({
    title: 'Salir del viaje',
    message: '¿Estás seguro de salir? El GPS tracking se detendrá.',
    dark: true,
    cancel: {
      flat: true,
      label: 'Cancelar',
      color: 'grey-5'
    },
    ok: {
      unelevated: true,
      label: 'Salir',
      color: 'negative'
    }
  }).onOk(() => {
    stopLocationTracking()
    router.back()
  })
}

function viewDetails () {
  showOptions.value = false
  // TODO: Show transfer details dialog
}

function callSupport () {
  showOptions.value = false
  // TODO: Call support number
}

function reportIssue () {
  showOptions.value = false
  // TODO: Show issue report dialog
}

function cancelTransport () {
  showOptions.value = false

  $q.dialog({
    title: 'Cancelar Transporte',
    message: '¿Estás seguro de cancelar este transporte?',
    dark: true,
    prompt: {
      model: '',
      type: 'textarea',
      label: 'Motivo de cancelación',
      filled: true,
      dark: true
    },
    cancel: {
      flat: true,
      label: 'No',
      color: 'grey-5'
    },
    ok: {
      unelevated: true,
      label: 'Sí, cancelar',
      color: 'negative'
    }
  }).onOk(async (reason) => {
    try {
      await api.post(`/delivery-runs/${route.params.id}/cancel`, { reason })

      stopLocationTracking()

      $q.notify({
        type: 'info',
        message: 'Transporte cancelado',
        position: 'top'
      })

      router.replace({ name: 'CourierTray' })
    } catch (error) {
      console.error('Error canceling transport:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cancelar transporte',
        position: 'top'
      })
    }
  })
}
</script>

<style scoped>
.bg-dark {
  background-color: #1a1a1a;
}

#map {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
