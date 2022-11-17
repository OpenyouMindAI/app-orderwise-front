<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddUser = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Usuarios"
          row-key="name"
          :columns="columns"
          :rows="users"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editUser"
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
    <q-dialog v-model="openEditUser" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar usuario</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Rol"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="role"
                :options="roles"
                :rules="[val => !!val || 'El campo es requerido.']"
                @filter="filterRoles"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.email"
                autofocus
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.username"
                autofocus
                label="Usuario"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.password"
                autofocus
                type="password"
                label="Contraseña"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deleteUser" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddUser" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveUser">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar usuario</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Rol"
                input-debounce="0"
                option-label="name"
                option-value="id"
                v-model="role"
                :options="roles"
                :rules="[val => !!val || 'El campo es requerido.']"
                @filter="filterRoles"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.email"
                autofocus
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.username"
                autofocus
                label="Usuario"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="user.password"
                autofocus
                type="password"
                label="Contraseña"
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
      users: [],
      roles: [],
      role: null,
      user: {},
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
      openAddUser: false,
      openEditUser: null,
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
          name: 'username',
          align: 'left',
          label: 'Usuario',
          field: 'username',
          sortable: true
        },
        {
          name: 'email',
          align: 'left',
          label: 'Correo',
          field: 'email',
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
    this.user.user_created_id = this.userSession.id
    this.user.user_updated_id = this.userSession.id
  },
  watch: {
    filter (data) {
      this.searchData(data)
    },
    role (data) {
      if (data) {
        this.user.role_id = data.id
      }
    }
  },
  methods: {
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterRoles (value, update) {
      this.$api.get('roles', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          update(() => {
            this.roles = data
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
     * Close all modals
     */
    closeModal () {
      this.openAddUser = false
      this.openEditUser = false
      this.user = {}
      this.role = null
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
      this.getUsers(this.params)
    },
    /**
     * Get all users
     */
    getUsers (params = this.params) {
      this.visible = true
      this.$api.get('users', { params })
        .then(({ data }) => {
          this.users = data.data
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
      this.getUsers(this.params)
    },
    /**
     * Save users
     */
    saveUser () {
      this.visible = true
      this.$api.post('users', this.user)
        .then(({ data }) => {
          this.getUsers()
          this.openAddUser = false
          this.visible = false
          this.user = {}
          this.role = null
          Notify.create({
            message: 'Usuario creado exitosamente',
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
     * View user
     */
    editUser (event, row, index) {
      this.openEditUser = true
      this.user = row
      this.role = row.role
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`users/${this.user.id}`, this.user)
        .then(({ data }) => {
          this.getUsers()
          this.openEditUser = false
          this.visible = false
          this.user = {}
          this.role = null
          Notify.create({
            message: 'Usuario editado exitosamente',
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
     * Delete user
     */
    deleteUser () {
      this.visible = true
      this.$api.delete(`users/${this.user.id}`)
        .then(({ data }) => {
          this.getUsers()
          this.openEditUser = false
          this.visible = false
          this.user = {}
          Notify.create({
            message: 'Usuario eliminada exitosamente',
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
