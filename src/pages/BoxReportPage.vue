<template>
  <q-page padding>
    <div class="row full-width q-col-gutter-sm">
      <div class="col-12 text-subtitle1 flex justify-between items-center">
        <span>{{ branchOffice?.name }}</span>
        <q-btn icon="filter_alt" color="primary" @click="dialogFilter = true" round/>
      </div>
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
          :label="`Flujo de dinero: ${formatNumber(cashflowTotals.cashflow_totals)}`"
        >
          <q-card>
            <q-card-section>
              <q-list dense>
                <q-item
                  v-for="cashFlow in cashflowTotals.cashflow_total"
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                  :key="cashFlow.id"
                  @click="cashFlowDetails(cashFlow)"
                >
                  <q-item-section>
                    <q-item-label>{{ translate[cashFlow.type_cashflow] }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(cashFlow.totals) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item
                  clickable
                  v-ripple
                  style="border-radius: 20px;"
                  @click="cashFlowDetails"
                >
                  <q-item-section>
                    <q-item-label>Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ formatNumber(cashflowTotals.cashflow_totals) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
    <q-footer class="q-pa-sm justify-between flex" style="position: fixed; bottom: 0;">
      <span class="text-subtitle2">
        {{formatDate(new Date(), 'DD/MM/YYYY')}}
      </span>
      <span class="text-subtitle2">
        VENTAS TOTALES:
        {{ formatNumber(categoryTotalsTotals.category_total + cashflowTotals.cashflow_totals) }}
      </span>
    </q-footer>
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
            :readonly="!validate"
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
    <q-dialog v-model="cashFlowDetailsDialog">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <div class="text-h6">Flujo de dinero</div>
          <q-btn icon="close" flat round dense  v-close-popup />
        </q-card-section>

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Fecha</th>
                <th class="text-left">Hora</th>
                <th class="text-left">Descripción</th>
                <th class="text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cashflows.data" :key="item.id">
                <td class="text-left">{{ formatDate(item.created_at, 'DD/MM/YYYY') }}</td>
                <td class="text-left">{{ formatDate(item.created_at, 'HH:mm:ss') }}</td>
                <td class="text-left">{{ item.description }}</td>
                <td class="text-right" :class="item.type_cashflow === 'debit' ? 'text-positive' : 'text-negative'">
                  {{ formatNumber(item.amount) }}
                </td>
              </tr>
              <tr>
                <th colspan="3" class="text-right">
                  <span class="text-subtitle1">
                    Total:
                  </span>
                </th>
                <th :class="cashflows.total > 0 ? 'text-positive' : 'text-negative'" class="text-right">
                  <span class="text-subtitle1">
                    {{ formatNumber(cashflows.total) }}
                  </span>
                </th>
              </tr>
            </tbody>
          </q-markup-table>
         </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cerrar" color="negative" icon="close" v-close-popup />
        </q-card-actions>
        <q-inner-loading :showing="cashFlowLoading" color="primary" />
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { date } from 'quasar'
import { formatDate, formatNumber } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { notify } from '../const/mixins'
export default {
  // name: 'PageName',
  data: () => {
    return {
      loading: false,
      cashFlowDetailsDialog: false,
      cashFlowLoading: false,
      formatDate,
      panel: 'day',
      fromHours: null,
      toHours: null,
      formatNumber,
      translate: {
        debit: 'Entrada',
        credit: 'Salida'
      },
      day: date.formatDate(Date(), 'YYYY-MM-DD'),
      from: date.formatDate(Date(), 'YYYY-MM-DD'),
      to: date.formatDate(Date(), 'YYYY-MM-DD'),
      cashflowTotals: [],
      dialogFilter: false,
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {},
      visible: false,
      cashflows: [],
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
          name: 'invoice_code',
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
          label: 'Método de pago',
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
      seller: null,
      validate: null,
      permissions: ['SAM']
    }
  },
  watch: {
    branchOffice (data) {
      this.filterDate()
    },
    validate (data) {
      if (!data) {
        this.seller = this.userSession
      }
      this.filterDate()
    }
  },
  created () {
    this.setPermissions()
  },
  computed: {
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  methods: {
    setPermissions () {
      this.validate = this.userSession.is_root || this.userSession.roles.some(role => this.permissions.includes(role.acronym))
    },
    /**
     * Clear filter
     */
    clearFilter () {
      this.day = date.formatDate(Date(), 'YYYY-MM-DD')
      this.fromHours = null
      this.toHours = null
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
        this.params = {
          branch_office_id: this.branchOffice?.id,
          seller_id: this.seller?.id,
          day: this.day,
          fromHours: this.fromHours,
          toHours: this.toHours
        }
      } else {
        this.params = {
          seller_id: this.seller?.id,
          branch_office_id: this.branchOffice?.id,
          to: this.to,
          from: this.from
        }
      }
      this.loading = true
      await this.getCategoryTotals(this.params)
      await this.getPaymentMethodTotals(this.params)
      await this.getPaymentTotals(this.params)
      await this.getCashflowTotals(this.params)
      await this.getTypeOfServicesTotals(this.params)
      this.loading = false
    },
    /**
     * Get total all
     * @param {Object} params
     */
    async getCashflowTotals (params) {
      try {
        const { data } = await this.$api.get('reports/cashflow-totals', { params })
        this.cashflowTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get cash flow details
     * @param {Object} data
     */
    cashFlowDetails (data) {
      this.cashFlowDetailsDialog = true
      this.getCashflowDetails({
        ...this.params,
        type_cashflow: data?.type_cashflow
      })
    },
    /**
     * Get total all
     * @param {Object} params
     */
    async getCashflowDetails (params) {
      try {
        this.cashFlowLoading = true
        const { data } = await this.$api.get('reports/cashflow-details', { params })
        this.cashflows = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cashFlowLoading = false
      }
    },
    /**
     * Get type of services totals
     * @param {Object} params
     */
    async getTypeOfServicesTotals (params) {
      try {
        const { data } = await this.$api.get('reports/type-of-services-totals', { params })
        this.typeOfServicesTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
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
     * Get payment method totals
     * @param {Object} params
     */
    async getPaymentMethodTotals (params) {
      try {
        const { data } = await this.$api.get('reports/payment-method-totals', { params })
        this.paymentMethodTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get category totals
     * @param {Object} params
     */
    async getCategoryTotals (params) {
      try {
        const { data } = await this.$api.get('reports/category-totals', { params })
        this.categoryTotalsTotals = data
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    }
  }
}
</script>
