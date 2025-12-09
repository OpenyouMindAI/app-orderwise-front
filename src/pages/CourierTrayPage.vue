<template>
  <q-page class="courier-page">
    <!-- Compact Header Estilo Uber -->
    <div class="uber-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="local_shipping" size="28px" />
          <div class="header-info">
            <div class="header-title">Mis Entregas</div>
            <div class="header-subtitle">{{ orders.length }} órdenes • {{ route?.name || 'Sin ruta' }}</div>
          </div>
        </div>
        <q-btn
          flat
          dense
          round
          icon="filter_list"
          @click="showFilterDialog = true"
        >
          <q-badge v-if="statusFilter !== 'finished'" color="primary" floating>1</q-badge>
        </q-btn>
      </div>
    </div>

    <!-- Action Buttons Estilo Uber -->
    <div class="action-buttons">
      <q-btn
        unelevated
        no-caps
        class="action-btn primary-btn"
        icon="map"
        label="Ver Ruta Asignada"
        @click="showRouteMap"
      />
      <q-btn
        unelevated
        no-caps
        class="action-btn secondary-btn"
        icon="route"
        label="Ver Ruta de Órdenes"
        @click="showOrdersMap"
        :disable="orders.length === 0"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-skeleton v-for="i in 4" :key="i" height="88px" class="order-skeleton" />
    </div>

    <!-- Orders List Estilo Uber -->
    <div v-else-if="orders.length > 0" class="orders-container">
      <div
        v-for="(item, index) in orders"
        :key="item.order.id"
        class="order-card-uber"
        @click="selectOrder(item)"
      >
        <!-- Stop Number Badge -->
        <div class="stop-badge">{{ index + 1 }}</div>

        <!-- Order Content -->
        <div class="order-content">
          <div class="order-header">
            <div class="order-code">#{{ item.order.code }}</div>
            <div class="order-total">${{ item.order.total?.toFixed(0) }}</div>
          </div>

          <div class="order-client">
            <q-icon name="person" size="16px" />
            <span>{{ item.client_name }}</span>
          </div>

          <div class="order-products">
            <q-icon name="inventory_2" size="16px" />
            <span>{{ item.order.products?.length || 0 }} productos</span>
          </div>

          <!-- Status Badge -->
          <q-badge
            :color="getStatusColor(item.order.status)"
            :label="getStatusLabel(item.order.status)"
            class="status-badge-uber"
          />
        </div>

        <!-- Chevron -->
        <q-icon name="chevron_right" size="20px" class="chevron-icon" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="empty-title">No hay órdenes</div>
      <div class="empty-subtitle">
        {{ statusFilter === 'finished' ? 'No tienes órdenes finalizadas en tu ruta' : 'No hay órdenes con este filtro' }}
      </div>
    </div>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog">
      <q-card class="filter-card">
        <q-card-section>
          <div class="text-h6">Filtrar por estado</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list>
            <q-item
              v-for="option in statusOptions"
              :key="option.value"
              clickable
              v-ripple
              @click="selectStatus(option.value)"
              :active="statusFilter === option.value"
              active-class="bg-primary text-white"
            >
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="statusFilter === option.value" name="check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Order Details Dialog -->
    <q-dialog v-model="showOrderDialog" position="bottom">
      <q-card class="order-details-card">
        <q-card-section class="order-details-header">
          <div class="text-h6">Orden #{{ selectedOrder?.order?.code }}</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- Client Info -->
          <div class="detail-section">
            <div class="detail-label">Cliente</div>
            <div class="detail-value">{{ selectedOrder?.client_name }}</div>
          </div>

          <!-- Products -->
          <div class="detail-section">
            <div class="detail-label">Productos ({{ selectedOrder?.order?.products?.length || 0 }})</div>
            <q-list dense class="products-list">
              <q-item v-for="product in selectedOrder?.order?.products" :key="product.id">
                <q-item-section>
                  <q-item-label>{{ product.name }}</q-item-label>
                  <q-item-label caption>Cantidad: {{ product.pivot?.quantity || 0 }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Total -->
          <div class="detail-section">
            <div class="detail-label">Total</div>
            <div class="detail-value total-value">${{ selectedOrder?.order?.total?.toFixed(2) }}</div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md">
          <q-btn
            v-if="selectedOrder?.order?.status === 'finished' && !selectedOrder?.order?.delivery_person_id"
            unelevated
            no-caps
            label="Aceptar Orden"
            color="primary"
            class="full-width action-btn-large"
            @click="acceptOrder"
            :loading="accepting"
          />
          <q-btn
            v-else-if="selectedOrder?.order?.delivery_person_id"
            unelevated
            no-caps
            label="Iniciar Entrega"
            color="positive"
            class="full-width action-btn-large"
            @click="startDelivery"
            :loading="starting"
          />
          <q-btn
            v-else
            flat
            no-caps
            label="No disponible para entrega"
            color="grey"
            class="full-width"
            disable
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Map Dialog -->
    <q-dialog v-model="showMapDialog" maximized>
      <q-card class="map-card">
        <q-card-section class="map-header">
          <div class="text-h6">{{ mapTitle }}</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="map-container-section">
          <div id="uber-map" class="uber-map"></div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps } from 'src/boot/google-maps'

