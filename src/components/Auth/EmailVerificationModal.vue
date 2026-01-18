<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 550px; max-width: 90vw; border-radius: 16px;">
      <!-- Header -->
      <q-card-section class="text-center q-pt-xl q-pb-lg">
        <div class="q-mb-md">
          <q-avatar size="80px" color="orange-1" text-color="orange-7">
            <q-icon name="mark_email_unread" size="40px" />
          </q-avatar>
        </div>
        <div class="text-h5 text-weight-bold q-mb-xs">
          Verifica tu Correo Electrónico
        </div>
        <div class="text-body2 text-grey-7">
          Para continuar, necesitas verificar tu correo electrónico
        </div>
      </q-card-section>

      <!-- Contenido -->
      <q-card-section class="q-pa-lg">
        <!-- Modo: Mostrar email actual -->
        <div v-if="!editingEmail && !verifyingCode">
          <div class="text-center q-mb-lg">
            <q-icon name="mail" color="primary" size="64px" class="q-mb-sm" />
            <div class="text-body2 text-grey-7">
              Tu correo actual es:
            </div>
            <div class="text-body1 text-weight-bold text-primary q-mt-xs q-mb-md">
              {{ currentEmail }}
            </div>
            <div class="text-body2 text-grey-6">
              ¿Es correcto este correo?
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="q-gutter-y-sm">
            <q-btn
              color="primary"
              class="full-width"
              :loading="sendingCode"
              :disable="sendingCode"
              unelevated
              no-caps
              size="lg"
              @click="sendVerificationCode"
            >
              <q-icon name="send" size="20px" class="q-mr-sm"/>
              Sí, enviar código de verificación
            </q-btn>

            <q-btn
              outline
              color="primary"
              class="full-width"
              no-caps
              size="lg"
              @click="editingEmail = true"
            >
              <q-icon name="edit" size="20px" class="q-mr-sm"/>
              No, cambiar correo electrónico
            </q-btn>
          </div>
        </div>

        <!-- Modo: Editar email -->
        <div v-if="editingEmail && !verifyingCode">
          <q-form @submit.prevent="updateAndSendCode">
            <div class="text-body2 text-grey-7 q-mb-md">
              Ingresa tu nuevo correo electrónico:
            </div>

            <q-input
              v-model="newEmail"
              type="email"
              label="Correo electrónico"
              outlined
              dense
              :rules="[
                val => !!val || 'El correo es requerido',
                val => /.+@.+\..+/.test(val) || 'Correo inválido'
              ]"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>

            <div class="q-gutter-y-sm">
              <q-btn
                type="submit"
                color="primary"
                class="full-width"
                :loading="updatingEmail"
                :disable="updatingEmail || !newEmail"
                unelevated
                no-caps
                size="lg"
              >
                <q-icon name="save" size="20px" class="q-mr-sm"/>
                Actualizar y enviar código
              </q-btn>

              <q-btn
                flat
                color="grey-7"
                class="full-width"
                no-caps
                @click="cancelEditEmail"
              >
                Cancelar
              </q-btn>
            </div>
          </q-form>
        </div>

        <!-- Modo: Verificar código -->
        <div v-if="verifyingCode">
          <div class="text-center q-mb-lg">
            <q-icon name="mail" color="primary" size="64px" class="q-mb-sm" />
            <div class="text-body2 text-grey-7">
              Código enviado a
            </div>
            <div class="text-body1 text-weight-bold text-primary q-mt-xs">
              {{ currentEmail }}
            </div>
          </div>

          <q-form @submit.prevent="verifyCode">
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
              :loading="verifying"
              :disable="verifying || otpCode.length < 6"
              unelevated
              no-caps
              size="lg"
            >
              <q-icon name="check_circle" size="20px" class="q-mr-sm"/>
              Verificar Código
            </q-btn>

            <!-- Botón Reenviar -->
            <div class="text-center q-mb-md">
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                :disable="!canResend"
                @click="resendCode"
                :label="canResend ? 'Reenviar código' : `Reenviar en ${resendTimer}s`"
              />
            </div>

            <!-- Volver -->
            <div class="text-center">
              <q-btn
                flat
                dense
                no-caps
                color="grey-7"
                @click="backToEmailView"
              >
                <q-icon name="arrow_back" size="18px" class="q-mr-xs"/>
                Volver
              </q-btn>
            </div>
          </q-form>
        </div>
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
  userEmail: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'verified', 'email-updated'])

