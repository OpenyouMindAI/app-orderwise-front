<template>
  <div class="login-container">
    <!-- Fondo animado -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Card principal -->
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-section">
        <q-img :src="logo.color" class="logo-img"/>
      </div>

      <!-- Título -->
      <div class="header-section">
        <span class="welcome-title">Bienvenido</span>
        <p class="welcome-subtitle">Accede a tu cuenta para continuar</p>
      </div>

      <!-- Formulario -->
      <q-form @submit="loginAt" class="login-form">
        <!-- Input Usuario -->
        <div class="input-container">
          <q-input
            v-model="username"
            ref="username"
            name="username"
            placeholder="Usuario o correo electrónico"
            dark
            class="custom-input"
            @keyup.enter="loginAt"
            :rules="[val => !!val || 'El campo es requerido.']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="orange" size="20px"/>
            </template>
          </q-input>
        </div>

        <!-- Input Contraseña -->
        <div class="input-container">
          <q-input
            v-model="password"
            ref="password"
            name="password"
            placeholder="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            dark
            class="custom-input"
            @keyup.enter="loginAt"
            :rules="[val => !!val || 'El campo es requerido.']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="orange" size="20px"/>
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

        <!-- Recordarme y Olvidaste contraseña -->
        <div class="options-container">
          <q-checkbox
            v-model="remember"
            label="Recordarme"
            color="cyan"
            dark
            dense
            class="remember-checkbox"
          />
          <a href="#" class="forgot-password-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Botón Iniciar Sesión -->
        <q-btn
          type="submit"
          color="primary"
          class="login-btn"
          :loading="btnDisable"
          :disable="btnDisable"
          unelevated
          no-caps
          size="lg"
        >
          <q-icon name="login" size="20px" class="q-mr-sm"/>
          Iniciar Sesión
        </q-btn>

        <!-- Divider -->
        <div class="divider-container">
          <div class="divider-line"></div>
          <span class="divider-text">O continúa con</span>
          <div class="divider-line"></div>
        </div>

        <!-- Botones Sociales -->
        <div class="social-container">
          <button type="button" class="social-btn google-btn" @click="handleGoogleLogin" :disabled="googleLoading">
            <q-spinner v-if="googleLoading" color="white" size="18px"/>
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

          <!-- <button type="button" class="social-btn facebook-btn" @click="handleFacebookLogin" :disabled="facebookLoading">
            <q-spinner v-if="facebookLoading" color="white" size="18px"/>
            <template v-else>
              <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              <span>Facebook</span>
            </template>
          </button> -->
        </div>

        <!-- Registro -->
        <div class="register-container">
          <span class="register-text">¿No tienes cuenta? <a href="#" class="register-link">Crear cuenta</a></span>
        </div>
      </q-form>

      <!-- Footer -->
      <div class="footer-container">
        <q-icon name="laptop_mac" size="18px" color="grey-6"/>
        <span class="footer-text">Powered by</span>
        <a href="https://site.qbitsinc.com" target="_blank">
          <q-img :src="qBitsLogo.white" class="qbits-logo"/>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import { logo, qBitsLogo } from 'src/const/mixins'
