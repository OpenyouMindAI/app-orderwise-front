<template>
  <q-page class="bg-dark">
    <div id="map" ref="mapContainer" style="width: 100%; height: calc(100vh - 62px); position: absolute; top: 0; left: 0;"></div>

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

    <!-- Finish Route Button (when all delivered) -->
    <div v-if="allOrdersDelivered" class="absolute-bottom q-ma-xs" style="z-index: 1001; pointer-events: none;">
      <q-card dark class="bg-grey-9" style="border-radius: 12px; box-shadow: 0 -2px 8px rgba(0,0,0,0.4); pointer-events: auto; background: rgba(33, 33, 33, 0.95);">
        <q-card-section class="q-pa-md">
          <!-- Success Header -->
          <div class="row items-center q-mb-sm">
            <q-icon name="check_circle" color="positive" size="28px" class="q-mr-sm" />
            <div class="col">
              <div class="text-body1 text-weight-bold">¡Entregas Completadas!</div>
              <div class="text-caption text-grey-5">Regresa a la sucursal</div>
            </div>
          </div>

          <!-- Destination Info -->
          <div class="q-mb-md q-pa-sm" style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 3px solid #10b981;">
            <div class="row items-center">
              <q-icon name="store" color="positive" size="20px" class="q-mr-sm" />
              <div class="col">
                <div class="text-caption text-grey-5" style="font-size: 10px;">DESTINO FINAL - SUCURSAL</div>
                <div class="text-body2 text-weight-bold" style="font-size: 15px;">
                  {{ originBranch?.name || deliveryRun?.branch_office?.name || 'Sucursal de Origen' }}
                </div>
                <div v-if="originBranch" class="text-caption text-grey-5" style="font-size: 10px; margin-top: 2px;">
                  📍 Punto de retorno
                </div>
              </div>
            </div>
          </div>

          <!-- Distance Info -->
          <div class="row items-center justify-center q-mb-sm q-pa-xs" style="background: rgba(255,255,255,0.05); border-radius: 6px;">
            <q-icon :name="isNearOrigin ? 'location_on' : 'navigation'" :color="isNearOrigin ? 'positive' : 'grey-5'" size="18px" class="q-mr-xs" />
            <div class="text-body2" :class="isNearOrigin ? 'text-positive' : 'text-grey-5'">
              {{ isNearOrigin ? '¡Has llegado al origen!' : (distanceToOrigin ? `A ${(distanceToOrigin / 1000).toFixed(1)} km del origen` : 'Calculando distancia...') }}
            </div>
          </div>

          <!-- Action Button -->
          <q-btn
            unelevated
            no-caps
            label="Finalizar Recorrido"
            :color="isNearOrigin ? 'positive' : 'primary'"
            icon="flag"
            class="full-width"
            style="border-radius: 8px; font-weight: bold; height: 50px; font-size: 15px;"
            @click="attemptFinishRoute"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Bottom Delivery Card - Compacto -->
    <div v-else class="absolute-bottom q-ma-xs" style="z-index: 1001; pointer-events: none;">
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
/**
 * Reference to the map container DOM element
 * @type {Ref<HTMLElement|null>}
 */
const mapContainer = ref(null)

/**
 * Google Maps instance
 * @type {Ref<google.maps.Map|null>}
 */
const map = ref(null)

/**
 * Controls visibility of delivery details card (collapsed by default to not cover map)
 * @type {Ref<boolean>}
 */
const showDetails = ref(false)

/**
 * Indicates if a delivery is being marked as delivered
 * @type {Ref<boolean>}
 */
const marking = ref(false)

/**
 * Indicates if courier has arrived at current delivery location
 * @type {Ref<boolean>}
 */
const arrived = ref(false)

// Payment refs
/**
 * Controls visibility of payment registration dialog
 * @type {Ref<boolean>}
 */
const showPaymentDialog = ref(false)

/**
 * Payment data object
 * @type {Ref<{amount: number|null, payment_method_id: number|null, photo: File|null, photoPreview: string|null}>}
 */
const payment = ref({
  amount: null,
  payment_method_id: null,
  photo: null,
  photoPreview: null
})

/**
 * Reference to photo input element
 * @type {Ref<HTMLInputElement|null>}
 */
const photoInput = ref(null)

/**
 * Indicates if payment is being saved
 * @type {Ref<boolean>}
 */
const savingPayment = ref(false)

/**
 * Available payment methods from backend
 * @type {Ref<Array<{label: string, value: number}>>}
 */
const paymentMethods = ref([])

/**
 * Pauses location and route updates during payment registration
 * @type {Ref<boolean>}
 */
const pauseUpdates = ref(false)