// State
const editingEmail = ref(false)
const verifyingCode = ref(false)
const currentEmail = ref(props.userEmail)
const newEmail = ref('')
const sendingCode = ref(false)
const updatingEmail = ref(false)
const verifying = ref(false)

// OTP state
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const sessionToken = ref('')

// Resend timer
const resendTimer = ref(60)
const canResend = computed(() => resendTimer.value === 0)
let resendInterval = null

// Computed OTP code
const otpCode = computed(() => otpDigits.value.join(''))

// Watch props
watch(() => props.userEmail, (newVal) => {
  currentEmail.value = newVal
})

// Watch dialog open
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset state
    editingEmail.value = false
    verifyingCode.value = false
    newEmail.value = ''
    otpDigits.value = ['', '', '', '', '', '']
  } else {
    // Clear timer on close
    if (resendInterval) {
      clearInterval(resendInterval)
    }
  }
})

/**
 * Send verification code to current email
 */
const sendVerificationCode = async () => {
  try {
    sendingCode.value = true

    const { data } = await api.post('otp/send', {
      identifier: currentEmail.value,
      channel: 'email',
      purpose: 'verify_email'
    })

    sessionToken.value = data.session_token || ''

    notify('Código enviado a tu correo', 'positive', 'mail')

    // Switch to verification mode
    verifyingCode.value = true
    startResendTimer()

    // Focus first input
    setTimeout(() => {
      if (otpInputs.value[0]) {
        otpInputs.value[0].focus()
      }
    }, 300)
  } catch (error) {
    const message = error.response?.data?.message || 'Error al enviar código'
    notify(message, 'negative', 'warning')
  } finally {
    sendingCode.value = false
  }
}

/**
 * Update email and send verification code
 */
const updateAndSendCode = async () => {
  try {
    updatingEmail.value = true

    // Update email in backend
    await api.put('user/update-email', {
      email: newEmail.value
    })

    // Update current email
    currentEmail.value = newEmail.value

    notify('Correo actualizado', 'positive', 'check_circle')

    // Emit event to update parent
    emit('email-updated', newEmail.value)

    // Send verification code
    editingEmail.value = false
    await sendVerificationCode()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al actualizar correo'
    notify(message, 'negative', 'warning')
  } finally {
    updatingEmail.value = false
  }
}

/**
 * Cancel edit email
 */
const cancelEditEmail = () => {
  editingEmail.value = false
  newEmail.value = ''
}

/**
 * Verify code
 */
const verifyCode = async () => {
  if (otpCode.value.length < 6) {
    notify('Por favor ingresa el código completo', 'negative', 'warning')
    return
  }

  try {
    verifying.value = true

    await api.post('otp/verify', {
      identifier: currentEmail.value,
      code: otpCode.value,
      purpose: 'verify_email',
      session_token: sessionToken.value
    })

    notify('Correo verificado exitosamente', 'positive', 'check_circle')
    emit('verified')
    closeDialog()
  } catch (error) {
    const message = error.response?.data?.message || 'Código inválido o expirado'
    notify(message, 'negative', 'warning')

    // Clear OTP inputs on error
    otpDigits.value = ['', '', '', '', '', '']
    if (otpInputs.value[0]) {
      otpInputs.value[0].focus()
    }
  } finally {
    verifying.value = false
  }
}

/**
 * Resend code
 */
const resendCode = async () => {
  try {
    await api.post('otp/resend', {
      identifier: currentEmail.value,
      channel: 'email',
      purpose: 'verify_email',
      session_token: sessionToken.value
    })

    notify('Código reenviado a tu correo', 'positive', 'mail')
    startResendTimer()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al reenviar código'
    notify(message, 'negative', 'warning')
  }
}

/**
 * Back to email view
 */
const backToEmailView = () => {
  verifyingCode.value = false
  otpDigits.value = ['', '', '', '', '', '']
  if (resendInterval) {
    clearInterval(resendInterval)
  }
}

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
 * Close dialog
 */
const closeDialog = () => {
  emit('update:modelValue', false)
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
