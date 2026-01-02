<template>
  <div class="register-container">
    <!-- Fondo animado -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Card principal -->
    <div class="register-card">
      <!-- Logo -->
      <div class="logo-section">
        <q-img :src="qBitsLogo.black" class="logo-img"/>
      </div>

      <!-- Título -->
      <div class="header-section">
        <span class="welcome-title">Crear cuenta</span>
        <p class="welcome-subtitle">Regístrate para comenzar</p>
      </div>

      <!-- Formulario -->
      <q-form @submit="register" class="register-form">
        <!-- Input Nombre -->
        <div class="input-container">
          <q-input
            v-model="form.name"
            placeholder="Nombre completo"
            dark
            class="custom-input"
            hide-bottom-space
            :rules="[val => !!val || 'El nombre es requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" size="20px"/>
            </template>
          </q-input>
        </div>

        <!-- Input Email -->
        <div class="input-container">
          <q-input
            v-model="form.email"
            type="email"
            placeholder="Correo electrónico"
            dark
            class="custom-input"
            hide-bottom-space
            :rules="[
              val => !!val || 'El correo es requerido',
              val => /.+@.+\..+/.test(val) || 'Correo inválido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" size="20px"/>
            </template>
          </q-input>
        </div>

        <!-- Input Teléfono -->
        <div class="input-container phone-input-container">
          <div class="row">
            <!-- País -->
            <div class="col-4">
              <q-select
                v-model="selectedCountry"
                :options="countryOptions"
                option-label="label"
                dark
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

            <!-- Teléfono -->
            <div class="col-8 q-pl-sm">
              <q-input
                v-model="form.phone_number"
                placeholder="Teléfono"
                dark
                class="custom-input"
                hide-bottom-space
                type="tel"
                :rules="phoneRule"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" size="20px"/>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Input Contraseña -->
        <div class="input-container">
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            dark
            class="custom-input"
            hide-bottom-space
            :rules="[
              val => !!val || 'La contraseña es requerida',
              val => val.length >= 8 || 'Mínimo 8 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" size="20px"/>
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                color="grey-5"
                size="20px"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>

        <!-- Input Confirmar Contraseña -->
        <div class="input-container">
          <q-input
            v-model="form.password_confirmation"
            :type="showPasswordConfirm ? 'text' : 'password'"
            placeholder="Confirmar contraseña"
            dark
            class="custom-input"
            hide-bottom-space
            :rules="[
              val => !!val || 'Confirma tu contraseña',
              val => val === form.password || 'Las contraseñas no coinciden'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" size="20px"/>
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPasswordConfirm ? 'visibility' : 'visibility_off'"
                color="grey-5"
                size="20px"
                class="cursor-pointer"
                @click="showPasswordConfirm = !showPasswordConfirm"
              />
            </template>
          </q-input>
        </div>

        <!-- Botón Registrarse -->
        <q-btn
          type="submit"
          color="primary"
          class="register-btn"
          :loading="loading"
          :disable="loading"
          unelevated
          no-caps
          size="lg"
        >
          <q-icon name="person_add" size="20px" class="q-mr-sm"/>
          Registrarse
        </q-btn>

        <!-- Divider -->
        <div class="divider-container">
          <div class="divider-line"></div>
          <span class="divider-text">O regístrate con</span>
          <div class="divider-line"></div>
        </div>

        <!-- Botón Google -->
        <button type="button" class="social-btn google-btn" @click="registerWithGoogle" :disabled="loadingGoogle || loading">
          <q-spinner v-if="loadingGoogle" color="grey-8" size="18px"/>
          <template v-else>
            <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </template>
        </button>

        <!-- Link a Login -->
        <div class="register-link-container">
          <span class="register-text">¿Ya tienes cuenta? </span>
          <router-link to="/login" class="register-link">Inicia sesión</router-link>
        </div>
      </q-form>

      <!-- Footer -->
      <div class="footer-container">
        <q-icon name="laptop_mac" size="18px" color="grey-6"/>
        <span class="footer-text">Powered by</span>
        <a href="https://site.qbitsinc.com" target="_blank">
          <q-img :src="qBitsLogo.black" class="qbits-logo"/>
        </a>
      </div>
    </div>

    <!-- Modal de Setup de Empresa -->
    <!-- Modal de selección: Demo o Registrar Empresa -->
    <q-dialog v-model="showCompanyOptions" persistent transition-show="scale" transition-hide="scale">
      <q-card class="modern-options-dialog">
        <!-- Header minimalista -->
        <q-card-section class="options-header">
          <div class="header-content">
            <div class="welcome-icon-wrapper">
              <q-icon name="celebration" size="32px" class="welcome-icon" />
            </div>
            <div class="text-h5 text-weight-bold q-mt-sm">¡Bienvenido!</div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs">Elige cómo quieres comenzar</div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="row q-col-gutter-lg">
            <!-- Opción: Ver Demo -->
            <div class="col-12 col-md-6">
              <div class="modern-option-card demo-card" @click="selectDemoOption">
                <div class="option-icon-wrapper demo-icon">
                  <q-icon name="visibility" size="40px" />
                </div>
                <div class="option-content">
                  <div class="option-title">Ver Demo</div>
                  <div class="option-description">
                    Explora el sistema con datos de ejemplo
                  </div>
                </div>
                <div class="option-badge demo-badge">
                  <q-icon name="rocket_launch" size="16px" />
                  <span>Rápido</span>
                </div>
                <div class="option-arrow">
                  <q-icon name="arrow_forward" size="24px" />
                </div>
              </div>
            </div>

            <!-- Opción: Registrar Mi Empresa -->
            <div class="col-12 col-md-6">
              <div class="modern-option-card business-card" @click="selectRegisterOption">
                <div class="option-icon-wrapper business-icon">
                  <q-icon name="business" size="40px" />
                </div>
                <div class="option-content">
                  <div class="option-title">Mi Empresa</div>
                  <div class="option-description">
                    Configura tu empresa y comienza ahora
                  </div>
                </div>
                <div class="option-badge business-badge">
                  <q-icon name="verified" size="16px" />
                  <span>Recomendado</span>
                </div>
                <div class="option-arrow">
                  <q-icon name="arrow_forward" size="24px" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de selección de rubro para demo -->
    <q-dialog v-model="showDemoBusinessTypeSelection" persistent transition-show="scale" transition-hide="scale">
      <q-card class="business-type-dialog">
        <!-- Header -->
        <q-card-section class="business-type-header">
          <div class="header-content">
            <div class="business-icon-wrapper">
              <q-icon name="store" size="28px" class="business-icon" />
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs">Selecciona tu Rubro</div>
            <div class="text-caption text-grey-7">Elige el tipo de negocio para la demo</div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Buscador -->
        <q-card-section class="q-pa-md">
          <q-input
            v-model="businessTypeSearch"
            placeholder="Buscar rubro..."
            filled
            dense
            clearable
            @update:model-value="searchBusinessTypes"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <!-- Grid de Cards -->
        <q-card-section class="q-pa-md" style="max-height: 50vh; overflow-y: auto;">
          <div class="row q-col-gutter-sm">
            <div
              v-for="(type, index) in filteredBusinessTypes"
              :key="type.id"
              class="col-12 col-sm-6"
            >
              <div
                class="business-type-card"
                :class="{ 'selected': demoBusinessType?.id === type.id }"
                @click="selectBusinessType(type)"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div class="business-type-icon">
                  <q-icon :name="getBusinessIcon(type.name)" size="32px" />
                </div>
                <div class="business-type-name">{{ type.name }}</div>
                <div class="business-type-check" v-if="demoBusinessType?.id === type.id">
                  <q-icon name="check_circle" size="24px" color="positive" />
                </div>
              </div>
            </div>
          </div>

          <!-- No results -->
          <div v-if="filteredBusinessTypes.length === 0" class="text-center q-pa-lg">
            <q-icon name="search_off" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">No se encontraron rubros</div>
            <div class="text-caption text-grey-5">Intenta con otra búsqueda</div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Footer -->
        <q-card-actions class="q-pa-md">
          <q-btn
            flat
            label="Volver"
            color="grey-7"
            icon="arrow_back"
            @click="backToOptions"
            no-caps
          />
          <q-space />
          <q-btn
            label="Continuar"
            color="primary"
            icon-right="arrow_forward"
            @click="assignDemo"
            :loading="loadingDemo"
            :disable="!demoBusinessType"
            unelevated
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de configuración de empresa -->
    <q-dialog v-model="showCompanySetup" persistent transition-show="scale" transition-hide="scale">
      <q-card class="modern-company-setup-dialog">
        <!-- Header moderno -->
        <q-card-section class="company-setup-header">
          <div class="header-content">
            <div class="setup-icon-wrapper">
              <q-icon name="business_center" size="28px" class="setup-icon" />
            </div>
            <div class="text-h6 text-weight-bold q-mt-xs">Configura tu Empresa</div>
            <div class="text-caption text-grey-7">Completa la información para comenzar</div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md" style="max-height: 60vh; overflow-y: auto;">
          <q-form @submit="setupCompany">
            <!-- Nombre de la empresa -->
            <div class="input-container">
              <q-input
                v-model="companyForm.company_name"
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
                v-model="companyForm.company_document"
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
                    v-model="companyForm.company_phone"
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
                v-model="companyForm.company_email"
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
                v-model="companyForm.business_type"
                :options="businessTypes"
                option-label="name"
                option-value="id"
                placeholder="Rubro / Tipo de Negocio *"
                class="custom-input"
                use-input
                input-debounce="300"
                @filter="filterBusinessTypes"
                :rules="[val => !!val || 'El rubro es requerido']"
                hide-bottom-space
                behavior="menu"
                borderless
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
                v-model="companyForm.copy_test_products"
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
          <q-btn
            flat
            label="Volver"
            color="grey-7"
            icon="arrow_back"
            @click="backToOptions"
            :disable="loadingCompanySetup"
            no-caps
          />
          <q-space />
          <q-btn
            label="Crear Empresa"
            color="primary"
            icon-right="rocket_launch"
            @click="setupCompany"
            :loading="loadingCompanySetup"
            unelevated
            no-caps
            class="setup-submit-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { qBitsLogo, notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import AddressComponent from 'src/components/Billing/AddressComponent.vue'

