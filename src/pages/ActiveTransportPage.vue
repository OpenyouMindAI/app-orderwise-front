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
const allMarkers = ref([])
const routePath = ref(null)
const futureRoutes = ref([])
const completedRoutes = ref([])

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
  const totalDistance = deliveryRun.value?.total_distance_km
  if (totalDistance && typeof totalDistance === 'number') {
    return totalDistance.toFixed(1)
  }
  return '0.0'
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
  // Limpiar marcadores anteriores
  allMarkers.value.forEach(marker => marker.setMap(null))
  allMarkers.value = []

  // Obtener todas las transferencias del delivery run
  const transfers = deliveryRun.value?.delivery_run_transfers || []
  
  console.log('Adding markers for', transfers.length, 'transfers')

  // Obtener transferencias pendientes para identificar la siguiente
  const pendingTransfers = transfers.filter(t => t.delivery_status === 'pending' || t.delivery_status === 'arrived')

  // Agregar marcadores para cada transferencia
  transfers.forEach((drt, index) => {
    const transferData = drt.transfer_stock
    const origin = transferData?.origin_branch_office
    const destination = transferData?.destination_branch_office

    // Get coordinates
    const originLat = origin?.address?.latitude || origin?.latitude
    const originLng = origin?.address?.longitude || origin?.longitude
    const destLat = destination?.address?.latitude || destination?.latitude
    const destLng = destination?.address?.longitude || destination?.longitude

    // Determinar color y tamaño según estado
    let color = '#9E9E9E' // Gris por defecto (futuro)
    let scale = 10
    let strokeWeight = 2
    
    if (drt.delivery_status === 'delivered') {
      color = '#4CAF50' // Verde - completado
      scale = 9
    } else if (drt.delivery_status === 'arrived') {
      color = '#FF9800' // Naranja - esperando verificación
      scale = 12
      strokeWeight = 3
    } else if (drt.delivery_status === 'pending') {
      // El primer pending es el siguiente destino (azul brillante)
      const firstPending = pendingTransfers[0]
      if (drt.id === firstPending?.id) {
        color = '#2979FF' // Azul brillante - siguiente destino
        scale = 12
        strokeWeight = 3
      } else {
        color = '#9E9E9E' // Gris - destinos futuros
        scale = 9
      }
    }

    // Marcador de destino
    if (destLat && destLng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: strokeWeight
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        title: destination?.name || `Destino ${index + 1}`
      })

      allMarkers.value.push(marker)

      // Si es la transferencia actual, guardar referencia
      if (transferData.id === transfer.value?.id) {
        destinationMarker.value = marker
      }
    }

    // Marcador de origen (solo para la primera transferencia)
    if (index === 0 && originLat && originLng) {
      const originMarkerObj = new google.maps.Marker({
        position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: '#FF9800', // Naranja - origen
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3
        },
        label: {
          text: 'O',
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold'
        },
        title: origin?.name || 'Origen'
      })

      allMarkers.value.push(originMarkerObj)
      originMarker.value = originMarkerObj
    }
  })

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

  // Ajustar bounds para mostrar todos los marcadores
  if (allMarkers.value.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    allMarkers.value.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
    map.value.fitBounds(bounds)
  }
}

