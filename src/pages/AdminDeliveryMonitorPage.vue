<template>
  <q-page class="admin-monitor-page overflow-hidden">
    <!-- Responsive Container -->
    <div
      class="full-height-container overflow-hidden monitor-layout"
      :class="`monitor-layout--${viewMode}`"
      style="position: relative;"
    >

      <!-- Left Section: Map -->
      <div
        v-show="viewMode !== 'panel'"
        class="relative-position transition-all map-section"
        :class="[
          viewMode === 'map' ? 'full-expanded' : 'col'
        ]"
        style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);"
      >
        <!-- Map Container -->
        <div ref="mapContainer" class="full-map"></div>

        <!-- Top Stats Bar - Responsive Carousel/Grid -->
        <div class="absolute-top q-pa-sm overlay-stats" style="z-index: 1000;">
          <div v-if="$q.screen.gt.sm" class="row q-gutter-sm justify-center">
            <q-card v-for="stat in monitorStats" :key="stat.label" class="stat-mini-card shadow-2" :class="stat.bg">
              <q-card-section class="q-pa-xs text-center">
                <div class="text-overline text-grey-7" style="font-size: 10px; line-height: 1;">{{ stat.label }}</div>
                <div class="text-h6 text-weight-bolder" :class="stat.color">{{ stat.value }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div v-else class="row no-wrap q-gutter-sm scroll shadow-1 bg-white-transparent blur-bg q-pa-xs rounded-borders-12">
            <div v-for="stat in monitorStats" :key="stat.label" class="col-shrink q-px-sm text-center border-right-sep">
              <div class="text-caption text-grey-8" style="font-size: 10px;">{{ stat.label }}</div>
              <div class="text-subtitle1 text-weight-bold" :class="stat.color">{{ stat.value }}</div>
            </div>
          </div>
        </div>

      </div>

      <div
        v-show="viewMode !== 'map'"
        class="transition-all panel-section"
        :class="[
          viewMode === 'panel' ? 'full-expanded' : (viewMode === 'split' ? 'split-panel' : 'side-panel')
        ]"
        style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); min-width: 0;"
      >
        <div class="panel-header q-px-md q-pt-sm">
          <q-tabs
            v-model="activeTab"
            dense
            no-caps
            active-color="primary"
            indicator-color="primary"
            align="left"
            class="text-grey-7"
          >
            <q-tab name="live" label="Seguimiento En Vivo" />
            <q-tab name="history" label="Historial de Rutas" />
          </q-tabs>
        </div>

        <q-tab-panels v-model="activeTab" animated class="panel-content shadow-up-1">
          <!-- Live Monitoring Tab -->
          <q-tab-panel name="live" class="q-pa-none">
            <!-- No Selection State -->
            <div v-if="!selectedRun" class="empty-selection-state q-pa-xl">
              <q-icon name="explore" size="84px" color="grey-3" class="q-mb-md" />
              <div class="text-h6 text-weight-bold text-grey-8">Monitor de Entregas</div>
              <p class="text-grey-6">Selecciona un repartidor activo en el mapa para ver su progreso detallado.</p>

              <!-- Quick list of active couriers if any -->
              <q-list v-if="activeRuns.length > 0" padding class="text-left full-width q-mt-md">
                <q-item v-for="run in activeRuns" :key="run.id" clickable v-ripple @click="selectRun(run)" class="active-run-item rounded-borders q-mb-xs">
                  <q-item-section avatar>
                    <q-avatar size="40px" font-size="20px" :color="isRunReturningToOrigin(run) ? 'info' : 'primary'" text-color="white">
                      <q-icon :name="isRunReturningToOrigin(run) ? 'home' : 'local_shipping'" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ run.delivery_person?.name }}</q-item-label>
                    <q-item-label caption>Ruta #{{ run.id }} • {{ run.items?.length }} paradas</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="isRunReturningToOrigin(run) ? 'info' : 'positive'" label="ACTIVO" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Selected Run Detail View -->
            <div v-else class="selected-run-container">
              <!-- Sticky Header for Selected Run -->
              <div class="run-detail-header q-pa-md bg-white-transparent blur-bg sticky-top shadow-1">
                <div class="row items-center no-wrap">
                  <q-avatar size="48px" :color="isRunReturningToOrigin(selectedRun) ? 'info' : 'primary'" text-color="white" class="q-mr-md">
                    <q-icon :name="isRunReturningToOrigin(selectedRun) ? 'home' : 'local_shipping'" />
                  </q-avatar>
                  <div class="col overflow-hidden">
                    <div class="text-subtitle1 text-weight-bold ellipsis">{{ selectedRun.delivery_person?.name }}</div>
                    <div class="text-caption text-grey-7">Ruta #{{ selectedRun.id }} • Iniciada {{ formatTime(selectedRun.started_at) }}</div>
                  </div>
                  <q-btn flat round dense icon="close" color="grey" @click="selectedRun = null; resetAllMarkerStyles()" />
                </div>

                <!-- Compact Stats Row -->
                <div class="row q-gutter-x-md q-mt-sm justify-between">
                  <div class="column items-center">
                    <span class="text-caption text-grey-6 uppercase-label">Progreso</span>
                    <span class="text-weight-bold">{{ selectedRunDeliveredCount }}/{{ selectedRunTotalCount }}</span>
                  </div>
                  <div class="column items-center border-left-sep q-pl-md">
                    <span class="text-caption text-grey-6 uppercase-label">Tiempo Est.</span>
                    <span class="text-weight-bold" :class="isRunReturningToOrigin(selectedRun) ? 'text-info' : 'text-primary'">
                      {{ isRunReturningToOrigin(selectedRun) ? 'En Retorno' : estimatedTimeRemaining }}
                    </span>
                  </div>
                  <div class="column items-center border-left-sep q-pl-md">
                    <span class="text-caption text-grey-6 uppercase-label">Pagos Recibidos</span>
                    <span class="text-weight-bold text-positive">{{ formatCurrency(selectedRunPaymentsTotal) }}</span>
                  </div>
                </div>

                <q-linear-progress
                  :value="selectedRunProgress"
                  :color="isRunReturningToOrigin(selectedRun) ? 'info' : 'positive'"
                  size="6px"
                  class="q-mt-md rounded-borders"
                />
              </div>

              <!-- List of Deliveries -->
              <div class="q-pa-md">
                <div class="text-overline text-grey-7 q-mb-sm">Hoja de Ruta</div>
                <div class="delivery-vertical-timeline">
                  <div
                    v-for="(item, index) in selectedRun.items"
                    :key="item.id"
                    class="timeline-node q-mb-md"
                    :class="item.delivery_status"
                  >
                    <div class="node-marker shadow-2" :class="`marker-${item.delivery_status}`">
                      {{ index + 1 }}
                    </div>
                    <q-card flat bordered class="node-content rounded-borders-12 shadow-1">
                      <q-card-section class="q-pa-sm">
                        <div class="row items-center justify-between no-wrap">
                          <div class="text-weight-bold text-subtitle2 ellipsis">{{ item.invoice?.client?.name }}</div>
                          <q-badge :color="getDeliveryStatusColor(item.delivery_status)" class="q-ml-sm">
                            {{ getDeliveryStatusLabel(item.delivery_status) }}
                          </q-badge>
                        </div>
                        <div class="text-caption text-grey-7 ellipsis-2-lines q-mt-xs">
                          <q-icon name="place" size="xs" color="grey-5" />
                          {{ item.invoice?.client?.address?.street || 'Sin dirección registrada' }}
                        </div>

                        <!-- Mini Payment Info if delivered -->
                        <div v-if="getItemPayment(item) > 0" class="row items-center q-mt-xs text-positive text-weight-bold text-caption">
                          <q-icon name="payments" size="xs" class="q-mr-xs" />
                          Pagado: {{ formatCurrency(getItemPayment(item)) }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- History Tab -->
          <q-tab-panel name="history" class="q-pa-none overflow-hidden column no-wrap">
            <!-- Compact Header with Filter Button -->
            <div class="history-compact-header q-px-md q-py-sm bg-white shadow-1 row items-center justify-between">
              <div class="column">
                <div class="text-subtitle2 text-weight-bold text-grey-9">Recorridos Históricos</div>
              </div>
              <q-btn
                unelevated
                rounded
                color="indigo-1"
                text-color="primary"
                icon="tune"
                label="Filtrar"
                class="text-weight-bold"
                @click="showFilterDialog = true"
              />
            </div>

            <!-- History Summary Stats Ribbon -->
            <div v-if="historyRuns.length > 0" class="history-stats-ribbon q-py-md row justify-around text-center">
              <div class="column">
                <span class="text-caption text-grey-7 uppercase-label">Rutas</span>
                <span class="text-subtitle2 text-weight-bolder text-indigo-9">{{ historyRuns.length }}</span>
              </div>
              <div class="column border-left-sep q-pl-md">
                <span class="text-caption text-grey-7 uppercase-label">Entregas</span>
                <span class="text-subtitle2 text-weight-bolder text-indigo-9">{{ historyTotalDeliveries }}</span>
              </div>
              <div class="column border-left-sep q-pl-md">
                <span class="text-caption text-grey-7 uppercase-label">Total Pagos</span>
                <span class="text-subtitle2 text-weight-bolder text-positive">{{ formatCurrency(historyTotalPayments) }}</span>
              </div>
            </div>

            <!-- Scrollable List -->
            <div class="col scroll q-pb-xl">
              <q-list separator padding class="history-runs-list">
                <q-item
                  v-for="run in historyRuns"
                  :key="run.id"
                  clickable
                  v-ripple
                  @click="selectHistoryRun(run)"
                  :active="selectedHistoryRun?.id === run.id"
                  class="history-item q-mx-md q-my-xs rounded-borders-12 shadow-sm"
                  active-class="active-history-item"
                >
                  <q-item-section avatar>
                    <q-avatar color="indigo-1" text-color="indigo-7" size="42px">
                      <q-icon name="route" size="24px" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-grey-9">#{{ run.id }} • {{ run.delivery_person?.name }}</q-item-label>
                    <div class="row items-center text-grey-6 q-gutter-x-sm">
                      <q-icon name="today" size="xs" />
                      <span>{{ formatDate(run.started_at) }}</span>
                    </div>
                    <div class="row items-center text-positive q-gutter-x-xs">
                      <q-icon name="payments" size="xs" />
                      <span class="text-weight-bold">{{ formatCurrency(calculateRunPayments(run)) }}</span>
                    </div>
                  </q-item-section>

                  <q-item-section side>
                    <div class="column items-end">
                      <q-badge color="indigo-7" :label="`${run.items?.length || 0} p.`" rounded />
                      <div class="q-mt-xs" style="font-size: 10px;">
                        {{ calculateCompletedDuration(run.started_at, run.completed_at) }}
                      </div>
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="content_copy"
                        size="sm"
                        class="q-mt-xs clone-btn"
                        @click.stop="openClonePreview(run)"
                      >
                        <q-tooltip>Clonar Recorrido</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>

                <div v-if="historyRuns.length === 0 && !historyLoading" class="empty-history-state q-pa-xl text-center">
                  <q-icon name="history" size="84px" color="grey-2" />
                  <div class="text-h6 text-grey-4 q-mt-md">Sin resultados</div>
                  <p class="text-grey-5 px-md">No encontramos recorridos para los filtros seleccionados.</p>
                </div>
              </q-list>
            </div>

            <q-inner-loading :showing="historyLoading" class="rounded-borders">
              <q-spinner-dots size="40px" color="primary" />
            </q-inner-loading>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Filter Dialog -->
    <q-dialog v-model="showFilterDialog" position="bottom" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="filter-dialog-card no-border-radius-top">
        <q-card-section class="q-pb-none row items-center justify-between">
          <div class="text-h6 text-weight-bold text-grey-9">Filtros de Historial</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <div class="text-overline text-grey-7 q-mb-sm">Accesos Rápidos</div>
          <div class="row q-gutter-sm justify-between no-wrap overflow-auto hide-scrollbar">
            <q-btn
              v-for="range in quickDateRanges"
              :key="range.label"
              unelevated
              no-caps
              class="col flex-1 rounded-borders-12 text-weight-bold"
              :label="range.label"
              :color="isRangeActive(range) ? 'primary' : 'grey-1'"
              :text-color="isRangeActive(range) ? 'white' : 'grey-9'"
              @click="setQuickRange(range); showFilterDialog = false"
              style="min-width: 80px;"
            />
          </div>

          <q-separator class="q-my-lg" />

          <div class="text-overline text-grey-7 q-mb-sm">Personalizar Repartidor</div>
          <q-select
            v-model="historyFilters.deliveryPerson"
            :options="deliveryPersonOptions"
            label="Seleccionar Repartidor"
            outlined
            dense
            rounded
            clearable
            option-value="id"
            option-label="name"
            emit-value
            map-options
            bg-color="grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-select>

          <div class="text-overline text-grey-7 q-mt-md q-mb-sm">Personalizar Fecha</div>
          <div class="row items-center no-wrap border rounded-borders-24 q-px-md bg-grey-1" style="height: 48px;">
            <q-icon name="event" size="sm" color="grey-6" class="q-mr-sm" />
            <div class="col column">
              <span class="text-caption text-grey-7" style="font-size: 10px; line-height: 1;">Periodo</span>
              <span class="text-body2 text-grey-9 text-weight-medium">
                {{ formatDateShort(historyFilters.startDate) }} - {{ formatDateShort(historyFilters.endDate) }}
              </span>
            </div>
            <q-btn flat round dense icon="edit_calendar" color="primary">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="historyDateRange" range minimal>
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Aceptar" color="primary" flat v-close-popup />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md q-pb-lg">
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Aplicar Filtros"
            class="full-width q-py-md text-weight-bold shadow-2"
            @click="loadHistoryRuns(); showFilterDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- View Mode Floating Toggle - Moved to top-left for convenience -->
    <div class="absolute-bottom-right q-ma-md" style="z-index: 1002; bottom: 5px;">
      <q-btn-group rounded unelevated class="shadow-5 bg-white-transparent blur-bg border-all">
        <q-btn
          :color="viewMode === 'map' ? 'primary' : 'grey-8'"
          flat
          round
          dense
          icon="map"
          class="q-px-sm"
          @click="viewMode = 'map'"
        >
          <q-tooltip anchor="bottom middle" self="top middle">Solo Mapa</q-tooltip>
        </q-btn>
        <q-btn
          :color="viewMode === 'split' ? 'primary' : 'grey-8'"
          flat
          round
          dense
          icon="view_quilt"
          class="q-px-sm"
          @click="viewMode = 'split'"
        >
          <q-tooltip anchor="bottom middle" self="top middle">Vista Dividida</q-tooltip>
        </q-btn>
        <q-btn
          :color="viewMode === 'panel' ? 'primary' : 'grey-8'"
          flat
          round
          dense
          icon="format_list_bulleted"
          class="q-px-sm"
          @click="viewMode = 'panel'"
        >
          <q-tooltip anchor="bottom middle" self="top middle">Solo Recorridos</q-tooltip>
        </q-btn>

        <q-separator vertical inset class="q-mx-xs" />

        <q-btn
          flat
          round
          dense
          icon="refresh"
          color="primary"
          class="q-px-sm"
          @click="refreshData"
          :loading="loading"
        >
          <q-tooltip anchor="bottom middle" self="top middle">Actualizar Datos</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>
    <!-- Cloning Preview Dialog -->
    <!-- Cloning Preview Dialog -->
    <q-dialog v-model="showCloneDialog" persistent transition-show="scale" transition-hide="scale" :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 1000px; max-width: 95vw;'" :class="$q.screen.lt.sm ? 'column full-height' : ''" class="rounded-borders-20 overflow-hidden shadow-24">
        <!-- Compact Header -->
        <q-card-section class="bg-white border-bottom-subtle">
          <div class="row items-center justify-between no-wrap">
            <div class="column">
              <div class="text-h6 text-weight-bolder text-grey-9">Clonar Recorrido</div>
              <div class="text-caption text-grey-6">Selecciona las facturas de la ruta #{{ runToClone?.id }}</div>
            </div>
            <q-btn flat round dense icon="close" color="grey-7" v-close-popup class="bg-grey-1" />
          </div>
        </q-card-section>

        <!-- Compact Search & Selection Area -->
        <q-card-section class="q-pa-none bg-grey-1">
          <div class="row items-center justify-between no-wrap q-gutter-md">
            <div class="row items-center q-gutter-sm">
              <q-badge color="primary" rounded class="q-px-sm q-py-xs shadow-1">
                {{ selectedCloneCount }} seleccionadas
              </q-badge>
              <q-btn flat rounded dense size="sm" color="primary" :label="selectedCloneCount === cloneItems.length ? 'Deseleccionar todo' : 'Seleccionar todo'"
                @click="cloneItems.forEach(i => i.selected = selectedCloneCount !== cloneItems.length)" class="text-weight-bold" />
            </div>

            <!-- Date Picker for Clone -->
            <div class="row items-center q-gutter-sm">
              <span class="text-caption text-grey-7 text-weight-bold">FECHA DE ENTREGA:</span>
              <q-input v-model="cloneDeliveryDate" dense outlined rounded bg-color="white" mask="####-##-##" class="q-ml-sm" style="width: 150px;">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="cloneDeliveryDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Cerrar" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <!-- Content Area -->
        <q-card-section :class="$q.screen.lt.sm ? 'col scroll' : 'scroll q-pa-lg half-height-scroll'" style="height: calc(100vh - 320px);">
          <div class="row q-col-gutter-md">
            <div v-for="(item, index) in cloneItems" :key="index" class="col-12 col-sm-6">
              <div
                class="minimal-invoice-card"
                :class="{ 'is-selected': item.selected }"
                @click="item.selected = !item.selected"
              >
                <!-- Card Header -->
                <div class="row items-start justify-between q-mb-sm">
                  <div class="column col">
                    <span class="text-caption text-weight-bold text-primary text-uppercase letter-spacing-1" style="font-size: 0.65rem;">Factura #{{ item.invoice?.id }}</span>
                    <span class="text-subtitle2 text-weight-bold text-grey-9 ellipsis">{{ item.invoice?.client?.name }}</span>
                  </div>
                  <q-checkbox v-model="item.selected" color="primary" dense @click.stop />
                </div>

                <!-- Invoice Description -->


                <!-- Products Mini-list -->
                <div class="bg-grey-1 rounded-borders-12 q-pa-sm q-mb-sm border-subtle">
                  <div v-for="product in item.invoice?.products || []" :key="product.id" class="row items-center q-py-xs q-px-sm border-bottom-subtle last-no-border">
                    <div class="col text-caption text-grey-7 ellipsis">{{ product.name }}</div>
                    <div class="col-auto row items-center no-wrap bg-white rounded-borders-20 q-px-xs border-subtle">
                      <q-btn
                        flat
                        round
                        dense
                        icon="remove"
                        size="xs"
                        color="grey-6"
                        @click.stop="product.pivot.amount = Math.max(0, (product.pivot.amount || 0) - 1)"
                        class="q-mr-xs"
                      />
                      <q-input
                        v-model.number="product.pivot.amount"
                        type="number"
                        step="1"
                        dense
                        borderless
                        input-class="text-center text-weight-bolder text-grey-9 q-pa-none"
                        style="width: 32px; font-size: 0.85rem;"
                        @click.stop
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="add"
                        size="xs"
                        color="grey-6"
                        @click.stop="product.pivot.amount = (product.pivot.amount || 0) + 1"
                        class="q-ml-xs"
                      />
                      <span class="text-caption text-grey-4 q-ml-xs" style="font-size: 0.7rem;">ud.</span>
                    </div>
                  </div>
                </div>

                <q-input
                  v-model="item.invoice.description"
                  dense
                  outlined
                  label="Observación / Descripción"
                  bg-color="white"
                  class="q-mb-sm rounded-borders-12 overflow-hidden"
                  style="font-size: 0.8rem;"
                  rows="1"
                  type="textarea"
                  autogrow
                  @click.stop
                />

                <!-- Card Footer Info -->
                <div class="row items-center justify-between mt-auto">
                  <span class="text-caption text-grey-5">Total</span>
                  <span class="text-subtitle2 text-weight-bolder text-grey-9">
                    {{ formatCurrency(calculateInvoiceTotal(item.invoice)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Action Footer -->
        <q-card-section class="q-px-lg q-py-md bg-white border-top-subtle">
          <div class="row items-center justify-between bg-grey-1 q-pa-md rounded-borders-20 border-subtle">
            <div class="column">
              <span class="text-caption text-grey-6">Total a clonar</span>
              <span class="text-h6 text-weight-bolder text-primary">
                {{ formatCurrency(calculateSelectedCloneTotal) }}
              </span>
            </div>
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Clonar"
              class="text-weight-bold text-uppercase letter-spacing-1 shadow-2 q-px-xl"
              :loading="cloningInProgress"
              :disable="selectedCloneCount === 0"
              @click="confirmCloning"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* global google */
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'

const $q = useQuasar()

/**
 * Google Maps instance
 * @type {Ref<google.maps.Map|null>}
 */
const map = ref(null)

/**
 * Reference to the map container DOM element
 * @type {Ref<HTMLElement|null>}
 */
const mapContainer = ref(null)

/**
 * Loading state
 * @type {Ref<boolean>}
 */
const loading = ref(false)

/**
 * List of active delivery runs
 * @type {Ref<Array<Object>>}
 */
const activeRuns = ref([])

/**
 * Currently selected delivery run
 * @type {Ref<Object|null>}
 */
const selectedRun = ref(null)

/**
 * Map markers for couriers
 * @type {Ref<Map<number, google.maps.Marker>>}
 */
const courierMarkers = ref(new Map())

/**
 * Map markers for deliveries
 * @type {Ref<Map<number, Array<google.maps.Marker>>>}
 */
const deliveryMarkers = ref(new Map())

/**
 * Polylines for routes
 * @type {Ref<Map<number, Object>>}
 */
const routePolylines = ref(new Map())

/**
 * Echo instance for real-time updates (from global)
 * @type {any}
 */
let echo = null

/**
 * Google Maps DirectionsService instance
 * @type {Ref<google.maps.DirectionsService|null>}
 */
const directionsService = ref(null)

/**
 * Interval ID for auto-refresh (deprecated - using Pusher instead)
 * @type {Ref<number|null>}
 */
const refreshInterval = ref(null)

/**
 * Active tab (live or history)
 * @type {Ref<string>}
 */
const activeTab = ref('live')

/**
 * View mode for the screen (split, map, panel)
 * @type {Ref<string>}
 */
const viewMode = ref('split')

/**
 * Handle map resizing when view mode changes
 */
watch(viewMode, (newVal) => {
  if (map.value) {
    // Increase delay to wait for CSS transitions
    setTimeout(() => {
      google.maps.event.trigger(map.value, 'resize')

      // If we're showing the map again, make sure it's properly framed
      if (newVal !== 'panel') {
        if (selectedRun.value) {
          fitRunBounds(selectedRun.value)
          drawRoute(selectedRun.value)
        } else if (activeRuns.value.length > 0) {
          fitMapBounds()
        }
      }
    }, 450)
  }
})

/**
 * Fits map to a specific run
 * @param {Object} run
 */
function fitRunBounds (run) {
  if (!map.value || !run) return
  const bounds = new google.maps.LatLngBounds()

  // Courier position
  const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
  if (latestLocation) {
    bounds.extend({ lat: parseFloat(latestLocation.latitude), lng: parseFloat(latestLocation.longitude) })
  }

  // Delivery positions
  run.items?.forEach(item => {
    const client = item.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude
    if (lat && lng) {
      bounds.extend({ lat: parseFloat(lat), lng: parseFloat(lng) })
    }
  })

  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
    // Don't zoom in too much
    const listener = google.maps.event.addListener(map.value, 'idle', () => {
      if (map.value.getZoom() > 16) map.value.setZoom(16)
      google.maps.event.removeListener(listener)
    })
  }
}

/**
 * History runs list
 * @type {Ref<Array<Object>>}
 */
const historyRuns = ref([])

/**
 * Selected history run
 * @type {Ref<Object|null>}
 */
const selectedHistoryRun = ref(null)

/**
 * History loading state
 * @type {Ref<boolean>}
 */
const historyLoading = ref(false)

/**
 * History filters
 * @type {Ref<Object>}
 */
const historyFilters = ref({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  deliveryPerson: null
})

/**
 * Delivery person options for filter
 * @type {Ref<Array<Object>>}
 */
const deliveryPersonOptions = ref([])

/**
 * Filter dialog visibility
 * @type {Ref<boolean>}
 */
const showFilterDialog = ref(false)

/**
 * Descripction
 * @type {boolean} description var
 */
const showCloneDialog = ref(false)

/**
 * Descripction
 * @type {Object} description var
 */
const runToClone = ref(null)

/**
 * Descripction
 * @type {Array} description var
 */
const cloneItems = ref([])

/**
 * Descripction
 * @type {boolean} description var
 */
const cloningInProgress = ref(false)

/**
 * Descripction
 * @type {string} description var
 */
const cloneDeliveryDate = ref(new Date().toISOString().split('T')[0])

// Computed properties
/**
 * Total number of deliveries across all runs
 * @type {ComputedRef<number>}
 */
const totalDeliveries = computed(() => {
  return activeRuns.value.reduce((sum, run) => sum + (run.items?.length || 0), 0)
})

/**
 * Total number of completed deliveries
 * @type {ComputedRef<number>}
 */
const completedDeliveries = computed(() => {
  return activeRuns.value.reduce((sum, run) => {
    return sum + (run.items?.filter(item => item.delivery_status === 'delivered').length || 0)
  }, 0)
})

/**
 * Total number of pending deliveries
 * @type {ComputedRef<number>}
 */
const pendingDeliveries = computed(() => {
  return totalDeliveries.value - completedDeliveries.value
})

/**
 * Summary stats for monitoring
 */
const monitorStats = computed(() => [
  { label: 'En Ruta', value: activeRuns.value.length, color: 'text-primary', bg: 'bg-white' },
  { label: 'Entregas', value: totalDeliveries.value, color: 'text-grey-9', bg: 'bg-white' },
  { label: 'Completas', value: completedDeliveries.value, color: 'text-positive', bg: 'bg-white' },
  { label: 'Pendientes', value: pendingDeliveries.value, color: 'text-warning', bg: 'bg-white' },
  { label: 'Retornando', value: returningToOriginCount.value, color: 'text-info', bg: 'bg-white' }
])

/**
 * Total payments received in the selected run
 */
const selectedRunPaymentsTotal = computed(() => {
  if (!selectedRun.value) return 0
  return calculateRunPayments(selectedRun.value)
})

/**
 * Helper to calculate total payments for a run
 * @param {Object} run
 */
function calculateRunPayments (run) {
  if (!run || !run.items) return 0
  return run.items.reduce((sum, item) => sum + getItemPayment(item), 0)
}

/**
 * Gets payment amount for a single item
 * @param {Object} item
 */
function getItemPayment (item) {
  if (!item.invoice || !item.invoice.invoice_payments) {
    // Check both camelCase and snake_case just in case
    const payments = item.invoice?.invoice_payments || item.invoice?.invoicePayments
    if (!payments) return 0
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  }
  return item.invoice.invoice_payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
}

/**
 * Format currency using company settings
 */
function formatCurrency (val) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(val || 0)
}

// History Range Logic
const historyDateRange = computed({
  get: () => ({ from: historyFilters.value.startDate.replace(/-/g, '/'), to: historyFilters.value.endDate.replace(/-/g, '/') }),
  set: (val) => {
    if (typeof val === 'string') {
      historyFilters.value.startDate = val.replace(/\//g, '-')
      historyFilters.value.endDate = val.replace(/\//g, '-')
    } else {
      historyFilters.value.startDate = val.from.replace(/\//g, '-')
      historyFilters.value.endDate = val.to.replace(/\//g, '-')
    }
  }
})

const quickDateRanges = [
  { label: 'Hoy', days: 0 },
  { label: 'Semana', days: 7 },
  { label: 'Mes', days: 30 }
]

function isRangeActive (range) {
  const start = new Date()
  start.setDate(start.getDate() - range.days)
  const isoStart = start.toISOString().split('T')[0]
  return historyFilters.value.startDate === isoStart
}

function setQuickRange (range) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - range.days)

  historyFilters.value.startDate = start.toISOString().split('T')[0]
  historyFilters.value.endDate = end.toISOString().split('T')[0]
  loadHistoryRuns()
}

function formatDateShort (dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

const historyTotalDeliveries = computed(() => {
  return historyRuns.value.reduce((sum, run) => sum + (run.items?.length || 0), 0)
})

const historyTotalPayments = computed(() => {
  return historyRuns.value.reduce((sum, run) => sum + calculateRunPayments(run), 0)
})

/**
 * Number of delivered items in selected run
 * @type {ComputedRef<number>}
 */
const selectedRunDeliveredCount = computed(() => {
  if (!selectedRun.value) return 0
  return selectedRun.value.items?.filter(item => item.delivery_status === 'delivered').length || 0
})

/**
 * Total number of items in selected run
 * @type {ComputedRef<number>}
 */
const selectedRunTotalCount = computed(() => {
  if (!selectedRun.value) return 0
  return selectedRun.value.items?.length || 0
})

/**
 * Progress percentage for selected run
 * @type {ComputedRef<number>}
 */
const selectedRunProgress = computed(() => {
  if (!selectedRun.value || selectedRunTotalCount.value === 0) return 0
  return selectedRunDeliveredCount.value / selectedRunTotalCount.value
})

/**
 * Estimated time remaining for selected run
 * @type {ComputedRef<string>}
 */
const estimatedTimeRemaining = computed(() => {
  if (!selectedRun.value) return '-'
  const pendingItems = selectedRun.value.items?.filter(item => item.delivery_status !== 'delivered') || []
  const totalMinutes = pendingItems.reduce((sum, item) => sum + (item.estimated_time || 15), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
})

onMounted(async () => {
  initializeWebSocket()
  await initializeMap()
  await loadActiveRuns()
  await loadDeliveryPersons()

  // Set default history to this week
  setQuickRange(quickDateRanges[1]) // 'Semana'
})

onBeforeUnmount(() => {
  // Leave channel (don't disconnect global echo)
  if (echo) {
    echo.leave('delivery-tracking')
  }

  // Clear interval if exists
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }

  console.log('Admin monitor unmounted, cleaned up resources')
})

/**
 * Initializes Google Maps
 * @async
 * @returns {Promise<void>}
 */
async function initializeMap () {
  try {
    await loadGoogleMaps()

    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: -25.2637, lng: -57.5759 }, // Asunción, Paraguay
      zoom: 12,
      styles: darkMapStyles,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    })

    directionsService.value = new google.maps.DirectionsService()

    console.log('Map initialized successfully')
  } catch (error) {
    console.error('Error initializing map:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el mapa',
      position: 'top'
    })
  }
}

/**
 * Loads all active delivery runs from backend
 * @async
 * @returns {Promise<void>}
 */
async function loadActiveRuns () {
  loading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/all-active')
    activeRuns.value = response.data.delivery_runs || []

    // Update map with all runs
    updateMapMarkers()

    console.log('Loaded active runs:', activeRuns.value.length)
  } catch (error) {
    console.error('Error loading active runs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar recorridos activos',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Load a single delivery run and update it in the list
 * @async
 * @param {number} runId - Delivery run ID
 * @returns {Promise<void>}
 */
async function loadSingleRun (runId) {
  try {
    const response = await api.get(`/invoice-delivery-runs/${runId}`)
    const updatedRun = response.data.delivery_run

    if (!updatedRun) return

    // Find and update the run in activeRuns
    const index = activeRuns.value.findIndex(run => run.id === runId)
    if (index !== -1) {
      activeRuns.value[index] = updatedRun

      // Update selected run if it's the one being updated
      if (selectedRun.value?.id === runId) {
        selectedRun.value = updatedRun
      }

      // Update map markers for this run
      updateMapMarkers()

      console.log('✅ Run updated:', runId)
    }
  } catch (error) {
    console.error('Error loading single run:', error)
  }
}

/**
 * Updates all markers on the map
 * @returns {void}
 */
function updateMapMarkers () {
  if (!map.value) return

  // Clear existing markers
  clearAllMarkers()

  // Add markers for each active run
  activeRuns.value.forEach(run => {
    addCourierMarker(run)
    addDeliveryMarkers(run)

    // Add origin marker if returning to origin
    if (isRunReturningToOrigin(run)) {
      addOriginMarker(run)
    }

    drawRoute(run)
  })

  // Fit bounds to show all markers
  fitMapBounds()
}

/**
 * Adds courier marker to map
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addCourierMarker (run) {
  // Get latest location from locations array
  const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null

  let position = null

  if (latestLocation) {
    // Usar ubicación GPS si está disponible
    position = {
      lat: parseFloat(latestLocation.latitude),
      lng: parseFloat(latestLocation.longitude)
    }
  } else if (run.items && run.items.length > 0) {
    // Fallback: usar ubicación de la primera entrega si no hay GPS todavía
    const firstItem = run.items[0]
    const client = firstItem.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude

    if (lat && lng) {
      position = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      }
      console.log('📍 Using first delivery location as courier marker (no GPS yet)')
    }
  }

  // Si no hay ubicación disponible, no crear marcador
  if (!position) {
    console.warn('⚠️ No location available for courier marker')
    return
  }

  const marker = new google.maps.Marker({
    position,
    map: map.value,
    icon: {
      path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
      fillColor: '#2196F3',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 0.7,
      anchor: new google.maps.Point(11.5, 23.5)
    },
    title: run.delivery_person?.name || 'Repartidor',
    zIndex: 1000
  })

  // Add click listener
  marker.addListener('click', () => {
    selectRun(run)
  })

  // Calcular entregas completadas y totales para este run
  const deliveredCount = run.items?.filter(item => item.delivery_status === 'delivered').length || 0
  const totalCount = run.items?.length || 0

  // Crear info window con dirección
  const infoWindow = new google.maps.InfoWindow({
    content: 'Cargando...'
  })

  // Obtener dirección usando Geocoding API
  const geocoder = new google.maps.Geocoder()

  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const address = results[0].formatted_address
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 200px; max-width: 280px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #2196F3;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <span style="color: white; font-size: 18px;">🚗</span>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                ${run.delivery_person?.name || 'Repartidor'}
              </div>
              <div style="font-size: 11px; color: #666; font-weight: 500;">
                Recorrido #${run.id}
              </div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: center; font-size: 12px; color: #444; margin-bottom: 4px;">
              <span style="margin-right: 6px;">📍</span>
              <span style="font-weight: 500;">Ubicación actual:</span>
            </div>
            <div style="font-size: 11px; color: #666; line-height: 1.4; padding-left: 22px;">
              ${address}
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; padding: 8px 10px; border-radius: 6px; margin-top: 8px;">
            <div style="display: flex; align-items: center; font-size: 12px; color: #444;">
              <span style="margin-right: 6px;">📦</span>
              <span style="font-weight: 500;">Entregas:</span>
            </div>
            <div style="font-weight: 700; font-size: 13px; color: ${deliveredCount === totalCount ? '#4CAF50' : '#2196F3'};">
              ${deliveredCount} / ${totalCount}
            </div>
          </div>
        </div>
      `)
    } else {
      // Si falla el geocoding, mostrar sin dirección
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 200px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #2196F3;">
              <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 18px;">🚗</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.delivery_person?.name || 'Repartidor'}
                </div>
                <div style="font-size: 11px; color: #666; font-weight: 500;">
                  Recorrido #${run.id}
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f5f5f5; padding: 8px 10px; border-radius: 6px;">
              <div style="display: flex; align-items: center; font-size: 12px; color: #444;">
                <span style="margin-right: 6px;">📦</span>
                <span style="font-weight: 500;">Entregas:</span>
              </div>
              <div style="font-weight: 700; font-size: 13px; color: ${deliveredCount === totalCount ? '#4CAF50' : '#2196F3'};">
                ${deliveredCount} / ${totalCount}
              </div>
            </div>
          </div>
        </div>
      `)
    }
  })

  marker.addListener('mouseover', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseout', () => {
    infoWindow.close()
  })

  courierMarkers.value.set(run.id, marker)
}

/**
 * Adds delivery markers for a run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addDeliveryMarkers (run) {
  const markers = []

  run.items?.forEach((item, index) => {
    const client = item.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude

    if (!lat || !lng) return

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) }

    // Color based on status
    let color
    switch (item.delivery_status) {
      case 'delivered':
        color = '#4CAF50' // Green
        break
      case 'arrived':
        color = '#FF9800' // Orange
        break
      default:
        color = '#9E9E9E' // Grey
    }

    const marker = new google.maps.Marker({
      position,
      map: map.value,
      label: {
        text: String(index + 1),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    })

    markers.push(marker)
  })

  deliveryMarkers.value.set(run.id, markers)
}

/**
 * Adds origin marker for a run returning to origin
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function addOriginMarker (run) {
  if (!run.branch_office) return

  const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
  const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

  if (!branchLat || !branchLng) return

  const position = { lat: branchLat, lng: branchLng }

  const marker = new google.maps.Marker({
    position,
    map: map.value,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="65" viewBox="0 0 50 65">
          <!-- Shadow -->
          <ellipse cx="25" cy="60" rx="10" ry="2" fill="rgba(0,0,0,0.3)"/>
          
          <!-- Pin shape -->
          <defs>
            <linearGradient id="originGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M25 5 C15 5 7 13 7 23 C7 35 25 60 25 60 C25 60 43 35 43 23 C43 13 35 5 25 5 Z" 
                fill="url(#originGradient)" stroke="white" stroke-width="3"/>
          
          <!-- White circle background -->
          <circle cx="25" cy="22" r="12" fill="white"/>
          
          <!-- Home icon -->
          <g transform="translate(25, 22)">
            <path d="M -6 -4 L 0 -8 L 6 -4 L 6 6 L -6 6 Z" fill="#10b981"/>
            <rect x="-2" y="2" width="4" height="4" fill="white"/>
          </g>
        </svg>
      `),
      scaledSize: new google.maps.Size(50, 65),
      anchor: new google.maps.Point(25, 65)
    },
    title: run.branch_office.name || 'Sucursal de Origen',
    zIndex: 9999
  })

  // Add info window with address
  const infoWindow = new google.maps.InfoWindow({
    content: 'Cargando...'
  })

  // Obtener dirección usando Geocoding API
  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ location: position }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const address = results[0].formatted_address
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 220px; max-width: 300px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 20px;">🏢</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.branch_office.name || 'Sucursal de Origen'}
                </div>
                <div style="font-size: 11px; color: #10b981; font-weight: 600;">
                  Destino de retorno
                </div>
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; font-size: 12px; color: #444; margin-bottom: 4px;">
                <span style="margin-right: 6px;">📍</span>
                <span style="font-weight: 500;">Dirección:</span>
              </div>
              <div style="font-size: 11px; color: #666; line-height: 1.4; padding-left: 22px;">
                ${address}
              </div>
            </div>
          </div>
        </div>
      `)
    } else {
      // Fallback sin dirección
      infoWindow.setContent(`
        <div style="font-family: 'Roboto', Arial, sans-serif; padding: 0; margin: 0; min-width: 220px;">
          <div style="padding: 12px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <span style="color: white; font-size: 20px;">🏢</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 14px; color: #1a1a1a; margin-bottom: 2px;">
                  ${run.branch_office.name || 'Sucursal de Origen'}
                </div>
                <div style="font-size: 11px; color: #10b981; font-weight: 600;">
                  Destino de retorno
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
    }
  })

  marker.addListener('click', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseover', () => {
    infoWindow.open(map.value, marker)
  })

  marker.addListener('mouseout', () => {
    infoWindow.close()
  })

  // Store marker with deliveryMarkers for this run
  const existingMarkers = deliveryMarkers.value.get(run.id) || []
  existingMarkers.push(marker)
  deliveryMarkers.value.set(run.id, existingMarkers)
}

/**
 * Clears route polylines for a specific delivery run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRoutePolylines (runId) {
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) {
      polylines.completed.setMap(null)
    }
    if (polylines.pending) {
      polylines.pending.setMap(null)
    }
    if (polylines.returnToOrigin) {
      polylines.returnToOrigin.setMap(null)
    }
    // Don't clear GPS trail here, it's updated separately
  }
}

/**
 * Updates GPS trail for a delivery run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function updateGPSTrail (run) {
  if (!run.locations || run.locations.length < 2) return

  // Remove old GPS trail
  const existingPolylines = routePolylines.value.get(run.id)
  if (existingPolylines?.gpsTrail) {
    existingPolylines.gpsTrail.setMap(null)
  }

  // Create path from all locations (reversed because they're ordered desc)
  const gpsPath = run.locations.map(loc => ({
    lat: parseFloat(loc.latitude),
    lng: parseFloat(loc.longitude)
  })).reverse()

  // Draw new GPS trail (green line showing actual path)
  const gpsTrail = new google.maps.Polyline({
    path: gpsPath,
    geodesic: true,
    strokeColor: '#4CAF50',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map: map.value,
    zIndex: 100
  })

  // Store the GPS trail
  if (!routePolylines.value.has(run.id)) {
    routePolylines.value.set(run.id, {})
  }
  routePolylines.value.get(run.id).gpsTrail = gpsTrail

  console.log('🛣️ GPS trail updated with', gpsPath.length, 'points')
}

/**
 * Draws route for a delivery run
 * @param {Object} run - Delivery run object
 * @returns {Promise<void>}
 */
async function drawRoute (run) {
  if (!directionsService.value || !run.items || run.items.length === 0) {
    console.log('⚠️ Cannot draw route: missing data')
    return
  }

  const waypoints = []
  const completedWaypoints = []
  const pendingWaypoints = []

  run.items.forEach(item => {
    const client = item.invoice?.client
    const lat = client?.address?.latitude || client?.latitude
    const lng = client?.address?.longitude || client?.longitude

    if (lat && lng) {
      const location = new google.maps.LatLng(parseFloat(lat), parseFloat(lng))

      if (item.delivery_status === 'delivered') {
        completedWaypoints.push({ location, stopover: true })
      } else {
        pendingWaypoints.push({ location, stopover: true })
      }

      waypoints.push({ location, stopover: true })
    }
  })

  if (waypoints.length === 0) {
    console.log('⚠️ No valid waypoints found')
    return
  }

  console.log('🗺️ Drawing route:', {
    total: waypoints.length,
    completed: completedWaypoints.length,
    pending: pendingWaypoints.length
  })

  try {
    // Draw completed route (red)
    if (completedWaypoints.length >= 2) {
      const completedRequest = {
        origin: completedWaypoints[0].location,
        destination: completedWaypoints[completedWaypoints.length - 1].location,
        waypoints: completedWaypoints.length > 2 ? completedWaypoints.slice(1, -1) : [],
        travelMode: google.maps.TravelMode.DRIVING
      }

      console.log('🔴 Drawing completed route with', completedWaypoints.length, 'points')

      const completedResult = await directionsService.value.route(completedRequest)
      const completedRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        directions: completedResult,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#F44336',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      })

      if (!routePolylines.value.has(run.id)) {
        routePolylines.value.set(run.id, {})
      }
      routePolylines.value.get(run.id).completed = completedRenderer
    }

    // Draw pending route (grey)
    if (pendingWaypoints.length > 0) {
      // Determinar punto de origen para la ruta pendiente
      let originPos

      // Si hay ubicación GPS actual, usar esa
      const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
      if (latestLocation) {
        originPos = new google.maps.LatLng(parseFloat(latestLocation.latitude), parseFloat(latestLocation.longitude))
        console.log('📍 Using GPS location as origin')
      } else if (completedWaypoints.length > 0) {
        // Si hay entregas completadas, usar la última
        originPos = completedWaypoints[completedWaypoints.length - 1].location
        console.log('📍 Using last completed delivery as origin')
      } else {
        // Si no hay nada completado, usar la primera entrega pendiente como origen
        originPos = pendingWaypoints[0].location
        console.log('📍 Using first pending delivery as origin')
      }

      // Si solo hay una entrega pendiente
      if (pendingWaypoints.length === 1) {
        const pendingRequest = {
          origin: originPos,
          destination: pendingWaypoints[0].location,
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('⚪ Drawing pending route to single destination')

        const pendingResult = await directionsService.value.route(pendingRequest)
        const pendingRenderer = new google.maps.DirectionsRenderer({
          map: map.value,
          directions: pendingResult,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })

        if (!routePolylines.value.has(run.id)) {
          routePolylines.value.set(run.id, {})
        }
        routePolylines.value.get(run.id).pending = pendingRenderer
      } else {
        // Múltiples entregas pendientes
        const pendingRequest = {
          origin: originPos,
          destination: pendingWaypoints[pendingWaypoints.length - 1].location,
          waypoints: pendingWaypoints.slice(0, -1),
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('⚪ Drawing pending route with', pendingWaypoints.length, 'points')

        const pendingResult = await directionsService.value.route(pendingRequest)
        const pendingRenderer = new google.maps.DirectionsRenderer({
          map: map.value,
          directions: pendingResult,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })

        if (!routePolylines.value.has(run.id)) {
          routePolylines.value.set(run.id, {})
        }
        routePolylines.value.get(run.id).pending = pendingRenderer
      }
    }

    // Draw return to origin route (green) if all deliveries are completed and returning to origin
    if (pendingWaypoints.length === 0 && completedWaypoints.length > 0 && run.branch_office) {
      const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
      const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

      if (branchLat && branchLng) {
        const branchLocation = new google.maps.LatLng(branchLat, branchLng)
        const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
        const currentPos = latestLocation
          ? new google.maps.LatLng(parseFloat(latestLocation.latitude), parseFloat(latestLocation.longitude))
          : completedWaypoints[completedWaypoints.length - 1].location

        const returnRequest = {
          origin: currentPos,
          destination: branchLocation,
          travelMode: google.maps.TravelMode.DRIVING
        }

        console.log('🟢 Drawing return to origin route')

        try {
          const returnResult = await directionsService.value.route(returnRequest)
          const returnRenderer = new google.maps.DirectionsRenderer({
            map: map.value,
            directions: returnResult,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#4CAF50',
              strokeWeight: 5,
              strokeOpacity: 0.7
            }
          })

          if (!routePolylines.value.has(run.id)) {
            routePolylines.value.set(run.id, {})
          }
          routePolylines.value.get(run.id).returnToOrigin = returnRenderer
        } catch (error) {
          console.error('Error drawing return route:', error)
        }
      }
    }

    console.log('✅ Route drawn successfully')
  } catch (error) {
    console.error('❌ Error drawing route:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al dibujar la ruta en el mapa',
      position: 'top',
      timeout: 2000
    })
  }
}

/**
 * Clears markers and routes for a specific delivery run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRunMarkers (runId) {
  console.log('🧹 Clearing markers for run:', runId)

  // Clear courier marker
  const courierMarker = courierMarkers.value.get(runId)
  if (courierMarker) {
    courierMarker.setMap(null)
    courierMarkers.value.delete(runId)
  }

  // Clear delivery markers
  const deliveryMarkersArray = deliveryMarkers.value.get(runId)
  if (deliveryMarkersArray) {
    deliveryMarkersArray.forEach(marker => marker.setMap(null))
    deliveryMarkers.value.delete(runId)
  }

  // Clear route polylines
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    if (polylines.returnToOrigin) polylines.returnToOrigin.setMap(null)
    routePolylines.value.delete(runId)
  }

  console.log('✅ Markers cleared for run:', runId)
}

/**
 * Clears all markers from map
 * @returns {void}
 */
function clearAllMarkers () {
  courierMarkers.value.forEach(marker => marker.setMap(null))
  courierMarkers.value.clear()

  deliveryMarkers.value.forEach(markers => {
    markers.forEach(marker => marker.setMap(null))
  })
  deliveryMarkers.value.clear()

  routePolylines.value.forEach(polylines => {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    if (polylines.returnToOrigin) polylines.returnToOrigin.setMap(null)
  })
  routePolylines.value.clear()
}

/**
 * Fits map bounds to show all markers
 * @returns {void}
 */
function fitMapBounds () {
  if (!map.value || courierMarkers.value.size === 0) return

  const bounds = new google.maps.LatLngBounds()

  courierMarkers.value.forEach(marker => {
    bounds.extend(marker.getPosition())
  })

  deliveryMarkers.value.forEach(markers => {
    markers.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
  })

  map.value.fitBounds(bounds)
}

/**
 * Updates route styles for selected run (blue) and non-selected runs (original colors)
 * @param {number} selectedRunId - ID of the selected run
 * @returns {void}
 */
function updateRouteStyles (selectedRunId) {
  routePolylines.value.forEach((polylines, runId) => {
    if (runId === selectedRunId) {
      // Rutas seleccionadas: AZUL
      if (polylines.completed) {
        const directions = polylines.completed.getDirections()
        if (directions) {
          polylines.completed.setDirections(directions)
          polylines.completed.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 6,
              strokeOpacity: 0.9
            }
          })
        }
      }
      if (polylines.pending) {
        const directions = polylines.pending.getDirections()
        if (directions) {
          polylines.pending.setDirections(directions)
          polylines.pending.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 6,
              strokeOpacity: 0.7
            }
          })
        }
      }
    } else {
      // Rutas no seleccionadas: colores originales más tenues
      if (polylines.completed) {
        const directions = polylines.completed.getDirections()
        if (directions) {
          polylines.completed.setDirections(directions)
          polylines.completed.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#F44336',
              strokeWeight: 4,
              strokeOpacity: 0.4
            }
          })
        }
      }
      if (polylines.pending) {
        const directions = polylines.pending.getDirections()
        if (directions) {
          polylines.pending.setDirections(directions)
          polylines.pending.setOptions({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#9E9E9E',
              strokeWeight: 4,
              strokeOpacity: 0.3
            }
          })
        }
      }
    }
  })
}

