<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <q-table
          title="Facturas"
          row-key="name"
          :columns="columns"
          :rows="invoices"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editInvoice"
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
    </div>
    <q-dialog v-model="openEditInvoice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-tabs
          v-model="editTab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="details" label="Detalles de la factura" />
          <q-tab name="payments" label="Detalles de pago" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="editTab" animated>
          <q-tab-panel name="details">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input label="Código" filled v-model="invoice.id" readonly dense/>
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
                  v-model="invoice.invoice_type"
                  :options="invoiceTypes"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterInvoiceTypes"
                />
              </div>
              <div class="col-6">
                <q-input label="Cliente" filled v-model="invoice.client.name" readonly dense>
                  <template v-slot:append>
                    <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddClient = true)" size="sm"/>
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input label="Vendedor" filled v-model="invoice.seller.name" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Moneda" filled v-model="invoice.coin.name" readonly dense/>
              </div>
              <div class="col-6">
                <q-select
                  filled
                  readonly
                  dense
                  label="Mesas"
                  v-model="invoice.tables"
                  option-label="name"
                  multiple
                />
              </div>
              <div class="col-6">
                <q-input label="Fecha" filled v-model="invoice.date" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Hora" filled v-model="invoice.hour" readonly dense/>
              </div>
              <div class="col-12">
                <q-markup-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">Código</th>
                      <th class="text-left">Descripción</th>
                      <th class="text-right">Cantidad</th>
                      <th class="text-right">Precio</th>
                      <th class="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in invoice.products" :key="product.id">
                      <td class="text-left">
                        {{ product.barcode }}
                      </td>
                      <td class="text-left">
                        {{ product.name }}
                      </td>
                      <td class="text-right">
                        {{ product.pivot.amount }}
                      </td>
                      <td class="text-right">
                        {{ product.pivot.price }}
                      </td>
                      <td class="text-right">
                        {{ product.pivot.amount *  product.pivot.price }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-list dense separator v-if="invoice" class="q-mt-xs">
                  <q-item v-if="invoice.invoice_type.name !== 'Ticket'">
                    <q-item-section>
                      Op Gravada
                    </q-item-section>
                    <q-item-section side v-if="invoice.coin">
                      {{ invoice.coin.symbol }}{{ invoice.tax_base }}
                    </q-item-section>
                  </q-item>
                  <q-item v-for="taxe in invoice.taxes" :key="taxe.id" v-show="invoice.invoice_type.name !== 'Ticket'">
                    <q-item-section>
                      {{ taxe.name }} ({{ taxe.pivot.amount }}{{ taxeTranslate[taxe.pivot.type_taxe]}})
                    </q-item-section>
                    <q-item-section side v-if="invoice.coin">
                      {{ invoice.coin.symbol }}{{ calculateTaxe(taxe) }}
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      Importe total
                    </q-item-section>
                    <q-item-section side v-if="coin">
                      {{ invoice.coin.symbol }}{{ totalBill }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="payments">
            <q-markup-table dense>
              <thead>
                <tr>
                  <th class="text-left">Metodo de pago</th>
                  <th class="text-left">Referencia</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment) in invoice.invoice_payments" :key="payment.id">
                  <td class="text-left">
                    {{ payment.payment_method.name }}
                  </td>
                  <td class="text-left">
                    <span v-if="payment.reference">
                      {{ payment.reference }}
                    </span>
                    <span v-else>
                      -
                    </span>
                  </td>
                  <td class="text-right">
                    {{ payment.amount }}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" class="text-right">
                    Total:
                  </td>
                  <td class="text-right">
                    {{ invoice.total_payments }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-tab-panel>
        </q-tab-panels>
        <q-card-actions align="right">
          <q-btn color="negative" label="cancelar" @click="openEditInvoice = false"/>
          <q-btn color="secondary" label="Imprimir Ticket" @click="print" v-if="invoice.invoice_type.name === 'Ticket'"/>
          <q-btn color="orange" label="Imprimir Boleta" @click="printInvoice" v-else/>
          <q-btn color="primary" label="Guardar" @click="saveEdit"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-option-group
                type="radio"
                inline
                autofocus
                v-model="documentType"
                :options="options"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.document_number"
                label="Número de documento"
                @blur="getDataApi"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.name"
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit"/>
            <q-btn color="orange" label="Cancelar" @click="(openAddClient = false)" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <div id="printMe" v-show="false">
      <invoice-print :data="invoice" v-if="invoice"/>
    </div>
    <div id="printMeInvoice" v-show="false">
      <bill-of-sale :data="invoice" v-if="invoice"/>
    </div>
  </div>
</template>

<script>
import { Notify, date, is } from 'quasar'
import InvoicePrint from '../components/InvoicePrint.vue'
import BillOfSale from '../components/BillOfSale.vue'
export default {
  components: {
    InvoicePrint,
    BillOfSale
  },
  data () {
    return {
      documentType: 'ruc',
      options: [
        { label: 'RUC', value: 'ruc' },
        { label: 'DNI', value: 'dni', color: 'green' }
      ],
      openAddClient: false,
      taxeTranslate: {
        percentage: '%'
      },
      client: {},
      editTab: 'details',
      invoices: [],
      invoice: null,
      coin: {},
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
          'invoiceType.name': '',
          'client.name': '',
          'seller.name': '',
          'tables.name': ''
        }
      },
      visible: false,
      openAddInvoice: false,
      openEditInvoice: null,
      userSession: null,
      columns: [
        {
          name: 'code',
          align: 'left',
          label: 'Código',
          field: 'code',
          sortable: true
        },
        {
          name: 'invoice_type',
          align: 'left',
          label: 'Tipo de servicio',
          field: row => row.invoice_type.name,
          sortable: true
        },
        {
          name: 'client',
          align: 'left',
          label: 'Cliente',
          field: row => row.client.name,
          sortable: true
        },
        {
          name: 'seller',
          align: 'left',
          label: 'Vendedor',
          field: row => row.seller.name,
          sortable: true
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin.name,
          sortable: true
        },
        {
          name: 'tables',
          align: 'left',
          label: 'Mesas',
          field: row => row.tables.map(table => table.name).join(','),
          format: row => row === '' ? 'N/A' : row,
          sortable: true
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
          name: 'exchange_rate',
          align: 'right',
          label: 'Tipo de cambio',
          field: 'exchange_rate',
          sortable: true
        },
        {
          name: 'total',
          align: 'right',
          label: 'Total',
          field: 'total',
          sortable: true
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      },
      invoiceTypes: []
    }
  },
  computed: {
    totalBill () {
      const sum = this.invoice.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
      return sum + this.invoice.total
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  created () {
    this.userSession = JSON.parse(localStorage.getItem('user'))
    this.coin.user_created_id = this.userSession.id
    this.coin.user_updated_id = this.userSession.id
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    calculateTaxe (taxe) {
      if (taxe.pivot.type_taxe === 'percentage') {
        taxe.total = (this.invoice.total * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.invoice.total + taxe.pivot.amount
      }
      console.log(this.invoice.total)
      return taxe.total
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterInvoiceTypes (value, update) {
      this.$api.get('invoice-types', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.invoiceTypes = data
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
    print () {
      this.$htmlToPaper('printMe', {
        styles: [
          'src/css/styleInvoice.css'
        ]
      })
    },
    printInvoice () {
      this.$htmlToPaper('printMeInvoice', {
        styles: [
          'src/css/styleBillOfSale.css'
        ]
      })
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddInvoice = false
      this.openEditInvoice = false
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
      this.getInvoices(this.params)
    },
    /**
     * Get all invoices
     */
    getInvoices (params = this.params) {
      this.visible = true
      this.$api.get('invoices', { params })
        .then(({ data }) => {
          this.invoices = data.data
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
      console.log(data.pagination.descending)
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getInvoices(this.params)
    },
    /**
     * Save invoices
     */
    saveInvoice () {
      this.visible = true
      this.$api.post('invoices', this.invoice)
        .then(({ data }) => {
          this.getInvoices()
          this.openAddInvoice = false
          this.visible = false
          this.invoice = {}
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
     * View coin
     */
    editInvoice (event, row, index) {
      this.openEditInvoice = true
      this.invoice = row
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
     * Save clients
     */
    saveClient () {
      this.visible = true
      this.$api.put(`clients/${this.invoice.client.id}`, this.client)
        .then(({ data }) => {
          this.openAddClient = false
          this.visible = false
          this.invoice.client = data
          Notify.create({
            message: 'Cliente creado exitosamente',
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
     * Get document
     */
    getDataApi () {
      this.$api.get(`get-documents/${this.documentType}/${this.client.document_number}`)
        .then(({ data }) => {
          if (!data.error) {
            this.client.name = data.nombre
          } else {
            Notify.create({
              message: data.error,
              icon: 'warning',
              color: 'negative'
            })
            this.client = {}
          }
        })
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`invoices/${this.invoice.id}`, this.modelData(this.invoice))
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.invoice = null
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
     * Delete coin
     */
    deleteInvoice () {
      this.visible = true
      this.$api.delete(`invoices/${this.invoice.id}`)
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.invoice = null
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
