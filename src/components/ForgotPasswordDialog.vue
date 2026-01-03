<template>
  <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card class="forgot-password-card">
      <!-- Back Button -->
      <q-btn
        v-if="currentStep > 1"
        icon="arrow_back"
        flat
        round
        dense
        @click="previousStep"
        class="back-btn"
        :disable="loading"
      />

      <!-- Close Button -->
      <q-btn
        icon="close"
        flat
        round
        dense
        v-close-popup
        class="close-btn"
        :disable="loading"
      />

      <!-- Step Title -->
      <div class="step-title">
        {{ stepTitle }}
      </div>

      <!-- Content -->
      <q-card-section class="q-pa-lg">
        <!-- Step 1: Select Method -->
        <div v-if="currentStep === 1" class="step-content">
          <!-- Icon -->
          <div class="icon-wrapper">
            <div class="icon-circle">
              <q-icon name="lock_open" size="48px" color="primary" />
            </div>
          </div>

          <!-- Description -->
          <div class="step-description">
            Selecciona el método para recibir tu código de verificación
          </div>

          <!-- Method Cards -->
          <div class="method-cards">
            <div
              class="method-card"
              :class="{ 'selected': channel === 'email' }"
              @click="channel = 'email'"
            >
              <div class="method-icon-wrapper">
                <q-icon name="email" size="40px" />
              </div>
              <div class="method-title">Email</div>
              <div class="method-description">Recibe el código en tu correo electrónico</div>
              <q-icon v-if="channel === 'email'" name="check_circle" class="check-icon" color="primary" size="24px" />
            </div>

            <div
              class="method-card"
              :class="{ 'selected': channel === 'whatsapp' }"
              @click="channel = 'whatsapp'"
            >
              <div class="method-icon-wrapper whatsapp">
                <svg viewBox="0 0 24 24" class="whatsapp-icon">
                  <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div class="method-title">WhatsApp</div>
              <div class="method-description">Recibe el código por WhatsApp</div>
              <q-icon v-if="channel === 'whatsapp'" name="check_circle" class="check-icon" color="positive" size="24px" />
            </div>
          </div>
        </div>

        <!-- Step 2: Enter Identifier -->
        <div v-if="currentStep === 2" class="step-content">
          <!-- Icon -->
          <div class="icon-wrapper">
            <div class="icon-circle">
              <q-icon v-if="channel === 'email'" name="email" size="48px" color="primary" />
              <svg v-else viewBox="0 0 24 24" class="whatsapp-icon-large">
                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
          </div>

          <!-- Description -->
          <div class="step-description">
            {{ channel === 'email' ? 'Ingresa tu correo electrónico para recibir el código' : 'Ingresa tu número de WhatsApp para recibir el código' }}
          </div>

          <!-- Email Input -->
          <div v-if="channel === 'email'" class="input-wrapper">
            <div class="input-label">Correo Electrónico</div>
            <q-input
              v-model="email"
              type="email"
              outlined
              placeholder="correo@ejemplo.com"
              :rules="emailRules"
              class="step-input"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- WhatsApp Phone Input -->
          <div v-if="channel === 'whatsapp'" class="input-wrapper">
            <div class="input-label">Número de WhatsApp</div>
            <div class="row q-col-gutter-sm">
              <div class="col-5">
                <q-select
                  v-model="selectedCountry"
                  :options="countryOptions"
                  option-label="label"
                  outlined
                  emit-value
                  map-options
                  behavior="menu"
                  class="step-input"
                >
                  <template v-slot:selected>
                    <div class="row items-center no-wrap">
                      <span class="country-flag q-mr-xs">{{ selectedCountry?.flag || '🌍' }}</span>
                      <span class="text-caption">{{ selectedCountry?.code || '' }}</span>
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
              <div class="col-7">
                <q-input
                  v-model="phoneNumber"
                  type="tel"
                  outlined
                  :placeholder="selectedCountry?.mask?.replace(/#/g, '0') || 'Número'"
                  :rules="phoneRules"
                  class="step-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <div class="resend-link" v-if="codeSent">
            <a @click="sendCode" :class="{ 'disabled': loading }">Enviar código nuevamente</a>
          </div>
        </div>

        <!-- Step 3: Verify Code -->
        <div v-if="currentStep === 3" class="step-content">
          <!-- Icon -->
          <div class="icon-wrapper">
            <div class="icon-circle">
              <q-icon name="verified_user" size="48px" color="primary" />
            </div>
          </div>

          <!-- Description -->
          <div class="step-description">
            Ingresa el código de 6 dígitos enviado a {{ channel === 'email' ? email : 'tu WhatsApp' }}
          </div>

          <!-- OTP Input -->
          <div class="otp-wrapper">
            <div class="otp-inputs">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                class="otp-input"
                @input="handleOtpInput(index, $event)"
                @paste="handleOtpPaste($event)"
                @keydown="handleOtpKeydown(index, $event)"
                :ref="el => otpInputs[index] = el"
              />
            </div>
          </div>

          <div class="resend-link">
            <a @click="sendCode" :class="{ 'disabled': loading }">Reenviar código</a>
          </div>
        </div>

        <!-- Step 4: New Password -->
        <div v-if="currentStep === 4" class="step-content">
          <!-- Icon -->
          <div class="icon-wrapper">
            <div class="icon-circle">
              <q-icon name="lock" size="48px" color="primary" />
            </div>
          </div>

          <!-- Description -->
          <div class="step-description">
            Crea una nueva contraseña segura
          </div>

          <!-- Password Inputs -->
          <div class="input-wrapper">
            <div class="input-label">Nueva Contraseña</div>
            <q-input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              outlined
              placeholder="Mínimo 8 caracteres"
              :rules="passwordRules"
              class="step-input"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="input-wrapper">
            <div class="input-label">Confirmar Contraseña</div>
            <q-input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              outlined
              placeholder="Repite la contraseña"
              :rules="confirmPasswordRules"
              class="step-input"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Error Message -->
        <transition name="slide-fade">
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </transition>
      </q-card-section>

      <!-- Action Button -->
      <div class="action-wrapper">
        <q-btn
          unelevated
          :label="buttonLabel"
          class="action-btn"
          @click="handleAction"
          :loading="loading"
          :disable="isButtonDisabled"
        />
      </div>
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
    const currentStep = ref(1)
    const channel = ref('email')
    const phoneNumber = ref('')
    const email = ref('')
    const otpDigits = ref(['', '', '', '', '', ''])
    const otpInputs = ref([])
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    const codeSent = ref(false)
    const sessionToken = ref('')
    const identifier = ref('')

    // Country options
    const countryOptions = [
      { label: 'Argentina', code: '+54', mask: '## #### ####', regex: /^(?:(?:00)?549?)?0?[1-9]\d{9}$/, flag: '🇦🇷' },
      { label: 'Chile', code: '+56', mask: '#########', regex: /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/, flag: '🇨🇱' },
      { label: 'México', code: '+52', mask: '## #### ####', regex: /^(\+?52)?\s?1?\s?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}$/, flag: '🇲🇽' },
      { label: 'Colombia', code: '+57', mask: '### ### ####', regex: /^(\+?57)?\s?3[\d]{9}$/, flag: '🇨🇴' },
      { label: 'Perú', code: '+51', mask: '### ### ###', regex: /^(\+?51)?\s?9[\d]{8}$/, flag: '🇵🇪' },
      { label: 'Uruguay', code: '+598', mask: '## ### ###', regex: /^(\+?598)?\s?9[\d]{7}$/, flag: '🇺🇾' },
      { label: 'España', code: '+34', mask: '### ### ###', regex: /^(\+?34)?\s?[679]\d{8}$/, flag: '🇪🇸' },
      { label: 'Otro', code: '', mask: '', regex: /.+/, flag: '🌍' }
    ]

    const selectedCountry = ref(countryOptions[0])

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    // Phone validation rules
    const phoneRules = computed(() => {
      return [
        val => !!val || 'El número es requerido',
        val => {
          if (!val) return true
          if (!selectedCountry.value || !selectedCountry.value.regex) return true
          return selectedCountry.value.regex.test(val) || `Formato inválido (Ej: ${selectedCountry.value.mask.replace(/#/g, '0')})`
        }
      ]
    })

    // Email validation rules
    const emailRules = [
      val => !!val || 'El email es requerido',
      val => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(val) || 'Email inválido'
      }
    ]

    // Get full phone number with country code
    const getFullPhoneNumber = () => {
      if (!phoneNumber.value) return ''
      const cleanPhone = phoneNumber.value.replace(/\D/g, '')
      return `${selectedCountry.value?.code || ''}${cleanPhone}`.replace(/\+/g, '')
    }

    const stepTitle = computed(() => {
      const titles = {
        1: 'Recuperar Contraseña',
        2: channel.value === 'email' ? 'Ingresa tu Email' : 'Ingresa tu WhatsApp',
        3: 'Verificar Código',
        4: 'Nueva Contraseña'
      }
      return titles[currentStep.value] || ''
    })

    const buttonLabel = computed(() => {
      const labels = {
        1: 'Continuar',
        2: 'Enviar Código',
        3: 'Verificar',
        4: 'Guardar Contraseña'
      }
      return labels[currentStep.value] || 'Continuar'
    })

    const isButtonDisabled = computed(() => {
      if (loading.value) return true

      switch (currentStep.value) {
        case 1:
          return !channel.value
        case 2:
          return channel.value === 'whatsapp' ? !phoneNumber.value : !email.value
        case 3:
          return otpDigits.value.some(d => !d)
        case 4:
          return !newPassword.value || !confirmPassword.value || newPassword.value !== confirmPassword.value
        default:
          return false
      }
    })

    const passwordRules = [
      val => !!val || 'La contraseña es requerida',
      val => val.length >= 8 || 'Mínimo 8 caracteres'
    ]

    const confirmPasswordRules = [
      val => !!val || 'Confirma tu contraseña',
      val => val === newPassword.value || 'Las contraseñas no coinciden'
    ]

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
        errorMessage.value = ''
      }
    }

    const handleOtpInput = (index, event) => {
      const value = event.target.value
      if (value && index < 5) {
        otpInputs.value[index + 1]?.focus()
      }
    }

    const handleOtpPaste = (event) => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text').trim()
      const digits = pastedData.replace(/\D/g, '').slice(0, 6)

      if (digits.length > 0) {
        for (let i = 0; i < 6; i++) {
          otpDigits.value[i] = digits[i] || ''
        }
        // Focus en el último input con valor o el primero vacío
        const lastFilledIndex = Math.min(digits.length - 1, 5)
        otpInputs.value[lastFilledIndex]?.focus()
      }
    }

    const handleOtpKeydown = (index, event) => {
      if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        otpInputs.value[index - 1]?.focus()
      }
    }

    const sendCode = async () => {
      errorMessage.value = ''
      loading.value = true

      identifier.value = channel.value === 'whatsapp' ? getFullPhoneNumber() : email.value

      try {
        const response = await api.post('password-reset/request', {
          identifier: identifier.value,
          channel: channel.value
        })

        if (response.data.success) {
          sessionToken.value = response.data.session_token
          codeSent.value = true
          const channelName = channel.value === 'whatsapp' ? 'WhatsApp' : 'tu correo electrónico'
          notify(`Código enviado por ${channelName}`, 'positive', 'check_circle')
          currentStep.value = 3
        } else {
          errorMessage.value = response.data.message || 'Error al enviar el código'
        }
      } catch (error) {
        console.error('Error sending reset code:', error)
        errorMessage.value = error?.response?.data?.message || error?.message || 'Error al enviar el código. Intente nuevamente.'
      } finally {
        loading.value = false
      }
    }

    const verifyCode = async () => {
      errorMessage.value = ''
      loading.value = true

      const code = otpDigits.value.join('')

      try {
        const response = await api.post('otp/verify', {
          identifier: identifier.value,
          code: code,
          purpose: 'reset_password',
          session_token: sessionToken.value
        })

        if (response.data.success) {
          notify('Código verificado correctamente', 'positive', 'check_circle')
          currentStep.value = 4
        } else {
          errorMessage.value = response.data.message || 'Código inválido'
        }
      } catch (error) {
        console.error('Error verifying code:', error)
        errorMessage.value = error?.response?.data?.message || 'Código inválido o expirado'
      } finally {
        loading.value = false
      }
    }

    const resetPassword = async () => {
      errorMessage.value = ''
      loading.value = true

      const code = otpDigits.value.join('')

      try {
        const response = await api.post('password-reset/reset', {
          identifier: identifier.value,
          code: code,
          new_password: newPassword.value,
          new_password_confirmation: confirmPassword.value,
          session_token: sessionToken.value
        })

        if (response.data.success) {
          notify('Contraseña actualizada exitosamente', 'positive', 'check_circle')
          setTimeout(() => {
            showDialog.value = false
            // Reset all fields
            currentStep.value = 1
            channel.value = 'email'
            phoneNumber.value = ''
            email.value = ''
            otpDigits.value = ['', '', '', '', '', '']
            newPassword.value = ''
            confirmPassword.value = ''
          }, 1500)
        } else {
          errorMessage.value = response.data.message || 'Error al actualizar la contraseña'
        }
      } catch (error) {
        console.error('Error resetting password:', error)
        errorMessage.value = error?.response?.data?.message || 'Error al actualizar la contraseña'
      } finally {
        loading.value = false
      }
    }

    const handleAction = () => {
      switch (currentStep.value) {
        case 1:
          currentStep.value = 2
          break
        case 2:
          sendCode()
          break
        case 3:
          verifyCode()
          break
        case 4:
          resetPassword()
          break
      }
    }

    return {
      showDialog,
      currentStep,
      channel,
      phoneNumber,
      email,
      otpDigits,
      otpInputs,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      selectedCountry,
      countryOptions,
      loading,
      errorMessage,
      codeSent,
      stepTitle,
      buttonLabel,
      isButtonDisabled,
      phoneRules,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      previousStep,
      handleOtpInput,
      handleOtpPaste,
      handleOtpKeydown,
      getFullPhoneNumber,
      handleAction
    }
  }
}
</script>

