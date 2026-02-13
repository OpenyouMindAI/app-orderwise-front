<template>
  <div class="quick-subscribe-page">
    <!-- Fondo animado de la página -->
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- Content Wrapper para estados de carga/error -->
    <div class="content-wrapper">
      <!-- Loading State -->
      <div v-if="processingPayment && !errorMessage" class="loading-state">
        <div class="loading-spinner">
          <q-spinner-dots size="80px" color="white" />
        </div>
        <div class="column">
          <span class="text-white text-h4">Preparando tu suscripción...</span>
          <span class="text-white text-h6">Redirigiendo a Mercado Pago</span>
        </div>
      </div>

      <!-- New: Plans Selection Integrated -->
      <div v-if="isAuthenticated && !processingPayment && !errorMessage" class="plans-selection-view">
        <div class="selection-header text-center q-mb-xl">
          <div class="selection-badge q-mb-sm">
            <q-icon name="auto_awesome" size="14px" />
            <span>Oferta Exclusiva</span>
          </div>
          <h2 class="selection-title">Elige tu Plan Premium</h2>
          <p class="selection-subtitle">Desbloquea todas las funciones y potencia tu negocio hoy mismo</p>
        </div>

        <q-btn
          unelevated
          no-caps
          label="Ver planes disponibles"
          color="white"
          text-color="primary"
          size="lg"
          class="show-plans-btn"
          @click="showPlansDialog = true"
        />
      </div>

      <!-- Error State -->
      <div v-if="errorMessage" class="error-state text-center">
        <q-icon name="error_outline" size="80px" color="white" class="q-mb-md" />
        <h2>Ocurrió un problema</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <q-btn
          unelevated
          no-caps
          label="Reintentar"
          color="white"
          text-color="primary"
          size="lg"
          class="retry-btn q-mt-lg"
          @click="retrySubscription"
          :loading="processingPayment"
        />
      </div>

      <!-- Login Modal (Clon Exacto de LoginPage con Bordes Redondos) -->
      <q-dialog v-model="showLoginDialog" persistent transition-show="scale" transition-hide="scale">
        <q-card flat class="login-modal-card">
          <div class="login-card-inner">
            <!-- Logo -->
            <div class="logo-section text-center">
              <q-img :src="qBitsLogo.black" class="logo-img" />
            </div>

            <!-- Título -->
            <div class="header-section text-center">
              <span class="welcome-title">Suscríbete a Pro</span>
              <p class="welcome-subtitle">Inicia sesión para continuar con tu membresía</p>
            </div>

            <!-- Formulario -->
            <q-form @submit="handleLogin" class="login-form">
              <div class="input-container">
                <q-input
                  v-model="loginForm.email"
                  ref="username"
                  name="username"
                  placeholder="Usuario o correo electrónico"
                  class="custom-input"
                  @keyup.enter="handleLogin"
                  :rules="[val => !!val || 'El campo es requerido.']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" size="20px" />
                  </template>
                </q-input>
              </div>

              <div class="input-container">
                <q-input
                  v-model="loginForm.password"
                  ref="password"
                  name="password"
                  placeholder="Contraseña"
                  :type="showPassword ? 'text' : 'password'"
                  class="custom-input"
                  @keyup.enter="handleLogin"
                  :rules="[val => !!val || 'El campo es requerido.']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" size="20px" />
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

              <q-btn
                type="submit"
                color="primary"
                class="login-btn full-width"
                :loading="loading"
                unelevated
                no-caps
              >
                <q-icon name="login" size="20px" class="q-mr-sm" />
                Iniciar Sesión y Suscribirse
              </q-btn>

              <!-- Divider -->
              <div class="divider-container">
                <div class="divider-line"></div>
                <span class="divider-text">O continúa con</span>
                <div class="divider-line"></div>
              </div>

              <!-- Google -->
              <div class="social-container">
                <button type="button" class="social-btn google-btn" @click="handleGoogleLogin" :disabled="googleLoading">
                  <q-spinner v-if="googleLoading" color="primary" size="18px" />
                  <template v-else>
                    <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                  </template>
                </button>
              </div>
            </q-form>
          </div>
        </q-card>
      </q-dialog>

      <!-- Componente de Planes -->
      <SubscriptionPlansDialog v-model="showPlansDialog" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { authentication } from 'src/stores/module-authentication'
