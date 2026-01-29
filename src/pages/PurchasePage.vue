<template>
  <q-page padding>
    <div class="q-gutter-sm">
      <!-- <div class="full-width text-right q-gutter-sm">
        <q-btn
          class="text-right"
          icon="download"
          color="teal"
          round
        >
          <q-popup-proxy>
            <q-banner>
              <q-list>
                <q-item
                  style="border-radius: 10px;"
                  v-ripple
                  clickable
                  @click="downloadPurchaseExcel"
                >
                  <q-item-section thumbnail>
                    <q-icon name="archive" class="q-ml-sm"/>
                  </q-item-section>
                  <q-item-section>
                    Excel de facturas
                  </q-item-section>
                </q-item>
                <q-item v-ripple style="border-radius: 10px;" clickable>
                  <q-item-section thumbnail>
                    <q-icon name="archive" class="q-ml-sm"/>
                  </q-item-section>
                  <q-item-section>
                    Facturas electrónicas
                  </q-item-section>
                </q-item>
              </q-list>
            </q-banner>
          </q-popup-proxy>
        </q-btn>
        <q-btn
          class="text-right"
          icon="filter_alt"
          color="primary"
          round
          @click="dialogFilter = true"
        />
      </div> -->
      <div class="row justify-between items-center">
        <span class="text-h6">
          Lista de compras
        </span>
      </div>
      <q-table
        title="Lista de compras"
        row-key="name"
        :columns="columns"
        :rows="purchases"
        :loading="visible"
        :filter="filter"
        :visible-columns="visibleColumns"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="editPurchase"
        @request="setPagination"
        no-data-label="Registro no encontrado"
        :grid="$q.screen.lt.md"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top>
          <div class="flex justify-between items-center full-width">
            <q-select
              v-model="visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="columns"
              option-value="name"
              options-cover
            />
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card
              class="cursor-pointer q-hoverable no-shadow transition-all purchase-card"
              style="border-radius: 16px; border: 1px solid #eef0f3"
              @click="editPurchase(null, props.row)"
            >
              <span class="q-focus-helper"></span>

              <q-card-section class="compact-card-section">
                <!-- Fila 1: Código y Fecha -->
                <div class="row justify-between items-start q-mb-sm">
                  <div class="col">
                    <div class="text-body2 text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ props.row.invoice_type?.name || 'Sin tipo' }}</div>
                    <div class="text-h6 text-indigo-10 text-weight-bold" style="letter-spacing: -0.5px">
                      {{ props.row.purchase_code || '—' }}
                    </div>
                  </div>
                  <div class="col-auto text-right">
                    <div class="text-body2 text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; margin-bottom: 4px">Fecha</div>
                    <div class="text-body1 text-grey-8 text-weight-medium">{{ props.row.created_at?.split('T')[0] || '—' }}</div>
                  </div>
                </div>

                <q-separator color="grey-3" class="q-my-sm" />

                <!-- Fila 3: Proveedor y Total -->
                <div class="row justify-between ">
                  <div class="col">
                    <div class="text-body2 text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; margin-bottom: 0.7rem">Proveedor</div>
                    <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.provider?.name || '—' }}</div>
                  </div>
                  <div class="col-auto text-right">
                    <div class="text-body2 text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px; margin-bottom: 4px">Total</div>
                    <div class="text-h6 text-primary text-weight-bolder" style="letter-spacing: -0.5px">{{ formatNumber(props.row.total) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="openEditPurchase" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 1000px; max-width: 85vw;'}`"
        >
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditPurchase = false" />
        </q-card-section>
        <q-card-section class="scroll col" style="max-height: 90vh">
          <div class="row q-col-gutter-md">
            <div class="col-xl-7 col-lg-7 col-md-7 col-sm-7 col-xs-12 row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  label="Código de factura"
                  filled
                  v-model="purchase.purchase_code"
                  readonly
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  label="Código de comprobante"
                  filled
                  v-model="purchase.purchase_number"
                  readonly
                  dense
                />
              </div>
              <div class="col-6">
                <q-select
                  use-input
                  filled
                  dense
                  label="Tipo de factura"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  readonly
                  v-model="purchase.invoice_type"
                  :rules="[val => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-6">
                <q-input
                  label="Proveedor"
                  filled
                  v-model="purchase.provider.name"
                  readonly
                  dense
                />
              </div>
              <div class="col-4">
                <q-input
                  label="Moneda"
                  filled
                  :model-value="purchase?.coin?.name"
                  readonly
                  dense
                />
              </div>
              <div class="col-4">
                <q-input
                  label="Fecha"
                  filled
                  :model-value="formatDate(purchase.created_at)"
                  readonly dense
                />
              </div>
              <div class="col-4">
                <q-input
                  label="Hora"
                  filled
                  :model-value="formatDate(purchase.created_at, 'HH:mm:ss')"
                  readonly
                  dense
                />
              </div>
              <div class="col-12">
                <q-expansion-item
                  icon="list"
                  label="Artículos"
                  :caption="`Total: ${formatNumber(purchase.total)}`"
                  style="border-radius: 10px"
                  class="shadow-1 overflow-hidden"
                  default-opened
                >
                  <q-card>
                    <q-card-section class="q-pa-xs">
                      <q-markup-table dense>
                        <thead>
                          <tr>
                            <th class="text-left">Código</th>
                            <th class="text-left">Descripción</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="product in purchase.products" :key="product.id">
                            <td class="text-left">
                              {{ product.barcode }}
                            </td>
                            <td class="text-left">
                              {{ product.name.slice(0, 15) }} ...
                              <q-tooltip class="text-subtitle1">{{ product.name }}</q-tooltip>
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.quantity) }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.quantity *  product.pivot.cost) }}
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>
            <div class="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-xs-12 q-gutter-y-sm">
            <div class="col-12" v-if="purchase.images && purchase.images.length > 0">
                <q-card class="q-mb-sm">
                  <q-card-section class="q-pa-xs">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">Archivos Adjuntos</div>
                    <div class="row q-col-gutter-sm scroll q-pa-sm" style="max-height: 200px;">
                      <div
                        v-for="(file, index) in purchase.images"
                        :key="index"
                        class="col-6 col-sm-4 col-md-4"
                      >
                        <!-- PDF View -->
                        <q-card
                          v-if="file.url && file.url.toLowerCase().endsWith('.pdf')"
                          flat
                          bordered
                          class="cursor-pointer text-center q-pa-sm fit flex flex-center column"
                          style="aspect-ratio: 1;"
                          @click="openFile(file.url)"
                        >
                          <q-icon name="picture_as_pdf" size="3rem" color="red" />
                          <div class="text-caption ellipsis full-width q-mt-xs">{{ file.path ? file.path.split('/').pop() : 'Documento PDF' }}</div>
                          <q-tooltip>Ver PDF</q-tooltip>
                        </q-card>
                        <!-- Image View -->
                        <q-card
                          v-else
                          flat
                          class="image-preview-card cursor-pointer"
                          @click="openFile(file.url)"
                        >
                          <q-img
                            :src="file.url"
                            :ratio="1"
                            class="rounded-borders"
                          />
                          <q-tooltip>Ver Imagen</q-tooltip>
                        </q-card>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <q-expansion-item
                  label="Pagos"
                  :caption="`Total: ${formatNumber(purchase.total_payments)}`"
                  style="border-radius: 10px"
                  class="shadow-1 overflow-hidden"
                  default-opened
                >
                  <q-card>
                    <q-card-section class="q-pa-xs">
                      <q-markup-table dense>
                        <thead>
                          <tr>
                            <th class="text-left">Método de pago</th>
                            <th class="text-right">Monto</th>
                            <th class="text-right">Fecha de pago</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(payment) in purchase.payments" :key="payment.id">
                            <td class="text-left">
                              {{ payment.payment_method.name }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(payment.amount) }}
                            </td>
                            <td class="text-right">
                              {{ formatDate(payment.created_at) }}
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
              <div class="q-gutter-y-xs">
                <q-btn
                  class="full-width"
                  icon="block"
                  color="negative"
                  label="Anular"
                  :loading="cancelLoading"
                  @click="cancelPurchase"
                />
                <q-btn
                  class="full-width"
                  icon="check_circle"
                  color="primary"
                  label="Pagar"
                  v-if="purchase.balance > 0"
                  @click="addPaymentDialog = true"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="visibleLoading">
      <q-knob
        :step="10"
        v-model="loadingDownload"
        show-value
        size="90px"
        :thickness="0.22"
        color="lime"
        track-color="lime-3"
        class="text-lime q-ma-md"
      />
    </q-inner-loading>
  </q-page>
