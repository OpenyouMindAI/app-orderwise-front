<template>
  <div class="register-container">
    <!-- Fondo animado -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Card de Registro -->
    <RegistrationForm
      v-if="currentTab === 'register'"
      :showLogo="true"
      :showHeader="true"
      :showLoginLink="true"
      :loading="loading"
      :loadingGoogle="loadingGoogle"
      @submit="handleRegisterSubmit"
      @google-register="handleGoogleRegister"
    />

    <!-- Card de Verificación OTP -->
    <OtpVerificationForm
      v-if="currentTab === 'otp'"
      :email="form.email"
      :loading="loadingOtp"
      :resendTimer="resendTimer"
      :showBackLink="true"
      @submit="verifyOtp"
      @resend="resendOtp"
      @back="currentTab = 'register'"
    />

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
            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
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
            <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12">
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

    <BusinessTypeModal
      v-model="showBusinessTypeSetup"
      :loading="loadingCompanySetup"
      @submit="handleBusinessTypeNext"
      @back="handleBackToRegister"
    />

    <CompanySetupModal
      v-model="showCompanySetup"
      :user-email="companyForm.company_email"
      :initial-business-data="tempCompanyData"
      :registration-data="registrationFormData"
      @success="handleCompanySetupSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'
import CompanySetupModal from 'src/components/Register/CompanySetupModal.vue'
import BusinessTypeModal from 'src/components/Register/BusinessTypeModal.vue'
import RegistrationForm from 'src/components/Auth/RegistrationForm.vue'
import OtpVerificationForm from 'src/components/Auth/OtpVerificationForm.vue'
import { useRegistration } from 'src/composables/useRegistration'
import { usePixel } from 'src/composables/usePixel'

const router = useRouter()
const store = authentication()
const $q = useQuasar()
const fbq = usePixel()

// Usar composable de registro
const {
  form,
  loading,
  loadingGoogle,
  register: registerUser,
  registerWithGoogle: registerWithGoogleUser,
  initializeGoogleAuthMobile
} = useRegistration()

// UI state específico de la página
const showCompanySetup = ref(false)
const showBusinessTypeSetup = ref(false)
const tempCompanyData = ref(null)
const loadingCompanySetup = ref(false)

// OTP Verification
const currentTab = ref('register')
const loadingOtp = ref(false)

// OTP Session
const otpSessionToken = ref('')

// Constantes para persistencia OTP
const OTP_STORAGE_KEY = 'otp_pending_verification'
const OTP_EXPIRATION_TIME = 30 * 60 * 1000 // 30 minutos en milisegundos

// Constantes para persistencia de sesión de registro
const REGISTER_SESSION_KEY = 'register_session_data'
const REGISTER_CREDENTIALS_KEY = 'register_credentials'
const otpExpiresIn = ref(0)

// Resend OTP
const resendTimer = ref(0)
let resendInterval = null

// Company setup form
const companyForm = ref({
  company_name: '',
  company_document: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  business_type: null,
  country_id: null,
  copy_test_products: false
})

const businessTypes = ref([])
const isGoogleRegister = ref(false)
const showCompanyOptions = ref(false)
const showDemoBusinessTypeSelection = ref(false)
const demoBusinessType = ref(null)
const loadingDemo = ref(false)
const registeredCredentials = ref({
  email: '',
  password: ''
})

// Datos del formulario de registro para pasar al modal de setup
const registrationFormData = ref({
  name: '',
  last_name: '',
  email: '',
  phone_number: '',
  country_code: ''
})

/**
 * Handle business type next step (Step 1 -> Step 2)
 */
const handleBusinessTypeNext = (businessData) => {
  tempCompanyData.value = businessData
  showBusinessTypeSetup.value = false
  showCompanySetup.value = true
}

/**
 * Handle back from business type modal
 */
const handleBackToRegister = () => {
  showBusinessTypeSetup.value = false
  showCompanyOptions.value = true // Volver a la selección de tipo de cuenta
}

/**
 * Handle company setup success (Common for both flows)
 */
