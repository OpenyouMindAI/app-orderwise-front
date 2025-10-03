<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <div class="col-12 text-right">
        <q-btn color="primary" @click="openAddCompany = true" icon="add_circle"/>
      </div>
      <div class="col-12">
        <q-table
          title="Empresas"
          row-key="name"
          :columns="columns"
          :rows="companies"
          :loading="visible"
          :filter="filter"
          binary-state-sort
          v-model:pagination="paginationConfig"
          @row-click="editCompany"
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
    <q-dialog v-model="openEditCompany" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="flex justify-between bg-primary text-white">
          <span class="text-h6">Editar empresa</span>
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveEdit">
          <q-card-section class="flex justify-center q-pt-none">
            <q-img
              :src="file.url"
              :error-src="logo.color"
              spinner-color="white"
              style="height: 200px;"
              class="rounded-borders"
              fit="contain"
            >
              <div class="absolute-bottom text-subtitle1 text-center">
                <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUpload" />
              </div>
              <template v-slot:error>
                <div class="absolute-bottom text-subtitle1 text-center">
                  <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUpload" />
                </div>
              </template>
            </q-img>
          </q-card-section>
          <q-card-section class="q-pb-sm">
            <div class="row q-col-gutter-x-md">
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.name"
                  filled
                  label="Nombre de la empresa"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.document_number"
                  filled
                  label="Número de documento"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.email"
                  filled
                  label="Correo electrónico"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.phone_number"
                  filled
                  label="Número de teléfono"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
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
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pt-xs">
            <q-btn color="negative" label="Eliminar" icon="delete" type="button" :loading="visible" @click="deleteCompany"/>
            <q-btn color="primary" label="Guardar" icon="save" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openAddCompany" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="flex justify-between bg-primary text-white">
          <span class="text-h6">Agregar empresa</span>
          <q-btn icon="close" flat round dense @click="closeModal" />
        </q-card-section>
        <q-form @submit="saveCompany">
          <q-card-section class="flex justify-center q-pt-none">
            <q-img
              :src="file.url"
              :error-src="logo.color"
              spinner-color="white"
              style="height: 200px;"
              class="rounded-borders"
              fit="contain"
            >
              <div class="absolute-bottom text-subtitle1 text-center">
                <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUpload" />
              </div>
              <template v-slot:error>
                <div class="absolute-bottom text-subtitle1 text-center">
                  <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUpload" />
                </div>
              </template>
            </q-img>
          </q-card-section>
          <q-card-section class="q-pb-sm">
            <div class="row q-col-gutter-x-md">
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.name"
                  filled
                  label="Nombre de la empresa"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.document_number"
                  filled
                  label="Número de documento"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.email"
                  filled
                  label="Correo electrónico"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                />
              </div>
              <div class="col-xs-12 col-sm-12 col-md-12 col-lg-6">
                <q-input
                  v-model="company.phone_number"
                  filled
                  label="Número de teléfono"
                  lazy-rules
                  :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
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
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pt-xs">
            <q-btn color="primary" label="Guardar" icon="save" type="submit" :loading="visible"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import { notify, logo, setFiles } from 'src/const/mixins'
import { onMounted, ref, watch } from 'vue'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'

/**
 * Reactive reference to store the list of companies
 * @type {Array}
 */
const companies = ref([])
/**
 * Reactive reference to store the list of business types
 * @type {Array}
 */
const businessTypes = ref([])
/**
 * File selected
 * @type {Object}
 */
const file = ref({})
/**
 * Reactive reference to store the data of a single company
 * @type {Object}
 */
const company = ref({})
/**
 * Reactive reference for the search filter
 * @type {String}
 */
const filter = ref('')
/**
 * Search and pagination parameters
 * @type {Object}
 */
const params = ref({
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc',
  perPage: 20,
  dataSearch: {
    id: '',
    name: '',
    document_number: '',
    phone_number: ''
  }
})
/**
 * Reactive reference to control the visibility of a loading indicator
 * @type {Boolean}
 */
const visible = ref(false)
/**
 * Reactive reference to control the visibility of the add company dialog
 * @type {Boolean}
 */
