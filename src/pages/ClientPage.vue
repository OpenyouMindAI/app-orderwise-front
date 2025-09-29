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
        </q-table>
      </div>
    </div>
    <q-dialog v-model="openEditClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Modificar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                autofocus
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="client.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.document_number"
                label="Número de documento"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.name"
                autofocus
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.phone_number"
                label="Número de teléfono"
              />
                <!-- :rules="[val => !!val || 'El campo es requerido.']" -->
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
            <q-btn icon="delete" color="negative" label="Eliminar" @click="deleteClient" :loading="visible" />
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>
          <q-card-section class="row">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Tipo de documento"
                input-debounce="0"
                autofocus
                option-label="Desc"
                option-value="id"
                v-model="client.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.document_number"
                label="Número de documento"
              />
              <!-- :rules="[val => !!val || 'El campo es requerido.']" -->
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.name"
                label="Nombre"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                use-input
                filled
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                :rules="[val => !!val || 'El campo es requerido.']"
                filled
                v-model="client.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.phone_number"
                label="Número de teléfono"
              />
                <!-- :rules="[val => !!val || 'El campo es requerido.']" -->
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
            <q-btn icon="save" color="primary" label="Guardar" type="submit" :loading="visible"/>
          </q-card-actions>
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
        document_type: null
      }
      this.role = null

      // Limpiar las variables de dirección
      this.address = null
      this.formattedAddress = ''
      this.addressComponentKey += 1

      console.log('🧹 Modal cerrado - datos limpiados')
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
        document_type: null
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

      // Agregar la dirección formateada
      if (this.formattedAddress) {
        clientData.address = this.formattedAddress
      } else if (this.address && typeof this.address === 'object') {
        // Si es un objeto, usar formattedAddress o convertir a string simple
        clientData.address = this.address.formattedAddress || this.address.name || JSON.stringify(this.address)
      } else if (this.client.address) {
        clientData.address = this.client.address
      }

      // Adjuntar datos geográficos si están disponibles
      if (this.address && typeof this.address === 'object') {
        if (this.address.latitude !== undefined && this.address.latitude !== null) {
          clientData.latitude = this.address.latitude
        }
        if (this.address.longitude !== undefined && this.address.longitude !== null) {
          clientData.longitude = this.address.longitude
        }
        if (this.address.placeId) {
          clientData.place_id = this.address.placeId
        }
      }

      // Debug: Log de datos antes de enviar
      console.log('📊 Datos a enviar:', JSON.stringify(clientData, null, 2))
      console.log('📧 Email:', clientData.email)
      console.log('📍 Dirección:', clientData.address)

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

      // Agregar la dirección formateada
      if (this.formattedAddress) {
        clientData.address = this.formattedAddress
      } else if (this.address && typeof this.address === 'object') {
        // Si es un objeto, usar formattedAddress o convertir a string simple
        clientData.address = this.address.formattedAddress || this.address.name || JSON.stringify(this.address)
      } else if (this.client.address) {
        clientData.address = this.client.address
      }

      // Adjuntar datos geográficos si están disponibles
      if (this.address && typeof this.address === 'object') {
        if (this.address.latitude !== undefined && this.address.latitude !== null) {
          clientData.latitude = this.address.latitude
        }
        if (this.address.longitude !== undefined && this.address.longitude !== null) {
          clientData.longitude = this.address.longitude
        }
        if (this.address.placeId) {
          clientData.place_id = this.address.placeId
        }
      }

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
