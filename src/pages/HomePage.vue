<template>
  <q-page class="home-page">
    <!-- Header Section -->
    <div class="home-header">
      <div class="home-header__content">
        <h1 class="home-header__title">
          {{ greeting }}, {{ userName }}
        </h1>
        <p class="home-header__subtitle">
          {{ currentDate }}
        </p>
      </div>
    </div>

    <!-- Onboarding Progress (if incomplete) -->
    <div v-if="onboardingProgress < 100" class="onboarding-banner">
      <div class="onboarding-banner__content">
        <q-icon name="rocket_launch" size="32px" class="onboarding-banner__icon" />
        <div class="onboarding-banner__text">
          <div class="onboarding-banner__title">Configuración inicial</div>
          <div class="onboarding-banner__subtitle">
            {{ completedTasks }}/{{ totalTasks }} tareas completadas
          </div>
        </div>
        <q-circular-progress
          :value="onboardingProgress"
          size="56px"
          :thickness="0.15"
          color="primary"
          track-color="grey-3"
          class="onboarding-banner__progress"
        >
          <div class="text-caption text-weight-bold">{{ onboardingProgress }}%</div>
        </q-circular-progress>
      </div>
      <q-btn
        flat
        no-caps
        label="Continuar configuración"
        icon-right="arrow_forward"
        color="primary"
        class="full-width q-mt-sm"
        @click="goToWelcome"
      />
    </div>

    <!-- Quick Actions Grid -->
    <div class="quick-actions">
      <div class="section-title">Accesos Rápidos</div>
      <div class="quick-actions__grid">
        <div
          v-for="action in quickActions"
          :key="action.name"
          class="quick-action-card"
          @click="navigateTo(action.route)"
        >
          <div class="quick-action-card__icon-wrapper" :style="{ background: action.color }">
            <q-icon :name="action.icon" size="28px" color="white" />
          </div>
          <div class="quick-action-card__label">{{ action.label }}</div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="section-title">Resumen de Hoy</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon">
            <q-icon name="receipt_long" size="24px" color="primary" />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ todayStats.invoices }}</div>
            <div class="stat-card__label">Ventas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <q-icon name="attach_money" size="24px" color="positive" />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ formatCurrency(todayStats.revenue) }}</div>
            <div class="stat-card__label">Ingresos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <q-icon name="inventory_2" size="24px" color="warning" />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ todayStats.products }}</div>
            <div class="stat-card__label">Productos</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <q-icon name="people" size="24px" color="info" />
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ todayStats.clients }}</div>
            <div class="stat-card__label">Clientes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="section-title">
        <span>Actividad Reciente</span>
        <q-btn
          flat
          dense
          no-caps
          label="Ver todo"
          color="primary"
          size="sm"
          @click="navigateTo('Invoice')"
        />
      </div>
      <div v-if="recentInvoices.length > 0" class="activity-list">
        <div
          v-for="invoice in recentInvoices"
          :key="invoice.id"
          class="activity-item"
          @click="viewInvoice(invoice)"
        >
          <div class="activity-item__icon">
            <q-icon name="receipt" size="20px" color="primary" />
          </div>
          <div class="activity-item__content">
            <div class="activity-item__title">Venta #{{ invoice.id }}</div>
            <div class="activity-item__subtitle">
              {{ invoice.client_name || 'Cliente General' }}
            </div>
          </div>
          <div class="activity-item__meta">
            <div class="activity-item__amount">{{ formatCurrency(invoice.total) }}</div>
            <div class="activity-item__time">{{ formatTime(invoice.created_at) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <q-icon name="inbox" size="48px" color="grey-5" />
        <div class="empty-state__text">No hay actividad reciente</div>
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

/**
 * Get user name
 * @return {string}
 */
const userName = computed(() => {
  if (!userSession.value) return 'Usuario'
  const name = userSession.value.name || ''
  return name.split(' ')[0] || 'Usuario'
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
    const { data } = await api.get('/onboarding/tasks/status')
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
    const { data } = await api.get('/dashboard/today-stats')
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
    const { data } = await api.get('/invoices', {
      params: {
        limit: 5,
        sort: 'created_at',
        order: 'desc'
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
 * Home page layout
 */
.home-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 80px;
  /* Space for bottom nav */
}

body.body--dark .home-page {
  background: #121212;
}

/**
 * Header
 */
.home-header {
  margin-bottom: 24px;
}

.home-header__title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

body.body--dark .home-header__title {
  color: #f5f5f5;
}

.home-header__subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-transform: capitalize;
}

body.body--dark .home-header__subtitle {
  color: #aaa;
}

/**
 * Onboarding banner
 */
.onboarding-banner {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

body.body--dark .onboarding-banner {
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.onboarding-banner__content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.onboarding-banner__icon {
  color: var(--q-primary);
}

.onboarding-banner__text {
  flex: 1;
}

.onboarding-banner__title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

body.body--dark .onboarding-banner__title {
  color: #f5f5f5;
}

.onboarding-banner__subtitle {
  font-size: 13px;
  color: #666;
}

body.body--dark .onboarding-banner__subtitle {
  color: #aaa;
}

/**
 * Section title
 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

body.body--dark .section-title {
  color: #f5f5f5;
}

/**
 * Quick actions
 */
.quick-actions {
  margin-bottom: 32px;
}

.quick-actions__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 380px) {
  .quick-actions__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quick-action-card {
  background: white;
  border-radius: 16px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

body.body--dark .quick-action-card {
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.quick-action-card:active {
  transform: scale(0.95);
}

.quick-action-card__icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-card__label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.3;
}

body.body--dark .quick-action-card__label {
  color: #f5f5f5;
}

/**
 * Stats section
 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

body.body--dark .stat-card {
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--q-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

body.body--dark .stat-card__value {
  color: #f5f5f5;
}

.stat-card__label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

body.body--dark .stat-card__label {
  color: #aaa;
}

/**
 * Recent activity
 */
.recent-activity {
  margin-bottom: 24px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

body.body--dark .activity-item {
  background: #1e1e1e;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.activity-item:active {
  transform: scale(0.98);
}

.activity-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(var(--q-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-item__content {
  flex: 1;
  min-width: 0;
}

.activity-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

body.body--dark .activity-item__title {
  color: #f5f5f5;
}

.activity-item__subtitle {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

body.body--dark .activity-item__subtitle {
  color: #aaa;
}

.activity-item__meta {
  text-align: right;
  flex-shrink: 0;
}

.activity-item__amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-positive);
  margin-bottom: 2px;
}

.activity-item__time {
  font-size: 11px;
  color: #999;
}

/**
 * Empty state
 */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

body.body--dark .empty-state {
  background: #1e1e1e;
}

.empty-state__text {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}
</style>
