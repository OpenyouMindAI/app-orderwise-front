<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="modern-company-setup-dialog">
      <!-- Header moderno -->
      <q-card-section class="company-setup-header relative-position">

        <div class="header-content">
          <div class="setup-icon-wrapper">
            <q-icon name="business_center" size="28px" class="setup-icon" />
          </div>
          <div class="text-h6 text-weight-bold q-mt-xs">Configura tu Empresa</div>
          <div class="text-caption text-grey-7">Completa la información o usa tus datos personales</div>
        </div>
      </q-card-section>
      <q-card-section class="setup-body-section">
        <q-form @submit="setupCompany">
          <!-- Nombre de la empresa -->
          <div class="input-container">
            <q-input
              v-model="form.company_name"
              placeholder="Nombre de la Empresa *"
              borderless
              class="custom-input"
              hide-bottom-space
              :rules="[val => !!val || 'El nombre es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Documento -->
          <div class="input-container">
            <q-input
              v-model="form.company_document"
              placeholder="Documento (Ej: 20-12345678-9) *"
              borderless
              class="custom-input"
              hide-bottom-space
              :rules="[val => !!val || 'El documento es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- Teléfono con Selector de País -->
          <div class="input-container phone-input-container">
            <div class="row">
              <!-- País -->
              <div class="col-4">
                <q-select
                  v-model="selectedCountry"
                  :options="countryOptions"
                  option-label="label"
                  class="custom-input country-select"
                  hide-bottom-space
                  emit-value
                  map-options
                  behavior="menu"
                  popup-content-class="country-dropdown"
                  dense
                  borderless
                  hide-dropdown-icon
                >
                  <template v-slot:selected>
                    <div class="row items-center no-wrap">
                      <span class="country-flag q-mr-xs">{{ selectedCountry ? selectedCountry.flag : '🌍' }}</span>
                      <span class="text-caption ellipsis">{{ selectedCountry ? selectedCountry.code : '' }}</span>
                    </div>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-item-label style="font-size: 20px">{{ scope.opt.flag }}</q-item-label>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Input Teléfono -->
              <div class="col-8 q-pl-sm">
                <q-input
                  v-model="form.company_phone"
                  placeholder="Teléfono (Ej: 11 1234 5678) *"
                  borderless
                  class="custom-input"
                  :rules="phoneRule"
                  :mask="selectedCountry?.mask"
                  unmasked-value
                  type="tel"
                  hide-bottom-space
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" size="20px"/>
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="input-container">
            <q-input
              v-model="form.company_email"
              placeholder="Email de la Empresa *"
              type="email"
              borderless
              class="custom-input"
              hide-bottom-space
              :rules="[
                val => !!val || 'El email es requerido',
                val => /.+@.+\..+/.test(val) || 'Email inválido'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" size="20px"/>
              </template>
            </q-input>
          </div>

          <!-- País (API) -->
          <div class="input-container">
            <q-select
              v-model="form.country_id"
              :options="countries"
              option-label="name"
              option-value="id"
              :placeholder="!form.country_id ? 'Seleccione el País *' : ''"
              class="custom-input"
              use-input
              input-debounce="300"
              @filter="filterCountries"
              hide-bottom-space
              behavior="menu"
              borderless
              emit-value
              map-options
              :rules="[val => !!val || 'El país es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="public" color="primary" size="20px"/>
              </template>
            </q-select>
          </div>

          <!-- Dirección con AddressComponent -->
          <div class="input-container">
            <AddressComponent
              :initial-address="companyAddressData"
              @address-selected="handleCompanyAddressSelected"
              label="Dirección fiscal"
              is-custom-styled
            />
          </div>
          <q-btn
            label="Crear Empresa"
            color="primary"
            icon-right="rocket_launch"
            type="submit"
            :loading="loading"
            unelevated
            no-caps
            class="full-width setup-submit-btn"
          />
          <q-btn
            flat
            label="Omitir por ahora"
            color="grey-7"
            icon="skip_next"
            class="full-width q-mt-sm skip-btn"
            @click="skipSetup"
            :disable="loading"
            :loading="loadingSkip"
            no-caps
          >
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
              Usar mis datos personales como información empresarial
            </q-tooltip>
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { notify, notifyValidationErrors } from 'src/const/mixins'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'
import { usePixel } from 'src/composables/usePixel'
import { authentication } from 'src/stores/module-authentication'
import { countryOptions } from 'src/const/countries'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userEmail: {
    type: String,
    default: ''
  },
  initialBusinessData: {
    type: Object,
    default: () => ({})
  },
  registrationData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'next', 'success'])
