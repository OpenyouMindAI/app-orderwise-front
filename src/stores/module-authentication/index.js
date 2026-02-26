import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { connectSession } from 'src/boot/session-tracking'

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
       * Profile photo URL (persisted separately for reliability)
       * @type {String|null}
       */
      profilePhoto: null,
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
       * Hide amounts in accounts receivable
       * @type {Boolean}
       */
      hideAmounts: localStorage.getItem('hideAmounts') === 'true' || false,
      /**
       * Is demo account
       * @type {Boolean}
       */
      isDemo: false,
      /**
       * Current subscription plan name
       * @type {String}
       */
      subscriptionPlan: null,
      /**
       * Days left until subscription expires
       * @type {Number}
       */
      subscriptionDaysLeft: null,
      /**
       * Current subscription object
       * @type {Object}
       */
      currentSubscription: null,
      /**
       * Maximum branches allowed in current plan
       * @type {Number}
       */
      maxBranches: 1,
      /**
       * Current branch count
       * @type {Number}
       */
      currentBranchCount: 0,
      /**
       * Has API access
       * @type {Boolean}
       */
      hasApiAccess: false,
      /**
       * Force user to select a plan
       * @type {Boolean}
       */
      mustSelectPlan: false,
      /**
       * Whether subscription is currently expired
       * @type {Boolean}
       */
      isExpired: false,
      /**
       * Current plan object (from subscriptions/current API)
       * @type {Object|null}
       */
      currentPlan: null
    }
  },
  actions: {
    /**
     * Verify if the user is logged in
     * @returns {Boolean} true or false
     */
    initStore () {
      return (
        this.userSession === null ||
        this.access_token === 'null' ||
        this.access_token === null ||
        this.token_type === null
      )
    },
    /**
     * Logout
     * @param {Boolean} callBackend - Si debe llamar al backend para revocar token (default: true)
     * @returns {Boolean} true or false
     */
    async logout (callBackend = true) {
      if (this._isLoggingOut) return true
      this._isLoggingOut = true

      try {
        if (callBackend && this.access_token) {
          try {
            await api.post('authentication/logout')
          } catch (e) {
            console.warn('Error al cerrar sesión en backend:', e)
          }
        }

        // Limpiar estado de Pinia
        this.access_token = null
        this.token_type = null
        this.expires_In = null
        this.refresh_token = null
        this.userSession = null
        this.branchOffice = null
        this.setTimeOut = 0
        this.isDemo = false
        this.profilePhoto = null

        // Limpiar headers de Axios para evitar que se use un token viejo
        delete api.defaults.headers.common.authorization
        delete api.defaults.headers.common.Authorization

        this.clearSubscriptionData()

        const savedTheme = localStorage.getItem('app-theme')
        const showThemeSelector = localStorage.getItem('show-theme-selector')
        const hasSeenBillingTour = localStorage.getItem('has_seen_billing_tour')
        const orderwiseQuickAccess = localStorage.getItem('orderwise_quick_access')

        localStorage.clear()

        if (savedTheme) {
          localStorage.setItem('app-theme', savedTheme)
        }

        if (showThemeSelector) {
          localStorage.setItem('show-theme-selector', showThemeSelector)
        }

        if (hasSeenBillingTour) {
          localStorage.setItem('has_seen_billing_tour', hasSeenBillingTour)
        }

        if (orderwiseQuickAccess) {
          localStorage.setItem('orderwise_quick_access', orderwiseQuickAccess)
        }

        return true
      } catch (error) {
        throw error.response?.data || error
      } finally {
        this._isLoggingOut = false
      }
    },

    /**
     * Force logout - Solo limpia datos locales sin llamar al backend
     * Usado cuando el admin fuerza desconexión o el token ya fue revocado
     */
    forceLogout () {
      return this.logout(false)
    },
    /**
     * Toggle hide amounts
     */
    toggleHideAmounts () {
      this.hideAmounts = !this.hideAmounts
      localStorage.setItem('hideAmounts', this.hideAmounts)
    },
    /**
     * Toggle partner mode
     */
    togglePartnerMode () {
      this.partnerMode = !this.partnerMode
      localStorage.setItem('partnerMode', this.partnerMode)
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

      if (data.expires_in) {
        this.setTimeOut = Date.now() + (data.expires_in * 1000)
      }

      // Auto-detect photo field from user object (backend may use different names)
      const user = data.user
      if (user) {
        const photo = user.avatar || user.picture || user.photo || user.profile_photo || user.photo_url || null
        if (photo) {
          this.profilePhoto = photo
        }
      }

      api.defaults.headers.common.authorization = `${this.token_type} ${this.access_token}`
    },
    /**
     * Set profile photo URL explicitly (e.g. from Google OAuth)
     * @param {String} url
     */
    setProfilePhoto (url) {
      if (url) {
        this.profilePhoto = url
      }
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

        // Connect session tracking after successful login
        connectSession(this)

        return data.user
      } catch (error) {
        console.log(error)
        throw error
      }
    },

    setBranchOffice (branchOffice) {
      this.branchOffice = branchOffice
    },
    /**
     * Set subscription data
     * @param {Object} subscriptionData - Subscription information
     */
    setSubscriptionData (subscriptionData) {
      this.subscriptionPlan = subscriptionData.plan?.slug || 'free'
      this.subscriptionDaysLeft = subscriptionData.days_left !== undefined ? subscriptionData.days_left : (subscriptionData.days_until_expiration || null)
      this.currentSubscription = subscriptionData.subscription || null
      this.maxBranches = subscriptionData.subscription?.branch_offices_count || 1
      this.hasApiAccess = subscriptionData?.api_access || subscriptionData?.has_api_access || false

      // Track expiration state for progressive modals
      this.isExpired = subscriptionData.is_expired === true
      // Store the full plan object for direct use in modals
      this.currentPlan = subscriptionData.plan || subscriptionData.subscription?.plan || null
    },
    /**
     * Set current branch count
     * @param {Number} count - Number of branches
     */
    setCurrentBranchCount (count) {
      this.currentBranchCount = count
    },
    /**
     * Load subscription information from API
     */
    async loadSubscriptionInfo () {
      try {
        const { data } = await api.get('subscriptions/current')
        this.setSubscriptionData(data)
        return data
      } catch (error) {
        this.subscriptionPlan = 'Free'
        this.subscriptionDaysLeft = null
        this.currentSubscription = null
        this.maxBranches = 1
        return null
      }
    },
    /**
     * Clear subscription data (on logout)
     */
    clearSubscriptionData () {
      this.subscriptionPlan = null
      this.subscriptionDaysLeft = null
      this.currentSubscription = null
      this.maxBranches = 1
      this.currentBranchCount = 0
      this.isExpired = false
      this.currentPlan = null
      localStorage.removeItem('subscription_expired_since')
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
    },
    /**
     * Get subscription plan name
     * @param {*} state
     * @returns {String} subscription plan name
     */
    subscriptionPlanGetter (state) {
      return state.subscriptionPlan || 'Free'
    },
    /**
     * Get days left until subscription expires
     * @param {*} state
     * @returns {Number} days left
     */
    subscriptionDaysLeftGetter (state) {
      return state.subscriptionDaysLeft
    },
    /**
     * Get current subscription object
     * @param {*} state
     * @returns {Object} current subscription
     */
    currentSubscriptionGetter (state) {
      return state.currentSubscription
    },
    /**
     * Get maximum branches allowed
     * @param {*} state
     * @returns {Number} max branches
     */
    maxBranchesGetter (state) {
      return state.maxBranches
    },
    /**
     * Get current branch count
     * @param {*} state
     * @returns {Number} current branch count
     */
    currentBranchCountGetter (state) {
      return state.currentBranchCount
    },
    /**
     * Check if subscription is active
     * @param {*} state
     * @returns {Boolean} is active
     */
    isSubscriptionActive (state) {
      return state.currentSubscription?.status === 'active'
    },
    /**
     * Check if subscription is in trial
     * @param {*} state
     * @returns {Boolean} is trial
     */
    isSubscriptionTrial (state) {
      return state.currentSubscription?.status === 'trial'
    },
    /**
     * Check if the current plan is premium (Pro or Pro Team)
     * @param {*} state
     * @returns {Boolean}
     */
    hasPremiumPlan (state) {
      const allowedPlans = ['pro', 'pro_team']
      const currentPlan = state.currentSubscription?.plan?.slug?.toLowerCase() || 'free'
      return allowedPlans.includes(currentPlan)
    }
  },
  persist: true
})
