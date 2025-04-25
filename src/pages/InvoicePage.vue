<template>
  <div class="q-pa-md">
    <div class="column q-gutter-sm">
      <div class="full-width text-right q-gutter-sm">
        <q-btn
          class="text-right"
          icon="download"
          color="teal"
        >
          <q-popup-proxy>
            <q-banner>
              <q-list>
                <q-item
                  style="border-radius: 10px;"
                  v-ripple
                  clickable
                  @click="downloadInvoiceExcel"
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
          @click="dialogFilter = true"
        />
      </div>
      <q-table
        title="Facturas"
        row-key="name"
        :columns="columns"
        :rows="invoices"
        :loading="visible"
        :filter="filter"
        :visible-columns="visibleColumns"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="editInvoice"
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
        <template v-slot:body-cell-status="props">
          <q-td :props="props" v-if="props.value">
            <q-badge
              :color="status[props.value].color"
              :label="status[props.value].label"
              class="q-pa-sm"
            />
          </q-td>
          <q-td :props="props" v-else>
            -
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="openEditInvoice" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 900px; max-width: 85vw;'}`"
        >
        <q-card-section class="flex justify-between items-center q-py-sm bg-primary text-white">
          <span class="text-h6">Detalles de la factura</span>
          <q-btn icon="close" flat round dense @click="openEditInvoice = false" />
        </q-card-section>
        <q-card-section class="scroll col" style="max-height: 90vh">
          <div class="row q-col-gutter-md">
            <div class="col-xl-7 col-lg-7 col-md-7 col-sm-7 col-xs-12 row q-col-gutter-sm">
              <div class="col-6">
                <q-input label="Código" filled v-model="invoice.code" readonly dense/>
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
              <div class="col-6" v-if="invoice.seller">
                <q-input label="Vendedor" filled v-model="invoice.seller.name" readonly dense/>
              </div>
              <div class="col-6">
                <q-input label="Moneda" filled :model-value="invoice?.coin?.name" readonly dense/>
              </div>
              <div class="col-6" v-if="invoice.tables.length">
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
                <q-input
                  label="Descripción"
                  filled
                  v-model="invoice.description"
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
                  :caption="`Total: ${formatNumber(invoice.total)}`"
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
                          <tr v-for="product in invoice.products" :key="product.id">
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
                  :caption="`Total: ${formatNumber(invoice.total_payments)}`"
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
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(payment) in invoice.invoice_payments" :key="payment.id">
                            <td class="text-left">
                              {{ payment.payment_method.name }}
                            </td>
                            <td class="text-right">
                              {{ formatNumber(payment.amount) }}
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
                  icon="print"
                  color="black"
                  label="Imprimir comanda"
                  class="full-width"
                  @click="printCommand"
                />
                <q-btn
                  class="full-width"
                  icon="print"
                  color="secondary"
                  label="Imprimir Ticket"
                  @click="print(true)"
                />
                <q-btn
                  class="full-width"
                  icon="print"
                  color="info"
                  v-if="invoice.billing"
                  label="Imprimir Factura"
                  @click="print(false)"
                />
                <q-btn
                  class="full-width"
                  icon="send"
                  color="positive"
                  label="Factura electrónica"
                  v-if="invoice.invoice_type.bill && !invoice.billing && invoice.status !== 'cancelled'"
                  @click="setInvoiceElectronic(invoice)"
                >
                  <q-tooltip class="text-body1" anchor="bottom middle">
                    Generar factura electrónica
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="full-width"
                  icon="check_circle"
                  color="primary"
                  label="Guardar"
                  v-if="invoice.status !== 'cancelled'"
                  @click="saveEdit"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center q-py-sm text-white bg-primary">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="(openAddClient = false)" />
          </q-card-section>
          <q-card-section class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.document_number"
                label="Número de documento"
                :rules="[val => !!val || 'El campo es requerido.']"
                autofocus
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
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.phone_number"
                label="Número de teléfono"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.address"
                label="Dirección"
                type="textarea"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" icon="save" label="Guardar" type="submit" :loading="loadingClient"/>
          </q-card-actions>
        </q-form>
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
          <div class="text-h6">
            Filtros
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            @click="dialogFilter = false"
          />
        </q-card-section>

        <q-card-section class="col q-pt-sm q-gutter-md">
          <q-input
            v-model="filters.code"
            label="Código"
            filled
            dense
            debounce="500"
            clearable
          />
          <q-select
            dense
            use-input
            filled
            label="Vendedor"
            input-debounce="0"
            option-value="id"
            clearable
            v-model="filters.seller"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="filters.sellers"
            @filter="filterSellers"
          />
          <q-select
            dense
            use-input
            filled
            label="Repartidor"
            input-debounce="0"
            option-value="id"
            clearable
            v-model="filters.deliveryPerson"
            :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
            :options="deliveryPersons"
            @filter="filterDeliveryPersons"
          />
          <q-select
            v-model="filters.typeOfService"
            :options="typeOfServices"
            style="min-width: 300px;"
            label="Tipo de servicio"
            option-value="id"
            option-label="name"
            dense
            filled
            multiple
            @filter="filterServiceTypes"
          >
            <template v-if="filters.typeOfService.length" v-slot:append>
              <q-icon
                name="cancel"
                @click.stop.prevent="typeOfService = []"
                class="cursor-pointer"
              />
            </template>
          </q-select>
          <q-select
            v-model="filters.invoiceType"
            :options="invoiceTypes"
            style="min-width: 300px;"
            label="Tipo de factura"
            option-value="id"
            option-label="name"
            dense
            filled
            multiple
            @filter="filterInvoiceTypes"
          >
            <template v-if="filters.invoiceType.length" v-slot:append>
              <q-icon
                name="cancel"
                @click.stop.prevent="filters.invoiceType = []"
                class="cursor-pointer"
              />
            </template>
          </q-select>
          <q-select
            v-model="filters.branchOfficeSelect"
            :options="branchOffices"
            style="min-width: 300px;"
            label="Sucursales"
            option-value="id"
            option-label="name"
            dense
            filled
            multiple
          >
            <template v-if="filters.branchOfficeSelect.length" v-slot:append>
              <q-icon name="cancel" @click.stop.prevent="filters.branchOfficeSelect = []" class="cursor-pointer" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="secondary"
            label="Limpiar"
            @click="clearFilter"
          />
          <q-btn
            color="negative"
            label="Cerrar"
            @click="dialogFilter = false"
          />
          <q-btn
            color="primary"
            label="Aplicar"
            @click="filterInvoice"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="visibleLoading">
      <q-knob
        :step="10"
        v-model="loadingDownload"
        show-value
        size="90px"
        class="q-ma-md"
      />
    </q-inner-loading>
  </div>
