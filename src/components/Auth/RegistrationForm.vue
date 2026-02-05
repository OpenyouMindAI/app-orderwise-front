<template>
  <div class="register-card">
    <slot name="actions" />
    <q-form @submit.prevent="handleSubmit" class="registration-form">
      <!-- Logo QBITS -->
      <div v-if="showLogo" class="logo-section">
        <q-img :src="qBitsLogo.black" class="logo-img" alt="QBITS" fit="contain" />
      </div>

      <!-- Header opcional -->
      <div v-if="showHeader" class="header-section">
        <span class="welcome-title">Crear cuenta</span>
        <p class="welcome-subtitle">Regístrate para comenzar</p>
      </div>

      <!-- Input Nombre -->
      <div class="input-container">
        <q-input
          v-model="form.name"
          placeholder="Nombre"
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

      <!-- Input Apellido -->
      <div class="input-container">
        <q-input
          v-model="form.last_name"
          placeholder="Apellido"
          class="custom-input"
          borderless
          dense
          hide-bottom-space
          :rules="[val => !!val || 'El apellido es requerido']"
        >
          <template v-slot:prepend>
            <q-icon name="person_outline" color="primary" size="20px"/>
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
              class="custom-input phone-field"
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
        class="full-width register-btn"
        :loading="loading"
        :disable="loading"
        unelevated
        no-caps
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
      <button
        type="button"
        class="social-btn google-btn"
        @click="$emit('google-register')"
        :disabled="loadingGoogle || loading"
      >
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

      <!-- Link a Login (opcional) -->
      <div v-if="showLoginLink" class="register-link-container">
        <span class="register-text">¿Ya tienes cuenta? </span>
        <router-link to="/login" class="register-link">Inicia sesión</router-link>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { useRegistration } from 'src/composables/useRegistration'
import { qBitsLogo } from 'src/const/mixins'

defineProps({
  showLogo: {

    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showLoginLink: {
    type: Boolean,
    default: false
  },

  // Estados externos
  loading: {
    type: Boolean,
    default: false
  },
  loadingGoogle: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'google-register'])

// Usar composable de registro
const {
  form,
  showPassword,
  showPasswordConfirm,
  selectedCountry,
  countryOptions,
  phoneRule
} = useRegistration()

/**
 * Maneja el submit del formulario
 */
const handleSubmit = () => {
  const phoneNumber = form.value.phone_number
    ? `${selectedCountry.value?.code || ''}${form.value.phone_number}`.trim()
    : ''

  emit('submit', {
    form: form.value,
    phoneNumber
  })
}
</script>

<style scoped>
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

/* ==================== LOGO ==================== */
.logo-section {
  text-align: center;
  margin-bottom: 0.5rem;
}

.logo-img {
  max-width: 120px;
  height: auto;
  margin: 0 auto;
}

/* ==================== HEADER ==================== */
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

/* ==================== FORM ==================== */
.registration-form {
  width: 100%;
}

.input-container {
  margin-bottom: 1rem;
}

/* ==================== CUSTOM INPUT ==================== */
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

/* ==================== PHONE INPUT ==================== */
.phone-input-container {
  margin-bottom: 1rem;
}

.phone-input-container .country-select :deep(.q-field__control) {
  padding-left: 12px;
  padding-right: 4px;
}

.country-flag {
  font-size: 20px;
  line-height: 1;
}

/* ==================== REGISTER BUTTON ==================== */
.register-btn {
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

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.register-btn:active {
  transform: translateY(0);
}

/* ==================== DIVIDER ==================== */
.divider-container {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

/* ==================== SOCIAL BUTTON ==================== */
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.social-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* ==================== LOGIN LINK ==================== */
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
</style>