const router = useRouter()
const $q = useQuasar()

// State
const route = ref(null)
const orders = ref([])
const loading = ref(false)
const statusFilter = ref('finished')
const showFilterDialog = ref(false)
const showOrderDialog = ref(false)
const selectedOrder = ref(null)
const accepting = ref(false)
const starting = ref(false)
const showMapDialog = ref(false)
const mapTitle = ref('')
const map = ref(null)
const markers = ref([])
const routePaths = ref([])

const statusOptions = [
  { label: 'Solo Finalizadas', value: 'finished' },
  { label: 'En Proceso', value: 'on_process' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Todas', value: 'all' }
]

onMounted(async () => {
  await checkActiveRun()
  await fetchMyRouteOrders()
})

async function checkActiveRun () {
  try {
    const response = await api.get('/invoice-delivery-runs/active')
    if (response.data.delivery_run) {
      $q.notify({
        type: 'info',
        message: 'Tienes una entrega activa',
        position: 'top'
      })
      router.push({
        name: 'ActiveTransport',
        params: { id: response.data.delivery_run.id }
      })
    }
  } catch (error) {
    // No active run
  }
}

async function fetchMyRouteOrders () {
  loading.value = true
  try {
    const response = await api.get('/delivery-routes/my-route-orders', {
      params: { status: statusFilter.value }
    })

    route.value = response.data.route
    orders.value = response.data.orders || []

    console.log('Órdenes cargadas:', orders.value.length)
  } catch (error) {
    console.error('Error fetching orders:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar órdenes',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

function selectStatus (value) {
  statusFilter.value = value
  showFilterDialog.value = false
  fetchMyRouteOrders()
}

function selectOrder (item) {
  selectedOrder.value = item
  showOrderDialog.value = true
}

async function acceptOrder () {
  accepting.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    await api.put(`/invoices/${selectedOrder.value.order.id}`, {
      delivery_person_id: user.id
    })

    $q.notify({
      type: 'positive',
      message: 'Orden aceptada',
      position: 'top'
    })

    showOrderDialog.value = false
    await fetchMyRouteOrders()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al aceptar orden',
      position: 'top'
    })
  } finally {
    accepting.value = false
  }
}

async function startDelivery () {
  starting.value = true
  try {
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: [selectedOrder.value.order.id]
    })

    $q.notify({
      type: 'positive',
      message: 'Entrega iniciada',
      position: 'top'
    })

    router.push({
      name: 'ActiveTransport',
      params: { id: response.data.delivery_run.id }
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar entrega',
      position: 'top'
    })
  } finally {
    starting.value = false
  }
}

async function showRouteMap () {
  mapTitle.value = 'Ruta Asignada - Todos los Clientes'
  showMapDialog.value = true
  await initMap('route')
}

async function showOrdersMap () {
  mapTitle.value = 'Ruta de Órdenes - Secuencia de Entregas'
  showMapDialog.value = true
  await initMap('orders')
}

