<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddInvoiceType = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Monedas"
          row-key="name"
          :columns="columns"
          :rows="invoiceTypes"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editInvoiceType"
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
    <q-dialog v-model="openEditInvoiceType" persistent>
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
                v-model="invoiceType.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="invoiceType.acronym_serie"
                autofocus
                label="Simbolo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                filled
                v-model="invoiceType.taxes"
                use-input
                use-chips
                multiple
                input-debounce="0"
                option-label="name"
                label="Impuestos"
                :options="taxes"
                @filter="filterTaxes"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteInvoiceType" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddInvoiceType" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveInvoiceType">
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
                v-model="invoiceType.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="invoiceType.acronym_serie"
                autofocus
                label="Acronimo de serie"
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
import { Notify } from 'quasar'
export default {
  data () {
    return {
      invoiceTypes: [],
      invoiceType: {},
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
      openAddInvoiceType: false,
      openEditInvoiceType: null,
      userSession: null,
      taxes: [],
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
          name: 'acronym_serie',
          align: 'left',
          label: 'Acronimo de serie',
          field: 'acronym_serie',
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
    this.invoiceType.user_created_id = this.userSession.id
    this.invoiceType.user_updated_id = this.userSession.id
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  methods: {
    /**
     * Get all taxes
     */
    filterTaxes (val, update) {
      this.$api.get('taxes', {
        params: {
          name: val
        }
      })
        .then(({ data }) => {
          update(() => {
            this.taxes = data
          })
        })
        .catch(err => {
          update(() => {
            this.taxes = []
          })
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
      this.openAddInvoiceType = false
      this.openEditInvoiceType = false
      this.invoiceType = {}
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
      this.getInvoiceTypes(this.params)
    },
    /**
     * Get all invoiceTypes
     */
    getInvoiceTypes (params = this.params) {
      this.visible = true
      this.$api.get('invoice-types', { params })
        .then(({ data }) => {
          this.invoiceTypes = data.data
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
      this.getInvoiceTypes(this.params)
    },
    /**
     * Save invoiceTypes
     */
    saveInvoiceType () {
      this.visible = true
      this.$api.post('invoice-types', this.invoiceType)
        .then(({ data }) => {
          this.getInvoiceTypes()
          this.openAddInvoiceType = false
          this.visible = false
          this.invoiceType = {}
          Notify.create({
            message: 'Moneda creada exitosamente',
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
     * View invoiceType
     */
    editInvoiceType (event, row, index) {
      this.openEditInvoiceType = true
      this.invoiceType = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`invoice-types/${this.invoiceType.id}`, this.invoiceType)
        .then(({ data }) => {
          this.getInvoiceTypes()
          this.openEditInvoiceType = false
          this.visible = false
          this.invoiceType = {}
          Notify.create({
            message: 'Moneda editada exitosamente',
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
     * Delete invoiceType
     */
    deleteInvoiceType () {
      this.visible = true
      this.$api.delete(`invoice-types${this.invoiceType.id}`)
        .then(({ data }) => {
          this.getInvoiceTypes()
          this.openEditInvoiceType = false
          this.visible = false
          this.invoiceType = {}
          Notify.create({
            message: 'Moneda eliminada exitosamente',
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
