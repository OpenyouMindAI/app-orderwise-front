<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddPaymentMethod = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Metodo de pagos"
          row-key="name"
          :columns="columns"
          :rows="paymentMethods"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editPaymentMethod"
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
    <q-dialog v-model="openEditPaymentMethod" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Editar metodo de pago</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                autofocus
                label="Nombre"
                :rules="[val => !!val || 'El campo es requerido.']"
                v-model="paymentMethod.name"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
            <q-btn color="negative" label="Eliminar" @click="deletePaymentMethod" :loading="visible" />
            <q-btn color="orange" label="Cancelar" @click="closeModal" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddPaymentMethod" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="savePaymentMethod">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar metodo de pago</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="q-pt-sm row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="paymentMethod.name"
                autofocus
                label="Nombre"
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
      paymentMethods: [],
      paymentMethod: {},
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
      openAddPaymentMethod: false,
      openEditPaymentMethod: null,
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
    this.paymentMethod.user_created_id = this.userSession.id
    this.paymentMethod.user_updated_id = this.userSession.id
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
      this.openAddPaymentMethod = false
      this.openEditPaymentMethod = false
      this.paymentMethod = {}
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
      this.getPaymentMethods(this.params)
    },
    /**
     * Get all payment-methods
     */
    getPaymentMethods (params = this.params) {
      this.visible = true
      this.$api.get('payment-methods', { params })
        .then(({ data }) => {
          this.paymentMethods = data.data
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
      this.getPaymentMethods(this.params)
    },
    /**
     * Save payment-methods
     */
    savePaymentMethod () {
      this.visible = true
      this.$api.post('payment-methods', this.paymentMethod)
        .then(({ data }) => {
          this.getPaymentMethods()
          this.openAddPaymentMethod = false
          this.visible = false
          this.paymentMethod = {}
          Notify.create({
            message: 'Metodo de pago creado exitosamente',
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
     * View paymentMethod
     */
    editPaymentMethod (event, row, index) {
      this.openEditPaymentMethod = true
      this.paymentMethod = row
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      this.$api.put(`payment-methods/${this.paymentMethod.id}`, this.paymentMethod)
        .then(({ data }) => {
          this.getPaymentMethods()
          this.openEditPaymentMethod = false
          this.visible = false
          this.paymentMethod = {}
          Notify.create({
            message: 'Metodo de pago editado exitosamente',
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
     * Delete paymentMethod
     */
    deletePaymentMethod () {
      this.visible = true
      this.$api.delete(`payment-methods/${this.paymentMethod.id}`)
        .then(({ data }) => {
          this.getPaymentMethods()
          this.openEditPaymentMethod = false
          this.visible = false
          this.paymentMethod = {}
          Notify.create({
            message: 'Metodo de pago eliminado exitosamente',
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
