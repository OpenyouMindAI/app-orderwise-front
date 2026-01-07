<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <div class="register-card">
      <!-- Close Button -->
      <q-btn
        flat
        round
        dense
        icon="close"
        color="grey-7"
        @click="closeDialog"
        class="absolute-top-right q-ma-md"
        style="z-index: 10;"
      />

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
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { notify, logo } from 'src/const/mixins'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'google-success'])

// Logo
const qBitsLogo = logo

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

// Country selector
const selectedCountry = ref(null)
const countryOptions = [
  { label: 'Argentina', code: '+54', mask: '## #### ####', regex: /^(?:(?:00)?549?)?0?[1-9]\d{9}$/, flag: '🇦🇷' },
  { label: 'Chile', code: '+56', mask: '#########', regex: /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/, flag: '🇨🇱' },
  { label: 'México', code: '+52', mask: '## #### ####', regex: /^(\+?52)?\s?1?\s?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}$/, flag: '🇲🇽' },
  { label: 'Colombia', code: '+57', mask: '### ### ####', regex: /^(\+?57)?\s?3[\d]{9}$/, flag: '🇨🇴' },
  { label: 'Perú', code: '+51', mask: '### ### ###', regex: /^(\+?51)?\s?9[\d]{8}$/, flag: '🇵🇪' },
  { label: 'Uruguay', code: '+598', mask: '## ### ###', regex: /^(\+?598)?\s?9[\d]{7}$/, flag: '🇺🇾' }
]

// Set default country
selectedCountry.value = countryOptions[0]

// Phone validation rule
const phoneRule = computed(() => {
  return [
    val => !!val || 'El teléfono es requerido',
    val => {
      if (!val) return true
      if (!selectedCountry.value || !selectedCountry.value.regex) return true
      return selectedCountry.value.regex.test(val) || `Formato inválido`
    }
  ]
})

/**
 * Register with email and password
 */
const register = async () => {
  try {
    loading.value = true

    const payload = {
      ...form.value,
      phone_number: form.value.phone_number
        ? `${selectedCountry.value?.code || ''}${form.value.phone_number}`.trim()
        : ''
    }

    const { data } = await api.post('authentication/register', payload)

    // Save token
    localStorage.setItem('access_token', data.access_token)
    api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

    notify('Registro exitoso', 'positive', 'check_circle')

    emit('success', data)
    closeDialog()
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error al registrar usuario'
    notify(message, 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Register with Google
 */
const registerWithGoogle = async () => {
  try {
    loadingGoogle.value = true

    // Wait for Google Sign-In to load
    if (!window.google) {
      notify('Google Sign-In no disponible. Por favor, recarga la página.', 'negative', 'warning')
      loadingGoogle.value = false
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        try {
          if (response.access_token) {
            // Get user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            const userInfo = await userInfoResponse.json()

            // Encode data in base64
            const credential = btoa(JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              google_id: userInfo.sub,
              picture: userInfo.picture
            }))

            // Register with backend
            const { data } = await api.post('authentication/register/google', {
              credential,
              name: userInfo.name,
              email: userInfo.email
            })

            notify('Registro exitoso con Google', 'positive', 'check_circle')
            emit('google-success', {
              user: data,
              userInfo,
              needsCompanySetup: data.needs_company_setup
            })
            closeDialog()
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
 * Close dialog
 */
const closeDialog = () => {
  emit('update:modelValue', false)
  // Reset form
  form.value = {
    name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: ''
  }
  showPassword.value = false
  showPasswordConfirm.value = false
}
</script>

<style lang="scss" scoped>
/* Register Card */
.register-card {
  position: relative;
  width: 420px;
  max-width: 90vw;
  padding: 32px 28px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: cardSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.body--dark .register-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease-out 0.2s backwards;
}

.logo-img {
  width: 140px;
  height: auto;
}

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 24px;
  animation: fadeIn 0.5s ease-out 0.3s backwards;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  display: block;
  margin-bottom: 6px;
}

.body--dark .welcome-title {
  color: #f3f4f6;
}

.welcome-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.body--dark .welcome-subtitle {
  color: #9ca3af;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* Form */
.register-form {
  width: 100%;
}

/* Input Container */
.input-container {
  margin-bottom: 12px;
  animation: slideInLeft 0.5s ease-out backwards;
}

.input-container:nth-child(1) { animation-delay: 0.4s; }
.input-container:nth-child(2) { animation-delay: 0.5s; }
.input-container:nth-child(3) { animation-delay: 0.6s; }
.input-container:nth-child(4) { animation-delay: 0.7s; }
.input-container:nth-child(5) { animation-delay: 0.8s; }

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Custom Input */
.custom-input :deep(.q-field__control) {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  height: 44px;
  min-height: 44px;
  padding: 0 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
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
  line-height: 1;
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