const router = useRouter()
const store = authentication()
const $q = useQuasar()

// Form data
const form = ref({
  name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: ''
})

// UI state
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const loadingGoogle = ref(false)
const showCompanySetup = ref(false)

// Company setup form
const companyForm = ref({
  company_name: '',
  company_document: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  business_type: null,
  copy_test_products: false
})

const businessTypes = ref([])
const loadingCompanySetup = ref(false)
const isGoogleRegister = ref(false)
const showCompanyOptions = ref(false)
const showDemoBusinessTypeSelection = ref(false)
const demoBusinessType = ref(null)
const loadingDemo = ref(false)
const registeredCredentials = ref({
  email: '',
  password: ''
})

// Validation & Country Data
const selectedCountry = ref(null)
const countryOptions = [
  { label: 'Argentina', code: '+54', mask: '## #### ####', regex: /^(?:(?:00)?549?)?0?[1-9]\d{9}$/, flag: '🇦🇷' },
  { label: 'Chile', code: '+56', mask: '#########', regex: /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/, flag: '🇨🇱' },
  { label: 'México', code: '+52', mask: '## #### ####', regex: /^(\+?52)?\s?1?\s?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}$/, flag: '🇲🇽' },
  { label: 'Colombia', code: '+57', mask: '### ### ####', regex: /^(\+?57)?\s?3[\d]{9}$/, flag: '🇨🇴' },
  { label: 'Perú', code: '+51', mask: '### ### ###', regex: /^(\+?51)?\s?9[\d]{8}$/, flag: '🇵🇪' },
  { label: 'Uruguay', code: '+598', mask: '## ### ###', regex: /^(\+?598)?\s?9[\d]{7}$/, flag: '🇺🇾' },
  { label: 'España', code: '+34', mask: '### ### ###', regex: /^(\+?34)?\s?[679]\d{8}$/, flag: '🇪🇸' },
  { label: 'Otro', code: '', mask: '', regex: /.+/, flag: '🌍' }
]

