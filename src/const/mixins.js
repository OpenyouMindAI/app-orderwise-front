import { Loading, Notify, copyToClipboard, date } from 'quasar'

// ============================================
// CONSTANTES
// ============================================

export const BALANZA_PREFIXES = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29']

export const LOGOS = {
  qOrderWise: {
    white: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QOrderWise/white.png',
    color: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QOrderWise/color.png',
    iso: 'images/logo.png'
  },
  qBits: {
    black: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/black.png',
    white: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/white.png',
    isoColor: 'https://pub-bb022121e814439fb336626c2041cea3.r2.dev/QBits/iso-logo-color.jpg'
  }
}

// ============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================

const NOTIFICATION_CONFIG = {
  SUCCESS: {
    color: 'positive',
    icon: 'check_circle',
    timeout: 3000,
    classes: 'notify-modern notify-success'
  },
  ERROR: {
    color: 'negative',
    icon: 'error',
    timeout: 6000,
    classes: 'notify-modern notify-error'
  },
  WARNING: {
    color: 'warning',
    icon: 'warning',
    timeout: 4500,
    classes: 'notify-modern notify-warning'
  },
  INFO: {
    color: 'info',
    icon: 'info',
    timeout: 3500,
    classes: 'notify-modern notify-info'
  },
  VALIDATION: {
    color: 'negative',
    icon: 'warning',
    timeout: 7000,
    classes: 'notify-modern notify-validation-error'
  },
  SESSION: {
    color: 'warning',
    icon: 'lock',
    timeout: 5000,
    classes: 'notify-modern notify-session'
  },
  NETWORK: {
    color: 'negative',
    icon: 'cloud_off',
    timeout: 5000,
    classes: 'notify-modern notify-error'
  }
}

const NOTIFICATION_DEFAULTS = {
  position: 'top',
  textColor: 'white',
  iconColor: 'white',
  iconSize: '24px',
  progress: true,
  progressClass: 'bg-white',
  html: true,
  style: 'border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); backdrop-filter: blur(10px); min-width: 300px; padding: 12px 16px; align-items: flex-start;'
}

// ============================================
// GESTOR DE NOTIFICACIONES CON MANEJO DE DUPLICADOS
// ============================================

class NotificationManager {
  constructor () {
    this.recentMessages = new Map() // mensaje -> timestamp
    this.activeNotifications = new Map() // hash mensaje -> array de {id, dismiss}
    this.queue = []
    this.activeCount = 0
    this.maxSimultaneous = 3
    this.debounceTime = 1000
    this.cleanupInterval = null

    this._startCleanup()
  }

