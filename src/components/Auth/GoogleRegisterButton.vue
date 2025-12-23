<template>
  <button 
    type="button" 
    class="demo-google-btn" 
    @click="handleGoogleRegister" 
    :disabled="loading"
  >
    <q-spinner v-if="loading" color="grey-8" size="20px"/>
    <template v-else>
      <svg class="demo-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span class="text-weight-medium">Continuar con Google</span>
    </template>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authentication } from 'src/stores/module-authentication'
import { notify } from 'src/const/mixins'
import { api } from 'src/boot/axios'

const router = useRouter()
const store = authentication()
const loading = ref(false)

const emit = defineEmits(['success', 'error'])

/**
 * Wait for Google Sign-In to load
 */
const waitForGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    let attempts = 0
    const maxAttempts = 20 // 10 segundos máximo
    const interval = setInterval(() => {
      attempts++
      if (window.google) {
        clearInterval(interval)
        resolve()
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        reject(new Error('Timeout esperando Google Sign-In'))
      }
    }, 500)
  })
}

/**
 * Register with Google
 */
const handleGoogleRegister = async () => {
  try {
    loading.value = true

    // Esperar a que Google Sign-In esté disponible
    try {
      await waitForGoogleScript()
    } catch (error) {
      notify('Error al cargar Google Sign-In. Por favor, recarga la página.', 'negative', 'warning')
      emit('error', 'Google Sign-In no disponible')
      loading.value = false
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response) => {
        try {
          if (response.access_token) {
            // Obtener información del usuario
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            const userInfo = await userInfoResponse.json()

            // Codificar datos en base64
            const credential = btoa(JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              google_id: userInfo.sub,
              picture: userInfo.picture
            }))

            // Registrar con backend
            const { data } = await api.post('authentication/register/google', {
              credential,
              name: userInfo.name,
              email: userInfo.email
            })

            // Guardar sesión completa en el store
            store.setSessionData(data)

            notify('Registro exitoso con Google', 'positive', 'check_circle')

            // Emitir evento de éxito con datos del usuario
            emit('success', {
              user: data,
              userInfo,
              needsCompanySetup: data.needs_company_setup
            })

            // Si no necesita setup de empresa, redirigir
            if (!data.needs_company_setup) {
              router.push('/')
            }
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Error al registrar con Google'
          notify(message, 'negative', 'warning')
          emit('error', message)
        } finally {
          loading.value = false
        }
      }
    })

    client.requestAccessToken()
  } catch (error) {
    notify('Error al iniciar registro con Google', 'negative', 'warning')
    emit('error', 'Error al iniciar registro')
    loading.value = false
  }
}
</script>

<style scoped>
.demo-google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.5s ease-out 0.5s backwards;
}

.demo-google-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.demo-google-btn:hover:not(:disabled) .demo-google-icon path {
  fill: white;
}

.demo-google-btn:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.demo-google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-google-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