// Delivery data
/**
 * Current delivery run object from backend
 * @type {Ref<Object|null>}
 */
const deliveryRun = ref(null)

/**
 * All deliveries in the run, ordered by stop_order
 * @type {Ref<Array<Object>>}
 */
const allDeliveries = ref([])

/**
 * Index of current active delivery
 * @type {Ref<number>}
 */
const currentDeliveryIndex = ref(0)

/**
 * Current delivery invoice object
 * @type {Ref<Object|null>}
 */
const invoice = ref(null)

// Location tracking
/**
 * Courier's current GPS position
 * @type {Ref<{lat: number, lng: number}|null>}
 */
const currentPosition = ref(null)

/**
 * Geolocation watch ID for tracking
 * @type {Ref<number|null>}
 */
const watchId = ref(null)

/**
 * Interval ID for sending location updates to server
 * @type {Ref<number|null>}
 */
const locationUpdateInterval = ref(null)

/**
 * Frequency for sending location updates (10 seconds)
 * @type {number}
 */
const LOCATION_UPDATE_FREQUENCY = 10000

// Map elements
/**
 * Marker showing courier's current location
 * @type {Ref<google.maps.Marker|null>}
 */
const courierMarker = ref(null)

/**
 * Array of markers for delivery locations
 * @type {Ref<Array<google.maps.Marker>>}
 */
const deliveryMarkers = ref([])

/**
 * Polylines for completed routes (red color)
 * @type {Ref<Array<google.maps.DirectionsRenderer>>}
 */
const completedPolylines = ref([])

/**
 * Polyline for current active route (blue color)
 * @type {Ref<google.maps.DirectionsRenderer|null>}
 */
const currentPolyline = ref(null)

/**
 * Polylines for future pending routes (gray color)
 * @type {Ref<Array<google.maps.DirectionsRenderer>>}
 */
const futurePolylines = ref([])

// Route data
/**
 * Google Maps Directions Service instance
 * @type {Ref<google.maps.DirectionsService|null>}
 */
const directionsService = ref(null)

// Return to origin tracking
/**
 * Indicates if all deliveries have been completed
 * @type {Ref<boolean>}
 */
const allOrdersDelivered = ref(false)

/**
 * Indicates if courier is within radius of origin branch
 * @type {Ref<boolean>}
 */
const isNearOrigin = ref(false)

/**
 * Distance in meters from courier to origin branch
 * @type {Ref<number|null>}
 */
const distanceToOrigin = ref(null)

/**
 * Origin branch office data (coordinates and name)
 * @type {Ref<{lat: number, lng: number, name: string}|null>}
 */
const originBranch = ref(null)

/**
 * Polyline showing return route to origin
 * @type {Ref<google.maps.DirectionsRenderer|null>}
 */
const returnPolyline = ref(null)

/**
 * Marker showing origin branch location
 * @type {Ref<google.maps.Marker|null>}
 */
const originMarker = ref(null)

/**
 * Radius in meters to consider courier "near" origin (500 meters)
 * @type {number}
 */
const ORIGIN_RADIUS = 500

// Computed properties
/**
 * Total number of deliveries in the run
 * @type {ComputedRef<number>}
 */
const totalDeliveries = computed(() => allDeliveries.value.length)

/**
 * Count of deliveries with 'delivered' status
 * @type {ComputedRef<number>}
 */
const deliveredCount = computed(() => allDeliveries.value.filter(d => d.delivery_status === 'delivered').length)

/**
 * Overall progress as decimal (0 to 1)
 * @type {ComputedRef<number>}
 */
const overallProgress = computed(() => totalDeliveries.value > 0 ? deliveredCount.value / totalDeliveries.value : 0)

/**
 * Current delivery client name
 * @type {ComputedRef<string>}
 */
const currentClient = computed(() => invoice.value?.client?.name || 'Cliente')

/**
 * Current delivery address formatted string
 * @type {ComputedRef<string>}
 */
const currentAddress = computed(() => {
  const addr = invoice.value?.client?.address
  if (!addr) return 'Dirección no disponible'
  return addr.formattedAddress || addr.street || addr.name || 'Dirección no disponible'
})

/**
 * List of upcoming pending deliveries
 * @type {ComputedRef<Array<Object>>}
 */
const nextDeliveries = computed(() => {
  return allDeliveries.value.slice(currentDeliveryIndex.value + 1)
    .filter(d => d.delivery_status === 'pending')
})

// Current route metrics
/**
 * Estimated time for current route in minutes
 * @type {ComputedRef<number|string>}
 */