async function drawRoute () {
  console.log('=== DRAWING ROUTES ===')

  // Limpiar rutas anteriores
  if (routePath.value) {
    routePath.value.setMap(null)
  }
  futureRoutes.value.forEach(route => route.setMap(null))
  futureRoutes.value = []
  completedRoutes.value.forEach(route => route.setMap(null))
  completedRoutes.value = []

  // Obtener todas las transferencias
  const transfers = deliveryRun.value?.delivery_run_transfers || []
  console.log('Total transfers:', transfers.length)
  console.log('All transfers:', transfers.map(t => ({
    id: t.id,
    sort_order: t.sort_order,
    status: t.delivery_status,
    destination: t.transfer_stock?.destination_branch_office?.name
  })))

  const completedTransfers = transfers.filter(t => t.delivery_status === 'delivered')
  const pendingTransfers = transfers.filter(t => t.delivery_status === 'pending' || t.delivery_status === 'arrived')
  
  console.log('Completed transfers:', completedTransfers.length)
  console.log('Pending transfers:', pendingTransfers.length)

  const directionsService = new google.maps.DirectionsService()

  // 0. DIBUJAR RUTAS COMPLETADAS (VERDE) - Ruta secuencial optimizada
  if (completedTransfers.length > 0) {
    console.log(`Drawing ${completedTransfers.length} completed route segments...`)

    // Obtener el origen real (de la primera transferencia del delivery run completo)
    const allTransfersSorted = [...transfers].sort((a, b) => a.sort_order - b.sort_order)
    const firstTransferEver = allTransfersSorted[0]?.transfer_stock
    const realOrigin = firstTransferEver?.origin_branch_office

    // Construir la secuencia de puntos completados
    const completedPoints = []
    
    // Agregar origen
    if (realOrigin) {
      const originLat = realOrigin?.address?.latitude || realOrigin?.latitude
      const originLng = realOrigin?.address?.longitude || realOrigin?.longitude
      if (originLat && originLng) {
        completedPoints.push({
          lat: parseFloat(originLat),
          lng: parseFloat(originLng),
          name: realOrigin?.name || 'Origen'
        })
      }
    }

    // Agregar destinos completados en orden
    completedTransfers.forEach(drt => {
      const dest = drt.transfer_stock?.destination_branch_office
      const destLat = dest?.address?.latitude || dest?.latitude
      const destLng = dest?.address?.longitude || dest?.longitude
      if (destLat && destLng) {
        completedPoints.push({
          lat: parseFloat(destLat),
          lng: parseFloat(destLng),
          name: dest?.name || 'Destino'
        })
      }
    })

    console.log('Completed route points:', completedPoints.map(p => p.name))

    // Dibujar rutas entre cada par de puntos consecutivos
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
          polylineOptions: {
            strokeColor: '#4CAF50', // VERDE - Ruta completada
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        })

        completedRenderer.setDirections(result)
        completedRoutes.value.push(completedRenderer)
        console.log(`✅ RUTA COMPLETADA ${i + 1} DIBUJADA (VERDE)`, {
          from: from.name,
          to: to.name
        })
      } catch (error) {
        console.error(`❌ Error drawing completed route ${i + 1}:`, error)
      }
    }
  }

  if (pendingTransfers.length === 0) {
    console.log('No pending transfers to draw route')
    return
  }

  // 1. DIBUJAR RUTA ACTUAL (AZUL BRILLANTE) - Desde último completado o origen
  const firstPending = pendingTransfers[0].transfer_stock
  const firstPendingDest = firstPending?.destination_branch_office

  // Si hay entregas completadas, el origen es el último destino completado
  let currentOrigin
  if (completedTransfers.length > 0) {
    const lastCompleted = completedTransfers[completedTransfers.length - 1].transfer_stock
    currentOrigin = lastCompleted?.destination_branch_office
    console.log('Starting from last completed destination:', currentOrigin?.name)
  } else {
    currentOrigin = firstPending?.origin_branch_office
    console.log('Starting from origin:', currentOrigin?.name)
  }

  console.log('Next destination:', firstPendingDest?.name)

  const originLat = currentOrigin?.address?.latitude || currentOrigin?.latitude
  const originLng = currentOrigin?.address?.longitude || currentOrigin?.longitude
  const firstDestLat = firstPendingDest?.address?.latitude || firstPendingDest?.latitude
  const firstDestLng = firstPendingDest?.address?.longitude || firstPendingDest?.longitude

  console.log('Current origin coords:', { lat: originLat, lng: originLng })
  console.log('Next dest coords:', { lat: firstDestLat, lng: firstDestLng })

  if (originLat && originLng && firstDestLat && firstDestLng) {
    try {
      const result = await directionsService.route({
        origin: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        destination: { lat: parseFloat(firstDestLat), lng: parseFloat(firstDestLng) },
        travelMode: google.maps.TravelMode.DRIVING
      })

      console.log('Calling Google Maps Directions API for current route...')
      
      const currentRouteRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2979FF', // AZUL BRILLANTE - Ruta actual
          strokeWeight: 6,
          strokeOpacity: 1
        }
      })

      currentRouteRenderer.setDirections(result)
      routePath.value = currentRouteRenderer

      console.log('✅ RUTA ACTUAL DIBUJADA (AZUL)')

      // Calcular distancia y duración
      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0]
        const leg = route.legs[0]
        routeDistance.value = leg.distance.value
        routeDuration.value = leg.duration.value

        console.log('Current route:', {
          distance: leg.distance.text,
          duration: leg.duration.text
        })
      }

      // Enviar al backend
      await updateRouteInfo()
    } catch (error) {
      console.error('❌ Error drawing current route:', error)
    }
  } else {
    console.log('❌ Missing coordinates for current route')
  }

  // 2. DIBUJAR RUTAS FUTURAS (GRIS) - Del primer destino a los siguientes
  if (pendingTransfers.length > 1) {
    console.log(`Drawing ${pendingTransfers.length - 1} future routes...`)
    
    for (let i = 0; i < pendingTransfers.length - 1; i++) {
      const currentTransfer = pendingTransfers[i].transfer_stock
      const nextTransfer = pendingTransfers[i + 1].transfer_stock

      const currentDest = currentTransfer?.destination_branch_office
      const nextDest = nextTransfer?.destination_branch_office

      const currentLat = currentDest?.address?.latitude || currentDest?.latitude
      const currentLng = currentDest?.address?.longitude || currentDest?.longitude
      const nextLat = nextDest?.address?.latitude || nextDest?.latitude
      const nextLng = nextDest?.address?.longitude || nextDest?.longitude

      console.log(`Future route ${i + 1}:`, currentDest?.name, '→', nextDest?.name)
      console.log(`Coords: (${currentLat}, ${currentLng}) → (${nextLat}, ${nextLng})`)

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
            polylineOptions: {
              strokeColor: '#9E9E9E', // GRIS - Rutas futuras
              strokeWeight: 4,
              strokeOpacity: 0.7
            },
            preserveViewport: true
          })

          futureRenderer.setDirections(result)
          futureRoutes.value.push(futureRenderer)

          console.log(`✅ RUTA FUTURA ${i + 1} DIBUJADA (GRIS)`)
        } catch (error) {
          console.error(`❌ Error drawing future route ${i + 1}:`, error)
        }
      } else {
        console.log(`❌ Missing coordinates for future route ${i + 1}`)
      }
    }
  }
  
  console.log('=== ROUTES DRAWING COMPLETED ===')
}

