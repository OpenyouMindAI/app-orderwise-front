<template>
  <q-page class="admin-dashboard-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <q-icon name="dashboard" size="32px" color="primary" />
          <div class="header-text">
            <h1 class="page-title">Dashboard de Administración</h1>
            <p class="page-subtitle">Control y monitoreo de usuarios, empresas y suscripciones</p>
          </div>
        </div>
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          @click="loadAllData"
          :loading="loading"
        >
          <q-tooltip>Actualizar datos</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <!-- Usuarios -->
        <q-card class="stat-card users-card">
          <q-card-section>
            <div class="stat-header">
              <q-icon name="people" size="32px" color="primary" />
              <span class="stat-label">Usuarios</span>
            </div>
            <div class="stat-value">{{ stats.users?.total || 0 }}</div>
            <div class="stat-details">
              <div class="stat-item">
                <span class="label">Hoy:</span>
                <span class="value">{{ stats.users?.today || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Esta semana:</span>
                <span class="value">{{ stats.users?.this_week || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Este mes:</span>
                <span class="value">{{ stats.users?.this_month || 0 }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Empresas -->
        <q-card class="stat-card companies-card">
          <q-card-section>
            <div class="stat-header">
              <q-icon name="business" size="32px" color="positive" />
              <span class="stat-label">Empresas</span>
            </div>
            <div class="stat-value">{{ stats.companies?.total || 0 }}</div>
            <div class="stat-details">
              <div class="stat-item">
                <span class="label">Con facturación:</span>
                <span class="value">{{ stats.companies?.with_billing || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Hoy:</span>
                <span class="value">{{ stats.companies?.today || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Este mes:</span>
                <span class="value">{{ stats.companies?.this_month || 0 }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Suscripciones -->
        <q-card class="stat-card subscriptions-card">
          <q-card-section>
            <div class="stat-header">
              <q-icon name="card_membership" size="32px" color="secondary" />
              <span class="stat-label">Suscripciones</span>
            </div>
            <div class="stat-value">{{ stats.subscriptions?.total || 0 }}</div>
            <div class="stat-details">
              <div class="stat-item">
                <span class="label">Activas:</span>
                <span class="value text-positive">{{ stats.subscriptions?.active || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Por vencer:</span>
                <span class="value text-warning">{{ stats.subscriptions?.expiring || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Expiradas:</span>
                <span class="value text-negative">{{ stats.subscriptions?.expired || 0 }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- Crecimiento de Usuarios -->
        <q-card class="chart-card">
          <q-card-section>
            <div class="chart-header">
              <h3 class="chart-title">Crecimiento de Usuarios</h3>
              <q-icon name="trending_up" size="24px" color="primary" />
            </div>
            <div class="chart-container" ref="usersChart"></div>
          </q-card-section>
        </q-card>

        <!-- Crecimiento de Empresas -->
        <q-card class="chart-card">
          <q-card-section>
            <div class="chart-header">
              <h3 class="chart-title">Crecimiento de Empresas</h3>
              <q-icon name="trending_up" size="24px" color="positive" />
            </div>
            <div class="chart-container" ref="companiesChart"></div>
          </q-card-section>
        </q-card>

        <!-- Suscripciones por Plan -->
        <q-card class="chart-card">
          <q-card-section>
            <div class="chart-header">
              <h3 class="chart-title">Suscripciones por Plan</h3>
              <q-icon name="pie_chart" size="24px" color="secondary" />
            </div>
            <div class="chart-container" ref="subscriptionsChart"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Activity Tabs -->
    <div class="activity-section">
      <q-card class="activity-card">
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="users" icon="people" label="Últimos Usuarios" />
          <q-tab name="companies" icon="business" label="Últimas Empresas" />
          <q-tab name="subscriptions" icon="card_membership" label="Últimas Suscripciones" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Últimos Usuarios -->
          <q-tab-panel name="users">
            <div class="panel-header">
              <h3>Últimos Usuarios Registrados</h3>
              <q-btn
                flat
                dense
                label="Ver todos"
                color="primary"
                @click="showUsersDialog = true"
              />
            </div>
            <q-list separator>
              <q-item v-for="user in recentUsers" :key="user.id" class="recent-item">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-badge :color="getRoleColor(user.role)">
                      {{ user.role }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>{{ user.created_at_human }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="recentUsers.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey">
                    No hay usuarios recientes
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Últimas Empresas -->
          <q-tab-panel name="companies">
            <div class="panel-header">
              <h3>Últimas Empresas Registradas</h3>
              <q-btn
                flat
                dense
                label="Ver todas"
                color="primary"
                @click="showCompaniesDialog = true"
              />
            </div>
            <q-list separator>
              <q-item v-for="company in recentCompanies" :key="company.id" class="recent-item">
                <q-item-section avatar>
                  <q-avatar color="positive" text-color="white">
                    <q-icon name="business" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ company.name }}</q-item-label>
                  <q-item-label caption>{{ company.business_type }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-badge :color="company.billing ? 'positive' : 'grey'">
                      {{ company.subscription_plan }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption>{{ company.created_at_human }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="recentCompanies.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey">
                    No hay empresas recientes
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <!-- Últimas Suscripciones -->
          <q-tab-panel name="subscriptions">
            <div class="panel-header">
              <h3>Últimas Suscripciones</h3>
              <q-btn
                flat
                dense
                label="Ver todas"
                color="primary"
                @click="showSubscriptionsDialog = true"
              />
            </div>
            <q-list separator>
              <q-item v-for="sub in recentSubscriptions" :key="sub.id" class="recent-item">
                <q-item-section avatar>
                  <q-avatar color="secondary" text-color="white">
                    <q-icon name="card_membership" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ sub.company_name }}</q-item-label>
                  <q-item-label caption>{{ sub.plan_name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>
                    <q-badge :color="getStatusColor(sub.status)">
                      {{ sub.status }}
                    </q-badge>
                  </q-item-label>
                  <q-item-label caption v-if="sub.days_left !== null">
                    {{ sub.days_left }} días restantes
                  </q-item-label>
                  <q-item-label caption v-else>{{ sub.created_at_human }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="recentSubscriptions.length === 0">
                <q-item-section>
                  <q-item-label class="text-center text-grey">
                    No hay suscripciones recientes
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <!-- Dialogs for Full Lists -->
    <!-- Users List Dialog -->
    <q-dialog v-model="showUsersDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-card">
        <q-toolbar class="dialog-toolbar users-toolbar">
          <q-icon name="people" size="sm" class="q-mr-sm" />
          <q-toolbar-title>Lista Completa de Usuarios</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-input
            v-model="usersSearch"
            placeholder="Buscar por nombre o email..."
            dense
            outlined
            clearable
            @update:model-value="loadUsersList"
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="usersList"
            :columns="usersColumns"
            row-key="id"
            :loading="loadingUsers"
            :pagination="usersPagination"
            @request="onUsersRequest"
            flat
            bordered
            class="modern-table q-mt-md"
            :rows-per-page-options="[10, 15, 25, 50]"
            :grid="$q.screen.lt.md"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>

            <!-- Grid mode for mobile -->
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card flat bordered class="mobile-card">
                  <q-card-section>
                    <div class="text-h6 text-primary">{{ props.row.name }}</div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="email" size="xs" class="q-mr-xs" />
                      {{ props.row.email }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="business" size="xs" class="q-mr-xs" />
                      {{ props.row.company_name }}
                    </div>
                    <div class="text-caption text-grey-6 q-mt-sm">
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      {{ props.row.created_at_human }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Companies List Dialog -->
    <q-dialog v-model="showCompaniesDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-card">
        <q-toolbar class="dialog-toolbar companies-toolbar">
          <q-icon name="business" size="sm" class="q-mr-sm" />
          <q-toolbar-title>Lista Completa de Empresas</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-input
            v-model="companiesSearch"
            placeholder="Buscar por nombre de empresa..."
            dense
            outlined
            clearable
            @update:model-value="loadCompaniesList"
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-table
            :rows="companiesList"
            :columns="companiesColumns"
            row-key="id"
            :loading="loadingCompanies"
            :pagination="companiesPagination"
            @request="onCompaniesRequest"
            flat
            bordered
            class="modern-table q-mt-md"
            :rows-per-page-options="[10, 15, 25, 50]"
            :grid="$q.screen.lt.md"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="positive" />
            </template>

            <!-- Grid mode for mobile -->
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card flat bordered class="mobile-card">
                  <q-card-section>
                    <div class="row items-center q-mb-sm">
                      <div class="text-h6 text-positive col">{{ props.row.name }}</div>
                      <q-badge v-if="props.row.billing" color="positive" label="Facturación" />
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="category" size="xs" class="q-mr-xs" />
                      {{ props.row.business_type }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="card_membership" size="xs" class="q-mr-xs" />
                      Plan: <strong>{{ props.row.subscription_plan }}</strong>
                    </div>
                    <div class="text-caption text-grey-6 q-mt-sm">
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      {{ props.row.created_at_human }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Subscriptions List Dialog -->
    <q-dialog v-model="showSubscriptionsDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-card">
        <q-toolbar class="dialog-toolbar subscriptions-toolbar">
          <q-icon name="card_membership" size="sm" class="q-mr-sm" />
          <q-toolbar-title>Lista Completa de Suscripciones</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-8">
              <q-input
                v-model="subscriptionsSearch"
                placeholder="Buscar por empresa..."
                dense
                outlined
                clearable
                @update:model-value="loadSubscriptionsList"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="subscriptionsStatus"
                :options="statusOptions"
                placeholder="Filtrar por estado"
                dense
                outlined
                clearable
                @update:model-value="loadSubscriptionsList"
              >
                <template v-slot:prepend>
                  <q-icon name="filter_list" />
                </template>
              </q-select>
            </div>
          </div>

          <q-table
            :rows="subscriptionsList"
            :columns="subscriptionsColumns"
            row-key="id"
            :loading="loadingSubscriptions"
            :pagination="subscriptionsPagination"
            @request="onSubscriptionsRequest"
            flat
            bordered
            class="modern-table"
            :rows-per-page-options="[10, 15, 25, 50]"
            :grid="$q.screen.lt.md"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="warning" />
            </template>

            <!-- Grid mode for mobile -->
            <template v-slot:item="props">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
                <q-card flat bordered class="mobile-card">
                  <q-card-section>
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="text-h6 text-warning">{{ props.row.company_name }}</div>
                      <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
                    </div>
                    <div class="text-subtitle2 text-grey-8 q-mb-xs">
                      <q-icon name="card_membership" size="xs" class="q-mr-xs" />
                      {{ props.row.plan_name }}
                    </div>
                    <q-separator class="q-my-sm" />
                    <div class="text-caption text-grey-7">
                      <div class="q-mb-xs">
                        <q-icon name="event" size="xs" class="q-mr-xs" />
                        Inicio: {{ props.row.start_date }}
                      </div>
                      <div class="q-mb-xs">
                        <q-icon name="event_busy" size="xs" class="q-mr-xs" />
                        Fin: {{ props.row.end_date }}
                      </div>
                      <div v-if="props.row.days_left !== null" class="q-mt-sm">
                        <q-badge
                          :color="props.row.days_left <= 7 ? 'negative' : 'positive'"
                          :label="`${props.row.days_left} días restantes`"
                        />
                      </div>
                    </div>
                    <div class="text-caption text-grey-6 q-mt-sm">
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      {{ props.row.created_at_human }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue'
import { api } from 'src/boot/axios'
import Highcharts from 'highcharts'

export default {
  name: 'AdminDashboard',
  setup () {
    const loading = ref(false)
    const stats = ref({})
    const recentUsers = ref([])
    const recentCompanies = ref([])
    const recentSubscriptions = ref([])
    const activeTab = ref('users')

    // Charts refs
    const usersChart = ref(null)
    const companiesChart = ref(null)
    const subscriptionsChart = ref(null)

    // Dialogs
    const showUsersDialog = ref(false)
    const showCompaniesDialog = ref(false)
    const showSubscriptionsDialog = ref(false)

    // Lists
    const usersList = ref([])
    const companiesList = ref([])
    const subscriptionsList = ref([])
    const usersSearch = ref('')
    const companiesSearch = ref('')
    const subscriptionsSearch = ref('')
    const subscriptionsStatus = ref(null)
    const loadingUsers = ref(false)
    const loadingCompanies = ref(false)
    const loadingSubscriptions = ref(false)

    // Pagination configs
    const usersPagination = ref({
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0
    })

    const companiesPagination = ref({
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0
    })

    const subscriptionsPagination = ref({
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0
    })

    const statusOptions = ['active', 'expired', 'cancelled']

    // Table columns
    const usersColumns = [
      { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
      { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
      { name: 'role', label: 'Rol', field: 'role', align: 'left', sortable: true },
      { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
      { name: 'created_at_human', label: 'Registrado', field: 'created_at_human', align: 'left', sortable: true }
    ]

    const companiesColumns = [
      { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
      { name: 'business_type', label: 'Tipo', field: 'business_type', align: 'left', sortable: true },
      { name: 'subscription_plan', label: 'Plan', field: 'subscription_plan', align: 'left', sortable: true },
      { name: 'billing', label: 'Facturación', field: 'billing', align: 'center', sortable: true },
      { name: 'created_at_human', label: 'Creada', field: 'created_at_human', align: 'left', sortable: true }
    ]

    const subscriptionsColumns = [
      { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
      { name: 'plan_name', label: 'Plan', field: 'plan_name', align: 'left', sortable: true },
      { name: 'status', label: 'Estado', field: 'status', align: 'center', sortable: true },
      { name: 'days_left', label: 'Días Restantes', field: 'days_left', align: 'center', sortable: true },
      { name: 'start_date', label: 'Inicio', field: 'start_date', align: 'left', sortable: true },
      { name: 'end_date', label: 'Fin', field: 'end_date', align: 'left', sortable: true }
    ]

    const loadStats = async () => {
      try {
        const { data } = await api.get('admin-dashboard/stats')
        stats.value = data
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    const loadRecentUsers = async () => {
      try {
        const { data } = await api.get('admin-dashboard/recent-users', { params: { limit: 10 } })
        recentUsers.value = data
      } catch (error) {
        console.error('Error loading recent users:', error)
      }
    }

    const loadRecentCompanies = async () => {
      try {
        const { data } = await api.get('admin-dashboard/recent-companies', { params: { limit: 10 } })
        recentCompanies.value = data
      } catch (error) {
        console.error('Error loading recent companies:', error)
      }
    }

    const loadRecentSubscriptions = async () => {
      try {
        const { data } = await api.get('admin-dashboard/recent-subscriptions', { params: { limit: 10 } })
        recentSubscriptions.value = data
      } catch (error) {
        console.error('Error loading recent subscriptions:', error)
      }
    }

    const loadUsersList = async (page = 1, perPage = 15) => {
      loadingUsers.value = true
      try {
        const { data } = await api.get('admin-dashboard/users-list', {
          params: {
            search: usersSearch.value,
            per_page: perPage,
            page
          }
        })
        usersList.value = data.data
        usersPagination.value.rowsNumber = data.total
        usersPagination.value.page = data.current_page
        usersPagination.value.rowsPerPage = data.per_page
      } catch (error) {
        console.error('Error loading users list:', error)
      } finally {
        loadingUsers.value = false
      }
    }

    const onUsersRequest = (props) => {
      const { page, rowsPerPage } = props.pagination
      loadUsersList(page, rowsPerPage)
    }

    const loadCompaniesList = async (page = 1, perPage = 15) => {
      loadingCompanies.value = true
      try {
        const { data } = await api.get('admin-dashboard/companies-list', {
          params: {
            search: companiesSearch.value,
            per_page: perPage,
            page
          }
        })
        companiesList.value = data.data
        companiesPagination.value.rowsNumber = data.total
        companiesPagination.value.page = data.current_page
        companiesPagination.value.rowsPerPage = data.per_page
      } catch (error) {
        console.error('Error loading companies list:', error)
      } finally {
        loadingCompanies.value = false
      }
    }

    const onCompaniesRequest = (props) => {
      const { page, rowsPerPage } = props.pagination
      loadCompaniesList(page, rowsPerPage)
    }

    const loadSubscriptionsList = async (page = 1, perPage = 15) => {
      loadingSubscriptions.value = true
      try {
        const { data } = await api.get('admin-dashboard/subscriptions-list', {
          params: {
            search: subscriptionsSearch.value,
            status: subscriptionsStatus.value,
            per_page: perPage,
            page
          }
        })
        subscriptionsList.value = data.data
        subscriptionsPagination.value.rowsNumber = data.total
        subscriptionsPagination.value.page = data.current_page
        subscriptionsPagination.value.rowsPerPage = data.per_page
      } catch (error) {
        console.error('Error loading subscriptions list:', error)
      } finally {
        loadingSubscriptions.value = false
      }
    }

    const onSubscriptionsRequest = (props) => {
      const { page, rowsPerPage } = props.pagination
      loadSubscriptionsList(page, rowsPerPage)
    }

    const createUsersChart = () => {
      if (!usersChart.value || !stats.value.users?.growth) return

      const growth = stats.value.users.growth

      Highcharts.chart(usersChart.value, {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Inter, Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: growth.map(item => item.month),
          lineColor: 'rgba(255, 255, 255, 0.1)',
          tickColor: 'rgba(255, 255, 255, 0.1)',
          labels: {
            style: {
              color: '#999',
              fontSize: '11px'
            }
          }
        },
        yAxis: {
          title: {
            text: null
          },
          gridLineColor: 'rgba(255, 255, 255, 0.05)',
          labels: {
            style: {
              color: '#999',
              fontSize: '11px'
            }
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          areaspline: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, 'rgba(25, 118, 210, 0.3)'],
                [1, 'rgba(25, 118, 210, 0.05)']
              ]
            },
            lineWidth: 3,
            marker: {
              enabled: true,
              radius: 4,
              fillColor: '#1976D2',
              lineWidth: 2,
              lineColor: '#fff',
              states: {
                hover: {
                  radius: 6
                }
              }
            }
          }
        },
        series: [{
          name: 'Usuarios',
          data: growth.map(item => item.count),
          color: '#1976D2'
        }],
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderWidth: 0,
          borderRadius: 8,
          style: {
            color: '#fff',
            fontSize: '12px'
          },
          formatter: function () {
            return `<b>${this.x}</b><br/>Usuarios: <b>${this.y}</b>`
          }
        }
      })
    }

    const createCompaniesChart = () => {
      if (!companiesChart.value || !stats.value.companies?.growth) return

      const growth = stats.value.companies.growth

      Highcharts.chart(companiesChart.value, {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Inter, Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: growth.map(item => item.month),
          lineColor: 'rgba(255, 255, 255, 0.1)',
          tickColor: 'rgba(255, 255, 255, 0.1)',
          labels: {
            style: {
              color: '#999',
              fontSize: '11px'
            }
          }
        },
        yAxis: {
          title: {
            text: null
          },
          gridLineColor: 'rgba(255, 255, 255, 0.05)',
          labels: {
            style: {
              color: '#999',
              fontSize: '11px'
            }
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          areaspline: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, 'rgba(33, 186, 69, 0.3)'],
                [1, 'rgba(33, 186, 69, 0.05)']
              ]
            },
            lineWidth: 3,
            marker: {
              enabled: true,
              radius: 4,
              fillColor: '#21BA45',
              lineWidth: 2,
              lineColor: '#fff',
              states: {
                hover: {
                  radius: 6
                }
              }
            }
          }
        },
        series: [{
          name: 'Empresas',
          data: growth.map(item => item.count),
          color: '#21BA45'
        }],
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderWidth: 0,
          borderRadius: 8,
          style: {
            color: '#fff',
            fontSize: '12px'
          },
          formatter: function () {
            return `<b>${this.x}</b><br/>Empresas: <b>${this.y}</b>`
          }
        }
      })
    }

    const createSubscriptionsChart = () => {
      if (!subscriptionsChart.value || !stats.value.subscriptions?.by_plan) return

      const byPlan = stats.value.subscriptions.by_plan

      Highcharts.chart(subscriptionsChart.value, {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Inter, Roboto, sans-serif'
          }
        },
        title: {
          text: null
        },
        credits: {
          enabled: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderWidth: 0,
          borderRadius: 8,
          style: {
            color: '#fff',
            fontSize: '12px'
          },
          pointFormat: '<b>{point.y}</b> suscripciones<br/><span style="font-size:10px">{point.percentage:.1f}%</span>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y}',
              style: {
                color: '#999',
                fontSize: '11px',
                fontWeight: '400',
                textOutline: 'none'
              },
              distance: 15
            },
            showInLegend: false,
            innerSize: '50%',
            states: {
              hover: {
                brightness: 0.1
              }
            }
          }
        },
        series: [{
          name: 'Suscripciones',
          colorByPoint: true,
          data: byPlan.map((item, index) => ({
            name: item.plan_name,
            y: item.total,
            color: ['#1976D2', '#21BA45', '#F2C037', '#C10015', '#9C27B0'][index]
          }))
        }]
      })
    }

    const loadAllData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadStats(),
          loadRecentUsers(),
          loadRecentCompanies(),
          loadRecentSubscriptions()
        ])

        await nextTick()
        createUsersChart()
        createCompaniesChart()
        createSubscriptionsChart()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        loading.value = false
      }
    }

    const getRoleColor = (role) => {
      const colors = {
        super_admin: 'red',
        admin: 'orange',
        user: 'primary',
        seller: 'positive'
      }
      return colors[role] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        active: 'positive',
        expired: 'negative',
        cancelled: 'grey'
      }
      return colors[status] || 'grey'
    }

    // Watch para cargar listas cuando se abren los diálogos
    watch(showUsersDialog, (newVal) => {
      if (newVal) {
        loadUsersList()
      }
    })

    watch(showCompaniesDialog, (newVal) => {
      if (newVal) {
        loadCompaniesList()
      }
    })

    watch(showSubscriptionsDialog, (newVal) => {
      if (newVal) {
        loadSubscriptionsList()
      }
    })

    onMounted(() => {
      loadAllData()
    })

    return {
      loading,
      stats,
      recentUsers,
      recentCompanies,
      recentSubscriptions,
      activeTab,
      usersChart,
      companiesChart,
      subscriptionsChart,
      showUsersDialog,
      showCompaniesDialog,
      showSubscriptionsDialog,
      usersList,
      companiesList,
      subscriptionsList,
      usersSearch,
      companiesSearch,
      subscriptionsSearch,
      subscriptionsStatus,
      statusOptions,
      loadingUsers,
      loadingCompanies,
      loadingSubscriptions,
      usersColumns,
      companiesColumns,
      subscriptionsColumns,
      loadAllData,
      loadUsersList,
      loadCompaniesList,
      loadSubscriptionsList,
      usersPagination,
      companiesPagination,
      subscriptionsPagination,
      onUsersRequest,
      onCompaniesRequest,
      onSubscriptionsRequest,
      getRoleColor,
      getStatusColor
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-dashboard-page {
  padding: 24px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.page-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1976D2, #21BA45, #F2C037);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
  }
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;

  .label {
    color: #666;
  }

  .value {
    font-weight: 600;
    color: #1a1a1a;
  }
}

.charts-section {
  margin-bottom: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.chart-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.chart-container {
  height: 280px;
  position: relative;
  padding: 8px 0;
}

.activity-section {
  margin-bottom: 24px;
}

.activity-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.recent-item {
  padding: 12px 16px;

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
}

// Dialog styles
.dialog-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.dialog-toolbar {
  min-height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.users-toolbar {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  color: white;
}

.companies-toolbar {
  background: linear-gradient(135deg, #21BA45 0%, #16AB39 100%);
  color: white;
}

.subscriptions-toolbar {
  background: linear-gradient(135deg, #F2C037 0%, #F2B824 100%);
  color: white;
}

.search-input {
  max-width: 100%;

  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.modern-table {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;

  :deep(thead tr th) {
    background: #f5f5f5;
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  :deep(tbody tr:hover) {
    background: rgba(0, 0, 0, 0.02);
  }
}

.mobile-card {
  transition: all 0.3s ease;
  border-radius: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}

body.body--dark {
  .admin-dashboard-page {
    background: linear-gradient(135deg, #0a0e27 0%, #1a1d35 100%);
  }

  .header-content {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .stat-card {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &::before {
      background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
    }

    &:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    }
  }

  .chart-card {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
  }

  .activity-card {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .dialog-card {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
  }

  .users-toolbar {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  }

  .companies-toolbar {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  .subscriptions-toolbar {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .search-input {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    :deep(.q-field__native),
    :deep(.q-field__label) {
      color: #e5e7eb;
    }

    :deep(.q-icon) {
      color: #9ca3af;
    }
  }

  .modern-table {
    background: transparent;

    :deep(thead tr th) {
      background: #252842;
      color: #e5e7eb;
      border-color: rgba(255, 255, 255, 0.1);
    }

    :deep(tbody tr) {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.05);
    }

    :deep(tbody tr:hover) {
      background: rgba(255, 255, 255, 0.08);
    }

    :deep(td) {
      color: #e5e7eb;
      border-color: rgba(255, 255, 255, 0.05);
    }
  }

  .mobile-card {
    background: linear-gradient(135deg, #1e2139 0%, #252842 100%);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
    }

    .text-primary {
      color: #60a5fa !important;
    }

    .text-positive {
      color: #34d399 !important;
    }

    .text-warning {
      color: #fbbf24 !important;
    }

    .text-grey-7,
    .text-caption {
      color: #9ca3af !important;
    }

    .text-grey-6 {
      color: #6b7280 !important;
    }
  }

  .page-title,
  .stat-value,
  .chart-title,
  .panel-header h3 {
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }

  .page-subtitle,
  .stat-label,
  .stat-item .label {
    color: #9ca3af;
  }

  .stat-item .value {
    color: #e5e7eb;
  }

  .chart-header {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .recent-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

@media (max-width: 768px) {
  .admin-dashboard-page {
    padding: 16px;
  }

  .stats-grid,
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 20px;
  }

  .stat-value {
    font-size: 28px;
  }
}
</style>