/**
 * Resets all route styles to default colors
 * @returns {void}
 */
function resetAllRouteStyles () {
  routePolylines.value.forEach((polylines) => {
    if (polylines.completed) {
      const directions = polylines.completed.getDirections()
      if (directions) {
        polylines.completed.setDirections(directions)
        polylines.completed.setOptions({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#F44336',
            strokeWeight: 5,
            strokeOpacity: 0.7
          }
        })
      }
    }
    if (polylines.pending) {
      const directions = polylines.pending.getDirections()
      if (directions) {
        polylines.pending.setDirections(directions)
        polylines.pending.setOptions({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#9E9E9E',
            strokeWeight: 5,
            strokeOpacity: 0.5
          }
        })
      }
    }
  })
}

/**
 * Selects or deselects a delivery run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function selectRun (run) {
  // Si ya está seleccionado, deseleccionar
  if (selectedRun.value?.id === run.id) {
    selectedRun.value = null
    // Restaurar todos los marcadores y rutas a su estado normal
    resetAllMarkerStyles()
    resetAllRouteStyles()
    return
  }

  // Seleccionar nuevo run
  selectedRun.value = run

  // Si estamos en modo carrusel/panel completo, volver a modo dividido para ver el mapa
  if (viewMode.value === 'panel') {
    viewMode.value = 'split'
  }

  // Hacer zoom al recorrido seleccionado
  setTimeout(() => {
    fitRunBounds(run)
    drawRoute(run)
  }, 100)

  // Actualizar estilos de todos los marcadores
  courierMarkers.value.forEach((marker, id) => {
    if (id === run.id) {
      // Marcador seleccionado: carro amarillo/naranja
      marker.setIcon({
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        fillColor: '#FF9800',
        fillOpacity: 1,
        strokeColor: '#FFEB3B',
        strokeWeight: 3,
        scale: 0.8,
        anchor: new google.maps.Point(11.5, 23.5)
      })
      marker.setZIndex(2000)
    } else {
      // Marcadores no seleccionados: carro azul normal
      marker.setIcon({
        path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
        fillColor: '#2196F3',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 0.7,
        anchor: new google.maps.Point(11.5, 23.5)
      })
      marker.setZIndex(1000)
    }
  })

  // Actualizar estilos de todas las rutas
  updateRouteStyles(run.id)
}

/**
 * Resets all courier marker styles to default
 * @returns {void}
 */
