<template>
  <q-page class="transfer-page">
    <!-- Mobile-First Header -->
    <div :class="`${$q.dark.isActive ? 'bg-dark page-header q-pa-md' : 'bg-white page-header q-pa-md'}`" v-if="currentView === 'list'">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h5 text-weight-bold">Transferencias</div>
          <div class="text-caption text-grey-7">Gestión de stock entre sucursales</div>
        </div>
        <div class="col-auto row q-gutter-sm">
          <q-btn
            round
            color="primary"
            icon="qr_code_scanner"
            @click="openQrScanner"
          >
            <q-tooltip>Escanear QR</q-tooltip>
          </q-btn>
          <q-btn
            round
            color="primary"
            icon="add"
            @click="createNewTransfer"
          >
            <q-tooltip>Nueva Transferencia</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Header for other views -->
    <div :class="`${$q.dark.isActive ? 'bg-dark breadcrumb-header q-pa-md' : 'bg-white breadcrumb-header q-pa-md'}`" v-else>
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="goBack"
        />
        <div class="col">
          <q-breadcrumbs class="text-bold">
            <q-breadcrumbs-el label="Transferencias" @click="currentView = 'list'" class="cursor-pointer" />
            <q-breadcrumbs-el :label="getBreadcrumbLabel()" />
          </q-breadcrumbs>
          <div class="text-caption text-bold" v-if="currentView === 'verify' || (currentView === 'form' && editMode)">
            {{ getBreadcrumbSubtitle() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Listado de Transferencias -->
    <div v-if="currentView === 'list'" class="q-pa-md">
      <!-- Barra de búsqueda y filtros -->
      <div class="search-bar-container q-mb-md">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Buscar transferencia..."
          debounce="500"
          class="search-bar"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          unelevated
          color="primary"
          icon="tune"
          @click="showFiltersDrawer = true"
          class="filter-btn"
        >
          <q-badge v-if="activeFiltersCount > 0" color="red" floating>{{ activeFiltersCount }}</q-badge>
          <span class="gt-xs q-ml-sm">Filtros</span>
        </q-btn>
      </div>

      <!-- Chips de filtros activos -->
      <div v-if="activeFiltersCount > 0" class="active-filters-chips q-mb-md">
        <q-chip
          v-if="filters.dateRange"
          removable
          @remove="filters.dateRange = null; applyFilters()"
          color="primary"
          text-color="white"
          icon="event"
          size="sm"
        >
          {{ getDateRangeLabel(filters.dateRange) }}
        </q-chip>
        <q-chip
          v-if="filters.originBranch"
          removable
          @remove="filters.originBranch = null; applyFilters()"
          color="primary"
          text-color="white"
          icon="store"
          size="sm"
        >
          Origen: {{ getBranchName(filters.originBranch) }}
        </q-chip>
        <q-chip
          v-if="filters.destinationBranch"
          removable
          @remove="filters.destinationBranch = null; applyFilters()"
          color="primary"
          text-color="white"
          icon="arrow_forward"
          size="sm"
        >
          Destino: {{ getBranchName(filters.destinationBranch) }}
        </q-chip>
        <q-chip
          v-if="filters.status"
          removable
          @remove="filters.status = null; applyFilters()"
          color="primary"
          text-color="white"
          icon="info"
          size="sm"
        >
          {{ getStatusLabel(filters.status) }}
        </q-chip>
        <q-btn
          flat
          dense
          size="sm"
          label="Limpiar todo"
          color="grey-7"
          @click="clearAllFilters"
          class="q-ml-sm"
        />
      </div>

      <!-- Vista móvil: Cards compactas -->
      <div v-if="$q.platform.is.mobile" class="mobile-transfers-list">
        <!-- Skeleton Loader -->
        <template v-if="loading">
          <q-card
            v-for="i in 5"
            :key="'skeleton-' + i"
            flat
            bordered
            class="transfer-card-mobile q-mb-sm"
          >
            <q-card-section class="q-pa-sm">
              <div class="row items-center justify-between">
                <div class="col">
                  <q-skeleton type="text" width="60px" />
                  <q-skeleton type="text" width="100px" class="q-mt-xs" />
                </div>
                <div class="col-auto">
                  <q-skeleton type="rect" width="80px" height="24px" />
                </div>
              </div>
              <div class="row q-mt-sm q-gutter-sm">
                <q-skeleton type="text" width="45%" />
                <q-skeleton type="text" width="45%" />
              </div>
            </q-card-section>
          </q-card>
        </template>

        <!-- Empty State -->
        <template v-else-if="!transfers || transfers.length === 0">
          <div class="empty-state q-pa-xl text-center">
            <q-icon name="inventory_2" size="80px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">No hay transferencias</div>
            <div class="text-body2 text-grey-6 q-mt-xs">
              Crea tu primera transferencia para comenzar
            </div>
            <q-btn
              unelevated
              color="primary"
              label="Nueva Transferencia"
              icon="add"
              @click="currentView = 'form'"
              class="q-mt-md"
              no-caps
            />
          </div>
        </template>

        <!-- Lista de transferencias -->
        <template v-else>
          <q-card
            v-for="transfer in transfers"
            :key="transfer.id"
            flat
            bordered
            class="transfer-card-mobile q-mb-sm"
            @touchstart="handleTouchStart($event, transfer)"
            @touchend="handleTouchEnd()"
            @touchmove="handleTouchEnd()"
          >
            <q-card-section class="q-pa-sm">
              <div class="row items-center justify-between">
                <div class="col">
                  <div class="text-weight-bold text-body2">#{{ transfer.id }}</div>
                  <div class="text-caption text-grey-7">{{ formatDate(transfer.created_at) }}</div>
                </div>
                <div class="col-auto">
                  <q-badge :color="getStatusColor(transfer.status)" class="q-pa-xs text-caption">
                    {{ getStatusLabel(transfer.status) }}
                  </q-badge>
                </div>
              </div>
              <div class="row q-mt-xs text-caption">
                <div class="col-6">
                  <q-icon name="store" size="xs" class="q-mr-xs" />
                  {{ transfer.origin_branch_office?.name }}
                </div>
                <div class="col-6">
                  <q-icon name="arrow_forward" size="xs" class="q-mr-xs" />
                  {{ transfer.destination_branch_office?.name }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </div>

      <!-- Vista desktop: Tabla -->
      <q-table
        v-else
        :rows="transfers"
        :columns="columns"
        row-key="id"
        :filter="filters.search"
        binary-state-sort
        flat
        bordered
        v-model:pagination="pagination"
        @request="setPagination"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row no-wrap q-gutter-xs justify-center items-center">
              <!-- Acción principal: Ver -->
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="viewTransfer(props.row)"
                size="sm"
              >
                <q-tooltip>Ver detalles</q-tooltip>
              </q-btn>

              <!-- Verificar (si está en proceso y es sucursal destino) -->
              <q-btn
                v-if="props.row.status === 'in_process' && canVerifyTransferRow(props.row)"
                flat
                round
                dense
                color="positive"
                icon="fact_check"
                @click="openVerificationView(props.row)"
                size="sm"
              >
                <q-tooltip>Verificar recepción</q-tooltip>
              </q-btn>

              <!-- Menú de más opciones -->
              <q-btn
                flat
                round
                dense
                color="grey-7"
                icon="more_vert"
                size="sm"
              >
                <q-tooltip>Más opciones</q-tooltip>
                <q-menu auto-close>
                  <q-list style="min-width: 180px">
                    <!-- Verificar (solo si está en proceso, es sucursal destino y no está verificada) -->
                    <q-item
                      v-if="props.row.status === 'in_process' && canVerifyTransferRow(props.row) && !isTransferDelivered(props.row)"
                      clickable
                      @click="openVerificationView(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="fact_check" color="positive" />
                      </q-item-section>
                      <q-item-section>Verificar recepción</q-item-section>
                    </q-item>

                    <q-separator v-if="props.row.status === 'in_process' && canVerifyTransferRow(props.row) && !isTransferDelivered(props.row)" />

                    <!-- Descargar PDF -->
                    <q-item v-if="!$q.platform.is.mobile" clickable @click="downloadPdf(props.row)">
                      <q-item-section avatar>
                        <q-icon name="download" color="info" />
                      </q-item-section>
                      <q-item-section>Descargar PDF</q-item-section>
                    </q-item>

                    <!-- Compartir PDF -->
                    <q-item clickable @click="sharePdf(props.row)">
                      <q-item-section avatar>
                        <q-icon name="share" color="secondary" />
                      </q-item-section>
                      <q-item-section>Compartir PDF</q-item-section>
                    </q-item>

                    <q-separator v-if="(canEditTransferRow(props.row) || isSuperAdmin) && !isTransferDelivered(props.row)" />

                    <!-- Editar (solo sucursal origen o admin, y no entregada) -->
                    <q-item
                      v-if="canEditTransferRow(props.row) && !isTransferDelivered(props.row)"
                      clickable
                      @click="editTransfer(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit" color="amber" />
                      </q-item-section>
                      <q-item-section>Editar</q-item-section>
                    </q-item>

                    <!-- Eliminar (solo admin y no entregada) -->
                    <q-item
                      v-if="isSuperAdmin && !isTransferDelivered(props.row)"
                      clickable
                      @click="confirmDelete(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Eliminar</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status)" class="q-pa-sm">
              {{ getStatusLabel(props.row.status) }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            No hay transferencias que coincidan con los filtros aplicados
          </div>
        </template>
      </q-table>
    </div>

    <!-- Vista de Formulario de Transferencia -->
    <div v-else-if="currentView === 'form'" class="q-pa-md">
      <q-form @submit.prevent="saveTransfer" class="q-gutter-md">
        <!-- Header con información de sucursales -->
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <!-- Vista de solo lectura (transferencia verificada) -->
            <div v-if="isTransferVerified" class="transfer-route-display">
              <div class="text-overline text-grey-7 q-mb-xs">Ruta de transferencia</div>
              <div class="route-container">
                <div class="branch-info origin">
                  <q-icon name="store" size="sm" class="q-mr-xs" />
                  <div>
                    <div class="text-caption text-grey-7">Origen</div>
                    <div class="text-weight-bold">{{ currentTransfer.origin_branch_office?.name }}</div>
                  </div>
                </div>
                <div class="route-arrow">
                  <q-icon name="arrow_forward" size="md" color="primary" />
                </div>
                <div class="branch-info destination">
                  <q-icon name="store" size="sm" class="q-mr-xs" />
                  <div>
                    <div class="text-caption text-grey-7">Destino</div>
                    <div class="text-weight-bold">{{ currentTransfer.destination_branch_office?.name }}</div>
                  </div>
                </div>
              </div>
              <div v-if="currentTransfer.observations" class="q-mt-md">
                <div class="text-caption text-grey-7">Observaciones</div>
                <div class="text-body2">{{ currentTransfer.observations }}</div>
              </div>
            </div>

            <!-- Vista de edición (transferencia no verificada) -->
            <div v-else>
              <!-- Banner de advertencia si no puede editar -->
              <q-banner v-if="editMode && !canEditTransfer" rounded class="bg-warning text-white q-mb-md">
                <template v-slot:avatar>
                  <q-icon name="lock" size="md" />
                </template>
                <div class="text-weight-bold">Solo lectura</div>
                <div class="text-caption">
                  Solo la sucursal origen puede editar esta transferencia.
                </div>
              </q-banner>

              <!-- Móvil: Layout compacto -->
              <div v-if="$q.platform.is.mobile" class="column q-gutter-sm">
                <q-select
                  v-model="currentTransfer.origin_branch_office"
                  :options="branchOptions"
                  label="Origen *"
                  outlined
                  dense
                  option-label="name"
                  option-value="id"
                  :rules="[val => !!val || 'Requerido']"
                  :disable="editMode && !canEditTransfer"
                  @filter="getBranchOffice"
                >
                  <template v-slot:prepend>
                    <q-icon name="store" size="xs" />
                  </template>
                </q-select>
                <q-select
                  v-model="currentTransfer.destination_branch_office"
                  :options="branchOptions"
                  label="Destino *"
                  outlined
                  dense
                  option-label="name"
                  option-value="id"
                  :rules="[
                    val => !!val || 'Requerido',
                    val => val.id !== currentTransfer?.origin_branch_office?.id || 'Debe ser diferente'
                  ]"
                  :disable="editMode && !canEditTransfer"
                  @filter="getBranchOffice"
                >
                  <template v-slot:prepend>
                    <q-icon name="arrow_forward" size="xs" />
                  </template>
                </q-select>
                <q-input
                  v-model="currentTransfer.observations"
                  label="Observaciones"
                  type="textarea"
                  outlined
                  dense
                  rows="2"
                  :disable="editMode && !canEditTransfer"
                />
              </div>

              <!-- Desktop: Layout normal -->
              <div v-else class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="currentTransfer.origin_branch_office"
                    :options="branchOptions"
                    label="Sucursal de origen *"
                    outlined
                    option-label="name"
                    option-value="id"
                    :rules="[val => !!val || 'Este campo es obligatorio']"
                    :disable="editMode && !canEditTransfer"
                    @filter="getBranchOffice"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="currentTransfer.destination_branch_office"
                    :options="branchOptions"
                    label="Sucursal de destino *"
                    outlined
                    option-label="name"
                    option-value="id"
                    :rules="[
                      val => !!val || 'Este campo es obligatorio',
                      val => val.id !== currentTransfer?.origin_branch_office?.id || 'La sucursal de destino debe ser diferente a la de origen'
                    ]"
                    :disable="editMode && !canEditTransfer"
                    @filter="getBranchOffice"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="currentTransfer.observations"
                    label="Observaciones"
                    type="textarea"
                    outlined
                    autogrow
                    :disable="editMode && !canEditTransfer"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Productos a transferir</div>

            <!-- Resumen de verificación -->
            <q-banner v-if="isTransferVerified && hasQuantityDiscrepancies" rounded class="bg-warning text-white q-mb-md">
              <template v-slot:avatar>
                <q-icon name="warning" size="md" />
              </template>
              <div class="text-weight-bold">Discrepancias detectadas</div>
              <div class="text-caption">
                Se encontraron diferencias entre las cantidades enviadas y recibidas en {{ discrepancyCount }} producto(s).
              </div>
            </q-banner>

            <!-- Vista móvil: Cards (solo en móvil y solo si está verificada) -->
            <div v-if="isTransferVerified" class="mobile-product-list lt-md q-mb-md">
              <q-card
                v-for="product in currentTransfer.products"
                :key="product.id"
                flat
                bordered
                class="product-card-mobile q-mb-md"
              >
                <q-card-section class="q-pa-md">
                  <!-- Header del producto -->
                  <div class="product-header-mobile q-mb-md">
                    <div class="text-h6 text-weight-bold q-mb-xs">{{ product.product?.name || product.name }}</div>
                    <div class="text-caption text-grey-6">
                      <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                      Código: {{ product.product?.barcode || product.barcode || product.id }}
                    </div>
                  </div>

                  <q-separator class="q-mb-md" />

                  <!-- Cantidades lado a lado -->
                  <div class="quantities-row q-mb-md">
                    <div class="quantity-box sent">
                      <div class="quantity-content">
                        <div class="quantity-label">Enviado</div>
                        <div class="quantity-number">{{ product.quantity }}</div>
                      </div>
                    </div>
                    <div class="quantity-box received" :class="getQuantityComparisonClass(product)">
                      <div class="quantity-content">
                        <div class="quantity-label">Recibido</div>
                        <div class="quantity-number">{{ product.received_quantity ?? '-' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Badge de discrepancia -->
                  <div v-if="product.received_quantity !== null && product.received_quantity !== product.quantity" class="q-mb-md">
                    <q-badge
                      :color="getQuantityBadgeColor(product)"
                      class="full-width q-py-sm"
                      style="font-size: 12px;"
                    >
                      <q-icon name="warning" size="xs" class="q-mr-xs" />
                      {{ getQuantityDifference(product) }}
                    </q-badge>
                  </div>

                  <q-separator class="q-mb-md" />

                  <!-- Costo y Subtotal lado a lado -->
                  <div class="financial-row">
                    <div class="financial-item">
                      <div class="financial-label">
                        <q-icon name="attach_money" size="xs" class="q-mr-xs" />
                        Costo Unitario
                      </div>
                      <div class="financial-value">{{ formatCurrency(product.cost) }}</div>
                    </div>
                    <div class="financial-divider"></div>
                    <div class="financial-item">
                      <div class="financial-label">
                        <q-icon name="calculate" size="xs" class="q-mr-xs" />
                        Subtotal
                      </div>
                      <div class="financial-value text-primary text-weight-bold">
                        {{ formatCurrency(product.quantity * product.cost) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Vista móvil: Cards para agregar productos -->
            <div v-if="!isTransferVerified && $q.platform.is.mobile" class="mobile-add-products q-mb-md">
              <q-card
                v-for="(product, index) in currentTransfer.products"
                :key="index"
                flat
                bordered
                class="product-form-card-mobile q-mb-sm"
              >
                <q-card-section class="q-pa-sm">
                  <div class="row items-center q-mb-xs">
                    <div class="col">
                      <q-select
                        v-model="product.product"
                        :options="productOptions"
                        label="Producto"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        option-label="name"
                        option-value="id"
                        input-debounce="500"
                        @filter="getProducts"
                        :rules="[val => !!val || 'Requerido']"
                        @update:model-value="(value) => setProducts(value, product)"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey text-caption">
                              No hay resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div class="col-auto q-ml-xs">
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeProduct(index)"
                        size="sm"
                      />
                    </div>
                  </div>
                  <div class="row q-col-gutter-xs">
                    <div class="col-12 col-sm-4">
                      <q-input
                        v-model.number="product.quantity"
                        type="number"
                        label="Cant."
                        outlined
                        dense
                        min="1"
                        :rules="[val => val > 0 || 'Requerido']"
                        @update:model-value="updateTotals"
                      >
                        <template v-slot:prepend>
                          <q-btn
                            flat
                            dense
                            round
                            icon="remove"
                            color="negative"
                            size="sm"
                            @click="decrementQuantity(product, 'quantity')"
                            :disable="product.quantity <= 1"
                          />
                        </template>
                        <template v-slot:append>
                          <q-btn
                            flat
                            dense
                            round
                            icon="add"
                            color="positive"
                            size="sm"
                            @click="incrementQuantity(product, 'quantity')"
                          />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-sm-4">
                      <q-input
                        v-model.number="product.cost"
                        type="number"
                        label="Costo"
                        outlined
                        dense
                        min="0"
                        prefix="$"
                        :rules="[val => val >= 0 || 'Requerido']"
                        @update:model-value="updateTotals"
                      />
                    </div>
                    <div class="col-12 col-sm-4">
                      <q-input
                        :model-value="formatCurrency(product.quantity * product.cost)"
                        label="Subtotal"
                        outlined
                        dense
                        readonly
                        class="subtotal-input"
                      />
                    </div>
                  </div>
                  <div v-if="product.stock !== undefined" class="text-caption text-grey-7 q-mt-xs">
                    Stock: {{ product.stock || '-' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Vista desktop: Tabla (solo en desktop o si no está verificada) -->
            <div v-if="!isTransferVerified && !$q.platform.is.mobile" class="q-mb-md">
              <q-table
                :rows="currentTransfer.products"
                :columns="displayProductColumns"
                row-key="id"
                hide-pagination
                :rows-per-page-options="[0]"
                flat
                bordered
                class="desktop-table"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="product" :props="props">
                      <q-select
                        v-model="props.row.product"
                        :options="productOptions"
                        label="Producto"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        option-label="name"
                        option-value="id"
                        input-debounce="500"
                        @filter="getProducts"
                        :rules="[val => !!val || 'Seleccione un producto']"
                        @update:model-value="(value) => setProducts(value, props.row)"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No hay resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-td>
                    <q-td key="quantity" :props="props">
                      <q-input
                        v-model.number="props.row.quantity"
                        type="number"
                        outlined
                        dense
                        min="1"
                        @update:model-value="updateTotals"
                      >
                        <template v-slot:prepend>
                          <q-btn
                            flat
                            dense
                            round
                            icon="remove"
                            color="negative"
                            size="sm"
                            @click="decrementQuantity(props.row, 'quantity'); updateTotals()"
                            :disable="props.row.quantity <= 1"
                          />
                        </template>
                        <template v-slot:append>
                          <q-btn
                            flat
                            dense
                            round
                            icon="add"
                            color="positive"
                            size="sm"
                            @click="incrementQuantity(props.row, 'quantity'); updateTotals()"
                          />
                        </template>
                      </q-input>
                    </q-td>
                    <q-td key="cost" :props="props">
                      <q-input
                        v-model.number="props.row.cost"
                        type="number"
                        outlined
                        dense
                        min="0"
                        prefix="$"
                        :rules="[
                          val => val >= 0 || 'El costo no puede ser negativo'
                        ]"
                        @update:model-value="updateTotals"
                      />
                    </q-td>
                    <q-td key="stock" :props="props">
                      {{ props.row.stock || '-' }}
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatCurrency(props.row.quantity * props.row.cost) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeProduct(props.rowIndex)"
                        size="sm"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>

            <!-- Vista desktop para transferencias verificadas: Tabla -->
            <div v-if="isTransferVerified" class="q-mb-md gt-sm">
              <q-table
                :rows="currentTransfer.products"
                :columns="displayProductColumns"
                row-key="id"
                hide-pagination
                :rows-per-page-options="[0]"
                flat
                bordered
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="product" :props="props">
                      <div v-if="isTransferVerified">
                        <div class="text-weight-medium">{{ props.row.product?.name || props.row.name }}</div>
                        <div class="text-caption text-grey-7">Código: {{ props.row.product?.barcode || props.row.barcode || props.row.id }}</div>
                      </div>
                      <q-select
                        v-else
                        v-model="props.row.product"
                        :options="productOptions"
                        label="Producto"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        option-label="name"
                        option-value="id"
                        input-debounce="500"
                        @filter="getProducts"
                        :rules="[val => !!val || 'Seleccione un producto']"
                        @update:model-value="(value) => setProducts(value, props.row)"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No hay resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-td>
                    <q-td key="quantity" :props="props">
                      <div v-if="isTransferVerified">
                        <div class="quantity-comparison">
                          <div class="sent-quantity">
                            <span class="text-caption text-grey-7">Enviado:</span>
                            <span class="text-weight-bold q-ml-xs">{{ props.row.quantity }}</span>
                          </div>
                          <div class="received-quantity" :class="getQuantityComparisonClass(props.row)">
                            <span class="text-caption">Recibido:</span>
                            <span class="text-weight-bold q-ml-xs">{{ props.row.received_quantity ?? '-' }}</span>
                          </div>
                          <q-badge
                            v-if="props.row.received_quantity !== null && props.row.received_quantity !== props.row.quantity"
                            :color="getQuantityBadgeColor(props.row)"
                            class="q-mt-xs"
                          >
                            {{ getQuantityDifference(props.row) }}
                          </q-badge>
                        </div>
                      </div>
                      <q-input
                        v-else
                        v-model.number="props.row.quantity"
                        type="number"
                        outlined
                        dense
                        min="1"
                        :rules="[
                          val => val > 0 || 'La cantidad debe ser mayor a 0'
                        ]"
                        @update:model-value="updateTotals"
                      />
                    </q-td>
                    <q-td key="cost" :props="props">
                      <div v-if="isTransferVerified">
                        {{ formatCurrency(props.row.cost) }}
                      </div>
                      <q-input
                        v-else
                        v-model.number="props.row.cost"
                        type="number"
                        outlined
                        dense
                        min="0"
                        prefix="$"
                        :rules="[
                          val => val >= 0 || 'El costo no puede ser negativo'
                        ]"
                        @update:model-value="updateTotals"
                      />
                    </q-td>
                    <q-td key="stock" :props="props">
                      {{ props.row.stock || '-' }}
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatCurrency(props.row.quantity * props.row.cost) }}
                    </q-td>
                    <q-td v-if="!isTransferVerified" key="actions" :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="delete"
                        @click="removeProduct(props.rowIndex)"
                        size="sm"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>

            <!-- Móvil: Layout compacto -->
            <div v-if="$q.platform.is.mobile" class="column q-gutter-sm q-mb-md">
              <q-btn
                v-if="!isTransferVerified"
                color="primary"
                icon="add"
                label="Agregar"
                @click="addProduct"
                unelevated
                dense
                class="full-width"
                :disable="editMode && !canEditTransfer"
              />
              <q-card flat bordered class="bg-grey-2">
                <q-card-section class="q-pa-sm">
                  <div class="row justify-between text-caption">
                    <div><strong>Productos:</strong> {{ getTotalProducts() }}</div>
                    <div><strong>Total:</strong> {{ formatCurrency(getTotalValue()) }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Desktop: Layout normal -->
            <div v-else class="row justify-between q-mb-md">
              <q-btn
                v-if="!isTransferVerified"
                color="primary"
                icon="add"
                label="Agregar producto"
                @click="addProduct"
                outline
                :disable="editMode && !canEditTransfer"
              />

              <div class="text-subtitle1">
                <div class="row q-gutter-md">
                  <div>
                    <strong>Total productos:</strong> {{ getTotalProducts() }}
                  </div>
                  <div>
                    <strong>Valor total:</strong> {{ formatCurrency(getTotalValue()) }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions v-if="!isTransferVerified" align="right" class="q-pa-md">
            <q-btn
              label="Confirmar envío"
              color="primary"
              type="submit"
              :disable="currentTransfer.products.length === 0 || (editMode && !canEditTransfer)"
            />
          </q-card-actions>
          <q-card-section v-else>
            <q-banner rounded class="bg-grey-3 q-mb-md">
              <template v-slot:avatar>
                <q-icon name="lock" color="grey-7" />
              </template>
              <div class="text-grey-8">
                Esta transferencia ya ha sido entregada y verificada. No se puede editar.
              </div>
            </q-banner>

            <!-- Acciones para transferencia verificada -->
            <div class="row q-gutter-sm">
              <q-btn
                v-if="!$q.platform.is.mobile"
                outline
                color="info"
                icon="picture_as_pdf"
                label="Descargar PDF"
                @click="downloadPdf(currentTransfer)"
                class="col"
              />
              <q-btn
                outline
                color="secondary"
                icon="share"
                label="Compartir"
                @click="sharePdf(currentTransfer)"
                class="col"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Timeline de Estados (solo para super admin y root) -->
        <q-card v-if="editMode && statusTimeline.length > 0 && isSuperAdmin" flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2 text-weight-medium">
                <q-icon name="timeline" size="sm" class="q-mr-xs" />
                Historial de Estados
              </div>
              <div v-if="statusTimeline.length > 1" class="text-caption text-grey-7">
                <q-icon name="schedule" size="xs" />
                Tiempo total: {{ getTotalDuration() }}
              </div>
            </div>

            <!-- Timeline Horizontal -->
            <div class="timeline-horizontal-container">
              <div class="timeline-circles-row">
                <div v-for="(item, index) in statusTimeline" :key="item.id" style="display: contents;">
                  <!-- Círculo con información -->
                  <div class="circle-with-info">
                    <div class="circle-wrapper">
                      <q-avatar
                        :color="getStatusTimelineColor(item.status)"
                        text-color="white"
                        size="50px"
                        class="timeline-circle"
                      >
                        <q-icon :name="getStatusIcon(item.status)" size="26px" />
                      </q-avatar>
                    </div>
                    <div class="info-block">
                      <div class="info-title">{{ getStatusLabel(item.status) }}</div>
                      <div class="info-date">{{ formatDate(item.changed_at, 'DD/MM HH:mm') }}</div>
                      <div v-if="item.changed_by" class="info-user">
                        <q-icon name="person" size="xs" />
                        {{ item.changed_by.name }}
                      </div>
                    </div>
                  </div>

                  <!-- Línea conectora con duración -->
                  <div v-if="index < statusTimeline.length - 1" class="line-wrapper">
                    <div class="connecting-line-h"></div>
                    <div
                      v-if="statusTimeline[index + 1].duration_human"
                      class="duration-label-h"
                    >
                      ⏱️ {{ statusTimeline[index + 1].duration_human }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-form>
    </div>

    <!-- Vista de Verificación de Transferencia -->
    <div v-else-if="currentView === 'verify'" class="verification-view">

      <div class="verification-content q-pa-sm">
        <div class="product-verification-list">
          <q-card
            v-for="product in verificationProducts"
            :key="product.id"
            flat
            bordered
            class="product-card q-mb-sm"
          >
            <q-card-section class="q-pa-sm">
              <div class="row items-start q-mb-sm">
                <div class="col">
                  <div class="text-weight-bold text-body2">{{ product.name }}</div>
                  <div class="text-caption text-grey-7">Código: {{ product.barcode || product.id }}</div>
                </div>
                <q-badge
                  :color="getVerificationColor(product)"
                  class="q-px-sm q-py-xs"
                >
                  {{ getVerificationStatus(product) }}
                </q-badge>
              </div>

              <div class="row items-center q-gutter-sm">
                <div class="col-auto text-caption text-grey-8">
                  Enviado: <span class="text-weight-bold">{{ product.pivot.quantity }}</span>
                </div>
                <q-separator vertical />
                <div class="col">
                  <q-input
                    v-model.number="product.received_quantity"
                    type="number"
                    label="Recibido"
                    outlined
                    dense
                    :min="0"
                    :max="product.pivot.quantity"
                    class="compact-input"
                  >
                    <template v-slot:prepend>
                      <q-btn
                        flat
                        dense
                        round
                        icon="remove"
                        color="negative"
                        size="sm"
                        @click="decrementQuantity(product, 'received_quantity')"
                        :disable="product.received_quantity <= 0"
                      />
                    </template>
                    <template v-slot:append>
                      <q-btn
                        flat
                        dense
                        round
                        icon="add"
                        color="positive"
                        size="sm"
                        @click="incrementQuantity(product, 'received_quantity', product.pivot.quantity)"
                        :disable="product.received_quantity >= product.pivot.quantity"
                      />
                      <q-btn
                        flat
                        dense
                        round
                        icon="done_all"
                        color="primary"
                        size="sm"
                        @click="product.received_quantity = product.pivot.quantity"
                      >
                        <q-tooltip>Completo</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="verification-footer">
        <!-- Banner si no puede verificar -->
        <q-banner v-if="!canVerifyTransfer" rounded class="bg-warning text-white q-mb-sm">
          <template v-slot:avatar>
            <q-icon name="lock" size="sm" />
          </template>
          <div class="text-caption">
            Solo la sucursal destino puede confirmar la recepción.
          </div>
        </q-banner>

        <q-btn
          label="Confirmar Recepción"
          color="primary"
          icon-right="check_circle"
          @click="confirmVerification"
          :disable="!canConfirmVerification || !canVerifyTransfer"
          class="full-width"
          unelevated
          size="lg"
        />
      </div>
    </div>

    <!-- Vista de Opciones (desde QR) -->
    <div v-else-if="currentView === 'options'" class="options-view q-pa-md">
      <q-card class="options-card">
        <!-- Header -->
        <q-card-section class="text-center bg-primary text-white">
          <q-icon name="qr_code_2" size="64px" class="q-mb-sm" />
          <div class="text-h5 text-weight-bold">Transferencia #{{ currentTransfer.transfer_number }}</div>
          <div class="text-body2">{{ currentTransfer.origin_branch_office?.name }} → {{ currentTransfer.destination_branch_office?.name }}</div>
        </q-card-section>

        <!-- Opciones -->
        <q-card-section class="q-pa-lg">
          <div class="text-h6 q-mb-md">¿Qué deseas hacer?</div>

          <q-list class="options-list">
            <!-- Ver Detalle -->
            <q-item
              clickable
              v-ripple
              @click="viewTransfer(currentTransfer)"
              class="option-item"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <q-icon name="visibility" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Ver Detalle</q-item-label>
                <q-item-label caption>Ver información completa de la transferencia</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>

            <!-- Verificar (solo si está en proceso y es sucursal destino) -->
            <q-item
              v-if="currentTransfer.status === 'in_process' && canVerifyTransfer"
              clickable
              v-ripple
              @click="openVerificationView(currentTransfer)"
              class="option-item"
            >
              <q-item-section avatar>
                <q-avatar color="positive" text-color="white">
                  <q-icon name="fact_check" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Verificar Recepción</q-item-label>
                <q-item-label caption>Confirmar productos recibidos</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />

            <!-- Descargar PDF -->
            <q-item
              v-if="!$q.platform.is.mobile"
              clickable
              v-ripple
              @click="downloadPdf(currentTransfer)"
              class="option-item"
            >
              <q-item-section avatar>
                <q-avatar color="info" text-color="white">
                  <q-icon name="download" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Descargar PDF</q-item-label>
                <q-item-label caption>Guardar documento en tu dispositivo</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>

            <!-- Compartir PDF -->
            <q-item
              clickable
              v-ripple
              @click="sharePdf(currentTransfer)"
              class="option-item"
            >
              <q-item-section avatar>
                <q-avatar color="secondary" text-color="white">
                  <q-icon name="share" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Compartir PDF</q-item-label>
                <q-item-label caption>Enviar por WhatsApp, email, etc.</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey-5" />
              </q-item-section>
            </q-item>

            <!-- Opciones de Admin y Sucursal Origen -->
            <template v-if="canEditTransfer && !isTransferDelivered(currentTransfer)">
              <q-separator class="q-my-md" />

              <!-- Editar -->
              <q-item
                clickable
                v-ripple
                @click="editTransfer(currentTransfer)"
                class="option-item"
              >
                <q-item-section avatar>
                  <q-avatar color="amber" text-color="white">
                    <q-icon name="edit" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Editar</q-item-label>
                  <q-item-label caption>Modificar la transferencia</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>

              <!-- Eliminar -->
              <q-item
                clickable
                v-ripple
                @click="confirmDelete(currentTransfer)"
                class="option-item"
              >
                <q-item-section avatar>
                  <q-avatar color="negative" text-color="white">
                    <q-icon name="delete" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Eliminar</q-item-label>
                  <q-item-label caption>Eliminar la transferencia</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-5" />
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            outline
            color="grey-8"
            label="Volver a la lista"
            icon="arrow_back"
            @click="goBack"
            class="full-width"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- QR Scanner Dialog (Web fallback) -->
    <q-dialog v-model="showQrScanner" position="bottom">
      <q-card style="width: 100%; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1">Buscar Transferencia</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Número de transferencia:</div>
          <q-input
            v-model="manualSearchQuery"
            label="Ej: 1001"
            outlined
            dense
            autofocus
            @keyup.enter="searchTransferManually"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="search"
                color="primary"
                @click="searchTransferManually"
                :disable="!manualSearchQuery"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat color="grey" v-close-popup />
          <q-btn
            label="Buscar"
            color="primary"
            @click="searchTransferManually"
            :disable="!manualSearchQuery"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transfer Actions Menu (Mobile) -->
    <q-page-sticky v-if="currentView === 'list'" position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="menu"
        color="primary"
        class="mobile-only"
      >
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup @click="createNewTransfer">
              <q-item-section avatar>
                <q-icon name="add" color="primary" />
              </q-item-section>
              <q-item-section>Nueva Transferencia</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="openQrScanner">
              <q-item-section avatar>
                <q-icon name="qr_code_scanner" color="primary" />
              </q-item-section>
              <q-item-section>Escanear QR</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-page-sticky>

    <!-- Modal de confirmación para eliminar -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Eliminar Transferencia</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            ¿Estás seguro de que deseas eliminar la transferencia <strong>#{{ transferToDelete?.id }}</strong>?
          </div>
          <div class="text-caption text-grey-7 q-mt-sm">
            Esta acción no se puede deshacer.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />
          <q-btn
            unelevated
            label="Eliminar"
            color="negative"
            @click="deleteTransfer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de éxito después de crear transferencia -->
    <q-dialog v-model="showSuccessModal" persistent transition-show="scale" transition-hide="scale">
      <q-card class="success-modal-modern">
        <!-- Contenido -->
        <q-card-section class="text-center q-pt-xl q-pb-md relative-position">
          <!-- Icono animado con círculos -->
          <div class="success-icon-container">
            <div class="success-circle-1"></div>
            <div class="success-circle-2"></div>
            <div class="success-circle-3"></div>
            <q-avatar size="100px" class="success-avatar">
              <q-icon name="check" size="60px" color="white" class="success-check-icon" />
            </q-avatar>
          </div>

          <!-- Título con animación -->
          <div class="text-h5 text-weight-bold q-mt-lg success-title">
            ¡Transferencia Creada!
          </div>
          <div class="text-body1 text-grey-7 q-mt-xs success-subtitle">
            Transferencia <span class="text-primary text-weight-bold">#{{ createdTransfer?.id }}</span>
          </div>
        </q-card-section>

        <!-- Acciones con diseño moderno -->
        <q-card-section class="q-px-lg q-pb-lg q-pt-none">
          <div class="column q-gutter-y-md items-center">
            <!-- Botón principal destacado -->
            <q-btn
              unelevated
              color="primary"
              icon="visibility"
              label="Ver Detalle"
              @click="viewCreatedTransfer"
              class="full-width action-btn-primary"
              size="md"
              no-caps
            >
              <div class="btn-shine"></div>
            </q-btn>

            <!-- Botones secundarios en grid -->
            <div class="row q-col-gutter-xs full-width">
              <div v-if="!$q.platform.is.mobile" class="col-6">
                <q-btn
                  outline
                  color="primary"
                  icon="download"
                  label="Descargar"
                  @click="downloadCreatedTransferPdf"
                  class="full-width action-btn-secondary"
                  size="md"
                  no-caps
                  stack
                />
              </div>
              <div :class="$q.platform.is.mobile ? 'col-12' : 'col-6'">
                <q-btn
                  outline
                  color="primary"
                  icon="share"
                  label="Compartir"
                  @click="shareCreatedTransferPdf"
                  class="full-width action-btn-secondary"
                  size="md"
                  no-caps
                  stack
                />
              </div>
            </div>

            <!-- Botón cerrar visible -->
            <q-btn
              outline
              label="Cerrar"
              color="grey-8"
              @click="closeSuccessModal"
              class="full-width q-mt-sm action-btn-close"
              size="md"
              no-caps
            />
          </div>
        </q-card-section>

        <!-- Confetti decorativo -->
        <div class="confetti-container">
          <div class="confetti" v-for="i in 20" :key="i" :style="{ left: (i * 5) + '%' }"></div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Drawer de Filtros -->
    <q-drawer
      v-model="showFiltersDrawer"
      side="right"
      overlay
      bordered
      :width="$q.platform.is.mobile ? 280 : 350"
      class="filters-drawer"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="row items-center q-mb-md">
            <div class="text-h6">Filtros</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showFiltersDrawer = false" />
          </div>

          <q-separator class="q-mb-md" />

          <!-- Rango de fechas -->
          <div class="filter-section">
            <div class="filter-label">
              <q-icon name="event" size="20px" class="q-mr-xs" />
              Rango de fechas
            </div>
            <q-select
              v-model="filters.dateRange"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="dateRangeOptions"
              placeholder="Seleccionar período"
            />
          </div>

          <!-- Sucursal origen -->
          <div class="filter-section">
            <div class="filter-label">
              <q-icon name="store" size="20px" class="q-mr-xs" />
              Sucursal origen
            </div>
            <q-select
              v-model="filters.originBranch"
              outlined
              dense
              clearable
              emit-value
              map-options
              option-label="name"
              option-value="id"
              :options="branchOptions"
              placeholder="Todas las sucursales"
              use-input
              @filter="getBranchOffice"
            />
          </div>

          <!-- Sucursal destino -->
          <div class="filter-section">
            <div class="filter-label">
              <q-icon name="arrow_forward" size="20px" class="q-mr-xs" />
              Sucursal destino
            </div>
            <q-select
              v-model="filters.destinationBranch"
              outlined
              dense
              clearable
              emit-value
              map-options
              option-label="name"
              option-value="id"
              :options="branchOptions"
              placeholder="Todas las sucursales"
              use-input
              @filter="getBranchOffice"
            />
          </div>

          <!-- Estado -->
          <div class="filter-section">
            <div class="filter-label">
              <q-icon name="info" size="20px" class="q-mr-xs" />
              Estado
            </div>
            <q-select
              v-model="filters.status"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="statusOptions"
              placeholder="Todos los estados"
            />
          </div>

          <q-separator class="q-my-md" />

          <!-- Acciones -->
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="grey-7"
              label="Limpiar"
              @click="clearAllFilters"
              class="col"
            />
            <q-btn
              unelevated
              color="primary"
              label="Aplicar"
              @click="applyFilters"
              class="col"
            />
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Menú contextual para móvil (long press) -->
    <q-dialog v-model="showRowMenu" position="bottom">
      <q-card style="width: 100%">
        <q-list>
          <q-item clickable v-close-popup @click="viewTransfer(selectedRow)">
            <q-item-section avatar>
              <q-icon name="visibility" color="primary" />
            </q-item-section>
            <q-item-section>Ver detalle</q-item-section>
          </q-item>

          <q-item v-if="selectedRow && selectedRow.status === 'in_process'" clickable v-close-popup @click="openVerificationView(selectedRow)">
            <q-item-section avatar>
              <q-icon name="fact_check" color="positive" />
            </q-item-section>
            <q-item-section>Verificar recepción</q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="sharePdf(selectedRow)">
            <q-item-section avatar>
              <q-icon name="share" color="secondary" />
            </q-item-section>
            <q-item-section>Compartir PDF</q-item-section>
          </q-item>

          <q-item v-if="selectedRow && canEditTransferRow(selectedRow) && !isTransferDelivered(selectedRow)" clickable v-close-popup @click="editTransfer(selectedRow)">
            <q-item-section avatar>
              <q-icon name="edit" color="amber" />
            </q-item-section>
            <q-item-section>Editar</q-item-section>
          </q-item>

          <q-item v-if="isSuperAdmin && selectedRow && !isTransferDelivered(selectedRow)" clickable v-close-popup @click="confirmDelete(selectedRow)">
            <q-item-section avatar>
              <q-icon name="delete" color="negative" />
            </q-item-section>
            <q-item-section>Eliminar</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { notify, loading, formatDate } from 'src/const/mixins'
import { api } from 'src/boot/axios'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { date } from 'quasar'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerAndroidScanningLibrary,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint
} from '@capacitor/barcode-scanner'
export default {
  name: 'TransferenciasApp',

  data () {
    return {
      /**
       * Format date
       * @type {Function}
       */
      formatDate,
      /**
       * Current view
       * @type {String}
       */
      currentView: 'list',
      /**
       * Edit mode
       * @type {Boolean}
       */
      editMode: false,
      /**
       * Filters data
       * @type {Object}
       */
      filters: {
        search: '',
        dateRange: null,
        originBranch: null,
        destinationBranch: null,
        status: null
      },

      /**
       * Date range options
       * @type {Array}
       */
      dateRangeOptions: [
        { label: 'Hoy', value: 'today' },
        { label: 'Última semana', value: 'lastWeek' },
        { label: 'Último mes', value: 'lastMonth' },
        { label: 'Último trimestre', value: 'lastQuarter' }
      ],
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        dataSearch: {
          id: '',
          transfer_number: '',
          created_at: '',
          status: ''
        }
      },
      /**
       * Branch office options
       * @type {Array}
       */
      branchOptions: [],
      /**
       * Status options
       * @type {Array}
       */
      statusOptions: [
        { label: 'En Proceso', value: 'in_process' },
        { label: 'Entregado', value: 'delivered' },
        { label: 'Cancelado', value: 'cancelled' }
      ],

      /**
       * Transfers data (simulated)
       * @type {Array}
       */
      transfers: [],
      /**
       * Columns for transfers table
       * @type {Array}
       */
      columns: [
        { name: 'id', align: 'left', label: 'Nº Documento', field: 'id', sortable: true },
        { name: 'created_at', align: 'left', label: 'Fecha', field: 'created_at', sortable: true, format: v => formatDate(v) },
        { name: 'origin_branch_office', align: 'left', label: 'Origen', field: 'origin_branch_office', sortable: true, format: v => v.name },
        { name: 'destination_branch_office', align: 'left', label: 'Destino', field: 'destination_branch_office', sortable: true, format: v => v.name },
        { name: 'status', align: 'center', label: 'Estado', field: 'status', sortable: true },
        { name: 'actions', align: 'center', label: 'Acciones', field: 'actions', sortable: false }
      ],
      /**
       * Show row menu (mobile long press)
       * @type {Boolean}
       */
      showRowMenu: false,
      /**
       * Selected row for context menu
       * @type {Object|null}
       */
      selectedRow: null,
      /**
       * Long press timer
       * @type {Number|null}
       */
      longPressTimer: null,
      /**
       * ColumnS for products table
       * @type {Array}
       */
      productColumns: [
        { name: 'product', align: 'left', label: 'Producto', field: 'product' },
        { name: 'quantity', align: 'right', label: 'Cantidad', field: 'quantity' },
        { name: 'cost', align: 'right', label: 'Costo Unitario', field: 'cost' },
        { name: 'stock', align: 'right', label: 'Stock', field: 'stock' },
        { name: 'subtotal', align: 'right', label: 'Subtotal', field: 'subtotal' },
        { name: 'actions', align: 'center', label: 'Acciones', field: 'actions' }
      ],
      /**
       * Pagination data
       * @type {Object}
       */
      pagination: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      /**
       * Current transfer data (for edition/creation)
       * @type {Object}
       */
      currentTransfer: {
        id: '',
        date: formatDate(new Date(), 'YYYY-MM-DD'),
        origin_branch_office: null,
        destination_branch_office: null,
        // status: 'Borrador',
        observations: '',
        products: []
      },
      /**
       * Product options
       * @type {Array}
       */
      productOptions: [],
      /**
       * Show QR scanner dialog
       * @type {Boolean}
       */
      showQrScanner: false,
      /**
       * Manual search query
       * @type {String}
       */
      manualSearchQuery: '',
      /**
       * Status timeline
       * @type {Array}
       */
      statusTimeline: [],
      /**
       * Verification products
       * @type {Array}
       */
      verificationProducts: [],
      /**
       * Show delete confirmation dialog
       * @type {Boolean}
       */
      showDeleteDialog: false,
      /**
       * Transfer to delete
       * @type {Object|null}
       */
      transferToDelete: null,
      /**
       * Show filters drawer
       * @type {Boolean}
       */
      showFiltersDrawer: false,
      /**
       * Show success modal after creating transfer
       * @type {Boolean}
       */
      showSuccessModal: false,
      /**
       * Created transfer data
       * @type {Object|null}
       */
      createdTransfer: null
    }
  },
  computed: {
    /**
     * Count active filters
     * @returns {Number}
     */
    activeFiltersCount () {
      let count = 0
      if (this.filters.dateRange) count++
      if (this.filters.originBranch) count++
      if (this.filters.destinationBranch) count++
      if (this.filters.status) count++
      return count
    },
    ...mapState(authentication, ['branchOffice']),
    /**
     * Check if verification can be confirmed
     * @returns {Boolean}
     */
    canConfirmVerification () {
      return this.verificationProducts.every(p => p.received_quantity !== null && p.received_quantity !== undefined)
    },
    /**
     * Check if user is super admin or root
     * @returns {Boolean}
     */
    isSuperAdmin () {
      const store = authentication()
      const user = store.userSession
      return user?.is_superadmin || user?.is_root
    },
    /**
     * Check if transfer has been verified
     * @returns {Boolean}
     */
    isTransferVerified () {
      return this.editMode && this.currentTransfer.verified_at !== null && this.currentTransfer.verified_at !== undefined
    },
    /**
     * Get product columns based on verification status
     * @returns {Array}
     */
    displayProductColumns () {
      if (this.isTransferVerified) {
        return this.productColumns.filter(col => col.name !== 'actions')
      }
      return this.productColumns
    },
    /**
     * Check if there are quantity discrepancies
     * @returns {Boolean}
     */
    hasQuantityDiscrepancies () {
      if (!this.isTransferVerified || !this.currentTransfer.products) {
        return false
      }
      return this.currentTransfer.products.some(p =>
        p.received_quantity !== null &&
        p.received_quantity !== undefined &&
        p.received_quantity !== p.quantity
      )
    },
    /**
     * Count products with discrepancies
     * @returns {Number}
     */
    discrepancyCount () {
      if (!this.isTransferVerified || !this.currentTransfer.products) {
        return 0
      }
      return this.currentTransfer.products.filter(p =>
        p.received_quantity !== null &&
        p.received_quantity !== undefined &&
        p.received_quantity !== p.quantity
      ).length
    },
    /**
     * Check if current user can edit the transfer (origin branch only)
     * @returns {Boolean}
     */
    canEditTransfer () {
      const store = authentication()
      const user = store.branchOffice

      // Super admin y root pueden editar siempre
      if (user?.is_superadmin || user?.is_root) {
        return true
      }

      // Solo la sucursal origen puede editar
      if (!this.currentTransfer?.origin_branch_office_id) {
        return false
      }

      return user?.id === this.currentTransfer.origin_branch_office_id
    },
    /**
     * Check if current user can verify the transfer (destination branch only)
     * @returns {Boolean}
     */
    canVerifyTransfer () {
      const store = authentication()
      const user = store.branchOffice

      // Solo la sucursal destino puede verificar
      if (!this.currentTransfer?.destination_branch_office_id) {
        return false
      }

      return user?.id === this.currentTransfer.destination_branch_office_id
    }
  },

  created () {
    /**
     * Set pagination
     * @param {Object} data pagination data
     */
    this.setPagination({
      pagination: this.pagination,
      filter: undefined
    })
  },

  mounted () {
    this.getTransfers(this.params)
    this.loadBranchOffices()
    this.initializeFromQueryParams()
  },

  watch: {
    /**
     * Watch search filter - applies immediately
     */
    'filters.search': function (value) {
      for (const key in this.params.dataSearch) {
        this.params.dataSearch[key] = value
      }
      this.getTransfers(this.params)
    }
  },

  methods: {
    /**
     * Initialize view from query params
     */
    async initializeFromQueryParams () {
      const { view, id } = this.$route.query

      if (!view || view === 'list') {
        this.currentView = 'list'
        return
      }

      if (!id && view !== 'add') {
        this.currentView = 'list'
        return
      }

      try {
        loading(true)

        switch (view) {
          case 'add':
            this.createNewTransferFromQuery()
            break
          case 'edit':
            await this.loadTransferForEdit(id)
            break
          case 'detail':
            await this.loadTransferForView(id)
            break
          case 'verify':
            await this.loadTransferForVerify(id)
            break
          case 'options':
            await this.loadTransferOptions(id)
            break
          default:
            this.currentView = 'list'
        }
      } catch (error) {
        console.error('Error loading from query params:', error)
        notify('Error al cargar la transferencia', 'negative', 'warning')
        this.currentView = 'list'
        this.$router.replace({ query: {} }).catch(() => {})
      } finally {
        loading(false)
      }
    },
    /**
     * Create new transfer from query params
     */
    createNewTransferFromQuery () {
      this.editMode = false
      this.currentView = 'form'
      this.clearForm()
      this.addProduct()
    },
    /**
     * Load transfer for editing
     * @param {Number} id transfer ID
     */
    async loadTransferForEdit (id) {
      const { data } = await api.get(`transfer-stocks/${id}`)
      this.editMode = true
      this.currentTransfer = { ...data }
      this.currentTransfer.products = data.products.map(p => ({
        id: p.id,
        product: p,
        quantity: p.pivot?.quantity || 0,
        cost: p.pivot?.cost || 0,
        stock: p.normal_stock || p.bundle_stock || 0,
        product_id: p.id
      }))
      this.currentView = 'form'
    },
    /**
     * Load transfer for viewing
     * @param {Number} id transfer ID
     */
    async loadTransferForView (id) {
      const { data } = await api.get(`transfer-stocks/${id}`)
      this.editMode = true
      this.currentTransfer = { ...data }
      this.currentTransfer.products = data.products.map(p => ({
        id: p.id,
        product: p,
        quantity: p.pivot?.quantity || 0,
        cost: p.pivot?.cost || 0,
        received_quantity: p.pivot?.received_quantity,
        verification_status: p.pivot?.verification_status,
        stock: p.normal_stock || p.bundle_stock || 0,
        product_id: p.id
      }))
      await this.loadStatusTimeline(id)
      this.currentView = 'form'
    },
    /**
     * Load transfer for verification
     * @param {Number} id transfer ID
     */
    async loadTransferForVerify (id) {
      const { data } = await api.get(`transfer-stocks/${id}`)
      this.currentTransfer = data
      this.verificationProducts = data.products.map(p => ({
        ...p,
        received_quantity: p.pivot.received_quantity || p.pivot.quantity
      }))
      this.currentView = 'verify'
    },
    /**
     * Load transfer options (from QR scan)
     * @param {Number} id transfer ID
     */
    async loadTransferOptions (id) {
      const { data } = await api.get(`transfer-stocks/${id}`)
      this.currentTransfer = data
      this.currentView = 'options'
    },
    /**
     * Set format date filter
     * @param {String} type type of date
     * @returns {Object} date filter
     */
    setFormatDateFilter (type) {
      const today = new Date()
      const todayFormat = date.formatDate(today, 'YYYY-MM-DD')
      const subtractFromDate = (options) => formatDate(date.subtractFromDate(today, options), 'YYYY-MM-DD')
      switch (type) {
        case 'today':
          return { from: date.formatDate(today, 'YYYY-MM-DD'), to: todayFormat }
        case 'lastWeek':
          return { from: subtractFromDate({ days: 7 }), to: todayFormat }
        case 'lastMonth':
          return { from: subtractFromDate({ months: 1 }), to: todayFormat }
        case 'lastQuarter':
          return { from: subtractFromDate({ months: 3 }), to: todayFormat }
        default:
          return null
      }
    },
    /**
     * Set pagination
     * @param {Object} data pagination data
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.pagination = data.pagination
      this.getTransfers(this.params)
    },
    /**
     * Clear form
     */
    clearForm () {
      this.currentTransfer = {
        origin_branch_office: this.branchOffice,
        destination_branch_office: null,
        // status: 'Borrador',
        observations: '',
        products: []
      }
    },
    /**
     * Create new transfer
     */
    createNewTransfer () {
      this.editMode = false
      this.currentView = 'form'
      this.clearForm()
      this.addProduct()
      // Update URL
      this.$router.push({ query: { view: 'add' } })
    },
    /**
     * Edit transfer
     * @param {Object} transfer transfer data
     */
    editTransfer (transfer) {
      this.editMode = true
      this.currentTransfer = { ...transfer }
      this.currentTransfer.products = transfer.products.map(p => ({
        id: p.id,
        product: p,
        quantity: p.pivot?.quantity || 0,
        cost: p.pivot?.cost || 0,
        stock: p.normal_stock || p.bundle_stock || 0,
        product_id: p.id
      }))
      this.currentView = 'form'
      // Update URL
      this.$router.push({ query: { view: 'edit', id: transfer.id } })
    },
    /**
     * View transfer
     * @param {Object} transfer transfer data
     */
    async viewTransfer (transfer) {
      this.editMode = true
      this.currentTransfer = { ...transfer }
      this.currentTransfer.products = transfer.products.map(p => ({
        id: p.id,
        product: p,
        quantity: p.pivot?.quantity || 0,
        cost: p.pivot?.cost || 0,
        received_quantity: p.pivot?.received_quantity,
        verification_status: p.pivot?.verification_status,
        stock: p.normal_stock || p.bundle_stock || 0,
        product_id: p.id
      }))

      // Cargar timeline de estados
      await this.loadStatusTimeline(transfer.id)

      this.currentView = 'form'
      // Update URL
      this.$router.push({ query: { view: 'detail', id: transfer.id } })
    },
    /**
     * Load status timeline
     * @param {Number} transferId transfer ID
     */
    async loadStatusTimeline (transferId) {
      try {
        loading(true)
        const { data } = await api.get(`transfer-stocks/${transferId}/status-timeline`)
        // Ordenar por ID de menor a mayor (cronológico)
        this.statusTimeline = (data.timeline || []).sort((a, b) => a.id - b.id)
      } catch (error) {
        console.error('Error loading timeline:', error)
        this.statusTimeline = []
      } finally {
        loading(false)
      }
    },
    /**
     * Set model data for transfer
     * @param {Object} data transfer data
     * @returns {Object} model data
     */
    transferModel (data) {
      return {
        origin_branch_office_id: data.origin_branch_office.id,
        destination_branch_office_id: data.destination_branch_office.id,
        observations: data.observations,
        status: 'in_process',
        products: data.products.map(p => ({
          product_id: p.product.id,
          quantity: p.quantity,
          cost: p.cost
        }))
      }
    },
    /**
     * Save transfer
     */
    async saveTransfer () {
      try {
        loading(true)
        if (this.currentTransfer.products.length === 0) return

        // Prevenir edición de transferencias entregadas
        if (this.editMode && this.isTransferVerified) {
          notify('No se puede editar una transferencia que ya ha sido entregada', 'negative', 'warning')
          return
        }

        if (this.editMode) {
          await api.put(`transfer-stocks/${this.currentTransfer.id}`, this.transferModel(this.currentTransfer))
          notify('Transferencia modificada exitosamente', 'positive', 'info')
          this.clearForm()
          this.currentView = 'list'
          this.getTransfers(this.params)
        } else {
          const { data } = await api.post('transfer-stocks', this.transferModel(this.currentTransfer))
          this.createdTransfer = data
          this.showSuccessModal = true
          this.clearForm()
          this.currentView = 'list'
          this.getTransfers(this.params)
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Show delete confirmation dialog
     * @param {Object} transfer transfer data
     */
    confirmDelete (transfer) {
      this.transferToDelete = transfer
      this.showDeleteDialog = true
    },
    /**
     * Delete transfer
     */
    async deleteTransfer () {
      try {
        loading(true)
        await api.delete(`transfer-stocks/${this.transferToDelete.id}`)
        this.showDeleteDialog = false
        this.transferToDelete = null
        this.getTransfers(this.params)
        notify('Transferencia eliminada exitosamente', 'positive', 'info')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },

    /**
     * Add product
     */
    addProduct () {
      this.currentTransfer.products.push({
        id: Date.now(), // ID temporal
        product: null,
        quantity: 1,
        cost: 0
      })
    },
    /**
     * Remove product
     * @param {Number} index index of product
     */
    removeProduct (index) {
      this.currentTransfer.products.splice(index, 1)
      this.updateTotals()
    },

    updateTotals () {
      // Este método se llama cuando cambian las cantidades o costos
      // No hace nada directamente, pero los totales se recalculan en tiempo real
    },

    /**
     * Get total products
     * @returns {Number} total products
     */
    getTotalProducts () {
      return this.currentTransfer.products.reduce((sum, product) => sum + (product.quantity || 0), 0)
    },
    /**
     * Get total value
     * @returns {Number} total value
     */
    getTotalValue () {
      return this.currentTransfer.products.reduce((sum, product) => {
        return sum + ((product.quantity || 0) * (product.cost || 0))
      }, 0)
    },
    /**
     * Format currency
     * @param {Number} value value
     * @returns {String} formatted value
     */
    formatCurrency (value) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(value)
    },
    /**
     * Get status color
     * @param {String} status status
     * @returns {String} status color
     */
    getStatusColor (status) {
      switch (status) {
        case 'in_process': return 'blue'
        case 'delivered': return 'green'
        case 'cancelled': return 'red'
        default: return 'grey'
      }
    },
    /**
     * Get status label in Spanish
     * @param {String} status status
     * @returns {String} status label
     */
    getStatusLabel (status) {
      switch (status) {
        case 'in_process': return 'En Proceso'
        case 'delivered': return 'Entregado'
        case 'cancelled': return 'Cancelado'
        default: return status
      }
    },
    /**
     * Generate transfer id
     * @returns {String} transfer id
     */
    exportData (format) {
      // Simulación de exportación
      console.log(`Exportando datos en formato ${format}...`)
      // En una aplicación real, aquí iría la lógica de exportación
    },
    /**
     * Load branch offices (initial load)
     */
    async loadBranchOffices () {
      try {
        const { data } = await api.get('branch-offices')
        this.branchOptions = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get branch office (for q-select filter)
     * @param {String} value branch office name
     * @param {Function} update update function
     */
    async getBranchOffice (value, update) {
      try {
        const { data } = await api.get('branch-offices', {
          params: {
            dataSearch: {
              name: value
            }
          }
        })
        update(() => {
          this.branchOptions = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get products
     * @param {String} value product name
     * @param {Function} update update function
     */
    async getProducts (value, update) {
      try {
        const { data } = await api.get('products', {
          params: {
            stock: true,
            branch_office_id: this.currentTransfer?.origin_branch_office?.id,
            dataSearch: {
              name: value,
              barcode: value
            }
          }
        })
        update(() => {
          this.productOptions = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Set products
     * @param {Object} value product
     * @param {Object} row transfer stock
     */
    setProducts (value, row) {
      row.cost = value.cost
      row.stock = value.normal_stock || value.bundle_stock
      row.product_id = value.id
      this.updateTotals()
    },
    /**
     * Get transfers
     * @param {Object} params params
     */
    async getTransfers (params = this.params) {
      try {
        const { data } = await api.get('transfer-stocks', { params })
        this.transfers = data.data
        this.pagination.rowsNumber = data.total
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Open QR scanner dialog
     */
    async openQrScanner () {
      // Si es dispositivo móvil nativo, usar el escáner de cámara
      if (this.$q.platform.is.nativeMobile) {
        await this.startScanner()
      } else {
        // En web, mostrar el diálogo de búsqueda manual
        this.showQrScanner = true
        this.manualSearchQuery = ''
      }
    },
    /**
     * Start camera scanner for QR codes
     */
    async startScanner () {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          scanInstructions: 'Escanear código QR de transferencia',
          scanButton: false,
          scanText: 'Scan',
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
          android: {
            scanningLibrary: CapacitorBarcodeScannerAndroidScanningLibrary.ZXING
          }
        })

        if (result.ScanResult) {
          await this.processScannedQR(result.ScanResult)
        }
      } catch (error) {
        if (error instanceof Error && error.message !== 'User cancelled') {
          notify('Error al escanear el código QR', 'negative', 'warning')
        }
      }
    },
    /**
     * Process scanned QR code
     * @param {String} qrData QR code data
     */
    async processScannedQR (qrData) {
      try {
        loading(true)
        // Intentar parsear como JSON (QR generado por el sistema)
        let transferId = null
        try {
          const parsed = JSON.parse(qrData)
          if (parsed.type === 'transfer_stock' && parsed.id) {
            transferId = parsed.id
          }
        } catch {
          // Si no es JSON, asumir que es el número de transferencia
          transferId = qrData
        }

        if (!transferId) {
          notify('Código QR inválido', 'negative', 'warning')
          return
        }

        // Buscar la transferencia usando el endpoint de búsqueda
        const { data } = await api.get(`transfer-stocks/search/${encodeURIComponent(qrData)}`)

        // Verificar si la transferencia ya está entregada
        if (data.status === 'delivered' || data.verified_at !== null) {
          // Si está entregada, mostrar el detalle (solo lectura)
          await this.viewTransfer(data)
        } else {
          // Si no está entregada, abrir vista de verificación
          this.openVerificationView(data)
        }
      } catch (error) {
        notify(error.response?.data?.message || 'Transferencia no encontrada', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Search transfer manually by number
     */
    async searchTransferManually () {
      if (!this.manualSearchQuery) return
      try {
        loading(true)
        const { data } = await api.get(`transfer-stocks/${this.manualSearchQuery}`)
        this.showQrScanner = false

        // Verificar si la transferencia ya está entregada
        if (data.status === 'delivered' || data.verified_at !== null) {
          // Si está entregada, mostrar el detalle (solo lectura)
          await this.viewTransfer(data)
        } else {
          // Si no está entregada, abrir vista de verificación
          this.openVerificationView(data)
        }
      } catch (error) {
        notify(error.response?.data?.message || 'Transferencia no encontrada', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Open verification view for a transfer
     * @param {Object} transfer transfer data
     */
    openVerificationView (transfer) {
      this.currentTransfer = transfer
      this.verificationProducts = transfer.products.map(p => ({
        ...p,
        received_quantity: p.pivot.received_quantity || p.pivot.quantity
      }))
      this.currentView = 'verify'
      // Update URL
      this.$router.push({ query: { view: 'verify', id: transfer.id } }).catch(() => {})
    },
    /**
     * Confirm verification of received products
     */
    async confirmVerification () {
      try {
        loading(true)
        const products = this.verificationProducts.map(p => ({
          product_id: p.id,
          received_quantity: p.received_quantity,
          verification_status: p.received_quantity === p.pivot.quantity ? 'verified' : 'partial'
        }))

        await api.post(`transfer-stocks/${this.currentTransfer.id}/verify`, { products })
        notify('Verificación completada exitosamente', 'positive', 'check_circle')
        this.currentView = 'list'
        this.$router.push({ query: {} }).catch(() => {})
        this.getTransfers(this.params)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Get verification status text
     * @param {Object} product product data
     * @returns {String} status text
     */
    getVerificationStatus (product) {
      if (product.received_quantity === null || product.received_quantity === undefined) {
        return 'Pendiente'
      }
      if (product.received_quantity === product.pivot.quantity) {
        return 'Completo'
      }
      if (product.received_quantity < product.pivot.quantity) {
        return 'Parcial'
      }
      return 'Excedente'
    },
    /**
     * Get verification color
     * @param {Object} product product data
     * @returns {String} color
     */
    getVerificationColor (product) {
      if (product.received_quantity === null || product.received_quantity === undefined) {
        return 'grey'
      }
      if (product.received_quantity === product.pivot.quantity) {
        return 'positive'
      }
      if (product.received_quantity < product.pivot.quantity) {
        return 'warning'
      }
      return 'info'
    },
    /**
     * Get quantity comparison class for styling
     * @param {Object} product product data
     * @returns {String} CSS class
     */
    getQuantityComparisonClass (product) {
      if (product.received_quantity === null || product.received_quantity === undefined) {
        return 'text-grey-7'
      }
      if (product.received_quantity === product.quantity) {
        return 'text-positive'
      }
      if (product.received_quantity < product.quantity) {
        return 'text-warning'
      }
      return 'text-info'
    },
    /**
     * Get badge color for quantity difference
     * @param {Object} product product data
     * @returns {String} color
     */
    getQuantityBadgeColor (product) {
      if (product.received_quantity < product.quantity) {
        return 'warning'
      }
      return 'info'
    },
    /**
     * Get quantity difference text
     * @param {Object} product product data
     * @returns {String} difference text
     */
    getQuantityDifference (product) {
      const diff = product.received_quantity - product.quantity
      if (diff < 0) {
        return `Faltante: ${Math.abs(diff)}`
      }
      return `Excedente: ${diff}`
    },
    /**
     * Check if transfer is delivered
     * @param {Object} transfer transfer data
     * @returns {Boolean}
     */
    isTransferDelivered (transfer) {
      return transfer.status === 'delivered' || transfer.verified_at !== null
    },
    /**
     * Check if current user can edit a transfer row (origin branch only)
     * @param {Object} transfer transfer data
     * @returns {Boolean}
     */
    canEditTransferRow (transfer) {
      const store = authentication()
      const user = store.userSession
      const branchOffice = store.branchOffice

      // Super admin y root pueden editar siempre
      if (user?.is_superadmin || user?.is_root) {
        return true
      }

      // Solo la sucursal origen puede editar
      if (!transfer?.origin_branch_office_id) {
        return false
      }

      return branchOffice?.id === transfer.origin_branch_office_id
    },
    /**
     * Check if current user can verify a transfer row (destination branch only)
     * @param {Object} transfer transfer data
     * @returns {Boolean}
     */
    canVerifyTransferRow (transfer) {
      const store = authentication()
      const branchOffice = store.branchOffice

      // Solo la sucursal destino puede verificar
      if (!transfer?.destination_branch_office_id) {
        return false
      }

      return branchOffice?.id === transfer.destination_branch_office_id
    },
    /**
     * Handle touch start for long press (mobile)
     * @param {Event} event touch event
     * @param {Object} row row data
     */
    handleTouchStart (event, row) {
      this.longPressTimer = setTimeout(() => {
        this.selectedRow = row
        this.showRowMenu = true
        // Vibrar si está disponible
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }, 500) // 500ms para activar el long press
    },
    /**
     * Handle touch end (cancel long press)
     */
    handleTouchEnd () {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    /**
     * Download PDF of transfer
     * @param {Object} transfer transfer data
     */
    async downloadPdf (transfer) {
      try {
        loading(true)
        const fileName = `transferencia-${transfer.transfer_number}.pdf`

        // Usar descarga web tradicional que aparece en notificaciones
        await this.downloadPdfWeb(transfer, fileName)
      } catch (error) {
        console.error('Download error:', error)
        notify('Error al descargar PDF', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Download PDF using web method (appears in notifications)
     * @param {Object} transfer transfer data
     * @param {String} fileName file name
     */
    async downloadPdfWeb (transfer, fileName) {
      const response = await api.get(`transfer-stocks/${transfer.id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

      // Limpiar después de un momento
      setTimeout(() => {
        link.remove()
        window.URL.revokeObjectURL(url)
      }, 100)

      notify('PDF descargado. Revisa tus notificaciones.', 'positive', 'download')
    },
    /**
     * Share PDF of transfer (Mobile & Desktop)
     * Usa Capacitor Share + Filesystem en móvil, Web Share API en navegador
     * @param {Object} transfer transfer data
     */
    async sharePdf (transfer) {
      try {
        loading(true)

        const fileName = `transferencia-${transfer.transfer_number}.pdf`

        // MÓVIL NATIVO: Usar Capacitor Share + Filesystem
        if (this.$q.platform.is.nativeMobile || this.$q.platform.is.capacitor) {
          try {
            // Verificar si Capacitor está disponible
            if (!window.Capacitor) {
              throw new Error('Capacitor not available')
            }

            // Importar módulos de Capacitor dinámicamente
            const [shareModule, filesystemModule] = await Promise.all([
              import('@capacitor/share'),
              import('@capacitor/filesystem')
            ])

            const { Share } = shareModule
            const { Filesystem, Directory } = filesystemModule

            // Descargar el PDF
            const response = await api.get(`transfer-stocks/${transfer.id}/pdf`, {
              responseType: 'blob'
            })

            // Convertir blob a base64
            const base64Data = await this.blobToBase64(response.data)

            // Guardar archivo temporalmente
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Cache
            })

            // Compartir usando Share API de Capacitor
            await Share.share({
              title: `Transferencia #${transfer.transfer_number}`,
              text: `Transferencia de ${transfer.origin_branch_office?.name} a ${transfer.destination_branch_office?.name}`,
              url: savedFile.uri,
              dialogTitle: 'Compartir Transferencia'
            })

            notify('PDF compartido exitosamente', 'positive', 'share')
          } catch (capacitorError) {
            console.error('Capacitor share error:', capacitorError)

            // Si el usuario canceló, no mostrar error
            if (capacitorError.message && capacitorError.message.toLowerCase().includes('cancel')) {
              return
            }

            // Si Capacitor no está disponible, usar Web Share API
            await this.shareWithWebAPI(transfer, fileName)
          }
        } else {
          // WEB/DESKTOP: Usar Web Share API
          await this.shareWithWebAPI(transfer, fileName)
        }
      } catch (error) {
        console.error('Share PDF error:', error)
        notify('Error al compartir PDF: ' + (error.message || 'Error desconocido'), 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Share using Web Share API (fallback for web/desktop)
     * @param {Object} transfer transfer data
     * @param {String} fileName file name
     */
    async shareWithWebAPI (transfer, fileName) {
      if (navigator.share) {
        try {
          // Descargar el blob
          const response = await api.get(`transfer-stocks/${transfer.id}/pdf`, {
            responseType: 'blob'
          })
          const blob = response.data
          const file = new File([blob], fileName, { type: 'application/pdf' })

          // Verificar si puede compartir archivos
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Transferencia #${transfer.transfer_number}`,
              text: `Transferencia de ${transfer.origin_branch_office?.name} a ${transfer.destination_branch_office?.name}`,
              files: [file]
            })
            notify('PDF compartido exitosamente', 'positive', 'share')
          } else {
            // Intentar compartir solo texto/URL
            const pdfUrl = `${process.env.VITE_APP_API_URL.replace('/api/', '')}/transfer-stocks/${transfer.id}/pdf`
            await navigator.share({
              title: `Transferencia #${transfer.transfer_number}`,
              text: `Transferencia de ${transfer.origin_branch_office?.name} a ${transfer.destination_branch_office?.name}\n\nDescargar PDF: ${pdfUrl}`
            })
            notify('Enlace compartido exitosamente', 'positive', 'share')
          }
        } catch (shareError) {
          console.error('Web share error:', shareError)
          if (shareError.name !== 'AbortError') {
            // Fallback: descargar el archivo
            await this.downloadPdf(transfer)
            notify('Compartir no disponible. PDF descargado.', 'info', 'info')
          }
        }
      } else {
        // Si no hay Web Share API, descargar directamente
        await this.downloadPdf(transfer)
        notify('Compartir no disponible en este navegador. PDF descargado.', 'info', 'info')
      }
    },
    /**
     * Convert blob to base64
     * @param {Blob} blob blob data
     * @returns {Promise<String>} base64 string without prefix
     */
    blobToBase64 (blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          // Remover el prefijo "data:application/pdf;base64,"
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    },
    /**
     * Get breadcrumb label based on current view
     * @returns {String} breadcrumb label
     */
    getBreadcrumbLabel () {
      if (this.currentView === 'verify') {
        return `Verificar #${this.currentTransfer.transfer_number || ''}`
      } else if (this.currentView === 'form') {
        if (this.editMode) {
          return `Editar #${this.currentTransfer.id || ''}`
        }
        return 'Nueva Transferencia'
      } else if (this.currentView === 'detail') {
        return `Detalle #${this.currentTransfer.transfer_number || ''}`
      }
      return ''
    },
    /**
     * Get breadcrumb subtitle
     * @returns {String} subtitle
     */
    getBreadcrumbSubtitle () {
      if (this.currentTransfer.origin_branch_office && this.currentTransfer.destination_branch_office) {
        return `${this.currentTransfer.origin_branch_office.name} → ${this.currentTransfer.destination_branch_office.name}`
      }
      return ''
    },
    /**
     * Go back to previous view
     */
    goBack () {
      this.currentView = 'list'
      this.clearForm()
      this.$router.replace({ query: {} }).catch(() => {})
    },
    /**
     * Apply filters and close drawer
     */
    applyFilters () {
      // Apply date range filter
      if (this.filters.dateRange) {
        const dateFilter = this.setFormatDateFilter(this.filters.dateRange)
        this.params.dateFilter = {
          field: 'created_at',
          ...dateFilter
        }
      } else {
        this.params.dateFilter = null
      }

      // Apply branch and status filters
      this.params.dataEqualFilter = {
        ...this.params.dataEqualFilter,
        origin_branch_office_id: this.filters.originBranch,
        destination_branch_office_id: this.filters.destinationBranch,
        status: this.filters.status
      }

      // Execute search
      this.getTransfers(this.params)

      // Close drawer
      this.showFiltersDrawer = false
    },
    /**
     * Clear all filters
     */
    clearAllFilters () {
      this.filters.dateRange = null
      this.filters.originBranch = null
      this.filters.destinationBranch = null
      this.filters.status = null
      this.applyFilters()
    },
    /**
     * Get date range label
     * @param {String} value date range value
     * @returns {String} label
     */
    getDateRangeLabel (value) {
      const option = this.dateRangeOptions.find(opt => opt.value === value)
      return option ? option.label : value
    },
    /**
     * Get branch name by ID
     * @param {Number} id branch ID
     * @returns {String} branch name
     */
    getBranchName (id) {
      const branch = this.branchOptions.find(b => b.id === id)
      return branch ? branch.name : 'Desconocido'
    },
    /**
     * Get status icon for timeline
     * @param {String} status status
     * @returns {String} icon name
{{ ... }}
     */
    getStatusIcon (status) {
      switch (status) {
        case 'in_process': return 'local_shipping'
        case 'delivered': return 'check_circle'
        case 'cancelled': return 'cancel'
        default: return 'circle'
      }
    },
    /**
     * Get status color for timeline
     * @param {String} status status
     * @returns {String} color
     */
    getStatusTimelineColor (status) {
      switch (status) {
        case 'in_process': return 'blue'
        case 'delivered': return 'positive'
        case 'cancelled': return 'negative'
        default: return 'grey'
      }
    },
    /**
     * Get total duration from first to last status
     * @returns {String} total duration
     */
    getTotalDuration () {
      if (this.statusTimeline.length < 2) return '0 segundos'

      const first = new Date(this.statusTimeline[0].changed_at)
      const last = new Date(this.statusTimeline[this.statusTimeline.length - 1].changed_at)
      const diffSeconds = Math.abs(Math.floor((last - first) / 1000))

      if (diffSeconds < 60) {
        return `${diffSeconds} segundos`
      } else if (diffSeconds < 3600) {
        return `${Math.round(diffSeconds / 60)} minutos`
      } else if (diffSeconds < 86400) {
        return `${(diffSeconds / 3600).toFixed(1)} horas`
      } else {
        return `${(diffSeconds / 86400).toFixed(1)} días`
      }
    },
    /**
     * Get node position in timeline
     * @param {Number} index node index
     * @returns {String} position percentage
     */
    getNodePosition (index) {
      const total = this.statusTimeline.length - 1
      if (total === 0) return '50%'
      const percentage = (index / total) * 100
      return `${percentage}%`
    },
    /**
     * View created transfer - Load full data first
     */
    async viewCreatedTransfer () {
      try {
        this.showSuccessModal = false
        if (this.createdTransfer?.id) {
          loading(true)
          // Cargar datos completos de la transferencia
          const { data } = await api.get(`transfer-stocks/${this.createdTransfer.id}`)
          await this.viewTransfer(data)
        }
      } catch (error) {
        notify('Error al cargar la transferencia', 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Download PDF of created transfer
     */
    async downloadCreatedTransferPdf () {
      if (this.createdTransfer?.id) {
        await this.downloadPdf(this.createdTransfer)
      }
    },
    /**
     * Share PDF of created transfer
     */
    async shareCreatedTransferPdf () {
      if (this.createdTransfer?.id) {
        await this.sharePdf(this.createdTransfer)
      }
    },
    /**
     * Close success modal
     */
    closeSuccessModal () {
      this.showSuccessModal = false
      this.createdTransfer = null
    },
    /**
     * Increment quantity
     * @param {Object} item item object
     * @param {String} field field name
     * @param {Number} max maximum value
     */
    incrementQuantity (item, field, max = null) {
      if (!item[field]) {
        item[field] = 0
      }
      if (max && item[field] >= max) {
        return
      }
      item[field]++
    },
    /**
     * Decrement quantity
     * @param {Object} item item object
     * @param {String} field field name
     */
    decrementQuantity (item, field) {
      if (!item[field] || item[field] <= 0) {
        return
      }
      item[field]--
    }
  }
}
</script>

<style scoped>
.transfer-page {
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid var(--q-separator-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb-header {
  border-bottom: 1px solid var(--q-separator-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb-header .q-breadcrumbs {
  font-size: 14px;
}

.breadcrumb-header .cursor-pointer:hover {
  text-decoration: underline;
}

.modern-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.q-table thead tr th {
  font-weight: 600;
}

.q-table tbody tr {
  transition: background-color 0.2s ease;
}

.q-table tbody tr:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

body.body--dark .q-table tbody tr:hover {
  background-color: rgba(25, 118, 210, 0.15);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .page-header {
    padding: 12px !important;
  }

  .q-table th:nth-child(3),
  .q-table th:nth-child(4),
  .q-table td:nth-child(3),
  .q-table td:nth-child(4) {
    display: none;
  }

  .modern-card {
    border-radius: 8px;
  }
}

@media (min-width: 601px) {
  .mobile-only {
    display: none !important;
  }
}

/* Verification view styles */
.q-item {
  transition: all 0.2s ease;
}

.q-item:hover {
  background: rgba(25, 118, 210, 0.03);
}

/* Animation for cards */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-card {
  animation: fadeIn 0.3s ease;
}

/* QR Scanner styles */
.q-dialog__backdrop {
  backdrop-filter: blur(4px);
}

/* Status badges */
.q-badge {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Responsive table improvements */
@media (max-width: 1024px) {
  .q-table {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .q-table {
    font-size: 12px;
  }

  .q-btn {
    min-height: 40px;
  }
}

/* Touch-friendly buttons on mobile */
@media (hover: none) and (pointer: coarse) {
  .q-btn {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Verification View Styles */
.verification-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 132px); /* 100vh - altura breadcrumbs (57px + border 1px + padding) */
  overflow: hidden;
}

.verification-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch; /* Smooth scroll en iOS */
}

.verification-footer {
  flex-shrink: 0;
  min-height: 68px; /* Altura del botón + padding */
  padding: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.product-verification-list {
  max-width: 600px;
  margin: 0 auto;
}

.product-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

body.body--dark .product-card:hover {
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

/* Success Modal - Modern Design */
.success-modal-modern {
  border-radius: 24px;
  min-width: 360px;
  max-width: 420px;
  overflow: hidden;
  position: relative;
}

/* Fondo con gradiente animado */
.success-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.05;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.08; }
}

/* Contenedor del icono con círculos animados */
.success-icon-container {
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

.success-circle-1,
.success-circle-2,
.success-circle-3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #21ba45;
  opacity: 0;
}

.success-circle-1 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out;
}

.success-circle-2 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out 0.2s;
}

.success-circle-3 {
  width: 100px;
  height: 100px;
  animation: ripple 1.5s ease-out 0.4s;
}

@keyframes ripple {
  0% {
    width: 100px;
    height: 100px;
    opacity: 0.6;
  }
  100% {
    width: 180px;
    height: 180px;
    opacity: 0;
  }
}

/* Avatar con animación */
.success-avatar {
  background: linear-gradient(135deg, #21ba45 0%, #1a9e3a 100%) !important;
  box-shadow: 0 8px 24px rgba(33, 186, 69, 0.4);
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 1;
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Icono check con animación de dibujo */
.success-check-icon {
  animation: checkDraw 0.5s ease-out 0.3s both;
}

@keyframes checkDraw {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Título con animación */
.success-title {
  animation: slideUp 0.5s ease-out 0.4s both;
}

.success-subtitle {
  animation: slideUp 0.5s ease-out 0.5s both;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Botones con efectos */
.action-btn-primary {
  position: relative;
  overflow: hidden;
  border-radius: 12px !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out 0.6s both;
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.action-btn-primary:active {
  transform: translateY(0);
}

/* Efecto shine en botón principal */
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20%, 100% { left: 100%; }
}

.action-btn-secondary {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out 0.7s both;
}

.action-btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn-close {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out 0.8s both;
  border-width: 2px !important;
}

.action-btn-close:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.05);
}

body.body--dark .action-btn-close:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Confetti decorativo */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -10px;
  border-radius: 50%;
  animation: confettiFall 3s ease-out forwards;
  opacity: 0;
}

.confetti:nth-child(2n) {
  background: linear-gradient(135deg, #21ba45 0%, #1a9e3a 100%);
  animation-delay: 0.1s;
}

.confetti:nth-child(3n) {
  background: linear-gradient(135deg, #f2c94c 0%, #f2994a 100%);
  animation-delay: 0.2s;
}

.confetti:nth-child(4n) {
  width: 6px;
  height: 6px;
  animation-delay: 0.15s;
}

@keyframes confettiFall {
  0% {
    top: -10px;
    opacity: 1;
    transform: translateX(0) rotate(0deg);
  }
  100% {
    top: 100%;
    opacity: 0;
    transform: translateX(calc(var(--random-x, 0) * 50px)) rotate(720deg);
  }
}

/* Dark mode adjustments */
body.body--dark .success-bg-gradient {
  opacity: 0.1;
}

body.body--dark .action-btn-primary:hover {
  box-shadow: 0 8px 16px rgba(255, 255, 255, 0.1);
}

body.body--dark .action-btn-secondary:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.08);
}

/* Options View Styles */
.options-view {
  max-width: 600px;
  margin: 0 auto;
}

.options-card {
  border-radius: 16px;
  overflow: hidden;
}

.options-list {
  padding: 0;
}

.option-item {
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  padding: 12px;
}

.option-item:hover {
  background: rgba(0, 0, 0, 0.03);
  transform: translateX(4px);
}

body.body--dark .option-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.option-item .q-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 600px) {
  .options-view {
    padding: 8px !important;
  }

  .options-card .q-card-section {
    padding: 16px;
  }
}

/* Empty State */
.empty-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state .q-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.compact-input .q-field__control {
  min-height: 40px;
}

.compact-input .q-field__label {
  font-size: 12px;
}

/* Mobile optimizations for verification */
@media (max-width: 600px) {
  .verification-header .text-h6 {
    font-size: 16px;
  }

  .product-card {
    margin-bottom: 8px;
  }

  .verification-content {
    padding: 8px;
  }

  .verification-footer {
    padding: 10px;
  }

  .compact-input {
    font-size: 14px;
  }
}

/* Improve input visibility on mobile */
.compact-input input {
  font-size: 16px !important;
  text-align: center;
  font-weight: bold;
}

/* Badge improvements */
.q-badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Transfer Route Display (Mobile-friendly) */
.transfer-route-display {
  width: 100%;
}

.route-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.branch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.branch-info.origin {
  justify-content: flex-start;
}

.branch-info.destination {
  justify-content: flex-end;
  text-align: right;
}

.route-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Search Bar & Filters - Modern Design */
.search-bar-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.filter-btn {
  position: relative;
}

.active-filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* Filters Drawer */
.filters-drawer {
  background: var(--q-dark-page);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .search-bar-container {
    gap: 8px;
  }
}

/* Mobile Transfer Cards - Compactas */
.mobile-transfers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Mobile Product Form Cards */
.product-form-card-mobile {
  border-radius: 8px;
  border-left: 3px solid var(--q-primary);
}

.product-form-card-mobile .q-field--dense .q-field__control {
  min-height: 36px;
}

.product-form-card-mobile .q-field--dense .q-field__label {
  font-size: 12px;
}

.product-form-card-mobile .subtotal-input .q-field__control {
  font-weight: bold;
  color: var(--q-primary);
}

.transfer-card-mobile {
  border-radius: 8px;
  border-left: 4px solid var(--q-primary);
  transition: all 0.2s ease;
}

.transfer-card-mobile:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.transfer-card-mobile .q-card__section {
  padding: 8px 12px;
}

.transfer-card-mobile .text-body2 {
  font-size: 14px;
  line-height: 1.2;
}

.transfer-card-mobile .text-caption {
  font-size: 11px;
  line-height: 1.3;
}

.transfer-card-mobile .q-badge {
  font-size: 10px;
  padding: 2px 6px;
}

.transfer-card-mobile .q-icon {
  vertical-align: middle;
}

/* Mobile Product Cards - Diseño Mejorado */
.product-card-mobile {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  border: 1px solid #e0e0e0;
}

.product-card-mobile:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.product-header-mobile {
  border-left: 4px solid #1976d2;
  padding-left: 12px;
}

/* Cantidades lado a lado */
.quantities-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quantity-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.2s ease;
}

.quantity-box.sent {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #90caf9;
}

.quantity-box.received {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-color: #ce93d8;
}

.quantity-box.received.text-positive {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-color: #81c784;
}

.quantity-box.received.text-warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-color: #ffb74d;
}

.quantity-box.received.text-info {
  background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
  border-color: #4fc3f7;
}

.quantity-icon {
  margin-bottom: 8px;
  opacity: 0.7;
}

.quantity-content {
  text-align: center;
  width: 100%;
}

.quantity-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
}

.quantity-number {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

/* Financial Row - Costo y Subtotal lado a lado */
.financial-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}

.financial-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.financial-label {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.financial-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.financial-divider {
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, transparent 0%, #ddd 50%, transparent 100%);
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .route-container {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }

  .branch-info {
    width: 100%;
    justify-content: flex-start !important;
    text-align: left !important;
  }

  .route-arrow {
    transform: rotate(90deg);
  }

  .product-header-mobile .text-h6 {
    font-size: 16px;
  }

  .quantity-number {
    font-size: 20px;
  }

  .financial-value {
    font-size: 16px;
  }

  .financial-row {
    padding: 10px;
    gap: 12px;
  }

  .financial-divider {
    height: 35px;
  }
}

/* Timeline Horizontal Styles */
.timeline-horizontal-container {
  padding: 20px 0;
  width: 100%;
}

.timeline-circles-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 20px;
  width: 100%;
}

.circle-with-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.circle-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-circle {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: 4px solid white;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  flex: 1;
  padding: 0 10px;
  padding-top: 25px;
}

.connecting-line-h {
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
}

.duration-label-h {
  position: absolute;
  top: -25px;
  background: #1976d2;
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.info-block {
  text-align: center;
  max-width: 120px;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.info-user {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Quantity Comparison Styles */
.quantity-comparison {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}

.sent-quantity {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #1976d2;
}

.received-quantity {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #21ba45;
}

.received-quantity.text-warning {
  border-left-color: #f2c037;
}

.received-quantity.text-info {
  border-left-color: #31ccec;
}

.received-quantity.text-grey-7 {
  border-left-color: #9e9e9e;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .timeline-circle {
    width: 44px !important;
    height: 44px !important;
    border: 3px solid white;
  }

  .circle-with-info {
    gap: 8px;
  }

  .connecting-line-h {
    width: 40px;
  }

  .line-wrapper {
    padding: 0 5px;
    padding-top: 22px;
  }

  .duration-label-h {
    font-size: 9px;
    padding: 2px 6px;
  }

  .info-block {
    max-width: 80px;
  }

  .info-title {
    font-size: 12px;
  }

  .info-date {
    font-size: 10px;
  }

  .info-user {
    font-size: 9px;
  }
}
</style>
