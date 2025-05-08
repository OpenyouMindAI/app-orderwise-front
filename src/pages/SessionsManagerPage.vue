<template>
  <div class="q-pa-md">
    <div class="text-h6 q-mb-md text-weight-medium">
      Administración de Sesiones Activas
    </div>
    <q-card class="filter-section q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filters.userId"
              :options="users"
              option-label="name"
              option-value="id"
              label="User"
              emit-value
              map-options
              clearable
              :loading="loadingUsers"
              dense
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              label="Estado de la Sesión"
              emit-value
              map-options
              dense
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3 flex items-end">
            <q-btn
              color="primary"
              label="Aplicar Filtros"
              icon="filter_alt"
              @click="fetchSessions"
              :loading="loading"
              no-caps
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    <div class="row q-mb-sm justify-between items-center">
      <div>
        <q-btn
          color="negative"
          label="Close Selected Sessions"
          icon="logout"
          :disable="selected.length === 0"
          @click="confirmRevokeSelected"
          class="q-mr-sm"
          no-caps
          dense
        />
        <q-btn
          color="warning"
          label="Close All User Sessions"
          icon="person_off"
          :disable="!filters.userId"
          @click="confirmRevokeAllUserSessions"
          no-caps
          dense
        />
      </div>
      <div class="legend-container q-gutter-x-sm">
        <q-badge color="green" class="q-pa-xs">
          Activa
        </q-badge>
        <q-badge color="grey" class="q-pa-xs">
          Expirada
        </q-badge>
        <q-badge color="red" class="q-pa-xs">
          Revocada
        </q-badge>
        <q-badge color="orange" class="q-pa-xs">
          <q-icon name="warning" size="xs" class="q-mr-xs" />
          Sospechoso
        </q-badge>
      </div>
    </div>
    <q-table
      v-model:selected="selected"
      :rows="sessions"
      :columns="columns"
      :loading="loading"
      row-key="token_id"
      selection="multiple"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
      flat
      bordered
      :rows-per-page-options="[10, 20, 50, 100]"
      class="sessions-table"
    >
      <!-- Status Column -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <div class="flex items-center">
            <q-badge :color="getStatusColor(props.row.status)" class="q-pa-xs">
              {{ getStatusLabel(props.row.status) }}
            </q-badge>
            <q-badge v-if="isSuspicious(props.row)" color="orange" class="q-ml-xs q-pa-xs">
              <q-icon name="warning" size="xs" />
              Sospechoso
            </q-badge>
          </div>
        </q-td>
      </template>

      <!-- Expiration Column -->
      <template v-slot:body-cell-remaining_time="props">
        <q-td :props="props">
          {{ props.row.remaining_time }}
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row justify-center">
            <q-btn
              flat
              round
              color="negative"
              icon="cancel"
              size="sm"
              @click.stop="confirmRevokeSingle(props.row)"
            >
              <q-tooltip>Close this session</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="info"
              icon="info"
              size="sm"
              @click.stop="showSessionDetails(props.row)"
            >
              <q-tooltip>View details</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Mobile Optimization -->
      <template v-slot:body-cell="props">
        <q-td :props="props">
          <div class="ellipsis">{{ props.value }}</div>
        </q-td>
      </template>

      <!-- No Results -->
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey-8">
          <q-icon name="search_off" size="2em" class="q-mr-sm" />
          No sessions found with the applied filters
        </div>
      </template>

      <!-- Loading -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>
      </template>
    </q-table>
    <div class="session-cards q-mt-md gt-sm-hide">
      <div v-if="sessions.length === 0 && !loading" class="text-center q-pa-md text-grey-8">
        <q-icon name="search_off" size="2em" />
        <div>No hay sesiones encontradas con los filtros aplicados</div>
      </div>

      <q-card v-for="session in sessions" :key="session.id" class="q-mb-md session-card" :class="{ 'suspicious-card': isSuspicious(session) }">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">{{ session.user_name }}</div>
            <div>
              <q-checkbox v-model="selected" :val="session" dense />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-xs">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-8">Dirección IP</div>
              <div>{{ session.ip }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-8">Ubicación</div>
              <div>{{ session.city }}, {{ session.country }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-8">Navegador</div>
              <div>{{ session.browser }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-8">Sistema Operativo</div>
              <div>{{ session.os }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-8">Fecha Inicio</div>
              <div>{{ formatDate(session.created_at) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-8">Fecha de Expiración</div>
              <div>{{ session.remaining_time }}</div>
            </div>
          </div>

          <div class="row items-center q-mt-sm">
            <q-badge :color="getStatusColor(session.status)" class="q-pa-xs">
              {{ getStatusLabel(session.status) }}
            </q-badge>
            <q-badge v-if="isSuspicious(session)" color="orange" class="q-ml-xs q-pa-xs">
              <q-icon name="warning" size="xs" />
              Sospechoso
            </q-badge>
            <div class="q-ml-auto">
              <q-btn color="info" icon="info" size="sm" @click="showSessionDetails(session)">
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>
              <q-btn color="negative" icon="cancel" size="sm" @click="confirmRevokeSingle(session)">
                <q-tooltip>Cerrar sesión</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Mobile Pagination -->
      <div class="flex justify-center q-mt-md" v-if="sessions.length > 0">
        <q-pagination
          v-model="pagination.page"
          :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
          :max-pages="6"
          boundary-links
          direction-links
          @update:model-value="onRequest({ pagination })"
        />
      </div>
    </div>
  </div>

  <q-dialog v-model="confirmDialog.show" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="warning" text-color="white" />
        <span class="q-ml-sm">{{ confirmDialog.message }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn flat label="Confirmar" color="negative" @click="executeConfirmedAction" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="detailsDialog.show">
    <q-card style="width: 700px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Detalles de la sesión</div>
      </q-card-section>
      <q-card-section v-if="detailsDialog.session">
        <q-list bordered separator>
          <q-item v-for="(value, key) in detailsDialog.session" :key="key" v-show="key !== 'actions'">
            <q-item-section style="overflow: hidden;">
              <q-item-label overline>{{ formatLabel(key) }}</q-item-label>
              <q-item-label class="full-width" style="max-width: 100%;">{{ formatValue(key, value) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" v-close-popup />
        <q-btn
          flat
          label="Revocar Sesión"
          color="negative"
          @click="confirmRevokeSingle(detailsDialog.session)"
          v-close-popup
          v-if="detailsDialog.session && detailsDialog.session.status === 'active'"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

const sessions = ref([])
const users = ref([])
const selected = ref([])
const loading = ref(false)
const loadingUsers = ref(false)
const totalSessions = ref(0)

const filters = ref({
  userId: null,
  status: 'all'
})

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 20
})

const confirmDialog = reactive({
  show: false,
  message: '',
  action: null,
  data: null
})

const detailsDialog = reactive({
  show: false,
  session: null
})

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Solo Activas', value: 'active' },
  { label: 'Solo Expiradas', value: 'expired' },
  { label: 'Solo Revocadas', value: 'revoked' }
]

const columns = [
  { name: 'user_name', label: 'Usuario', field: 'user_name', align: 'left', sortable: true },
  { name: 'ip', label: 'Dirección IP', field: 'ip', align: 'left', sortable: true },
  { name: 'os', label: 'Sistema Operativo', field: 'os', align: 'left', sortable: true },
  { name: 'browser', label: 'Navegador', field: 'browser', align: 'left', sortable: true },
  { name: 'city', label: 'Ciudad', field: 'city', align: 'left', sortable: true },
  { name: 'country', label: 'País', field: 'country', align: 'left', sortable: true },
  { name: 'timezone', label: 'Zona Horaria', field: 'timezone', align: 'left', sortable: true },
  {
    name: 'created_at',
    label: 'Fecha Inicio',
    field: 'created_at',
    align: 'left',
    sortable: true,
    format: val => date.formatDate(val, 'MMM D, YYYY HH:mm')
  },
  { name: 'expires_at', label: 'Fecha de Expiración', field: 'expires_at', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

onMounted(() => {
  fetchUsers()
  onRequest({ pagination: pagination.value })
})

async function fetchUsers () {
  loadingUsers.value = true
  try {
    const { data } = await api.get('users')
    users.value = data
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error loading users',
      icon: 'error'
    })
    console.error(error)
  } finally {
    loadingUsers.value = false
  }
}

async function fetchSessions () {
  loading.value = true
  try {
    const { data } = await api.get('sessions', {
      params: {
        ...pagination.value,
        user_id: filters.value.userId,
        status: filters.value.status
      }
    })
    sessions.value = data.data.map(session => ({ ...session, ...session.metadata }))
    totalSessions.value = data.total
    pagination.value.rowsNumber = data.total
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error loading sessions',
      icon: 'error'
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

function onRequest (props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  fetchSessions()
}

function getStatusColor (status) {
  switch (status) {
    case 'active': return 'green'
    case 'expired': return 'grey'
    case 'revoked': return 'red'
    default: return 'grey'
  }
}

function getStatusLabel (status) {
  switch (status) {
    case 'active': return 'Activa'
    case 'expired': return 'Expirada'
    case 'revoked': return 'Revocada'
    default: return status
  }
}

function formatDate (dateString) {
  return date.formatDate(dateString, 'MMM D, YYYY HH:mm')
}
function isSuspicious (session) {
  if (!session.country_code) return false

  const unusualCountries = ['RU', 'CN', 'KP', 'IR']
  if (unusualCountries.includes(session.country_code)) return true

  const uncommonBrowsers = ['Unknown', 'IE', 'Opera Mini']
  if (uncommonBrowsers.some(b => session.browser.includes(b))) return true

  const loginHour = new Date(session.created_at).getHours()
  if (loginHour < 6 || loginHour > 22) return true

  return false
}

function confirmRevokeSingle (session) {
  confirmDialog.message = `¿Está seguro de que desea cerrar la sesión de ${session.user_name}?`
  confirmDialog.action = 'revokeSingle'
  confirmDialog.data = session
  confirmDialog.show = true
}

function confirmRevokeSelected () {
  confirmDialog.message = `¿Está seguro de que desea cerrar ${selected.value.length} sesión${selected.value.length !== 1 ? 'es' : ''}?`
  confirmDialog.action = 'revokeSelected'
  confirmDialog.show = true
}

function confirmRevokeAllUserSessions () {
  const user = users.value.find(u => u.id === filters.value.userId)
  confirmDialog.message = `¿Está seguro de que desea cerrar todas las sesiones de ${user ? user.name : 'este usuario'}?`
  confirmDialog.action = 'revokeAllUserSessions'
  confirmDialog.show = true
}

async function executeConfirmedAction () {
  try {
    switch (confirmDialog.action) {
      case 'revokeSingle':
        await revokeSingleSession(confirmDialog.data.token_id)
        break
      case 'revokeSelected':
        await revokeMultipleSessions(selected.value.map(s => s.token_id))
        break
      case 'revokeAllUserSessions':
        await revokeAllUserSessions(filters.value.userId)
        break
    }
  } catch (error) {
    console.error('Error executing action:', error)
  }
}

async function revokeSingleSession (sessionId) {
  try {
    await api.post('revoke-multiple-sessions', { token_ids: [sessionId] })

    $q.notify({
      color: 'positive',
      message: 'Session closed successfully',
      icon: 'check_circle'
    })
    fetchSessions()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error closing session',
      icon: 'error'
    })
    console.error(error)
  }
}

async function revokeMultipleSessions (sessionIds) {
  try {
    await api.post('revoke-all-sessions', { token_ids: sessionIds })

    $q.notify({
      color: 'positive',
      message: `${sessionIds.length} session${sessionIds.length !== 1 ? 's' : ''} closed successfully`,
      icon: 'check_circle'
    })

    // Clear selection and update
    selected.value = []
    fetchSessions()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error closing sessions',
      icon: 'error'
    })
    console.error(error)
  }
}

async function revokeAllUserSessions (userId) {
  try {
    await api.post('revoke-all-user-sessions', { user_id: userId })
    $q.notify({
      color: 'positive',
      message: 'Cerradas todas las sesiones de este usuario',
      icon: 'check_circle'
    })
    fetchSessions()
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error closing user sessions',
      icon: 'error'
    })
    console.error(error)
  }
}

function showSessionDetails (session) {
  detailsDialog.session = { ...session }
  detailsDialog.show = true
}

function formatLabel (key) {
  const labels = {
    id: 'ID',
    ip: 'Dirección IP',
    os: 'Sistema Operativo',
    browser: 'Navegador',
    city: 'Ciudad',
    country: 'País',
    countryCode: 'Código País',
    timezone: 'Zona Horaria',
    created_at: 'Fecha Inicio',
    expires_at: 'Fecha de Expiración',
    status: 'Estado',
    user: 'Usuario',
    device: 'Dispositivo',
    lastActivity: 'Última Actividad'
  }

  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

function formatValue (key, value) {
  if (key === 'created_at' || key === 'expires_at' || key === 'lastActivity') {
    return date.formatDate(value, 'MMM D, YYYY HH:mm:ss')
  }
  if (key === 'user' && typeof value === 'object') {
    return value.user_name
  }
  if (key === 'status') {
    return getStatusLabel(value)
  }
  if (value === null || value === undefined) {
    return 'N/A'
  }
  if (typeof value === 'object') {
    return null
  }
  return value
}

</script>

<style>
.session-manager {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-section {
  background-color: #f8f9fa;
}

/* Styles for suspicious rows */
.suspicious-card {
  border-left: 4px solid #ff9800 !important;
}

/* Animation for online users indicator */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.q-table th {
  font-weight: 500;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .legend-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 8px;
  }

  .sessions-table {
    display: none;
  }
}

@media (min-width: 600px) {
  .session-cards {
    display: none;
  }
}

.session-card {
  transition: all 0.2s ease;
}

.session-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.column-selector {
  display: flex;
  flex-direction: column;
}

.column-dropdown-card {
  width: 300px;
  max-height: 400px;
}

.column-checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
}

.selected-columns-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 28px;
}
</style>