async function startLocationTracking () {
  try {
    // Detectar si estamos en navegador o app móvil
    const isNativePlatform = $q.platform.is.capacitor || $q.platform.is.cordova

    if (isNativePlatform) {
      // Usar Capacitor Geolocation para móvil
      const { Geolocation } = await import('@capacitor/geolocation')
      
      const permission = await Geolocation.requestPermissions()

      if (permission.location !== 'granted') {
        $q.notify({
          type: 'warning',
          message: 'Se requieren permisos de ubicación',
          position: 'top'
        })
        return
      }

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
    } else {
      // Usar Geolocation API del navegador
      if (!navigator.geolocation) {
        throw new Error('Geolocation no soportada en este navegador')
      }

      watchId.value = navigator.geolocation.watchPosition(
        (position) => {
          updateCourierPosition(position)
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }

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
      message: 'Error al iniciar GPS tracking: ' + error.message,
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
    // Limitar accuracy a un máximo razonable (100km)
    const accuracy = currentPosition.value.accuracy
      ? Math.min(currentPosition.value.accuracy, 100000)
      : null

    await api.post(`/delivery-runs/${route.params.id}/locations`, {
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
      // Capacitor Geolocation
      import('@capacitor/geolocation').then(({ Geolocation }) => {
        Geolocation.clearWatch({ id: watchId.value })
      })
    } else {
      // Browser Geolocation API
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
