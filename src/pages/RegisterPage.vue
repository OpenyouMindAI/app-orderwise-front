<template>
  <div class="register-container">
    <!-- Animated Background -->
    <div class="animated-bg">
      <!-- Floating Orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Grid Pattern -->
      <div class="grid-pattern"></div>

      <!-- Particles -->
      <div
        v-for="i in 30"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- Main content -->
    <div class="register-content">
      <div class="glass-card" :class="{ 'card-focused': isCardFocused }">
        <!-- Header -->
        <div class="register-header">
          <div class="logo-container">
            <div class="logo-glow"></div>
            <q-img
              :src="logo.color"
              class="logo-img"
              @load="onLogoLoad"
            />
          </div>

          <div class="welcome-text">
            <div class="text-h4 text-weight-light text-grey-8 q-mb-xs">Crear Cuenta</div>
            <div class="text-body1 text-grey-6">Únete a nuestra plataforma</div>
          </div>
        </div>
        <!-- Social Buttons -->
        <div class="social-section">
          <q-btn
            @click="loginWithGoogle"
            class="social-btn google-btn"
            :loading="googleLoading"
            no-caps
            unelevated
            rounded
          >
            <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="social-text">Google</span>
          </q-btn>

          <q-btn
            @click="loginWithFacebook"
            class="social-btn facebook-btn"
            :loading="facebookLoading"
            no-caps
            unelevated
            rounded
          >
            <svg class="social-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span class="social-text">Facebook</span>
          </q-btn>
        </div>

        <!-- Divider -->
        <div class="divider-section">
          <div class="divider-line"></div>
          <span class="divider-text">o regístrate con email</span>
          <div class="divider-line"></div>
        </div>

        <!-- Registration Form -->
        <q-form @submit="register" class="register-form">
          <div class="form-row">
            <q-input
              v-model="form.name"
              label="Nombre"
              class="hero-input"
              outlined
              rounded
              :rules="[val => !!val || 'El nombre es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-input>

            <q-input
              v-model="form.lastname"
              label="Apellido"
              class="hero-input"
              outlined
              rounded
              :rules="[val => !!val || 'El apellido es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="person_outline" color="primary" />
              </template>
            </q-input>
          </div>

          <q-input
            v-model="form.username"
            label="Nombre de usuario"
            class="hero-input q-mb-md"
            outlined
            rounded
            :rules="[val => !!val || 'El nombre de usuario es requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="alternate_email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            class="hero-input q-mb-md"
            outlined
            rounded
            :rules="[
              val => !!val || 'El correo es requerido',
              val => /.+@.+\..+/.test(val) || 'Correo inválido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            class="hero-input q-mb-lg"
            outlined
            rounded
            :rules="[
              val => !!val || 'La contraseña es requerida',
              val => val.length >= 8 || 'Mínimo 8 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-btn
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                flat
                round
                dense
                @click="showPassword = !showPassword"
                class="password-toggle"
              />
            </template>
          </q-input>

          <!-- Register Button -->
          <q-btn
            type="submit"
            class="hero-btn login-btn"
            :loading="registerLoading"
            no-caps
            unelevated
          >
            <span v-if="!registerLoading">Crear Cuenta</span>
            <span v-else>Creando cuenta...</span>
          </q-btn>
        </q-form>

        <!-- Login Link -->
        <div class="register-section">
          <p class="register-text">
            ¿Ya tienes cuenta?
            <router-link to="/login" class="register-link">
              Iniciar sesión
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { logo } from 'src/const/mixins'
import { Notify } from 'quasar'
import { api } from 'boot/axios'
import { openSocialAuthPopup, handleSocialAuthSuccess, handleSocialAuthError, redirectToSocialAuth, testSocialAuthBackend } from 'src/utils/socialAuth'

