<template>
  <q-page padding>
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      header-nav
    >
      <q-step
        :name="1"
        title="Información de la empresa"
        icon="settings"
        :done="step > 1"
      >
        <q-card>
          <q-form @submit="onSubmit">
            <q-card-section>
              <span class="text-h6">Cambiar logo de la empresa</span>
            </q-card-section>
            <q-card-section class="flex justify-center q-pt-none">
              <q-img
                :src="file.url || logo.white"
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
            <q-card-section class="q-pb-none">
              <span class="text-h6">Datos de perfil de la empresa</span>
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
                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                  <q-input
                    v-model="company.address"
                    filled
                    label="Dirección"
                    lazy-rules
                    type="textarea"
                    :rules="[ val => val && val.length > 0 || 'Este campo es requerido']"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right" class="q-pt-xs">
              <q-btn color="primary" label="Guardar" icon="save" type="submit" :loading="loading"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-step>
      <q-step
        :name="2"
        title="Valores por defecto"
        icon="settings"
        clickable
      >
        <q-card>
          <q-form @submit="onSubmitConfig">
            <q-card-section>
              <span class="text-h6">Valores por defecto para la facturación</span>
            </q-card-section>
            <q-card-section class="q-pb-none">
              <div class="row q-col-gutter-sm">
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Cliente"
                    input-debounce="0"
                    option-label="name"
                    option-value="id"
                    v-model="companyConfig.client"
                    :options="clients"
                    @filter="filterClients"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Tipo de factura"
                    input-debounce="0"
                    option-label="name"
                    option-value="id"
                    v-model="companyConfig.invoiceType"
                    :options="invoiceTypes"
                    @filter="filterInvoiceTypes"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Tipo de servicio"
                    input-debounce="0"
                    option-label="name"
                    option-value="id"
                    v-model="companyConfig.typeOfService"
                    :options="typeOfServices"
                    @filter="filterTypeOfServices"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    filled
                    dense
                    label="Método de pago"
                    option-label="name"
                    option-value="id"
                    v-model="companyConfig.paymentMethod"
                    :options="paymentMethods"
                    @filter="filtersPaymentMethods"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    filled
                    dense
                    label="Moneda"
                    option-label="name"
                    option-value="id"
                    v-model="companyConfig.coin"
                    :options="coins"
                    @filter="filterCoins"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Tipo de concepto"
                    input-debounce="0"
                    option-label="Desc"
                    option-value="id"
                    v-model="companyConfig.other.concept_type"
                    :options="conceptTypes"
                    @filter="getConceptTypes"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Tipo de factura (Arca)"
                    input-debounce="0"
                    option-label="Desc"
                    option-value="id"
                    v-model="companyConfig.other.voucher_type"
                    :options="voucherTypes"
                    @filter="getVoucherTypes"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    use-input
                    filled
                    dense
                    label="Iva (%)"
                    input-debounce="0"
                    option-label="Desc"
                    option-value="id"
                    v-model="companyConfig.other.aliquot_type"
                    :options="aliquotTypes"
                    @filter="getAliquotTypes"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-input
                    filled
                    label="Punto de venta"
                    dense
                    v-model="companyConfig.point_of_sale"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-input
                    filled
                    label="Inicio de actividades"
                    dense
                    type="date"
                    v-model="companyConfig.other.activity_start_date"
                  />
                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-xs-12">
                  <q-input
                    filled
                    label="Ingresos brutos"
                    dense v-model="companyConfig.other.income_brut"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn color="primary" label="Guardar" icon="save" type="submit" :loading="loading"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-step>
      <q-step
        :name="3"
        title="Configurar menu"
        icon="menu_book"
        clickable
      >
        <q-card class="store-hours-manager q-mb-lg">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-sm-6">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="panorama" color="primary" size="sm" class="q-mr-xs" />
                  Banner del menu
                </div>
                <div class="text-caption text-grey">
                  Configura el banner del menu de la empresa
                </div>
              </div>
            </div>
            <q-img
              :src="fileBanner?.url || logo.white"
              spinner-color="white"
              class="rounded-borders"
              style="max-width: 100%; max-height: 200px;"
              fit="contain"
            >
              <div class="absolute-bottom text-subtitle1 text-center">
                <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUploadBanner" />
              </div>
              <template v-slot:error>
                <div class="absolute-bottom text-subtitle1 text-center">
                  <file-button-component icon="photo_camera" label="Subir imagen" @upload="onUploadBanner" />
                </div>
              </template>
            </q-img>
          </q-card-section>
        </q-card>
        <q-card class="store-hours-manager q-mb-lg">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="col-12 col-sm-6">
                <div class="text-h6 text-weight-bold">
                  <q-icon name="edit" color="primary" size="sm" class="q-mr-xs" />
                  Descripción de la empresa
                </div>
                <div class="text-caption text-grey">
                  Configura la descripción de la empresa que aparece en el menu de la empresa
                </div>
              </div>
            </div>
            <q-editor v-model="menuConfig.description" />
          </q-card-section>
        </q-card>
        <schedule-company
          :schedule="menuConfig.schedule"
          @update:schedule="($event) => menuConfig.schedule = $event"
        />
        <div class="full-width text-right">
          <q-btn
            color="primary"
            label="Guardar"
            icon="check_circle"
            type="button"
            @click="saveMenuConfig"
            :loading="loading"
          />
        </div>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { authentication } from 'src/stores/module-authentication'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import ScheduleCompany from 'src/components/Company/ScheduleCompany.vue'
