<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddBranchOffice = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Sucursales"
          row-key="name"
          :columns="columns"
          :rows="branchOffices"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editBranchOffice"
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
    <q-dialog v-model="openEditBranchOffice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Modificar sucursal</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="branchOffice.name"
                autofocus
                label="Nombre"
              />
            </div>
            <!-- Sección de Dirección para Editar -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="negative" label="Eliminar" @click="deleteBranchOffice" :loading="visible" />
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddBranchOffice" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveBranchOffice">
          <q-card-section class="row items-center bg-primary text-white">
            <div class="text-h6">Agregar sucursal</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.name"
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                autofocus
                label="Nombre"
              />
            </div>
            <!-- Sección de Dirección para Agregar -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn color="secondary" label="Cancelar" @click="closeModal" />
            <q-btn color="primary" label="Agregar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'

export default {
  components: {
    AddressComponent
  },
  data () {
    return {
      branchOffices: [],
      branchOffice: {},
      filter: '',
      /**
       * Params search
       * @type {Object}
       */
      params: {
        paginate: true,
        sortBy: 'id',
        sortOrder: 'desc',
        perPage: 20,
        dataSearch: {
          id: '',
          name: ''
        }
      },
      visible: false,
      openAddBranchOffice: false,
      openEditBranchOffice: null,
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
          name: 'address',
          align: 'left',
          label: 'Dirección',
          field: row => row.address?.formattedAddress || row.address?.name || (typeof row.address === 'string' ? row.address : 'Sin dirección'),
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

      // Address component variables
      addressComponentKey: 0,
      address: null,
      formattedAddress: ''
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
      this.openAddBranchOffice = false
      this.openEditBranchOffice = false
      this.branchOffice = {}
      // Limpiar las variables de dirección
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1
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
      this.getBranchOffices(this.params)
    },
    /**
     * Get all branchOffices
     */
    getBranchOffices (params = this.params) {
      this.visible = true
      this.$api.get('branch-offices', { params })
        .then(({ data }) => {
          this.branchOffices = data.data
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
      // Processing pagination parameters
      this.params.sortOrder = data.pagination.descending ? 'asc' : 'desc'
      this.params.page = data.pagination.page
      this.params.sortBy = data.pagination.sortBy ?? this.params.sortBy
      this.params.perPage = data.pagination.rowsPerPage
      this.paginationConfig = data.pagination
      this.getBranchOffices(this.params)
    },
    /**
     * Save branchOffices
     */
    saveBranchOffice () {
      this.visible = true
      // Preparar datos incluyendo dirección completa con coordenadas
      const branchOfficeData = {
        ...this.branchOffice,
        address: this.address || this.branchOffice.address || null
      }
      this.$api.post('branch-offices', branchOfficeData)
        .then(({ data }) => {
          this.getBranchOffices()
          this.openAddBranchOffice = false
          this.visible = false
          this.branchOffice = {}
          // Limpiar las variables de dirección
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Sucursal creada exitosamente',
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
     * View branchOffice
     */
    editBranchOffice (event, row, index) {
      this.openEditBranchOffice = true
      this.branchOffice = row
      // Cargar dirección existente
      if (row.address) {
        // Si address es un objeto JSON, usarlo directamente
        if (typeof row.address === 'object') {
          this.address = row.address
          this.formattedAddress = row.address.formattedAddress || row.address.name || ''
        } else {
          // Si es string (datos antiguos), convertir a objeto
          this.formattedAddress = row.address
          this.address = { formattedAddress: row.address }
        }
      }
      this.addressComponentKey += 1
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true
      // Preparar datos incluyendo dirección completa con coordenadas
      const branchOfficeData = {
        ...this.branchOffice,
        address: this.address || this.branchOffice.address || null
      }
      this.$api.put(`branch-offices/${this.branchOffice?.id}`, branchOfficeData)
        .then(({ data }) => {
          this.getBranchOffices()
          this.openEditBranchOffice = false
          this.visible = false
          this.branchOffice = {}
          // Limpiar las variables de dirección
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Sucursal editada exitosamente',
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
     * Delete branchOffice
     */
    deleteBranchOffice () {
      this.visible = true
      this.$api.delete(`branch-offices/${this.branchOffice?.id}`)
        .then(({ data }) => {
          this.getBranchOffices()
          this.openEditBranchOffice = false
          this.visible = false
          this.branchOffice = {}
          Notify.create({
            message: 'Sucursal eliminada exitosamente',
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
     * Handle address selection from AddressComponent
     * @param {Object} selectedAddress - Selected address object
     */
    handleAddressSelected (selectedAddress) {
      // Si la dirección es nula, reiniciar el objeto de dirección
      if (!selectedAddress) {
        this.address = null
        this.formattedAddress = ''
        return
      }

      // Actualizar los campos de dirección para el formulario
      this.address = selectedAddress

      // Formatear la dirección para enviarla en la sucursal
      // El componente AddressComponent devuelve un objeto con la estructura específica
      if (typeof selectedAddress === 'object' && selectedAddress !== null) {
        // Priorizar formattedAddress si existe
        if (selectedAddress.formattedAddress) {
          this.formattedAddress = selectedAddress.formattedAddress
        } else if (selectedAddress.name) {
          // Si no hay formattedAddress, usar el name del lugar
          this.formattedAddress = selectedAddress.name
        } else {
          // Construir dirección desde componentes disponibles
          const addressParts = []
          if (selectedAddress.street) addressParts.push(selectedAddress.street)
          if (selectedAddress.city) addressParts.push(selectedAddress.city)
          if (selectedAddress.state) addressParts.push(selectedAddress.state)
          if (selectedAddress.country) addressParts.push(selectedAddress.country)
          if (selectedAddress.zipCode) addressParts.push(selectedAddress.zipCode)

          this.formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : JSON.stringify(selectedAddress)
        }
      } else if (typeof selectedAddress === 'string') {
        // Si por alguna razón viene como string
        this.formattedAddress = selectedAddress
      } else {
        // Fallback: convertir a string
        this.formattedAddress = String(selectedAddress)
      }

      // Dirección procesada correctamente - no necesita reinicialización del componente
    }
  }
}
</script>
