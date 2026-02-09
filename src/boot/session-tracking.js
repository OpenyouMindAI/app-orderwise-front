import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import axios from 'axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'

/**
 * Session tracking state
 * @type {string|null}
 */
let sessionUuid = null

/**
 * Connection status
 * @type {boolean}
 */
let isConnected = false

/**
 * Heartbeat interval reference
 * @type {number|null}
 */
let heartbeatInterval = null

/**
 * Idle timeout reference
 * @type {number|null}
 */
let idleTimeout = null

/**
 * Current user status
 * @type {string}
 */
let currentStatus = 'offline'

/**
 * Presence channel reference
 * @type {object|null}
 */
let presenceChannel = null

/**
 * Router instance reference
 * @type {object|null}
 */
let routerInstance = null

/**
 * Last status update timestamp
 * @type {number}
 */
let lastStatusUpdate = 0

/**
 * Activity tracking queue
 * @type {Array}
 */
let activityQueue = []

/**
 * Queue flush timeout reference
 * @type {number|null}
 */
let queueFlushTimeout = null

// Configuration constants
const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
const HEARTBEAT_INTERVAL_MS = 60 * 1000 // 60 seconds
const STATUS_UPDATE_THROTTLE_MS = 10 * 1000 // 10 seconds minimum between status updates
const QUEUE_FLUSH_DELAY_MS = 2000 // Batch activities every 2 seconds
const TRACKING_REQUEST_TIMEOUT_MS = 5000 // 5 second timeout for tracking requests

// Public routes that should NOT trigger tracking
const PUBLIC_ROUTES = [
  'Login',
  'Register',
  'ForgotPassword',
  'ResetPassword',
  'Catalog',
  'CatalogNew',
  'Command',
  'CommandNew',
  'PublicMenu'
]

/**
 * Create a separate axios instance for tracking requests
 * This prevents tracking requests from blocking main API calls
 * @type {AxiosInstance}
 */
const trackingApi = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: TRACKING_REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Update tracking API authorization header
 * @param {string} tokenType - Token type (Bearer)
 * @param {string} accessToken - Access token
 */
function updateTrackingAuth (tokenType, accessToken) {
  if (tokenType && accessToken) {
    trackingApi.defaults.headers.common.authorization = `${tokenType} ${accessToken}`
  }
}

/**
 * Execute tracking request in background without blocking
 * Uses requestIdleCallback when available for non-critical requests
 * @param {Function} requestFn - Function that returns a promise
 * @param {boolean} priority - If true, execute immediately; if false, use idle callback
 */
function executeInBackground (requestFn, priority = false) {
  const execute = () => {
    // Fire and forget - don't await
    requestFn().catch(() => {
      // Silent fail for all tracking requests
    })
  }

  if (priority || typeof requestIdleCallback === 'undefined') {
    // Execute immediately but don't block
    setTimeout(execute, 0)
  } else {
    // Use requestIdleCallback for low-priority tracking
    requestIdleCallback(execute, { timeout: 5000 })
  }
}

/**
 * Generate a unique fingerprint for the device/browser
 * @returns {string} - Device fingerprint hash
 */
function generateFingerprint () {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('fingerprint', 2, 2)
    const canvasData = canvas.toDataURL()

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvasData.slice(-50),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform || 'unknown'
    ].join('|')

    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  } catch (e) {
    return 'fp-' + Date.now().toString(36)
  }
}

/**
 * Connect to session tracking
 * @param {Object} store - Authentication store
 */
async function connectSession (store) {
  if (isConnected || !store.access_token) return

  // Update auth header for tracking API
  updateTrackingAuth(store.token_type, store.access_token)

  try {
    const fingerprint = generateFingerprint()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const { data } = await trackingApi.post('user-sessions/connect', {
      fingerprint,
      timezone
    })

    if (data.success) {
      sessionUuid = data.session_uuid
      localStorage.setItem('session_uuid', sessionUuid)
      isConnected = true
      currentStatus = 'online'
      startHeartbeat()
      setupIdleDetection()
    }
  } catch (error) {
    console.error('[SessionTracking] Connection error:', error)
  }
}

/**
 * Disconnect session
 * @param {string} reason - Disconnect reason
 */