import { logo, notify, setFiles } from '../const/mixins'
import { api, apiArca } from 'src/boot/axios'
import { ref } from 'vue'

/**
 * Coins
 * @type {Array}
 */
const coins = ref([])
/**
 * Coins
 * @type {Array}
 */
const conceptTypes = ref([])
/**
 * Coins
 * @type {Array}
 */
const voucherTypes = ref([])
/**
 * Type of service
 * @type {Array}
 */
const typeOfServices = ref([])
/**
 * Step
 * @type {Number}
 */
const step = ref(1)
/**
 * Invoice types
 * @type {Array}
 */
const invoiceTypes = ref([])
/**
 * Invoice types
 * @type {Array}
 */
const aliquotTypes = ref([])
/**
 * Invoice types
 * @type {Array}
 */
const clients = ref([])
/**
 * Payment methods
 * @type {Array}
 */
const paymentMethods = ref([])
/**
 * Store module authentication
 * @type {Object}
 */
const store = authentication()

/**
 * User session
 * @type {Object}
 */
const userSession = store.userSession

/**
 * Company session
 * @type {Object}
 */
const company = ref(userSession.company_session)

/**
 * Company config
 * @type {Object}
 */
const companyConfig = ref({
  paymentMethod: company.value?.company_config?.payment_method,
  invoiceType: company.value?.company_config?.invoice_type,
  typeOfService: company.value?.company_config?.type_of_service,
  coin: company.value?.company_config?.coin,
  client: company.value?.company_config?.client,
  other: company.value?.company_config?.other || {},
  point_of_sale: company.value?.company_config?.point_of_sale
})

const menuConfig = ref({
  ...companyConfig.value?.other?.menu
})

const fileBanner = ref({
  url: menuConfig.value?.banner_url
})

/**
 * File
 * @type {Object}
 */
const file = ref({
  url: userSession.company_session.url
})

/**
 * Loading
 * @type {Boolean}
 */
const loading = ref(false)

/**
 * On upload
 * @param {Array} files
 */
const onUpload = async (files) => {
  const filesSelected = await setFiles(files)
  file.value = filesSelected[0]
}
/**
 * On upload
 * @param {Array} files
 */
const onUploadBanner = async (files) => {
  const filesSelected = await setFiles(files)
  fileBanner.value = filesSelected[0]
}

/**
 * Form data
 * @param {Object} data
 */
const formDate = (data) => {
  const formData = new FormData()
  formData.append('file', file.value.file)
  formData.append('name', data.name)
  formData.append('address', data.address)
  formData.append('document_number', data.document_number)
  formData.append('email', data.email)
  formData.append('_method', 'put')
  return formData
}

/**
 * Save company config
 */
const onSubmit = async () => {
  try {
    loading.value = true
    const { data } = await api.post(`session/company/${company.value.id}`, formDate(company.value))
    store.setCompanySession({
      ...company.value,
      ...data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filterOptions = async (value, service, update) => {
  try {
    const { data } = await api.get(service, {
      params: {
        dataSearch: {
          name: value
        }
      }
    })
    update(data)
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const getConceptTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/concept-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      conceptTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const getAliquotTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/aliquot-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      aliquotTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const getVoucherTypes = async (value, update) => {
  try {
    const { data } = await apiArca.get('metadata/voucher-types', {
      params: {
        user: {
          name: userSession.name,
          email: userSession.email
        }
      }
    })
    update(() => {
      voucherTypes.value = data
    })
  } catch (err) {
    notify(err.message, 'negative', 'warning')
  }
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filterInvoiceTypes = async (value, update) => {
  filterOptions(value, 'invoice-types', (data) => {
    update(() => {
      invoiceTypes.value = data
    })
  })
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filtersPaymentMethods = async (value, update) => {
  filterOptions(value, 'payment-methods', (data) => {
    update(() => {
      paymentMethods.value = data
    })
  })
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filterCoins = async (value, update) => {
  filterOptions(value, 'coins', (data) => {
    update(() => {
      coins.value = data
    })
  })
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filterClients = async (value, update) => {
  filterOptions(value, 'clients', (data) => {
    update(() => {
      clients.value = data
    })
  })
}
/**
 * Select category
 * @param {String} value Value filter
 * @param {Callback} update update options
 */
const filterTypeOfServices = async (value, update) => {
  filterOptions(value, 'type-of-services', (data) => {
    update(() => {
      typeOfServices.value = data
    })
  })
}

const saveMenuConfig = async () => {
  try {
    loading.value = true
    const formData = new FormData()
    formData.append('file', fileBanner.value.file)
    formData.append('other', JSON.stringify({
      ...companyConfig.value.other,
      menu: menuConfig.value
    }))
    const { data } = await api.post(`session/company-other-configs/${company.value.id}`, formData)
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}
/**
 * Save company config
 * @param {Object} data
 */

const onSubmitConfig = async () => {
  try {
    loading.value = true
    const { data } = await api.post('company-configs', {
      coin_id: companyConfig.value?.coin?.id,
      type_of_service_id: companyConfig.value?.typeOfService?.id,
      invoice_type_id: companyConfig.value?.invoiceType?.id,
      payment_method_id: companyConfig.value?.paymentMethod?.id,
      client_id: companyConfig.value?.client?.id,
      other: companyConfig.value?.other,
      point_of_sale: companyConfig.value?.point_of_sale
    })
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}
</script>
