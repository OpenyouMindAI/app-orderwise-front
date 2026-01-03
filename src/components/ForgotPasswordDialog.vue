<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 480px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Recuperar Contraseña</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup :disable="loading" />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Ingresa tu número de teléfono para recibir un código de verificación por WhatsApp.
        </div>

        <!-- Phone input -->
        <q-input
          v-model="identifier"
          label="Número de teléfono"
          type="tel"
          outlined
          dense
          prefix="+"
          placeholder="59899123456"
          hint="Incluye el código de país (ej: 598 para Uruguay)"
          :rules="[
            val => !!val || 'El número es requerido',
            val => validatePhone(val)
          ]"
          @keyup.enter="sendCode"
        >
          <template v-slot:prepend>
            <q-icon name="whatsapp" color="positive" />
          </template>
        </q-input>

        <!-- Error message -->
        <div v-if="errorMessage" class="text-negative q-mt-md">
          <q-icon name="error" size="sm" />
          {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="text-positive q-mt-md">
          <q-icon name="check_circle" size="sm" />
          {{ successMessage }}
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
          label="Enviar Código"
          color="primary"
          @click="sendCode"
          :loading="loading"
          :disable="!identifier || loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'

export default {
  name: 'ForgotPasswordDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'code-sent'],
  setup (props, { emit }) {
    const channel = ref('whatsapp')
    const identifier = ref('')
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email) || 'Email inválido'
    }

    const validatePhone = (phone) => {
      const cleaned = phone.replace(/[^0-9]/g, '')
      return cleaned.length >= 10 || 'Número de teléfono inválido (mínimo 10 dígitos)'
    }

    const sendCode = async () => {
      errorMessage.value = ''
      successMessage.value = ''
      loading.value = true

      try {
        const response = await api.post('password-reset/request', {
          identifier: identifier.value,
          channel: channel.value
        })

        if (response.data.success) {
          successMessage.value = 'Código enviado exitosamente'
          notify('Código enviado. Revise su ' + (channel.value === 'email' ? 'email' : 'WhatsApp'), 'positive', 'check_circle')

          // Emitir evento con los datos para el siguiente paso
          setTimeout(() => {
            emit('code-sent', {
              identifier: identifier.value,
              channel: channel.value,
              sessionToken: response.data.session_token,
              expiresAt: response.data.expires_at
            })
            showDialog.value = false
          }, 1500)
        } else {
          errorMessage.value = response.data.message || 'Error al enviar el código'
          notify(errorMessage.value, 'negative', 'error')
        }
      } catch (error) {
        console.error('Error sending reset code:', error)
        const message = error?.message || 'Error al enviar el código. Intente nuevamente.'
        errorMessage.value = message
        notify(message, 'negative', 'error')
      } finally {
        loading.value = false
      }
    }

    return {
      showDialog,
      channel,
      identifier,
      loading,
      errorMessage,
      successMessage,
      validateEmail,
      validatePhone,
      sendCode
    }
  }
}
</script>

<style lang="scss" scoped>
/* Minimal styles - uses Quasar defaults */
</style>