const currentRouteTime = computed(() => {
  const delivery = allDeliveries.value[currentDeliveryIndex.value]
  return delivery?.estimated_time || '-'
})

/**
 * Distance for current route in kilometers
 * @type {ComputedRef<string>}
 */
const currentRouteDistance = computed(() => {
  const delivery = allDeliveries.value[currentDeliveryIndex.value]
  return delivery?.distance ? delivery.distance.toFixed(1) : '-'
})

// Payment computed properties
/**
 * Validates if payment form has required data
 * @type {ComputedRef<boolean>}
 */
const isPaymentValid = computed(() => {
  return payment.value.amount > 0 && payment.value.payment_method_id
})

onMounted(async () => {
  // Validate route params
  if (!route.params.id) {
    console.error('No delivery run ID provided')
    $q.notify({
      type: 'negative',
      message: 'ID de recorrido no válido. Redirigiendo...',
      position: 'top'
    })
    // Wait a bit before redirecting to avoid infinite loop
    setTimeout(() => {
      router.replace({ name: 'InvoiceDeliveryTray' })
    }, 1000)
    return
  }

  try {
    await loadDeliveryRun()
    await initializeMap()
    await startLocationTracking()
    await loadPaymentMethods()
  } catch (error) {
    console.error('Error initializing page:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el recorrido',
      position: 'top'
    })
  }
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

/**
 * Loads available payment methods from backend
 * Sets first method as default selection
 * @async
 * @returns {Promise<void>}
 */
async function loadPaymentMethods () {
  try {
    const response = await api.get('/payment-methods')
    paymentMethods.value = response.data.map(pm => ({
      label: pm.name,
      value: pm.id
    }))
    // Set default to first method
    if (paymentMethods.value.length > 0) {
      payment.value.payment_method_id = paymentMethods.value[0].value
    }
  } catch (error) {
    console.error('Error loading payment methods:', error)
  }
}

/**
 * Loads delivery run data from backend
 * Extracts origin branch information and delivery items
 * Activates return-to-origin mode if all deliveries are completed
 * @async
 * @param {boolean} updateCurrentIndex - Whether to update current delivery index
 * @returns {Promise<void>}
 */
async function loadDeliveryRun (updateCurrentIndex = true) {
  try {
    console.log('Loading delivery run:', route.params.id)
    const response = await api.get(`/invoice-delivery-runs/${route.params.id}`)
    deliveryRun.value = response.data.delivery_run
    allDeliveries.value = deliveryRun.value.items || []

    // Get origin branch information
    console.log('Delivery route data:', deliveryRun.value)

    // Try multiple paths to get branch
    let branch = null
    if (deliveryRun.value?.branch_office) {
      branch = deliveryRun.value.branch_office
    }

    if (branch) {
      originBranch.value = {
        lat: parseFloat(branch?.address?.latitude),
        lng: parseFloat(branch?.address?.longitude),
        name: branch.name || branch.branch_name || 'Sucursal de Origen'
      }
      console.log('✅ Origin branch found:', originBranch.value)
    } else {
      console.error('❌ No origin branch found in delivery run data')
      console.log('Available keys:', Object.keys(deliveryRun.value))
    }

    // Only update current index if specified (not after marking as delivered)
    if (updateCurrentIndex) {
      // Find current active delivery
      const activeIndex = allDeliveries.value.findIndex(
        item => item.delivery_status === 'pending' || item.delivery_status === 'arrived'
      )

      if (activeIndex !== -1) {
        currentDeliveryIndex.value = activeIndex
        invoice.value = allDeliveries.value[activeIndex].invoice
        console.log('Current invoice:', invoice.value)

        if (allDeliveries.value[activeIndex].delivery_status === 'arrived') {
          arrived.value = true
        }
      } else {
        // No pending deliveries - check if all are delivered
        const allDelivered = allDeliveries.value.every(
          item => item.delivery_status === 'delivered'
        )

        if (allDelivered && allDeliveries.value.length > 0) {
          // All deliveries completed - activate return to origin mode
          console.log('All deliveries completed, activating return to origin mode')
          allOrdersDelivered.value = true
          currentDeliveryIndex.value = allDeliveries.value.length - 1
          showDetails.value = false

          $q.notify({
            type: 'positive',
            message: '¡Todas las entregas completadas! Regresa al origen para finalizar',
            position: 'top',
            timeout: 5000,
            icon: 'check_circle'
          })

          // Draw return route and start tracking distance
          if (map.value && originBranch.value) {
            // Get current position if not available
            if (!currentPosition.value) {
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
              } catch (error) {
                console.error('Error getting position:', error)
              }
            }

            drawReturnToOriginRoute()

            // Calculate initial distance
            console.log('>>>>>', currentPosition.value)
            if (currentPosition.value) {
              const distance = calculateDistance(
                currentPosition.value.lat,
                currentPosition.value.lng,
                originBranch.value.lat,
                originBranch.value.lng
              )
              console.log({ distance, currentPosition, originBranch })
              distanceToOrigin.value = distance
              isNearOrigin.value = distance <= ORIGIN_RADIUS
              console.log('Initial distance to origin:', distance, 'meters')
            }
          }
        } else {
          // No deliveries at all or error state
          $q.notify({ type: 'warning', message: 'No hay entregas en este recorrido', position: 'top' })
          setTimeout(() => {
            router.push({ name: 'InvoiceDeliveryTray' })
          }, 1500)
        }
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

      // Calculate distance to origin if all orders delivered
      if (allOrdersDelivered.value && originBranch.value) {
        const distance = calculateDistance(
          currentPosition.value.lat,
          currentPosition.value.lng,
          originBranch.value.lat,
          originBranch.value.lng
        )
        distanceToOrigin.value = distance
        isNearOrigin.value = distance <= ORIGIN_RADIUS

        // Update courier marker position only (no need to redraw entire route)
        if (courierMarker.value) {
          courierMarker.value.setPosition(new google.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng))
        }
      }
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
    if (currentPosition.value && route.params.id) {
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
    // Es la última entrega - activar modo retorno al origen
    allOrdersDelivered.value = true
    showDetails.value = false // Ocultar detalles de entrega

    $q.notify({
      type: 'positive',
      message: '¡Todas las entregas completadas! Regresa al origen para finalizar',
      position: 'top',
      timeout: 5000,
      icon: 'check_circle'
    })

    // Get current position if not available
    if (!currentPosition.value) {
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
      } catch (error) {
        console.error('Error getting position:', error)
      }
    }

    // Mostrar ruta de regreso al origen
    await drawReturnToOriginRoute()

    // Calculate initial distance
    if (currentPosition.value && originBranch.value) {
      const distance = calculateDistance(
        currentPosition.value.lat,
        currentPosition.value.lng,
        originBranch.value.lat,
        originBranch.value.lng
      )
      distanceToOrigin.value = distance
      isNearOrigin.value = distance <= ORIGIN_RADIUS
      console.log('Initial distance to origin:', distance, 'meters')
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

async function drawReturnToOriginRoute () {
  if (!currentPosition.value || !originBranch.value) {
    console.error('No current position or origin branch')
    console.log('Current position:', currentPosition.value)
    console.log('Origin branch:', originBranch.value)
    return
  }

  console.log('Drawing return route to origin:', originBranch.value)

  try {
    // Clear existing routes
    clearRoutes()

    // Draw route from current position to origin
    const request = {
      origin: new google.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng),
      destination: new google.maps.LatLng(originBranch.value.lat, originBranch.value.lng),
      travelMode: google.maps.TravelMode.DRIVING
    }

    const result = await directionsService.value.route(request)
    const renderer = new google.maps.DirectionsRenderer({
      map: map.value,
      directions: result,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    })

    returnPolyline.value = renderer

    // Remove old origin marker if exists
    if (originMarker.value) {
      originMarker.value.setMap(null)
    }

    // Add origin marker with VERY distinctive icon - DIFFERENT from delivery circles
    originMarker.value = new google.maps.Marker({
      position: { lat: originBranch.value.lat, lng: originBranch.value.lng },
      map: map.value,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="90" viewBox="0 0 70 90">
            <!-- Shadow -->
            <ellipse cx="35" cy="85" rx="15" ry="3" fill="rgba(0,0,0,0.3)"/>
            
            <!-- Pin shape with gradient -->
            <defs>
              <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path d="M35 5 C20 5 8 17 8 32 C8 50 35 85 35 85 C35 85 62 50 62 32 C62 17 50 5 35 5 Z" 
                  fill="url(#pinGradient)" stroke="white" stroke-width="4"/>
            
            <!-- White circle background -->
            <circle cx="35" cy="30" r="16" fill="white"/>
            
            <!-- Building/Store icon -->
            <g transform="translate(35, 30)">
              <!-- Building body -->
              <rect x="-10" y="-8" width="20" height="16" fill="#10b981" rx="1"/>
              <!-- Roof -->
              <path d="M -12 -8 L 0 -14 L 12 -8 Z" fill="#059669"/>
              <!-- Windows -->
              <rect x="-7" y="-5" width="3" height="3" fill="white" rx="0.5"/>
              <rect x="-1" y="-5" width="3" height="3" fill="white" rx="0.5"/>
              <rect x="5" y="-5" width="3" height="3" fill="white" rx="0.5"/>
              <rect x="-7" y="0" width="3" height="3" fill="white" rx="0.5"/>
              <rect x="-1" y="0" width="3" height="3" fill="white" rx="0.5"/>
              <rect x="5" y="0" width="3" height="3" fill="white" rx="0.5"/>
              <!-- Door -->
              <rect x="-2" y="4" width="4" height="4" fill="white" rx="0.5"/>
            </g>
            
            <!-- Label text -->
            <text x="35" y="72" font-family="Arial, sans-serif" font-size="11" font-weight="bold" 
                  text-anchor="middle" fill="white" stroke="#059669" stroke-width="3" paint-order="stroke">ORIGEN</text>
            <text x="35" y="72" font-family="Arial, sans-serif" font-size="11" font-weight="bold" 
                  text-anchor="middle" fill="white">ORIGEN</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(70, 90),
        anchor: new google.maps.Point(35, 90)
      },
      title: originBranch.value.name || 'Sucursal de Origen',
      zIndex: 10000,
      animation: google.maps.Animation.BOUNCE,
      optimized: false
    })

    // Stop bouncing after 3 seconds
    setTimeout(() => {
      if (originMarker.value) {
        originMarker.value.setAnimation(null)
      }
    }, 3000)

    // Add InfoWindow to origin marker
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; color: #000;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            🏢 ${originBranch.value.name || 'Sucursal de Origen'}
          </div>
          <div style="font-size: 12px; color: #666;">
            Destino final del recorrido
          </div>
        </div>
      `
    })

    // Show InfoWindow automatically
    infoWindow.open(map.value, originMarker.value)

    // Also show on click
    originMarker.value.addListener('click', () => {
      infoWindow.open(map.value, originMarker.value)
    })

    // Update courier marker
    if (courierMarker.value) {
      courierMarker.value.setPosition(new google.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng))
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds()
    bounds.extend(new google.maps.LatLng(currentPosition.value.lat, currentPosition.value.lng))
    bounds.extend(new google.maps.LatLng(originBranch.value.lat, originBranch.value.lng))
    map.value.fitBounds(bounds)
  } catch (error) {
    console.error('Error drawing return route:', error)
  }
}

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

async function attemptFinishRoute () {
  // Determine dialog content based on proximity
  const isNear = isNearOrigin.value
  const branchName = originBranch.value?.name || 'la sucursal de origen'
  
  let title, message, dialogType
  
  if (isNear) {
    // Near origin - positive confirmation
    title = '¡Has llegado al origen!'
    message = `Estás en ${branchName}. ¿Deseas finalizar el recorrido?`
    dialogType = 'positive'
  } else {
    // Far from origin - warning
    const distanceKm = distanceToOrigin.value ? (distanceToOrigin.value / 1000).toFixed(1) : '?'
    title = '⚠️ No estás en el origen'
    message = `Estás a ${distanceKm} km de ${branchName}. Se recomienda estar a menos de 500m del origen. ¿Deseas finalizar el recorrido de todas formas?`
    dialogType = 'warning'
  }

  // Show confirmation dialog
  $q.dialog({
    title: title,
    message: message,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Terminar Recorrido',
      color: isNear ? 'positive' : 'warning',
      unelevated: true,
      icon: isNear ? 'check_circle' : 'warning'
    },
    persistent: false
  }).onOk(async () => {
    await finishRoute()
  })
}

async function finishRoute () {
  try {
    // Call API to complete delivery run
    await api.post(`/invoice-delivery-runs/${route.params.id}/complete`)

    // Stop location tracking
    stopLocationTracking()

    $q.notify({
      type: 'positive',
      message: '¡Recorrido finalizado exitosamente!',
      icon: 'check_circle',
      position: 'top'
    })

    // Redirect to delivery tray
    router.push({ name: 'InvoiceDeliveryTray' })
  } catch (error) {
    console.error('Error completing delivery run:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al finalizar el recorrido',
      position: 'top'
    })
  }
}

function clearRoutes () {
  if (currentPolyline.value) {
    currentPolyline.value.setMap(null)
    currentPolyline.value = null
  }
  completedPolylines.value.forEach(p => p.setMap(null))
  completedPolylines.value = []
  futurePolylines.value.forEach(p => p.setMap(null))
  futurePolylines.value = []
  if (returnPolyline.value) {
    returnPolyline.value.setMap(null)
    returnPolyline.value = null
  }
  deliveryMarkers.value.forEach(m => m.setMap(null))
  deliveryMarkers.value = []
}
</script>

<style scoped>
.bg-dark {
  background-color: #121212;
}
</style>
