<template>
  <q-page class="home-page">
    <!-- Header Cockpit Area -->
    <div class="header-cockpit section-fade-in">
      <div class="cockpit-glow"></div>
      <div class="column no-wrap">
        <div class="cockpit-meta q-mb-sm">
          <div class="date-chip-premium">
            <q-icon name="calendar_today" size="12px" class="q-mr-xs" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
        <div class="cockpit-welcome">
          <div class="greeting-text">
            <span class="greeting-main">{{ greeting }},</span>
            <span class="greeting-name">{{ userName }}</span>
          </div>
          <div class="greeting-subtitle">Aquí tienes el resumen de tu negocio para hoy</div>
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

      <!-- ROW 1: Statistics (Original Order) -->
      <template v-if="isAdmin">
        <!-- Today's Net Income -->
        <div class="bento-item stat-hero revenue-tile">
          <div class="stat-icon-wrap bg-soft-primary">
            <q-icon name="payments" size="28px" color="primary" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-primary">{{ formatCurrency(todayStats.netIncome) }}</div>
            <div class="stat-lab">Ingresos de Hoy</div>
          </div>
        </div>

        <!-- Today's Profit -->
        <div class="bento-item stat-hero profit-tile">
          <div class="stat-icon-wrap bg-soft-positive">
            <q-icon name="trending_up" size="28px" color="positive" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val" :class="todayStats.profit >= 0 ? 'text-positive' : 'text-negative'">
              {{ formatCurrency(todayStats.profit) }}
            </div>
            <div class="stat-lab">Ganancias de Hoy</div>
          </div>
        </div>

        <!-- Today's Cash Out -->
        <div class="bento-item stat-hero expense-tile">
          <div class="stat-icon-wrap bg-soft-negative">
            <q-icon name="money_off" size="28px" color="negative" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-negative">{{ formatCurrency(todayStats.cashOut) }}</div>
            <div class="stat-lab">Salida de Dinero</div>
          </div>
        </div>

        <!-- Accounts Receivable -->
        <div class="bento-item stat-hero receivable-tile clickable" @click="navigateTo('AccountsReceivable')">
          <div class="stat-icon-wrap bg-soft-warning">
            <q-icon name="account_balance_wallet" size="28px" color="warning" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-warning">{{ formatCurrency(todayStats.receivable) }}</div>
            <div class="stat-lab">Por Cobrar</div>
          </div>
        </div>

        <!-- Total Products -->
        <div class="bento-item stat-hero products-tile">
          <div class="stat-icon-wrap bg-soft-secondary">
            <q-icon name="inventory_2" size="28px" color="secondary" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-secondary">{{ todayStats.productsTotal }}</div>
            <div class="stat-lab">Productos</div>
          </div>
        </div>

        <!-- Total Clients -->
        <div class="bento-item stat-hero clients-tile mobile-hide">
          <div class="stat-icon-wrap bg-soft-accent">
            <q-icon name="group" size="28px" color="accent" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-accent">{{ todayStats.clientsTotal }}</div>
            <div class="stat-lab">Clientes</div>
          </div>
        </div>

        <!-- Today's Sales Count -->
        <div class="bento-item stat-hero sales-tile">
          <div class="stat-icon-wrap bg-soft-info">
            <q-icon name="receipt" size="28px" color="info" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-info">{{ todayStats.salesToday }}</div>
            <div class="stat-lab">Ventas de Hoy</div>
          </div>
        </div>
      </template>

      <!-- ROW 2: Quick Access and Activity -->
      <div class="bento-item actions-bento span-full-mobile span-2-desktop">
        <div class="bento-header">
          <q-icon name="apps" class="q-mr-xs" />
          <span>Accesos Rápidos</span>
          <q-space />
          <q-btn
            flat
            dense
            round
            icon="settings"
            size="sm"
            color="grey-6"
            @click="showQuickAccessConfig = true"
          >
            <q-tooltip>Configurar accesos rápidos</q-tooltip>
          </q-btn>
        </div>
        <div class="actions-grid-modern">
          <div
            v-for="action in configuredQuickActions"
            :key="action.name"
            class="action-pill clickable"
            @click="handleQuickActionClick(action)"
          >
            <div class="action-pill__icon" :style="{ color: action.color?.match(/#[A-Fa-f0-9]{6}/)?.[0] || 'var(--q-primary)' }">
              <q-icon :name="action.icon" size="18px" />
            </div>
            <div class="action-pill__label">{{ action.label }}</div>
          </div>
          <!-- Add shortcut button -->
          <div
            v-if="configuredQuickActions.length < 6"
            class="action-pill action-pill--add clickable"
            @click="showQuickAccessConfig = true"
          >
            <div class="action-pill__icon" style="color: var(--q-grey-5)">
              <q-icon name="add" size="18px" />
            </div>
            <div class="action-pill__label text-grey-5">Agregar</div>
          </div>
        </div>
      </div>

      <!-- Activity Section (for Admin) -->
      <div v-if="isAdmin" class="bento-item activity-bento span-full-mobile span-2-desktop section-fade-in">
        <div class="row items-center justify-between q-mb-md">
          <div class="bento-header no-margin">
            <q-icon name="receipt_long" class="q-mr-xs" />
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

    <!-- Quick Access Configuration Dialog -->
    <q-dialog
      v-model="showQuickAccessConfig"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="config-card flex no-wrap column" :class="{ 'config-card--dark': $q.dark.isActive }">
        <!-- Sticky Header with Glassmorphism -->
        <q-card-section class="config-header col-auto">
          <div class="row items-center no-wrap">
            <div class="header-icon-box">
              <q-icon name="auto_awesome" size="24px" color="white" />
            </div>
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bolder">Personalizar Panel</div>
              <div class="text-caption opacity-60">Elige tus 6 herramientas favoritas</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup class="close-btn-modern" />
          </div>

          <!-- Progress Visualization -->
          <div class="progress-container q-mt-lg">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption text-weight-bold uppercase letter-spacing-1">Tu Selección</span>
              <span class="text-caption text-weight-bold" :class="selectedQuickActions.length === 6 ? 'text-positive' : 'text-primary'">
                {{ selectedQuickActions.length }} / 6
              </span>
            </div>
            <div class="selection-dots">
              <div
                v-for="i in 6"
                :key="i"
                class="dot"
                :class="{
                  'dot--active': i <= selectedQuickActions.length,
                  'dot--pulse': i === selectedQuickActions.length + 1 && selectedQuickActions.length < 6
                }"
              ></div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="config-body q-pa-none col">
          <!-- Active Selection Preview (Horizontal Scroll on Mobile, Grid on Desktop) -->
          <div class="section-label q-px-md q-pt-md">
            <q-icon name="touch_app" size="16px" class="q-mr-xs" />
            Ordena tus favoritos
          </div>
          <div class="selected-preview-area q-px-md q-pb-md">
            <div v-if="selectedQuickActions.length === 0" class="empty-preview flex flex-center">
              <div class="text-center">
                <q-icon name="add_circle_outline" size="32px" color="grey-4" />
                <div class="text-caption text-grey-5">Toca abajo para agregar</div>
              </div>
            </div>
            <transition-group name="list" tag="div" class="preview-grid">
              <div
                v-for="(action, index) in selectedQuickActions"
                :key="action.name"
                class="preview-card"
              >
                <div class="preview-card__icon" :style="{ background: action.color }">
                  <q-icon :name="action.icon" size="20px" color="white" />
                  <q-btn
                    round
                    dense
                    flat
                    icon="close"
                    size="xs"
                    class="remove-tag"
                    @click="removeQuickAction(action)"
                  />
                </div>
                <div class="preview-card__label text-center ellipsis">{{ action.label }}</div>
                <div class="preview-card__reorder row no-wrap justify-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_left"
                    size="xs"
                    :disable="index === 0"
                    @click="moveQuickAction(index, -1)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    size="xs"
                    :disable="index === selectedQuickActions.length - 1"
                    @click="moveQuickAction(index, 1)"
                  />
                </div>
              </div>
            </transition-group>
          </div>

          <q-separator />

          <!-- Available Modules in "Library" Style -->
          <div class="section-label q-px-md q-pt-md">
            <q-icon name="library_add" size="16px" class="q-mr-xs" />
            Todas las Herramientas
          </div>

          <div class="modules-library q-px-md q-pb-xl">
            <template v-if="loadingModules">
              <div class="row q-col-gutter-sm">
                <div v-for="n in 6" :key="n" class="col-6 col-md-4">
                  <q-skeleton type="rect" height="80px" class="rounded-borders" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="item in flattenedModulesList.filter(i => i.type === 'module')"
                  :key="item.id"
                  class="col-6 col-md-4"
                >
                  <div
                    class="library-item clickable"
                    :class="{
                      'library-item--selected': isModuleSelected(item),
                      'library-item--disabled': selectedQuickActions.length >= 6 && !isModuleSelected(item)
                    }"
                    @click="toggleQuickAction(item)"
                  >
                    <div class="library-item__icon-wrap">
                      <q-icon :name="item.icon || 'link'" size="20px" />
                    </div>
                    <div class="library-item__text">
                      <div class="title">{{ item.title }}</div>
                      <div class="subtitle ellipsis">{{ item.sectionName }}</div>
                    </div>
                    <div class="library-item__check">
                      <q-icon v-if="isModuleSelected(item)" name="check_circle" color="positive" size="18px" />
                      <q-icon v-else name="add" color="grey-4" size="18px" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </q-card-section>

        <!-- Footer Actions with Premium look -->
        <q-card-actions align="center" class="config-footer q-pa-md col-auto">
          <q-btn
            flat
            no-caps
            label="Descartar"
            color="grey-7"
            class="rounded-button q-px-lg"
            @click="cancelQuickAccessConfig"
          />
          <q-btn
            unelevated
            no-caps
            label="Aplicar Cambios"
            color="primary"
            class="rounded-button q-px-xl text-weight-bolder"
            icon="done_all"
            @click="saveQuickAccessConfig"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'