function resetAllMarkerStyles () {
  courierMarkers.value.forEach((marker) => {
    marker.setIcon({
      path: 'M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z',
      fillColor: '#2196F3',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 0.7,
      anchor: new google.maps.Point(11.5, 23.5)
    })
    marker.setZIndex(1000)
  })
}

/**
 * Initializes WebSocket connection for real-time updates
 * @returns {void}
 */
function initializeWebSocket () {
  try {
    // Get global Echo instance from app
    const instance = getCurrentInstance()
    echo = instance.appContext.config.globalProperties.$echo

    if (!echo) {
      console.error('❌ Echo instance not found. Make sure pusher.js boot file is loaded.')
      return
    }

    console.log('echo configurado')

    // Listen for location updates on delivery-tracking channel
    echo.channel('delivery-tracking')
      .listen('.DeliveryLocationUpdated', (event) => {
        console.log('📍 Location updated:', event)
        updateCourierLocation(event.delivery_run_id, event.latitude, event.longitude)
      })
      .listen('.DeliveryRunStatusUpdated', (event) => {
        console.log('📦 Delivery run status updated:', event)
        const runId = event.delivery_run?.id
        const newStatus = event.new_status || event.delivery_run?.status

        // Si el status cambió a completed, limpiar marcadores y remover de activos
        if (newStatus === 'completed' && runId) {
          console.log('✅ Run completed via status update, cleaning up')
          clearRunMarkers(runId)
          activeRuns.value = activeRuns.value.filter(run => run.id !== runId)

          if (selectedRun.value?.id === runId) {
            selectedRun.value = null
            resetAllMarkerStyles()
          }
        } else if (runId) {
          // Para otros cambios de status, recargar y actualizar
          loadSingleRun(runId)
          setTimeout(() => updateMapMarkers(), 500)
        }
      })
      .listen('.DeliveryRunStarted', (event) => {
        console.log('🚀 Delivery run started:', event)
        // Reload all active runs to include the new one
        loadActiveRuns()

        $q.notify({
          type: 'positive',
          message: `Nueva ruta iniciada por ${event.delivery_run?.delivery_person?.name || 'repartidor'}`,
          position: 'top',
          icon: 'local_shipping',
          timeout: 3000
        })

        // Actualizar mapa
        setTimeout(() => updateMapMarkers(), 500)
      })
      .listen('.DeliveryRunCompleted', (event) => {
        console.log('✅ Delivery run completed:', event)
        // Remove completed run from active runs
        const completedRunId = event.delivery_run?.id

        // Limpiar marcadores y rutas del run completado ANTES de removerlo
        clearRunMarkers(completedRunId)

        // Remover de la lista de activos
        activeRuns.value = activeRuns.value.filter(run => run.id !== completedRunId)

        // Deselect if this was the selected run
        if (selectedRun.value?.id === completedRunId) {
          selectedRun.value = null
          resetAllMarkerStyles()
        }

        $q.notify({
          type: 'positive',
          message: `Ruta completada por ${event.delivery_run?.delivery_person?.name || 'repartidor'}`,
          position: 'top',
          icon: 'check_circle',
          timeout: 3000
        })

        // NO llamar a updateMapMarkers() aquí porque clearRunMarkers ya limpió todo
        // y no queremos redibujar las rutas que ya están en el mapa
        console.log('🧹 Run removed from map and active runs list')
      })

    console.log('✅ WebSocket initialized - Real-time updates active')
  } catch (error) {
    console.error('❌ Error initializing WebSocket:', error)
  }
}

