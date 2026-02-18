<template>
  <q-page class="google-maps-route-page overflow-hidden">
    <!-- Google Map Background -->
    <div ref="mapContainer" class="full-screen-map"></div>

    <!-- Floating Top Header: Search & Filter -->
    <div class="absolute-top q-pa-md search-container-group" style="z-index: 1000;">
      <!-- Search Bar -->
      <div class="row justify-center">
        <q-card class="search-bar-card col-12 glassmorphism blur-bg shadow-10 rounded-borders-28 row no-wrap items-center q-px-md">
          <q-btn flat round dense icon="menu" :color="$q.dark.isActive ? 'white' : 'grey-8'" class="q-mr-sm" @click="eventBus.emit('toggle-left-drawer')" />
          <q-input
            v-model="searchQuery"
            borderless
            dense
            placeholder="Buscar y agregar clientes..."
            class="col text-subtitle1"
            :input-class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
            @focus="onSearchInput('')"
            @update:model-value="onSearchInput"
          >
            <template v-slot:append>
              <q-icon name="search" :color="$q.dark.isActive ? 'white' : 'grey-8'" />
            </template>
          </q-input>

          <!-- Search Results Dropdown -->
          <q-menu
            v-model="showResults"
            no-parent-event
            no-focus
            no-refocus
            fit
            anchor="bottom left"
            self="top left"
            class="glassmorphism blur-bg rounded-borders-16 q-mt-sm"
            style="width: 400px; max-width: 60vw;"
          >
            <q-list padding>
              <q-item-label header class="text-weight-bold">Resultados</q-item-label>
              <q-item v-if="clients.length === 0" class="text-grey-7">
                <q-item-section>No se encontraron clientes</q-item-section>
              </q-item>
              <q-item
                v-for="client in clients"
                :key="client.id"
                clickable
                v-ripple
                @click="addClientToRoute(client)"
              >
                <q-item-section avatar>
                  <q-icon name="place" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ client.name }}</q-item-label>
                  <q-item-label caption class="ellipsis">{{ getClientAddress(client) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense icon="add_circle" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-card>
      </div>

      <!-- Route Badges (Below Search, Centered) -->
      <div class="row no-wrap justify-center q-gutter-x-sm q-mt-md scroll hide-scrollbar filter-badges-scroll">
        <q-chip
          v-for="route in activeRoutes"
          :key="route.id"
          clickable
          :filled="selectedRoute?.id !== route.id"
          :color="selectedRoute?.id === route.id ? 'primary' : 'grey-8'"
          text-color="white"
          class="route-badge-chip"
          @click="selectRoute(route)"
        >
          {{ route.name || route.route_number || `Ruta #${route.id}` }}
        </q-chip>
      </div>
    </div>

    <!-- Floating Action Button (Aligned with Sheet Right Edge) -->
    <div class="fab-float-wrapper">
      <q-btn
        fab
        color="primary"
        icon="add"
        @click="createNewRoute"
        class="shadow-5 fab-fixed-btn"
      />
    </div>

    <!-- Cloning Preview Dialog -->
    <q-dialog v-model="showCloneDialog" persistent transition-show="scale" transition-hide="scale" :maximized="$q.screen.lt.sm">
      <q-card :style="$q.screen.lt.sm ? '' : 'width: 1000px; max-width: 95vw;'" :class="$q.screen.lt.sm ? 'column full-height' : ''" class="rounded-borders-20 overflow-hidden shadow-24">
        <!-- Compact Header -->
        <q-card-section class="border-bottom-subtle" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-grey-9'">
          <div class="row items-center justify-between no-wrap">
            <div class="column">
              <div class="text-h6 text-weight-bolder">Clonar Recorrido</div>
              <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">Selecciona las facturas de la ruta #{{ runToClone?.id }}</div>
            </div>
            <q-btn flat round dense icon="close" color="grey-7" v-close-popup :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'" />
          </div>
        </q-card-section>

        <!-- Compact Search & Selection Area -->
        <q-card-section class="q-pa-none q-px-md q-py-sm" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
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
              <span class="text-caption text-weight-bold" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">FECHA:</span>
              <q-input v-model="cloneDeliveryDate" dense outlined rounded :bg-color="$q.dark.isActive ? 'grey-9' : 'white'" mask="####-##-##" class="q-ml-sm" style="width: 150px;" :dark="$q.dark.isActive">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="cloneDeliveryDate" mask="YYYY-MM-DD" :dark="$q.dark.isActive">
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
        <q-card-section :class="$q.screen.lt.sm ? 'col scroll' : 'scroll q-pa-lg half-height-scroll'" style="max-height: 60vh;">
          <div class="row q-col-gutter-md">
            <div v-for="(item, index) in cloneItems" :key="index" class="col-12 col-sm-6">
              <div
                class="minimal-invoice-card"
                :class="{ 'is-selected': item.selected }"
                @click="item.selected = !item.selected"
              >
                <!-- Card Header -->
                <div class="row items-start justify-between q-mb-sm">
                  <div class="column col text-left">
                    <span class="text-caption text-weight-bold text-primary text-uppercase letter-spacing-1" style="font-size: 0.65rem;">Factura #{{ item.invoice?.id }}</span>
                    <span class="text-subtitle2 text-weight-bold ellipsis" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">{{ item.invoice?.client?.name }}</span>
                  </div>
                  <q-checkbox v-model="item.selected" color="primary" dense @click.stop :dark="$q.dark.isActive" />
                </div>

                <!-- Products Mini-list -->
                <div class="rounded-borders-12 q-pa-sm q-mb-sm border-subtle" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
                  <div v-for="product in item.invoice?.products || []" :key="product.id" class="row items-center q-py-xs q-px-sm border-bottom-subtle last-no-border">
                    <div class="col text-caption text-left" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">{{ product.name }}</div>
                    <div class="col-auto row items-center no-wrap rounded-borders-20 q-px-xs border-subtle" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
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
                        :input-class="$q.dark.isActive ? 'text-center text-weight-bolder text-white q-pa-none' : 'text-center text-weight-bolder text-grey-9 q-pa-none'"
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
                    </div>
                  </div>
                </div>

                <q-input
                  v-model="item.invoice.description"
                  dense
                  outlined
                  label="Observación"
                  :bg-color="$q.dark.isActive ? 'grey-9' : 'white'"
                  class="q-mb-sm rounded-borders-12 overflow-hidden"
                  style="font-size: 0.8rem;"
                  rows="1"
                  type="textarea"
                  autogrow
                  @click.stop
                  :dark="$q.dark.isActive"
                />

                <div class="row items-center justify-between mt-auto">
                  <span class="text-caption text-grey-5">Total</span>
                  <span class="text-subtitle2 text-weight-bolder" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                    {{ formatCurrency(calculateInvoiceTotal(item.invoice)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Action Footer -->
        <q-card-section class="q-px-lg q-py-md border-top-subtle" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
          <div class="row items-center justify-between q-pa-md rounded-borders-20 border-subtle" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'">
            <div class="column text-left">
              <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">Total a clonar</span>
              <span class="text-h6 text-weight-bolder text-primary">
                {{ formatCurrency(calculateSelectedCloneTotal) }}
              </span>
            </div>
            <q-btn
              unelevated
              rounded
              color="primary"
              label="Clonar Ahora"
              class="text-weight-bold text-uppercase letter-spacing-1 shadow-2 q-px-xl"
              :loading="cloningInProgress"
              :disable="selectedCloneCount === 0"
              @click="confirmCloning"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Bottom Sheet / Sliding Menu -->
    <div
      class="google-bottom-sheet glassmorphism blur-bg shadow-up-10"
      :class="{ 'sheet--expanded': sheetExpanded, 'sheet--minimized': !sheetExpanded }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="sheet-handle-container q-py-md cursor-pointer" @click="toggleSheet">
        <div class="sheet-handle"></div>
      </div>

      <!-- PREMIUM TABS Navigation -->
      <div class="sheet-tabs row no-wrap q-px-md q-mb-sm q-gutter-x-sm">
        <q-btn
          flat
          no-caps
          :class="activeTab === 'details' ? 'active-premium-tab' : 'inactive-premium-tab'"
          label="Detalles"
          @click="activeTab = 'details'; sheetExpanded = true"
        />
        <q-btn
          flat
          no-caps
          :class="activeTab === 'monitor' ? 'active-premium-tab' : 'inactive-premium-tab'"
          label="Monitor"
          class="col border-radius-14"
          @click="activeTab = 'monitor'; loadActiveRuns(); sheetExpanded = true"
        />
        <q-btn
          flat
          no-caps
          :class="activeTab === 'clients' ? 'active-premium-tab' : 'inactive-premium-tab'"
          label="Clientes"
          class="col border-radius-14"
          @click="activeTab = 'clients'; loadAllClients(); sheetExpanded = true"
        />

        <q-btn
          flat
          no-caps
          :class="activeTab === 'routes' ? 'active-premium-tab' : 'inactive-premium-tab'"
          label="Rutas"
          class="col border-radius-14"
          @click="activeTab = 'routes'; loadActiveRuns(); sheetExpanded = true"
        />
      </div>

      <div class="sheet-content q-px-md q-pb-xl hide-scrollbar">
        <!-- Tab: ROUTE DETAILS -->

        <div v-if="activeTab === 'details'">
          <div class="row items-center q-px-md justify-between q-mb-lg q-pa-sm rounded-borders-16 bg-white-translucent">
            <div class="column full-width">
              <div class="flex items-center justify-between full-width">
                <div class="text-h6 text-weight-bolder line-height-1 q-mb-xs" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                  {{ selectedRoute?.name || selectedRoute?.route_number || 'Sin ruta activa' }}
                </div>
                <q-btn unelevated color="positive" label="Guardar" @click="saveRouteChanges" :loading="saving">
                  <q-tooltip>Guardar cambios</q-tooltip>
                </q-btn>
              </div>
              <div class="row items-center text-caption q-mt-sm" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
                <q-icon name="place" size="14px" class="q-mr-xs" />
                <span>{{ (selectedRouteStops && selectedRouteStops.length) || 0 }} paradas</span>
                <q-separator vertical inset class="q-mx-sm" :dark="$q.dark.isActive" />
                <q-icon name="straighten" size="14px" class="q-mr-xs" />
                <span>{{ totalDistanceLabel }}</span>
                <q-separator vertical inset class="q-mx-sm" :dark="$q.dark.isActive" />
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                <span>{{ totalDurationLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Configuration Panel -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold q-mb-xs q-ml-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Nombre de la ruta</div>
              <q-input
                v-model="routeForm.name"
                placeholder="Nombre de la ruta"
                borderless
                dense
                class="minimal-input q-px-md rounded-borders-12"
                :input-class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
              />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold q-mb-xs q-ml-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Repartidor</div>
              <q-select
                v-model="routeForm.courier"
                :options="couriers"
                option-label="name"
                borderless
                dense
                clearable
                class="minimal-input q-px-md rounded-borders-12"
                :dark="$q.dark.isActive"
              />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold q-mb-xs q-ml-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
                Afiliado
              </div>
              <q-select
                v-model="routeForm.partner"
                :options="partners"
                option-label="name"
                borderless
                dense
                clearable
                class="minimal-input q-px-md rounded-borders-12"
                :dark="$q.dark.isActive"
                @popup-show="loadPartners"
              />
            </div>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bolder" :class="$q.dark.isActive ? 'text-grey-2' : 'text-grey-8'">Clientes</div>
            <q-space />
            <div class="text-caption uppercase tracking-widest" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">{{ selectedRouteStops.length }} paradas</div>
          </div>

          <!-- Stops List -->
          <div class="stops-list" v-if="selectedRouteStops.length">
            <draggable
              v-model="selectedRouteStops"
              item-key="id"
              handle=".drag-handle"
              @end="onStopsDragged"
              ghost-class="sortable-ghost"
              drag-class="sortable-drag"
              chosen-class="sortable-chosen"
              :animation="300"
            >
              <template #item="{ element: stop, index }">
                <q-card flat class="stop-card-premium q-mb-sm rounded-borders-16 overflow-hidden">
                  <div class="row no-wrap items-center q-pa-md">
                    <!-- Progress line / index -->
                    <div class="column items-center q-mr-md relative-position">
                      <div v-if="index > 0" class="vertical-line top-line"></div>
                      <div class="stop-index-badge shadow-2">
                        {{ index + 1 }}
                      </div>
                      <div v-if="index < selectedRouteStops.length - 1" class="vertical-line bottom-line"></div>
                    </div>

                    <div class="col column">
                      <div class="row items-center q-gutter-x-sm">
                        <span class="text-weight-bolder text-subtitle2" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">{{ stop.client?.name }}</span>
                      </div>
                      <span class="text-caption ellipsis-2-lines" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">{{ getClientAddress(stop.client) }}</span>
                    </div>

                    <!-- Actions Panel -->
                    <div class="row items-center q-gutter-x-xs">
                      <!-- Reorder Buttons -->
                      <div class="column q-gutter-y-xs q-mr-sm">
                        <q-btn
                          flat
                          round
                          dense
                          icon="expand_less"
                          size="sm"
                          :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
                          :disable="index === 0"
                          @click.stop="moveStopUp(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="expand_more"
                          size="sm"
                          :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
                          :disable="index === selectedRouteStops.length - 1"
                          @click.stop="moveStopDown(index)"
                        />
                      </div>

                      <q-btn
                        round
                        dense
                        icon="edit_location"
                        color="primary"
                        size="md"
                        @click.stop="editStopAddress(stop)"
                      />
                      <q-btn
                        round
                        dense
                        icon="delete"
                        color="negative"
                        size="md"
                        @click.stop="removeStop(stop)"
                      />
                      <q-icon name="drag_indicator" class="drag-handle cursor-move q-ml-sm" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" size="24px" />
                    </div>
                  </div>
                </q-card>
              </template>
            </draggable>
          </div>
          <div v-else class="column items-center justify-center q-pa-xl bg-white-translucent rounded-borders-32 q-mt-md" :class="$q.dark.isActive ? 'text-grey-7' : 'text-grey-5'">
            <q-icon name="route" size="84px" class="q-mb-md opacity-20" />
            <div class="text-h6 text-weight-bold" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-9'">Configura tu ruta</div>
            <div class="text-caption text-center">Busca clientes arriba para agregarlos <br> al itinerario de hoy</div>
            <q-btn unelevated color="primary" label="Ver todos los clientes" class="q-mt-lg border-radius-14 q-px-xl" @click="activeTab = 'clients'; loadAllClients()" />
          </div>
        </div>

        <!-- Tab: CLIENTS -->
        <div v-else-if="activeTab === 'clients'">
          <div class="row items-center q-mb-md">
            <q-input
              v-model="allClientsSearch"
              placeholder="Filtra clientes por nombre o documento..."
              borderless
              dense
              class="col minimal-input q-px-md rounded-borders-12"
              :input-class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
            >
              <template v-slot:prepend>
                <q-icon name="search" :color="$q.dark.isActive ? 'grey-4' : 'grey-5'" />
              </template>
            </q-input>
          </div>
          <q-list>
            <q-item
              v-for="client in filteredAllClients"
              :key="client.id"
              class="stop-card-premium rounded-borders-28 q-mb-sm"
              :class="{ 'opacity-50': isClientInSelectedRoute(client) }"
            >
              <q-item-section avatar>
                <q-avatar :color="$q.dark.isActive ? 'grey-9' : 'primary-light'" :text-color="$q.dark.isActive ? 'white' : 'primary'" icon="person" class="shadow-1" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bolder text-subtitle1" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">{{ client.name }}</q-item-label>
                <q-item-label caption class="ellipsis-2-lines" :class="$q.dark.isActive ? 'text-grey-5' : ''">
                  {{ getClientAddress(client) }}
                </q-item-label>
                <q-item-label v-if="isClientInSelectedRoute(client)" caption class="text-orange text-weight-bold">
                  <q-icon name="warning" size="xs" /> Ya está en la ruta
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  unelevated
                  round
                  :color="isClientInSelectedRoute(client) ? 'grey' : 'primary'"
                  :icon="isClientInSelectedRoute(client) ? 'check' : 'add'"
                  :disable="isClientInSelectedRoute(client)"
                  @click="addClientToRoute(client)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Tab: MONITOR (Live Tracking) -->
        <div v-else-if="activeTab === 'monitor'" class="column full-height">
            <!-- List Mode: Active Runs -->
            <div v-if="!monitorSelectedRun" class="column full-height">
              <div class="row items-center justify-between q-mb-md q-px-sm">
                <div class="text-subtitle1 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                  Monitor de Entregas
                </div>
                <q-btn-group unelevated class="rounded-borders-12 border-light">
                  <q-btn :color="monitorMode === 'live' ? 'primary' : ($q.dark.isActive ? 'grey-9' : 'white')" :text-color="monitorMode === 'live' ? 'white' : ($q.dark.isActive ? 'grey-3' : 'grey-8')" label="En Curso" no-caps dense class="q-px-md" @click="monitorMode = 'live'; loadActiveRuns()" />
                  <q-btn :color="monitorMode === 'history' ? 'primary' : ($q.dark.isActive ? 'grey-9' : 'white')" :text-color="monitorMode === 'history' ? 'white' : ($q.dark.isActive ? 'grey-3' : 'grey-8')" label="Historial" no-caps dense class="q-px-md" @click="monitorMode = 'history'; loadHistoryRuns()" />
                </q-btn-group>
            </div>

            <!-- Sub-tab: LIVE -->
            <div v-if="monitorMode === 'live'" class="col column">
                <!-- Refresh Button (Floating or inline?) -> Inline above -->

                <div v-if="liveActiveRuns.length === 0" class="col column items-center justify-center flex-center q-pa-xl text-grey-5">
                    <q-icon name="podcasts" size="64px" class="q-mb-md opacity-20" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" />
                    <div class="text-subtitle1 text-weight-bold" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Sin actividad reciente</div>
                    <div class="text-caption text-center" :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">No hay rutas activas en este momento</div>
                    <q-btn flat color="primary" label="Actualizar" no-caps @click="loadActiveRuns" class="q-mt-sm" />
                </div>

                <q-list v-else class="col scroll q-gutter-y-sm">
                    <q-item
                      v-for="run in liveActiveRuns"
                      :key="run.id"
                      clickable
                      v-ripple
                      class="rounded-borders-16 stop-card-premium q-py-md"
                      @click="openMonitorDialog(run)"
                    >
                      <q-item-section avatar>
                          <q-avatar size="48px" :color="isRunReturningToOrigin(run) ? 'info' : 'primary'" text-color="white" class="shadow-1">
                              <q-icon :name="isRunReturningToOrigin(run) ? 'home' : 'local_shipping'" />
                              <q-badge
                                floating
                                :color="isRunReturningToOrigin(run) ? 'blue-9' : 'green-6'"
                                rounded
                                class="shadow-1"
                                style="top: -2px; right: -2px;"
                              >
                                <q-icon name="rss_feed" size="10px" />
                              </q-badge>
                          </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-subtitle1" :class="$q.dark.isActive ? 'text-white' : ''">{{ run.delivery_person?.name || 'Repartidor' }}</q-item-label>
                        <q-item-label caption class="row items-center" :class="$q.dark.isActive ? 'text-grey-5' : ''">
                            <q-icon name="map" size="12px" class="q-mr-xs" />
                            Ruta #{{ run.id }}
                            <span class="q-mx-xs">•</span>
                              {{ run.items?.filter(i => i.delivery_status === 'delivered').length }}/{{ run.items?.length }} entregas
                        </q-item-label>
                        <q-linear-progress
                            :value="(run.items?.filter(i => i.delivery_status === 'delivered').length || 0) / (run.items?.length || 1)"
                            size="6px"
                            :color="isRunReturningToOrigin(run) ? 'info' : 'positive'"
                            class="q-mt-sm rounded-borders"
                        />
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" :color="$q.dark.isActive ? 'grey-7' : 'grey-5'" />
                      </q-item-section>
                    </q-item>
                </q-list>
            </div>

              <!-- Sub-tab: HISTORY -->
            <div v-else-if="monitorMode === 'history'" class="col column">
                <!-- Stats Ribbon -->
                <div v-if="historyRuns.length > 0" class="row justify-around full-width q-mb-sm q-py-sm rounded-borders-12 border-light shadow-1" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'">
                  <div class="column items-center">
                    <span class="text-caption text-grey-7 text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Rutas</span>
                    <span class="text-subtitle2 text-weight-bolder" :class="$q.dark.isActive ? 'text-blue-2' : 'text-indigo-9'">{{ historyRuns.length }}</span>
                  </div>
                  <div class="column items-center border-left-sep q-pl-md" :style="`border-left: 1px solid ${$q.dark.isActive ? '#444' : '#eee'};`">
                    <span class="text-caption text-grey-7 text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Entregas</span>
                    <span class="text-subtitle2 text-weight-bolder" :class="$q.dark.isActive ? 'text-blue-2' : 'text-indigo-9'">{{ historyTotalDeliveries }}</span>
                  </div>
                  <div class="column items-center border-left-sep q-pl-md" :style="`border-left: 1px solid ${$q.dark.isActive ? '#444' : '#eee'};`">
                    <span class="text-caption text-grey-7 text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Pagos</span>
                    <span class="text-subtitle2 text-weight-bolder text-positive">{{ formatCurrency(historyTotalPayments) }}</span>
                  </div>
                </div>

                <q-list class="scroll col q-pa-none hide-scrollbar" style="padding-bottom: 80px;">
                    <q-item
                      v-for="run in historyRuns"
                      :key="run.id"
                      class="stop-card-premium rounded-borders-28 q-mb-sm"
                      clickable
                      v-ripple
                      @click="openClonePreview(run)"
                    >
                      <q-item-section avatar>
                        <q-avatar :color="$q.dark.isActive ? 'indigo-10' : 'indigo-1'" :text-color="$q.dark.isActive ? 'white' : 'indigo-7'" icon="history" size="42px" />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label class="text-weight-bolder text-subtitle1" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                          #{{ run.id }} • {{ run.courier?.name || run.delivery_person?.name || 'Sin repartidor' }}
                        </q-item-label>
                        <q-item-label caption class="row items-center q-gutter-x-sm" :class="$q.dark.isActive ? 'text-grey-4' : ''">
                          <q-icon name="today" size="14px" />
                          <span>{{ formatDate(run.started_at || run.created_at) }}</span>
                        </q-item-label>
                        <q-item-label caption class="row items-center q-gutter-x-xs text-positive q-mt-xs">
                          <q-icon name="payments" size="14px" />
                          <span class="text-weight-bold">{{ formatCurrency(calculateRunPayments(run)) }}</span>
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <div class="column items-end">
                          <q-badge color="primary" :label="`${run.items?.length || run.stops?.length || 0} paradas`" rounded class="q-px-sm" />
                          <q-btn flat round color="primary" icon="content_copy" size="sm" class="q-mt-xs" @click.stop="openClonePreview(run)">
                            <q-tooltip>Clonar</q-tooltip>
                          </q-btn>
                        </div>
                      </q-item-section>
                    </q-item>

                    <!-- Empty State -->
                    <div v-if="historyRuns.length === 0 && !historyLoading" class="text-center q-pa-xl">
                      <q-icon name="history" size="64px" :color="$q.dark.isActive ? 'grey-8' : 'grey-3'" />
                      <div class="q-mt-md" :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-6'">No se encontraron rutas anteriores</div>
                    </div>

                      <div v-if="historyLoading" class="row justify-center q-my-md">
                        <q-spinner-dots size="40px" color="primary" />
                      </div>
                  </q-list>
            </div>
            </div>

            <!-- Detail Mode: Selected Run -->
            <div v-else class="column full-height">
              <div class="row items-center q-mb-md">
                <q-btn flat round dense icon="arrow_back" :color="$q.dark.isActive ? 'white' : 'grey-8'" @click="monitorSelectedRun = null; updateMapRoute()" class="q-mr-sm" />
                <div class="column">
                  <div class="text-subtitle1 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">{{ monitorSelectedRun.delivery_person?.name }}</div>
                  <div class="text-caption text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
                    Monitoreo en Vivo
                  </div>
                </div>
              </div>

                 <!-- Stats Ribbon -->
                <div class="row justify-between shadow-1 rounded-borders-16 q-pa-md q-mb-md" :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'">
                     <div class="column items-center">
                        <span class="text-caption uppercase-label" style="font-size: 0.7rem;" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Progreso</span>
                        <span class="text-subtitle1 text-weight-bolder" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                            {{ monitorSelectedRunDeliveredCount }}/{{ monitorSelectedRunTotalCount }}
                        </span>
                    </div>
                    <div class="column items-center border-left-sep q-pl-md" :style="`border-left: 1px solid ${$q.dark.isActive ? '#444' : '#eee'};`">
                        <span class="text-caption uppercase-label" style="font-size: 0.7rem;" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Estimado</span>
                        <span class="text-subtitle1 text-weight-bolder" :class="isRunReturningToOrigin(monitorSelectedRun) ? 'text-info' : 'text-primary'">
                        {{ isRunReturningToOrigin(monitorSelectedRun) ? 'En Retorno' : monitorEstimatedTime }}
                        </span>
                    </div>
                    <div class="column items-center border-left-sep q-pl-md" :style="`border-left: 1px solid ${$q.dark.isActive ? '#444' : '#eee'};`">
                        <span class="text-caption uppercase-label" style="font-size: 0.7rem;" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Recaudado</span>
                        <span class="text-subtitle1 text-weight-bolder text-positive">{{ formatCurrency(monitorRunPaymentsTotal) }}</span>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="text-overline q-mb-sm q-px-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">Cronología de Ruta</div>
                <q-scroll-area class="col q-pr-sm">
                    <div class="column q-gutter-y-sm q-pb-md">
                      <div
                        v-for="(item, index) in monitorSelectedRun.items"
                        :key="item.id"
                        class="row no-wrap items-start relative-position"
                      >
                         <div class="column items-center q-mr-md" style="width: 24px;">
                            <div class="text-caption text-weight-bold" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">{{ formatTimeShort(item.delivered_at || item.estimated_arrival) }}</div>
                            <!-- Connector Line -->
                             <div
                                v-if="index < monitorSelectedRun.items.length - 1"
                                class="q-my-xs"
                                :style="`width: 2px; height: 100%; background: ${$q.dark.isActive ? '#444' : '#eee'}; min-height: 40px;`"
                                :class="{'bg-positive': item.delivery_status === 'delivered', 'bg-warning': item.delivery_status === 'arrived'}"
                             ></div>
                         </div>

                         <q-card
                            flat
                            bordered
                            class="col rounded-borders-12 shadow-sm transition-generic"
                            :class="item.delivery_status === 'delivered' ? ($q.dark.isActive ? 'bg-green-10 border-green-9' : 'bg-green-1 border-green-2') : ($q.dark.isActive ? 'bg-grey-9 border-grey-8' : 'bg-white')"
                         >
                            <q-card-section class="q-pa-sm row items-center no-wrap">
                                <div class="col">
                                    <div class="row items-center justify-between">
                                        <div class="text-subtitle2 text-weight-bold ellipsis" :class="$q.dark.isActive ? 'text-white' : ''">{{ item.invoice?.client?.name }}</div>
                                        <q-badge :color="getDeliveryStatusColor(item.delivery_status)" rounded class="q-px-sm shadow-1">
                                            {{ getDeliveryStatusLabel(item.delivery_status) }}
                                        </q-badge>
                                    </div>
                                    <div class="text-caption ellipsis q-mt-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
                                        <q-icon name="place" size="11px" class="q-mr-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-5'" />
                                        {{ item.invoice?.client?.address?.street || 'Sin dirección' }}
                                    </div>
                                    <div v-if="getItemPayment(item) > 0" class="row items-center q-mt-xs text-positive text-weight-bold text-caption q-pa-xs rounded-borders" style="width: fit-content;" :class="$q.dark.isActive ? 'bg-green-10' : 'bg-green-1'">
                                        <q-icon name="payments" size="12px" class="q-mr-xs" />
                                        {{ formatCurrency(getItemPayment(item)) }}
                                    </div>
                                </div>
                            </q-card-section>
                         </q-card>
                      </div>
                    </div>
                </q-scroll-area>
            </div>
        </div>

        <!-- Tab: HISTORIAL (Entregas) -->
        <!-- Tab: ROUTES LIST -->
        <div v-else-if="activeTab === 'routes'">
          <div class="row items-center justify-between q-mb-lg">
            <div class="column q-px-sm">
              <span class="text-h6 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">Gestión de Rutas</span>
              <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Rutas activas y configuradas</span>
            </div>
            <q-btn flat round color="primary" icon="refresh" @click="loadActiveRuns" />
          </div>
          <q-list class="q-gutter-y-sm">
            <q-item
              v-for="route in activeRoutes"
              :key="route.id"
              clickable
              v-ripple
              @click="selectRoute(route); activeTab = 'details'"
              :class="selectedRoute?.id === route.id ? 'active-route-item' : 'stop-card-premium'"
              class="rounded-borders-28"
            >
              <q-item-section avatar>
                <q-icon
                  name="route"
                  size="32px"
                  :color="selectedRoute?.id === route.id ? 'white' : 'primary'"
                  class="q-pa-sm rounded-borders-12 shadow-1"
                  :class="selectedRoute?.id === route.id ? 'bg-primary' : ($q.dark.isActive ? 'bg-grey-9' : 'bg-primary-light')"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bolder text-subtitle1" :class="selectedRoute?.id === route.id ? 'text-white' : ($q.dark.isActive ? 'text-white' : 'text-grey-9')">
                  {{ route.name || route.route_number || `Ruta #${route.id}` }}
                </q-item-label>
                <q-item-label caption :class="selectedRoute?.id === route.id ? 'text-blue-1' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')">
                  {{ route.stops_count || 0 }} paradas • {{ route.status_label || 'Borrador' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="delete"
                  :color="selectedRoute?.id === route.id ? 'white' : 'negative'"
                  size="md"
                  @click.stop="deleteFullRoute(route)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>

    <!-- Modal: Missing Address (Compact Premium) -->
    <q-dialog v-model="showAddressModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 400px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.4);" class="glassmorphism blur-bg shadow-24 overflow-hidden">
        <q-card-section class="row items-center q-mb-none">
          <q-avatar
            size="42px"
            color="orange-1"
            text-color="orange-9"
            icon="location_off"
            class="q-mr-md"
          />
          <div class="column">
            <div class="text-h6 text-weight-bolder line-height-1" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
              Ubicación Incompleta
            </div>
            <div class="text-caption ellipsis" style="max-width: 280px;" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
              {{ clientWithoutAddress?.name }}
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-mt-none">
          <AddressComponent
            ref="addressRef"
            label="Buscar dirección exacta..."
            @address-selected="onAddressFixed"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
            no-caps
            class="col border-radius-10"
          />
          <q-btn
            unelevated
            label="Guardar y Agregar"
            color="primary"
            @click="saveFixedAddress"
            no-caps
            class="col border-radius-10"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal: Create New Route (Compact Premium) -->
    <q-dialog v-model="showCreateRouteModal" transition-show="scale" transition-hide="scale">
      <q-card style="width: 450px; border-radius: 24px;" class="glassmorphism blur-bg shadow-24" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'" :style="`border: 1px solid ${$q.dark.isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'};`">
        <q-card-section class="q-pa-lg">
          <div class="text-h5 text-weight-bolder q-mb-xs" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">Nueva Ruta</div>
          <div class="text-caption q-mb-lg" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Describe el trayecto para empezar a asignar clientes</div>

          <div class="q-gutter-y-md q-mt-md">
            <q-input
              v-model="newRouteForm.name"
              label="Nombre de Ruta"
              dense
              borderless
              class="minimal-input q-px-sm rounded-borders-12"
              placeholder="Ej: Zona Norte"
              :input-class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
              :label-color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            >
              <template v-slot:prepend>
                <q-icon name="edit" size="18px" :color="$q.dark.isActive ? 'grey-4' : 'grey-5'" />
              </template>
            </q-input>

            <q-select
              v-model="newRouteForm.origin_branch"
              :options="branches"
              option-label="name"
              label="Origen"
              dense
              borderless
              class="minimal-input q-px-sm rounded-borders-12"
              :dark="$q.dark.isActive"
              :label-color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            >
              <template v-slot:prepend>
                <q-icon name="storefront" size="18px" :color="$q.dark.isActive ? 'grey-4' : 'grey-5'" />
              </template>
            </q-select>

            <q-select
              v-model="newRouteForm.courier"
              :options="couriers"
              option-label="name"
              label="Repartidor"
              dense
              borderless
              class="minimal-input q-px-sm rounded-borders-12"
              clearable
              :dark="$q.dark.isActive"
              :label-color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            >
              <template v-slot:prepend>
                <q-icon name="directions_bike" size="18px" :color="$q.dark.isActive ? 'grey-4' : 'grey-5'" />
              </template>
            </q-select>

            <q-select
              v-model="newRouteForm.partner"
              :options="partners"
              option-label="name"
              label="Afiliado"
              dense
              borderless
              class="minimal-input q-px-sm rounded-borders-12"
              clearable
              @popup-show="loadPartners"
            >
              <template v-slot:prepend>
                <q-icon name="business" size="18px" color="grey-5" />
              </template>
            </q-select>
          </div>

          <div class="row q-mt-md q-gutter-x-sm no-wrap">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              v-close-popup
              no-caps
              class="col border-radius-10"
            />
            <q-btn
              unelevated
              label="Crear Ruta"
              color="primary"
              :loading="saving"
              :disable="!newRouteForm.name || !newRouteForm.origin_branch"
              class="col border-radius-10 text-weight-bold"
              no-caps
              @click="submitNewRoute"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useQuasar, debounce } from 'quasar'
import { api } from 'src/boot/axios'
import { loadGoogleMaps, darkMapStyles } from 'src/config/maps'
import draggable from 'vuedraggable'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import eventBus from 'src/utils/eventBus'

const $q = useQuasar()

/**
 * Refs & State
 */
/**
 * Google Maps instance
 * @type {import('vue').Ref<any>} description var
 */
const map = ref(null)

/**
 * Map container reference
 * @type {import('vue').Ref<HTMLElement>} description var
 */
const mapContainer = ref(null)

/**
 * Search term for all clients
 * @type {import('vue').Ref<string>} description var
 */
const allClientsSearch = ref('')

/**
 * Whether search results are visible
 * @type {import('vue').Ref<boolean>} description var
 */
const showResults = ref(false)

/**
 * Whether the bottom sheet is expanded
 * @type {import('vue').Ref<boolean>} description var
 */
const sheetExpanded = ref(false)

/**
 * Active tab in the bottom sheet
 * @type {import('vue').Ref<string>} description var
 */
const activeTab = ref('details')

/**
 * List of active delivery routes
 * @type {import('vue').Ref<Array>} description var
 */
const activeRoutes = ref([])

/**
 * List of available partners
 * @type {import('vue').Ref<Array>} description var
 */
const partners = ref([])

/**
 * List of searched clients
 * @type {import('vue').Ref<Array>} description var
 */
const clients = ref([])

/**
 * Currently selected route object
 * @type {import('vue').Ref<any>} description var
 */
const selectedRoute = ref(null)

/**
 * Stops for the currently selected route
 * @type {import('vue').Ref<Array>} description var
 */
const selectedRouteStops = ref([])

/**
 * Form for current route editing
 * @type {import('vue').Ref<Object>} description var
 */
const routeForm = ref({ name: '', courier: null, origin_branch: null, partner: null })

/**
 * List of available couriers
 * @type {import('vue').Ref<Array>} description var
 */
const couriers = ref([])

/**
 * List of available branches
 * @type {import('vue').Ref<Array>} description var
 */
const branches = ref([])

/**
 * Map of markers for route stops
 * @type {Map<string|number, any>} description var
 */
const markers = new Map()

/**
 * Map of markers for active couriers
 * @type {Map<string|number, any>} description var
 */
const courierMarkers = new Map()

/**
 * Google Maps directions renderer for the main route
 * @type {import('vue').Ref<any>} description var
 */
const routeRenderer = ref(null)

// Monitor State
/**
 * Active runs for monitoring
 * @type {import('vue').Ref<Array>} description var
 */
const monitorActiveRuns = ref([])

/**
 * Echo instance for WebSockets
 * @type {any} description var
 */
let echo = null

/**
 * Directions renderer for completed segments
 * @type {import('vue').Ref<any>} description var
 */
const completedRenderer = ref(null)

/**
 * Directions renderer for pending segments
 * @type {import('vue').Ref<any>} description var
 */
const pendingRenderer = ref(null)

/**
 * Global info window for map markers
 * @type {import('vue').Ref<any>} description var
 */
const infoWindow = ref(null)

/**
 * Saving state for API operations
 * @type {import('vue').Ref<boolean>} description var
 */
const saving = ref(false)

/**
 * History of delivery runs
 * @type {import('vue').Ref<Array>} description var
 */
const historyRuns = ref([])

/**
 * Loading state for history
 * @type {import('vue').Ref<boolean>} description var
 */
const historyLoading = ref(false)

/**
 * Filters for history retrieval
 * @type {import('vue').Ref<Object>} description var
 */
const historyFilters = ref({
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

/**
 * Selected run for detailed monitoring
 * @type {import('vue').Ref<any>} description var
 */
const monitorSelectedRun = ref(null)

/**
 * Current monitoring mode (live or history)
 * @type {import('vue').Ref<string>} description var
 */
const monitorMode = ref('live')

/**
 * Whether the clone dialog is visible
 * @type {import('vue').Ref<boolean>} description var
 */
const showCloneDialog = ref(false)

/**
 * Run object to be cloned
 * @type {import('vue').Ref<any>} description var
 */
const runToClone = ref(null)

/**
 * Items to be cloned in the run
 * @type {import('vue').Ref<Array>} description var
 */
const cloneItems = ref([])

/**
 * Whether cloning operation is in progress
 * @type {import('vue').Ref<boolean>} description var
 */
const cloningInProgress = ref(false)

/**
 * Delivery date for the cloned run
 * @type {import('vue').Ref<string>} description var
 */
const cloneDeliveryDate = ref(new Date().toISOString().split('T')[0])

/**
 * Whether the address fixing modal is visible
 * @type {import('vue').Ref<boolean>} description var
 */
const showAddressModal = ref(false)

/**
 * Client object that lacks an address
 * @type {import('vue').Ref<any>} description var
 */
const clientWithoutAddress = ref(null)

/**
 * Whether the create route modal is visible
 * @type {import('vue').Ref<boolean>} description var
 */
const showCreateRouteModal = ref(false)

/**
 * Form for creating a new route
 * @type {import('vue').Ref<Object>} description var
 */
const newRouteForm = ref({
  name: '',
  origin_branch: null,
  courier: null,
  partner: null
})

/**
 * Search query for filtering clients
 * @type {import('vue').Ref<string>} description var
 */
const searchQuery = ref('')

/**
 * List of all available clients
 * @type {import('vue').Ref<Array>} description var
 */
const allClients = ref([])

/**
 * Loading state for partners
 * @type {import('vue').Ref<boolean>} description var
 */
const partnersLoading = ref(false)

/**
 * Validated/fixed address object
 * @type {import('vue').Ref<any>} description var
 */
const fixedAddress = ref(null)

// Computed Properties
/**
 * Formatted string for total distance of the selected route
 * @return {string} description return
 */
const totalDistanceLabel = computed(() => {
  if (!selectedRouteStops.value?.length) return '0 km'
  const total = selectedRouteStops.value.reduce((acc, stop) => acc + (stop.distance_value || 0), 0)
  return (total / 1000).toFixed(1) + ' km'
})

/**
 * Formatted string for total duration of the selected route
 * @return {string} description return
 */
const totalDurationLabel = computed(() => {
  if (!selectedRouteStops.value?.length) return '0 min'
  const total = selectedRouteStops.value.reduce((acc, stop) => acc + (stop.duration_value || 0), 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`
})

/**
 * Filtered list of live active runs
 * @return {Array} description return
 */
const liveActiveRuns = computed(() => {
  return monitorActiveRuns.value
})

/**
 * Clients filtered by the search term
 * @return {Array} description return
 */
const filteredAllClients = computed(() => {
  if (!allClientsSearch.value) return allClients.value
  const term = allClientsSearch.value.toLowerCase()
  return allClients.value.filter(c =>
    c.name.toLowerCase().includes(term) ||
    (c.document_number && c.document_number.includes(term))
  )
})

/**
 * Prepares the cloning dialog with data from a specific run
 * @params {Object} run The delivery run to clone
 * @return {void} description return
 */
const openClonePreview = (run) => {
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
 * Executes the cloning process for selected invoices
 * @return {Promise<void>} description return
 */
const confirmCloning = async () => {
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

/**
 * Computes the total currency value for selected items in the clone dialog
 * @return {number} description return
 */
const calculateSelectedCloneTotal = computed(() => {
  return cloneItems.value.filter(i => i.selected).reduce((sum, item) => sum + calculateInvoiceTotal(item.invoice), 0)
})

/**
 * Formats a numeric value into a currency string (PYG)
 * @params {number} value The numeric value to format
 * @return {string} description return
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(value)
}

/**
 * Formats a date string into a localized readable format
 * @params {string} dateStr The date string to format
 * @return {string} description return
 */
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/**
 * Debounced handler for client search input
 * @params {string} val The search term
 * @return {Promise<void>} description return
 */
const onSearchInput = debounce(async (val) => {
  if (!val) {
    clients.value = []
    showResults.value = false
    return
  }
  try {
    const { data } = await api.get('clients', { params: { search: val, limit: 10 } })
    clients.value = Array.isArray(data) ? data : (data.data || [])
    showResults.value = true
  } catch (e) {
    console.error(e)
  }
}, 300)

/**
 * Checks if a client is already present in the currently selected route
 * @params {Object} client The client to check
 * @return {boolean} description return
 */
const isClientInSelectedRoute = (client) => {
  if (!selectedRouteStops.value) return false
  return selectedRouteStops.value.some(s => s.client_id === client.id || (s.client && s.client.id === client.id))
}

/**
 * Fetches all clients from the API
 * @return {Promise<void>} description return
 */
const loadAllClients = async () => {
  $q.loading.show()
  try {
    const { data } = await api.get('clients', { params: { limit: 1000 } })
    allClients.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

// Monitoring Helpers
/**
 * Opens the monitoring view for a specific run
 * @params {Object} run The run to monitor
 * @return {void} description return
 */
const openMonitorDialog = (run) => {
  monitorSelectedRun.value = run
  activeTab.value = 'monitor'
  // Reuse selectRoute to populate map and stops
  selectRoute(run)
}

/**
 * Determines if a run is currently returning to its origin
 * @params {Object} run The run object
 * @return {boolean} description return
 */
const isRunReturningToOrigin = (run) => {
  // Logic from AdminDeliveryMonitorPage depends on 'status' or logic
  if (run?.status === 'returning') return true
  // Or check if all items delivered
  const items = run?.items || []
  if (items.length > 0 && items.every(i => i.delivery_status === 'delivered')) return true
  return false
}

/**
 * Formats a time string into a short version (HH:mm)
 * @params {string} dateStr The date string
 * @return {string} description return
 */
const formatTimeShort = (dateStr) => {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Gets the color associated with a delivery status
 * @params {string} status The delivery status
 * @return {string} description return
 */
const getDeliveryStatusColor = (status) => {
  switch (status) {
    case 'delivered': return 'positive'
    case 'arrived': return 'warning' // or orange
    case 'cancelled': return 'negative'
    case 'pending': default: return 'grey'
  }
}

/**
 * Gets the localized label for a delivery status
 * @params {string} status The delivery status
 * @return {string} description return
 */
const getDeliveryStatusLabel = (status) => {
  switch (status) {
    case 'delivered': return 'Entregado'
    case 'arrived': return 'En sitio'
    case 'cancelled': return 'Cancelado'
    case 'pending': default: return 'Pendiente'
  }
}

/**
 * Count of delivered items in the monitored run
 * @return {number} description return
 */
const monitorSelectedRunDeliveredCount = computed(() => {
  if (!monitorSelectedRun.value) return 0
  return monitorSelectedRun.value.items?.filter(i => i.delivery_status === 'delivered').length || 0
})

/**
 * Total count of items in the monitored run
 * @return {number} description return
 */
const monitorSelectedRunTotalCount = computed(() => {
  if (!monitorSelectedRun.value) return 0
  return monitorSelectedRun.value.items?.length || 0
})

/**
 * Total payments collected for the monitored run
 * @return {number} description return
 */
const monitorRunPaymentsTotal = computed(() => {
  if (!monitorSelectedRun.value) return 0
  return calculateRunPayments(monitorSelectedRun.value)
})

/**
 * Estimated time remaining for the monitored run
 * @return {string} description return
 */
const monitorEstimatedTime = computed(() => {
  if (!monitorSelectedRun.value) return '-'
  // Simple estimation: 15 mins per pending item
  const pending = monitorSelectedRun.value.items?.filter(i => i.delivery_status !== 'delivered').length || 0
  if (pending === 0) return '0 min'
  const totalMins = pending * 15
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return h > 0 ? `${h}h ${m}m` : `${m} min`
})

/**
 * Fetches available partners from the API
 * @return {Promise<void>} description return
 */
const loadPartners = async () => {
  if (partners.value.length) return
  partnersLoading.value = true
  try {
    const { data } = await api.get('partners')
    partners.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) { console.error(e) } finally { partnersLoading.value = false }
}

/**
 * Initializes the new route creation form
 * @return {void} description return
 */
const createNewRoute = () => {
  newRouteForm.value = {
    name: '',
    origin_branch: branches.value[0] || null,
    courier: null,
    partner: null
  }
  showCreateRouteModal.value = true
}

/**
 * Submits the new route creation form to the API
 * @return {Promise<void>} description return
 */
const submitNewRoute = async () => {
  saving.value = true
  try {
    const payload = {
      name: newRouteForm.value.name,
      origin_branch_id: newRouteForm.value.origin_branch?.id,
      courier_id: newRouteForm.value.courier?.id,
      partner_id: newRouteForm.value.partner?.id,
      status: 'draft'
    }
    const { data } = await api.post('delivery-routes', payload)
    showCreateRouteModal.value = false
    $q.notify({ message: 'Ruta creada', color: 'positive' })
    await loadActiveRuns()
    selectRoute(data.data || data)
    activeTab.value = 'details'
    sheetExpanded.value = true
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Error al crear ruta', color: 'negative' })
  } finally {
    saving.value = false
  }
}

/**
 * Saves changes made to the current route's general information
 * @return {Promise<void>} description return
 */
const saveRouteChanges = async () => {
  if (!selectedRoute.value) return
  saving.value = true
  try {
    await api.put(`delivery-routes/${selectedRoute.value.id}`, {
      name: routeForm.value.name,
      courier_id: routeForm.value.courier?.id,
      partner_id: routeForm.value.partner?.id,
      origin_branch_id: routeForm.value.origin_branch?.id
    })
    $q.notify({ message: 'Ruta guardada', color: 'positive' })
  } catch (e) {
    $q.notify({ message: 'Error al guardar', color: 'negative' })
  } finally {
    saving.value = false
  }
}

/**
 * Deletes an entire delivery route after confirmation
 * @params {Object} route The route to delete
 * @return {Promise<void>} description return
 */
const deleteFullRoute = async (route) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar esta ruta?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`delivery-routes/${route.id}`)
      $q.notify({ message: 'Ruta eliminada', color: 'positive' })
      await loadActiveRuns()
      if (activeRoutes.value.length > 0) {
        selectRoute(activeRoutes.value[0])
      } else {
        selectedRoute.value = null
        selectedRouteStops.value = []
        cleanupMarkers()
      }
    } catch (e) {
      $q.notify({ message: 'Error al eliminar', color: 'negative' })
    }
  })
}

/**
 * Handles adding a client to the selected route, checking for address coordinates
 * @params {Object} client The client to add
 * @return {void} description return
 */
const addClientToRoute = (client) => {
  if (!selectedRoute.value) return $q.notify({ message: 'Primero selecciona una ruta', color: 'warning' })
  if (isClientInSelectedRoute(client)) return $q.notify({ message: 'El cliente ya está en la ruta', color: 'warning' })

  const coords = getClientCoords(client)
  if (!coords) {
    clientWithoutAddress.value = client
    showAddressModal.value = true
    return
  }
  performAddClient(client, coords)
}

/**
 * Performs the actual API call to add a client as a stop in the route
 * @params {Object} client The client object
 * @params {Object} coords Coordinate object with lat and lng
 * @return {Promise<void>} description return
 */
const performAddClient = async (client, coords) => {
  $q.loading.show({ message: 'Agregando parada...' })
  try {
    await api.post(`/delivery-routes/${selectedRoute.value.id}/add-client`, {
      client_id: client.id,
      stop_order: selectedRouteStops.value.length + 1,
      latitude: coords.lat,
      longitude: coords.lng
    })
    $q.notify({ message: 'Parada agregada', color: 'positive' })

    // Refresh route
    const { data } = await api.get(`delivery-routes/${selectedRoute.value.id}`)
    console.log(data)
    selectRoute(data?.data?.route || data?.route)

    activeTab.value = 'details'
  } catch (e) {
    $q.notify({ message: 'Error al agregar cliente', color: 'negative' })
    console.error(e)
  } finally {
    $q.loading.hide()
    showResults.value = false
  }
}

/**
 * Updates the fixed address ref when AddressComponent emits a change
 * @params {any} address The new address object
 * @return {void} description return
 */
const onAddressFixed = (address) => {
  fixedAddress.value = address
}

/**
 * Saves the fixed address for a client and adds them to the route if successful
 * @return {Promise<void>} description return
 */
const saveFixedAddress = async () => {
  try {
    if (!clientWithoutAddress.value || !fixedAddress.value) return

    await api.put(`clients/${clientWithoutAddress.value.id}`, {
      ...clientWithoutAddress.value,
      address: fixedAddress.value
    })

    clientWithoutAddress.value.address = fixedAddress.value
    const coords = getClientCoords(clientWithoutAddress.value)

    if (coords) {
      await performAddClient(clientWithoutAddress.value, coords)
      $q.notify({ message: 'Dirección actualizada y cliente agregado', color: 'positive' })
    } else {
      $q.notify({ message: 'Dirección actualizada', color: 'positive' })
    }

    showAddressModal.value = false
    clientWithoutAddress.value = null
    fixedAddress.value = null
  } catch (error) {
    console.error('Error al guardar la dirección:', error)
    $q.notify({ message: 'Error al actualizar dirección', color: 'negative' })
  }
}

/**
 * Deletes a specific stop from the current route
 * @params {Object} stop The stop object to remove
 * @return {Promise<void>} description return
 */
const removeStop = async (stop) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar parada?',
    cancel: true
  }).onOk(async () => {
    try {
      await api.delete(`delivery-routes/${selectedRoute.value.id}/stops/${stop.id}`)
      $q.notify({ message: 'Parada eliminada', color: 'positive' })
      // Refresh route
      const { data } = await api.get(`delivery-routes/${selectedRoute.value.id}`)
      selectRoute(data?.data?.route || data?.route)
    } catch (e) {
      $q.notify({ message: 'Error al eliminar', color: 'negative' })
    }
  })
}

/**
 * Opens the address modal to edit a stop's location
 * @params {Object} stop The stop object
 * @return {void} description return
 */
const editStopAddress = (stop) => {
  clientWithoutAddress.value = stop.client || { name: 'Punto manual' }
  showAddressModal.value = true
}

/**
 * Moves a stop up in the route order
 * @params {number} index The current index of the stop
 * @return {void} description return
 */
const moveStopUp = (index) => {
  if (index <= 0) return
  const newStops = [...selectedRouteStops.value]
  const temp = newStops[index]
  newStops[index] = newStops[index - 1]
  newStops[index - 1] = temp
  selectedRouteStops.value = newStops
  onStopsDragged()
}

/**
 * Moves a stop down in the route order
 * @params {number} index The current index of the stop
 * @return {void} description return
 */
const moveStopDown = (index) => {
  if (index >= selectedRouteStops.value.length - 1) return
  const newStops = [...selectedRouteStops.value]
  const temp = newStops[index]
  newStops[index] = newStops[index + 1]
  newStops[index + 1] = temp
  selectedRouteStops.value = newStops
  onStopsDragged()
}

/**
 * Total number of deliveries across all history runs
 * @return {number} description return
 */
const historyTotalDeliveries = computed(() => {
  return historyRuns.value.reduce((sum, run) => sum + (run.items?.length || run.stops?.length || 0), 0)
})

/**
 * Total currency value of payments across all history runs
 * @return {number} description return
 */
const historyTotalPayments = computed(() => {
  return historyRuns.value.reduce((sum, run) => sum + calculateRunPayments(run), 0)
})

/**
 * Calculates total payments for a specific delivery run
 * @params {Object} run The delivery run
 * @return {number} description return
 */
const calculateRunPayments = (run) => {
  if (!run) return 0
  const items = run.items || run.stops || []
  return items.reduce((sum, item) => sum + getItemPayment(item), 0)
}

/**
 * Extracts payment amount from a route item (invoice or stop)
 * @params {Object} item The item to examine
 * @return {number} description return
 */
const getItemPayment = (item) => {
  if (item.invoice) {
    // Stop object with invoice
    const payments = item.invoice.invoice_payments || item.invoice.invoicePayments || []
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  } else if (item.invoice_payments || item.invoicePayments) {
    // Item IS the invoice
    const payments = item.invoice_payments || item.invoicePayments || []
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  }
  return 0
}

/**
 * Fetches historical delivery runs from the API based on filters
 * @return {Promise<void>} description return
 */
async function loadHistoryRuns () {
  historyLoading.value = true
  try {
    const response = await api.get('/invoice-delivery-runs/history', {
      params: {
        start_date: historyFilters.value.startDate,
        end_date: historyFilters.value.endDate
      }
    })
    historyRuns.value = response.data.delivery_runs || []
  } catch (error) {
    console.error('Error loading history runs:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar historial' })
  } finally {
    historyLoading.value = false
  }
}

/**
 * Calculates the total value of an invoice including products and promotions
 * @params {Object} invoice The invoice object
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
 * Count of selected items in the cloning context
 * @return {number} description return
 */
const selectedCloneCount = computed(() => {
  return cloneItems.value.filter(item => item.selected).length
})

/**
 * Helpers (Moved up for availability)
 */
/**
 * Extracts coordinates from a client object
 * @params {Object} client The client object
 * @return {Object|null} description return
 */
const getClientCoords = (client) => {
  if (!client) return null
  const addr = typeof client.address === 'string' ? JSON.parse(client.address) : client.address
  const lat = addr?.latitude || client.latitude
  const lng = addr?.longitude || client.longitude
  return (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
}

/**
 * Extracts coordinates from a branch object
 * @params {Object} branch The branch object
 * @return {Object|null} description return
 */
const getBranchCoords = (branch) => {
  if (!branch) return null
  const addr = typeof branch.address === 'string' ? JSON.parse(branch.address) : branch.address
  return { lat: parseFloat(addr?.latitude || branch.latitude), lng: parseFloat(addr?.longitude || branch.longitude) }
}

/**
 * Gets a formatted address string from a client object
 * @params {Object} client The client object
 * @return {string} description return
 */
const getClientAddress = (client) => {
  if (!client?.address) return 'Sin dirección'
  const addr = typeof client.address === 'string' ? JSON.parse(client.address) : client.address
  return addr?.formattedAddress || addr?.street || 'Sin dirección'
}

/**
 * Initializes WebSocket connection for real-time updates
 * @return {void} description return
 */
function initializeWebSocket () {
  try {
    const instance = getCurrentInstance()
    echo = instance.appContext.config.globalProperties.$echo

    if (!echo) {
      console.error('❌ Echo instance not found. Make sure pusher.js boot file is loaded.')
      return
    }

    console.log('echo configurado')

    echo.channel('delivery-tracking')
      .listen('.DeliveryLocationUpdated', (event) => {
        console.log('📍 Location updated:', event)
        updateCourierLocation(event.delivery_run_id, event.latitude, event.longitude)
      })
      .listen('.DeliveryRunStatusUpdated', (event) => {
        console.log('📦 Delivery run status updated:', event)
        const runId = event.delivery_run?.id
        const newStatus = event.new_status || event.delivery_run?.status

        if (newStatus === 'completed' && runId) {
          monitorActiveRuns.value = monitorActiveRuns.value.filter(run => run.id !== runId)
          if (monitorSelectedRun.value?.id === runId) {
            monitorSelectedRun.value = null
          }
        } else if (runId) {
          loadHistoryRuns() // Refresh logic could be optimized
        }
      })
      .listen('.DeliveryRunStarted', (event) => {
        console.log('🚀 Delivery run started:', event)
        loadHistoryRuns()
        $q.notify({
          type: 'positive',
          message: `Nueva ruta iniciada por ${event.delivery_run?.delivery_person?.name || 'repartidor'}`,
          position: 'top',
          icon: 'local_shipping',
          timeout: 3000
        })
      })
      .listen('.DeliveryRunCompleted', (event) => {
        console.log('✅ Delivery run completed:', event)
        loadHistoryRuns()
      })

    console.log('✅ WebSocket initialized - Real-time updates active')
  } catch (error) {
    console.error('❌ Error initializing WebSocket:', error)
  }
}

/**
 * Updates the location of a courier on the map
 * @params {number|string} runId The run ID
 * @params {number|string} latitude The new latitude
 * @params {number|string} longitude The new longitude
 * @return {void} description return
 */
function updateCourierLocation (runId, latitude, longitude) {
  // Update in monitorActiveRuns
  const run = monitorActiveRuns.value.find(r => r.id === runId)
  if (run) {
    if (!run.locations) run.locations = []
    run.locations.unshift({
      latitude,
      longitude,
      recorded_at: new Date().toISOString()
    })
  }

  // Update Map Marker
  const p = { lat: parseFloat(latitude), lng: parseFloat(longitude) }
  let m = courierMarkers.get(runId)

  if (!m) {
    if (!map.value) return
    // Only create marker if this run is being monitored or we want to show all
    if (run || monitorSelectedRun.value?.id === runId) {
      m = new google.maps.Marker({
        position: p,
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          fillColor: '#2196F3',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      })
      courierMarkers.set(runId, m)
    }
  } else {
    m.setPosition(p)
  }
}

/**
 * Cleans up all map markers and renderers
 * @return {void} description return
 */
const cleanupMarkers = () => {
  // Clear stop markers
  markers.forEach(m => {
    if (m) m.setMap(null)
  })
  markers.clear()

  // Clear real-time courier markers
  courierMarkers.forEach(m => {
    if (m) m.setMap(null)
  })
  courierMarkers.clear()

  // Close info window
  if (infoWindow.value) {
    infoWindow.value.close()
  }

  // Deep reset of the route renderers
  if (routeRenderer.value) {
    routeRenderer.value.setDirections({ routes: [] })
    routeRenderer.value.setMap(null)
  }
  if (completedRenderer.value) {
    completedRenderer.value.setDirections({ routes: [] })
    completedRenderer.value.setMap(null)
  }
  if (pendingRenderer.value) {
    pendingRenderer.value.setDirections({ routes: [] })
    pendingRenderer.value.setMap(null)
  }
}

/**
 * Lifecycle
 */
/**
 * Lifecycle hook: component mounted
 * @return {Promise<void>} description return
 */
onMounted(async () => {
  $q.loading.show()
  try {
    // 1. Load basic data and Map API
    await Promise.all([
      loadGoogleMaps(),
      loadInitialData()
    ])

    // 2. Initialize the map first
    initializeMap()

    // 3. Load routes (this handles the first route selection)
    await loadActiveRuns()
    await loadHistoryRuns()

    // 4. Post-initialization
    initializeWebSocket()
  } catch (error) {
    console.error('Initialization error:', error)
  } finally {
    $q.loading.hide()
  }
})

/**
 * Lifecycle hook: before component unmount
 * @return {void} description return
 */
onBeforeUnmount(() => {
  cleanupMarkers()
  // Leave channel (don't disconnect global echo)
  if (echo) {
    echo.leave('delivery-tracking')
  }
})

/**
 * Initializes the Google Map instance
 * @return {void} description return
 */
const initializeMap = () => {
  if (!mapContainer.value) return
  const origin = getBranchCoords(routeForm.value?.origin_branch) || { lat: -25.2637, lng: -57.5759 }
  map.value = new google.maps.Map(mapContainer.value, {
    center: origin,
    zoom: 13,
    styles: darkMapStyles,
    disableDefaultUI: true
  })
}

/**
 * API Logic
 */
/**
 * Loads initial data needed for the component (couriers and branches)
 * @return {Promise<void>} description return
 */
async function loadInitialData () {
  try {
    const [c, b] = await Promise.all([
      api.get('delivery-persons'),
      api.get('branch-offices')
    ])
    // Standardize data extraction for different API response formats
    couriers.value = Array.isArray(c.data) ? c.data : (c.data?.data || [])
    branches.value = Array.isArray(b.data) ? b.data : (b.data?.data || [])
  } catch (e) {
    console.error('Error loading initial data:', e)
  }
}

/**
 * Loads currently active delivery runs from the API
 * @return {Promise<void>} description return
 */
async function loadActiveRuns () {
  try {
    const { data } = await api.get('delivery-routes')
    // Handle both direct array and paginated/resource responses
    activeRoutes.value = Array.isArray(data) ? data : (data.data || [])

    if (activeRoutes.value.length) {
      if (!selectedRoute.value) {
        selectRoute(activeRoutes.value[0])
      } else {
        const updated = activeRoutes.value.find(r => r.id === selectedRoute.value.id)
        if (updated) selectRoute(updated)
        else {
          selectedRoute.value = null
          selectedRouteStops.value = []
          cleanupMarkers()
        }
      }
    }
  } catch (e) {
    console.error('Error loading active runs:', e)
  }
}

/**
 * Sets the currently active route and updates the UI
 * @params {Object} route The route object to select
 * @return {void} description return
 */
const selectRoute = (route) => {
  // Immediate UI cleanup to avoid ghost data while debouncing
  cleanupMarkers()
  if (routeRenderer.value) routeRenderer.value.setMap(null)

  selectedRoute.value = route
  const rawStops = route.route_clients || route.stops || route.items || []
  selectedRouteStops.value = rawStops.map(s => {
    // Robust coordinate extraction: prioritize stop coords, fallback to client address coords
    const clientC = getClientCoords(s.client)
    return {
      ...s,
      status: s.delivery_status || 'pending',
      client: s.client || { name: 'Cliente #' + s.id },
      latitude: s.latitude || clientC?.lat,
      longitude: s.longitude || clientC?.lng
    }
  })

  routeForm.value = {
    name: route.name || route.route_number,
    courier: route.courier || null,
    origin_branch: route.origin_branch || branches.value[0] || null,
    partner: route.partner || null
  }

  updateMapRoute()
}

/**
 * Handles stop reordering when elements are dragged
 * @return {Promise<void>} description return
 */
const onStopsDragged = async () => {
  updateMapRoute()
  try {
    await api.post(`/delivery-routes/${selectedRoute.value.id}/stops/reorder`, {
      stops: selectedRouteStops.value.map((s, i) => ({ id: s.id, stop_order: i + 1 }))
    })
    $q.notify({ message: 'Orden actualizado', color: 'positive', position: 'bottom' })
  } catch (e) { console.error(e) }
}

/**
 * Map Route Drawing (Optimized)
 */
/**
 * Debounced function to update the route polylines and markers on the map
 * @return {Promise<void>} description return
 */
const updateMapRoute = debounce(async () => {
  if (!map.value) return

  const routeIdAtStart = selectedRoute.value?.id
  cleanupMarkers()

  if (!selectedRouteStops.value?.length) return

  if (!infoWindow.value && typeof google !== 'undefined') {
    infoWindow.value = new google.maps.InfoWindow()
  }

  const bounds = new google.maps.LatLngBounds()
  const directionsService = new google.maps.DirectionsService()

  // Origin
  const origin = getBranchCoords(routeForm.value.origin_branch) || { lat: -25.26, lng: -57.57 }
  bounds.extend(origin)

  // Markers
  selectedRouteStops.value.forEach((stop, i) => {
    const pos = { lat: parseFloat(stop.latitude), lng: parseFloat(stop.longitude) }
    if (pos.lat && pos.lng) {
      let markerColor = '#64748b' // pending (grey)
      if (stop.delivery_status === 'delivered') markerColor = '#10b981' // delivered (green)
      else if (stop.delivery_status === 'arrived') markerColor = '#f59e0b' // arrived (yellow)

      const marker = new google.maps.Marker({
        position: pos,
        map: map.value,
        label: { text: String(i + 1), color: 'white', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#fff'
        }
      })

      marker.addListener('click', () => {
        const content = `
          <div style="padding: 12px; min-width: 180px; font-family: 'Inter', sans-serif;">
            <div style="font-weight: 800; font-size: 14px; color: #2c3e50; margin-bottom: 4px;">${stop.client?.name || 'Cliente'}</div>
            <div style="font-size: 12px; color: #7f8c8d; line-height: 1.4; margin-bottom: 8px;">
              <i class="material-icons" style="font-size: 12px; vertical-align: middle;">place</i> 
              ${getClientAddress(stop.client)}
            </div>
            ${stop.distance_text ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                <div style="background: rgba(33, 150, 243, 0.1); color: #2196F3; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                  ${stop.distance_text}
                </div>
              </div>
            ` : ''}
          </div>
        `
        infoWindow.value.setContent(content)
        infoWindow.value.open(map.value, marker)
      })

      markers.set(stop.id, marker)
      bounds.extend(pos)
    }
  })

  // Route Drawing logic
  const validStops = selectedRouteStops.value.filter(s => {
    const lat = parseFloat(s.latitude)
    const lng = parseFloat(s.longitude)
    return !isNaN(lat) && !isNaN(lng)
  })

  if (validStops.length === 0) {
    map.value.fitBounds(bounds)
    return
  }

  try {
    const deliveredStops = validStops.filter(s => s.delivery_status === 'delivered')
    const pendingStops = validStops.filter(s => s.delivery_status !== 'delivered')

    const isProgressView = deliveredStops.length > 0 && pendingStops.length > 0

    if (isProgressView) {
      // 1. Draw Completed (Red)
      const completedWaypoints = deliveredStops.slice(0, -1).map(s => ({ location: { lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }, stopover: true }))
      const lastCompleted = deliveredStops[deliveredStops.length - 1]

      const completedReq = {
        origin,
        destination: { lat: parseFloat(lastCompleted.latitude), lng: parseFloat(lastCompleted.longitude) },
        waypoints: completedWaypoints,
        travelMode: google.maps.TravelMode.DRIVING
      }

      const completedRes = await directionsService.route(completedReq)

      if (!completedRenderer.value) {
        completedRenderer.value = new google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: { strokeColor: '#EF4444', strokeWeight: 5, strokeOpacity: 0.8 } // Red
        })
      }
      completedRenderer.value.setMap(map.value)
      completedRenderer.value.setDirections(completedRes)

      // 2. Draw Pending (Grey/Blue)
      // Start from last completed
      const startPending = { lat: parseFloat(lastCompleted.latitude), lng: parseFloat(lastCompleted.longitude) }
      const pendingDest = pendingStops[pendingStops.length - 1]
      const pendingWaypoints = pendingStops.slice(0, -1).map(s => ({ location: { lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) }, stopover: true }))

      const pendingReq = {
        origin: startPending,
        destination: { lat: parseFloat(pendingDest.latitude), lng: parseFloat(pendingDest.longitude) },
        waypoints: pendingWaypoints,
        travelMode: google.maps.TravelMode.DRIVING
      }

      const pendingRes = await directionsService.route(pendingReq)

      if (!pendingRenderer.value) {
        pendingRenderer.value = new google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: { strokeColor: '#94A3B8', strokeWeight: 5, strokeOpacity: 0.7, strokeDashOpacity: 0 } // Greyish
        })
      }
      pendingRenderer.value.setMap(map.value)
      pendingRenderer.value.setDirections(pendingRes)

      // Update distances from pending leg
      pendingRes.routes[0].legs.forEach((leg, i) => {
        if (pendingStops[i]) {
          pendingStops[i].distance_text = leg.distance.text
          pendingStops[i].distance_value = leg.distance.value
          pendingStops[i].duration_value = leg.duration.value
        }
      })
    } else {
      // Standard Single Route
      const waypoints = validStops.slice(0, -1).map(s => ({
        location: { lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) },
        stopover: true
      }))
      const dest = validStops[validStops.length - 1]

      const result = await directionsService.route({
        origin,
        destination: { lat: parseFloat(dest.latitude), lng: parseFloat(dest.longitude) },
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING
      })

      if (selectedRoute.value?.id !== routeIdAtStart) return

      if (!routeRenderer.value) {
        routeRenderer.value = new google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: { strokeColor: '#2196F3', strokeWeight: 5, strokeOpacity: 0.7 }
        })
      }
      routeRenderer.value.setMap(map.value)
      routeRenderer.value.setDirections(result)

      // Update distances
      result.routes[0].legs.forEach((leg, i) => {
        if (validStops[i]) {
          validStops[i].distance_text = leg.distance.text
          validStops[i].distance_value = leg.distance.value
          validStops[i].duration_value = leg.duration.value
        }
      })
    }
  } catch (e) {
    console.warn('Polyline error:', e)
  }

  map.value.fitBounds(bounds)
}, 500)

/**
 * Toggles the expansion state of the bottom sheet
 * @return {void} description return
 */
const toggleSheet = () => {
  sheetExpanded.value = !sheetExpanded.value
}

/**
 * State for tracking touch interactons on the sheet
 * @type {import('vue').Ref<Object>} description var
 */
const touchState = ref({
  startY: 0,
  currentY: 0,
  isDragging: false
})

/**
 * Handles the start of a touch event on the sheet handle
 * @params {TouchEvent} e The touch event
 * @return {void} description return
 */
const onTouchStart = (e) => {
  touchState.value.startY = e.touches[0].clientY
  touchState.value.isDragging = true
}

/**
 * Handles the movement of a touch event on the sheet handle
 * @params {TouchEvent} e The touch event
 * @return {void} description return
 */
const onTouchMove = (e) => {
  if (!touchState.value.isDragging) return
  touchState.value.currentY = e.touches[0].clientY
  const deltaY = touchState.value.startY - touchState.value.currentY

  // If dragged up significantly, expand. If down, minimize.
  if (deltaY > 50) {
    sheetExpanded.value = true
  } else if (deltaY < -50) {
    sheetExpanded.value = false
  }
}

/**
 * Handles the end of a touch event on the sheet handle
 * @return {void} description return
 */
const onTouchEnd = () => {
  touchState.value.isDragging = false
}

</script>

<style scoped>
.google-maps-route-page { position: relative; height: 100vh; overflow: hidden; background: #eee; }
.body--dark .google-maps-route-page { background: #121212; }

.full-screen-map { width: 100%; height: 100%; }

.glassmorphism {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
}

.body--dark .glassmorphism {
  background: rgba(30, 30, 30, 0.8) !important;
  border-color: rgba(255,255,255,0.1);
}

.search-bar-card { height: 56px; max-width: 600px; margin: 0 auto; transition: all 0.3s ease; }

.fab-float-wrapper {
  position: absolute;
  bottom: 115px;
  left: 0;
  right: 0;
  max-width: 900px;
  margin: 0 auto;
  pointer-events: none;
  z-index: 1001;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  transition: all 0.3s;
}
.fab-fixed-btn { pointer-events: auto; }
.route-badge-chip { height: 30px; font-weight: 600; }

.google-bottom-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 32px 32px 0 0;
  transition: transform 0.5s cubic-bezier(0.1, 0.7, 0.1, 1);
  z-index: 2000;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.sheet--expanded { transform: translateY(0); height: 80vh; }
.sheet--minimized { transform: translateY(calc(90vh - 100px)); height: 90vh; }
.sheet-handle { width: 44px; height: 5px; background: #ccc; border-radius: 3px; display: block; margin: 0 auto; }
.body--dark .sheet-handle { background: #555; }

.sheet-content { height: calc(100% - 100px); overflow-y: auto; padding-top: 10px; }

.stop-card { background: rgba(255,255,255,0.5); transition: transform 0.2s; }
.body--dark .stop-card { background: rgba(0,0,0,0.3); }

.stop-card:hover { transform: scale(1.01); background: white; }
.body--dark .stop-card:hover { background: #1e1e1e; }

.active-tab-border { color: var(--q-primary) !important; font-weight: bold; border-bottom: 3px solid var(--q-primary); border-radius: 0; }
.rounded-borders-12 { border-radius: 12px; }
.rounded-borders-28 { border-radius: 28px; }
.border-light { border: 1px solid rgba(0,0,0,0.05); }
.body--dark .border-light { border-color: rgba(255,255,255,0.1); }

.primary-light { background: rgba(33, 150, 243, 0.1); }
.hide-scrollbar::-webkit-scrollbar { display: none; }

.minimal-input {
  background: rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s;
}
.body--dark .minimal-input {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.05);
}

.minimal-input:hover { background: rgba(0,0,0,0.06); }
.body--dark .minimal-input:hover { background: rgba(255,255,255,0.08); }

.minimal-input.q-field--focused {
  background: white;
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(33,150,243,0.1);
}
.body--dark .minimal-input.q-field--focused { background: #121212; }

.bg-white-translucent { background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); }
.body--dark .bg-white-translucent { background: rgba(0, 0, 0, 0.4); }

.stop-card-premium {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.body--dark .stop-card-premium { background: rgba(40, 40, 40, 0.6); }

.stop-card-premium:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}
.body--dark .stop-card-premium:hover { background: rgba(50, 50, 50, 0.9); }

.active-premium-tab {
  background: var(--q-primary) !important;
  color: white !important;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.inactive-premium-tab {
  background: rgba(0,0,0,0.03);
  color: #666;
  font-weight: 600;
}
.body--dark .inactive-premium-tab { background: rgba(255,255,255,0.05); color: #aaa; }

.active-route-item {
  background: var(--q-primary) !important;
  color: white !important;
  box-shadow: 0 10px 25px rgba(33, 150, 243, 0.4);
}

.stop-index-badge {
  width: 32px;
  height: 32px;
  background: white;
  color: var(--q-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  z-index: 2;
  border: 2px solid var(--q-primary);
}
.body--dark .stop-index-badge { background: #1e1e1e; }

.vertical-line {
  position: absolute;
  width: 2px;
  background: rgba(33, 150, 243, 0.2);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.top-line { height: 100%; top: -50%; }
.bottom-line { height: 100%; top: 50%; }

.border-radius-14 { border-radius: 14px; }
.border-radius-10 { border-radius: 10px; }
.border-radius-32 { border-radius: 32px; }
.rounded-borders-16 { border-radius: 16px; }
.rounded-borders-12 { border-radius: 12px; }
.line-height-1 { line-height: 1; }
.opacity-20 { opacity: 0.2; }
.tracking-widest { letter-spacing: 0.1em; }
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Cloning Card Styles */
.minimal-invoice-card {
  background: white;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.body--dark .minimal-invoice-card { background: #1e1e1e; border-color: #333; }

.minimal-invoice-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.body--dark .minimal-invoice-card:hover { border-color: #444; }

.minimal-invoice-card.is-selected {
  border-color: var(--q-primary);
  background-color: #f0f7ff;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}
.body--dark .minimal-invoice-card.is-selected { background-color: rgba(33, 150, 243, 0.1); border-color: var(--q-primary); }

.border-bottom-subtle { border-bottom: 1px solid #f1f5f9; }
.body--dark .border-bottom-subtle { border-color: #333; }

.last-no-border:last-child { border-bottom: none; }
.half-height-scroll { max-height: 50vh; overflow-y: auto; }
/* Enhanced Draggable Feedbacks */
.sortable-ghost {
  opacity: 0.3 !important;
  background: var(--q-primary) !important;
  border: 2px dashed var(--q-primary) !important;
  transform: scale(0.95);
}

.sortable-drag {
  opacity: 1 !important;
  transform: scale(1.05) rotate(2deg) !important;
  box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
}

.body--dark .sortable-drag {
  box-shadow: 0 15px 30px rgba(0,0,0,0.5) !important;
}

.sortable-chosen {
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
  border-radius: 16px;
}
.body--dark .sortable-chosen { background: #2a2a2a; }

.drag-handle {
  transition: color 0.2s;
}
.drag-handle:hover {
  color: var(--q-primary) !important;
}
</style>
