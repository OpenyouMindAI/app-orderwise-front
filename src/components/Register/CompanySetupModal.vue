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
      <q-card-section class="company-setup-header">
        <div class="header-content text-white">
          <div class="setup-icon-wrapper">
            <q-icon name="business_center" size="28px" class="setup-icon" />
          </div>
          <div class="text-h6 text-weight-bold q-mt-xs">Configura tu Empresa</div>
          <div class="text-caption">Completa la información para comenzar</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md" style="max-height: 60vh; overflow-y: auto;">
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

          <!-- Rubro -->
          <div class="input-container">
            <q-select
              v-model="form.business_type"
              :options="businessTypes"
              option-label="name"
              option-value="id"
              placeholder="Rubro / Tipo de Negocio *"
              class="custom-input"
              use-input
              input-debounce="500"
              @filter="loadBusinessTypes"
              :rules="[val => !!val || 'El rubro es requerido']"
              hide-bottom-space
              behavior="menu"
              borderless
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" size="20px"/>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Checkbox de copiar productos -->
          <div class="input-container">
            <q-checkbox
              v-model="form.copy_test_products"
              label="Copiar productos y categorías de ejemplo"
              color="primary"
            >
              <q-tooltip class="bg-grey-8">
                Te ayudará a empezar más rápido con datos de prueba del mismo rubro
              </q-tooltip>
            </q-checkbox>
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
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Footer con botones -->
      <q-card-actions class="q-pa-md">
        <q-space />
        <q-btn
          label="Crear Empresa"
          color="primary"
          icon-right="rocket_launch"
          @click="setupCompany"
          :loading="loading"
          unelevated
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { notify, notifyValidationErrors } from 'src/const/mixins'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  userEmail: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// State
const loading = ref(false)

// Form data
const form = ref({
  company_name: '',
  company_document: '',
  company_email: props.userEmail || '',
  company_phone: '',
  company_address: '',
  business_type: null,
  copy_test_products: false
})

// Country selector
const selectedCountry = ref(null)
const countryOptions = [
  { label: 'Argentina', code: '+54', mask: '## #### ####', regex: /^(?:(?:00)?549?)?0?[1-9]\d{9}$/, flag: '🇦🇷' },
  { label: 'Chile', code: '+56', mask: '#########', regex: /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/, flag: '🇨🇱' },
  { label: 'México', code: '+52', mask: '## #### ####', regex: /^(\+?52)?\s?1?\s?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}$/, flag: '🇲🇽' },
  { label: 'Colombia', code: '+57', mask: '### ### ####', regex: /^(\+?57)?\s?3[\d]{9}$/, flag: '🇨🇴' },
  { label: 'Perú', code: '+51', mask: '### ### ###', regex: /^(\+?51)?\s?9[\d]{8}$/, flag: '🇵🇪' },
  { label: 'Uruguay', code: '+598', mask: '## ### ###', regex: /^(\+?598)?\s?9[\d]{7}$/, flag: '🇺🇾' },
  { label: 'Venezuela', code: '+58', mask: '### ### ####', regex: /^(\+?58)?\s?4[\d]{9}$/, flag: '🇻🇪' },
  { label: 'España', code: '+34', mask: '### ### ###', regex: /^(\+?34)?\s?[679]\d{8}$/, flag: '🇪🇸' },
  { label: 'Otro', code: '', mask: '', regex: /.+/, flag: '🌍' }
]

// Set default country
selectedCountry.value = countryOptions[0]

// Phone validation rule
const phoneRule = computed(() => {
  return [
    val => {
      if (!val) return 'El teléfono es requerido'
      if (!selectedCountry.value || !selectedCountry.value.regex) return true
      return selectedCountry.value.regex.test(val) || 'Formato inválido'
    }
  ]
})

// Business types
const businessTypes = ref([])

// Address data
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
 * Load business types
 */