/**
 * Updates courier location in real-time
 * @param {number} runId - Delivery run ID
 * @param {number} latitude - New latitude
 * @param {number} longitude - New longitude
 * @returns {void}
 */
function updateCourierLocation (runId, latitude, longitude) {
  console.log('📍 Updating courier location:', { runId, latitude, longitude })

  // Update marker position
  const marker = courierMarkers.value.get(runId)
  if (marker) {
    const newPosition = new google.maps.LatLng(latitude, longitude)
    marker.setPosition(newPosition)

    // Smooth animation
    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(() => marker.setAnimation(null), 500)
  }

  // Update run data - add new location to locations array
  const run = activeRuns.value.find(r => r.id === runId)
  if (run) {
    if (!run.locations) {
      run.locations = []
    }
    // Add new location at the beginning (most recent)
    run.locations.unshift({
      latitude,
      longitude,
      recorded_at: new Date().toISOString()
    })
    // Keep only last 50 locations
    if (run.locations.length > 50) {
      run.locations = run.locations.slice(0, 50)
    }

    // Redraw the GPS trail in real-time (like Uber)
    updateGPSTrail(run)

    // Redraw routes to update pending route from current position
    clearRoutePolylines(runId)
    drawRoute(run)

    // If this is the selected run, update the sidebar info
    if (selectedRun.value?.id === runId) {
      selectedRun.value = run
    }
  }
}