import { Notify } from 'quasar'
import { mapActions, mapState } from 'pinia'
import { authentication } from 'stores/module-authentication'
import { notify } from '../const/mixins'
import { darkModeStore } from '../stores/darkModeStore'
export default {
  name: 'LoginPage',
  data () {
    return {
      qBitsLogo,
      remember: true,
      dialog: false,
      logo,
      slide: 'style',
      showPassword: false,
      googleLoading: false,
      facebookLoading: false,
      googleClient: null,
      facebookSDKLoaded: false,
      /**
       * Email User
       * @type {String}
       */
      username: '',
      /**
       * Password User
       * @type {String}
       */
      password: '',

      btnDisable: false,
      urlDownload: null,
      messageError: {
        'The user credentials were incorrect.':
          'El usuario o contraseña son incorrectos.'
      }
    }
  },
  computed: {
    /**
     * Height window
     * @returns {Number}
     */
    heightWindow () {
      return screen.height
    },
    /**
     * Dark mode
     * @returns {Boolean}
     */
    ...mapState(darkModeStore, ['darkMode'])
  },
  mounted () {
    this.$q.dark.set(this.darkMode)
    this.loadGoogleScript()
    this.loadFacebookSDK()
  },
  methods: {
    /**
     * Cargar el script de Google Identity Services
     */
    loadGoogleScript () {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        this.initializeGoogleSignIn()
      }
      document.head.appendChild(script)
    },
    /**
     * Inicializar Google Sign-In
     */
    initializeGoogleSignIn () {
      if (window.google && window.google.accounts) {
        try {
          // Inicializar Google Identity Services
          window.google.accounts.id.initialize({
            client_id: process.env.GOOGLE_CLIENT_ID,
            callback: this.handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
          })

          // Inicializar OAuth2 para el popup
          this.googleClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: this.handleGoogleTokenResponse
          })
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error)
        }
      }
    },
    /**
     * Manejar el clic en el botón de Google
     */
    handleGoogleLogin () {
      this.googleLoading = true

      if (window.google && window.google.accounts) {
        try {
          // Intentar con One Tap primero
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Si One Tap no funciona, usar OAuth2 popup
              console.log('One Tap not available, using OAuth2 popup')
              this.openGoogleOAuthPopup()
            }
          })
        } catch (error) {
          console.error('Error with Google One Tap:', error)
          // Fallback a OAuth2 popup
          this.openGoogleOAuthPopup()
        }
      } else {
        this.googleLoading = false
        notify('Google Sign-In no está disponible', 'negative', 'warning')
      }
    },
    /**
     * Abrir popup de OAuth2 de Google
     */
    openGoogleOAuthPopup () {
      if (this.googleClient) {
        try {
          this.googleClient.requestAccessToken()
        } catch (error) {
          this.googleLoading = false
          notify('Error al abrir Google Sign-In', 'negative', 'warning')
        }
      } else {
        this.googleLoading = false
        notify('Google OAuth no está inicializado', 'negative', 'warning')
      }
    },
    /**
     * Manejar respuesta del token de OAuth2
     */
    async handleGoogleTokenResponse (tokenResponse) {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          // Obtener información del usuario con el access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`
            }
          })

          const userInfo = await userInfoResponse.json()

          // Llamar al backend con toda la información
          await this.authenticateWithGoogle(userInfo.email, userInfo.name, userInfo.sub, userInfo.picture)
        } catch (error) {
          this.googleLoading = false
          console.error('Error getting user info:', error)
          notify('Error al obtener información de Google', 'negative', 'warning')
        }
      } else {
        this.googleLoading = false
      }
    },
    /**
     * Autenticar con Google en el backend
     */
    async authenticateWithGoogle (email, name, googleId, picture) {
      try {
        // Crear un credential con toda la información
        const credential = btoa(JSON.stringify({
          email,
          name,
          google_id: googleId,
          picture
        }))

        const result = await this.$api.post('/authentication/google', {
          credential
          // NO enviar email y name por separado, ya están en el credential
        })

        if (result.data.access_token) {
          // Usar el mismo método que el login normal para guardar la sesión
          this.setSessionData(result.data)

          notify('Inicio de sesión exitoso', 'positive', 'check_circle')

          // Redirigir según el tipo de usuario
          if (result.data.user.is_root) {
            this.$router.push({ name: 'Billing' })
          } else if (result.data.user?.roles?.length === 0) {
            notify('Usuario no tiene permisos', 'negative', 'warning')
          } else {
            this.$router.push({ name: 'Tutorial' })
          }
        }
      } catch (error) {
        console.error('Google authentication error:', error)

        if (error.response?.status === 404) {
          notify('No hay un usuario registrado con ese email', 'negative', 'warning')
        } else if (error.response?.status === 401) {
          notify('No pudimos validar tu cuenta de Google. Inténtalo de nuevo.', 'negative', 'warning')
        } else {
          notify('Error al iniciar sesión con Google.', 'negative', 'warning')
        }
      } finally {
        this.googleLoading = false
      }
    },
    /**
     * Callback de Google después de la autenticación
     */
    async handleGoogleCallback (response) {
      if (!response.credential) {
        notify('No se pudo obtener las credenciales de Google', 'negative', 'warning')
        return
      }

      this.googleLoading = true

      try {
        const result = await this.$axios.post('/authentication/google', {
          credential: response.credential
        })

        if (result.data.access_token) {
          // Guardar token en localStorage
          localStorage.setItem('access_token', result.data.access_token)
          localStorage.setItem('token_type', result.data.token_type)
          localStorage.setItem('user', JSON.stringify(result.data.user))

          notify('Inicio de sesión exitoso', 'positive', 'check_circle')

          // Redirigir según el tipo de usuario
          if (result.data.user.is_root) {
            this.$router.push({ name: 'Billing' })
          } else if (result.data.user?.roles?.length === 0) {
            notify('Usuario no tiene permisos', 'negative', 'warning')
          } else {
            this.$router.push({ name: 'Tutorial' })
          }
        }
      } catch (error) {
        console.error('Google login error:', error)

        if (error.response?.status === 404) {
          // Usuario no existe
          notify('No hay un usuario registrado con ese email', 'negative', 'warning')
        } else if (error.response?.status === 401) {
          // Token inválido
          notify('No pudimos validar tu cuenta de Google. Inténtalo de nuevo.', 'negative', 'warning')
        } else {
          // Error genérico
          notify('Error al iniciar sesión con Google.', 'negative', 'warning')
        }
      } finally {
        this.googleLoading = false
      }
    },
    /**
     * Cargar Facebook SDK
     */
    loadFacebookSDK () {
      // Verificar si ya está cargado
      if (window.FB) {
        this.facebookSDKLoaded = true
        return
      }

      // Configurar callback cuando el SDK esté listo
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: process.env.FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v23.0'
        })

        // Marcar como cargado
        this.facebookSDKLoaded = true
        console.log('Facebook SDK loaded successfully')
      }

      // Cargar el script
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/es_LA/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'

      script.onerror = () => {
        console.error('Error loading Facebook SDK')
        notify('Error al cargar Facebook SDK', 'negative', 'warning')
      }

      document.body.appendChild(script)
    },
    /**
     * Manejar login con Facebook
     */
    handleFacebookLogin () {
      // Verificar si el SDK está cargado
      if (!window.FB || !this.facebookSDKLoaded) {
        notify('Cargando Facebook... Intenta de nuevo en un momento', 'warning', 'info')

        // Intentar cargar el SDK si no está
        if (!window.FB) {
          this.loadFacebookSDK()
        }
        return
      }

      this.facebookLoading = true

      console.log('Iniciando login con Facebook...')

      window.FB.login((response) => {
        console.log('Facebook login response:', response)

        if (response.authResponse) {
          console.log('Usuario autenticado, obteniendo información...')
          // Usuario autenticado, obtener información
          this.getFacebookUserInfo(response.authResponse.accessToken)
        } else {
          console.log('Usuario canceló el login o hubo un error')
          // Usuario canceló el login
          this.facebookLoading = false
        }
      }, { scope: 'public_profile,email' })
    },
    /**
     * Obtener información del usuario de Facebook
     */
    getFacebookUserInfo (accessToken) {
      console.log('Obteniendo información del usuario con accessToken:', accessToken)

      window.FB.api('/me', { fields: 'id,name,email,picture' }, async (response) => {
        console.log('Facebook API response:', response)

        if (response && !response.error) {
          console.log('Datos del usuario:', {
            email: response.email,
            name: response.name,
            id: response.id,
            picture: response.picture?.data?.url
          })

          // Autenticar con el backend
          await this.authenticateWithFacebook(
            response.email,
            response.name,
            response.id,
            response.picture?.data?.url
          )
        } else {
          console.error('Error en Facebook API:', response.error)
          this.facebookLoading = false
          notify('Error al obtener información de Facebook', 'negative', 'warning')
        }
      })
    },
    /**
     * Autenticar con Facebook en el backend
     */
    async authenticateWithFacebook (email, name, facebookId, picture) {
      try {
        // Crear un credential con toda la información
        const credential = btoa(JSON.stringify({
          email,
          name,
          facebook_id: facebookId,
          picture
        }))

        const result = await this.$api.post('/authentication/facebook', {
          credential
        })

        if (result.data.access_token) {
          // Usar el mismo método que el login normal
          this.setSessionData(result.data)

          notify('Inicio de sesión exitoso', 'positive', 'check_circle')

          // Redirigir según el tipo de usuario
          if (result.data.user.is_root) {
            this.$router.push({ name: 'Billing' })
          } else if (result.data.user?.roles?.length === 0) {
            notify('Usuario no tiene permisos', 'negative', 'warning')
          } else {
            this.$router.push({ name: 'Tutorial' })
          }
        }
      } catch (error) {
        console.error('Facebook authentication error:', error)

        if (error.response?.status === 404) {
          notify('No hay un usuario registrado con ese email', 'negative', 'warning')
        } else if (error.response?.status === 401) {
          notify('No pudimos validar tu cuenta de Facebook. Inténtalo de nuevo.', 'negative', 'warning')
        } else {
          notify('Error al iniciar sesión con Facebook.', 'negative', 'warning')
        }
      } finally {
        this.facebookLoading = false
      }
    },
    /**
     * Login app
     */
    async loginAt () {
      try {
        this.btnDisable = true
        const data = await this.login({ username: this.username, password: this.password })
        if (data.is_root) {
          this.$router.push({ name: 'Billing' })
          return
        }
        if (data?.roles?.length === 0) {
          notify('Usuario no tiene permisos', 'negative', 'warning')
          return
        }
        this.$router.push({ name: 'Tutorial' })
        this.btnDisable = false
      } catch (error) {
        Notify.create({
          message: this.messageError[error?.message] || error.message,
          color: 'negative',
          position: 'top',
          icon: 'warning',
          timeout: 5000,
          actions: [
            {
              label: 'OK',
              color: 'white',
              handler: () => {
                this.btnDisable = false
              }
            }
          ]
        })
      } finally {
        this.btnDisable = false
      }
    },
    ...mapActions(authentication, ['login', 'setSessionData'])
  }
}
</script>
<style scoped>
/* Contenedor principal */
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
}

