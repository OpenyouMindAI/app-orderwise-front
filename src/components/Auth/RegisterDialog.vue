<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 600px; max-width: 98vw; border-radius: 16px;">
      <!-- Close Button -->
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        @click="closeDialog"
        class="absolute-top-right q-ma-md"
        style="z-index: 10;"
      />

      <!-- Header con gradiente -->
      <q-card-section class="bg-gradient-primary text-white text-center q-pt-xl q-pb-lg">
        <div>
          <q-avatar size="70px" color="white" text-color="primary">
            <q-icon name="rocket_launch" size="30px" />
          </q-avatar>
        </div>
        <div class="text-h6 text-weight-bold q-mb-xs">
          ¡Bienvenido a la era digital!
        </div>
        <div class="text-body2" style="opacity: 0.95;">
          Crea tu cuenta gratis y desbloquea todas las funcionalidades
        </div>
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="q-pa-lg" style="max-height: calc(100vh - 230px); overflow-y: auto;">
        <q-form @submit="register" class="register-form">
          <!-- Input Nombre -->
          <div class="input-container">
            <q-input
              v-model="form.name"
              placeholder="Nombre completo"
              class="custom-input"
              borderless
              dense
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
              class="custom-input"
              borderless
              dense
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
                  class="custom-input country-select"
                  borderless
                  dense
                  hide-bottom-space
                  emit-value
                  map-options
                  behavior="menu"
                  popup-content-class="country-dropdown"
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
                  class="custom-input"
                  borderless
                  dense
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
              class="custom-input"
              borderless
              dense
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
              class="custom-input"
              borderless
              dense
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
            :loading="loading"
            :disable="loading"
            unelevated
            no-caps
            class="full-width"
            size="lg"
          >
            <q-icon name="group_add" size="20px" class="q-mr-sm"/>
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
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { notify, notifyValidationErrors } from 'src/const/mixins'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'google-success'])

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
      return selectedCountry.value.regex.test(val) || 'Formato inválido'
    }
  ]
})

/**
 * Register with email and password
 */
const register = async () => {
  try {
    loading.value = true

    const phoneNumber = form.value.phone_number
      ? `${selectedCountry.value?.code || ''}${form.value.phone_number}`.trim()
      : ''

    const payload = {
      ...form.value,
      phone_number: phoneNumber
    }

    const { data } = await api.post('authentication/register', payload)

    // Emit success with phone number for OTP verification
    emit('success', {
      ...data,
      phone_number: phoneNumber,
      user_email: form.value.email
    })
    closeDialog()
  } catch (error) {
    notifyValidationErrors(error, 'Error al configurar empresa')
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
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            const userInfo = await userInfoResponse.json()

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

            // Emit success event (MainLayout will handle notification)
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

<style scoped>
/* Gradiente del header */
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.body--dark .bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Form */
.register-form {
  width: 100%;
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
  transition: all 0.3s ease;
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
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

.custom-input :deep(.q-field__prepend),
.custom-input :deep(.q-field__append) {
  height: 48px !important;
  min-height: 48px !important;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.body--dark .custom-input :deep(.q-field__control) {
  background: #374151 !important;
}

.body--dark .custom-input :deep(.q-field__control):hover {
  background: #4b5563 !important;
}

.body--dark .custom-input :deep(.q-field__control):focus-within {
  background: #1f2937 !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3) !important;
}

.body--dark .custom-input :deep(.q-field__native) {
  color: #f3f4f6;
}

.body--dark .custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
}

/* Botón Registrarse */
.register-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Divider */
.divider-container {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #d1d5db, transparent);
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

/* Botón Social */
.social-btn {
  width: 100%;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.body--dark .social-btn {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
}

.body--dark .social-btn:hover:not(:disabled) {
  background: #4b5563;
  border-color: #6b7280;
}

/* Phone input */
.phone-input-container {
  margin-bottom: 12px;
}

.country-select :deep(.q-field__control) {
  border-radius: 8px 0 0 8px !important;
}

.country-flag {
  font-size: 20px;
  line-height: 1;
}
</style>