import { date } from 'quasar'

const router = useRouter()
const store = authentication()
const { userSession, branchOffice } = storeToRefs(store)

// ============================================
// CONSTANTS
// ============================================

/**
 * LocalStorage keys for persisting user preferences
 * @type {Object}
 */
const STORAGE_KEYS = {
  QUICK_ACCESS: 'orderwise_quick_access'
}

// ============================================
// ONBOARDING STATE
// ============================================

/**
 * Onboarding progress percentage
 * @type {Ref<number>}
 */
const onboardingProgress = ref(0)

/**
 * Number of completed onboarding tasks
 * @type {Ref<number>}
 */
const completedTasks = ref(0)

/**
 * Total number of onboarding tasks
 * @type {Ref<number>}
 */
const totalTasks = ref(5)

// ============================================
// STATISTICS STATE
// ============================================

/**
 * Loading state for statistics
 * @type {Ref<boolean>}
 */
const loadingStats = ref(true)

/**
 * Today's financial statistics
 * @type {Ref<Object>}
 */
const todayStats = ref({
  profit: 0,
  netIncome: 0,
  cashOut: 0,
  receivable: 0,
  productsTotal: 0,
  clientsTotal: 0,
  salesToday: 0
})

/**
 * Recent invoices list
 * @type {Ref<Array>}
 */