const handleCompanySetupSuccess = (data) => {
  if (data.user) {
    store.setSessionData({
      user: data.user,
      access_token: data.access_token || localStorage.getItem('access_token'),
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in
    })
  }

  // Limpiar datos de sesión temporal
  localStorage.removeItem(REGISTER_SESSION_KEY)
  localStorage.removeItem(REGISTER_CREDENTIALS_KEY)
  clearOtpPendingState()

  // Cerrar modales
  showCompanySetup.value = false
  showBusinessTypeSetup.value = false
  showCompanyOptions.value = false

  // Notificar éxito
  notify('¡Bienvenido a OrderWise!', 'positive', 'celebration')

  // Redirigir a la página principal
  router.push('/')
}

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
 * Filter business types - Handled by searchBusinessTypes for demo
 */

/**
 * Search business types
 * @param {string} value - The search value
 */
const searchBusinessTypes = async (value) => {
  try {
    const { data } = await api.get('business-types', {
      params: { dataSearch: { name: value } }
    })
    businessTypes.value = data.data || data
  } catch (error) {
    console.error('Error loading business types:', error)
  }
}

/**
 * Select business type
 * @param {object} type - The business type
 */
const selectBusinessType = (type) => {
  demoBusinessType.value = type
}

/**
 * Get icon for business type
 * @param {string} name - The business type name
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
 * @param {object} addressDetails - The address details
 */

/**
 * Maneja el submit del formulario de registro
 */
const handleRegisterSubmit = async ({ form: formData, phoneNumber }) => {
  console.log('📝 handleRegisterSubmit llamado', { formData, phoneNumber })

  // Guardar datos del formulario de registro para usar en el modal de setup
  registrationFormData.value = {
    name: formData.name,
    last_name: formData.last_name,
    email: formData.email,
    phone_number: phoneNumber, // Ya viene con código de país
    country_code: phoneNumber ? phoneNumber.split(' ')[0] : '' // Extraer código de país
  }

  await registerUser({
    onSuccess: async (data) => {
      console.log('✅ onSuccess callback ejecutado', data)
      // Guardar token en localStorage INMEDIATAMENTE
      localStorage.setItem('access_token', data.access_token)
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

      // Guardar datos de sesión de registro en localStorage
      localStorage.setItem(REGISTER_SESSION_KEY, JSON.stringify({
        user: data.user,
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        timestamp: Date.now()
      }))

      // Guardar credenciales para login posterior
      registeredCredentials.value = {
        email: formData.email,
        password: formData.password
      }
      localStorage.setItem(REGISTER_CREDENTIALS_KEY, JSON.stringify(registeredCredentials.value))

      // Actualizar store de Pinia con los datos de sesión
      store.setSessionData(data)

      // Actualizar Facebook Pixel con los datos del usuario
      if (window.fbq && data.user) {
        const pixelUserData = {}
        if (data.user.email) pixelUserData.em = data.user.email
        if (data.user.id) pixelUserData.external_id = data.user.id
        if (data.user.name) pixelUserData.fn = data.user.name
        if (data.user.last_name) pixelUserData.ln = data.user.last_name

        const rawPhone = data.user.phone_number || data.user.phone
        if (rawPhone) {
          pixelUserData.ph = rawPhone.toString().replace(/^\+/, '')
        }

        window.fbq('init', import.meta.env.VITE_FACEBOOK_PIXEL_ID, pixelUserData)
      }

      notify('Registro exitoso', 'positive', 'check_circle')

      isGoogleRegister.value = false

      companyForm.value.company_email = formData.email
      companyForm.value.company_phone = phoneNumber || ''

      // Si el email ya está verificado (viene de Google u otro proveedor), saltar OTP
      // IMPORTANTE: Solo saltar OTP si es registro con Google Y tiene email verificado
      if (isGoogleRegister.value && data.user?.email_verified_at) {
        showCompanyOptions.value = true
        return
      }

      currentTab.value = 'otp'

      // Guardar estado OTP en localStorage para persistencia entre recargas
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify({
        email: formData.email,
        timestamp: Date.now()
      }))

      startResendTimer()

      notify('Código de verificación enviado a tu correo', 'positive', 'chat')
    },
    onError: (error) => {
      console.error('❌ Error en registro:', error)
      console.error('Error message:', error.message)

      // Mostrar notificación de error al usuario
      const errorMessage = error.message || 'Error al registrar usuario'
      notify(errorMessage, 'negative', 'warning')
    }
  })
}