/**
 * Updates delivery status in real-time
 * @param {number} runId - Delivery run ID
 * @param {number} itemId - Delivery item ID
 * @param {string} status - New status
 * @returns {void}
 */
function updateDeliveryStatus (runId, itemId, status) {
  const run = activeRuns.value.find(r => r.id === runId)
  if (run) {
    const item = run.items?.find(i => i.id === itemId)
    if (item) {
      item.delivery_status = status

      // Redraw route with updated colors
      clearRouteForRun(runId)
      drawRoute(run)

      // Update delivery markers
      updateDeliveryMarkersForRun(run)
    }
  }
}

/**
 * Clears route polylines for a specific run
 * @param {number} runId - Delivery run ID
 * @returns {void}
 */
function clearRouteForRun (runId) {
  const polylines = routePolylines.value.get(runId)
  if (polylines) {
    if (polylines.completed) polylines.completed.setMap(null)
    if (polylines.pending) polylines.pending.setMap(null)
    if (polylines.gpsTrail) polylines.gpsTrail.setMap(null)
    routePolylines.value.delete(runId)
  }
}

/**
 * Updates delivery markers for a specific run
 * @param {Object} run - Delivery run object
 * @returns {void}
 */
function updateDeliveryMarkersForRun (run) {
  const markers = deliveryMarkers.value.get(run.id)
  if (!markers) return

  markers.forEach(marker => marker.setMap(null))
  deliveryMarkers.value.delete(run.id)

  addDeliveryMarkers(run)
}

