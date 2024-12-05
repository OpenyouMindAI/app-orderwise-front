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
      setTimeOut: 0
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
    async logout () {
      try {
        // await axios.post(this.pageInfo.LOGOUT)
        this.access_token = null
        this.token_type = null
        this.expires_In = null
        this.refresh_token = null
        return true
      } catch (error) {
        throw error.response.data
      }
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
        console.log(data)
        this.setSessionData(data)
        return data.user
      } catch (error) {
        console.log(error)
        throw error
      }
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
    }
  },
  persist: true
})