</template>

<script>
import { Notify, date, is } from 'quasar'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatNumber, loading, notify } from 'src/const/mixins'
import { printInvoice, printTicket, status, generarFacturaPDF } from 'src/const/invoice'
import { getDownload } from 'src/const/services'
export default {
  data () {
    return {
      sellers: [],
      deliveryPersons: [],
      categories: [],
      branchOffices: [],
      typeOfServices: [],
      filters: {
        code: '',
        seller: null,
        deliveryPerson: null,
        invoiceType: [],
        typeOfService: [],
        branchOfficeSelect: []
      },
      loadingDownload: 0,
      /**
       * Value knob
       * @type {Number}
       */
      dialogFilter: false,
      /**
       * Loading client status
       * @type {Boolean}
       */
      loadingClient: false,
      /**
       * Visible columns
       * @type {Array}
       */
      visibleColumns: [
        'id',
        'invoice_type',
        'client',
        'seller',
        'created_at',
        'status',
        'total'
      ],
      /**
       * Status invoice
       * @type {Object}
       */
      status,
      /**
       * Format number
       * @type {Function}
       */
      formatNumber,
      /**
       * Dialog client status
       * @type {Boolean}
       */
      openAddClient: false,
      /**
       * Taxe translate
       * @type {Object}
       */
      taxeTranslate: {
        percentage: '%'
      },
      /**
       * Client form data
       * @type {Object}
       */
      client: {},
      /**
       * Edit tab
       * @type {String}
       */
      editTab: 'details',
      /**
       * Invoices list table
       * @type {Array}
       */
      invoices: [],
      /**
       * Invoice data selected
       * @type {Object}
       */
      invoice: null,
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
          'invoiceType.name': '',
          'client.name': '',
          'seller.name': '',
          'tables.name': ''
        }
      },
      /**
       * Loading table
       * @type {Boolean}
       */
      visible: false,
      /**
       * Open add invoice dialog
       * @type {Boolean}
       */
      openAddInvoice: false,
      /**
       * Open edit invoice dialog
       * @type {Object}
       */
      openEditInvoice: null,
      /**
       * Table columns
       * @type {Array}
       */
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'code',
          sortable: true
        },
        {
          name: 'invoice_type',
          align: 'left',
          label: 'Tipo de servicio',
          field: row => row?.invoice_type?.name
        },
        {
          name: 'client',
          align: 'left',
          label: 'Cliente',
          field: row => row.client?.name
        },
        {
          name: 'seller',
          align: 'left',
          label: 'Vendedor',
          field: row => row.seller?.name || '-'
        },
        {
          name: 'coin',
          align: 'left',
          label: 'Moneda',
          field: row => row.coin?.name
        },
        {
          name: 'tables',
          align: 'left',
          label: 'Mesas',
          field: row => row.tables.map(table => table.name).join(','),
          format: row => row === '' ? 'N/A' : row
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
          name: 'status',
          align: 'center',
          label: 'Estado',
          field: 'status',
          sortable: true
        },
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
       * Invoice types
       * @type {Array}
       */
      invoiceTypes: []
    }
  },
  computed: {
    visibleLoading () {
      console.log(this.loadingDownload)
      return this.loadingDownload > 0
    },
    totalBill () {
      const sum = this.invoice.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0)
      return sum + this.invoice.total
    },
    ...mapState(authentication, ['branchOffice', 'userSession'])
  },
  mounted () {
    this.getBranchOffices()
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
      this.getInvoices(this.params)
    }
  },
  methods: {
    /**
     * Filter invoice
     */
    filterInvoice () {
      this.params.whereIn = {
        ...this.params.whereIn,
        invoice_type_id: this.filters.invoiceType.map(item => item.id),
        type_of_service_id: this.filters.typeOfService.map(item => item.id),
        branch_office_id: this.filters.branchOfficeSelect.map(item => item.id)
      }
      this.params.dataEqualFilter = {
        ...this.params.dataEqualFilter,
        seller_id: this.filters.seller?.id,
        delivery_person_id: this.filters.deliveryPerson?.id,
        id: this?.filters?.code || null
      }
      this.getInvoices(this.params)
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
     * Clear filter
     */
    clearFilter () {
      this.filters = {
        code: null,
        seller: null,
        deliveryPerson: null,
        invoiceType: [],
        typeOfService: [],
        branchOfficeSelect: []
      }
      this.filterInvoice()
    },
    /**
     * Get all sellers
     */
    async filterServiceTypes (value, update) {
      try {
        const { data } = await this.$api.get('type-of-services', {
          params: {
            dataSearch: {
              name: value
            }
          }
        })
        update(() => {
          this.typeOfServices = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all invoices
     */
    async getBranchOffices () {
      try {
        if (this.userSession.is_root) {
          const { data } = await this.$api.get('branch-offices')
          this.branchOffices = data
          this.filters.branchOfficeSelect = data
        } else {
          this.filters.branchOfficeSelect = [this.branchOffice]
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },

    /**
     * Get all sellers
     */
    async filterDeliveryPersons (value, update) {
      try {
        const { data } = await this.$api.get('delivery-persons', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            }
          }
        })
        update(() => {
          this.deliveryPersons = data
        })
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Download invoice excel
     */
    downloadInvoiceExcel () {
      this.loadingDownload = 1
      getDownload(
        'excel/invoices',
        {
          dataEqualFilter: this.params?.dataEqualFilter,
          whereIn: this.params?.whereIn
        },
        (percentCompleted) => {
          console.log(percentCompleted)
          this.loadingDownload = percentCompleted
          if (percentCompleted === 100) {
            this.loadingDownload = 0
          }
        },
        (link) => {
          link.setAttribute(
            'download',
            'Invoices.xlsx'
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
        taxe.total = (this.invoice.total * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.invoice.total + taxe.pivot.amount
      }
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
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    async print (ticket) {
      let doc = null
      if (!ticket && this.invoice.billing) {
        doc = await generarFacturaPDF(this.invoice, this.userSession)
      } else if (ticket) {
        doc = await printInvoice(this.invoice, this.userSession)
      }
      console.log(doc)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
    },
    /**
     * Print command
     */
    async printCommand () {
      const doc = await printTicket(this.invoice, this.userSession)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
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
          this.invoice = data
          notify('Factura electrónica generada exitosamente', 'positive', 'check_circle')
        }
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        loading(false)
      }
    },
    /**
     * View invoice data
     * @param {Object} event event
     * @param {Object} row row
     * @param {Number} index index
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
      this.loadingClient = true
      this.$api.put(`clients/${this.invoice.client.id}`, this.client)
        .then(({ data }) => {
          this.openAddClient = false
          this.loadingClient = false
          this.invoice.client = data
          notify('Cliente guardado exitosamente', 'positive', 'check_circle')
        })
        .catch(err => {
          this.loadingClient = false
          notify(err.message, 'negative', 'warning')
        })
    },
    /**
     * Edit invoice
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
     * Delete invoice
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
    },
    /**
     * Change status
     * @param {Object} data invoice
     * @param {Number} index index status
     */
    async cancelInvoice  () {
      try {
        this.cancelLoading = true
        await this.$api.put(`invoice-status-command/${this.invoice.id}`, { status: 'cancelled' })
        this.getInvoices()
        notify('Factura anulada exitosamente', 'positive', 'check_circle')
        this.openEditInvoice = false
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      } finally {
        this.cancelLoading = false
      }
    }
  }
}
</script>
