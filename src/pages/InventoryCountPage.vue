<template>
  <q-page class="flex" padding>
    <!-- Loading overlay -->
    <q-inner-loading :showing="isLoading" color="primary" />

    <div style="width: 100%;" class="column">
      <!-- Header -->
      <div class="text-center">
        <div class="text-h5 text-weight-bold q-my-md text-grey-8">
          Sistema de Conteo
        </div>
        <p class="text-body1 text-grey-6">
          Gestiona tu inventario de forma rápida y eficiente
        </p>
      </div>

      <!-- Count Status Banner -->
      <q-banner v-if="currentCount.id" :class="`q-mb-md ${currentCount.status === 'active' ? 'bg-primary text-white' : 'bg-grey-4'}`">
        <template v-slot:avatar>
          <q-icon :name="currentCount.status === 'active' ? 'inventory' : 'inventory_2'" />
        </template>
        <div>
          <div class="text-weight-bold">
            {{ currentCount.status === 'active' ? 'Conteo Activo' : 'Último Conteo Cerrado' }}
          </div>
          <div class="text-caption">
            Iniciado: {{ formatDate(currentCount.created_at) }}
            <span v-if="currentCount.status === 'closed'"> - Cerrado: {{ formatDate(currentCount.updated_at) }}</span>
          </div>
          <div v-if="currentCount.status === 'closed'" class="text-caption">
            Productos contados: {{ lastCountProductsCount }}
          </div>
        </div>
        <template v-slot:action>
          <q-btn
            v-if="currentCount.status === 'active'"
            flat
            color="white"
            label="Ver detalles"
            @click="activeTab = 'count'"
          />
          <q-btn
            v-else
            flat
            color="grey-8"
            label="Ver último conteo"
            @click="viewLastCount"
          />
        </template>
      </q-banner>

      <!-- No Count State -->
      <q-banner v-if="!currentCount.id" class="q-mb-md bg-info text-white">
        <template v-slot:avatar>
          <q-icon name="info" />
        </template>
        No hay conteos registrados. Inicia tu primer conteo para comenzar.
      </q-banner>

      <!-- Action Buttons -->
      <div :class="`row q-gutter-md q-mb-lg ${$q.screen.lt.sm ? 'column' : ''}`">
        <q-btn
          unelevated
          rounded
          color="primary"
          icon="add_circle"
          :label="getStartCountButtonLabel()"
          :class="`${$q.screen.lt.sm ? 'full-width' : 'col'} text-h6 q-py-md`"
          @click="handleStartCount"
          :disable="currentCount.status === 'active'"
          :loading="loadingActions.includes('startCount')"
        />
        <q-btn
          v-if="currentCount.id && currentCount.status === 'active'"
          unelevated
          rounded
          color="negative"
          icon="close"
          label="Cerrar Conteo"
          :class="`${$q.screen.lt.sm ? 'full-width' : 'col-auto'} text-h6 q-py-md`"
          @click="confirmCloseCount"
          :loading="loadingActions.includes('closeCount')"
        />
      </div>

      <!-- Navigation Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="count" label="Conteo" icon="inventory_2" />
        <q-tab name="reports" label="Reportes" icon="assessment" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Count Panel -->
        <q-tab-panel name="count" class="q-pa-md">
          <!-- Empty State for Active Count -->
          <div v-if="currentCount.status === 'active' && scannedProducts.length === 0" class="column items-center q-pa-xl text-center">
            <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-lg" />
            <div class="text-h6 text-grey-6 q-mb-sm">Conteo activo sin productos</div>
            <p class="text-body2 text-grey-5 q-mb-xl">Comienza escaneando productos para este conteo</p>
            <q-btn
              unelevated
              color="primary"
              icon="qr_code_scanner"
              label="Escanear Producto"
              size="lg"
              class="q-px-xl q-py-sm"
              @click="openCountDialog"
            />
          </div>

          <!-- Empty State for No Active Count -->
          <div v-else-if="currentCount.status !== 'active'" class="column items-center q-pa-xl text-center">
            <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-lg" />
            <div class="text-h6 text-grey-6 q-mb-sm">
              {{ currentCount.id ? 'Último conteo cerrado' : 'No hay conteos activos' }}
            </div>
            <p class="text-body2 text-grey-5 q-mb-xl">
              {{ currentCount.id ? 'Inicia un nuevo conteo para continuar' : 'Comienza tu primer conteo de inventario' }}
            </p>
            <q-btn
              unelevated
              color="primary"
              icon="add_circle"
              :label="currentCount.id ? 'Nuevo Conteo' : 'Iniciar Primer Conteo'"
              size="lg"
              class="q-px-xl q-py-sm"
              @click="handleStartCount"
              :loading="loadingActions.includes('startCount')"
            />
          </div>

          <!-- Stats Cards -->
          <div v-if="currentCount.status === 'active' && scannedProducts.length > 0" class="row q-gutter-md q-mb-lg">
            <div class="col">
              <q-card class="text-center q-pa-lg bg-positive text-white" flat>
                <div class="text-h4 text-weight-bold q-mb-xs">{{ totalProducts }}</div>
                <div class="text-body2 text-weight-medium">Productos Únicos</div>
              </q-card>
            </div>
            <div class="col">
              <q-card class="text-center q-pa-lg bg-info text-white" flat>
                <div class="text-h4 text-weight-bold q-mb-xs">{{ totalQuantity }}</div>
                <div class="text-body2 text-weight-medium">Cantidad Total</div>
              </q-card>
            </div>
          </div>

          <!-- Products List -->
          <q-card v-if="currentCount.status === 'active' && scannedProducts.length > 0" flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-weight-medium q-mb-md">
                <q-icon name="list" class="q-mr-sm" />
                Productos Escaneados
              </div>
            </q-card-section>

            <q-separator />

            <q-list separator class="q-pa-none">
              <q-item v-for="product in scannedProducts" :key="product.id" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="md">
                    <q-icon name="inventory_2" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">{{ product.product?.name }}</q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    {{ product.product?.barcode }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="q-mt-xs">
                    <span class="text-grey-7">Stock: {{ product.current_stock }}</span>
                    <span class="q-mx-sm">•</span>
                    <span class="text-grey-7">Contado: {{ product.quantity }}</span>
                    <span :class="getDeviationTextClass(product)" class="q-ml-sm text-weight-medium">
                      ({{ getDeviationText(product) }})
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="column items-end q-gutter-sm">
                    <q-chip color="primary" text-color="white" icon="tag" class="text-weight-bold">
                      {{ product.quantity }}
                    </q-chip>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="editProduct(product)"
                    >
                      <q-tooltip>Editar cantidad</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- Last Count Products (when viewing closed count) -->
          <q-card v-if="showingLastCount && lastCountProducts.length > 0" flat bordered class="q-mt-lg">
            <q-card-section class="q-pb-sm">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="history" class="q-mr-sm" />
                  Productos del Último Conteo
                </div>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  icon="close"
                  size="sm"
                  @click="hideLastCount"
                >
                  <q-tooltip>Ocultar</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>

            <q-separator />

            <q-list separator class="q-pa-none">
              <q-item v-for="product in lastCountProducts" :key="product.id" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar color="grey-6" text-color="white" size="md">
                    <q-icon name="inventory_2" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">{{ product.product?.name }}</q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    {{ product.product?.barcode }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="q-mt-xs">
                    <span class="text-grey-7">Stock: {{ product.current_stock }}</span>
                    <span class="q-mx-sm">•</span>
                    <span class="text-grey-7">Contado: {{ product.quantity }}</span>
                    <span :class="getDeviationTextClass(product)" class="q-ml-sm text-weight-medium">
                      ({{ getDeviationText(product) }})
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip color="grey-6" text-color="white" icon="tag" class="text-weight-bold">
                    {{ product.quantity }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-tab-panel>

        <!-- Reports Panel -->
        <q-tab-panel name="reports" class="q-pa-md">
          <!-- Empty State -->
          <div v-if="reports.length === 0 && !reportFiltersApplied" class="column items-center q-pa-xl text-center">
            <q-icon name="assessment" size="4rem" color="grey-4" class="q-mb-md" />
            <div class="text-h6 text-grey-6 q-mb-sm">No hay reportes disponibles</div>
            <p class="text-body2 text-grey-5 q-mb-lg">Aplica filtros para buscar reportes de conteo</p>
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Mostrar Filtros"
              @click="showReportFilters = true"
              v-if="!showReportFilters"
            />
          </div>

          <!-- Report Filters Card -->
          <q-card class="q-mb-lg" flat bordered>
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="filter_list" class="q-mr-sm" />
                  Filtros de Búsqueda
                </div>
                <q-btn
                  flat
                  round
                  :icon="showReportFilters ? 'expand_less' : 'expand_more'"
                  @click="showReportFilters = !showReportFilters"
                  color="grey-7"
                />
              </div>
            </q-card-section>

            <q-slide-transition>
              <q-card-section v-show="showReportFilters" class="q-pt-sm">
                <div class="row q-gutter-md q-mb-md">
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      v-model="reportFilters.startDate"
                      type="date"
                      label="Fecha Inicio"
                      outlined
                      dense
                      clearable
                      class="full-width"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <q-input
                      v-model="reportFilters.endDate"
                      type="date"
                      label="Fecha Fin"
                      outlined
                      dense
                      clearable
                      class="full-width"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                    </q-input>
                  </div>
                  <div v-if="userSession.is_root" class="col-12 col-sm-12 col-md-4">
                    <q-select
                      v-model="reportFilters.userId"
                      :options="userOptions"
                      option-value="id"
                      option-label="name"
                      label="Usuario"
                      outlined
                      dense
                      clearable
                      emit-value
                      map-options
                      class="full-width"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-select>
                  </div>
                </div>

                <div class="row q-gutter-sm justify-end">
                  <q-btn
                    unelevated
                    color="primary"
                    icon="search"
                    label="Buscar Reportes"
                    @click="loadReports"
                    :loading="loadingActions.includes('loadReports')"
                    class="q-px-lg"
                  />
                  <q-btn
                    outline
                    color="grey-7"
                    icon="refresh"
                    label="Limpiar"
                    @click="resetReportFilters"
                    class="q-px-lg"
                  />
                  <q-btn
                    flat
                    color="grey-7"
                    icon="expand_less"
                    label="Ocultar"
                    @click="showReportFilters = false"
                    class="q-px-lg"
                  />
                </div>
              </q-card-section>
            </q-slide-transition>
          </q-card>

          <!-- Quick Filter Chips -->
          <div v-if="!showReportFilters && reportFiltersApplied" class="row q-gutter-sm q-mb-lg items-center">
            <div class="text-body2 text-grey-6">Filtros activos:</div>
            <q-chip
              v-if="reportFilters.startDate"
              removable
              @remove="reportFilters.startDate = ''"
              color="primary"
              text-color="white"
              icon="event"
            >
              Desde: {{ formatDate(reportFilters.startDate) }}
            </q-chip>
            <q-chip
              v-if="reportFilters.endDate"
              removable
              @remove="reportFilters.endDate = ''"
              color="primary"
              text-color="white"
              icon="event"
            >
              Hasta: {{ formatDate(reportFilters.endDate) }}
            </q-chip>
            <q-chip
              v-if="reportFilters.userId"
              removable
              @remove="reportFilters.userId = null"
              color="info"
              text-color="white"
              icon="person"
            >
              {{ userOptions.find(u => u.id === reportFilters.userId)?.name }}
            </q-chip>
            <q-btn
              flat
              dense
              color="grey-7"
              icon="filter_list"
              label="Mostrar filtros"
              @click="showReportFilters = true"
              size="sm"
            />
          </div>

          <!-- Reports List -->
          <q-card v-if="reports.length > 0" flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="assessment" class="q-mr-sm" />
                  Reportes de Conteo
                </div>
                <q-badge color="primary" class="text-weight-bold">
                  {{ reports.length }} {{ reports.length === 1 ? 'reporte' : 'reportes' }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <q-list separator class="q-pa-none">
              <q-item
                v-for="report in reports"
                :key="report.id"
                clickable
                @click="viewReportDetail(report)"
                class="q-pa-md"
              >
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" size="md">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">
                    {{ report.user?.name || 'Usuario' }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    {{ formatDate(report.created_at) }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="q-mt-xs">
                    <div class="row q-gutter-sm">
                      <q-chip size="sm" color="positive" text-color="white" icon="trending_up">
                        {{ report.positive_deviations || 0 }}
                      </q-chip>
                      <q-chip size="sm" color="negative" text-color="white" icon="trending_down">
                        {{ report.negative_deviations || 0 }}
                      </q-chip>
                    </div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Count Dialog -->
    <q-dialog v-model="showCountDialog" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Conteo de Productos</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="manualBarcode"
            label="Código de Barras"
            outlined
            dense
            class="q-mb-md"
            hint="Ingresa el código manualmente o usa el scanner"
            @keyup.enter="getOneProduct(manualBarcode)"
            ref="barcodeInput"
            :loading="loadingActions.includes('getProduct')"
          >
            <template v-slot:append>
              <q-icon name="qr_code_scanner" />
            </template>
          </q-input>

          <q-btn
            unelevated
            color="secondary"
            icon="qr_code_scanner"
            label="Abrir Scanner"
            class="full-width q-py-md"
            @click="openScanner"
            v-if="$q.platform.is.nativeMobile"
            :loading="loadingActions.includes('openScanner')"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Procesar Código"
            color="primary"
            @click="getOneProduct(manualBarcode)"
            :disable="!manualBarcode"
            :loading="loadingActions.includes('getProduct')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Scanner Dialog -->
    <q-dialog v-model="showScanner" persistent>
      <q-card style="min-width: 350px; max-width: 500px; width: 90vw;">
        <q-card-section class="bg-white">
          <div class="text-h6 text-center q-mb-md" :class="isEditing ? 'text-warning' : 'text-positive'">
            {{ isEditing ? '¡Editando Producto!' : '¡Código Detectado!' }}
          </div>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">{{ currentProduct.name }}</div>
            <div class="text-caption text-grey-6">{{ currentProduct.barcode }}</div>
            <div v-if="existingProductCount" class="text-caption text-orange q-mt-sm">
              <q-icon name="warning" />
              Producto ya contado. Cantidad actual: {{ existingProductCount.quantity }}
            </div>
          </q-card-section>
          <q-input
            v-model.number="currentQuantity"
            type="number"
            label="Cantidad"
            outlined
            dense
            min="1"
            :rules="[val => val >= 1 || 'La cantidad debe ser mayor a 0']"
          />

          <div class="row q-gutter-md q-mt-sm justify-center">
            <q-btn
              unelevated
              flat
              round
              color="negative"
              icon="remove"
              size="lg"
              @click="currentQuantity = Math.max(1, currentQuantity - 1)"
            />
            <div class="text-h6 q-px-md">{{ currentQuantity }}</div>
            <q-btn
              flat
              round
              unelevated
              size="lg"
              icon="add"
              color="positive"
              @click="currentQuantity += 1"
            />
          </div>

          <div class="row q-gutter-md q-mt-sm">
            <q-btn
              outline
              color="grey"
              icon="refresh"
              label="Nuevo Escaneo"
              class="col"
              @click="openScanner"
              v-if="!isEditing"
              :loading="loadingActions.includes('openScanner')"
            />
            <q-btn
              outline
              color="grey"
              icon="close"
              label="Cancelar"
              class="col"
              @click="closeScanner"
              v-if="isEditing"
            />
            <q-btn
              unelevated
              :color="isEditing ? 'warning' : 'positive'"
              icon="check"
              :label="isEditing ? 'Actualizar' : 'Confirmar'"
              class="col"
              @click="confirmProduct"
              :loading="loadingActions.includes('confirmProduct')"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Report Detail Dialog -->
    <q-dialog v-model="showReportDetail" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none bg-grey-1">
          <div class="text-h6 text-weight-medium">Detalle del Conteo</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- Report Info -->
          <q-card flat bordered class="q-mb-lg">
            <q-card-section class="q-pa-lg">
              <div class="row q-gutter-lg">
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey-6 q-mb-xs">Usuario</div>
                  <div class="text-h6 text-weight-medium">{{ selectedReport?.user?.name }}</div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="text-caption text-grey-6 q-mb-xs">Fecha de Conteo</div>
                  <div class="text-h6 text-weight-medium">{{ formatDate(selectedReport?.created_at) }}</div>
                </div>
                <div class="col-12 col-sm-4" v-if="userSession.is_root">
                  <div class="text-caption text-grey-6 q-mb-xs">Desviaciones</div>
                  <div class="row q-gutter-sm">
                    <q-chip color="positive" text-color="white" icon="trending_up">
                      +{{ selectedReport?.positive_deviations || 0 }}
                    </q-chip>
                    <q-chip color="negative" text-color="white" icon="trending_down">
                      -{{ selectedReport?.negative_deviations || 0 }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Detail Filters -->
          <q-card flat bordered class="q-mb-lg" v-if="userSession.is_root">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="tune" class="q-mr-sm" />
                  Filtros de Detalle
                </div>
                <q-btn
                  flat
                  round
                  :icon="showDetailFilters ? 'expand_less' : 'expand_more'"
                  @click="showDetailFilters = !showDetailFilters"
                  color="grey-7"
                />
              </div>
            </q-card-section>

            <q-slide-transition>
              <q-card-section v-show="showDetailFilters" class="q-pt-sm">
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-select
                      v-model="detailFilters.deviationType"
                      :options="deviationOptions"
                      label="Tipo de Desviación"
                      outlined
                      dense
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="trending_up" />
                      </template>
                    </q-select>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="detailFilters.productName"
                      label="Nombre del Producto"
                      outlined
                      dense
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="inventory_2" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="detailFilters.barcode"
                      label="Código de Barras"
                      outlined
                      dense
                      clearable
                    >
                      <template v-slot:prepend>
                        <q-icon name="qr_code" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-slide-transition>
          </q-card>

          <!-- Products Detail List -->
          <q-card flat bordered>
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-weight-medium">
                <q-icon name="list" class="q-mr-sm" />
                Productos del Conteo
                <q-badge color="primary" class="q-ml-sm">{{ filteredReportProducts.length }}</q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <q-list separator class="q-pa-none">
              <q-item v-for="product in filteredReportProducts" :key="product.id" class="q-pa-md">
                <q-item-section avatar>
                  <q-avatar
                    :color="getDeviationColor(product)"
                    text-color="white"
                    size="md"
                  >
                    <q-icon :name="getDeviationIcon(product)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">{{ product.product?.name }}</q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    {{ product.product?.barcode }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="q-mt-xs">
                    <span class="text-grey-7">Stock: {{ product.current_stock }}</span>
                    <span class="q-mx-sm">•</span>
                    <span class="text-grey-7">Contado: {{ product.quantity }}</span>
                    <span :class="getDeviationTextClass(product)" class="q-ml-sm text-weight-medium">
                      ({{ getDeviationText(product) }})
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    :color="userSession.is_root ? getDeviationColor(product) : 'primary'"
                    text-color="white"
                    icon="tag"
                    class="text-weight-bold"
                  >
                    {{ product.quantity }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Success notification -->
    <q-dialog v-model="showSuccess">
      <q-card style="min-width: 300px;">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="3rem" color="positive" class="q-mb-md" />
          <div class="text-h6 text-positive">
            {{ isEditing ? '¡Producto Actualizado!' : '¡Producto Agregado!' }}
          </div>
          <div class="text-body2 q-mt-sm">
            {{ currentProduct.product?.name }} - Cantidad: {{ currentQuantity }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn flat label="Continuar" color="positive" v-close-popup @click="showCountDialog = true" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Close Count Dialog -->
    <q-dialog v-model="showConfirmCloseDialog" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro que deseas cerrar este conteo?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Cerrar" color="negative" @click="closeCount" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Count Confirmation Dialog -->
    <q-dialog v-model="showNewCountDialog" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section class="row items-center">
          <q-avatar icon="add_circle" color="primary" text-color="white" />
          <span class="q-ml-sm">¿Deseas iniciar un nuevo conteo de inventario?</span>
        </q-card-section>
        <q-card-section v-if="currentCount.id && currentCount.status === 'closed'">
          <div class="text-caption text-grey-6">
            Tu último conteo fue cerrado el {{ formatDate(currentCount.updated_at) }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Iniciar" color="primary" @click="createNewCount" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { notify } from 'src/const/mixins'
import { api } from 'src/boot/axios'
import { authentication } from 'src/stores/module-authentication'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'

const $q = useQuasar()

// Reactive data
const activeTab = ref('count')
const showCountDialog = ref(false)
const showScanner = ref(false)
const showSuccess = ref(false)
const showReportDetail = ref(false)
const showConfirmCloseDialog = ref(false)
const showNewCountDialog = ref(false)
const showingLastCount = ref(false)
const manualBarcode = ref('')
const currentQuantity = ref(1)
const scannedProducts = ref([])
const lastCountProducts = ref([])
const lastCountProductsCount = ref(0)
const reports = ref([])
const selectedReport = ref(null)
const reportProducts = ref([])
const userOptions = ref([])
const isEditing = ref(false)
const editingProductId = ref(null)
const existingProductCount = ref(null)
const isLoading = ref(false)
const loadingActions = ref([])
const barcodeInput = ref(null)
const showReportFilters = ref(false)
const showDetailFilters = ref(false)

const store = authentication()
const branchOffice = store.branchOffice
const userSession = store.userSession
const currentProduct = ref({})
const currentCount = ref({})

// Filters
const reportFilters = ref({
  startDate: new Date().toISOString().split('T')[0], // Today's date
  endDate: new Date().toISOString().split('T')[0], // Today's date
  userId: null
})

const detailFilters = ref({
  deviationType: null,
  productName: '',
  barcode: ''
})

const deviationOptions = [
  { label: 'Desviaciones Positivas', value: 'positive' },
  { label: 'Desviaciones Negativas', value: 'negative' },
  { label: 'Sin Desviaciones', value: 'none' }
]

// Computed properties
const totalProducts = computed(() => scannedProducts.value.length)
const totalQuantity = computed(() => scannedProducts.value.reduce((sum, product) => sum + product.quantity, 0))
const reportFiltersApplied = computed(() => {
  return reportFilters.value.startDate || reportFilters.value.endDate || reportFilters.value.userId
})

const filteredReportProducts = computed(() => {
  let filtered = reportProducts.value

  if (detailFilters.value.deviationType) {
    filtered = filtered.filter(product => {
      const deviation = product.quantity - product.current_stock
      if (detailFilters.value.deviationType === 'positive') return deviation > 0
      if (detailFilters.value.deviationType === 'negative') return deviation < 0
      if (detailFilters.value.deviationType === 'none') return deviation === 0
      return true
    })
  }

  if (detailFilters.value.productName) {
    filtered = filtered.filter(product =>
      product.product?.name?.toLowerCase().includes(detailFilters.value.productName.toLowerCase())
    )
  }

  if (detailFilters.value.barcode) {
    filtered = filtered.filter(product =>
      product.product?.barcode?.includes(detailFilters.value.barcode)
    )
  }

  return filtered
})

// Watchers
watch(currentQuantity, (val) => {
  if (val < 1) {
    currentQuantity.value = 1
  }
})

watch(showCountDialog, (val) => {
  if (val) {
    nextTick(() => {
      barcodeInput.value?.focus()
    })
  }
})

// Lifecycle hooks
onMounted(() => {
  initializeComponent()
})

// Methods
const initializeComponent = async () => {
  try {
    isLoading.value = true
    await loadCurrentCount()
    if (currentCount.value.id && currentCount.value.status === 'active') {
      await getCountProducts()
    }
    if (userSession.is_root) {
      await loadUsers()
    }
  } catch (error) {
    handleError(error, 'Error al inicializar el componente')
  } finally {
    isLoading.value = false
  }
}

const loadCurrentCount = async () => {
  try {
    startLoading('loadCurrentCount')

    // First, try to get the latest count from the server
    const { data } = await api.get('counts', {
      params: {
        dataEqualFilter: {
          user_id: userSession.id,
          branch_office_id: branchOffice?.id
        },
        orderBy: 'created_at',
        orderDirection: 'desc',
        limit: 1
      }
    })

    if (data && data.length > 0) {
      const serverCount = data[0]
      currentCount.value = serverCount

      // Update localStorage with server data
      localStorage.setItem('currentCount', JSON.stringify(serverCount))

      // If it's a closed count, get the products count
      if (serverCount.status === 'closed') {
        await getLastCountProductsCount(serverCount.id)
      }
    } else {
      // No count found on server, check localStorage
      const localCount = localStorage.getItem('currentCount')
      if (localCount) {
        currentCount.value = JSON.parse(localCount)
        // Verify this count still exists on server
        try {
          await api.get(`counts/${currentCount.value.id}`)
        } catch (error) {
          // Count doesn't exist on server, clear localStorage
          localStorage.removeItem('currentCount')
          currentCount.value = {}
        }
      }
    }
  } catch (error) {
    handleError(error, 'Error al cargar el conteo actual')
  } finally {
    stopLoading('loadCurrentCount')
  }
}

const getLastCountProductsCount = async (countId) => {
  try {
    const { data } = await api.get('product-counts', {
      params: {
        dataEqualFilter: { count_id: countId },
        count: true
      }
    })
    lastCountProductsCount.value = data.length || 0
  } catch (error) {
    console.error('Error getting last count products count:', error)
  }
}

const loadUsers = async () => {
  try {
    startLoading('loadUsers')
    const { data } = await api.get('users')
    userOptions.value = data
  } catch (error) {
    handleError(error, 'Error al cargar usuarios')
  } finally {
    stopLoading('loadUsers')
  }
}

const getStartCountButtonLabel = () => {
  if (!currentCount.value.id) {
    return 'Iniciar Primer Conteo'
  }
  if (currentCount.value.status === 'active') {
    return 'Conteo Activo'
  }
  return 'Nuevo Conteo'
}

const handleStartCount = () => {
  if (currentCount.value.status === 'active') {
    notify('Ya tienes un conteo activo', 'warning', 'warning')
    return
  }

  if (currentCount.value.id && currentCount.value.status === 'closed') {
    showNewCountDialog.value = true
  } else {
    createNewCount()
  }
}

const createNewCount = async () => {
  try {
    startLoading('startCount')
    showNewCountDialog.value = false

    const { data } = await api.post('counts', {
      branch_office_id: branchOffice?.id,
      user_id: userSession.id,
      status: 'active'
    })

    currentCount.value = data
    localStorage.setItem('currentCount', JSON.stringify(data))
    scannedProducts.value = []
    showingLastCount.value = false

    notify('Nuevo conteo iniciado exitosamente', 'positive', 'check')
    openCountDialog()
  } catch (error) {
    handleError(error, 'Error al crear nuevo conteo')
  } finally {
    stopLoading('startCount')
  }
}

const openCountDialog = () => {
  if (currentCount.value.status !== 'active') {
    notify('No hay un conteo activo', 'negative', 'warning')
    return
  }

  showCountDialog.value = true
  manualBarcode.value = ''
}

const confirmCloseCount = () => {
  showConfirmCloseDialog.value = true
}

const closeCount = async () => {
  try {
    startLoading('closeCount')
    showConfirmCloseDialog.value = false

    const { data } = await api.put(`counts/${currentCount.value.id}`, {
      status: 'closed',
      ...currentCount.value
    })

    currentCount.value = { ...currentCount.value, ...data, status: 'closed' }
    localStorage.setItem('currentCount', JSON.stringify(currentCount.value))
    await getLastCountProductsCount(currentCount.value.id)

    notify('Conteo cerrado exitosamente', 'positive', 'check')
  } catch (error) {
    handleError(error, 'Error al cerrar el conteo')
  } finally {
    stopLoading('closeCount')
  }
}

const viewLastCount = async () => {
  if (!currentCount.value.id || currentCount.value.status === 'active') {
    return
  }

  try {
    startLoading('viewLastCount')
    const { data } = await api.get('product-counts', {
      params: {
        dataEqualFilter: { count_id: currentCount.value.id }
      }
    })
    lastCountProducts.value = data
    showingLastCount.value = true
    activeTab.value = 'count'
  } catch (error) {
    handleError(error, 'Error al cargar el último conteo')
  } finally {
    stopLoading('viewLastCount')
  }
}

const hideLastCount = () => {
  showingLastCount.value = false
  lastCountProducts.value = []
}

const openScanner = async () => {
  try {
    startLoading('openScanner')
    showScanner.value = false

    // Check camera permission
    const status = await CapacitorBarcodeScanner.checkPermission({ force: true })

    if (status.denied) {
      notify('Se requiere permiso de cámara para escanear', 'negative', 'warning')
      return
    }

    const result = await CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.ALL,
      scanInstructions: 'Escanear código',
      scanButton: false,
      scanText: 'Scan',
      cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
      android: {
        scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
      }
    })

    if (result.ScanResult) {
      await getOneProduct(result.ScanResult)
    }
  } catch (error) {
    if (error.message !== 'User cancelled the scan') {
      handleError(error, 'Error al escanear el código')
    }
  } finally {
    stopLoading('openScanner')
  }
}

const getCountProducts = async () => {
  try {
    if (!currentCount.value.id) return

    startLoading('getCountProducts')
    const { data } = await api.get('product-counts', {
      params: {
        dataEqualFilter: {
          count_id: currentCount.value.id
        }
      }
    })

    scannedProducts.value = data
  } catch (error) {
    handleError(error, 'Error al obtener productos del conteo')
  } finally {
    stopLoading('getCountProducts')
  }
}

const getOneProduct = async (barcode) => {
  if (!barcode) {
    notify('Ingresa un código de barras', 'negative', 'warning')
    return
  }

  if (currentCount.value.status !== 'active') {
    notify('No hay un conteo activo', 'negative', 'warning')
    return
  }

  try {
    startLoading('getProduct')

    if (barcode === currentProduct.value.barcode && !isEditing.value) {
      currentQuantity.value += 1
      showScanner.value = true
      return
    }

    const { data } = await api.get('products', {
      params: {
        dataEqualFilter: { barcode },
        branch_office_id: branchOffice?.id,
        stock: true
      }
    })

    if (data[0]) {
      currentProduct.value = data[0]

      // Check if product already exists in current count
      existingProductCount.value = scannedProducts.value.find(
        p => p.product_id === currentProduct.value.id
      )

      if (existingProductCount.value && !isEditing.value) {
        currentQuantity.value = existingProductCount.value.quantity
      }

      showScanner.value = true
      showCountDialog.value = false
    } else {
      notify('Producto no encontrado', 'negative', 'warning')
      if (!isEditing.value) {
        await openScanner()
      }
    }
  } catch (error) {
    handleError(error, 'Error al obtener el producto')
  } finally {
    stopLoading('getProduct')
  }
}

const editProduct = (product) => {
  if (currentCount.value.status !== 'active') {
    notify('No puedes editar productos de un conteo cerrado', 'negative', 'warning')
    return
  }

  isEditing.value = true
  editingProductId.value = product.id
  currentProduct.value = product.product
  currentQuantity.value = product.quantity
  existingProductCount.value = product
  showScanner.value = true
}

const closeScanner = () => {
  showScanner.value = false
  showCountDialog.value = true
  clearCurrentScan()
}

const confirmProduct = async () => {
  try {
    startLoading('confirmProduct')

    if (isEditing.value) {
      // Update existing product count
      await api.put(`product-counts/${editingProductId.value}`, {
        product_id: currentProduct.value.id,
        quantity: currentQuantity.value,
        current_stock: existingProductCount.value.current_stock
      })
    } else if (existingProductCount.value) {
      // Update existing product count
      await api.put(`product-counts/${existingProductCount.value.id}`, {
        product_id: existingProductCount.value.product_id,
        quantity: currentQuantity.value,
        current_stock: existingProductCount.value.current_stock
      })
    } else {
      // Create new product count
      await api.post('product-counts', {
        count_id: currentCount.value.id,
        product_id: currentProduct.value.id,
        current_stock: currentProduct.value.is_bundle ? currentProduct.value.bundle_stock : currentProduct.value.normal_stock,
        quantity: currentQuantity.value
      })
    }

    await getCountProducts()
    showScanner.value = false
    manualBarcode.value = ''
    showSuccess.value = true
    clearCurrentScan()
  } catch (error) {
    handleError(error, 'Error al confirmar el producto')
  } finally {
    stopLoading('confirmProduct')
  }
}

const clearCurrentScan = () => {
  currentProduct.value = {}
  currentQuantity.value = 1
  isEditing.value = false
  editingProductId.value = null
  existingProductCount.value = null
}

const loadReports = async () => {
  try {
    startLoading('loadReports')

    const params = {
      dataEqualFilter: {}
    }

    if (!userSession.is_root && reportFilters.value.userId) {
      notify('No tienes permiso para filtrar por usuario', 'negative', 'warning')
      return
    }

    if (reportFilters.value.userId) {
      params.dataEqualFilter.user_id = reportFilters.value.userId
    }

    if (reportFilters.value.startDate) {
      params.startDate = reportFilters.value.startDate
    }

    if (reportFilters.value.endDate) {
      params.endDate = reportFilters.value.endDate
    }

    const { data } = await api.get('counts', { params })

    if (userSession.is_root) {
      for (const report of data) {
        const { data: products } = await api.get('product-counts', {
          params: {
            dataEqualFilter: { count_id: report.id }
          }
        })

        let positiveDeviations = 0
        let negativeDeviations = 0

        products.forEach(product => {
          const deviation = product.quantity - product.current_stock
          if (deviation > 0) positiveDeviations++
          else if (deviation < 0) negativeDeviations++
        })

        report.positive_deviations = positiveDeviations
        report.negative_deviations = negativeDeviations
      }
    }

    reports.value = data
  } catch (error) {
    handleError(error, 'Error al cargar reportes')
  } finally {
    stopLoading('loadReports')
  }
}

const resetReportFilters = () => {
  const today = new Date().toISOString().split('T')[0]
  reportFilters.value = {
    startDate: today,
    endDate: today,
    userId: null
  }
  reports.value = []
}

const viewReportDetail = async (report) => {
  try {
    startLoading('viewReportDetail')
    selectedReport.value = report
    const { data } = await api.get('product-counts', {
      params: {
        dataEqualFilter: { count_id: report.id }
      }
    })
    reportProducts.value = data
    showReportDetail.value = true
  } catch (error) {
    handleError(error, 'Error al ver detalle del reporte')
  } finally {
    stopLoading('viewReportDetail')
  }
}

const getDeviationColor = (product) => {
  if (!userSession.is_root) return 'primary'
  const deviation = product.quantity - product.current_stock
  if (deviation > 0) return 'positive'
  if (deviation < 0) return 'negative'
  return 'grey'
}

const getDeviationIcon = (product) => {
  if (!userSession.is_root) return 'inventory_2'
  const deviation = product.quantity - product.current_stock
  if (deviation > 0) return 'trending_up'
  if (deviation < 0) return 'trending_down'
  return 'remove'
}

const getDeviationText = (product) => {
  const deviation = product.quantity - product.current_stock
  if (deviation > 0) return `+${deviation}`
  if (deviation < 0) return `${deviation}`
  return '0'
}

const getDeviationTextClass = (product) => {
  const deviation = product.quantity - product.current_stock
  if (deviation > 0) return 'text-positive'
  if (deviation < 0) return 'text-negative'
  return 'text-grey'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const startLoading = (action) => {
  loadingActions.value.push(action)
  isLoading.value = true
}

const stopLoading = (action) => {
  loadingActions.value = loadingActions.value.filter(a => a !== action)
  isLoading.value = loadingActions.value.length > 0
}

const handleError = (error, defaultMessage = 'Ocurrió un error') => {
  console.error(error)
  const message = error.response?.data?.message || error.message || defaultMessage
  notify(message, 'negative', 'warning')
}
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}

@media (max-width: 600px) {
  .q-card {
    margin: 0 8px;
  }

  .q-tab-panels {
    padding: 0;
  }

  .q-card-section {
    padding: 12px;
  }

  .q-item {
    padding: 8px 0;
  }

  .q-list--separator > .q-item-type + .q-item-type {
    margin-top: 4px;
  }
}

/* Custom animations */
.q-dialog .q-card {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Empty state styles */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--q-grey-6);
}

/* Scanner input focus */
.q-input--outlined .q-field__control:before {
  border-color: var(--q-primary);
}

/* Quantity controls */
.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

/* Desktop improvements */
@media (min-width: 1024px) {
  .q-page {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Dark mode support */
.body--dark .q-card {
  background: var(--q-dark);
}

.body--dark .text-grey-6,
.body--dark .text-grey-5 {
  color: var(--q-grey-4);
}

/* Better transitions */
.q-tab-panels {
  transition: height 0.3s ease;
}

/* Better button spacing on mobile */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .q-btn {
    width: 100%;
  }
}
</style>
