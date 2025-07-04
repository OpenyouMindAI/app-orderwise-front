<template>
  <q-page class="flex" padding>
    <!-- Loading overlay -->
    <q-inner-loading :showing="isLoading" color="primary" />

    <div style="width: 100%;" class="column q-gutter-y-sm">
      <!-- Header -->
       <div class="flex justify-between">
         <div class="text-center">
           <div class="text-subtitle2 text-weight-bold">
             Sistema de Conteo
           </div>
           <p class="text-caption text-grey-6 q-ma-none">
             Gestiona tu inventario
           </p>
         </div>

         <div>
           <q-btn
             v-if="currentCount.id && currentCount.status === 'active'"
             unelevated
             color="negative"
             icon="close"
             label="Cerrar conteo"
             class="ios-btn-danger"
             @click="confirmCloseCount"
             :loading="loadingActions.includes('closeCount')"
           />
         </div>
       </div>

      <!-- Count Status Banner -->
      <q-banner
        v-if="currentCount.id"
        :class="`${currentCount.status === 'active ios-banner' ? 'bg-primary text-white ios-banner' : 'ios-banner'}`"
        dense
        rounded
      >
        <template v-slot:avatar>
          <q-icon :name="currentCount.status === 'active' ? 'inventory' : 'inventory_2'" size="md" />
        </template>
        <div class="text-body2 flex justify-between">
          <div class="text-weight-medium">
            {{ currentCount.status === 'active' ? 'Conteo Activo' : 'Último Conteo' }}
            <div class="text-caption opacity-80">
              {{ formatDate(currentCount.created_at) }}
              <span v-if="currentCount.status === 'closed'"> • {{ lastCountProductsCount }} productos</span>
            </div>
          </div>
          <div>
            <q-btn
              v-if="currentCount.status === 'active'"
              flat
              :color="currentCount.status === 'active' ? 'white' : 'grey-8'"
              label="Ver"
              @click="activeTab = 'count'"
              class="ios-btn-action"
            />
            <q-btn
              v-else
              flat
              color="grey-8"
              label="Ver"
              @click="viewLastCount"
              class="ios-btn-action"
            />
          </div>
        </div>
      </q-banner>

      <!-- No Count State -->
      <q-banner v-if="!currentCount.id" class="bg-blue-1 text-blue-8 q-py-md q-px-lg ios-banner" dense rounded>
        <template v-slot:avatar>
          <q-icon name="info" size="md" />
        </template>
        <div class="text-body2">No hay conteos registrados</div>
      </q-banner>

      <!-- Navigation Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="ios-tabs"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="count" label="Conteo" icon="inventory_2" class="ios-tab" />
        <q-tab name="reports" label="Reportes" icon="assessment" class="ios-tab" />
      </q-tabs>

      <q-separator class="ios-separator" />

      <q-tab-panels v-model="activeTab" animated class="q-pa-none">
        <!-- Count Panel -->
        <q-tab-panel name="count" class="q-pa-md">
          <!-- Empty State for Active Count -->
          <div v-if="currentCount.status === 'active' && scannedProducts.length === 0" class="column items-center q-pa-xl text-center">
            <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-lg" />
            <div class="text-h6 text-weight-medium q-mb-sm">Sin productos</div>
            <p class="text-body2 text-grey-6 q-mb-lg q-ma-none">Escanea productos para comenzar el conteo</p>
            <q-btn
              unelevated
              color="primary"
              icon="qr_code_scanner"
              label="Escanear Producto"
              class="ios-btn-primary"
              @click="openCountDialog"
            />
          </div>

          <!-- Empty State for No Active Count -->
          <div v-else-if="currentCount.status !== 'active'" class="column items-center text-center">
            <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-lg" />
            <div class="text-h6 text-weight-medium q-mb-sm">
              {{ currentCount.id ? 'Conteo cerrado' : 'Sin conteos' }}
            </div>
            <p class="text-body2 text-grey-6 q-mb-lg q-ma-none">
              {{ currentCount.id ? 'Inicia un nuevo conteo' : 'Comienza tu primer conteo' }}
            </p>
            <q-btn
              unelevated
              color="primary"
              icon="add_circle"
              :label="currentCount.id ? 'Nuevo Conteo' : 'Iniciar Conteo'"
              class="ios-btn-primary"
              @click="handleStartCount"
              :loading="loadingActions.includes('startCount')"
            />
          </div>

          <!-- Stats Cards -->
          <div v-if="currentCount.status === 'active' && scannedProducts.length > 0" class="row q-gutter-sm q-mb-sm">
            <q-card class="col text-center bg-positive text-white ios-card" flat>
              <div class="text-h5 text-weight-bold">{{ totalProducts }}</div>
              <div class="text-body2">Productos</div>
            </q-card>
            <q-card class="col text-center bg-info text-white ios-card" flat>
              <div class="text-h5 text-weight-bold">{{ totalQuantity }}</div>
              <div class="text-body2">Total</div>
            </q-card>
          </div>

          <!-- Products List -->
          <q-card v-if="currentCount.status === 'active' && scannedProducts.length > 0" flat bordered class="ios-card">
            <q-card-section class="q-pa-xs">
              <div class="text-subtitle1 text-weight-medium">
                <q-icon name="list" class="q-mr-sm" />
                Productos ({{ scannedProducts.length }})
              </div>
            </q-card-section>

            <q-separator class="ios-separator" />

            <q-list dense separator class="q-pa-none">
              <q-item v-for="product in scannedProducts" :key="product.id" class="ios-list-item">
                <q-item-section thumbnail class="q-pl-sm">
                  <q-avatar color="primary" text-color="white" size="md" class="ios-avatar">
                    <q-icon name="inventory_2" size="md" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ product.product?.name }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ product.product?.barcode }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="text-body2 text-grey-7">
                    Stock: {{ product.current_stock }} • Contado: {{ product.quantity }}
                    <span :class="getDeviationTextClass(product)" class="text-weight-medium">
                      ({{ getDeviationText(product) }})
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="flex items-center justify-end q-gutter-sm">
                    <q-badge color="primary" text-color="white" class="text-subtitle2" rounded>
                      {{ product.quantity }}
                    </q-badge>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      class="ios-btn-icon"
                      @click="editProduct(product)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>

          <!-- Last Count Products -->
          <q-card v-if="showingLastCount && lastCountProducts.length > 0" flat bordered class="q-mt-lg ios-card">
            <q-card-section class="q-pa-lg q-pb-md">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="history" size="md" class="q-mr-sm" />
                  Último Conteo
                </div>
                <q-btn
                  flat
                  round
                  color="grey-7"
                  icon="close"
                  size="md"
                  class="ios-btn-icon"
                  @click="hideLastCount"
                />
              </div>
            </q-card-section>

            <q-separator class="ios-separator" />

            <q-list dense separator class="q-pa-none">
              <q-item v-for="product in lastCountProducts" :key="product.id" class="q-pa-lg ios-list-item">
                <q-item-section avatar>
                  <q-avatar color="grey-6" text-color="white" size="md" class="ios-avatar">
                    <q-icon name="inventory_2" size="md" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-weight-medium">{{ product.product?.name }}</q-item-label>
                  <q-item-label caption class="text-body2 text-grey-6">
                    {{ product.product?.barcode }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root" class="text-body2 text-grey-7">
                    Stock: {{ product.current_stock }} • Contado: {{ product.quantity }}
                    <span :class="getDeviationTextClass(product)" class="text-weight-medium">
                      ({{ getDeviationText(product) }})
                    </span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip color="grey-6" text-color="white" size="md" class="ios-chip">
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
            <q-icon name="assessment" size="4rem" color="grey-4" class="q-mb-lg" />
            <div class="text-h6 text-weight-medium q-mb-sm">Sin reportes</div>
            <p class="text-body2 text-grey-6 q-mb-lg q-ma-none">Usa filtros para buscar reportes</p>
            <q-btn
              unelevated
              color="primary"
              icon="search"
              label="Mostrar Filtros"
              class="ios-btn-primary"
              @click="showReportFilters = true"
              v-if="!showReportFilters"
            />
          </div>

          <!-- Report Filters Card -->
          <q-card class="q-mb-lg ios-card" flat bordered>
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-subtitle2 text-weight-medium">
                  <q-icon name="filter_list" size="md" class="q-mr-sm" />
                  Filtros
                </div>
                <q-btn
                  flat
                  round
                  :icon="showReportFilters ? 'expand_less' : 'expand_more'"
                  @click="showReportFilters = !showReportFilters"
                  color="grey-7"
                  size="sm"
                  class="ios-btn-icon"
                />
              </div>
            </q-card-section>

            <q-slide-transition>
              <div v-show="showReportFilters">
                <q-separator class="ios-separator" />
                <q-card-section>
                  <div class="row q-gutter-y-md q-mb-lg">
                    <div class="col-xs-12 col-6">
                      <q-input
                        v-model="reportFilters.startDate"
                        type="date"
                        label="Fecha Inicio"
                        outlined
                        dense
                        clearable
                        class="ios-input"
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" size="md" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-xs-12 col-6">
                      <q-input
                        v-model="reportFilters.endDate"
                        type="date"
                        label="Fecha Fin"
                        outlined
                        dense
                        clearable
                        class="ios-input"
                      >
                        <template v-slot:prepend>
                          <q-icon name="event" size="md" />
                        </template>
                      </q-input>
                    </div>
                  </div>

                  <q-select
                    v-if="userSession.is_root"
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
                    class="ios-input q-mb-lg"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" size="md" />
                    </template>
                  </q-select>

                  <div class="row q-gutter-md">
                    <q-btn
                      unelevated
                      color="primary"
                      icon="search"
                      label="Buscar"
                      @click="loadReports"
                      :loading="loadingActions.includes('loadReports')"
                      class="col ios-btn-primary"
                    />
                    <q-btn
                      outline
                      color="grey-7"
                      icon="refresh"
                      label="Limpiar"
                      @click="resetReportFilters"
                      class="ios-btn-secondary"
                    />
                  </div>
                </q-card-section>
              </div>
            </q-slide-transition>
          </q-card>

          <!-- Quick Filter Chips -->
          <div v-if="!showReportFilters && reportFiltersApplied" class="row q-gutter-sm q-mb-lg items-center justify-center">
            <div class="text-body2 text-grey-6">Activos:</div>
            <q-chip
              v-if="reportFilters.startDate"
              removable
              @remove="reportFilters.startDate = ''"
              color="primary"
              text-color="white"
              size="md"
              class="ios-chip"
            >
              {{ reportFilters.startDate }}
            </q-chip>
            <q-chip
              v-if="reportFilters.endDate"
              removable
              @remove="reportFilters.endDate = ''"
              color="primary"
              text-color="white"
              size="md"
              class="ios-chip"
            >
              {{ reportFilters.endDate }}
            </q-chip>
            <q-chip
              v-if="reportFilters.userId"
              removable
              @remove="reportFilters.userId = null"
              color="info"
              text-color="white"
              size="md"
              class="ios-chip"
            >
              {{ userOptions.find(u => u.id === reportFilters.userId)?.name }}
            </q-chip>
          </div>

          <!-- Reports List -->
          <q-card v-if="reports.length > 0" flat bordered class="ios-card">
            <q-card-section class="q-pa-lg q-pb-md">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="assessment" size="md" class="q-mr-sm" />
                  Reportes
                </div>
                <q-badge color="primary" class="text-body2">
                  {{ reports.length }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator class="ios-separator" />

            <q-list dense separator class="q-pa-none">
              <q-item
                v-for="report in reports"
                :key="report.id"
                clickable
                @click="viewReportDetail(report)"
                class="q-pa-lg ios-list-item"
              >
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" size="md" class="ios-avatar">
                    <q-icon name="person" size="md" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle1 text-weight-medium">
                    {{ report.user?.name || 'Usuario' }}
                  </q-item-label>
                  <q-item-label caption class="text-body2 text-grey-6">
                    {{ formatDate(report.created_at) }}
                  </q-item-label>
                  <q-item-label caption v-if="userSession.is_root">
                    <div class="row q-gutter-sm">
                      <q-chip size="md" color="positive" text-color="white" class="ios-chip">
                        +{{ report.positive_deviations || 0 }}
                      </q-chip>
                      <q-chip size="md" color="negative" text-color="white" class="ios-chip">
                        -{{ report.negative_deviations || 0 }}
                      </q-chip>
                    </div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" size="md" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky
      v-if="currentCount.status === 'active' && activeTab === 'count'"
      position="bottom-right"
      :offset="[18, 7]"
    >
      <q-btn
        round
        icon="search"
        color="secondary"
        class="ios-fab"
        @click="openCountDialog"
      />
    </q-page-sticky>
    <q-page-sticky
      v-if="currentCount.status === 'active' && activeTab === 'count' && $q.platform.is.nativeMobile"
      position="bottom-right"
      :offset="[70, 7]"
    >
      <q-btn
        round
        icon="qr_code_scanner"
        color="primary"
        class="ios-fab"
        @click="openScanner"
      />
    </q-page-sticky>

    <!-- Count Dialog -->
    <q-dialog v-model="showCountDialog" persistent>
      <q-card style="min-width: 350px; max-width: 450px; width: 90vw;" class="ios-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6 text-weight-medium">Buscar Producto</div>
          <q-space />
          <q-btn icon="close" flat round size="sm" v-close-popup/>
        </q-card-section>

        <q-separator class="ios-separator" />

        <q-card-section class="q-pa-xl">
          <!-- Search Type Toggle -->
          <q-btn-toggle
            v-model="searchType"
            toggle-color="primary"
            :options="[
              {label: '', value: 'barcode', icon: 'qr_code'},
              {label: 'Nombre', value: 'name', icon: 'search'}
            ]"
            class="q-mb-lg ios-toggle"
            spread
          />

          <q-input
            v-model="manualBarcode"
            :label="searchType === 'barcode' ? 'Código de Barras' : 'Nombre del Producto'"
            outlined
            class="q-mb-xl ios-input"
            :hint="searchType === 'barcode' ? 'Escanea o ingresa el código' : 'Busca por nombre del producto'"
            @keyup.enter="searchProducts(manualBarcode)"
            ref="barcodeInput"
            :loading="loadingActions.includes('searchProducts')"
          >
            <template v-slot:append>
              <q-icon :name="searchType === 'barcode' ? 'qr_code' : 'search'" size="md" />
            </template>
          </q-input>

          <div class="row q-gutter-md">
            <q-btn
              unelevated
              color="secondary"
              icon="qr_code_scanner"
              label="Escanear"
              class="col ios-btn-secondary"
              @click="openScanner"
              v-if="$q.platform.is.nativeMobile && searchType === 'barcode'"
              :loading="loadingActions.includes('openScanner')"
            />
            <q-btn
              unelevated
              label="Buscar"
              color="primary"
              @click="searchProducts(manualBarcode)"
              :disable="!manualBarcode"
              :loading="loadingActions.includes('searchProducts')"
              class="col ios-btn-primary"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Product Selection Dialog -->
    <q-dialog v-model="showProductSelection" persistent>
      <q-card style="min-width: 350px; max-width: 450px; width: 90vw;" class="ios-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6 text-weight-medium">Seleccionar Producto</div>
          <q-space />
          <q-btn icon="close" flat round @click="showProductSelection = false" />
        </q-card-section>

        <q-separator class="ios-separator" />

        <q-card-section class="scroll" style="max-height: calc(100vh - 200px);">
          <div class="text-subtitle1 text-grey-6">{{ searchResults.length }} productos encontrados:</div>
          <q-list dense separator class="q-pa-none ios-list">
            <q-item
              v-for="product in searchResults"
              :key="product.id"
              clickable
              @click="selectProduct(product)"
              class="ios-list-item"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="md" class="ios-avatar">
                  <q-icon name="inventory_2" size="md" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ product.name }}</q-item-label>
                <q-item-label caption class="text-body2 text-grey-6">
                  {{ product.barcode }}
                </q-item-label>
                <!-- <q-item-label caption v-if="userSession.is_root" class="text-body2 text-grey-7">
                  Stock: {{ product.is_bundle ? product.bundle_stock : product.normal_stock }}
                </q-item-label> -->
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" size="md" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Scanner Dialog -->
    <q-dialog v-model="showScanner" persistent>
      <q-card style="min-width: 350px; max-width: 450px; width: 90vw;" class="ios-dialog">
        <q-card-section class="q-pa-xl">
          <div class="text-h5 text-center q-mb-lg" :class="isEditing ? 'text-warning' : 'text-positive'">
            {{ isEditing ? 'Editando Producto' : 'Producto Detectado' }}
          </div>

          <div class="ios-product-info q-mb-md">
            <div class="text-subtitle2 text-weight-medium">{{ currentProduct.name }}</div>
            <div class="text-body2 text-grey-6">{{ currentProduct.barcode }}</div>
            <div v-if="existingProductCount" class="text-body2 text-orange q-mt-md">
              <q-icon name="warning"/>
              Producto contado. Cant. actual: {{ existingProductCount.quantity }}
            </div>
          </div>

          <q-input
            v-model.number="currentQuantity"
            type="number"
            label="Cantidad"
            outlined
            min="1"
            :rules="[val => val >= 1 || 'La cantidad debe ser mayor a 0']"
            class="ios-input"
          />

          <div class="row q-gutter-md justify-center q-mb-sm">
            <q-btn
              flat
              round
              color="negative"
              icon="remove"
              size="lg"
              class="ios-btn-icon"
              @click="currentQuantity = Math.max(1, currentQuantity - 1)"
            />
            <div class="text-h4 q-px-lg text-weight-medium">{{ currentQuantity }}</div>
            <q-btn
              flat
              round
              color="positive"
              icon="add"
              size="lg"
              class="ios-btn-icon"
              @click="currentQuantity += 1"
            />
          </div>

          <div class="row q-gutter-md q-mt-md">
            <q-btn
              outline
              color="grey"
              icon="refresh"
              label="Nuevo Escaneo"
              class="col ios-btn-secondary"
              @click="openScanner"
              v-if="!isEditing && $q.platform.is.nativeMobile"
              :loading="loadingActions.includes('openScanner')"
            />
            <q-btn
              outline
              color="grey"
              icon="close"
              label="Cancelar"
              class="col ios-btn-secondary"
              @click="closeScanner"
              v-if="isEditing"
            />
            <q-btn
              unelevated
              :color="isEditing ? 'warning' : 'positive'"
              icon="check"
              :label="isEditing ? 'Actualizar' : 'Confirmar'"
              class="col ios-btn-primary"
              @click="confirmProduct"
              :loading="loadingActions.includes('confirmProduct')"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Report Detail Dialog -->
  <q-dialog v-model="showReportDetail" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column no-wrap">
      <!-- Modern Header -->
      <q-card-section class="row items-center q-pa-md bg-primary text-white">
        <q-btn
          icon="arrow_back"
          flat
          round
          dense
          v-close-popup
          class="q-mr-sm"
        />
        <div class="text-h6 text-weight-medium">Detalle del Conteo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Scrollable Content -->
      <q-card-section class="col scroll q-pa-none">
        <div class="q-pa-md q-gutter-md">

          <!-- Report Info Card -->
          <q-card flat bordered class="rounded-borders">
            <q-card-section class="q-pa-md">
              <div class="text-subtitle1 text-weight-medium q-mb-md text-grey-8">
                <q-icon name="info" class="q-mr-xs" />
                Información del Reporte
              </div>

              <div class="row q-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-6 q-mb-xs">Usuario</div>
                  <div class="text-body1 text-weight-medium">{{ selectedReport?.user?.name }}</div>
                </div>

                <div class="col-12 col-sm-6" v-if="userSession.is_root">
                  <div class="text-caption text-grey-6 q-mb-xs">Desviaciones</div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      color="positive"
                      text-color="white"
                      size="sm"
                      icon="trending_up"
                    >
                      +{{ selectedReport?.positive_deviations || 0 }}
                    </q-chip>
                    <q-chip
                      color="negative"
                      text-color="white"
                      size="sm"
                      icon="trending_down"
                    >
                      -{{ selectedReport?.negative_deviations || 0 }}
                    </q-chip>
                  </div>
                </div>

                <div class="col-12">
                  <div class="text-caption text-grey-6 q-mb-xs">Fecha</div>
                  <div class="text-body1 text-weight-medium">{{ formatDate(selectedReport?.created_at) }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Detail Filters Card -->
          <q-card flat bordered class="rounded-borders" v-if="userSession.is_root">
            <q-expansion-item
              v-model="showDetailFilters"
              icon="tune"
              label="Filtros de Detalle"
              header-class="text-subtitle1 text-weight-medium text-grey-8 q-pa-md"
              expand-icon-class="text-grey-6"
            >
              <q-separator />
              <q-card-section class="q-pa-md">
                <div class="row q-gutter-y-md">
                  <!-- <div class="col-12 col-md-4">
                    <q-select
                      v-model="detailFilters.deviationType"
                      :options="deviationOptions"
                      label="Tipo de Desviación"
                      outlined
                      dense
                      clearable
                      color="primary"
                    />
                  </div> -->
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="detailFilters.productName"
                      label="Nombre del Producto"
                      outlined
                      dense
                      clearable
                      color="primary"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="detailFilters.barcode"
                      label="Código de Barras"
                      outlined
                      dense
                      clearable
                      color="primary"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-card>

          <!-- Products List Card -->
          <q-card flat bordered class="rounded-borders">
            <q-card-section class="q-pa-md q-pb-sm">
              <div class="row items-center">
                <div class="text-subtitle1 text-weight-medium text-grey-8">
                  <q-icon name="inventory_2" class="q-mr-xs" />
                  Productos del Conteo
                </div>
                <q-space />
                <q-badge color="primary" rounded>
                  {{ filteredReportProducts.length }}
                </q-badge>
              </div>
            </q-card-section>

            <q-separator />

            <!-- Products List -->
            <div class="q-pa-none">
              <q-virtual-scroll
                :items="filteredReportProducts"
                separator
                v-slot="{ item: product, index }"
                style="max-height: 60vh;"
              >
                <q-item class="q-pa-md">
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
                    <q-item-label class="text-body1 text-weight-medium">
                      {{ product.product?.name }}
                    </q-item-label>
                    <q-item-label caption class="text-body2 text-grey-6">
                      {{ product.product?.barcode }}
                    </q-item-label>
                    <q-item-label caption v-if="userSession.is_root" class="text-body2 q-mt-xs">
                      <span class="text-grey-7">Stock: {{ product.current_stock }}</span>
                      <span class="text-grey-7 q-mx-xs">•</span>
                      <span class="text-grey-7">Contado: {{ product.quantity }}</span>
                      <span class="q-mx-xs">•</span>
                      <span :class="getDeviationTextClass(product)" class="text-weight-medium">
                        {{ getDeviationText(product) }}
                      </span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-chip
                      :color="userSession.is_root ? getDeviationColor(product) : 'primary'"
                      text-color="white"
                      size="md"
                    >
                      {{ product.quantity }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </q-virtual-scroll>

              <!-- Empty State -->
              <div v-if="filteredReportProducts.length === 0" class="text-center q-pa-xl">
                <q-icon name="inventory_2" size="4rem" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">No hay productos</div>
                <div class="text-body2 text-grey-5">No se encontraron productos con los filtros aplicados</div>
              </div>
            </div>
          </q-card>

        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

    <!-- Success notification -->
    <q-dialog v-model="showSuccess">
      <q-card style="min-width: 350px;" class="ios-dialog">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="check_circle" size="4rem" color="positive" class="q-mb-lg" />
          <div class="text-h5 text-positive text-weight-medium">
            {{ isEditing ? '¡Producto Actualizado!' : '¡Producto Agregado!' }}
          </div>
          <div class="text-subtitle1 q-mt-md">
            {{ currentProduct.name }} - Cantidad: {{ currentQuantity }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Continuar"
            color="positive"
            v-close-popup
            class="ios-btn-primary"
            @click="() => { showCountDialog = true; clearCurrentScan() }"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirm Close Count Dialog -->
    <q-dialog v-model="showConfirmCloseDialog" persistent>
      <q-card style="min-width: 350px;" class="ios-dialog">
        <q-card-section class="items-center column justify-center q-gutter-md">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-lg text-subtitle1">¿Estás seguro que deseas cerrar este conteo?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup class="ios-btn-secondary" />
          <q-btn flat label="Cerrar" color="negative" @click="closeCount" class="ios-btn-primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Count Confirmation Dialog -->
    <q-dialog v-model="showNewCountDialog" persistent>
      <q-card style="min-width: 350px;" class="ios-dialog">
        <q-card-section class="column items-center q-gutter-md">
          <q-avatar icon="add_circle" color="primary" text-color="white"/>
          <span class="q-ml-lg text-subtitle1">¿Deseas iniciar un nuevo conteo de inventario?</span>
        </q-card-section>
        <q-card-section v-if="currentCount.id && currentCount.status === 'closed'" class="q-pa-xl">
          <div class="text-body2 text-grey-6">
            Tu último conteo fue cerrado el {{ formatDate(currentCount.updated_at) }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup class="ios-btn-secondary" />
          <q-btn flat label="Iniciar" color="primary" @click="createNewCount" class="ios-btn-primary" />
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
const showProductSelection = ref(false)
const searchResults = ref([])
const searchType = ref('barcode') // 'barcode' or 'name'

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
          branch_office_id: branchOffice?.id,
          status: 'active'
        },
        orderBy: 'id',
        sortOrder: 'desc',
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
  manualBarcode.value = ''

  if ($q.platform.is.nativeMobile) {
    openScanner()
  } else {
    showCountDialog.value = true
  }
}

const confirmCloseCount = () => {
  showConfirmCloseDialog.value = true
}

const closeCount = async () => {
  try {
    startLoading('closeCount')
    showConfirmCloseDialog.value = false

    const { data } = await api.put(`counts/${currentCount.value.id}`, {
      ...currentCount.value,
      status: 'closed'
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

const searchProducts = async (searchTerm) => {
  if (!searchTerm) {
    notify('Ingresa un código o nombre', 'negative', 'warning')
    return
  }

  if (currentCount.value.status !== 'active') {
    notify('No hay un conteo activo', 'negative', 'warning')
    return
  }

  const params = {}

  if (searchType.value === 'barcode') {
    params.dataEqualFilter = { barcode: searchTerm }
  } else {
    params.dataSearch = { name: searchTerm }
  }

  try {
    startLoading('searchProducts')

    const { data } = await api.get('products', {
      params: {
        ...params,
        branch_office_id: branchOffice?.id,
        stock: true
      }
    })

    if (data && data.length > 0) {
      if (data.length === 1) {
        // Solo un producto encontrado, proceder directamente
        selectProduct(data[0])
      } else {
        // Múltiples productos, mostrar lista de selección
        searchResults.value = data
        showProductSelection.value = true
      }
    } else {
      const searchTypeText = searchType.value === 'barcode' ? 'código de barras' : 'nombre'
      notify(`Producto no encontrado por ${searchTypeText}`, 'negative', 'warning')
    }
  } catch (error) {
    handleError(error, 'Error al buscar el producto')
  } finally {
    stopLoading('searchProducts')
  }
}

// Nuevo método para seleccionar un producto de la lista
const selectProduct = (product) => {
  currentProduct.value = product
  showProductSelection.value = false

  // Check if product already exists in current count
  existingProductCount.value = scannedProducts.value.find(
    p => p.product_id === product.id
  )

  if (existingProductCount.value && !isEditing.value) {
    currentQuantity.value = existingProductCount.value.quantity
  } else {
    currentQuantity.value = 1
  }

  showScanner.value = true
}

const getOneProduct = async (barcode) => {
  searchType.value = 'barcode'
  await searchProducts(barcode)
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
    // clearCurrentScan()
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
/* Base styles with dark mode support */
.q-page {
  min-height: 100vh;
}

.q-dark .q-page {
  background: var(--q-dark-page, #121212);
}

/* iOS-style Cards with dark mode */
.ios-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: var(--q-card-background, #ffffff);
  border: 1px solid var(--q-separator-color, rgba(0,0,0,0.12));
}

.q-dark .ios-card {
  background: var(--q-dark-card, #1e1e1e);
  border-color: var(--q-dark-separator, rgba(255,255,255,0.12));
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.ios-card .q-card-section {
  padding: 20px 24px;
}

/* iOS-style Buttons with better spacing */
.ios-btn-primary {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.ios-btn-secondary {
  border-radius: 12px;
  font-weight: 500;
  text-transform: none;
}

.ios-btn-danger {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
}

.ios-btn-action {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
}

.ios-btn-icon {
  border-radius: 10px;
}

/* iOS-style Floating Action Button */
.ios-fab {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.q-dark .ios-fab {
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

/* iOS-style Inputs with dark mode */
.ios-input .q-field__control {
  border-radius: 12px;
  min-height: 50px;
}

.q-dark .ios-input .q-field__control {
  background: var(--q-dark-field, #2a2a2a);
  border-color: var(--q-dark-separator, rgba(255,255,255,0.12));
}

.ios-input .q-field__native {
  padding: 14px 18px;
  font-size: 16px;
}

/* iOS-style Toggle */
.ios-toggle {
  border-radius: 12px;
  overflow: hidden;
}

.ios-toggle .q-btn {
  border-radius: 0;
  min-height: 44px;
  font-weight: 500;
}

/* iOS-style Tabs with dark mode */
.ios-tabs {
  background: transparent;
  min-height: 50px;
}

.ios-tab {
  text-transform: none;
  font-weight: 500;
  font-size: 15px;
}

/* iOS-style Lists with dark mode */
.ios-list-item {
  min-height: 64px;
  background: var(--q-item-background, transparent);
}

.ios-list-item:hover {
  background-color: var(--q-item-hover, rgba(0,0,0,0.04));
}

.q-dark .ios-list-item:hover {
  background-color: var(--q-dark-item-hover, rgba(255,255,255,0.04));
}
.rounded-borders {
  border-radius: 12px;
}

/* Mejoras para mobile */
@media (max-width: 600px) {
  .q-card {
    border-radius: 0;
  }

  .rounded-borders {
    border-radius: 8px;
  }
}

/* Transiciones suaves */
.q-expansion-item {
  transition: all 0.3s ease;
}

/* Mejoras visuales para los items */
.q-item {
  transition: background-color 0.2s ease;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
/* iOS-style Avatars */
.ios-avatar {
  border-radius: 12px;
}

/* iOS-style Chips with dark mode */
.ios-chip {
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
}

/* iOS-style Dialogs with dark mode */
.ios-dialog {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.q-dark .ios-dialog {
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.ios-dialog .q-card-section {
  padding: 24px 28px;
}

/* iOS-style Banners with dark mode */
.ios-banner {
  border-radius: 12px;
  border: none;
}

/* iOS-style Product Info with dark mode */
.ios-product-info {
  background: var(--q-info-background, #f8f9fa);
  border-radius: 12px;
  padding: 20px;
}

.q-dark .ios-product-info {
  background: var(--q-dark-info, #333333);
}

/* iOS-style Separators with dark mode */
.ios-separator {
  background-color: var(--q-separator-color, rgba(60,60,67,0.12));
}

.q-dark .ios-separator {
  background-color: var(--q-dark-separator, rgba(255,255,255,0.12));
}

/* Spacing adjustments */
.q-gutter-sm > * + * {
  margin-left: 12px;
}

.q-gutter-y-sm > * + * {
  margin-top: 12px;
}

.q-gutter-md > * + * {
  margin-left: 16px;
}

.q-gutter-y-md > * + * {
  margin-top: 16px;
}

.q-gutter-lg > * + * {
  margin-left: 24px;
}

.q-gutter-y-lg > * + * {
  margin-top: 24px;
}

.q-gutter-xl > * + * {
  margin-left: 32px;
}

.q-gutter-y-xl > * + * {
  margin-top: 32px;
}

/* Focus states with dark mode */
.ios-btn-primary:focus,
.ios-btn-secondary:focus {
  outline: 2px solid var(--q-focus-color, rgba(0,122,255,0.3));
  outline-offset: 2px;
}

.ios-input .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px var(--q-focus-color, rgba(0,122,255,0.2));
}

/* Dark mode text colors */
.q-dark .text-grey-6 {
  color: rgba(255,255,255,0.6) !important;
}

.q-dark .text-grey-7 {
  color: rgba(255,255,255,0.7) !important;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .q-page {
    padding: 12px;
  }

  .ios-card .q-card-section {
    padding: 16px 20px;
  }

  .ios-list-item {
    min-height: 56px;
    padding: 12px 16px;
  }

  .ios-btn-primary {
    min-height: 46px;
    font-size: 15px;
  }

  .ios-dialog .q-card-section {
    padding: 20px 24px;
  }
}

/* Opacity utilities */
.opacity-80 {
  opacity: 0.8;
}

/* Modern transitions */
.q-tab-panels {
  transition: all 0.2s ease;
}

.q-slide-transition-enter-active,
.q-slide-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Custom dark mode variables */
:root {
  --q-background: #f2f2f7;
  --q-card-background: #ffffff;
  --q-separator-color: rgba(60,60,67,0.12);
  --q-field-background: #ffffff;
  --q-item-background: transparent;
  --q-item-hover: rgba(0,0,0,0.04);
  --q-dialog-background: #ffffff;
  --q-info-background: #f8f9fa;
  --q-focus-color: rgba(0,122,255,0.3);
}

.q-dark {
  --q-dark-page: #000000;
  --q-dark-card: #1c1c1e;
  --q-dark-separator: rgba(255,255,255,0.12);
  --q-dark-field: #1c1c1e;
  --q-dark-item-hover: rgba(255,255,255,0.04);
  --q-dark-dialog: #1c1c1e;
  --q-dark-info: #2c2c2e;
}
</style>
