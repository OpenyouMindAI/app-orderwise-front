<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <!-- Subscription Info Card -->
          <div class="col-auto">
            <q-card
              flat
              class="subscription-info-card-modern"
              :class="{
                'card-warning': branchOffices.length >= maxBranches - 1 && branchOffices.length < maxBranches,
                'card-danger': branchOffices.length >= maxBranches,
                'card-success': branchOffices.length < maxBranches - 1
              }"
            >
              <q-card-section class="row items-center q-pa-md no-wrap">
                <div class="icon-container q-mr-md">
                  <q-icon
                    name="store"
                    size="28px"
                    color="white"
                  />
                </div>
                <div class="info-content">
                  <div class="text-overline text-weight-medium opacity-80">Sucursales</div>
                  <div class="text-h5 text-weight-bold q-mb-xs">
                    {{ branchOffices.length }} <span class="text-body1 opacity-60">/ {{ maxBranches }}</span>
                  </div>
                  <div v-if="currentSubscription" class="text-caption text-weight-medium opacity-80">
                    Plan: {{ currentSubscription.plan?.name || 'Free' }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Add Button -->
          <div class="col-auto">
            <q-btn
              unelevated
              rounded
              color="primary"
              icon="add_circle"
              label="Agregar Sucursal"
              size="md"
              class="add-branch-btn-modern"
              @click="checkAndOpenAddDialog"
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
            <!-- Campos Fiscales -->
            <div class="col-12">
              <div class="text-subtitle2 text-weight-medium text-grey-8 q-mb-sm">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Datos Fiscales (Opcional)
              </div>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.business_name"
                filled
                label="Razón Social"
                hint="Razón Social específica de la sucursal"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.document_number"
                filled
                label="CUIT/CUIL"
                mask="##-########-#"
                hint="CUIT/CUIL específico de la sucursal (formato: 00-00000000-0)"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model.number="branchOffice.point_of_sale"
                type="number"
                filled
                label="Punto de Venta (AFIP)"
                hint="Punto de Venta fijo para esta sucursal"
                min="1"
                max="9999"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.income_brut"
                filled
                label="Ingresos Brutos"
                hint="Número de Ingresos Brutos (IIBB) de la sucursal"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.activity_start_date"
                type="date"
                filled
                label="Inicio de Actividades"
                hint="Fecha de inicio de actividades fiscales"
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
    <q-dialog v-model="openUpgradeBranchesDialog" persistent>
      <q-card class="upgrade-dialog-card">
        <q-card-section class="row items-center no-wrap upgrade-dialog-header">
          <div class="upgrade-header-icon q-mr-md">
            <q-icon name="store" size="24px" />
          </div>
          <div class="col">
            <div class="text-subtitle1 text-weight-bold">Límite de sucursales alcanzado</div>
            <div class="text-caption text-grey-2">
              Aumenta tu límite para poder crear más sucursales.
            </div>
          </div>
          <q-btn icon="close" flat round dense @click="openUpgradeBranchesDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="upgrade-dialog-body">
          <div class="text-body1 q-mb-sm">
            Actualmente estás usando
            <span class="text-weight-bold">{{ branchOffices.length }}</span>
            de
            <span class="text-weight-bold">{{ maxBranches }}</span>
            sucursal(es) permitidas por tu plan.
          </div>

          <div v-if="currentSubscription" class="upgrade-plan-chip q-mb-md">
            <q-icon name="workspace_premium" size="16px" class="q-mr-xs" />
            <span class="text-caption">Plan actual:</span>
            <span class="text-caption text-weight-bold q-ml-xs">{{ currentSubscription.plan?.name || 'Free' }}</span>
          </div>

          <div class="text-body2 text-grey-7 q-mb-md">
            Elige el <span class="text-weight-bold">nuevo número total de sucursales</span> que deseas tener.
            Te redirigiremos a Mercado Pago para completar el pago y actualizar tu límite.
          </div>

          <div class="q-mt-sm">
            <q-input
              v-model.number="upgradeBranchCount"
              type="number"
              filled
              dense
              :min="Math.max(maxBranches + 1, 1)"
              :hint="`Mínimo: ${maxBranches + 1} sucursales`"
              label="Nuevo total de sucursales"
              class="upgrade-branches-input"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="upgrade-dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" @click="openUpgradeBranchesDialog = false" />
          <q-btn
            unelevated
            color="primary"
            icon="payment"
            :label="upgradeLoading ? 'Redirigiendo...' : 'Continuar al pago'"
            :loading="upgradeLoading"
            :disable="!canStartBranchUpgrade"
            @click="startBranchUpgradePayment"
          />
        </q-card-actions>
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
            <!-- Campos Fiscales -->
            <div class="col-12">
              <div class="text-subtitle2 text-weight-medium text-grey-8 q-mb-sm">
                <q-icon name="receipt_long" class="q-mr-sm" />
                Datos Fiscales (Opcional)
              </div>
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.business_name"
                filled
                label="Razón Social"
                hint="Razón Social específica de la sucursal"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.document_number"
                filled
                label="CUIT/CUIL"
                mask="##-########-#"
                hint="CUIT/CUIL específico de la sucursal (formato: 00-00000000-0)"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model.number="branchOffice.point_of_sale"
                type="number"
                filled
                label="Punto de Venta (AFIP)"
                hint="Punto de Venta fijo para esta sucursal"
                min="1"
                max="9999"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.income_brut"
                filled
                label="Ingresos Brutos"
                hint="Número de Ingresos Brutos (IIBB) de la sucursal"
              />
            </div>
            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model="branchOffice.activity_start_date"
                type="date"
                filled
                label="Inicio de Actividades"
                hint="Fecha de inicio de actividades fiscales"
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
      openUpgradeBranchesDialog: false,
      upgradeBranchCount: 1,
      upgradeLoading: false,
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
  computed: {
    canStartBranchUpgrade () {
      const target = Number(this.upgradeBranchCount || 0)
      return !this.upgradeLoading && target && target > this.maxBranches
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

        // Inicializar el valor por defecto del upgrade con el límite actual + 1
        if (this.maxBranches > 0) {
          this.upgradeBranchCount = this.maxBranches + 1
        }
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
        this.openUpgradeBranchesDialog = true
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
    async startBranchUpgradePayment () {
      if (!this.currentSubscription || !this.currentSubscription.plan) {
        Notify.create({
          message: 'No se encontró información de tu plan actual',
          icon: 'warning',
          color: 'negative'
        })
        return
      }

      const targetBranches = Number(this.upgradeBranchCount || 0)
      if (!targetBranches || targetBranches <= this.maxBranches) {
        Notify.create({
          message: `Debes elegir al menos ${this.maxBranches + 1} sucursales`,
          icon: 'warning',
          color: 'warning'
        })
        return
      }

      this.upgradeLoading = true

      try {
        const response = await this.$api.post('mercadopago/create-payment', {
          subscription_plan_id: this.currentSubscription.plan.id,
          branch_offices_count: targetBranches,
          months: 1
        })

        if (!response.data?.init_point) {
          throw new Error('No se recibió URL de pago de Mercado Pago')
        }

        const paymentUrl = response.data.init_point

        // Guardar datos mínimos para referencia (opcional)
        if (response.data.preference_id) {
          localStorage.setItem('mp_preference_id', response.data.preference_id)
        }
        localStorage.setItem('mp_plan_id', this.currentSubscription.plan.id)
        localStorage.setItem('mp_plan_name', this.currentSubscription.plan.name || 'Plan actual')

        Notify.create({
          message: 'Redirigiendo a Mercado Pago...',
          icon: 'payment',
          color: 'info'
        })

        this.openUpgradeBranchesDialog = false

        // Pequeña pausa para que el usuario vea la notificación
        setTimeout(() => {
          window.location.href = paymentUrl
        }, 500)
      } catch (error) {
        let errorMessage = 'Error al crear el link de pago'

        if (error.response) {
          const { status, data } = error.response

          if (status === 400) {
            errorMessage = data.message || 'Datos de pago inválidos'
          } else if (status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente'
          } else if (status === 500) {
            errorMessage = 'Error del servidor. Por favor, intenta nuevamente'
          } else if (data?.details) {
            errorMessage = `Error de Mercado Pago: ${JSON.stringify(data.details)}`
          }
        } else if (error.request) {
          errorMessage = 'Error de conexión. Verifica tu internet'
        } else if (error.message) {
          errorMessage = error.message
        }

        Notify.create({
          message: errorMessage,
          icon: 'warning',
          color: 'negative'
        })
      } finally {
        this.upgradeLoading = false
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
/* Modern Subscription Info Card */
.subscription-info-card-modern {
  border-radius: 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  min-width: 240px;
}

.subscription-info-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.subscription-info-card-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* Card States */
.subscription-info-card-modern.card-success {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.subscription-info-card-modern.card-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.subscription-info-card-modern.card-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Icon Container */
.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.subscription-info-card-modern:hover .icon-container {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Info Content */
.info-content {
  position: relative;
  z-index: 1;
}

.opacity-80 {
  opacity: 0.9;
}

.opacity-60 {
  opacity: 0.7;
}

/* Add Button Modern */
.add-branch-btn-modern {
  padding: 12px 28px;
  font-weight: 600;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-branch-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.add-branch-btn-modern:active {
  transform: translateY(0);
}

.add-branch-btn-modern:disabled {
  opacity: 0.5;
  transform: none !important;
  box-shadow: none !important;
}

/* Upgrade branches dialog */
.upgrade-dialog-card {
  width: 520px;
  max-width: 90vw;
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.upgrade-dialog-header {
  padding: 14px 18px;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary-dark, var(--q-primary)) 100%);
  color: #ffffff;
}

.upgrade-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upgrade-dialog-body {
  padding: 18px 20px 10px;
}

.upgrade-plan-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(76, 175, 80, 0.08);
  color: #2e7d32;
}

.upgrade-branches-input :deep(.q-field__control) {
  border-radius: 10px;
}

.upgrade-dialog-actions {
  padding: 10px 16px 14px;
}

/* Old styles for compatibility */
.cursor-pointer {
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .subscription-info-card-modern {
    min-width: 200px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
  }

  .icon-container .q-icon {
    font-size: 24px !important;
  }
}
</style>