// Set default country (e.g., Argentina as base)
selectedCountry.value = countryOptions[0]

// Phone validation rule
const phoneRule = computed(() => {
  return [
    val => !!val || 'El teléfono es requerido',
    val => {
      if (!val) return true // Permitir vacío si no es obligatorio (aunque arriba dice required)
      if (!selectedCountry.value || !selectedCountry.value.regex) return true
      return selectedCountry.value.regex.test(val) || `Formato inválido (Ej: ${selectedCountry.value.mask.replace(/#/g, '0')})`
    }
  ]
})

// Company address data
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

// Business type search
const businessTypeSearch = ref('')
const filteredBusinessTypes = computed(() => {
  if (!businessTypeSearch.value) {
    return businessTypes.value
  }
  const search = businessTypeSearch.value.toLowerCase()
  return businessTypes.value.filter(type =>
    type.name.toLowerCase().includes(search)
  )
})

/**
 * Filter business types
 */
const filterBusinessTypes = async (value, update) => {
  try {
    const { data } = await api.get('business-types', {
      params: { search: value }
    })
    update(() => {
      businessTypes.value = data.data || data
    })
  } catch (error) {
    console.error('Error loading business types:', error)
    update(() => {
      businessTypes.value = []
    })
  }
}

/**
 * Load business types when opening modal
 */