import { api } from 'boot/axios'
import { notify, qBitsLogo } from 'src/const/mixins'
import SubscriptionPlansDialog from 'src/components/SubscriptionPlansDialog.vue'

export default {
  name: 'QuickSubscribePage',
  components: {
    SubscriptionPlansDialog
  },
  data () {
    return {
      qBitsLogo,
      showLoginDialog: false,
      showPlansDialog: false,
      showPassword: false,
      loading: false,
      processingPayment: false,
      errorMessage: '',
      loginForm: {
        email: '',
        password: ''
      },
      googleLoading: false,
      googleClient: null
    }
  },
  computed: {
    isAuthenticated () {
      const store = authentication()
      return !!store.access_token
    }
  },
  async mounted () {
    this.loadGoogleScript()
    if (this.isAuthenticated) {
      this.showPlansDialog = true
    } else {
      this.showLoginDialog = true
    }
  },
  methods: {
    ...mapActions(authentication, ['login', 'setSessionData']),

    loadGoogleScript () {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => { this.initializeGoogleSignIn() }
      document.head.appendChild(script)
    },

    initializeGoogleSignIn () {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.GOOGLE_CLIENT_ID,
          callback: this.handleGoogleCallback
        })
        this.googleClient = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: this.handleGoogleTokenResponse
        })
      }
    },

    async handleGoogleLogin () {
      this.googleLoading = true
      if (this.googleClient) {
        this.googleClient.requestAccessToken()
      } else {
        this.googleLoading = false
        notify('Google Sign-In no disponible', 'negative', 'warning')
      }
    },

    async handleGoogleTokenResponse (tokenResponse) {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          })
          const userInfo = await response.json()
          await this.authenticateWithGoogle(userInfo.email, userInfo.name, userInfo.sub, userInfo.picture)
        } catch (e) {
          console.error('Error fetching Google user info:', e)
          this.googleLoading = false
        }
      } else {
        this.googleLoading = false
      }
    },

    async authenticateWithGoogle (email, name, googleId, picture) {
      try {
        const credential = btoa(JSON.stringify({ email, name, google_id: googleId, picture }))
        const result = await api.post('/authentication/google', { credential })
        if (result.data.access_token) {
          this.setSessionData(result.data)
          this.showLoginDialog = false
          await this.processSubscription()
        }
      } catch (error) {
        notify('Error al autenticar con Google', 'negative', 'warning')
      } finally {
        this.googleLoading = false
      }
    },

    async handleGoogleCallback (response) {
      if (response.credential) {
        this.googleLoading = true
        try {
          const result = await api.post('/authentication/google', { credential: response.credential })
          if (result.data.access_token) {
            this.setSessionData(result.data)
            this.showLoginDialog = false
            await this.processSubscription()
          }
        } catch (e) {
          notify('Error Google Login', 'negative', 'warning')
        } finally {
          this.googleLoading = false
        }
      }
    },

    async handleLogin () {
      this.loading = true
      try {
        await this.login({ username: this.loginForm.email, password: this.loginForm.password })
        this.showLoginDialog = false
        this.showPlansDialog = true
      } catch (error) {
        notify(error.response?.data?.message || 'Error login', 'negative', 'error')
      } finally {
        this.loading = false
      }
    },

    async retrySubscription () {
      this.errorMessage = ''
      this.showPlansDialog = true
    },

    async processSubscription () {
      // Esta función ya no se usa directamente al cargar,
      // ahora se abre el diálogo para elegir el plan
      this.showPlansDialog = true
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-subscribe-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* FONDOS ANIMADOS MEJORADOS */
.animated-bg {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  will-change: transform;
}

.orb-1 { width: 600px; height: 600px; background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); top: -15%; left: -15%; animation: floatOrb1 25s ease-in-out infinite; }
.orb-2 { width: 500px; height: 500px; background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); bottom: -15%; right: -15%; animation: floatOrb2 30s ease-in-out infinite; }
.orb-3 { width: 400px; height: 400px; background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%); top: 40%; left: 60%; animation: floatOrb3 20s ease-in-out infinite; }

