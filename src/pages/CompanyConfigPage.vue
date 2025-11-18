<template>
  <q-page class="minimalist-config">
    <div class="config-container">
      <!-- Progress Header -->
      <div class="progress-header">
        <div class="progress-content">
          <span class="main-title text-h6">Configuración</span>
          <p class="main-subtitle">Configura tu empresa en {{ totalSteps }} pasos simples</p>

          <div class="progress-bar-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${(step / totalSteps) * 100}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ step }} de {{ totalSteps }}</span>
          </div>
        </div>
      </div>

      <!-- Steps Navigation -->
      <div class="steps-nav">
        <div
          v-for="stepItem in steps"
          :key="stepItem.number"
          class="step-nav-item"
          :class="{
            'active': step === stepItem.number,
            'completed': step > stepItem.number
          }"
          @click="step = stepItem.number"
        >
          <div class="step-nav-icon">
            <q-icon
              :name="step > stepItem.number ? 'check' : stepItem.icon"
              size="16px"
            />
          </div>
          <span class="step-nav-label">{{ stepItem.title }}</span>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: Company Information -->
        <div v-if="step === 1" class="step-card">
          <div class="step-header">
            <h2>Información básica</h2>
            <p>Los datos esenciales de tu empresa</p>
          </div>

          <q-form @submit="onSubmit" class="step-form">
            <!-- Logo Upload -->
            <div class="logo-section">
              <div class="upload-label">Logo de la empresa</div>
              <div class="logo-preview" @click="triggerLogoUpload">
                <q-img
                  :src="file.url || logo.white"
                  class="logo-image"
                  fit="contain"
                >
                  <div class="logo-overlay">
                    <q-icon name="photo_camera" size="18px" />
                    <span>Cambiar logo</span>
                  </div>
                </q-img>
              </div>
              <file-button-component
                ref="logoUploader"
                @upload="onUpload"
                style="display: none"
              />
            </div>

            <!-- Form Fields -->
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Nombre de la empresa
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Nombre legal o comercial de tu empresa que aparecerá en facturas y documentos
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.name"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Documento
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      CUIT, RUT o número de identificación fiscal de tu empresa
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.document_number"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Email
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Correo electrónico principal de contacto de la empresa
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.email"
                  outlined
                  dense
                  type="email"
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Teléfono
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de teléfono principal de la empresa para contacto con clientes
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="company.phone_number"
                  outlined
                  dense
                  class="custom-input"
                  :rules="[val => val && val.length > 0 || 'Requerido']"
                />
              </div>

              <div class="form-group full-width">
                <label class="field-label">
                  Dirección
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Dirección física de tu empresa. Usa el buscador para mayor precisión
                    </q-tooltip>
                  </q-icon>
                </label>
                <AddressComponent
                  :key="addressComponentKey"
                  :initial-address="address"
                  @address-selected="handleAddressSelected"
                />
              </div>
            </div>

            <div class="step-actions">
              <div></div>
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn q-mt-sm"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 6: Printer Configuration -->
        <div v-if="step === 6" class="step-card">
          <div class="step-header">
            <h2>Dispositivos</h2>
            <p>Configura tu impresora y balanza</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="field-label">
                  Código de balanza
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Código identificador de tu balanza electrónica para integración con el sistema
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.balance_code"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.directPrint"
                    label="Impresión directa"
                    color="primary"
                  />
                  <p class="checkbox-description">Activar impresión automática</p>
                </div>
              </div>

              <div class="form-group">
                <label class="field-label">
                  Impresora
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Selecciona la impresora predeterminada para tickets y facturas
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.printer"
                  :options="printers"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filterPrinters"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 1"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 3: Default Values -->
        <div v-if="step === 3" class="step-card">
          <div class="step-header">
            <h2>Valores por defecto</h2>
            <p>Configuración para facturación</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Cliente
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Cliente predeterminado para facturas (ej: Consumidor Final)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.client"
                  :options="clients"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterClients"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Tipo de factura
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Tipo de comprobante predeterminado (Factura, Ticket, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.invoiceType"
                  :options="invoiceTypes"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterInvoiceTypes"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Tipo de servicio
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Categoría de servicio que ofrece tu empresa (Gastronomía, Retail, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.typeOfService"
                  :options="typeOfServices"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="filterTypeOfServices"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Método de pago
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Método de pago predeterminado (Efectivo, Tarjeta, Transferencia, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.paymentMethod"
                  :options="paymentMethods"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filtersPaymentMethods"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Moneda
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Moneda predeterminada para tus transacciones (ARS, USD, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.coin"
                  :options="coins"
                  option-label="name"
                  option-value="id"
                  outlined
                  dense
                  class="custom-input"
                  @filter="filterCoins"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Tipo de concepto
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Concepto fiscal para AFIP/ARCA (Productos, Servicios, Productos y Servicios)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.concept_type"
                  :options="conceptTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getConceptTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Tipo de factura (Arca)
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Tipo de comprobante para facturación electrónica AFIP (A, B, C, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.voucher_type"
                  :options="voucherTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getVoucherTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  IVA (%)
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Alícuota de IVA predeterminada (21%, 10.5%, Exento, etc.)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.aliquot_type"
                  :options="aliquotTypes"
                  option-label="Desc"
                  option-value="id"
                  outlined
                  dense
                  use-input
                  class="custom-input"
                  @filter="getAliquotTypes"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Inicio de actividades
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Fecha de inicio de actividades de tu empresa ante AFIP
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.activity_start_date"
                  outlined
                  dense
                  type="date"
                  class="custom-input"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Ingresos brutos
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de inscripción en Ingresos Brutos (IIBB)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.other.income_brut"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div v-if="!isFreePlan" class="form-group">
                <label class="field-label">
                  Punto de venta
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de punto de venta asignado por AFIP para facturación electrónica
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.point_of_sale"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>
              <div class="form-group">
              </div>

              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                  v-model="companyConfig.other.partial_billing"
                  label="Facturación parcial"
                  color="primary"
                  />
                  <p class="checkbox-description">Permitir facturación parcial</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.open_cashbox"
                    label="Arqueo de caja"
                    color="primary"
                  />
                  <p class="checkbox-description">Permitir arqueo de caja</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.other.categories_by_branch"
                    label="Categorías por sucursal"
                    color="primary"
                  />
                  <p class="checkbox-description">Filtrar categorías diferentes por sucursal</p>
                </div>
              </div>
              <div class="form-group">
                <div class="checkbox-group">
                  <q-checkbox
                    v-model="companyConfig.is_table"
                    label="Sistema de mesas"
                    color="primary"
                  />
                  <p class="checkbox-description">Activar gestión de mesas y salones</p>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 2"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 4: Menu Configuration -->
        <div v-if="step === 4" class="step-card">
          <div class="step-header">
            <h2>Tienda</h2>
            <p>Personaliza tu tienda digital</p>
          </div>

          <div class="step-form">
            <!-- Banner Upload -->
            <div class="banner-section">
              <div class="upload-label">Banner del menú</div>
              <div class="banner-preview" @click="triggerBannerUpload">
                <q-img
                  :src="fileBanner?.url || logo.white"
                  class="banner-image"
                  fit="contain"
                >
                  <div class="banner-overlay">
                    <q-icon name="photo_camera" size="18px" />
                    <span>Cambiar banner</span>
                  </div>
                </q-img>
              </div>
              <file-button-component
                ref="bannerUploader"
                @upload="onUploadBanner"
                style="display: none"
              />
            </div>

            <!-- Description -->
            <div class="form-group full-width">
              <label class="field-label">Descripción</label>
              <q-editor
                v-model="menuConfig.description"
                min-height="100px"
                toolbar-color="grey-1"
                toolbar-text-color="grey-8"
                content-style="font-size: 14px"
                class="custom-editor"
              />
            </div>

            <!-- Schedule Component -->
            <div class="schedule-section">
              <div class="upload-label">Horarios de atención</div>
              <div class="schedule-wrapper">
                <schedule-company
                  :schedule="menuConfig.schedule"
                  @update:schedule="($event) => menuConfig.schedule = $event"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 3"
                class="action-btn-secondary"
              />
              <q-btn
                color="primary"
                label="Continuar"
                @click="saveMenuConfig"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </div>
        </div>

        <!-- Step 5: Client Screen -->
        <div v-if="step === 5" class="step-card">
          <div class="step-header">
            <h2>Pantalla de cliente</h2>
            <p>Imágenes para mostrar a tus clientes</p>
          </div>

          <q-form @submit="onSubmitImages" class="step-form">
            <div class="upload-section">
              <div class="upload-label">Subir imágenes</div>
              <div class="upload-area" @click="triggerFileUpload">
                <q-icon name="cloud_upload" size="32px" color="grey-5" />
                <h3>Arrastra archivos aquí</h3>
                <p>o haz clic para seleccionar</p>
              </div>
              <file-button-component
                ref="fileUploader"
                @upload="changeFiles"
                style="display: none"
              />
            </div>

            <div class="files-section">
              <file-component :files="configFiles" @delete:files="deleteFile" />
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 4"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 2: Branch Configuration -->
        <div v-if="step === 2" class="step-card">
          <div class="step-header">
            <h2>Configuración de Sucursal</h2>
            <p>Define los valores por defecto para esta sucursal</p>
          </div>

          <q-form @submit="onSubmitConfig" class="step-form">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label">
                  Punto de venta
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Número de punto de venta específico para esta sucursal
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-input
                  v-model="companyConfig.point_of_sale"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>

              <div class="form-group">
                <label class="field-label">
                  Lista de precios por defecto
                  <q-icon name="help_outline" size="16px" color="grey-6" class="q-ml-xs">
                    <q-tooltip class="bg-grey-8" :offset="[0, 8]">
                      Lista de precios que se aplicará por defecto en esta sucursal (1-5)
                    </q-tooltip>
                  </q-icon>
                </label>
                <q-select
                  v-model="companyConfig.other.default_price_list"
                  :options="['1', '2', '3', '4', '5']"
                  outlined
                  dense
                  class="custom-input"
                />
              </div>
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 5"
                class="action-btn-secondary"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Continuar"
                :loading="loading"
                unelevated
                class="action-btn"
              />
            </div>
          </q-form>
        </div>

        <!-- Step 7: Integrations -->
        <div v-if="step === 7" class="step-card">
          <div class="step-header">
            <h2>Integraciones</h2>
            <p>Conecta con servicios externos</p>
          </div>

          <div class="step-form">
            <div class="integration-wrapper">
              <IntegrationComponent />
            </div>

            <div class="step-actions">
              <q-btn
                flat
                label="Anterior"
                @click="step = 6"
                class="action-btn-secondary"
              />
              <q-btn
                color="positive"
                label="Finalizar"
                icon="check_circle"
                unelevated
                class="action-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { authentication } from 'src/stores/module-authentication'
import { storeToRefs } from 'pinia'
import FileButtonComponent from 'src/components/FileButtonComponent.vue'
import ScheduleCompany from 'src/components/Company/ScheduleCompany.vue'
import { logo, notify, setFiles } from '../const/mixins'
import { api, apiArca } from 'src/boot/axios'
import { ref, computed, nextTick, onMounted } from 'vue'
import FileComponent from 'src/components/FileComponent.vue'
import IntegrationComponent from '../components/CompanyConfig/IntegrationComponent.vue'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'

// Reactive data
const coins = ref([])
const conceptTypes = ref([])
const voucherTypes = ref([])
const typeOfServices = ref([])
const step = ref(1)
const invoiceTypes = ref([])
const aliquotTypes = ref([])
const clients = ref([])
const paymentMethods = ref([])
const printers = ref([])
const loading = ref(false)

// Store and session
const store = authentication()
const { branchOffice } = storeToRefs(store)
const userSession = store.userSession
const company = ref(userSession.company_session || {})

// Company config
const companyConfig = ref({
  id: company.value?.company_config?.id,
  client: company.value?.company_config?.client,
  paymentMethod: company.value?.company_config?.payment_method,
  invoiceType: company.value?.company_config?.invoice_type,
  typeOfService: company.value?.company_config?.type_of_service,
  coin: company.value?.company_config?.coin,
  priceList: company.value?.company_config?.price_list,
  printer: company.value?.company_config?.printer,
  is_table: company.value?.company_config?.is_table ?? false,
  other: {
    ...(company.value?.company_config?.other || {}),
    categories_by_branch: company.value?.company_config?.other?.categories_by_branch ?? false
  },
  point_of_sale: company.value?.company_config?.point_of_sale,
  files: company.value?.company_config?.files || [],
  partial_billing: company.value?.company_config?.partial_billing || false,
  open_cashbox: company.value?.company_config?.open_cashbox || true
})

const menuConfig = ref({
  ...companyConfig.value?.other?.menu
})

const fileBanner = ref({
  url: menuConfig.value?.banner_url
})

const configFiles = ref([...companyConfig?.value?.files])

const file = ref({
  url: userSession?.company_session?.url
})

// Address component variables
/**
 * Address component key for resetting
 * @type {Number}
 */
const addressComponentKey = ref(0)

/**
 * Address object for AddressComponent
 * @type {Object}
 */
const address = ref(null)

/**
 * Formatted address string
 * @type {String}
 */
const formattedAddress = ref('')

// Load branch office config into the form on component mount
onMounted(() => {
  if (branchOffice.value) {
    companyConfig.value.point_of_sale = branchOffice.value.point_of_sale
    companyConfig.value.other.default_price_list = branchOffice.value.default_price_list
  }

  // Inicializar dirección si existe
  initializeAddress()
})

/**
 * Initialize address component with existing company address data
 */
const initializeAddress = () => {
  if (company.value?.address) {
    formattedAddress.value = company.value.address

    // Crear objeto de dirección para AddressComponent
    address.value = {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: company.value.latitude || null,
      longitude: company.value.longitude || null,
      formattedAddress: company.value.address,
      placeId: company.value.place_id || '',
      types: []
    }
  } else {
    // Si no hay dirección, limpiar campos
    formattedAddress.value = ''
    address.value = null
  }

  // Incrementar clave para forzar re-renderización del AddressComponent
  addressComponentKey.value += 1
}

// Computed
const isFreePlan = computed(() => {
  const subscription = userSession?.subscription
  return !subscription || subscription?.subscription_plan?.slug === 'free'
})

const totalSteps = computed(() => isFreePlan.value ? 5 : 7)

const steps = computed(() => {
  const allSteps = [
    { number: 1, title: 'Empresa', icon: 'business' },
    { number: 2, title: 'Sucursal', icon: 'store' },
    { number: 3, title: 'Facturación', icon: 'receipt' },
    { number: 4, title: 'Tienda', icon: 'restaurant_menu' },
    { number: 5, title: 'Pantalla', icon: 'tv' },
    { number: 6, title: 'Dispositivos', icon: 'print' },
    { number: 7, title: 'Integraciones', icon: 'hub' }
  ]

  // Si es plan Free, excluir Sucursal (2) e Integraciones (7)
  if (isFreePlan.value) {
    return allSteps.filter(s => s.number !== 2 && s.number !== 7)
  }

  return allSteps
})

// Función para obtener el siguiente step válido
const getNextStep = (currentStep) => {
  const validSteps = steps.value.map(s => s.number).sort((a, b) => a - b)
  const currentIndex = validSteps.indexOf(currentStep)

  if (currentIndex === -1 || currentIndex === validSteps.length - 1) {
    return currentStep
  }

  return validSteps[currentIndex + 1]
}

// Refs for file uploaders
const logoUploader = ref(null)
const bannerUploader = ref(null)
const fileUploader = ref(null)

// Methods
const triggerLogoUpload = async () => {
  await nextTick()
  if (logoUploader.value && logoUploader.value.$el) {
    const input = logoUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const triggerBannerUpload = async () => {
  await nextTick()
  if (bannerUploader.value && bannerUploader.value.$el) {
    const input = bannerUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const triggerFileUpload = async () => {
  await nextTick()
  if (fileUploader.value && fileUploader.value.$el) {
    const input = fileUploader.value.$el.querySelector('input[type="file"]')
    if (input) {
      input.click()
    }
  }
}

const onUpload = async (files) => {
  const filesSelected = await setFiles(files)
  file.value = filesSelected[0]
}

const onUploadBanner = async (files) => {
  const filesSelected = await setFiles(files)
  fileBanner.value = filesSelected[0]
}

const changeFiles = async (files) => {
  const filesSelected = await setFiles(files)
  configFiles.value = [...configFiles.value, ...filesSelected]
}

const deleteFile = async (file) => {
  try {
    const id = file[file.length - 1]
    await api.delete(`files/${id}`)
    const { data } = await api.get('company-configs')
    store.setCompanySession({
      ...company.value,
      company_config: data.data
    })
    notify('Archivo eliminado exitosamente', 'positive', 'check_circle')
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  }
}

const formDate = (data) => {
  const formData = new FormData()
  formData.append('file', file.value.file)
  formData.append('name', data.name)

  // Usar la dirección formateada si está disponible
  const addressToSend = formattedAddress.value || data.address || ''
  formData.append('address', addressToSend)

  formData.append('document_number', data.document_number)
  formData.append('email', data.email)
  formData.append('phone_number', data.phone_number)

  // Agregar coordenadas GPS si están disponibles
  if (address.value && typeof address.value === 'object') {
    if (address.value.latitude !== undefined && address.value.latitude !== null) {
      formData.append('latitude', address.value.latitude)
    }
    if (address.value.longitude !== undefined && address.value.longitude !== null) {
      formData.append('longitude', address.value.longitude)
    }
    if (address.value.placeId) {
      formData.append('place_id', address.value.placeId)
    }
  }

  formData.append('_method', 'put')
  return formData
}

const onSubmit = async () => {
  try {
    loading.value = true

    // Validar que los campos requeridos estén completos
    if (!company.value.name || !company.value.email || !company.value.document_number) {
      notify('Por favor completa todos los campos requeridos', 'negative', 'warning')
      return
    }

    const { data } = await api.post(`session/company/${company.value.id}`, formDate(company.value))

    // Actualizar la sesión con los nuevos datos
    store.setCompanySession({
      ...company.value,
      ...data
    })

    // Actualizar la variable local con los datos guardados
    company.value = { ...company.value, ...data }

    // Reinicializar la dirección con los datos actualizados
    initializeAddress()

    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

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

const onSubmitImages = async () => {
  if (!configFiles.value.length) {
    notify('Debe seleccionar al menos un archivo', 'negative', 'warning')
    return
  }
  try {
    loading.value = true
    const formData = new FormData()
    configFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file.file)
    })
    const { data } = await api.post(`company-configs/${companyConfig.value.id}/images`, formData)
    store.setCompanySession({
      ...company.value,
      company_config: data
    })
    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

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

const filterInvoiceTypes = async (value, update) => {
  filterOptions(value, 'invoice-types', (data) => {
    update(() => {
      invoiceTypes.value = data
    })
  })
}

const filtersPaymentMethods = async (value, update) => {
  filterOptions(value, 'payment-methods', (data) => {
    update(() => {
      paymentMethods.value = data
    })
  })
}

const filterCoins = async (value, update) => {
  filterOptions(value, 'coins', (data) => {
    update(() => {
      coins.value = data
    })
  })
}

const filterPrinters = async (value, update) => {
  filterOptions(value, 'printers', (data) => {
    update(() => {
      printers.value = data
    })
  })
}

const filterClients = async (value, update) => {
  filterOptions(value, 'clients', (data) => {
    update(() => {
      clients.value = data
    })
  })
}

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

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const onSubmitConfig = async () => {
  try {
    loading.value = true

    // Si estamos en el paso 2 (Sucursal), guardamos la configuración de la sucursal
    if (step.value === 2) {
      const payload = {
        branch_office_id: branchOffice.value.id,
        point_of_sale: companyConfig.value.point_of_sale,
        default_price_list: companyConfig.value.other.default_price_list
      }
      // Enviamos la configuración al nuevo endpoint
      const { data } = await api.post('branch-office-configs', payload)

      // Actualizamos el estado de la sucursal en Pinia con la respuesta
      store.setBranchOffice(data)
    } else {
      // Lógica de guardado para los otros pasos (configuración general de la empresa)
      const { data } = await api.post('company-configs', {
        coin_id: companyConfig.value?.coin?.id,
        type_of_service_id: companyConfig.value?.typeOfService?.id,
        invoice_type_id: companyConfig.value?.invoiceType?.id,
        payment_method_id: companyConfig.value?.paymentMethod?.id,
        client_id: companyConfig.value?.client?.id,
        printer_id: companyConfig.value?.printer?.id,
        is_table: companyConfig.value?.is_table,
        other: {
          ...companyConfig.value?.other
        },
        point_of_sale: companyConfig.value?.point_of_sale
      })
      store.setCompanySession({
        ...company.value,
        company_config: data
      })
    }

    notify('Guardado exitosamente', 'positive', 'check_circle')

    // Avanzar al siguiente paso
    step.value = getNextStep(step.value)
  } catch (error) {
    notify(error.message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Handle address selection from AddressComponent
 * @param {Object} selectedAddress - The selected address object
 */
const handleAddressSelected = (selectedAddress) => {
  // Si la dirección es nula, reiniciar el objeto de dirección
  if (!selectedAddress) {
    address.value = null
    formattedAddress.value = ''
    company.value.address = ''
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

  // Actualizar el campo de dirección de la empresa
  company.value.address = formattedAddress.value

  console.log('📍 Dirección seleccionada:', {
    formatted: formattedAddress.value,
    coordinates: {
      lat: address.value?.latitude,
      lng: address.value?.longitude
    }
  })
}
</script>

<style scoped>
.minimalist-config {
  min-height: 100vh;
  padding: 0;
}

.config-container {
  max-width: 850px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* Progress Header */
.progress-header {
  text-align: center;
  margin-bottom: 2rem;
}

.main-title {
  font-size: 2.25rem;
  margin: 0 0 0.5rem 0;
}

.main-subtitle {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  font-weight: 400;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.progress-bar {
  width: 200px;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--q-primary) 0%, #3b82f6 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 50px;
}

/* Steps Navigation */
.steps-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.step-nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 50px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-nav-item:hover {
  border-color: var(--q-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-nav-item.active {
  background: var(--q-primary);
  color: white;
  border-color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.3);
}

.step-nav-item.completed {
  background: #10b981;
  color: white;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.step-nav-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-nav-label {
  font-weight: 500;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-card {
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

.step-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.step-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.step-header p {
  font-size: 0.95rem;
  margin: 0;
}

/* Form Styles */
.step-form {
  max-width: 650px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 5px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-label, .upload-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.upload-label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.custom-input {
  border-radius: 8px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 8px;
}

.custom-editor {
  border-radius: 8px;
}

.custom-editor :deep(.q-editor__content) {
  border-radius: 0 0 8px 8px;
}

.checkbox-group {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.checkbox-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
}

/* Logo Section */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.logo-preview {
  position: relative;
  width: 480px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #e2e8f0;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.logo-preview:hover {
  border-color: var(--q-primary);
  transform: scale(1.02);
}

.logo-image {
  width: 100%;
  height: 100%;
}

.logo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Banner Section */
.banner-section {
  margin-bottom: 1.5rem;
}

.banner-preview {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #e2e8f0;
  transition: all 0.2s ease;
}

.banner-preview:hover {
  border-color: var(--q-primary);
  transform: scale(1.01);
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Upload Section */
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--q-primary);
  transform: translateY(-1px);
}

.upload-area h3 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-area p {
  margin: 0;
  font-size: 0.8rem;
}

/* Files Section */
.files-section {
  margin-bottom: 1rem;
}

/* Schedule Section */
.schedule-section {
  margin-bottom: 1.5rem;
}

/* Integration Section */
.integration-wrapper {
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

/* Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  min-width: 100px;
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  font-size: 0.8rem;
  box-shadow: 0 1px 4px rgba(var(--q-primary-rgb), 0.2);
}

.action-btn-secondary {
  color: #64748b;
  font-weight: 500;
  text-transform: none;
  font-size: 0.8rem;
}

.action-btn-secondary:hover {
  color: var(--q-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .config-container {
    padding: 1rem 0.75rem;
  }

  .main-title {
    font-size: 1.75rem;
  }

  .step-card {
    padding: 1.5rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .steps-nav {
    gap: 0.25rem;
  }

  .step-nav-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .step-nav-label {
    display: none;
  }

  .step-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .action-btn {
    width: 100%;
  }

  .logo-preview {
    width: 160px;
    height: 90px;
  }

  .upload-area {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .progress-bar-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-bar {
    width: 180px;
  }
}
</style>