/**
 * Refreshes all data
 * @async
 * @returns {Promise<void>}
 */
async function refreshData () {
  await loadActiveRuns()
  $q.notify({
    type: 'positive',
    message: 'Datos actualizados',
    position: 'top',
    timeout: 1000
  })
}

/**
 * Formats timestamp to readable time
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
function formatTime (timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Calculates duration since start
 * @param {string} startTime - ISO timestamp
 * @returns {string}
 */
function calculateDuration (startTime) {
  if (!startTime) return '-'
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}

/**
 * Gets color for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusColor (status) {
  switch (status) {
    case 'delivered':
      return 'positive'
    case 'arrived':
      return 'warning'
    case 'pending':
      return 'grey'
    default:
      return 'grey'
  }
}

/**
 * Gets label for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusLabel (status) {
  switch (status) {
    case 'delivered':
      return 'Entregado'
    case 'arrived':
      return 'En ubicación'
    case 'pending':
      return 'Pendiente'
    default:
      return 'Desconocido'
  }
}

/**
 * Gets icon for delivery status
 * @param {string} status - Delivery status
 * @returns {string}
 */
function getDeliveryStatusIcon (status) {
  switch (status) {
    case 'delivered':
      return 'check_circle'
    case 'arrived':
      return 'location_on'
    case 'pending':
      return 'schedule'
    default:
      return 'help'
  }
}