@keyframes floatOrb1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 40px) scale(1.1); } }
@keyframes floatOrb2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-40px, -40px) scale(1.1); } }
@keyframes floatOrb3 { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-40%, -60%) scale(1.1); } }

.content-wrapper {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state, .error-state, .plans-selection-view {
  color: white;
  h2 { margin: 0 0 10px; font-weight: 700; }
}

/* PLANS SELECTION VIEW */
.plans-selection-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  width: 90%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.selection-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.selection-title {
  font-size: 42px;
  font-weight: 800;
  margin: 10px 0;
  line-height: 1.1;
  text-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.selection-subtitle {
  font-size: 18px;
  opacity: 0.9;
  font-weight: 500;
  max-width: 400px;
  margin: 0 auto;
}

.show-plans-btn {
  height: 60px;
  padding: 0 40px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 17px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  }
}

/* MODAL DESIGN CLON DE LOGINPAGE + BORDES REDONDOS */
.login-modal-card {
  background: transparent !important;
  box-shadow: none !important;
  overflow: visible;
}

.login-card-inner {
  width: 100%;
  max-width: 400px;
  padding: 32px 28px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 28px !important; /* BORDES REDONDOS PRONUNCIADOS */
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 1);
  animation: cardEnter 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(40px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.logo-section { animation: slideInDown 0.6s ease-out 0.1s backwards; }
.logo-img { width: 110px; margin-bottom: 15px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }

.header-section { animation: slideInDown 0.6s ease-out 0.2s backwards; }
.welcome-title {
  display: block;
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 6px;
}

.welcome-subtitle { color: #6b7280; font-size: 14px; margin-bottom: 25px; font-weight: 500; }

/* INPUTS ESTILO LOGINPAGE PREMIUM */
.input-container {
  margin-bottom: 12px;
  &:nth-child(1) { animation: slideInUp 0.5s ease-out 0.3s backwards; }
  &:nth-child(2) { animation: slideInUp 0.5s ease-out 0.4s backwards; }
}

.custom-input :deep(.q-field__control) {
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  padding: 0 15px;
  transition: all 0.3s;
}

.custom-input :deep(.q-field__control):hover { border-color: #667eea; background: #fff; }
.custom-input :deep(.q-field__control):focus-within {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.login-btn {
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
  margin-top: 5px;
  animation: slideInUp 0.5s ease-out 0.5s backwards;
  &:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(102, 126, 234, 0.5); }
}

.divider-container {
  display: flex;
  align-items: center;
  margin: 18px 0;
  animation: fadeIn 0.5s ease-out 0.6s backwards;
  .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
  .divider-text { padding: 0 15px; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
}

.social-container { animation: slideInUp 0.5s ease-out 0.7s backwards; }
.google-btn {
  width: 100%; height: 46px; border-radius: 12px; background: #fff; border: 1.5px solid #e2e8f0;
  color: #334155; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 12px;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: #f8fafc; border-color: #667eea; transform: translateY(-2px); }
}

.social-icon { width: 18px; height: 18px; }

.register-container { margin-top: 18px; animation: fadeIn 0.5s ease-out 0.8s backwards; }
.register-link { color: #667eea; font-weight: 700; text-decoration: none; &:hover { text-decoration: underline; } }

@keyframes slideInDown { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes slideInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
</style>
