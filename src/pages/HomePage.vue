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

      <!-- ROW 1: Stats Ribbon (Desktop 4-cols) - Today's Financial KPIs -->
      <template v-if="isAdmin">
        <!-- Today's Profit -->
        <div class="bento-item stat-hero span-small-mobile span-1-desktop profit-tile">
          <div class="stat-icon-wrap bg-soft-positive">
            <q-icon name="trending_up" size="28px" color="positive" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val" :class="todayStats.profit >= 0 ? 'text-positive' : 'text-negative'">
              {{ formatCurrency(todayStats.profit) }}
            </div>
            <div class="stat-lab">Ganancia de Hoy</div>
          </div>
        </div>

        <!-- Today's Net Income -->
        <div class="bento-item stat-hero span-small-mobile span-1-desktop revenue-tile">
          <div class="stat-icon-wrap bg-soft-primary">
            <q-icon name="payments" size="28px" color="primary" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-primary">{{ formatCurrency(todayStats.netIncome) }}</div>
            <div class="stat-lab">Ingresos Netos</div>
          </div>
        </div>

        <!-- Today's Cash Out -->
        <div class="bento-item stat-hero span-small-mobile span-1-desktop expense-tile">
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
        <div class="bento-item stat-hero span-small-mobile span-1-desktop receivable-tile clickable" @click="navigateTo('AccountsReceivable')">
          <div class="stat-icon-wrap bg-soft-warning">
            <q-icon name="account_balance_wallet" size="28px" color="warning" />
          </div>
          <div class="stat-data">
            <q-skeleton v-if="loadingStats" type="text" width="80px" />
            <div v-else class="stat-val text-warning">{{ formatCurrency(todayStats.receivable) }}</div>
            <div class="stat-lab">Por Cobrar</div>
          </div>
        </div>
      </template>

      <!-- ROW 2: Quick Access and Recent Access Side-by-Side -->
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

      <!-- Recent Access Section -->
      <div class="bento-item recent-bento span-full-mobile span-2-desktop section-fade-in">
        <div class="bento-header">
          <q-icon name="history" class="q-mr-xs" />
          <span>Accesos Recientes</span>
          <q-space />
          <q-btn
            v-if="recentAccess.length > 0"
            flat
            dense
            no-caps
            label="Limpiar"
            color="grey-6"
            size="11px"
            @click="clearRecentAccess"
          />
        </div>
        <div v-if="recentAccess.length > 0" class="recent-grid">
          <div
            v-for="(recent, index) in recentAccess"
            :key="index"
            class="recent-pill clickable"
            @click="navigateToRecent(recent)"
          >
            <q-icon :name="recent.icon || 'link'" size="16px" class="q-mr-sm" />
            <span class="recent-pill__label">{{ recent.label }}</span>
            <span class="recent-pill__time">{{ formatRecentTime(recent.timestamp) }}</span>
          </div>
        </div>
        <div v-else class="empty-state flex flex-center q-pa-md">
          <div class="text-center opacity-40">
            <q-icon name="history" size="32px" class="q-mb-sm" />
            <div class="text-caption">Sin accesos recientes</div>
          </div>
        </div>
      </div>

      <!-- Activity Section (for Admin) -->
      <div v-if="isAdmin" class="bento-item activity-bento span-full section-fade-in">
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
    <q-dialog v-model="showQuickAccessConfig" persistent>
      <q-card style="min-width: 400px; max-width: 600px;">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="settings" size="24px" class="q-mr-sm" />
          <div class="text-h6">Configurar Accesos Rápidos</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showQuickAccessConfig = false" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-subtitle2 q-mb-md text-grey-7">
            Arrastra para reordenar o marca los módulos que deseas ver como accesos rápidos (máximo 6)
          </div>

          <!-- Selected Quick Actions -->
          <div class="q-mb-lg">
            <div class="text-caption text-weight-bold q-mb-sm text-grey-8">
              <q-icon name="star" size="16px" class="q-mr-xs" />
              Accesos seleccionados ({{ selectedQuickActions.length }}/6)
            </div>
            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="(action, index) in selectedQuickActions"
                :key="action.name"
                class="bg-blue-1"
              >
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      icon="arrow_upward"
                      size="sm"
                      :disable="index === 0"
                      @click="moveQuickAction(index, -1)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="arrow_downward"
                      size="sm"
                      :disable="index === selectedQuickActions.length - 1"
                      @click="moveQuickAction(index, 1)"
                    />
                  </div>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon :name="action.icon" :color="getIconColor(action.color)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ action.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="remove_circle"
                    color="negative"
                    size="sm"
                    @click="removeQuickAction(action)"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="selectedQuickActions.length === 0">
                <q-item-section class="text-center text-grey-5 q-pa-md">
                  No hay accesos rápidos seleccionados
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Available Modules -->
          <div>
            <div class="text-caption text-weight-bold q-mb-sm text-grey-8">
              <q-icon name="apps" size="16px" class="q-mr-xs" />
              Módulos disponibles
            </div>
            <q-skeleton v-if="loadingModules" type="rect" height="200px" />
            <q-list v-else bordered separator class="rounded-borders" style="max-height: 300px; overflow-y: auto;">
              <q-item
                v-for="item in flattenedModulesList.filter(i => i.type === 'module')"
                :key="item.id"
                clickable
                :disable="selectedQuickActions.length >= 6 && !isModuleSelected(item)"
                @click="toggleQuickAction(item)"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon || 'link'" color="grey-7" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.title }}</q-item-label>
                  <q-item-label caption>{{ item.sectionName }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon
                    :name="isModuleSelected(item) ? 'check_circle' : 'radio_button_unchecked'"
                    :color="isModuleSelected(item) ? 'positive' : 'grey-5'"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-7" @click="cancelQuickAccessConfig" />
          <q-btn unelevated label="Guardar" color="primary" @click="saveQuickAccessConfig" />
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
  QUICK_ACCESS: 'orderwise_quick_access',
  RECENT_ACCESS: 'orderwise_recent_access'
}

