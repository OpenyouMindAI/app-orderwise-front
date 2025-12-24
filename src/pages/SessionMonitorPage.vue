<template>
  <q-page class="session-monitor-page q-pa-sm">
    <!-- Header Compacto -->
    <div class="row items-center q-mb-sm">
      <div class="col">
        <div class="text-subtitle1 text-weight-bold">
          <q-icon name="monitor_heart" size="20px" class="q-mr-xs" color="primary" />
          Monitor de Sesiones
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat dense round icon="refresh" size="sm" :loading="loading" @click="fetchSessions">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Stats Row Compacto -->
    <div class="row q-col-gutter-xs q-mb-sm">
      <div class="col-3">
        <div class="stat-chip stat-online">
          <span class="stat-value">{{ summary.online }}</span>
          <span class="stat-label">Online</span>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-chip stat-idle">
          <span class="stat-value">{{ summary.idle }}</span>
          <span class="stat-label">Inactivos</span>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-chip stat-offline">
          <span class="stat-value">{{ summary.offline }}</span>
          <span class="stat-label">Offline</span>
        </div>
      </div>
      <div class="col-3">
        <div class="stat-chip stat-total">
          <span class="stat-value">{{ summary.total_active }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>

    <!-- Mi Sesión Compacta -->
    <div v-if="mySession" class="my-session-row q-mb-sm">
      <div class="row items-center no-wrap q-gutter-x-sm">
        <q-avatar size="32px" color="primary" text-color="white" class="my-session-avatar">
          <img v-if="mySession.user?.avatar" :src="mySession.user.avatar" />
          <span v-else>{{ (mySession.user?.name || 'U').charAt(0) }}</span>
        </q-avatar>
        <div class="col">
          <div class="text-weight-medium text-body2">{{ mySession.user?.name }}</div>
          <div class="text-caption secondary-text">{{ mySession.current_module || 'Dashboard' }}</div>
        </div>
        <q-badge color="positive" class="q-px-sm">
          <q-icon name="fiber_manual_record" size="8px" class="q-mr-xs pulse-dot" />
          Mi sesión
        </q-badge>
        <div class="session-meta">
          <q-icon name="computer" size="14px" />
          <span>{{ mySession.device_type }}</span>
          <q-icon name="public" size="14px" class="q-ml-sm" />
          <span>{{ mySession.ip_address }}</span>
        </div>
      </div>
    </div>

    <!-- Filtros Inline -->
    <div class="row items-center q-gutter-x-sm q-mb-sm">
      <q-input
        v-model="filters.search"
        dense
        outlined
        placeholder="Buscar..."
        class="col-grow filter-input"
        clearable
        @update:model-value="debouncedSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
      <q-select
        v-model="filters.status"
        :options="statusOptions"
        dense
        outlined
        emit-value
        map-options
        class="filter-select"
        @update:model-value="fetchSessions"
      />
      <q-btn-toggle
        v-model="viewMode"
        dense
        flat
        toggle-color="primary"
        :options="[
          { value: 'cards', icon: 'grid_view' },
          { value: 'table', icon: 'view_list' }
        ]"
      />
    </div>

    <!-- Lista de Sesiones Compacta -->
    <div v-if="viewMode === 'cards'" class="sessions-list">
      <div v-for="session in sessions" :key="session.id" class="session-item" :class="'status-' + session.status">
        <div class="row items-center no-wrap q-gutter-x-sm">
          <q-avatar size="36px">
            <img v-if="session.user?.avatar" :src="session.user.avatar" />
            <q-icon v-else name="person" size="20px" />
          </q-avatar>
          <div class="col">
            <div class="row items-center no-wrap">
              <span class="text-weight-medium text-body2 ellipsis" style="max-width: 140px;">
                {{ session.user?.name || 'Usuario' }}
              </span>
              <q-badge
                :color="getStatusColor(session.status)"
                class="q-ml-xs status-dot"
                :label="getStatusLabel(session.status)"
              />
            </div>
            <div class="text-caption secondary-text ellipsis">
              {{ session.current_module || 'Dashboard' }}
            </div>
          </div>
          <div class="session-info text-right">
            <div class="text-caption">
              <q-icon name="computer" size="12px" /> {{ session.device_type }}
            </div>
            <div class="text-caption secondary-text">
              {{ formatTimeAgo(session.last_activity_at) }}
            </div>
          </div>
          <div class="session-actions">
            <q-btn flat dense round size="sm" icon="info_outline" @click="showSessionDetails(session)">
              <q-tooltip>Detalles</q-tooltip>
            </q-btn>
            <q-btn
              v-if="session.status !== 'logout'"
              flat
              dense
              round
              size="sm"
              icon="power_settings_new"
              color="negative"
              @click="confirmForceDisconnect(session)"
            >
              <q-tooltip>Desconectar</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sessions.length === 0 && !loading" class="empty-state">
        <q-icon name="people_outline" size="48px" class="secondary-text" />
        <div class="text-body2 secondary-text q-mt-sm">No hay otras sesiones activas</div>
        <div class="text-caption secondary-text q-mt-xs">
          Total en BD: {{ pagination.rowsNumber }} | Mi sesión: {{ mySession ? 'Sí' : 'No' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="32px" />
      </div>
    </div>

    <!-- Sessions Table View -->
    <q-table
      v-else
      :rows="sessions"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :pagination="pagination"
      @request="onRequest"
      class="sessions-table"
    >
      <template v-slot:body-cell-user="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar size="32px" class="q-mr-sm">
              <img v-if="props.row.user?.avatar" :src="props.row.user.avatar" />
              <q-icon v-else name="person" />
            </q-avatar>
            <div>
              <div class="text-weight-medium">{{ props.row.user?.name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.user?.email }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            <q-icon :name="getStatusIcon(props.row.status)" size="12px" class="q-mr-xs" />
            {{ getStatusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-device="props">
        <q-td :props="props">
          <q-icon :name="getDeviceIcon(props.row.device_type)" class="q-mr-xs" />
          {{ props.row.device_type }}
          <div class="text-caption text-grey-6">{{ props.row.platform }} - {{ props.row.browser }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-last_activity="props">
        <q-td :props="props">
          {{ formatTimeAgo(props.row.last_activity_at) }}
          <q-tooltip>{{ formatDate(props.row.last_activity_at) }}</q-tooltip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense size="sm" icon="info" color="primary" @click="showSessionDetails(props.row)" />
          <q-btn
            v-if="props.row.status !== 'logout'"
            flat
            dense
            size="sm"
            icon="logout"
            color="negative"
            @click="confirmForceDisconnect(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Session Details Dialog -->
    <q-dialog v-model="detailsDialog.show">
      <q-card style="width: 500px; max-width: 95vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="info" class="q-mr-sm" />
            Detalles de Sesión
          </div>
        </q-card-section>

        <q-card-section v-if="detailsDialog.session">
          <q-list separator>
            <q-item>
              <q-item-section avatar>
                <q-avatar size="48px">
                  <img v-if="detailsDialog.session.user?.avatar" :src="detailsDialog.session.user.avatar" />
                  <q-icon v-else name="person" size="32px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ detailsDialog.session.user?.name }}</q-item-label>
                <q-item-label caption>{{ detailsDialog.session.user?.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="getStatusColor(detailsDialog.session.status)">
                  {{ getStatusLabel(detailsDialog.session.status) }}
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="fingerprint" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Session UUID</q-item-label>
                <q-item-label class="text-caption" style="word-break: break-all;">
                  {{ detailsDialog.session.session_uuid }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon :name="getDeviceIcon(detailsDialog.session.device_type)" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Dispositivo</q-item-label>
                <q-item-label>
                  {{ detailsDialog.session.device_name }} ({{ detailsDialog.session.device_type }})
                </q-item-label>
                <q-item-label caption>
                  {{ detailsDialog.session.platform }} - {{ detailsDialog.session.browser }} {{ detailsDialog.session.browser_version }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="dns" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Dirección IP</q-item-label>
                <q-item-label>{{ detailsDialog.session.ip_address }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="detailsDialog.session.city || detailsDialog.session.country">
              <q-item-section avatar>
                <q-icon name="location_on" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Ubicación</q-item-label>
                <q-item-label>{{ detailsDialog.session.city }}, {{ detailsDialog.session.country }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="view_module" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Módulo Actual</q-item-label>
                <q-item-label>{{ detailsDialog.session.current_module || 'Dashboard' }}</q-item-label>
                <q-item-label caption>{{ detailsDialog.session.current_url }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="schedule" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Última Actividad</q-item-label>
                <q-item-label>{{ formatDate(detailsDialog.session.last_activity_at) }}</q-item-label>
                <q-item-label caption>{{ formatTimeAgo(detailsDialog.session.last_activity_at) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="login" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Conectado desde</q-item-label>
                <q-item-label>{{ formatDate(detailsDialog.session.connected_at) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
          <q-btn
            v-if="detailsDialog.session?.status !== 'logout'"
            flat
            label="Forzar Desconexión"
            color="negative"
            @click="confirmForceDisconnect(detailsDialog.session); detailsDialog.show = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Force Disconnect Dialog -->
    <q-dialog v-model="confirmDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">{{ confirmDialog.message }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Desconectar" color="negative" @click="executeForceDisconnect" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const $q = useQuasar()

// Get current session UUID from localStorage
const currentSessionUuid = localStorage.getItem('session_uuid')

// State
const sessions = ref([])
const mySession = ref(null)
const onlineUsers = ref([])
const loading = ref(false)
const viewMode = ref('cards')

const summary = ref({
  online: 0,
  idle: 0,
  offline: 0,
  total_active: 0
})

const filters = ref({
  search: '',
  status: 'all'
})

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const detailsDialog = reactive({
  show: false,
  session: null
})

const confirmDialog = reactive({
  show: false,
  message: '',
  session: null
})

let presenceChannel = null
let searchTimeout = null

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'En línea', value: 'online' },
  { label: 'Inactivos', value: 'idle' },
  { label: 'Desconectados', value: 'offline' },
  { label: 'Cerrados', value: 'logout' }
]

const columns = [
  { name: 'user', label: 'Usuario', field: 'user', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center', sortable: true },
  { name: 'device', label: 'Dispositivo', field: 'device_type', align: 'left' },
  { name: 'ip_address', label: 'IP', field: 'ip_address', align: 'left' },
  { name: 'current_module', label: 'Módulo', field: 'current_module', align: 'left' },
  { name: 'last_activity', label: 'Última Actividad', field: 'last_activity_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

// Lifecycle
onMounted(() => {
  fetchSessions()
  fetchSummary()
  joinPresenceChannel()
})

onUnmounted(() => {
  leavePresenceChannel()
})

// Methods
async function fetchSessions () {
  loading.value = true
  try {
    const { data } = await api.get('user-sessions', {
      params: {
        page: pagination.value.page,
        per_page: pagination.value.rowsPerPage,
        status: filters.value.status,
        search: filters.value.search
      }
    })

    const allSessions = data.data || []

    // Get current session UUID fresh from localStorage
    const myUuid = localStorage.getItem('session_uuid')

    // Separate my session from the list only if we have a valid UUID
    if (myUuid) {
      const mySessionData = allSessions.find(s => s.session_uuid === myUuid)
      if (mySessionData) {
        mySession.value = mySessionData
        sessions.value = allSessions.filter(s => s.session_uuid !== myUuid)
      } else {
        mySession.value = null
        sessions.value = allSessions
      }
    } else {
      mySession.value = null
      sessions.value = allSessions
    }

    pagination.value.rowsNumber = data.total
    updateSummaryFromSessions()
  } catch (error) {
    console.error('Error fetching sessions:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar sesiones',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function fetchSummary () {
  try {
    const { data } = await api.get('user-sessions/summary')
    summary.value = data
  } catch (error) {
    console.error('Error fetching summary:', error)
  }
}

function joinPresenceChannel () {
  if (!echo) return

  presenceChannel = echo.join('sessions')
    .here((users) => {
      onlineUsers.value = users
    })
    .joining((user) => {
      const exists = onlineUsers.value.find(u => u.session_uuid === user.session_uuid)
      if (!exists) {
        onlineUsers.value.push(user)
        summary.value.online++
        summary.value.total_active++
      }
      $q.notify({
        color: 'positive',
        message: `${user.name} se ha conectado`,
        icon: 'person_add',
        timeout: 3000
      })
    })
    .leaving((user) => {
      onlineUsers.value = onlineUsers.value.filter(u => u.session_uuid !== user.session_uuid)
      if (summary.value.online > 0) summary.value.online--
      if (summary.value.total_active > 0) summary.value.total_active--
      $q.notify({
        color: 'grey',
        message: `${user.name} se ha desconectado`,
        icon: 'person_remove',
        timeout: 3000
      })
    })
    .listen('.session.updated', (data) => {
      handleSessionUpdate(data)
    })
    .listen('.module.changed', (data) => {
      handleModuleChange(data)
    })
}

function leavePresenceChannel () {
  if (presenceChannel) {
    echo?.leave('sessions')
    presenceChannel = null
  }
}

function handleSessionUpdate (data) {
  const { action, session } = data

  // Update in sessions list
  const index = sessions.value.findIndex(s => s.session_uuid === session.session_uuid)

  // If force disconnected, remove from list entirely
  if (action === 'force_disconnected') {
    if (index !== -1) {
      sessions.value.splice(index, 1)
    }
  } else if (index !== -1) {
    sessions.value[index] = { ...sessions.value[index], ...session }
  }

  // Update in online users
  const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === session.session_uuid)
  if (action === 'connected' && userIndex === -1) {
    onlineUsers.value.push(session)
  } else if (['disconnected', 'timeout', 'force_disconnected'].includes(action) && userIndex !== -1) {
    onlineUsers.value.splice(userIndex, 1)
  } else if (userIndex !== -1) {
    onlineUsers.value[userIndex] = { ...onlineUsers.value[userIndex], ...session }
  }

  // Update summary locally instead of fetching to avoid loops
  updateSummaryFromSessions()
}

function handleModuleChange (data) {
  // Update my session if it's mine
  if (mySession.value && mySession.value.session_uuid === data.session_uuid) {
    mySession.value.current_module = data.module
    mySession.value.current_url = data.url
  }

  // Update in sessions list
  const index = sessions.value.findIndex(s => s.session_uuid === data.session_uuid)
  if (index !== -1) {
    sessions.value[index].current_module = data.module
    sessions.value[index].current_url = data.url
  }

  // Update in online users
  const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === data.session_uuid)
  if (userIndex !== -1) {
    onlineUsers.value[userIndex].current_module = data.module
  }
}

/**
 * Update summary counts from current sessions data
 */
function updateSummaryFromSessions () {
  const allSessions = mySession.value ? [mySession.value, ...sessions.value] : sessions.value
  summary.value = {
    online: allSessions.filter(s => s.status === 'online').length,
    idle: allSessions.filter(s => s.status === 'idle').length,
    offline: allSessions.filter(s => s.status === 'offline').length,
    total_active: allSessions.filter(s => ['online', 'idle'].includes(s.status)).length
  }
}

function onRequest (props) {
  const { page, rowsPerPage } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  fetchSessions()
}

function debouncedSearch () {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchSessions()
  }, 300)
}

function showSessionDetails (session) {
  detailsDialog.session = session
  detailsDialog.show = true
}

function showUserDetails (user) {
  // Find full session data if available
  const session = sessions.value.find(s => s.session_uuid === user.session_uuid)
  detailsDialog.session = session || user
  detailsDialog.show = true
}

function confirmForceDisconnect (session) {
  confirmDialog.session = session
  confirmDialog.message = `¿Está seguro de que desea forzar la desconexión de ${session.user?.name || session.name}?`
  confirmDialog.show = true
}

async function executeForceDisconnect () {
  if (!confirmDialog.session) return

  try {
    await api.post(`user-sessions/${confirmDialog.session.session_uuid}/force-disconnect`)
    $q.notify({
      color: 'positive',
      message: 'Sesión desconectada exitosamente',
      icon: 'check_circle'
    })
    fetchSessions()
    fetchSummary()
  } catch (error) {
    console.error('Error force disconnecting:', error)
    $q.notify({
      color: 'negative',
      message: 'Error al desconectar sesión',
      icon: 'error'
    })
  }
}

// Helpers
function getStatusColor (status) {
  const colors = {
    online: 'green',
    idle: 'orange',
    offline: 'grey',
    logout: 'red'
  }
  return colors[status] || 'grey'
}

function getStatusIcon (status) {
  const icons = {
    online: 'circle',
    idle: 'schedule',
    offline: 'circle',
    logout: 'logout'
  }
  return icons[status] || 'circle'
}

function getStatusLabel (status) {
  const labels = {
    online: 'En línea',
    idle: 'Inactivo',
    offline: 'Desconectado',
    logout: 'Cerrado'
  }
  return labels[status] || status
}

function getDeviceIcon (deviceType) {
  const icons = {
    desktop: 'computer',
    mobile: 'smartphone',
    tablet: 'tablet'
  }
  return icons[deviceType] || 'devices'
}

function getSessionCardClass (session) {
  return {
    'session-online': session.status === 'online',
    'session-idle': session.status === 'idle',
    'session-offline': session.status === 'offline' || session.status === 'logout'
  }
}

function formatTimeAgo (dateString) {
  if (!dateString) return 'N/A'
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es })
  } catch {
    return 'N/A'
  }
}

function formatDate (dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: es })
  } catch {
    return 'N/A'
  }
}
</script>

<style lang="scss" scoped>
.session-monitor-page {
  max-width: 800px;
  margin: 0 auto;
}

.secondary-text {
  color: var(--q-grey-6);
}

// Stats Chips
.stat-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--q-dark-page);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .stat-value {
    font-size: 18px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    opacity: 0.7;
  }

  &.stat-online {
    border-left: 3px solid #4caf50;
    .stat-value { color: #4caf50; }
  }

  &.stat-idle {
    border-left: 3px solid #ff9800;
    .stat-value { color: #ff9800; }
  }

  &.stat-offline {
    border-left: 3px solid #9e9e9e;
    .stat-value { color: #9e9e9e; }
  }

  &.stat-total {
    border-left: 3px solid var(--q-primary);
    .stat-value { color: var(--q-primary); }
  }
}

// My Session Row
.my-session-row {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--q-primary-rgb), 0.1);
  border: 1px solid rgba(var(--q-primary-rgb), 0.3);

  .my-session-avatar {
    box-shadow: 0 0 0 2px var(--q-primary);
  }

  .session-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    opacity: 0.7;
  }
}

// Filter inputs
.filter-input {
  :deep(.q-field__control) {
    height: 36px;
  }
}

.filter-select {
  min-width: 120px;
  :deep(.q-field__control) {
    height: 36px;
  }
}

// Sessions List
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--q-dark-page);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  &.status-online {
    border-left: 3px solid #4caf50;
  }

  &.status-idle {
    border-left: 3px solid #ff9800;
  }

  &.status-offline {
    border-left: 3px solid #9e9e9e;
  }

  &.status-logout {
    border-left: 3px solid #f44336;
    opacity: 0.6;
  }

  .session-info {
    min-width: 80px;
  }

  .session-actions {
    display: flex;
    gap: 2px;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  &:hover .session-actions {
    opacity: 1;
  }
}

.status-dot {
  font-size: 9px;
  padding: 2px 6px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  opacity: 0.6;
}

// Pulse animation
.pulse-dot {
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

// Table styles
.sessions-table {
  :deep(.q-table__top) {
    padding: 8px;
  }
}

// Light mode overrides
.body--light {
  .stat-chip {
    background: #f5f5f5;
    border-color: #e0e0e0;
  }

  .session-item {
    background: #ffffff;
    border-color: #e0e0e0;

    &:hover {
      background: #fafafa;
      border-color: #bdbdbd;
    }
  }

  .my-session-row {
    background: rgba(var(--q-primary-rgb), 0.08);
  }

  .secondary-text {
    color: #757575;
  }
}

// Dark mode
.body--dark {
  .secondary-text {
    color: #9e9e9e;
  }
}

// Responsive
@media (max-width: 599px) {
  .session-meta {
    display: none !important;
  }

  .session-info {
    display: none;
  }

  .filter-select {
    min-width: 100px;
  }
}
</style>
