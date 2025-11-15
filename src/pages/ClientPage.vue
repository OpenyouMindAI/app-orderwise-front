<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openNewClientModal" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Clientes"
          row-key="id"
          :columns="columns"
          :rows="clients"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editClient"
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
          <template v-slot:body-cell-address="props">
            <q-td :props="props">
              <div
                class="address-cell"
                :title="props.value || 'Sin dirección'"
              >
                {{ props.value || 'Sin dirección' }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditClient" persistent>
      <q-card style="width: 900px; max-width: 95vw;" class="client-form-card">
        <q-form @submit="saveEdit">
          <!-- Header con estilo naranja -->
          <q-card-section class="client-form-header">
            <div class="text-h6 text-white">Modificar cliente</div>
            <q-btn icon="close" flat round dense @click="closeModal" class="text-white" />
          </q-card-section>

          <!-- Body con tema oscuro -->
          <q-card-section class="client-form-body">
            <!-- Nombre - Campo principal con asterisco rojo -->
            <div class="form-field-wrapper">
              <q-input
                outlined
                v-model="client.name"
                label="Nombre *"
                :rules="[val => !!val || 'El campo es requerido.']"
                class="client-form-input client-form-name-input"
                autofocus
              />
            </div>

            <!-- Información adicional -->
            <div class="text-grey-5 q-mb-md">Información adicional (opcional)</div>

            <!-- Fila 1: Tipo de documento y Número -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-select
                  outlined
                  use-input
                  label="Tipo de documento"
                  input-debounce="0"
                  option-label="Desc"
                  option-value="id"
                  v-model="client.document_type"
                  :options="documentTypes"
                  @filter="getDocumentTypes"
                  class="client-form-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.document_number"
                  label="Número de documento"
                  class="client-form-input"
                />
              </div>
            </div>

            <!-- Fila 2: Correo y Teléfono -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.email"
                  type="email"
                  label="Correo"
                  class="client-form-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.phone_number"
                  label="Teléfono"
                  class="client-form-input"
                />
              </div>
            </div>

            <!-- Condición de IVA -->
            <div class="form-field-wrapper">
              <q-select
                outlined
                use-input
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
                class="client-form-input"
              />
            </div>

            <!-- Checkbox cuenta corriente -->
            <div class="form-field-wrapper">
              <q-checkbox
                v-model="client.is_credit"
                label="¿Maneja cuenta corriente?"
                class="client-form-checkbox"
              />
            </div>

            <!-- Sección de Dirección - MANTENER IGUAL -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="client.is_credit"
                label="¿Maneja cuenta corriente?"
              />
            </div>
          </q-card-section>

          <!-- Botones de acción -->
          <div class="client-form-actions">
            <q-btn
              icon="delete"
              color="negative"
              label="ELIMINAR"
              @click="deleteClient"
              :loading="visible"
              size="lg"
              class="client-form-delete-btn q-mr-md"
            />
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              type="submit"
              :loading="visible"
              size="lg"
              class="client-form-save-btn"
            />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 900px; max-width: 95vw;" class="client-form-card">
        <q-form @submit="saveClient">
          <!-- Header con estilo naranja -->
          <q-card-section class="client-form-header">
            <div class="text-h6 text-white">Agregar cliente</div>
            <q-btn icon="close" flat round dense @click="closeModal" class="text-white" />
          </q-card-section>

          <!-- Body con tema oscuro -->
          <q-card-section class="client-form-body">
            <!-- Nombre - Campo principal con asterisco rojo -->
            <div class="form-field-wrapper">
              <q-input
                outlined
                v-model="client.name"
                label="Nombre *"
                :rules="[val => !!val || 'El campo es requerido.']"
                class="client-form-input client-form-name-input"
                autofocus
              />
            </div>

            <!-- Información adicional -->
            <div class="text-grey-5 q-mb-md">Información adicional (opcional)</div>

            <!-- Fila 1: Tipo de documento y Número -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-select
                  outlined
                  use-input
                  label="Tipo de documento"
                  input-debounce="0"
                  option-label="Desc"
                  option-value="id"
                  v-model="client.document_type"
                  :options="documentTypes"
                  @filter="getDocumentTypes"
                  class="client-form-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.document_number"
                  label="Número de documento"
                  class="client-form-input"
                />
              </div>
            </div>

            <!-- Fila 2: Correo y Teléfono -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.email"
                  type="email"
                  label="Correo"
                  class="client-form-input"
                />
              </div>
              <div class="col-6">
                <q-input
                  outlined
                  v-model="client.phone_number"
                  label="Teléfono"
                  class="client-form-input"
                />
              </div>
            </div>

            <!-- Condición de IVA -->
            <div class="form-field-wrapper">
              <q-select
                outlined
                use-input
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
                class="client-form-input"
              />
            </div>

            <!-- Checkbox cuenta corriente -->
            <div class="form-field-wrapper">
              <q-checkbox
                v-model="client.is_credit"
                label="¿Maneja cuenta corriente?"
                class="client-form-checkbox"
              />
            </div>

            <!-- Sección de Dirección - MANTENER IGUAL -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-checkbox
                v-model="client.is_credit"
                label="¿Maneja cuenta corriente?"
              />
            </div>
          </q-card-section>

          <!-- Botón guardar mejorado -->
          <div class="client-form-actions-improved">
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              type="submit"
              :loading="visible"
              size="lg"
              class="client-form-save-btn"
            />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Notify } from 'quasar'