const recentInvoices = ref([])

// ============================================
// QUICK ACCESS STATE
// ============================================

/**
 * Controls quick access configuration dialog visibility
 * @type {Ref<boolean>}
 */
const showQuickAccessConfig = ref(false)

/**
 * Loading state for modules
 * @type {Ref<boolean>}
 */
const loadingModules = ref(false)

/**
 * Available sections with modules from API
 * @type {Ref<Array>}
 */
const availableSections = ref([])

/**
 * Quick actions selected by user (stored configuration)
 * @type {Ref<Array>}
 */
const selectedQuickActions = ref([])

/**
 * Backup of quick actions for cancel operation
 * @type {Ref<Array>}
 */
const quickActionsBackup = ref([])

/**
 * Default quick actions configuration
 * @type {Array}
 */
const defaultQuickActions = [
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
  }
]

// ============================================
// COMPUTED PROPERTIES
// ============================================

/**
 * Get user's first name
 * @returns {string}
 */
const userName = computed(() => {
  if (!userSession.value) return 'Usuario'
  const name = userSession.value.name || ''
  return name.split(' ')[0] || 'Usuario'
})

/**
 * Check if user is admin or root
 * @returns {boolean}
 */
const isAdmin = computed(() => {
  if (!userSession.value) return false
  return userSession.value.is_root || userSession.value.is_super_admin
})

