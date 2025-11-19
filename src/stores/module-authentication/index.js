import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const authentication = defineStore('authentication', {
  state: () => {
    return {
      /**
       * Access token
       * @type {String}
       */
      access_token: null,
      /**
       * Refresh token
       * @type {String}
       */
      refresh_token: null,
      /**
       * User session
       * @type {Object}
       */
      userSession: null,
      /**
       * Expires in
       * @type {Number}
       */
      expires_In: null,
      /**
       * Token type
       * @type {String}
       */
      token_type: null,
      /**
       * Timeout
       * @type {Number}
       */
      setTimeOut: 0,
      /**
       * Branch office session
       */
      branchOffice: null,
      /**
       * Is demo account
       * @type {Boolean}
       */
      isDemo: false
    }
  },
  actions: {
    /**
     * Verify if the user is logged in
     * @returns {Boolean} true or false
     */
    initStore () {
      return (
        this.user === null ||
        this.access_token === 'null' ||
        this.access_token === null ||
        this.token_type === null
      )
    },
    /**
     * Logout
     * @returns {Boolean} true or false
     */
    async logout () {
      try {
        // await axios.post(this.pageInfo.LOGOUT)
        this.access_token = null
        this.token_type = null
        this.expires_In = null
        this.refresh_token = null
        this.userSession = null
        this.branchOffice = null

        // Guardar tema antes de limpiar localStorage
        const savedTheme = localStorage.getItem('app-theme')
        const showThemeSelector = localStorage.getItem('show-theme-selector')

        console.log('🔒 Cerrando sesión...')
        console.log('💾 Tema guardado antes de limpiar:', savedTheme)

        localStorage.clear()

        // Restaurar tema después de limpiar
        if (savedTheme) {
          localStorage.setItem('app-theme', savedTheme)
          console.log('✅ Tema restaurado:', savedTheme)
        }
        if (showThemeSelector) {
          localStorage.setItem('show-theme-selector', showThemeSelector)
          console.log('✅ Preferencia de selector restaurada:', showThemeSelector)
        }

        // localStorage.removeItem('client')
        // localStorage.removeItem('command')
        // localStorage.removeItem('products')
        // localStorage.removeItem('tableSelected')
        // localStorage.removeItem('payments')
        // localStorage.removeItem('category-command')
        // localStorage.removeItem('branchOffice-command')
        // localStorage.removeItem('')
        return true
      } catch (error) {
        throw error.response.data
      }
    },
    /**
     * Set company session
     * @param  {Object} companySession
     */
    setCompanySession (companySession) {
      this.userSession.company_session = companySession
    },
    /**
     * Set local storage data
     * @param  {Object} data
     */
    setSessionData (data) {
      this.userSession = data.user
      this.access_token = data.access_token
      this.token_type = data.token_type
      this.expires_In = data.expires_in
      this.refresh_token = data.refresh_token
      this.isDemo = data.is_demo || false

      // Calculate token expiration time
      if (data.expires_in) {
        // expires_in is in seconds, convert to milliseconds and add to current time
        this.setTimeOut = Date.now() + (data.expires_in * 1000)
        console.log('🔐 Token expira en:', new Date(this.setTimeOut).toLocaleString())
      }

      api.defaults.headers.common.authorization = `${this.token_type} ${this.access_token}`
    },
    /**
     * Login app
     * @params {Object} credentials
     * @returns {Object} user
     */
    async login ({ username, password }) {
      try {
        const { data } = await api.post(
          'authentication/login',
          { username, password },
          {},
          true
        )
        this.setSessionData(data)
        return data.user
      } catch (error) {
        console.log(error)
        throw error
      }
    },

    setBranchOffice (branchOffice) {
      this.branchOffice = branchOffice
    }
  },
  getters: {
    /**
     * Get access token
     * @returns {String} access token
     */
    accessTokenGetter (state) {
      return state.access_token
    },
    /**
     * Get user
     * @returns {Object} user
     */
    userGetter (state) {
      return state.userSession
    },
    /**
     * Branch office getter
     * @param {*} state
     * @returns {Object} branch office
     */
    branchOfficeGetter (state) {
      return state.branchOffice
    },
    /**
     * Is demo account getter
     * @param {*} state
     * @returns {Boolean} is demo
     */
    isDemoGetter (state) {
      return state.isDemo
    }
  },
  persist: true
})