/* Fondo animado - Igual al MainLayout */
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
.login-card {
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 440px;
  padding: 24px 28px 20px;
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
  margin-bottom: 12px;
  animation: fadeInDown 0.6s ease-out 0.2s backwards;
}

.logo-img {
  width: 180px;
  max-width: 80%;
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
  margin-bottom: 20px;
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.welcome-title {
  font-size: 28px;
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
.login-form {
  animation: fadeIn 0.6s ease-out 0.4s backwards;
}

/* Inputs */
.input-container {
  margin-bottom: 14px;
  animation: slideUp 0.5s ease-out backwards;
}

.input-container:nth-child(1) { animation-delay: 0.5s; }
.input-container:nth-child(2) { animation-delay: 0.6s; }

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
  height: 48px;
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

/* Options */
.options-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  animation: fadeIn 0.5s ease-out 0.7s backwards;
}

.remember-checkbox {
  color: #374151;
}

.remember-checkbox :deep(.q-checkbox__label) {
  font-size: 14px;
  color: #374151;
}

.forgot-password-link {
  font-size: 13px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.forgot-password-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Botón Login */
.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s backwards;
  transition: all 0.3s ease;
  border: none !important;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.login-btn:active {
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
  margin-bottom: 16px;
  animation: fadeIn 0.5s ease-out 0.9s backwards;
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

/* Botones Sociales */
.social-container {
  display: flex;
  flex-direction: row;
  gap: 12px;
  margin-bottom: 18px;
  animation: fadeInUp 0.5s ease-out 1s backwards;
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

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.facebook-btn {
  background: rgba(55, 71, 92, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.facebook-btn:hover {
  background: rgba(60, 76, 97, 0.9);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.facebook-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(24, 119, 242, 0.3);
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Registro */
.register-container {
  text-align: center;
  animation: fadeIn 0.5s ease-out 1.1s backwards;
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

.footer-text {
  font-size: 12px;
  color: #9ca3af;
}

.qbits-logo {
  width: 65px;
  display: inline-block;
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    padding: 36px 28px;
    max-width: 95%;
  }

  .welcome-title {
    font-size: 26px;
  }

  .logo-img {
    width: 180px;
  }

  .social-container {
    flex-direction: column;
  }

  .social-btn {
    width: 100%;
  }
}
</style>
