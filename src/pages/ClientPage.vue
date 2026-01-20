<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right q-gutter-sm">
        <q-btn
          label="Modo afiliado"
          :icon="store.partnerMode ? 'check_box' : 'check_box_outline_blank'"
          @click="togglePartnerMode"
          color="primary"
          v-if="isAdmin"
        >
          <q-tooltip>
            {{ store.partnerMode ? 'Modo afiliado activado' : 'Modo afiliado desactivado' }}
          </q-tooltip>
        </q-btn>
        <q-btn color="teal" @click="exportClients" icon="download" label="Exportar" />
        <q-btn color="indigo" @click="openImportDialog" icon="upload" label="Importar" />
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
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveEdit">
          <!-- Header con estilo naranja -->
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Modificar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <!-- Body con tema oscuro -->
          <q-card-section class="row q-col-gutter-sm">
            <!-- Nombre - Campo principal con asterisco rojo -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.name"
                label="Nombre *"
                :rules="[val => !!val || 'El campo es requerido.']"
                autofocus
              />
            </div>

            <!-- Información adicional -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-grey-7 q-mt-sm">
              Información adicional (opcional)
            </div>

            <!-- Fila 1: Tipo de documento y Número -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="client.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.document_number"
                label="Número de documento"
              />
            </div>

            <!-- Fila 2: Correo y Teléfono -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.phone_number"
                label="Teléfono"
              />
            </div>

            <!-- Condición de IVA -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>
            <!-- Affiliate Configuration -->
            <div class="col-12 flex q-gutter-x-lg q-pt-md">
              <q-checkbox v-model="client.is_credit" label="Cuenta corriente" dense color="primary" />
              <q-checkbox v-model="client.is_partner" label="¿Es Afiliado?" dense color="primary" />
            </div>
            <div class="col-12" v-if="!client.is_partner">
              <q-select
                filled
                v-model="client.partner"
                label="Afiliado"
                :options="partners"
                @filter="getPartners"
                use-input
                option-label="name"
                option-value="id"
              >
                <template v-slot:prepend>
                  <q-icon name="group" />
                </template>
              </q-select>
            </div>
            <!-- Sección de Dirección - MANTENER IGUAL -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
            <div class="col-12">
              <q-input
                filled
                v-model="client.reference"
                label="Referencia"
              />
            </div>
          </q-card-section>

          <!-- Botones de acción -->
          <q-card-actions align="right" class="text-primary">
            <q-btn
              icon="delete"
              color="negative"
              label="ELIMINAR"
              @click="deleteClient"
              :loading="visible"
            />
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              type="submit"
              :loading="visible"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddClient" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-form @submit="saveClient">
          <!-- Header con estilo naranja -->
          <q-card-section class="row items-center text-white bg-primary">
            <div class="text-h6">Agregar cliente</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="closeModal" />
          </q-card-section>

          <!-- Body con tema oscuro -->
          <q-card-section class="row q-col-gutter-sm">
            <!-- Nombre - Campo principal con asterisco rojo -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.name"
                label="Nombre *"
                :rules="[val => !!val || 'El campo es requerido.']"
                autofocus
              />
            </div>

            <!-- Información adicional -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 text-grey-7 q-mt-sm">
              Información adicional (opcional)
            </div>

            <!-- Fila 1: Tipo de documento y Número -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Tipo de documento"
                input-debounce="0"
                option-label="Desc"
                option-value="id"
                v-model="client.document_type"
                :options="documentTypes"
                @filter="getDocumentTypes"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.document_number"
                label="Número de documento"
              />
            </div>

            <!-- Fila 2: Correo y Teléfono -->
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.email"
                type="email"
                label="Correo"
              />
            </div>
            <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-xs-12">
              <q-input
                filled
                v-model="client.phone_number"
                label="Teléfono"
              />
            </div>

            <!-- Condición de IVA -->
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-select
                filled
                use-input
                label="Condición de IVA"
                input-debounce="0"
                option-label="name"
                option-value="code"
                v-model="client.condition_iva_receptor"
                :options="conditionIvaReceptors"
                @filter="getConditionIvaReceptor"
              />
            </div>

            <!-- Affiliate Configuration -->
            <div class="col-12 flex q-gutter-x-lg q-pt-md">
              <q-checkbox v-model="client.is_credit" label="Cuenta corriente" dense color="primary" />
              <q-checkbox v-model="client.is_partner" label="¿Es Afiliado?" dense color="primary" />
            </div>
            <div class="col-12" v-if="!client.is_partner">
              <q-select
                filled
                v-model="client.partner"
                label="Afiliado"
                :options="partners"
                @filter="getPartners"
                use-input
                option-label="name"
                option-value="id"
              >
                <template v-slot:prepend>
                  <q-icon name="group" />
                </template>
              </q-select>
            </div>

            <!-- Sección de Dirección - MANTENER IGUAL -->
            <div class="col-12">
              <AddressComponent
                :key="addressComponentKey"
                :initial-address="address"
                @address-selected="handleAddressSelected"
              />
            </div>
            <div class="col-12">
              <q-input
                filled
                v-model="client.reference"
                label="Referencia"
              />
            </div>
          </q-card-section>

          <!-- Botón guardar mejorado -->
          <q-card-actions align="right" class="text-primary">
            <q-btn
              icon="save"
              color="primary"
              label="GUARDAR"
              type="submit"
              :loading="visible"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Import Dialog -->
    <q-dialog v-model="showImportDialog" persistent>
      <q-card style="width: 700px; max-width: 90vw;">
        <!-- Header -->
        <q-card-section class="row items-center text-white bg-indigo">
          <q-icon name="upload_file" size="md" class="q-mr-sm" />
          <div class="text-h6">Importar Clientes</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeImportDialog" />
        </q-card-section>

        <!-- Content -->
        <q-card-section class="q-pa-lg">
          <!-- Step 1: Download Template -->
          <div class="import-step q-mb-lg">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">1</div>
              <div class="text-subtitle1 text-weight-medium">Descarga la plantilla (opcional)</div>
            </div>
            <q-btn
              unelevated
              color="primary"
              icon="download"
              label="Descargar Plantilla Excel"
              @click="exportClients"
              class="full-width"
              style="border-radius: 8px;"
              size="md"
            />
            <div class="text-caption text-grey-7 q-mt-sm q-ml-sm">
              Exporta tus clientes actuales como plantilla o descarga una vacía
            </div>
          </div>

          <!-- Step 2: Upload File -->
          <div class="import-step q-mb-lg">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">2</div>
              <div class="text-subtitle1 text-weight-medium">Sube tu archivo</div>
            </div>

            <!-- Dropzone -->
            <div
              class="import-dropzone"
              :class="{ 'dropzone-active': isDragging, 'dropzone-has-file': importFile }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputImport"
                type="file"
                accept=".xlsx,.xls,.csv"
                @change="handleFileSelect"
                style="display: none;"
              />

              <div v-if="!importFile" class="dropzone-content">
                <q-icon name="cloud_upload" size="48px" color="primary" class="q-mb-md" />
                <div class="text-h6 text-weight-medium q-mb-xs">
                  Arrastra tu archivo aquí
                </div>
                <div class="text-body2 text-grey-7 q-mb-md">
                  o haz clic para seleccionar
                </div>
                <div class="text-caption text-grey-6">
                  Formatos: .xlsx, .xls, .csv • Máx. 10MB
                </div>
              </div>

              <div v-else class="dropzone-file-info">
                <div class="row items-center">
                  <q-icon name="description" size="40px" color="positive" class="q-mr-md" />
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">
                      {{ importFile.name }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ formatFileSize(importFile.size) }} • {{ importPreview.length }} registros
                    </div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="grey-7"
                    @click.stop="removeImportFile"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="importPreview.length > 0" class="import-step">
            <div class="row items-center q-mb-md">
              <div class="import-step-number">3</div>
              <div class="text-subtitle1 text-weight-medium">Vista previa</div>
            </div>
            <q-card flat bordered class="preview-card">
              <q-list separator>
                <q-item v-for="(client, index) in importPreview.slice(0, 5)" :key="index">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" size="sm">
                      {{ index + 1 }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ client.name }}</q-item-label>
                    <q-item-label caption>{{ client.email || 'Sin email' }} • {{ client.document_number || 'Sin documento' }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-separator />
              <div class="q-pa-sm text-center text-caption text-grey-7">
                Mostrando 5 de {{ importPreview.length }} registros
              </div>
            </q-card>
          </div>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions class="q-pa-lg q-pt-none">
          <q-btn
            flat
            label="Cancelar"
            @click="closeImportDialog"
            color="grey-8"
            class="q-px-lg"
            style="border-radius: 8px;"
          />
          <q-space />
          <q-btn
            unelevated
            color="positive"
            label="Importar"
            @click="importClients"
            :disable="!importFile"
            :loading="importLoading"
            icon-right="upload"
            class="q-px-xl"
            style="border-radius: 8px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Import Results Dialog -->
    <q-dialog v-model="showImportResults">
      <q-card style="width: 600px; max-width: 80vw;">
        <q-card-section class="row items-center text-white" :class="importResults.errors.length > 0 ? 'bg-orange' : 'bg-positive'">
          <q-icon :name="importResults.errors.length > 0 ? 'warning' : 'check_circle'" size="md" class="q-mr-sm" />
          <div class="text-h6">Resultado de la importación</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <p class="text-body1">
              <strong>Importados:</strong> {{ importResults.imported }} clientes
            </p>
            <p class="text-body1" v-if="importResults.skipped > 0">
              <strong>Omitidos:</strong> {{ importResults.skipped }} clientes (ya existían)
            </p>
          </div>

          <div v-if="importResults.errors.length > 0">
            <p class="text-body2 text-weight-bold text-negative">Errores:</p>
            <q-list bordered separator dense>
              <q-item v-for="(error, index) in importResults.errors" :key="index">
                <q-item-section>
                  <q-item-label caption>Fila {{ error.row }}</q-item-label>
                  <q-item-label class="text-negative">{{ error.message }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Cerrar"
            color="primary"
            v-close-popup
            @click="getClients()"
          />
        </q-card-actions>
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
import * as XLSX from 'xlsx'
export default {
  components: {
    AddressComponent
  },
  data () {
    return {
      store: authentication(),
      clients: [],
      documentTypes: [],
      client: {},
      filter: '',
      showImportDialog: false,
      importFile: null,
      importPreview: [],
      importLoading: false,
      isDragging: false,
      showImportResults: false,
      importResults: {
        imported: 0,
        skipped: 0,
        errors: []
      },
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
      partners: [],
      columns: [
        {
          name: 'name',
          align: 'left',
          label: 'Nombre',
          field: 'name',
          sortable: true
        },
        {
          name: 'document_number',
          align: 'left',
          label: 'Número de documento',
          field: 'document_number',
          format: (value) => value || '-',
          sortable: true
        },
        {
          name: 'phone_number',
          align: 'left',
          label: 'Número de teléfono',
          field: 'phone_number',
          format: (value) => value || '-',
          sortable: true
        },
        {
          name: 'email',
          align: 'left',
          label: 'Correo',
          field: 'email',
          format: (value) => value || '-',
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
    this.loadClients()
  },
  watch: {
    filter (data) {
      this.searchData(data)
    }
  },
  computed: {
    ...mapState(authentication, ['userSession']),
    /**
     * Checks if the current user is an administrator
     * @returns {Boolean} True if user is root or super admin
     */
    isAdmin () {
      return this.userSession?.is_root || this.userSession?.is_super_admin
    }
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
        is_credit: true,
        partner: null
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
        is_credit: true
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
      params.onlyClients = Boolean(!this.store.partnerMode)
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
     * Select category
     * @param {String} value Value filter
     * @param {Callback} update update options
     */
    async getPartners (value, update) {
      try {
        const { data } = await this.$api.get('partners', {
          params: {
            dataSearch: {
              name: value,
              document_number: value
            },
            paginate: true,
            page: 1,
            perPage: 20,
            sortBy: 'id',
            sortOrder: 'desc'
          }
        })
        update(() => {
          this.partners = data.data
        })
      } catch (err) {
        notify('Error en la conexión', 'negative', 'warning')
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

      // Preparar datos del cliente con dirección formateada
      const clientData = { ...this.client }

      // Validar y formatear campos requeridos
      if (clientData.condition_iva_receptor && typeof clientData.condition_iva_receptor === 'object') {
        clientData.condition_iva_receptor = JSON.stringify(clientData.condition_iva_receptor)
      }

      if (clientData.document_type && typeof clientData.document_type === 'object') {
        clientData.document_type = JSON.stringify(clientData.document_type)
      }

      if (clientData?.partner?.id) {
        clientData.partner_id = clientData.partner.id
      }

      clientData.address = this.address || this.client.address || null

      this.$api.post('clients', clientData)
        .then(({ data }) => {
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
      this.address = row.address
      // Incrementar la clave para forzar re-renderización del AddressComponent
      this.addressComponentKey += 1
    },
    /**
     * Save edit
     */
    saveEdit () {
      this.visible = true

      const clientData = { ...this.client }

      clientData.address = this.address || this.client.address || null

      if (clientData?.partner?.id) {
        clientData.partner_id = clientData.partner.id
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
    },
    /**
     * Export clients to Excel
     */
    async exportClients () {
      try {
        this.visible = true
        const { data } = await this.$api.post('clients/export')

        if (!data.data || data.data.length === 0) {
          Notify.create({
            message: 'No hay clientes para exportar',
            icon: 'warning',
            color: 'orange'
          })
          this.visible = false
          return
        }

        // Create worksheet from data
        const ws = XLSX.utils.json_to_sheet(data.data)

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `clientes_${timestamp}.xlsx`

        // Download file
        XLSX.writeFile(wb, filename)

        this.visible = false
        Notify.create({
          message: `${data.total} clientes exportados exitosamente`,
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        this.visible = false
        console.error('Error exporting clients:', err)
        Notify.create({
          message: err.response?.data?.message || 'Error al exportar clientes',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Open import dialog
     */
    openImportDialog () {
      this.showImportDialog = true
      this.importFile = null
      this.importPreview = []
    },
    /**
     * Close import dialog
     */
    closeImportDialog () {
      this.showImportDialog = false
      this.importFile = null
      this.importPreview = []
      this.isDragging = false
    },
    /**
     * Trigger file input click
     */
    triggerFileInput () {
      this.$refs.fileInputImport?.click()
    },
    /**
     * Handle file drop
     */
    handleFileDrop (e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.importFile = files[0]
        this.handleFileSelect({ target: { files: [files[0]] } })
      }
    },
    /**
     * Remove import file
     */
    removeImportFile () {
      this.importFile = null
      this.importPreview = []
    },
    /**
     * Format file size
     */
    formatFileSize (bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },
    /**
     * Handle file selection and preview
     */
    async handleFileSelect (event) {
      const file = event.target?.files?.[0] || event
      if (!file) {
        this.importPreview = []
        return
      }

      this.importFile = file

      try {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })

            // Get first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            this.importPreview = jsonData

            if (jsonData.length === 0) {
              Notify.create({
                message: 'El archivo está vacío',
                icon: 'warning',
                color: 'orange'
              })
            }
          } catch (err) {
            console.error('Error parsing file:', err)
            Notify.create({
              message: 'Error al leer el archivo',
              icon: 'warning',
              color: 'negative'
            })
          }
        }

        reader.readAsArrayBuffer(file)
      } catch (err) {
        console.error('Error reading file:', err)
        Notify.create({
          message: 'Error al procesar el archivo',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Import clients from file
     */
    async importClients () {
      if (this.importPreview.length === 0) {
        Notify.create({
          message: 'No hay datos para importar',
          icon: 'warning',
          color: 'orange'
        })
        return
      }

      try {
        this.importLoading = true

        const { data } = await this.$api.post('clients/import', {
          clients: this.importPreview
        })

        this.importResults = {
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors || []
        }

        this.showImportDialog = false
        this.showImportResults = true
        this.importLoading = false

        Notify.create({
          message: data.message,
          icon: 'check_circle',
          color: 'positive'
        })
      } catch (err) {
        this.importLoading = false
        console.error('Error importing clients:', err)
        Notify.create({
          message: err.response?.data?.message || 'Error al importar clientes',
          icon: 'warning',
          color: 'negative'
        })
      }
    },
    /**
     * Initial load and state handling
     */
    async loadClients () {
      if (this.userSession?.is_partner) {
        this.store.partnerMode = true
      }
      this.setPagination({
        pagination: this.paginationConfig,
        filter: undefined
      })
    },
    /**
     * Toggle partner mode
     */
    async togglePartnerMode () {
      await this.store.togglePartnerMode()
      this.getClients()
    }
  }
}
</script>

<style scoped>
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

/* Import Dialog Styles */
.import-close-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.import-close-btn:hover {
  opacity: 1;
}

.opacity-70 {
  opacity: 0.7;
}

.import-step {
  position: relative;
}

.import-step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  font-size: 14px;
}

/* Dropzone Styles */
.import-dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.02);
}

.body--dark .import-dropzone {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.05);
}

.import-dropzone:hover {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.body--dark .import-dropzone:hover {
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
}

.dropzone-active {
  border-color: var(--q-primary);
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.1);
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(var(--q-primary-rgb, 25, 118, 210), 0.2);
}

.dropzone-has-file {
  border-style: solid;
  border-color: var(--q-positive);
  background: rgba(76, 175, 80, 0.05);
  padding: 20px;
}

.body--dark .dropzone-has-file {
  background: rgba(76, 175, 80, 0.1);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.dropzone-file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-card {
  border-radius: 8px;
  overflow: hidden;
}
</style>