const loadBusinessTypes = async () => {
  try {
    const { data } = await api.get('business-types')
    businessTypes.value = data.data || data
  } catch (error) {
    console.error('Error loading business types:', error)
  }
}

/**
 * Search business types
 */
const searchBusinessTypes = (value) => {
  // El filtrado se hace automáticamente con el computed
}

/**
 * Select business type
 */
const selectBusinessType = (type) => {
  demoBusinessType.value = type
}

/**
 * Get icon for business type
 */
const getBusinessIcon = (name) => {
  const iconMap = {
    Restaurante: 'restaurant',
    Cafetería: 'local_cafe',
    Panadería: 'bakery_dining',
    Bar: 'local_bar',
    Supermercado: 'shopping_cart',
    'Tienda de Ropa': 'checkroom',
    Farmacia: 'local_pharmacy',
    Ferretería: 'hardware',
    Librería: 'menu_book',
    Tecnología: 'devices',
    Electrónica: 'electrical_services',
    Mueblería: 'chair',
    Joyería: 'diamond',
    Peluquería: 'content_cut',
    Gimnasio: 'fitness_center',
    Spa: 'spa',
    Hotel: 'hotel',
    Automotriz: 'directions_car',
    Construcción: 'construction',
    Educación: 'school',
    Salud: 'local_hospital',
    Belleza: 'face',
    Mascotas: 'pets',
    Deportes: 'sports_soccer',
    Juguetería: 'toys',
    Floristería: 'local_florist',
    Óptica: 'visibility',
    Fotografía: 'photo_camera',
    Imprenta: 'print',
    Lavandería: 'local_laundry_service'
  }

  // Buscar coincidencia parcial
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  // Icono por defecto
  return 'store'
}

/**
 * Handle company address selected
 */
const handleCompanyAddressSelected = (addressDetails) => {
  if (addressDetails) {
    // Guardar los detalles completos de la dirección
    companyAddressData.value = { ...addressDetails }
    // Actualizar el campo company_address con la dirección formateada
    companyForm.value.company_address = addressDetails.formattedAddress || addressDetails.street || ''
  } else {
    // Limpiar si se resetea la dirección
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
    companyForm.value.company_address = ''
  }
}

/**
 * Setup company with form data
 */
