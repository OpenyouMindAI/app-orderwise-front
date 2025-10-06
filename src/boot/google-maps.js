import { Loader } from '@googlemaps/js-api-loader'

let googleMapsLoaded = false

export const loadGoogleMaps = async () => {
  if (googleMapsLoaded) return true

  try {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places', 'geometry'],
      language: 'es',
      region: 'AR',
      version: 'weekly' // Usar la versión más reciente que incluye PlaceAutocompleteElement
    })

    await loader.load()

    // Cargar los elementos web components de Google Maps si están disponibles
    if (window.google?.maps?.importLibrary) {
      try {
        await window.google.maps.importLibrary('places')
      } catch (error) {
        console.warn('No se pudo cargar la nueva librería de places:', error)
      }
    }

    googleMapsLoaded = true
    return true
  } catch (error) {
    console.error('Error al cargar Google Maps API:', error)
    return false
  }
}
