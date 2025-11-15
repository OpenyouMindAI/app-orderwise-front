<template>
  <q-page>
    <!-- Loading State -->
    <div v-if="loading" class="q-pa-md">
      <q-skeleton v-for="i in 3" :key="i" height="150px" class="q-mb-md" />
    </div>

    <!-- Content -->
    <div v-else class="q-pa-md">
      <!-- Entregas Disponibles (con selección múltiple) -->
      <div v-if="invoices.length > 0">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="local_shipping" color="primary" size="24px" class="q-mr-sm" />
            Entregas Disponibles
          </div>
          <q-btn
            v-if="selectedInvoices.length > 0"
            unelevated
            no-caps
            :label="`Iniciar con ${selectedInvoices.length} seleccionadas`"
            color="light-green-6"
            text-color="dark"
            icon="route"
            @click="startMultipleDeliveries"
            :loading="optimizingRoute"
          />
        </div>
        <q-list>
          <q-card
            v-for="invoice in invoices"
            :key="invoice.id"
            dark
            class="bg-grey-9 q-mb-md"
            :class="{ 'border-primary': isSelected(invoice.id) }"
            style="border-radius: 16px;"
            :style="isSelected(invoice.id) ? 'border: 2px solid #1976d2;' : ''"
          >
            <!-- Header -->
            <q-card-section class="q-pb-sm">
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <q-checkbox
                    :model-value="isSelected(invoice.id)"
                    @update:model-value="toggleSelection(invoice)"
                    color="primary"
                    class="q-mr-sm"
                  />
                  <div class="text-h6">Factura {{ invoice.code }}</div>
                </div>
                <div class="text-caption text-grey-5">
                  {{ calculateDistance(invoice) }} km • {{ calculateTime(invoice) }} min
                </div>
              </div>

              <!-- Client Info -->
              <div class="q-mt-sm">
                <div class="row items-center">
                  <q-icon name="person" color="blue" size="20px" class="q-mr-sm" />
                  <div>
                    <div class="text-body2 text-weight-medium">{{ invoice.client?.name || 'Cliente' }}</div>
                    <div class="text-caption text-grey-5">
                      {{ getFormattedAddress(invoice.client?.address) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="q-mt-sm">
                <div class="text-subtitle1 text-green">
                  Total: ${{ invoice.total?.toFixed(2) }}
                </div>
              </div>
            </q-card-section>

            <!-- Products List -->
            <q-card-section class="q-pt-none">
              <div class="text-subtitle2 q-mb-xs">
                <q-icon name="shopping_cart" size="18px" />
                Productos ({{ invoice.products?.length || 0 }})
              </div>
              <q-list dense dark class="bg-grey-8" style="border-radius: 8px;">
                <q-item v-for="product in invoice.products?.slice(0, 3)" :key="product.id" dense>
                  <q-item-section>
                    <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                    <q-item-label caption class="text-grey-5">
                      Cantidad: {{ product.pivot?.amount || 0 }} • ${{ product.pivot?.price }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="invoice.products?.length > 3" dense>
                  <q-item-section>
                    <q-item-label caption class="text-grey-5">
                      +{{ invoice.products.length - 3 }} productos más...
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-list>
      </div>

      <!-- Empty State -->
      <div v-if="invoices.length === 0 && acceptedInvoices.length === 0" class="flex flex-center" style="height: 50vh;">
        <div class="text-center">
          <q-icon name="local_shipping" size="80px" color="grey-6" />
          <div class="text-h6 q-mt-md text-grey-6">No hay entregas disponibles</div>
          <q-btn
            flat
            color="primary"
            label="Actualizar"
            icon="refresh"
            @click="fetchInvoices"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { formatNumber } from 'src/const/mixins'

const router = useRouter()
const $q = useQuasar()

const invoices = ref([])
const acceptedInvoices = ref([])
const selectedInvoices = ref([])
const loading = ref(false)
const startingDelivery = ref(false)
const optimizingRoute = ref(false)
const hasActiveRun = ref(false)

onMounted(async () => {
  await checkActiveRun()
  if (!hasActiveRun.value) {
    await fetchInvoices()
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

async function fetchInvoices () {
  loading.value = true
  try {
    // Get my assigned invoices (already accepted)
    const acceptedResponse = await api.get('/invoice-delivery-runs/my-accepted')
    acceptedInvoices.value = acceptedResponse.data.data || []

    // Get available invoices for delivery (tray)
    const trayResponse = await api.get('/invoice-delivery-runs/tray')
    invoices.value = trayResponse.data.data || []
  } catch (error) {
    console.error('Error fetching invoices:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar entregas',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function startDeliveryDirectly (invoice) {
  startingDelivery.value = true
  try {
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: [invoice.id]
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: 'Entrega iniciada',
      position: 'top'
    })

    router.push({
      name: 'ActiveInvoiceDelivery',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting delivery:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar entrega',
      position: 'top'
    })
  } finally {
    startingDelivery.value = false
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

    // Start delivery with optimized order
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: optimizedOrder.map(i => i.id)
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

function calculateDistance (invoice) {
  // Get client coordinates
  const clientLat = invoice.client?.address?.latitude || invoice.client?.latitude
  const clientLng = invoice.client?.address?.longitude || invoice.client?.longitude

  if (!clientLat || !clientLng) {
    return '-'
  }

  // For now, return a placeholder
  // In production, calculate from current location or branch office
  return '5.2'
}

function calculateTime (invoice) {
  const distance = parseFloat(calculateDistance(invoice))
  if (isNaN(distance)) return '-'

  const avgSpeed = 40 // km/h average in city
  const timeInHours = distance / avgSpeed
  const timeInMinutes = Math.round(timeInHours * 60)

  return timeInMinutes
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
.bg-dark {
  background-color: #1a1a1a;
}
</style>
