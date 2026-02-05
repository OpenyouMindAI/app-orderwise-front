import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { notify, notifyValidationErrors } from 'src/const/mixins'

/**
 * Composable para manejo de registro de usuarios
 * Soporta registro con email/password y Google (web y móvil)
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y métodos para registro
 */
export function useRegistration(options = {}) {
  const $q = useQuasar()

  // ==================== ESTADO DEL FORMULARIO ====================
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
  const countryOptions = [
    { label: 'Argentina', code: '+54', mask: '## #### ####', regex: /^(?:(?:00)?549?)?0?[1-9]\d{9}$/, flag: '🇦🇷' },
    { label: 'Chile', code: '+56', mask: '#########', regex: /^(\+?56)?(\s?)(0?9)(\s?)[98765432]\d{7}$/, flag: '🇨🇱' },
    { label: 'México', code: '+52', mask: '## #### ####', regex: /^(\+?52)?\s?1?\s?(\(?\d{2,3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}$/, flag: '🇲🇽' },
    { label: 'Colombia', code: '+57', mask: '### ### ####', regex: /^(\+?57)?\s?3[\d]{9}$/, flag: '🇨🇴' },
    { label: 'Perú', code: '+51', mask: '### ### ###', regex: /^(\+?51)?\s?9[\d]{8}$/, flag: '🇵🇪' },
    { label: 'Uruguay', code: '+598', mask: '## ### ###', regex: /^(\+?598)?\s?9[\d]{7}$/, flag: '🇺🇾' },
    { label: 'Venezuela', code: '+58', mask: '### ### ####', regex: /^(\+?58)?\s?4[\d]{9}$/, flag: '🇻🇪' },
    { label: 'España', code: '+34', mask: '### ### ###', regex: /^(\+?34)?\s?[679]\d{8}$/, flag: '🇪🇸' },
    { label: 'Otro', code: '', mask: '', regex: /.+/, flag: '🌍' }
  ]

  const selectedCountry = ref(countryOptions[0])

  // Validación de teléfono según país
  const phoneRule = computed(() => {
    return [
      val => !!val || 'El teléfono es requerido',
      val => {
        if (!val) return true
        if (!selectedCountry.value || !selectedCountry.value.regex) return true
        return selectedCountry.value.regex.test(val) || 'Formato inválido'
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
      callback: async (response) => {
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
