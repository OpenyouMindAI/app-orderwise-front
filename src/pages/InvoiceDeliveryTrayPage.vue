<template>
  <q-page class="page-container">
    <!-- Loading State -->
    <div v-if="loading" class="q-pa-sm">
      <q-skeleton v-for="i in 3" :key="i" height="72px" class="q-mb-xs skeleton-card" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Compact Header -->
      <div v-if="sortedInvoices.length > 0" class="header-bar">
        <div class="header-content">
          <div class="header-info">
            <span class="header-count">{{ sortedInvoices.length }}</span>
            <span class="header-label">órdenes</span>
          </div>
          <q-btn
            v-if="selectedInvoices.length > 0"
            flat
            dense
            no-caps
            color="primary"
            class="action-btn"
            @click="startMultipleDeliveries"
            :loading="optimizingRoute"
          >
            <q-icon name="local_shipping" size="18px" class="q-mr-xs" />
            {{ selectedInvoices.length }}
          </q-btn>
        </div>
      </div>

      <!-- Compact List -->
      <div v-if="sortedInvoices.length > 0" class="orders-list">
        <div
          v-for="invoice in sortedInvoices"
          :key="invoice.id"
          class="order-card"
          :class="{ 'is-selected': isSelected(invoice.id) }"
          @click="toggleSelection(invoice)"
        >
          <div class="order-main">
            <!-- Left: Checkbox + Info -->
            <div class="order-left">
              <q-checkbox
                :model-value="isSelected(invoice.id)"
                color="primary"
                size="xs"
                dense
                @click.stop
              />
              <div class="order-info">
                <div class="order-code">#{{ invoice.code }}</div>
                <div class="order-client">{{ invoice.client?.name || 'Cliente' }}</div>
              </div>
            </div>

            <!-- Right: Price -->
            <div class="order-price">${{ invoice.total?.toFixed(0) }}</div>
          </div>

          <!-- Meta Info -->
          <div class="order-meta">
            <span class="meta-item">
              <q-icon name="near_me" size="14px" />
              {{ invoice.distance_km }}km
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <q-icon name="schedule" size="14px" />
              {{ invoice.estimated_time_min }}min
            </span>
            <span class="meta-divider">•</span>
            <span class="meta-item">
              <q-icon name="inventory_2" size="14px" />
              {{ invoice.products?.length || 0 }}
            </span>
          </div>

          <!-- Address -->
          <div class="order-address">
            <q-icon name="place" size="14px" />
            {{ getFormattedAddress(invoice.client?.address) }}
          </div>

          <!-- Products Expansion -->
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            icon="inventory_2"
            :label="`${invoice.products?.length || 0} producto(s)`"
            header-class="products-header"
            class="products-expansion"
          >
            <div class="products-list">
              <div
                v-for="product in invoice.products"
                :key="product.id"
                class="product-item"
              >
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-qty">x{{ Number(product.pivot?.amount).toFixed(2) || 0 }}</div>
                </div>
                <q-input
                  :model-value="formatQuantity(product.quantity_to_load)"
                  @update:model-value="(val) => updateQuantity(product, val)"
                  type="number"
                  dense
                  outlined
                  :max="Number(product.pivot?.amount)"
                  min="0"
                  step="0.01"
                  class="qty-input"
                  placeholder="0.00"
                  :rules="[
                    val => val >= 0 || 'Debe ser mayor o igual a 0',
                    val => val <= Number(product.pivot?.amount) || `Máximo: ${formatQuantity(product.pivot?.amount)}`
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="local_shipping" size="14px" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sortedInvoices.length === 0" class="empty-state">
        <q-icon name="inbox" size="48px" color="grey-4" />
        <div class="empty-title">Sin órdenes</div>
        <q-btn
          flat
          dense
          color="primary"
          label="Actualizar"
          icon="refresh"
          @click="fetchPredefinedRoutes"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const router = useRouter()
const $q = useQuasar()

const selectedInvoices = ref([])
const predefinedRoutes = ref([])
const sortedInvoices = ref([])
const loading = ref(false)
const optimizingRoute = ref(false)
const hasActiveRun = ref(false)
const currentLocation = ref(null)

