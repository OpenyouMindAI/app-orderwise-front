<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddInvoice = true" icon="add_circle"/>
      </div>
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
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar moneda</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="coin.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="coin.symbol"
                autofocus
                label="Simbolo"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteInvoice" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddInvoice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveInvoice">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar moneda</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="coin.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="coin.symbol"
                autofocus
                label="Simbolo"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify, date } from 'quasar'
export default {
  data () {
    return {
      invoices: [],
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
          name: ''
        }
      },
      visible: false,
      openAddInvoice: false,
      openEditInvoice: null,
      userSession: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
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
        }
      ],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
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
      this.$api.post('invoices', this.coin)
        .then(({ data }) => {
          this.getInvoices()
          this.openAddInvoice = false
          this.visible = false
          this.coin = {}
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
      this.coin = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`invoices/${this.coin.id}`, this.coin)
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.coin = {}
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
      this.$api.delete(`invoices/${this.coin.id}`)
        .then(({ data }) => {
          this.getInvoices()
          this.openEditInvoice = false
          this.visible = false
          this.coin = {}
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
