<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
    class="custom-dialog-wrapper"
    no-focus-restore
  >
    <RegistrationForm
      :showLogo="true"
      :showHeader="true"
      :showLoginLink="false"
      :loading="loading"
      :loadingGoogle="loadingGoogle"
      @submit="handleRegisterSubmit"
      @google-register="handleGoogleRegister"
    >
      <template #actions>
        <!-- Botón de cerrar posicionado absolutamente sobre la card -->
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
      </template>
    </RegistrationForm>
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
        user_email: form.email,
        name: form.name,
        last_name: form.last_name
      })
      emit('update:modelValue', false) // Close without resetting form to allow back navigation
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
</style>

<style>
.custom-dialog-wrapper.q-dialog .q-dialog__inner--minimized {
  padding: 0 !important;
}
</style>
