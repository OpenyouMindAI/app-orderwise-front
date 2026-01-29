<template>
  <q-page padding>
    <div class="q-gutter-y-sm">
      <div class="row justify-between items-center q-gutter-x-sm">
        <span class="text-h6">
          Repartidores
        </span>
        <div class="text-right q-gutter-x-sm">
          <q-btn
            round
            color="primary"
            @click="openAddDeliveryPerson = true"
            icon="add_circle"
          />
        </div>
      </div>
      <q-table
        title="Repartidores"
        row-key="id"
        :columns="columns"
        :rows="deliveryPersons"
        :loading="visible"
        :filter="filter"
        binary-state-sort
        v-model:pagination="paginationConfig"
        @row-click="editDeliveryPerson"
        @request="setPagination"
        no-data-label="Registro no encontrado"
        :grid="$q.screen.lt.md"
        :visible-columns="visibleColumns"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top>
          <div class="flex justify-end items-center full-width">
            <q-input filled dense debounce="500" v-model="filter" placeholder="Buscar" style="min-width: 250px;">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card class="cursor-pointer q-hoverable no-shadow transition-all" style="border-radius: 16px; border: 1px solid #eef0f3" @click="editDeliveryPerson(null, props.row)">
              <span class="q-focus-helper"></span>

              <q-card-section class="row justify-between items-start compact-card-header">
                <div class="column">
                   <div class="text-indigo-10 text-weight-bold text-body1" style="font-size: 1.1rem; letter-spacing: -0.5px">{{ props.row.name }}</div>
                   <div class="text-caption text-grey-6 text-weight-medium">ID: {{ props.row.id }}</div>
                </div>
                <div class="column items-end">
                   <q-badge
                     color="blue-1"
                     text-color="primary"
                     class="q-py-xs q-px-sm text-weight-bold"
                     rounded
                     style="font-size: 11px; border: 1px solid #e3f2fd"
                   >
                     {{ props.row.document_number || '-' }}
                   </q-badge>
                </div>
              </q-card-section>

              <q-separator color="grey-2" inset />

              <q-card-section class="compact-card-body">
                <div class="row q-col-gutter-y-sm">
                  <div class="col-8">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Correo</div>
                     <div class="text-body2 text-grey-8 ellipsis">{{ props.row.email || '-' }}</div>
                  </div>
                  <div class="col-4 text-right">
                     <div class="text-caption text-grey-5 text-uppercase text-weight-bold" style="font-size: 0.7rem; letter-spacing: 0.5px">Teléfono</div>
                     <div class="text-body2 text-grey-8 text-weight-bold">{{ props.row.phone_number || '-' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>

    <q-dialog v-model="openEditDeliveryPerson" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? '' : 'width: 800px; max-width: 90vw;'}`">
        <q-card-section class="row items-center q-py-sm text-white bg-primary col-auto">
          <div class="text-h6">Modificar Repartidor</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form
          @submit="saveEdit"
          :class="$q.screen.lt.sm ? 'col column' : ''"
        >
          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.document_number"
                  autofocus
                  label="Número de documento"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.name"
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.email"
                  type="email"
                  label="Correo"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  filled
                  v-model="deliveryPerson.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.username"
                  type="text"
                  label="Usuario"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  filled
                  v-model="deliveryPerson.password"
                  type="password"
                  label="Contraseña"
                  dense
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="col-auto q-pa-md">
            <q-btn outline color="primary" label="Cancelar" @click="closeModal" />
            <q-btn color="negative" label="Eliminar" @click="deleteDeliveryPerson" :loading="visible" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openAddDeliveryPerson" persistent :maximized="$q.screen.lt.sm">
      <q-card :class="$q.screen.lt.sm ? 'full-height column': ''"
        :style="`${$q.screen.lt.sm ? '' : 'width: 800px; max-width: 90vw;'}`">
        <q-card-section class="row items-center q-py-sm text-white bg-primary col-auto">
          <div class="text-h6">Agregar Repartidor</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form
          @submit="saveDeliveryPerson"
          :class="$q.screen.lt.sm ? 'col column' : ''"
        >
          <q-card-section class="scroll col q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.document_number"
                  autofocus
                  label="Número de documento"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.name"
                  label="Nombre"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.email"
                  type="email"
                  label="Correo"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  filled
                  v-model="deliveryPerson.phone_number"
                  label="Número de teléfono"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  :rules="[val => !!val || 'El campo es requerido.']"
                  filled
                  v-model="deliveryPerson.username"
                  type="text"
                  label="Usuario"
                  dense
                  hide-bottom-space
                />
              </div>
              <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-12">
                <q-input
                  filled
                  v-model="deliveryPerson.password"
                  type="password"
                  label="Contraseña"
                  dense
                  hide-bottom-space
                />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="col-auto q-pa-md">
            <q-btn outline color="primary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
export default {
  data () {
    return {
      deliveryPersons: [],
      deliveryPerson: {},
      filter: '',
      visibleColumns: ['id', 'document_number', 'name', 'phone_number', 'email'],
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
          username: '',
          phone_number: '',
          document_number: ''
        }
      },
      visible: false,
      openAddDeliveryPerson: false,
      openEditDeliveryPerson: null,
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
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
  methods: {
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddDeliveryPerson = false
      this.openEditDeliveryPerson = false
      this.deliveryPerson = {}
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
      this.getDeliveryPersons(this.params)
    },
    /**
     * Get all deliveryPersons
     */
    getDeliveryPersons (params = this.params) {
      this.visible = true
      this.$api.get('delivery-persons', { params })
        .then(({ data }) => {
          this.deliveryPersons = data.data
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
      this.getDeliveryPersons(this.params)
    },
    /**
     * Save deliveryPersons
     */
    saveDeliveryPerson () {
      this.visible = true
      this.$api.post('delivery-persons', this.deliveryPerson)
        .then(({ data }) => {
          this.getDeliveryPersons()
          this.openAddDeliveryPerson = false
          this.visible = false
          this.deliveryPerson = {}
          this.role = null
          Notify.create({
            message: 'Repartidor creado exitosamente',
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
     * View deliveryPerson
     */
    editDeliveryPerson (event, row, index) {
      this.openEditDeliveryPerson = true
      this.deliveryPerson = { ...row }
      this.role = row.role
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`delivery-persons/${this.deliveryPerson.id}`, this.deliveryPerson)
        .then(({ data }) => {
          this.getDeliveryPersons()
          this.openEditDeliveryPerson = false
          this.visible = false
          this.deliveryPerson = {}
          this.role = null
          Notify.create({
            message: 'Repartidor editado exitosamente',
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
     * Delete deliveryPerson
     */
    deleteDeliveryPerson () {
      this.visible = true
      this.$api.delete(`delivery-persons/${this.deliveryPerson.id}`)
        .then(({ data }) => {
          this.getDeliveryPersons()
          this.openEditDeliveryPerson = false
          this.visible = false
          this.deliveryPerson = {}
          Notify.create({
            message: 'Repartidor eliminada exitosamente',
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
  padding: 0.8rem 1rem !important;
}

.compact-card-body {
  padding: 0.8rem 1rem !important;
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
    max-width: 150px;
  }

  :deep(.q-table__top .q-input) {
    flex: 1;
  }
}
</style>
