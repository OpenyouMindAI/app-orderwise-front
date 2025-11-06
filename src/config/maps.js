/**
 * Google Maps Configuration
 *
 * Configuración para cargar Google Maps API dinámicamente
 */

let googleMapsLoaded = false
let googleMapsPromise = null

/**
 * Carga Google Maps API de forma dinámica
 * @param {string} apiKey - API Key de Google Maps
 * @returns {Promise<void>}
 */
export function loadGoogleMaps (apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  // Si ya está cargado, retornar inmediatamente
  if (googleMapsLoaded && window.google) {
    return Promise.resolve()
  }

  // Si ya hay una promesa en curso, retornarla
  if (googleMapsPromise) {
    return googleMapsPromise
  }

  // Usar API key del environment o la proporcionada
  const key = apiKey

  googleMapsPromise = new Promise((resolve, reject) => {
    // Verificar si ya existe el script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      if (window.google) {
        googleMapsLoaded = true
        resolve()
      } else {
        existingScript.addEventListener('load', () => {
          googleMapsLoaded = true
          resolve()
        })
      }
      return
    }

    // Crear script tag
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry`
    script.async = true
    script.defer = true

    script.onload = () => {
      googleMapsLoaded = true
      resolve()
    }

    script.onerror = (error) => {
      googleMapsPromise = null
      reject(new Error('Error al cargar Google Maps API'))
    }

    document.head.appendChild(script)
  })

  return googleMapsPromise
}

/**
 * Verifica si Google Maps está cargado
 * @returns {boolean}
 */
export function isGoogleMapsLoaded () {
  return googleMapsLoaded && window.google !== undefined
}

/**
 * Calcula distancia entre dos puntos (Haversine formula)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export function calculateDistance (lat1, lng1, lat2, lng2) {
  const R = 6371 // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Redondear a 1 decimal
}

function toRad (degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Estilos dark para el mapa
 */
export const darkMapStyles = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }]
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }]
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
]

/**
 * Configuración de opciones del mapa
 */
export const defaultMapOptions = {
  zoom: 13,
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  zoomControl: true,
  styles: darkMapStyles
}

/**
 * Iconos para marcadores
 */
export const markerIcons = {
  origin: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale: 10,
    fillColor: '#4CAF50',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2
  },
  destination: {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale: 10,
    fillColor: '#2196F3',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2
  },
  courier: {
    path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW || 1,
    scale: 6,
    fillColor: '#FF5722',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    rotation: 0
  }
}

export default {
  loadGoogleMaps,
  isGoogleMapsLoaded,
  calculateDistance,
  darkMapStyles,
  defaultMapOptions,
  markerIcons
}