const setupCompany = async () => {
  try {
    loadingCompanySetup.value = true

    // Preparar payload con business_type_id
    const payload = {
      ...companyForm.value,
      business_type_id: companyForm.value.business_type?.id,
      company_phone: companyForm.value.company_phone
        ? `${selectedCountry.value?.code || ''}${companyForm.value.company_phone}`.trim()
        : ''
    }

    await api.post('authentication/setup-company', payload)

    notify('Empresa configurada exitosamente', 'positive', 'check_circle')

    // Cerrar modal
    showCompanySetup.value = false

    // Si fue registro con Google, ya tiene sesión activa, solo redirigir
    if (isGoogleRegister.value) {
      router.push({ name: 'CompanyConfig' })
    } else {
      // Hacer login automático con las credenciales guardadas
      await loginAfterCompanySetup()
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Error al configurar empresa'
    notify(message, 'negative', 'warning')
  } finally {
    loadingCompanySetup.value = false
  }
}

/**
 * Login after company setup
 */
const loginAfterCompanySetup = async () => {
  try {
    const { data } = await api.post('authentication/login', {
      username: registeredCredentials.value.email,
      password: registeredCredentials.value.password
    })

    // Guardar token en localStorage
    localStorage.setItem('access_token', data.access_token)
    api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

    // Guardar sesión completa en el store
    store.setSessionData({
      user: data.user,
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in
    })

    notify('¡Bienvenido! Configura tu empresa', 'positive', 'check_circle')

    // Redirigir a configuración de empresa
    router.push({
      name: 'CompanyConfig'
    })
  } catch (error) {
    const message = error.response?.data?.message || 'Error al iniciar sesión'
    notify(message, 'negative', 'warning')
  }
}

/**
 * Register with email and password
 */
const register = async () => {
  try {
    loading.value = true

    // Preparar payload concatenando el código del país al número de teléfono
    const payload = {
      ...form.value,
      phone_number: form.value.phone_number
        ? `${selectedCountry.value?.code || ''}${form.value.phone_number}`.trim()
        : ''
    }

    const { data } = await api.post('authentication/register', payload)

    // Guardar token en localStorage INMEDIATAMENTE
    localStorage.setItem('access_token', data.access_token)
    api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

    notify('Registro exitoso', 'positive', 'check_circle')

    // Marcar que NO fue registro con Google
    isGoogleRegister.value = false

    // Guardar credenciales para login posterior
    registeredCredentials.value = {
      email: form.value.email,
      password: form.value.password
    }

    // Pre-llenar formulario de empresa
    companyForm.value.company_email = form.value.email
    companyForm.value.company_phone = form.value.phone_number || ''

    // Cargar business types
    await loadBusinessTypes()

    // Mostrar modal de opciones (Demo o Registrar)
    showCompanyOptions.value = true
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error al registrar usuario'
    notify(message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Select demo option
 */
const selectDemoOption = () => {
  showCompanyOptions.value = false
  showDemoBusinessTypeSelection.value = true
}

/**
 * Select register option
 */
const selectRegisterOption = () => {
  showCompanyOptions.value = false
  showCompanySetup.value = true
}

/**
 * Back to options
 */
const backToOptions = () => {
  // Cerrar todos los diálogos
  showDemoBusinessTypeSelection.value = false
  showCompanySetup.value = false

  // Mostrar opciones nuevamente
  showCompanyOptions.value = true

  // Limpiar formularios
  demoBusinessType.value = null
  companyForm.value = {
    company_name: '',
    company_document: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    business_type: null,
    copy_test_products: true
  }
}

/**
 * Assign demo company
 */
const assignDemo = async () => {
  try {
    loadingDemo.value = true

    const { data } = await api.post('authentication/assign-demo', {
      business_type_id: demoBusinessType.value.id
    })

    // Actualizar sesión completa en el store (igual que LoginPage)
    store.setSessionData(data)

    notify('¡Bienvenido a la demo!', 'positive', 'check_circle')

    // Cerrar modal
    showDemoBusinessTypeSelection.value = false

    // Redirigir según roles (igual que LoginPage)
    if (data.user?.is_root) {
      router.push({ name: 'Billing' })
    } else if (data.user?.roles?.length === 0) {
      notify('Usuario no tiene permisos', 'negative', 'warning')
    } else {
      router.push({ name: 'Tutorial' })
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Error al asignar empresa demo'
    notify(message, 'negative', 'warning')
  } finally {
    loadingDemo.value = false
  }
}

/**
 * Inicializar Google Auth para móvil
 */
const initializeGoogleAuthMobile = async () => {
  try {
    console.log('Initializing Google Auth for mobile...')
    console.log('Platform info:', {
      isNativeMobile: $q.platform.is.nativeMobile,
      isCapacitor: $q.platform.is.capacitor,
      hasCapacitor: !!window.Capacitor,
      platform: $q.platform
    })

    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '241900278304-roncn79359cb608lgg5fflfrgca544mk.apps.googleusercontent.com'
    console.log('Client ID:', clientId)

    await GoogleAuth.initialize({
      clientId,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true
    })

    console.log('Google Auth initialized successfully on mount')
  } catch (error) {
    console.error('Error initializing Google Auth on mount:', error)
    console.error('Init error details:', error.message)
  }
}

/**
 * Register with Google - Mobile
 */
const registerWithGoogleMobile = async () => {
  try {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

    console.log('GoogleAuth plugin loaded')
    console.log('Attempting Google sign in...')

    const result = await GoogleAuth.signIn()
    console.log('Google sign in result:', result)

    if (result && result.email) {
      const userInfo = {
        email: result.email,
        name: result.name || result.displayName,
        sub: result.id,
        picture: result.imageUrl
      }

      console.log('User info:', userInfo)

      // Codificar datos en base64
      const credential = btoa(JSON.stringify({
        email: userInfo.email,
        name: userInfo.name,
        google_id: userInfo.sub,
        picture: userInfo.picture
      }))

      // Registrar con backend
      const { data } = await api.post('authentication/register/google', {
        credential,
        name: userInfo.name,
        email: userInfo.email
      })

      // Guardar sesión completa en el store
      store.setSessionData(data)

      notify('Registro exitoso con Google', 'positive', 'check_circle')

      // Mostrar modal de setup de empresa
      if (data.needs_company_setup) {
        isGoogleRegister.value = true
        companyForm.value.company_email = userInfo.email
        await loadBusinessTypes()
        showCompanyOptions.value = true
      } else {
        router.push('/')
      }
    } else {
      loadingGoogle.value = false
      console.error('Invalid result from Google:', result)
      notify('No se pudo obtener información de Google', 'negative', 'warning')
    }
  } catch (error) {
    loadingGoogle.value = false
    console.error('Mobile Google register error:', error)
    console.error('Error message:', error.message)

    // Si el usuario canceló, no mostrar error
    if (error.message && (
      error.message.toLowerCase().includes('cancel') ||
      error.message.toLowerCase().includes('user_cancelled') ||
      error.code === 12501
    )) {
      console.log('User cancelled register')
      return
    }

    notify('Error al registrar con Google: ' + (error.message || 'Error desconocido'), 'negative', 'warning')
  }
}

/**
 * Register with Google
 */
const registerWithGoogle = async () => {
  try {
    loadingGoogle.value = true

    // Detectar si es móvil nativo (Capacitor)
    if ($q.platform.is.nativeMobile && window.Capacitor) {
      await registerWithGoogleMobile()
      return
    }

    // Web: Inicializar Google Sign-In
    if (!window.google) {
      notify('Error al cargar Google Sign-In', 'negative', 'warning')
      loadingGoogle.value = false
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        try {
          if (response.access_token) {
            // Obtener información del usuario
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            const userInfo = await userInfoResponse.json()

            // Codificar datos en base64
            const credential = btoa(JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              google_id: userInfo.sub,
              picture: userInfo.picture
            }))

            // Registrar con backend
            const { data } = await api.post('authentication/register/google', {
              credential,
              name: userInfo.name,
              email: userInfo.email
            })

            // Guardar sesión completa en el store (igual que LoginPage)
            store.setSessionData(data)

            notify('Registro exitoso con Google', 'positive', 'check_circle')

            // Mostrar modal de setup de empresa
            if (data.needs_company_setup) {
              // Marcar que fue registro con Google
              isGoogleRegister.value = true

              // Pre-llenar email de empresa con el email de Google
              companyForm.value.company_email = userInfo.email

              // Cargar business types
              await loadBusinessTypes()

              // Mostrar modal de opciones (Demo o Registrar)
              showCompanyOptions.value = true
            } else {
              router.push('/')
            }
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Error al registrar con Google'
          notify(message, 'negative', 'warning')
        } finally {
          loadingGoogle.value = false
        }
      }
    })

    client.requestAccessToken()
  } catch (error) {
    notify('Error al iniciar registro con Google', 'negative', 'warning')
    loadingGoogle.value = false
  }
}

/**
 * On mounted - Inicializar Google Auth
 */
onMounted(async () => {
  // Inicializar Google Auth para móvil si es Capacitor
  if ($q.platform.is.nativeMobile && window.Capacitor) {
    await initializeGoogleAuthMobile()
  }
})

</script>

<style scoped>

  /* Footer */
.footer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  animation: fadeIn 0.5s ease-out 1.2s backwards;
}

/* Logo */
.qbits-logo {
  width: 65px;
  display: inline-block;
}

/* Contenedor principal */
.register-container {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  background: transparent;
}

/* Fondo animado - Igual al LoginPage */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Formas decorativas del fondo */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: floatShape 20s ease-in-out infinite;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -10%;
  right: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  bottom: -10%;
  left: -10%;
  animation-delay: 7s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes floatShape {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* Card principal */
.register-card {
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 420px;
  padding: 20px 24px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 20px 60px rgba(102, 126, 234, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  animation: cardEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  margin: auto;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 8px;
  animation: fadeInDown 0.6s ease-out 0.2s backwards;
}

.logo-img {
  width: 140px;
  max-width: 70%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
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

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 16px;
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  font-family: 'Roboto', sans-serif;
}

.welcome-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.3px;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Formulario */
.register-form {
  animation: fadeIn 0.6s ease-out 0.4s backwards;
}

/* Inputs */
.input-container {
  margin-bottom: 1rem;
  animation: slideUp 0.5s ease-out backwards;
}

.input-container:nth-child(1) { animation-delay: 0.5s; }
.input-container:nth-child(2) { animation-delay: 0.6s; }
.input-container:nth-child(3) { animation-delay: 0.7s; }
.input-container:nth-child(4) { animation-delay: 0.8s; }
.input-container:nth-child(5) { animation-delay: 0.9s; }

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
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
  padding: 0 12px; /* Ajustado padding horizontal */
  display: flex !important;
  align-items: center !important;
}

.custom-input :deep(.q-field__control-container) {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

.custom-input :deep(.q-field__native) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex !important;
  align-items: center !important;
  color: #1f2937;
  font-size: 14px;
  line-height: 1; /* Para evitar que el texto afecte la altura */
}

.custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
}

.custom-input :deep(.q-field__control):hover {
  background: #ffffff;
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.custom-input :deep(.q-field__prepend),
.custom-input :deep(.q-field__append) {
  height: 44px !important;
  min-height: 44px !important;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

/* Botón Registrarse */
.register-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1s backwards;
  transition: all 0.3s ease;
  border: none !important;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.register-btn:active {
  transform: translateY(0);
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Divider */
.divider-container {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  animation: fadeIn 0.5s ease-out 1.1s backwards;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  padding: 0 16px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 400;
}

/* Botón Google */
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 20px;
  letter-spacing: 0.3px;
  margin-bottom: 12px;
  animation: fadeInUp 0.5s ease-out 1.2s backwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-btn {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  color: #374151;
}

.google-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

.google-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Modern Options Dialog */
.modern-options-dialog {
  min-width: 700px;
  max-width: 800px;
  border-radius: 24px;
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

.options-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 32px 32px;
  text-align: center;
}

.body--dark .options-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.header-content {
  animation: fadeInDown 0.6s ease-out 0.2s backwards;
}

.welcome-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }
}

.welcome-icon {
  color: white;
}

/* Modern Option Cards */
.modern-option-card {
  position: relative;
  padding: 32px 24px;
  border-radius: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  animation: cardSlideIn 0.6s ease-out backwards;
}

.modern-option-card:nth-child(1) {
  animation-delay: 0.3s;
}

.modern-option-card:nth-child(2) {
  animation-delay: 0.4s;
}

@keyframes cardSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.body--dark .modern-option-card {
  background: #1e1e1e;
  border-color: #374151;
}

.modern-option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(102, 126, 234, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-option-card:hover::before {
  opacity: 1;
}

.modern-option-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--q-primary);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.modern-option-card:active {
  transform: translateY(-4px) scale(1.01);
}

/* Option Icon Wrapper */
.option-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.demo-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.business-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.modern-option-card:hover .option-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

/* Option Content */
.option-content {
  margin-bottom: 16px;
}

.option-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.body--dark .option-title {
  color: #f3f4f6;
}

.option-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.body--dark .option-description {
  color: #9ca3af;
}

/* Option Badge */
.option-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.demo-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.business-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.modern-option-card:hover .option-badge {
  transform: translateX(4px);
}

/* Option Arrow */
.option-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary);
  transition: all 0.3s ease;
  opacity: 0;
}