const openAddCompany = ref(false)
/**
 * Reactive reference to control the visibility of the edit company dialog
 * @type {Boolean}
 */
const openEditCompany = ref(null)
/**
 * Table columns configuration
 * @type {Array}
 */
const columns = [
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
    name: 'document_number',
    align: 'left',
    label: 'Número de documento',
    field: 'document_number',
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
    label: 'Correo electrónico',
    field: 'email',
    sortable: true
  }
]
/**
 * Pagination configuration
 * @type {Object}
 */
const paginationConfig = ref({
  rowsPerPage: 20,
  rowsNumber: 20,
  paginate: true,
  sortBy: 'id',
  sortOrder: 'desc'
})

/**
 * Address component key for resetting
 * @type {Number}
 */
const addressComponentKey = ref(0)

/**
 * Address object
 * @type {Object}
 */
const address = ref(null)

/**
 * Formatted address string
 * @type {String}
 */
const formattedAddress = ref('')

/**
 * Sets the pagination configuration on component mount
 * @returns {void}
 */
onMounted(() => {
  setPagination({
    pagination: paginationConfig.value
  })
  getBusinessTypes()
})

/**
 * Watches the filter and triggers searchData when it changes
 * @param {String} data - The new filter value
 * @returns {void}
 */
watch(filter, (data) => {
  searchData(data)
})
/**
 * On upload
 * @param {Array} files
 */
const onUpload = async (files) => {
  const filesSelected = await setFiles(files)
  file.value = filesSelected[0]
}
/**
 * Form data
 * @param {Object} data
 */
const formDate = (data, put = false) => {
  const formData = new FormData()
  formData.append('file', file.value.file)
  formData.append('name', data.name)

  // Agregar la dirección formateada
  let addressToSend = ''
  if (formattedAddress.value) {
    addressToSend = formattedAddress.value
  } else if (address.value && typeof address.value === 'object') {
    // Si es un objeto, usar formattedAddress o convertir a string simple
    addressToSend = address.value.formattedAddress || address.value.name || JSON.stringify(address.value)
  } else if (data.address) {
    addressToSend = data.address
  }

  formData.append('address', addressToSend)
  formData.append('document_number', data.document_number)
  formData.append('email', data.email)
  formData.append('phone_number', data.phone_number)
  formData.append('business_type_id', data.business_type_id)
  if (put) formData.append('_method', 'put')
  return formData
}
/**
 * Closes the add and edit company modals
 * @returns {void}
 */
function closeModal () {
  openAddCompany.value = false
  openEditCompany.value = false
  company.value = {}
  file.value = {}
  // Limpiar las variables de dirección
  address.value = null
  formattedAddress.value = ''
  addressComponentKey.value += 1
}
/**
 * Searches for companies based on the filter data
 * @param {String} data - The search filter value
 * @returns {void}
 */
function searchData (data) {
  for (const dataSearch in params.value.dataSearch) {
    params.value.dataSearch[dataSearch] = data
  }
  params.value.page = 1
  getCompanies(params.value)
}
/**
 * Fetches the list of companies from the API
 * @param {Object} params - Search and pagination parameters
 * @returns {void}
 */
async function getCompanies (params) {
  try {
    visible.value = true
    const { data } = await api.get('companies', { params })
    companies.value = data.data
    paginationConfig.value.rowsNumber = data.total
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  } finally {
    visible.value = false
  }
}

/**
 * Fetches the list of business types from the API
 * @returns {void}
 */
async function getBusinessTypes () {
  try {
    const { data } = await api.get('business-types')
    businessTypes.value = data.data || data
  } catch (err) {
    notify('Error al cargar los tipos de empresa', 'negative', 'warning')
    console.error('Error fetching business types:', err)
  }
}
/**
 * Sets the pagination configuration and fetches companies
 * @param {Object} data - Pagination data
 * @returns {void}
 */
