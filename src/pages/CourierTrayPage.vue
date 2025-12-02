<template>
  <q-page class="bg-dark text-white">
    <!-- Header -->
    <div class="q-pa-md">
      <div class="text-h5 q-mb-sm">
        <q-icon name="local_shipping" color="primary" size="32px" class="q-mr-sm" />
        Órdenes para Entrega
      </div>
      <div class="text-caption text-grey-5">
        Ordenadas por distancia (más lejanas primero)
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="q-pa-md">
      <q-skeleton v-for="i in 3" :key="i" height="120px" class="q-mb-md" />
    </div>

    <!-- Content -->
    <div v-else class="q-pa-md">
      <!-- Mis Órdenes Aceptadas -->
      <div v-if="acceptedInvoices.length > 0" class="q-mb-lg">
        <div class="text-h6 q-mb-md">
          <q-icon name="check_circle" color="green" size="24px" class="q-mr-sm" />
          Mis Órdenes Aceptadas ({{ acceptedInvoices.length }})
        </div>
        <q-card
          v-for="invoice in acceptedInvoices"
          :key="invoice.id"
          dark
          class="bg-blue-grey-9 q-mb-md"
          style="border-radius: 16px; border: 2px solid #4CAF50;"
        >
          <!-- Header: Invoice Code & Distance -->
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-badge color="green" class="q-mr-sm">LISTA</q-badge>
                Orden #{{ invoice.code }}
              </div>
              <div class="text-caption text-grey-5">
                {{ invoice.distance_km }} km • {{ invoice.estimated_time_min }} min
              </div>
            </div>

            <!-- Client Info -->
            <div class="q-mt-sm">
              <div class="row items-center q-mb-xs">
                <q-icon name="person" color="blue" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-body2 text-weight-medium">{{ invoice.client?.name || 'Cliente' }}</div>
                  <div class="text-caption text-grey-5">{{ getFormattedAddress(invoice.client?.address) }}</div>
                </div>
              </div>

              <div class="row items-center">
                <q-icon name="store" color="green" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-body2 text-weight-medium">{{ invoice.branchOffice?.name || 'Sucursal' }}</div>
                  <div class="text-caption text-grey-5">Origen</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Products List -->
          <q-card-section class="q-pt-none">
            <div class="text-subtitle2 q-mb-xs">
              <q-icon name="inventory_2" size="18px" />
              Productos ({{ invoice.products?.length || 0 }})
            </div>
            <q-list dense dark class="bg-grey-8" style="border-radius: 8px;">
              <q-item v-for="product in invoice.products?.slice(0, 3)" :key="product.id" dense>
                <q-item-section>
                  <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                  <q-item-label caption class="text-grey-5">
                    Cantidad: {{ product.pivot?.quantity || 0 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="invoice.products?.length > 3" dense>
                <q-item-section>
                  <q-item-label caption class="text-grey-5">
                    +{{ invoice.products.length - 3 }} productos más
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Total -->
          <q-card-section class="q-pt-none">
            <div class="text-h6 text-green">
              Total: ${{ invoice.total?.toFixed(2) || '0.00' }}
            </div>
          </q-card-section>

          <!-- Actions -->
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              label="Iniciar Entrega"
              color="light-green-6"
              text-color="dark"
              icon="navigation"
              class="col"
              style="border-radius: 12px; font-weight: bold;"
              @click="startDeliveryDirectly(invoice)"
              :loading="startingDelivery"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Órdenes Disponibles -->
      <div v-if="availableInvoices.length > 0">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="receipt_long" color="orange" size="24px" class="q-mr-sm" />
            Órdenes Disponibles ({{ availableInvoices.length }})
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
        v-for="invoice in availableInvoices"
        :key="invoice.id"
        dark
        class="bg-grey-9 q-mb-md"
        :class="{ 'border-primary': isSelected(invoice.id) }"
        style="border-radius: 16px;"
        :style="isSelected(invoice.id) ? 'border: 2px solid #1976d2;' : ''"
      >
        <!-- Header: Invoice Code & Distance -->
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-checkbox
                :model-value="isSelected(invoice.id)"
                @update:model-value="toggleSelection(invoice)"
                color="primary"
                class="q-mr-sm"
              />
              <div class="text-h6">Orden #{{ invoice.code }}</div>
            </div>
            <div class="text-caption text-grey-5">
              {{ invoice.distance_km }} km • {{ invoice.estimated_time_min }} min
            </div>
          </div>

          <!-- Client & Branch Info -->
          <div class="q-mt-sm">
            <div class="row items-center q-mb-xs">
              <q-icon name="person" color="blue" size="20px" class="q-mr-sm" />
              <div>
                <div class="text-body2 text-weight-medium">{{ invoice.client?.name || 'Cliente' }}</div>
                <div class="text-caption text-grey-5">{{ getFormattedAddress(invoice.client?.address) }}</div>
              </div>
            </div>

            <div class="row items-center">
              <q-icon name="store" color="green" size="20px" class="q-mr-sm" />
              <div>
                <div class="text-body2 text-weight-medium">{{ invoice.branchOffice?.name || 'Sucursal' }}</div>
                <div class="text-caption text-grey-5">Origen</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Products List -->
        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 q-mb-xs">
            <q-icon name="inventory_2" size="18px" />
            Productos ({{ invoice.products?.length || 0 }})
          </div>
          <q-list dense dark class="bg-grey-8" style="border-radius: 8px;">
            <q-item v-for="product in invoice.products?.slice(0, 3)" :key="product.id" dense>
              <q-item-section>
                <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  Cantidad: {{ product.pivot?.quantity || 0 }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="invoice.products?.length > 3" dense>
              <q-item-section>
                <q-item-label caption class="text-grey-5">
                  +{{ invoice.products.length - 3 }} productos más
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <!-- Total -->
        <q-card-section class="q-pt-none">
          <div class="text-h6 text-green">
            Total: ${{ invoice.total?.toFixed(2) || '0.00' }}
          </div>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            unelevated
            no-caps
            label="Aceptar"
            color="light-green-6"
            text-color="dark"
            class="col"
            style="border-radius: 12px; font-weight: bold;"
            @click="acceptInvoice(invoice)"
            :loading="acceptingId === invoice.id"
          />
        </q-card-actions>
      </q-card>
        </q-list>
      </div>

      <!-- Empty State -->
      <div v-if="availableInvoices.length === 0 && acceptedInvoices.length === 0" class="flex flex-center" style="height: 50vh;">
        <div class="text-center">
          <q-icon name="receipt_long" size="80px" color="grey-6" />
          <div class="text-h6 q-mt-md text-grey-6">No hay órdenes disponibles</div>
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

    <!-- Accepted Dialog -->
    <q-dialog v-model="showAcceptedDialog" @hide="onDialogHide">
      <q-card dark class="bg-grey-9" style="min-width: 320px; border-radius: 16px;">
        <q-card-section class="text-center">
          <q-icon name="check_circle" color="green" size="60px" />
          <div class="text-h6 q-mt-md">Orden Aceptada</div>
          <div class="text-caption text-grey-5 q-mt-sm">
            Orden #{{ acceptedInvoice?.code }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            ¿Deseas iniciar la entrega ahora?
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md q-gutter-sm">
          <q-btn
            flat
            no-caps
            label="Más Tarde"
            color="grey-5"
            class="col"
            style="border-radius: 12px;"
            @click="closeAcceptedDialog"
          />
          <q-btn
            unelevated
            no-caps
            label="Iniciar Entrega"
            color="light-green-6"
            text-color="dark"
            icon="navigation"
            class="col"
            style="border-radius: 12px; font-weight: bold;"
            @click="startDelivery"
            :loading="startingDelivery"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const router = useRouter()
const $q = useQuasar()

const availableInvoices = ref([])
const acceptedInvoices = ref([])
const selectedInvoices = ref([])
const loading = ref(false)
const acceptingId = ref(null)
const showAcceptedDialog = ref(false)
const acceptedInvoice = ref(null)
const startingDelivery = ref(false)
const optimizingRoute = ref(false)
const hasActiveRun = ref(false)
const currentLocation = ref(null)

onMounted(async () => {
  await checkActiveRun()
  if (!hasActiveRun.value) {
    await getCurrentLocation()
    await fetchInvoices()
  }
})

async function checkActiveRun () {
  try {
    const response = await api.get('/invoice-delivery-runs/active')
    if (response.data.delivery_run) {
      hasActiveRun.value = true
      // Redirect to active transport
      $q.notify({
        type: 'info',
        message: 'Tienes un viaje activo',
        position: 'top'
      })
      router.push({
        name: 'ActiveTransport',
        params: { id: response.data.delivery_run.id }
      })
    }
  } catch (error) {
    // No active run, continue
    hasActiveRun.value = false
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

async function fetchInvoices () {
  loading.value = true
  try {
    // Obtener órdenes disponibles del repartidor a través de las rutas
    const response = await api.get('/delivery-routes/predefined-with-invoices')
    
    // Extraer todas las órdenes de todas las rutas
    let allInvoices = []
    if (response.data.routes) {
      response.data.routes.forEach(route => {
        route.routeClients?.forEach(routeClient => {
          if (routeClient.client?.invoices) {
            routeClient.client.invoices.forEach(invoice => {
              // Agregar información de distancia
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
    }

    // Ordenar por distancia descendente (más lejanas primero)
    allInvoices.sort((a, b) => parseFloat(b.distance_km) - parseFloat(a.distance_km))

    // Separar entre disponibles y aceptadas
    availableInvoices.value = allInvoices.filter(inv => 
      inv.status === 'finished' && !inv.delivery_person_id
    )
    acceptedInvoices.value = allInvoices.filter(inv => 
      inv.status === 'finished' && inv.delivery_person_id
    )

    console.log('Órdenes disponibles:', availableInvoices.value.length)
    console.log('Órdenes aceptadas:', acceptedInvoices.value.length)
  } catch (error) {
    console.error('Error fetching invoices:', error)
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

async function acceptInvoice (invoice) {
  // Check if already has active run
  await checkActiveRun()
  if (hasActiveRun.value) {
    $q.notify({
      type: 'warning',
      message: 'Ya tienes una entrega activa. Complétala antes de aceptar otra orden.',
      position: 'top'
    })
    return
  }

  acceptingId.value = invoice.id
  try {
    // Asignar el repartidor a la orden
    const user = JSON.parse(localStorage.getItem('user'))
    await api.put(`/invoices/${invoice.id}`, {
      delivery_person_id: user.id
    })

    acceptedInvoice.value = invoice
    showAcceptedDialog.value = true

    // Remove from available list
    availableInvoices.value = availableInvoices.value.filter(inv => inv.id !== invoice.id)
  } catch (error) {
    console.error('Error accepting invoice:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al aceptar orden',
      position: 'top'
    })
  } finally {
    acceptingId.value = null
  }
}


async function closeAcceptedDialog () {
  showAcceptedDialog.value = false
  // Recargar inmediatamente al cerrar
  await fetchInvoices()
}

async function onDialogHide () {
  console.log('Dialog hide event triggered')
  // Recargar órdenes para mostrar la aceptada en la sección correcta
  await fetchInvoices()
}

async function startDelivery () {
  startingDelivery.value = true
  try {
    // Create delivery run with this invoice
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: [acceptedInvoice.value.id]
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: 'Entrega iniciada',
      position: 'top'
    })

    // Close dialog
    showAcceptedDialog.value = false

    // Navigate to active delivery page
    router.push({
      name: 'ActiveTransport',
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

async function startDeliveryDirectly (invoice) {
  startingDelivery.value = true
  try {
    // Create delivery run with this invoice
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: [invoice.id]
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: 'Entrega iniciada',
      position: 'top'
    })

    // Navigate to active delivery page
    router.push({
      name: 'ActiveTransport',
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
  return selectedInvoices.value.some(inv => inv.id === invoiceId)
}

function toggleSelection (invoice) {
  const index = selectedInvoices.value.findIndex(inv => inv.id === invoice.id)
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
      message: 'Selecciona al menos una orden',
      position: 'top'
    })
    return
  }

  optimizingRoute.value = true

  try {
    // Optimizar ruta usando Google Maps
    const optimizedOrder = await optimizeRoute(selectedInvoices.value)

    // Crear delivery run con las órdenes en orden óptimo
    const response = await api.post('/invoice-delivery-runs/start', {
      invoice_ids: optimizedOrder.map(inv => inv.id)
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: `Ruta optimizada: ${optimizedOrder.length} entregas. Ahorro estimado: ${optimizedOrder.savings || 0} min`,
      position: 'top',
      timeout: 3000
    })

    // Navigate to active delivery page
    router.push({
      name: 'ActiveTransport',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting multiple deliveries:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar entregas',
      position: 'top'
    })
  } finally {
    optimizingRoute.value = false
  }
}

async function optimizeRoute (invoices) {
  // Implementar algoritmo de optimización de ruta
  // Usaremos el problema del viajante (TSP) simplificado
  
  if (invoices.length <= 1) {
    return invoices
  }

  try {
    // Llamar al backend para optimizar con Google Maps Distance Matrix
    const response = await api.post('/invoice-delivery-runs/optimize-route', {
      invoices: invoices.map(inv => {
        const clientAddress = typeof inv.client.address === 'string' 
          ? JSON.parse(inv.client.address) 
          : inv.client.address
        
        return {
          id: inv.id,
          client_location: {
            lat: clientAddress?.latitude,
            lng: clientAddress?.longitude
          }
        }
      })
    })

    return response.data.optimized_invoices
  } catch (error) {
    console.error('Error optimizing route:', error)
    // Si falla, retornar orden original
    return invoices
  }
}

function getFormattedAddress (address) {
  if (!address) return 'Dirección no disponible'

  // Si es un objeto JSON
  if (typeof address === 'object') {
    return address.formattedAddress || address.name || 'Dirección no disponible'
  }

  // Si es un string (datos antiguos)
  if (typeof address === 'string') {
    // Intentar parsear como JSON
    try {
      const parsed = JSON.parse(address)
      return parsed.formattedAddress || parsed.name || address
    } catch (e) {
      // Si no es JSON válido, retornar el string directamente
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
