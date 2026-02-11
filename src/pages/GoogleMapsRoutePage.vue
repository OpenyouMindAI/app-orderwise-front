<template>
  <q-page class="google-maps-route-page overflow-hidden">
    <!-- Google Map Background -->
    <div ref="mapContainer" class="full-screen-map"></div>

    <!-- Floating Top Header: Search & Filter -->
    <div class="absolute-top q-pa-md search-container-group" style="z-index: 1000;">
      <!-- Search Bar -->
      <div class="row justify-center">
        <q-card class="search-bar-card col-12 glassmorphism blur-bg shadow-10 rounded-borders-28 row no-wrap items-center q-px-md">
          <q-btn flat round dense icon="menu" color="grey-8" class="q-mr-sm" @click="eventBus.emit('toggle-left-drawer')" />
          <q-input
            v-model="searchQuery"
            borderless
            dense
            placeholder="Buscar y agregar clientes..."
            class="col text-subtitle1"
            @focus="onSearchInput('')"
            @update:model-value="onSearchInput"
          >
            <template v-slot:append>
              <q-icon name="search" />
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
        <q-card-section class="q-pa-none bg-grey-1 q-px-md q-py-sm">
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
              <span class="text-caption text-grey-7 text-weight-bold">FECHA:</span>
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
                    <span class="text-subtitle2 text-weight-bold text-grey-9 ellipsis">{{ item.invoice?.client?.name }}</span>
                  </div>
                  <q-checkbox v-model="item.selected" color="primary" dense @click.stop />
                </div>

                <!-- Products Mini-list -->
                <div class="bg-grey-1 rounded-borders-12 q-pa-sm q-mb-sm border-subtle">
                  <div v-for="product in item.invoice?.products || []" :key="product.id" class="row items-center q-py-xs q-px-sm border-bottom-subtle last-no-border">
                    <div class="col text-caption text-grey-7 ellipsis text-left">{{ product.name }}</div>
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
                    </div>
                  </div>
                </div>

                <q-input
                  v-model="item.invoice.description"
                  dense
                  outlined
                  label="Observación"
                  bg-color="white"
                  class="q-mb-sm rounded-borders-12 overflow-hidden"
                  style="font-size: 0.8rem;"
                  rows="1"
                  type="textarea"
                  autogrow
                  @click.stop
                />

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
            <div class="column text-left">
              <span class="text-caption text-grey-6">Total a clonar</span>
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
          class="col border-radius-14"
          @click="activeTab = 'details'; sheetExpanded = true"
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
          :class="activeTab === 'deliveries' ? 'active-premium-tab' : 'inactive-premium-tab'"
          label="Entregas"
          class="col border-radius-14"
          @click="activeTab = 'deliveries'; loadHistoryRuns(); sheetExpanded = true"
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
                <div class="text-h6 text-weight-bolder text-grey-9 line-height-1 q-mb-xs">
                  {{ selectedRoute?.name || selectedRoute?.route_number || 'Sin ruta activa' }}
                </div>
                <q-btn unelevated color="positive" label="Guardar" @click="saveRouteChanges" :loading="saving">
                  <q-tooltip>Guardar cambios</q-tooltip>
                </q-btn>
              </div>
              <div class="row items-center text-caption text-grey-7 q-mt-sm">
                <q-icon name="place" size="14px" class="q-mr-xs" />
                <span>{{ (selectedRouteStops && selectedRouteStops.length) || 0 }} paradas</span>
                <q-separator vertical inset class="q-mx-sm" />
                <q-icon name="straighten" size="14px" class="q-mr-xs" />
                <span>{{ totalDistanceLabel }}</span>
                <q-separator vertical inset class="q-mx-sm" />
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                <span>{{ totalDurationLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Configuration Panel -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-ml-xs">Nombre de la ruta</div>
              <q-input
                v-model="routeForm.name"
                placeholder="Nombre de la ruta"
                borderless
                dense
                class="minimal-input q-px-md rounded-borders-12"
              />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-ml-xs">Repartidor</div>
              <q-select
                v-model="routeForm.courier"
                :options="couriers"
                option-label="name"
                borderless
                dense
                clearable
                class="minimal-input q-px-md rounded-borders-12"
              />
            </div>
            <div class="col-12 col-sm-4">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs q-ml-xs">
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
                @popup-show="loadPartners"
              />
            </div>
          </div>

          <div class="row items-center q-mb-md">
            <div class="text-subtitle2 text-weight-bolder text-grey-8">Clientes</div>
            <q-space />
            <div class="text-caption text-grey-6 uppercase tracking-widest">{{ selectedRouteStops.length }} paradas</div>
          </div>

          <!-- Stops List -->
          <div class="stops-list" v-if="selectedRouteStops.length">
            <draggable v-model="selectedRouteStops" item-key="id" handle=".drag-handle" @end="onStopsDragged">
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
                        <span class="text-weight-bolder text-subtitle2 text-grey-9">{{ stop.client?.name }}</span>
                      </div>
                      <span class="text-caption text-grey-6 ellipsis-2-lines">{{ getClientAddress(stop.client) }}</span>
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
                          color="grey-7"
                          :disable="index === 0"
                          @click.stop="moveStopUp(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="expand_more"
                          size="sm"
                          color="grey-7"
                          :disable="index === selectedRouteStops.length - 1"
                          @click.stop="moveStopDown(index)"
                        />
                      </div>

                      <q-btn
                        flat
                        round
                        dense
                        icon="edit_location"
                        color="primary"
                        class="bg-blue-1"
                        size="md"
                        @click.stop="editStopAddress(stop)"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        class="bg-red-1"
                        size="md"
                        @click.stop="removeStop(stop)"
                      />
                      <q-icon name="drag_indicator" class="drag-handle cursor-move q-ml-sm" color="grey-4" size="24px" />
                    </div>
                  </div>
                </q-card>
              </template>
            </draggable>
          </div>
          <div v-else class="column items-center justify-center q-pa-xl text-grey-5 bg-white-translucent rounded-borders-32 q-mt-md">
            <q-icon name="route" size="84px" class="q-mb-md opacity-20" />
            <div class="text-h6 text-weight-bold">Configura tu ruta</div>
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
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-5" />
              </template>
            </q-input>
          </div>
          <q-list>
            <q-item
              v-for="client in filteredAllClients"
              :key="client.id"
              class="stop-card-premium rounded-borders-28"
            >
              <q-item-section avatar>
                <q-avatar color="primary-light" text-color="primary" icon="person" class="shadow-1" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bolder text-grey-9 text-subtitle1">{{ client.name }}</q-item-label>
                <q-item-label caption class="ellipsis-2-lines">
                  {{ getClientAddress(client) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn unelevated round color="primary" icon="add" @click="addClientToRoute(client)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Tab: HISTORIAL (Entregas) -->
        <div v-else-if="activeTab === 'deliveries'" class="column full-height">
          <div class="row items-center justify-between q-mb-sm q-px-sm">
            <div class="row items-center justify-between full-width">
              <div class="text-subtitle1 text-weight-bold text-grey-8">
                Historial de Recorridos
              </div>
              <q-btn flat round color="primary" icon="refresh" @click="loadHistoryRuns" :loading="historyLoading" />
            </div>
          </div>

          <q-list class="scroll col q-pa-none" style="max-height: 60vh;">
            <q-item
              v-for="run in historyRuns"
              :key="run.id"
              class="stop-card-premium rounded-borders-28"
              clickable
              v-ripple
              @click="openHistoryClonePreview(run)"
            >
              <q-item-section avatar>
                <q-avatar color="indigo-1" text-color="indigo-7" icon="history" size="42px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bolder text-grey-9 text-subtitle1">
                  #{{ run.id }} • {{ run.courier?.name || run.delivery_person?.name || 'Sin repartidor' }}
                </q-item-label>
                <q-item-label caption class="row items-center q-gutter-x-sm">
                  <q-icon name="today" size="14px" />
                  <span>{{ formatDate(run.started_at || run.created_at) }}</span>
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
              <q-icon name="history" size="64px" color="grey-3" />
              <div class="text-grey-6 q-mt-md">No se encontraron rutas anteriores</div>
            </div>
          </q-list>

          <q-inner-loading :showing="historyLoading">
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
        </div>

        <!-- Tab: ROUTES LIST -->
        <div v-else-if="activeTab === 'routes'">
          <div class="row items-center justify-between q-mb-lg">
            <div class="column q-px-sm">
              <span class="text-h6 text-weight-bold text-grey-9">Gestión de Rutas</span>
              <span class="text-caption text-grey-6">Rutas activas y configuradas</span>
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
                  :class="selectedRoute?.id === route.id ? 'bg-primary' : 'bg-primary-light'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bolder text-subtitle1" :class="selectedRoute?.id === route.id ? 'text-white' : 'text-grey-9'">
                  {{ route.name || route.route_number || `Ruta #${route.id}` }}
                </q-item-label>
                <q-item-label caption :class="selectedRoute?.id === route.id ? 'text-blue-1' : 'text-grey-7'">
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
            <div class="text-h6 text-weight-bolder text-grey-9 line-height-1">
              Ubicación Incompleta
            </div>
            <div class="text-caption text-grey-6 ellipsis" style="max-width: 280px;">
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
    <q-dialog v-model="showCreateRouteModal" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 400px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.4);" class="glassmorphism blur-bg shadow-24 overflow-hidden">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-avatar size="42px" color="primary-light" text-color="primary" icon="add_road" class="q-mr-md" />
            <div class="column">
              <div class="text-h6 text-weight-bolder text-grey-9 line-height-1">Nueva Entrega</div>
              <div class="text-caption text-grey-6">Punto de partida y equipo</div>
            </div>
          </div>

          <div class="q-gutter-y-md q-mt-md">
            <q-input
              v-model="newRouteForm.name"
              label="Nombre de Ruta"
              dense
              borderless
              class="minimal-input q-px-sm rounded-borders-12"
              placeholder="Ej: Zona Norte"
            >
              <template v-slot:prepend>
                <q-icon name="edit" size="18px" color="grey-5" />
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
            >
              <template v-slot:prepend>
                <q-icon name="storefront" size="18px" color="grey-5" />
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
            >
              <template v-slot:prepend>
                <q-icon name="directions_bike" size="18px" color="grey-5" />
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
const map = ref(null)
const mapContainer = ref(null)
const searchQuery = ref('')
const allClientsSearch = ref('')
const showResults = ref(false)
const sheetExpanded = ref(false)
const activeTab = ref('details')
const activeRoutes = ref([])
const allClients = ref([])
const partners = ref([])
const clients = ref([]) // Search results
const selectedRoute = ref(null)
const selectedRouteStops = ref([])
const routeForm = ref({ name: '', courier: null, origin_branch: null, partner: null })
const couriers = ref([])
const branches = ref([])
const markers = new Map() // Use plain Map for Markers (no Proxy)
const courierMarkers = new Map()
const routeRenderer = ref(null)
const infoWindow = ref(null)
const touchState = { startY: 0, currentY: 0 }
const saving = ref(false)
const optimizing = ref(false)
let echoInstance = null

// History State
const historyRuns = ref([])
const historyLoading = ref(false)
const historyFilters = ref({
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

// Clone Detailed State
const showCloneDialog = ref(false)
const runToClone = ref(null)
const cloneItems = ref([])
const cloningInProgress = ref(false)
const cloneDeliveryDate = ref(new Date().toISOString().split('T')[0])

// Address Modal State
const showAddressModal = ref(false)
const clientWithoutAddress = ref(null)
const fixedAddress = ref(null)

// Create Route Modal State
const showCreateRouteModal = ref(false)
const newRouteForm = ref({
  name: '',
  origin_branch: null,
  courier: null,
  partner: null
})

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

/**
 * Format date to readable string
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
 * Loads history runs with filters
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
 * Open history clone preview (import clients from past run)
 */
function openHistoryClonePreview (run) {
  if (!selectedRoute.value) {
    return $q.notify({ message: 'Primero selecciona o crea una ruta para importar los clientes', color: 'warning', icon: 'info' })
  }

  $q.dialog({
    title: 'Importar Clientes',
    message: `¿Deseas importar los clientes de la ruta #${run.id} a la ruta actual "${selectedRoute.value.name}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Importar', color: 'primary', unelevated: true }
  }).onOk(async () => {
    $q.loading.show({ message: 'Importando clientes...' })
    try {
      const stops = run.items || run.stops || []
      const clientsToImport = stops
        .map(s => s.invoice?.client || s.client)
        .filter(c => !!c)

      if (clientsToImport.length === 0) {
        $q.notify({ message: 'Esta ruta no tiene clientes válidos para importar', color: 'warning' })
        return
      }

      // Add each client to the route
      for (const client of clientsToImport) {
        const coords = getClientCoords(client)
        if (coords) {
          await api.post(`/delivery-routes/${selectedRoute.value.id}/add-client`, {
            client_id: client.id,
            latitude: coords.lat,
            longitude: coords.lng
          })
        }
      }

      $q.notify({ message: `${clientsToImport.length} paradas importadas correctamente`, color: 'positive' })
      await loadActiveRuns()
      activeTab.value = 'details'
    } catch (e) {
      console.error(e)
      $q.notify({ message: 'Error al importar clientes', color: 'negative' })
    } finally {
      $q.loading.hide()
    }
  })
}

/**
 * Open detail clone preview (ported from Admin Monitor)
 */
function openClonePreview (run) {
  runToClone.value = run
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  cloneDeliveryDate.value = tomorrow.toISOString().split('T')[0]

  const clonedItems = JSON.parse(JSON.stringify(run.items || run.stops || []))

  cloneItems.value = clonedItems.map(item => {
    if (item.invoice && item.invoice.products) {
      item.invoice.products = item.invoice.products.map(p => {
        if (p.pivot && p.pivot.amount) p.pivot.amount = parseFloat(parseFloat(p.pivot.amount).toFixed(2))
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
 * Calculate invoice total (ported from Admin Monitor)
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
 * Confirm and execute cloning (ported from Admin Monitor)
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
      position: 'top'
    })

    showCloneDialog.value = false
    loadHistoryRuns()
    loadActiveRuns()
  } catch (error) {
    console.error('Error cloning run:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al clonar el recorrido',
      icon: 'error'
    })
  } finally {
    cloningInProgress.value = false
  }
}

/**
 * Computed
 */
const selectedCloneCount = computed(() => {
  return cloneItems.value.filter(item => item.selected).length
})

const calculateSelectedCloneTotal = computed(() => {
  return cloneItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + calculateInvoiceTotal(item.invoice), 0)
})

const filteredAllClients = computed(() => {
  if (!allClientsSearch.value) return allClients.value
  const q = allClientsSearch.value.toLowerCase()
  return allClients.value.filter(c => c.name.toLowerCase().includes(q))
})

const totalDistanceLabel = computed(() => {
  if (!selectedRouteStops.value) return '0 km'
  const val = selectedRouteStops.value.reduce((s, st) => s + (st.distance_value || 0), 0)
  return val >= 1000 ? `${(val / 1000).toFixed(1)} km` : `${val} m`
})

const totalDurationLabel = computed(() => {
  if (!selectedRouteStops.value) return '0 min'
  const val = selectedRouteStops.value.reduce((s, st) => s + (st.duration_value || 0), 0)
  const h = Math.floor(val / 3600)
  const m = Math.floor((val % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m} min`
})

/**
 * Helpers (Moved up for availability)
 */
const getClientCoords = (client) => {
  if (!client) return null
  const addr = typeof client.address === 'string' ? JSON.parse(client.address) : client.address
  const lat = addr?.latitude || client.latitude
  const lng = addr?.longitude || client.longitude
  return (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
}

const getBranchCoords = (branch) => {
  if (!branch) return null
  const addr = typeof branch.address === 'string' ? JSON.parse(branch.address) : branch.address
  return { lat: parseFloat(addr?.latitude || branch.latitude), lng: parseFloat(addr?.longitude || branch.longitude) }
}

const getClientAddress = (client) => {
  if (!client?.address) return 'Sin dirección'
  const addr = typeof client.address === 'string' ? JSON.parse(client.address) : client.address
  return addr?.formattedAddress || addr?.street || 'Sin dirección'
}

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

  // Deep reset of the route renderer
  if (routeRenderer.value) {
    routeRenderer.value.setDirections({ routes: [] })
    routeRenderer.value.setMap(null)
  }
}

const editStopAddress = (stop) => {
  clientWithoutAddress.value = stop.client
  showAddressModal.value = true
}

/**
 * Lifecycle
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

    // 4. Post-initialization
    initializeWebSocket()
  } catch (error) {
    console.error('Initialization error:', error)
  } finally {
    $q.loading.hide()
  }
})

onBeforeUnmount(() => {
  cleanupMarkers()
  if (echoInstance) echoInstance.leave('delivery-tracking')
})

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

async function loadAllClients () {
  if (allClients.value.length) return
  try {
    const { data } = await api.get('clients', { params: { onlyClients: true } })
    allClients.value = data.data || data
  } catch (e) { console.error(e) }
}

async function loadPartners () {
  if (partners.value.length) return
  try {
    const { data } = await api.get('partners')
    partners.value = data || []
  } catch (e) { console.error(e) }
}

async function loadPartnerClients (partner) {
  $q.loading.show({ message: `Cargando clientes de ${partner.name}...` })
  try {
    const { data } = await api.get('clients', { params: { partner_id: partner.id, onlyClients: true } })
    const partnerClients = data.data || data || []
    if (partnerClients.length === 0) {
      $q.notify({ message: 'Este afiliado no tiene clientes asociados', color: 'warning' })
      return
    }

    // Filter out already added
    const existingIds = selectedRouteStops.value.map(s => s.client_id)
    const newOnes = partnerClients.filter(c => !existingIds.includes(c.id))

    if (newOnes.length === 0) {
      $q.notify({ message: 'Todos los clientes ya están en la ruta', color: 'info' })
      return
    }

    $q.loading.show({ message: `Agregando ${newOnes.length} paradas...` })
    for (const client of newOnes) {
      const coords = getClientCoords(client)
      if (coords) {
        await api.post(`delivery-routes/${selectedRoute.value.id}/add-client`, {
          client_id: client.id,
          stop_order: selectedRouteStops.value.length + 1,
          latitude: coords.lat,
          longitude: coords.lng
        })
      }
    }
    await loadActiveRuns()
    activeTab.value = 'details'
    $q.notify({ message: `${newOnes.length} paradas agregadas correctamente`, color: 'positive' })
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Error al cargar clientes del afiliado', color: 'negative' })
  } finally {
    $q.loading.hide()
  }
}

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
 * Route Actions
 */
const addClientToRoute = (client) => {
  if (!selectedRoute.value) return $q.notify({ message: 'Primero selecciona una ruta', color: 'warning' })

  const coords = getClientCoords(client)
  if (!coords) {
    clientWithoutAddress.value = client
    fixedAddress.value = null
    showAddressModal.value = true
    return
  }

  performAddClient(client, coords)
}

async function performAddClient (client, coords) {
  $q.loading.show({ message: 'Agregando parada...' })
  try {
    await api.post(`/delivery-routes/${selectedRoute.value.id}/add-client`, {
      client_id: client.id,
      stop_order: selectedRouteStops.value.length + 1,
      latitude: coords.lat,
      longitude: coords.lng
    })
    $q.notify({ message: 'Parada agregada', color: 'positive' })
    await loadActiveRuns()
    activeTab.value = 'details'
  } finally {
    $q.loading.hide()
    showResults.value = false
  }
}

async function saveRouteChanges () {
  if (!selectedRoute.value) return
  saving.value = true
  try {
    const payload = {
      ...routeForm.value,
      courier_id: routeForm.value.courier?.id,
      origin_branch_id: routeForm.value.origin_branch?.id,
      partner_id: routeForm.value.partner?.id,
      clients: selectedRouteStops.value.map((s, i) => ({
        client_id: s.client_id,
        stop_order: i + 1,
        latitude: s.latitude,
        longitude: s.longitude
      }))
    }
    await api.patch(`/delivery-routes/${selectedRoute.value.id}`, payload)
    $q.notify({ message: 'Cambios guardados', color: 'positive' })
    await loadActiveRuns()
  } finally { saving.value = false }
}

async function createNewRoute () {
  newRouteForm.value = {
    name: 'Ruta #' + (activeRoutes.value.length + 1),
    origin_branch: branches.value[0] || null,
    courier: null,
    partner: null
  }
  showCreateRouteModal.value = true
}

async function submitNewRoute () {
  $q.loading.show({ message: 'Creando ruta...' })
  saving.value = true
  try {
    const payload = {
      name: newRouteForm.value.name,
      origin_branch_id: newRouteForm.value.origin_branch?.id,
      courier_id: newRouteForm.value.courier?.id,
      partner_id: newRouteForm.value.partner?.id
    }
    const { data } = await api.post('delivery-routes', payload)
    await loadActiveRuns()

    // Find the newly created route in the list to select it
    const tr = activeRoutes.value.find(r => r.id === data.id) || data
    selectRoute(tr)

    showCreateRouteModal.value = false
    activeTab.value = 'details'
    sheetExpanded.value = true

    $q.notify({ message: 'Ruta creada exitosamente', color: 'positive', icon: 'check' })
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Error al crear la ruta', color: 'negative' })
  } finally {
    saving.value = false
    $q.loading.hide()
  }
}

async function deleteFullRoute (route) {
  $q.dialog({ title: 'Confirmar', message: '¿Eliminar esta ruta por completo?', cancel: true, color: 'negative' })
    .onOk(async () => {
      await api.delete(`/delivery-routes/${route.id}`)
      if (selectedRoute.value?.id === route.id) selectedRoute.value = null
      await loadActiveRuns()
    })
}

async function removeStop (stop) {
  $q.loading.show()
  try {
    await api.delete(`/delivery-routes/${selectedRoute.value.id}/remove-stop/${stop.id}`)
    await loadActiveRuns()
  } finally { $q.loading.hide() }
}

const onStopsDragged = async () => {
  updateMapRoute()
  try {
    await api.post(`/delivery-routes/${selectedRoute.value.id}/stops/reorder`, {
      stops: selectedRouteStops.value.map((s, i) => ({ id: s.id, stop_order: i + 1 }))
    })
    $q.notify({ message: 'Orden actualizado', color: 'positive', position: 'bottom' })
  } catch (e) { console.error(e) }
}

async function optimizeRoute () {
  if (!selectedRoute.value || selectedRouteStops.value.length < 2) return
  optimizing.value = true
  try {
    await api.post(`/delivery-routes/${selectedRoute.value.id}/optimize`)
    $q.notify({ message: 'Ruta optimizada exitosamente', color: 'positive' })
    await loadActiveRuns()
  } catch (e) {
    console.error(e)
    $q.notify({ message: 'Error al optimizar ruta', color: 'negative' })
  } finally {
    optimizing.value = false
  }
}

/**
 * Reordering manual buttons
 */
const moveStopUp = (index) => {
  if (index === 0) return
  const item = selectedRouteStops.value.splice(index, 1)[0]
  selectedRouteStops.value.splice(index - 1, 0, item)
  onStopsDragged()
}

const moveStopDown = (index) => {
  if (index === selectedRouteStops.value.length - 1) return
  const item = selectedRouteStops.value.splice(index, 1)[0]
  selectedRouteStops.value.splice(index + 1, 0, item)
  onStopsDragged()
}

/**
 * Map Route Drawing (Optimized)
 */
const updateMapRoute = debounce(async () => {
  if (!map.value) return

  const routeIdAtStart = selectedRoute.value?.id
  cleanupMarkers()
  
  if (!routeRenderer.value && typeof google !== 'undefined') {
    routeRenderer.value = new google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#2196F3', strokeWeight: 5, strokeOpacity: 0.7 }
    })
  }
  
  if (routeRenderer.value) {
    routeRenderer.value.setMap(null) // Hide old route
  }

  if (!selectedRouteStops.value?.length) return

  if (!infoWindow.value && typeof google !== 'undefined') {
    infoWindow.value = new google.maps.InfoWindow()
  }

  const bounds = new google.maps.LatLngBounds()
  const directionsService = new google.maps.DirectionsService()

  // Origin
  const origin = getBranchCoords(routeForm.value.origin_branch) || { lat: -25.26, lng: -57.57 }
  bounds.extend(origin)

  // Create Markers
  selectedRouteStops.value.forEach((stop, i) => {
    const pos = { lat: parseFloat(stop.latitude), lng: parseFloat(stop.longitude) }
    if (pos.lat && pos.lng) {
      const marker = new google.maps.Marker({
        position: pos,
        map: map.value,
        label: { text: String(i + 1), color: 'white', fontWeight: 'bold' },
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#2196F3', fillOpacity: 1, strokeWeight: 2, strokeColor: '#fff' }
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

  // Draw Polyline
  // Filter valid stops for routing
  const validStops = selectedRouteStops.value.filter(s => {
    const lat = parseFloat(s.latitude)
    const lng = parseFloat(s.longitude)
    return !isNaN(lat) && !isNaN(lng)
  })

  if (validStops.length === 0) return

  const waypoints = validStops.slice(0, -1).map(s => ({
    location: { lat: parseFloat(s.latitude), lng: parseFloat(s.longitude) },
    stopover: true
  }))

  const dest = validStops[validStops.length - 1]

  try {
    const result = await directionsService.route({
      origin,
      destination: { lat: parseFloat(dest.latitude), lng: parseFloat(dest.longitude) },
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING
    })

    // RACE CONDITION CHECK: If route changed during async call, abort drawing
    if (selectedRoute.value?.id !== routeIdAtStart) return

    routeRenderer.value.setMap(map.value)
    routeRenderer.value.setDirections(result)

    // Update individual stop distances/durations from result
    result.routes[0].legs.forEach((leg, i) => {
      if (validStops[i]) {
        validStops[i].distance_text = leg.distance.text
        validStops[i].distance_value = leg.distance.value
        validStops[i].duration_value = leg.duration.value
      }
    })
  } catch (e) {
    console.warn('Polyline error:', e)
  }

  map.value.fitBounds(bounds)
}, 500)

/**
 * Address Fix Handlers
 */
const onAddressFixed = (addr) => { fixedAddress.value = addr }

const saveFixedAddress = async () => {
  try {
    if (!clientWithoutAddress.value || !fixedAddress.value) return
    await api.put(`clients/${clientWithoutAddress.value.id}`, {
      ...clientWithoutAddress.value,
      address: fixedAddress.value
    })
    showAddressModal.value = false
  } catch (error) {
    console.error('Error al guardar la dirección:', error)
    showAddressModal.value = false
  }
}

/**
 * UI Handlers
 */
const onSearchInput = async (v) => {
  try {
    const { data } = await api.get('clients', {
      params: {
        dataSearch: {
          name: v,
          document_number: v
        },
        onlyClients: true,
        paginated: true,
        perPage: 10,
        page: 1
      }
    })
    clients.value = data.data
    showResults.value = true
  } catch (error) {
    console.log(error)
  }
}

const onTouchStart = (e) => { touchState.startY = e.touches[0].clientY }

const onTouchMove = (e) => {
  touchState.currentY = e.touches[0].clientY
  const d = touchState.startY - touchState.currentY
  if (d > 60 && !sheetExpanded.value) sheetExpanded.value = true
  else if (d < -60 && sheetExpanded.value) sheetExpanded.value = false
}
const onTouchEnd = () => {}

const toggleSheet = () => sheetExpanded.value = !sheetExpanded.value

const initializeWebSocket = () => {
  const inst = getCurrentInstance()
  echoInstance = inst?.appContext.config.globalProperties.$echo
  if (!echoInstance) return
  echoInstance.channel('delivery-tracking').listen('.DeliveryLocationUpdated', (e) => {
    if (!selectedRoute.value || e.delivery_run_id !== selectedRoute.value.id) return
    
    let m = courierMarkers.get(e.delivery_run_id)
    const p = { lat: parseFloat(e.latitude), lng: parseFloat(e.longitude) }
    if (!m) {
      if (!map.value) return
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
      courierMarkers.set(e.delivery_run_id, m)
    } else m.setPosition(p)
  })
}
</script>

<style scoped>
.google-maps-route-page { position: relative; height: 100vh; overflow: hidden; background: #eee; }
.full-screen-map { width: 100%; height: 100%; }
.glassmorphism { background: rgba(255, 255, 255, 0.8) !important; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); }
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
.google-bottom-sheet { position: absolute; bottom: 0; left: 0; right: 0; border-radius: 32px 32px 0 0; transition: transform 0.5s cubic-bezier(0.1, 0.7, 0.1, 1); z-index: 2000; max-width: 900px; margin: 0 auto; width: 100%; }
.sheet--expanded { transform: translateY(0); height: 80vh; }
.sheet--minimized { transform: translateY(calc(90vh - 100px)); height: 90vh; }
.sheet-handle { width: 44px; height: 5px; background: #ccc; border-radius: 3px; display: block; margin: 0 auto; }
.sheet-content { height: calc(100% - 100px); overflow-y: auto; padding-top: 10px; }
.stop-card { background: rgba(255,255,255,0.5); transition: transform 0.2s; }
.stop-card:hover { transform: scale(1.01); background: white; }
.active-tab-border { color: var(--q-primary) !important; font-weight: bold; border-bottom: 3px solid var(--q-primary); border-radius: 0; }
.rounded-borders-12 { border-radius: 12px; }
.rounded-borders-28 { border-radius: 28px; }
.border-light { border: 1px solid rgba(0,0,0,0.05); }
.primary-light { background: rgba(33, 150, 243, 0.1); }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.minimal-input { background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.03); transition: all 0.3s; }
.minimal-input:hover { background: rgba(0,0,0,0.06); }
.minimal-input.q-field--focused { background: white; border-color: var(--q-primary); box-shadow: 0 4px 12px rgba(33,150,243,0.1); }

.bg-white-translucent { background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(255, 255, 255, 0.2); }

.stop-card-premium {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.stop-card-premium:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

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
.minimal-invoice-card:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.minimal-invoice-card.is-selected {
  border-color: var(--q-primary);
  background-color: #f0f7ff;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}
.border-bottom-subtle { border-bottom: 1px solid #f1f5f9; }
.last-no-border:last-child { border-bottom: none; }
.half-height-scroll { max-height: 50vh; overflow-y: auto; }
</style>
