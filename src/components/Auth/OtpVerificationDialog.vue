<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 500px; max-width: 90vw; border-radius: 16px;">
      <!-- Close Button -->
      <q-btn
        flat
        round
        dense
        icon="close"
        color="grey-8"
        @click="closeDialog"
        class="absolute-top-right q-ma-md"
        style="z-index: 10;"
      />

      <!-- Header -->
      <q-card-section class="text-center q-pt-xl q-pb-lg">
        <div class="q-mb-md">
          <q-avatar size="80px" color="green-1" text-color="green-7">
            <q-icon name="verified_user" size="40px" />
          </q-avatar>
        </div>
        <div class="text-h5 text-weight-bold q-mb-xs">
          Verificación de Correo
        </div>
        <div class="text-body2 text-grey-7">
          Ingresa el código que enviamos a tu email
        </div>
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="q-pa-lg">
        <q-form @submit.prevent="verifyOtp">
          <!-- Email Icon y correo -->
          <div class="text-center q-mb-lg">
            <q-icon name="mail" color="primary" size="64px" class="q-mb-sm" />
            <div class="text-body2 text-grey-7">
              Código enviado a tu correo electrónico
            </div>
            <div class="text-body1 text-weight-bold text-primary q-mt-xs">
              {{ identifier }}
            </div>
          </div>

          <!-- Input OTP (6 dígitos) -->
          <div class="row justify-center no-wrap q-gutter-x-sm q-mb-lg">
            <q-input
              v-for="(digit, index) in 6"
              :key="index"
              v-model="otpDigits[index]"
              dense
              outlined
              class="otp-digit-input"
              input-class="text-center text-weight-bold text-h6"
              :ref="el => otpInputs[index] = el"
              @update:model-value="val => handleDigitInput(index, val)"
              @keydown.delete="e => handleDigitDelete(index, e)"
              @paste="handlePaste"
              maxlength="1"
            />
          </div>

          <!-- Botón Verificar -->
          <q-btn
            type="submit"
            color="primary"
            class="full-width q-mb-md"
            :loading="loading"
            :disable="loading || otpCode.length < 6"
            unelevated
            no-caps
            size="lg"
          >
            <q-icon name="check_circle" size="20px" class="q-mr-sm"/>
            Verificar Código
          </q-btn>

          <!-- Botón Reenviar -->
          <div class="text-center">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              :disable="!canResend"
              @click="resendOtp"
              :label="canResend ? 'Reenviar código' : `Reenviar en ${resendTimer}s`"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  identifier: {
    type: String,
    required: true
  },
  sessionToken: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    default: 'verify_email',
    validator: (value) => ['register', 'verify_email', 'verify_phone', 'login'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'verified', 'error'])

// OTP state
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const loading = ref(false)

// Resend timer
const resendTimer = ref(60)
const canResend = computed(() => resendTimer.value === 0)
let resendInterval = null

// Computed OTP code
const otpCode = computed(() => otpDigits.value.join(''))

// Watch dialog open to start timer
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    startResendTimer()
    // Focus first input
    setTimeout(() => {
      if (otpInputs.value[0]) {
        otpInputs.value[0].focus()
      }
    }, 300)
  } else {
    // Clear timer on close
    if (resendInterval) {
      clearInterval(resendInterval)
    }
  }
})

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
 * Handle digit input
 */
const handleDigitInput = (index, value) => {
  if (!value) return

  // Only allow numbers
  const char = value.replace(/[^0-9]/g, '')

  // Update current index
  otpDigits.value[index] = char.slice(-1)

  // Move to next input if value exists
  if (char && index < 5) {
    otpInputs.value[index + 1].focus()
  }
}

/**
 * Handle digit delete
 */
const handleDigitDelete = (index, event) => {
  if (!otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1].focus()
  }
}

/**
 * Handle paste
 */
const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '')

  if (pastedData) {
    const chars = pastedData.split('').slice(0, 6)
    chars.forEach((char, i) => {
      otpDigits.value[i] = char
    })
    // Focus last filled input
    const focusIndex = Math.min(chars.length, 5)
    otpInputs.value[focusIndex].focus()
  }
}

/**
 * Verify OTP
 */
const verifyOtp = async () => {
  if (otpCode.value.length < 6) {
    notify('Por favor ingresa el código completo', 'negative', 'warning')
    return
  }

  try {
    loading.value = true

    const { data } = await api.post('otp/verify', {
      identifier: props.identifier,
      code: otpCode.value,
      purpose: props.purpose,
      session_token: props.sessionToken
    })
    console.log(data)
    emit('verified', data)
    closeDialog()
  } catch (error) {
    const message = error.response?.data?.message || 'Código inválido o expirado'
    notify(message, 'negative', 'warning')
    emit('error', error)

    // Clear OTP inputs on error
    otpDigits.value = ['', '', '', '', '', '']
    if (otpInputs.value[0]) {
      otpInputs.value[0].focus()
    }
  } finally {
    loading.value = false
  }
}

/**
 * Resend OTP
 */
const resendOtp = async () => {
  try {
    await api.post('otp/resend', {
      identifier: props.identifier,
      channel: 'email',
      purpose: props.purpose,
      session_token: props.sessionToken
    })

    notify('Código reenviado a tu correo', 'positive', 'mail')
    startResendTimer()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al reenviar código'
    notify(message, 'negative', 'warning')
  }
}

/**
 * Close dialog
 */
const closeDialog = () => {
  emit('update:modelValue', false)
  // Reset OTP
  otpDigits.value = ['', '', '', '', '', '']
}
</script>

<style scoped>
/* OTP Input */
.otp-digit-input {
  width: 50px;
}

.otp-digit-input :deep(.q-field__control) {
  height: 60px;
}

.otp-digit-input :deep(input) {
  font-size: 24px;
  font-weight: 700;
}
</style>