async function disconnectSession (reason = 'logout') {
  if (!isConnected || !sessionUuid) return

  // Use sendBeacon for immediate disconnect (doesn't block)
  const url = `${import.meta.env.VITE_APP_API_URL}user-sessions/disconnect`
  const data = JSON.stringify({
    session_uuid: sessionUuid,
    reason
  })

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' })
      navigator.sendBeacon(url, blob)
    } else {
      // Fallback to regular request but don't await
      executeInBackground(() =>
        trackingApi.post('user-sessions/disconnect', {
          session_uuid: sessionUuid,
          reason
        }), true)
    }
  } catch (error) {
    console.error('[SessionTracking] Disconnect error:', error)
  } finally {
    cleanup()
  }
}

/**
 * Flush activity queue - send batched activities
 */
function flushActivityQueue () {
  if (activityQueue.length === 0 || !isConnected || !sessionUuid) return

  const activities = [...activityQueue]
  activityQueue = []

  // Send only the last activity (most recent page)
  const lastActivity = activities[activities.length - 1]

  executeInBackground(() =>
    trackingApi.post('user-sessions/track-activity', {
      session_uuid: sessionUuid,
      module: lastActivity.module,
      url: lastActivity.url
    }), false)
}

/**
 * Track module/page change (queued and batched)
 * @param {string} moduleName - Module name
 * @param {string} url - Page URL
 */
function trackModule (moduleName, url) {
  if (!isConnected || !sessionUuid) return

  // Add to queue
  activityQueue.push({ module: moduleName, url, timestamp: Date.now() })

  // Debounce queue flush
  if (queueFlushTimeout) {
    clearTimeout(queueFlushTimeout)
  }

  queueFlushTimeout = setTimeout(flushActivityQueue, QUEUE_FLUSH_DELAY_MS)
}

/**
 * Update session status (throttled and non-blocking)
 * @param {string} status - New status
 */
function updateStatus (status) {
  if (!isConnected || !sessionUuid || currentStatus === status) return

  // Throttle: only allow status updates every N seconds
  const now = Date.now()
  if (now - lastStatusUpdate < STATUS_UPDATE_THROTTLE_MS) {
    return
  }

  lastStatusUpdate = now
  const previousStatus = currentStatus
  currentStatus = status

  // Fire and forget - don't block
  executeInBackground(() =>
    trackingApi.post('user-sessions/update-status', {
      session_uuid: sessionUuid,
      status
    }).catch(() => {
      // Revert status on error
      currentStatus = previousStatus
    }), false)
}

/**
 * Send heartbeat (non-blocking)
 */
function sendHeartbeat () {
  const store = authentication()

  // Validate active session before sending heartbeat
  if (!isConnected || !sessionUuid || !store.access_token) {
    stopHeartbeat()
    return
  }

  // Fire and forget - don't block
  executeInBackground(() =>
    trackingApi.post('user-sessions/heartbeat', {
      session_uuid: sessionUuid
    }).catch((error) => {
      // If 401 error, stop heartbeat
      if (error.response?.status === 401) {
        stopHeartbeat()
      }
    }), false)
}

/**
 * Start heartbeat interval
 */
function startHeartbeat () {
  const store = authentication()

  // Only start heartbeat if there's an active session
  if (!isConnected || !sessionUuid || !store.access_token) {
    return
  }

  stopHeartbeat()
  heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
}

/**
 * Stop heartbeat
 */
function stopHeartbeat () {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

/**
 * Activity debounce timeout reference
 * @type {number|null}
 */
let activityDebounceTimeout = null

/**
 * Setup idle detection with optimized event handling
 */
function setupIdleDetection () {
  // Reduced events - mousemove removed to prevent excessive triggers
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

  const resetIdleTimer = () => {
    // Debounce activity detection to prevent rapid-fire calls
    if (activityDebounceTimeout) {
      clearTimeout(activityDebounceTimeout)
    }

    activityDebounceTimeout = setTimeout(() => {
      if (currentStatus === 'idle') {
        updateStatus('online')
      }
    }, 500) // Wait 500ms before updating status

    // Reset idle timeout
    if (idleTimeout) {
      clearTimeout(idleTimeout)
    }

    idleTimeout = setTimeout(() => {
      if (isConnected) {
        updateStatus('idle')
      }
    }, IDLE_TIMEOUT_MS)
  }

  activityEvents.forEach(event => {
    document.addEventListener(event, resetIdleTimer, { passive: true })
  })

  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (idleTimeout) clearTimeout(idleTimeout)
      idleTimeout = setTimeout(() => {
        if (isConnected) {
          updateStatus('idle')
        }
      }, 60000)
    } else {
      resetIdleTimer()
    }
  })

  // Handle before unload - use sendBeacon for reliability
  window.addEventListener('beforeunload', () => {
    if (sessionUuid) {
      const url = `${import.meta.env.VITE_APP_API_URL}user-sessions/disconnect`
      const data = JSON.stringify({
        session_uuid: sessionUuid,
        reason: 'timeout'
      })
      // Use sendBeacon - it's designed for this use case
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon(url, blob)
      }
    }
  })

  resetIdleTimer()
}