/**
 * Verify OTP code
 */
const verifyOtp = async (code) => {
  if (code.length < 6) {
    notify('Por favor ingresa el código completo de 6 dígitos', 'negative', 'warning')
    return
  }

  try {
    loadingOtp.value = true

    await api.post('otp/verify', {
      identifier: form.value.email,
      code,
      purpose: 'verify_email',
      session_token: otpSessionToken.value
    })

    notify('Teléfono verificado exitosamente', 'positive', 'check_circle')

    // Limpiar estado OTP de localStorage tras verificación exitosa
    clearOtpPendingState()

    // Pixel Event: Complete Registration (Email)
    if (fbq?.event) {
      fbq.event('CompleteRegistration')
    }

    // Marcar OTP como verificado en la sesión de registro
    const registerSession = localStorage.getItem(REGISTER_SESSION_KEY)
    if (registerSession) {
      const sessionData = JSON.parse(registerSession)
      sessionData.otp_verified = true
      localStorage.setItem(REGISTER_SESSION_KEY, JSON.stringify(sessionData))
    }

    // Continuar al flujo de setup de empresa
    showCompanyOptions.value = true
  } catch (error) {
    // Manejar errores específicos
    if (error.response?.status === 400) {
      const message = error.message || 'Código incorrecto'
      const remaining = error.remaining_attempts

      if (remaining !== undefined) {
        notify(`${message}. Le quedan ${remaining} intentos.`, 'negative', 'warning')
      } else {
        notify(message, 'negative', 'warning')
      }
    } else if (error.response?.status === 422) {
      const errors = error.errors
      const message = errors?.code?.[0] || error.message || 'Datos inválidos'
      notify(message, 'negative', 'warning')
    } else if (error.response?.status === 429) {
      const retryAfter = error.retry_after || 60
      notify(
        error.message || `Demasiados intentos. Intente nuevamente en ${retryAfter} segundos.`,
        'negative',
        'warning'
      )
    } else {
      notify(
        error.response?.data?.message || 'Código inválido o expirado',
        'negative',
        'warning'
      )
    }
  } finally {
    loadingOtp.value = false
  }
}

/**
 * Start resend timer
 */
const startResendTimer = () => {
  resendTimer.value = 60
  if (resendInterval) clearInterval(resendInterval)

  resendInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(resendInterval)
    }
  }, 1000)
}

/**
 * Resend OTP
 */
const resendOtp = async () => {
  try {
    const { data } = await api.post('otp/resend', {
      identifier: form.value.email,
      channel: 'email',
      purpose: 'register',
      session_token: otpSessionToken.value
    })

    // Actualizar session token
    otpSessionToken.value = data.session_token
    otpExpiresIn.value = data.expires_in_seconds || 300

    notify('Código reenviado exitosamente', 'positive', 'chat')
    startResendTimer()
  } catch (error) {
    // Manejar errores específicos
    if (error.response?.status === 400 || error.response?.status === 429) {
      const retryAfter = error.retry_after || 60
      notify(
        error.message || `Debe esperar ${retryAfter} segundos antes de reenviar.`,
        'negative',
        'warning'
      )
      // Establecer temporizador con retry_after
      resendTimer.value = retryAfter
    } else if (error.response?.status === 422) {
      const message = error.message || 'Datos inválidos'
      notify(message, 'negative', 'warning')
    } else {
      notify(
        error.response?.data?.message || 'Error al reenviar código',
        'negative',
        'warning'
      )
    }
  }
}

/**
 * Verifica el estado de la sesión OTP en el servidor
 *
 * Esta función consulta el backend para determinar si existe una sesión OTP activa
 * para el email actual. Si la sesión existe y es válida, restaura el estado de
 * verificación y cambia automáticamente al panel OTP.
 *
 * @async
 * @returns {Promise<void>}
 *
 * Casos de uso:
 * - Recuperación de sesión después de recarga de página
 * - Validación de sesión OTP existente
 * - Restauración automática del flujo de verificación
 */
