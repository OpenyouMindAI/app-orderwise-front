<template>
  <div class="login-container">
    <!-- Animated background -->
    <div class="animated-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="login-card">
      <div class="logo-section">
        <q-img :src="qBitsLogo.black" class="logo-img" alt="QBITS" fit="contain" />
      </div>
      <div class="header-section">
        <span class="welcome-title">Cargando...</span>
        <p class="welcome-subtitle">Verificando enlace de restablecimiento</p>
      </div>
      <div class="text-center q-py-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </div>

    <!-- Invalid/expired token -->
    <div v-else-if="errorState" class="login-card">
      <div class="logo-section">
        <q-img :src="qBitsLogo.black" class="logo-img" alt="QBITS" fit="contain" />
      </div>
      <div class="header-section">
        <span class="welcome-title">Enlace inválido</span>
        <p class="welcome-subtitle">{{ errorMessage }}</p>
      </div>
      <div class="text-center q-py-md">
        <q-icon name="error_outline" size="64px" color="negative" />
      </div>
      <q-btn
        color="primary"
        class="full-width login-btn"
        unelevated
        no-caps
        size="lg"
        label="Ir al inicio de sesión"
        icon="login"
        @click="$router.push({ name: 'Login' })"
      />
    </div>

    <!-- Success state -->
    <div v-else-if="successState" class="login-card">
      <div class="logo-section">
        <q-img :src="qBitsLogo.black" class="logo-img" alt="QBITS" fit="contain" />
      </div>
      <div class="header-section">
        <span class="welcome-title">¡Listo!</span>
        <p class="welcome-subtitle">Tu contraseña ha sido actualizada exitosamente</p>
      </div>
      <div class="text-center q-py-md">
        <q-icon name="check_circle" size="64px" color="positive" />
      </div>
      <q-btn
        color="primary"
        class="full-width login-btn"
        unelevated
        no-caps
        size="lg"
        label="Iniciar sesión"
        icon="login"
        @click="$router.push({ name: 'Login' })"
      />
    </div>

    <!-- Password reset form -->
    <div v-else class="login-card">
      <q-form @submit.prevent="handleReset" class="login-form" ref="formRef">
        <!-- Logo -->
        <div class="logo-section">
          <q-img :src="qBitsLogo.black" class="logo-img" alt="QBITS" fit="contain" />
        </div>

        <!-- Header -->
        <div class="header-section">
          <span class="welcome-title">Nueva Contraseña</span>
          <p class="welcome-subtitle">
            Hola, ingresa tu nueva contraseña
          </p>
        </div>

        <!-- Password -->
        <div class="input-container">
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Nueva contraseña"
            class="custom-input"
            borderless
            dense
            hide-bottom-space
            :rules="passwordRules"
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

        <!-- Confirm Password -->
        <div class="input-container">
          <q-input
            v-model="form.password_confirmation"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirmar contraseña"
            class="custom-input"
            borderless
            dense
            hide-bottom-space
            :rules="confirmPasswordRules"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" size="20px"/>
            </template>
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                color="grey-5"
                size="20px"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </div>

        <!-- Password strength -->
        <div class="strength-container q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">Fortaleza de la contraseña:</div>
          <q-linear-progress
            :value="passwordStrength / 100"
            :color="passwordStrengthColor"
            size="8px"
            rounded
          />
          <div class="text-caption q-mt-xs" :class="'text-' + passwordStrengthColor">
            {{ passwordStrengthLabel }}
          </div>
        </div>

        <!-- Requirements -->
        <div class="requirements-container q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">Requisitos:</div>
          <div class="requirement-list">
            <div :class="form.password.length >= 8 ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="form.password.length >= 8 ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Mínimo 8 caracteres
            </div>
            <div :class="/[A-Z]/.test(form.password) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[A-Z]/.test(form.password) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Una letra mayúscula
            </div>
            <div :class="/[a-z]/.test(form.password) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[a-z]/.test(form.password) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Una letra minúscula
            </div>
            <div :class="/[0-9]/.test(form.password) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[0-9]/.test(form.password) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Un número
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="formError" class="text-negative text-caption q-mb-sm">
          <q-icon name="error" size="sm" />
          {{ formError }}
        </div>

        <!-- Submit -->
        <q-btn
          type="submit"
          color="primary"
          class="full-width login-btn"
          :loading="submitting"
          :disable="!isFormValid || submitting"
          unelevated
          no-caps
          size="lg"
        >
          <q-icon name="lock_reset" size="20px" class="q-mr-sm"/>
          Cambiar Contraseña
        </q-btn>

        <!-- Back to login -->
        <div class="register-link-container">
          <span class="register-text">¿Ya tienes acceso? </span>
          <router-link to="/login" class="register-link">Iniciar sesión</router-link>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { qBitsLogo } from 'src/const/mixins'
import { Notify } from 'quasar'

/**
 * Current route instance
 * @type {Object}
 */
const route = useRoute()

/**
 * Router instance
 * @type {Object}
 */
const router = useRouter()

/**
 * Loading state for token validation
 * @type {boolean}
 */
const loading = ref(true)

/**
 * Error state flag
 * @type {boolean}
 */
const errorState = ref(false)

/**
 * Error message to display
 * @type {string}
 */
const errorMessage = ref('')

