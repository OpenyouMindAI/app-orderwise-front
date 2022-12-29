<template>
  <q-page padding>
    <div class="row q-col-gutter-sm">
      <div class="col-4" v-for="total in totals" :key="total.id">
        <q-card class="my-card bg-secondary text-white relative">
          <q-card-section class="q-py-xs">
            <div class="text-h6">{{ total.name }}</div>
            <div class="text-subtitle2">{{ total.coin_symbol }}{{ total.paymentTotal }}</div>
            <q-checkbox v-model="paymentMethods" :val="total.id" class="absolute-top-right"/>
          </q-card-section>
        </q-card>
        <q-tooltip class="bg-orange text-body2" :offset="[10, 10]">
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
      </div>
      <q-dialog
        v-model="dialogFilter"
        position="right"
        seamless
        full-height
      >
        <q-card class="column full-height" style="width: 300px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Filtros</div>
          </q-card-section>

          <q-card-section class="col q-pt-sm q-gutter-sm">
            <q-input filled v-model="from" hint="Desde" type="date"/>
            <q-input filled v-model="to" hint="Hasta" type="date"/>
          </q-card-section>

          <q-card-actions align="center" class="bg-white text-teal">
            <q-btn color="negative" icon="close" v-close-popup />
            <q-btn color="primary" icon="search" @click="filterDate" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="filter_alt" color="primary" @click="dialogFilter = true"/>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { date } from 'quasar'
export default {
  // name: 'PageName',
  data: () => {
    return {
      from: date.formatDate(Date(), 'YYYY-MM-DD'),
      to: date.formatDate(Date(), 'YYYY-MM-DD'),
      paymentMethods: [],
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
      invoicePayments: []
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
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  created () {
    this.getPaymentTotals()
  },
  methods: {
    viewPayment (data) {
      console.log(data)
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
      this.params.dateFilter = {
        to: this.to,
        from: this.from,
        field: 'created_at'
      }
      this.getInvoicePayments(this.params)
      this.getPaymentTotals()
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
    getPaymentTotals (whereIn = []) {
      this.$api.get('reports/payment-totals', {
        params: {
          to: this.to,
          from: this.from
        }
      })
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
