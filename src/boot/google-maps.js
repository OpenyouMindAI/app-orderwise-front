import { Loader } from '@googlemaps/js-api-loader'

let googleMapsLoaded = false

export const loadGoogleMaps = async () => {
  if (googleMapsLoaded) return true

  try {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places', 'geometry'], // Añadida librería geometry
      language: 'es',
      region: 'AR'
    })

    await loader.load()
    googleMapsLoaded = true
    return true
  } catch (error) {
    console.error('Error al cargar Google Maps API:', error)
    return false
  }
}
