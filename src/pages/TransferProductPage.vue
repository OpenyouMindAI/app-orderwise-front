<template>
  <q-page class="transfer-page">
    <!-- Mobile-First Header -->
    <div class="page-header q-pa-md" v-if="currentView === 'list'">
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
            v-if="isSuperAdmin"
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
    <div class="breadcrumb-header q-pa-md" v-else>
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="goBack"
        />
        <div class="col">
          <q-breadcrumbs class="text-grey-8">
            <q-breadcrumbs-el label="Transferencias" @click="currentView = 'list'" class="cursor-pointer" />
            <q-breadcrumbs-el :label="getBreadcrumbLabel()" />
          </q-breadcrumbs>
          <div class="text-caption text-grey-7" v-if="currentView === 'verify' || (currentView === 'form' && editMode)">
            {{ getBreadcrumbSubtitle() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Listado de Transferencias -->
    <div v-if="currentView === 'list'" class="q-pa-md">
      <!-- Filtros modernos y responsivos -->
      <q-card flat bordered class="q-mb-md modern-card">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model="filters.search"
                label="Buscar"
                dense
                outlined
                clearable
                placeholder="Nº documento"
                debounce="500"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filters.dateRange"
                label="Rango de fechas"
                dense
                outlined
                clearable
                emit-value
                map-options
                :options="dateRangeOptions"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filters.originBranch"
                label="Sucursal origen"
                dense
                outlined
                clearable
                emit-value
                map-options
                option-label="name"
                option-value="id"
                :options="branchOptions"
                @filter="getBranchOffice"
              >
                <template v-slot:prepend>
                  <q-icon name="store" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-select
                v-model="filters.destinationBranch"
                label="Sucursal destino"
                dense
                outlined
                clearable
                emit-value
                map-options
                option-label="name"
                option-value="id"
                :options="branchOptions"
                @filter="getBranchOffice"
              >
                <template v-slot:prepend>
                  <q-icon name="store" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-table
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
            <div class="row no-wrap q-gutter-xs justify-center">
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
              <q-btn
                v-if="props.row.status === 'in_process'"
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
              <q-btn
                flat
                round
                dense
                color="info"
                icon="picture_as_pdf"
                @click="downloadPdf(props.row)"
                size="sm"
              >
                <q-tooltip>Descargar PDF</q-tooltip>
              </q-btn>
              <q-btn
                v-if="isSuperAdmin"
                flat
                round
                dense
                color="amber"
                icon="edit"
                @click="editTransfer(props.row)"
                size="sm"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                v-if="isSuperAdmin"
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
                size="sm"
              >
                <q-tooltip>Eliminar</q-tooltip>
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
        <q-card flat bordered>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="currentTransfer.origin_branch_office"
                  :options="branchOptions"
                  label="Sucursal de origen *"
                  outlined
                  option-label="name"
                  option-value="id"
                  :rules="[val => !!val || 'Este campo es obligatorio']"
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
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Productos a transferir</div>

            <div class="q-mb-md">
              <q-table
                :rows="currentTransfer.products"
                :columns="productColumns"
                row-key="id"
                hide-pagination
                :rows-per-page-options="[0]"
                flat
                bordered
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
                        :rules="[
                          val => val > 0 || 'La cantidad debe ser mayor a 0'
                        ]"
                        @update:model-value="updateTotals"
                      />
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

            <div class="row justify-between q-mb-md">
              <q-btn
                color="primary"
                icon="add"
                label="Agregar producto"
                @click="addProduct"
                outline
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

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              label="Confirmar envío"
              color="primary"
              type="submit"
              :disable="currentTransfer.products.length === 0"
            />
          </q-card-actions>
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
      <div class="verification-header q-pa-md bg-primary text-white">
        <div class="text-h6 q-mb-xs">Transferencia #{{ currentTransfer.transfer_number }}</div>
        <div class="text-caption">{{ currentTransfer.origin_branch_office?.name }} → {{ currentTransfer.destination_branch_office?.name }}</div>
      </div>

      <div class="verification-content q-pa-sm">
        <div class="text-caption text-grey-7 q-pa-sm">
          Verifica los productos recibidos
        </div>

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
                    <template v-slot:append>
                      <q-btn
                        flat
                        dense
                        round
                        icon="done_all"
                        color="positive"
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
        <q-btn
          label="Confirmar Recepción"
          color="primary"
          icon-right="check_circle"
          @click="confirmVerification"
          :disable="!canConfirmVerification"
          class="full-width"
          unelevated
          size="lg"
        />
      </div>
    </div>

    <!-- QR Scanner Dialog -->
    <q-dialog v-model="showQrScanner" position="bottom">
      <q-card style="width: 100%; max-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Escanear QR de Transferencia</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="qr_code_scanner" size="120px" color="primary" />
            <div class="text-subtitle2 q-mt-md text-grey-7">
              Coloca el código QR frente a la cámara
            </div>
          </div>

          <!-- Manual Search Option -->
          <q-separator class="q-my-md" />
          <div class="text-subtitle2 q-mb-sm">O busca manualmente:</div>
          <q-input
            v-model="manualSearchQuery"
            label="Número de transferencia"
            outlined
            dense
            @keyup.enter="searchTransferManually"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                icon="search"
                color="primary"
                @click="searchTransferManually"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" flat color="grey" v-close-popup />
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
  </q-page>
</template>

<script>
import { notify, loading, formatDate } from 'src/const/mixins'
import { api } from 'src/boot/axios'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { date } from 'quasar'
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
      verificationProducts: []
    }
  },
  computed: {
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
    }
  },
  watch: {
    /**
     * Set search filter
     * @param {String} value search value
     */
    'filters.search': function (value) {
      for (const key in this.params.dataSearch) {
        this.params.dataSearch[key] = value
      }
      this.getTransfers(this.params)
    },
    /**
     * Set date filter
     * @param {String} value date range
     */
    'filters.dateRange': function (value) {
      const dateFilter = this.setFormatDateFilter(value)
      this.params.dateFilter = {
        field: 'created_at',
        ...dateFilter
      }
      this.getTransfers(this.params)
    },
    'filters.originBranch': function (value) {
      this.params.dataEqualFilter = {
        ...this.params.dataEqualFilter,
        origin_branch_office_id: value
      }
      this.getTransfers(this.params)
    },
    'filters.destinationBranch': function (value) {
      this.params.dataEqualFilter = {
        ...this.params.dataEqualFilter,
        destination_branch_office_id: value
      }
      this.getTransfers(this.params)
    }
    // 'filters.status': function (value) {
    //   this.params.dataEqualFilter = {
    //     ...this.params.dataEqualFilter,
    //     status: value
    //   }
    //   this.getTransfers(this.params)
    // }
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

  methods: {
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
        stock: p.normal_stock || p.bundle_stock || 0,
        product_id: p.id
      }))

      // Cargar timeline de estados
      await this.loadStatusTimeline(transfer.id)

      this.currentView = 'form'
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
        if (this.editMode) {
          await api.put(`transfer-stocks/${this.currentTransfer.id}`, this.transferModel(this.currentTransfer))
          notify('Transferencia modificada exitosamente', 'positive', 'info')
        } else {
          await api.post('transfer-stocks', this.transferModel(this.currentTransfer))
          notify('Transferencia guardada exitosamente', 'positive', 'info')
        }
        this.clearForm()
        this.getTransfers(this.params)
        this.currentView = 'list'
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Delete transfer
     * @param {Object} transfer transfer data
     */
    async confirmDelete (transfer) {
      try {
        loading(true)
        await api.delete(`transfer-stocks/${transfer.id}`)
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
     * Get branch office
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
    openQrScanner () {
      this.showQrScanner = true
      this.manualSearchQuery = ''
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
        this.openVerificationView(data)
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
     * Download PDF of transfer
     * @param {Object} transfer transfer data
     */
    async downloadPdf (transfer) {
      try {
        loading(true)
        const response = await api.get(`transfer-stocks/${transfer.id}/pdf`, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `transferencia-${transfer.transfer_number}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        notify('PDF descargado exitosamente', 'positive', 'download')
      } catch (error) {
        notify('Error al descargar PDF', 'negative', 'warning')
      } finally {
        loading(false)
      }
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
    },
    /**
     * Get status icon for timeline
     * @param {String} status status
     * @returns {String} icon name
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
    }
  }
}
</script>

<style scoped>
.transfer-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
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
  transition: all 0.3s ease;
}

.modern-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.q-table__card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.q-table thead tr th {
  font-weight: 600;
  background: #f8f9fa;
}

.q-table tbody tr {
  transition: background-color 0.2s ease;
}

.q-table tbody tr:hover {
  background-color: rgba(25, 118, 210, 0.05);
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
  height: 100vh;
  background: #f5f5f5;
}

.verification-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.verification-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.verification-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.product-verification-list {
  max-width: 600px;
  margin: 0 auto;
}

.product-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
}

.product-card:active {
  transform: scale(0.98);
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
