<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddPaymentMethod = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Método de pagos"
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
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar método de pago</div>
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
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                label="Acrónimo"
                :rules="[val => !!val || 'El campo es requerido.']"
                v-model="paymentMethod.acronym"
                hint="Código corto del método de pago (ej: EFE, TAR, TRA)"
                maxlength="10"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                autofocus
                label="Porcentaje de descuento"
                type="number"
                v-model.number="paymentMethod.percentage"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="paymentMethod.bill"
                label="¿Facturar?"
              />
            </div>

            <div class="row col-12 q-gutter-y-sm">
              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-h6">
                Datos de pago
              </div>
              <div
                v-for="(attribute, index) in paymentMethod.attributes"
                :key="attribute.id"
                class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12"
              >
                <q-input
                  v-model="attribute.attribute_name"
                  filled
                  dense
                  autofocus
                  :label="`Nombre ${index + 1}`"
                  @keypress.stop.enter="addAttribute"
                >
                  <template #append>
                    <q-btn
                      v-if="index >=this.paymentMethod.attributes.length - 1"
                      color="primary"
                      icon="add"
                      round
                      size="sm"
                      @click="addAttribute"
                    />
                    <q-btn
                      v-if="index > 0"
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      :loading="deleteLoading[attribute.attribute_name]"
                      @click="deleteAttribute(index, attribute)"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deletePaymentMethod" :loading="visible" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddPaymentMethod" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="savePaymentMethod">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar método de pago</div>
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
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                label="Acrónimo"
                :rules="[val => !!val || 'El campo es requerido.']"
                v-model="paymentMethod.acronym"
                hint="Código corto del método de pago (ej: EFE, TAR, TRA)"
                maxlength="10"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                autofocus
                label="Porcentaje de descuento"
                type="number"
                v-model.number="paymentMethod.percentage"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="paymentMethod.bill"
                label="¿Facturar?"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-h6">
              Datos de validación de pago
            </div>
            <div
              v-for="(attribute, index) in paymentMethod.attributes"
              :key="attribute.id"
              class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12"
            >
              <q-input
                v-model="attribute.attribute_name"
                filled
                dense
                autofocus
                :label="`Nombre ${index + 1}`"
                @keypress.stop.enter="addAttribute"
              >
                <template #append>
                  <q-btn
                    v-if="index >= this.paymentMethod.attributes.length - 1"
                    color="primary"
                    icon="add"
                    round
                    size="sm"
                    @click="addAttribute"
                  />
                  <q-btn
                    v-if="index > 0"
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    :loading="deleteLoading[attribute.attribute_name]"
                    @click="deleteAttribute(index, attribute)"
                  />
                </template>
              </q-input>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
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
      paymentMethod: {
        attributes: [{}],
        bill: false
      },
      deleteLoading: {},
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
      columns: [
        {
          name: 'id',
          align: 'left',
          label: 'Código',
          field: 'id',
          sortable: true
        },
        {
          name: 'acronym',
          align: 'left',
          label: 'Acrónimo',
          field: 'acronym',
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
          name: 'percentage',
          align: 'left',
          label: 'Porcentaje',
          field: 'percentage',
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
     * Add attribute
     */
    addAttribute () {
      this.paymentMethod?.attributes?.push({})
    },
    /**
     * Delete attribute on update
     * @type {Number} index of attributes
     * @type {Object} attributes payment attributes
     */
    deleteAttributeOnUpdate (index, attribute) {
      this.deleteLoading[attribute.attribute_name] = true
      this.paymentMethod.attributes.splice(index, 1)
    },
    /**
     * Delete attribute
     * @param {Number} index index of array
     */
    deleteAttribute (index) {
      const attribute = this.paymentMethod.attributes[index]
      if (attribute.id) {
        this.deleteAttributeOnUpdate(index, attribute)
      } else {
        this.paymentMethod.attributes.splice(index, 1)
      }
    },
    /**
     * Close all modals
     */
    closeModal () {
      this.openAddPaymentMethod = false
      this.openEditPaymentMethod = false
      this.paymentMethod = {
        attributes: [{}],
        bill: false
      }
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
      const payload = {
        ...this.paymentMethod,
        is_billing: this.paymentMethod.bill
      }
      console.log('Data send:', payload)
      this.$api.post('payment-methods', payload)
        .then(({ data }) => {
          console.log('Server response on create:', data)
          this.getPaymentMethods()
          this.openAddPaymentMethod = false
          this.visible = false
          this.paymentMethod = {
            attributes: [{}],
            bill: false
          }
          Notify.create({
            message: 'Método de pago creado exitosamente',
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
      this.paymentMethod.attributes = row?.attributes?.length > 0 ? row?.attributes : [{}]
      this.paymentMethod.bill = !!row.bill
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      const payload = {
        name: this.paymentMethod.name,
        acronym: this.paymentMethod.acronym,
        attributes: this.paymentMethod.attributes,
        percentage: this.paymentMethod.percentage,
        bill: this.paymentMethod.bill,
        is_billing: this.paymentMethod.bill
      }
      console.log('Data send:', payload)
      this.$api.put(`payment-methods/${this.paymentMethod.id}`, payload)
        .then(({ data }) => {
          console.log('Server response on edit:', data)
          this.getPaymentMethods()
          this.openEditPaymentMethod = false
          this.visible = false
          this.paymentMethod = {
            attributes: [{}],
            bill: false
          }
          Notify.create({
            message: 'Método de pago editado exitosamente',
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
          this.paymentMethod = {
            attributes: [{}]
          }
          Notify.create({
            message: 'Método de pago eliminado exitosamente',
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
