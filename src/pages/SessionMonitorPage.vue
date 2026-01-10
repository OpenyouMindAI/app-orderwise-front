<template>
  <q-page class="session-monitor-page">
    <!-- Header -->
    <div class="dashboard-header text-white">
      <div class="header-content">
        <div class="row items-center no-wrap">
          <q-btn flat round icon="arrow_back" class="header-btn" @click="$router.back()" />
          <div class="col q-ml-sm">
            <div class="text-h6 text-weight-bold">Centro de Monitoreo</div>
            <div class="text-caption text-white-7">Sesiones y actividad en tiempo real</div>
          </div>
          <q-chip v-if="isLive" dense color="positive" text-color="white" class="live-chip">
            <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs pulse-icon" />
            EN VIVO
          </q-chip>
          <q-btn flat round icon="refresh" class="header-btn q-ml-sm" :loading="loading" @click="refreshData">
            <q-tooltip>Actualizar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-online">
          <div class="stat-icon">
            <q-icon name="person" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ summary.online }}</div>
            <div class="stat-label">En línea</div>
          </div>
          <div class="stat-trend positive">
            <q-icon name="trending_up" size="14px" />
          </div>
        </div>

        <div class="stat-card stat-idle">
          <div class="stat-icon">
            <q-icon name="schedule" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ summary.idle }}</div>
            <div class="stat-label">Inactivos</div>
          </div>
        </div>

        <div class="stat-card stat-offline">
          <div class="stat-icon">
            <q-icon name="cloud_off" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ summary.offline }}</div>
            <div class="stat-label">Desconectados</div>
          </div>
        </div>

        <div class="stat-card stat-total">
          <div class="stat-icon">
            <q-icon name="groups" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ summary.total_sessions }}</div>
            <div class="stat-label">Total sesiones</div>
          </div>
        </div>

        <div class="stat-card stat-modules">
          <div class="stat-icon">
            <q-icon name="apps" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ moduleStats.total_modules }}</div>
            <div class="stat-label">Módulos activos</div>
          </div>
        </div>

        <div class="stat-card stat-today">
          <div class="stat-icon">
            <q-icon name="today" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ summary.today_sessions }}</div>
            <div class="stat-label">Sesiones hoy</div>
          </div>
        </div>
      </div>

      <!-- My Session Card -->
      <div v-if="mySession" class="my-session-card">
        <div class="my-session-header">
          <q-icon name="verified_user" size="18px" color="primary" />
          <span class="text-weight-medium q-ml-xs">Mi sesión actual</span>
        </div>
        <div class="my-session-content">
          <div class="my-session-avatar">
            <q-avatar size="48px" color="primary" text-color="white">
              <img v-if="mySession.user?.avatar" :src="mySession.user.avatar" />
              <span v-else>{{ getInitial(mySession.user?.name) }}</span>
            </q-avatar>
            <div class="online-indicator"></div>
          </div>
          <div class="my-session-info">
            <div class="my-session-name">{{ mySession.user?.name }}</div>
            <div class="my-session-module">
              <q-icon name="view_module" size="14px" />
              {{ mySession.current_module || 'Dashboard' }}
            </div>
            <div class="my-session-meta">
              <span><q-icon name="computer" size="12px" /> {{ mySession.device_type }}</span>
              <span><q-icon name="public" size="12px" /> {{ mySession.ip_address }}</span>
              <span><q-icon name="access_time" size="12px" /> {{ formatTimeAgo(mySession.connected_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <q-tabs v-model="activeTab" class="dashboard-tabs" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="active" icon="people" label="Sesiones Activas" />
        <q-tab name="history" icon="history" label="Historial Completo" />
        <q-tab name="modules" icon="apps" label="Módulos Visitados" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="tab-panels">
        <!-- Active Sessions Tab -->
        <q-tab-panel name="active" class="q-pa-none">
          <div class="panel-header">
            <q-input
              v-model="filters.search"
              dense
              outlined
              placeholder="Buscar usuario..."
              class="search-field"
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
              class="status-field"
              @update:model-value="fetchSessions"
            />
          </div>

          <div class="sessions-list">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="session-card"
              :class="'status-' + session.status"
              @click="showSessionDetails(session)"
            >
              <div class="session-avatar">
                <q-avatar size="44px">
                  <img v-if="session.user?.avatar" :src="session.user.avatar" />
                  <span v-else class="avatar-text">{{ getInitial(session.user?.name) }}</span>
                </q-avatar>
                <div class="status-dot" :class="session.status"></div>
              </div>

              <div class="session-info">
                <div class="session-user">{{ session.user?.name || 'Usuario' }}</div>
                <div class="session-module">
                  <q-icon name="view_module" size="12px" />
                  {{ session.current_module || 'Dashboard' }}
                </div>
                <div class="session-meta">
                  <span><q-icon name="computer" size="11px" /> {{ session.device_type }}</span>
                  <span class="hide-mobile"><q-icon name="public" size="11px" /> {{ session.ip_address }}</span>
                </div>
              </div>

              <div class="session-status">
                <div class="status-text" :class="session.status">{{ getOnlineStatusText(session) }}</div>
                <div class="session-time" v-if="session.status === 'online' || session.status === 'idle'">
                  Última actividad: {{ formatTimeAgo(session.last_activity_at) }}
                </div>
                <div class="session-time" v-else-if="session.disconnected_at">
                  {{ formatDate(session.disconnected_at) }}
                </div>
              </div>

              <div class="session-actions">
                <q-btn flat dense round size="sm" icon="visibility" @click.stop="showSessionDetails(session)">
                  <q-tooltip>Ver detalles</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="session.status !== 'logout'"
                  flat
                  dense
                  round
                  size="sm"
                  icon="power_settings_new"
                  color="negative"
                  @click.stop="confirmForceDisconnect(session)"
                >
                  <q-tooltip>Desconectar</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div v-if="sessions.length === 0 && !loading" class="empty-state">
              <q-icon name="people_outline" size="64px" />
              <div class="empty-title">No hay sesiones</div>
              <div class="empty-subtitle">No se encontraron sesiones con los filtros actuales</div>
            </div>

            <div v-if="loading" class="loading-state">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </div>
        </q-tab-panel>

        <!-- History Tab -->
        <q-tab-panel name="history" class="q-pa-none">
          <div class="panel-header">
            <q-input
              v-model="historyFilters.search"
              dense
              outlined
              placeholder="Buscar en historial..."
              class="search-field"
              clearable
              @update:model-value="debouncedHistorySearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="18px" />
              </template>
            </q-input>
            <q-input
              v-model="historyFilters.dateFrom"
              dense
              outlined
              type="date"
              class="date-field"
              @update:model-value="fetchHistory"
            />
            <q-input
              v-model="historyFilters.dateTo"
              dense
              outlined
              type="date"
              class="date-field"
              @update:model-value="fetchHistory"
            />
          </div>

          <div class="history-list">
            <div
              v-for="session in historyList"
              :key="session.id"
              class="history-card"
              @click="showSessionDetails(session)"
            >
              <div class="history-avatar">
                <q-avatar size="40px">
                  <img v-if="session.user?.avatar" :src="session.user.avatar" />
                  <span v-else class="avatar-text">{{ getInitial(session.user?.name) }}</span>
                </q-avatar>
              </div>

              <div class="history-info">
                <div class="history-user">{{ session.user?.name || 'Usuario' }}</div>
                <div class="history-meta">
                  <span><q-icon name="login" size="12px" /> {{ formatDate(session.connected_at) }}</span>
                  <span v-if="session.disconnected_at"><q-icon name="logout" size="12px" /> {{ formatDate(session.disconnected_at) }}</span>
                </div>
              </div>

              <div class="history-details">
                <div class="history-device">
                  <q-icon :name="getDeviceIcon(session.device_type)" size="14px" />
                  {{ session.device_type }} / {{ session.browser }}
                </div>
                <div class="history-ip">{{ session.ip_address }}</div>
              </div>

              <div class="history-duration">
                <q-icon name="timer" size="14px" />
                {{ getSessionDuration(session) }}
              </div>
            </div>

            <div v-if="historyList.length === 0 && !loadingHistory" class="empty-state">
              <q-icon name="history" size="64px" />
              <div class="empty-title">Sin historial</div>
              <div class="empty-subtitle">No hay registros de sesiones anteriores</div>
            </div>

            <div v-if="loadingHistory" class="loading-state">
              <q-spinner-dots color="primary" size="40px" />
            </div>

            <div v-if="historyPagination.hasMore" class="load-more">
              <q-btn flat color="primary" label="Cargar más" :loading="loadingHistory" @click="loadMoreHistory" />
            </div>
          </div>
        </q-tab-panel>

        <!-- Modules Tab -->
        <q-tab-panel name="modules" class="q-pa-none">
          <div class="panel-header">
            <q-input
              v-model="moduleFilters.search"
              dense
              outlined
              placeholder="Buscar módulo..."
              class="search-field"
              clearable
              @update:model-value="debouncedModuleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="18px" />
              </template>
            </q-input>
          </div>

          <div class="modules-grid">
            <div
              v-for="module in modulesList"
              :key="module.name"
              class="module-card"
              @click="showModuleDetails(module)"
            >
              <div class="module-icon">
                <q-icon :name="getModuleIcon(module.name)" size="28px" />
              </div>
              <div class="module-info">
                <div class="module-name">{{ module.name }}</div>
                <div class="module-stats">
                  <span><q-icon name="visibility" size="12px" /> {{ module.visits }} visitas</span>
                  <span><q-icon name="people" size="12px" /> {{ module.unique_users }} usuarios</span>
                </div>
              </div>
              <div class="module-trend" :class="module.trend > 0 ? 'positive' : 'negative'">
                <q-icon :name="module.trend > 0 ? 'trending_up' : 'trending_down'" size="16px" />
                {{ Math.abs(module.trend) }}%
              </div>
            </div>

            <div v-if="modulesList.length === 0 && !loadingModules" class="empty-state">
              <q-icon name="apps" size="64px" />
              <div class="empty-title">Sin datos de módulos</div>
              <div class="empty-subtitle">No hay estadísticas de módulos disponibles</div>
            </div>

            <div v-if="loadingModules" class="loading-state">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Session Details Drawer -->
    <q-dialog v-model="detailsDialog.show" position="right" full-height>
      <q-card class="details-drawer">
        <q-bar class="details-header">
          <q-icon name="person" />
          <span class="q-ml-sm">Detalles de sesión</span>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-scroll-area v-if="detailsDialog.session" class="details-content">
          <!-- User Section -->
          <div class="detail-section">
            <div class="user-header">
              <q-avatar size="64px" class="user-avatar">
                <img v-if="detailsDialog.session.user?.avatar" :src="detailsDialog.session.user.avatar" />
                <span v-else class="avatar-text-lg">{{ getInitial(detailsDialog.session.user?.name) }}</span>
              </q-avatar>
              <div class="user-info">
                <div class="user-name">{{ detailsDialog.session.user?.name }}</div>
                <div class="user-email">{{ detailsDialog.session.user?.email }}</div>
                <q-badge :color="getStatusColor(detailsDialog.session.status)" :label="getStatusLabel(detailsDialog.session.status)" />
              </div>
            </div>
          </div>

          <!-- Session Info -->
          <div class="detail-section">
            <div class="section-title">
              <q-icon name="info" size="18px" />
              Información de sesión
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Dispositivo</div>
                <div class="info-value">
                  <q-icon :name="getDeviceIcon(detailsDialog.session.device_type)" size="16px" />
                  {{ detailsDialog.session.device_type }}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Navegador</div>
                <div class="info-value">{{ detailsDialog.session.browser }} {{ detailsDialog.session.browser_version }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Sistema</div>
                <div class="info-value">{{ detailsDialog.session.platform }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">IP</div>
                <div class="info-value">{{ detailsDialog.session.ip_address }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Conectado</div>
                <div class="info-value">{{ formatDate(detailsDialog.session.connected_at) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Última actividad</div>
                <div class="info-value">{{ formatTimeAgo(detailsDialog.session.last_activity_at) }}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Módulo actual</div>
                <div class="info-value">{{ detailsDialog.session.current_module || 'Dashboard' }}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Session UUID</div>
                <div class="info-value text-caption" style="word-break: break-all;">{{ detailsDialog.session.session_uuid }}</div>
              </div>
            </div>
          </div>

          <!-- Navigation History -->
          <div class="detail-section">
            <div class="section-title">
              <q-icon name="timeline" size="18px" />
              Historial de navegación
            </div>
            <div v-if="loadingNavigation" class="text-center q-pa-md">
              <q-spinner size="24px" color="primary" />
            </div>
            <div v-else-if="detailsDialog.navigation.length > 0" class="navigation-timeline">
              <div
                v-for="(nav, index) in detailsDialog.navigation"
                :key="nav.id"
                class="nav-entry"
                :class="{ 'is-current': index === 0 }"
              >
                <div class="nav-dot"></div>
                <div class="nav-line" v-if="index < detailsDialog.navigation.length - 1"></div>
                <div class="nav-content">
                  <div class="nav-module">{{ nav.module_name }}</div>
                  <div class="nav-url">{{ nav.url }}</div>
                  <div class="nav-time">
                    <q-icon name="schedule" size="12px" />
                    {{ formatDateTime(nav.entered_at) }}
                    <span v-if="nav.duration_seconds" class="nav-duration">
                      ({{ formatDuration(nav.duration_seconds) }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey q-pa-md">
              Sin historial de navegación
            </div>
          </div>
        </q-scroll-area>

        <q-card-actions class="details-actions">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn
            v-if="detailsDialog.session?.status !== 'logout'"
            color="negative"
            icon="power_settings_new"
            label="Desconectar"
            @click="confirmForceDisconnect(detailsDialog.session); detailsDialog.show = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Module Details Dialog -->
    <q-dialog v-model="moduleDialog.show">
      <q-card class="module-dialog">
        <q-card-section class="module-dialog-header">
          <div class="text-h6">
            <q-icon :name="getModuleIcon(moduleDialog.module?.name)" class="q-mr-sm" />
            {{ moduleDialog.module?.name }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="module-users-list">
            <div v-for="user in moduleDialog.users" :key="user.id" class="module-user">
              <q-avatar size="32px">
                <img v-if="user.avatar" :src="user.avatar" />
                <span v-else class="avatar-text-sm">{{ getInitial(user.name) }}</span>
              </q-avatar>
              <div class="module-user-info">
                <div class="module-user-name">{{ user.name }}</div>
                <div class="module-user-time">{{ formatTimeAgo(user.last_visit) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Dialog -->
    <q-dialog v-model="confirmDialog.show" persistent>
      <q-card class="confirm-dialog">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar icon="warning" color="warning" text-color="white" size="48px" />
          <div class="col">
            <div class="text-h6">Confirmar desconexión</div>
            <div class="text-body2">{{ confirmDialog.message }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="negative" label="Desconectar" @click="executeForceDisconnect" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays, differenceInSeconds } from 'date-fns'
import { es } from 'date-fns/locale'

const $q = useQuasar()

// State
const activeTab = ref('active')
const sessions = ref([])
const historyList = ref([])
const modulesList = ref([])
const mySession = ref(null)
const onlineUsers = ref([])
const loading = ref(false)
const loadingHistory = ref(false)
const loadingModules = ref(false)
const loadingNavigation = ref(false)
const isLive = ref(true)

const summary = ref({
  online: 0,
  idle: 0,
  offline: 0,
  total_sessions: 0,
  today_sessions: 0
})

const moduleStats = ref({
  total_modules: 0
})

const filters = ref({
  search: '',
  status: 'all'
})

const historyFilters = ref({
  search: '',
  dateFrom: '',
  dateTo: ''
})

const moduleFilters = ref({
  search: ''
})

const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const historyPagination = ref({
  page: 1,
  hasMore: false
})

const detailsDialog = reactive({
  show: false,
  session: null,
  navigation: []
})

const moduleDialog = reactive({
  show: false,
  module: null,
  users: []
})

const confirmDialog = reactive({
  show: false,
  message: '',
  session: null
})

let presenceChannel = null
let searchTimeout = null
let historySearchTimeout = null
let moduleSearchTimeout = null

const statusOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'En línea', value: 'online' },
  { label: 'Inactivos', value: 'idle' },
  { label: 'Desconectados', value: 'offline' },
  { label: 'Cerrados', value: 'logout' }
]

// Lifecycle
onMounted(() => {
  fetchSessions()
  fetchSummary()
  fetchModuleStats()
  joinPresenceChannel()
})

onUnmounted(() => {
  leavePresenceChannel()
})

// Methods
function refreshData () {
  fetchSessions()
  fetchSummary()
  if (activeTab.value === 'history') fetchHistory()
  if (activeTab.value === 'modules') fetchModules()
}

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
    const myUuid = localStorage.getItem('session_uuid')

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
    $q.notify({ color: 'negative', message: 'Error al cargar sesiones', icon: 'error' })
  } finally {
    loading.value = false
  }
}

async function fetchSummary () {
  try {
    const { data } = await api.get('user-sessions/summary')
    summary.value = { ...summary.value, ...data }
  } catch (error) {
    console.error('Error fetching summary:', error)
  }
}

async function fetchModuleStats () {
  try {
    const { data } = await api.get('user-sessions/module-stats')
    moduleStats.value = data
  } catch (error) {
    console.error('Error fetching module stats:', error)
  }
}

async function fetchHistory () {
  loadingHistory.value = true
  try {
    const { data } = await api.get('user-sessions/history', {
      params: {
        page: historyPagination.value.page,
        per_page: 20,
        search: historyFilters.value.search,
        date_from: historyFilters.value.dateFrom,
        date_to: historyFilters.value.dateTo
      }
    })
    if (historyPagination.value.page === 1) {
      historyList.value = data.data || []
    } else {
      historyList.value.push(...(data.data || []))
    }
    historyPagination.value.hasMore = data.current_page < data.last_page
  } catch (error) {
    console.error('Error fetching history:', error)
  } finally {
    loadingHistory.value = false
  }
}

async function fetchModules () {
  loadingModules.value = true
  try {
    const { data } = await api.get('user-sessions/modules', {
      params: { search: moduleFilters.value.search }
    })
    modulesList.value = data.modules || []
  } catch (error) {
    console.error('Error fetching modules:', error)
  } finally {
    loadingModules.value = false
  }
}

function loadMoreHistory () {
  historyPagination.value.page++
  fetchHistory()
}

function joinPresenceChannel () {
  if (!echo) return

  presenceChannel = echo.join('sessions')
    .here((users) => { onlineUsers.value = users })
    .joining((user) => {
      const exists = onlineUsers.value.find(u => u.session_uuid === user.session_uuid)
      if (!exists) {
        onlineUsers.value.push(user)
        summary.value.online++
      }
      $q.notify({ color: 'positive', message: `${user.name} se ha conectado`, icon: 'person_add', timeout: 3000 })
    })
    .leaving((user) => {
      onlineUsers.value = onlineUsers.value.filter(u => u.session_uuid !== user.session_uuid)
      if (summary.value.online > 0) summary.value.online--
      $q.notify({ color: 'grey', message: `${user.name} se ha desconectado`, icon: 'person_remove', timeout: 3000 })
    })
    .listen('.session.updated', handleSessionUpdate)
    .listen('.module.changed', handleModuleChange)
}

function leavePresenceChannel () {
  if (presenceChannel) {
    echo?.leave('sessions')
    presenceChannel = null
  }
}

function handleSessionUpdate (data) {
  const { action, session } = data
  const index = sessions.value.findIndex(s => s.session_uuid === session.session_uuid)

  if (action === 'force_disconnected') {
    if (index !== -1) sessions.value.splice(index, 1)
  } else if (index !== -1) {
    sessions.value[index] = { ...sessions.value[index], ...session }
  }

  const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === session.session_uuid)
  if (action === 'connected' && userIndex === -1) {
    onlineUsers.value.push(session)
  } else if (['disconnected', 'timeout', 'force_disconnected'].includes(action) && userIndex !== -1) {
    onlineUsers.value.splice(userIndex, 1)
  } else if (userIndex !== -1) {
    onlineUsers.value[userIndex] = { ...onlineUsers.value[userIndex], ...session }
  }

  updateSummaryFromSessions()
}

function handleModuleChange (data) {
  if (mySession.value && mySession.value.session_uuid === data.session_uuid) {
    mySession.value.current_module = data.module
    mySession.value.current_url = data.url
  }

  const index = sessions.value.findIndex(s => s.session_uuid === data.session_uuid)
  if (index !== -1) {
    sessions.value[index].current_module = data.module
    sessions.value[index].current_url = data.url
  }

  const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === data.session_uuid)
  if (userIndex !== -1) {
    onlineUsers.value[userIndex].current_module = data.module
  }
}

function updateSummaryFromSessions () {
  const allSessions = mySession.value ? [mySession.value, ...sessions.value] : sessions.value
  summary.value.online = allSessions.filter(s => s.status === 'online').length
  summary.value.idle = allSessions.filter(s => s.status === 'idle').length
  summary.value.offline = allSessions.filter(s => s.status === 'offline').length
}

function debouncedSearch () {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchSessions(), 300)
}

function debouncedHistorySearch () {
  if (historySearchTimeout) clearTimeout(historySearchTimeout)
  historySearchTimeout = setTimeout(() => {
    historyPagination.value.page = 1
    fetchHistory()
  }, 300)
}

function debouncedModuleSearch () {
  if (moduleSearchTimeout) clearTimeout(moduleSearchTimeout)
  moduleSearchTimeout = setTimeout(() => fetchModules(), 300)
}

async function showSessionDetails (session) {
  detailsDialog.session = session
  detailsDialog.navigation = []
  detailsDialog.show = true

  loadingNavigation.value = true
  try {
    const { data } = await api.get(`user-sessions/${session.session_uuid}/navigation`)
    detailsDialog.navigation = data.history || []
  } catch (error) {
    console.error('Error fetching navigation:', error)
  } finally {
    loadingNavigation.value = false
  }
}

async function showModuleDetails (module) {
  moduleDialog.module = module
  moduleDialog.users = []
  moduleDialog.show = true

  try {
    const { data } = await api.get(`user-sessions/modules/${encodeURIComponent(module.name)}/users`)
    moduleDialog.users = data.users || []
  } catch (error) {
    console.error('Error fetching module users:', error)
  }
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
    $q.notify({ color: 'positive', message: 'Sesión desconectada exitosamente', icon: 'check_circle' })
    fetchSessions()
    fetchSummary()
  } catch (error) {
    console.error('Error force disconnecting:', error)
    $q.notify({ color: 'negative', message: 'Error al desconectar sesión', icon: 'error' })
  }
}

// Helpers
function getStatusColor (status) {
  const colors = { online: 'positive', idle: 'warning', offline: 'grey', logout: 'negative' }
  return colors[status] || 'grey'
}

function getStatusLabel (status) {
  const labels = { online: 'En línea', idle: 'Inactivo', offline: 'Desconectado', logout: 'Cerrado' }
  return labels[status] || status
}

function getDeviceIcon (deviceType) {
  const icons = { desktop: 'computer', mobile: 'smartphone', tablet: 'tablet' }
  return icons[deviceType] || 'devices'
}

function getModuleIcon (moduleName) {
  const icons = {
    Dashboard: 'dashboard',
    Facturación: 'receipt',
    Productos: 'inventory_2',
    Clientes: 'people',
    Reportes: 'assessment',
    Configuración: 'settings'
  }
  return icons[moduleName] || 'view_module'
}

function getInitial (name) {
  return (name || 'U').charAt(0).toUpperCase()
}

function getOnlineStatusText (session) {
  if (!session) return ''
  
  // Usuario activamente en línea
  if (session.status === 'online') return 'En línea'

  const now = new Date()
  
  // Para usuarios inactivos, usar last_activity_at
  if (session.status === 'idle') {
    const lastActivity = session.last_activity_at
    if (!lastActivity) return 'Inactivo'

    const lastDate = new Date(lastActivity)
    const diffMinutes = differenceInMinutes(now, lastDate)
    const diffHours = differenceInHours(now, lastDate)
    const diffDays = differenceInDays(now, lastDate)

    if (diffMinutes < 1) return 'Inactivo'
    if (diffMinutes < 60) return `Inactivo hace ${diffMinutes} min`
    if (diffHours < 24) return `Inactivo hace ${diffHours} h`
    return `Inactivo hace ${diffDays} d`
  }

  // Para usuarios desconectados (offline/logout), usar disconnected_at o last_activity_at
  if (session.status === 'offline' || session.status === 'logout') {
    const disconnectTime = session.disconnected_at || session.last_activity_at
    if (!disconnectTime) return 'Desconectado'

    const disconnectDate = new Date(disconnectTime)
    const diffMinutes = differenceInMinutes(now, disconnectDate)
    const diffHours = differenceInHours(now, disconnectDate)
    const diffDays = differenceInDays(now, disconnectDate)

    if (diffMinutes < 1) return 'Desconectado hace un momento'
    if (diffMinutes < 60) return `Desconectado hace ${diffMinutes} min`
    if (diffHours < 24) return `Desconectado hace ${diffHours} h`
    return `Desconectado hace ${diffDays} d`
  }

  // Fallback para otros estados
  return getStatusLabel(session.status)
}

function getSessionDuration (session) {
  if (!session.connected_at) return 'N/A'
  const start = new Date(session.connected_at)
  const end = session.disconnected_at ? new Date(session.disconnected_at) : new Date()
  const seconds = differenceInSeconds(end, start)

  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}

function formatDuration (seconds) {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
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
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return 'N/A'
  }
}

function formatDateTime (dateString) {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: es })
  } catch {
    return ''
  }
}
</script>

<style lang="scss" scoped>
.session-monitor-page {
  min-height: 100vh;
  background: var(--q-dark-page);
}

// Header
.dashboard-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, color-mix(in srgb, var(--q-primary) 80%, black) 100%);
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-btn {
  color: white;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.live-chip {
  font-size: 11px;
  .pulse-icon {
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

// Content
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--q-dark);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-online .stat-icon { background: linear-gradient(135deg, #4caf50, #2e7d32); }
.stat-idle .stat-icon { background: linear-gradient(135deg, #ff9800, #f57c00); }
.stat-offline .stat-icon { background: linear-gradient(135deg, #9e9e9e, #616161); }
.stat-total .stat-icon { background: linear-gradient(135deg, var(--q-primary), color-mix(in srgb, var(--q-primary) 70%, black)); }
.stat-modules .stat-icon { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }
.stat-today .stat-icon { background: linear-gradient(135deg, #00bcd4, #0097a7); }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--q-grey-6);
  margin-top: 4px;
}

.stat-trend {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  &.positive { color: #4caf50; }
  &.negative { color: #f44336; }
}

// My Session Card
.my-session-card {
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.15), rgba(var(--q-primary-rgb), 0.05));
  border: 1px solid rgba(var(--q-primary-rgb), 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.my-session-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--q-grey-5);
}

.my-session-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.my-session-avatar {
  position: relative;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #4caf50;
  border-radius: 50%;
  border: 3px solid var(--q-dark);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.my-session-name {
  font-size: 16px;
  font-weight: 600;
}

.my-session-module {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--q-primary);
  margin-top: 4px;
}

.my-session-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--q-grey-6);

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// Tabs
.dashboard-tabs {
  background: var(--q-dark);
  border-radius: 12px 12px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.tab-panels {
  background: var(--q-dark);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  border-radius: 0 0 12px 12px;
  min-height: 400px;
}

// Panel Header
.panel-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.search-field {
  flex: 1;
  min-width: 200px;
  :deep(.q-field__control) { height: 36px; }
}

.status-field, .date-field {
  width: 140px;
  :deep(.q-field__control) { height: 36px; }
}

// Sessions List
.sessions-list, .history-list {
  padding: 8px;
}

.session-card, .history-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &.status-online { border-left: 3px solid #4caf50; }
  &.status-idle { border-left: 3px solid #ff9800; }
  &.status-offline { border-left: 3px solid #9e9e9e; }
  &.status-logout { border-left: 3px solid #f44336; opacity: 0.7; }
}

.session-avatar, .history-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--q-primary);
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.avatar-text-lg { @extend .avatar-text; font-size: 24px; }
.avatar-text-sm { @extend .avatar-text; font-size: 12px; }

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--q-dark);

  &.online { background: #4caf50; }
  &.idle { background: #ff9800; }
  &.offline { background: #9e9e9e; }
  &.logout { background: #f44336; }
}

.session-info, .history-info {
  flex: 1;
  min-width: 0;
}

.session-user, .history-user {
  font-weight: 600;
  font-size: 14px;
}

.session-module {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--q-primary);
  margin-top: 2px;
}

.session-meta, .history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--q-grey-7);

  span {
    display: flex;
    align-items: center;
    gap: 3px;
  }
}

.session-status {
  text-align: right;
  min-width: 100px;
}

.status-text {
  font-size: 12px;
  font-weight: 600;
  &.online { color: #4caf50; }
  &.idle { color: #ff9800; }
  &.offline, &.logout { color: var(--q-grey-6); }
}

.session-time {
  font-size: 11px;
  color: var(--q-grey-7);
  margin-top: 2px;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.session-card:hover .session-actions,
.history-card:hover .session-actions {
  opacity: 1;
}

.history-details {
  text-align: right;
  min-width: 120px;
}

.history-device {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.history-ip {
  font-size: 11px;
  color: var(--q-grey-7);
}

.history-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--q-grey-6);
  min-width: 80px;
  justify-content: flex-end;
}

// Modules Grid
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 16px;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
  }
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--q-primary), color-mix(in srgb, var(--q-primary) 70%, black));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.module-name {
  font-weight: 600;
  font-size: 14px;
}

.module-stats {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--q-grey-6);

  span {
    display: flex;
    align-items: center;
    gap: 3px;
  }
}

.module-trend {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  &.positive { color: #4caf50; }
  &.negative { color: #f44336; }
}

// Empty & Loading States
.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: var(--q-grey-6);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
}

.empty-subtitle {
  font-size: 13px;
  color: var(--q-grey-7);
  margin-top: 4px;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

// Details Drawer
.details-drawer {
  width: 420px;
  max-width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--q-dark);
}

.details-header {
  background: var(--q-primary);
  color: white;
}

.details-content {
  flex: 1;
  height: calc(100% - 100px);
}

.detail-section {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  border: 3px solid var(--q-primary);
}

.user-name {
  font-size: 18px;
  font-weight: 600;
}

.user-email {
  font-size: 13px;
  color: var(--q-grey-6);
  margin-bottom: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--q-grey-5);
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  &.full-width { grid-column: span 2; }
}

.info-label {
  font-size: 11px;
  color: var(--q-grey-7);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.info-value {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

// Navigation Timeline
.navigation-timeline {
  position: relative;
}

.nav-entry {
  position: relative;
  padding-left: 24px;
  padding-bottom: 16px;

  &.is-current .nav-dot {
    background: var(--q-primary);
    box-shadow: 0 0 0 4px rgba(var(--q-primary-rgb), 0.2);
  }
}

.nav-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--q-grey-7);
}

.nav-line {
  position: absolute;
  left: 5px;
  top: 18px;
  width: 2px;
  height: calc(100% - 10px);
  background: rgba(255, 255, 255, 0.1);
}

.nav-module {
  font-weight: 600;
  font-size: 13px;
}

.nav-url {
  font-size: 11px;
  color: var(--q-grey-7);
  word-break: break-all;
}

.nav-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--q-grey-6);
  margin-top: 4px;
}

.nav-duration {
  color: var(--q-primary);
}

.details-actions {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

// Module Dialog
.module-dialog {
  min-width: 320px;
  background: var(--q-dark);
}

.module-dialog-header {
  background: var(--q-primary);
  color: white;
}

.module-users-list {
  max-height: 300px;
  overflow-y: auto;
}

.module-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child { border-bottom: none; }
}

.module-user-name {
  font-weight: 500;
  font-size: 13px;
}

.module-user-time {
  font-size: 11px;
  color: var(--q-grey-7);
}

// Confirm Dialog
.confirm-dialog {
  min-width: 340px;
  background: var(--q-dark);
}

// Light Mode
.body--light {
  .session-monitor-page { background: #f5f5f5; }
  .stat-card, .dashboard-tabs, .tab-panels, .details-drawer, .module-dialog, .confirm-dialog { background: white; border-color: #e0e0e0; }
  .my-session-card { background: rgba(var(--q-primary-rgb), 0.08); }
  .session-card, .history-card, .module-card { background: white; border-color: #e0e0e0; &:hover { background: #fafafa; } }
  .status-dot, .online-indicator { border-color: white; }
  .nav-line { background: #e0e0e0; }
}

// Responsive
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .my-session-meta { display: none; }
  .hide-mobile { display: none !important; }
  .session-status { display: none; }
  .session-actions { opacity: 1; }
  .history-details { display: none; }
  .history-duration { display: none; }
  .details-drawer { width: 100vw; }
  .panel-header { flex-direction: column; }
  .search-field { min-width: 100%; }
  .status-field, .date-field { width: 100%; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { padding: 12px; }
  .stat-icon { width: 40px; height: 40px; }
  .stat-value { font-size: 22px; }
  .modules-grid { grid-template-columns: 1fr; }
}
</style>
