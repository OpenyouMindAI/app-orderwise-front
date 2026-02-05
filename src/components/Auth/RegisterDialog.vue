<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
    class="custom-dialog-wrapper"
  >
    <div class="register-card">
      <!-- Close Button -->
      <q-btn
        flat
        round
        dense
        icon="close"
        color="grey-7"
        @click="closeDialog"
        class="absolute-top-right q-ma-md"
        style="z-index: 10;"
      />

      <!-- Contenido -->
      <RegistrationForm
        :showLogo="true"
        :showHeader="true"
        :showLoginLink="true"
        :loading="loading"
        :loadingGoogle="loadingGoogle"
        @submit="handleRegisterSubmit"
        @google-register="handleGoogleRegister"
      />
    </div>
  </q-dialog>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import RegistrationForm from './RegistrationForm.vue'
import { useRegistration } from 'src/composables/useRegistration'

const $q = useQuasar()

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'google-success'])

// Usar composable de registro
const {
  loading,
  loadingGoogle,
  register,
  registerWithGoogle,
  initializeGoogleAuthMobile,
  resetForm
} = useRegistration()

/**
 * Maneja el submit del formulario de registro
 */
const handleRegisterSubmit = async ({ form, phoneNumber }) => {
  await register({
    onSuccess: (data) => {
      emit('success', {
        ...data,
        phone_number: phoneNumber,
        user_email: form.email
      })
      closeDialog()
    }
  })
}

/**
 * Maneja el registro con Google
 */
const handleGoogleRegister = async () => {
  await registerWithGoogle({
    onSuccess: (data, userInfo) => {
      emit('google-success', {
        user: data,
        userInfo,
        needsCompanySetup: data.needs_company_setup
      })
      closeDialog()
    }
  })
}

/**
 * Cierra el diálogo y resetea el formulario
 */
const closeDialog = () => {
  emit('update:modelValue', false)
  resetForm()
}

/**
 * On mounted - Inicializar Google Auth
 */
onMounted(async () => {
  if ($q.platform.is.nativeMobile && window.Capacitor) {
    await initializeGoogleAuthMobile()
  }
})
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

@media (max-width: 600px) {
  .register-card {
    padding: 20px 20px;
    max-width: 95%;
  }
}

</style>

<style>
.custom-dialog-wrapper.q-dialog .q-dialog__inner--minimized {
  padding: 0 !important;
}
</style>