onMounted(async () => {
  await checkActiveRun()
  if (!hasActiveRun.value) {
    await getCurrentLocation()
    await fetchPredefinedRoutes()
  }
})

async function checkActiveRun () {
  try {
    const response = await api.get('/invoice-delivery-runs/active')
    if (response.data.delivery_run) {
      hasActiveRun.value = true
      $q.notify({
        type: 'info',
        message: 'Tienes una entrega activa',
        position: 'top'
      })
      router.push({
        name: 'ActiveInvoiceDelivery',
        params: { id: response.data.delivery_run.id }
      })
    }
  } catch (error) {
    hasActiveRun.value = false
  }
}

function isSelected (invoiceId) {
  return selectedInvoices.value.some(i => i.id === invoiceId)
}

function toggleSelection (invoice) {
  const index = selectedInvoices.value.findIndex(i => i.id === invoice.id)
  if (index > -1) {
    selectedInvoices.value.splice(index, 1)
  } else {
    selectedInvoices.value.push(invoice)
  }
}

async function startMultipleDeliveries () {
  if (selectedInvoices.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos una factura',
      position: 'top'
    })
    return
  }

  optimizingRoute.value = true

  try {
    // Optimize route
    const optimizedOrder = await optimizeRoute(selectedInvoices.value)

    // Preparar datos de facturas con cantidades de productos
    const invoicesData = optimizedOrder.map(invoice => ({
      invoice_id: invoice.id,
      products: invoice.products.map(product => ({
        product_id: product.id,
        quantity_to_load: product.quantity_to_load || 0
      }))
    }))

    // Start delivery with optimized order
    const response = await api.post('/invoice-delivery-runs/start', {
      invoices: invoicesData
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: `Ruta optimizada: ${optimizedOrder.length} entregas. Ahorro estimado: ${optimizedOrder.savings || 0} min`,
      position: 'top',
      timeout: 3000
    })

    router.push({
      name: 'ActiveInvoiceDelivery',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting multiple deliveries:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar entrega',
      position: 'top'
    })
  } finally {
    optimizingRoute.value = false
  }
}

async function optimizeRoute (invoices) {
  if (invoices.length <= 1) {
    return invoices
  }

  try {
    const response = await api.post('/invoice-delivery-runs/optimize-route', {
      invoices: invoices.map(i => ({
        id: i.id,
        client_location: {
          lat: i.client?.address?.latitude || i.client?.latitude,
          lng: i.client?.address?.longitude || i.client?.longitude,
          name: i.client?.name
        }
      }))
    })

    return response.data.optimized_invoices
  } catch (error) {
    console.error('Error optimizing route:', error)
    return invoices
  }
}

async function getCurrentLocation () {
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    } catch (error) {
      console.log('No se pudo obtener la ubicación:', error)
    }
  }
}

