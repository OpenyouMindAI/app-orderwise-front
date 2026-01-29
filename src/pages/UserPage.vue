<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Usuarios
        </span>
        <div class="text-right">
          <q-btn color="primary" @click="openAddUser = true" icon="add_circle" round/>
        </div>
      </div>
      <div class="col-12">
        <q-table
          title="Usuarios"
          row-key="id"
          :columns="columns"
          :rows="users"
          :loading="visible"
          :filter="filter"
          :visible-columns="visibleColumns"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editUser"
          @request="setPagination"
          no-data-label="Registro no encontrado"
          :grid="$q.screen.lt.md"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:top>
            <div class="row items-center full-width justify-end">
              <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar" class="col-xs-12 col-sm-4">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editUser(null, props.row)">
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="column">
                    <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">#{{ props.row.id }}</div>
                    <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.username }}</div>
                  </div>
                  <div class="column items-end">
                    <q-badge
                      v-if="props.row.roles && props.row.roles.length"
                      color="primary"
                      :label="props.row.roles[0].name"
                      class="q-py-xs q-px-sm text-weight-bold shadow-1"
                      rounded
                      style="font-size: 10px; letter-spacing: 0.5px"
                    />
                  </div>
                </q-card-section>

                <q-separator color="grey-2" inset />

                <q-card-section class="compact-card-body">
                  <div class="row q-col-gutter-y-sm">
                    <div class="col-12">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Nombre</div>
                      <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.name }}</div>
                    </div>
                    <div class="col-12">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Correo</div>
                      <div class="text-body2 text-grey-8 ellipsis">{{ props.row.email }}</div>
                    </div>
                    <div class="col-12" v-if="props.row.branch_offices && props.row.branch_offices.length">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Sucursal</div>
                      <div class="text-body2 text-grey-8">{{ props.row.branch_offices.map(b => b.name).join(', ') }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditUser" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 80vw;'"
      >
        <q-form @submit="saveEdit" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Modificar usuario</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="q-pa-md scroll col">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="user.name"
                  autofocus
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="user.email"
                  type="email"
                  label="Correo"
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="user.username"
                  label="Usuario"
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  dense
                  v-model="user.password"
                  type="password"
                  label="Contraseña"
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-select
                  use-input
                  filled
                  dense
                  label="Rol"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  multiple
                  v-model="role"
                  :options="roles"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterRoles"
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12">
                <q-select
                  use-input
                  filled
                  dense
                  label="Sucursales"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  multiple
                  v-model="branchOffice"
                  :options="branchOffices"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterBranchOffices"
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn color="negative" flat icon="delete" label="Eliminar" @click="deleteUser" :loading="visible" />
            <q-btn color="primary" unelevated icon="save" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddUser" persistent :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 80vw;'"
      >
        <q-form @submit="saveUser" class="column full-height">
          <q-card-section class="row items-center bg-primary text-white q-py-sm">
            <div class="text-h6">Agregar usuario</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="q-pa-md scroll col">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="user.name"
                  autofocus
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="user.email"
                  type="email"
                  label="Correo"
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="user.username"
                  label="Usuario"
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  dense
                  v-model="user.password"
                  type="password"
                  label="Contraseña"
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-select
                  use-input
                  filled
                  dense
                  label="Rol"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  multiple
                  v-model="role"
                  :options="roles"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterRoles"
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
              <div class="col-12">
                <q-select
                  use-input
                  filled
                  dense
                  label="Sucursales"
                  input-debounce="0"
                  option-label="name"
                  option-value="id"
                  multiple
                  v-model="branchOffice"
                  :options="branchOffices"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  @filter="filterBranchOffices"
                  hide-bottom-space
                  :behavior="$q.screen.lt.sm ? 'dialog' : 'menu'"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn color="primary" unelevated icon="add" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
export default {
  data () {
    return {
      users: [],
      roles: [],
      branchOffice: [],
      branchOffices: [],
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
        },
        {
          name: 'roles',
          align: 'left',
          label: 'Roles',
          field: 'roles',
          format: (value) => value.map((role) => role.name).join(', '),
          sortable: true
        },
        {
          name: 'branch_offices',
          align: 'left',
          label: 'Sucursal',
          field: 'branch_offices',
          format: (value) => value.map((branch) => branch.name).join(', '),
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
      visibleColumns: ['id', 'name', 'username', 'email', 'roles', 'branch_offices']
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  computed: {
    ...mapState(authentication, ['userSession'])
  },
  watch: {
    filter (data) {
      this.searchData(data)
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    filterBranchOffices (value, update) {
      this.$api.get('branch-offices', {
        params: {
          dataSearch: {
            name: value
          }
        }
      })
        .then(({ data }) => {
          console.log(data)
          update(() => {
            this.branchOffices = data
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
      this.$api.post('users', {
        ...this.user,
        branchOffices: this.branchOffice.map(branchOffice => branchOffice?.id),
        roles: this.role.map(role => role.id)
      })
        .then(({ data }) => {
          this.getUsers()
          this.openAddUser = false
          this.visible = false
          this.user = {}
          this.role = []
          this.branchOffice = []
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
      this.role = row.roles
      this.branchOffice = row.branch_offices
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`users/${this.user.id}`, {
        ...this.user,
        branchOffices: this.branchOffice.map(branchOffice => branchOffice?.id),
        roles: this.role.map(role => role.id)
      })
        .then(({ data }) => {
          this.getUsers()
          this.openEditUser = false
          this.visible = false
          this.user = {}
          this.role = []
          this.branchOffice = []
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

<style scoped>
/* Clases para tarjetas compactas */
.compact-card-header {
  padding: 0.5rem 1rem !important;
}

.compact-card-body {
  padding: 0.5rem 1rem !important;
}

.compact-card-footer {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  padding-top: 0 !important;
}

.compact-total-container {
  padding: 0.2rem 0.5rem !important;
}

@media (max-width: 1023px) {
  /* Reducir padding del top de la tabla - usando deep selector para sobrescribir Quasar */
  :deep(.q-table__top) {
    padding: 0 !important;
  }
  :deep(.q-table__top .flex) {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: center;
  }

  :deep(.q-table__top .q-select) {
    max-width: 200px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