const loadBusinessTypes = async (val, update, abort) => {
  if (val === '' || val === null) {
    update(() => {
      businessTypes.value = []
    })
    return
  }

  try {
    const { data } = await api.get('business-types', {
      params: {
        search: val
      }
    })
    update(() => {
      businessTypes.value = data
    })
  } catch (error) {
    console.error('Error loading business types:', error)
    abort()
  }
}
/**
 * Handle company address selected
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
 * Setup company
 */
const setupCompany = async () => {
  try {
    loading.value = true

    // Preparar payload con business_type_id
    const payload = {
      ...form.value,
      business_type_id: form.value.business_type?.id,
      company_phone: form.value.company_phone
        ? `${selectedCountry.value?.code || ''}${form.value.company_phone}`.trim()
        : ''
    }

    await api.post('authentication/setup-company', payload)

    notify('Empresa configurada exitosamente', 'positive', 'check_circle')

    // Emitir evento de éxito
    emit('success')

    // Cerrar modal
    emit('update:modelValue', false)
  } catch (error) {
    notifyValidationErrors(error, 'Error al configurar empresa')
  } finally {
    loading.value = false
  }
}

// Watch para limpiar estado cuando el modal se cierra
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    // Limpiar business types cuando se cierra para evitar problemas de rendimiento
    businessTypes.value = []
  } else {
    // Pre-llenar email cuando se abre
    if (props.userEmail) {
      form.value.company_email = props.userEmail
    }
  }
})

onMounted(() => {
  if (props.userEmail) {
    form.value.company_email = props.userEmail
  }
})
</script>

<style scoped>
/* Dialog Card */
.modern-company-setup-dialog {
  width: 90%;
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  transform: translateZ(0);
  will-change: transform, opacity;
}

/* Header */
.company-setup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 5px 3px;
  text-align: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.setup-icon-wrapper {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.setup-icon {
  color: white;
}

/* Input Container */
.input-container {
  margin-bottom: 12px;
}

/* Custom Input */
.custom-input :deep(.q-field__control) {
  background: #f3f4f6 !important;
  border: none !important;
  border-radius: 8px;
  height: 48px;
  min-height: 48px;
  padding: 0 12px;
  transition: background 0.2s ease;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
}

.custom-input :deep(.q-field__control):before,
.custom-input :deep(.q-field__control):after {
  display: none !important;
}

.custom-input :deep(.q-field__native) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
  color: #1f2937;
  font-size: 14px;
  line-height: 1;
}

.custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
  opacity: 0.7;
}

.custom-input :deep(.q-field__control):hover {
  background: #e5e7eb !important;
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15) !important;
}

.custom-input :deep(.q-field__prepend),
.custom-input :deep(.q-field__append) {
  height: 48px !important;
  min-height: 48px !important;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

/* Phone input container */
.phone-input-container .country-select :deep(.q-field__control) {
  padding-left: 12px;
  padding-right: 4px;
}

.phone-input-container .row {
  margin: 0;
}

/* Country Flag */
.country-flag {
  font-size: 20px;
  color: rgba(0, 0, 0, 1) !important;
}

/* Submit Button */
.setup-submit-btn {
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none !important;
  text-transform: none !important;
}

.setup-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.setup-submit-btn:active {
  transform: translateY(0);
}

/* Dark mode support */
.body--dark .modern-company-setup-dialog {
  background: #1e1e1e;
}

.body--dark .custom-input :deep(.q-field__control) {
  background: #374151 !important;
}

.body--dark .custom-input :deep(.q-field__control):hover {
  background: #4b5563 !important;
}

.body--dark .custom-input :deep(.q-field__control):focus-within {
  background: #1f2937 !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

.body--dark .custom-input :deep(.q-field__native) {
  color: #f3f4f6;
}

.body--dark .custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 600px) {
  .modern-company-setup-dialog {
    max-width: 95%;
  }

  .company-setup-header {
    padding: 20px 16px;
  }

  .setup-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .input-container {
    margin-bottom: 8px;
  }

  .custom-input :deep(.q-field__control) {
    height: 42px;
  }

  .setup-submit-btn {
    height: 42px;
  }
}
</style>
