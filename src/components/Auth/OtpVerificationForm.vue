<template>
  <div class="register-card">
    <slot name="actions" />
    <div v-if="showHeader" class="header-section">
      <span class="welcome-title">{{ title }}</span>
    </div>

    <q-form @submit.prevent="handleSubmit" class="otp-form">
      <div class="text-center q-mb-lg">
        <q-icon name="email" size="64px" color="primary"/>
        <p class="text-grey-7" style="font-size: 15px; margin: 0;">
          {{ subtitle }}
        </p>
        <p class="text-primary text-weight-bold" style="font-size: 16px; margin-top: 4px;">
          {{ email }}
        </p>
      </div>

      <!-- Input OTP Custom (6 dígitos) -->
      <div class="row justify-center no-wrap q-gutter-x-sm q-mb-xl">
        <q-input
          v-for="(digit, index) in 6"
          :key="index"
          v-model="otpDigits[index]"
          dense
          outlined
          class="otp-digit-input"
          input-class="text-center text-weight-bold text-h6 text-uppercase"
          :ref="el => otpInputs[index] = el"
          @update:model-value="val => handleDigitInput(index, val)"
          @keydown.delete="e => handleDigitDelete(index, e)"
          @paste="handlePaste"
          maxlength="1"
          :autofocus="index === 0"
        />
      </div>

      <!-- Botón Verificar -->
      <q-btn
        type="submit"
        color="primary"
        class="verify-btn q-mb-md"
        :loading="loading"
        :disable="loading || otpCode.length < 6"
        unelevated
        no-caps
        size="lg"
      >
        Verificar Código
      </q-btn>

      <!-- Botón Reenviar Código -->
      <div class="text-center q-mb-md">
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          :disable="!canResend || loadingResend"
          @click="handleResend"
          :label="canResend ? (loadingResend ? '' : 'Reenviar código') : `Reenviar en ${resendTimer}s`"
        >
          <q-spinner-dots v-if="loadingResend && canResend" size="sm" />
        </q-btn>
      </div>

      <!-- Volver (Opcional) -->
      <div v-if="showBackLink" class="back-link-container">
        <span class="back-text">¿Número o correo incorrecto? </span>
        <a href="#" class="back-link" @click.prevent="$emit('back')">Volver</a>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Verificación'
  },
  subtitle: {
    type: String,
    default: 'Hemos enviado un código de verificación a'
  },
  loading: {
    type: Boolean,
    default: false
  },
  resendTimer: {
    type: Number,
    default: 0
  },
  showBackLink: {
    type: Boolean,
    default: false
  },
  loadingResend: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'resend', 'back'])

// OTP State
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const otpCode = computed(() => otpDigits.value.join(''))
const canResend = computed(() => props.resendTimer === 0)

/**
 * Handle digit input
 */
const handleDigitInput = (index, value) => {
  if (!value) return

  // Allow alphanumeric, remove special chars
  const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  // Update current index
  otpDigits.value[index] = char.slice(-1)

  // Move to next input if value exists
  if (char && index < 5) {
    otpInputs.value[index + 1].focus()
  }
}

/**
 * Handle digit delete / backspace
 */
const handleDigitDelete = (index, event) => {
  if (!otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1].focus()
  }
}

/**
 * Handle paste event
 */
const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  if (pastedData) {
    const chars = pastedData.split('').slice(0, 6)
    chars.forEach((char, i) => {
      otpDigits.value[i] = char
    })
    // Focus last filled input or the last input if full
    const focusIndex = Math.min(chars.length, 5)
    otpInputs.value[focusIndex].focus()
  }
}

/**
 * Handle form submit
 */
const handleSubmit = () => {
  emit('submit', otpCode.value)
}

/**
 * Handle resend
 */
const handleResend = () => {
  emit('resend')
}

/**
 * Reset OTP inputs
 */
const resetOtp = () => {
  otpDigits.value = ['', '', '', '', '', '']
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus()
  }
}

// Expose reset method for parent component
defineExpose({
  resetOtp
})
</script>

<style scoped>
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

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 16px;
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100% );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  font-family: 'Roboto', sans-serif;
  display: block;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Form */
.otp-form {
  animation: fadeIn 0.6s ease-out 0.4s backwards;
}

/* OTP Input Styles */
.otp-digit-input {
  width: 45px;
  height: 50px;
}

.otp-digit-input :deep(.q-field__control) {
  height: 50px;
  padding: 0;
  border-radius: 8px;
  background: white;
}

.otp-digit-input :deep(.q-field__control):hover {
  border-color: #667eea !important;
}

.otp-digit-input :deep(.q-field__native) {
  font-size: 24px;
  padding: 0;
  line-height: 56px;
}

/* Verify Button */
.verify-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1s backwards;
  transition: all 0.3s ease;
  border: none !important;
}

.verify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
}

.verify-btn:active {
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

/* Back Link */
.back-link-container {
  text-align: center;
  font-size: 14px;
  animation: fadeIn 0.5s ease-out 1.3s backwards;
}

.back-text {
  color: #6b7280;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
