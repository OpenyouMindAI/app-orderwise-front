<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <!-- Warning Banner when near limit -->
        <q-banner
          v-if="branchOffices.length >= maxBranches - 1 && branchOffices.length < maxBranches"
          class="bg-warning text-white q-mb-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          <div class="text-body2">
            Estás cerca del límite de sucursales ({{ branchOffices.length }}/{{ maxBranches }}).
            <a @click="$router.push('/subscription-plans')" class="text-white text-weight-bold cursor-pointer" style="text-decoration: underline;">
              Actualiza tu plan
            </a>
            para agregar más sucursales.
          </div>
        </q-banner>

        <!-- Limit Reached Banner -->
        <q-banner
          v-if="branchOffices.length >= maxBranches"
          class="bg-negative text-white q-mb-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="block" color="white" />
          </template>
          <div class="text-body2">
            Has alcanzado el límite de {{ maxBranches }} sucursal(es) de tu plan.
            <a @click="$router.push('/subscription-plans')" class="text-white text-weight-bold cursor-pointer" style="text-decoration: underline;">
              Actualiza tu plan
            </a>
            para agregar más sucursales.
          </div>
        </q-banner>

        <div class="row items-center justify-between q-mb-md">
          <!-- Subscription Info Card -->
          <div class="col-auto">
            <q-card
              flat
              bordered
              class="subscription-info-card"
              :class="{
                'border-warning': branchOffices.length >= maxBranches - 1 && branchOffices.length < maxBranches,
                'border-negative': branchOffices.length >= maxBranches
              }"
            >
              <q-card-section horizontal class="items-center q-pa-sm">
                <q-icon
                  name="store"
                  size="32px"
                  :color="branchOffices.length >= maxBranches ? 'negative' : 'primary'"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-caption text-grey-7">Sucursales</div>
                  <div class="text-h6 text-weight-bold">
                    {{ branchOffices.length }} / {{ maxBranches }}
                  </div>
                  <div v-if="currentSubscription" class="text-caption text-grey-6">
                    Plan: {{ currentSubscription.plan?.name || 'Free' }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Add Button -->
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="add_circle"
              label="Agregar Sucursal"
              @click="checkAndOpenAddDialog"
              :disable="branchOffices.length >= maxBranches"
            >
              <q-tooltip v-if="branchOffices.length >= maxBranches">
                Has alcanzado el límite de sucursales de tu plan ({{ maxBranches }}). Actualiza tu plan para agregar más.
              </q-tooltip>
            </q-btn>
          </div>
        </div>
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
      currentSubscription: null,
      maxBranches: 1,
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
    this.loadSubscription()
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
     * Load current subscription to get branch limit
     */
    async loadSubscription () {
      try {
        const { data } = await this.$api.get('subscriptions/current')
        this.currentSubscription = data.subscription
        this.maxBranches = data.subscription?.branch_offices_count || 1
      } catch (error) {
        console.error('Error loading subscription:', error)
        this.maxBranches = 1
      }
    },
    /**
     * Check if can add more branches before opening dialog
     */
    checkAndOpenAddDialog () {
      if (this.branchOffices.length >= this.maxBranches) {
        Notify.create({
          message: `Has alcanzado el límite de ${this.maxBranches} sucursal(es) de tu plan. Actualiza tu plan para agregar más sucursales.`,
          icon: 'warning',
          color: 'warning',
          position: 'top',
          timeout: 4000,
          actions: [
            {
              label: 'Ver Planes',
              color: 'white',
              handler: () => {
                this.$router.push('/subscription-plans')
              }
            }
          ]
        })
        return
      }
      this.openAddBranchOffice = true
    },
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
          
          // Manejar errores de validación de Laravel
          if (err.response?.status === 422) {
            const errors = err.response?.data?.errors || {}
            
            // Si hay error de límite de sucursales
            if (errors.branch_limit) {
              Notify.create({
                message: errors.branch_limit[0],
                icon: 'warning',
                color: 'warning',
                position: 'top',
                timeout: 5000,
                actions: [
                  {
                    label: 'Ver Planes',
                    color: 'white',
                    handler: () => {
                      this.$router.push('/subscription-plans')
                    }
                  },
                  {
                    label: 'Cerrar',
                    color: 'white'
                  }
                ]
              })
              return
            }
            
            // Otros errores de validación
            const firstError = Object.values(errors)[0]
            const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
            Notify.create({
              message: errorMessage || 'Error de validación',
              icon: 'warning',
              color: 'negative'
            })
          } else {
            // Otros errores
            const errorMessage = err.response?.data?.message || err.message || 'Error al crear sucursal'
            Notify.create({
              message: errorMessage,
              icon: 'warning',
              color: 'negative'
            })
          }
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

<style scoped>
.subscription-info-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.subscription-info-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.border-warning {
  border: 2px solid #f2c037 !important;
}

.border-negative {
  border: 2px solid #c10015 !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