.modern-option-card:hover .option-arrow {
  opacity: 1;
  transform: translateX(4px);
  background: var(--q-primary);
  color: white;
}

/* Business Type Selection Dialog */
.business-type-dialog {
  min-width: 650px;
  max-width: 700px;
  border-radius: 20px;
  overflow: hidden;
  animation: dialogEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.business-type-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px 20px 20px;
  text-align: center;
}

.body--dark .business-type-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

.business-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  animation: iconPulse 2s ease-in-out infinite;
}

.business-icon {
  color: white;
}

/* Business Type Cards */
.business-type-card {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: cardFadeIn 0.5s ease-out backwards;
}

@keyframes cardFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.body--dark .business-type-card {
  background: #1e1e1e;
  border-color: #374151;
}

.business-type-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--q-primary);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
}

.business-type-card.selected {
  border-color: var(--q-primary);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.business-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: var(--q-primary);
  transition: all 0.3s ease;
}

.body--dark .business-type-icon {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
}

.business-type-card:hover .business-type-icon {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, var(--q-primary) 0%, #764ba2 100%);
  color: white;
}

.business-type-card.selected .business-type-icon {
  background: linear-gradient(135deg, var(--q-primary) 0%, #764ba2 100%);
  color: white;
}

.business-type-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}

.body--dark .business-type-name {
  color: #f3f4f6;
}

