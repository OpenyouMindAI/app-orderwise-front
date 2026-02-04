<template>
  <div class="sync-container">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Persistent Sync Banner (shows when sync is in progress and user returns) -->
    <div v-if="showSyncBanner && !showSyncComplete" class="sync-banner">
      <div class="banner-content">
        <q-spinner-cube color="white" size="24px" />
        <div class="banner-text">
          <span class="banner-title">Sincronización en progreso</span>
          <span class="banner-progress">{{ syncStatus.progress }}% completado</span>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="sync-card" :class="{ 'sync-active': isSyncing }">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <q-spinner-orbit color="primary" size="60px" />
        <p class="loading-text">Conectando con el servidor...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <q-icon name="error_outline" size="64px" color="negative" />
        </div>
        <h2 class="error-title">Error de Conexión</h2>
        <p class="error-message">{{ error }}</p>
        <q-btn
          label="Reintentar"
          color="primary"
          unelevated
          no-caps
          class="retry-btn"
          @click="fetchCompanyInfo"
        >
          <q-icon name="refresh" class="q-mr-sm" />
        </q-btn>
      </div>

      <!-- Sync Complete State -->
      <div v-else-if="showSyncComplete" class="complete-state">
        <div class="success-animation">
          <div class="checkmark-circle">
            <q-icon name="check" size="48px" color="white" />
          </div>
        </div>
        <h2 class="complete-title">¡Sincronización Completada!</h2>
        <p class="complete-subtitle">Los datos de tu empresa han sido migrados exitosamente</p>

        <!-- Errors Summary Hidden as requested -->
        <!-- <div v-if="syncStatus.errors_count > 0" class="errors-summary">
          <div class="errors-header">
            <q-icon name="warning" color="warning" size="20px" />
            <span>{{ syncStatus.errors_count }} advertencia(s) durante la sincronización</span>
          </div>
          <q-expansion-item
            label="Ver detalles"
            dense
            class="errors-expansion"
          >
            <div class="errors-list">
              <div v-for="(err, index) in syncStatus.errors.slice(0, 5)" :key="index" class="error-item">
                <strong>{{ err.table }}:</strong> {{ err.message }}
              </div>
              <div v-if="syncStatus.errors.length > 5" class="more-errors">
                Y {{ syncStatus.errors.length - 5 }} errores más...
              </div>
            </div>
          </q-expansion-item>
        </div> -->

        <q-btn
          label="Ir al Login"
          color="primary"
          unelevated
          no-caps
          size="lg"
          class="login-btn"
          @click="goToLogin"
        >
          <q-icon name="login" class="q-ml-sm" />
        </q-btn>
      </div>

      <!-- Company Info & Sync State -->
      <template v-else-if="company">
        <!-- Header -->
        <div class="card-header">
          <div class="header-icon">
            <q-icon name="sync" size="32px" color="white" />
          </div>
          <h1 class="card-title">Migración de Datos</h1>
          <p class="card-subtitle">Sincroniza la información de tu empresa</p>
        </div>

        <!-- Company Info -->
        <div class="company-info">
          <div class="info-row">
            <div class="info-label">
              <q-icon name="business" size="18px" />
              <span>Empresa</span>
            </div>
            <div class="info-value">{{ company.name }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">
              <q-icon name="badge" size="18px" />
              <span>Documento</span>
            </div>
            <div class="info-value">{{ company.document_number || 'No especificado' }}</div>
          </div>
          <div v-if="company.email" class="info-row">
            <div class="info-label">
              <q-icon name="email" size="18px" />
              <span>Email</span>
            </div>
            <div class="info-value">{{ company.email }}</div>
          </div>
        </div>

        <!-- Already Synced Warning -->
        <div v-if="company.already_synced && !isSyncing" class="already-synced">
          <q-icon name="info" size="20px" color="info" />
          <span>Esta empresa ya ha sido sincronizada previamente</span>
        </div>

        <!-- Sync Progress (visible during sync) -->
        <div v-if="isSyncing" class="sync-progress">
          <div class="progress-header">
            <span class="progress-label">Sincronizando datos...</span>
            <span class="progress-percentage">{{ syncStatus.progress }}%</span>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: syncStatus.progress + '%' }">
              <div class="progress-glow"></div>
            </div>
          </div>

          <div class="sync-details">
            <div class="current-table" v-if="syncStatus.current_table">
              <q-spinner-dots color="primary" size="16px" />
              <span>Procesando: <strong>{{ formatTableName(syncStatus.current_table) }}</strong></span>
            </div>
            <div class="tables-count">
              <q-icon name="storage" size="16px" />
              <span>{{ syncStatus.completed_tables }} de {{ syncStatus.total_tables }} tablas</span>
            </div>
          </div>

          <!-- Table Status Grid -->
          <div v-if="Object.keys(syncStatus.table_status || {}).length > 0" class="table-status-grid">
            <div
              v-for="(status, table) in syncStatus.table_status"
              :key="table"
              class="table-status-item"
              :class="status.status"
            >
              <q-icon
                :name="getTableStatusIcon(status.status)"
                size="14px"
                :color="getTableStatusColor(status.status)"
              />
              <span>{{ formatTableName(table) }}</span>
            </div>
          </div>
        </div>

        <!-- Sync Button -->
        <q-btn
          v-if="!isSyncing"
          :label="company.already_synced ? 'Re-sincronizar' : 'Iniciar Sincronización'"
          color="primary"
          unelevated
          no-caps
          size="lg"
          class="sync-btn"
          :loading="startingSyncLoading"
          @click="startSync"
        >
          <q-icon name="sync" class="q-mr-sm" />
        </q-btn>

        <!-- Cancel/Back Button during sync -->
        <div v-if="isSyncing" class="sync-warning">
          <q-icon name="info" size="16px" color="info" />
          <span>La sincronización continúa en segundo plano. Puedes cerrar esta página y volver más tarde.</span>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="footer-info">
      <span>Powered by</span>
      <img :src="qBitsLogo.black" alt="QBits" class="footer-logo" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { qBitsLogo } from 'src/const/mixins'
