<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddRole = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Roles"
          row-key="name"
          :columns="columns"
          :rows="roles"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editRole"
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
    <q-dialog v-model="openEditRole" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar rol</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="role.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="role.acronym"
                autofocus
                label="Acronimo"
                disable
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" v-for="modul in modules" :key="modul.id">
              <q-toggle
                size="xs"
                v-model="moduleSelected"
                :val="modul.id"
                :label="modul.title"
                :disable="visible"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteRole" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddRole" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveRole">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar rol</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="role.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="role.acronym"
                autofocus
                label="Acronimo"
              />
            </div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" v-for="modul in modules" :key="modul.id">
              <q-toggle
                size="xs"
                v-model="moduleSelected"
                :val="modul.id"
                :label="modul.title"
                :disable="visible"
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
      roles: [],
      modules: [],
      role: {},
      filter: '',
      moduleSelected: [],
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
      openAddRole: false,
      openEditRole: null,
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
          name: 'acronym',
          align: 'left',
          label: 'Acronimo',
          field: 'acronym',
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
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  created () {
    this.getModules()
    this.userSession = JSON.parse(localStorage.getItem('user'))
    this.role.user_created_id = this.userSession.id
    this.role.user_updated_id = this.userSession.id
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddRole = false
      this.openEditRole = false
      this.role = {}
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
      this.getRoles(this.params)
    },
    /**
     * Get all roles
     */
    getRoles (params = this.params) {
      this.visible = true
      this.$api.get('roles', { params })
        .then(({ data }) => {
          this.roles = data.data
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
      this.getRoles(this.params)
    },
    /**
     * Save roles
     */
    saveRole () {
      this.visible = true
      this.role.modules = this.moduleSelected
      console.log(this.role, this.moduleSelected)
      this.$api.post('roles', this.role)
        .then(({ data }) => {
          this.getRoles()
          this.openAddRole = false
          this.visible = false
          this.role = {}
          this.moduleSelected = []
          Notify.create({
            message: 'Rol creado exitosamente',
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
     * View role
     */
    editRole (event, row, index) {
      this.openEditRole = true
      this.role = row
      this.moduleSelected = row.modules.map(element => element.id)
    },
    /**
     * Get all sections
     */
    async getModules () {
      const { data } = await this.$api.get('modules')
      this.modules = data
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.role.modules = this.moduleSelected
      this.$api.put(`roles/${this.role.id}`, this.role)
        .then(({ data }) => {
          this.getRoles()
          this.openEditRole = false
          this.visible = false
          this.role = {}
          this.moduleSelected = []
          Notify.create({
            message: 'Rol editado exitosamente',
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
     * Delete role
     */
    deleteRole () {
      this.visible = true
      this.$api.delete(`roles/${this.role.id}`)
        .then(({ data }) => {
          this.getRoles()
          this.openEditRole = false
          this.visible = false
          this.role = {}
          Notify.create({
            message: 'Rol eliminada exitosamente',
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
