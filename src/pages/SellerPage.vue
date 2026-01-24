<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center full-width q-mb-md">
        <div class="text-h6">
          Vendedores
        </div>
        <div class="text-right">
          <q-btn color="primary" @click="openAddSeller = true" icon="add_circle" round />
        </div>
      </div>
      <q-table
          title="Vendedores"
          row-key="name"
          :columns="columns"
          :rows="sellers"
          :loading="visible"
          :filter="filter"
          :visible-columns="visibleColumns"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editSeller"
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
              <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar" :class="$q.screen.xs ? 'full-width' : ''">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>

          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editSeller(null, props.row)">
                <span class="q-focus-helper"></span>

                <q-card-section class="row justify-between items-start compact-card-header">
                  <div class="column">
                     <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                     <div class="text-caption text-grey-6 text-weight-medium">{{ props.row.username }}</div>
                  </div>
                  <div class="column items-end">
                     <q-badge
                       v-if="props.row.document_number"
                       color="primary"
                       :label="props.row.document_number"
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
                       <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Correo electrónico</div>
                       <div class="text-body2 text-grey-9 text-weight-bold ellipsis">{{ props.row.email || '-' }}</div>
                    </div>
                    <div class="col-12">
                       <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Teléfono</div>
                       <div class="text-body2 text-grey-8">{{ props.row.phone_number || '-' }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
    </div>
    <q-dialog v-model="openEditSeller" persistent :maximized="$q.screen.lt.md">
      <q-card
        :class="$q.screen.lt.md ? 'column full-height' : ''"
        :style="$q.screen.lt.md ? 'width: 100%; max-width: 100%' : 'width: 700px; max-width: 90vw;'"
      >
        <q-form
          @submit="saveEdit"
          :class="$q.screen.lt.md ? 'col column' : ''"
        >
          <q-card-section class="row items-center bg-primary text-white q-py-sm col-auto">
            <div class="text-h6">Modificar vendedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section
            :class="$q.screen.lt.md ? 'col scroll' : 'scroll'"
            :style="$q.screen.lt.md ? '' : 'max-height: calc(100vh - 200px);'"
          >
            <div class="q-pt-sm row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.document_number"
                  autofocus
                  label="Número de documento"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.name"
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="seller.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.email"
                  type="email"
                  label="Correo electrónico"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.username"
                  label="Usuario"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="seller.password"
                  type="password"
                  label="Contraseña"
                  dense
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="col-auto q-pa-md">
            <q-btn color="negative" label="Eliminar" @click="deleteSeller" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddSeller" persistent :maximized="$q.screen.lt.md">
      <q-card
        :class="$q.screen.lt.md ? 'column full-height' : ''"
        :style="$q.screen.lt.md ? 'width: 100%; max-width: 100%' : 'width: 700px; max-width: 90vw;'"
      >
        <q-form
          @submit="saveSeller"
          :class="$q.screen.lt.md ? 'col column' : ''"
        >
          <q-card-section class="row items-center bg-primary text-white q-py-sm col-auto">
            <div class="text-h6">Agregar vendedor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <q-card-section
            :class="$q.screen.lt.md ? 'col scroll' : 'scroll'"
            :style="$q.screen.lt.md ? '' : 'max-height: calc(100vh - 200px);'"
          >
            <div class="q-pt-sm row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.document_number"
                  autofocus
                  label="Número de documento"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.name"
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  filled
                  v-model="seller.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.email"
                  type="email"
                  label="Correo electrónico"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.username"
                  label="Usuario"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="seller.password"
                  type="password"
                  label="Contraseña"
                  dense
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="col-auto q-pa-md">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState } from 'pinia'
import { Notify } from 'quasar'
import { authentication } from 'src/stores/module-authentication'
export default {
  data () {
    return {
      sellers: [],
      seller: {},
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
          name: '',
          document_number: '',
          email: '',
          username: ''
        }
      },
      visible: false,
      openAddSeller: false,
      openEditSeller: null,
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
          name: 'username',
          align: 'left',
          label: 'Usuario',
          field: 'username',
          sortable: true
        },
        {
          name: 'email',
          align: 'left',
          label: 'Correo electrónico',
          field: 'email',
          sortable: true
        },
        {
          name: 'phone_number',
          align: 'left',
          label: 'Número de teléfono',
          field: 'phone_number',
          sortable: true
        }
      ],
      visibleColumns: ['document_number', 'name', 'username', 'email', 'phone_number'],
      paginationConfig: {
        rowsPerPage: 20,
        rowsNumber: 20,
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc'
      }
    }
  },
  computed: {
    ...mapState(authentication, ['branchOffice'])
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
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddSeller = false
      this.openEditSeller = false
      this.seller = {}
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
      this.getSellers(this.params)
    },
    /**
     * Get all sellers
     */
    getSellers (params = this.params) {
      this.visible = true
      this.$api.get('sellers', { params })
        .then(({ data }) => {
          this.sellers = data.data
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
      this.getSellers(this.params)
    },
    /**
     * Save sellers
     */
    saveSeller () {
      this.visible = true
      this.$api.post('sellers', {
        ...this.seller,
        branchOffices: [this.branchOffice?.id]
      })
        .then(({ data }) => {
          this.getSellers()
          this.openAddSeller = false
          this.visible = false
          this.seller = {}
          this.role = null
          Notify.create({
            message: 'Vendedor creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(() => {
          this.visible = false
        })
    },
    /**
     * View seller
     */
    editSeller (event, row, index) {
      this.openEditSeller = true
      this.seller = row
      this.role = row.role
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`sellers/${this.seller.id}`, {
        ...this.seller,
        branchOffices: [this.branchOffice?.id]
      })
        .then(({ data }) => {
          this.getSellers()
          this.openEditSeller = false
          this.visible = false
          this.seller = {}
          this.role = null
          Notify.create({
            message: 'Vendedor editado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(() => {
          this.visible = false
        })
    },
    /**
     * Delete seller
     */
    deleteSeller () {
      this.visible = true
      this.$api.delete(`sellers/${this.seller.id}`)
        .then(({ data }) => {
          this.getSellers()
          this.openEditSeller = false
          this.visible = false
          this.seller = {}
          Notify.create({
            message: 'Vendedor eliminada exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(() => {
          this.visible = false
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