  /**
   * Inicia limpieza periódica de mensajes antiguos
   */
  _startCleanup () {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [message, timestamp] of this.recentMessages.entries()) {
        if (now - timestamp > 5000) {
          this.recentMessages.delete(message)
        }
      }
    }, 5000)
  }

  /**
   * Genera hash del mensaje para tracking de duplicados
   */
  _getMessageHash (message) {
    return `${message}`.substring(0, 100)
  }

  /**
   * Verifica si el mensaje puede mostrarse (anti-spam)
   */
  canShow (message, force = false) {
    if (force) return true

    const now = Date.now()
    const lastShown = this.recentMessages.get(message)

    if (lastShown && (now - lastShown) < this.debounceTime) {
      return false
    }

    this.recentMessages.set(message, now)
    return true
  }

  /**
   * Verifica si hay espacio para mostrar notificaciones
   */
  hasSpace () {
    return this.activeCount < this.maxSimultaneous
  }

  /**
   * Incrementa contador de manera segura
   */
  _incrementCount (notifId) {
    this.activeCount++
    if (process.env.DEV) {
      console.log(`📊 [${notifId}] INCREMENT → Activas: ${this.activeCount}/${this.maxSimultaneous}`)
    }
  }

  /**
   * Decrementa contador de manera segura
   */
  _decrementCount (notifId) {
    if (this.activeCount <= 0) {
      if (process.env.DEV) {
        console.warn(`⚠️ [${notifId}] Intento de decrementar contador en 0`)
      }
      this.activeCount = 0
      return
    }

    this.activeCount--
    if (process.env.DEV) {
      console.log(`📊 [${notifId}] DECREMENT → Activas: ${this.activeCount}/${this.maxSimultaneous}`)
    }

    this._processQueue()
  }

  /**
   * Muestra una notificación
   */
  show (message, type, options = {}) {
    // Verificar anti-spam
    if (!this.canShow(message, options.force)) {
      if (process.env.DEV) {
        console.log('🚫 Notificación duplicada bloqueada:', message.substring(0, 50))
      }
      return null
    }

    // Si no hay espacio, encolar
    if (!this.hasSpace()) {
      if (process.env.DEV) {
        console.log('⏸️ Límite alcanzado. Encolando:', message.substring(0, 50))
      }
      this.queue.push({ message, type, options })
      return null
    }

    return this._createNotification(message, type, options)
  }

  /**
   * Crea y muestra una notificación con manejo de duplicados
   */
  _createNotification (message, type, options = {}) {
    const config = NOTIFICATION_CONFIG[type]
    const notifId = `N${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    const messageHash = this._getMessageHash(message)

    let dismissed = false

    // Incrementar ANTES de crear la notificación
    this._incrementCount(notifId)

    const notifyOptions = {
      ...NOTIFICATION_DEFAULTS,
      message,
      color: config.color,
      icon: options.icon || config.icon,
      position: options.position || NOTIFICATION_DEFAULTS.position,
      timeout: options.timeout || config.timeout,
      multiLine: options.multiLine || false,
      classes: config.classes,
      style: options.style || NOTIFICATION_DEFAULTS.style,
      attrs: {
        role: config.color === 'negative' ? 'alert' : 'status'
      },
      actions: [
        ...(options.actions || []),
        {
          icon: 'close',
          color: 'white',
          size: 'sm',
          flat: true,
          round: true,
          handler: () => { /* Cerrar */ }
        }
      ],
      onDismiss: () => {
        // Solo ejecutar una vez
        if (dismissed) {
          if (process.env.DEV) {
            console.warn(`⚠️ [${notifId}] onDismiss ya ejecutado, ignorando`)
          }
          return
        }
        dismissed = true

        if (process.env.DEV) {
          console.log(`❌ [${notifId}] onDismiss ejecutado`)
        }

        // Obtener todas las notificaciones con este mensaje
        const duplicates = this.activeNotifications.get(messageHash) || []
        const duplicateCount = duplicates.length

        if (duplicateCount > 1) {
          // Hay duplicados: cerrar todos y decrementar por todos
          if (process.env.DEV) {
            console.log(`🔗 [${notifId}] Detectadas ${duplicateCount} duplicadas. Cerrando todas...`)
          }

          duplicates.forEach(notif => {
            if (notif.id !== notifId && notif.dismiss) {
              try {
                notif.dismiss()
              } catch (e) {
                if (process.env.DEV) {
                  console.warn(`Error al cerrar ${notif.id}:`, e)
                }
              }
            }
          })

          // Decrementar por cada duplicado
          for (let i = 0; i < duplicateCount; i++) {
            this._decrementCount(`${notifId}-batch-${i}`)
          }

          // Limpiar del registro
          this.activeNotifications.delete(messageHash)
        } else {
          // No hay duplicados, decrementar normalmente
          this._decrementCount(notifId)
          this.activeNotifications.delete(messageHash)
        }

        // Callback personalizado
        options.onDismiss?.()
      }
    }

    try {
      const notification = Notify.create(notifyOptions)

      // Registrar notificación para tracking de duplicados
      if (!this.activeNotifications.has(messageHash)) {
        this.activeNotifications.set(messageHash, [])
      }
      this.activeNotifications.get(messageHash).push({
        id: notifId,
        dismiss: notification
      })

      if (process.env.DEV) {
        const currentDuplicates = this.activeNotifications.get(messageHash).length
        if (currentDuplicates > 1) {
          console.log(`🔗 [${notifId}] ${currentDuplicates} notificaciones con este mensaje`)
        }
      }

      return notification
    } catch (error) {
      // Si falla la creación, decrementar inmediatamente
      if (process.env.DEV) {
        console.error(`❗ [${notifId}] Error al crear notificación:`, error)
      }
      if (!dismissed) {
        dismissed = true
        this._decrementCount(notifId)
      }
      return null
    }
  }

  /**
   * Procesa la cola de notificaciones pendientes
   */
  _processQueue () {
    if (this.queue.length === 0 || !this.hasSpace()) {
      return
    }

    const next = this.queue.shift()
    if (next) {
      if (process.env.DEV) {
        console.log(`📤 Procesando cola. Quedan: ${this.queue.length}`)
      }

      // Pequeño delay para evitar saturación visual
      setTimeout(() => {
        if (this.hasSpace()) {
          this._createNotification(next.message, next.type, next.options)
        } else {
          // Re-encolar si ya no hay espacio
          this.queue.unshift(next)
        }
      }, 150)
    }
  }

  /**
   * Limpia recursos al destruir
   */
  destroy () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

// Instancia singleton
const notificationManager = new NotificationManager()

// ============================================
// API PÚBLICA DE NOTIFICACIONES
// ============================================

/**
 * Notificación de éxito
 */
export const notifySuccess = (message, options = {}) => {
  return notificationManager.show(message, 'SUCCESS', options)
}

/**
 * Notificación de error
 */
export const notifyError = (message, options = {}) => {
  return notificationManager.show(message, 'ERROR', options)
}

/**
 * Notificación de advertencia
 */
export const notifyWarning = (message, options = {}) => {
  return notificationManager.show(message, 'WARNING', options)
}

/**
 * Notificación informativa
 */
export const notifyInfo = (message, options = {}) => {
  return notificationManager.show(message, 'INFO', options)
}

/**
 * Notificación de sesión (siempre se muestra)
 */
export const notifySession = (message, options = {}) => {
  return notificationManager.show(message, 'SESSION', { ...options, force: true })
}

/**
 * Notificación de problemas de red
 */
export const notifyNetwork = (message, options = {}) => {
  return notificationManager.show(message, 'NETWORK', options)
}

/**
 * Notificación genérica - COMPATIBILIDAD CON CÓDIGO EXISTENTE
 */
export const notify = (message, color, icon, position = 'bottom') => {
  const typeMap = {
    positive: 'SUCCESS',
    negative: 'ERROR',
    warning: 'WARNING',
    info: 'INFO'
  }

  const type = typeMap[color] || 'INFO'
  return notificationManager.show(message, type, { icon, position })
}

/**
 * Notificación de errores de validación
 */
export const notifyValidationErrors = (error, defaultMessage = 'Error en la validación') => {
  // String directo
  if (typeof error === 'string') {
    return notifyError(error)
  }

  const errorData = error?.response?.data || error?.data || error

  // Formato nuevo: { message: string }
  if (errorData?.message && typeof errorData.message === 'string') {
    return notifyError(errorData.message)
  }

  // Formato de validación Laravel: { errors: { field: [messages] } }
  const validationErrors = errorData?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    const errorEntries = Object.entries(validationErrors)
    const errorCount = errorEntries.length

    const errorList = errorEntries
      .map(([field, messages]) => {
        const errorMessages = Array.isArray(messages) ? messages : [messages]
        return `<li><strong>${field}:</strong> ${errorMessages.join(', ')}</li>`
      })
      .join('')

    const message = `
      <div style="line-height: 1.5;">
        <strong style="display: block; margin-bottom: 8px; font-size: 15px;">
          ${errorCount} ${errorCount === 1 ? 'error encontrado' : 'errores encontrados'}:
        </strong>
        <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
          ${errorList}
        </ul>
      </div>
    `

    return notificationManager.show(message, 'VALIDATION', {
      multiLine: true,
      style: 'border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); backdrop-filter: blur(10px); min-width: 320px; max-width: 500px; padding: 16px 20px; align-items: flex-start;'
    })
  }

  return notifyError(defaultMessage)
}

// ============================================
// UTILIDADES DE FORMATO Y TRANSFORMACIÓN
// ============================================

/**
 * Formatea fecha
 */
export const formatDate = (value, format = 'DD-MM-YYYY') => {
  return value ? date.formatDate(value, format) : ''
}

/**
 * Formatea número con decimales
 */
export const formatNumber = (data) => {
  if (data === undefined || data === null) {
    return '0'
  }

  const num = Number(data)
  if (isNaN(num)) return '0'

  // Redondeamos a 3 decimales para ver si es efectivamente un entero
  const rounded = Math.round(num * 1000) / 1000
  const isInteger = rounded % 1 === 0

  return rounded.toLocaleString('de-DE', {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 3
  })
}

/**
 * Convierte texto a slug
 */
export const convertToSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '_')
}

/**
 * Obtiene iniciales de un nombre completo
 */
export const getInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return ''

  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()

  const firstNameInitial = parts[0][0].toUpperCase()
  let surnameInitial = ''

  if (parts.length === 2) {
    surnameInitial = parts[1][0].toUpperCase()
  } else if (parts.length === 3) {
    surnameInitial = parts[2][0].toUpperCase()
  } else if (parts.length >= 4) {
    surnameInitial = parts[2][0].toUpperCase()
  }

  return `${firstNameInitial}${surnameInitial}`
}

// ============================================
// UTILIDADES DE ARCHIVOS
// ============================================

/**
 * Convierte Blob a Base64
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Procesa archivos seleccionados
 */
export const setFiles = async (files) => {
  if (!files || files.length === 0) return []

  const filesArray = Array.from(files)

  return Promise.all(
    filesArray.map(async (file) => ({
      url: await blobToBase64(file),
      file,
      type: file.type
    }))
  )
}

/**
 * Crea FormData desde objeto (para peticiones multipart)
 */
export const modelFormData = (data, put = false) => {
  const formData = new FormData()

  if (put) {
    formData.append('_method', 'put')
  }

  // Agregar campos simples
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'files' && typeof value !== 'object') {
      formData.append(key, value)
    }
  })

  // Agregar archivos si existen
  if (Array.isArray(data.files)) {
    data.files.forEach((element, index) => {
      formData.append(`files[${index}]`, element.file)
      if (element.file_type_id) {
        formData.append(`file_types[${index}]`, element.file_type_id)
      }
    })
  }

  return formData
}

// ============================================
// UTILIDADES DE UI
// ============================================

/**
 * Controla el loading global
 */
export const loading = (val, options = {}) => {
  // Disabled for local dev - prevents UI blocking on API errors
  if (val) { console.log('[loading] show suppressed'); return; }
  Loading.hide()
}

/**
 * Copia texto al portapapeles con feedback
 */
export const copyClick = (data) => {
  copyToClipboard(data)
    .then(() => {
      Notify.create({
        color: 'primary',
        icon: 'content_copy',
        message: `Copiado: ${data}`
      })
    })
    .catch((error) => {
      notifyError('Error al copiar al portapapeles')
      if (process.env.DEV) {
        console.error('Copy error:', error)
      }
    })
}

/**
 * Debounce - limita la frecuencia de ejecución de una función
 */
export const debounce = (func, wait = 500) => {
  let timeout

  return function executedFunction (...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ============================================
// EXPORTACIONES DE COMPATIBILIDAD
// ============================================

export const logo = LOGOS.qOrderWise
export const qBitsLogo = LOGOS.qBits