const checkOtpStatus = async () => {
  if (!form.value.email) {
    console.log('No se puede verificar estado OTP: email no disponible')
    return
  }

  const email = form.value.email
  const data = localStorage.getItem('access_token')

  api.defaults.headers.common.Authorization = `Bearer ${data}`

  try {
    const { data } = await api.get('otp/status', {
      params: {
        identifier: email,
        purpose: 'register'
      }
    })

    const isValidOtpSession = data.exists && !data.is_expired && data.is_available

    if (isValidOtpSession) {
      otpExpiresIn.value = data.remaining_time_seconds || 0
      resendTimer.value = Math.max(0, otpExpiresIn.value - 60)

      currentTab.value = 'otp'

      const timeRemaining = data.remaining_time_formatted || 'desconocido'
      notify(
        `Sesión de verificación restaurada. Tiempo restante: ${timeRemaining}`,
        'info',
        'info'
      )
    }
  } catch (error) {
    // Error silencioso: el usuario continuará en el formulario de registro normalmente
    console.log('No hay sesión OTP activa para recuperar:', error.message || error)
  }
}

/**
 * Limpia el estado OTP del localStorage
 *
 * Función auxiliar para mantener el localStorage limpio y evitar
 * estados obsoletos o corruptos.
 */
const clearOtpPendingState = () => {
  localStorage.removeItem(OTP_STORAGE_KEY)
}

/**
 * Restaura la sesión de registro desde localStorage
 *
 * Esta función recupera los datos de sesión guardados durante el registro
 * y restaura el estado completo de la aplicación, incluyendo el token,
 * datos del usuario y credenciales.
 *
 * @returns {boolean} true si se restauró exitosamente, false en caso contrario
 */
const restoreRegisterSession = () => {
  try {
    const registerSessionData = localStorage.getItem(REGISTER_SESSION_KEY)
    const credentialsData = localStorage.getItem(REGISTER_CREDENTIALS_KEY)

    if (!registerSessionData) {
      return false
    }

    const sessionData = JSON.parse(registerSessionData)

    // Validar que la sesión no haya expirado (30 minutos)
    if (!isOtpSessionValid(sessionData.timestamp)) {
      console.log('Sesión de registro expirada')
      localStorage.removeItem(REGISTER_SESSION_KEY)
      localStorage.removeItem(REGISTER_CREDENTIALS_KEY)
      return false
    }

    // Restaurar token en axios
    if (sessionData.access_token) {
      localStorage.setItem('access_token', sessionData.access_token)
      api.defaults.headers.common.Authorization = `Bearer ${sessionData.access_token}`
    }

    // Restaurar datos en el store de Pinia
    store.setSessionData({
      user: sessionData.user,
      access_token: sessionData.access_token,
      token_type: sessionData.token_type,
      expires_in: sessionData.expires_in
    })

    // Restaurar credenciales si existen
    if (credentialsData) {
      registeredCredentials.value = JSON.parse(credentialsData)
    }

    // Si OTP ya fue verificado, mostrar opciones de empresa
    if (sessionData.otp_verified) {
      showCompanyOptions.value = true
    }

    console.log('Sesión de registro restaurada exitosamente')
    return true
  } catch (error) {
    console.error('Error al restaurar sesión de registro:', error)
    localStorage.removeItem(REGISTER_SESSION_KEY)
    localStorage.removeItem(REGISTER_CREDENTIALS_KEY)
    return false
  }
}

/**
 * Valida si el timestamp de la sesión OTP no ha expirado
 *
 * @param {number} timestamp - Timestamp en milisegundos cuando se guardó el estado
 * @returns {boolean} true si la sesión es válida, false si expiró
 */
const isOtpSessionValid = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') {
    return false
  }

  const elapsedTime = Date.now() - timestamp
  return elapsedTime < OTP_EXPIRATION_TIME
}

/**
 * Restaura el estado de verificación OTP desde localStorage
 *
 * Esta función intenta recuperar y validar una sesión OTP pendiente.
 * Si la sesión es válida, restaura el email y cambia al panel OTP.
 *
 * @async
 * @param {string} otpDataJson - Datos OTP en formato JSON string
 * @returns {Promise<boolean>} true si se restauró exitosamente, false en caso contrario
 */