/**
 * Checks if a run is returning to origin
 * @param {Object} run - Delivery run object
 * @returns {boolean}
 */
function isRunReturningToOrigin (run) {
  if (!run || !run.items || run.items.length === 0) return false
  // All items are delivered
  return run.items.every(item => item.delivery_status === 'delivered')
}

/**
 * Number of runs returning to origin
 * @type {ComputedRef<number>}
 */
const returningToOriginCount = computed(() => {
  return activeRuns.value.filter(run => isRunReturningToOrigin(run)).length
})

/**
 * Gets distance to origin for a run
 * @param {Object} run - Delivery run object
 * @returns {string}
 */
function getDistanceToOrigin (run) {
  if (!run || !run.branch_office) return '-'

  const latestLocation = run.locations && run.locations.length > 0 ? run.locations[0] : null
  if (!latestLocation) return '-'

  const branchLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
  const branchLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

  if (!branchLat || !branchLng) return '-'

  const distance = calculateDistance(
    parseFloat(latestLocation.latitude),
    parseFloat(latestLocation.longitude),
    branchLat,
    branchLng
  )

  return (distance / 1000).toFixed(1)
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distance in meters
 */
function calculateDistance (lat1, lng1, lat2, lng2) {
  const R = 6371e3 // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Loads delivery persons for history filter
 */
async function loadDeliveryPersons () {
  try {
    // Obtener todos los usuarios y filtrar por rol de repartidor
    const { data } = await api.get('delivery-persons')

    // Filtrar usuarios que sean repartidores (puedes ajustar según tu estructura)
    deliveryPersonOptions.value = data
  } catch (error) {
    console.error('Error loading delivery persons:', error)

    // Fallback: obtener de los recorridos activos
    try {
      const runsResponse = await api.get('/invoice-delivery-runs/all-active')
      const runs = runsResponse.data.delivery_runs || []

      // Extraer repartidores únicos de los recorridos
      const uniquePersons = new Map()
      runs.forEach(run => {
        if (run.delivery_person) {
          uniquePersons.set(run.delivery_person.id, run.delivery_person)
        }
      })

      deliveryPersonOptions.value = Array.from(uniquePersons.values())
      console.log('Delivery persons from runs:', deliveryPersonOptions.value.length)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
  }
}

/**
 * Loads history runs with filters
 */
async function loadHistoryRuns () {
  historyLoading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/history', {
      params: {
        start_date: historyFilters.value.startDate,
        end_date: historyFilters.value.endDate,
        delivery_person_id: historyFilters.value.deliveryPerson
      }
    })
    historyRuns.value = response.data.delivery_runs || []
    console.log('Loaded history runs:', historyRuns.value.length)
  } catch (error) {
    console.error('Error loading history runs:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial',
      position: 'top'
    })
  } finally {
    historyLoading.value = false
  }
}

/**
 * Selects a history run and displays it on map
 */
async function selectHistoryRun (run) {
  selectedHistoryRun.value = run
  selectedRun.value = null // Clear live selection
  clearAllMarkers()
  await drawHistoryRunOnMap(run)
}

/**
 * Draws history run on map with planned and actual routes
 */
async function drawHistoryRunOnMap (run) {
  if (!map.value || !run) return

  const bounds = new google.maps.LatLngBounds()

  // 1. Draw origin marker
  if (run.branch_office) {
    const originLat = parseFloat(run.branch_office.address?.latitude || run.branch_office.latitude)
    const originLng = parseFloat(run.branch_office.address?.longitude || run.branch_office.longitude)

    if (originLat && originLng) {
      const originMarker = new google.maps.Marker({
        position: { lat: originLat, lng: originLng },
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF9800',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        },
        title: 'Origen'
      })
      courierMarkers.value.set('origin', originMarker)
      bounds.extend(originMarker.getPosition())
    }
  }

  // 2. Draw delivery markers
  const deliveryPoints = []
  const markers = []
  run.items?.forEach((item, index) => {
    const client = item.invoice?.client
    const lat = parseFloat(client?.address?.latitude || client?.latitude)
    const lng = parseFloat(client?.address?.longitude || client?.longitude)

    if (lat && lng) {
      const position = { lat, lng }
      deliveryPoints.push(position)

      const marker = new google.maps.Marker({
        position,
        map: map.value,
        label: {
          text: String(index + 1),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#F44336',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        },
        title: client?.name || 'Cliente'
      })
      markers.push(marker)
      bounds.extend(marker.getPosition())
    }
  })
  deliveryMarkers.value.set(run.id, markers)

  // 3. Draw planned route (blue)
  if (deliveryPoints.length > 1 && directionsService.value) {
    const waypoints = deliveryPoints.slice(1, -1).map(point => ({
      location: point,
      stopover: true
    }))

    try {
      const result = await directionsService.value.route({
        origin: deliveryPoints[0],
        destination: deliveryPoints[deliveryPoints.length - 1],
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      })

      const plannedRenderer = new google.maps.DirectionsRenderer({
        map: map.value,
        directions: result,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2196F3',
          strokeWeight: 4,
          strokeOpacity: 0.7
        }
      })

      if (!routePolylines.value.has(run.id)) {
        routePolylines.value.set(run.id, {})
      }
      routePolylines.value.get(run.id).planned = plannedRenderer
    } catch (error) {
      console.error('Error drawing planned route:', error)
    }
  }

  // 4. Draw actual GPS route (green)
  if (run.locations && run.locations.length > 1) {
    const gpsPath = run.locations.map(loc => ({
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude)
    })).reverse() // Reverse because locations are ordered desc

    const gpsPolyline = new google.maps.Polyline({
      path: gpsPath,
      geodesic: true,
      strokeColor: '#4CAF50',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: map.value
    })

    if (!routePolylines.value.has(run.id)) {
      routePolylines.value.set(run.id, {})
    }
    routePolylines.value.get(run.id).actual = gpsPolyline

    // Extend bounds with GPS points
    gpsPath.forEach(point => bounds.extend(point))
  }

  // Fit map to show all markers
  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds)
  }
}

/**
 * Formats date to readable string
 */
