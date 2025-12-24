import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { echo } from 'src/boot/pusher'
import { authentication } from 'src/stores/module-authentication'

// Session state
const sessionUuid = ref(null)
const isConnected = ref(false)
const currentStatus = ref('offline')
const onlineUsers = ref([])
const idleTimeout = ref(null)
const heartbeatInterval = ref(null)

// Configuration
const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
const HEARTBEAT_INTERVAL_MS = 30 * 1000 // 30 seconds

/**
 * Generate a unique fingerprint for the device/browser
 */
function generateFingerprint () {
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

  // Simple hash function
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get stored session UUID or generate new one
 */
function getOrCreateSessionUuid () {
  let uuid = localStorage.getItem('session_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID ? crypto.randomUUID() : generateFingerprint() + '-' + Date.now()
    localStorage.setItem('session_uuid', uuid)
  }
  return uuid
}

export function useTracking () {
  const route = useRoute()
  const $store = authentication()

  let presenceChannel = null

  /**
   * Connect to session tracking
   */
  async function connect () {
    if (isConnected.value || !$store.access_token) return

    try {
      const fingerprint = generateFingerprint()
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const { data } = await api.post('user-sessions/connect', {
        fingerprint,
        timezone
      })

      if (data.success) {
        sessionUuid.value = data.session_uuid
        localStorage.setItem('session_uuid', data.session_uuid)
        isConnected.value = true
        currentStatus.value = 'online'

        // Join presence channel
        joinPresenceChannel()

        // Start heartbeat
        startHeartbeat()

        // Setup idle detection
        setupIdleDetection()

        // Track initial module
        trackModule(route.name || 'Dashboard', route.fullPath)

        console.log('[Tracking] Connected with session:', sessionUuid.value)
      }
    } catch (error) {
      console.error('[Tracking] Connection error:', error)
    }
  }

  /**
   * Disconnect from session tracking
   */
  async function disconnect (reason = 'logout') {
    if (!isConnected.value || !sessionUuid.value) return

    try {
      await api.post('user-sessions/disconnect', {
        session_uuid: sessionUuid.value,
        reason
      })
    } catch (error) {
      console.error('[Tracking] Disconnect error:', error)
    } finally {
      cleanup()
    }
  }

  /**
   * Join the presence channel
   */
  function joinPresenceChannel () {
    if (!echo) {
      console.warn('[Tracking] Echo not available')
      return
    }

    presenceChannel = echo.join('sessions')
      .here((users) => {
        onlineUsers.value = users
        console.log('[Tracking] Users online:', users.length)
      })
      .joining((user) => {
        const exists = onlineUsers.value.find(u => u.session_uuid === user.session_uuid)
        if (!exists) {
          onlineUsers.value.push(user)
        }
        console.log('[Tracking] User joined:', user.name)
      })
      .leaving((user) => {
        onlineUsers.value = onlineUsers.value.filter(u => u.session_uuid !== user.session_uuid)
        console.log('[Tracking] User left:', user.name)
      })
      .listen('.session.updated', (data) => {
        handleSessionUpdate(data)
      })
      .listen('.module.changed', (data) => {
        handleModuleChange(data)
      })
      .error((error) => {
        console.error('[Tracking] Presence channel error:', error)
      })
  }

  /**
   * Handle session update events
   */
  function handleSessionUpdate (data) {
    const { action, session } = data

    switch (action) {
      case 'connected':
        const existsConnected = onlineUsers.value.find(u => u.session_uuid === session.session_uuid)
        if (!existsConnected) {
          onlineUsers.value.push(session)
        }
        break

      case 'disconnected':
      case 'timeout':
      case 'force_disconnected':
        onlineUsers.value = onlineUsers.value.filter(u => u.session_uuid !== session.session_uuid)
        // If this is our session being force disconnected
        if (session.session_uuid === sessionUuid.value && action === 'force_disconnected') {
          cleanup()
          // Optionally redirect to login or show notification
        }
        break

      case 'status_changed':
        const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === session.session_uuid)
        if (userIndex !== -1) {
          onlineUsers.value[userIndex] = { ...onlineUsers.value[userIndex], ...session }
        }
        break
    }
  }

  /**
   * Handle module change events
   */
  function handleModuleChange (data) {
    const userIndex = onlineUsers.value.findIndex(u => u.session_uuid === data.session_uuid)
    if (userIndex !== -1) {
      onlineUsers.value[userIndex].current_module = data.module
    }
  }

  /**
   * Track module/page change
   */
  async function trackModule (moduleName, url) {
    if (!isConnected.value || !sessionUuid.value) return

    try {
      await api.post('user-sessions/track-activity', {
        session_uuid: sessionUuid.value,
        module: moduleName,
        url
      })
    } catch (error) {
      console.error('[Tracking] Track activity error:', error)
    }
  }

  /**
   * Update session status
   */
  async function updateStatus (status) {
    if (!isConnected.value || !sessionUuid.value) return
    if (currentStatus.value === status) return

    try {
      await api.post('user-sessions/update-status', {
        session_uuid: sessionUuid.value,
        status
      })
      currentStatus.value = status
    } catch (error) {
      console.error('[Tracking] Update status error:', error)
    }
  }

  /**
   * Send heartbeat to keep session alive
   */
  async function sendHeartbeat () {
    if (!isConnected.value || !sessionUuid.value) return

    try {
      await api.post('user-sessions/heartbeat', {
        session_uuid: sessionUuid.value
      })
    } catch (error) {
      console.error('[Tracking] Heartbeat error:', error)
    }
  }

  /**
   * Start heartbeat interval
   */
  function startHeartbeat () {
    stopHeartbeat()
    heartbeatInterval.value = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
  }

  /**
   * Stop heartbeat interval
   */
  function stopHeartbeat () {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
  }

  /**
   * Setup idle detection
   */
  function setupIdleDetection () {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

    const resetIdleTimer = () => {
      lastActivityTime = Date.now()

      // If was idle, mark as online
      if (currentStatus.value === 'idle') {
        updateStatus('online')
      }

      // Clear existing timeout
      if (idleTimeout.value) {
        clearTimeout(idleTimeout.value)
      }

      // Set new timeout
      idleTimeout.value = setTimeout(() => {
        if (isConnected.value) {
          updateStatus('idle')
        }
      }, IDLE_TIMEOUT_MS)
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, { passive: true })
    })

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden, mark as idle after shorter timeout
        if (idleTimeout.value) clearTimeout(idleTimeout.value)
        idleTimeout.value = setTimeout(() => {
          if (isConnected.value) {
            updateStatus('idle')
          }
        }, 60000) // 1 minute when tab is hidden
      } else {
        // Tab is visible again
        resetIdleTimer()
      }
    })

    // Handle before unload
    window.addEventListener('beforeunload', () => {
      // Try to send disconnect (may not complete)
      if (sessionUuid.value) {
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_APP_API_URL}user-sessions/disconnect`,
          JSON.stringify({
            session_uuid: sessionUuid.value,
            reason: 'timeout'
          })
        )
      }
    })

    // Initial timer
    resetIdleTimer()
  }

  /**
   * Cleanup resources
   */
  function cleanup () {
    stopHeartbeat()

    if (idleTimeout.value) {
      clearTimeout(idleTimeout.value)
      idleTimeout.value = null
    }

    if (presenceChannel) {
      echo?.leave('sessions')
      presenceChannel = null
    }

    isConnected.value = false
    currentStatus.value = 'offline'
    sessionUuid.value = null
  }

  /**
   * Watch route changes to track module navigation
   */
  function watchRouteChanges () {
    watch(
      () => route.fullPath,
      (newPath) => {
        if (isConnected.value) {
          const moduleName = route.meta?.title || route.name || 'Unknown'
          trackModule(moduleName, newPath)
        }
      }
    )
  }

  return {
    // State
    sessionUuid,
    isConnected,
    currentStatus,
    onlineUsers,

    // Methods
    connect,
    disconnect,
    trackModule,
    updateStatus,
    watchRouteChanges,
    cleanup,

    // Utilities
    generateFingerprint,
    getOrCreateSessionUuid
  }
}

export default useTracking
