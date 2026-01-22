<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Proveedores
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn color="primary" @click="openAddProvider = true" icon="add_circle" round />
        </div>
      </div>
      <div class="col-12">
        <q-table
          title="Proveedores"
          row-key="id"
          :columns="columns"
          :rows="providers"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          :visible-columns="visibleColumns"
          @row-click="editProvider"
          @request="setPagination"
          no-data-label="Registro no encontrado"
          :grid="$q.screen.lt.md"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:top>
            <div class="flex justify-between items-center full-width">
              <q-select
                v-if="!$q.screen.lt.md"
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
              />
              <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editProvider(null, props.row)">
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="column">
                    <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                    <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.document_number }}</div>
                  </div>
                </q-card-section>

                <q-separator color="grey-2" inset />

                <q-card-section class="compact-card-body">
                  <div class="row q-col-gutter-y-sm">
                    <div class="col-12">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Contacto</div>
                      <div class="text-body2 text-grey-9 text-weight-bold ellipsis">
                        <q-icon name="phone" size="xs" class="q-mr-xs" v-if="props.row.phone_number" />
                        {{ props.row.phone_number || '-' }}
                      </div>
                      <div class="text-body2 text-grey-8 ellipsis">
                        <q-icon name="email" size="xs" class="q-mr-xs" v-if="props.row.email" />
                        {{ props.row.email || '-' }}
                      </div>
                    </div>
                    <div class="col-12" v-if="props.row.address">
                      <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Dirección</div>
                      <div class="text-body2 text-grey-8 ellipsis-2-lines">{{ props.row.address }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Modals (Edit/Add) permanecen similares pero con consistencia visual -->
    <q-dialog v-model="openEditProvider" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column': ''" :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 80vw;'}`">
        <q-form @submit="saveEdit" class="column full-height">
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Modificar proveedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="provider.document_number"
                  label="Número de documento"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="provider.name"
                  autofocus
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="provider.email"
                  type="email"
                  label="Correo"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="provider.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="provider.address"
                  label="Dirección"
                  type="textarea"
                  dense
                  autogrow
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn icon="delete" color="negative" label="Eliminar" @click="deleteProvider" :loading="visible" flat />
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openAddProvider" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column': ''" :style="`${$q.screen.lt.sm ? 'width: 100%;' : 'width: 700px; max-width: 80vw;'}`">
        <q-form @submit="saveProvider" class="column full-height">
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Agregar proveedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="provider.document_number"
                  label="Número de documento"
                  :rules="[val => !!val || 'El campo es requerido.']"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="provider.name"
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="provider.email"
                  type="email"
                  label="Correo"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  filled
                  v-model="provider.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="provider.address"
                  label="Dirección"
                  type="textarea"
                  dense
                  autogrow
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary bg-grey-1">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible" unelevated />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'

export default {
  data () {
    return {
      providers: [],
      documentTypes: [],
      provider: {},
      filter: '',
      visibleColumns: ['document_number', 'name', 'phone_number', 'email'],
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
          name: '',
          email: '',
          phone_number: '',
          document_number: ''
        }
      },
      visible: false,
      openAddProvider: false,
      openEditProvider: null,
      conditionIvaReceptors: [],
      columns: [
        {
          name: 'document_number',
          align: 'left',
          label: 'Número de documento',
          field: 'document_number',
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
          name: 'phone_number',
          align: 'left',
          label: 'Número de teléfono',
          field: 'phone_number',
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
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  computed: {
    ...mapState(authentication, ['userSession'])
  },
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddProvider = false
      this.openEditProvider = false
      this.provider = {}
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
      this.getProviders(this.params)
    },
    /**
     * Get all providers
     */
    getProviders (params = this.params) {
      this.visible = true
      this.$api.get('providers', { params })
        .then(({ data }) => {
          this.providers = data.data
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
      this.getProviders(this.params)
    },
    /**
     * Save providers
     */
    saveProvider () {
      this.visible = true
      this.$api.post('providers', this.provider)
        .then(({ data }) => {
          this.getProviders()
          this.openAddProvider = false
          this.visible = false
          this.provider = {}
          Notify.create({
            message: 'Proveedor creado exitosamente',
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
     * View provider
     */
    editProvider (event, row, index) {
      this.openEditProvider = true
      this.provider = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`providers/${this.provider.id}`, this.provider)
        .then(({ data }) => {
          this.getProviders()
          this.openEditProvider = false
          this.visible = false
          this.provider = {}
          Notify.create({
            message: 'Proveedor editado exitosamente',
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
     * Delete provider
     */
    deleteProvider () {
      this.visible = true
      this.$api.delete(`providers/${this.provider.id}`)
        .then(({ data }) => {
          this.getProviders()
          this.openEditProvider = false
          this.visible = false
          this.provider = {}
          Notify.create({
            message: 'Proveedor eliminada exitosamente',
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
  padding: 0.5rem !important;
}

.transition-all {
  transition: all 0.3s ease;
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