function setPagination (data) {
  params.value.sortOrder = data.pagination.descending ? 'asc' : 'desc'
  params.value.page = data.pagination.page
  params.value.sortBy = data.pagination.sortBy ?? params.value.sortBy
  params.value.perPage = data.pagination.rowsPerPage
  paginationConfig.value = data.pagination
  getCompanies(params.value)
}

/**
 * Saves a new company
 * @returns {void}
 */
async function saveCompany () {
  try {
    visible.value = true
    await api.post('companies', formDate(company.value, false))
    getCompanies(params.value)
    openAddCompany.value = false
    company.value = {}
    file.value = {}
    // Limpiar las variables de dirección
    address.value = null
    formattedAddress.value = ''
    addressComponentKey.value += 1
    notify('Empresa creada exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    visible.value = false
  }
}
/**
 * Edits a company
 * @param {Event} event - Click event
 * @param {Object} row - Selected company data
 * @param {number} index - Index of the company in the list
 * @returns {void}
 */
function editCompany (event, row, index) {
  openEditCompany.value = true
  company.value = row
  file.value = { url: row.url }

  // Actualizar la dirección cuando se selecciona una empresa
  if (row.address) {
    formattedAddress.value = row.address
    // Crear objeto de dirección para AddressComponent
    address.value = {
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
    company.value.address = row.address
  } else {
    formattedAddress.value = ''
    address.value = null
    company.value.address = ''
  }
}
/**
 * Saves the changes of an edited company
 * @returns {void}
 */
async function saveEdit () {
  try {
    visible.value = true
    await api.post(`companies/${company.value.id}`, formDate(company.value, true))
    await getCompanies(params.value)
    openEditCompany.value = false
    company.value = {}
    file.value = {}
    // Limpiar las variables de dirección
    address.value = null
    formattedAddress.value = ''
    addressComponentKey.value += 1
    notify('Empresa editada exitosamente', 'positive', 'check_circle')
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  } finally {
    visible.value = false
  }
}
/**
 * Deletes a company
 * @returns {void}
 */
async function deleteCompany () {
  visible.value = true
  try {
    await api.delete(`companies/${company.value.id}`)
    await getCompanies(params.value)
    openEditCompany.value = false
    company.value = {}
    file.value = {}
    notify('Empresa eliminada exitosamente', 'positive', 'check_circle')
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  } finally {
    visible.value = false
  }
}

/**
 * Handle address selection from AddressComponent
 * @param {Object} selectedAddress - The selected address object
 */
function handleAddressSelected (selectedAddress) {
  // Si la dirección es nula, reiniciar el objeto de dirección
  if (!selectedAddress) {
    address.value = null
    formattedAddress.value = ''
    return
  }

  // Actualizar los campos de dirección para el formulario
  address.value = selectedAddress

  // Formatear la dirección para enviarla en la empresa
  // El componente AddressComponent devuelve un objeto con la estructura específica
  if (typeof selectedAddress === 'object' && selectedAddress !== null) {
    // Priorizar formattedAddress si existe
    if (selectedAddress.formattedAddress) {
      formattedAddress.value = selectedAddress.formattedAddress
    } else if (selectedAddress.name) {
      // Si no hay formattedAddress, usar el name del lugar
      formattedAddress.value = selectedAddress.name
    } else {
      // Construir dirección desde componentes disponibles
      const addressParts = []
      if (selectedAddress.street) addressParts.push(selectedAddress.street)
      if (selectedAddress.city) addressParts.push(selectedAddress.city)
      if (selectedAddress.state) addressParts.push(selectedAddress.state)
      if (selectedAddress.country) addressParts.push(selectedAddress.country)
      if (selectedAddress.zipCode) addressParts.push(selectedAddress.zipCode)

      formattedAddress.value = addressParts.length > 0
        ? addressParts.join(', ')
        : JSON.stringify(selectedAddress)
    }
  } else if (typeof selectedAddress === 'string') {
    // Si por alguna razón viene como string
    formattedAddress.value = selectedAddress
  } else {
    // Fallback: convertir a string
    formattedAddress.value = String(selectedAddress)
  }

  // Dirección procesada correctamente - no necesita reinicialización del componente
}
</script>