const restoreOtpSession = async (otpDataJson) => {
  try {
    // Parsear datos del localStorage
    const otpData = JSON.parse(otpDataJson)
    const { email, timestamp } = otpData

    // Validar estructura de datos
    if (!email || !timestamp) {
      console.warn('Datos OTP incompletos en localStorage')
      clearOtpPendingState()
      return false
    }

    // Validar que la sesión no haya expirado
    if (!isOtpSessionValid(timestamp)) {
      console.log('Sesión OTP expirada, limpiando localStorage')
      clearOtpPendingState()
      return false
    }

    // Restaurar el email en el formulario
    form.value.email = email

    // Cambiar al panel de verificación OTP
    currentTab.value = 'otp'

    // Verificar el estado de la sesión en el servidor
    await checkOtpStatus()

    console.log('Sesión OTP restaurada exitosamente')
    return true
  } catch (error) {
    console.error('Error al parsear o restaurar estado OTP:', error)
    clearOtpPendingState()
    return false
  }
}

/**
 * Hook de ciclo de vida: Montaje del componente
 *
 * Al montar el componente, verifica si existe una verificación OTP pendiente
 * en localStorage. Si existe y es válida, restaura automáticamente el estado
 * de verificación. Esto permite que el usuario pueda recargar la página sin
 * perder su progreso en el proceso de verificación.
 *
 * Flujo:
 * 1. Buscar estado OTP en localStorage
 * 2. Si existe: validar y restaurar sesión
 * 3. Si no existe: verificar estado normal en servidor
 *
 * @async
 */
onMounted(async () => {
  // Inicializar Google Auth para plataformas móviles
  if ($q.platform.is.nativeMobile && window.Capacitor) {
    await initializeGoogleAuthMobile()
  }

  // Primero intentar restaurar la sesión de registro completa
  const sessionRestored = restoreRegisterSession()

  if (sessionRestored) {
    console.log('Sesión de registro restaurada, verificando estado OTP...')
  }

  // Luego verificar si hay OTP pendiente
  const otpPendingData = localStorage.getItem(OTP_STORAGE_KEY)

  if (otpPendingData) {
    await restoreOtpSession(otpPendingData)
  } else if (!sessionRestored) {
    // Solo verificar estado OTP si no se restauró una sesión completa
    await checkOtpStatus()
  }

  // Cargar rubros para la demo
  searchBusinessTypes('')
})

onBeforeUnmount(() => {
  if (resendInterval) clearInterval(resendInterval)
})

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
  showBusinessTypeSetup.value = true
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

    store.setSessionData(data)

    notify('¡Bienvenido a la demo!', 'positive', 'check_circle')

    showDemoBusinessTypeSelection.value = false

    router.push('/')
  } catch (error) {
    console.log(error)
  } finally {
    loadingDemo.value = false
  }
}

/**
 * Maneja el registro con Google
 */
const handleGoogleRegister = async () => {
  await registerWithGoogleUser({
    onSuccess: (data, userInfo) => {
      // Guardar datos del usuario de Google para usar en el modal de setup
      registrationFormData.value = {
        name: userInfo.name?.split(' ')[0] || userInfo.name || '',
        last_name: userInfo.name?.split(' ').slice(1).join(' ') || '',
        email: userInfo.email || '',
        phone_number: data.user?.phone_number || data.user?.phone || null,
        country_code: ''
      }

      // Guardar sesión completa en el store
      store.setSessionData(data)

      notify('Registro exitoso con Google', 'positive', 'check_circle')

      // Pixel Event: Complete Registration
      if (fbq?.event) {
        fbq.event('CompleteRegistration')
      }

      // Mostrar modal de setup de empresa
      if (data.needs_company_setup) {
        isGoogleRegister.value = true
        companyForm.value.company_email = userInfo.email
        showCompanyOptions.value = true
      } else {
        router.push('/')
      }
    }
  })
}

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

/* Country Flag Styling */

/* Phone input container specific adjustments */

/* Responsive */
@media (max-width: 600px) {
}
</style>
