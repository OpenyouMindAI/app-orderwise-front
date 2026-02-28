<template>
  <q-dialog
    v-model="internalValue"
    persistent
    transition-show="jump-up"
    transition-hide="jump-down"
    class="auth-dialog"
  >
    <q-card class="auth-card">
      <q-btn
        icon="close"
        flat
        round
        dense
        v-close-popup
        class="absolute-top-right text-grey-7 q-ma-sm"
        style="z-index: 10"
      />

      <q-card-section class="q-pt-xl q-pb-none">
        <div class="text-center q-mb-md">
          <q-img :src="qBitsLogo.black" style="width: 120px" fit="contain" />
        </div>

        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
          no-caps
        >
          <q-tab name="login" label="Iniciar Sesión" />
          <q-tab name="register" label="Registrarse" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <!-- Login Panel -->
          <q-tab-panel name="login" class="q-px-none q-py-md">
            <LoginForm
              :showLogo="false"
              :showHeader="false"
              :showRegisterLink="false"
              :loading="loading"
              :loadingGoogle="loadingGoogle"
              @submit="handleLogin"
              @google-login="handleGoogleAuth"
              class="no-shadow no-padding"
              style="background: transparent; box-shadow: none; border: none; width: 100%; max-width: 100%;"
            />
          </q-tab-panel>

          <!-- Register Panel -->
          <q-tab-panel name="register" class="q-px-none q-py-md">
            <RegistrationForm
              :showLogo="false"
              :showHeader="false"
              :loading="loadingRegister"
              :loadingGoogle="loadingGoogle"
              @submit="handleRegister"
              @google-register="handleGoogleAuth"
              class="no-shadow no-padding"
              style="background: transparent; box-shadow: none; border: none; width: 100%; max-width: 100%;"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { authentication } from 'src/stores/module-authentication'
import { useRegistration } from 'src/composables/useRegistration'
import { qBitsLogo, notify } from 'src/const/mixins'
import { api } from 'boot/axios'
import { useOrderStore } from 'src/stores/order'
import RegistrationForm from './RegistrationForm.vue'
import LoginForm from './LoginForm.vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const route = useRoute()
const authStore = authentication()
const orderStore = useOrderStore()
const { registerWithGoogle, loadingGoogle } = useRegistration()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const tab = ref('login')
const loading = ref(false)
const loadingRegister = ref(false)

const handleLogin = async (formData) => {
  try {
    loading.value = true
    await authStore.login(formData)
    notify('¡Bienvenido de nuevo!', 'positive', 'check_circle')
    orderStore.fetchOrders()
    emit('success')
    internalValue.value = false
  } catch (error) {
    notify(error.message || 'Error al iniciar sesión', 'negative', 'warning')
  } finally {
    loading.value = false
  }
}

const handleRegister = async ({ form, phoneNumber }) => {
  try {
    loadingRegister.value = true
    const { data } = await api.post(
      `public/clients/${route.params.company_id}`,
      {
        ...form,
        phone_number: phoneNumber
      }
    )
    authStore.setSessionData(data)
    notify('Cuenta creada con éxito', 'positive', 'check_circle')
    orderStore.fetchOrders()
    emit('success')
    internalValue.value = false
  } catch (error) {
    notify(error.message || 'Error al registrarse', 'negative', 'warning')
  } finally {
    loadingRegister.value = false
  }
}

const handleGoogleAuth = async () => {
  await registerWithGoogle({
    onSuccess: (data, userInfo) => {
      authStore.setSessionData(data)
      // Save Google profile photo explicitly so it always persists
      if (userInfo?.picture) {
        authStore.setProfilePhoto(userInfo.picture)
      }
      notify('Sesión iniciada con Google', 'positive', 'check_circle')
      orderStore.fetchOrders()
      emit('success')
      internalValue.value = false
    },
    onError: (error) => {
      console.error('Google registration error:', error)
      notify('Error al autenticarse con Google', 'negative', 'warning')
    }
  })
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  padding: 8px;
}

.input-container {
  margin-bottom: 12px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f9fafb !important;
  border: 1.5px solid #e5e7eb !important;
  padding: 0 12px;
  min-height: 48px;
}

.auth-btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
}

.divider-container {
  display: flex;
  align-items: center;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider-text {
  padding: 0 16px;
  color: #6b7280;
  font-size: 13px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  background: #f9fafb;
  border-color: #667eea;
}

.social-icon {
  width: 20px;
  height: 20px;
}

:deep(.registration-form) {
  padding: 0 !important;
}
</style>