export default {
  name: 'RegisterPage',
  data () {
    return {
      logo,
      showPassword: false,
      registerLoading: false,
      googleLoading: false,
      facebookLoading: false,
      isCardFocused: false,
      particles: [],
      form: {
        name: '',
        lastname: '',
        username: '',
        email: '',
        password: ''
      }
    }
  },
  mounted () {
    this.initParticles()
    this.initCardFocus()
  },
  methods: {
    async register () {
      try {
        this.registerLoading = true

        const response = await api.post('/authentication/register', this.form)

        // Store token
        localStorage.setItem('access_token', response.data.access_token)

        Notify.create({
          message: 'Cuenta creada exitosamente',
          color: 'positive',
          position: 'top',
          icon: 'check_circle'
        })

        // Redirect to dashboard or tutorial
        this.$router.push({ name: 'Tutorial' })
      } catch (error) {
        Notify.create({
          message: error.response?.data?.message || 'Error al crear la cuenta',
          color: 'negative',
          position: 'top',
          icon: 'error'
        })
      } finally {
        this.registerLoading = false
      }
    },

    async loginWithGoogle () {
      this.googleLoading = true
      
      const popup = this.openSocialAuthPopup(
        'google',
        (token, user) => {
          this.googleLoading = false
          this.handleSocialAuthSuccess(token, user, this.$router, this.$q.notify)
        },
        (error) => {
          this.googleLoading = false
          this.handleSocialAuthError(error, this.$q.notify)
        }
      )

      // If popup is blocked, offer direct redirect
      if (!popup) {
        this.googleLoading = false
        this.$q.dialog({
          title: 'Ventanas emergentes bloqueadas',
          message: '¿Deseas continuar con la autenticación en la misma ventana?',
          ok: 'Continuar',
          cancel: 'Cancelar'
        }).onOk(() => {
          this.redirectToSocialAuth('google')
        })
      }
    },

    async loginWithFacebook () {
      this.facebookLoading = true
      
      const popup = this.openSocialAuthPopup(
        'facebook',
        (token, user) => {
          this.facebookLoading = false
          this.handleSocialAuthSuccess(token, user, this.$router, this.$q.notify)
        },
        (error) => {
          this.facebookLoading = false
          this.handleSocialAuthError(error, this.$q.notify)
        }
      )

      // If popup is blocked, offer direct redirect
      if (!popup) {
        this.facebookLoading = false
        this.$q.dialog({
          title: 'Ventanas emergentes bloqueadas',
          message: '¿Deseas continuar con la autenticación en la misma ventana?',
          ok: 'Continuar',
          cancel: 'Cancelar'
        }).onOk(() => {
          this.redirectToSocialAuth('facebook')
        })
      }
    },

    // Import social auth utilities
    openSocialAuthPopup,
    handleSocialAuthSuccess,
    handleSocialAuthError,
    redirectToSocialAuth,

    async testBackend () {
      console.log('Testing backend connectivity...')
      const result = await testSocialAuthBackend()
      
      this.$q.notify({
        message: `Backend test: ${result.error ? 'Failed' : 'Success'}`,
        color: result.error ? 'negative' : 'positive',
        position: 'top',
        timeout: 5000,
        caption: JSON.stringify(result, null, 2)
      })
    },

    initParticles () {
      // Initialize particle positions and animations
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 10 + Math.random() * 20
        })
      }
    },

    initCardFocus () {
      // Add subtle card focus animation on load
      setTimeout(() => {
        this.isCardFocused = true
      }, 500)
    },

    onLogoLoad () {
      // Trigger logo animation when loaded
      const logoContainer = document.querySelector('.logo-container')
      if (logoContainer) {
        logoContainer.classList.add('logo-loaded')
      }
    },

    getParticleStyle (index) {
      const particle = this.particles[index - 1]
      if (!particle) return {}

      return {
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        animationDelay: `${particle.delay}s`,
        animationDuration: `${particle.duration}s`
      }
    }
  }
}
</script>

<style scoped>
/* Main Container */
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%);
}

/* Animated Background */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* Floating Orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 50%, transparent 70%);
  top: -175px;
  left: -175px;
  animation-delay: 0s;
}

.orb-2 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0.04) 50%, transparent 70%);
  top: 40%;
  right: -140px;
  animation-delay: -10s;
}

.orb-3 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.03) 50%, transparent 70%);
  bottom: -160px;
  left: 25%;
  animation-delay: -5s;
}

/* Grid Pattern */
.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(124, 58, 237, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124, 58, 237, 0.08) 1px, transparent 1px);
  background-size: 80px 80px;
  animation: grid-move 30s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Particles */
.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(124, 58, 237, 0.4);
  border-radius: 50%;
  animation: particle-float infinite linear;
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.3);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Main Content */
.register-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  z-index: 1;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 15px 45px rgba(124, 58, 237, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(20px);
  opacity: 0;
  animation: card-enter 1s ease-out 0.3s forwards;
}

