<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Usuarios
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn color="grey-7" @click="openFilterModal = true" icon="filter_list" round flat>
            <q-tooltip>Filtros</q-tooltip>
          </q-btn>
          <q-btn color="grey-7" @click="openColumnSelector = true" icon="view_column" round flat>
            <q-tooltip>Columnas visibles</q-tooltip>
          </q-btn>
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
            <div class="row items-center full-width justify-between q-gutter-sm">
              <div class="row items-center q-gutter-x-sm" v-if="hasActiveFilters">
                <q-chip removable color="primary" text-color="white" @remove="clearFilters" icon="filter_list">
                  Filtros activos
                </q-chip>
              </div>
              <q-space />
              <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar" class="col-xs-12 col-sm-4">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>

          <!-- Custom body cell for boolean columns -->
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_active ? 'positive' : 'negative'" :label="props.row.is_active ? 'Sí' : 'No'" />
            </q-td>
          </template>
          <template v-slot:body-cell-is_root="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_root ? 'orange' : 'grey'" :label="props.row.is_root ? 'Sí' : 'No'" />
            </q-td>
          </template>
          <template v-slot:body-cell-is_credit="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_credit ? 'positive' : 'grey'" :label="props.row.is_credit ? 'Sí' : 'No'" />
            </q-td>
          </template>
          <template v-slot:body-cell-email_verified_at="props">
            <q-td :props="props">
              <q-badge v-if="props.row.email_verified_at" color="positive" label="Verificado" />
              <q-badge v-else color="grey" label="No verificado" />
            </q-td>
          </template>
          <template v-slot:body-cell-phone_verified_at="props">
            <q-td :props="props">
              <q-badge v-if="props.row.phone_verified_at" color="positive" label="Verificado" />
              <q-badge v-else color="grey" label="No verificado" />
            </q-td>
          </template>
          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <q-avatar v-if="props.row.avatar" size="32px">
                <q-img :src="props.row.avatar" />
              </q-avatar>
              <q-icon v-else name="account_circle" size="32px" color="grey-5" />
            </q-td>
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
                      <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.name }} {{ props.row.last_name }}</div>
                    </div>
                    <div class="col-12">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Correo</div>
                      <div class="text-body2 text-grey-8 ellipsis">{{ props.row.email }}</div>
                    </div>
                    <div class="col-12" v-if="props.row.phone_number">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Teléfono</div>
                      <div class="text-body2 text-grey-8">{{ props.row.phone_number }}</div>
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

    <!-- Edit User Dialog -->
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
                  autocomplete="off"
                  name="edit-user-username"
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
                  autocomplete="new-password"
                  name="edit-user-password"
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
            <q-btn color="amber-8" flat icon="link" label="Generar link contraseña" @click="generateResetLink" :loading="generatingLink" />
            <q-btn color="negative" flat icon="delete" label="Eliminar" @click="deleteUser" :loading="visible" />
            <q-btn color="primary" unelevated icon="save" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Add User Dialog -->
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
                  autocomplete="off"
                  name="new-user-username"
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
                  autocomplete="new-password"
                  name="new-user-password"
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

    <!-- Generated Link Dialog -->
    <q-dialog v-model="showResetLinkDialog">
      <q-card style="min-width: 400px; max-width: 550px;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <q-icon name="link" size="24px" class="q-mr-sm" />
          <div class="text-h6">Link de restablecimiento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-7 q-mb-md">
            Comparte este enlace con el usuario <strong>{{ user.name }}</strong> para que pueda restablecer su contraseña. El enlace expira en 24 horas.
          </div>
          <q-input
            v-model="generatedResetUrl"
            readonly
            filled
            dense
            type="textarea"
            autogrow
          >
            <template v-slot:append>
              <q-btn flat round icon="content_copy" @click="copyResetLink">
                <q-tooltip>Copiar enlace</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          <q-btn unelevated label="Copiar enlace" color="primary" icon="content_copy" @click="copyResetLink" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Column Selector Dialog -->
    <q-dialog v-model="openColumnSelector">
      <q-card style="min-width: 350px; max-width: 450px;">
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <q-icon name="view_column" size="24px" class="q-mr-sm" />
          <div class="text-h6">Columnas visibles</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-6" v-for="col in columns" :key="col.name">
              <q-checkbox
                v-model="visibleColumns"
                :val="col.name"
                :label="col.label"
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Mostrar todas" color="primary" @click="showAllColumns" />
          <q-btn flat label="Por defecto" color="grey-7" @click="resetColumns" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Filter Modal -->
    <q-dialog v-model="openFilterModal" :maximized="$q.screen.lt.sm">
      <q-card
        :class="$q.screen.lt.sm ? 'full-height column' : ''"
        :style="$q.screen.lt.sm ? 'width: 100%;' : 'width: 600px; max-width: 80vw;'"
      >
        <q-card-section class="row items-center bg-primary text-white q-py-sm">
          <q-icon name="filter_list" size="24px" class="q-mr-sm" />
          <div class="text-h6">Filtros</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="openFilterModal = false" text-color="white" />
        </q-card-section>

        <q-card-section class="q-pa-md scroll" :class="$q.screen.lt.sm ? 'col' : ''" style="max-height: 70vh;">
          <div class="row q-col-gutter-md">
            <!-- Name -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.name" label="Nombre" clearable hide-bottom-space />
            </div>
            <!-- Last Name -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.last_name" label="Apellido" clearable hide-bottom-space />
            </div>
            <!-- Username -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.username" label="Usuario" clearable hide-bottom-space />
            </div>
            <!-- Email -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.email" label="Correo" clearable hide-bottom-space />
            </div>
            <!-- Phone -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.phone_number" label="Teléfono" clearable hide-bottom-space />
            </div>
            <!-- Document Number -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.document_number" label="Nº Documento" clearable hide-bottom-space />
            </div>
            <!-- Is Active -->
            <div class="col-12 col-sm-6">
              <q-select
                filled
                dense
                v-model="filters.is_active"
                label="Activo"
                :options="booleanOptions"
                emit-value
                map-options
                clearable
                hide-bottom-space
              />
            </div>
            <!-- Is Credit -->
            <div class="col-12 col-sm-6">
              <q-select
                filled
                dense
                v-model="filters.is_credit"
                label="Crédito"
                :options="booleanOptions"
                emit-value
                map-options
                clearable
                hide-bottom-space
              />
            </div>
            <!-- Email Verified -->
            <div class="col-12 col-sm-6">
              <q-select
                filled
                dense
                v-model="filters.email_verified"
                label="Email verificado"
                :options="booleanOptions"
                emit-value
                map-options
                clearable
                hide-bottom-space
              />
            </div>
            <!-- Created At Range -->
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.created_from" label="Creado desde" type="date" clearable hide-bottom-space />
            </div>
            <div class="col-12 col-sm-6">
              <q-input filled dense v-model="filters.created_to" label="Creado hasta" type="date" clearable hide-bottom-space />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary bg-grey-1">
          <q-btn flat icon="clear_all" label="Limpiar" color="grey-7" @click="clearFilters" />
          <q-btn unelevated icon="filter_list" label="Aplicar filtros" color="primary" @click="applyFilters" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { Notify, copyToClipboard } from 'quasar'
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
      openColumnSelector: false,
      openFilterModal: false,
      /**
       * Password reset link generation loading
       * @type {boolean}
       */
      generatingLink: false,
      /**
       * Show reset link dialog
       * @type {boolean}
       */
      showResetLinkDialog: false,
      /**
       * Generated reset URL
       * @type {string}
       */
      generatedResetUrl: '',
      /**
       * Filter form data
       * @type {Object}
       */
      filters: {
        id: null,
        name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        document_number: '',
        is_active: null,
        is_root: null,
        is_credit: null,
        email_verified: null,
        created_from: '',
        created_to: ''
      },
      /**
       * Boolean options for select filters
       * @type {Array}
       */
      booleanOptions: [
        { label: 'Sí', value: '1' },
        { label: 'No', value: '0' }
      ],
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
          name: 'last_name',
          align: 'left',
          label: 'Apellido',
          field: 'last_name',
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
          name: 'phone_number',
          align: 'left',
          label: 'Teléfono',
          field: 'phone_number',
          sortable: true
        },
        {
          name: 'document_number',
          align: 'left',
          label: 'Nº Documento',
          field: 'document_number',
          sortable: true
        },
        {
          name: 'address',
          align: 'left',
          label: 'Dirección',
          field: 'address',
          sortable: false
        },
        {
          name: 'reference',
          align: 'left',
          label: 'Referencia',
          field: 'reference',
          sortable: true
        },
        {
          name: 'timezone',
          align: 'left',
          label: 'Zona horaria',
          field: 'timezone',
          sortable: true
        },
        {
          name: 'avatar',
          align: 'center',
          label: 'Avatar',
          field: 'avatar',
          sortable: false
        },
        {
          name: 'is_active',
          align: 'center',
          label: 'Activo',
          field: 'is_active',
          sortable: true
        },
        {
          name: 'is_root',
          align: 'center',
          label: 'Root',
          field: 'is_root',
          sortable: true
        },
        {
          name: 'is_credit',
          align: 'center',
          label: 'Crédito',
          field: 'is_credit',
          sortable: true
        },
        {
          name: 'email_verified_at',
          align: 'center',
          label: 'Email verificado',
          field: 'email_verified_at',
          sortable: true
        },
        {
          name: 'phone_verified_at',
          align: 'center',
          label: 'Tel. verificado',
          field: 'phone_verified_at',
          sortable: true
        },
        {
          name: 'google_email',
          align: 'left',
          label: 'Google email',
          field: 'google_email',
          sortable: true
        },
        {
          name: 'facebook_email',
          align: 'left',
          label: 'Facebook email',
          field: 'facebook_email',
          sortable: true
        },
        {
          name: 'roles',
          align: 'left',
          label: 'Roles',
          field: 'roles',
          format: (value) => value ? value.map((role) => role.name).join(', ') : '',
          sortable: true
        },
        {
          name: 'branch_offices',
          align: 'left',
          label: 'Sucursal',
          field: 'branch_offices',
          format: (value) => value ? value.map((branch) => branch.name).join(', ') : '',
          sortable: true
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Creado',
          field: 'created_at',
          format: (value) => value ? new Date(value).toLocaleDateString('es-AR') : '',
          sortable: true
        },
        {
          name: 'updated_at',
          align: 'left',
          label: 'Actualizado',
          field: 'updated_at',
          format: (value) => value ? new Date(value).toLocaleDateString('es-AR') : '',
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
      /**
       * Default visible columns
       * @type {Array}
       */
      defaultVisibleColumns: ['id', 'name', 'last_name', 'username', 'email', 'phone_number', 'is_active', 'roles', 'branch_offices'],
      visibleColumns: ['id', 'name', 'last_name', 'username', 'email', 'phone_number', 'is_active', 'roles', 'branch_offices']
    }
  },
  mounted () {
    this.setPagination({
      pagination: this.paginationConfig,
      filter: undefined
    })
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    /**
     * Check if there are active filters
     * @return {boolean}
     */
    hasActiveFilters () {
      return Object.values(this.filters).some(v => v !== null && v !== '' && v !== undefined)
    }
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
    },
    /**
     * Generate a password reset link for the selected user
     * @return {void}
     */
    generateResetLink () {
      if (!this.user?.id) return
      this.generatingLink = true
      this.$api.post(`users/${this.user.id}/generate-reset-link`)
        .then(({ data }) => {
          this.generatedResetUrl = data.reset_url
          this.showResetLinkDialog = true
          this.generatingLink = false
          Notify.create({
            message: 'Link de restablecimiento generado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.generatingLink = false
          Notify.create({
            message: err.response?.data?.message || err.message,
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Copy the generated reset link to clipboard
     * @return {void}
     */
    copyResetLink () {
      copyToClipboard(this.generatedResetUrl)
        .then(() => {
          Notify.create({
            message: 'Enlace copiado al portapapeles',
            icon: 'content_copy',
            color: 'positive'
          })
        })
        .catch(() => {
          Notify.create({
            message: 'No se pudo copiar el enlace',
            icon: 'warning',
            color: 'negative'
          })
        })
    },
    /**
     * Show all columns in the table
     * @return {void}
     */
    showAllColumns () {
      this.visibleColumns = this.columns.map(c => c.name)
    },
    /**
     * Reset columns to default visible columns
     * @return {void}
     */
    resetColumns () {
      this.visibleColumns = [...this.defaultVisibleColumns]
    },
    /**
     * Apply filters and reload data
     * @return {void}
     */
    applyFilters () {
      const dataFilter = {}
      const dataEqualFilter = {}

      if (this.filters.id) {
        dataEqualFilter.id = this.filters.id
      }
      if (this.filters.name) {
        dataFilter.name = this.filters.name
      }
      if (this.filters.last_name) {
        dataFilter.last_name = this.filters.last_name
      }
      if (this.filters.username) {
        dataFilter.username = this.filters.username
      }
      if (this.filters.email) {
        dataFilter.email = this.filters.email
      }
      if (this.filters.phone_number) {
        dataFilter.phone_number = this.filters.phone_number
      }
      if (this.filters.document_number) {
        dataFilter.document_number = this.filters.document_number
      }
      if (this.filters.is_active !== null && this.filters.is_active !== undefined) {
        dataEqualFilter.is_active = this.filters.is_active
      }
      if (this.filters.is_root !== null && this.filters.is_root !== undefined) {
        dataEqualFilter.is_root = this.filters.is_root
      }
      if (this.filters.is_credit !== null && this.filters.is_credit !== undefined) {
        dataEqualFilter.is_credit = this.filters.is_credit
      }

      this.params.dataFilter = Object.keys(dataFilter).length > 0 ? dataFilter : undefined
      this.params.dataEqualFilter = Object.keys(dataEqualFilter).length > 0 ? dataEqualFilter : undefined

      if (this.filters.created_from && this.filters.created_to) {
        this.params.dateFilter = {
          from: this.filters.created_from,
          to: this.filters.created_to,
          field: 'created_at'
        }
      } else {
        this.params.dateFilter = undefined
      }

      this.params.page = 1
      this.openFilterModal = false
      this.getUsers(this.params)
    },
    /**
     * Clear all filters and reload data
     * @return {void}
     */
    clearFilters () {
      this.filters = {
        id: null,
        name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        document_number: '',
        is_active: null,
        is_root: null,
        is_credit: null,
        email_verified: null,
        created_from: '',
        created_to: ''
      }
      this.params.dataFilter = undefined
      this.params.dataEqualFilter = undefined
      this.params.dateFilter = undefined
      this.params.page = 1
      this.getUsers(this.params)
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