/**
 * Success state flag
 * @type {boolean}
 */
const successState = ref(false)

/**
 * Submitting state flag
 * @type {boolean}
 */
const submitting = ref(false)

/**
 * User name from the token validation
 * @type {string}
 */
const userName = ref('')

/**
 * Show password toggle
 * @type {boolean}
 */
const showPassword = ref(false)

/**
 * Show confirm password toggle
 * @type {boolean}
 */
const showConfirmPassword = ref(false)

/**
 * Form error message
 * @type {string}
 */
const formError = ref('')

/**
 * Form reference
 * @type {Object}
 */
const formRef = ref(null)

/**
 * Form data
 * @type {Object}
 */
const form = ref({
  password: '',
  password_confirmation: ''
})

/**
 * Password validation rules
 * @type {Array}
 */
const passwordRules = [
  val => !!val || 'La contraseña es requerida',
  val => val.length >= 8 || 'Debe tener al menos 8 caracteres',
  val => /[A-Z]/.test(val) || 'Debe contener al menos una mayúscula',
  val => /[a-z]/.test(val) || 'Debe contener al menos una minúscula',
  val => /[0-9]/.test(val) || 'Debe contener al menos un número'
]

/**
 * Confirm password validation rules
 * @type {Array}
 */
const confirmPasswordRules = [
  val => !!val || 'Confirme su contraseña',
  val => val === form.value.password || 'Las contraseñas no coinciden'
]

/**
 * Computed password strength value (0-100)
 * @type {number}
 */
const passwordStrength = computed(() => {
  let strength = 0
  const password = form.value.password

  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  if (/[A-Z]/.test(password)) strength += 20
  if (/[a-z]/.test(password)) strength += 20
  if (/[0-9]/.test(password)) strength += 20
  if (/[^A-Za-z0-9]/.test(password)) strength += 20

  return Math.min(strength, 100)
})

/**
 * Computed password strength color
 * @type {string}
 */
const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 40) return 'negative'
  if (passwordStrength.value < 70) return 'warning'
  return 'positive'
})

/**
 * Computed password strength label
 * @type {string}
 */
const passwordStrengthLabel = computed(() => {
  if (passwordStrength.value < 40) return 'Débil'
  if (passwordStrength.value < 70) return 'Media'
  return 'Fuerte'
})

/**
 * Computed form validity
 * @type {boolean}
 */
const isFormValid = computed(() => {
  return form.value.password.length >= 8 &&
    /[A-Z]/.test(form.value.password) &&
    /[a-z]/.test(form.value.password) &&
    /[0-9]/.test(form.value.password) &&
    form.value.password === form.value.password_confirmation
})

/**
 * Validate the reset token on mount
 * @return {Promise<void>}
 */
const validateToken = async () => {
  try {
    const token = route.params.token
    const response = await api.get(`reset-password/validate/${token}`)
    userName.value = response.data.user_name
    loading.value = false
  } catch (error) {
    loading.value = false
    errorState.value = true
    errorMessage.value = error.response?.data?.message || 'El enlace de restablecimiento no es válido o ha expirado.'
  }
}

/**
 * Handle form submission to reset password
 * @return {Promise<void>}
 */
const handleReset = async () => {
  if (!isFormValid.value) return

  formError.value = ''
  submitting.value = true

  try {
    const token = route.params.token
    const response = await api.post(`reset-password/${token}`, {
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    })

    if (response.data.success) {
      successState.value = true
      Notify.create({
        message: 'Contraseña actualizada exitosamente',
        color: 'positive',
        icon: 'check_circle',
        position: 'top'
      })
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      if (errors?.password) {
        formError.value = errors.password[0]
      } else {
        formError.value = error.response.data.message || 'Error al actualizar la contraseña'
      }
    } else {
      formError.value = error.response?.data?.message || 'Error al actualizar la contraseña. Intente nuevamente.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  validateToken()
})
</script>

<style scoped>
/* Container principal */
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

/* Animated background */
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
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Card */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
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
  0% { opacity: 0; transform: translateY(50px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 0.5rem;
}

.logo-img {
  max-width: 120px;
  height: auto;
  margin: 0 auto;
}

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  display: block;
}

.welcome-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Form */
.login-form {
  width: 100%;
}

.input-container {
  margin-bottom: 1rem;
}

/* Custom Input */
.custom-input :deep(.q-field__control),
.custom-input :deep(.q-field__native) {
  min-height: 44px !important;
  height: 44px !important;
  max-height: 44px !important;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f9fafb !important;
  border: 1.5px solid #e5e7eb !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 12px;
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
  line-height: 1;
}

.custom-input :deep(.q-field__native)::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.custom-input :deep(.q-field__control):hover {
  background: #ffffff !important;
  border-color: #667eea !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.custom-input :deep(.q-field__control):focus-within {
  background: #ffffff !important;
  border-color: #667eea !important;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
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

/* Login button */
.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

/* Strength and requirements */
.strength-container {
  padding: 0 4px;
}

.requirement-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.requirements-container {
  padding: 0 4px;
}

/* Register link */
.register-link-container {
  text-align: center;
  margin-top: 1rem;
}

.register-text {
  color: #6b7280;
  font-size: 14px;
}

.register-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link:hover {
  color: #5a67d8;
  text-decoration: underline;
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
}
</style>