const fbq = usePixel()
const authStore = authentication()

// State
const loading = ref(false)
const loadingSkip = ref(false)
const countries = ref([])

// Form data
const form = ref({
  company_name: '',
  company_document: '',
  company_email: props.userEmail || '',
  company_phone: '',
  company_address: '',
  country_id: null,
  copy_test_products: false
})

// Country code selector
// Country code selector
const selectedCountry = ref(countryOptions[0])

// Phone validation rule
const phoneRule = computed(() => {
  return [
    val => !!val || 'El teléfono es requerido',
    val => {
      if (!val || !selectedCountry.value || !selectedCountry.value.mask) return true
      const digitsOnly = val.replace(/\D/g, '')
      const expectedDigits = selectedCountry.value.mask.replace(/[^#]/g, '').length
      return digitsOnly.length >= expectedDigits || `Se requieren ${expectedDigits} dígitos`
    }
  ]
})
// Address data for AddressComponent
const companyAddressData = ref({
  name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  latitude: null,
  longitude: null,
  formattedAddress: '',
  placeId: '',
  types: []
})

/**
 * Handle company address selected from AddressComponent
 */
const handleCompanyAddressSelected = (addressDetails) => {
  if (addressDetails) {
    companyAddressData.value = { ...addressDetails }
    form.value.company_address = addressDetails.formattedAddress || addressDetails.street || ''
  } else {
    companyAddressData.value = {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: null,
      longitude: null,
      formattedAddress: '',
      placeId: '',
      types: []
    }
    form.value.company_address = ''
  }
}

/**
 * Filter countries from API on demand
 */
const filterCountries = async (val, update, abort) => {
  try {
    const { data } = await api.get('countries', {
      params: { dataSearch: { name: val } }
    })
    update(() => {
      countries.value = data.data || data
    })
  } catch (error) {
    console.error('Error loading countries:', error)
    if (abort) abort()
  }
}

/**
 * Handle Next Step (emit data to parent for second modal)
 */

/**
 * Setup company directly (only used by skipSetup)
 */
const setupCompany = async () => {
  try {
    loading.value = true

    const payload = {
      ...form.value,
      business_type_id: props.initialBusinessData?.business_type_id || null,
      company_phone: form.value.company_phone
        ? `${selectedCountry.value?.code || ''}${form.value.company_phone}`.trim()
        : ''
    }

    const { data } = await api.post('authentication/setup-company', payload)

    notify('Empresa configurada exitosamente', 'positive', 'check_circle')
    emit('success', data)
    emit('update:modelValue', false)

    // Pixel Event
    if (fbq?.event) {
      fbq.event('CrearEmpresa', {
        business_type: props.initialBusinessData?.business_type_name,
        country: selectedCountry.value?.label,
        company_name: form.value.company_name
      })
    }
  } catch (error) {
    notifyValidationErrors(error, 'Error al configurar empresa')
  } finally {
    loading.value = false
  }
}

/**
 * Skip setup execution with auto-filled data from registration form
 */
const skipSetup = async () => {
  try {
    loadingSkip.value = true

    // Obtener datos del usuario desde el store
    const user = authStore.userGetter || {}

    // Priorizar datos del formulario de registro si están disponibles
    const registrationData = props.registrationData || {}

    // Construir nombre completo de la empresa desde datos de registro
    const firstName = registrationData.name || user.name || ''
    const lastName = registrationData.last_name || user.last_name || ''
    const companyName = `${firstName} ${lastName}`.trim() || 'Mi Empresa'

    // Obtener email desde props o datos de registro
    const email = props.userEmail || registrationData.email || user.email || ''

    // Obtener teléfono completo (con código de país) desde datos de registro
    const phoneNumber = registrationData.phone_number || user.phone_number || user.phone || null

    // Construir payload con datos del formulario de registro
    const payload = {
      company_name: companyName,
      company_document: null, // Dejar en null como solicitado
      company_email: email,
      company_phone: phoneNumber, // Ya viene con código de país del registro
      company_address: null, // Dejar en null
      business_type_id: props.initialBusinessData?.business_type_id || null,
      country_id: null, // Dejar en null
      copy_test_products: false
    }

    console.log('📤 Enviando setup con datos de registro:', payload)

    // Enviar directamente al backend sin validaciones del formulario
    const { data } = await api.post('authentication/setup-company', payload)

    console.log('✅ Setup completado exitosamente:', data)

    notify('Configuración completada exitosamente', 'positive', 'check_circle')

    // Emitir evento de éxito y cerrar modal
    emit('success', data)
    emit('update:modelValue', false)

    // Pixel Event
    if (fbq?.event) {
      fbq.event('CrearEmpresa', {
        business_type: 'skipped',
        country: 'not_specified',
        company_name: payload.company_name,
        setup_method: 'skip'
      })
    }
  } catch (error) {
    console.error('❌ Error al omitir configuración:', error)
    const errorMessage = error.response?.data?.message || 'No se pudo completar la configuración. Intente completarla manualmente.'
    notify(errorMessage, 'negative', 'warning')
  } finally {
    loadingSkip.value = false
  }
}

// Sync userEmail prop
watch(() => props.userEmail, (newVal) => {
  if (newVal) form.value.company_email = newVal
})

watch(() => props.modelValue, (val) => {
  if (val && countries.value.length === 0) {
    filterCountries('', (cb) => cb())
  }
})

onMounted(() => {
  if (props.modelValue) {
    filterCountries('', (cb) => cb())
  }
})
</script>

<style scoped>
.modern-company-setup-dialog {
  width: 90%;
  max-width: 420px;
  border-radius: 20px;
  overflow: hidden;
  animation: dialogEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dialogEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.company-setup-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 24px 8px;
  text-align: center;
}

.body--dark .company-setup-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeInDown 0.6s ease-out 0.2s backwards;
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.setup-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  margin-bottom: 8px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  }
}

