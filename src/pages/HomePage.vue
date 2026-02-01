<template>
  <q-page class="home-page">
    <!-- Header Cockpit Area -->
    <div class="header-cockpit section-fade-in">
      <div class="cockpit-glow"></div>
      <div class="row items-center justify-between no-wrap">
        <div class="cockpit-welcome">
          <div class="greeting-row">
            <span class="text-h5 text-weight-normal opacity-80">{{ greeting }},</span>
            <span class="text-h5 text-weight-bolder q-ml-xs">{{ userName }}</span>
          </div>
        </div>

        <div class="cockpit-meta">
          <div class="date-chip-modern">
            <q-icon name="event" size="14px" class="q-mr-xs" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Bento Grid -->
    <div class="bento-grid">
      <!-- Onboarding - Strategic Tile -->
      <div v-if="onboardingProgress < 100" class="bento-item onboarding-tile span-full">
        <div class="row items-center q-gutter-md no-wrap">
          <q-circular-progress
            show-value
            font-size="12px"
            :value="onboardingProgress"
            size="50px"
            :thickness="0.2"
            color="primary"
            track-color="blue-1"
            class="q-ma-none onboarding-progress"
          >
            {{ onboardingProgress }}%
          </q-circular-progress>
          <div class="col">
            <div class="text-weight-bold text-subtitle2">Configuración Inicial</div>
            <div class="text-caption opacity-60">{{ completedTasks }} de {{ totalTasks }} pasos completados</div>
          </div>
          <q-btn flat round color="primary" icon="arrow_forward" @click="goToWelcome" />
        </div>
      </div>

      <!-- ROW 1: Stats Ribbon (Desktop 4-cols) -->
      <template v-if="isAdmin">
        <div class="bento-item stat-hero span-small-mobile span-1-desktop sale-tile">
          <div class="stat-icon-wrap bg-soft-primary">
            <q-icon name="receipt_long" size="28px" color="primary" />
          </div>
          <div class="stat-data">
            <div class="stat-val">{{ todayStats.invoices }}</div>
            <div class="stat-lab">Ventas de Hoy</div>
            <div class="stat-trend grow">
              <q-icon name="trending_up" size="10px" /> 12%
            </div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop revenue-tile">
          <div class="stat-icon-wrap bg-soft-positive">
            <q-icon name="payments" size="28px" color="positive" />
          </div>
          <div class="stat-data">
            <div class="stat-val text-positive">{{ formatCurrency(todayStats.revenue) }}</div>
            <div class="stat-lab">Ingresos Netos</div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop product-tile">
          <div class="stat-icon-wrap bg-soft-warning">
            <q-icon name="inventory_2" size="28px" color="warning" />
          </div>
          <div class="stat-data">
            <div class="stat-val">{{ todayStats.products }}</div>
            <div class="stat-lab">Productos</div>
          </div>
        </div>

        <div class="bento-item stat-hero span-small-mobile span-1-desktop client-tile">
          <div class="stat-icon-wrap bg-soft-info">
            <q-icon name="people" size="28px" color="info" />
          </div>
          <div class="stat-data">
            <div class="stat-val text-info">{{ todayStats.clients }}</div>
            <div class="stat-lab">Clientes Hoy</div>
          </div>
        </div>
      </template>

      <!-- ROW 2: Actions and Activity Side-by-Side -->
      <div class="bento-item actions-bento span-full-mobile span-2-desktop">
        <div class="bento-header">
          <q-icon name="apps" class="q-mr-xs" />
          <span>Accesos Rápidos</span>
        </div>
        <div class="actions-grid-modern">
          <div
            v-for="action in quickActions"
            :key="action.name"
            class="action-pill clickable"
            @click="navigateTo(action.route)"
          >
            <div class="action-pill__icon" :style="{ color: action.color.match(/#[A-Fa-f0-9]{6}/)?.[0] || 'var(--q-primary)' }">
              <q-icon :name="action.icon" size="18px" />
            </div>
            <div class="action-pill__label">{{ action.label }}</div>
          </div>
        </div>
      </div>

      <div v-if="isAdmin" class="bento-item activity-bento span-full-mobile span-2-desktop section-fade-in">
        <div class="row items-center justify-between q-mb-md">
          <div class="bento-header no-margin">
            <q-icon name="history" class="q-mr-xs" />
            <span>Actividad Reciente</span>
          </div>
          <q-btn
            flat
            dense
            no-caps
            label="Ver todo"
            color="primary"
            size="11px"
            class="rounded-button"
            @click="navigateTo('Invoice')"
          />
        </div>

        <div v-if="recentInvoices.length > 0" class="activity-timeline">
          <div
            v-for="invoice in recentInvoices"
            :key="invoice.id"
            class="timeline-node clickable"
            @click="viewInvoice(invoice)"
          >
            <div class="node-time">{{ formatTime(invoice.created_at) }}</div>
            <div class="node-line"></div>
            <div class="node-content">
              <div class="node-header">
                <span class="node-title">#{{ invoice.id }}</span>
                <span class="node-amount">{{ formatCurrency(invoice.total) }}</span>
              </div>
              <div class="node-subtitle">{{ invoice.client_name || 'Consumidor Final' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-glitch flex flex-center q-pa-lg">
          <div class="text-center opacity-40">
            <q-icon name="biometric_setup" size="40px" class="q-mb-sm" />
            <div class="text-caption">Monitoreando transacciones...</div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = authentication()
const { userSession } = storeToRefs(store)

/**
 * Onboarding progress
 * @type {number}
 */
const onboardingProgress = ref(0)

/**
 * Completed tasks count
 * @type {number}
 */
const completedTasks = ref(0)

/**
 * Total tasks count
 * @type {number}
 */
const totalTasks = ref(5)

/**
 * Today's statistics
 * @type {object}
 */
const todayStats = ref({
  invoices: 0,
  revenue: 0,
  products: 0,
  clients: 0
})

/**
 * Recent invoices
 * @type {Array}
 */
const recentInvoices = ref([])

const userName = computed(() => {
  if (!userSession.value) return 'Usuario'
  const name = userSession.value.name || ''
  return name.split(' ')[0] || 'Usuario'
})

/**
 * Check if user is admin or root
 * @type {ComputedRef<boolean>}
 */
const isAdmin = computed(() => {
  if (!userSession.value) return false
  return userSession.value.is_root || userSession.value.is_super_admin
})

/**
 * Get greeting based on time
 * @return {string}
 */
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

/**
 * Get current date formatted
 * @return {string}
 */
const currentDate = computed(() => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('es-ES', options)
})

/**
 * Quick actions configuration
 * @type {Array}
 */
const quickActions = ref([
  {
    name: 'new-sale',
    label: 'Nueva Venta',
    icon: 'add_shopping_cart',
    route: 'Billing',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: 'products',
    label: 'Productos',
    icon: 'inventory_2',
    route: 'Product',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    name: 'clients',
    label: 'Clientes',
    icon: 'people',
    route: 'Client',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    name: 'reports',
    label: 'Reportes',
    icon: 'analytics',
    route: 'Dashboard',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    name: 'cashbox',
    label: 'Caja',
    icon: 'account_balance_wallet',
    route: 'Cashbox',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    name: 'settings',
    label: 'Configuración',
    icon: 'settings',
    route: 'CompanyConfig',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

/**
 * Navigate to route
 * @param {string} routeName - Route name
 */
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

/**
 * Go to welcome page
 */
const goToWelcome = () => {
  router.push({ name: 'Welcome' })
}

/**
 * View invoice details
 * @param {object} invoice - Invoice object
 */
const viewInvoice = (invoice) => {
  // Navigate to invoice details or open modal
  router.push({ name: 'Invoice', params: { id: invoice.id } })
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @return {string} Formatted currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: userSession.value?.company_session?.coin?.symbol || 'USD'
  }).format(amount || 0)
}

/**
 * Format time relative
 * @param {string} datetime - Datetime string
 * @return {string} Formatted time
 */
const formatTime = (datetime) => {
  const date = new Date(datetime)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`
  return date.toLocaleDateString('es-ES')
}

/**
 * Load onboarding status
 */
const loadOnboardingStatus = async () => {
  try {
    const { data } = await api.get('onboarding/tasks/status')
    if (data.tasks) {
      totalTasks.value = data.tasks.length
      completedTasks.value = data.tasks.filter(t => t.count > 0 || t.multiple?.client).length
      onboardingProgress.value = Math.round((completedTasks.value / totalTasks.value) * 100)
    }
  } catch (error) {
    console.error('Error loading onboarding status:', error)
  }
}

/**
 * Load today's statistics
 */
const loadTodayStats = async () => {
  try {
    // You'll need to create these endpoints or adjust based on your API
    const { data } = await api.get('dashboard/today-stats')
    todayStats.value = data
  } catch (error) {
    console.error('Error loading today stats:', error)
    // Set mock data for now
    todayStats.value = {
      invoices: 12,
      revenue: 4500.50,
      products: 156,
      clients: 45
    }
  }
}

/**
 * Load recent invoices
 */
const loadRecentInvoices = async () => {
  try {
    const { data } = await api.get('invoices', {
      params: {
        paginate: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        perPage: 5
      }
    })
    recentInvoices.value = data.data || data
  } catch (error) {
    console.error('Error loading recent invoices:', error)
  }
}

onMounted(() => {
  loadOnboardingStatus()
  loadTodayStats()
  loadRecentInvoices()
})
</script>

<style scoped>
/**
 * Home page layout - Main Bento Grid System
 */
.home-page {
  overflow-x: hidden;
  padding: 0px;
  padding-bottom: 96px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
}

@media (min-width: 1024px) {
  .home-page {
    padding: 10px;
    padding-bottom: 48px;
  }
}
/**
 * Header Cockpit
 */
.header-cockpit {
  padding: 24px 8px;
  margin-bottom: 8px;
  position: relative;
}

.cockpit-glow {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(var(--q-primary-rgb), 0.1) 0%, transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

.welcome-subtitle {
  margin-top: 4px;
  font-weight: 500;
}

.date-chip-modern {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

body.body--dark .date-chip-modern {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

/**
 * Bento Grid Central
 */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto auto;
    gap: 16px;
  }
}

.bento-item {
  background: white;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body.body--dark .bento-item {
  background: #161d2b;
  border: 1px solid rgba(255,255,255,0.03);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.bento-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1);
}

.span-full { grid-column: 1 / -1; }
.span-full-mobile { grid-column: 1 / -1; }
.span-small-mobile { grid-column: span 1; }

@media (min-width: 1024px) {
  .span-2-desktop { grid-column: span 2; }
  .span-1-desktop { grid-column: span 1; }
}

/**
 * Elements Inside Bento
 */
.bento-header {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

/**
 * Actions Matrix
 */
.actions-grid-modern {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

body.body--dark .action-pill {
  background: #1e293b;
}

.action-pill:active { transform: scale(0.96); }

.action-pill__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

body.body--dark .action-pill__icon {
  background: #0f172a;
}

.action-pill__label {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

body.body--dark .action-pill__label {
  color: #f1f5f9;
}

/**
 * Stats Tiles
 */
.stat-hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  min-height: auto;
}

@media (min-width: 1024px) {
  .actions-bento, .activity-bento {
    height: 100%;
  }
}

.actions-bento {
  display: flex;
  flex-direction: column;
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-hero:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(5deg);
}

.bg-soft-primary { background: rgba(var(--q-primary-rgb), 0.1); }
.bg-soft-positive { background: rgba(var(--q-positive-rgb), 0.1); }
.bg-soft-warning { background: rgba(var(--q-warning-rgb), 0.1); }
.bg-soft-info { background: rgba(var(--q-info-rgb), 0.1); }

.stat-val {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.stat-lab {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
}

.stat-trend {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  margin-top: 2px;
  width: fit-content;
}

.stat-trend.grow { background: rgba(16, 185, 129, 0.1); color: #10b981; }

/**
 * Activity Timeline
 */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-node {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.node-time {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  width: 45px;
  text-align: right;
  padding-top: 2px;
}

.node-line {
  width: 2px;
  background: #e2e8f0;
  position: relative;
  border-radius: 2px;
}

body.body--dark .node-line {
  background: #1e293b;
}

.node-line::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--q-primary);
}

body.body--dark .node-line::after {
  background: #0f172a;
}

.node-content {
  flex: 1;
  padding-bottom: 24px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-title {
  font-size: 13px;
  font-weight: 800;
}

.node-amount {
  font-size: 13px;
  font-weight: 900;
  color: #10b981;
}

.node-subtitle {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.rounded-button { border-radius: 8px; }
.opacity-60 { opacity: 0.6; }
.clickable { cursor: pointer; }
.no-margin { margin: 0 !important; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
