import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'

// Session tracking state
let sessionUuid = null
let isConnected = false
let heartbeatInterval = null
let idleTimeout = null
let currentStatus = 'offline'
let presenceChannel = null
let routerInstance = null
let lastStatusUpdate = 0 // Timestamp of last status update

const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
const HEARTBEAT_INTERVAL_MS = 30 * 1000 // 30 seconds
const STATUS_UPDATE_THROTTLE_MS = 5 * 1000 // 5 seconds minimum between status updates

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
 * Generate a unique fingerprint for the device/browser
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
 */
async function connectSession (store) {
  if (isConnected || !store.access_token) return

  try {
    const fingerprint = generateFingerprint()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const { data } = await api.post('user-sessions/connect', {
      fingerprint,
      timezone
    })

    if (data.success) {
      sessionUuid = data.session_uuid
      localStorage.setItem('session_uuid', sessionUuid)
      isConnected = true
      currentStatus = 'online'

      // Start heartbeat
      startHeartbeat()

      // Setup idle detection
      setupIdleDetection()

      console.log('[SessionTracking] Connected:', sessionUuid)
    }
  } catch (error) {
    console.error('[SessionTracking] Connection error:', error)
  }
}

/**
 * Disconnect session
 */
async function disconnectSession (reason = 'logout') {
  if (!isConnected || !sessionUuid) return

  try {
    await api.post('user-sessions/disconnect', {
      session_uuid: sessionUuid,
      reason
    })
  } catch (error) {
    console.error('[SessionTracking] Disconnect error:', error)
  } finally {
    cleanup()
  }
}

/**
 * Track module/page change
 */
async function trackModule (moduleName, url) {
  if (!isConnected || !sessionUuid) return

  try {
    await api.post('user-sessions/track-activity', {
      session_uuid: sessionUuid,
      module: moduleName,
      url
    })
  } catch (error) {
    // Silent fail for tracking
  }
}

/**
 * Update session status (throttled to prevent excessive calls)
 */
async function updateStatus (status) {
  if (!isConnected || !sessionUuid || currentStatus === status) return

  // Throttle: only allow status updates every 5 seconds
  const now = Date.now()
  if (now - lastStatusUpdate < STATUS_UPDATE_THROTTLE_MS) {
    return
  }

  try {
    lastStatusUpdate = now
    await api.post('user-sessions/update-status', {
      session_uuid: sessionUuid,
      status
    })
    currentStatus = status
  } catch (error) {
    // Silent fail
  }
}

/**
 * Send heartbeat
 */
async function sendHeartbeat () {
  if (!isConnected || !sessionUuid) return

  try {
    await api.post('user-sessions/heartbeat', {
      session_uuid: sessionUuid
    })
  } catch (error) {
    // Silent fail
  }
}

/**
 * Start heartbeat interval
 */
function startHeartbeat () {
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
 * Setup idle detection
 */
let activityDebounceTimeout = null
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

  // Handle before unload
  window.addEventListener('beforeunload', () => {
    if (sessionUuid) {
      const url = `${import.meta.env.VITE_APP_API_URL}user-sessions/disconnect`
      const data = JSON.stringify({
        session_uuid: sessionUuid,
        reason: 'timeout'
      })
      // Try sendBeacon first
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
 * Handle force disconnect from admin or timeout
 */
function handleForceDisconnect (store, action = 'force_disconnected') {
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

  // Clear store and localStorage
  store.logout()
  localStorage.removeItem('session_uuid')

  // Redirect to login
  if (routerInstance) {
    routerInstance.push({ name: 'Login' })
  }
}

/**
 * Join presence channel and listen for force disconnect
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
 */
function isPublicRoute (routeName) {
  if (!routeName) return true
  return PUBLIC_ROUTES.includes(routeName)
}

export default boot(async ({ app, router }) => {
  const store = authentication()
  routerInstance = router

  // Only connect when user is authenticated and not on public route
  if (store.access_token && store.userSession) {
    await connectSession(store)
    // Join presence channel to listen for force disconnect
    joinPresenceChannel(store)
  }

  // Watch for route changes to track module navigation
  router.afterEach((to) => {
    // Skip tracking for public routes or if not connected
    if (!isConnected || !sessionUuid) return
    if (isPublicRoute(to.name)) return
    if (!store.access_token) return

    const moduleName = to.meta?.title || to.name || 'Unknown'
    trackModule(moduleName, to.fullPath)
  })

  // Listen for logout to disconnect session
  window.addEventListener('user-logout', () => {
    disconnectSession('logout')
  })

  // Expose tracking functions globally
  app.config.globalProperties.$sessionTracking = {
    connect: () => {
      connectSession(store)
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
