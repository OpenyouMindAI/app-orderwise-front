<template>
  <q-page padding>
    <!-- <div class="row q-col-gutter-sm"> -->
      <!-- <div class="col-4" v-for="total in totals" :key="total.id">
        <q-card class="my-card bg-secondary text-white relative">
          <q-card-section class="q-py-xs">
            <div class="text-h6">{{ total.name }}</div>
            <div class="text-subtitle2">{{ total.coin_symbol }}{{ total.paymentTotal }}</div>
            <q-checkbox v-model="paymentMethods" :val="total.id" class="absolute-top-right"/>
          </q-card-section>
        </q-card>
        <q-tooltip class="bg-secondary text-body2" :offset="[10, 10]">
          {{ total.coin_name }}
        </q-tooltip>
      </div>
      <div class="col-12">
        <q-table
          title="Lista de pagos"
          row-key="name"
          :columns="columns"
          :rows="invoicePayments"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="viewPayment"
          @request="setPagination"
          no-data-label="Registro no encontrado"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top-right>
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div> -->

    <!-- </div> -->
    <div class="row full-width q-col-gutter-sm">
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px; min-width: 350px;"
          icon="receipt_long"
          header-class="bg-secondary text-white"
          expand-icon-class="text-white"
          default-opened
          :label="`Pagos de contado ${formatNumber(paymentMethodTotals.payment_total)}`"
        >
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item v-for="payment in paymentMethodTotals.payment_method_totals" :key="payment.id">
                  <q-item-section>
                    <q-item-label>{{ payment.payment_method_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(payment.payment_total) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item>
                  <q-item-section>
                    <q-item-label>Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(paymentMethodTotals.payment_total) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px; min-width: 350px;"
          icon="receipt_long"
          header-class="bg-secondary text-white"
          expand-icon-class="text-white"
          default-opened
          :label="`Tipo de servicio ${formatNumber(typeOfServicesTotals.payment_total)}`"
        >
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item v-for="payment in typeOfServicesTotals.payment_method_totals" :key="payment.id">
                  <q-item-section>
                    <q-item-label>{{ payment.type_of_service_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(payment.payment_total) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item>
                  <q-item-section>
                    <q-item-label>Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(typeOfServicesTotals.payment_total) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px; min-width: 350px;"
          icon="list_alt"
          header-class="bg-secondary text-white"
          expand-icon-class="text-white"
          default-opened
          :label="`Ventas por departamento: ${formatNumber(categoryTotalsTotals.category_total)}`"
        >
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item v-for="payment in categoryTotalsTotals.categories_totals" :key="payment.id">
                  <q-item-section>
                    <q-item-label>{{ payment.category_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(payment.total_sales) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item>
                  <q-item-section>
                    <q-item-label>Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(categoryTotalsTotals.category_total) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <q-expansion-item
          class="shadow-1 overflow-hidden"
          style="border-radius: 30px; min-width: 350px;"
          icon="list_alt"
          header-class="bg-secondary text-white"
          expand-icon-class="text-white"
          default-opened
          :label="`Flujo de dinero: ${formatNumber(cashflows.cashflow_totals)}`"
        >
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item v-for="cashFlow in cashflows.cashflow_total" :key="cashFlow.id">
                  <q-item-section>
                    <q-item-label>{{ translate[cashFlow.type_cashflow] }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(cashFlow.totals) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item>
                  <q-item-section>
                    <q-item-label>Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(cashflows.cashflow_totals) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
    <q-footer class="q-pa-md justify-between flex" style="position: fixed; bottom: 0;">
      <span class="text-h6">
        {{formatDate(new Date(), 'DD/MM/YYYY')}}
      </span>
      <span class="text-h6">
        VENTAS TOTALES:
        {{ formatNumber(categoryTotalsTotals.category_total + cashflows.cashflow_totals) }}
      </span>
    </q-footer>
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
      full-height
    >
      <q-card class="column full-height" style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Filtros</div>
        </q-card-section>

        <q-card-section class="col q-pt-sm q-gutter-md">
          <q-select
            use-input
            filled
            label="Vendedor"
            input-debounce="0"
            option-value="id"
            v-model="seller"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="sellers"
            @filter="filterSellers"
          />
          <q-option-group
            v-model="panel"
            inline
            :options="[
              { label: 'Dia', value: 'day' },
              { label: 'Entre fechas', value: 'between' }
            ]"
          />
          <q-tab-panels v-model="panel" animated class="shadow-2 rounded-borders">
            <q-tab-panel name="between" class="q-gutter-sm">
              <div class="text-h6">Filtrar entre fechas</div>
              <q-input filled v-model="from" hint="Desde" type="date"/>
              <q-input filled v-model="to" hint="Hasta" type="date"/>
            </q-tab-panel>
            <q-tab-panel name="day" class="q-gutter-sm">
              <div class="text-h6">Filtrar por dia y horas</div>
              <q-input filled v-model="day" hint="Fecha del dia" type="date"/>
              <q-input filled v-model="fromHours" hint="Desde" type="time"/>
              <q-input filled v-model="toHours" hint="Hasta" type="time"/>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="center" class="bg-white text-teal">
          <q-btn color="negative" icon="close" v-close-popup />
          <q-btn color="primary" icon="search" @click="filterDate" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="filter_alt" color="primary" @click="dialogFilter = true"/>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { date, Notify } from 'quasar'
import { formatDate, formatNumber } from 'src/const/mixins'
export default {
  // name: 'PageName',
  data: () => {
    return {
      formatDate,
      panel: 'day',
      day: date.formatDate(Date(), 'YYYY-MM-DD'),
      fromHours: null,
      toHours: null,
      formatNumber,
      translate: {
        debit: 'Entrada',
        credit: 'Salida'
      },
      from: date.formatDate(Date(), 'YYYY-MM-DD'),
      to: date.formatDate(Date(), 'YYYY-MM-DD'),
      paymentMethods: [],
      cashflows: [],
      dialogFilter: false,
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
        dateFilter: {
          field: 'created_at',
          from: date.formatDate(Date(), 'YYYY-MM-DD'),
          to: date.formatDate(Date(), 'YYYY-MM-DD')
        },
        dataSearch: {
          id: '',
          'coin.name': '',
          'paymentMethod.name': '',
          created_at: '',
          amount: ''
        }
      },
      visible: false,
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'inovice_code',
          align: 'left',
          label: 'Factura',
          field: row => row.invoice.code
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Fecha',
          field: 'date',
          sortable: true
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Hora',
          field: 'hour',
          sortable: true
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin.name
        },
        {
          name: 'payment_method',
          align: 'left',
          label: 'Metodo de pago',
          field: row => row.payment_method.name
        },
        {
          name: 'amount',
          align: 'left',
          label: 'Monto',
          field: 'amount',
          sortable: true
        }
      ],
      /**
       * Total all
       * @type {Array}
       */
      totals: [],
      /**
       * Payment all
       * @type {Array}
       */
      invoicePayments: [],
      /**
       * Payment all
       * @type {Array}
       */
      typeOfServicesTotals: {},
      /**
       * Payment all
       * @type {Array}
       */
      paymentMethodTotals: {},
      /**
       * Payment all
       * @type {Array}
       */
      categoryTotalsTotals: {},
      /**
       * Sellers
       * @type {Array}
       */
      sellers: [],
      /**
       * Selected seller
       * @type {Object}
       */
      seller: null
    }
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    paymentMethods (val) {
      this.params.whereIn = {
        payment_method_id: val
      }
      this.getInvoicePayments(this.params)
    }
  },
  // mounted () {
  //   this.setPagination({
  //     pagination: this.paginationConfig,
  //     filter: undefined
  //   })
  // },
  created () {
    this.filterDate()
  },
  methods: {
    viewPayment (data) {
      console.log(data)
    },
    /**
     * Get all sellers
     */
    filterSellers (value, update) {
      this.$api.get('sellers', {
        params: {
          dataSearch:
          { name: value, document_number: value }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.sellers = data.data
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
     * Search beneficiary
     * @param  {Object}
     */
    searchData (data) {
      for (const dataSearch in this.params.dataSearch) {
        this.params.dataSearch[dataSearch] = data
      }
      this.params.page = 1
      this.getInvoicePayments(this.params)
    },
    filterDate () {
      let params = {}
      if (this.panel === 'day') {
        params = {
          day: this.day,
          fromHours: this.fromHours,
          toHours: this.toHours
        }
      } else {
        params = {
          to: this.to,
          from: this.from
        }
      }
      this.getCategoryTotals(params)
      this.getPaymentMethodTotals(params)
      this.getPaymentTotals(params)
      this.getCashflowTotals(params)
      this.getTypeOfServicesTotals(params)
    },
    getCashflowTotals (params) {
      this.$api.get('reports/cashflow-totals', { params })
        .then(({ data }) => {
          this.cashflows = data
        })
        .catch(err => {
          console.error(err.message)
        })
    },
    getTypeOfServicesTotals (params) {
      this.$api.get('reports/type-of-services-totals', { params })
        .then(({ data }) => {
          this.typeOfServicesTotals = data
        })
        .catch(err => {
          console.error(err.message)
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
      this.getInvoicePayments(this.params)
    },
    /**
     * Get total all
     */
    getPaymentTotals (params) {
      this.$api.get('reports/payment-totals', { params })
        .then(({ data }) => {
          this.totals = data
        })
        .catch(err => {
          console.error(err.message)
        })
    },
    /**
     * Get total all
     */
    getPaymentMethodTotals (params) {
      this.$api.get('reports/payment-method-totals', { params })
        .then(({ data }) => {
          this.paymentMethodTotals = data
        })
        .catch(err => {
          console.error(err.message)
        })
    },
    /**
     * Get total all
     */
    getCategoryTotals (params) {
      this.$api.get('reports/category-totals', { params })
        .then(({ data }) => {
          this.categoryTotalsTotals = data
        })
        .catch(err => {
          console.error(err.message)
        })
    },
    /**
     * Get total all
     */
    getInvoicePayments (params = this.params) {
      this.visible = true
      this.$api.get('invoice-payments', { params })
        .then(({ data }) => {
          this.invoicePayments = data.data
          this.visible = false
        })
        .catch(err => {
          console.error(err.message)
          this.visible = false
        })
    }
  }
}
</script>
