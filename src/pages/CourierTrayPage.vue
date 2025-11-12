<template>
  <q-page class="bg-dark text-white">
    <!-- Header -->

    <!-- Loading State -->
    <div v-if="loading" class="q-pa-md">
      <q-skeleton v-for="i in 3" :key="i" height="120px" class="q-mb-md" />
    </div>

    <!-- Content -->
    <div v-else class="q-pa-md">
      <!-- Mis Transferencias Aceptadas -->
      <div v-if="acceptedTransfers.length > 0" class="q-mb-lg">
        <div class="text-h6 q-mb-md">
          <q-icon name="check_circle" color="green" size="24px" class="q-mr-sm" />
          Mis Transferencias Aceptadas
        </div>
        <q-card
          v-for="transfer in acceptedTransfers"
          :key="transfer.id"
          dark
          class="bg-blue-grey-9 q-mb-md"
          style="border-radius: 16px; border: 2px solid #4CAF50;"
        >
          <!-- Header: Transfer Number & Route -->
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between">
              <div class="text-h6">
                <q-badge color="green" class="q-mr-sm">ACEPTADA</q-badge>
                Transferencia #{{ transfer.transfer_number }}
              </div>
              <div class="text-caption text-grey-5">
                {{ calculateDistance(transfer) }} km • {{ calculateTime(transfer) }} min
              </div>
            </div>

            <!-- Route: Origin → Destination -->
            <div class="q-mt-sm">
              <div class="row items-center q-mb-xs">
                <q-icon name="store" color="green" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-body2 text-weight-medium">{{ transfer.origin_branch_office?.name || 'Origen' }}</div>
                  <div class="text-caption text-grey-5">Origen</div>
                </div>
              </div>

              <div class="row items-center">
                <q-icon name="place" color="blue" size="20px" class="q-mr-sm" />
                <div>
                  <div class="text-body2 text-weight-medium">{{ transfer.destination_branch_office?.name || 'Destino' }}</div>
                  <div class="text-caption text-grey-5">
                    {{ getFormattedAddress(transfer.destination_branch_office?.address) }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Products List -->
          <q-card-section class="q-pt-none">
            <div class="text-subtitle2 q-mb-xs">
              <q-icon name="inventory_2" size="18px" />
              Productos ({{ transfer.products?.length || 0 }})
            </div>
            <q-list dense dark class="bg-grey-8" style="border-radius: 8px;">
              <q-item v-for="product in transfer.products" :key="product.id" dense>
                <q-item-section>
                  <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                  <q-item-label caption class="text-grey-5">
                    Cantidad: {{ product.pivot?.quantity || 0 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Actions -->
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              label="Iniciar Viaje"
              color="light-green-6"
              text-color="dark"
              icon="navigation"
              class="col"
              style="border-radius: 12px; font-weight: bold;"
              @click="startTransportDirectly(transfer)"
              :loading="startingTransport"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Transferencias Disponibles -->
      <div v-if="transfers.length > 0">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="local_shipping" color="primary" size="24px" class="q-mr-sm" />
            Transferencias Disponibles
          </div>
          <q-btn
            v-if="selectedTransfers.length > 0"
            unelevated
            no-caps
            :label="`Iniciar con ${selectedTransfers.length} seleccionadas`"
            color="light-green-6"
            text-color="dark"
            icon="route"
            @click="startMultipleTransfers"
            :loading="optimizingRoute"
          />
        </div>
        <q-list>
      <q-card
        v-for="transfer in transfers"
        :key="transfer.id"
        dark
        class="bg-grey-9 q-mb-md"
        :class="{ 'border-primary': isSelected(transfer.id) }"
        style="border-radius: 16px;"
        :style="isSelected(transfer.id) ? 'border: 2px solid #1976d2;' : ''"
      >
        <!-- Header: Transfer Number & Route -->
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-checkbox
                :model-value="isSelected(transfer.id)"
                @update:model-value="toggleSelection(transfer)"
                color="primary"
                class="q-mr-sm"
              />
              <div class="text-h6">Transferencia #{{ transfer.transfer_number }}</div>
            </div>
            <div class="text-caption text-grey-5">
              {{ calculateDistance(transfer) }} km • {{ calculateTime(transfer) }} min
            </div>
          </div>

          <!-- Route: Origin → Destination -->
          <div class="q-mt-sm">
            <div class="row items-center q-mb-xs">
              <q-icon name="store" color="green" size="20px" class="q-mr-sm" />
              <div>
                <div class="text-body2 text-weight-medium">{{ transfer.origin_branch_office?.name || 'Origen' }}</div>
                <div class="text-caption text-grey-5">Origen</div>
              </div>
            </div>

            <div class="row items-center">
              <q-icon name="place" color="blue" size="20px" class="q-mr-sm" />
              <div>
                <div class="text-body2 text-weight-medium">{{ transfer.destination_branch_office?.name || 'Destino' }}</div>
                <div class="text-caption text-grey-5">
                  {{ getFormattedAddress(transfer.destination_branch_office?.address) }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Products List -->
        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 q-mb-xs">
            <q-icon name="inventory_2" size="18px" />
            Productos ({{ transfer.products?.length || 0 }})
          </div>
          <q-list dense dark class="bg-grey-8" style="border-radius: 8px;">
            <q-item v-for="product in transfer.products" :key="product.id" dense>
              <q-item-section>
                <q-item-label class="text-body2">{{ product.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  Cantidad: {{ product.pivot?.quantity || 0 }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            flat
            no-caps
            label="Rechazar"
            color="grey-5"
            class="col"
            style="border-radius: 12px;"
            @click="declineTransfer(transfer.id)"
          />
          <q-btn
            unelevated
            no-caps
            label="Aceptar"
            color="light-green-6"
            text-color="dark"
            class="col q-ml-sm"
            style="border-radius: 12px; font-weight: bold;"
            @click="acceptTransfer(transfer)"
            :loading="acceptingId === transfer.id"
          />
        </q-card-actions>
      </q-card>
        </q-list>
      </div>

      <!-- Empty State -->
      <div v-if="transfers.length === 0 && acceptedTransfers.length === 0" class="flex flex-center" style="height: 50vh;">
        <div class="text-center">
          <q-icon name="local_shipping" size="80px" color="grey-6" />
          <div class="text-h6 q-mt-md text-grey-6">No hay transferencias disponibles</div>
          <q-btn
            flat
            color="primary"
            label="Actualizar"
            icon="refresh"
            @click="fetchTransfers"
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
          <div class="text-h6 q-mt-md">Transferencia Aceptada</div>
          <div class="text-caption text-grey-5 q-mt-sm">
            Transferencia #{{ acceptedTransfer?.transfer_number }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            ¿Deseas iniciar el viaje ahora?
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
            label="Iniciar Viaje"
            color="light-green-6"
            text-color="dark"
            icon="navigation"
            class="col"
            style="border-radius: 12px; font-weight: bold;"
            @click="startTransport"
            :loading="startingTransport"
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

const transfers = ref([])
const acceptedTransfers = ref([])
const selectedTransfers = ref([])
const loading = ref(false)
const acceptingId = ref(null)
const showAcceptedDialog = ref(false)
const acceptedTransfer = ref(null)
const startingTransport = ref(false)
const optimizingRoute = ref(false)
const hasActiveRun = ref(false)

onMounted(async () => {
  await checkActiveRun()
  if (!hasActiveRun.value) {
    await fetchTransfers()
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

async function fetchTransfers () {
  loading.value = true
  try {
    // Obtener transferencias disponibles (pending)
    const availableResponse = await api.get('/transfer-stocks/tray')
    transfers.value = availableResponse.data.data || []
    console.log('Transferencias disponibles:', transfers.value.length)

    // Obtener mis transferencias aceptadas (accepted por mí, sin delivery run activo)
    const acceptedResponse = await api.get('/transfer-stocks', {
      params: {
        status: 'accepted',
        accepted_by_me: true
      }
    })
    acceptedTransfers.value = acceptedResponse.data.data || []
    console.log('Transferencias aceptadas:', acceptedTransfers.value.length)
    console.log('Datos aceptadas:', acceptedTransfers.value)
  } catch (error) {
    console.error('Error fetching transfers:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar transferencias',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function acceptTransfer (transfer) {
  // Check if already has active run
  await checkActiveRun()
  if (hasActiveRun.value) {
    $q.notify({
      type: 'warning',
      message: 'Ya tienes un viaje activo. Complétalo antes de aceptar otra transferencia.',
      position: 'top'
    })
    return
  }

  acceptingId.value = transfer.id
  try {
    const response = await api.post(`/transfer-stocks/${transfer.id}/accept`)

    acceptedTransfer.value = transfer
    showAcceptedDialog.value = true

    // Remove from list
    transfers.value = transfers.value.filter(t => t.id !== transfer.id)
  } catch (error) {
    console.error('Error accepting transfer:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al aceptar transferencia',
      position: 'top'
    })
  } finally {
    acceptingId.value = null
  }
}

function declineTransfer (id) {
  $q.dialog({
    title: 'Rechazar Transferencia',
    message: '¿Estás seguro de rechazar esta transferencia?',
    dark: true,
    cancel: {
      flat: true,
      label: 'Cancelar',
      color: 'grey-5'
    },
    ok: {
      unelevated: true,
      label: 'Rechazar',
      color: 'negative'
    }
  }).onOk(() => {
    transfers.value = transfers.value.filter(t => t.id !== id)
    $q.notify({
      type: 'info',
      message: 'Transferencia rechazada',
      position: 'top'
    })
  })
}

async function closeAcceptedDialog () {
  showAcceptedDialog.value = false
  // Recargar inmediatamente al cerrar
  await fetchTransfers()
}

async function onDialogHide () {
  console.log('Dialog hide event triggered')
  // Recargar transferencias para mostrar la aceptada en la sección correcta
  await fetchTransfers()
}

async function startTransport () {
  startingTransport.value = true
  try {
    // Create delivery run with this transfer
    const response = await api.post('/delivery-runs/start-transport', {
      transfer_ids: [acceptedTransfer.value.id]
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: 'Viaje iniciado',
      position: 'top'
    })

    // Close dialog
    showAcceptedDialog.value = false

    // Navigate to active transport page
    router.push({
      name: 'ActiveTransport',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting transport:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar viaje',
      position: 'top'
    })
  } finally {
    startingTransport.value = false
  }
}

async function startTransportDirectly (transfer) {
  startingTransport.value = true
  try {
    // Create delivery run with this transfer
    const response = await api.post('/delivery-runs/start-transport', {
      transfer_ids: [transfer.id]
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: 'Viaje iniciado',
      position: 'top'
    })

    // Navigate to active transport page
    router.push({
      name: 'ActiveTransport',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting transport:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar viaje',
      position: 'top'
    })
  } finally {
    startingTransport.value = false
  }
}

function calculateDistance (transfer) {
  // Calcular distancia real desde las coordenadas
  const origin = transfer.origin_branch_office
  const destination = transfer.destination_branch_office

  // Extraer coordenadas del objeto address (JSON)
  const originLat = origin?.address?.latitude
  const originLon = origin?.address?.longitude
  const destLat = destination?.address?.latitude
  const destLon = destination?.address?.longitude

  if (!originLat || !originLon || !destLat || !destLon) {
    return '-'
  }

  // Usar fórmula de Haversine para calcular distancia en km
  const R = 6371 // Radio de la Tierra en km
  const dLat = (destLat - originLat) * Math.PI / 180
  const dLon = (destLon - originLon) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance)
}

function calculateTime (transfer) {
  // Calcular tiempo estimado basado en distancia (promedio 40 km/h en ciudad)
  const distance = calculateDistance(transfer)
  if (distance === '-') return '-'

  const avgSpeed = 40 // km/h promedio en ciudad
  const timeInHours = distance / avgSpeed
  const timeInMinutes = Math.round(timeInHours * 60)

  return timeInMinutes
}

function isSelected (transferId) {
  return selectedTransfers.value.some(t => t.id === transferId)
}

function toggleSelection (transfer) {
  const index = selectedTransfers.value.findIndex(t => t.id === transfer.id)
  if (index > -1) {
    selectedTransfers.value.splice(index, 1)
  } else {
    selectedTransfers.value.push(transfer)
  }
}

async function startMultipleTransfers () {
  if (selectedTransfers.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos una transferencia',
      position: 'top'
    })
    return
  }

  optimizingRoute.value = true

  try {
    // Optimizar ruta usando Google Maps
    const optimizedOrder = await optimizeRoute(selectedTransfers.value)

    // Crear delivery run con las transferencias en orden óptimo
    const response = await api.post('/delivery-runs/start-transport', {
      transfer_ids: optimizedOrder.map(t => t.id)
    })

    const deliveryRun = response.data.delivery_run

    $q.notify({
      type: 'positive',
      message: `Ruta optimizada: ${optimizedOrder.length} entregas. Ahorro estimado: ${optimizedOrder.savings || 0} min`,
      position: 'top',
      timeout: 3000
    })

    // Navigate to active transport page
    router.push({
      name: 'ActiveTransport',
      params: { id: deliveryRun.id }
    })
  } catch (error) {
    console.error('Error starting multiple transfers:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al iniciar viaje',
      position: 'top'
    })
  } finally {
    optimizingRoute.value = false
  }
}

async function optimizeRoute (transfers) {
  // Implementar algoritmo de optimización de ruta
  // Usaremos el problema del viajante (TSP) simplificado
  
  if (transfers.length <= 1) {
    return transfers
  }

  try {
    // Llamar al backend para optimizar con Google Maps Distance Matrix
    const response = await api.post('/delivery-runs/optimize-route', {
      transfers: transfers.map(t => ({
        id: t.id,
        origin: {
          lat: t.origin_branch_office?.address?.latitude,
          lng: t.origin_branch_office?.address?.longitude,
          name: t.origin_branch_office?.name
        },
        destination: {
          lat: t.destination_branch_office?.address?.latitude,
          lng: t.destination_branch_office?.address?.longitude,
          name: t.destination_branch_office?.name
        }
      }))
    })

    return response.data.optimized_transfers
  } catch (error) {
    console.error('Error optimizing route:', error)
    // Si falla, retornar orden original
    return transfers
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
