<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Verificar Código</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Ingrese el código de 6 dígitos enviado a su {{ channelLabel }}.
        </div>

        <!-- Mostrar identifier enmascarado -->
        <div class="text-center q-mb-md">
          <q-chip color="primary" text-color="white" icon="info">
            {{ maskedIdentifier }}
          </q-chip>
        </div>

        <!-- Input de código OTP -->
        <q-input
          v-model="code"
          label="Código de verificación"
          type="text"
          outlined
          dense
          maxlength="6"
          mask="######"
          placeholder="000000"
          input-class="text-center text-h5 letter-spacing-lg"
          :rules="[
            val => !!val || 'Ingrese el código',
            val => val.length === 6 || 'El código debe tener 6 dígitos'
          ]"
          @keyup.enter="verifyCode"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- Temporizador de expiración -->
        <div v-if="timeRemaining > 0" class="text-center q-mt-sm text-grey-7">
          <q-icon name="schedule" size="sm" />
          Código válido por: {{ formatTime(timeRemaining) }}
        </div>
        <div v-else class="text-center q-mt-sm text-negative">
          <q-icon name="error" size="sm" />
          El código ha expirado
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="text-negative q-mt-sm">
          <q-icon name="error" size="sm" />
          {{ errorMessage }}
        </div>

        <!-- Reenviar código -->
        <div class="text-center q-mt-md">
          <q-btn
            flat
            dense
            no-caps
            label="¿No recibió el código? Reenviar"
            color="primary"
            @click="resendCode"
            :loading="resending"
            :disable="resendCooldown > 0"
          />
          <div v-if="resendCooldown > 0" class="text-caption text-grey-6">
            Puede reenviar en {{ resendCooldown }}s
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          v-close-popup
          :disable="loading"
        />
        <q-btn
          unelevated
          label="Verificar"
          color="primary"
          @click="verifyCode"
          :loading="loading"
          :disable="!code || code.length !== 6 || loading || timeRemaining <= 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

export default {
  name: 'VerifyResetCodeDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    identifier: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      required: true,
      validator: (val) => ['email', 'whatsapp'].includes(val)
    },
    sessionToken: {
      type: String,
      default: null
    },
    expiresAt: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'code-verified', 'resend-requested'],
  setup (props, { emit }) {
    const code = ref('')
    const loading = ref(false)
    const resending = ref(false)
    const errorMessage = ref('')
    const timeRemaining = ref(300) // 5 minutos por defecto
    const resendCooldown = ref(0)
    let countdownInterval = null
    let resendInterval = null

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const channelLabel = computed(() => {
      return props.channel === 'email' ? 'email' : 'WhatsApp'
    })

    const maskedIdentifier = computed(() => {
      if (!props.identifier) return ''

      if (props.channel === 'email') {
        const [local, domain] = props.identifier.split('@')
        const maskedLocal = local.substring(0, 2) + '***'
        return maskedLocal + '@' + domain
      } else {
        const phone = props.identifier
        return phone.substring(0, 3) + '***' + phone.substring(phone.length - 2)
      }
    })

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const startCountdown = () => {
      if (countdownInterval) clearInterval(countdownInterval)

      if (props.expiresAt) {
        const expiryTime = new Date(props.expiresAt).getTime()
        const now = new Date().getTime()
        timeRemaining.value = Math.max(0, Math.floor((expiryTime - now) / 1000))
      }

      countdownInterval = setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value--
        } else {
          clearInterval(countdownInterval)
        }
      }, 1000)
    }

    const startResendCooldown = () => {
      resendCooldown.value = 60
      if (resendInterval) clearInterval(resendInterval)

      resendInterval = setInterval(() => {
        if (resendCooldown.value > 0) {
          resendCooldown.value--
        } else {
          clearInterval(resendInterval)
        }
      }, 1000)
    }

    const verifyCode = async () => {
      if (!code.value || code.value.length !== 6) return

      errorMessage.value = ''
      loading.value = true

      try {
        const response = await api.post('otp/verify', {
          identifier: props.identifier,
          code: code.value,
          purpose: 'reset_password',
          session_token: props.sessionToken
        })

        if (response.data.success) {
          notify('Código verificado correctamente', 'positive', 'check_circle')
          emit('code-verified', {
            identifier: props.identifier,
            code: code.value,
            sessionToken: props.sessionToken
          })
          showDialog.value = false
        } else {
          errorMessage.value = response.data.message || 'Código incorrecto'
          if (response.data.remaining_attempts !== undefined) {
            errorMessage.value += ` (${response.data.remaining_attempts} intentos restantes)`
          }
        }
      } catch (error) {
        console.error('Error verifying code:', error)
        errorMessage.value = error.response?.data?.message || 'Error al verificar el código'
        notify('Código incorrecto', 'negative', 'error')
      } finally {
        loading.value = false
      }
    }

    const resendCode = async () => {
      resending.value = true
      errorMessage.value = ''

      try {
        const response = await api.post('otp/resend', {
          identifier: props.identifier,
          channel: props.channel,
          purpose: 'reset_password'
        })

        if (response.data.success) {
          notify('Código reenviado exitosamente', 'positive', 'check_circle')
          emit('resend-requested', {
            sessionToken: response.data.session_token,
            expiresAt: response.data.expires_at
          })
          startResendCooldown()
          startCountdown()
        } else {
          errorMessage.value = response.data.message || 'Error al reenviar el código'
        }
      } catch (error) {
        console.error('Error resending code:', error)
        errorMessage.value = error.response?.data?.message || 'Error al reenviar el código'
        notify('Error al reenviar el código', 'negative', 'error')
      } finally {
        resending.value = false
      }
    }

    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        code.value = ''
        errorMessage.value = ''
        startCountdown()
      } else {
        if (countdownInterval) clearInterval(countdownInterval)
        if (resendInterval) clearInterval(resendInterval)
      }
    })

    onUnmounted(() => {
      if (countdownInterval) clearInterval(countdownInterval)
      if (resendInterval) clearInterval(resendInterval)
    })

    return {
      showDialog,
      code,
      loading,
      resending,
      errorMessage,
      timeRemaining,
      resendCooldown,
      channelLabel,
      maskedIdentifier,
      formatTime,
      verifyCode,
      resendCode
    }
  }
}
</script>

<style lang="scss" scoped>
.letter-spacing-lg {
  letter-spacing: 0.5em;
}
</style>
