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
            <q-form @submit="handleLogin" class="q-gutter-sm">
              <div class="input-container">
                <q-input
                  v-model="loginForm.username"
                  placeholder="Usuario o correo electrónico"
                  borderless
                  dense
                  class="custom-input"
                  :rules="[val => !!val || 'El usuario es requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" size="20px" />
                  </template>
                </q-input>
              </div>

              <div class="input-container">
                <q-input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Contraseña"
                  borderless
                  dense
                  class="custom-input"
                  :rules="[val => !!val || 'La contraseña es requerida']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="primary" size="20px" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility' : 'visibility_off'"
                      color="grey-5"
                      size="20px"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                type="submit"
                color="primary"
                class="full-width auth-btn q-mt-md"
                label="Iniciar Sesión"
                :loading="loading"
                unelevated
                no-caps
              />

              <div class="divider-container q-my-md">
                <div class="divider-line"></div>
                <span class="divider-text">O continúa con</span>
                <div class="divider-line"></div>
              </div>

              <button
                type="button"
                class="social-btn google-btn"
                @click="handleGoogleAuth"
                :disabled="loadingGoogle || loading"
              >
                <q-spinner v-if="loadingGoogle" color="grey-8" size="18px" />
                <template v-else>
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </template>
              </button>
            </q-form>
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
const showPassword = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(loginForm.value)
    notify('¡Bienvenido de nuevo!', 'positive', 'check_circle')
    orderStore.fetchOrderCount()
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
    orderStore.fetchOrderCount()
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
      orderStore.fetchOrderCount()
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
