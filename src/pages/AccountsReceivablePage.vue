<template>
  <div class="q-pa-md">
    <div class="row q-gutter-y-sm justify-between">
      <div class="col-lg-6 col-md-6 col-sm-6  col-xs-12 q-pa-sm">
        <span class="text-h6">Cuentas por cobrar</span>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-6  col-xs-12 text-subtitle1 flex justify-end items-center q-gutter-x-sm">
        <q-badge class="text-subtitle2" color="secondary">
          {{ branchOffice?.name }}
        </q-badge>
        <q-btn
          icon="filter_alt"
          color="primary"
          round
          size="sm"
          @click="dialogFilter = true"
        />
      </div>
      <div class="row full-width col-12 q-col-gutter-sm">
        <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
          <q-card class="text-negative">
            <q-card-section horizontal>
              <q-card-section class="full-width"> Ventas totales </q-card-section>
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
    <q-dialog
      v-model="openDetails"
      maximized
    >
      <q-card>
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <div class="text-subtitle1">
            Estado de cuenta
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="openDetails = false" />
        </q-card-section>
        <q-card-section class="q-px-sm">
          <div class="row full-width col-12 q-col-gutter-sm items-center">
            <div class="col-6">
              <span class="text-subtitle1">
                {{ client.document_number }} {{ client.name }}
              </span>
            </div>
            <div class="col-6 text-right">
              <q-btn
                icon="add_circle"
                color="primary"
                :label="$q.screen.lt.md ? '' : 'Realizar pago'"
                @click="addPaymentDialog = true"
              />
            </div>
            <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <q-card class="text-negative">
                <q-card-section horizontal>
                  <q-card-section class="full-width"> Ventas totales </q-card-section>
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
            @row-click="showBillDetails"
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
        <q-card-section class="bg-primary text-white flex justify-between items-center q-py-sm">
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
    <q-dialog v-model="addPaymentDialog">
      <q-card class="column" style="width: 500px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white flex justify-between items-center q-py-sm">
          <div class="text-h6">Agregar pago</div>
          <q-btn icon="close" flat round dense @click="addPaymentDialog = false" />
        </q-card-section>
        <q-card-section class="row">
          <div class="column col-6">
            <q-radio
              v-for="paymentMethod in paymentMethods"
              :key="paymentMethod.id"
              color="primary"
              v-model="paymentMethodSelected"
              :label="paymentMethod.name"
              :val="paymentMethod.id"
            />
          </div>
          <div class="col-6 column q-gutter-y-sm">
            <q-input
              v-model="amount"
              label="Monto"
              type="number"
              filled
              dense
            />
            <q-input
              v-model="reference"
              label="Referencia"
              filled
              dense
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Guardar"
            @click="savePayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openBillDetails" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 1000px; max-width: 85vw;'}`"
        >
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openBillDetails = false" />
        </q-card-section>
        <q-card-section class="scroll col" style="max-height: 90vh">
          <div class="row q-col-gutter-md">
            <div class="col-xl-7 col-lg-7 col-md-7 col-sm-7 col-xs-12 row q-col-gutter-sm">
              <div class="col-6">
                <q-input label="Código" filled v-model="billDetails.code" readonly dense/>
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
                  v-model="billDetails.invoice_type"
                  :rules="[val => !!val || 'El campo es requerido.']"
                />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled v-model="billDetails.client.name" readonly dense/>
              </div>
              <div class="col-6" v-if="billDetails.seller">
                <q-input label="Vendedor" filled v-model="billDetails.seller.name" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Moneda" filled :model-value="billDetails?.coin?.name" readonly dense/>
              </div>
              <div class="col-6" v-if="billDetails.tables.length">
                <q-select
                  filled
                  readonly
                  dense
                  label="Mesas"
                  v-model="billDetails.tables"
                  option-label="name"
                  multiple
                />
              </div>
              <div class="col-6">
                <q-input label="Fecha" filled v-model="billDetails.date" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Hora" filled v-model="billDetails.hour" readonly dense/>
              </div>
              <div class="col-12">
                <q-input
                  label="Descripción"
                  filled
                  v-model="billDetails.description"
                  readonly
                  dense
                  type="textarea"
                  autogrow
                />
              </div>
              <div class="col-12">
                <q-expansion-item
                  icon="list"
                  label="Artículos"
                  :caption="`Total: ${formatNumber(billDetails.total)}`"
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
                          <tr v-for="product in billDetails.products" :key="product.id">
                            <td class="text-left">
                              {{ product.barcode }}
                            </td>
                            <td class="text-left">
                              {{ product.name.slice(0, 15) }} ...
                              <q-tooltip class="text-subtitle1">{{ product.name }}</q-tooltip>
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.amount) }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(product.pivot.amount *  product.pivot.price) }}
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
                  :caption="`Total: ${formatNumber(billDetails.total_payments)}`"
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
                            <th class="text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(payment) in billDetails.invoice_payments" :key="payment.id">
                            <td class="text-left">
                              {{ payment.payment_method.name }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(payment.amount) }}
                            </td>
                            <td class="text-right">
                              <q-btn
                                icon="delete"
                                size="sm"
                                dense
                                round
                                color="negative"
                                @click="removePayment(payment)"
                              />
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
                  @click="cancelInvoice"
                />
                <q-btn
                  class="full-width"
                  icon="receipt"
                  color="secondary"
                  label="Imprimir Comanda"
                  @click="print(true)"
                />
                <q-btn
                  class="full-width"
                  icon="print"
                  color="info"
                  :label="`Imprimir ${billDetails.billing ? 'Factura' : 'Comprobante'}`"
                  @click="print(false)"
                />
                <q-btn
                  class="full-width"
                  icon="send"
                  color="positive"
                  label="Factura electrónica"
                  v-if="billDetails.invoice_type.bill && !billDetails.billing && billDetails.status !== 'cancelled'"
                  @click="setInvoiceElectronic(billDetails)"
                >
                  <q-tooltip class="text-body1" anchor="bottom middle">
                    Generar factura electrónica
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="full-width"
                  icon="check_circle"
                  color="primary"
                  label="Pagar"
                  v-if="billDetails.balance > 0"
                  @click="addPaymentDialog = true"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { date, Notify } from 'quasar'