async function fetchPredefinedRoutes () {
  loading.value = true
  try {
    const response = await api.get('/delivery-routes/predefined-with-invoices')
    predefinedRoutes.value = response.data.routes || []

    // Extraer todas las órdenes de todas las rutas
    const allInvoices = []
    predefinedRoutes.value.forEach(route => {
      route.routeClients?.forEach(routeClient => {
        if (routeClient.client?.invoices) {
          routeClient.client.invoices.forEach(invoice => {
            // Inicializar quantity_to_load en productos (permitir entregas parciales)
            if (invoice.products) {
              invoice.products.forEach(product => {
                const amount = parseFloat(product.pivot?.amount || 0)
                product.quantity_to_load = parseFloat(amount.toFixed(2))
              })
            }

            // Calcular distancia desde ubicación actual
            const distance = calculateInvoiceDistance(invoice, currentLocation.value)
            allInvoices.push({
              ...invoice,
              distance_km: distance.toFixed(1),
              estimated_time_min: Math.round(distance / 40 * 60), // 40 km/h promedio
              route_id: route.id,
              route_name: route.name
            })
          })
        }
      })
    })

    // Ordenar por distancia descendente (más lejanas primero)
    sortedInvoices.value = allInvoices.sort((a, b) =>
      parseFloat(b.distance_km) - parseFloat(a.distance_km)
    )

    console.log('Órdenes ordenadas por distancia:', sortedInvoices.value.length)
  } catch (error) {
    console.error('Error fetching predefined routes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar órdenes',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

function calculateInvoiceDistance (invoice, origin) {
  if (!origin || !invoice.client?.address) return 0

  const clientAddress = typeof invoice.client.address === 'string'
    ? JSON.parse(invoice.client.address)
    : invoice.client.address

  const clientLat = clientAddress?.latitude
  const clientLng = clientAddress?.longitude

  if (!clientLat || !clientLng) return 0

  // Fórmula de Haversine
  const R = 6371 // Radio de la Tierra en km
  const dLat = (clientLat - origin.lat) * Math.PI / 180
  const dLng = (clientLng - origin.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(clientLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatQuantity (value) {
  if (value === null || value === undefined || value === '') return '0.00'
  return parseFloat(value).toFixed(2)
}

function updateQuantity (product, value) {
  if (value === null || value === undefined || value === '') {
    product.quantity_to_load = 0
    return
  }

  const numValue = parseFloat(value)
  const maxAmount = parseFloat(product.pivot?.amount || 0)

  // Permitir entregas parciales (puede ser menor que el pedido)
  if (numValue < 0) {
    product.quantity_to_load = 0
    $q.notify({
      type: 'warning',
      message: 'La cantidad no puede ser negativa',
      position: 'top',
      timeout: 2000
    })
  } else if (numValue > maxAmount) {
    product.quantity_to_load = parseFloat(maxAmount.toFixed(2))
    $q.notify({
      type: 'warning',
      message: `No puede cargar más de ${maxAmount.toFixed(2)} unidades`,
      position: 'top',
      timeout: 2000
    })
  } else {
    product.quantity_to_load = parseFloat(numValue.toFixed(2))
  }
}

function getFormattedAddress (address) {
  if (!address) return 'Dirección no disponible'

  if (typeof address === 'object') {
    return address.formattedAddress || address.street || address.name || 'Dirección no disponible'
  }

  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address)
      return parsed.formattedAddress || parsed.street || parsed.name || address
    } catch (e) {
      return address
    }
  }

  return 'Dirección no disponible'
}
</script>

<style scoped>
.page-container {
  background: #fafafa;
  min-height: 100vh;
}

/* Header */
.header-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  max-width: 100%;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.header-count {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.header-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.action-btn {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

/* Orders List */
.orders-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Order Card - Ultra Compact */
.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-card:active {
  transform: scale(0.99);
}

.order-card.is-selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Main Row */
.order-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.order-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.order-code {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.order-client {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-price {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  white-space: nowrap;
}

/* Meta Info */
.order-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
  padding-left: 32px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.meta-divider {
  color: #d1d5db;
}

/* Address */
.order-address {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
  padding-left: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Products Expansion */
.products-expansion {
  margin-top: 6px;
  border-top: 1px solid #f3f4f6;
  padding-top: 6px;
}

.products-expansion :deep(.q-item) {
  min-height: 32px;
  padding: 4px 0;
}

.products-header {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  padding: 0;
  min-height: 28px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 4px 0;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 12px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-qty {
  font-size: 11px;
  color: #6b7280;
}

.qty-input {
  width: 90px;
  flex-shrink: 0;
}

.qty-input :deep(.q-field__control) {
  height: 32px;
  min-height: 32px;
}

.qty-input :deep(.q-field__native) {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  text-align: right;
  padding-right: 8px;
}

.qty-input :deep(.q-field__prepend) {
  padding-right: 4px;
}

.qty-input :deep(.q-icon) {
  color: #9ca3af;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #9ca3af;
}

/* Loading Skeleton */
.skeleton-card {
  border-radius: 8px;
}

/* Mobile Optimizations */
@media (max-width: 600px) {
  .order-card {
    padding: 9px 10px;
  }

  .order-code {
    font-size: 13px;
  }

  .order-price {
    font-size: 15px;
  }
}
</style>
