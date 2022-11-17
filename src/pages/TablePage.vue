<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddTable = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Mesas"
          row-key="name"
          :columns="columns"
          :rows="tables"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editTable"
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
    <q-dialog v-model="openEditTable" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.number"
                autofocus
                label="Número"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteTable" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddTable" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveTable">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar mesa</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="table.number"
                autofocus
                label="Número"
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
      tables: [],
      table: {},
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
      openAddTable: false,
      openEditTable: null,
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
        },
        {
          name: 'number',
          align: 'left',
          label: 'Número',
          field: 'number',
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
    this.table.user_created_id = this.userSession.id
    this.table.user_updated_id = this.userSession.id
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
      this.openAddTable = false
      this.openEditTable = false
      this.table = {}
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
      this.getTables(this.params)
    },
    /**
     * Get all tables
     */
    getTables (params = this.params) {
      this.visible = true
      this.$api.get('tables', { params })
        .then(({ data }) => {
          this.tables = data.data
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
      this.getTables(this.params)
    },
    /**
     * Save tables
     */
    saveTable () {
      this.visible = true
      this.$api.post('tables', this.table)
        .then(({ data }) => {
          this.getTables()
          this.openAddTable = false
          this.visible = false
          this.table = {}
          Notify.create({
            message: 'Mesa creada exitosamente',
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
     * View table
     */
    editTable (event, row, index) {
      this.openEditTable = true
      this.table = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`tables/${this.table.id}`, this.table)
        .then(({ data }) => {
          this.getTables()
          this.openEditTable = false
          this.visible = false
          this.table = {}
          Notify.create({
            message: 'Mesa editada exitosamente',
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
     * Delete table
     */
    deleteTable () {
      this.visible = true
      this.$api.delete(`tables/${this.table.id}`)
        .then(({ data }) => {
          this.getTables()
          this.openEditTable = false
          this.visible = false
          this.table = {}
          Notify.create({
            message: 'Mesa eliminada exitosamente',
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
