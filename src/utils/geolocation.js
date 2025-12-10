import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

/**
 * Gets current position using Capacitor plugin or browser API
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Position object with coords
 */
export async function getCurrentPosition (options = {}) {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    // Use Capacitor plugin for native platforms
    const position = await Geolocation.getCurrentPosition(options)
    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      },
      timestamp: position.timestamp
    }
  } else {
    // Use browser API for web
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }
}

/**
 * Watches position changes using Capacitor plugin or browser API
 * @param {Function} success - Success callback
 * @param {Function} error - Error callback
 * @param {Object} options - Geolocation options
 * @returns {Promise<string>} Watch ID
 */
export async function watchPosition (success, error, options = {}) {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    // Use Capacitor plugin for native platforms
    const watchId = await Geolocation.watchPosition(options, (position, err) => {
      if (err) {
        error?.(err)
      } else {
        success({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          },
          timestamp: position.timestamp
        })
      }
    })
    return watchId
  } else {
    // Use browser API for web
    return navigator.geolocation.watchPosition(success, error, options)
  }
}

/**
 * Clears position watch
 * @param {string} watchId - Watch ID to clear
 */
export async function clearWatch (watchId) {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    await Geolocation.clearWatch({ id: watchId })
  } else {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Checks and requests location permissions
 * @returns {Promise<boolean>} True if permission granted
 */
export async function checkPermissions () {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    const permission = await Geolocation.checkPermissions()

    if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
      return true
    }

    // Request permission if not granted
    const request = await Geolocation.requestPermissions()
    return request.location === 'granted' || request.coarseLocation === 'granted'
  } else {
    // For web, permissions are handled by the browser
    return true
  }
}
