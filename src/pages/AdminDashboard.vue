<template>
  <q-page class="admin-dashboard-page section-fade-in">
    <div class="header-cockpit section-fade-in">
      <div class="cockpit-glow"></div>
      <div class="row items-center no-wrap q-px-sm">
        <div class="col-6">
          <div class="greeting-block">
            <div class="greeting-main text-uppercase">{{ greeting }}</div>
            <div class="greeting-name text-weight-bold text-primary">{{ userName }}</div>
          </div>
        </div>
        <div class="col-6 text-right">
          <div class="date-chip-premium">
            <q-icon name="calendar_today" size="13px" class="q-mr-xs mobile-hide" />
            <div class="date-stack">
              <span class="date-day text-capitalize">{{ currentDate.split(',')[0] }}</span>
              <span class="date-full">{{ currentDate.split(',')[1] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Bento Grid -->
    <div class="bento-grid">
      <!-- ROW 1: Statistics (Users, Companies, Subscriptions) -->
      <!-- Usuarios -->
      <div class="bento-item stat-hero users-tile clickable" @click="showUsersDialog = true">
        <div class="stat-icon-wrap bg-soft-primary">
          <q-icon name="people" size="28px" color="primary" />
        </div>
        <div class="stat-data text-left">
          <q-skeleton v-if="loading" type="text" width="60px" />
          <div v-else class="stat-val text-primary">{{ stats.users?.total || 0 }}</div>
          <div class="stat-lab">Total Usuarios</div>
          <div class="stat-trend grow" v-if="stats.users?.today > 0">
            <q-icon name="arrow_upward" size="10px" /> +{{ stats.users.today }} hoy
          </div>
        </div>
      </div>

      <!-- Empresas -->
      <div class="bento-item stat-hero companies-tile clickable" @click="showCompaniesDialog = true">
        <div class="stat-icon-wrap bg-soft-positive">
          <q-icon name="business" size="28px" color="positive" />
        </div>
        <div class="stat-data text-left">
          <q-skeleton v-if="loading" type="text" width="60px" />
          <div v-else class="stat-val text-positive">{{ stats.companies?.total || 0 }}</div>
          <div class="stat-lab">Empresas</div>
          <div class="stat-trend grow" v-if="stats.companies?.today > 0">
            <q-icon name="arrow_upward" size="10px" /> +{{ stats.companies.today }} hoy
          </div>
        </div>
      </div>

      <!-- Suscripciones Activas -->
      <div class="bento-item stat-hero subscriptions-tile clickable" @click="showSubscriptionsDialog = true">
        <div class="stat-icon-wrap bg-soft-warning">
          <q-icon name="card_membership" size="28px" color="warning" />
        </div>
        <div class="stat-data text-left">
          <q-skeleton v-if="loading" type="text" width="60px" />
          <div v-else class="stat-val text-warning">{{ stats.subscriptions?.active || 0 }}</div>
          <div class="stat-lab">Suscripciones</div>
        </div>
      </div>

      <!-- Alertas por vencer -->
      <div class="bento-item stat-hero alerts-tile clickable" @click="showSubscriptionsDialog = true; subscriptionsStatus = 'active'">
        <div class="stat-icon-wrap bg-soft-negative">
          <q-icon name="notification_important" size="28px" color="negative" />
        </div>
        <div class="stat-data text-left">
          <q-skeleton v-if="loading" type="text" width="60px" />
          <div v-else class="stat-val text-negative">{{ stats.subscriptions?.expiring || 0 }}</div>
          <div class="stat-lab">Por Vencer</div>
          <div class="stat-trend grow bg-soft-negative text-negative" style="font-size: 8px;">Acción requerida</div>
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="bento-item chart-bento span-2-desktop">
        <div class="bento-header">
          <q-icon name="insights" size="18px" class="q-mr-xs" color="primary" />
          <span>Crecimiento de Usuarios</span>
          <q-space />
          <q-badge color="primary" label="12 meses" outline />
        </div>
        <div class="chart-container-premium q-mt-md" ref="usersChartRef"></div>
      </div>

      <!-- Companies Growth Chart -->
      <div class="bento-item chart-bento span-2-desktop">
        <div class="bento-header">
          <q-icon name="trending_up" size="18px" class="q-mr-xs" color="positive" />
          <span>Crecimiento de Empresas</span>
          <q-space />
          <q-badge color="positive" label="12 meses" outline />
        </div>
        <div class="chart-container-premium q-mt-md" ref="companiesChartRef"></div>
      </div>

      <!-- Subscriptions Pie Chart -->
      <div class="bento-item chart-bento span-full-mobile span-1-desktop">
        <div class="bento-header">
          <q-icon name="pie_chart" size="18px" class="q-mr-xs" color="secondary" />
          <span>Suscripciones por Plan</span>
        </div>
        <div class="chart-container-premium q-mt-md" style="height: 250px;" ref="subscriptionsChartRef"></div>
      </div>

      <!-- Recent Activity Tabs (Users, Companies, Subscriptions) -->
      <div class="bento-item activity-bento span-3-desktop section-fade-in">
        <div class="row items-center justify-between q-mb-md">
          <q-tabs
            v-model="activeTab"
            dense
            no-caps
            class="premium-tabs"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="users" label="Usuarios" />
            <q-tab name="companies" label="Empresas" />
            <q-tab name="subscriptions" label="Suscripciones" />
          </q-tabs>
          <q-btn
            flat
            dense
            no-caps
            label="Ver Todo"
            color="primary"
            size="11px"
            class="rounded-button"
            @click="openFullList"
          />
        </div>

        <div class="activity-timeline q-mt-sm">
          <q-tab-panels v-model="activeTab" animated class="bg-transparent no-shadow">
            <!-- Users Panel -->
            <q-tab-panel name="users" class="q-pa-none">
              <div v-if="recentUsers.length > 0">
                <div v-for="user in recentUsers" :key="user.id" class="timeline-node clickable" @click="openDetail(user.id, 'user')">
                  <div class="node-time">{{ formatTime(user.created_at) }}</div>
                  <div class="node-line"></div>
                  <div class="node-content">
                    <div class="node-header">
                      <span class="node-title">{{ user.name }}</span>
                    </div>
                    <div class="node-subtitle ellipsis">{{ user.email }} • {{ user.company_name }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-compact flex flex-center">
                <div class="text-caption opacity-40">No hay usuarios recientes</div>
              </div>
            </q-tab-panel>

            <!-- Companies Panel -->
            <q-tab-panel name="companies" class="q-pa-none">
              <div v-if="recentCompanies.length > 0">
                <div v-for="company in recentCompanies" :key="company.id" class="timeline-node clickable" @click="openDetail(company.id, 'company')">
                  <div class="node-time">{{ formatTime(company.created_at) }}</div>
                  <div class="node-line color-positive"></div>
                  <div class="node-content">
                    <div class="node-header">
                      <span class="node-title">{{ company.name }}</span>
                      <q-badge color="positive" outline size="sm" style="font-size: 9px; margin-left: 8px;">{{ company.subscription_plan }}</q-badge>
                    </div>
                    <div class="node-subtitle">{{ company.business_type }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-compact flex flex-center">
                <div class="text-caption opacity-40">No hay empresas recientes</div>
              </div>
            </q-tab-panel>

            <!-- Subscriptions Panel -->
            <q-tab-panel name="subscriptions" class="q-pa-none">
              <div v-if="recentSubscriptions.length > 0">
                <div v-for="sub in recentSubscriptions" :key="sub.id" class="timeline-node clickable" @click="openDetail(sub.id, 'subscription')">
                  <div class="node-time">{{ formatTime(sub.created_at) }}</div>
                  <div class="node-line color-warning"></div>
                  <div class="node-content">
                    <div class="node-header">
                      <span class="node-title">{{ sub.company_name }}</span>
                      <q-badge :color="getStatusColor(sub.status)" size="sm" style="font-size: 9px">{{ sub.status }}</q-badge>
                    </div>
                    <div class="node-subtitle">{{ sub.plan_name }} • {{ sub.days_left !== null ? sub.days_left + ' días restantes' : 'Expirada' }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-compact flex flex-center">
                <div class="text-caption opacity-40">No hay suscripciones recientes</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         SECCIÓN: Retención & Engagement
         Muestra métricas de actividad de empresas con plan pago:
         - KPIs de retención
         - Desglose por plan
         - Empresas sin actividad
         - Empresas activas hoy
    ════════════════════════════════════════════════════════════════ -->
    <div class="q-px-md q-pb-md q-mt-lg">
      <!-- Header de sección -->
      <div class="row items-center q-mb-md">
        <q-icon name="insights" size="22px" color="deep-purple" class="q-mr-sm" />
        <span class="text-subtitle1 text-weight-bold">Retención & Engagement</span>
        <q-space />
        <q-badge color="deep-purple" outline label="Empresas con plan pago" />
      </div>

      <!-- KPI Cards -->
      <div class="bento-grid q-mb-lg">
        <!-- Empresas con plan pago -->
        <div class="bento-item stat-hero">
          <div class="stat-icon-wrap" style="background: #f3e8ff;">
            <q-icon name="card_membership" size="28px" color="deep-purple" />
          </div>
          <div class="stat-data text-left">
            <q-skeleton v-if="loadingEngagement" type="text" width="50px" />
            <div v-else class="stat-val" style="color: #7c3aed;">{{ engagementData.kpis.paid_total || 0 }}</div>
            <div class="stat-lab">Planes Pagos</div>
          </div>
        </div>

        <!-- Activas últimos 7 días -->
        <div class="bento-item stat-hero">
          <div class="stat-icon-wrap bg-soft-positive">
            <q-icon name="trending_up" size="28px" color="positive" />
          </div>
          <div class="stat-data text-left">
            <q-skeleton v-if="loadingEngagement" type="text" width="50px" />
            <div v-else class="stat-val text-positive">{{ engagementData.kpis.active_7d || 0 }}</div>
            <div class="stat-lab">Activas (7 días)</div>
            <div class="stat-trend grow" v-if="!loadingEngagement && engagementData.kpis.paid_total">
              {{ Math.round((engagementData.kpis.active_7d / engagementData.kpis.paid_total) * 100) }}% retención
            </div>
          </div>
        </div>

        <!-- Activas hoy -->
        <div class="bento-item stat-hero">
          <div class="stat-icon-wrap bg-soft-primary">
            <q-icon name="bolt" size="28px" color="primary" />
          </div>
          <div class="stat-data text-left">
            <q-skeleton v-if="loadingEngagement" type="text" width="50px" />
            <div v-else class="stat-val text-primary">{{ engagementData.kpis.active_24h || 0 }}</div>
            <div class="stat-lab">Activas Hoy</div>
          </div>
        </div>

        <!-- Sin actividad -->
        <div class="bento-item stat-hero">
          <div class="stat-icon-wrap bg-soft-negative">
            <q-icon name="warning_amber" size="28px" color="negative" />
          </div>
          <div class="stat-data text-left">
            <q-skeleton v-if="loadingEngagement" type="text" width="50px" />
            <div v-else class="stat-val text-negative">{{ (engagementData.kpis.never_invoiced || 0) + (engagementData.kpis.inactive_30d || 0) }}</div>
            <div class="stat-lab">En Riesgo</div>
            <div class="stat-trend" style="background: rgba(239,68,68,0.1); color: #ef4444;" v-if="!loadingEngagement">
              {{ engagementData.kpis.never_invoiced || 0 }} nunca facturaron
            </div>
          </div>
        </div>
      </div>

      <!-- Desglose por plan + tablas en dos columnas -->
      <div class="row q-col-gutter-lg">
        <!-- Desglose por plan -->
        <div class="col-12 col-md-4">
          <div class="bento-item" style="height: 100%;">
            <div class="bento-header q-mb-md">
              <q-icon name="pie_chart" size="16px" class="q-mr-xs" color="deep-purple" />
              <span>Por Plan</span>
            </div>
            <q-skeleton v-if="loadingEngagement" type="rect" height="120px" />
            <div v-else>
              <div v-for="plan in engagementData.by_plan" :key="plan.slug" class="q-mb-md">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="text-caption text-weight-bold">{{ plan.plan_name }}</span>
                  <q-badge color="grey-5" text-color="dark" :label="`${plan.total} empresas`" />
                </div>
                <div class="row items-center q-gutter-xs">
                  <q-badge color="positive" :label="`${plan.active_7d} activas`" />
                  <q-badge color="negative" :label="`${plan.never_invoiced} sin uso`" />
                </div>
                <q-linear-progress
                  :value="plan.total > 0 ? plan.active_7d / plan.total : 0"
                  color="positive"
                  track-color="grey-3"
                  size="6px"
                  class="q-mt-xs"
                  rounded
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla empresas inactivas -->
        <div class="col-12 col-md-8">
          <div class="bento-item">
            <div class="bento-header q-mb-md">
              <q-icon name="warning_amber" size="16px" class="q-mr-xs" color="negative" />
              <span>Empresas sin Actividad</span>
              <q-space />
              <q-badge color="negative" :label="`${engagementData.inactive?.length || 0}`" />
            </div>
            <q-table
              :rows="engagementData.inactive || []"
              :columns="engagementInactiveColumns"
              row-key="company_id"
              :loading="loadingEngagement"
              flat
              dense
              :rows-per-page-options="[10, 20, 50]"
              :pagination="{ rowsPerPage: 10 }"
              class="premium-table"
            >
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.value === 'never' ? 'negative' : props.value === 'cold' ? 'warning' : 'orange'"
                    :label="props.value === 'never' ? 'Nunca usó' : props.value === 'cold' ? 'Inactiva' : 'Tibia'"
                  />
                </q-td>
              </template>
              <template #body-cell-last_invoice_at="props">
                <q-td :props="props">
                  <span v-if="props.value" class="text-caption">{{ formatFullDate(props.value) }}</span>
                  <span v-else class="text-caption text-negative">Nunca</span>
                </q-td>
              </template>
              <template #body-cell-days_inactive="props">
                <q-td :props="props">
                  <span v-if="props.value !== null" class="text-caption">{{ props.value }}d</span>
                  <span v-else class="text-caption text-grey">—</span>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </div>

      <!-- Tabla empresas activas hoy -->
      <div class="bento-item q-mt-lg">
        <div class="bento-header q-mb-md">
          <q-icon name="bolt" size="16px" class="q-mr-xs" color="primary" />
          <span>Empresas Activas Hoy</span>
          <q-space />
          <q-badge color="primary" :label="`${engagementData.active_today?.length || 0}`" />
        </div>
        <q-table
          :rows="engagementData.active_today || []"
          :columns="engagementActiveTodayColumns"
          row-key="company_id"
          :loading="loadingEngagement"
          flat
          dense
          :rows-per-page-options="[10, 20, 50]"
          :pagination="{ rowsPerPage: 10 }"
          class="premium-table"
        >
          <template #body-cell-last_invoice_at="props">
            <q-td :props="props">
              <span class="text-caption">{{ formatFullDate(props.value) }}</span>
            </q-td>
          </template>
          <template #body-cell-invoice_count_today="props">
            <q-td :props="props">
              <q-badge color="primary" :label="props.value" />
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialogs for Full Lists -->
    <!-- Users List Dialog -->
    <q-dialog v-model="showUsersDialog" transition-show="fade" transition-hide="fade" no-refocus no-focus>
      <q-card class="bento-dialog-card overflow-hidden" style="width: 1000px; max-width: 95vw;">
        <q-toolbar class="q-px-lg q-py-sm border-bottom-soft">
          <q-icon name="people" color="primary" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-1">Usuarios del Sistema</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup size="sm" color="grey-5" />
        </q-toolbar>

        <q-card-section class="q-pb-none">
          <q-input
            v-model="usersSearch"
            placeholder="Filtrar usuarios..."
            outlined
            dense
            rounded
            :bg-color="$q.dark.isActive ? 'dark' : 'grey-1'"
            class="compact-search"
            clearable
            debounce="500"
            @update:model-value="searchDataUsers"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="q-pa-none scroll" style="max-height: calc(100vh - 170px);">
          <q-table
            :rows="usersList"
            :columns="usersColumns"
            row-key="id"
            :loading="loadingUsers"
            v-model:pagination="usersPagination"
            @request="setPaginationUsers"
            flat
            class="compact-premium-table"
            :rows-per-page-options="[10, 15, 25]"
            :grid="$q.screen.lt.md"
            @row-click="(evt, row) => openDetail(row.id, 'user')"
          >
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Companies List Dialog -->
    <q-dialog v-model="showCompaniesDialog" transition-show="fade" transition-hide="fade" no-refocus no-focus>
      <q-card class="bento-dialog-card overflow-hidden" style="width: 1000px; max-width: 95vw;">
        <q-toolbar class="q-px-lg q-py-sm border-bottom-soft">
          <q-icon name="business" color="positive" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-1">Empresas Registradas</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup size="sm" color="grey-5" />
        </q-toolbar>

        <q-card-section class="q-pb-none">
          <q-input
            v-model="companiesSearch"
            placeholder="Filtrar empresas..."
            outlined
            dense
            rounded
            :bg-color="$q.dark.isActive ? 'dark' : 'grey-1'"
            class="compact-search"
            clearable
            debounce="500"
            @update:model-value="searchDataCompanies"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="q-pa-none scroll" style="max-height: calc(100vh - 170px);">
          <q-table
            :rows="companiesList"
            :columns="companiesColumns"
            row-key="id"
            :loading="loadingCompanies"
            v-model:pagination="companiesPagination"
            @request="setPaginationCompanies"
            flat
            class="compact-premium-table q-mt-md"
            :rows-per-page-options="[10, 15, 25]"
            :grid="$q.screen.lt.md"
            @row-click="(evt, row) => openDetail(row.id, 'company')"
          >
            <template v-slot:body-cell-billing="props">
              <q-td :props="props">
                <q-icon :name="props.row.billing ? 'check_circle' : 'cancel'" :color="props.row.billing ? 'positive' : 'grey-4'" size="20px" />
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge 
                  :color="getStatusColor(props.row.status)" 
                  :label="getStatusLabel(props.row.status)"
                  class="text-weight-bold"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <div class="row q-gutter-xs justify-center">
                  <q-btn
                    v-if="props.row.status === 'active'"
                    size="sm"
                    color="negative"
                    icon="block"
                    round
                    dense
                    @click="openBlockCompanyDialog(props.row)"
                    class="hover-scale"
                  >
                    <q-tooltip>Bloquear Empresa</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    size="sm"
                    color="positive"
                    icon="check_circle"
                    round
                    dense
                    @click="unblockCompany(props.row)"
                    class="hover-scale"
                  >
                    <q-tooltip>Desbloquear Empresa</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Block Company Dialog -->
    <q-dialog v-model="showBlockCompanyDialog" transition-show="fade" transition-hide="fade" no-refocus no-focus>
      <q-card class="bento-dialog-card" style="width: 500px; max-width: 90vw;">
        <q-toolbar class="q-px-lg q-py-sm border-bottom-soft">
          <q-icon name="block" color="negative" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-1">Bloquear Empresa</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup size="sm" color="grey-5" />
        </q-toolbar>

        <q-card-section class="q-pa-lg">
          <div class="text-center q-mb-md">
            <q-icon name="warning" color="negative" size="48px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-negative">¿Estás seguro?</div>
            <div class="text-grey-7 q-mt-sm">
              Estás por bloquear la empresa <strong>{{ selectedCompany?.name }}</strong>
            </div>
          </div>

          <q-form @submit="blockCompany" class="q-gutter-md">
            <q-select
              v-model="blockForm.status"
              :options="blockStatusOptions"
              label="Tipo de bloqueo"
              outlined
              dense
              emit-value
              map-options
              options-dense
              bg-color="grey-1"
              class="q-mb-md"
            />

            <q-input
              v-model="blockForm.blocking_reason"
              label="Motivo del bloqueo"
              outlined
              dense
              type="textarea"
              rows="3"
              bg-color="grey-1"
              hint="Este motivo será visible para los usuarios al intentar iniciar sesión"
              lazy-rules
              :rules="[val => !!val && val.length > 0 || 'El motivo es requerido']"
            />

            <div class="row q-mt-lg justify-end q-gutter-sm">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                v-close-popup
              />
              <q-btn
                type="submit"
                label="Bloquear Empresa"
                color="negative"
                :loading="blockingCompany"
                class="q-px-md"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Subscriptions List Dialog -->
    <q-dialog v-model="showSubscriptionsDialog" transition-show="fade" transition-hide="fade" no-refocus no-focus>
      <q-card class="bento-dialog-card overflow-hidden" style="width: 1000px; max-width: 95vw;">
        <q-toolbar class="q-px-lg q-py-sm border-bottom-soft">
          <q-icon name="card_membership" color="warning" size="20px" class="q-mr-sm" />
          <q-toolbar-title class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-1">Control de Suscripciones</q-toolbar-title>
          <q-btn icon="close" flat round dense v-close-popup size="sm" color="grey-5" />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="bg-blue-1 q-pa-md rounded-borders flex items-center shadow-1">
                <q-icon name="tag" color="blue-7" size="24px" class="q-mr-md" />
                <div>
                  <div class="text-caption text-grey-8">Total Suscripciones</div>
                  <div class="text-h6 text-weight-bolder text-blue-9">{{ subscriptionsPagination.rowsNumber }}</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="bg-green-1 q-pa-md rounded-borders flex items-center shadow-1">
                <q-icon name="payments" color="green-7" size="24px" class="q-mr-md" />
                <div>
                  <div class="text-caption text-grey-8">Total Recaudado</div>
                  <div class="text-h6 text-weight-bolder text-green-9">${{ subscriptionsTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-8">
              <q-input
                v-model="subscriptionsSearch"
                placeholder="Filtrar por empresa..."
                outlined
                dense
                rounded
                :bg-color="$q.dark.isActive ? 'dark' : 'grey-1'"
                class="compact-search"
                clearable
                debounce="500"
                @update:model-value="searchDataSubscriptions"
              >
                <template v-slot:prepend>
                  <q-icon name="search" size="18px" />
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-select
                v-model="subscriptionsStatus"
                :options="statusOptions"
                placeholder="Estado"
                outlined
                dense
                rounded
                :bg-color="$q.dark.isActive ? 'dark' : 'grey-1'"
                class="compact-search"
                clearable
                @update:model-value="() => { paramsSubscriptions.page = 1; loadSubscriptionsList() }"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none scroll" style="max-height: calc(100vh - 270px);">
          <q-table
            :rows="subscriptionsList"
            :columns="subscriptionsColumns"
            row-key="id"
            :loading="loadingSubscriptions"
            v-model:pagination="subscriptionsPagination"
            @request="setPaginationSubscriptions"
            flat
            class="compact-premium-table"
            :rows-per-page-options="[10, 15, 25]"
            :grid="$q.screen.lt.md"
            @row-click="(evt, row) => openDetail(row.id, 'subscription')"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getStatusColor(props.row.status)" outline class="text-weight-bold" style="font-size: 10px;">{{ props.row.status }}</q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-start_date="props">
              <q-td :props="props">
                {{ formatFullDate(props.row.start_date) }}
              </q-td>
            </template>
            <template v-slot:body-cell-end_date="props">
              <q-td :props="props">
                {{ formatFullDate(props.row.end_date) }}
              </q-td>
            </template>
            <template v-slot:body-cell-amount_paid="props">
              <q-td :props="props" class="text-weight-bold text-positive">
                ${{ props.row.amount_paid || '0.00' }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Detail Dialog (Minimalist) -->
    <q-dialog v-model="showDetailDialog" position="right" full-height transition-show="slide-left" transition-hide="slide-right" no-refocus no-focus seamless>
      <q-card class="detail-minimalist-card flex column no-wrap" style="width: 400px; max-width: 90vw;">
        <q-toolbar class="q-px-lg q-py-md">
          <q-btn icon="arrow_forward_ios" flat round dense v-close-popup size="sm" color="grey-6" />
          <q-toolbar-title class="text-subtitle1 text-weight-bold text-uppercase letter-spacing-1">
            Detalles de {{ detailType === 'user' ? 'Usuario' : detailType === 'company' ? 'Empresa' : 'Suscripción' }}
          </q-toolbar-title>
        </q-toolbar>

        <q-separator color="grey-2" />

        <q-card-section class="flex-grow-1 q-pa-lg scroll">
          <div v-if="loadingDetail" class="flex flex-center q-pa-xl">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <div v-else-if="selectedItem">
            <!-- USER DETAIL VIEW -->
            <div v-if="detailType === 'user'">
              <div class="row items-center q-mb-xl">
                <q-avatar size="80px" class="shadow-10 q-mr-lg" color="grey-2">
                  <q-img v-if="selectedItem.user.avatar" :src="selectedItem.user.avatar" />
                  <q-icon v-else name="person" color="grey-6" size="40px" />
                </q-avatar>
                <div>
                  <div class="text-h6 text-weight-bold">{{ selectedItem.user.name }} {{ selectedItem.user.last_name }}</div>
                  <div class="text-caption text-grey-7">{{ selectedItem.user.email }}</div>
                  <q-badge :color="getRoleColor(selectedItem.user.roles[0]?.acronym)" class="q-mt-xs">
                    {{ selectedItem.user.roles[0]?.name || 'N/A' }}
                  </q-badge>
                </div>
              </div>

              <div class="detail-section q-mb-lg">
                <div class="detail-label">Información de Registro</div>
                <div class="detail-item row items-center justify-between">
                  <span>Fuente</span>
                  <q-chip dense :color="selectedItem.registration_source === 'Google' ? 'red-1' : 'blue-1'" :text-color="selectedItem.registration_source === 'Google' ? 'red-7' : 'blue-7'">
                    <q-icon :name="selectedItem.registration_source === 'Google' ? 'fab fa-google' : 'email'" size="12px" class="q-mr-xs" />
                    {{ selectedItem.registration_source }}
                  </q-chip>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Unión</span>
                  <span class="text-weight-medium">{{ formatFullDate(selectedItem.user.created_at) }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Teléfono</span>
                  <span class="text-weight-medium">{{ selectedItem.user.phone_number || 'No registrado' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-label">Empresas Asociadas ({{ selectedItem.companies.length }})</div>
                <div v-for="company in selectedItem.companies" :key="company.id" class="company-sub-card q-mb-sm">
                  <div class="row items-center justify-between">
                    <span class="text-weight-bold text-primary">{{ company.name }}</span>
                    <q-badge outline color="grey-7" size="sm">{{ company.business_type }}</q-badge>
                  </div>
                  <div v-if="company.subscription" class="q-mt-xs row items-center text-caption">
                    <q-icon name="stars" color="warning" size="14px" class="q-mr-xs" />
                    <span class="text-grey-8">{{ company.subscription.plan }}</span>
                    <q-separator vertical class="q-mx-xs" />
                    <span :class="company.subscription.status === 'active' ? 'text-positive' : 'text-negative'">
                      {{ company.subscription.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- COMPANY DETAIL VIEW -->
            <div v-if="detailType === 'company'">
              <div class="text-h5 text-weight-bold q-mb-xs">{{ selectedItem.name }}</div>
              <div class="text-subtitle2 text-primary text-uppercase q-mb-md">{{ selectedItem.business_type?.name }}</div>

              <div class="detail-section">
                <div class="detail-label">Datos Generales</div>
                <div class="detail-item row items-center justify-between">
                  <span>Identificación</span>
                  <span class="text-weight-medium">{{ selectedItem.document_number || 'N/A' }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>País</span>
                  <span class="text-weight-medium">{{ selectedItem.country?.name || 'N/A' }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Email</span>
                  <span class="text-weight-medium">{{ selectedItem.email || 'N/A' }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Facturación Activa</span>
                  <q-icon :name="selectedItem.billing ? 'check_circle' : 'cancel'" :color="selectedItem.billing ? 'positive' : 'grey-4'" />
                </div>
              </div>

              <div class="detail-section q-mb-lg">
                <div class="detail-label">Suscripciones</div>
                <div v-for="sub in selectedItem.subscriptions" :key="sub.id" class="sub-history-item bg-grey-1 q-pa-sm q-mb-xs rounded-borders">
                  <div class="row items-center justify-between">
                    <span class="text-weight-medium">{{ sub.plan?.name }}</span>
                    <q-badge :color="getStatusColor(sub.status)" size="sm">{{ sub.status }}</q-badge>
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ formatFullDate(sub.start_date) }} → {{ formatFullDate(sub.end_date) }}
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-label">Usuarios Asociados ({{ selectedItem.users.length }})</div>
                <q-list dense>
                  <q-item v-for="user in selectedItem.users" :key="user.id" class="q-px-none">
                    <q-item-section avatar>
                      <q-avatar size="24px" color="grey-2">
                        <q-img v-if="user.avatar" :src="user.avatar" />
                        <q-icon v-else name="person" color="grey-6" size="14px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-caption">{{ user.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>

            <!-- SUBSCRIPTION DETAIL VIEW -->
            <div v-if="detailType === 'subscription'">
              <div class="row justify-center q-mb-lg">
                <div class="plan-hero-chip bg-primary text-white q-pa-xs rounded-borders text-center shadow-2" style="width: 100%">
                  <div class="text-overline opacity-70">PLAN SELECCIONADO</div>
                  <div class="text-h4 text-weight-bolder">{{ selectedItem.plan?.name }}</div>
                </div>
              </div>

              <div class="detail-section q-mb-lg">
                <div class="detail-label">Estado y Vigencia</div>
                <div class="detail-item row items-center justify-between">
                  <span>Estado Actual</span>
                  <q-badge :color="getStatusColor(selectedItem.status)" padding="xs md">{{ selectedItem.status }}</q-badge>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Inicio</span>
                  <span class="text-weight-medium">{{ formatFullDate(selectedItem.start_date) }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Finalización</span>
                  <span class="text-weight-medium">{{ formatFullDate(selectedItem.end_date) }}</span>
                </div>
                <div class="detail-item row items-center justify-between">
                  <span>Monto Pagado</span>
                  <span class="text-weight-bold text-positive">${{ selectedItem.amount_paid || '0.00' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-label">Empresa Beneficiaria</div>
                <div class="company-sub-card clickable" @click="openDetail(selectedItem.company?.id, 'company')">
                  <div class="text-weight-bold text-primary">{{ selectedItem.company?.name }}</div>
                  <div class="text-caption text-grey-7">{{ selectedItem.company?.email }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey-8" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'
import Highcharts from 'highcharts'
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = authentication()
const { userSession } = storeToRefs(authStore)

/**
 * Refs & State
 */
const loading = ref(false)

// ── Engagement & Retención ──────────────────────────────────────────────────
/** Estado de carga de la sección de engagement */
const loadingEngagement = ref(true)

/**
 * Datos del reporte de retención.
 * @type {import('vue').Ref<{kpis: Object, by_plan: Array, inactive: Array, active_today: Array}>}
 */
const engagementData = ref({ kpis: {}, by_plan: [], inactive: [], active_today: [] })

/** Columnas tabla empresas inactivas */
const engagementInactiveColumns = [
  { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'plan_name', label: 'Plan', field: 'plan_name', align: 'left', sortable: true },
  { name: 'last_invoice_at', label: 'Última Factura', field: 'last_invoice_at', align: 'left', sortable: true },
  { name: 'days_inactive', label: 'Días inactiva', field: 'days_inactive', align: 'center', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center', sortable: true }
]

/** Columnas tabla empresas activas hoy */
const engagementActiveTodayColumns = [
  { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'plan_name', label: 'Plan', field: 'plan_name', align: 'left', sortable: true },
  { name: 'invoice_count_today', label: 'Facturas hoy', field: 'invoice_count_today', align: 'center', sortable: true },
  { name: 'last_invoice_at', label: 'Última actividad', field: 'last_invoice_at', align: 'left', sortable: true }
]
// ────────────────────────────────────────────────────────────────────────────

const stats = ref({
  users: { total: 0, today: 0, this_week: 0, this_month: 0, growth: [] },
  companies: { total: 0, with_billing: 0, today: 0, this_month: 0, growth: [] },
  subscriptions: { total: 0, active: 0, expiring: 0, expired: 0, by_plan: [] }
})

const recentUsers = ref([])
const recentCompanies = ref([])
const recentSubscriptions = ref([])
const activeTab = ref('users')

// Charts REFS
const usersChartRef = ref(null)
const companiesChartRef = ref(null)
const subscriptionsChartRef = ref(null)

// Dialogs
const showUsersDialog = ref(false)
const showCompaniesDialog = ref(false)
const showSubscriptionsDialog = ref(false)
const showBlockCompanyDialog = ref(false)

// Block Company Form
const selectedCompany = ref(null)
const blockingCompany = ref(false)
const blockForm = ref({
  status: 'suspended',
  blocking_reason: ''
})

const blockStatusOptions = [
  { label: 'Suspender (Manual)', value: 'suspended' },
  { label: 'Bloquear (Falta de pago)', value: 'blocked' },
  { label: 'Expirar (Suscripción vencida)', value: 'expired' }
]

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

// Details
const showDetailDialog = ref(false)
const detailType = ref('')
const selectedItem = ref(null)
const loadingDetail = ref(false)

// Pagination configs
// Pagination configs
const usersPagination = ref({ rowsPerPage: 15, rowsNumber: 0, paginate: true, sortBy: 'id', sortOrder: 'desc' })
const companiesPagination = ref({ rowsPerPage: 15, rowsNumber: 0, paginate: true, sortBy: 'id', sortOrder: 'desc' })
const subscriptionsPagination = ref({ rowsPerPage: 15, rowsNumber: 0, paginate: true, sortBy: 'id', sortOrder: 'desc' })
const subscriptionsTotalAmount = ref(0)

// Params objects matching CompanyPage pattern
const paramsUsers = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 15,
  dataSearch: {
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
    'companySession.name': ''
  }
})

const paramsCompanies = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 15,
  dataSearch: { name: '', business_type: '', subscription_plan: '' }
})

const paramsSubscriptions = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 15,
  status: null,
  dataSearch: { company_name: '', plan_name: '' }
})

const statusOptions = ['active', 'expired', 'cancelled']

/**
 * Table Columns
 */
const usersColumns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'phone_number', label: 'Teléfono', field: 'phone_number', align: 'left', sortable: true },
  { name: 'registration_source', label: 'Registro', field: 'created_at', align: 'left', format: (value) => formatFullDate(value) },
  { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'created_at_human', label: 'Registrado', field: 'created_at_human', align: 'left', sortable: true }
]

const companiesColumns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'business_type', label: 'Tipo', field: 'business_type', align: 'left', sortable: true },
  { name: 'subscription_plan', label: 'Plan', field: 'subscription_plan', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center', sortable: true },
  { name: 'billing', label: 'Facturación', field: 'billing', align: 'center', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center', sortable: false },
  { name: 'created_at_human', label: 'Creada', field: 'created_at_human', align: 'left', sortable: true }
]

const subscriptionsColumns = [
  { name: 'company_name', label: 'Empresa', field: 'company_name', align: 'left', sortable: true },
  { name: 'plan_name', label: 'Plan', field: 'plan_name', align: 'left', sortable: true },
  { name: 'status', label: 'Estado', field: 'status', align: 'center', sortable: true },
  { name: 'amount_paid', label: 'Monto Pagado', field: 'amount_paid', align: 'right', sortable: true },
  { name: 'days_left', label: 'Días Restantes', field: 'days_left', align: 'center', sortable: true },
  { name: 'start_date', label: 'Inicio', field: 'start_date', align: 'left', sortable: true },
  { name: 'end_date', label: 'Fin', field: 'end_date', align: 'left', sortable: true }
]

/**
 * Computed Properties
 */
const userName = computed(() => userSession.value?.name?.split(' ')[0] || 'Admin')

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const currentDate = computed(() => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('es-ES', options)
})

/**
 * Methods
 */
const openDetail = async (id, type) => {
  if (!id) return
  detailType.value = type
  showDetailDialog.value = true
  loadingDetail.value = true
  selectedItem.value = null
  try {
    const { data } = await api.get(`admin-dashboard/${type}/${id}`)
    selectedItem.value = data
  } catch (error) {
    console.error(`Error loading ${type} details:`, error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los detalles',
      position: 'top',
      timeout: 2000
    })
    showDetailDialog.value = false
  } finally {
    loadingDetail.value = false
  }
}

const formatFullDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
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

/**
 * Carga el reporte de retención y engagement.
 * Consulta el endpoint admin-dashboard/engagement y popula engagementData.
 */
const loadEngagement = async () => {
  loadingEngagement.value = true
  try {
    const { data } = await api.get('admin-dashboard/engagement')
    engagementData.value = data
  } catch (error) {
    console.error('Error loading engagement report:', error)
  } finally {
    loadingEngagement.value = false
  }
}

const loadUsersList = async () => {
  if (loadingUsers.value) return
  loadingUsers.value = true
  try {
    const { data } = await api.get('admin-dashboard/users-list', {
      params: paramsUsers.value
    })
    usersList.value = data.data
    usersPagination.value.rowsNumber = data.total
  } catch (error) {
    console.log(error)
  } finally {
    loadingUsers.value = false
  }
}

function setPaginationUsers (data) {
  paramsUsers.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  paramsUsers.value.page = data.pagination.page
  paramsUsers.value.sortBy = data.pagination.sortBy ?? paramsUsers.value.sortBy
  paramsUsers.value.perPage = data.pagination.rowsPerPage
  usersPagination.value = data.pagination
  loadUsersList()
}

function searchDataUsers (data) {
  for (const field in paramsUsers.value.dataSearch) {
    paramsUsers.value.dataSearch[field] = data
  }
  paramsUsers.value.page = 1
  loadUsersList()
}

const loadCompaniesList = async () => {
  if (loadingCompanies.value) return
  loadingCompanies.value = true
  try {
    const { data } = await api.get('admin-dashboard/companies-list', {
      params: paramsCompanies.value
    })
    companiesList.value = data.data
    companiesPagination.value.rowsNumber = data.total
  } catch (error) {
    console.log(error)
  } finally {
    loadingCompanies.value = false
  }
}

function setPaginationCompanies (data) {
  paramsCompanies.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  paramsCompanies.value.page = data.pagination.page
  paramsCompanies.value.sortBy = data.pagination.sortBy ?? paramsCompanies.value.sortBy
  paramsCompanies.value.perPage = data.pagination.rowsPerPage
  companiesPagination.value = data.pagination
  loadCompaniesList()
}

function searchDataCompanies (data) {
  for (const field in paramsCompanies.value.dataSearch) {
    paramsCompanies.value.dataSearch[field] = data
  }
  paramsCompanies.value.page = 1
  loadCompaniesList()
}

const loadSubscriptionsList = async () => {
  if (loadingSubscriptions.value) return
  loadingSubscriptions.value = true
  try {
    // Sync status from params
    const { data } = await api.get('admin-dashboard/subscriptions-list', {
      params: {
        ...paramsSubscriptions.value,
        dataEqualFilter: {
          status: subscriptionsStatus.value
        }
      }
    })
    // Ajuste por la nueva estructura del backend
    subscriptionsList.value = data.subscriptions.data || data.subscriptions
    subscriptionsPagination.value.rowsNumber = data.subscriptions.total
    subscriptionsTotalAmount.value = data.total_amount || 0
  } catch (error) {
    console.log(error)
  } finally {
    loadingSubscriptions.value = false
  }
}

function setPaginationSubscriptions (data) {
  paramsSubscriptions.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  paramsSubscriptions.value.page = data.pagination.page
  paramsSubscriptions.value.sortBy = data.pagination.sortBy ?? paramsSubscriptions.value.sortBy
  paramsSubscriptions.value.perPage = data.pagination.rowsPerPage
  subscriptionsPagination.value = data.pagination
  loadSubscriptionsList()
}

function searchDataSubscriptions (data) {
  for (const field in paramsSubscriptions.value.dataSearch) {
    paramsSubscriptions.value.dataSearch[field] = data
  }
  paramsSubscriptions.value.page = 1
  loadSubscriptionsList()
}

// Load data when dialogs open
watch(showUsersDialog, (val) => {
  if (val && usersList.value.length === 0) loadUsersList()
})

watch(showCompaniesDialog, (val) => {
  if (val && companiesList.value.length === 0) loadCompaniesList()
})

watch(showSubscriptionsDialog, (val) => {
  if (val && subscriptionsList.value.length === 0) loadSubscriptionsList()
})

/**
 * Chart Creation
 */
const createUsersChart = () => {
  if (!usersChartRef.value || !stats.value.users?.growth) return
  const growth = stats.value.users.growth
  Highcharts.chart(usersChartRef.value, {
    chart: { type: 'areaspline', backgroundColor: 'transparent' },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: growth.map(item => item.month),
      labels: { style: { color: $q.dark.isActive ? '#cbd5e1' : '#94a3b8' } }
    },
    yAxis: { gridLineColor: $q.dark.isActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', title: { text: null }, labels: { style: { color: $q.dark.isActive ? '#cbd5e1' : '#94a3b8' } } },
    legend: { enabled: false },
    plotOptions: {
      areaspline: {
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(33, 150, 243, 0.4)'], [1, 'rgba(33, 150, 243, 0)']] },
        lineWidth: 3,
        color: '#2196F3',
        marker: { enabled: true, radius: 4 },
        dataLabels: {
          enabled: true,
          style: { fontSize: '10px', color: $q.dark.isActive ? '#cbd5e1' : '#64748b', fontWeight: 'bold', textOutline: 'none' }
        }
      }
    },
    series: [{ name: 'Usuarios', data: growth.map(item => item.count) }]
  })
}

const createCompaniesChart = () => {
  if (!companiesChartRef.value || !stats.value.companies?.growth) return
  const growth = stats.value.companies.growth
  Highcharts.chart(companiesChartRef.value, {
    chart: { type: 'areaspline', backgroundColor: 'transparent' },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: growth.map(item => item.month),
      labels: { style: { color: $q.dark.isActive ? '#cbd5e1' : '#94a3b8' } }
    },
    yAxis: { gridLineColor: $q.dark.isActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', title: { text: null }, labels: { style: { color: $q.dark.isActive ? '#cbd5e1' : '#94a3b8' } } },
    legend: { enabled: false },
    plotOptions: {
      areaspline: {
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(33, 186, 69, 0.4)'], [1, 'rgba(33, 186, 69, 0)']] },
        lineWidth: 3,
        color: '#21BA45',
        marker: { enabled: true, radius: 4 },
        dataLabels: {
          enabled: true,
          style: { fontSize: '10px', color: $q.dark.isActive ? '#cbd5e1' : '#64748b', fontWeight: 'bold', textOutline: 'none' }
        }
      }
    },
    series: [{ name: 'Empresas', data: growth.map(item => item.count) }]
  })
}

const createSubscriptionsChart = () => {
  if (!subscriptionsChartRef.value || !stats.value.subscriptions?.by_plan) return
  const byPlan = stats.value.subscriptions.by_plan
  Highcharts.chart(subscriptionsChartRef.value, {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: null },
    credits: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: '65%',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y}',
          style: { fontSize: '10px', fontWeight: 'bold', color: $q.dark.isActive ? '#cbd5e1' : '#334155', textOutline: 'none' }
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Planes',
      data: byPlan.map((item, idx) => ({
        name: item.plan_name,
        y: item.total,
        color: ['#1976D2', '#21BA45', '#F2C037', '#9C27B0', '#E91E63'][idx % 5]
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
      loadRecentSubscriptions(),
      loadEngagement()
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

const openFullList = () => {
  if (activeTab.value === 'users') showUsersDialog.value = true
  else if (activeTab.value === 'companies') showCompaniesDialog.value = true
  else if (activeTab.value === 'subscriptions') showSubscriptionsDialog.value = true
}

const getRoleColor = (role) => {
  const colors = { super_admin: 'red', admin: 'orange', user: 'primary', seller: 'positive' }
  return colors[role] || 'grey'
}

const getStatusColor = (status) => {
  const colors = { 
    active: 'positive', 
    expired: 'negative', 
    cancelled: 'grey',
    suspended: 'negative',
    blocked: 'negative'
  }
  return colors[status] || 'grey'
}

const formatTime = (datetime) => {
  const dateObj = new Date(datetime)
  const now = new Date()
  const diff = now - dateObj
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
}

// Watchers & Lifecycle
watch(() => $q.dark.isActive, () => {
  nextTick(() => {
    createUsersChart()
    createCompaniesChart()
    createSubscriptionsChart()
  })
})

watch(showUsersDialog, (v) => v && loadUsersList())
watch(showCompaniesDialog, (v) => v && loadCompaniesList())
watch(showSubscriptionsDialog, (v) => v && loadSubscriptionsList())

// Company Blocking Methods
const openBlockCompanyDialog = (company) => {
  selectedCompany.value = company
  blockForm.value = {
    status: 'suspended',
    blocking_reason: ''
  }
  showBlockCompanyDialog.value = true
}

const blockCompany = async () => {
  blockingCompany.value = true
  
  try {
    const response = await api.put(`/companies/${selectedCompany.value.id}`, blockForm.value)
    
    // Update company in list
    const index = companiesList.value.findIndex(c => c.id === selectedCompany.value.id)
    if (index !== -1) {
      companiesList.value[index] = response.data
    }
    
    Notify.create({
      message: `Empresa "${selectedCompany.value.name}" bloqueada exitosamente`,
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
    
    showBlockCompanyDialog.value = false
  } catch (error) {
    console.error('Error blocking company:', error)
    Notify.create({
      message: 'Error al bloquear la empresa',
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  } finally {
    blockingCompany.value = false
  }
}

const unblockCompany = async (company) => {
  try {
    const response = await api.put(`/companies/${company.id}`, {
      status: 'active',
      blocking_reason: null
    })
    
    // Update company in list
    const index = companiesList.value.findIndex(c => c.id === company.id)
    if (index !== -1) {
      companiesList.value[index] = response.data
    }
    
    Notify.create({
      message: `Empresa "${company.name}" desbloqueada exitosamente`,
      color: 'positive',
      icon: 'check_circle',
      position: 'top'
    })
  } catch (error) {
    console.error('Error unblocking company:', error)
    Notify.create({
      message: 'Error al desbloquear la empresa',
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  }
}

// Helper functions for status display
const getStatusLabel = (status) => {
  switch (status) {
    case 'active': return 'Activa'
    case 'suspended': return 'Suspendida'
    case 'blocked': return 'Bloqueada'
    case 'expired': return 'Expirada'
    default: return status
  }
}

onMounted(() => loadAllData())
</script>

<style lang="scss" scoped>
.admin-dashboard-page {
  padding: 24px;
  min-height: 100vh;
}

/**
 * Header Cockpit
 */
.header-cockpit {
  position: relative;
  background: white;
  border-radius: 28px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);

  .body--dark & {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.05);
  }
}

.cockpit-glow {
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0) 70%);
  z-index: 0;
}

.greeting-main { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; }
.greeting-name { font-size: 24px; letter-spacing: -0.5px; }

.date-chip-premium {
  display: inline-flex;
  align-items: center;
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 16px;
  color: #64748b;

  .body--dark & {
    background: #2d2d2d;
    color: #cbd5e1;
  }
}

.date-stack { display: flex; flex-direction: column; text-align: left; }
.date-day { font-size: 11px; font-weight: 800; color: var(--q-primary); line-height: 1; }
.date-full { font-size: 10px; font-weight: 600; }

/**
 * Bento Grid
 */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.bento-item {
  background: white;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  .body--dark & {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
  }
}

.bento-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.span-2-desktop { grid-column: span 2; }
.span-3-desktop { grid-column: span 3; }
.span-full { grid-column: 1 / -1; }

/**
 * Stat Heroes
 */
.stat-hero { display: flex; align-items: center; gap: 20px; }
.stat-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-soft-primary { background: #eff6ff; .body--dark & { background: rgba(33, 150, 243, 0.1); } }
.bg-soft-positive { background: #ecfdf5; .body--dark & { background: rgba(33, 186, 69, 0.1); } }
.bg-soft-warning { background: #fffbeb; .body--dark & { background: rgba(242, 192, 55, 0.1); } }
.bg-soft-negative { background: #fef2f2; .body--dark & { background: rgba(193, 0, 21, 0.1); } }

.stat-val { font-size: 32px; font-weight: 900; line-height: 1; letter-spacing: -1px; }
.stat-lab { font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 4px; }
.stat-trend { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-top: 8px; width: fit-content; }
.stat-trend.grow { background: rgba(16, 185, 129, 0.1); color: #10b981; }

/**
 * Charts & Activity
 */
.bento-header {
  display: flex;
  align-items: center;
  font-weight: 800;
  font-size: 13px;
  color: #1e293b;

  .body--dark & {
    color: #f8fafc;
  }
}
.chart-container-premium { height: 200px; }

.premium-tabs {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 2px;

  .body--dark & {
    background: #2d2d2d;
  }
}
.premium-tabs :deep(.q-tab__label) { font-size: 11px; font-weight: 800; }

/**
 * Timeline
 */
.activity-timeline { display: flex; flex-direction: column; }
.timeline-node { display: flex; gap: 16px; padding: 12px 0; }
.node-time { font-size: 10px; font-weight: 800; color: #94a3b8; width: 40px; text-align: right; }
.node-line { width: 2px; background: #e2e8f0; position: relative; border-radius: 2px; .body--dark & { background: #334155; } }
.node-line::after { content: ''; position: absolute; top: 4px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background: white; border: 2px solid var(--q-primary); .body--dark & { background: #1e1e1e; } }
.node-line.color-positive::after { border-color: #10b981; }
.node-line.color-warning::after { border-color: #f59e0b; }

.node-content { flex: 1; text-align: left; }
.node-title {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;

  .body--dark & {
    color: #f1f5f9;
  }
}
.node-subtitle { font-size: 11px; color: #64748b; margin-top: 2px; .body--dark & { color: #94a3b8; } }

/**
 * Premium Dialogs & Tables
 */
.glassmorphism-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 32px;

  .body--dark & {
    background: rgba(30, 30, 30, 0.9);
  }
}
.search-bar-modern :deep(.q-field__control) { border-radius: 20px; }
.premium-table { border-radius: 20px; overflow: hidden; }
.premium-table :deep(thead tr th) {
  background: #f8fafc;
  font-weight: 800;
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;

  .body--dark & {
    background: #2d2d2d;
    color: #cbd5e1;
  }
}

.rounded-button { border-radius: 12px; }
.clickable { cursor: pointer; }

/**
 * Animations
 */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.section-fade-in { animation: fadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1); }

/**
 * Responsive
 */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .span-3-desktop, .span-2-desktop { grid-column: span 2; }
}

@media (max-width: 600px) {
  .bento-grid { grid-template-columns: 1fr; }
  .span-2-desktop, .span-3-desktop { grid-column: span 1; }
}

/**
 * Detail Minimalist Card
 */
.detail-minimalist-card {
  box-shadow: -10px 0 30px rgba(0,0,0,0.05);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);

  .body--dark & {
    background: rgba(30, 30, 30, 0.95);
    border-left: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.detail-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #94a3b8;
  font-weight: 800;
  margin-bottom: 12px;
}

.detail-item {
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  border: 1px solid rgba(0,0,0,0.02);

  .body--dark & {
    background: #2d2d2d;
    border-color: rgba(255,255,255,0.05);
    color: #f1f5f9;
  }
}

.company-sub-card {
  padding: 16px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.3s ease;

  .body--dark & {
    background: #2d2d2d;
    border-color: rgba(255,255,255,0.05);
  }
}

.company-sub-card:hover {
  border-color: #2196F3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.08);
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.sub-history-item {
  border: 1px solid transparent;

  .body--dark & {
    background: #2d2d2d !important;
  }
}

.rounded-borders {
  border-radius: 12px;
}

/**
 * Bento Minimalist Dialogs
 */
.bento-dialog-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);

  .body--dark & {
    background: #1e1e1e;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
}

.border-bottom-soft {
  border-bottom: 1px solid #f1f5f9;

  .body--dark & {
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
}

.compact-search .q-field__control {
  box-shadow: none !important;
  font-size: 13px;
}

.compact-premium-table .q-table__card {
  box-shadow: none !important;
}

.compact-premium-table thead tr th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  font-weight: 700;
  background: #f8fafc;

  .body--dark & {
    background: #2d2d2d;
    color: #cbd5e1;
  }
}

.compact-premium-table tbody tr td {
  font-size: 13px;
  color: #334155;

  .body--dark & {
    color: #cbd5e1;
  }
}

.compact-premium-table tbody tr:hover {
  background: #f1f5f9;
  cursor: pointer;

  .body--dark & {
    background: #2d2d2d;
  }
}

.bg-blue-1 { background: #eff6ff; .body--dark & { background: rgba(33, 150, 243, 0.1) !important; color: white !important; } }
.bg-green-1 { background: #ecfdf5; .body--dark & { background: rgba(33, 186, 69, 0.1) !important; color: white !important; } }
.text-blue-9 { .body--dark & { color: #90caf9 !important; } }
.text-green-9 { .body--dark & { color: #a5d6a7 !important; } }
</style>