/**
 * Maximum number of recent access items to store
 * @type {number}
 */
const MAX_RECENT_ACCESS = 6

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
  receivable: 0
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
// RECENT ACCESS STATE
// ============================================

/**
 * Recent access history
 * @type {Ref<Array>}
 */
const recentAccess = ref([])

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
  return selectedQuickActions.value.length > 0 ? selectedQuickActions.value : defaultQuickActions
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
  addToRecentAccess({
    label: `Factura #${invoice.invoice_id}`,
    route: 'Invoice',
    params: { id: invoice.id },
    icon: 'receipt'
  })
  router.push({ name: 'Invoice', params: { id: invoice.invoice_id } })
}

/**
 * Handle quick action click (navigate and track)
 * @param {Object} action - Quick action object
 */
const handleQuickActionClick = (action) => {
  addToRecentAccess({
    label: action.label,
    route: action.route || action.link,
    icon: action.icon
  })
  if (action.route) {
    router.push({ name: action.route })
  } else if (action.link) {
    router.push({ name: action.link })
  }
}

/**
 * Navigate to a recent access item
 * @param {Object} recent - Recent access object
 */
const navigateToRecent = (recent) => {
  if (recent.params) {
    router.push({ name: recent.route, params: recent.params })
  } else {
    router.push({ name: recent.route })
  }
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

/**
 * Format recent access timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {string}
 */
const formatRecentTime = (timestamp) => {
  const dateObj = new Date(timestamp)
  const now = new Date()
  const diff = now - dateObj
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) return 'Hace poco'
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`
  return date.formatDate(dateObj, 'DD/MM')
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
    const [categoryData, cashflowData, receivableData] = await Promise.all([
      api.get('reports/category-totals', { params }).catch(() => ({ data: {} })),
      api.get('reports/cashflow-totals', { params }).catch(() => ({ data: {} })),
      api.get('client-statement/kpis', {
        params: {
          branch_office_id: branchOffice.value.id
        }
      }).catch(() => ({ data: {} }))
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
      receivable
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
    }
  } catch (error) {
    console.error('Error loading quick access config:', error)
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

/**
 * Get icon color from gradient string
 * @param {string} colorStr - Color gradient string
 * @returns {string}
 */
const getIconColor = (colorStr) => {
  if (!colorStr) return 'primary'
  const match = colorStr.match(/#[A-Fa-f0-9]{6}/)
  return match ? match[0] : 'primary'
}

// ============================================
// RECENT ACCESS METHODS
// ============================================

/**
 * Load recent access from localStorage
 */
const loadRecentAccess = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_ACCESS)
    if (stored) {
      recentAccess.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading recent access:', error)
  }
}

/**
 * Add item to recent access
 * @param {Object} item - Recent access item
 */
const addToRecentAccess = (item) => {
  const newItem = {
    ...item,
    timestamp: Date.now()
  }

  // Remove duplicate if exists
  const existingIndex = recentAccess.value.findIndex(
    r => r.route === item.route && JSON.stringify(r.params) === JSON.stringify(item.params)
  )
  if (existingIndex >= 0) {
    recentAccess.value.splice(existingIndex, 1)
  }

  // Add to beginning
  recentAccess.value.unshift(newItem)

  // Limit to max items
  if (recentAccess.value.length > MAX_RECENT_ACCESS) {
    recentAccess.value = recentAccess.value.slice(0, MAX_RECENT_ACCESS)
  }

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.RECENT_ACCESS, JSON.stringify(recentAccess.value))
  } catch (error) {
    console.error('Error saving recent access:', error)
  }
}

/**
 * Clear all recent access history
 */
const clearRecentAccess = () => {
  recentAccess.value = []
  localStorage.removeItem(STORAGE_KEYS.RECENT_ACCESS)
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
  loadRecentAccess()
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
}

body.body--dark .recent-pill__label {
  color: #f1f5f9;
}

.recent-pill__time {
  font-size: 10px;
  color: #94a3b8;
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
</style>
