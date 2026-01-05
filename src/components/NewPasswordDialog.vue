<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px; max-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Nueva Contraseña</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Ingrese su nueva contraseña. Debe tener al menos 8 caracteres.
        </div>

        <!-- Nueva contraseña -->
        <q-input
          v-model="newPassword"
          label="Nueva contraseña"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          :rules="[
            val => !!val || 'La contraseña es requerida',
            val => val.length >= 8 || 'Debe tener al menos 8 caracteres',
            val => /[A-Z]/.test(val) || 'Debe contener al menos una mayúscula',
            val => /[a-z]/.test(val) || 'Debe contener al menos una minúscula',
            val => /[0-9]/.test(val) || 'Debe contener al menos un número'
          ]"
          @keyup.enter="resetPassword"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Confirmar contraseña -->
        <q-input
          v-model="confirmPassword"
          label="Confirmar contraseña"
          :type="showConfirmPassword ? 'text' : 'password'"
          outlined
          dense
          class="q-mt-md"
          :rules="[
            val => !!val || 'Confirme su contraseña',
            val => val === newPassword || 'Las contraseñas no coinciden'
          ]"
          @keyup.enter="resetPassword"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>

        <!-- Indicador de fortaleza de contraseña -->
        <div class="q-mt-md">
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

        <!-- Requisitos de contraseña -->
        <div class="q-mt-md">
          <div class="text-caption text-grey-7 q-mb-xs">Requisitos:</div>
          <div class="requirement-list">
            <div :class="newPassword.length >= 8 ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="newPassword.length >= 8 ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Mínimo 8 caracteres
            </div>
            <div :class="/[A-Z]/.test(newPassword) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[A-Z]/.test(newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Una letra mayúscula
            </div>
            <div :class="/[a-z]/.test(newPassword) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[a-z]/.test(newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Una letra minúscula
            </div>
            <div :class="/[0-9]/.test(newPassword) ? 'text-positive' : 'text-grey-6'">
              <q-icon :name="/[0-9]/.test(newPassword) ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
              Un número
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="text-negative q-mt-md">
          <q-icon name="error" size="sm" />
          {{ errorMessage }}
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
          label="Cambiar Contraseña"
          color="primary"
          @click="resetPassword"
          :loading="loading"
          :disable="!isFormValid || loading"
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
  name: 'NewPasswordDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    identifier: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    sessionToken: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'password-reset'],
  setup (props, { emit }) {
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')

    const showDialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const passwordStrength = computed(() => {
      let strength = 0
      const password = newPassword.value

      if (password.length >= 8) strength += 25
      if (password.length >= 12) strength += 15
      if (/[A-Z]/.test(password)) strength += 20
      if (/[a-z]/.test(password)) strength += 20
      if (/[0-9]/.test(password)) strength += 20
      if (/[^A-Za-z0-9]/.test(password)) strength += 20

      return Math.min(strength, 100)
    })

    const passwordStrengthColor = computed(() => {
      if (passwordStrength.value < 40) return 'negative'
      if (passwordStrength.value < 70) return 'warning'
      return 'positive'
    })

    const passwordStrengthLabel = computed(() => {
      if (passwordStrength.value < 40) return 'Débil'
      if (passwordStrength.value < 70) return 'Media'
      return 'Fuerte'
    })

    const isFormValid = computed(() => {
      return newPassword.value.length >= 8 &&
             /[A-Z]/.test(newPassword.value) &&
             /[a-z]/.test(newPassword.value) &&
             /[0-9]/.test(newPassword.value) &&
             newPassword.value === confirmPassword.value
    })

    const resetPassword = async () => {
      if (!isFormValid.value) return

      errorMessage.value = ''
      loading.value = true

      try {
        const response = await api.post('password-reset/reset', {
          identifier: props.identifier,
          code: props.code,
          new_password: newPassword.value,
          new_password_confirmation: confirmPassword.value,
          session_token: props.sessionToken
        })

        if (response.data.success) {
          notify('Contraseña actualizada exitosamente', 'positive', 'check_circle')
          emit('password-reset', {
            success: true,
            message: response.data.message
          })
          showDialog.value = false

          // Limpiar campos
          newPassword.value = ''
          confirmPassword.value = ''
        } else {
          errorMessage.value = response.data.message || 'Error al actualizar la contraseña'
        }
      } catch (error) {
        console.error('Error resetting password:', error)
        errorMessage.value = error.response?.data?.message || 'Error al actualizar la contraseña. Intente nuevamente.'
        notify('Error al actualizar la contraseña', 'negative', 'error')
      } finally {
        loading.value = false
      }
    }

    return {
      showDialog,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      errorMessage,
      passwordStrength,
      passwordStrengthColor,
      passwordStrengthLabel,
      isFormValid,
      resetPassword
    }
  }
}
</script>

<style lang="scss" scoped>
.requirement-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
</style>