</template>

<script>
import { Notify, date, is } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatNumber, formatDate, notify } from 'src/const/mixins'
import { getDownload } from 'src/const/services'
export default {
  data () {
    return {
      formatDate,
      loadingDownload: 0,
      /**
       * Value knob
       * @type {Number}
       */
      dialogFilter: false,
      /**
       * Loading provider status
       * @type {Boolean}
       */
      loadingProvider: false,
      /**
       * Visible columns
       * @type {Array}
       */
      visibleColumns: ['purchase_code', 'invoice_type', 'provider', 'seller', 'created_at', 'total'],
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Dialog provider status
       * @type {Boolean}
       */
      openAddProvider: false,
      /**
       * Taxe translate
       * @type {Object}
       */
      taxeTranslate: {
        percentage: '%'
      },
      /**
       * Provider form data
       * @type {Object}
       */
      provider: {},
      /**
       * Edit tab
       * @type {String}
       */
      editTab: 'details',
      /**
       * Purchases list table
       * @type {Array}
       */
      purchases: [],
      /**
       * Purchase data selected
       * @type {Object}
       */
      purchase: null,
      /**
       * Coin data
       * @type {Object}
       */
      coin: {},
      /**
       * Cancel loading
       * @type {Boolean}
       */
      cancelLoading: false,
      /**
       * Filter
       * @type {String}
       */
      filter: '',
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
          created_at: '',
          'coin.name': '',
          'PurchaseType.name': '',
          'provider.name': ''
        }
      },
      /**
       * Loading table
       * @type {Boolean}
       */
      visible: false,
      /**
       * Open add purchase dialog
       * @type {Boolean}
       */
      openAddPurchase: false,
      /**
       * Open edit purchase dialog
       * @type {Object}
       */
      openEditPurchase: null,
      /**
       * Table columns
       * @type {Array}
       */
      columns: [
        {
          name: 'purchase_number',
          align: 'left',
          label: 'Número de comprobante',
          field: 'purchase_number',
          format: row => row || '-',
          sortable: true
        },
        {
          name: 'purchase_code',
          align: 'left',
          label: 'Código de factura',
          field: 'purchase_code',
          format: row => row || '-',
          sortable: true
        },
        {
          name: 'invoice_type',
          align: 'left',
          label: 'Tipo de servicio',
          field: row => row?.invoice_type?.name
        },
        {
          name: 'provider',
          align: 'left',
          label: 'Proveedor',
          field: row => row.provider?.name
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin?.name
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Fecha',
          field: row => date.formatDate(row.created_at, 'DD/MM/YYYY'),
          sortable: true
        },
        {
          name: 'hour_at',
          align: 'left',
          label: 'Hora',
          field: row => date.formatDate(row.created_at, 'H:mm:ss'),
          sortable: true
        },
        // {
        //   name: 'tax_base',
        //   align: 'right',
        //   label: 'Subtotal',
        //   field: 'tax_base',
        //   sortable: true
        // },
        // {
        //   name: 'total_taxe',
        //   align: 'right',
        //   label: 'Igv',
        //   field: 'total_taxe',
        //   sortable: true
        // },
        {
          name: 'total',
          align: 'right',
          label: 'Total',
          field: 'total',
          format: val => formatNumber(val)
        }
      ],
      /**
       * Pagination config
       * @type {Object}
       */
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      /**
       * Purchase types
       * @type {Array}
       */
      PurchaseTypes: []
    }
  },
  computed: {
    visibleLoading () {
      console.log(this.loadingDownload)
      return this.loadingDownload > 0
    },
    totalBill () {
      const sum = this.purchase.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
      return sum + this.purchase.total
    },
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    branchOffice (data) {
      this.getPurchases(this.params)
    }
  },
  methods: {
    downloadPurchaseExcel () {
      getDownload(
        'excel/purchases',
        {
          params: {
            dataEqualFilter: {
              branch_office_id: this.branchOffice?.id
            }
          }
        },
        (percentCompleted) => {
          this.loadingDownload = percentCompleted
          if (percentCompleted === 100) {
            this.loadingDownload = 0
          }
        },
        (link) => {
          link.setAttribute(
            'download',
            'Purchases.xlsx'
            // `Recibos de cobro: Desde ${proxyDate.value.from} Hasta ${proxyDate.value.to}.xlsx`
          )
          document.body.appendChild(link)
          link.click()
        }
      )
    },
    /**
     * Calculate taxe
     * @param {Object} taxe taxe
     */
    calculateTaxe (taxe) {
      if (taxe.pivot.type_taxe === 'percentage') {
        taxe.total = (this.purchase.total * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.purchase.total + taxe.pivot.amount
      }
      return taxe.total
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterPurchaseTypes (value, update) {
      this.$api.get('Purchase-types', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.PurchaseTypes = data
          })
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddPurchase = false
      this.openEditPurchase = false
      this.coin = {}
    },
    /**
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getPurchases(this.params)
    },
    /**
     * Get all purchases
     */
    getPurchases (params = this.params) {
      this.visible = true
      this.$api.get('purchases', {
        params: {
          ...params,
          dataEqualFilter: {
            branch_office_id: this.branchOffice?.id
          }
        }
      })
        .then(({ data }) => {
          this.purchases = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setPagination (data) {
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getPurchases(this.params)
    },
    /**
     * Save purchases
     */
    savePurchase () {
      this.visible = true
      this.$api.post('purchases', this.purchase)
        .then(({ data }) => {
          this.getPurchases()
          this.openAddPurchase = false
          this.visible = false
          this.purchase = {}
          Notify.create({
            message: 'Factura creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View purchase data
     * @param {Object} event event
     * @param {Object} row row
     * @param {Number} index index
     */
    editPurchase (event, row, index) {
      this.openEditPurchase = true
      this.purchase = {
        ...row,
        images: row.files || []
      }
    },
    /**
     * Model product
     * @param {Object} data product
     */
    modelData (data, put = false) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key]
          if (element && is.object(element)) {
            data[`${key}_id`] = element.id
          }
        }
      }
      return data
    },
    /**
     * Edit purchase
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`purchases/${this.purchase.id}`, this.modelData(this.purchase))
        .then(({ data }) => {
          this.getPurchases()
          this.openEditPurchase = false
          this.visible = false
          this.purchase = null
          Notify.create({
            message: 'Factura editada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete purchase
     */
    deletePurchase () {
      this.visible = true
      this.$api.delete(`purchases/${this.purchase.id}`)
        .then(({ data }) => {
          this.getPurchases()
          this.openEditPurchase = false
          this.visible = false
          this.purchase = null
          Notify.create({
            message: 'Factura eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    // File Handling Methods
    openFile (url) {
      if (url) {
        window.open(url, '_blank')
      }
    },
    /**
     * Change status
     * @param {Object} data purchase
     * @param {Number} index index status
     */
    async cancelPurchase () {
      try {
        this.cancelLoading = true
        await this.$api.put(`purchase-status-command/${this.purchase.id}`, { status: 'cancelled' })
        this.getPurchases()
        notify('Factura anulada exitosamente', 'positive', 'check_circle')
        this.openEditPurchase = false
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cancelLoading = false
      }
    }
  }
}
</script>

<style scoped>
.image-preview-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.image-preview-card:hover {
  transform: scale(1.05);
}

/* Tarjetas de compras */
.purchase-card {
  transition: all 0.2s ease;
}

.purchase-card:hover {
  border-color: #d0d5dd !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

/* Padding compacto consistente con InvoicePage */
.compact-card-section {
  padding: 0.5rem 1rem !important;
}

/* Media query para optimizar header en mobile */
@media (max-width: 1023px) {
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }
  :deep(.q-table__top .q-select) {
    max-width: 200px;
  }
  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