import { apiArca } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import { mapState } from 'pinia'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
export default {
  components: {
    AddressComponent
  },
  data () {
    return {
      clients: [],
      documentTypes: [],
      client: {},
      filter: '',
      /**
       * Address component key for resetting
       * @type {Number}
       */
      addressComponentKey: 0,
      /**
       * Address object
       * @type {Object}
       */
      address: null,
      /**
       * Formatted address string
       * @type {String}
       */
      formattedAddress: '',
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
          name: '',
          email: '',
          phone_number: '',
          document_number: ''
        }
      },
      visible: false,
      openAddClient: false,
      openEditClient: null,
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
        },
        {
          name: 'address',
          align: 'left',
          label: 'Dirección',
          field: row => row.address?.formattedAddress || row.address?.name || (typeof row.address === 'string' ? row.address : 'Sin dirección'),
          sortable: true,
          style: 'width: 250px; max-width: 250px;',
          headerStyle: 'width: 250px; max-width: 250px;'
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
      this.openAddClient = false
      this.openEditClient = false

      // Limpiar completamente el cliente
      this.client = {
        name: '',
        document_number: '',
        email: '',
        phone_number: '',
        address: '',
        condition_iva_receptor: null,
        document_type: null,
        is_credit: false
      }
      this.role = null

      // Limpiar las variables de dirección
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1
    },
    /**
     * Open new client modal with clean form
     */
    openNewClientModal () {
      // Limpiar completamente antes de abrir
      this.client = {
        name: '',
        document_number: '',
        email: '',
        phone_number: '',
        address: '',
        condition_iva_receptor: null,
        document_type: null,
        is_credit: false
      }
      this.role = null
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1

      // Abrir modal
      this.openAddClient = true
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
      this.getClients(this.params)
    },
    /**
     * Get all clients
     */
    getClients (params = this.params) {
      this.visible = true
      this.$api.get('clients', { params })
        .then(({ data }) => {
          this.clients = data.data
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getDocumentTypes (value, update) {
      try {
        const { data } = await apiArca.get('metadata/document-types', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.documentTypes = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
    },
    /**
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getConditionIvaReceptor (value, update) {
      try {
        const { data } = await apiArca.get('metadata/condition-iva-receptors', {
          params: {
            user: {
              name: this.userSession.name,
              email: this.userSession.email
            }
          }
        })
        update(() => {
          this.conditionIvaReceptors = data
        })
      } catch (err) {
        notify('A ocurrido un error con la conexión con el ARCA', 'negative', 'warning')
      }
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
      this.getClients(this.params)
    },
    /**
     * Save clients
     */
    saveClient () {
      this.visible = true

      // Validaciones básicas
      if (!this.client.name || this.client.name.trim() === '') {
        Notify.create({
          message: 'El nombre es requerido',
          icon: 'warning',
          color: 'negative'
        })
        this.visible = false
        return
      }

      if (!this.client.email || this.client.email.trim() === '') {
        Notify.create({
          message: 'El email es requerido',
          icon: 'warning',
          color: 'negative'
        })
        this.visible = false
        return
      }

      // Preparar datos del cliente con dirección formateada
      const clientData = { ...this.client }

      // Validar y formatear campos requeridos
      if (clientData.condition_iva_receptor && typeof clientData.condition_iva_receptor === 'object') {
        clientData.condition_iva_receptor = JSON.stringify(clientData.condition_iva_receptor)
      }

      if (clientData.document_type && typeof clientData.document_type === 'object') {
        clientData.document_type = JSON.stringify(clientData.document_type)
      }

      // Guardar dirección como objeto JSON (igual que BranchOfficePage)
      clientData.address = this.address || this.client.address || null

      this.$api.post('clients', clientData)
        .then(({ data }) => {
          console.log('✅ Cliente creado exitosamente:', data)
          this.getClients()
          this.openAddClient = false
          this.visible = false
          this.client = {}
          this.role = null
          // Limpiar las variables de dirección
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Cliente creado exitosamente',
            icon: 'check_circle',
            color: 'positive'
          })
        })
        .catch(err => {
          this.visible = false
          console.error('❌ Error al crear cliente:', err)
          console.error('📊 Response data:', err.response?.data)
          console.error('📈 Status:', err.response?.status)

          let errorMessage = err.message
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message
          }
          Notify.create({
            message: `Error: ${errorMessage}`,
            icon: 'warning',
            color: 'negative',
            timeout: 8000
          })
        })
    },
    /**
     * View client
     */
    editClient (event, row, index) {
      this.openEditClient = true
      this.client = row
      this.role = row.role
      this.client.condition_iva_receptor = JSON.parse(row.condition_iva_receptor)
      this.client.document_type = JSON.parse(row.document_type)

      // Actualizar la dirección cuando se selecciona un cliente
      if (row.address) {
        this.formattedAddress = row.address
        // Crear objeto de dirección para AddressComponent
        this.address = {
          name: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          latitude: row.latitude || null,
          longitude: row.longitude || null,
          formattedAddress: row.address,
          placeId: row.place_id || '',
          types: []
        }
        this.client.address = row.address
      } else {
        this.formattedAddress = ''
        this.address = null
        this.client.address = ''
      }

      // Incrementar la clave para forzar re-renderización del AddressComponent
      this.addressComponentKey += 1
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true

      // Preparar datos del cliente con dirección formateada
      const clientData = { ...this.client }

      // Guardar dirección como objeto JSON (igual que BranchOfficePage)
      clientData.address = this.address || this.client.address || null

      this.$api.put(`clients/${this.client.id}`, clientData)
        .then(({ data }) => {
          this.getClients()
          this.openEditClient = false
          this.visible = false
          this.client = {}
          this.role = null
          // Limpiar las variables de dirección
          this.address = null
          this.formattedAddress = ''
          this.addressComponentKey += 1
          Notify.create({
            message: 'Cliente editado exitosamente',
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
     * Delete client
     */
    deleteClient () {
      this.visible = true
      this.$api.delete(`clients/${this.client.id}`)
        .then(({ data }) => {
          this.getClients()
          this.openEditClient = false
          this.visible = false
          this.client = {}
          Notify.create({
            message: 'Cliente eliminada exitosamente',
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
     * @param {String} selectedAddress - The selected address
     */
    handleAddressSelected (address) {
      // Si la dirección es nula, reiniciar el objeto de dirección
      if (!address) {
        this.address = null
        this.formattedAddress = ''
        return
      }

      // Actualizar los campos de dirección para el formulario
      this.address = address

      // Formatear la dirección para enviarla en el cliente
      // El componente AddressComponent devuelve un objeto con la estructura específica
      if (typeof address === 'object' && address !== null) {
        // Priorizar formattedAddress si existe
        if (address.formattedAddress) {
          this.formattedAddress = address.formattedAddress
        } else if (address.name) {
          // Si no hay formattedAddress, usar el name del lugar
          this.formattedAddress = address.name
        } else {
          // Construir dirección desde componentes disponibles
          const addressParts = []
          if (address.street) addressParts.push(address.street)
          if (address.city) addressParts.push(address.city)
          if (address.state) addressParts.push(address.state)
          if (address.country) addressParts.push(address.country)
          if (address.zipCode) addressParts.push(address.zipCode)

          this.formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : JSON.stringify(address)
        }
      } else if (typeof address === 'string') {
        // Si por alguna razón viene como string
        this.formattedAddress = address
      } else {
        // Fallback: convertir a string
        this.formattedAddress = String(address)
      }

      // Dirección procesada correctamente - no necesita reinicialización del componente
    }
  }
}
</script>

<style scoped>
/* Estilos para el formulario moderno de cliente */
.client-form-card {
  background: white !important;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--q-separator-color);
}

.body--dark .client-form-card {
  background: #1e1e1e !important;
}

.client-form-header {
  background: var(--q-primary) !important;
  padding: 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.client-form-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.client-form-header .text-h6 {
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.client-form-body {
  background: white;
  padding: 32px;
  padding-bottom: 24px;
  position: relative;
  color: #333;
}

.body--dark .client-form-body {
  background: #1e1e1e;
  color: white;
}

.client-form-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary), #00bcd4, var(--q-primary));
}

.form-field-wrapper {
  margin-bottom: 12px;
}

.client-form-input {
  border-radius: 12px;
  margin-bottom: 8px;
}

.client-form-input :deep(.q-field__control) {
  border-radius: 12px !important;
  min-height: 60px;
  border: none !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8f9fa;
  position: relative;
  color: #333;
}

.client-form-input :deep(.q-field__control):before {
  border-radius: 12px !important;
  border: none !important;
}

.client-form-input :deep(.q-field__control):after {
  border-radius: 12px !important;
  border: none !important;
}

/* Estilos globales para TODOS los inputs - incluyendo AddressComponent */
:deep(.q-field__control) {
  border-radius: 12px !important;
}

:deep(.q-input .q-field__control) {
  border-radius: 12px !important;
}

:deep(.q-select .q-field__control) {
  border-radius: 12px !important;
}

.body--dark .client-form-input :deep(.q-field__control) {
  background: #2a2a2a;
  color: white;
}

.client-form-input :deep(.q-field__control):hover {
  border-color: var(--q-primary);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.client-form-input :deep(.q-field__native) {
  color: inherit !important;
  font-weight: 500;
  padding: 12px 20px 8px 20px; /* Más padding arriba para dar espacio al label */
}

/* Labels mejorados con más espacio */
.client-form-input :deep(.q-field__label) {
  font-weight: 600;
  letter-spacing: 0.5px;
  left: 20px;
  top: 8px !important; /* Más espacio arriba para separar del texto */
  transition: all 0.3s ease;
  color: #6b7280 !important;
}

.body--dark .client-form-input :deep(.q-field__label) {
  color: #9ca3af !important;
}

/* Focus effects mejorados */
.client-form-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 4px var(--q-primary-alpha, rgba(25, 118, 210, 0.15));
  transform: scale(1.02);
}

.client-form-input :deep(.q-field--focused .q-field__label) {
  color: var(--q-primary) !important;
  transform: translateY(-32px) scale(0.85); /* Ajustado para el nuevo espaciado */
  font-weight: 700;
}

/* Estilos adicionales para mejor presentación */
.form-field-wrapper {
  margin-bottom: 24px;
  position: relative;
}

.text-grey-5 {
  color: #6b7280 !important;
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.body--dark .text-grey-5 {
  color: #9ca3af !important;
}

.client-form-input :deep(.q-field__control):before {
  border-color: var(--q-separator-color) !important;
}

/* Bordes en tema claro */
.body--light .client-form-input :deep(.q-field__control):before {
  border-color: #e0e0e0 !important;
}

/* Bordes en tema oscuro */
.body--dark .client-form-input :deep(.q-field__control):before {
  border-color: #616161 !important;
}

.client-form-input :deep(.q-field__control):hover:before {
  border-color: var(--q-primary) !important;
}

.client-form-input :deep(.q-field--focused .q-field__control):before,
.client-form-input :deep(.q-field--focused .q-field__control):after {
  border-color: var(--q-primary) !important;
}

/* Campo nombre con asterisco rojo */
.client-form-input :deep(.q-field--error .q-field__label) {
  color: #f44336 !important;
}

.client-form-input :deep(.q-field--error .q-field__control):before {
  border-color: #f44336 !important;
}

/* Select dropdown */
.client-form-input :deep(.q-field__append) {
  color: #b0b0b0;
}

.client-form-actions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
}

.client-form-actions-improved {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 24px 32px;
  background: white;
  margin-top: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.body--dark .client-form-actions-improved {
  background: #1e1e1e;
}

/* Campo nombre más elegante y destacado */
.client-form-name-input {
  margin-bottom: 24px;
}

.client-form-name-input :deep(.q-field__control) {
  min-height: 64px !important;
  font-size: 18px;
  border: 3px solid var(--q-primary);
  border-radius: 16px;
  background: #f0f8ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.body--dark .client-form-name-input :deep(.q-field__control) {
  background: #2a2a2a;
}

.client-form-name-input :deep(.q-field__native) {
  font-size: 18px !important;
  font-weight: 600;
  padding: 0 24px;
}

.client-form-name-input :deep(.q-field__label) {
  font-size: 16px !important;
  font-weight: 700;
  left: 24px;
  color: var(--q-primary) !important;
}

.client-form-name-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 6px var(--q-primary-alpha, rgba(25, 118, 210, 0.15));
  transform: scale(1.03);
}

.client-form-save-btn {
  background: var(--q-primary) !important;
  color: white !important;
  padding: 10px 24px;
  font-weight: 600;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
  height: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.client-form-save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.client-form-save-btn:hover::before {
  left: 100%;
}

.client-form-save-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.client-form-delete-btn {
  background-color: #f44336 !important;
  color: white !important;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
  height: 40px;
  transition: all 0.2s ease;
}

.client-form-save-btn:hover,
.client-form-delete-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Checkbox styling */
.client-form-checkbox {
  color: #b0b0b0;
}

.client-form-checkbox :deep(.q-checkbox__inner) {
  color: var(--q-primary);
}

.client-form-checkbox :deep(.q-checkbox__label) {
  color: #b0b0b0;
}

/* Responsive */
@media (max-width: 768px) {
  .client-form-actions {
    position: static;
    justify-content: center;
    margin-top: 20px;
    padding: 0 20px 20px;
  }

  .client-form-body {
    padding: 16px;
    padding-bottom: 16px;
  }
}

.address-cell {
  width: 250px;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.address-cell:hover {
  color: var(--q-primary);
}
</style>
