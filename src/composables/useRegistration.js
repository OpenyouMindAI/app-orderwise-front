import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { notify, notifyValidationErrors } from 'src/const/mixins'

// ==================== ESTADO COMPARTIDO (SINGLETON) ====================
// Se definen fuera de la función para que todos los componentes compartan el mismo estado
const form = ref({
  name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: ''
})

// ==================== ESTADO UI ====================
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const loadingGoogle = ref(false)

// ==================== PAÍS Y TELÉFONO ====================
import { countryOptions } from 'src/const/countries'

const selectedCountry = ref(countryOptions[0])

/**
 * Composable para manejo de registro de usuarios
 * Soporta registro con email/password y Google (web y móvil)
 *
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y métodos para registro
 */
export function useRegistration (options = {}) {
  const $q = useQuasar()

  // Validación de teléfono según país
  const phoneRule = computed(() => {
    return [
      val => !!val || 'El teléfono es requerido',
      val => {
        if (!val || !selectedCountry.value || !selectedCountry.value.mask) return true
        const digitsOnly = val.replace(/\D/g, '')
        const expectedDigits = selectedCountry.value.mask.replace(/[^#]/g, '').length
        return digitsOnly.length >= expectedDigits || `Se requieren ${expectedDigits} dígitos`
      }
    ]
  })

  // ==================== FUNCIONES DE REGISTRO ====================

  /**
   * Registra un usuario con email y contraseña
   * @param {Object} callbacks - Callbacks para personalizar el flujo
   * @param {Function} callbacks.onSuccess - Ejecutado al registrar exitosamente
   * @param {Function} callbacks.onError - Ejecutado en caso de error
   * @returns {Promise<Object>} - Datos del usuario registrado
   */
  const register = async (callbacks = {}) => {
    try {
      loading.value = true

      // Preparar número de teléfono con código de país
      const phoneNumber = form.value.phone_number
        ? `${selectedCountry.value?.code || ''}${form.value.phone_number}`.trim()
        : ''

      const payload = {
        ...form.value,
        phone_number: phoneNumber
      }

      const { data } = await api.post('authentication/register', payload)

      // Ejecutar callback de éxito si existe
      if (callbacks.onSuccess) {
        await callbacks.onSuccess(data, {
          phoneNumber,
          email: form.value.email
        })
      }

      return data
    } catch (error) {
      // Ejecutar callback de error si existe
      if (callbacks.onError) {
        callbacks.onError(error)
      } else {
        // Manejo de error por defecto
        notifyValidationErrors(error, 'Error al registrar')
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene información del usuario desde Google
   * @param {string} accessToken - Token de acceso de Google
   * @returns {Promise<Object>} - Información del usuario
   */
  const fetchGoogleUserInfo = async (accessToken) => {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return await response.json()
  }

  /**
   * Envía la solicitud de registro con Google al backend
   * @param {Object} userInfo - Información del usuario de Google
   * @returns {Promise<Object>} - Datos del registro
   */
  const sendGoogleRegistration = async (userInfo) => {
    const credential = btoa(JSON.stringify({
      email: userInfo.email,
      name: userInfo.name,
      google_id: userInfo.sub,
      picture: userInfo.picture
    }))

    const { data } = await api.post('authentication/register/google', {
      credential,
      name: userInfo.name,
      email: userInfo.email
    })

    return data
  }

  /**
   * Registra un usuario con Google - Flujo móvil (Capacitor)
   * @param {Object} callbacks - Callbacks para personalizar el flujo
   * @returns {Promise<void>}
   */
  const registerWithGoogleMobile = async (callbacks = {}) => {
    try {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

      const result = await GoogleAuth.signIn()

      if (result && result.email) {
        const userInfo = {
          email: result.email,
          name: result.name || result.displayName,
          sub: result.id,
          picture: result.imageUrl
        }

        const data = await sendGoogleRegistration(userInfo)

        // Ejecutar callback de éxito si existe
        if (callbacks.onSuccess) {
          await callbacks.onSuccess(data, userInfo)
        }

        return data
      } else {
        loadingGoogle.value = false
        notify('No se pudo obtener información de Google', 'negative', 'warning')
      }
    } catch (error) {
      loadingGoogle.value = false

      // Si el usuario canceló, no mostrar error
      if (error.message && (
        error.message.toLowerCase().includes('cancel') ||
        error.message.toLowerCase().includes('user_cancelled') ||
        error.code === 12501
      )) {
        console.log('User cancelled register')
        return
      }

      // Ejecutar callback de error si existe
      if (callbacks.onError) {
        callbacks.onError(error)
      } else {
        const message = error.response?.data?.message || 'Error al registrar con Google'
        notify(message, 'negative', 'warning')
      }
    }
  }

  /**
   * Registra un usuario con Google - Flujo web
   * @param {Object} callbacks - Callbacks para personalizar el flujo
   * @returns {Promise<void>}
   */
  const registerWithGoogleWeb = async (callbacks = {}) => {
    if (!window.google) {
      notify('Error al cargar Google Sign-In', 'negative', 'warning')
      loadingGoogle.value = false
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      error_callback: (error) => {
        console.error('Google Auth Error:', error)
        // NOTA: 'popup_failed_to_open' es un error falso de GSI en localhost
        // cuando el popup SÍ se abre. Solo resetear si el navegador lo bloquea realmente.
        if (error.type === 'popup_blocked_by_browser') {
          loadingGoogle.value = false
          notify('El navegador bloqueó la ventana de Google. Por favor, permite los popups.', 'negative', 'warning')
        }
        // Para popup_failed_to_open: no hacemos nada, la ventana sí se abrió.
        // El listener de foco en handleWindowFocus manejará el cierre sin selección.
      },
      callback: async (response) => {
        if (response.error) {
          console.error('Google Response Error:', response.error)
          loadingGoogle.value = false
          return
        }
        try {
          if (response.access_token) {
            // Obtener información del usuario
            const userInfo = await fetchGoogleUserInfo(response.access_token)

            // Registrar con backend
            const data = await sendGoogleRegistration(userInfo)

            // Ejecutar callback de éxito si existe
            if (callbacks.onSuccess) {
              await callbacks.onSuccess(data, userInfo)
            }
          }
        } catch (error) {
          // Ejecutar callback de error si existe
          if (callbacks.onError) {
            callbacks.onError(error)
          } else {
            const message = error.response?.data?.message || 'Error al registrar con Google'
            notify(message, 'negative', 'warning')
          }
        } finally {
          loadingGoogle.value = false
        }
      }
    })

    client.requestAccessToken()

    // Detectar cuando el usuario cierra la ventana de Google sin seleccionar cuenta.
    // Google no dispara ningún evento en ese caso, pero la ventana principal recupera el foco.
    const handleWindowFocus = () => {
      setTimeout(() => {
        if (loadingGoogle.value) {
          console.log('Google popup closed without account selection (register)')
          loadingGoogle.value = false
        }
      }, 500)
      window.removeEventListener('focus', handleWindowFocus)
    }
    setTimeout(() => {
      window.addEventListener('focus', handleWindowFocus)
    }, 100)
  }

  /**
   * Registra un usuario con Google (detecta automáticamente móvil o web)
   * @param {Object} callbacks - Callbacks para personalizar el flujo
   * @param {Function} callbacks.onSuccess - Ejecutado al registrar exitosamente
   * @param {Function} callbacks.onError - Ejecutado en caso de error
   * @returns {Promise<void>}
   */
  const registerWithGoogle = async (callbacks = {}) => {
    try {
      loadingGoogle.value = true

      // Detectar si es móvil nativo (Capacitor)
      if ($q.platform.is.nativeMobile && window.Capacitor) {
        await registerWithGoogleMobile(callbacks)
      } else {
        // Web
        await registerWithGoogleWeb(callbacks)
      }
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error)
      } else {
        notify('Error al iniciar registro con Google', 'negative', 'warning')
      }
      loadingGoogle.value = false
    }
  }

  /**
   * Inicializa Google Auth para plataforma móvil
   * Debe ejecutarse en onMounted del componente
   * @returns {Promise<void>}
   */
  const initializeGoogleAuthMobile = async () => {
    try {
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '241900278304-roncn79359cb608lgg5fflfrgca544mk.apps.googleusercontent.com'

      await GoogleAuth.initialize({
        clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      })

      console.log('Google Auth initialized successfully')
    } catch (error) {
      console.error('Error initializing Google Auth:', error)
    }
  }

  /**
   * Reinicia el formulario a su estado inicial
   */
  const resetForm = () => {
    form.value = {
      name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      password_confirmation: ''
    }
    showPassword.value = false
    showPasswordConfirm.value = false
  }

  // ==================== RETURN ====================
  return {
    // Estado
    form,
    showPassword,
    showPasswordConfirm,
    loading,
    loadingGoogle,
    selectedCountry,
    countryOptions,

    // Computeds
    phoneRule,

    // Métodos
    register,
    registerWithGoogle,
    initializeGoogleAuthMobile,
    resetForm
  }
}
