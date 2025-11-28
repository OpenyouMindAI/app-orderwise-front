<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          <q-icon name="route" color="primary" size="32px" class="q-mr-sm" />
          Rutas de Entrega
        </div>
        <div class="text-caption text-grey-7">
          Gestiona y monitorea las rutas de entrega
        </div>
      </div>
      <q-btn
        unelevated
        color="positive"
        label="Nueva Ruta"
        icon="add"
        @click="createRoute()"
      />
    </div>

    <!-- Routes List -->
    <q-card flat bordered>
      <q-card-section class="q-pa-none">
        <q-table
          :rows="routes"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="filter"
          flat
          v-model:pagination="paginationConfig"
          @request="setPagination"
        >
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:body-cell-route_number="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.route_number }}</div>
              <div class="text-caption text-grey-7">{{ props.row.name }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                dense
                size="sm"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-courier="props">
            <q-td :props="props">
              <div v-if="props.row.courier">
                <q-icon name="person" size="16px" class="q-mr-xs" />
                {{ props.row.courier.name }}
              </div>
              <div v-else class="text-grey-6">Sin asignar</div>
            </q-td>
          </template>

          <template v-slot:body-cell-distance="props">
            <q-td :props="props">
              <div>
                <q-icon name="straighten" size="16px" class="q-mr-xs" />
                {{ props.row.total_distance_km || 0 }} km
              </div>
              <div class="text-caption text-grey-7">
                <q-icon name="schedule" size="14px" />
                {{ props.row.estimated_duration_minutes || 0 }} min
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="visibility"
                color="primary"
                size="sm"
                @click="viewRoute(props.row)"
              >
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'draft' || props.row.status === 'assigned'"
                flat
                dense
                round
                icon="edit"
                color="primary"
                size="sm"
                @click="editRoute(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status === 'draft'"
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click="deleteRoute(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Route Details Dialog -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card style="min-width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ selectedRoute?.route_number }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedRoute">
          <!-- Route Info -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-7">Estado</div>
              <q-chip
                :color="getStatusColor(selectedRoute.status)"
                text-color="white"
                dense
              >
                {{ getStatusLabel(selectedRoute.status) }}
              </q-chip>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-7">Repartidor</div>
              <div>{{ selectedRoute.courier?.name || 'Sin asignar' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-7">Distancia Total</div>
              <div>{{ selectedRoute.total_distance_km || 0 }} km</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-7">Tiempo Estimado</div>
              <div>{{ selectedRoute.estimated_duration_minutes || 0 }} min</div>
            </div>
          </div>

          <!-- Stops List -->
          <div class="text-subtitle2 q-mb-sm">Paradas ({{ selectedRoute.stops?.length || 0 }})</div>
          <q-list bordered separator class="rounded-borders" style="max-height: 400px; overflow-y: auto;">
            <q-item v-for="(stop, index) in selectedRoute.stops" :key="stop.id">
              <q-item-section avatar>
                <q-avatar :color="getStopColor(stop.delivery_status)" text-color="white">
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ stop.client?.name || 'Cliente' }}</q-item-label>
                <q-item-label caption v-if="stop.client?.address">
                  <q-icon name="place" size="12px" />
                  {{ getClientAddress(stop.client) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-caption text-grey-7">
                  <div v-if="stop.distance_text">
                    <q-icon name="route" size="14px" />
                    {{ stop.distance_text }}
                  </div>
                  <div v-if="stop.duration_text">
                    <q-icon name="schedule" size="14px" />
                    {{ stop.duration_text }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const router = useRouter()
const $q = useQuasar()

// Refs
const routes = ref([])
const couriers = ref([])
const loading = ref(false)
const showDetailsDialog = ref(false)
const selectedRoute = ref(null)
const filter = ref('')

// Pagination config (like ProductPage)
const paginationConfig = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

// Params for API (like ProductPage)
const params = ref({
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  perPage: 15,
  paginate: 'true',
  dataSearch: {},
  dataEqualFilter: {}
})

// Table columns
const columns = [
  {
    name: 'route_number',
    label: 'Ruta',
    field: 'route_number',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Estado',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'courier',
    label: 'Repartidor',
    field: 'courier',
    align: 'left',
    sortable: true
  },
  {
    name: 'distance',
    label: 'Distancia/Tiempo',
    field: 'total_distance_km',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

onMounted(() => {
  loadCouriers()
  setPagination({
    pagination: paginationConfig.value,
    filter: undefined
  })
})

// Watch filter
watch(filter, () => {
  params.value.page = 1
  getRoutes(params.value)
})

async function loadCouriers () {
  try {
    const { data } = await api.get('delivery-persons')
    couriers.value = data || []
  } catch (error) {
    console.error('Error loading couriers:', error)
  }
}

function getRoutes (params = params.value) {
  loading.value = true
  api.get('delivery-routes', { params })
    .then(({ data }) => {
      routes.value = data.data || []
      paginationConfig.value.rowsNumber = data.total || 0
      loading.value = false
    })
    .catch(err => {
      loading.value = false
      $q.notify({
        message: err.message || 'Error al cargar las rutas',
        icon: 'warning',
        color: 'negative'
      })
    })
}

function setPagination (data) {
  params.value.sortOrder = data.pagination.descending ? 'desc' : 'asc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getRoutes(params.value)
}

function applyFilters (dataEqualFilter) {
  params.value.dataEqualFilter = dataEqualFilter
  params.value.page = 1
  getRoutes(params.value)
}

function createRoute () {
  router.push({ name: 'DeliveryRouteBuilder' })
}

function editRoute (route) {
  router.push({ name: 'DeliveryRouteBuilder', params: { id: route.id } })
}

function viewRoute (route) {
  selectedRoute.value = route
  showDetailsDialog.value = true
}

async function deleteRoute (route) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar la ruta ${route.route_number}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`delivery-routes/${route.id}`)

      $q.notify({
        type: 'positive',
        message: 'Ruta eliminada exitosamente'
      })

      getRoutes(params.value)
    } catch (error) {
      console.error('Error deleting route:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar la ruta'
      })
    }
  })
}

function getStatusColor (status) {
  const colors = {
    draft: 'grey',
    assigned: 'blue',
    in_progress: 'orange',
    completed: 'positive',
    cancelled: 'negative'
  }
  return colors[status] || 'grey'
}

function getStatusLabel (status) {
  const labels = {
    draft: 'Borrador',
    assigned: 'Asignada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status] || status
}

function getStopColor (status) {
  const colors = {
    pending: 'grey',
    arrived: 'orange',
    delivered: 'positive',
    failed: 'negative',
    skipped: 'grey-5'
  }
  return colors[status] || 'grey'
}

function getClientAddress (client) {
  if (!client?.address) return ''

  if (typeof client.address === 'string') {
    return client.address
  }

  if (typeof client.address === 'object') {
    return client.address.formattedAddress || client.address.street || ''
  }

  return ''
}
</script>