.glass-card.card-focused {
  transform: translateY(0);
  box-shadow: 
    0 20px 60px rgba(124, 58, 237, 0.2),
    0 8px 25px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(124, 58, 237, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

@keyframes card-enter {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header Section */
.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.logo-container.logo-loaded .logo-glow {
  opacity: 1;
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
}

.logo-img {
  width: 180px;
  max-width: 70vw;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 20px rgba(124, 58, 237, 0.25));
}

.welcome-text {
  animation: text-enter 1s ease-out 0.6s both;
}

@keyframes text-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form Styles */
.register-form {
  margin-bottom: 32px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row .hero-input {
  flex: 1;
}

.hero-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(124, 58, 237, 0.2);
  transition: all 0.3s ease;
}

.hero-input :deep(.q-field__control):hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(124, 58, 237, 0.4);
}

.hero-input :deep(.q-field--focused .q-field__control) {
  background: rgba(255, 255, 255, 0.95);
  border-color: #7C3AED;
}

.hero-input :deep(.q-field__label) {
  color: rgba(55, 65, 81, 0.8);
}

.hero-input :deep(.q-field--focused .q-field__label) {
  color: #7C3AED;
}

.hero-input :deep(.q-field__native) {
  color: #374151;
}

.password-toggle {
  color: rgba(55, 65, 81, 0.6);
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #7C3AED;
}

/* Buttons */
.hero-btn {
  width: 100%;
  height: 56px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-btn {
  background: linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%);
  color: white;
  margin-bottom: 24px;
}

.login-btn:hover {
  background: linear-gradient(135deg, #6D28D9 0%, #0F766E 100%);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

/* Divider */
.divider-section {
  display: flex;
  align-items: center;
  margin: 32px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.25), transparent);
}

.divider-text {
  color: rgba(55, 65, 81, 0.7);
  font-size: 0.875rem;
  padding: 0 16px;
  white-space: nowrap;
}

/* Social Buttons */
.social-section {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.social-btn {
  flex: 1;
  height: 56px;
  border-radius: 16px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(255, 255, 255, 0.6);
  color: #374151;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}

.google-btn:hover {
  box-shadow: 0 8px 30px rgba(219, 68, 55, 0.3);
}

.facebook-btn:hover {
  box-shadow: 0 8px 30px rgba(24, 119, 242, 0.3);
}

.social-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.social-text {
  font-weight: 500;
}

/* Register Section */
.register-section {
  text-align: center;
  margin-bottom: 24px;
}

.register-text {
  color: rgba(55, 65, 81, 0.7);
  margin: 0;
  font-size: 0.875rem;
}

.register-link {
  color: #7C3AED;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #6D28D9;
}

/* Animation Delays for Staggered Entry */
.hero-input:nth-of-type(1) { animation: slide-up 0.6s ease-out 0.8s both; }
.hero-input:nth-of-type(2) { animation: slide-up 0.6s ease-out 0.9s both; }
.hero-input:nth-of-type(3) { animation: slide-up 0.6s ease-out 1s both; }
.hero-input:nth-of-type(4) { animation: slide-up 0.6s ease-out 1.1s both; }
.hero-input:nth-of-type(5) { animation: slide-up 0.6s ease-out 1.2s both; }
.login-btn { animation: slide-up 0.6s ease-out 1.3s both; }
.divider-section { animation: slide-up 0.6s ease-out 1.4s both; }
.social-section { animation: slide-up 0.6s ease-out 1.5s both; }
.register-section { animation: slide-up 0.6s ease-out 1.6s both; }

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus Styles */
.hero-btn:focus-visible {
  outline: 2px solid #7C3AED;
  outline-offset: 2px;
}

.hero-input :deep(.q-field--focused) {
  outline: none;
}

/* Responsive Design */
@media (max-width: 600px) {
  .register-container {
    padding: 16px;
  }
  
  .glass-card {
    padding: 24px;
    border-radius: 20px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .social-section {
    flex-direction: column;
  }
}

/* Dark Mode Enhancements */
.body--dark .glass-card {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(124, 58, 237, 0.2);
}

.body--dark .hero-input :deep(.q-field__control) {
  background: rgba(0, 0, 0, 0.3);
}

.body--dark .social-btn {
  background: rgba(0, 0, 0, 0.3);
}
</style>
