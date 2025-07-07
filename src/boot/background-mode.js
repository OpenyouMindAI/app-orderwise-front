import { Device } from '@capacitor/device'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { boot } from 'quasar/wrappers'
import { commandPrint } from 'src/const/printers'
import { authentication } from 'src/stores/module-authentication'
import { echo } from './pusher'

const CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY: 2000,
  PING_INTERVAL: 20000,
  BACKGROUND_TASK_INTERVAL: 30000,
  WAKE_LOCK_TIMEOUT: 300000
}

let socketChannel = null
let reconnecting = false
let reconnectAttempts = 0
let backgroundTask = null
const CHANNEL_NAME = 'comandas'

export default boot(async () => {
  const $store = authentication()

  App.addListener('appStateChange', async ({ isActive }) => {
    console.log(isActive ? '🔵 App activa' : '🟡 App en segundo plano')
    if (isActive) {
      reconnectEcho($store?.userSession)
      releaseWakeLock()
    } else {
      startBackgroundTasks($store?.userSession)
      acquireWakeLock()
    }
  })

  if (Capacitor.getPlatform() === 'android') {
    document.addEventListener('deviceready', () => {
      const bgMode = window.cordova?.plugins?.backgroundMode
      if (bgMode) {
        bgMode.enable()
        bgMode.setDefaults({
          title: 'Servicio de Comandas',
          text: 'Escuchando pedidos...',
          silent: false,
          resume: true,
          hidden: false,
          color: '#FF5722',
          icon: 'ic_notification'
        })

        bgMode.on('activate', () => {
          console.log('🔋 Background activo')
          startBackgroundTasks($store?.userSession)
          acquireWakeLock()
        })

        bgMode.on('deactivate', () => {
          console.log('🔋 Background desactivado')
          stopBackgroundTasks()
          releaseWakeLock()
        })

        bgMode.configure({ isForeground: true })
      }
    }, { once: true })
    await initializeConnection($store?.userSession)
  }
})

const initializeConnection = async (userSession) => {
  try {
    if (!echo) throw new Error('Echo no inicializado')

    await waitFor(() => echo.connector?.pusher?.connection, 100, 5000)
    await reconnectEcho(userSession)
    await keepAliveSocket(userSession)

    setInterval(() => verifyConnection(userSession), CONFIG.PING_INTERVAL)
  } catch (error) {
    console.error('❌ Fallo inicializando conexión:', error)
    retryReconnect(userSession)
  }
}

const reconnectEcho = async (userSession) => {
  if (!userSession?.company_session?.document_number || reconnecting) return

  try {
    reconnecting = true
    const docNumber = userSession.company_session.document_number
    const deviceName = (await Device.getInfo()).name?.toLowerCase().trim()

    if (socketChannel) {
      try { echo.leave(`private-${CHANNEL_NAME}`) } catch {}
      socketChannel = null
    }

    if (echo.connector.pusher.connection.state !== 'connected') {
      throw new Error('Socket desconectado')
    }
    socketChannel = echo.private(CHANNEL_NAME).listen(`.NewOrderComanda_${docNumber}`, async (event) => {
      const printerName = event?.printer?.device?.toLowerCase().trim()
      console.log(printerName, deviceName)
      if (printerName === deviceName) {
        if (!(await App.getState()).isActive) {
          showNotification('Nuevo pedido recibido', 'Preparando comanda...')
        }
        await commandPrint(event.invoice)
      }
    })

    await waitFor(() => {
      const channel = echo.connector.pusher.channel(`private-${CHANNEL_NAME}`)
      return channel?.subscribed
    }, 100, 5000)

    reconnectAttempts = 0
    console.log(`✅ Canal "${CHANNEL_NAME}" conectado`)
    const connection = echo.connector.pusher.connection

    connection.bind('disconnected', () => {
      console.warn('🔌 Socket desconectado inesperadamente')
      retryReconnect(userSession)
    })

    connection.bind('error', (err) => {
      console.error('❌ Socket error:', err)
      retryReconnect(userSession)
    })
  } catch (error) {
    console.error('❌ Error reconectando canal:', error)
    retryReconnect(userSession)
  } finally {
    reconnecting = false
  }
}

const retryReconnect = (userSession) => {
  if (reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
    console.warn('🚫 Reintentos máximos alcanzados')
    setTimeout(() => { reconnectAttempts = 0 }, 60000)
    return
  }
  const delay = Math.min(CONFIG.RECONNECT_DELAY * (2 ** reconnectAttempts), 30000)
  reconnectAttempts++
  console.log(`🔁 Reintento en ${delay / 1000}s`)
  setTimeout(() => reconnectEcho(userSession), delay)
}

const verifyConnection = async (userSession) => {
  try {
    const pusher = echo?.connector?.pusher
    const channel = pusher?.channel(`private-${CHANNEL_NAME}`)
    console.log(channel)

    if (!pusher || pusher.connection.state !== 'connected' || !channel?.subscribed) {
      console.warn('⚠️ Verificación fallida, reconectando...')
      await reconnectEcho(userSession)
    } else {
      console.log('📶 Socket OK')
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error)
  }
}

const waitFor = (conditionFn, interval = 100, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const check = setInterval(() => {
      if (conditionFn()) {
        clearInterval(check)
        resolve()
      } else if (Date.now() - started > timeout) {
        clearInterval(check)
        reject(new Error('Timeout esperando condición'))
      }
    }, interval)
  })
}

const acquireWakeLock = () => {
  try {
    window.plugins?.insomnia?.keepAwake?.()
    console.log('🔋 WakeLock ON')
  } catch (error) {
    console.error('❌ WakeLock fail:', error)
  }
}

const releaseWakeLock = () => {
  try {
    window.plugins?.insomnia?.allowSleepAgain?.()
    console.log('🔋 WakeLock OFF')
  } catch (error) {
    console.error('❌ WakeLock release fail:', error)
  }
}

const startBackgroundTasks = (userSession) => {
  if (!backgroundTask) {
    backgroundTask = setInterval(() => verifyConnection(userSession), CONFIG.BACKGROUND_TASK_INTERVAL)
    console.log('🔄 Background tasks ON')
  }
}

const stopBackgroundTasks = () => {
  if (backgroundTask) {
    clearInterval(backgroundTask)
    backgroundTask = null
    console.log('🔄 Background tasks OFF')
  }
}

const showNotification = (title, body) => {
  try {
    if (window.cordova?.plugins?.notification?.local) {
      window.cordova.plugins.notification.local.schedule({
        title,
        text: body,
        foreground: true
      })
    } else if (window.Notification && Notification.permission === 'granted') {
      const n = new Notification(title, { body })
      n.onclick = () => window.focus()
    }
  } catch (error) {
    console.error('❌ Notificación error:', error)
  }
}

const keepAliveSocket = (userSession) => {
  setInterval(async () => {
    const pusher = echo?.connector?.pusher
    const channel = pusher?.channel(`private-${CHANNEL_NAME}`)
    const state = pusher?.connection?.state

    if (state !== 'connected' || !channel?.subscribed) {
      console.warn('💤 Conexión caída detectada por keepAlive, reintentando...')
      await reconnectEcho(userSession)
    } else {
      try {
        // Enviar ping si el canal es privado y compatible
        pusher.send_event?.('client-ping', {}, `private-${CHANNEL_NAME}`)
        console.log('📡 Ping enviado desde keepAlive')
      } catch (e) {
        console.warn('⚠️ Ping fallido:', e.message)
      }
    }
  }, CONFIG.BACKGROUND_TASK_INTERVAL)
}
