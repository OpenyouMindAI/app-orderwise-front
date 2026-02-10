<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
    class="custom-dialog-wrapper"
  >
    <OtpVerificationForm
      :email="email"
      :loading="loading"
      :resend-timer="resendTimer"
      :show-header="true"
      :show-back-link="showBackLink"
      :title="'Verificación de Correo'"
      :subtitle="'Ingresa el código que enviamos a tu email'"
      @submit="verifyOtp"
      @resend="resendOtp"
      @back="$emit('back')"
    >
      <template #actions>
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
      </template>
    </OtpVerificationForm>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import OtpVerificationForm from './OtpVerificationForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  email: {
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
  },
  showBackLink: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'verified', 'error', 'back'])

const loading = ref(false)
const resendTimer = ref(60)
let resendInterval = null

// Watch dialog open to start timer
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    startResendTimer()
  } else {
    if (resendInterval) clearInterval(resendInterval)
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
 * Verify OTP
 */
const verifyOtp = async (code) => {
  try {
    loading.value = true

    const { data } = await api.post('otp/verify', {
      identifier: props.email,
      code,
      purpose: props.purpose,
      session_token: props.sessionToken
    })

    emit('verified', data)
    closeDialog()
  } catch (error) {
    const message = error.response?.data?.message || 'Código inválido o expirado'
    notify(message, 'negative', 'warning')
    emit('error', error)
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
      identifier: props.email,
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
}
</script>

<style>
.custom-dialog-wrapper.q-dialog .q-dialog__inner--minimized {
  padding: 0 !important;
}
</style>