.setup-icon {
  color: white;
}

.setup-body-section {
  padding: 12px 24px 16px !important;
  max-height: 65vh;
  overflow-y: auto;
}

.input-container {
  margin-bottom: 1rem;
}

/* Estilos unificados para inputs */
.custom-input :deep(.q-field__control),
.custom-input :deep(.q-field__native) {
  min-height: 44px !important;
  height: 44px !important;
  max-height: 44px !important;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 12px;
  display: flex !important;
  align-items: center !important;
}

.body--dark .custom-input :deep(.q-field__control) {
  background: #1f2937;
  border-color: #374151;
}

.custom-input :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.body--dark .custom-input :deep(.q-field__control):hover {
  background: #1f2937;
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-1px);
}

.body--dark .custom-input :deep(.q-field__control):focus-within {
  background: #1f2937;
}

.custom-input :deep(.q-field__native) {
  color: #1f2937;
  font-size: 14px;
}

.body--dark .custom-input :deep(.q-field__native) {
  color: #f3f4f6;
}

.setup-submit-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: none !important;
}

.setup-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.skip-btn {
  height: 44px;
  font-size: 14px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.skip-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.body--dark .skip-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Phone input adjustments */
.phone-input-container .country-select :deep(.q-field__control) {
  padding-left: 12px;
  padding-right: 4px;
}

.phone-input-container .row {
  margin: 0;
}

/* Country Flag Styling */
.country-flag {
  font-size: 20px;
  color: rgba(0, 0, 0, 1) !important;
}

@media (max-width: 768px) {
  .modern-company-setup-dialog {
    width: 95vw;
    max-width: 95vw;
  }

  .company-setup-header {
    padding: 20px 24px 8px;
  }

  .setup-icon-wrapper {
    width: 48px;
    height: 48px;
  }
}
</style>