function formatDate (dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculates duration between two dates
 */
function calculateCompletedDuration (startTime, endTime) {
  if (!startTime || !endTime) return '-'
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end - start
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const minutes = diffMins % 60
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}

/**
 * Descripction
 * @params {Object} run run to clone
 * @return {void} description return
 */
function openClonePreview (run) {
  runToClone.value = run
  // Set default delivery date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  cloneDeliveryDate.value = tomorrow.toISOString().split('T')[0]

  // Deep clone items to allow local editing without affecting the original run
  const clonedItems = JSON.parse(JSON.stringify(run.items || []))

  // Format items: select by default and round amounts to avoid excess decimals
  cloneItems.value = clonedItems.map(item => {
    if (item.invoice && item.invoice.products) {
      item.invoice.products = item.invoice.products.map(p => {
        if (p.pivot && p.pivot.amount) {
          p.pivot.amount = parseFloat(parseFloat(p.pivot.amount).toFixed(2))
        }
        return p
      })
    }
    return {
      ...item,
      selected: true
    }
  })

  showCloneDialog.value = true
}

/**
 * Descripction
 * @type {number} description var
 */
const calculateSelectedCloneTotal = computed(() => {
  return cloneItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + calculateInvoiceTotal(item.invoice), 0)
})

/**
 * Descripction
 * @type {number} description var
 */
const selectedCloneCount = computed(() => {
  return cloneItems.value.filter(item => item.selected).length
})

/**
 * Descripction
 * @params {Object} invoice invoice to calculate
 * @return {number} description return
 */
function calculateInvoiceTotal (invoice) {
  if (!invoice) return 0
  const productsTotal = (invoice.products || []).reduce((sum, p) =>
    sum + (parseFloat(p.pivot?.price || 0) * parseFloat(p.pivot?.amount || 0)), 0)
  const promotionsTotal = (invoice.promotions || []).reduce((sum, p) =>
    sum + (parseFloat(p.pivot?.price || 0) * parseFloat(p.pivot?.quantity || 0)), 0)
  return productsTotal + promotionsTotal
}

/**
 * Descripction
 * @return {Promise} description return
 */
async function confirmCloning () {
  if (selectedCloneCount.value === 0) return

  cloningInProgress.value = true
  try {
    const selectedInvoices = cloneItems.value
      .filter(item => item.selected)
      .map(item => ({
        id: item.invoice.id,
        delivery_date: cloneDeliveryDate.value,
        description: item.invoice.description,
        products: item.invoice.products.map(p => ({
          id: p.id,
          pivot: {
            amount: p.pivot.amount,
            price: p.pivot.price,
            taxe: p.pivot.taxe,
            cost: p.pivot.cost,
            observation: p.pivot.observation
          }
        }))
      }))

    const response = await api.post(`/invoice-delivery-runs/${runToClone.value.id}/clone-invoices`, {
      invoices: selectedInvoices
    })

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Recorrido clonado exitosamente',
      icon: 'auto_awesome',
      position: 'top',
      classes: 'premium-toast shadow-10',
      actions: [{ icon: 'close', color: 'white' }]
    })

    showCloneDialog.value = false
    // Refresh history
    loadHistoryRuns()
  } catch (error) {
    console.error('Error cloning run:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al clonar el recorrido',
      icon: 'error',
      position: 'top'
    })
  } finally {
    cloningInProgress.value = false
  }
}
</script>

<style scoped>
.admin-monitor-page {
  background: #f4f7f9;
}

.full-height-container {
  height: calc(100vh - 57px); /* Exact height minus header */
}

.full-map {
  width: 100%;
  height: calc(100vh - 57px);
  border-radius: 0;
  min-height: 200px;
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hidden-map,
.hidden-panel {
  display: none !important;
}

/* Glassmorphism & Overlays */
.overlay-stats {
  max-width: 100%;
  overflow: hidden;
}

.bg-white-transparent {
  background: rgba(255, 255, 255, 0.85) !important;
}

.blur-bg {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.rounded-borders-12 { border-radius: 12px; }
.rounded-borders-24 { border-radius: 24px; }

.stat-mini-card {
  min-width: 110px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

.border-right-sep {
  border-right: 1px solid rgba(0,0,0,0.1);
}
.border-right-sep:last-child {
  border-right: none;
}

.uppercase-label {
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.5px;
}

.monitor-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.monitor-layout--map {
  flex-direction: row;
}

.monitor-layout--panel {
  flex-direction: row;
}

.map-section {
  height: 100%;
  min-width: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-section {
  height: 100%;
  background: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-panel {
  width: 33.33%;
  min-width: 350px;
  border-left: 1px solid #eee;
}

.split-panel {
  width: 400px;
  border-left: 1px solid #eee;
}

.full-expanded {
  flex: 1 1 100% !important;
  width: 100% !important;
  height: calc(100vh - 57px) !important;
  border-left: none !important;
}

@media (max-width: 1023px) {
  .monitor-layout--split {
    flex-direction: column !important;
  }

  .monitor-layout--split .map-section {
    height: 35vh !important;
    width: 100% !important;
    flex: none !important;
  }

  .monitor-layout--split .panel-section {
    height: 65vh !important;
    width: 100% !important;
    border-left: none !important;
    border-top: 1px solid #eee;
    flex: 1 !important;
  }

  .side-panel, .split-panel {
    width: 100%;
    min-width: 0;
    border-left: none;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

/* Empty States */
.empty-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: calc(100vh - 107px);
}

/* Timeline Components */
.delivery-vertical-timeline {
  padding-left: 20px;
  position: relative;
}

.delivery-vertical-timeline::before {
  content: '';
  position: absolute;
  left: 29px;
  top: 10px;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-node {
  position: relative;
  padding-left: 30px;
}

.node-marker {
  position: absolute;
  left: -11px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  z-index: 1;
}

.marker-pending { background: #64748b; }
.marker-arrived { background: #f59e0b; }
.marker-delivered { background: #10b981; }

.node-content {
  transition: all 0.2s;
}

/* Active Runs List */
.active-run-item {
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}
.active-run-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

/* Sticky Headers */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* History Modern Improvements */
.history-compact-header {
  border-bottom: 1px solid #f1f5f9;
  min-height: 56px;
}

.history-stats-ribbon {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-bottom: 1px solid #f1f5f9;
}

.history-item {
  background: white;
  border: 1px solid #f1f5f9;
  margin-bottom: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-item:active {
  transform: scale(0.98);
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03);
}

/* Modal Styling */
.filter-dialog-card {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.no-border-radius-top {
  border-top-left-radius: 24px !important;
  border-top-right-radius: 24px !important;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.half-height-scroll {
  overflow-y: auto;
}

.half-height-scroll::-webkit-scrollbar {
  width: 6px;
}

.half-height-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.half-height-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.body--dark .half-height-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

/* Utilities */
.refresh-fab {
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.4);
}

.border { border: 1px solid #e2e8f0; }
.border-all { border: 1px solid rgba(0,0,0,0.1); }

/* Dark Mode Overrides */
.body--dark .admin-monitor-page,
.body--dark .side-panel,
.body--dark .panel-section,
.body--dark .side-panel-mobile,
.body--dark .bottom-panel,
.body--dark .bg-white,
.body--dark .history-compact-header,
.body--dark .run-detail-header,
.body--dark .panel-header,
.body--dark .empty-selection-state,
.body--dark .selected-run-container,
.body--dark .full-expanded {
  background: #1e1e1e !important;
  color: #e0e0e0;
}

.body--dark .panel-header {
  border-bottom: 1px solid #333;
}

.body--dark .history-stats-ribbon {
  background: linear-gradient(to bottom, #2d2d2d, #1e1e1e) !important;
  border-bottom-color: #333;
}

.body--dark .history-item {
  background: #2d2d2d !important;
  border-color: #404040 !important;
  color: #e0e0e0;
}

.body--dark .history-item .text-grey-9,
.body--dark .history-item .text-indigo-9,
.body--dark .text-grey-9,
.body--dark .text-indigo-9,
.body--dark .text-subtitle2 {
  color: #fff !important;
}

.body--dark .bg-white-transparent {
  background: rgba(30, 30, 30, 0.85) !important;
}

.body--dark .node-content,
.body--dark .active-run-item,
.body--dark .q-card--bordered {
  background: #2d2d2d !important;
  border-color: #404040 !important;
}

.body--dark .text-grey-6,
.body--dark .text-grey-7,
.body--dark .text-grey-8 {
  color: rgba(255, 255, 255, 0.6) !important;
}

.body--dark .bg-grey-1,
.body--dark .bg-grey-2 {
  background: #333 !important;
}

.body--dark .active-history-item {
  background: rgba(79, 70, 229, 0.2) !important;
}

.body--dark .border-all,
.body--dark .border-left-sep,
.body--dark .border-right-sep,
.body--dark .q-card {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.body--dark .q-tab-panels {
  background: transparent;
}

.body--dark .q-tabs {
  color: rgba(255, 255, 255, 0.7);
}

.body--dark .q-tab--active {
  color: var(--q-primary) !important;
}

.body--dark .q-separator {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .text-overline {
  color: rgba(255, 255, 255, 0.5) !important;
}

.body--dark .q-item__label--caption {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Clone Dialog Styles */
.minimal-invoice-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
}

.minimal-invoice-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.minimal-invoice-card.is-selected {
  border-color: var(--q-primary);
  background: #f8fafc;
}

.border-bottom-subtle {
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.last-no-border:last-child {
  border-bottom: none;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.rounded-borders-20 {
  border-radius: 20px;
}

.rounded-borders-12 {
  border-radius: 12px;
}

.body--dark .minimal-invoice-card {
  background: #1e293b;
  border-color: #334155;
}

.body--dark .minimal-invoice-card:hover {
  border-color: #475569;
}

.body--dark .minimal-invoice-card.is-selected {
  border-color: var(--q-primary);
  background: #1e293b;
}

.body--dark .bg-grey-1 {
  background: #0f172a !important;
}

.body--dark .text-grey-9 { color: #f1f5f9 !important; }
.body--dark .text-grey-6 { color: #94a3b8 !important; }
.body--dark .text-grey-7 { color: #cbd5e1 !important; }
</style>