async function initMap (type) {
  try {
    await loadGoogleMaps()

    // Wait for dialog to render
    await new Promise(resolve => setTimeout(resolve, 300))

    const mapElement = document.getElementById('uber-map')
    if (!mapElement) return

    map.value = new google.maps.Map(mapElement, {
      zoom: 13,
      center: { lat: 0, lng: 0 },
      styles: getUberMapStyles(),
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    })

    if (type === 'route') {
      await renderRouteMap()
    } else {
      await renderOrdersMap()
    }
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

async function renderRouteMap () {
  if (!route.value || !route.value.routeClients) return

  const bounds = new google.maps.LatLngBounds()

  // Origin marker
  if (route.value.originBranch) {
    const origin = route.value.originBranch
    const originLat = origin.address?.latitude || origin.latitude
    const originLng = origin.address?.longitude || origin.longitude

    if (originLat && originLng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
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
      markers.value.push(marker)
      bounds.extend(new google.maps.LatLng(originLat, originLng))
    }
  }

  // Client markers
  route.value.routeClients.forEach((client, index) => {
    const lat = client.latitude
    const lng = client.longitude

    if (lat && lng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        title: client.client?.name
      })
      markers.value.push(marker)
      bounds.extend(new google.maps.LatLng(lat, lng))
    }
  })

  if (markers.value.length > 0) {
    map.value.fitBounds(bounds)
  }

  // Draw route
  await drawRoute(route.value.routeClients)
}

async function renderOrdersMap () {
  if (orders.value.length === 0) return

  const bounds = new google.maps.LatLngBounds()

  // Origin marker
  if (route.value?.originBranch) {
    const origin = route.value.originBranch
    const originLat = origin.address?.latitude || origin.latitude
    const originLng = origin.address?.longitude || origin.longitude

    if (originLat && originLng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(originLat), lng: parseFloat(originLng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
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
      markers.value.push(marker)
      bounds.extend(new google.maps.LatLng(originLat, originLng))
    }
  }

  // Order markers
  orders.value.forEach((item, index) => {
    const lat = item.latitude
    const lng = item.longitude

    if (lat && lng) {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        title: `#${item.order.code} - ${item.client_name}`
      })
      markers.value.push(marker)
      bounds.extend(new google.maps.LatLng(lat, lng))
    }
  })

  if (markers.value.length > 0) {
    map.value.fitBounds(bounds)
  }

  // Draw route for orders
  const ordersWithCoords = orders.value.filter(item => item.latitude && item.longitude)
  await drawRoute(ordersWithCoords)
}

async function drawRoute (stops) {
  if (!route.value?.originBranch || stops.length === 0) return

  const directionsService = new google.maps.DirectionsService()
  const origin = route.value.originBranch
  let prevLat = origin.address?.latitude || origin.latitude
  let prevLng = origin.address?.longitude || origin.longitude

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
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
          strokeColor: '#000000',
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

function getUberMapStyles () {
  return [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9e9f6' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

function getStatusColor (status) {
  const colors = {
    finished: 'positive',
    on_process: 'warning',
    pending: 'info',
    cancelled: 'negative'
  }
  return colors[status] || 'grey'
}

function getStatusLabel (status) {
  const labels = {
    finished: 'Finalizada',
    on_process: 'En Proceso',
    pending: 'Pendiente',
    cancelled: 'Cancelada'
  }
  return labels[status] || status
}
</script>

<style scoped>
.courier-page {
  background: #f7f7f7;
  min-height: 100vh;
}

/* Header Estilo Uber */
.uber-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.action-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.primary-btn {
  background: #000 !important;
  color: white !important;
}

.secondary-btn {
  background: white !important;
  color: #000 !important;
  border: 1px solid #e0e0e0;
}

/* Loading */
.loading-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.order-skeleton {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
}

/* Orders Container */
.orders-container {
  padding: 0 16px 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* Order Card Estilo Uber */
.order-card-uber {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
}

.order-card-uber:active {
  transform: scale(0.98);
  background: #f9f9f9;
}

.stop-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.order-content {
  flex: 1;
  min-width: 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-code {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.order-total {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.order-client,
.order-products {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.status-badge-uber {
  margin-top: 8px;
  font-size: 11px;
  padding: 4px 8px;
}

.chevron-icon {
  color: #999;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-top: 16px;
}

.empty-subtitle {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  max-width: 300px;
}

/* Filter Card */
.filter-card {
  min-width: 300px;
  border-radius: 16px;
}

/* Order Details Card */
.order-details-card {
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.order-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  font-weight: 600;
}

.detail-value {
  font-size: 16px;
  color: #000;
  font-weight: 500;
}

.total-value {
  font-size: 24px;
  font-weight: 600;
}

.products-list {
  background: #f7f7f7;
  border-radius: 8px;
  padding: 8px;
}

.action-btn-large {
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
}

/* Map */
.map-card {
  background: white;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px;
}

.map-container-section {
  padding: 0;
  height: calc(100vh - 80px);
}

.uber-map {
  width: 100%;
  height: 100%;
}

/* Responsive */
@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