import { Notify } from 'quasar'
import { echo } from 'src/boot/pusher'

/**
 * Company ID from route parameters
 * @type {import('vue').Ref<string>}
 */
const route = useRoute()
const router = useRouter()
const companyId = ref(route.params.company_id)

/**
 * Loading state for initial fetch
 * @type {import('vue').Ref<boolean>}
 */
const loading = ref(true)

/**
 * Loading state for starting sync
 * @type {import('vue').Ref<boolean>}
 */
const startingSyncLoading = ref(false)

/**
 * Error message
 * @type {import('vue').Ref<string|null>}
 */
const error = ref(null)

/**
 * Company information
 * @type {import('vue').Ref<object|null>}
 */
const company = ref(null)

/**
 * Synchronization status
 * @type {import('vue').Ref<object>}
 */
const syncStatus = ref({
  status: 'not_started',
  progress: 0,
  current_table: null,
  total_tables: 0,
  completed_tables: 0,
  errors: [],
  errors_count: 0,
  table_status: {}
})

/**
 * Polling interval reference
 * @type {import('vue').Ref<number|null>}
 */
const pollingInterval = ref(null)

/**
 * Check if sync is currently in progress
 * @type {import('vue').ComputedRef<boolean>}
 */
const isSyncing = computed(() => {
  return syncStatus.value.status === 'running' || syncStatus.value.status === 'pending'
})

/**
 * Check if sync is complete
 * @type {import('vue').ComputedRef<boolean>}
 */
const showSyncComplete = computed(() => {
  return syncStatus.value.status === 'completed'
})

/**
 * Show persistent banner when sync is in progress
 * @type {import('vue').ComputedRef<boolean>}
 */
const showSyncBanner = computed(() => {
  return isSyncing.value && syncStatus.value.progress > 0
})

