<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddDeliveryPerson = true" icon="add_circle"/>
      </div>
      <div class="col-12">
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
    <q-dialog v-model="openEditDeliveryPerson" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-py-sm text-white bg-primary">
            <div class="text-h6">Modificar Repartidor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.document_number"
                autofocus
                label="Número de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-1">
              <q-input
                filled
                v-model="deliveryPerson.phone_number"
                label="Número de teléfono"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12  q-mt-md">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.username"
                type="text"
                label="Usuario"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="deliveryPerson.password"
                type="password"
                label="Contraseña"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="delete" color="negative" label="Eliminar" @click="deleteDeliveryPerson" :loading="visible" />
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddDeliveryPerson" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveDeliveryPerson">
          <q-card-section class="row items-center q-py-sm text-white bg-primary">
            <div class="text-h6">Agregar Repartidor</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.document_number"
                autofocus
                label="Número de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.name"
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="deliveryPerson.phone_number"
                label="Número de teléfono"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 q-mt-sm">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="deliveryPerson.username"
                type="text"
                label="Usuario"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="deliveryPerson.password"
                type="password"
                label="Contraseña"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible"/>
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
      deliveryPersons: [],
      deliveryPerson: {},
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
      this.deliveryPerson = row
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