/**
 * Get greeting based on time of day
 * @returns {string}
 */
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

/**
 * Get current date formatted
 * @returns {string}
 */
const currentDate = computed(() => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('es-ES', options)
})

/**
 * Get configured quick actions (from localStorage or defaults)
 * @returns {Array}
 */
const configuredQuickActions = computed(() => {
  return selectedQuickActions.value
})

/**
 * Flattened list of sections and modules for rendering
 * @returns {Array}
 */
const flattenedModulesList = computed(() => {
  const items = []
  availableSections.value.forEach(section => {
    items.push({
      type: 'header',
      id: `header-${section.id}`,
      name: section.name,
      icon: section.icon
    })
    section.modules.forEach(module => {
      items.push({
        type: 'module',
        id: `module-${module.id}`,
        sectionName: section.name,
        ...module
      })
    })
  })
  return items
})

// ============================================
// NAVIGATION METHODS
// ============================================

/**
 * Navigate to a named route
 * @param {string} routeName - Route name
 */
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

/**
 * Handle click on quick action
 * @param {Object} action - Action object
 */
const handleQuickActionClick = (action) => {
  if (action.route) {
    navigateTo(action.route)
  }
}

/**
 * Navigate to welcome page
 */
const goToWelcome = () => {
  router.push({ name: 'Welcome' })
}

/**
 * View invoice details
 * @param {Object} invoice - Invoice object
 */
const viewInvoice = (invoice) => {
  router.push({ name: 'Invoice', params: { id: invoice.invoice_id } })
}

// ============================================
// FORMATTING METHODS
// ============================================

/**
 * Get the currency symbol configured in the system
 * @returns {string}
 */
const coinSymbol = computed(() => {
  return userSession.value?.company_session?.company_config?.coin?.symbol || '$'
})

/**
 * Format currency amount with system coin symbol
 * @param {number} amount - Amount to format
 * @returns {string}
 */
const formatCurrency = (amount) => {
  const num = Number(amount) || 0
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
  return `${coinSymbol.value} ${formatted}`
}

/**
 * Format relative time
 * @param {string} datetime - Datetime string
 * @returns {string}
 */