<style lang="scss" scoped>
.forgot-password-card {
  min-width: 380px;
  max-width: 400px;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  position: relative;
}

body.body--dark .forgot-password-card {
  background: #1e1e1e;
}

.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  color: #666;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #333;
  transform: translateX(-4px);
}

body.body--dark .back-btn {
  color: #aaa;
}

body.body--dark .back-btn:hover {
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  color: #666;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #333;
  transform: rotate(90deg);
}

body.body--dark .close-btn {
  color: #aaa;
}

body.body--dark .close-btn:hover {
  color: #fff;
}

.step-title {
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  padding: 16px 20px 0;
}

body.body--dark .step-title {
  color: #f3f4f6;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.icon-wrapper {
  margin-bottom: 16px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle .q-icon {
  font-size: 36px !important;
}

body.body--dark .icon-circle {
  background: rgba(102, 126, 234, 0.2);
}

.step-description {
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 20px;
  padding: 0 20px;
  line-height: 1.4;
}

body.body--dark .step-description {
  color: #9ca3af;
}

.method-cards {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 0 20px;
}

.method-card {
  flex: 1;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: #ffffff;
}

body.body--dark .method-card {
  background: #2d2d2d;
  border-color: #404040;
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.method-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

body.body--dark .method-card.selected {
  background: rgba(102, 126, 234, 0.1);
}

.method-icon-wrapper {
  width: 50px;
  height: 50px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.method-icon-wrapper .q-icon {
  font-size: 28px !important;
}

.method-icon-wrapper.whatsapp {
  background: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.whatsapp-icon {
  width: 28px;
  height: 28px;
  color: #25D366;
}

.whatsapp-icon-large {
  width: 36px;
  height: 36px;
  color: #25D366;
}

.method-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

body.body--dark .method-title {
  color: #f3f4f6;
}

.method-description {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.25;
}

body.body--dark .method-description {
  color: #9ca3af;
}

.check-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}

.input-wrapper {
  width: 100%;
  padding: 0 20px;
  margin-bottom: 12px;
}

.input-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

body.body--dark .input-label {
  color: #d1d5db;
}

.step-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    background: #f9fafb;
    min-height: 40px;
  }
  
  :deep(.q-field__native) {
    font-size: 13px;
  }
}

body.body--dark .step-input {
  :deep(.q-field__control) {
    background: #2d2d2d;
  }
}

.otp-wrapper {
  width: 100%;
  padding: 0 20px;
  margin-bottom: 16px;
}

.otp-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.otp-input {
  width: 42px;
  height: 50px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s ease;
  outline: none;
}

.otp-input:focus {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

body.body--dark .otp-input {
  background: #2d2d2d;
  border-color: #404040;
  color: #f3f4f6;
}

body.body--dark .otp-input:focus {
  background: #1e1e1e;
  border-color: #667eea;
}

.resend-link {
  text-align: center;
  margin-top: 8px;
}

.resend-link a {
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.resend-link a:hover {
  color: #5568d3;
  text-decoration: underline;
}

.resend-link a.disabled {
  color: #9ca3af;
  cursor: not-allowed;
  pointer-events: none;
}

.error-message {
  text-align: center;
  color: #ef4444;
  font-size: 12px;
  padding: 10px 20px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin: 0 20px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.action-wrapper {
  padding: 0 20px 20px;
}

.action-btn {
  width: 100%;
  height: 42px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.action-btn:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0);
}

.country-flag {
  font-size: 18px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 600px) {
  .forgot-password-card {
    min-width: 92vw;
    max-width: 92vw;
    border-radius: 16px;
  }

  .step-title {
    font-size: 16px;
    padding: 14px 16px 0;
  }

  .step-content {
    padding: 10px 0;
  }

  .icon-wrapper {
    margin-bottom: 12px;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
  }

  .icon-circle .q-icon {
    font-size: 30px !important;
  }

  .whatsapp-icon-large {
    width: 30px;
    height: 30px;
  }

  .step-description {
    font-size: 12px;
    margin-bottom: 16px;
    padding: 0 16px;
    line-height: 1.35;
  }

  .method-cards {
    flex-direction: column;
    padding: 0 16px;
    gap: 8px;
  }

  .method-card {
    padding: 14px 10px;
  }

  .method-icon-wrapper {
    width: 44px;
    height: 44px;
    margin-bottom: 8px;
  }

  .method-icon-wrapper .q-icon {
    font-size: 24px !important;
  }

  .whatsapp-icon {
    width: 24px;
    height: 24px;
  }

  .method-title {
    font-size: 13px;
    margin-bottom: 3px;
  }

  .method-description {
    font-size: 10px;
  }

  .check-icon {
    font-size: 18px !important;
  }

  .input-wrapper {
    padding: 0 16px;
    margin-bottom: 10px;
  }

  .input-label {
    font-size: 11px;
    margin-bottom: 4px;
  }

  .step-input {
    :deep(.q-field__control) {
      min-height: 38px;
    }
    
    :deep(.q-field__native) {
      font-size: 13px;
    }
  }

  .otp-wrapper {
    padding: 0 12px;
    margin-bottom: 12px;
  }

  .otp-inputs {
    gap: 5px;
  }

  .otp-input {
    width: 36px;
    height: 44px;
    font-size: 18px;
    border-radius: 8px;
  }

  .resend-link {
    margin-top: 8px;
  }

  .resend-link a {
    font-size: 12px;
  }

  .error-message {
    font-size: 11px;
    padding: 8px 12px;
    margin: 0 16px;
  }

  .action-wrapper {
    padding: 0 16px 18px;
  }

  .action-btn {
    height: 40px;
    font-size: 13px;
    border-radius: 10px;
  }

  .back-btn,
  .close-btn {
    top: 10px;
  }

  .back-btn {
    left: 10px;
  }

  .close-btn {
    right: 10px;
  }
}
</style>