.business-type-check {
  position: absolute;
  top: 8px;
  right: 8px;
  animation: checkAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkAppear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Business Type Dialog */
@media (max-width: 768px) {
  .business-type-dialog {
    min-width: 95vw;
    max-width: 95vw;
  }

  .business-type-card {
    padding: 16px;
  }

  .business-type-icon {
    width: 56px;
    height: 56px;
  }

  .business-type-name {
    font-size: 14px;
  }
}

/* Modern Company Setup Dialog */
.modern-company-setup-dialog {
  min-width: 600px;
  max-width: 650px;
  border-radius: 20px;
  overflow: hidden;
  animation: dialogEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.company-setup-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px 20px 20px;
  text-align: center;
}

.body--dark .company-setup-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
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
  animation: iconPulse 2s ease-in-out infinite;
}

.setup-icon {
  color: white;
}

/* Setup Submit Button */
.setup-submit-btn {
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.setup-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--q-primary-rgb, 16, 185, 129), 0.3);
}

/* Responsive Company Setup */
@media (max-width: 768px) {
  .modern-company-setup-dialog {
    min-width: 95vw;
    max-width: 95vw;
  }

  .company-setup-header {
    padding: 20px 16px 16px;
  }

  .setup-icon-wrapper {
    width: 48px;
    height: 48px;
  }
}

