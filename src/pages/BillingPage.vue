<template>
  <q-page padding>
    <div v-if="$route.query.id">
      <span class="text-subtitle1">Factura número: </span>
      <span class="text-subtitle2">{{ invoice?.code }}</span>
    </div>
    <q-form ref="saveBill" @submit="saveBill" style="min-height: calc(100vh - 120px);">
      <div class="row q-col-gutter-md">
        <div class="col-12 row q-col-gutter-x-xs">
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
            <q-select
              use-input
              filled
              dense
              label="Cliente"
              input-debounce="0"
              option-value="id"
              v-model="client"
              :option-label="row => `${row.document_number ?? ''} | ${row.name}`"
              :options="clients"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterClients"
            >
              <template v-slot:append>
                <q-btn color="primary" round icon="add_circle" @click.stop.prevent="(openAddClient = true)" size="sm"/>
              </template>
            </q-select>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
            <q-select
              use-input
              filled
              dense
              label="Tipo de factura"
              input-debounce="0"
              option-label="name"
              option-value="id"
              v-model="invoiceType"
              :options="invoiceTypes"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterInvoiceTypes"
            />
          </div>
          <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
            <q-select
              use-input
              filled
              dense
              label="Tipo de servicio"
              input-debounce="0"
              option-label="name"
              option-value="id"
              v-model="typeOfService"
              :options="typeOfServices"
              :rules="[val => !!val || 'El campo es requerido.']"
              @filter="filterTypeOfServices"
            />
          </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-7 col-lg-7 col-xl-7 q-col-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-xl-6 col-lg-6 col-md-5 col-sm-12 col-xs-12">
              <q-input filled dense v-model="barcode" autofocus type="number" label="Código" @keypress.enter="getOneProduct(this.barcode)">
                <template v-slot:append>
                  <q-btn round color="teal" icon="qr_code" size="sm" @click="modelScan = true"/>
                </template>
              </q-input>
            </div>
            <div class=" col-xl-6 col-lg-6 col-md-7 col-sm-12 col-xs-12 q-gutter-xs">
              <q-btn :dense="$q.screen.xs" color="primary" icon="table_restaurant" @click="dialogTable = true" :loading="loadingLivingRoom">
                <q-badge floating color="negative">
                  {{ tableSelected.length }}
                </q-badge>
              </q-btn>
              <q-btn
                color="secondary"
                icon="attach_money"
                :loading="loadingPaymentMethods"
                :dense="$q.screen.xs"
                @click="dialogPayment = true"
              >
                <q-badge floating color="negative">
                  {{ payments.length }}
                </q-badge>
              </q-btn>
              <q-btn
                icon="save"
                color="positive"
                :dense="$q.screen.xs"
                @click="saveWithoutPrint"
              />
              <q-btn
                icon="search"
                color="primary"
                :dense="$q.screen.xs"
                @click="searchInvoice = true"
              />
              <q-btn
                icon="payments"
                color="info"
                :dense="$q.screen.xs"
                @click="cashflow = true"
              />
              <q-btn
                icon="clear"
                color="negative"
                :dense="$q.screen.xs"
                @click="clear"
              />
            </div>
            <div class="col-12">
              <q-table
                row-key="name"
                title="Artículos"
                dense
                :rows="products"
                :columns="columns"
                :loading="loadingPage"
                hide-pagination
                v-model:pagination="pagination"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="barcode" :props="props">
                      {{ props.row.barcode }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                    </q-td>
                    <q-td key="price" :props="props">
                      {{ props.row.price }}
                      <q-popup-edit v-model.number="props.row.price" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                        <q-input label="Precio" type="number" v-model.number="scope.value" autofocus @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="amount" :props="props">
                      {{ formatNumber(props.row.amount) }}
                      <q-popup-edit v-model.number="props.row.amount" auto-save v-slot="scope" @update:model-value="calculate(props.row)">
                        <q-input label="Cantidad" type="number" v-model.number="scope.value" autofocus @keyup.enter="scope.set" />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="subtotal" :props="props">
                      {{ formatNumber(props.row.subtotal) }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn icon="delete" size="xs" color="negative" @click="deleteProduct(props)"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
            <div class="col-12">
              <q-list dense separator v-if="invoiceType">
                <q-item>
                  <q-item-section>
                    Op Gravada
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }}{{ formatNumber(totalBill) }}
                  </q-item-section>
                </q-item>
                <q-item v-for="taxe in invoiceType.taxes" :key="taxe.id">
                  <q-item-section>
                    {{ taxe.name }} ({{ formatNumber(taxe.pivot.amount) }}{{ taxeTranslate[taxe.pivot.type_taxe]}})
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }}{{ formatNumber(calculateTax(taxe)) }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    Importe total
                  </q-item-section>
                  <q-item-section side v-if="coin">
                    {{ coin.symbol }}{{ formatNumber(totalTaxe) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 q-gutter-xs">
              <q-select
                filled
                dense
                label="Moneda"
                option-label="name"
                option-value="id"
                v-model="coin"
                :options="coins"
                :rules="[val => !!val || 'El campo es requerido.']"
              />
              <q-input type="datetime-local" dense filled v-model="deliveryDate" label="Fecha de entrega" />
              <q-input type="textarea" filled v-model="invoiceDescription" label="Descripción" autogrow />
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
          <div style="height: calc(100vh - 250px);">
            <q-table
              row-key="name"
              dense
              grid
              hide-pagination
              :rows="allProducts"
              :columns="productColumns"
              :loading="loadingPage"
              :filter="filter"
              v-model:pagination="pagination"
            >
              <template v-slot:top>
                <div class="row full-width q-col-gutter-xs">
                  <div class="col-6">
                    <q-select
                      use-input
                      filled
                      dense
                      clearable
                      label="Categorías"
                      input-debounce="0"
                      option-label="name"
                      option-value="id"
                      v-model="category"
                      :options="categories"
                      @filter="filterCategories"
                    />
                  </div>
                  <div class="col-6">
                    <q-input filled dense debounce="300" v-model="filter" placeholder="Buscar">
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                </div>
              </template>
              <template v-slot:item="props">
                <div class="q-pa-xs col-xs-12 col-sm-6 col-md-6">
                  <q-card class="my-card">
                    <q-img
                      style="height: 150px; width: 100%"
                      :src="props.row.images[0] ? props.row.images[0].url : 'https://cdn.quasar.dev/img/image-src.png'"
                      @click="validateProduct(props.row, true)"
                    >
                      <div class="absolute-full text-subtitle2 flex flex-center">
                        {{ props.row.name }}
                      </div>
                    </q-img>
                  </q-card>
                </div>
              </template>
            </q-table>
          </div>
        </div>
      </div>
    </q-form>
    <q-dialog v-model="modelScan">
      <q-card>
        <q-card-section class="q-pb-none q-pt-xs q-px-xs bg-dark">
          <stream-barcode-reader @debarcode="getOneProduct"/>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogPayment">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-3 q-gutter-xs">
            <q-btn
              color="secondary"
              size="17px"
              style="width: 100%"
              :label="paymentMethod.name"
              v-for="paymentMethod in paymentMethods" :key="paymentMethod.id"
              @click="addPayment(paymentMethod)"
            />
          </div>
          <div class="col-9">
            <q-markup-table>
              <thead>
                <th colspan="4">Desglose de pago</th>
              </thead>
              <thead>
                <tr>
                  <th class="text-left">Método de pago</th>
                  <th class="text-left">Referencia</th>
                  <th class="text-right">Monto</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, index) in payments" :key="payment.id">
                  <td class="text-left">{{ payment.name }}</td>
                  <td class="text-left">
                    <span v-if="payment.reference"> {{ payment.reference }}</span>
                    <span v-else>-</span>
                    <q-popup-edit
                      v-model="payment.reference"
                      auto-save
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </td>
                  <td class="text-right">
                    {{ payment.amount }}
                    <q-popup-edit
                      v-model.number="payment.amount"
                      auto-save
                      v-slot="scope"
                    >
                      <q-input
                        v-model="scope.value"
                        autofocus
                        @keyup.enter="scope.set"
                      />
                    </q-popup-edit>
                  </td>
                  <q-td class="text-right">
                    <q-btn
                      icon="delete"
                      size="xs"
                      color="negative"
                      @click="deletePayment(index)"
                    />
                  </q-td>
                </tr>
                <tr>
                  <th colspan="4">
                    Restante a pagar:
                    <span v-if="coin">{{ coin.symbol }}</span>{{ pendingPayment }}
                  </th>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Guardar y cerrar"
            @click="saveWithoutPrint"
            color="primary"
          />
          <q-btn
            label="Guardar e imprimir factura"
            @click="submitBill"
            color="secondary"
          />
          <q-btn
            label="Cerrar"
            @click="cancelPayment"
            color="negative"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogTable" maximized>
      <drawer-table
        ref="drawerTable"
        :tablesSelected="tableSelected"
        @update:tableSelected="setTableSelected"
        @update:invoice="selectInvoice"
        @update:freeTable="freeTable"
      >
        <template v-slot:footer>
          <q-card-actions align="right">
            <q-btn color="negative" label="Cerrar" @click="dialogTable = false"/>
            <q-btn color="primary" label="Aceptar" @click="dialogTable = false"/>
          </q-card-actions>
        </template>
      </drawer-table>
    </q-dialog>
    <q-dialog v-model="searchInvoice">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="q-pb-none">
          <span class="text-h6">Buscar numero de factura</span>
        </q-card-section>
        <q-card-section>
          <q-form @submit="() => { this.$router.push({ name: 'Billing', query: { id: search } }) }" class="row full-width items-center justify-between">
            <div class="col-10">
              <q-input
                name="search"
                autocomplete="search"
                v-model="search"
                color="primary"
                label="Buscar numero de factura"
                filled
                clearable
                type="search"
                required
              />
            </div>
            <div class="col-auto text-right">
              <q-btn type="submit" color="primary" icon="search" size="lg"/>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="cashflow">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="q-pb-none flex justify-between items-center">
          <span class="text-h6">Flujo de dinero</span>
          <q-btn flat icon="close" round size="md" v-close-popup/>
        </q-card-section>
        <q-card-section class="q-py-sm">
          <q-option-group
            v-model="panel"
            inline
            :options="[
              { label: 'Entrada', value: 'debit' },
              { label: 'Salida', value: 'credit' }
            ]"
          />
          <q-form @submit="saveCashflow" class="row full-width q-gutter-y-sm">
            <div class="col-12">
              <q-input
                name="amount"
                autocomplete="amount"
                v-model="amount"
                color="primary"
                label="Monto"
                filled
                clearable
                type="amount"
                required
                autofocus
              />
            </div>
            <div class="col-12">
              <q-input
                name="description"
                autocomplete="description"
                v-model="description"
                color="primary"
                label="Descripción"
                filled
                clearable
                type="textarea"
                autogrow
                required
              />
            </div>
            <div class="col-12 text-right">
              <q-btn type="submit" color="primary" label="Guardar" size="lg" :loading="loadingCashflow"/>
            </div>
          </q-form>
        </q-card-section>
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
                v-model="clientAdded.document_number"
                autofocus
                label="Número de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="clientAdded.name"
                autofocus
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit" :loading="loadingClient"/>
            <q-btn color="secondary" label="Cerrar" @click="(openAddClient = false)" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="quantityDialog">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-form @submit="validateProduct(productQuantity)">
          <q-card-section class="flex justify-between items-center q-pb-none">
            <span class="text-h6">Cantidad del producto</span>
            <q-btn icon="close" flat round dense @click="quantityDialog = false" />
          </q-card-section>
          <q-card-section class="q-pb-xs">
            <div class="text-subtitle1 text-center">
              {{  productQuantity.name }} x {{ productQuantity.unit_of_measure.acronym }}
            </div>
          </q-card-section>
          <q-card-section class="flex q-col-gutter-sm justify-between items-center">
            <q-input
              filled
              v-model.number="quantity"
              autofocus
              label="Cantidad"
              type="number"
              style="width: 50%;"
            />
            <q-input
              filled
              v-model.number="currentAmount"
              label="Importe"
              type="number"
              style="width: 50%;"
            />
          </q-card-section>
          <q-card-section class="q-pt-xs">
            <div class="text-subtitle1 text-center text-weight-bold">
              Precio por unidad = {{ formatNumber(productQuantity.price) }}
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              label="Cerrar"
              @click="quantityDialog = false"
              color="negative"
            />
            <q-btn
              label="Guardar"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { StreamBarcodeReader } from 'vue-barcode-reader'
import { Notify } from 'quasar'
// import { DraggableResizableVue, DraggableResizableContainer } from 'draggable-resizable-vue3'
import { mapState } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { formatDate, formatNumber, notify } from 'src/const/mixins'
import { printTicket } from 'src/const/invoice'
import DrawerTable from 'src/components/Table/DrawerTable.vue'
export default {
  name: 'BillingPage',
  components: {
    StreamBarcodeReader,
    DrawerTable
  },
  data () {
    return {
      quantityDialog: false,
      productQuantity: null,
      quantity: 1,
      currentAmount: 0,
      panel: 'debit',
      amount: 0,
      loadingCashflow: false,
      description: '',
      invoiceDescription: '',
      cashflow: false,
      deliveryDate: formatDate(Date(), 'YYYY-MM-DD HH:mm:ss'),
      formatNumber,
      searchInvoice: false,
      search: '',
      loadingClient: false,
      loadingPaymentMethods: false,
      documentType: 'ci',
      options: [
        { label: 'Rif', value: 'rif' },
        { label: 'DNI', value: 'ci', color: 'green' }
      ],
      invoiceTaxes: [],
      openAddClient: false,
      taxeTranslate: {
        percentage: '%'
      },
      clientAdded: {},
      invoice: null,
      taxes: [],
      taxe: null,
      statusTable: {
        unoccupied: 'Libre',
        busy: 'Ocupada'
      },
      category: null,
      typeOfService: null,
      typeOfServices: [],
      payments: [],
      paymentMethods: [],
      dialogPayment: false,
      invoiceTypes: [],
      invoiceType: null,
      coins: [],
      coin: null,
      clients: [],
      client: null,
      tableSelected: [],
      dialogTable: false,
      exchange: false,
      exchangeRate: 0,
      modelScan: false,
      tables: [],
      /**
       * Pagination option
       * @type {Object}
       */
      pagination: { rowsPerPage: 10 },
      filter: '',
      barcode: null,
      withoutPayment: ['Ticket', 'Pedido'],
      dialogScanner: false,
      withoutPrint: false,
      loadingLivingRoom: false,
      products: [],
      loadingPage: false,
      totalBill: 0,
      allProducts: [],
      categories: [],
      productColumns: [
        {
          name: 'barcode',
          align: 'left',
          label: 'Código',
          field: 'barcode',
          sortable: true
        },
        {
          name: 'name',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        {
          name: 'category',
          align: 'right',
          label: 'Categoría',
          field: row => row.category.name,
          sortable: true
        },
        {
          name: 'price',
          align: 'right',
          label: 'Precio',
          field: 'price',
          sortable: true
        }
      ],
      columns: [
        { name: 'barcode', align: 'left', label: 'Código', field: 'barcode', sortable: true },
        {
          name: 'name',
          required: true,
          label: 'Descripción',
          align: 'left',
          field: row => row.name,
          sortable: true
        },
        { name: 'price', align: 'right', label: 'Precio de venta', field: 'price', sortable: true },
        { name: 'amount', align: 'right', label: 'Cantidad', field: 'amount', sortable: true },
        { name: 'subtotal', align: 'right', label: 'Importe', field: 'subtotal', sortable: true },
        { name: 'actions', align: 'right', label: 'Acciones', field: 'actions' }
      ]
    }
  },
  computed: {
    invoiceRouter () {
      return this.$route.query.id
    },
    pendingPayment () {
      return this.totalBill - this.totalPayment
    },
    totalTaxe () {
      const sum = this.invoiceType ? this.invoiceType?.taxes.reduce((accumulator, currentValue) => accumulator + currentValue.total, 0) : 0
      return sum + this.totalBill
    },
    totalPayment () {
      let totalPayment = 0
      this.payments.forEach((payment) => {
        totalPayment = totalPayment + payment.amount
      })
      return totalPayment
    },
    ...mapState(authentication, ['userSession'])
  },
  watch: {
    category () {
      this.getAllProducts()
    },
    totalBill () {
      this.invoiceTaxes = this.invoiceType?.taxes?.map(taxe => {
        return {
          taxe_id: taxe.id,
          amount: taxe.pivot.amount,
          type_taxe: taxe.pivot.type_taxe
        }
      })
    },
    tableSelected (data) {
      localStorage.setItem('tableSelected', JSON.stringify(data))
    },
    payments (data) {
      localStorage.setItem('payments', JSON.stringify(data))
    },
    coin (data) {
      this.taxeTranslate.amount = data.symbol
    },
    client (data) {
      localStorage.setItem('client', JSON.stringify(data))
    },
    invoiceType (data) {
      localStorage.setItem('invoiceType', JSON.stringify(data))
    },
    typeOfService (data) {
      localStorage.setItem('typeOfService', JSON.stringify(data))
    },
    products (data) {
      localStorage.setItem('products', JSON.stringify(data))
    },
    invoiceRouter (data) {
      if (data) this.getInvoiceOne(data)
    },
    currentAmount (data) {
      if (data) {
        const quantity = data / this.productQuantity.price
        this.quantity = Number(quantity.toFixed(2))
      }
    }
  },
  created () {
    this.getLocalStorage()
    this.getCoins()
    this.getTaxes()
    this.getPaymentMethods()
    this.getAllProducts()
    if (this.$route?.query?.id) this.getInvoiceOne(this.$route.query.id)
  },
  methods: {
    /**
     * Set table selected
     * @param {Object} data table selected
     */
    setTableSelected (data) {
      this.tableSelected = data
    },
    /**
     * Save cashflow
     */
    async saveCashflow () {
      try {
        this.loadingCashflow = true
        await this.$api.post('cashflow', {
          description: this.description,
          amount: this.amount,
          type_cashflow: this.panel
        })
        this.$q.notify({
          message: 'Entrada/Salida guardada',
          icon: 'check_circle',
          color: 'positive'
        })
        this.cashflow = false
      } catch (error) {
        this.$q.notify({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.loadingCashflow = true
      }
    },
    /**
     * Calculate taxe
     * @param {Object} taxe
     */
    calculateTax (taxe) {
      if (taxe.pivot.type_taxe === 'percentage') {
        taxe.total = (this.totalBill * taxe.pivot.amount) / 100
      } else {
        taxe.total = this.totalBill + taxe.pivot.amount
      }
      return taxe.total
    },
    /**
     * Save clients
     */
    saveClient () {
      this.loadingClient = true
      this.$api.post('clients', this.clientAdded)
        .then(({ data }) => {
          this.openAddClient = false
          this.clientAdded = {}
          this.client = data
          this.loadingClient = false
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingClient = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Save without print
     */
    saveWithoutPrint () {
      this.withoutPrint = true
      this.$refs.saveBill.submit()
    },
    /**
     * Submit bill
     */
    submitBill () {
      this.$refs.saveBill.submit()
    },
    /**
     * Cancel payment
     */
    cancelPayment () {
      this.dialogPayment = false
      this.payments = []
    },
    /**
     * Add bill payment
     * @param {Object} data data payments
     */
    addPayment (data) {
      this.payments.push({
        name: data.name,
        amount: this.pendingPayment,
        reference: null,
        coin_id: this.coin.id,
        payment_method_id: data.id,
        user_created_id: this.userSession.id
      })
      localStorage.setItem('payments', JSON.stringify(this.payments))
    },
    /**
     * Get all payment-methods
     */
    getPaymentMethods () {
      this.loadingPaymentMethods = true
      this.$api.get('payment-methods')
        .then(({ data }) => {
          this.loadingPaymentMethods = false
          this.paymentMethods = data
        })
        .catch(err => {
          this.loadingPaymentMethods = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterTypeOfServices (value, update) {
      this.$api.get('type-of-services', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.typeOfServices = data
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterCategories (value, update) {
      this.$api.get('categories', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.categories = data
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getCoins () {
      this.$api.get('coins', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.coins = data
          this.coin = data[0]
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    getTaxes () {
      this.$api.get('taxes', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.taxes = data
          this.taxe = data[0]
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
     * Select category
     * @param {String} value user Session Value filter
     * @param {Callback} update update options
     */
    filterClients (value, update) {
      this.$api.get('clients', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataSearch: {
            name: value,
            document_number: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.clients = data
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
     * Free table
     * @param {Object} table  table data
     */
    selectInvoice (table) {
      const invoiceOne = table.invoices[0]
      this.$router.push({ name: 'Billing', query: { id: invoiceOne.id } })
      this.dialogTable = false
    },
    /**
     * Free table
     * @param {Object} table  table data
     */
    async freeTable ({ id }) {
      try {
        this.$api.post('free-tables', { id })
        this.$refs.drawerTable.getTables(this.$refs.drawerTable.livingRoom)
      } catch (error) {
        notify(error.message, 'negative', 'warning')
      }
    },
    /**
     * Get all tables
     */
    getTables (data) {
      this.$api.get('tables', {
        params: {
          dataFilter: {
            living_room_id: data.id
          },
          sortBy: 'id',
          sortOrder: 'desc'
        }
      })
        .then(({ data }) => {
          this.tables = data
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
     * Get all tables
     */
    getAllProducts () {
      this.$api.get('products', {
        params: {
          sortBy: 'id',
          sortOrder: 'desc',
          dataFilter: {
            category_id: this.category ? this.category.id : null
          }
        }
      })
        .then(({ data }) => {
          this.allProducts = data
        })
        .catch(err => {
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },

    setPayments (invoicePayments) {
      invoicePayments?.forEach(payment => {
        this.payments.push({
          id: payment.payment_method_id,
          name: payment.payment_method.name,
          amount: payment.amount,
          reference: payment.reference,
          coin_id: payment.coin_id,
          update: true
        })
      })
    },
    /**
     * Get all tables
     */
    getInvoiceOne (data) {
      this.$api.get(`invoices/${data}`)
        .then(({ data }) => {
          this.invoice = data.data
          this.products = data.data.products.map(product => {
            return {
              ...product,
              ...product.pivot,
              subtotal: product.pivot.price * product.pivot.amount
            }
          })
          this.client = data.data.client
          this.invoiceType = data.data.invoice_type
          this.typeOfService = data.data.type_of_service
          this.tableSelected = data.data.tables.map(table => table.id)
          this.searchInvoice = false
          this.setPayments(data.data.invoice_payments)
          this.search = ''
          this.invoiceDescription = data.data.description
          this.deliveryDate = data.data.delivery_date
          this.calculateTotal()
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
     * Clear invoice
     */
    clear () {
      this.payments = []
      this.products = []
      this.tableSelected = []
      this.products = []
      this.invoiceDescription = ''
      this.deliveryDate = formatDate(Date(), 'YYYY-MM-DD HH:mm:ss')
      this.dialogPayment = false
      this.calculateTotal()
      this.$router.push({ name: 'Billing' })
      setTimeout(() => {
        this.$refs.saveBill.resetValidation()
        this.invoice = null
      }, 100)
    },
    /**
     * Print invoice
     * @param {Object} data invoice saved
     */
    printBill (data) {
      if (this.withoutPrint) {
        this.clear()
        this.withoutPrint = false
        return
      }
      const doc = printTicket(data)
      const pdfUrl = doc.output('bloburl')
      window.open(pdfUrl, '_blank')
      this.clear()
      this.withoutPrint = false
    },

    setParamsBill () {
      if (!this.withoutPayment.includes(this.invoiceType?.name) && this.payments?.length <= 0) {
        this.$q.notify({
          message: 'No a seleccionado un pago',
          icon: 'warning',
          color: 'negative'
        })
        this.dialogPayment = true
        return false
      }

      return {
        ...this.invoice,
        client_id: this.client.id,
        seller_id: this.userSession.id,
        coin_id: this.coin.id,
        description: this.invoiceDescription,
        invoice_taxes: this.invoiceTaxes,
        type_of_service_id: this.typeOfService.id,
        invoice_type_id: this.invoiceType.id,
        user_created_id: this.userSession.id,
        exchange_rate: this.exchangeRate,
        delivery_date: this.deliveryDate,
        products: this.products,
        payments: this.payments,
        tables: this.tableSelected
      }
    },
    /**
     * Save bill and payments
     */
    async saveBill () {
      try {
        const params = this.setParamsBill()
        if (!params) return
        if (this.$route.query.id) {
          const { data } = await this.$api.put(`invoices/${this.$route.query.id}`, params)
          this.printBill(data.data)
        } else {
          const { data } = await this.$api.post('invoices', params)
          this.printBill(data.data)
        }
        this.$q.notify({
          message: 'Factura guardada exitosamente',
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (error) {
        this.$q.notify({
          message: error.message,
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Get local storage
     */
    getLocalStorage () {
      this.products = JSON.parse(localStorage.getItem('products')) ?? []
      this.payments = JSON.parse(localStorage.getItem('payments')) ?? []
      this.tableSelected = JSON.parse(localStorage.getItem('tableSelected')) ?? []
      this.client = JSON.parse(localStorage.getItem('client')) ?? null
      this.invoiceType = JSON.parse(localStorage.getItem('invoiceType')) ?? null
      this.typeOfService = JSON.parse(localStorage.getItem('typeOfService')) ?? null
      this.calculateTotal()
    },
    /**
     * Save exchange rate
     */
    saveExchangeRate () {
      this.calculateTotal()
    },
    /**
     * Delete product in table
     * @param {Object} product props table products
     */
    deleteProduct (product) {
      this.products.splice(product.rowIndex, 1)
      this.calculateTotal()
    },
    /**
     * Delete invoice payment
     * @param {Number} index value index payments
     */
    deletePayment (index) {
      this.payments.splice(index, 1)
    },
    /**
     * Calculate the total
     */
    calculateTotal () {
      let total = 0
      this.products.forEach(product => {
        total += product.subtotal
      })
      this.totalBill = total
    },
    /**
     * Calculate the total and subtotal
     * @param {Object} data props products
     */
    calculate (data) {
      data.subtotal = data.price * data.amount
      this.calculateTotal()
    },
    /**
     * Validate products
     * @param {*} data product selected
     */
    validateProduct (data, validUnitMeasurement = false) {
      const findProduct = this.products.find(product => product.id === data.id)
      const unitMeasurement = data?.unit_of_measure?.acronym === 'KG'

      if (validUnitMeasurement && unitMeasurement) {
        this.quantityDialog = true
        this.currentAmount = data.price
        this.productQuantity = data
        return
      }

      if (findProduct) {
        const quantity = unitMeasurement ? this.quantity : findProduct?.amount + 1
        findProduct.amount = quantity
        findProduct.product_id = findProduct.id
        this.calculate(findProduct)
      } else {
        data.amount = this.quantity
        data.subtotal = 0
        data.product_id = data.id
        this.products.push(data)
        this.calculate(data)
      }
      this.quantity = 1
      this.currentAmount = 0
      this.quantityDialog = false
      localStorage.setItem('products', JSON.stringify(this.products))
    },
    /**
     * Get one product
     * @param {Number} barcode barcode product
     */
    async getOneProduct (barcode = this.barcode) {
      this.$api.get('products', {
        params: {
          dataEqualFilter: {
            barcode: this.barcode
          }
        }
      })
        .then(({ data }) => {
          const product = data[0]
          if (product) {
            this.validateProduct(product, true)
            this.barcode = null
            this.modelScan = false
          } else {
            this.$q.notify({
              message: 'Producto no encontrado',
              icon: 'warning',
              color: 'negative'
            })
          }
        })
        .catch((error) => {
          this.$q.notify({
            message: error.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    }
  }
}
</script>
