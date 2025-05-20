<template>
  <div class="q-pa-md">
    <div class="column q-gutter-sm">
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
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top-left>
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
            style="min-width: 150px"
          />
        </template>
        <template v-slot:top-right>
          <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
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
  </div>
</template>

<script>
import { Notify, date, is } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatNumber, formatDate } from 'src/const/mixins'
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
      this.purchase = row
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
    }
  }
}
</script>
