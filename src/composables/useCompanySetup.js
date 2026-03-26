import { ref } from 'vue'
import { api } from 'src/boot/axios'
import { notify } from 'src/const/mixins'
import { authentication } from 'src/stores/module-authentication'

/**
 * Composable para el proceso de configuración automática de empresa.
 * Abstrae la lógica compartida entre RegisterPage y MainLayout,
 * evitando duplicación y centralizando el acceso al endpoint setup-company.
 *
 * @returns {Object} Estado y métodos de configuración de empresa
 */
export function useCompanySetup () {
  const store = authentication()
  const loading = ref(false)

  /**
   * Construye el payload para el endpoint authentication/setup-company
   * usando los datos del usuario en sesión y los datos temporales del rubro.
   *
   * @param {Object} options
   * @param {Object} options.user - Datos del usuario desde el store
   * @param {Object} options.registrationData - Datos del formulario de registro guardados
   * @param {Object} options.businessData - Datos del rubro seleccionado (tempCompanyData)
   * @returns {Object} Payload listo para enviar al API
   */
  const buildSetupPayload = ({ user = {}, registrationData = {}, businessData = {} }) => {
    const firstName = registrationData.name || user.name || ''
    const lastName = registrationData.last_name || user.last_name || ''
    const companyName = `${firstName} ${lastName}`.trim() || 'Mi Empresa'

    return {
      company_name: companyName,
      company_document: null,
      company_email: registrationData.email || user.email || '',
      company_phone: registrationData.phone_number || user.phone_number || user.phone || null,
      company_address: null,
      business_type_id: businessData?.business_type_id || null,
      country_id: null,
      copy_test_products: businessData?.copy_test_products || false
    }
  }

  /**
   * Realiza la configuración automática de empresa.
   * Usa los datos del usuario autenticado y del rubro seleccionado.
   *
   * @param {Object} options
   * @param {Object} options.registrationData - Datos extra del formulario de registro (nombre, teléfono, etc.)
   * @param {Object} options.businessData - Datos del rubro/tipo de negocio seleccionado
   * @param {Function} options.onSuccess - Callback que recibe `data` al completar exitosamente
   * @param {Function} [options.onError] - Callback que recibe `error` si falla (opcional)
   * @param {Function} [options.trackPixel] - Callback para tracking pixel (opcional)
   */
  const autoSetupCompany = async ({
    registrationData = {},
    businessData = {},
    onSuccess,
    onError,
    trackPixel
  }) => {
    try {
      loading.value = true

      const user = store.userGetter || {}
      const payload = buildSetupPayload({ user, registrationData, businessData })

      console.log('🚀 autoSetupCompany - Enviando payload:', payload)
      const { data } = await api.post('authentication/setup-company', payload)
      console.log('✅ autoSetupCompany - Respuesta recibida:', data)

      if (trackPixel) {
        trackPixel({ company_name: payload.company_name })
      }

      if (onSuccess) {
        await onSuccess(data)
      }
    } catch (error) {
      console.error('❌ Error en auto-setup:', error)
      const errorMessage = error.response?.data?.message || 'No se pudo completar la configuración automática.'
      notify(errorMessage, 'negative', 'warning')

      if (onError) {
        onError(error)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    buildSetupPayload,
    autoSetupCompany
  }
}