const formatTime = (datetime) => {
  const dateObj = new Date(datetime)
  const now = new Date()
  const diff = now - dateObj
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`
  return dateObj.toLocaleDateString('es-ES')
}

// ============================================
// DATA LOADING METHODS
// ============================================

/**
 * Load onboarding status from API
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
 * Load today's financial statistics
 */
const loadTodayStats = async () => {
  if (!branchOffice.value?.id) return

  loadingStats.value = true
  const today = date.formatDate(new Date(), 'YYYY-MM-DD')

  const params = {
    day: today,
    branch_office_id: [branchOffice.value.id]
  }

  try {
    // Load all stats in parallel
    const [categoryData, cashflowData, receivableData, dashboardStats, productsData, clientsData] = await Promise.all([
      api.get('reports/category-totals', { params }).catch(() => ({ data: {} })),
      api.get('reports/cashflow-totals', { params }).catch(() => ({ data: {} })),
      api.get('client-statement/kpis', {
        params: {
          branch_office_id: branchOffice.value.id
        }
      }).catch(() => ({ data: {} })),
      api.get('dashboard/today-stats', { params }).catch(() => ({ data: { invoices: 0, products: 0, clients: 0 } })),
      api.get('products', { params: { perPage: 1, page: 1, paginated: true } }).catch(() => ({ data: { total: 0 } })),
      api.get('clients', { params: { perPage: 1, page: 1, paginated: true } }).catch(() => ({ data: { total: 0 } }))
    ])

    // Calculate profit (sales - costs)
    const sales = categoryData.data?.category_total || 0
    const costs = categoryData.data?.cost_total || 0
    const profit = sales - costs

    // Net income from sales
    const netIncome = sales

    // Cash out (credit type cashflows = money going out)
    let cashOut = 0
    if (cashflowData.data?.cashflow_total) {
      cashOut = cashflowData.data.cashflow_total
        .filter(cf => cf.type_cashflow === 'credit' || cf.type_cashflow === 'expense')
        .reduce((sum, cf) => sum + (cf.totals || 0), 0)
    }

    // Accounts receivable balance (global total from all clients)
    const receivable = receivableData.data?.balance || 0

    todayStats.value = {
      profit,
      netIncome,
      cashOut,
      receivable,
      productsTotal: productsData.data?.total || 0,
      clientsTotal: clientsData.data?.total || 0,
      salesToday: dashboardStats.data?.invoices || 0
    }
  } catch (error) {
    console.error('Error loading today stats:', error)
  } finally {
    loadingStats.value = false
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

/**
 * Load available modules from sections API
 */
const loadAvailableModules = async () => {
  loadingModules.value = true
  try {
    const { data } = await api.get('sections')
    const sections = Array.isArray(data) ? data : (data.data || [])

    availableSections.value = sections
      .filter(section => !section.deleted_at && section.modules?.length > 0)
      .map(section => ({
        ...section,
        modules: section.modules
          .filter(module => !module.deleted_at)
          .sort((a, b) => a.position - b.position)
      }))
      .sort((a, b) => a.index - b.index)
  } catch (error) {
    console.error('Error loading modules:', error)
  } finally {
    loadingModules.value = false
  }
}

// ============================================
// QUICK ACCESS CONFIGURATION METHODS
// ============================================

/**
 * Load quick access configuration from localStorage
 */
const loadQuickAccessConfig = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUICK_ACCESS)
    if (stored) {
      selectedQuickActions.value = JSON.parse(stored)
    } else {
      // Initialize with defaults if no user preference exists
      selectedQuickActions.value = [...defaultQuickActions]
    }
  } catch (error) {
    console.error('Error loading quick access config:', error)
    selectedQuickActions.value = [...defaultQuickActions]
  }
}

/**
 * Save quick access configuration to localStorage
 */
const saveQuickAccessConfig = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUICK_ACCESS, JSON.stringify(selectedQuickActions.value))
    showQuickAccessConfig.value = false
  } catch (error) {
    console.error('Error saving quick access config:', error)
  }
}

/**
 * Cancel quick access configuration changes
 */
const cancelQuickAccessConfig = () => {
  selectedQuickActions.value = [...quickActionsBackup.value]
  showQuickAccessConfig.value = false
}

/**
 * Check if a module is already selected
 * @param {Object} module - Module object
 * @returns {boolean}
 */
const isModuleSelected = (module) => {
  return selectedQuickActions.value.some(
    a => a.name === module.link || a.route === module.link
  )
}

/**
 * Toggle a module in quick actions
 * @param {Object} module - Module object
 */
const toggleQuickAction = (module) => {
  const index = selectedQuickActions.value.findIndex(
    a => a.name === module.link || a.route === module.link
  )

  if (index >= 0) {
    selectedQuickActions.value.splice(index, 1)
  } else if (selectedQuickActions.value.length < 6) {
    selectedQuickActions.value.push({
      name: module.link,
      label: module.title,
      icon: module.icon || 'link',
      route: module.link,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    })
  }
}

/**
 * Remove a quick action
 * @param {Object} action - Action to remove
 */
const removeQuickAction = (action) => {
  const index = selectedQuickActions.value.findIndex(a => a.name === action.name)
  if (index >= 0) {
    selectedQuickActions.value.splice(index, 1)
  }
}

/**
 * Move quick action up or down
 * @param {number} index - Current index
 * @param {number} direction - -1 for up, 1 for down
 */
const moveQuickAction = (index, direction) => {
  const newIndex = index + direction
  if (newIndex >= 0 && newIndex < selectedQuickActions.value.length) {
    const temp = selectedQuickActions.value[index]
    selectedQuickActions.value[index] = selectedQuickActions.value[newIndex]
    selectedQuickActions.value[newIndex] = temp
  }
}

// ============================================
// WATCHERS
// ============================================

/**
 * Watch for dialog open to backup current config
 */
watch(showQuickAccessConfig, (newVal) => {
  if (newVal) {
    quickActionsBackup.value = [...selectedQuickActions.value]
    if (availableSections.value.length === 0) {
      loadAvailableModules()
    }
  }
})

/**
 * Watch for branch office changes to reload stats
 */
watch(branchOffice, () => {
  loadTodayStats()
})

// ============================================
// LIFECYCLE HOOKS
// ============================================

onMounted(() => {
  loadOnboardingStatus()
  loadTodayStats()
  loadRecentInvoices()
  loadQuickAccessConfig()
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
.header-cockpit {
  padding: 1rem 0.5rem;
  margin-bottom: 8px;
  position: relative;
}

.cockpit-glow {
  position: absolute;
  top: -40px;
  left: -20px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(var(--q-primary-rgb), 0.15) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.date-chip-premium {
  display: inline-flex;
  align-items: center;
  background: white;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
}

body.body--dark .date-chip-premium {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.greeting-text {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  line-height: 1.1;
  margin-top: 4px;
}

.greeting-main {
  font-size: 32px;
  font-weight: 400;
  color: #334155;
  letter-spacing: -0.5px;
}

.greeting-name {
  font-size: 32px;
  font-weight: 800;
  margin-left: 8px;
  background: linear-gradient(135deg, var(--q-primary) 0%, #4facfe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.greeting-subtitle {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  letter-spacing: 0.1px;
}

body.body--dark .greeting-main {
  color: #f1f5f9;
}

body.body--dark .greeting-subtitle {
  color: #cbd5e1;
}

/**
 * Bento Grid Central
 */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column on mobile by default */
  gap: 12px;
  width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
}

@media (min-width: 0) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 12px;
  }
  .mobile-hide {
    display: none !important;
  }
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: 16px;
    padding: 0;
  }
  .mobile-hide {
    display: flex !important;
  }
}

.bento-item {
  background: white;
  border-radius: 20px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* Prevent content from breaking the box */
  width: 100%;
  box-sizing: border-box;
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
  min-width: 0; /* Allow text ellipsis to work */
}

body.body--dark .action-pill {
  background: #1e293b;
}

.action-pill:active { transform: scale(0.96); }

.action-pill--add {
  border: 2px dashed #e2e8f0;
  background: transparent;
}

body.body--dark .action-pill--add {
  border-color: #334155;
}

.action-pill__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

body.body--dark .action-pill__icon {
  background: #0f172a;
}

.action-pill__label {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

body.body--dark .action-pill__label {
  color: #f1f5f9;
}

/**
 * Recent Access Grid
 */
.recent-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recent-pill {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
  min-width: 0;
}

body.body--dark .recent-pill {
  background: #1e293b;
}

.recent-pill:hover {
  background: #f1f5f9;
}

body.body--dark .recent-pill:hover {
  background: #334155;
}

.recent-pill__label {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

body.body--dark .recent-pill__label {
  color: #f1f5f9;
}

.recent-pill__time {
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
}

/**
 * Stats Tiles
 */
.stat-hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 16px;
  min-height: auto;
  justify-content: flex-start;
}

@media (max-width: 480px) {
  .stat-hero {
    padding: 12px;
    gap: 12px;
  }

  .stat-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .stat-val {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  .actions-bento, .activity-bento, .recent-bento {
    height: 100%;
  }
}

.actions-bento, .recent-bento {
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
.bg-soft-negative { background: rgba(var(--q-negative-rgb), 0.1); }
.bg-soft-secondary { background: rgba(var(--q-secondary-rgb), 0.1); }
.bg-soft-accent { background: rgba(var(--q-accent-rgb), 0.1); }

.stat-data {
  flex: 1;
  min-width: 0;
}

.stat-val {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-lab {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/**
 * Empty States
 */
.empty-state {
  min-height: 100px;
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

/**
 * Premium Configuration Dialog Styles
 */
.config-card {
  border-radius: 28px;
  overflow: hidden;
  max-width: 800px;
  width: 95vw;
  background: #fdfdfe;
}

body.body--dark .config-card {
  background: #0f172a;
}

.config-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #7c3aed 100%);
  color: white;
  padding: 24px;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.close-btn-modern {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.progress-container {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  border-radius: 16px;
}

.selection-dots {
  display: flex;
  gap: 8px;
}

.dot {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.dot--active {
  background: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.dot--pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 0.8; }
  100% { opacity: 0.3; }
}

.config-body {
  overflow-y: auto;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

/**
 * Preview Grid
 */
.selected-preview-area {
  min-height: 120px;
  flex-shrink: 0;
}

.preview-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 12px 0;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.preview-grid::-webkit-scrollbar { display: none; }

.preview-card {
  flex: 0 0 85px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.preview-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);
}

.remove-tag {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f43f5e;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
}

.preview-card__label {
  font-size: 10px;
  font-weight: 700;
  width: 100%;
  color: #64748b;
}

.preview-card__reorder {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px;
  width: 100%;
}

body.body--dark .preview-card__reorder {
  background: #1e293b;
}

/**
 * Library Items
 */
.modules-library {
  padding-bottom: 32px;
}

.library-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  height: 100%;
  transition: all 0.2s ease;
}

body.body--dark .library-item {
  background: #1e293b;
  border-color: #334155;
}

.library-item--selected {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb), 0.05);
  box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.1);
}

.library-item--disabled {
  opacity: 0.4;
  filter: grayscale(0.8);
  pointer-events: none;
}

.library-item__icon-wrap {
  width: 38px;
  height: 38px;
  background: #f8fafc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

body.body--dark .library-item__icon-wrap {
  background: #0f172a;
}

.library-item--selected .library-item__icon-wrap {
  background: var(--q-primary);
  color: white;
}

.library-item__text {
  flex: 1;
  min-width: 0;
}

.library-item__text .title {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
}

.library-item__text .subtitle {
  font-size: 9px;
  color: #94a3b8;
  margin-top: 2px;
}

.library-item__check {
  flex-shrink: 0;
}

.config-footer {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.02);
}

body.body--dark .config-footer {
  background: #0f172a;
  border-color: #334155;
}

/**
 * Transitions
 */
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/**
 * Mobile Responsive Fixes
 */
@media (max-width: 600px) {
  .config-card {
    border-radius: 0;
    width: 100vw;
    height: 100vh;
  }

  .config-header {
    padding: 16px;
    padding-top: 20px;
  }

  .header-icon-box {
    width: 40px;
    height: 40px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .selection-dots .dot {
    height: 4px;
  }

  .preview-card {
    flex: 0 0 75px;
  }

  .preview-card__icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .library-item {
    padding: 10px;
    gap: 8px;
  }

  .library-item__icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .library-item__text .title {
    font-size: 11px;
  }

  .modules-library {
    max-height: none; /* Allow it to fill the available space in maximized mode */
    padding-bottom: 120px; /* Space for fixed footer on some devices */
  }

  .preview-grid {
    padding: 10px 0;
  }
}
</style>