/**
 * Cleanup resources
 */
function cleanup () {
  stopHeartbeat()

  if (idleTimeout) {
    clearTimeout(idleTimeout)
    idleTimeout = null
  }

  if (queueFlushTimeout) {
    clearTimeout(queueFlushTimeout)
    queueFlushTimeout = null
  }

  if (activityDebounceTimeout) {
    clearTimeout(activityDebounceTimeout)
    activityDebounceTimeout = null
  }

  // Clear activity queue
  activityQueue = []

  // Leave presence channel
  if (presenceChannel) {
    echo?.leave('sessions')
    presenceChannel = null
  }

  isConnected = false
  currentStatus = 'offline'
  sessionUuid = null
}

/**
 * Flag to prevent multiple force disconnect handlers
 * @type {boolean}
 */
let isHandlingForceDisconnect = false

/**
 * Handle force disconnect from admin or timeout
 * @param {Object} store - Authentication store
 * @param {string} action - Disconnect action type
 */
function handleForceDisconnect (store, action = 'force_disconnected') {
  // Prevent multiple calls
  if (isHandlingForceDisconnect) return
  isHandlingForceDisconnect = true

  // Show notification to user based on action type
  const message = action === 'timeout'
    ? 'Tu sesión ha expirado por inactividad'
    : 'Tu sesión ha sido cerrada por un administrador'

  Notify.create({
    type: 'negative',
    message,
    icon: 'logout',
    position: 'top',
    timeout: 5000
  })

  // Cleanup session tracking
  cleanup()

  // Clear store and localStorage - use forceLogout to avoid backend call
  store.forceLogout()

  // Redirect to login
  if (routerInstance) {
    routerInstance.push({ name: 'Login' })
  }

  // Reset flag after a delay
  setTimeout(() => {
    isHandlingForceDisconnect = false
  }, 2000)
}

/**
 * Join presence channel and listen for force disconnect
 * @param {Object} store - Authentication store
 */
function joinPresenceChannel (store) {
  if (!echo || presenceChannel) return

  presenceChannel = echo.join('sessions')
    .listen('.session.updated', (data) => {
      // Check if this is a force disconnect or timeout for our session
      if (['force_disconnected', 'timeout'].includes(data.action) && data.session?.session_uuid === sessionUuid) {
        handleForceDisconnect(store, data.action)
      }
    })
}

/**
 * Check if route is public (no tracking needed)
 * @param {string} routeName - Route name
 * @returns {boolean}
 */
function isPublicRoute (routeName) {
  if (!routeName) return true
  return PUBLIC_ROUTES.includes(routeName)
}

export default boot(async ({ app, router }) => {
  const store = authentication()
  routerInstance = router

  // Update tracking auth when store changes
  updateTrackingAuth(store.token_type, store.access_token)

  if (store.access_token && store.userSession) {
    // Connect in background - don't block app initialization
    executeInBackground(() => connectSession(store), true)
    joinPresenceChannel(store)
  }

  router.afterEach((to) => {
    // Skip tracking for public routes or if not connected
    if (!isConnected || !sessionUuid) return
    if (isPublicRoute(to.name)) return
    if (!store.access_token) return

    const moduleName = to.meta?.title || to.name || 'Unknown'
    // This is already non-blocking due to queue
    trackModule(moduleName, to.fullPath)
  })

  window.addEventListener('user-logout', () => {
    disconnectSession('logout')
  })

  app.config.globalProperties.$sessionTracking = {
    connect: () => {
      updateTrackingAuth(store.token_type, store.access_token)
      executeInBackground(() => connectSession(store), true)
      joinPresenceChannel(store)
    },
    disconnect: disconnectSession,
    trackModule,
    updateStatus,
    getSessionUuid: () => sessionUuid,
    isConnected: () => isConnected
  }
})

export { connectSession, disconnectSession, trackModule, updateStatus }