import { formatNumber, formatDate, notify, loading } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { printInvoice, printTicket } from 'src/const/invoice'
export default {
  name: 'AccountsReceivablePage',
  data () {
    return {
      formatNumber,
      openDetails: false,
      dialogFilter: false,
      amount: null,
      addPaymentDialog: false,
      paymentMethodSelected: null,
      reference: null,
      panel: 'day',
      client: {},
      clients: [],
      sellers: [],
      sales: [],
      seller: null,
      filter: '',
      fromHours: null,
      toHours: null,
      day: null,
      from: null,
      to: null,
      billDetails: null,
      openBillDetails: false,
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
        whereIn: {
          status: ['pending', 'delivered', 'finished', 'on_process']
        },
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
          name: 'created_at',
          align: 'left',
          label: 'Fecha del documento',
          field: 'created_at',
          format: row => formatDate(row),
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'left',
          label: 'Fecha del entrega',
          field: 'delivery_date',
          format: row => row ? formatDate(row) : '-',
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'left',
          label: 'Hora del entrega',
          field: 'delivery_date',
          format: row => row ? formatDate(row, 'HH:mm') : '-',
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
      filters: {},
      paymentMethods: [],
      cancelLoading: false
    }
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    branchOffice (data) {
      this.filterDate()
    },
    openDetails (data) {
      if (!data) this.client = {}
      this.filterDate()
    },
    openBillDetails (data) {
      if (data) {
        this.amount = this.billDetails.balance
      } else {
        this.amount = this.totals.balance
        this.billDetails = null
      }
    }
  },
  computed: {
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  mounted () {
    this.filterDate()
    this.getPaymentMethods()
  },
  methods: {
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    async print (ticket) {
      let doc = await printInvoice(this.billDetails, this.userSession)
      if (ticket) doc = printTicket(this.billDetails, this.userSession)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
    },
    /**
     * Change status
     * @param {Object} data invoice
     * @param {Number} index index status
     */
    async cancelInvoice  () {
      try {
        this.cancelLoading = true
        await this.$api.put(`invoice-status-command/${this.billDetails.id}`, { status: 'cancelled' })
        this.filterDate()
        notify('Factura anulada exitosamente', 'positive', 'check_circle')
        this.openBillDetails = false
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cancelLoading = false
      }
    },
    /**
     * Remove payment
     * @param {Object} payment payment
     */
    async removePayment (payment) {
      try {
        loading(true)
        await this.$api.delete(`invoice-payments/${payment.id}`)
        await this.getInvoice(payment.invoice_id)
        this.filterDate()
        notify('Factura anulada exitosamente', 'positive', 'check_circle')
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Set invoice electronic
     * @param {Object} invoice invoice
     */
    async setInvoiceElectronic (invoice) {
      try {
        loading(true)
        const { data } = await this.$api.post(`invoices/${invoice.id}/electronic`)
        if (data.electronic_invoice?.fields?.error) {
          notify(`Hubo un error al generar la factura: ${data.electronic_invoice.fields.message}`, 'negative', 'warning')
        } else {
          this.billDetails = data
          notify('Factura electrónica generada exitosamente', 'positive', 'check_circle')
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
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
     * @param {String} value
     * @param {Function} update
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
          toHours: this.toHours
        }
      } else {
        this.filters = {
          seller_id: this.seller?.id,
          branch_office_id: this.branchOffice?.id,
          to: this.to,
          from: this.from
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
     * @param {Object} params
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
     * Get all sales
     * @param {Object} params
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
     * @param {Object} params
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
        this.amount = data.balance
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
      this.salePagination = data.pagination
      const params = {
        ...this.saleParams,
        ...this.filters,
        dataEqualFilter: {
          client_id: this.client?.id,
          branch_office_id: this.branchOffice?.id
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
      this.openDetails = true
      this.client = row
    },
    /**
     * View invoice data
     * @param {Object} event event
     * @param {Object} row row
     * @param {Number} index index
     */
    showBillDetails (event, row, index) {
      this.openBillDetails = true
      this.billDetails = row
      this.billDetails.balance = row.total - row.total_payments
    },
    /**
     * Get all payment methods
     */
    async getPaymentMethods () {
      try {
        const { data } = await this.$api.get('payment-methods')
        this.paymentMethods = data
        this.paymentMethodSelected = data[0].id
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Save payment
     */
    async savePayment () {
      try {
        loading(true)
        await this.$api.post('invoice-payments', {
          amount: this.amount,
          invoice_id: this.billDetails?.id,
          payment_method_id: this.paymentMethodSelected,
          client_id: this.client?.id,
          reference: this.reference
        })
        await this.getInvoice(this.billDetails?.id)
        this.filterDate()
        this.reference = null
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * Get invoice
     * @param {Number} invoiceId invoice id
     */
    async getInvoice (invoiceId) {
      try {
        const { data } = await this.$api.get(`invoices/${invoiceId}`)
        this.billDetails = data.data
        this.billDetails.balance = data.total - data.total_payments
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    }
  }
}
</script>
