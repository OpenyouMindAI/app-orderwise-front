<template>
  <div class="q-pa-md">
    <div class="row q-gutter-y-sm justify-between">
      <div class="col-lg-6 col-md-6 col-sm-12 q-pa-sm">
        <span class="text-h6">Cuentas por cobrar</span>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 text-subtitle1 flex justify-end items-center q-gutter-x-sm">
        <q-badge class="text-subtitle2" color="secondary">
          {{ branchOffice?.name }}
        </q-badge>
        <q-btn icon="filter_alt" color="primary" @click="dialogFilter = true" round size="sm" />
      </div>
      <div class="row full-width col-12 q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
          <q-card class="text-negative">
            <q-card-section horizontal>
              <q-card-section class="full-width"> Por cobrar </q-card-section>
              <q-card-section class="text-right full-width">
                {{ formatNumber(totals?.total_owed || 0) }}
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
          <q-card class="text-positive">
            <q-card-section horizontal>
              <q-card-section class="full-width"> Cobrado </q-card-section>
              <q-card-section class="text-right full-width">
                {{ formatNumber(totals?.total_paid || 0) }}
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
          <q-card class="text-blue">
            <q-card-section horizontal>
              <q-card-section class="full-width"> Balance </q-card-section>
              <q-card-section class="text-right full-width">
                {{ formatNumber(totals?.balance || 0) }}
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="col-12 q-pa-sm">
        <q-table
          v-model:pagination="paginationConfig"
          row-key="id"
          :columns="columns"
          :rows="clients"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          no-data-label="Registro no encontrado"
          @request="setPagination"
          @row-click="editClient"
        >
          <template #loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template #top-right>
            <q-input v-model="filter" filled dense debounce="500" placeholder="Buscar">
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="opeDetails" maximized>
      <q-card>
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-subtitle1">
            Estado de cuenta: {{ client.document_number }} {{ client.name }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="opeDetails = false" />
        </q-card-section>
        <q-card-section class="q-px-sm">
          <div class="row full-width col-12 q-col-gutter-sm">
            <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <q-card class="text-negative">
                <q-card-section horizontal>
                  <q-card-section class="full-width"> Por cobrar </q-card-section>
                  <q-card-section class="text-right full-width">
                    {{ formatNumber(totals?.total_owed || 0) }}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <q-card class="text-positive">
                <q-card-section horizontal>
                  <q-card-section class="full-width"> Cobrado </q-card-section>
                  <q-card-section class="text-right full-width">
                    {{ formatNumber(totals?.total_paid || 0) }}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <q-card class="text-blue">
                <q-card-section horizontal>
                  <q-card-section class="full-width"> Balance </q-card-section>
                  <q-card-section class="text-right full-width">
                    {{ formatNumber(totals?.balance || 0) }}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-py-xs">
          <q-table
            v-model:pagination="salePagination"
            row-key="id"
            :columns="saleColumns"
            :rows="sales"
            :loading="visible"
            :filter="filter"
            binary-state-sort
            no-data-label="Registro no encontrado"
            @request="setSalePagination"
          >
            <template #loading>
              <q-inner-loading showing color="primary" />
            </template>
            <template #top-right>
              <q-input v-model="filter" filled dense debounce="500" placeholder="Buscar">
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogFilter"
      position="right"
      seamless
      full-height
    >
      <q-card class="column full-height" style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white flex justify-between items-center">
          <div class="text-h6">Filtros</div>
          <q-btn icon="close" flat round dense @click="dialogFilter = false" />
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
            clearable
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

        <q-card-actions align="right">
          <q-btn color="negative" icon="filter_alt_off" @click="clearFilter" label="Limpiar" />
          <q-btn color="primary" icon="filter_alt" @click="filterDate" label="Filtrar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { date, Notify } from 'quasar'
import { formatNumber, formatDate, notify, loading } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
export default {
  name: 'AccountPayablePage',
  data () {
    return {
      formatNumber,
      opeDetails: false,
      dialogFilter: false,
      panel: 'day',
      client: {},
      clients: [],
      sellers: [],
      sales: [],
      seller: null,
      filter: '',
      fromHours: '00:00',
      toHours: '23:59',
      day: date.formatDate(Date(), 'YYYY-MM-DD'),
      from: date.formatDate(Date(), 'YYYY-MM-DD'),
      to: date.formatDate(Date(), 'YYYY-MM-DD'),
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
          name: '',
          document_number: ''
        }
      },
      /**
       * Params search
       * @type {Object}
       */
      saleParams: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 1,
        dataSearch: {
          id: ''
        }
      },
      visible: false,
      totals: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'total_owed',
          align: 'right',
          label: 'Monto a cobrar',
          field: 'total_owed',
          sortable: true,
          format: row => formatNumber(row)
        },
        {
          name: 'total_paid',
          align: 'right',
          label: 'Monto cobrado',
          field: 'total_paid',
          sortable: true,
          format: row => formatNumber(row)
        },
        {
          name: 'balance',
          align: 'right',
          label: 'Balance',
          field: 'balance',
          sortable: true,
          format: row => formatNumber(row)
        }
      ],
      saleColumns: [
        {
          name: 'code',
          align: 'left',
          label: 'Nro Comprobante',
          field: 'code',
          sortable: true
        },
        {
          name: 'date',
          align: 'left',
          label: 'Fecha del documento',
          field: 'date',
          format: row => formatDate(`${row} 00:00`),
          sortable: true
        },
        {
          name: 'total',
          align: 'right',
          label: 'Monto a cobrar',
          field: 'total',
          format: row => formatNumber(row)
        },
        {
          name: 'total_payments',
          align: 'right',
          label: 'Monto cobrado',
          field: 'total_payments',
          format: row => formatNumber(row)
        },
        {
          name: 'balance',
          align: 'right',
          label: 'Balance',
          field: row => row.total - row.total_payments,
          format: row => formatNumber(row)
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      salePagination: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      filters: {}
    }
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    opeDetails (data) {
      if (!data) this.client = {}
      this.filterDate()
    }
  },
  computed: {
    ...mapState(authentication, ['branchOffice'])
  },
  mounted () {
    this.filterDate()
  },
  methods: {
    /**
     * Clear filter
     */
    clearFilter () {
      this.day = date.formatDate(Date(), 'YYYY-MM-DD')
      this.fromHours = '00:00'
      this.toHours = '23:59'
      this.seller = null
      this.from = date.formatDate(Date(), 'YYYY-MM-DD')
      this.to = date.formatDate(Date(), 'YYYY-MM-DD')
      this.panel = 'day'
      this.filterDate()
    },
    /**
     * Get all sellers
     */
    async filterSellers (value, update) {
      try {
        const { data } = await this.$api.get('sellers', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.sellers = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Filter date
     */
    async filterDate () {
      if (this.panel === 'day') {
        this.filters = {
          branch_office_id: this.branchOffice?.id,
          seller_id: this.seller?.id,
          day: this.day,
          fromHours: this.fromHours,
          toHours: this.toHours,
          dateFilter: {
            from: `${this.day} ${this.fromHours}`,
            to: `${this.day} ${this.toHours}`,
            field: 'created_at'
          }
        }
      } else {
        this.filters = {
          seller_id: this.seller?.id,
          branch_office_id: this.branchOffice?.id,
          to: this.to,
          from: this.from,
          dateFilter: {
            from: `${this.from} ${this.fromHours}`,
            to: `${this.to} ${this.toHours}`,
            field: 'created_at'
          }
        }
      }
      if (this.client?.id) {
        this.setSalePagination({
          pagination: this.salePagination,
          filter: undefined
        })
      }
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
      this.getTotals(this.filters)
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddClient = false
      this.openEditClient = false
      this.client = {
        ownerable_type: 'App\\Models\\Organization',
        ownerable_id: 1,
        staff_type_id: 1,
        images: []
      }
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
      this.getClients(this.params)
    },
    /**
     * Get all clients
     */
    getClients (params = this.params) {
      this.visible = true
      this.$api
        .get('reports/clients', { params })
        .then(({ data }) => {
          this.clients = data.data
          this.visible = false
          this.paginationConfig.rowsNumber = data.total
        })
        .catch((err) => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Get all clients
     */
    getSales (params = this.saleParams) {
      this.visible = true
      this.$api
        .get('invoices', { params })
        .then(({ data }) => {
          this.sales = data.data
          this.visible = false
          this.salePagination.rowsNumber = data.total
        })
        .catch((err) => {
          this.visible = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Get totals for the current client
     * @returns {Promise<void>}
     */
    async getTotals (params) {
      try {
        loading(true)
        const { data } = await this.$api.get('reports/accounts-receivable-totals', {
          params: {
            client_id: this.client?.id,
            ...params
          }
        })
        this.totals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
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
      const params = {
        ...this.params,
        ...this.filters
      }
      this.getClients(params)
    },
    /**
     * Set data pagination emit event
     * @param  {Object} data value pagination
     */
    setSalePagination (data) {
      this.saleParams.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.saleParams.page = data.pagination.page
      this.saleParams.sortBy = data.pagination.sortBy ?? this.saleParams.sortBy
      this.saleParams.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      const params = {
        ...this.saleParams,
        ...this.filters,
        dataEqualFilter: {
          client_id: this.client.id
        }
      }
      this.getSales(params)
    },
    /**
     * View client
     * @param {Object} event
     * @param {Object} row
     * @param {Number} index
     */
    editClient (event, row, index) {
      this.totals = {}
      this.opeDetails = true
      this.client = row
    }
  }
}
</script>