/**
 * Fetch company information from API
 * @returns {Promise<void>}
 */
const fetchCompanyInfo = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/sync-company/${companyId.value}/info`)

    if (response.data.success) {
      company.value = response.data.data
      // Also fetch current sync status
      await fetchSyncStatus()
    } else {
      error.value = response.data.message || 'Error al obtener información de la empresa'
    }
  } catch (err) {
    console.error('Error fetching company info:', err)
    error.value = err.response?.data?.message || 'No se pudo conectar con el servidor de migración'
  } finally {
    loading.value = false
  }
}

/**
 * Fetch current synchronization status
 * @returns {Promise<void>}
 */
const fetchSyncStatus = async () => {
  try {
    const response = await api.get(`/sync-company/${companyId.value}/status`)

    if (response.data.success) {
      syncStatus.value = response.data.data

      // Setup real-time listener if not already active
      setupRealTimeListener()

      // If sync completed, stop listening
      if (syncStatus.value.status === 'completed' || syncStatus.value.status === 'failed') {
        stopListenRealTime()
      }
    }
  } catch (err) {
    console.error('Error fetching sync status:', err)
  }
}

/**
 * Flag to check if listener is active
 */
const isListening = ref(false)

/**
 * Setup real-time listener using Laravel Echo
 */
const setupRealTimeListener = () => {
  if (isListening.value || !echo) return

  console.log(`Setting up real-time listener for company-sync.${companyId.value}`)

  echo.channel(`company-sync.${companyId.value}`)
    .listen('.SyncStatusUpdated', (e) => {
      console.log('Real-time sync update received:', e)
      if (e.syncStatus) {
        syncStatus.value = e.syncStatus

        // If completed through real-time, cleanup
        if (e.syncStatus.status === 'completed' || e.syncStatus.status === 'failed') {
          stopListenRealTime()
        }
      }
    })

  isListening.value = true
}

/**
 * Stop listening to real-time events
 */
const stopListenRealTime = () => {
  if (isListening.value && echo) {
    echo.leave(`company-sync.${companyId.value}`)
    isListening.value = false
  }
}

/**
 * Start data synchronization
 * @returns {Promise<void>}
 */
const startSync = async () => {
  startingSyncLoading.value = true

  try {
    const response = await api.post(`/sync-company/${companyId.value}/start`)

    if (response.data.success) {
      syncStatus.value = response.data.data
      Notify.create({
        type: 'positive',
        message: 'Sincronización iniciada',
        icon: 'sync'
      })
      // setupRealTimeListener is already called within fetchSyncStatus or initially
      setupRealTimeListener()
    } else {
      Notify.create({
        type: 'negative',
        message: response.data.message || 'Error al iniciar sincronización',
        icon: 'error'
      })
    }
  } catch (err) {
    console.error('Error starting sync:', err)
    Notify.create({
      type: 'negative',
      message: err.response?.data?.message || 'Error al iniciar sincronización',
      icon: 'error'
    })
  } finally {
    startingSyncLoading.value = false
  }
}

/**
 * Navigate to login page
 * @returns {void}
 */
const goToLogin = () => {
  router.push({ name: 'Login' })
}

/**
 * Table name translations
 */
const tableTranslations = {
  branch_offices: 'Sucursales',
  categories: 'Categorías',
  products: 'Productos',
  living_rooms: 'Salones / Áreas',
  tables: 'Mesas',
  printers: 'Impresoras',
  cashboxes: 'Cajas Registradoras',
  cashbox_user: 'Sesiones de Caja',
  company_configs: 'Configuraciones',
  product_bundles: 'Combos de Productos',
  invoices: 'Facturas',
  invoice_product: 'Contenido de Facturas',
  invoice_payments: 'Pagos de Facturas',
  electronic_invoices: 'Facturación Electrónica',
  invoice_discounts: 'Descuentos de Facturas',
  invoice_table: 'Mesas en Facturas',
  cashflows: 'Movimientos de Caja',
  branch_office_stock_products: 'Stock de Productos',
  users: 'Usuarios'
}

/**
 * Format table name for display
 * @param {string} tableName - Raw table name
 * @returns {string} Formatted table name
 */
const formatTableName = (tableName) => {
  if (!tableName) return ''
  if (tableTranslations[tableName]) {
    return tableTranslations[tableName]
  }
  return tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Get icon for table status
 * @param {string} status - Table sync status
 * @returns {string} Icon name
 */
const getTableStatusIcon = (status) => {
  const icons = {
    completed: 'check_circle',
    running: 'sync',
    failed: 'error',
    pending: 'schedule'
  }
  return icons[status] || 'radio_button_unchecked'
}

/**
 * Get color for table status
 * @param {string} status - Table sync status
 * @returns {string} Color name
 */
const getTableStatusColor = (status) => {
  const colors = {
    completed: 'positive',
    running: 'primary',
    failed: 'negative',
    pending: 'grey'
  }
  return colors[status] || 'grey'
}

// Lifecycle hooks
onMounted(() => {
  fetchCompanyInfo()
})

onUnmounted(() => {
  stopListenRealTime()
})
</script>

<style scoped>
/* Container */
.sync-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: floatShape 25s ease-in-out infinite;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -150px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  bottom: -100px;
  right: -100px;
  animation-delay: 5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes floatShape {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Persistent Banner */
.sync-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  animation: slideDown 0.3s ease-out;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.banner-text {
  display: flex;
  flex-direction: column;
  color: white;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
}

.banner-progress {
  font-size: 12px;
  opacity: 0.9;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Main Card */
.sync-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 25px 70px rgba(102, 126, 234, 0.35),
    0 10px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  animation: cardEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition: all 0.3s ease;
}

.sync-card.sync-active {
  box-shadow:
    0 25px 70px rgba(102, 126, 234, 0.45),
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 0 2px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-text {
  margin-top: 20px;
  color: #6b7280;
  font-size: 14px;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  margin-bottom: 16px;
}

.error-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.error-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.retry-btn {
  border-radius: 12px;
  padding: 10px 24px;
}

/* Complete State */
.complete-state {
  text-align: center;
  padding: 20px 0;
}

.success-animation {
  margin-bottom: 24px;
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.complete-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.complete-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.errors-summary {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.errors-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
}

.errors-expansion {
  margin-top: 8px;
}

.errors-list {
  padding: 8px 0;
}

.error-item {
  font-size: 12px;
  color: #6b7280;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.more-errors {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
  padding-top: 8px;
}

.login-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.45);
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Card Header */
.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 6px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Company Info */
.company-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  text-align: right;
}

/* Already Synced */
.already-synced {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #1d4ed8;
}

/* Sync Progress */
.sync-progress {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-bar-container {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.sync-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.current-table,
.tables-count {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Table Status Grid */
.table-status-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.table-status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.table-status-item.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.table-status-item.running {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  animation: pulse 1.5s infinite;
}

.table-status-item.failed {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Sync Button */
.sync-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
  transition: all 0.3s ease;
}

.sync-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(102, 126, 234, 0.45);
}

.sync-btn:active {
  transform: translateY(0);
}

/* Sync Warning */
.sync-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 10px;
  padding: 12px;
  font-size: 12px;
  color: #3b82f6;
  margin-top: 16px;
}

/* Footer */
.footer-info {
  position: relative;
  z-index: 10;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.footer-logo {
  height: 20px;
  filter: brightness(0) invert(1);
}

/* Responsive */
@media (max-width: 600px) {
  .sync-card {
    padding: 24px 20px;
    max-width: 100%;
    border-radius: 20px;
  }

  .card-title {
    font-size: 22px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-value {
    text-align: left;
  }

  .table-status-grid {
    max-height: 120px;
    overflow-y: auto;
  }
}
</style>
