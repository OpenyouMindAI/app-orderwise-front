<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddTaxe = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Impuestos"
          row-key="name"
          :columns="columns"
          :rows="taxes"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editTaxe"
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
    <q-dialog v-model="openEditTaxe" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar impuesto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="taxe.name"
                autofocus
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="loadingSave"/>
            <q-btn color="negative" label="Eliminar" @click="deleteTaxe" :loading="loadingDelete" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddTaxe" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveTaxe">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar impuesto</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="taxe.name"
                autofocus
                label="Nombre"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit" :loading="loadingSave"/>
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
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
      taxes: [],
      taxe: {},
      loadingDelete: false,
      loadingSave: false,
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
      openAddTaxe: false,
      openEditTaxe: null,
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
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
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
    this.taxe.user_created_id = this.userSession.id
    this.taxe.user_updated_id = this.userSession.id
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
      this.openAddTaxe = false
      this.openEditTaxe = false
      this.taxe = {}
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
      this.getTaxes(this.params)
    },
    /**
     * Get all taxes
     */
    getTaxes (params = this.params) {
      this.visible = true
      this.$api.get('taxes', { params })
        .then(({ data }) => {
          this.taxes = data.data
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
      this.getTaxes(this.params)
    },
    /**
     * Save taxes
     */
    saveTaxe () {
      this.loadingSave = true
      this.$api.post('taxes', this.taxe)
        .then(({ data }) => {
          this.getTaxes()
          this.openAddTaxe = false
          this.loadingSave = false
          this.taxe = {}
          Notify.create({
            message: 'Impuesto creada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingSave = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * View taxe
     */
    editTaxe (event, row, index) {
      this.openEditTaxe = true
      this.taxe = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.loadingSave = true
      this.$api.put(`taxes/${this.taxe.id}`, this.taxe)
        .then(({ data }) => {
          this.getTaxes()
          this.openEditTaxe = false
          this.loadingSave = false
          this.taxe = {}
          Notify.create({
            message: 'Impuesto editado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingSave = false
          Notify.create({
            message: err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Delete taxe
     */
    deleteTaxe () {
      this.loadingDelete = true
      this.$api.delete(`taxes/${this.taxe.id}`)
        .then(({ data }) => {
          this.getTaxes()
          this.openEditTaxe = false
          this.loadingDelete = false
          this.taxe = {}
          Notify.create({
            message: 'Impuesto eliminado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.loadingDelete = false
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
