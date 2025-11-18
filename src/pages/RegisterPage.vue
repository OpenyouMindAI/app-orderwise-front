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
        <q-img :src="logo.color" class="logo-img"/>
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
        <div class="input-container">
          <q-input
            v-model="form.phone_number"
            placeholder="Teléfono (opcional)"
            dark
            class="custom-input"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="primary" size="20px"/>
            </template>
          </q-input>
        </div>

        <!-- Input Contraseña -->
        <div class="input-container">
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            dark
            class="custom-input"
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
          <span class="register-text">¿Ya tienes cuenta?</span>
          <router-link to="/login" class="register-link">Inicia sesión</router-link>
        </div>
      </q-form>
    </div>

    <!-- Modal de Setup de Empresa -->
    <q-dialog v-model="showCompanySetup" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Configura tu empresa</div>
          <div class="text-subtitle2">Ingresa los datos de tu empresa para continuar</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="setupCompany">
            <div class="q-gutter-md">
              <!-- Nombre de la empresa -->
              <q-input
                v-model="companyForm.company_name"
                label="Nombre de la empresa *"
                outlined
                :rules="[val => !!val || 'El nombre es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="business" />
                </template>
              </q-input>

              <!-- Documento -->
              <q-input
                v-model="companyForm.company_document"
                label="CUIT / RUT / Documento *"
                outlined
                :rules="[val => !!val || 'El documento es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" />
                </template>
              </q-input>

              <!-- Email -->
              <q-input
                v-model="companyForm.company_email"
                label="Email de la empresa *"
                type="email"
                outlined
                :rules="[
                  val => !!val || 'El email es requerido',
                  val => /.+@.+\..+/.test(val) || 'Email inválido'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <!-- Teléfono -->
              <q-input
                v-model="companyForm.company_phone"
                label="Teléfono *"
                outlined
                :rules="[val => !!val || 'El teléfono es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>

              <!-- Dirección -->
              <q-input
                v-model="companyForm.company_address"
                label="Dirección"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" />
                </template>
              </q-input>
            </div>

            <q-card-actions align="right" class="q-mt-md">
              <q-btn
                flat
                label="Cancelar"
                color="grey"
                @click="showCompanySetup = false"
                :disable="loadingCompanySetup"
              />
              <q-btn
                type="submit"
                label="Continuar"
                color="primary"
                unelevated
                :loading="loadingCompanySetup"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { logo, notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

const router = useRouter()
const store = authentication()

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
  company_address: ''
})

const loadingCompanySetup = ref(false)
const registeredCredentials = ref({
  email: '',
  password: ''
})

/**
 * Setup company with form data
 */
const setupCompany = async () => {
  try {
    loadingCompanySetup.value = true

    await api.post('authentication/setup-company', companyForm.value)

    notify('Empresa configurada exitosamente', 'positive', 'check_circle')

    // Cerrar modal
    showCompanySetup.value = false

    // Hacer login automático con las credenciales guardadas
    await loginAfterCompanySetup()
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

    const { data } = await api.post('authentication/register', form.value)

    // Guardar token en localStorage INMEDIATAMENTE
    localStorage.setItem('access_token', data.access_token)
    api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

    notify('Registro exitoso', 'positive', 'check_circle')

    // Guardar credenciales para login posterior
    registeredCredentials.value = {
      email: form.value.email,
      password: form.value.password
    }

    // Pre-llenar formulario de empresa
    companyForm.value.company_email = form.value.email
    companyForm.value.company_phone = form.value.phone_number || ''

    // Mostrar modal de configuración de empresa
    showCompanySetup.value = true
  } catch (error) {
    const message = error.response?.data?.message || 'Error al registrar usuario'
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

    // Inicializar Google Sign-In
    if (!window.google) {
      notify('Error al cargar Google Sign-In', 'negative', 'warning')
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

            // Guardar sesión completa en el store
            store.setSessionData({
              user: data.user,
              access_token: data.access_token,
              token_type: data.token_type,
              expires_in: data.expires_in,
              refresh_token: data.refresh_token
            })

            // Guardar token en localStorage
            localStorage.setItem('access_token', data.access_token)
            api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`

            notify('Registro exitoso con Google', 'positive', 'check_circle')

            // Mostrar modal de setup de empresa
            if (data.needs_company_setup) {
              showCompanySetup.value = true
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

</script>

<style scoped>
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
  padding: 20px 0;
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
  margin-bottom: 10px;
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

.custom-input :deep(.q-field__control) {
  height: 44px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 20px;
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

.custom-input :deep(.q-field__native) {
  color: #1f2937;
  font-size: 14px;
  padding-left: 8px;
}

.custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
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