/* Responsive Options Dialog */
@media (max-width: 768px) {
  .modern-options-dialog {
    min-width: 95vw;
    max-width: 95vw;
  }

  .options-header {
    padding: 32px 24px 24px;
  }

  .modern-option-card {
    padding: 24px 20px;
  }

  .option-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .option-title {
    font-size: 20px;
  }
}

/* Link a Login */
.register-link-container {
  text-align: center;
  animation: fadeIn 0.5s ease-out 1.3s backwards;
}

.register-text {
  font-size: 14px;
  color: #6b7280;
}

.register-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.register-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Country Flag Styling */
.country-flag {
  font-size: 20px;
  color: rgba(0, 0, 0, 1) !important;
}

/* Phone input container specific adjustments */
.phone-input-container .country-select :deep(.q-field__control) {
  padding-left: 12px;
  padding-right: 4px;
}

.phone-input-container .row {
  margin: 0;
}

.phone-input-container .q-col-gutter-sm {
  margin-left: -4px;
  margin-right: -4px;
}

.phone-input-container .q-col-gutter-sm > div {
  padding-left: 4px;
  padding-right: 4px;
}

/* Responsive */
@media (max-width: 600px) {
  .register-card {
    padding: 20px 20px;
    max-width: 95%;
  }

  .welcome-title {
    font-size: 22px;
  }

  .logo-img {
    width: 120px;
  }

  .input-container {
    margin-bottom: 8px;
  }

  .custom-input :deep(.q-field__control) {
    height: 42px;
  }

  .register-btn {
    height: 42px;
  }
}
</style>
